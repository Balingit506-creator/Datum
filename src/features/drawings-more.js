// Additional live drawings for the element standards: kitchen, bathroom, bedroom,
// electrical, building section, drain slope and parking.

import { VIEW_W, VIEW_H, PAD, fmt, mm, m, dim, svgFrame, check, person } from './svg-helpers.js';

const between = (value, low, high) => value >= low && value <= high;
const tone = (ok) => (ok ? "is-good" : "is-bad");

export const moreDrawings = {
  kitchen: {
    label: "Kitchen section",
    icon: "⌂",
    controls: [
      { id: "cooks", label: "Cooks working at once", type: "select", options: [["1", "One cook"], ["2", "Two cooks / island"]], value: "1" },
      { id: "counter", label: "Counter height", min: 700, max: 1050, step: 10, value: 900, unit: "mm" },
      { id: "depth", label: "Counter depth", min: 450, max: 800, step: 10, value: 600, unit: "mm" },
      { id: "gap", label: "Counter to upper cabinet", min: 300, max: 900, step: 10, value: 550, unit: "mm" },
      { id: "upper", label: "Upper cabinet depth", min: 250, max: 450, step: 10, value: 330, unit: "mm" },
      { id: "aisle", label: "Aisle width", min: 700, max: 2000, step: 10, value: 1100, unit: "mm" }
    ],
    render({ cooks, counter, depth, gap, upper, aisle }) {
      const upperBottom = counter + gap;
      const upperTop = Math.max(upperBottom + 300, 2250);
      const totalW = depth * 2 + aisle + 400;
      const scale = Math.min((VIEW_W - PAD * 2) / totalW, (VIEW_H - PAD * 2 - 10) / 2600);
      const floor = VIEW_H - PAD;
      const wallX = PAD + 30;
      const d = depth * scale;
      const aisleX = wallX + d;
      const islandX = aisleX + aisle * scale;
      const y = (mmValue) => floor - mmValue * scale;
      const base = (x, mirrored) => `<rect class="cabinet" x="${x}" y="${y(counter)}" width="${d}" height="${(counter - 100) * scale}"/>
        <rect class="countertop" x="${x - (mirrored ? 0 : 0)}" y="${y(counter)}" width="${d}" height="${Math.max(3, 30 * scale)}"/>
        <rect class="toe-kick" x="${mirrored ? x : x + d - 75 * scale}" y="${y(100)}" width="${75 * scale}" height="${100 * scale}"/>`;
      const minAisle = cooks === "2" ? 1200 : 1000;
      const content = `
        <rect class="wall" x="${wallX - 16}" y="${y(2700)}" width="16" height="${2700 * scale}"/>
        <line class="ground" x1="${PAD - 20}" y1="${floor}" x2="${VIEW_W - PAD + 20}" y2="${floor}"/>
        ${base(wallX, false)}
        <rect class="cabinet" x="${wallX}" y="${y(upperTop)}" width="${upper * scale}" height="${(upperTop - upperBottom) * scale}"/>
        ${base(islandX, true)}
        ${person(aisleX + (aisle * scale) / 2, floor, scale)}
        ${dim(wallX + d, floor, wallX + d, y(counter), mm(counter), 22, tone(between(counter, 850, 900)))}
        ${dim(wallX, y(counter), wallX + d, y(counter), mm(depth), -14, tone(depth >= 550))}
        ${dim(wallX + upper * scale, y(counter), wallX + upper * scale, y(upperBottom), mm(gap), 18, tone(between(gap, 450, 600)))}
        ${dim(wallX, y(upperTop), wallX + upper * scale, y(upperTop), mm(upper), -14, tone(between(upper, 300, 350)))}
        ${dim(aisleX, floor, islandX, floor, `aisle ${mm(aisle)}`, 24, tone(aisle >= minAisle))}`;
      return {
        svg: svgFrame(content, "KITCHEN SECTION"),
        summary: `Counter ${mm(counter)} high × ${mm(depth)} deep · upper cabinets from ${mm(upperBottom)} · ${mm(aisle)} aisle`,
        checks: [
          check("Counter height", mm(counter), between(counter, 850, 900), "850–900 mm · planning"),
          check("Counter depth", mm(depth), depth >= 550, "≈ 600 mm for appliances · planning"),
          check("Backsplash gap", mm(gap), between(gap, 450, 600), "450–600 mm · planning"),
          check("Upper cabinet depth", mm(upper), between(upper, 300, 350), "300–350 mm · planning"),
          check("Work aisle", mm(aisle), aisle >= minAisle, `≥ ${mm(minAisle)} for ${cooks === "2" ? "two cooks" : "one cook"} · planning`)
        ]
      };
    }
  },

  bathroom: {
    label: "Bathroom plan",
    icon: "◌",
    controls: [
      { id: "accessible", label: "Design for wheelchair users", type: "select", options: [["no", "No"], ["yes", "Yes (BP 344)"]], value: "no" },
      { id: "width", label: "Room width", min: 900, max: 3000, step: 10, value: 1500, unit: "mm" },
      { id: "length", label: "Room length", min: 1200, max: 4000, step: 10, value: 2200, unit: "mm" },
      { id: "shower", label: "Shower depth", min: 0, max: 1500, step: 10, value: 900, unit: "mm" },
      { id: "wcSide", label: "WC centreline to side wall", min: 250, max: 700, step: 10, value: 400, unit: "mm" }
    ],
    render({ accessible, width, length, shower, wcSide }) {
      const wall = 100;
      const scale = Math.min((VIEW_W - PAD * 2 - 60) / (width + wall * 2), (VIEW_H - PAD * 2 - 20) / (length + wall * 2));
      const W = width * scale;
      const L = length * scale;
      const ox = (VIEW_W - W) / 2;
      const oy = (VIEW_H - L) / 2;
      const w = wall * scale;
      const sh = shower * scale;
      const wcDepth = 700;
      const wcY = oy + sh + wcSide * scale;
      const front = width - wcDepth;
      const lavY = oy + L - 650 * scale;
      const freeLength = length - shower;
      const turning = Math.min(width, freeLength) >= 1500;
      const area = (width * length) / 1e6;
      const door = Math.min(800, width - 200) * scale;

      const content = `
        <rect class="wall" x="${ox - w}" y="${oy - w}" width="${W + w * 2}" height="${L + w * 2}"/>
        <rect class="room-floor" x="${ox}" y="${oy}" width="${W}" height="${L}"/>
        ${shower > 0 ? `<rect class="shower" x="${ox}" y="${oy}" width="${W}" height="${sh}"/><path class="drain" d="M ${ox + W / 2 - 6} ${oy + sh / 2 - 6} l 12 12 m 0 -12 l -12 12"/><text class="note" x="${ox + W / 2}" y="${oy + 16}" text-anchor="middle">shower</text>` : ""}
        <rect class="fixture" x="${ox}" y="${wcY - 200 * scale}" width="${180 * scale}" height="${400 * scale}" rx="3"/>
        <ellipse class="fixture" cx="${ox + 180 * scale + 260 * scale}" cy="${wcY}" rx="${260 * scale}" ry="${180 * scale}"/>
        <rect class="fixture" x="${ox + W - 450 * scale}" y="${lavY}" width="${450 * scale}" height="${500 * scale}" rx="4"/>
        <ellipse class="fixture-inner" cx="${ox + W - 225 * scale}" cy="${lavY + 250 * scale}" rx="${150 * scale}" ry="${170 * scale}"/>
        ${accessible === "yes" ? `<circle class="turning ${turning ? "" : "is-bad"}" cx="${ox + W / 2}" cy="${oy + sh + (L - sh) / 2}" r="${750 * scale}"/>` : ""}
        <rect class="opening" x="${ox + (W - door) / 2}" y="${oy + L - 1}" width="${door}" height="${w + 2}"/>
        <path class="swing" d="M ${ox + (W - door) / 2} ${oy + L + w} A ${door} ${door} 0 0 0 ${ox + (W - door) / 2 + door} ${oy + L + w - door}"/>
        ${dim(ox, oy + L + w, ox + W, oy + L + w, mm(width), 20)}
        ${dim(ox - w, oy + L, ox - w, oy, mm(length), -22)}
        ${dim(ox - w, oy + sh, ox - w, wcY, mm(wcSide), 50, tone(between(wcSide, 380, 450)))}
        ${dim(ox + wcDepth * scale, wcY, ox + W, wcY, `clear ${mm(front)}`, -14, tone(front >= 600))}
        ${shower > 0 ? dim(ox + W, oy, ox + W, oy + sh, mm(shower), -22, tone(shower >= 900)) : ""}`;

      const checks = [
        check("Floor area", `${fmt(area, 2)} m²`, area >= 1.2, "≥ 1.20 m² · NBC Rule VIII §806"),
        check("WC to side wall", mm(wcSide), between(wcSide, 380, 450), "380–450 mm to centreline · planning"),
        check("Clear space in front of WC", mm(front), front >= 600, "≥ 600 mm · planning"),
        check("Shower size", shower ? `${fmt(width)} × ${fmt(shower)}` : "none", shower === 0 || (shower >= 900 && width >= 900), "≥ 900 × 900 mm · planning")
      ];
      if (accessible === "yes") {
        checks.push(check("Accessible room size", `${fmt(width)} × ${fmt(length)}`, Math.min(width, length) >= 1700 && Math.max(width, length) >= 1800, "≥ 1,700 × 1,800 mm · BP 344"));
        checks.push(check("Turning circle", turning ? "Fits" : "Too small", turning, "Ø 1,500 mm clear · BP 344"));
      }
      return { svg: svgFrame(content, "BATHROOM PLAN"), summary: `${fmt(area, 2)} m² bathroom · WC, lavatory${shower ? " and shower" : ""}`, checks };
    }
  },

  bedroom: {
    label: "Bedroom clearances",
    icon: "▭",
    controls: [
      { id: "bed", label: "Bed size", type: "select", options: [["single", "Single 900 × 1,900"], ["double", "Double 1,350 × 1,900"], ["queen", "Queen 1,500 × 2,000"], ["king", "King 1,800 × 2,000"]], value: "queen" },
      { id: "width", label: "Room width", min: 2000, max: 6000, step: 10, value: 3600, unit: "mm" },
      { id: "length", label: "Room length", min: 2000, max: 6000, step: 10, value: 3600, unit: "mm" },
      { id: "wardrobe", label: "Wardrobe depth (foot wall)", min: 0, max: 700, step: 10, value: 600, unit: "mm" }
    ],
    render({ bed, width, length, wardrobe }) {
      const [bw, bl] = { single: [900, 1900], double: [1350, 1900], queen: [1500, 2000], king: [1800, 2000] }[bed];
      const wall = 150;
      const scale = Math.min((VIEW_W - PAD * 2 - 60) / (width + wall * 2), (VIEW_H - PAD * 2 - 20) / (length + wall * 2));
      const W = width * scale;
      const L = length * scale;
      const ox = (VIEW_W - W) / 2;
      const oy = (VIEW_H - L) / 2;
      const w = wall * scale;
      const side = (width - bw) / 2;
      const foot = length - bl - wardrobe;
      const bx = ox + side * scale;
      const area = (width * length) / 1e6;
      const content = `
        <rect class="wall" x="${ox - w}" y="${oy - w}" width="${W + w * 2}" height="${L + w * 2}"/>
        <rect class="room-floor" x="${ox}" y="${oy}" width="${W}" height="${L}"/>
        <rect class="furniture" x="${bx}" y="${oy}" width="${bw * scale}" height="${bl * scale}" rx="4"/>
        <rect class="furniture-soft" x="${bx + 8}" y="${oy + 8}" width="${bw * scale - 16}" height="${320 * scale}" rx="6"/>
        ${wardrobe ? `<rect class="cabinet" x="${ox + W * 0.15}" y="${oy + L - wardrobe * scale}" width="${W * 0.7}" height="${wardrobe * scale}"/><text class="note" x="${ox + W / 2}" y="${oy + L - (wardrobe * scale) / 2 + 4}" text-anchor="middle">wardrobe</text>` : ""}
        <text class="room-label" x="${bx + (bw * scale) / 2}" y="${oy + (bl * scale) / 2 + 20}" text-anchor="middle">${bed.toUpperCase()} BED</text>
        ${dim(ox, oy + (bl * scale) / 2, bx, oy + (bl * scale) / 2, mm(side), 0, tone(side >= 600))}
        ${dim(bx + bw * scale, oy + (bl * scale) / 2, ox + W, oy + (bl * scale) / 2, mm(side), 0, tone(side >= 600))}
        ${dim(ox + W * 0.5, oy + bl * scale, ox + W * 0.5, oy + L - wardrobe * scale, mm(foot), 0, tone(foot >= 900))}
        ${dim(ox, oy + L + w, ox + W, oy + L + w, mm(width), 20)}
        ${dim(ox - w, oy + L, ox - w, oy, mm(length), -22)}`;
      return {
        svg: svgFrame(content, "BEDROOM PLAN · CLEARANCES"),
        summary: `${fmt(area, 2)} m² bedroom with a ${bed} bed`,
        checks: [
          check("Room area", `${fmt(area, 2)} m²`, area >= 6 && Math.min(width, length) >= 2000, "≥ 6.00 m², 2.00 m least · NBC §806"),
          check("Space beside the bed", mm(side), side >= 600, "600–700 mm each side · planning"),
          check("Foot of bed to wardrobe", mm(foot), foot >= 900, "≥ 900 mm · planning")
        ]
      };
    }
  },

  electrical: {
    label: "Electrical heights",
    icon: "⚡",
    controls: [
      { id: "accessible", label: "Accessible design", type: "select", options: [["no", "No"], ["yes", "Yes (BP 344)"]], value: "no" },
      { id: "outlet", label: "Convenience outlet", min: 150, max: 800, step: 10, value: 300, unit: "mm" },
      { id: "switch", label: "Light switch", min: 800, max: 1600, step: 10, value: 1300, unit: "mm" },
      { id: "counterOutlet", label: "Counter outlet", min: 900, max: 1400, step: 10, value: 1100, unit: "mm" },
      { id: "aircon", label: "Aircon outlet", min: 1600, max: 2700, step: 10, value: 2200, unit: "mm" }
    ],
    render({ accessible, outlet, switch: sw, counterOutlet, aircon }) {
      const scale = (VIEW_H - PAD * 2 - 10) / 2800;
      const floor = VIEW_H - PAD;
      const y = (v) => floor - v * scale;
      const wallX = PAD + 20;
      const wallW = VIEW_W - PAD * 2 - 40;
      const doorX = wallX + 30;
      const doorW = 900 * scale;
      const counterX = wallX + wallW * 0.42;
      const counterW = wallW * 0.3;
      const acX = wallX + wallW * 0.86;
      const box = (x, v, label) => `<rect class="device" x="${x - 9}" y="${y(v) - 7}" width="18" height="14" rx="2"/><text class="note" x="${x}" y="${y(v) - 12}" text-anchor="middle">${label}</text>`;
      const swMax = accessible === "yes" ? 1200 : 1400;
      const swMin = accessible === "yes" ? 900 : 1200;
      const content = `
        <rect class="room-floor" x="${wallX}" y="${y(2700)}" width="${wallW}" height="${2700 * scale}"/>
        <line class="ground" x1="${PAD - 20}" y1="${floor}" x2="${VIEW_W - PAD + 20}" y2="${floor}"/>
        <line class="ceiling-line" x1="${wallX}" y1="${y(2700)}" x2="${wallX + wallW}" y2="${y(2700)}"/>
        <rect class="door-frame" x="${doorX}" y="${y(2100)}" width="${doorW}" height="${2100 * scale}"/>
        <rect class="cabinet" x="${counterX}" y="${y(900)}" width="${counterW}" height="${900 * scale}"/>
        <rect class="countertop" x="${counterX}" y="${y(900)}" width="${counterW}" height="4"/>
        <rect class="cabinet" x="${acX - 40}" y="${y(2450)}" width="80" height="${280 * scale}" rx="4"/>
        ${box(doorX + doorW + 30, sw, "switch")}
        ${box(doorX + doorW + 90, outlet, "outlet")}
        ${box(counterX + counterW / 2, counterOutlet, "counter outlet")}
        ${box(acX + 60, aircon, "aircon")}
        ${dim(doorX + doorW + 30, floor, doorX + doorW + 30, y(sw), mm(sw), 24, tone(between(sw, swMin, swMax)))}
        ${dim(doorX + doorW + 90, floor, doorX + doorW + 90, y(outlet), mm(outlet), 24, tone(outlet >= 250))}
        ${dim(counterX + counterW / 2 + 30, floor, counterX + counterW / 2 + 30, y(counterOutlet), mm(counterOutlet), 22, tone(counterOutlet >= 1050))}
        ${dim(acX + 60, floor, acX + 60, y(aircon), mm(aircon), -24, tone(aircon >= 2000))}`;
      const checks = [
        check("Light switch", mm(sw), between(sw, swMin, swMax), accessible === "yes" ? "≤ 1,200 mm · BP 344" : "1,200–1,400 mm · planning"),
        check("Convenience outlet", mm(outlet), outlet >= 250 && (accessible === "no" || outlet >= 400), accessible === "yes" ? "≥ 400 mm for reach · planning" : "≈ 300 mm · planning"),
        check("Counter outlet", mm(counterOutlet), counterOutlet >= 1050, "≥ 150 mm above a 900 mm counter · planning"),
        check("Aircon outlet", mm(aircon), aircon >= 2000, "2,100–2,400 mm near the unit · planning")
      ];
      return { svg: svgFrame(content, "WALL ELEVATION · ELECTRICAL"), summary: "Mounting heights measured above finished floor (AFF)", checks };
    }
  },

  section: {
    label: "Building section",
    icon: "↕",
    controls: [
      { id: "vent", label: "Ventilation", type: "select", options: [["natural", "Natural ventilation"], ["artificial", "Artificial ventilation"]], value: "natural" },
      { id: "storeys", label: "Storeys", min: 1, max: 3, step: 1, value: 2, unit: "" },
      { id: "f2f", label: "Floor-to-floor height", min: 2400, max: 4500, step: 50, value: 3200, unit: "mm" },
      { id: "structure", label: "Slab + beam + ceiling depth", min: 150, max: 1000, step: 10, value: 450, unit: "mm" },
      { id: "plinth", label: "Floor above grade (plinth)", min: 0, max: 900, step: 10, value: 300, unit: "mm" }
    ],
    render({ vent, storeys, f2f, structure, plinth }) {
      const total = plinth + storeys * f2f;
      const scale = (VIEW_H - PAD * 2 - 20) / Math.max(total, 4000);
      const ground = VIEW_H - PAD;
      const y = (v) => ground - v * scale;
      const x0 = PAD + 140;
      const width = VIEW_W - PAD * 2 - 220;
      const clear = f2f - structure;
      const required = (i) => (vent === "artificial" ? 2400 : [2700, 2400, 2100][i]);
      let floors = "";
      const checks = [];
      for (let i = 0; i < storeys; i += 1) {
        const ffl = plinth + i * f2f;
        const ok = clear >= required(i);
        floors += `<rect class="slab" x="${x0}" y="${y(ffl) }" width="${width}" height="${Math.max(3, 120 * scale)}"/>
          <rect class="ceiling-zone" x="${x0}" y="${y(ffl + f2f)}" width="${width}" height="${structure * scale}"/>
          <text class="room-label" x="${x0 + width / 2}" y="${y(ffl + clear / 2)}" text-anchor="middle">STOREY ${i + 1}</text>
          ${dim(x0 + width, y(ffl), x0 + width, y(ffl + clear), `clear ${m(clear / 1000)}`, 26, tone(ok))}
          ${dim(x0, y(ffl), x0, y(ffl + f2f), m(f2f / 1000), -30)}`;
        checks.push(check(`Storey ${i + 1} clear height`, m(clear / 1000), ok, `≥ ${m(required(i) / 1000)} · NBC Rule VIII §805`));
      }
      const content = `
        <line class="ground" x1="${PAD - 20}" y1="${ground}" x2="${VIEW_W - PAD + 20}" y2="${ground}"/>
        <rect class="plinth" x="${x0}" y="${y(plinth)}" width="${width}" height="${plinth * scale}"/>
        <rect class="slab" x="${x0}" y="${y(total)}" width="${width}" height="${Math.max(3, 150 * scale)}"/>
        <line class="outline" x1="${x0}" y1="${y(total)}" x2="${x0}" y2="${ground}"/>
        <line class="outline" x1="${x0 + width}" y1="${y(total)}" x2="${x0 + width}" y2="${ground}"/>
        ${floors}
        ${plinth > 0 ? dim(x0 + width, ground, x0 + width, y(plinth), mm(plinth), 70, tone(plinth >= 150)) : ""}
        ${person(x0 + width * 0.25, y(plinth), scale)}`;
      checks.push(check("Floor above grade", mm(plinth), plinth >= 150, "150–300 mm, more in flood areas · planning"));
      return { svg: svgFrame(content, "BUILDING SECTION"), summary: `${storeys} storey${storeys > 1 ? "s" : ""} · ${m(total / 1000)} to roof slab · ${m(clear / 1000)} clear per storey`, checks };
    }
  },

  drain: {
    label: "Drain slope",
    icon: "≋",
    controls: [
      { id: "fixture", label: "Fixture drained", type: "select", options: [["wc", "Water closet (WC)"], ["lav", "Lavatory / sink"], ["floor", "Floor drain"]], value: "wc" },
      { id: "pipe", label: "Pipe diameter", type: "select", options: [["40", "40 mm (1½″)"], ["50", "50 mm (2″)"], ["75", "75 mm (3″)"], ["100", "100 mm (4″)"]], value: "100" },
      { id: "run", label: "Horizontal run to stack", min: 1, max: 20, step: 0.5, value: 6, unit: "m" },
      { id: "slope", label: "Slope", min: 0.5, max: 5, step: 0.25, value: 2, unit: "%" },
      { id: "depth", label: "Depth available below floor", min: 100, max: 1200, step: 10, value: 400, unit: "mm" }
    ],
    render({ fixture, pipe, run, slope, depth }) {
      const dia = Number(pipe);
      const drop = run * 1000 * (slope / 100);
      const needed = drop + dia + 50;
      const minDia = { wc: 100, lav: 40, floor: 50 }[fixture];
      const sx = (VIEW_W - PAD * 2 - 120) / (run * 1000);
      const sy = Math.min(0.5, (VIEW_H - PAD * 2 - 120) / Math.max(depth, needed));
      const floor = PAD + 70;
      const x0 = PAD + 40;
      const x1 = x0 + run * 1000 * sx;
      const startY = floor + 50 * sy + (dia * sy) / 2;
      const endY = startY + drop * sy;
      const content = `
        <rect class="slab" x="${PAD - 10}" y="${floor - 10}" width="${VIEW_W - PAD * 2 + 20}" height="10"/>
        <text class="note" x="${PAD}" y="${floor - 18}">finished floor</text>
        <rect class="ceiling-zone" x="${PAD - 10}" y="${floor}" width="${VIEW_W - PAD * 2 + 20}" height="${depth * sy}"/>
        <line class="ceiling-line" x1="${PAD - 10}" y1="${floor + depth * sy}" x2="${VIEW_W - PAD + 10}" y2="${floor + depth * sy}"/>
        <line class="pipe" x1="${x0}" y1="${startY}" x2="${x1}" y2="${endY}" style="stroke-width:${Math.min(12, Math.max(4, dia * sy * 0.3))}"/>
        <line class="pipe" x1="${x0}" y1="${floor - 10}" x2="${x0}" y2="${startY}" style="stroke-width:${Math.min(12, Math.max(4, dia * sy * 0.3))}"/>
        <rect class="pipe-stack" x="${x1 - 8}" y="${floor - 40}" width="16" height="${Math.max(depth * sy + 60, endY - floor + 60)}"/>
        <circle class="cleanout" cx="${x1 - 20}" cy="${endY}" r="5"/><text class="note" x="${x1 - 28}" y="${endY + 20}" text-anchor="end">cleanout</text>
        <text class="note" x="${x1 + 14}" y="${floor - 26}">stack</text>
        <path class="flow" d="M ${x0 + 40} ${startY - 14} L ${x0 + 80} ${startY - 14 + 40 * (drop / (run * 1000)) * (sy / sx)}"/>
        ${dim(x0, endY, x1, endY, m(run, 1), 34)}
        ${dim(x1 + 30, floor, x1 + 30, endY, `drop ${mm(drop)}`, -10, tone(needed <= depth))}
        <text class="note" x="${(x0 + x1) / 2}" y="${(startY + endY) / 2 - 16}" text-anchor="middle">${fmt(slope, 2)}% slope (vertical ×${fmt(sy / sx, 0)})</text>`;
      return {
        svg: svgFrame(content, "DRAIN PROFILE"),
        summary: `${m(run, 1)} run at ${fmt(slope, 2)}% drops ${mm(drop)} · needs about ${mm(needed)} of depth`,
        checks: [
          check("Pipe slope", `${fmt(slope, 2)}%`, slope >= 2, "≥ 2% (¼″ per ft) · plumbing code"),
          check("Pipe size for fixture", mm(dia), dia >= minDia, `≥ ${mm(minDia)} for this fixture · planning`),
          check("Fits in the floor zone", mm(needed), needed <= depth, `drop + pipe + cover ≤ ${mm(depth)}`)
        ]
      };
    }
  },

  parking: {
    label: "Parking layout",
    icon: "▭",
    controls: [
      { id: "stalls", label: "Number of stalls", min: 1, max: 8, step: 1, value: 4, unit: "" },
      { id: "accessible", label: "Accessible stalls", min: 0, max: 2, step: 1, value: 1, unit: "" },
      { id: "stallW", label: "Stall width", min: 2000, max: 3000, step: 50, value: 2500, unit: "mm" },
      { id: "stallL", label: "Stall length", min: 4000, max: 6000, step: 50, value: 5000, unit: "mm" },
      { id: "aisle", label: "Driveway aisle", min: 2500, max: 8000, step: 50, value: 6000, unit: "mm" }
    ],
    render({ stalls, accessible, stallW, stallL, aisle }) {
      const accW = 3700;
      const acc = Math.min(accessible, stalls);
      const totalW = acc * accW + (stalls - acc) * stallW;
      const scale = Math.min((VIEW_W - PAD * 2) / totalW, (VIEW_H - PAD * 2 - 20) / (stallL + aisle));
      const ox = (VIEW_W - totalW * scale) / 2;
      const oy = PAD;
      let x = ox;
      let markup = "";
      for (let i = 0; i < stalls; i += 1) {
        const isAcc = i < acc;
        const sw = (isAcc ? accW : stallW) * scale;
        markup += `<rect class="${isAcc ? "stall stall-accessible" : "stall"}" x="${x}" y="${oy}" width="${sw}" height="${stallL * scale}"/>
          <rect class="car" x="${x + sw / 2 - (900 * scale)}" y="${oy + 300 * scale}" width="${1800 * scale}" height="${4400 * scale}" rx="${300 * scale}"/>
          ${isAcc ? `<text class="stall-symbol" x="${x + sw / 2}" y="${oy + (stallL * scale) / 2 + 8}" text-anchor="middle">♿</text>` : ""}`;
        x += sw;
      }
      const aisleY = oy + stallL * scale;
      const content = `
        <rect class="corridor-floor" x="${ox}" y="${aisleY}" width="${totalW * scale}" height="${aisle * scale}"/>
        <path class="flow" d="M ${ox + 30} ${aisleY + (aisle * scale) / 3} h 60 m -10 -6 l 10 6 l -10 6 M ${ox + totalW * scale - 30} ${aisleY + (aisle * scale * 2) / 3} h -60 m 10 -6 l -10 6 l 10 6"/>
        ${markup}
        ${dim(ox + (acc ? accW * scale : 0), oy, ox + (acc ? accW * scale : 0) + (stalls > acc ? stallW * scale : 0), oy, stalls > acc ? mm(stallW) : "", -14, tone(stallW >= 2500))}
        ${acc ? dim(ox, oy, ox + accW * scale, oy, mm(accW), -14, "is-good") : ""}
        ${dim(ox + totalW * scale, oy, ox + totalW * scale, aisleY, mm(stallL), -22, tone(stallL >= 5000))}
        ${dim(ox + totalW * scale, aisleY, ox + totalW * scale, aisleY + aisle * scale, `aisle ${mm(aisle)}`, -22, tone(aisle >= 6000))}`;
      return {
        svg: svgFrame(content, "PARKING PLAN · 90° STALLS"),
        summary: `${stalls} stalls (${acc} accessible) need a ${m((totalW) / 1000)} frontage and ${m((stallL + aisle) / 1000)} depth`,
        checks: [
          check("Stall size", `${fmt(stallW)} × ${fmt(stallL)}`, stallW >= 2500 && stallL >= 5000, "≥ 2.50 × 5.00 m · NBC Rule VII"),
          check("Accessible stall", acc ? "3,700 mm wide" : "none", acc > 0, "≥ 1 stall, 3.70 m wide · BP 344"),
          check("Two-way aisle", mm(aisle), aisle >= 6000, "≈ 6.00 m for 90° parking · planning")
        ]
      };
    }
  }
};
