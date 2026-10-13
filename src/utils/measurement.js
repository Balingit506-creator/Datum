import { readMetric } from '../core/units.js';

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Reads an input as metric, converting from imperial when the field is unit-tagged.
export function numericValue(id, root = document) {
  return readMetric(root.getElementById(id));
}

export function calculateDistance(lensHeight, baseDegrees, topDegrees) {
  const safeBase = clamp(baseDegrees, 0.1, 89);
  const distance = lensHeight / Math.tan((safeBase * Math.PI) / 180);
  const height = distance * (Math.tan((topDegrees * Math.PI) / 180) + Math.tan((safeBase * Math.PI) / 180));
  return { distance, height };
}

// Rectangular plan area, plus volume when a height/depth is given.
export function calculateAreaVolume({ length, width, height }) {
  const area = length * width;
  const volume = height > 0 ? area * height : null;
  const perimeter = 2 * (length + width);
  return { area, volume, perimeter };
}

export function calculateChbQuantity({
  wallWidth,
  wallHeight,
  blockLength,
  blockHeight,
  openingsArea,
  wastePercent
}) {
  const grossArea = wallWidth * wallHeight;
  const netArea = grossArea - openingsArea;
  const moduleArea = (blockLength / 1000) * (blockHeight / 1000);
  const baseCount = netArea / moduleArea;
  const totalCount = Math.ceil(baseCount * (1 + wastePercent / 100));

  return { grossArea, netArea, moduleArea, baseCount, totalCount };
}

export function formatLevelDetail(normalized, resultLabel = "") {
  const absolute = Math.abs(normalized);
  if (absolute < 0.15) {
    return {
      value: "0.0",
      unit: "°",
      detail: "Surface is level"
    };
  }

  const direction = normalized > 0 ? "Tilted right" : "Tilted left";
  return {
    value: `${absolute.toFixed(1)}`,
    unit: "°",
    detail: `${direction} by ${absolute.toFixed(1)}°${resultLabel ? ` · ${resultLabel}` : ""}`
  };
}

export function createRulerMarkup(pixelsPerCentimeter) {
  const ticks = Array.from({ length: 31 }, (_, index) => {
    const left = (index * pixelsPerCentimeter) / 5;
    const className = index % 5 === 0 ? "major" : index % 2 === 0 ? "medium" : "";
    return `<i class="${className}" style="left:${left}px"></i>`;
  }).join("");

  const numbers = Array.from({ length: 7 }, (_, index) => {
    const left = index * pixelsPerCentimeter;
    return `<span style="left:${left}px">${index}</span>`;
  }).join("");

  return { ticks, numbers };
}
