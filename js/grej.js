// grej.js
// Endegrej pr. art – generelle tommelfingerregler (relativ successrate, ikke garanti).
// rate = relativ effektivitet 0-100 for arten generelt. Vises top 3 (højeste rate).
// Let at justere/tilføje. Kilde: lystfisk.dk + almindelig DK-erfaring.

export const GREJ = {
  hornfisk: [
    { metode: "Flåd + fiskestrimmel", rate: 80, tip: "Lille strimmel sild/makrel under flåd i 1–2 m – lad den drive. Brug 'hornfiskekvast'/garn, da de sjældent kroges." },
    { metode: "Bombarda + agnstrimmel", rate: 70, tip: "Langt kast med en lille strimmel bag en gennemsigtig bombarda – langsomt indtag højt i vandet." },
    { metode: "Lille blink/spinner (8–15 g)", rate: 55, tip: "Hurtigt indtag i overfladen – mange hug, få kroges." },
  ],
  sild: [
    { metode: "Sildeforfang (optrækkere)", rate: 85, tip: "Sabiki/hæksystem – lad det synke, små ryk. Tæl ned til stimen står." },
    { metode: "Blink/pirk under forfang", rate: 60, tip: "Giver kastevægt og ekstra fisk på krogene." },
    { metode: "Forfang med UV/lysperler", rate: 50, tip: "Når silden står dybt eller lyset er lavt – lysende perler trækker hug." },
  ],
  makrel: [
    { metode: "Blink/pirk (20–40 g)", rate: 80, tip: "Hurtigt indtag – makrellen jager i overfladen i skumringen." },
    { metode: "Sildeforfang/hæksystem", rate: 78, tip: "Flere fisk ad gangen når stimen står under dig." },
    { metode: "Spinner/lille jig", rate: 60, tip: "God når makrellen er kræsen eller helt inde ved molen." },
  ],
  torsk: [
    { metode: "Pirk (60–150 g)", rate: 78, tip: "Jig op-og-ned tæt på bunden langs mole/dyb kant." },
    { metode: "Naturagn på bund", rate: 72, tip: "Børsteorm eller sildestrimmel på tungt forfang – tålmodigt fiskeri." },
    { metode: "Ophænger over pirk", rate: 58, tip: "En twister/gummiorm over pirken giver tit det ekstra hug." },
  ],
  havorred: [
    { metode: "Kystblink (12–20 g)", rate: 80, tip: "Langt kast, varieret indtag. Bedst i blæst/strøm og uklart vand." },
    { metode: "Jig/softbait", rate: 68, tip: "Tæt på bund og strømkanter når det blæser op. Naturlige farver i klart vand." },
    { metode: "Kystwobbler", rate: 58, tip: "Langsomt, vraltende indtag over lavt vand – god i ro og lavt lys." },
  ],
  multe: [
    { metode: "Brød/majs under flåd", rate: 75, tip: "Fodr med opblødt brød. Lille krog (str. 8–12) og fint forfang – multen er sky." },
    { metode: "Fritflydende brød", rate: 58, tip: "Brødprop på krogen uden vægt – lad den drive med i fodringen i overfladen." },
    { metode: "Majs/dej på bund", rate: 50, tip: "Stille, lavvandet havn – vær diskret og tålmodig." },
  ],
  aborre: [
    { metode: "Jig/gummifisk", rate: 82, tip: "Små shads ved bund og struktur (drop-shot/jighoved). Indlæg pauser." },
    { metode: "Spinner (str. 1–3)", rate: 70, tip: "Dækker vand hurtigt – godt over åbne kanter og om sommeren." },
    { metode: "Orm/maddike under flåd", rate: 65, tip: "Sikker metode, især til mindre aborrer og når de er kræsne." },
  ],
  gedde: [
    { metode: "Gummifisk/shad (10–15 cm)", rate: 82, tip: "Langsomt indtag langs sivkanter og dybdespring. Brug ALTID stålforfang." },
    { metode: "Agnfisk under flåd", rate: 78, tip: "Fang evt. en skalle på majs først og brug den som agn (dødt eller levende) under flåd. Stålforfang!" },
    { metode: "Stort blink/spinnerbait", rate: 68, tip: "Aktiv søgning – god i grumset vand og i forår/efterår." },
  ],
};

export function grejFor(id) {
  return (GREJ[id] || []).slice().sort((a, b) => b.rate - a.rate).slice(0, 3);
}
