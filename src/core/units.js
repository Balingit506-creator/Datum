// Global unit system. Everything is stored and calculated in metric;
// only what is displayed (text, input values) is converted to imperial.

const STORAGE_KEY = "datum-units";
const listeners = new Set();

let system = readStored() ?? "metric";

function readStored() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === "imperial" || value === "metric" ? value : null;
  } catch {
    return null;
  }
}

export const getUnits = () => system;
export const isImperial = () => system === "imperial";

export function setUnits(next) {
  if (next === system) return;
  system = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Storage may be blocked; the choice still applies for this visit.
  }
  listeners.forEach((listener) => listener(system));
}

export function onUnitsChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// metric unit → [imperial unit, metric per imperial unit]
const conversions = {
  mm: ["in", 25.4],
  cm: ["in", 2.54],
  m: ["ft", 0.3048],
  "m²": ["ft²", 0.09290304],
  "m³": ["ft³", 0.0283168],
  L: ["gal", 3.78541],
  kg: ["lb", 0.453592]
};

export const unitLabel = (unit) => (isImperial() && conversions[unit] ? conversions[unit][0] : unit);

// Convert a metric value to the given system's display value, and back.
export function toDisplay(value, unit, target = system) {
  return target === "imperial" && conversions[unit] ? value / conversions[unit][1] : value;
}
export function fromDisplay(value, unit, source = system) {
  return source === "imperial" && conversions[unit] ? value * conversions[unit][1] : value;
}

const group = (value, digits) => Number(value).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

// Feet-and-inches for lengths: 11.8″ under a foot, 3′ 11″ above.
function feetInches(mmValue) {
  const inches = mmValue / 25.4;
  if (Math.abs(inches) < 12) return `${group(inches, 1)}″`;
  let feet = Math.floor(inches / 12);
  let rest = Math.round(inches - feet * 12);
  if (rest === 12) { feet += 1; rest = 0; }
  return `${feet}′ ${rest}″`;
}

const toMm = { mm: 1, cm: 10, m: 1000 };

function imperialFor(number, unit) {
  if (toMm[unit]) return feetInches(number * toMm[unit]);
  if (unit === "m²") return `${group(number / 0.09290304, 1)} ft²`;
  if (unit === "m³") return `${group(number / 0.0283168, 2)} ft³`;
  if (unit === "L") return `${group(number / 3.78541, 2)} gal`;
  if (unit === "kg") return `${group(number / 0.453592, 1)} lb`;
  return `${number} ${unit}`;
}

const NUM = "(\\d[\\d,]*(?:\\.\\d+)?)";
const MEASURE = new RegExp(`${NUM}(?:\\s*([–-]|×)\\s*${NUM})?(?:\\s*×\\s*${NUM})?\\s?(mm|cm|m²|m³|m|L|kg)(?![\\w²³])`, "g");
const parse = (text) => Number(text.replace(/,/g, ""));

// Rewrites "1,200 mm", "850–900 mm", "2.50 × 5.00 m", "12.5 m²" … into imperial when active.
export function convertText(text) {
  if (!isImperial() || !text) return text;
  return String(text).replace(MEASURE, (match, a, joiner, b, c, unit) => {
    const first = imperialFor(parse(a), unit);
    if (!b) return first;
    const second = imperialFor(parse(b), unit);
    const third = c ? ` × ${imperialFor(parse(c), unit)}` : "";
    return `${first} ${joiner} ${second}${third}`;
  });
}

// Converts only text between tags, so SVG path data and attributes stay untouched.
export function convertMarkup(markup) {
  if (!isImperial()) return markup;
  return markup.replace(/>([^<]+)</g, (whole, text) => `>${convertText(text)}<`);
}

// Format a metric number with its unit in the active system.
export function formatValue(value, unit, digits = 0) {
  return isImperial() ? convertText(`${value} ${unit}`) : `${group(value, digits)} ${unit}`;
}

// Inputs tagged data-unit show converted values; numericValue() converts them back.
export function syncInputs(root = document) {
  root.querySelectorAll("input[data-unit]").forEach((input) => {
    const unit = input.dataset.unit;
    const shown = input.dataset.shown || "metric";
    if (input.dataset.metricMin === undefined) {
      input.dataset.metricMin = input.min;
      input.dataset.metricMax = input.max;
    }
    const label = input.parentElement?.querySelector("span");
    if (label) label.textContent = unitLabel(unit);
    if (shown === system) return;
    if (input.value !== "") {
      // Convert from the exact stored metric value, never from the rounded display.
      const metric = readMetric(input);
      input.value = String(Number(toDisplay(metric, unit).toFixed(system === "imperial" ? 2 : 4)));
      remember(input, metric);
    }
    ["min", "max"].forEach((key) => {
      const original = input.dataset[`metric${key === "min" ? "Min" : "Max"}`];
      if (original) input[key] = String(Number(toDisplay(Number(original), unit).toFixed(4)));
    });
    input.step = "any";
    input.dataset.shown = system;
  });
}

// Write a metric value into a unit-tagged input, converting for display.
export function setMetricValue(input, metric, digits = 2) {
  if (!input) return;
  const unit = input.dataset.unit;
  input.value = unit ? String(Number(toDisplay(metric, unit).toFixed(digits + 1))) : String(metric);
  if (unit) {
    input.dataset.shown = system;
    remember(input, metric);
  }
}

// Keep the exact metric value alongside the rounded display text.
function remember(input, metric) {
  input.dataset.metric = String(metric);
  input.dataset.displayed = input.value;
}

// Read an input as metric, whatever system it is displayed in.
export function readMetric(input) {
  if (!input) return NaN;
  const value = Number(input.value);
  if (!Number.isFinite(value) || input.value === "") return NaN;
  // Untouched since the last conversion: use the exact metric value, so switching units never drifts.
  if (input.dataset.metric !== undefined && input.value === input.dataset.displayed) return Number(input.dataset.metric);
  return input.dataset.unit ? fromDisplay(value, input.dataset.unit, input.dataset.shown || "metric") : value;
}
