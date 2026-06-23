// fishart.js
// Stiliseret, men rund/3D-virkende SVG-fisk pr. art (let, offline, skarp).
// Volumen skabes med en lodret gradient (mørk ryg -> lys bug), blød rygglans,
// bugskygge, gælle-/sidelinje og et øje med refleks. Vippes (pseudo-3D) i app.js.

const FISH = {
  // c=grundfarve, cd=mørk ryg, cl=lys bug
  hornfisk: { rx: 132, ry: 16, c: "#6fcdb8", cd: "#2f7d6e", cl: "#d6f3ec", feature: "beak",    tail: "fork", dorsal: "back",  markings: "stripe" },
  sild:     { rx: 96,  ry: 30, c: "#9fb8d6", cd: "#4f6d92", cl: "#eef4fb", feature: "none",    tail: "fork", dorsal: "mid",   markings: "sheen" },
  makrel:   { rx: 118, ry: 23, c: "#49c2a4", cd: "#15564a", cl: "#cdeede", feature: "finlets", tail: "fork", dorsal: "mid",   markings: "backbars" },
  torsk:    { rx: 102, ry: 38, c: "#c6a36b", cd: "#7a5a2f", cl: "#efe2c6", feature: "barbel",  tail: "fan",  dorsal: "three", markings: "spots", lateral: true },
  havorred: { rx: 108, ry: 31, c: "#cdd7e1", cd: "#7c8a99", cl: "#f4f8fb", feature: "adipose", tail: "fork", dorsal: "mid",   markings: "spots", lateral: true },
  multe:    { rx: 104, ry: 29, c: "#bcc5cd", cd: "#6e7882", cl: "#eef2f6", feature: "blunt",   tail: "fork", dorsal: "two",   markings: "sheen", lateral: true },
  aborre:   { rx: 90,  ry: 41, c: "#6fa84b", cd: "#345c22", cl: "#d3e7ad", feature: "redfins", tail: "fan",  dorsal: "spiny", markings: "bars" },
  gedde:    { rx: 136, ry: 27, c: "#5aa173", cd: "#274f33", cl: "#cdebcf", feature: "bill",    tail: "fan",  dorsal: "back",  markings: "spotsrows" },
};

const CX = 192, CY = 96;

// Tapered fiskekrop: rund hoved-ende (højre), smal halerod (venstre).
function bodyPath(f) {
  const { rx, ry } = f, nx = CX + rx, tx = CX - rx, peakX = CX + rx * 0.05, w = ry * 0.26;
  return `M${nx},${CY}`
    + ` C${nx},${CY - ry * 0.72} ${peakX + rx * 0.5},${CY - ry} ${peakX},${CY - ry}`
    + ` C${CX - rx * 0.35},${CY - ry} ${tx},${CY - ry * 0.78} ${tx},${CY - w}`
    + ` L${tx},${CY + w}`
    + ` C${tx},${CY + ry * 0.78} ${CX - rx * 0.35},${CY + ry} ${peakX},${CY + ry}`
    + ` C${peakX + rx * 0.5},${CY + ry} ${nx},${CY + ry * 0.72} ${nx},${CY} Z`;
}

function tailPart(f, id) {
  const tx = CX - f.rx;
  const fill = `url(#fin-${id})`;
  if (f.tail === "fan") {
    return `<path d="M${tx + 4},${CY} C${tx - 14},${CY - 10} ${tx - 38},${CY - 24} ${tx - 46},${CY - 22} Q${tx - 33},${CY} ${tx - 46},${CY + 22} C${tx - 38},${CY + 24} ${tx - 14},${CY + 10} ${tx + 4},${CY} Z" fill="${fill}"/>`;
  }
  return `<path d="M${tx + 4},${CY} C${tx - 12},${CY - 6} ${tx - 28},${CY - 12} ${tx - 48},${CY - 32} C${tx - 36},${CY - 14} ${tx - 30},${CY} ${tx - 30},${CY} C${tx - 30},${CY} ${tx - 36},${CY + 14} ${tx - 48},${CY + 32} C${tx - 28},${CY + 12} ${tx - 12},${CY + 6} ${tx + 4},${CY} Z" fill="${fill}"/>`;
}

function dorsalPart(f, id) {
  const fill = `url(#fin-${id})`, top = CY - f.ry;
  if (f.dorsal === "spiny") {
    let d = `M${CX - 40},${top + 3}`;
    for (let i = 0; i < 6; i++) d += ` L${CX - 32 + i * 11},${top - 20} L${CX - 26 + i * 11},${top + 3}`;
    return `<path d="${d} Z" fill="${fill}"/>`;
  }
  if (f.dorsal === "three") {
    return [0, 1, 2].map((i) => { const x = CX - 36 + i * 34; return `<path d="M${x},${top + 4} Q${x + 14},${top - 16} ${x + 28},${top + 4} Z" fill="${fill}"/>`; }).join("");
  }
  if (f.dorsal === "two") {
    return `<path d="M${CX - 8},${top + 3} Q${CX + 8},${top - 22} ${CX + 24},${top + 4} Z" fill="${fill}"/>`
      + `<path d="M${CX - 54},${top + 5} Q${CX - 44},${top - 14} ${CX - 32},${top + 6} Z" fill="${fill}"/>`;
  }
  const base = f.dorsal === "back" ? CX - f.rx * 0.42 : CX - f.rx * 0.08;
  return `<path d="M${base - 26},${top + 4} Q${base},${top - 26} ${base + 28},${top + 4} Z" fill="${fill}"/>`;
}

function pectoralPart(f, id) {
  const fill = f.feature === "redfins" ? "#d9603f" : `url(#fin-${id})`;
  const x = CX + f.rx * 0.16, y = CY + f.ry * 0.4;
  return `<path d="M${x},${y} Q${x - 28},${y + 28} ${x - 42},${y + 9} Q${x - 24},${y + 7} ${x},${y - 2} Z" fill="${fill}" opacity="0.92"/>`;
}

function featurePart(f) {
  const nx = CX + f.rx, c = f.c, cd = f.cd;
  switch (f.feature) {
    case "beak":
      return `<path d="M${nx - 8},${CY - 4} L${nx + 64},${CY - 1.5} L${nx - 8},${CY - 0.5} Z" fill="${c}"/>`
        + `<path d="M${nx - 8},${CY + 0.5} L${nx + 58},${CY + 1.5} L${nx - 8},${CY + 4} Z" fill="${cd}"/>`;
    case "bill":
      return `<path d="M${nx - 28},${CY - 12} Q${nx + 24},${CY - 6} ${nx + 30},${CY} Q${nx + 24},${CY + 6} ${nx - 28},${CY + 12} Z" fill="${c}"/>`
        + `<path d="M${nx - 20},${CY + 1} Q${nx + 6},${CY + 3} ${nx + 22},${CY + 2}" stroke="${cd}" stroke-width="1.4" fill="none" opacity="0.6"/>`;
    case "blunt":
      return `<path d="M${nx - 12},${CY - f.ry * 0.62} a${f.ry * 0.62},${f.ry * 0.62} 0 1 1 0,${f.ry * 1.24} Z" fill="${c}"/>`;
    case "barbel":
      return `<path d="M${nx - 10},${CY + f.ry - 4} q5,13 -4,18" stroke="${cd}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    case "adipose": { const tx = CX - f.rx; return `<path d="M${tx + 30},${CY - f.ry + 5} q7,-7 13,-1 z" fill="${cd}" opacity="0.85"/>`; }
    case "finlets": { const tx = CX - f.rx; let s = ""; for (let i = 0; i < 3; i++) { const x = tx + 20 + i * 12; s += `<path d="M${x},${CY - f.ry + 3} l6,-5 -1,6 z" fill="${cd}" opacity="0.75"/><path d="M${x},${CY + f.ry - 3} l6,5 -1,-6 z" fill="${cd}" opacity="0.75"/>`; } return s; }
    default: return "";
  }
}

function markingsPart(f, cid) {
  const cd = f.cd; let inner = "";
  if (f.markings === "bars") {
    for (let i = 0; i < 6; i++) { const x = CX - f.rx * 0.6 + i * (f.rx * 0.2); inner += `<rect x="${x}" y="${CY - f.ry}" width="7" height="${f.ry * 2}" rx="3.5" fill="${cd}" opacity="0.4"/>`; }
  } else if (f.markings === "backbars") {
    for (let i = 0; i < 8; i++) { const x = CX - f.rx * 0.72 + i * (f.rx * 0.19); inner += `<path d="M${x},${CY - f.ry} q9,9 1,18" stroke="${cd}" stroke-width="4.5" fill="none" opacity="0.5"/>`; }
  } else if (f.markings === "spots") {
    const pts = [[-0.5, -0.3], [-0.25, 0.25], [0.05, -0.4], [0.28, 0.1], [-0.4, 0.42], [-0.05, 0.42], [0.4, -0.18], [-0.15, -0.08], [0.18, -0.18], [0.12, 0.28]];
    for (const [px, py] of pts) inner += `<circle cx="${CX + px * f.rx}" cy="${CY + py * f.ry}" r="3.2" fill="${cd}" opacity="0.5"/>`;
  } else if (f.markings === "spotsrows") {
    for (let r = -1; r <= 1; r++) for (let i = 0; i < 6; i++) inner += `<circle cx="${CX - f.rx * 0.55 + i * (f.rx * 0.22)}" cy="${CY + r * f.ry * 0.42}" r="3" fill="#eafff7" opacity="0.4"/>`;
  } else if (f.markings === "stripe") {
    inner += `<rect x="${CX - f.rx}" y="${CY - 2}" width="${f.rx * 2}" height="3" fill="#ffffff" opacity="0.25"/>`;
  } else if (f.markings === "sheen") {
    inner += `<ellipse cx="${CX}" cy="${CY + f.ry * 0.3}" rx="${f.rx * 0.9}" ry="${f.ry * 0.45}" fill="#ffffff" opacity="0.14"/>`;
  }
  if (f.lateral) inner += `<path d="M${CX + f.rx * 0.55},${CY - f.ry * 0.05} Q${CX},${CY + f.ry * 0.12} ${CX - f.rx * 0.7},${CY}" stroke="${cd}" stroke-width="1.6" fill="none" opacity="0.45"/>`;
  return `<g clip-path="url(#${cid})">${inner}</g>`;
}

export function fishSVG(id) {
  const f = FISH[id];
  if (!f) return "";
  const cid = "fc-" + id;
  const path = bodyPath(f);
  const eyeX = CX + f.rx * 0.62, eyeY = CY - f.ry * 0.34, er = Math.max(4.5, f.ry * 0.2);
  const gillX = CX + f.rx * 0.42;

  return `<svg class="fishart" viewBox="0 0 384 192" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="glow-${id}" cx="0.5" cy="0.48" r="0.62">
        <stop offset="0" stop-color="${f.c}" stop-opacity="0.16"/>
        <stop offset="1" stop-color="${f.c}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="body-${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${f.cd}"/>
        <stop offset="0.42" stop-color="${f.c}"/>
        <stop offset="1" stop-color="${f.cl}"/>
      </linearGradient>
      <linearGradient id="fin-${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${f.cd}"/><stop offset="1" stop-color="${f.c}"/>
      </linearGradient>
      <filter id="soft-${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>
      <clipPath id="${cid}"><path d="${path}"/></clipPath>
    </defs>
    <ellipse cx="${CX}" cy="${CY}" rx="178" ry="84" fill="url(#glow-${id})"/>
    <ellipse cx="${CX}" cy="${CY + f.ry + 20}" rx="${f.rx * 0.82}" ry="9" fill="#000000" opacity="0.28" filter="url(#soft-${id})"/>
    <g class="fish-bob">
      <g class="fish-tail">${tailPart(f, id)}</g>
      ${dorsalPart(f, id)}
      ${pectoralPart(f, id)}
      <path d="${path}" fill="url(#body-${id})"/>
      ${markingsPart(f, cid)}
      <g clip-path="url(#${cid})">
        <ellipse cx="${CX + f.rx * 0.1}" cy="${CY - f.ry * 0.55}" rx="${f.rx * 0.7}" ry="${f.ry * 0.32}" fill="#ffffff" opacity="0.22" filter="url(#soft-${id})"/>
        <path d="M${gillX},${CY - f.ry * 0.7} Q${gillX - 8},${CY} ${gillX},${CY + f.ry * 0.7}" stroke="${f.cd}" stroke-width="2" fill="none" opacity="0.4"/>
      </g>
      ${featurePart(f)}
      <circle cx="${eyeX}" cy="${eyeY}" r="${er}" fill="#f4f8f8"/>
      <circle cx="${eyeX + er * 0.16}" cy="${eyeY}" r="${er * 0.55}" fill="#0b1f2a"/>
      <circle cx="${eyeX - er * 0.25}" cy="${eyeY - er * 0.3}" r="${er * 0.22}" fill="#ffffff" opacity="0.9"/>
    </g>
  </svg>`;
}
