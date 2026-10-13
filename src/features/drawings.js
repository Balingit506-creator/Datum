// Live dimensioned drawings for the architectural standards page.
// Each drawing defines its controls and a render() that returns SVG markup and code checks.

import { roomStandards, requiredWindowArea } from '../config/room-standards.js';

import { VIEW_W, VIEW_H, PAD, fmt, mm, m, dim, svgFrame, check } from './svg-helpers.js';
import { moreDrawings } from './drawings-more.js';
import { convertText, convertMarkup, formatValue, unitLabel } from '../core/units.js';
const windowRooms = roomStandards.filter((room) => room.glazing);

const doorTypes = roomStandards.map((room) => ({
  id: room.id,
  name: room.name,
  width: room.door.width,
  height: room.door.height,
  leaves: room.door.leaves,
  minWidth: room.door.minWidth,
  minHeight: room.door.minHeight,
  typical: room.door.range,
  widthRule: room.exit ? 'NBC §1207 exit door' : 'planning practice',
  heightRule: room.exit ? 'NBC §1207' : 'planning practice',
  accessible: Boolean(room.accessible),
  exit: Boolean(room.exit)
}));

const wallOptions = [["top", "Top wall"], ["right", "Right wall"], ["bottom", "Bottom wall"], ["left", "Left wall"]];

// Inner face of each wall: start point, direction along the wall (t), inward normal (n), length in metres.
function roomWalls(ix, iy, iw, ih, length, width) {
  return {
    top: { sx: ix, sy: iy, tx: 1, ty: 0, nx: 0, ny: 1, len: length },
    right: { sx: ix + iw, sy: iy, tx: 0, ty: 1, nx: -1, ny: 0, len: width },
    bottom: { sx: ix, sy: iy + ih, tx: 1, ty: 0, nx: 0, ny: -1, len: length },
    left: { sx: ix, sy: iy, tx: 0, ty: 1, nx: 1, ny: 0, len: width }
  };
}

const pt = (x, y) => `${x},${y}`;

// Door or window cut into a wall, with an invisible wider hit area for dragging.
function openingSvg({ wall, len, pos }, scale, w, kind, overlap, hinge = "start") {
  const { sx, sy, tx, ty, nx, ny } = wall;
  const ax = sx + tx * pos * scale;
  const ay = sy + ty * pos * scale;
  const bx = sx + tx * (pos + len) * scale;
  const by = sy + ty * (pos + len) * scale;
  const ox = -nx * w;
  const oy = -ny * w;
  const gap = `<polygon class="opening" points="${pt(ax - nx, ay - ny)} ${pt(bx - nx, by - ny)} ${pt(bx + ox + nx * -1, by + oy - ny)} ${pt(ax + ox - nx, ay + oy - ny)}"/>`;
  const hit = `<polygon class="drag-hit" data-drag="${kind}" points="${pt(ax + nx * 14, ay + ny * 14)} ${pt(bx + nx * 14, by + ny * 14)} ${pt(bx + ox * 1.8, by + oy * 1.8)} ${pt(ax + ox * 1.8, ay + oy * 1.8)}"><title>Drag to move the ${kind}</title></polygon>`;
  const grip = `<circle class="drag-grip" cx="${(ax + bx) / 2 + ox / 2}" cy="${(ay + by) / 2 + oy / 2}" r="5" pointer-events="none"/>`;

  if (kind === "window") {
    return `<g class="${overlap ? "is-bad" : ""}">${gap}<line class="glass" x1="${ax + ox / 2}" y1="${ay + oy / 2}" x2="${bx + ox / 2}" y2="${by + oy / 2}"/>${grip}${hit}</g>`;
  }
  const [hx, hy, ex, ey] = hinge === "end" ? [bx, by, ax, ay] : [ax, ay, bx, by];
  const r = len * scale;
  const px = hx + nx * r;
  const py = hy + ny * r;
  // Sweep direction follows the turn from the open leaf back to the far jamb.
  const sweep = (px - hx) * (ey - hy) - (py - hy) * (ex - hx) > 0 ? 1 : 0;
  return `<g class="${overlap ? "is-bad" : ""}">${gap}
    <line class="door-leaf" x1="${hx}" y1="${hy}" x2="${px}" y2="${py}"/>
    <path class="swing" d="M ${px} ${py} A ${r} ${r} 0 0 ${sweep} ${ex} ${ey}"/>${grip}${hit}</g>`;
}

// Size dimension outside the wall, plus its distance from the wall's start corner inside the room.
function openingDims({ wall, len, pos }, scale, w, label) {
  const { sx, sy, tx, ty, nx, ny } = wall;
  const ax = sx + tx * pos * scale;
  const ay = sy + ty * pos * scale;
  const bx = sx + tx * (pos + len) * scale;
  const by = sy + ty * (pos + len) * scale;
  // dim() offsets toward the left-hand normal of its direction; flip it to point out of the room.
  const outward = -ty * nx + tx * ny > 0 ? -1 : 1;
  const size = dim(ax, ay, bx, by, label, outward * (w + 14));
  const corner = pos > 0.12 ? dim(sx, sy, ax, ay, m(pos), -outward * 16) : "";
  return size + corner;
}

export const drawings = {
  stair: {
    label: "Stair section",
    icon: "∠",
    controls: [
      { id: "use", label: "Stair use", type: "select", options: [["private", "Private (under 10 occupants)"], ["small", "Occupant load 50 or less"], ["large", "Occupant load over 50"]], value: "small" },
      { id: "height", label: "Floor-to-floor height", min: 2400, max: 4500, step: 50, value: 3000, unit: "mm" },
      { id: "risers", label: "Number of risers", min: 10, max: 26, step: 1, value: 17, unit: "" },
      { id: "tread", label: "Tread / going", min: 200, max: 350, step: 5, value: 260, unit: "mm" },
      { id: "width", label: "Clear stair width", min: 600, max: 1800, step: 10, value: 900, unit: "mm" }
    ],
    render({ use, height, risers, tread, width }) {
      const riser = height / risers;
      const run = (risers - 1) * tread;
      const landing = 900;
      const scale = Math.min((VIEW_W - PAD * 2) / (run + landing * 2), (VIEW_H - PAD * 2 - 20) / (height + 1000));
      const x0 = PAD + landing * scale;
      const y0 = VIEW_H - PAD;
      const r = riser * scale;
      const t = tread * scale;

      let path = `M ${PAD} ${y0} L ${x0} ${y0}`;
      let x = x0;
      let y = y0;
      const nosings = [];
      for (let i = 0; i < risers; i += 1) {
        y -= r;
        path += ` L ${x} ${y}`;
        nosings.push([x, y]);
        if (i < risers - 1) {
          x += t;
          path += ` L ${x} ${y}`;
        }
      }
      const topX = x;
      const topY = y;
      path += ` L ${VIEW_W - PAD} ${topY}`;
      const solid = `${path} L ${VIEW_W - PAD} ${topY + 14} L ${topX + 10} ${topY + 14} L ${x0 + 10} ${y0} Z`;

      const rail = 900 * scale;
      const [fx, fy] = nosings[0];
      const [lx, ly] = nosings[nosings.length - 1];
      const mid = Math.floor(risers / 2);
      const [mx, my] = nosings[mid];

      const minWidth = { private: 750, small: 900, large: 1100 }[use];
      const comfort = 2 * riser + tread;
      const content = `
        <line class="ground" x1="${PAD - 20}" y1="${y0}" x2="${VIEW_W - PAD + 20}" y2="${y0}"/>
        <path class="solid" d="${solid}"/>
        <path class="outline" d="${path}"/>
        <line class="rail" x1="${fx}" y1="${fy - rail}" x2="${lx}" y2="${ly - rail}"/>
        <text class="note" x="${(fx + lx) / 2}" y="${(fy + ly) / 2 - rail - 10}" text-anchor="middle">handrail 900 mm above nosing</text>
        ${dim(x0, y0, x0, topY, `${m(height / 1000)} rise`, -34)}
        ${dim(x0, y0, topX, y0, `${m(run / 1000)} run · ${risers - 1} treads`, -28)}
        ${dim(mx, my, mx, my - r, `R ${mm(riser)}`, -22, riser > 200 ? "is-bad" : "is-good")}
        ${dim(mx, my - r, mx + t, my - r, `G ${mm(tread)}`, -18, tread < 250 ? "is-bad" : "is-good")}`;

      return {
        svg: svgFrame(content, `STAIR SECTION · 1:${Math.round(1 / scale)}`),
        summary: `${risers} risers at ${fmt(riser, 1)} mm, ${risers - 1} treads at ${tread} mm`,
        checks: [
          check("Riser height", mm(riser), riser <= 200, "≤ 200 mm · NBC §1207"),
          check("Tread / going", mm(tread), tread >= 250, "≥ 250 mm · NBC §1207"),
          check("Comfort rule 2R + G", mm(comfort), comfort >= 600 && comfort <= 650, "600–650 mm · planning"),
          check("Clear width", mm(width), width >= minWidth, `≥ ${minWidth} mm for this use · NBC §1207`)
        ]
      };
    }
  },

  ramp: {
    label: "Accessible ramp",
    icon: "◢",
    controls: [
      { id: "rise", label: "Total rise", min: 100, max: 1800, step: 10, value: 600, unit: "mm" },
      { id: "gradient", label: "Gradient 1 :", min: 6, max: 20, step: 1, value: 12, unit: "" },
      { id: "width", label: "Clear ramp width", min: 800, max: 2400, step: 10, value: 1200, unit: "mm" }
    ],
    render({ rise, gradient, width }) {
      const run = rise * gradient;
      const maxFlight = 6000;
      const flights = Math.max(1, Math.ceil(run / maxFlight));
      const flightRun = run / flights;
      const flightRise = rise / flights;
      const landing = 1500;
      const totalX = landing * (flights + 1) + run;
      const sx = (VIEW_W - PAD * 2) / totalX;
      const exaggeration = Math.max(1, Math.min(6, Math.floor(((VIEW_H - PAD * 2 - 40) * 0.6) / (rise * sx))));
      const sy = sx * exaggeration;
      const y0 = VIEW_H - PAD - 10;

      let x = PAD;
      let y = y0;
      let path = `M ${x} ${y}`;
      const segments = [];
      x += landing * sx;
      path += ` L ${x} ${y}`;
      for (let i = 0; i < flights; i += 1) {
        const startX = x;
        const startY = y;
        x += flightRun * sx;
        y -= flightRise * sy;
        path += ` L ${x} ${y}`;
        segments.push([startX, startY, x, y]);
        const landingStart = x;
        x += landing * sx;
        path += ` L ${x} ${y}`;
        segments.push(["landing", landingStart, x, y]);
      }
      const solid = `${path} L ${x} ${y0} Z`;
      const [fsx, fsy, fex, fey] = segments[0];
      const lastLanding = segments[segments.length - 1];

      const content = `
        <line class="ground" x1="${PAD - 20}" y1="${y0}" x2="${VIEW_W - PAD + 20}" y2="${y0}"/>
        <path class="solid" d="${solid}"/>
        <path class="outline" d="${path}"/>
        ${segments.filter((s) => s[0] === "landing").map(([, a, b, ly]) => `<rect class="landing" x="${a}" y="${ly - 3}" width="${b - a}" height="6"/>`).join("")}
        <line class="rail" x1="${fsx}" y1="${fsy - 30}" x2="${fex}" y2="${fey - 30}"/>
        ${dim(PAD + landing * sx, y0, x - landing * sx, y0, `${m(run / 1000)} total run`, -26)}
        ${dim(fsx, fsy, fex, fsy, `${m(flightRun / 1000)} flight`, 24, flightRun > maxFlight ? "is-bad" : "is-good")}
        ${dim(lastLanding[2], y0, lastLanding[2], lastLanding[3], `${mm(rise)}`, -30)}
        ${dim(lastLanding[1], lastLanding[3], lastLanding[2], lastLanding[3], "1.50 m landing", 22)}
        ${exaggeration > 1 ? `<text class="note" x="${PAD}" y="${PAD - 18}">vertical scale ×${exaggeration} for legibility</text>` : ""}`;

      return {
        svg: svgFrame(content, "RAMP ELEVATION · NOT TO SCALE VERTICALLY"),
        summary: `${flights} flight${flights > 1 ? "s" : ""} of ${m(flightRun / 1000)} with ${flights + 1} landings`,
        checks: [
          check("Gradient", `1:${gradient}`, gradient >= 12, "1:12 or gentler · BP 344"),
          check("Clear width", mm(width), width >= 1200, "≥ 1,200 mm · BP 344"),
          check("Longest flight", m(flightRun / 1000), flightRun <= maxFlight, "≤ 6.00 m between landings · BP 344"),
          check("Handrails", rise > 0 ? "Both sides" : "—", true, "0.70 m and 0.90 m high · BP 344")
        ]
      };
    }
  },

  room: {
    label: "Room plan",
    icon: "▭",
    hint: "Drag the door or window along any wall to move it.",
    controls: [
      { id: "type", label: "Room type", type: "select", options: roomStandards.map((room) => [room.id, room.name]), value: "bedroom" },
      { id: "length", label: "Length", min: 0.8, max: 9, step: 0.05, value: 3.6, unit: "m" },
      { id: "width", label: "Width", min: 0.8, max: 7, step: 0.05, value: 3, unit: "m" },
      { id: "ceiling", label: "Ceiling height", min: 2, max: 4, step: 0.05, value: 2.7, unit: "m" },
      { id: "window", label: "Window width (1.2 m tall)", min: 0.3, max: 4, step: 0.05, value: 1.2, unit: "m" },
      { id: "windowWall", label: "Window wall", type: "select", options: wallOptions, value: "top" },
      { id: "windowPos", label: "Window from corner", min: 0, max: 9, step: 0.05, value: 1.2, unit: "m" },
      { id: "doorWall", label: "Door wall", type: "select", options: wallOptions, value: "bottom" },
      { id: "doorPos", label: "Door from corner", min: 0, max: 9, step: 0.05, value: 0.15, unit: "m" },
      { id: "hinge", label: "Door hinge", type: "select", options: [["start", "Hinge near corner"], ["end", "Hinge far side"]], value: "start" }
    ],
    render(values) {
      const { type, length, width, ceiling, window: windowWidth, windowWall, doorWall, hinge } = values;
      const room = roomStandards.find((item) => item.id === type);
      const rules = {
        area: room.room.codeArea ?? room.room.minArea,
        least: room.room.codeLeast ?? room.room.least,
        ratio: room.window ?? 0.1,
        minWindow: room.window ? 0.24 : 1,
        label: room.room.label,
        source: room.room.codeArea ? 'NBC Rule VIII §806' : 'planning practice'
      };
      const area = length * width;
      const wall = 0.15;
      const scale = Math.min((VIEW_W - PAD * 2 - 40) / (length + wall * 2), (VIEW_H - PAD * 2 - 30) / (width + wall * 2));
      const ox = (VIEW_W - (length + wall * 2) * scale) / 2;
      const oy = (VIEW_H - (width + wall * 2) * scale) / 2 + 6;
      const w = wall * scale;
      const ix = ox + w;
      const iy = oy + w;
      const iw = length * scale;
      const ih = width * scale;
      const walls = roomWalls(ix, iy, iw, ih, length, width);

      // Openings are clamped so they always stay on their wall.
      const place = (wallId, size, pos) => {
        const span = walls[wallId].len;
        const len = Math.min(size, span - 0.1);
        return { wall: walls[wallId], len, pos: Math.max(0.05, Math.min(pos, span - len - 0.05)) };
      };
      const win = place(windowWall, windowWidth, values.windowPos);
      const door = place(doorWall, room.door.width / 1000, values.doorPos);
      const windowArea = win.len * 1.2;
      const overlap = windowWall === doorWall && win.pos < door.pos + door.len && door.pos < win.pos + win.len;

      const content = `
        <rect class="wall" x="${ox}" y="${oy}" width="${iw + w * 2}" height="${ih + w * 2}"/>
        <rect class="room-floor" x="${ix}" y="${iy}" width="${iw}" height="${ih}"/>
        ${openingSvg(win, scale, w, "window", overlap)}
        ${openingSvg(door, scale, w, "door", overlap, hinge)}
        <text class="room-label" x="${ix + iw / 2}" y="${iy + ih / 2 - 6}" text-anchor="middle">${rules.label.toUpperCase()}</text>
        <text class="room-area" x="${ix + iw / 2}" y="${iy + ih / 2 + 22}" text-anchor="middle">${fmt(area, 2)} m²</text>
        <text class="note" x="${ix + iw / 2}" y="${iy + ih / 2 + 42}" text-anchor="middle">clg. ${m(ceiling)}</text>
        ${dim(ix, iy + ih + w, ix + iw, iy + ih + w, m(length), doorWall === "bottom" || windowWall === "bottom" ? 44 : 20)}
        ${dim(ix + iw + w, iy, ix + iw + w, iy + ih, m(width), doorWall === "right" || windowWall === "right" ? -44 : -20)}
        ${openingDims(win, scale, w, `win. ${m(win.len)}`)}
        ${openingDims(door, scale, w, `door ${m(door.len)}`)}`;

      const ceilingMin = room.window ? 2.1 : 2.4;
      const checks = [
        check("Floor area", `${fmt(area, 2)} m²`, area >= rules.area, `≥ ${fmt(rules.area, 2)} m² · ${rules.source}`),
        check("Least dimension", m(Math.min(length, width)), Math.min(length, width) >= rules.least, `≥ ${m(rules.least)} · ${rules.source}`),
        check("Window area", `${fmt(windowArea, 2)} m²`, windowArea >= Math.max(area * rules.ratio, rules.minWindow), `≥ ${room.window ? "1/20" : "10%"} of floor, ${fmt(rules.minWindow, 2)} m² min. · §808`),
        check("Ceiling height", m(ceiling), ceiling >= ceilingMin, `≥ ${m(ceilingMin)} · NBC Rule VIII §805`)
      ];
      if (overlap) checks.push(check("Door and window", "Overlap", false, "Move one of them along the wall"));
      return {
        svg: svgFrame(content, "FLOOR PLAN · DRAG DOOR OR WINDOW"),
        summary: `Recommended ${room.room.typical} · ${fmt(area, 2)} m² floor area, ${fmt(windowArea, 2)} m² window, ${fmt(area * ceiling, 1)} m³ volume`,
        checks,
        meta: { walls, scale, sizes: { window: win.len, door: door.len } }
      };
    },
    // Dragging snaps the opening to the nearest wall and slides it along that wall.
    drag(target, point, values, meta) {
      let best = null;
      Object.entries(meta.walls).forEach(([id, wall]) => {
        const along = (point.x - wall.sx) * wall.tx + (point.y - wall.sy) * wall.ty;
        const clamped = Math.max(0, Math.min(along, wall.len * meta.scale));
        const px = wall.sx + wall.tx * clamped;
        const py = wall.sy + wall.ty * clamped;
        const distance = Math.hypot(point.x - px, point.y - py);
        if (!best || distance < best.distance) best = { id, distance, along: clamped / meta.scale, wall };
      });
      const size = Math.min(meta.sizes[target], best.wall.len - 0.1);
      const pos = Math.max(0.05, Math.min(best.along - size / 2, best.wall.len - size - 0.05));
      return { [`${target}Wall`]: best.id, [`${target}Pos`]: Math.round(pos * 20) / 20 };
    }
  },

  door: {
    label: "Door elevation",
    icon: "▯",
    controls: [
      { id: "type", label: "Door type", type: "select", options: doorTypes.map((d) => [d.id, d.name]), value: "bedroom" },
      { id: "width", label: "Door width (nominal)", min: 600, max: 3600, step: 10, value: 900, unit: "mm" },
      { id: "height", label: "Door height", min: 1800, max: 3000, step: 10, value: 2100, unit: "mm" },
      { id: "leaves", label: "Number of leaves", min: 1, max: 2, step: 1, value: 1, unit: "" }
    ],
    // Picking a door type loads its typical size.
    presets(id, values) {
      if (id !== "type") return null;
      const door = doorTypes.find((d) => d.id === values.type);
      return { width: door.width, height: door.height, leaves: door.leaves };
    },
    render({ type, width, height, leaves }) {
      const door = doorTypes.find((d) => d.id === type);
      const frame = 50;
      const totalW = width + frame * 2;
      const totalH = height + frame;
      const person = 1700;
      const scale = Math.min((VIEW_W - PAD * 2 - 160) / (totalW + 700), (VIEW_H - PAD * 2 - 20) / Math.max(totalH, person));
      const floor = VIEW_H - PAD;
      const fx = PAD + 70;
      const fw = totalW * scale;
      const fh = totalH * scale;
      const lx = fx + frame * scale;
      const lw = width * scale;
      const lh = height * scale;
      const leafW = lw / leaves;
      const clear = width - (leaves === 1 ? 40 : 80);
      const leafSize = width / leaves;
      const area = (width * height) / 1e6;

      let leafMarkup = "";
      for (let i = 0; i < leaves; i += 1) {
        const x = lx + i * leafW;
        const hinge = leaves === 2 ? (i === 0 ? x : x + leafW) : x;
        const free = hinge === x ? x + leafW : x;
        leafMarkup += `<rect class="door-panel" x="${x + 1}" y="${floor - lh}" width="${leafW - 2}" height="${lh}"/>
          <rect class="door-inset" x="${x + leafW * 0.18}" y="${floor - lh * 0.88}" width="${leafW * 0.64}" height="${lh * 0.32}" rx="2"/>
          <rect class="door-inset" x="${x + leafW * 0.18}" y="${floor - lh * 0.48}" width="${leafW * 0.64}" height="${lh * 0.38}" rx="2"/>
          <polyline class="swing" points="${free},${floor - lh} ${hinge},${floor - lh / 2} ${free},${floor}"/>
          <circle class="door-handle" cx="${free + (free > hinge ? -10 : 10)}" cy="${floor - 1000 * scale}" r="3.5"/>`;
      }
      const px = fx + fw + 70;
      const ph = person * scale;
      const head = ph * 0.075;
      const personMarkup = `<g class="person"><circle cx="${px}" cy="${floor - ph + head}" r="${head}"/><path d="M ${px} ${floor - ph + head * 2} L ${px} ${floor - ph * 0.47} M ${px - ph * 0.12} ${floor - ph * 0.72} L ${px} ${floor - ph * 0.8} L ${px + ph * 0.12} ${floor - ph * 0.72} M ${px - ph * 0.1} ${floor} L ${px} ${floor - ph * 0.47} L ${px + ph * 0.1} ${floor}"/></g>
        <text class="note" x="${px}" y="${floor - ph - 8}" text-anchor="middle">1.70 m person</text>`;

      const content = `
        <line class="ground" x1="${PAD - 20}" y1="${floor}" x2="${VIEW_W - PAD + 20}" y2="${floor}"/>
        <rect class="wall" x="${PAD - 10}" y="${floor - fh - 30}" width="${fx - PAD + 10}" height="${fh + 30}"/>
        <rect class="wall" x="${fx + fw}" y="${floor - fh - 30}" width="${px - fx - fw - 40}" height="${fh + 30}"/>
        <rect class="door-frame" x="${fx}" y="${floor - fh}" width="${fw}" height="${fh}"/>
        ${leafMarkup}
        <text class="room-area" x="${lx + lw / 2}" y="${floor - lh - 22}" text-anchor="middle">${fmt(area, 2)} m²</text>
        ${personMarkup}
        ${dim(lx, floor, lx + lw, floor, mm(width), 22, width >= door.minWidth ? "is-good" : "is-bad")}
        ${dim(fx, floor, fx, floor - lh, mm(height), -40, height >= door.minHeight ? "is-good" : "is-bad")}`;

      const checks = [
        check("Width for this door type", mm(width), width >= door.minWidth, `≥ ${mm(door.minWidth)} · ${door.widthRule}`),
        check("Door height", mm(height), height >= door.minHeight, `≥ ${mm(door.minHeight)} · ${door.heightRule}`),
        check("Clear opening (approx.)", mm(clear), clear >= 800 || !door.accessible, door.accessible ? "≥ 800 mm clear · BP 344" : "Frame and stops take ~20 mm each side")
      ];
      if (door.exit) checks.push(check("Single leaf width", mm(leafSize), leafSize <= 1200, "≤ 1,200 mm per exit leaf · NBC §1207"));
      return {
        svg: svgFrame(content, `DOOR ELEVATION · ${door.name.toUpperCase()}`),
        summary: `${door.name}: ${fmt(width)} × ${fmt(height)} mm · opening area ${fmt(area, 2)} m² · typical ${door.typical}`,
        checks
      };
    }
  },

  window: {
    label: "Window elevation",
    icon: "◫",
    controls: [
      { id: "type", label: "Room", type: "select", options: windowRooms.map((room) => [room.id, room.name]), value: "bedroom" },
      { id: "floor", label: "Room floor area", min: 1, max: 40, step: 0.5, value: 9, unit: "m²" },
      { id: "width", label: "Window width", min: 300, max: 3600, step: 50, value: 1200, unit: "mm" },
      { id: "height", label: "Window height", min: 300, max: 2100, step: 50, value: 1200, unit: "mm" },
      { id: "sill", label: "Sill height", min: 0, max: 1800, step: 50, value: 900, unit: "mm" }
    ],
    presets(id, values) {
      if (id !== "type") return null;
      const room = windowRooms.find((item) => item.id === values.type);
      return { width: room.glazing.width, height: room.glazing.height, sill: room.glazing.sill, floor: room.room.minArea };
    },
    render({ type, floor, width, height, sill }) {
      const room = windowRooms.find((item) => item.id === type);
      const ceiling = 2700;
      const head = sill + height;
      const area = (width * height) / 1e6;
      const required = requiredWindowArea(room, floor);
      const louvred = /jalousie|louvre/i.test(room.glazing.type);
      const scale = Math.min((VIEW_W - PAD * 2 - 220) / Math.max(width + 1200, 2400), (VIEW_H - PAD * 2 - 10) / Math.max(ceiling, head + 100));
      const floorY = VIEW_H - PAD;
      const ceilY = floorY - ceiling * scale;
      const wx = PAD + 90;
      const ww = width * scale;
      const wy = floorY - head * scale;
      const wh = height * scale;
      const wallEnd = wx + ww + 600 * scale;

      let panes = "";
      if (louvred) {
        const blades = Math.max(3, Math.round(height / 100));
        for (let i = 1; i < blades; i += 1) panes += `<line class="louvre" x1="${wx + 4}" y1="${wy + (wh * i) / blades}" x2="${wx + ww - 4}" y2="${wy + (wh * i) / blades}"/>`;
      } else {
        panes = `<line class="mullion" x1="${wx + ww / 2}" y1="${wy}" x2="${wx + ww / 2}" y2="${wy + wh}"/>
          <path class="swing" d="M ${wx + ww * 0.3} ${wy + wh / 2} l 14 -6 m -14 6 l 14 6 M ${wx + ww * 0.7} ${wy + wh / 2} l -14 -6 m 14 6 l -14 6"/>`;
      }

      const px = wallEnd + 70;
      const ph = 1700 * scale;
      const hd = ph * 0.075;
      const content = `
        <line class="ground" x1="${PAD - 20}" y1="${floorY}" x2="${VIEW_W - PAD + 20}" y2="${floorY}"/>
        <rect class="room-floor" x="${PAD}" y="${ceilY}" width="${wallEnd - PAD}" height="${floorY - ceilY}"/>
        <line class="ceiling-line" x1="${PAD - 20}" y1="${ceilY}" x2="${wallEnd}" y2="${ceilY}"/>
        <text class="note" x="${PAD - 16}" y="${ceilY - 6}">ceiling ${m(ceiling / 1000)}</text>
        <rect class="window-glass" x="${wx}" y="${wy}" width="${ww}" height="${wh}"/>
        ${panes}
        <rect class="window-frame" x="${wx}" y="${wy}" width="${ww}" height="${wh}"/>
        <rect class="window-sill" x="${wx - 8}" y="${wy + wh}" width="${ww + 16}" height="5"/>
        <text class="room-area" x="${wx + ww / 2}" y="${wy - 44}" text-anchor="middle">${fmt(area, 2)} m²</text>
        <g class="person"><circle cx="${px}" cy="${floorY - ph + hd}" r="${hd}"/><path d="M ${px} ${floorY - ph + hd * 2} L ${px} ${floorY - ph * 0.47} M ${px - ph * 0.12} ${floorY - ph * 0.72} L ${px} ${floorY - ph * 0.8} L ${px + ph * 0.12} ${floorY - ph * 0.72} M ${px - ph * 0.1} ${floorY} L ${px} ${floorY - ph * 0.47} L ${px + ph * 0.1} ${floorY}"/></g>
        ${dim(wx, wy, wx + ww, wy, mm(width), -16)}
        ${dim(wx + ww, wy + wh, wx + ww, wy, mm(height), 24)}
        ${dim(wx, floorY, wx, wy + wh, `sill ${mm(sill)}`, -40, sill < 900 && !room.window ? "is-bad" : "")}
        ${dim(wallEnd, floorY, wallEnd, wy, `head ${mm(head)}`, 24, head > ceiling - 100 ? "is-bad" : "")}`;

      const checks = [];
      if (required === null) checks.push(check("Ventilation opening", `${fmt(area, 2)} m²`, area > 0, "Ventilation only · planning"));
      else checks.push(check("Window area", `${fmt(area, 2)} m²`, area >= required, `≥ ${fmt(required, 2)} m² for ${fmt(floor, 1)} m² · NBC §808`));
      checks.push(check("Head below ceiling", mm(head), head <= ceiling - 100, `≤ ${mm(ceiling - 100)} with 2.70 m ceiling`));
      if (room.window) checks.push(check("Privacy sill", mm(sill), sill >= 1500, "≥ 1,500 mm with obscure glass · planning"));
      else if (room.id === "kitchen") checks.push(check("Clears the counter", mm(sill), sill >= 1050, "≥ 1,050 mm above floor · planning"));
      else checks.push(check("Sill / fall protection", mm(sill), sill >= 900, "Below 900 mm needs a guard or safety glass"));
      return {
        svg: svgFrame(content, `WINDOW ELEVATION · ${room.name.toUpperCase()}`),
        summary: `${room.name}: ${fmt(width)} × ${fmt(height)} mm ${room.glazing.type.toLowerCase()} · sill ${fmt(sill)} · head ${fmt(head)} mm`,
        checks
      };
    }
  },

  corridor: {
    label: "Door & corridor",
    icon: "⇥",
    controls: [
      { id: "corridor", label: "Corridor clear width", min: 700, max: 2600, step: 10, value: 1200, unit: "mm" },
      { id: "door", label: "Door clear width", min: 600, max: 1200, step: 10, value: 900, unit: "mm" },
      { id: "load", label: "Occupant load served", min: 1, max: 300, step: 1, value: 30, unit: "persons" }
    ],
    render({ corridor, door, load }) {
      const length = 6000;
      const room = 2600;
      const scale = Math.min((VIEW_W - PAD * 2) / length, (VIEW_H - PAD * 2 - 20) / (corridor + room + 300));
      const ox = PAD;
      const wall = 150 * scale;
      const roomTop = PAD + 6;
      const wallY = roomTop + room * scale;
      const cy = wallY + wall;
      const ch = corridor * scale;
      const cw = length * scale;
      const dw = door * scale;
      const dx = ox + cw * 0.3;
      const turn = 1500 * scale;
      const turnFits = corridor >= 1500;
      const required = load < 50 ? 900 : 1120;

      const content = `
        <rect class="room-floor" x="${ox}" y="${roomTop}" width="${cw}" height="${room * scale}"/>
        <rect class="wall" x="${ox}" y="${wallY}" width="${cw}" height="${wall}"/>
        <rect class="corridor-floor" x="${ox}" y="${cy}" width="${cw}" height="${ch}"/>
        <rect class="wall" x="${ox}" y="${cy + ch}" width="${cw}" height="${wall}"/>
        <rect class="opening" x="${dx}" y="${wallY - 1}" width="${dw}" height="${wall + 2}"/>
        <line class="door-leaf" x1="${dx}" y1="${wallY}" x2="${dx}" y2="${wallY - dw}"/>
        <path class="swing" d="M ${dx} ${wallY - dw} A ${dw} ${dw} 0 0 1 ${dx + dw} ${wallY}"/>
        <circle class="turning ${turnFits ? "" : "is-bad"}" cx="${ox + cw * 0.72}" cy="${cy + ch / 2}" r="${turn / 2}"/>
        <text class="note" x="${ox + cw * 0.72}" y="${cy + ch / 2 + 4}" text-anchor="middle">Ø1.50 turning</text>
        <text class="room-label" x="${ox + cw * 0.72}" y="${roomTop + room * scale * 0.5}" text-anchor="middle">ROOM</text>
        <text class="room-label" x="${ox + cw * 0.12}" y="${cy + ch / 2 + 4}" text-anchor="middle">CORRIDOR</text>
        ${dim(ox + cw, cy, ox + cw, cy + ch, mm(corridor), -24, corridor >= required ? "is-good" : "is-bad")}
        ${dim(dx, wallY + wall, dx + dw, wallY + wall, mm(door), -14, door >= 900 ? "is-good" : "is-bad")}`;

      return {
        svg: svgFrame(content, "CORRIDOR PLAN"),
        summary: `${load} occupant${load === 1 ? "" : "s"} served · corridor needs ≥ ${mm(required)}`,
        checks: [
          check("Corridor width", mm(corridor), corridor >= required, `≥ ${mm(required)} for this load · NBC §1207`),
          check("Exit door width", mm(door), door >= 900, "≥ 900 mm · NBC §1207"),
          check("Accessible door", mm(door), door >= 800, "≥ 800 mm clear · BP 344"),
          check("Wheelchair turning", turnFits ? "Fits" : "Too narrow", turnFits, "Ø 1,500 mm space · BP 344")
        ]
      };
    }
  },

  ...moreDrawings
};

// Exported SVGs carry their own styles so they render outside the page.
const EXPORT_STYLE = `<style>
  svg{font-family:Arial,sans-serif;background:#fff}
  .outline,.wall{stroke:#111;stroke-width:2;fill:none}.wall{fill:url(#hatch)}
  .solid{fill:#e8eaf0}.room-floor,.corridor-floor{fill:#f6f7fb}.hatch-line{stroke:#999;stroke-width:1}
  .ground{stroke:#111;stroke-width:1.5}.rail{stroke:#ff6a00;stroke-width:2;stroke-dasharray:6 4}
  .opening{fill:#fff}.glass{stroke:#ff6a00;stroke-width:2}.door-leaf{stroke:#111;stroke-width:2}
  .swing,.turning{fill:none;stroke:#888;stroke-dasharray:4 4}.landing{fill:#ff6a00}
  .dim-line,.dim-ext,.dim-tick{stroke:#ff6a00;stroke-width:1}.dim-tick{stroke-width:1.6}
  .dim-text{font-size:12px;fill:#111}.is-bad .dim-line,.is-bad .dim-tick,.turning.is-bad{stroke:#dc2626}
  .note,.sheet-caption{font-size:11px;fill:#666}.room-label{font-size:11px;fill:#666;letter-spacing:1px}.room-area{font-size:22px;font-weight:700;fill:#111}
</style>`;

export function initDrawings(root) {
  if (!root) return;
  const tabs = root.querySelector("[data-drawing-tabs]");
  const canvas = root.querySelector("[data-drawing-canvas]");
  const controls = root.querySelector("[data-drawing-controls]");
  const checks = root.querySelector("[data-drawing-checks]");
  const summary = root.querySelector("[data-drawing-summary]");
  const values = {};
  let active = "stair";

  tabs.innerHTML = Object.entries(drawings)
    .map(([key, drawing]) => `<button type="button" role="tab" class="drawing-tab" data-drawing="${key}" aria-selected="false"><span aria-hidden="true">${drawing.icon}</span>${drawing.label}</button>`)
    .join("");

  const label = (value, unit) => (unit && unitLabel(unit) !== unit ? formatValue(value, unit) : `${value}${unit ? ` ${unit}` : ""}`);

  function controlMarkup(control) {
    const value = values[active][control.id];
    if (control.type === "select") {
      return `<div class="form-group"><label class="field-label" for="dw-${control.id}">${control.label}</label>
        <select class="select-input" id="dw-${control.id}" data-control="${control.id}">${control.options.map(([v, label]) => `<option value="${v}"${v === value ? " selected" : ""}>${label}</option>`).join("")}</select></div>`;
    }
    return `<div class="form-group slider-group"><label class="field-label" for="dw-${control.id}">${control.label}<output data-output="${control.id}">${label(value, control.unit)}</output></label>
      <input class="range-field" type="range" id="dw-${control.id}" data-control="${control.id}" min="${control.min}" max="${control.max}" step="${control.step}" value="${value}"></div>`;
  }

  let lastMeta = null;

  function draw() {
    const drawing = drawings[active];
    const result = drawing.render(values[active]);
    lastMeta = result.meta ?? null;
    canvas.classList.toggle("is-draggable", Boolean(drawing.drag));
    canvas.innerHTML = convertMarkup(result.svg);
    summary.textContent = convertText(result.summary);
    const passed = result.checks.filter((item) => item.ok).length;
    checks.innerHTML = `<p class="check-score ${passed === result.checks.length ? "is-good" : "is-bad"}">${passed}/${result.checks.length} checks pass</p>` +
      convertMarkup(result.checks.map((item) => `<li class="check-item ${item.ok ? "is-good" : "is-bad"}"><span class="check-mark" aria-hidden="true">${item.ok ? "✓" : "!"}</span><span><strong>${item.label}</strong><small>${item.rule}</small></span><b>${item.value}</b></li>`).join(""));
  }

  function select(key) {
    active = key;
    values[key] ??= Object.fromEntries(drawings[key].controls.map((control) => [control.id, control.value]));
    tabs.querySelectorAll(".drawing-tab").forEach((tab) => tab.setAttribute("aria-selected", String(tab.dataset.drawing === key)));
    controls.innerHTML = drawings[key].controls.map(controlMarkup).join("");
    draw();
  }

  // Drag openings directly on the drawing; values and sliders follow.
  let dragging = null;
  const svgPoint = (event) => {
    const svg = canvas.querySelector("svg");
    const box = svg.getBoundingClientRect();
    return { x: ((event.clientX - box.left) * VIEW_W) / box.width, y: ((event.clientY - box.top) * VIEW_H) / box.height };
  };
  canvas.addEventListener("pointerdown", (event) => {
    const handle = event.target.closest("[data-drag]");
    if (!handle || !drawings[active].drag) return;
    dragging = handle.dataset.drag;
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // Capture can fail for synthetic or cancelled pointers; dragging still works while over the canvas.
    }
    canvas.classList.add("is-dragging");
    event.preventDefault();
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!dragging || !lastMeta) return;
    Object.assign(values[active], drawings[active].drag(dragging, svgPoint(event), values[active], lastMeta));
    controls.innerHTML = drawings[active].controls.map(controlMarkup).join("");
    draw();
  });
  const endDrag = () => {
    dragging = null;
    canvas.classList.remove("is-dragging");
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  tabs.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-drawing]");
    if (tab) select(tab.dataset.drawing);
  });

  controls.addEventListener("input", (event) => {
    const id = event.target.dataset.control;
    if (!id) return;
    const control = drawings[active].controls.find((item) => item.id === id);
    const value = control.type === "select" ? event.target.value : Number(event.target.value);
    values[active][id] = value;
    const preset = drawings[active].presets?.(id, values[active]);
    if (preset) {
      Object.assign(values[active], preset);
      controls.innerHTML = drawings[active].controls.map(controlMarkup).join("");
    }
    const output = controls.querySelector(`[data-output="${id}"]`);
    if (output) output.textContent = label(value, control.unit);
    draw();
  });

  root.querySelector("[data-drawing-reset]")?.addEventListener("click", () => {
    delete values[active];
    select(active);
  });

  root.querySelector("[data-drawing-download]")?.addEventListener("click", () => {
    const svg = canvas.querySelector("svg").outerHTML.replace(/<defs>/, `${EXPORT_STYLE}<defs>`);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    link.download = `datum-${active}.svg`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });

  select(active);

  return {
    refresh() {
      controls.innerHTML = drawings[active].controls.map(controlMarkup).join("");
      draw();
    },
    // Open a drawing with some values preset, e.g. from the door schedule.
    show(key, preset = {}) {
      select(key);
      Object.assign(values[key], preset);
      const extra = drawings[key].presets?.("type", values[key]);
      if (extra) Object.assign(values[key], extra);
      controls.innerHTML = drawings[key].controls.map(controlMarkup).join("");
      draw();
      root.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
}
