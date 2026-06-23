// config.js
// Lokationer og tidslommer (de to "lommer" fra opgaven).
// Alt er data-drevet, så du let kan tilføje/justere spots og tider.

// Lokationstyper styrer hvilke arter der er relevante hvor:
//   kyst  = åben kyst (Øresund)
//   mole  = mole/høfde/havn (dybt vand tæt på land)
//   brak  = brakvand / udløb (fx Sydhavnen)
//   sø    = ferskvandssø
export const LOCATIONS = [
  {
    id: "amager-strand",
    navn: "Amager Strand (kyst)",
    type: "kyst",
    lat: 55.6557,
    lon: 12.6519,
    marint: true,
    kystRetning: 95,  // åbent vand mod ~øst (Øresund). Bruges til på-/fralandsvind.
    note: "Åben Øresundskyst – tæt på Amager.",
  },
  {
    id: "amager-mole",
    navn: "Kastrup Havn / moler",
    type: "mole",
    lat: 55.6360,
    lon: 12.6585,
    marint: true,
    kystRetning: 100, // åbent vand mod ~øst/ESE
    note: "Mole med dybt vand tæt på land.",
  },
  {
    id: "sydhavnen",
    navn: "Sydhavnen (brak/udløb)",
    type: "brak",
    lat: 55.6385,
    lon: 12.5450,
    marint: true,
    laeOmraade: true, // skærmet brakvand – vindretning betyder mindre
    tempOffset: 1,    // lidt lunere end åben sund
    note: "Brakvand og mindre udløb – aborre, gedde, havørred.",
  },
  {
    id: "provestenen",
    navn: "Prøvestenen (bådhavn)",
    type: "brak",
    lat: 55.6790,
    lon: 12.6280,
    marint: true,
    laeOmraade: true, // lun, skærmet bådhavn
    tempOffset: 2,    // lavvandet, lun havn -> varmere end åben SST (vigtigt for multe)
    note: "Lun, lavvandet bådhavn på Amager – set stimer af multe her.",
  },
  {
    id: "bagsvaerd-so",
    navn: "Bagsværd Sø (sø)",
    type: "sø",
    lat: 55.7600,
    lon: 12.4580,
    marint: false,
    tempAlpha: 0.16, // større/dybere sø -> mere træg
    kvalitet: 1.0,   // lokal vurdering: bedste sø
    note: "Sø ved arbejdspladsen – stærkt vand for aborre/gedde.",
  },
  {
    id: "utterslev-mose",
    navn: "Utterslev Mose (sø)",
    type: "sø",
    lat: 55.7150,
    lon: 12.5050,
    marint: false,
    tempAlpha: 0.30, // lavvandet mose -> reagerer hurtigt på lufttemp
    kvalitet: 0.9,   // lokal vurdering: god, men efter Bagsværd
    note: "Lavvandet mose – god gedde- og aborresø.",
  },
];

// Tidslommer: hverdag 18-22, weekend 12-20.
// startHour/endHour er lokale timer (Europe/Copenhagen).
export const POCKETS = {
  hverdag: { navn: "Hverdag", startHour: 18, endHour: 22 },
  weekend: { navn: "Weekend", startHour: 12, endHour: 20 },
};

// Returnér den relevante lomme for en given dato (lør/søn = weekend).
export function pocketForDate(date) {
  const dag = date.getDay(); // 0 = søn, 6 = lør
  return dag === 0 || dag === 6 ? POCKETS.weekend : POCKETS.hverdag;
}

// Hvor mange dage frem vi henter/viser.
export const FORECAST_DAYS = 7;

export const TIMEZONE = "Europe/Copenhagen";
