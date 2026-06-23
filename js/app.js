// app.js – binder det hele sammen og styrer UI.

import { LOCATIONS, FORECAST_DAYS } from "./config.js";
import { fetchAllWeather } from "./weather.js";
import { scoreUpcoming, ugedagNavn } from "./scoring.js";
import { grejFor } from "./grej.js";
import { fishSVG } from "./fishart.js";

const CACHE_KEY = "fiskeodds:weather:v1";
const CACHE_TTL = 1000 * 60 * 60 * 3; // 3 timer

const el = {
  refresh: document.getElementById("refresh"),
  daystrip: document.getElementById("daystrip"),
  status: document.getElementById("status"),
  pocketbar: document.getElementById("pocketbar"),
  results: document.getElementById("results"),
  updated: document.getElementById("updated"),
};

let state = {
  weather: null,   // rå vejrdata pr. lokation
  days: [],        // beregnede dage
  selected: 0,
  hentet: null,
};

// ---------- hjælpere ----------
function oddsColor(v) {
  if (v >= 60) return "var(--good)";
  if (v >= 35) return "var(--mid)";
  if (v >= 15) return "var(--low)";
  return "#5b7d8a";
}
function subColor(v) {
  if (v >= 0.75) return "var(--good)";
  if (v >= 0.5) return "var(--mid)";
  return "var(--low)";
}
function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(12, 0, 0, 0);
  return d;
}
function fmtNum(v, dec = 0, unit = "") {
  if (v === null || v === undefined || Number.isNaN(v)) return "–";
  return `${v.toFixed(dec)}${unit}`;
}
const SHORT_WD = { Mandag:"Man", Tirsdag:"Tir", Onsdag:"Ons", Torsdag:"Tor", Fredag:"Fre", Lørdag:"Lør", Søndag:"Søn" };
function windKompas(deg) {
  if (deg == null) return "";
  const dirs = ["N", "NØ", "Ø", "SØ", "S", "SV", "V", "NV"];
  return dirs[Math.round(deg / 45) % 8];
}
function vandstandTxt(delta) {
  if (delta > 0.03) return "↑ Stigende";
  if (delta < -0.03) return "↓ Faldende";
  return "→ Stabil";
}
function maaneEmoji(illum) {
  if (illum < 0.1) return "🌑";
  if (illum < 0.4) return "🌒";
  if (illum < 0.6) return "🌓";
  if (illum < 0.9) return "🌔";
  return "🌕";
}

// ---------- data ----------
function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (Date.now() - obj.ts > CACHE_TTL) return obj; // returnér men markér som gammel
    return obj;
  } catch { return null; }
}
function saveCache(weather) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), weather }));
  } catch { /* ignore */ }
}

function recompute() {
  state.days = scoreUpcoming(state.weather, tomorrow(), Math.min(FORECAST_DAYS - 1, 6));
  if (state.selected >= state.days.length) state.selected = 0;
}

async function refresh(force = false) {
  el.refresh.classList.add("spinning");
  setStatus("Henter vejrdata …");
  try {
    const weather = await fetchAllWeather(LOCATIONS);
    state.weather = weather;
    state.hentet = Date.now();
    saveCache(weather);
    recompute();
    render();
    setStatus("");
  } catch (err) {
    setStatus("Kunne ikke hente vejr. Tjek forbindelsen og prøv igen.", true);
  } finally {
    el.refresh.classList.remove("spinning");
  }
}

function setStatus(msg, isError = false) {
  el.status.textContent = msg;
  el.status.className = "status" + (isError ? " error" : "");
}

// ---------- render ----------
function render() {
  if (!state.days.length) return;
  renderDaystrip();
  renderDay();
  renderUpdated();
}

function renderDaystrip() {
  el.daystrip.innerHTML = "";
  state.days.forEach((day, i) => {
    const top = day.perSpecies[0];
    const pill = document.createElement("button");
    pill.className = "day-pill" + (i === state.selected ? " active" : "") + (i === 0 ? " tomorrow" : "");
    const dt = day.date;
    pill.innerHTML = `
      <div class="d-wd">${SHORT_WD[day.ugedag] || day.ugedag}</div>
      <div class="d-dt">${dt.getDate()}/${dt.getMonth() + 1}</div>
      <div class="d-top" style="color:${top ? oddsColor(top.odds) : "var(--muted)"}">
        ${top ? top.odds + "%" : "–"}
      </div>`;
    pill.addEventListener("click", () => { state.selected = i; render(); });
    el.daystrip.appendChild(pill);
  });
}

function renderDay() {
  const day = state.days[state.selected];
  const p = day.pocket;
  const best = day.perSpecies[0];

  el.pocketbar.hidden = false;
  el.pocketbar.innerHTML = `
    <div>
      <div class="pk-title">${day.ugedag} ${day.date.getDate()}/${day.date.getMonth() + 1}</div>
      <div class="muted" style="font-size:13px">${p.navn}-lomme</div>
    </div>
    <div style="text-align:right">
      <div class="pk-time">kl. ${p.startHour}–${p.endHour}</div>
      <div class="pk-best">${best ? "Bedste bud: " + best.speciesNavn : ""}</div>
    </div>`;

  el.results.innerHTML = "";
  if (!day.perSpecies.length) {
    el.results.innerHTML = `<div class="empty">Ingen data for denne dag.</div>`;
    return;
  }
  day.perSpecies.forEach((r) => el.results.appendChild(fishCard(r, day)));
}

function fishCard(r, day) {
  const card = document.createElement("div");
  card.className = "fish";

  // Top 3 pladser for arten (på den valgte dag)
  const spots = day.all
    .filter((x) => x.speciesId === r.speciesId)
    .sort((a, b) => b.odds - a.odds)
    .slice(0, 3);
  const spotsHtml = spots
    .map((s) => `<div class="spot-row">
        <span class="spot-name">📍 ${s.locationNavn}</span>
        <span class="spot-bar"><span style="width:${s.odds}%;background:${oddsColor(s.odds)}"></span></span>
        <span class="spot-odds" style="color:${oddsColor(s.odds)}">${s.odds}%</span>
      </div>`)
    .join("");

  // Top 3 grej med successrate
  const grejHtml = grejFor(r.speciesId)
    .map((g) => `<div class="grej-row">
        <div class="grej-top">
          <span class="grej-metode">${g.metode}</span>
          <span class="grej-rate">${g.rate}%</span>
        </div>
        <div class="grej-bar"><span style="width:${g.rate}%"></span></div>
        <div class="grej-tip">${g.tip}</div>
      </div>`)
    .join("");

  const visual = `<div class="fish-visual" data-id="${r.speciesId}">${fishSVG(r.speciesId)}<div class="visual-hint">træk for at dreje</div></div>`;

  const subChips = Object.entries(r.subs)
    .filter(([, s]) => s.v !== null)
    .map(([k, s]) => `<span class="chip"><span class="sdot" style="background:${subColor(s.v)}"></span>${k} ${Math.round(s.v * 100)}%</span>`)
    .join("");

  const a = r.agg;
  const klarhedTxt = a.turbiditet == null ? "–" : a.turbiditet < 0.25 ? "Klart" : a.turbiditet < 0.55 ? "Let uklart" : "Uklart";
  const wx = `
    <div class="wx">
      <div><div class="k">Temp</div><div class="v">${fmtNum(a.temp, 0, "°")}</div></div>
      <div><div class="k">Vind</div><div class="v">${fmtNum(a.wind, 1, " m/s")} ${windKompas(a.windDir)}</div></div>
      <div><div class="k">Vindstød</div><div class="v">${fmtNum(a.gust, 1, " m/s")}</div></div>
      <div><div class="k">Lufttryk</div><div class="v">${fmtNum(a.pressure, 0, " hPa")}</div></div>
      <div><div class="k">Skydække</div><div class="v">${fmtNum(a.cloud, 0, "%")}</div></div>
      <div><div class="k">Vandklarhed</div><div class="v">${klarhedTxt}</div></div>
      <div><div class="k">Nedbør</div><div class="v">${fmtNum(a.precip, 1, " mm")}</div></div>
      ${a.wave != null ? `<div><div class="k">Bølger</div><div class="v">${fmtNum(a.wave, 1, " m")}</div></div>` : ""}
      ${a.current != null ? `<div><div class="k">Strøm</div><div class="v">${fmtNum(a.current, 2, " m/s")}</div></div>` : ""}
      ${a.vandstandTrend != null ? `<div><div class="k">Vandstand</div><div class="v">${vandstandTxt(a.vandstandTrend)}</div></div>` : ""}
      ${a.vandtemp != null ? `<div><div class="k">Vandtemp${a.vandtempEstimat ? " (est.)" : ""}</div><div class="v">${a.vandtempEstimat ? "~" : ""}${fmtNum(a.vandtemp, 0, "°")}</div></div>` : ""}
      ${a.moonIllum != null ? `<div><div class="k">Måne</div><div class="v">${maaneEmoji(a.moonIllum)} ${Math.round(a.moonIllum * 100)}%</div></div>` : ""}
    </div>`;

  card.innerHTML = `
    <div class="fish-head">
      <span class="dot" style="background:${r.farve}"></span>
      <div>
        <div class="fish-name">${r.speciesNavn}</div>
        <div class="fish-loc">📍 ${r.locationNavn}</div>
      </div>
      <div class="odds-wrap">
        <div style="width:90px">
          <div class="bar"><div class="bar-fill" style="width:${r.odds}%;background:${oddsColor(r.odds)}"></div></div>
        </div>
        <div class="odds-num" style="color:${oddsColor(r.odds)}">${r.odds}%</div>
      </div>
      <span class="chev">▶</span>
    </div>
    <div class="fish-detail">
      ${visual}
      <p class="detail-note">${r.note}</p>
      <h4 class="sec-title">Bedste pladser</h4>
      <div class="spots">${spotsHtml}</div>
      <h4 class="sec-title">Bedste grej</h4>
      <div class="grej">${grejHtml}</div>
      <h4 class="sec-title">Forhold i lommen</h4>
      ${wx}
      <div class="subs">${subChips}</div>
    </div>`;

  card.querySelector(".fish-head").addEventListener("click", () => {
    const willOpen = !card.classList.contains("open");
    card.classList.toggle("open");
    if (willOpen) maybeLoad3D(card.querySelector(".fish-visual"));
  });
  return card;
}

// 3D: prøv at hente models/<id>.glb. Findes den (og vi er online), vis fuld 360°-model.
// Ellers fald tilbage til den animerede SVG-fisk med træk-for-at-vippe.
async function maybeLoad3D(box) {
  if (!box || box.dataset.tried) return;
  box.dataset.tried = "1";
  const url = `models/${box.dataset.id}.glb`;
  if (!navigator.onLine) { attachTilt(box); return; }
  try {
    const head = await fetch(url, { method: "HEAD" });
    if (!head.ok) throw new Error("no model");
    await loadModelViewer();
    show3D(box, url);
  } catch {
    attachTilt(box);
  }
}

let mvPromise = null;
function loadModelViewer() {
  if (mvPromise) return mvPromise;
  mvPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.type = "module";
    s.src = "https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js";
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return mvPromise;
}

function show3D(box, url) {
  const mv = document.createElement("model-viewer");
  mv.className = "fish-3d";
  mv.setAttribute("src", url);
  mv.setAttribute("camera-controls", "");      // træk for at rotere 360°
  mv.setAttribute("auto-rotate", "");
  mv.setAttribute("auto-rotate-delay", "0");
  mv.setAttribute("rotation-per-second", "26deg");
  mv.setAttribute("interaction-prompt", "none");
  mv.setAttribute("shadow-intensity", "0.9");
  mv.setAttribute("exposure", "1");
  mv.setAttribute("touch-action", "pan-y");
  const svg = box.querySelector(".fishart");
  mv.addEventListener("error", () => { mv.remove(); if (svg) svg.style.display = ""; attachTilt(box); });
  if (svg) svg.style.display = "none";
  box.insertBefore(mv, box.querySelector(".visual-hint"));
}

// Træk-for-at-vippe (pseudo-3D) på fiske-visualen.
function attachTilt(box) {
  if (!box || box.dataset.tilt) return;
  box.dataset.tilt = "1";
  const svg = box.querySelector(".fishart");
  let dragging = false;
  const set = (x, y) => { svg.style.transform = `perspective(700px) rotateY(${x}deg) rotateX(${y}deg)`; };
  box.addEventListener("pointerdown", (e) => {
    dragging = true; svg.style.transition = "none";
    box.setPointerCapture(e.pointerId);
  });
  box.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const rect = box.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    set(px * 55, -py * 32);
  });
  const reset = () => { if (!dragging) return; dragging = false; svg.style.transition = "transform .45s ease"; svg.style.transform = ""; };
  box.addEventListener("pointerup", reset);
  box.addEventListener("pointercancel", reset);
  box.addEventListener("pointerleave", reset);
}

function renderUpdated() {
  if (!state.hentet) { el.updated.textContent = ""; return; }
  const d = new Date(state.hentet);
  el.updated.textContent = `Opdateret ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ---------- init ----------
function init() {
  el.refresh.addEventListener("click", () => refresh(true));

  // Vis cache med det samme hvis muligt
  const cached = loadCache();
  if (cached?.weather) {
    state.weather = cached.weather;
    state.hentet = cached.ts;
    recompute();
    render();
  }
  // Hent altid frisk
  refresh();

  // Registrér service worker (PWA/offline)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

init();
