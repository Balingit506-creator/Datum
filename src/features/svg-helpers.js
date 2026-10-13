// Shared SVG building blocks for the live dimensioned drawings.

export const VIEW_W = 720;
export const VIEW_H = 420;
export const PAD = 56;

export const fmt = (value, digits = 0) => Number(value).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
export const mm = (value) => `${fmt(value)} mm`;
export const m = (value, digits = 2) => `${fmt(value, digits)} m`;
export const check = (label, value, ok, rule) => ({ label, value, ok, rule });

// Architectural dimension line: extension lines, slash ticks and a centred label.
// A positive offset places the line to the left of the direction of travel (x1,y1 → x2,y2).
export function dim(x1, y1, x2, y2, label, offset = 26, tone = "") {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = -dy / len;
  const uy = dx / len;
  const ax = x1 + ux * offset;
  const ay = y1 + uy * offset;
  const bx = x2 + ux * offset;
  const by = y2 + uy * offset;
  const overshoot = Math.sign(offset) * 6;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const upright = angle > 90 || angle <= -90 ? angle + 180 : angle;
  const textGap = Math.sign(offset || 1) * 10;
  const tx = (ax + bx) / 2 + ux * textGap;
  const ty = (ay + by) / 2 + uy * textGap;
  const tick = (x, y) => `<line class="dim-tick" x1="${x - 4}" y1="${y + 4}" x2="${x + 4}" y2="${y - 4}"/>`;
  return `<g class="dim ${tone}">
    <line class="dim-ext" x1="${x1}" y1="${y1}" x2="${ax + ux * overshoot}" y2="${ay + uy * overshoot}"/>
    <line class="dim-ext" x1="${x2}" y1="${y2}" x2="${bx + ux * overshoot}" y2="${by + uy * overshoot}"/>
    <line class="dim-line" x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}"/>
    ${tick(ax, ay)}${tick(bx, by)}
    <text class="dim-text" x="${tx}" y="${ty}" transform="rotate(${upright} ${tx} ${ty})" text-anchor="middle" dominant-baseline="middle">${label}</text>
  </g>`;
}

export function svgFrame(content, caption) {
  return `<svg viewBox="0 0 ${VIEW_W} ${VIEW_H}" role="img" aria-label="${caption}" xmlns="http://www.w3.org/2000/svg">
    <defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" class="hatch-line"/></pattern></defs>
    ${content}
    <text class="sheet-caption" x="${VIEW_W - 16}" y="${VIEW_H - 14}" text-anchor="end">${caption}</text>
  </svg>`;
}

// A 1.70 m stick figure standing on floorY, for scale.
export function person(x, floorY, scale, label = true) {
  const ph = 1700 * scale;
  const hd = ph * 0.075;
  return `<g class="person"><circle cx="${x}" cy="${floorY - ph + hd}" r="${hd}"/><path d="M ${x} ${floorY - ph + hd * 2} L ${x} ${floorY - ph * 0.47} M ${x - ph * 0.12} ${floorY - ph * 0.72} L ${x} ${floorY - ph * 0.8} L ${x + ph * 0.12} ${floorY - ph * 0.72} M ${x - ph * 0.1} ${floorY} L ${x} ${floorY - ph * 0.47} L ${x + ph * 0.1} ${floorY}"/></g>${label ? `<text class="note" x="${x}" y="${floorY - ph - 8}" text-anchor="middle">1.70 m person</text>` : ""}`;
}
