import { tools, defaultTool } from './config/tools.js';
import { searchStandardGuides } from './config/standard-search.js';
import { createAppState } from './core/state.js';
import { getUnits, setUnits, onUnitsChange, syncInputs, setMetricValue, convertText, convertMarkup, toDisplay, unitLabel } from './core/units.js';
import { initDrawings } from './features/drawings.js';
import { initRoomSchedule } from './features/room-schedule.js';
import { estimators, createEstimatorView, chbWallSvg } from './features/estimators.js';
import { clamp, numericValue, calculateDistance, calculateAreaVolume, calculateChbQuantity, formatLevelDetail, createRulerMarkup } from './utils/measurement.js';

const elements = Object.fromEntries([
  "crumb",
  "eyebrow",
  "heading",
  "description",
  "camera-state",
  "camera-button",
  "camera-stage",
  "camera-video",
  "camera-placeholder",
  "camera-hud",
  "hud-angle",
  "hud-caption",
  "stage-instruction",
  "resolution-label",
  "view-label",
  "view-tip",
  "controls",
  "control-title",
  "tool-icon",
  "result-title",
  "result-value",
  "result-unit",
  "result-detail",
  "primary-button",
  "disclaimer",
  "toast",
  "level-overlay",
  "calibration-target"
].map((id) => [id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()), document.getElementById(id)]));

const state = createAppState();
const standardsView = document.getElementById("standards-view");
const chbCalculatorView = document.getElementById("chb-calculator-view");
const measurementHeading = document.querySelector(".page-heading");
const workbench = document.querySelector(".workbench");
const cameraState = document.querySelector(".camera-state");
const APP_NAME = "Datum";
const THEME_KEY = "datum-theme";
const standardSearchForm = document.getElementById("standard-search-form");
const standardSearchInput = document.getElementById("standard-search-input");
const standardSearchResults = document.getElementById("standard-search-results");
let activeSection = "measurements";

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2600);
}

// value may be a full-precision number (formatted to `digits`) or a ready-made string.
function updateResult(value, unit, detail, digits = 2) {
  // Results are passed in metric; keep them so a unit switch can redisplay them.
  state.lastResult = [value, unit, detail, digits];
  const number = Number(String(value).replace(/,/g, ""));
  const decimals = typeof value === "number" ? digits : (String(value).split(".")[1] || "").length;
  const converted = unitLabel(unit) !== unit && Number.isFinite(number);
  state.currentResult = value;
  elements.resultValue.textContent = converted ? toDisplay(number, unit).toFixed(Math.max(decimals, 1)) : typeof value === "number" ? value.toFixed(digits) : value;
  elements.resultUnit.textContent = unitLabel(unit);
  elements.resultDetail.textContent = convertText(detail);
  replayAnimation(elements.resultValue, "bump");
}

// Restart a CSS animation class so repeated updates still animate.
function replayAnimation(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function updateHud() {
  elements.hudAngle.textContent = `${state.sensorAngle.toFixed(1)}°`;
  const offset = clamp(state.sensorAngle * 2.2, -95, 95);
  const bubble = elements.levelOverlay.querySelector("span");
  if (bubble) bubble.style.left = `calc(50% + ${offset}px)`;
  elements.levelOverlay.style.transform = `translate(-50%, -50%) rotate(${state.sensorAngle}deg)`;
  elements.levelOverlay.classList.toggle("is-level", Math.abs(state.sensorAngle) < 0.15);
}

// Manual angle fields drive the same HUD and bubble as the motion sensor.
const manualAngleFields = { level: "level-angle", picture: "picture-angle", angle: "angle-value" };

function syncManualAngle() {
  const fieldId = manualAngleFields[state.activeTool];
  const angle = fieldId ? numericValue(fieldId) : 0;
  state.sensorAngle = Number.isFinite(angle) ? clamp(angle, -90, 90) : 0;
  updateHud();
}

function markSensorButtons() {
  elements.controls.querySelectorAll('[data-action="sensor"]').forEach((button) => {
    button.classList.add("is-active");
    button.textContent = "● Sensor live: move your device";
  });
}

function clearMeasureLine() {
  elements.cameraStage.querySelector(".measure-line")?.remove();
}

function drawMeasureLine(from, to) {
  clearMeasureLine();
  const svgNs = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNs, "svg");
  svg.setAttribute("class", "measure-line");
  svg.setAttribute("aria-hidden", "true");
  const line = document.createElementNS(svgNs, "line");
  Object.entries({ x1: from.x, y1: from.y, x2: to.x, y2: to.y }).forEach(([key, value]) => line.setAttribute(key, value));
  svg.appendChild(line);
  [from, to].forEach((point) => {
    const dot = document.createElementNS(svgNs, "circle");
    Object.entries({ cx: point.x, cy: point.y, r: 5 }).forEach(([key, value]) => dot.setAttribute(key, value));
    svg.appendChild(dot);
  });
  elements.cameraStage.appendChild(svg);
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme) root.dataset.theme = theme;
  const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  const toggle = document.getElementById("theme-toggle");
  toggle.textContent = dark ? "☼" : "◐";
  toggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  document.querySelector('meta[name="theme-color"]').content = dark ? "#0f0d0b" : "#f5f2ec";
  return dark;
}

function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function toggleTheme() {
  const dark = applyTheme();
  const next = dark ? "light" : "dark";
  applyTheme(next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    // Storage may be unavailable (private mode); the theme still applies for this visit.
  }
}

function renderTool(toolName) {
  activeSection = "measurements";
  state.activeTool = toolName;
  const tool = tools[toolName];
  measurementHeading.hidden = false;
  workbench.hidden = false;
  Object.values(sections).forEach(({ view }) => { view.hidden = true; });
  cameraState.hidden = false;
  document.title = `${tool.title} · ${APP_NAME}`;

  state.lastTapPoint = null;
  elements.cameraStage.dataset.referenceSpan = "";
  elements.calibrationTarget.style.display = "none";
  clearMeasureLine();
  unfreezeFrame();

  elements.crumb.textContent = tool.crumb;
  elements.eyebrow.textContent = tool.eyebrow;
  elements.heading.innerHTML = tool.heading;
  elements.description.textContent = tool.description;
  elements.controlTitle.textContent = tool.title;
  elements.toolIcon.textContent = tool.icon;
  elements.viewLabel.textContent = tool.view;
  elements.cameraButton.style.visibility = toolName === "straightedge" ? "hidden" : "visible";
  elements.stageInstruction.textContent = tool.instruction;
  elements.controls.innerHTML = tool.controls;
  syncInputs(elements.controls);
  state.lastResult = null;
  elements.resultTitle.textContent = tool.resultTitle;
  elements.resultValue.textContent = tool.result;
  elements.resultUnit.textContent = tool.unit;
  elements.resultDetail.textContent = tool.detail;
  elements.primaryButton.innerHTML = `${tool.action} <span aria-hidden="true">↗</span>`;

  if (toolName === "counter") {
    elements.controls.querySelector("#count-input").value = String(state.counterValue);
    elements.resultValue.textContent = String(state.counterValue);
  }

  elements.disclaimer.textContent = tool.disclaimer;
  elements.hudCaption.textContent =
    toolName === "rangefinder"
      ? "TILT ANGLE"
      : toolName === "level" || toolName === "picture" || toolName === "angle"
        ? "ANGLE"
        : tool.view;

  elements.cameraStage.classList.remove("counter-mode", "level-mode", "picture-mode", "ruler-mode", "straightedge-mode", "tool-ruler");
  if (toolName === "counter") elements.cameraStage.classList.add("counter-mode");
  if (toolName === "level") elements.cameraStage.classList.add("level-mode");
  if (toolName === "picture") elements.cameraStage.classList.add("picture-mode");
  if (tapMeasureTools.has(toolName)) elements.cameraStage.classList.add("ruler-mode", "tool-ruler");
  if (toolName === "straightedge") elements.cameraStage.classList.add("straightedge-mode");

  setActiveLink((button) => button.dataset.tool === toolName);

  if (toolName === "straightedge") drawRuler();
  if (state.sensorActive) markSensorButtons();
  state.currentResult = tool.result;
  syncManualAngle();
  replayAnimation(workbench, "view-enter");
}

const estimatorView = document.getElementById("estimator-view");
const estimatorPage = createEstimatorView(estimatorView, (message) => showToast(message));
let chbVisualTimer;

const sections = {
  standards: { view: standardsView, crumb: "ARCHITECTURAL STANDARDS", title: "Architectural standards" },
  "chb-calculator": { view: chbCalculatorView, crumb: "CHB CALCULATOR", title: "CHB calculator", onShow: () => calculateChbForm({ animate: true }) },
  ...Object.fromEntries(Object.entries(estimators).map(([key, est]) => [key, { view: estimatorView, crumb: est.crumb, title: est.title, onShow: () => estimatorPage.render(key) }]))
};

function setActiveLink(predicate) {
  document.querySelectorAll(".tool-link").forEach((button) => {
    const selected = predicate(button);
    button.classList.toggle("active", selected);
    if (selected) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
}

function renderSection(name) {
  const section = sections[name];
  activeSection = name;
  if (state.cameraStream) stopCamera();
  measurementHeading.hidden = true;
  workbench.hidden = true;
  cameraState.hidden = true;
  Object.values(sections).forEach(({ view }) => { view.hidden = view !== section.view; });
  elements.crumb.textContent = section.crumb;
  document.title = `${section.title} · ${APP_NAME}`;
  setActiveLink((button) => button.dataset.section === name);
  replayAnimation(section.view, "view-enter");
  section.onShow?.();
}

function route() {
  const name = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
  if (sections[name]) return renderSection(name);
  renderTool(tools[name] ? name : defaultTool);
}

function calculateChbForm({ animate = false } = {}) {
  const values = {
    wallWidth: numericValue("chb-wall-width"),
    wallHeight: numericValue("chb-wall-height"),
    blockLength: numericValue("chb-length"),
    blockHeight: numericValue("chb-height"),
    openingsArea: numericValue("chb-openings"),
    wastePercent: numericValue("chb-waste")
  };
  const valuesAreValid =
    values.wallWidth > 0 &&
    values.wallHeight > 0 &&
    values.blockLength > 0 &&
    values.blockHeight > 0 &&
    values.openingsArea >= 0 &&
    values.wastePercent >= 0 &&
    values.wastePercent <= 100;

  if (!valuesAreValid) {
    document.getElementById("chb-total").textContent = "—";
    document.getElementById("chb-result-detail").textContent =
      "Enter positive wall and block dimensions, openings from zero up, and an allowance from 0% to 100%.";
    document.getElementById("chb-net-area").textContent = "—";
    document.getElementById("chb-module-area").textContent = "—";
    document.getElementById("chb-base-count").textContent = "—";
    return;
  }

  const calculation = calculateChbQuantity(values);
  if (calculation.netArea <= 0) {
    document.getElementById("chb-total").textContent = "—";
    document.getElementById("chb-result-detail").textContent =
      "The openings area must be smaller than the gross wall area.";
    document.getElementById("chb-net-area").textContent = "—";
    document.getElementById("chb-module-area").textContent = `${calculation.moduleArea.toFixed(3)} m²`;
    document.getElementById("chb-base-count").textContent = "—";
    return;
  }

  document.getElementById("chb-total").textContent = String(calculation.totalCount);
  document.getElementById("chb-result-detail").textContent =
    `For ${calculation.netArea.toFixed(2)} m²: about ${calculation.baseCount.toFixed(1)} blocks by area, or ${calculation.totalCount} blocks including ${values.wastePercent}% allowance.`;
  document.getElementById("chb-net-area").textContent = `${calculation.netArea.toFixed(2)} m²`;
  document.getElementById("chb-module-area").textContent = `${calculation.moduleArea.toFixed(3)} m²`;
  document.getElementById("chb-base-count").textContent = `${calculation.baseCount.toFixed(1)} blocks`;
  replayAnimation(document.getElementById("chb-total"), "bump");

  // Redraw the animated wall once typing pauses, so it does not restart on every keystroke.
  clearTimeout(chbVisualTimer);
  ["chb-result-detail", "chb-net-area", "chb-module-area"].forEach((id) => {
    const el = document.getElementById(id);
    el.textContent = convertText(el.textContent);
  });
  const drawWall = () => { document.getElementById("chb-visual").innerHTML = convertMarkup(chbWallSvg(values)); };
  if (animate) drawWall();
  else chbVisualTimer = setTimeout(drawWall, 450);
}

function appendTextElement(parent, tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  parent.appendChild(element);
  return element;
}

function renderStandardSearchResults(query) {
  const guides = searchStandardGuides(query);
  standardSearchResults.replaceChildren();

  if (!query.trim()) {
    appendTextElement(standardSearchResults, "p", "search-prompt", "Enter a topic to see a suggested starting point, code context, and a step-by-step planning checklist.");
    standardSearchInput.focus();
    return;
  }

  if (guides.length === 0) {
    appendTextElement(standardSearchResults, "p", "search-empty", `No matching guide found for “${query.trim()}”. Try a topic such as office door, corridor, wall thickness, room ventilation, or stairs.`);
    return;
  }

  appendTextElement(
    standardSearchResults,
    "p",
    "search-count",
    `${guides.length} ${guides.length === 1 ? "planning guide" : "planning guides"} found`
  );

  guides.forEach((guide) => {
    const article = document.createElement("article");
    article.className = "search-result-card";
    const header = document.createElement("div");
    header.className = "search-result-heading";
    const titleGroup = document.createElement("div");
    appendTextElement(titleGroup, "p", "eyebrow", guide.category);
    appendTextElement(titleGroup, "h3", "", guide.title);
    header.appendChild(titleGroup);
    appendTextElement(header, "span", "search-range", guide.range);
    article.appendChild(header);

    appendTextElement(article, "h4", "suggestion-label", "Design suggestion");
    appendTextElement(article, "p", "search-suggestion", guide.suggestion);
    appendTextElement(article, "p", "search-basis", guide.basis);
    appendTextElement(article, "h4", "suggestion-label", "Steps to follow");
    const steps = document.createElement("ol");
    steps.className = "search-steps";
    guide.steps.forEach((step) => appendTextElement(steps, "li", "", step));
    article.appendChild(steps);

    const sources = document.createElement("div");
    sources.className = "search-sources";
    guide.references.forEach((reference) => {
      const link = document.createElement("a");
      link.className = "code-source";
      link.href = reference.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = `${reference.label} ↗`;
      sources.appendChild(link);
    });
    article.appendChild(sources);
    standardSearchResults.appendChild(article);
  });
}

function calculateRange() {
  const lensHeight = numericValue("lens-height");
  const baseDegrees = numericValue("base-angle");
  const topDegrees = numericValue("top-angle");

  if (!(lensHeight > 0) || !(baseDegrees > 0 && baseDegrees < 89) || !Number.isFinite(topDegrees) || topDegrees < -89 || topDegrees > 89) {
    showToast("Enter a positive lens height and valid angle values.");
    return;
  }

  const { distance, height } = calculateDistance(lensHeight, baseDegrees, topDegrees);
  if (!Number.isFinite(distance) || !Number.isFinite(height) || distance > 10000) {
    showToast("These values are outside the useful measuring range.");
    return;
  }

  updateResult(`${distance.toFixed(2)}`, "m", `Estimated target height: ${Math.max(0, height).toFixed(2)} m`);
  showToast("Distance and height estimate updated.");
}

function calculateRuler() {
  const known = numericValue("reference-length");
  if (!(known > 0)) {
    showToast("Enter a known reference length greater than zero.");
    return;
  }

  elements.stageInstruction.textContent = elements.cameraStage.dataset.referenceSpan
    ? "Reference calibrated · tap two points on your object"
    : "Tap two endpoints of a known reference";

  showToast(elements.cameraStage.dataset.referenceSpan
    ? "Calibration ready. Tap two endpoints of the object."
    : "Tap two endpoints of a known reference in the viewfinder.");
}

// Tools that use the calibrate-then-tap two-point flow.
const tapMeasureTools = new Set(["ruler", "area"]);
const areaDimensions = ["length", "width", "height"];

function selectedAreaTarget() {
  return elements.controls.querySelector('input[name="area-target"]:checked')?.value ?? "length";
}

function recordAreaDimension(centimeters) {
  const target = selectedAreaTarget();
  const meters = centimeters / 100;
  const field = document.getElementById(`area-${target}`);
  setMetricValue(field, meters);
  showToast(`${target[0].toUpperCase()}${target.slice(1)} set to ${meters.toFixed(2)} m.`);

  // Advance to the next empty dimension so the user can keep tapping.
  const next = areaDimensions.find((name) => !(numericValue(`area-${name}`) > 0));
  if (next) {
    elements.controls.querySelector(`input[name="area-target"][value="${next}"]`).checked = true;
    elements.stageInstruction.textContent = `Now tap both ends of the ${next}`;
  } else {
    elements.stageInstruction.textContent = "All dimensions measured · tap again to remeasure";
  }
  calculateArea({ quiet: true });
}

function calculateArea({ quiet = false } = {}) {
  const length = numericValue("area-length");
  const width = numericValue("area-width");
  const height = numericValue("area-height");

  if (!(length > 0 && width > 0)) {
    updateResult("—", "m²", "Measure or enter a length and width to get the area.");
    if (!quiet) showToast("Enter or measure both a length and a width.");
    return;
  }

  const { area, volume, perimeter } = calculateAreaVolume({ length, width, height: height > 0 ? height : 0 });
  const volumeText = volume === null
    ? "Add a height or depth to get the volume."
    : `Volume: ${volume.toFixed(3)} m³ (${(volume * 1000).toFixed(0)} L).`;
  updateResult(area, "m²", `${length.toFixed(2)} × ${width.toFixed(2)} m · perimeter ${perimeter.toFixed(2)} m. ${volumeText}`);
  if (!quiet) showToast("Area and volume updated.");
}

function toggleFreezeFrame() {
  if (elements.cameraStage.querySelector(".freeze-frame")) {
    unfreezeFrame();
    showToast("Live view resumed.");
    return;
  }
  const video = elements.cameraVideo;
  if (!state.cameraStream || !video.videoWidth) {
    showToast("Start the camera first, then freeze a frame to measure on.");
    return;
  }
  const canvas = document.createElement("canvas");
  canvas.className = "freeze-frame";
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  elements.cameraStage.insertBefore(canvas, video.nextSibling);
  video.pause();
  setFreezeButtonLabel("▶ Resume live");
  elements.viewLabel.textContent = "FROZEN FRAME";
  showToast("Frame frozen. Tap points on the still image.");
}

function unfreezeFrame() {
  const frame = elements.cameraStage.querySelector(".freeze-frame");
  if (!frame) return;
  frame.remove();
  if (state.cameraStream) elements.cameraVideo.play().catch(() => {});
  setFreezeButtonLabel("❚❚ Freeze frame");
  elements.viewLabel.textContent = tools[state.activeTool].view;
}

function setFreezeButtonLabel(label) {
  const button = elements.controls.querySelector('[data-action="freeze"]');
  if (button) button.textContent = label;
}

function calculateLevel(fieldId, resultLabel) {
  const angle = fieldId ? numericValue(fieldId) : state.sensorAngle;
  if (!Number.isFinite(angle)) {
    showToast("Enter a valid angle.");
    return;
  }

  const normalized = Math.abs(angle) < 0.15 ? 0 : angle;
  const levelInfo = formatLevelDetail(normalized, resultLabel ?? "");
  updateResult(levelInfo.value, levelInfo.unit, levelInfo.detail);
}

function runPrimaryAction() {
  if (state.activeTool === "rangefinder") return calculateRange();
  if (state.activeTool === "ruler") return calculateRuler();
  if (state.activeTool === "area") return calculateArea();
  if (state.activeTool === "counter") {
    state.counterValue = 0;
    const field = document.getElementById("count-input");
    if (field) field.value = "0";
    updateResult("0", "bars", "Count reset. Tap the viewfinder or count button to begin.");
    showToast("Count reset.");
    return;
  }
  if (state.activeTool === "level") return calculateLevel("level-angle");
  if (state.activeTool === "picture") return calculateLevel("picture-angle", "frame alignment");
  if (state.activeTool === "angle") {
    const angle = numericValue("angle-value");
    if (!Number.isFinite(angle) || Math.abs(angle) > 180) return showToast("Enter an angle between −180° and 180°.");
    updateResult(`${angle.toFixed(1)}`, "°", "Manual angle reading.");
    return;
  }
  if (state.activeTool === "straightedge") {
    const calibration = numericValue("screen-calibration");
    const width = numericValue("ruler-length");
    if (!(calibration > 0) || !(width >= 0)) return showToast("Enter valid calibration and object width values.");
    updateResult(`${calibration.toFixed(0)}`, "px/cm", `Calibrated ruler · ${width.toFixed(1)} cm object width`);
    drawRuler();
  }
}

function drawRuler() {
  const calibration = numericValue("screen-calibration") || 38;
  const pixelsPerCentimeter = Math.min(Math.max(calibration, 1), 300);
  const displayWidth = Math.min(300, pixelsPerCentimeter * 6);

  let ruler = elements.cameraStage.querySelector(".ruler-display");
  if (!ruler) {
    ruler = document.createElement("div");
    ruler.className = "ruler-display";
    ruler.innerHTML = '<div class="ruler-ticks"></div><div class="ruler-numbers"></div>';
    elements.cameraStage.appendChild(ruler);
  }

  ruler.style.setProperty("--px-per-cm", `${pixelsPerCentimeter}px`);
  ruler.style.width = `${displayWidth}px`;
  const { ticks, numbers } = createRulerMarkup(pixelsPerCentimeter);
  ruler.querySelector(".ruler-ticks").innerHTML = ticks;
  ruler.querySelector(".ruler-numbers").innerHTML = numbers;

  // Shade the requested object width so it can be checked against the real item.
  let objectBand = ruler.querySelector(".ruler-object");
  if (!objectBand) {
    objectBand = document.createElement("div");
    objectBand.className = "ruler-object";
    ruler.prepend(objectBand);
  }
  const objectWidth = numericValue("ruler-length");
  objectBand.style.width = `${Math.min(displayWidth, Math.max(0, objectWidth || 0) * pixelsPerCentimeter)}px`;
}

async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showToast("Camera access is unavailable. Open this page over HTTPS or localhost.");
    return;
  }

  try {
    state.cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });

    elements.cameraVideo.srcObject = state.cameraStream;
    elements.cameraVideo.style.display = "block";
    elements.cameraPlaceholder.style.display = "none";
    elements.cameraButton.innerHTML = '<span aria-hidden="true">◉</span> Stop camera';
    elements.cameraState.textContent = "Camera connected";
    document.querySelector(".camera-state").classList.add("connected");
    elements.resolutionLabel.textContent = "CAMERA ON";
    showToast("Camera started. Keep your device steady while measuring.");
  } catch (error) {
    const message = error && error.name === "NotAllowedError"
      ? "Camera permission was denied. Allow camera access in your browser settings."
      : error && error.name === "NotFoundError"
        ? "No camera was found on this device."
        : "Could not start the camera. Check browser permissions and try again.";
    showToast(message);
  }
}

function stopCamera() {
  unfreezeFrame();
  if (state.cameraStream) state.cameraStream.getTracks().forEach((track) => track.stop());
  state.cameraStream = undefined;
  elements.cameraVideo.srcObject = null;
  elements.cameraVideo.style.display = "none";
  elements.cameraPlaceholder.style.display = "flex";
  elements.cameraButton.innerHTML = '<span aria-hidden="true">◉</span> Start camera';
  elements.cameraState.textContent = "Camera not connected";
  document.querySelector(".camera-state").classList.remove("connected");
  elements.resolutionLabel.textContent = "CAMERA OFF";
}

async function enableSensor() {
  if (!("DeviceOrientationEvent" in window)) {
    showToast("Device orientation is not supported here. Use the manual angle field.");
    return;
  }

  try {
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== "granted") {
        showToast("Motion sensor permission was not granted.");
        return;
      }
    }

    window.addEventListener("deviceorientation", onDeviceOrientation);
    state.sensorActive = true;
    markSensorButtons();
    showToast("Motion sensor enabled. Move your device to update the angle.");
  } catch (error) {
    showToast("Could not enable the motion sensor. Check browser permissions.");
  }
}

function onDeviceOrientation(event) {
  const beta = Number.isFinite(event.beta) ? event.beta : 0;
  const gamma = Number.isFinite(event.gamma) ? event.gamma : 0;
  state.sensorAngle = clamp(gamma, -90, 90);
  const pitch = clamp(beta - 90, -90, 90);

  if (state.activeTool === "rangefinder") {
    const field = document.getElementById("base-angle");
    if (field) field.value = Math.max(0.1, Math.abs(pitch)).toFixed(1);
    state.sensorAngle = pitch;
  } else {
    const field = document.getElementById(
      state.activeTool === "picture"
        ? "picture-angle"
        : state.activeTool === "angle"
          ? "angle-value"
          : "level-angle"
    );
    if (field) field.value = state.sensorAngle.toFixed(1);
  }

  updateHud();
  if (state.activeTool === "level") calculateLevel(null);
  if (state.activeTool === "picture") calculateLevel(null, "frame alignment");
  if (state.activeTool === "angle") updateResult(`${state.sensorAngle.toFixed(1)}`, "°", "Live device sensor reading.");
}

function addCount() {
  state.counterValue += 1;
  const field = document.getElementById("count-input");
  if (field) field.value = String(state.counterValue);
  updateResult(String(state.counterValue), "bars", "Tap to add each visible bar.");
}

// Navigation goes through the URL hash so every tool and reference page is linkable.
document.querySelectorAll(".tool-link").forEach((button) => {
  button.addEventListener("click", () => {
    const target = `#/${button.dataset.tool ?? button.dataset.section}`;
    if (location.hash === target) route();
    else location.hash = target;
    document.getElementById("main").focus({ preventScroll: true });
  });
});
window.addEventListener("hashchange", route);
document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
document.getElementById("chb-form").addEventListener("submit", (event) => {
  event.preventDefault();
  calculateChbForm({ animate: true });
});
document.getElementById("chb-replay").addEventListener("click", () => calculateChbForm({ animate: true }));
document.getElementById("chb-form").addEventListener("input", calculateChbForm);
standardSearchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderStandardSearchResults(standardSearchInput.value);
});
document.querySelectorAll(".search-example").forEach((button) => {
  button.addEventListener("click", () => {
    standardSearchInput.value = button.dataset.query;
    renderStandardSearchResults(button.dataset.query);
  });
});
elements.cameraButton.addEventListener("click", () => (state.cameraStream ? stopCamera() : startCamera()));
elements.primaryButton.addEventListener("click", runPrimaryAction);

elements.controls.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "sensor") return enableSensor();
  if (action === "count") return addCount();
  if (action === "undo-count") {
    state.counterValue = Math.max(0, state.counterValue - 1);
    const field = document.getElementById("count-input");
    if (field) field.value = String(state.counterValue);
    updateResult(String(state.counterValue), "bars", "Last count undone.");
    return;
  }
  if (action === "clear-points") {
    state.lastTapPoint = null;
    elements.cameraStage.dataset.referenceSpan = "";
    elements.calibrationTarget.style.display = "none";
    clearMeasureLine();
    const calibration = document.getElementById("ruler-calibration");
    if (calibration) {
      calibration.textContent = "Not calibrated yet";
      calibration.classList.remove("is-ready");
    }
    const tool = tools[state.activeTool];
    elements.stageInstruction.textContent = tool.instruction;
    if (state.activeTool === "area") calculateArea({ quiet: true });
    else updateResult("—", tool.unit, tool.detail);
    showToast("Calibration cleared. Tap both ends of your reference again.");
  }
  if (action === "freeze") return toggleFreezeFrame();
});

elements.controls.addEventListener("input", (event) => {
  if (event.target.id === "count-input") {
    state.counterValue = Math.max(0, Math.floor(Number(event.target.value) || 0));
    updateResult(String(state.counterValue), "bars", "Manual count.");
  }
  if (event.target.id === "screen-calibration" || event.target.id === "ruler-length") drawRuler();
  if (event.target.id.startsWith("area-")) calculateArea({ quiet: true });
  if (Object.values(manualAngleFields).includes(event.target.id) && !state.sensorActive) {
    syncManualAngle();
    runPrimaryAction();
  }
});

elements.cameraStage.addEventListener("click", (event) => {
  if (state.activeTool === "counter") return addCount();

  if (tapMeasureTools.has(state.activeTool)) {
    const bounds = elements.cameraStage.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    if (!state.lastTapPoint) {
      clearMeasureLine();
      state.lastTapPoint = { x, y };
      elements.calibrationTarget.style.display = "block";
      elements.calibrationTarget.style.left = `${x}px`;
      elements.calibrationTarget.style.top = `${y}px`;
      showToast("First point marked. Tap the second endpoint.");
      return;
    }

    const distance = Math.hypot(x - state.lastTapPoint.x, y - state.lastTapPoint.y);
    const referenceSpan = Number(elements.cameraStage.dataset.referenceSpan);
    drawMeasureLine(state.lastTapPoint, { x, y });

    if (distance < 4) {
      showToast("Those points are too close together. Tap two separate endpoints.");
    } else if (!referenceSpan) {
      elements.cameraStage.dataset.referenceSpan = String(distance);
      const calibration = document.getElementById("ruler-calibration");
      if (calibration) {
        calibration.textContent = `Calibrated · ${distance.toFixed(0)} px reference`;
        calibration.classList.add("is-ready");
      }
      elements.stageInstruction.textContent = "Reference calibrated · tap two points on your object";
      showToast(`Reference calibrated: ${distance.toFixed(0)} px.`);
    } else {
      const known = numericValue("reference-length");
      if (known > 0 && state.activeTool === "area") {
        recordAreaDimension(distance * known / referenceSpan);
      } else if (known > 0) {
        updateResult(`${(distance * known / referenceSpan).toFixed(1)}`, "cm", "Length estimated using your tapped reference scale.");
        showToast("Length estimate updated.");
      } else {
        showToast("Enter a known reference length greater than zero.");
      }
    }

    state.lastTapPoint = null;
    elements.calibrationTarget.style.display = "none";
  }
});

document.getElementById("help-button").addEventListener("click", () => {
  if (activeSection === "chb-calculator") {
    showToast("Estimate = net wall area ÷ CHB module face area, then round up after adding the allowance.");
    return;
  }
  if (activeSection === "standards") {
    showToast("Use these as early-planning references only. Confirm dimensions against your local building and accessibility codes.");
    return;
  }
  showToast(tools[state.activeTool].disclaimer);
});
window.addEventListener("pagehide", () => {
  if (state.cameraStream) state.cameraStream.getTracks().forEach((track) => track.stop());
  if (state.sensorActive) window.removeEventListener("deviceorientation", onDeviceOrientation);
});

const drawingLab = initDrawings(document.getElementById("drawing-lab"));
const roomSchedule = initRoomSchedule(document.querySelector("[data-room-schedule]"), drawingLab);

// Static reference values keep their metric text so they can be converted back and forth.
function convertStaticText() {
  document.querySelectorAll(".standards-view .dimension-list dd, .standards-view .standard-note").forEach((el) => {
    el.dataset.metricText ??= el.textContent;
    el.textContent = convertText(el.dataset.metricText);
  });
}

function applyUnits() {
  document.querySelectorAll('input[name="unit-system"]').forEach((input) => { input.checked = input.value === getUnits(); });
  syncInputs(document);
  convertStaticText();
  const standardsTag = document.querySelector(".standards-view .standards-unit");
  if (standardsTag) standardsTag.textContent = getUnits() === "imperial" ? "IMPERIAL · ft / in" : "METRIC · mm / m";
  if (state.lastResult) updateResult(...state.lastResult);
  if (activeSection === "chb-calculator") calculateChbForm({ animate: false });
  estimatorPage.refresh();
  drawingLab?.refresh();
  roomSchedule?.refresh();
}

document.querySelector(".unit-switch").addEventListener("change", (event) => setUnits(event.target.value));
onUnitsChange(() => {
  applyUnits();
  showToast(getUnits() === "imperial" ? "Showing imperial units (ft, in, ft², gal)." : "Showing metric units (m, mm, m², L).");
});
applyUnits();
applyTheme(readStoredTheme());
route();
