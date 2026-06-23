// species.js
// Artsviden destilleret fra lystfisk.dk-guiderne + almindelig Øresunds-/DK-viden.
// Modellen er data-drevet, så du kan justere tal og se effekten med det samme.
//
// Felter:
//   monthWeight  : sæsonvægt 0..1 pr. måned (1=jan ... 12=dec). Gate: lav værdi = lav odds.
//   typeScore    : hvor godt arten passer til en lokationstype (0..1). Ikke-nævnt type = ikke relevant.
//   timePref     : "day" | "lowlight" | "crepuscular" | "any"
//   cloudPref    : "low" (sol/klart) | "high" (overskyet) | "any"
//   windIdeal    : [min,max] m/s for ideelt fiskeri
//   windMax      : m/s hvor det reelt bliver for hårdt
//   vindKraevende: true => blikstille er en showstopper (havørred, torsk)
//   claritySensitivity: 0..1 hvor følsom arten er for vandklarhed (tidl. visImportance)
//   turbidPref   : "clear" (synsjæger) | "coloured" (vil have lidt farve/skillelinjer) | "any"
//   pressurePref : "stable" (tryksyg – stabilt/let stigende tryk bedst) | "any"
//   trykFolsomhed: 0..1 hvor meget tryk-trend betyder (1=meget, fx aborre/gedde)
//   windDirPref  : "onshore" (vil have pålandsvind) | "any"
//   currentPref  : "some" (vil have gang i vandet) | "calm" | "any"  (kun marint)
//   vandstandPref: "rising" => lille bonus ved stigende vand (multe, havørred ved udløb)
//   wavePref     : "calm" | "light" | "moderate" | "any"  (kun marint)
//   maaneFolsom  : true => lille fuldmåne-bonus (svagt signal; skumrings-/mørke-rovfisk)
//   waterTempIdeal: [min,max] °C (kun hvor relevant; null = ignorer)
//   note         : kort begrundelse vist i UI

export const SPECIES = [
  {
    id: "hornfisk",
    navn: "Hornfisk",
    emoji: "🐢", // erstattes af farve-badge i UI
    farve: "#7ad7c4",
    monthWeight: { 1:0, 2:0, 3:0, 4:0.25, 5:1.0, 6:1.0, 7:0.8, 8:0.65, 9:0.45, 10:0.1, 11:0, 12:0 },
    typeScore: { kyst: 1.0, mole: 0.9, brak: 0.4 },
    timePref: "day",
    cloudPref: "low",
    windIdeal: [2, 6],
    windMax: 11,
    claritySensitivity: 0.9,
    turbidPref: "clear",
    pressurePref: "any",
    trykFolsomhed: 0.3,
    windDirPref: "any",
    currentPref: "some",
    wavePref: "light",
    waterTempIdeal: [9, 18],
    note: "Synsjæger: vil have lys, klart vand og let krusning på overfladen. Blå himmel + svag vind = bedst. Topsæson maj–juni.",
  },
  {
    id: "sild",
    navn: "Sild",
    emoji: "🐟",
    farve: "#9fb8d6",
    monthWeight: { 1:0.1, 2:0.4, 3:0.85, 4:1.0, 5:0.8, 6:0.2, 7:0.05, 8:0.05, 9:0.2, 10:0.45, 11:0.4, 12:0.2 },
    typeScore: { mole: 1.0, kyst: 0.85 },
    timePref: "lowlight",
    cloudPref: "any",
    windIdeal: [1, 7],
    windMax: 12,
    claritySensitivity: 0.3,
    turbidPref: "any",
    pressurePref: "any",
    trykFolsomhed: 0.3,
    windDirPref: "any",
    currentPref: "calm",
    wavePref: "calm",
    waterTempIdeal: null,
    note: "Forårsgydetræk giver nærmest fangstgaranti fra moler. Bedst omkring solopgang/solnedgang.",
  },
  {
    id: "makrel",
    navn: "Makrel",
    emoji: "🐟",
    farve: "#4cc3a5",
    monthWeight: { 1:0, 2:0, 3:0, 4:0, 5:0.15, 6:0.6, 7:1.0, 8:1.0, 9:0.7, 10:0.35, 11:0, 12:0 },
    typeScore: { mole: 1.0, kyst: 0.8 },
    timePref: "lowlight",
    cloudPref: "any",
    windIdeal: [2, 8],
    windMax: 12,
    claritySensitivity: 0.4,
    turbidPref: "clear",
    pressurePref: "any",
    trykFolsomhed: 0.4,
    windDirPref: "any",
    currentPref: "some",
    wavePref: "light",
    waterTempIdeal: [13, 20],
    note: "Stimefisk og sommerfisk (juli–august i top). Æde-frenzy i skumringen – mole/dybt vand med strøm.",
  },
  {
    id: "torsk",
    navn: "Torsk",
    emoji: "🐟",
    farve: "#c9a36b",
    monthWeight: { 1:0.85, 2:0.8, 3:0.7, 4:0.4, 5:0.2, 6:0.1, 7:0.05, 8:0.05, 9:0.25, 10:0.6, 11:0.9, 12:1.0 },
    typeScore: { mole: 1.0, kyst: 0.7 },
    timePref: "lowlight",
    cloudPref: "high",
    windIdeal: [2, 9],
    windMax: 13,
    vindKraevende: true,
    claritySensitivity: 0.2,
    turbidPref: "any",
    pressurePref: "any",
    trykFolsomhed: 0.5,
    windDirPref: "any",
    currentPref: "some",
    maaneFolsom: true,
    wavePref: "moderate",
    waterTempIdeal: [2, 12],
    note: "Øresund: bedst i de kolde måneder fra mole/kyst, gerne lavt lys/mørke og lidt gang i vandet.",
  },
  {
    id: "havorred",
    navn: "Havørred",
    emoji: "🐟",
    farve: "#e0e6ee",
    monthWeight: { 1:0.7, 2:0.75, 3:0.95, 4:1.0, 5:0.85, 6:0.55, 7:0.4, 8:0.4, 9:0.65, 10:0.85, 11:0.85, 12:0.75 },
    typeScore: { kyst: 1.0, mole: 0.8, brak: 0.85 },
    timePref: "lowlight",
    cloudPref: "any",
    windIdeal: [3, 9],
    windMax: 13,
    vindKraevende: true,
    claritySensitivity: 0.5,
    turbidPref: "coloured",
    pressurePref: "any",
    trykFolsomhed: 0.5,
    windDirPref: "onshore",
    currentPref: "some",
    vandstandPref: "rising",
    maaneFolsom: true,
    wavePref: "moderate",
    waterTempIdeal: [3, 14],
    note: "Vil have gang i vandet: vind, bølger, strøm og skillelinjer mellem klart/uklart vand. Pænt, stille vejr = svært. Fjorde/udløb bedst i de kolde måneder.",
  },
  {
    id: "multe",
    navn: "Multe",
    emoji: "🐟",
    farve: "#bfc7cf",
    monthWeight: { 1:0, 2:0, 3:0, 4:0, 5:0.15, 6:0.45, 7:0.8, 8:1.0, 9:0.9, 10:0.5, 11:0.1, 12:0 },
    typeScore: { brak: 1.0, mole: 0.85, kyst: 0.5 },
    timePref: "day",
    cloudPref: "low",
    windIdeal: [0, 5],
    windMax: 9,
    claritySensitivity: 0.7,
    turbidPref: "clear",
    pressurePref: "any",
    trykFolsomhed: 0.3,
    windDirPref: "any",
    currentPref: "calm",
    vandstandPref: "rising",
    wavePref: "calm",
    waterTempIdeal: [16, 24], // varmekrævende; forsvinder når vandet køler under ~13-14°
    note: "Varmekrævende sommergæst der stimer i lune, lavvandede havne og brakvand. Bedst i sol og stille vand fra juli til september. Synsfisk – kræver klart vand.",
  },
  {
    id: "aborre",
    navn: "Aborre",
    emoji: "🐟",
    farve: "#6fa84b",
    monthWeight: { 1:0.45, 2:0.45, 3:0.6, 4:0.7, 5:0.85, 6:0.9, 7:0.9, 8:0.95, 9:1.0, 10:0.9, 11:0.65, 12:0.5 },
    typeScore: { sø: 1.0, brak: 0.9 },
    timePref: "crepuscular",
    cloudPref: "any",
    windIdeal: [0, 5],
    windMax: 10,
    claritySensitivity: 0.4,
    turbidPref: "any",
    pressurePref: "stable", // "tryksyg" – store tryksvingninger OG faldende tryk forværrer
    trykFolsomhed: 1.0,
    windDirPref: "any",
    currentPref: "any",
    wavePref: "any",
    waterTempIdeal: [12, 22], // aktiv jagt; sløv over ~24°, går i stå under ~8°
    note: "Tryksyg: stabilt (gerne let stigende) lufttryk er bedst – faldende tryk gør den forsigtig. Synsjæger der topper i skumringen og bliver sløv midt på en klar dag. Sø/brak.",
  },
  {
    id: "gedde",
    navn: "Gedde",
    emoji: "🐟",
    farve: "#5aa0a8",
    monthWeight: { 1:0.45, 2:0.5, 3:0.8, 4:0.9, 5:0.7, 6:0.5, 7:0.4, 8:0.45, 9:0.8, 10:1.0, 11:0.9, 12:0.55 },
    typeScore: { sø: 1.0, brak: 0.95 },
    timePref: "lowlight",
    cloudPref: "any",
    windIdeal: [0, 7],
    windMax: 11,
    claritySensitivity: 0.3,
    turbidPref: "any",
    pressurePref: "stable",
    trykFolsomhed: 0.9,
    windDirPref: "any",
    currentPref: "any",
    maaneFolsom: true,
    wavePref: "any",
    waterTempIdeal: [6, 18], // koldtvandsrovfisk; mindre aktiv i varmt sommervand over ~20°
    note: "Forår og efterår i top (efterår = ædeperiode før vinter). Mindre aktiv i varmt sommervand. Bedst morgen/aften langs struktur. Sø/brak (Sydhavnen).",
  },
];

export function speciesById(id) {
  return SPECIES.find((s) => s.id === id);
}
