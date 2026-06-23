// weather.js
// Henter gratis vejrdata fra Open-Meteo (ingen API-nøgle nødvendig).
//   - Forecast API: temperatur, lufttryk, vind, skydække, sigtbarhed, nedbør, vejrkode, sol op/ned
//   - Marine API:   bølgehøjde + havoverfladetemperatur (kun for marine lokationer)
//
// Returnerer et samlet objekt pr. lokation med timevise data + daglige sol-tider.

import { FORECAST_DAYS, TIMEZONE } from "./config.js";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const MARINE_URL = "https://marine-api.open-meteo.com/v1/marine";

const HOURLY_VARS = [
  "temperature_2m",
  "pressure_msl",
  "surface_pressure",
  "wind_speed_10m",
  "wind_gusts_10m",
  "wind_direction_10m",
  "cloud_cover",
  "visibility",
  "precipitation",
  "weather_code",
].join(",");

const MARINE_VARS = [
  "wave_height",
  "sea_surface_temperature",
  "ocean_current_velocity",   // strøm – "gang i vandet" (km/t, konverteres til m/s)
  "ocean_current_direction",
  "sea_level_height_msl",     // vandstand (m) – til stigende/faldende vand
].join(",");

function buildForecastUrl(lat, lon) {
  const p = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    hourly: HOURLY_VARS,
    daily: "sunrise,sunset",
    wind_speed_unit: "ms",
    timezone: TIMEZONE,
    forecast_days: FORECAST_DAYS,
  });
  return `${FORECAST_URL}?${p}`;
}

function buildMarineUrl(lat, lon) {
  const p = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    hourly: MARINE_VARS,
    timezone: TIMEZONE,
    forecast_days: FORECAST_DAYS,
  });
  return `${MARINE_URL}?${p}`;
}

// Lille kald til at estimere søtemperatur: kun daglig middeltemp + historik.
function buildLakeTempUrl(lat, lon) {
  const p = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    daily: "temperature_2m_mean",
    past_days: 31,
    forecast_days: 1,
    timezone: TIMEZONE,
  });
  return `${FORECAST_URL}?${p}`;
}

// Estimér søens overfladetemp som et trægt eksponentielt glidende gennemsnit
// af lufttemperaturen. alpha lav = træg (stor/dyb sø), høj = hurtig (lavvandet).
function estimateLakeTemp(dailyMeans, alpha = 0.2) {
  const vals = (dailyMeans || []).filter((v) => v != null);
  if (!vals.length) return null;
  let e = vals[0];
  for (const v of vals) e = alpha * v + (1 - alpha) * e;
  // søvand fryser ikke til negativ overfladejagt-temp i praksis
  return Math.max(0, Math.round(e * 10) / 10);
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  return res.json();
}

// Byg et hurtigt opslag fra ISO-tidsstreng -> indeks i hourly.time
function indexByTime(times) {
  const map = new Map();
  times.forEach((t, i) => map.set(t, i));
  return map;
}

// Hent og flet vejr for én lokation.
export async function fetchWeatherForLocation(loc) {
  const tasks = [fetchJson(buildForecastUrl(loc.lat, loc.lon))];
  // Marine lokationer: hav-API. Søer: lille temp-historik til estimat.
  tasks.push(
    loc.marint
      ? fetchJson(buildMarineUrl(loc.lat, loc.lon)).catch(() => null)
      : fetchJson(buildLakeTempUrl(loc.lat, loc.lon)).catch(() => null)
  );

  const [fc, extra] = await Promise.all(tasks);
  const marine = loc.marint ? extra : null;
  const estLakeTemp = loc.marint ? null : estimateLakeTemp(extra?.daily?.temperature_2m_mean, loc.tempAlpha);

  const time = fc.hourly.time;
  const marineIdx = marine?.hourly?.time ? indexByTime(marine.hourly.time) : null;

  // Bug-fix: vælg ÉN trykkilde konsekvent for hele serien (ikke pr. time),
  // så vi ikke blander pressure_msl og surface_pressure og fabrikerer et spring.
  const msl = fc.hourly.pressure_msl;
  const usePressureMsl = Array.isArray(msl) && msl.some((v) => v != null);

  // Saml timevise punkter i ét array af objekter.
  const hours = time.map((t, i) => {
    const point = {
      time: t, // "2026-06-23T18:00"
      temp: fc.hourly.temperature_2m?.[i] ?? null,
      pressure: (usePressureMsl ? msl?.[i] : fc.hourly.surface_pressure?.[i]) ?? null,
      wind: fc.hourly.wind_speed_10m?.[i] ?? null,
      gust: fc.hourly.wind_gusts_10m?.[i] ?? null,
      windDir: fc.hourly.wind_direction_10m?.[i] ?? null,
      cloud: fc.hourly.cloud_cover?.[i] ?? null,
      visibility: fc.hourly.visibility?.[i] ?? null, // meter
      precip: fc.hourly.precipitation?.[i] ?? null,
      weatherCode: fc.hourly.weather_code?.[i] ?? null,
      wave: null,
      seaTemp: null,
      current: null,    // strøm m/s
      currentDir: null, // strømretning (grader)
      seaLevel: null,   // vandstand (m)
    };
    if (marineIdx && marineIdx.has(t)) {
      const j = marineIdx.get(t);
      point.wave = marine.hourly.wave_height?.[j] ?? null;
      point.seaTemp = marine.hourly.sea_surface_temperature?.[j] ?? null;
      const cv = marine.hourly.ocean_current_velocity?.[j];
      point.current = cv != null ? cv / 3.6 : null; // km/t -> m/s
      point.currentDir = marine.hourly.ocean_current_direction?.[j] ?? null;
      point.seaLevel = marine.hourly.sea_level_height_msl?.[j] ?? null;
    }
    return point;
  });

  // Daglige sol-tider: map fra datostreng (YYYY-MM-DD) -> {sunrise, sunset}
  const sun = {};
  (fc.daily?.time || []).forEach((d, i) => {
    sun[d] = {
      sunrise: fc.daily.sunrise?.[i] ?? null,
      sunset: fc.daily.sunset?.[i] ?? null,
    };
  });

  return { location: loc, hours, sun, estLakeTemp, hentet: new Date().toISOString() };
}

// Hent for alle lokationer parallelt.
export async function fetchAllWeather(locations) {
  const results = await Promise.all(
    locations.map((loc) =>
      fetchWeatherForLocation(loc).catch((err) => ({ location: loc, error: String(err) }))
    )
  );
  return results;
}
