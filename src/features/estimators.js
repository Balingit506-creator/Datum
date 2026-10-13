// Material estimators with animated visualisations.
// Each estimator declares its fields and a compute() that returns figures plus SVG markup.

import { syncInputs, readMetric, convertText, convertMarkup, toDisplay, unitLabel } from '../core/units.js';

const VIEW_W = 720;
const VIEW_H = 360;
const PAD = 28;
const fmt = (value, digits = 0) => Number(value).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

// Spread animation delays so any number of pieces finishes in about the same time.
const delay = (index, count, total = 1600) => `${Math.round((index / Math.max(count, 1)) * total)}ms`;

function svg(content, label, height = VIEW_H) {
  return `<svg viewBox="0 0 ${VIEW_W} ${height}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;
}

function fit(width, height, maxW = VIEW_W - PAD * 2, maxH = VIEW_H - PAD * 2 - 24) {
  const scale = Math.min(maxW / width, maxH / height);
  return { scale, ox: (VIEW_W - width * scale) / 2, oy: PAD + (maxH - height * scale) / 2 };
}

// ---------------------------------------------------------------------------
// CHB wall: running-bond courses with a centred opening cut out.
export function chbWallSvg({ wallWidth, wallHeight, blockLength, blockHeight, openingsArea }) {
  const bl = blockLength / 1000;
  const bh = blockHeight / 1000;
  const { scale, ox, oy } = fit(wallWidth, wallHeight);
  const W = wallWidth * scale;
  const H = wallHeight * scale;
  const courses = Math.ceil(wallHeight / bh);
  const perCourse = Math.ceil(wallWidth / bl) + 1;
  const total = Math.min(courses * perCourse, 2400);

  // Opening shaped like a window (1.2 : 1), centred and capped to the wall.
  let opening = null;
  if (openingsArea > 0 && openingsArea < wallWidth * wallHeight) {
    let ow = Math.sqrt(openingsArea * 1.2);
    let oh = openingsArea / ow;
    if (ow > wallWidth * 0.9) { ow = wallWidth * 0.9; oh = openingsArea / ow; }
    if (oh > wallHeight * 0.9) { oh = wallHeight * 0.9; ow = openingsArea / oh; }
    opening = { x: ox + (W - ow * scale) / 2, y: oy + (H - oh * scale) / 2, w: ow * scale, h: oh * scale };
  }

  let blocks = "";
  let index = 0;
  for (let row = 0; row < courses && index < total; row += 1) {
    const y = oy + H - (row + 1) * bh * scale;
    const shift = row % 2 ? (bl * scale) / 2 : 0;
    for (let col = -1; col < perCourse && index < total; col += 1) {
      const x = ox + col * bl * scale + shift;
      if (x + bl * scale <= ox || x >= ox + W) continue;
      blocks += `<rect class="chb-block" x="${x + 0.8}" y="${y + 0.8}" width="${bl * scale - 1.6}" height="${bh * scale - 1.6}" rx="1.5" style="animation-delay:${delay(index, courses * perCourse)}"/>`;
      index += 1;
    }
  }

  const mask = `<mask id="chb-mask"><rect x="${ox}" y="${oy}" width="${W}" height="${H}" fill="#fff"/>${opening ? `<rect x="${opening.x}" y="${opening.y}" width="${opening.w}" height="${opening.h}" fill="#000"/>` : ""}</mask>`;
  const content = `<defs>${mask}<clipPath id="chb-clip"><rect x="${ox}" y="${oy}" width="${W}" height="${H}"/></clipPath></defs>
    <rect class="viz-ground" x="${PAD}" y="${oy + H}" width="${VIEW_W - PAD * 2}" height="3"/>
    <g clip-path="url(#chb-clip)" mask="url(#chb-mask)">${blocks}</g>
    ${opening ? `<rect class="viz-opening" x="${opening.x}" y="${opening.y}" width="${opening.w}" height="${opening.h}"/><text class="viz-note" x="${opening.x + opening.w / 2}" y="${opening.y + opening.h / 2 + 4}" text-anchor="middle">opening ${fmt(openingsArea, 2)} m²</text>` : ""}
    <rect class="viz-outline" x="${ox}" y="${oy}" width="${W}" height="${H}"/>
    <text class="viz-dim" x="${ox + W / 2}" y="${oy + H + 22}" text-anchor="middle">${fmt(wallWidth, 2)} m</text>
    <text class="viz-dim" x="${ox - 10}" y="${oy + H / 2}" text-anchor="end" dominant-baseline="middle">${fmt(wallHeight, 2)} m</text>
    <text class="viz-caption" x="${VIEW_W - PAD}" y="${VIEW_H - 8}" text-anchor="end">${courses} COURSES · RUNNING BOND</text>`;
  return svg(content, "CHB wall laid in running bond");
}

// ---------------------------------------------------------------------------
export const estimators = {
  tile: {
    title: "Tile calculator",
    crumb: "TILE CALCULATOR",
    icon: "▦",
    eyebrow: "FLOOR & WALL TILING",
    heading: "Estimate tiles, boxes and grout.",
    description: "Enter the area and tile size to see the layout, the cut tiles at the edges, and how many boxes to buy.",
    unitTag: "TILES · m² · mm",
    notice: "<strong>Layout estimate only.</strong> Counts assume a straight-lay grid starting from one corner. Diagonal or herringbone layouts and heavy cutting need a larger allowance (10–15%). Check the shade and batch numbers on every box.",
    resultTitle: "Tiles to order",
    resultUnit: "tiles",
    fields: [
      { id: "length", label: "Area length", unit: "m", value: 4, min: 0.1, step: 0.01 },
      { id: "width", label: "Area width", unit: "m", value: 3, min: 0.1, step: 0.01 },
      { id: "tileW", label: "Tile width", unit: "mm", value: 600, min: 50, step: 1 },
      { id: "tileL", label: "Tile length", unit: "mm", value: 600, min: 50, step: 1 },
      { id: "joint", label: "Grout joint", unit: "mm", value: 3, min: 0, max: 20, step: 0.5 },
      { id: "thickness", label: "Tile thickness", unit: "mm", value: 9, min: 3, step: 0.5 },
      { id: "perBox", label: "Tiles per box", unit: "pcs", value: 4, min: 1, step: 1 },
      { id: "waste", label: "Cutting / breakage allowance", unit: "%", value: 10, min: 0, max: 50, step: 1 }
    ],
    compute({ length, width, tileW, tileL, joint, thickness, perBox, waste }) {
      const moduleW = (tileW + joint) / 1000;
      const moduleL = (tileL + joint) / 1000;
      const cols = Math.ceil(length / moduleW);
      const rows = Math.ceil(width / moduleL);
      const fullCols = Math.floor(length / moduleW);
      const fullRows = Math.floor(width / moduleL);
      const laid = cols * rows;
      const cut = laid - fullCols * fullRows;
      const order = Math.ceil(laid * (1 + waste / 100));
      const boxes = Math.ceil(order / perBox);
      const area = length * width;
      // Grout (kg) ≈ (A+B)/(A×B) × joint width × depth × 1.6 density factor × area
      const grout = ((tileW + tileL) / (tileW * tileL)) * joint * thickness * 1.6 * area;
      const adhesiveBags = Math.ceil(area / 5);

      const { scale, ox, oy } = fit(length, width);
      const drawCap = 1800;
      let tiles = "";
      let index = 0;
      for (let r = 0; r < rows && index < drawCap; r += 1) {
        for (let c = 0; c < cols && index < drawCap; c += 1) {
          const x = ox + c * moduleW * scale;
          const y = oy + r * moduleL * scale;
          const w = Math.min(moduleW, length - c * moduleW) * scale;
          const h = Math.min(moduleL, width - r * moduleL) * scale;
          const isCut = c >= fullCols || r >= fullRows;
          const gap = Math.max(0.6, (joint / 1000) * scale);
          tiles += `<rect class="tile ${isCut ? "is-cut" : ""}" x="${x + gap / 2}" y="${y + gap / 2}" width="${Math.max(0.5, w - gap)}" height="${Math.max(0.5, h - gap)}" rx="1" style="animation-delay:${delay(r + c, rows + cols, 1400)}"/>`;
          index += 1;
        }
      }
      const content = `<rect class="viz-floor" x="${ox}" y="${oy}" width="${length * scale}" height="${width * scale}"/>${tiles}
        <rect class="viz-outline" x="${ox}" y="${oy}" width="${length * scale}" height="${width * scale}"/>
        <text class="viz-dim" x="${ox + (length * scale) / 2}" y="${oy + width * scale + 20}" text-anchor="middle">${fmt(length, 2)} m · ${cols} tiles</text>
        <text class="viz-dim" x="${ox - 10}" y="${oy + (width * scale) / 2}" text-anchor="end" dominant-baseline="middle">${fmt(width, 2)} m</text>
        <g class="viz-legend" transform="translate(${PAD} ${VIEW_H - 14})"><rect class="tile" width="12" height="12" y="-10"/><text x="18">full tile</text><rect class="tile is-cut" x="90" width="12" height="12" y="-10"/><text x="108">cut tile</text></g>`;

      return {
        value: fmt(order),
        detail: `${fmt(area, 2)} m² covered by ${laid} tile positions (${cut} cut). With ${waste}% allowance, order ${order} tiles, or ${boxes} box${boxes === 1 ? "" : "es"} of ${perBox}.`,
        breakdown: [["Floor / wall area", `${fmt(area, 2)} m²`], ["Layout grid", `${cols} × ${rows}`], ["Cut tiles at edges", `${cut} pcs`], ["Boxes to buy", `${boxes} box${boxes === 1 ? "" : "es"}`], ["Grout (approx.)", `${fmt(grout, 1)} kg`], ["Tile adhesive (25 kg ≈ 5 m²)", `${adhesiveBags} bag${adhesiveBags === 1 ? "" : "s"}`]],
        visual: svg(content, "Tile layout"),
        caption: "Tiles are laid from the top-left corner. Highlighted tiles need cutting."
      };
    }
  },

  paint: {
    title: "Paint calculator",
    crumb: "PAINT CALCULATOR",
    icon: "◧",
    eyebrow: "WALL & CEILING PAINT",
    heading: "Know how much paint to buy.",
    description: "Enter the room size, openings and number of coats. Watch the walls get painted coat by coat.",
    unitTag: "LITRES · m²",
    notice: "<strong>Coverage varies.</strong> Typical emulsion covers about 8–12 m² per litre per coat on smooth, primed surfaces. Rough, porous or dark-to-light changes need more. Check the coverage on the product label.",
    resultTitle: "Paint needed",
    resultUnit: "litres",
    resultSymbol: "L",
    fields: [
      { id: "length", label: "Room length", unit: "m", value: 4, min: 0.5, step: 0.01 },
      { id: "width", label: "Room width", unit: "m", value: 3, min: 0.5, step: 0.01 },
      { id: "height", label: "Wall height", unit: "m", value: 2.7, min: 1, step: 0.01 },
      { id: "doors", label: "Doors (≈ 1.9 m² each)", unit: "pcs", value: 1, min: 0, step: 1 },
      { id: "windows", label: "Windows (≈ 1.4 m² each)", unit: "pcs", value: 2, min: 0, step: 1 },
      { id: "coats", label: "Number of coats", unit: "coats", value: 2, min: 1, max: 5, step: 1 },
      { id: "coverage", label: "Coverage per litre", unit: "m²/L", value: 10, min: 1, step: 0.5 },
      { id: "can", label: "Can size", unit: "L", value: 4, min: 0.5, step: 0.5 },
      { id: "ceiling", label: "Paint the ceiling too", type: "select", options: [["no", "No"], ["yes", "Yes"]], value: "no" }
    ],
    compute({ length, width, height, doors, windows, coats, coverage, can, ceiling }) {
      const wallArea = 2 * (length + width) * height;
      const openings = doors * 1.9 + windows * 1.4;
      const ceilingArea = ceiling === "yes" ? length * width : 0;
      const paintable = Math.max(0, wallArea - openings) + ceilingArea;
      const litres = (paintable * coats) / coverage;
      const cans = Math.ceil(litres / can);

      const walls = [length, width, length, width];
      const totalRun = walls.reduce((sum, w) => sum + w, 0) + (ceiling === "yes" ? length : 0);
      const { scale, ox, oy } = fit(totalRun + 0.4 * walls.length, height, VIEW_W - PAD * 2, VIEW_H - PAD * 2 - 40);
      let x = ox;
      let shapes = "";
      let openingsLeft = { doors, windows };
      const wallBoxes = [];
      walls.forEach((w, i) => { wallBoxes.push({ x, w: w * scale, label: `Wall ${i + 1} · ${fmt(w, 2)} m` }); x += (w + 0.4) * scale; });
      if (ceiling === "yes") wallBoxes.push({ x, w: length * scale, label: "Ceiling", ceilingBox: true });

      wallBoxes.forEach((box, i) => {
        const h = box.ceilingBox ? (width * scale) : height * scale;
        const y = oy + height * scale - h;
        shapes += `<rect class="viz-wall" x="${box.x}" y="${y}" width="${box.w}" height="${h}"/>`;
        for (let c = 0; c < coats; c += 1) {
          shapes += `<rect class="paint-coat" x="${box.x}" y="${y}" width="${box.w}" height="${h}" style="animation-delay:${(c * wallBoxes.length + i) * 160}ms;opacity:${0.35 + (0.65 * (c + 1)) / coats}"/>`;
        }
        if (!box.ceilingBox) {
          if (openingsLeft.doors > 0 && box.w > 1.1 * scale) {
            shapes += `<rect class="viz-opening" x="${box.x + 0.25 * scale}" y="${oy + (height - 2.1) * scale}" width="${0.9 * scale}" height="${2.1 * scale}"/>`;
            openingsLeft.doors -= 1;
          }
          if (openingsLeft.windows > 0 && box.w > 2.6 * scale) {
            shapes += `<rect class="viz-opening" x="${box.x + box.w - 1.5 * scale}" y="${oy + (height - 2.1) * scale}" width="${1.2 * scale}" height="${1.2 * scale}"/>`;
            openingsLeft.windows -= 1;
          }
        }
        shapes += `<text class="viz-dim" x="${box.x + box.w / 2}" y="${oy + height * scale + 18}" text-anchor="middle">${box.label}</text>`;
      });
      shapes += `<g class="paint-roller" style="--travel:${x - ox}px;animation-duration:${Math.max(1.2, coats * wallBoxes.length * 0.16 + 0.8)}s"><rect x="${ox - 6}" y="${oy - 18}" width="34" height="12" rx="6"/><line x1="${ox + 11}" y1="${oy - 6}" x2="${ox + 11}" y2="${oy + 10}"/></g>`;
      shapes += `<text class="viz-caption" x="${VIEW_W - PAD}" y="${VIEW_H - 8}" text-anchor="end">UNFOLDED ROOM · ${coats} COAT${coats > 1 ? "S" : ""}</text>`;

      return {
        value: fmt(litres, 1),
        detail: `${fmt(paintable, 2)} m² to paint × ${coats} coat${coats > 1 ? "s" : ""} at ${coverage} m²/L ≈ ${fmt(litres, 1)} L, or ${cans} can${cans === 1 ? "" : "s"} of ${can} L.`,
        breakdown: [["Gross wall area", `${fmt(wallArea, 2)} m²`], ["Less openings", `−${fmt(openings, 2)} m²`], ["Ceiling", `${fmt(ceilingArea, 2)} m²`], ["Paintable area", `${fmt(paintable, 2)} m²`], ["Cans to buy", `${cans} × ${can} L`], ["Primer (1 coat, approx.)", `${fmt(paintable / coverage, 1)} L`]],
        visual: svg(shapes, "Room walls being painted"),
        caption: "Each wall is shown flat. Darker shading means more coats."
      };
    }
  },

  concrete: {
    title: "Concrete calculator",
    crumb: "CONCRETE CALCULATOR",
    icon: "◩",
    eyebrow: "CONCRETE · CEMENT · SAND · GRAVEL",
    heading: "Estimate concrete and materials.",
    description: "Size a slab, footing or column. See the pour fill up and how many bags of cement it takes.",
    unitTag: "m³ · 40 kg BAGS",
    notice: "<strong>Material estimate only.</strong> Uses common Philippine mix factors per m³ with 40 kg cement bags. The mix class and final quantities must follow the structural engineer's specification. Reinforcement and formwork are not included.",
    resultTitle: "Concrete volume",
    resultUnit: "m³",
    resultSymbol: "m³",
    fields: [
      { id: "shape", label: "Element", type: "select", options: [["slab", "Slab / pavement"], ["footing", "Footing"], ["column", "Column / beam"]], value: "slab" },
      { id: "length", label: "Length", unit: "m", value: 4, min: 0.05, step: 0.01 },
      { id: "width", label: "Width", unit: "m", value: 3, min: 0.05, step: 0.01 },
      { id: "depth", label: "Thickness / height", unit: "m", value: 0.1, min: 0.01, step: 0.01 },
      { id: "count", label: "Quantity", unit: "pcs", value: 1, min: 1, step: 1 },
      { id: "mix", label: "Mix class", type: "select", options: [["AA", "Class AA · 1:1.5:3"], ["A", "Class A · 1:2:4"], ["B", "Class B · 1:2.5:5"], ["C", "Class C · 1:3:6"]], value: "A" },
      { id: "waste", label: "Waste allowance", unit: "%", value: 5, min: 0, max: 30, step: 1 }
    ],
    compute({ shape, length, width, depth, count, mix, waste }) {
      const factors = { AA: [12, 0.5, 1.0], A: [9, 0.5, 1.0], B: [7.5, 0.5, 1.0], C: [6, 0.5, 1.0] }[mix];
      const volume = length * width * depth * count;
      const withWaste = volume * (1 + waste / 100);
      const cement = Math.ceil(withWaste * factors[0]);
      const sand = withWaste * factors[1];
      const gravel = withWaste * factors[2];

      // Isometric prism; height exaggerated for thin slabs so the pour is visible.
      const iso = (x, y, z) => [(x - y) * Math.cos(Math.PI / 6), (x + y) * Math.sin(Math.PI / 6) - z];
      const vis = Math.max(depth, Math.max(length, width) * 0.12);
      const pts = [[0, 0, 0], [length, 0, 0], [length, width, 0], [0, width, 0], [0, 0, vis], [length, 0, vis], [length, width, vis], [0, width, vis]].map(([a, b, c]) => iso(a, b, c));
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      const bw = Math.max(...xs) - Math.min(...xs);
      const bh = Math.max(...ys) - Math.min(...ys);
      const s = Math.min(380 / bw, (VIEW_H - 90) / bh);
      const tx = 40 - Math.min(...xs) * s;
      const ty = 40 - Math.min(...ys) * s;
      const P = (i) => `${pts[i][0] * s + tx},${pts[i][1] * s + ty}`;
      const poly = (ids, cls) => `<polygon class="${cls}" points="${ids.map(P).join(" ")}"/>`;
      const form = poly([0, 1, 5, 4], "form-face") + poly([1, 2, 6, 5], "form-face") + poly([4, 5, 6, 7], "form-top");
      const pour = `<g class="pour">${poly([1, 2, 6, 5], "pour-side")}${poly([0, 1, 5, 4], "pour-front")}${poly([4, 5, 6, 7], "pour-top")}</g>`;
      const bagsShown = Math.min(cement, 48);
      let bags = "";
      for (let i = 0; i < bagsShown; i += 1) {
        const bx = 470 + (i % 8) * 28;
        const by = 60 + Math.floor(i / 8) * 34;
        bags += `<g class="bag" style="animation-delay:${600 + i * 30}ms"><rect x="${bx}" y="${by}" width="22" height="28" rx="4"/><line x1="${bx + 4}" y1="${by + 9}" x2="${bx + 18}" y2="${by + 9}"/></g>`;
      }
      const content = `${pour}<g class="formwork">${form}</g>
        <text class="viz-dim" x="${tx + ((pts[0][0] + pts[1][0]) / 2) * s}" y="${ty + ((pts[0][1] + pts[1][1]) / 2) * s + 22}" text-anchor="middle">${fmt(length, 2)} m</text>
        <text class="viz-dim" x="${tx + ((pts[1][0] + pts[2][0]) / 2) * s + 12}" y="${ty + ((pts[1][1] + pts[2][1]) / 2) * s + 22}">${fmt(width, 2)} m</text>
        <text class="viz-note" x="40" y="${VIEW_H - 18}">${shape} × ${count} · ${fmt(depth * 1000)} mm ${shape === "column" ? "high" : "thick"}${vis > depth ? " (height exaggerated)" : ""}</text>
        <text class="viz-dim" x="470" y="40">${cement} bags cement${cement > bagsShown ? ` (showing ${bagsShown})` : ""}</text>
        ${bags}
        <text class="viz-caption" x="${VIEW_W - PAD}" y="${VIEW_H - 8}" text-anchor="end">CLASS ${mix} MIX</text>`;

      return {
        value: fmt(withWaste, 3),
        detail: `${fmt(volume, 3)} m³ net, ${fmt(withWaste, 3)} m³ with ${waste}% waste. Class ${mix}: ${cement} bags cement, ${fmt(sand, 2)} m³ sand, ${fmt(gravel, 2)} m³ gravel.`,
        breakdown: [["Net volume", `${fmt(volume, 3)} m³`], ["Cement (40 kg)", `${cement} bags`], ["Sand", `${fmt(sand, 2)} m³`], ["Gravel (¾″)", `${fmt(gravel, 2)} m³`], ["Water (≈ 0.5 w/c)", `${fmt(cement * 20)} L`], ["Ready-mix trucks (≈ 5 m³)", `${Math.ceil(withWaste / 5)}`]],
        visual: svg(content, "Concrete pour and cement bags"),
        caption: "The formwork fills with concrete. Each bag icon is one 40 kg bag of cement."
      };
    }
  }
};

// ---------------------------------------------------------------------------
// Generic estimator page: form, result, and an animated visual card.
export function createEstimatorView(container, onToast) {
  const values = {};
  let current = null;
  let timer;

  function fieldMarkup(field, value) {
    if (field.type === "select") {
      return `<div class="form-group"><label class="field-label" for="est-${field.id}">${field.label}</label><select class="select-input" id="est-${field.id}" data-field="${field.id}">${field.options.map(([v, l]) => `<option value="${v}"${v === value ? " selected" : ""}>${l}</option>`).join("")}</select></div>`;
    }
    return `<div class="form-group"><label class="field-label" for="est-${field.id}">${field.label}</label><div class="input-wrap"><input id="est-${field.id}" data-field="${field.id}" type="number" min="${field.min ?? 0}"${field.max !== undefined ? ` max="${field.max}"` : ""} step="${field.step ?? 1}" value="${value}" required${["m", "mm", "m²"].includes(field.unit) ? ` data-unit="${field.unit}"` : ""}><span>${field.unit}</span></div></div>`;
  }

  function render(key) {
    const est = estimators[key];
    current = key;
    values[key] ??= Object.fromEntries(est.fields.map((f) => [f.id, f.value]));
    container.innerHTML = `
      <div class="standards-heading"><div><p class="eyebrow">${est.eyebrow}</p><h1>${est.heading}</h1><p class="subheading">${est.description}</p></div><span class="standards-unit">${est.unitTag}</span></div>
      <div class="standards-notice" role="note"><span class="notice-mark" aria-hidden="true">!</span><p>${est.notice}</p></div>
      <div class="chb-layout">
        <form class="chb-form standard-card" data-est-form novalidate><div class="standard-card-heading"><span class="standard-icon" aria-hidden="true">${est.icon}</span><div><p class="eyebrow">INPUTS</p><h2>Enter dimensions</h2></div></div>
          <div class="chb-input-grid">${est.fields.map((f) => fieldMarkup(f, values[key][f.id])).join("")}</div>
          <button class="primary-button chb-calculate-button" type="submit">Calculate &amp; animate <span aria-hidden="true">↗</span></button>
        </form>
        <section class="standard-card chb-result-card" aria-live="polite"><div class="standard-card-heading"><span class="standard-icon" aria-hidden="true">#</span><div><p class="eyebrow">ESTIMATE</p><h2>${est.resultTitle}</h2></div></div>
          <p class="chb-result-number"><strong data-est-value>—</strong><span data-est-unit>${est.resultUnit}</span></p><p class="chb-result-detail" data-est-detail></p><dl class="chb-breakdown" data-est-breakdown></dl></section>
      </div>
      <section class="standard-card estimator-visual"><div class="visual-head"><div><p class="eyebrow">VISUALISATION</p><h2>See the estimate</h2></div><button type="button" class="ghost-button" data-est-replay>▶ Replay</button></div><div class="visual-stage" data-est-visual></div><p class="standard-note" data-est-caption></p></section>`;
    syncInputs(container);
    update(true);
  }

  function update(animate) {
    const est = estimators[current];
    const form = container.querySelector("[data-est-form]");
    const invalid = [...form.querySelectorAll("input")].some((input) => !input.checkValidity() || input.value === "");
    if (invalid) {
      container.querySelector("[data-est-value]").textContent = "—";
      container.querySelector("[data-est-detail]").textContent = "Check the highlighted fields: values must be positive and within range.";
      return;
    }
    const result = est.compute(values[current]);
    const valueEl = container.querySelector("[data-est-value]");
    const symbol = est.resultSymbol;
    const converted = symbol && unitLabel(symbol) !== symbol;
    valueEl.textContent = converted ? toDisplay(Number(result.value.replace(/,/g, "")), symbol).toFixed(2) : result.value;
    container.querySelector("[data-est-unit]").textContent = converted ? unitLabel(symbol) : est.resultUnit;
    valueEl.classList.remove("bump");
    void valueEl.offsetWidth;
    valueEl.classList.add("bump");
    container.querySelector("[data-est-detail]").textContent = convertText(result.detail);
    container.querySelector("[data-est-breakdown]").innerHTML = result.breakdown.map(([label, value]) => `<div><dt>${label}</dt><dd>${convertText(value)}</dd></div>`).join("");
    container.querySelector("[data-est-caption]").textContent = result.caption;
    if (animate) container.querySelector("[data-est-visual]").innerHTML = convertMarkup(result.visual);
  }

  container.addEventListener("input", (event) => {
    const id = event.target.dataset.field;
    if (!id) return;
    const field = estimators[current].fields.find((f) => f.id === id);
    values[current][id] = field.type === "select" ? event.target.value : readMetric(event.target);
    update(false);
    clearTimeout(timer);
    timer = setTimeout(() => update(true), 450);
  });
  container.addEventListener("submit", (event) => {
    event.preventDefault();
    update(true);
    onToast?.("Estimate updated.");
  });
  container.addEventListener("click", (event) => {
    if (event.target.closest("[data-est-replay]")) update(true);
  });

  return {
    render,
    // Redraw the open estimator in the current unit system.
    refresh() {
      if (current && !container.hidden) render(current);
    }
  };
}
