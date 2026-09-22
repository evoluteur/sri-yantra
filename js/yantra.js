/* Sri Yantra generator: draws the nine interlocking triangles with their
   lotus petals, circles and gated square as SVG, with color options and
   PNG/SVG export. Plain JS, no dependencies. Triangle data: yantra-data.js. */

const $ = (id) => document.getElementById(id);

const PALETTES = [
  { id: "classic", label: "Gold", bg: "#1a212d", line: "#f6e3bf", shiva: "#f0a830", shakti: "#e0533d", lotus8: "#c47a3a", lotus16: "#e0a458", gate: "#b8893c", bindu: "#ff5a3c" },
  { id: "temple", label: "Temple", bg: "#fbf1dc", line: "#4a1f0c", shiva: "#e59a1a", shakti: "#b3261e", lotus8: "#e8892f", lotus16: "#f3c45a", gate: "#8c3b1e", bindu: "#b3261e" },
  { id: "night", label: "Night", bg: "#0f1220", line: "#d6dcff", shiva: "#6f8dff", shakti: "#c076ff", lotus8: "#4d68d8", lotus16: "#8b6ee8", gate: "#5b6fbf", bindu: "#ffd76a" },
  { id: "ink", label: "Ink", bg: "#ffffff", line: "#141414", shiva: "#9a9a9a", shakti: "#4a4a4a", lotus8: "#7a7a7a", lotus16: "#b5b5b5", gate: "#666666", bindu: "#141414" },
];
const FILLS = [
  { id: "filled", label: "Filled" },
  { id: "lines", label: "Outline" },
];
const WHICH = [
  { id: "both", label: "Both" },
  { id: "up", label: "Shiva (upward)" },
  { id: "down", label: "Shakti (downward)" },
];
const ENCLOSURES = [
  ["Trailokya Mohana", "the square with four gates: enchanter of the three worlds"],
  ["Sarva Asha Paripuraka", "the sixteen petals: fulfiller of all hopes"],
  ["Sarva Sankshobhana", "the eight petals: agitator of all"],
  ["Sarva Saubhagyadayaka", "the fourteen triangles: giver of all good fortune"],
  ["Sarvartha Sadhaka", "the outer ten triangles: accomplisher of all aims"],
  ["Sarva Rakshakara", "the inner ten triangles: protector of all"],
  ["Sarva Rogahara", "the eight triangles: remover of all disease"],
  ["Sarva Siddhiprada", "the central triangle: bestower of all powers"],
  ["Sarva Anandamaya", "the bindu: full of all bliss"],
];

const DEFAULTS = {
  n: 9,
  which: "both",
  bindu: true,
  tri: true,
  lotus8: true,
  lotus16: true,
  circles: true,
  gates: true,
  palette: "classic",
  fill: "filled",
  weight: 10,
};
let S = { ...DEFAULTS };
try {
  Object.assign(S, JSON.parse(localStorage.getItem("yantra-settings") || "{}"));
} catch (e) {}
const save = () => {
  try {
    localStorage.setItem("yantra-settings", JSON.stringify(S));
  } catch (e) {}
};

// Triangles as drawn, in a space centered on (0, 0)
const TRIS = YANTRA_TRIANGLES.map(({ id, data: [l, b, a, r, up] }) => ({
  id,
  up: !!up,
  width: r - l,
  pts: [
    [l - 150, b - 150],
    [r - 150, b - 150],
    [0, a - 150],
  ],
}));
const BY_SIZE = [...TRIS].sort((p, q) => p.width - q.width);

const pol = (deg, r) => {
  const a = (deg * Math.PI) / 180;
  return [r * Math.cos(a), -r * Math.sin(a)]; // y-up angles, y-down screen
};
const P = (p) => p[0].toFixed(2) + " " + p[1].toFixed(2);

// One lotus ring. petals: 8 or 16; r0 is the inner radius, r1 the petal tip.
const lotusPath = (count, r0, r1, controls) => {
  const step = 360 / count;
  let d = "";
  for (let i = 0; i < count; i++) {
    const start = step / 2 + step * i;
    const [[a1, k1], [a2, k2]] = controls;
    const at = (delta, r) => pol(start - delta, r);
    d +=
      `M${P(at(0, r0))}` +
      `C${P(at(a1, k1))} ${P(at(a2, k2))} ${P(at(step / 2, r1))}` +
      `C${P(at(step - a2, k2))} ${P(at(step - a1, k1))} ${P(at(step, r0))}` +
      `A${r0} ${r0} 0 0 0 ${P(at(0, r0))}Z`;
  }
  return d;
};

// One outline of the gated square: half side h, gate half width g, gate depth d.
const gatePolygon = (h, g, d) => {
  const pts = [];
  for (let k = 0; k < 4; k++) {
    // corner, gate in, gate out, ... for the top side, then rotate by 90 degrees each time
    const side = [
      [-h, -h], [-g, -h], [-g, -h - d], [g, -h - d], [g, -h],
    ];
    side.forEach(([x, y]) => {
      for (let i = 0; i < k; i++) [x, y] = [-y, x];
      pts.push([x, y]);
    });
  }
  return "M" + pts.map(P).join("L") + "Z";
};

const paletteOf = () => PALETTES.find((p) => p.id === S.palette) || PALETTES[0];

const triCount = () => Math.max(0, Math.min(9, S.n));
const shownTriangles = () => {
  const list = BY_SIZE.slice(0, triCount());
  if (S.which === "up") return list.filter((t) => t.up);
  if (S.which === "down") return list.filter((t) => !t.up);
  return list;
};

const yantraSVG = () => {
  const c = paletteOf();
  const w = S.weight / 10;
  const filled = S.fill === "filled";
  const V = 215;
  const stroke = (sw = 1, op = 1) => `stroke="${c.line}" stroke-width="${(w * sw).toFixed(2)}" stroke-opacity="${op}" stroke-linejoin="round"`;
  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-V} ${-V} ${2 * V} ${2 * V}" class="plain" role="img" aria-label="Sri Yantra">`;
  out += `<rect x="${-V}" y="${-V}" width="${2 * V}" height="${2 * V}" fill="${c.bg}"/>`;

  if (S.gates) {
    // three nested outlines; the band between the outer two is filled
    const h = 168, g = 28, d = 26, gap = 7;
    if (filled) {
      out += `<path d="${gatePolygon(h + 2 * gap, g + 2 * gap, d)} ${gatePolygon(h, g, d)}" fill-rule="evenodd" fill="${c.gate}" fill-opacity="0.55"/>`;
    }
    for (let i = 0; i < 3; i++) {
      out += `<path d="${gatePolygon(h + i * gap, g + i * gap, d)}" fill="none" ${stroke(i === 1 ? 0.6 : 1)}/>`;
    }
  }
  if (S.circles) {
    [140, 147, 154].forEach((r, i) => {
      out += `<circle r="${r}" fill="none" ${stroke(i === 0 ? 1 : 0.6)}/>`;
    });
  }
  if (S.lotus16) {
    out += `<path d="${lotusPath(16, 120, 140, [[2.5, 134], [8.75, 130]])}" fill="${filled ? c.lotus16 : "none"}" fill-opacity="0.6" ${stroke()}/>`;
  }
  if (S.lotus8) {
    out += `<path d="${lotusPath(8, 100, 120, [[5, 114], [17.5, 110]])}" fill="${filled ? c.lotus8 : "none"}" fill-opacity="0.65" ${stroke()}/>`;
  }
  if (S.lotus8 || S.lotus16 || S.tri) {
    out += `<circle r="100" fill="none" ${stroke()}/>`;
  }
  if (S.tri) {
    // largest first so the small ones read on top
    [...shownTriangles()].reverse().forEach((t) => {
      const [a, b, top] = t.pts;
      const col = t.up ? c.shiva : c.shakti;
      out += `<path d="M${P(a)}L${P(b)}L${P(top)}Z" fill="${filled ? col : "none"}" fill-opacity="0.5" ${stroke(0.9)}/>`;
    });
  }
  if (S.bindu) {
    out += `<circle r="4.5" fill="${c.bindu}" ${stroke(0.5)}/>`;
  }
  return out + "</svg>";
};

const render = () => {
  $("yantra").innerHTML = yantraSVG();
  $("tri-n-val").textContent = triCount() + " of 9";
  const shown = S.tri ? shownTriangles() : [];
  const up = shown.filter((t) => t.up).length;
  $("yantra-note").textContent = S.tri
    ? `${shown.length} triangle${shown.length === 1 ? "" : "s"} drawn: ${up} upward, ${shown.length - up} downward.`
    : "Triangles hidden.";
  document.querySelectorAll("#which-chips button").forEach((b, i) => {
    const on = WHICH[i].id === S.which;
    b.className = on ? "selected" : "";
    b.setAttribute("aria-pressed", on);
  });
  document.querySelectorAll("#pal-chips button").forEach((b, i) => {
    const on = PALETTES[i].id === S.palette;
    b.className = on ? "selected" : "";
    b.setAttribute("aria-pressed", on);
  });
  document.querySelectorAll("#fill-chips button").forEach((b, i) => {
    const on = FILLS[i].id === S.fill;
    b.className = on ? "selected" : "";
    b.setAttribute("aria-pressed", on);
  });
  $("weight-val").textContent = (S.weight / 10).toFixed(1);
  $("tri-n").value = S.n;
};

// ---------------------------------------------------------------- play

let playTimer = null;
const stopPlay = () => {
  clearInterval(playTimer);
  playTimer = null;
  $("play").textContent = "Build it up";
};
const play = () => {
  if (playTimer) return stopPlay();
  S.n = 0;
  S.tri = true;
  $("l-tri").checked = true;
  render();
  $("play").textContent = "Stop";
  playTimer = setInterval(() => {
    S.n += 1;
    render();
    if (S.n >= 9) {
      stopPlay();
      save();
    }
  }, 700);
};

// ---------------------------------------------------------------- export

const download = (blob, name) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};
const exportSVG = () => {
  const svg = yantraSVG().replace(' class="plain"', "");
  download(new Blob([svg], { type: "image/svg+xml" }), "sri-yantra.svg");
};
const exportPNG = () => {
  const px = 2000;
  const svg = yantraSVG()
    .replace(' class="plain"', "")
    .replace("<svg ", `<svg width="${px}" height="${px}" `);
  const img = new Image();
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = c.height = px;
    c.getContext("2d").drawImage(img, 0, 0, px, px);
    c.toBlob((b) => download(b, "sri-yantra.png"));
  };
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
};

// ---------------------------------------------------------------- UI

const chips = (id, items, pick) => {
  const box = $(id);
  box.innerHTML = "";
  items.forEach((it) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = it.label;
    b.onclick = () => pick(it);
    box.appendChild(b);
  });
};

const initYantra = () => {
  S.n = Math.max(0, Math.min(9, Math.round(S.n)));
  if (!PALETTES.some((p) => p.id === S.palette)) S.palette = "classic";

  $("tri-n").oninput = () => {
    stopPlay();
    S.n = +$("tri-n").value;
    save();
    render();
  };
  chips("which-chips", WHICH, (w) => { S.which = w.id; save(); render(); });
  chips("pal-chips", PALETTES, (p) => { S.palette = p.id; save(); render(); });
  chips("fill-chips", FILLS, (f) => { S.fill = f.id; save(); render(); });

  ["bindu", "tri", "lotus8", "lotus16", "circles", "gates"].forEach((k) => {
    const el = $("l-" + k);
    el.checked = !!S[k];
    el.onchange = () => {
      S[k] = el.checked;
      save();
      render();
    };
  });
  const wt = $("weight");
  wt.value = S.weight;
  wt.oninput = () => {
    S.weight = +wt.value;
    save();
    render();
  };
  $("play").onclick = play;
  $("export-png").onclick = exportPNG;
  $("export-svg").onclick = exportSVG;

  $("enclosures").innerHTML = ENCLOSURES.map(
    ([sa, en]) => `<li><span class="sa">${sa}</span> <span class="en">&ndash; ${en}</span></li>`
  ).join("");
  render();
};
