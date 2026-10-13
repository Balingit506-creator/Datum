export const tools = {
  rangefinder: {
    crumb: "DISTANCE METER",
    eyebrow: "CAMERA RANGEFINDER",
    heading: "Measure the world<br>around you.",
    description: "Quick, non-contact distance and height estimates using your camera angle.",
    title: "Distance & height",
    icon: "⌖",
    view: "LIVE VIEW",
    instruction: "Aim at the base of your target",
    resultTitle: "ESTIMATED DISTANCE",
    resultUnit: "m",
    detail: "Enter lens height and angle to calculate.",
    disclaimer: "Estimates are approximate and depend on your device sensors and measurements.",
    controls: `<div class="form-row">
      <div class="form-group"><label class="field-label" for="lens-height">Lens height <small>above ground</small></label><div class="input-wrap"><input id="lens-height" type="number" min="0.1" max="20" step="0.01" value="1.6" data-unit="m"><span>m</span></div></div>
      <div class="form-group"><label class="field-label" for="base-angle">Base angle <small>downward</small></label><div class="input-wrap"><input id="base-angle" type="number" min="0.1" max="89" step="0.1" value="10"><span>°</span></div></div>
    </div><div class="form-group"><label class="field-label" for="top-angle">Top angle <small>upward from level</small></label><div class="input-wrap"><input id="top-angle" type="number" min="-89" max="89" step="0.1" value="15"><span>°</span></div></div>
    <button class="sensor-button" type="button" data-action="sensor">◎ &nbsp; Read device tilt sensor</button>`,
    result: "—",
    unit: "m",
    action: "Calculate distance",
    calc: "range"
  },
  ruler: {
    crumb: "AR RULER",
    eyebrow: "CAMERA MEASUREMENT",
    heading: "Measure a length<br>in your view.",
    description: "Calibrate against an object of known size, then tap two points to estimate a length.",
    title: "Calibrated ruler",
    icon: "↔",
    view: "CALIBRATION VIEW",
    instruction: "Tap the start and end of a known reference",
    resultTitle: "MEASURED LENGTH",
    resultUnit: "cm",
    detail: "First enter the known reference length, then tap its endpoints in the viewfinder.",
    disclaimer: "This browser version uses image-scale calibration; it does not have native AR plane tracking.",
    controls: `<div class="form-group"><label class="field-label" for="reference-length">Known reference length</label><div class="input-wrap"><input id="reference-length" type="number" min="0.1" step="0.1" value="10" data-unit="cm"><span>cm</span></div></div>
    <div class="form-group"><label class="field-label">Calibration <small>tap two reference endpoints</small></label><p class="field-hint" id="ruler-calibration">Not calibrated yet</p></div>
    <div class="button-row"><button class="secondary-button" type="button" data-action="freeze">❚❚ Freeze frame</button><button class="secondary-button" type="button" data-action="clear-points">↺ Clear points</button></div>`,
    result: "—",
    unit: "cm",
    action: "Calibrate / measure",
    calc: "ruler"
  },
  area: {
    crumb: "AREA & VOLUME",
    eyebrow: "CAMERA TAKE-OFF",
    heading: "Measure it once.<br>Get area and volume.",
    description: "Calibrate against a known object, tap the length, width and height, and get the area and volume instantly.",
    title: "Area & volume",
    icon: "▣",
    view: "MEASURE VIEW",
    instruction: "Tap both ends of your known reference",
    resultTitle: "ESTIMATED AREA",
    resultUnit: "m²",
    detail: "Calibrate, then tap two points for each dimension.",
    disclaimer: "Keep the reference in the same plane and distance as the surface you measure, and hold the phone square to it. Recalibrate for each new photo or angle.",
    controls: `<div class="form-group"><label class="field-label" for="reference-length">Known reference length <small>e.g. A4 long side = 29.7</small></label><div class="input-wrap"><input id="reference-length" type="number" min="0.1" step="0.1" value="29.7" data-unit="cm"><span>cm</span></div></div>
    <div class="form-group"><label class="field-label">Calibration</label><p class="field-hint" id="ruler-calibration">Not calibrated yet</p></div>
    <div class="form-group"><p class="field-label" id="area-target-label">Next tap measures</p><div class="segmented" role="radiogroup" aria-labelledby="area-target-label">
      <label><input type="radio" name="area-target" value="length" checked><span>Length</span></label>
      <label><input type="radio" name="area-target" value="width"><span>Width</span></label>
      <label><input type="radio" name="area-target" value="height"><span>Height</span></label>
    </div></div>
    <div class="form-row form-row-3">
      <div class="form-group"><label class="field-label" for="area-length">Length</label><div class="input-wrap"><input id="area-length" type="number" min="0" step="0.01" placeholder="0" data-unit="m"><span>m</span></div></div>
      <div class="form-group"><label class="field-label" for="area-width">Width</label><div class="input-wrap"><input id="area-width" type="number" min="0" step="0.01" placeholder="0" data-unit="m"><span>m</span></div></div>
      <div class="form-group"><label class="field-label" for="area-height">Height <small>opt.</small></label><div class="input-wrap"><input id="area-height" type="number" min="0" step="0.01" placeholder="0" data-unit="m"><span>m</span></div></div>
    </div>
    <div class="button-row"><button class="secondary-button" type="button" data-action="freeze">❚❚ Freeze frame</button><button class="secondary-button" type="button" data-action="clear-points">↺ Recalibrate</button></div>`,
    result: "—",
    unit: "m²",
    action: "Calculate area & volume",
    calc: "area"
  },
  counter: {
    crumb: "STEEL COUNTER",
    eyebrow: "MANUAL OBJECT COUNT",
    heading: "Count more.<br>Lose track less.",
    description: "Tap each visible steel bar to keep a quick, reliable tally while you work.",
    title: "Bar tally",
    icon: "⊹",
    view: "COUNTING VIEW",
    instruction: "Tap the viewfinder or the button to count one bar",
    resultTitle: "TOTAL COUNT",
    resultUnit: "bars",
    detail: "Manual tap counting keeps you in control—no image is uploaded.",
    disclaimer: "Counting is manual: nothing is recognised or uploaded automatically.",
    controls: `<div class="form-group"><label class="field-label">Current count <small>tap to add one</small></label><div class="input-wrap"><input id="count-input" type="number" min="0" step="1" value="0"><span>bars</span></div></div>
    <div class="button-row"><button class="secondary-button" type="button" data-action="count">＋ Count one</button><button class="secondary-button" type="button" data-action="undo-count">↶ Undo</button></div>`,
    result: "0",
    unit: "bars",
    action: "Reset count",
    calc: "counter"
  },
  level: {
    crumb: "LEVEL",
    eyebrow: "DEVICE INCLINOMETER",
    heading: "Find your<br>true level.",
    description: "Use your device motion sensor as a simple digital bubble level.",
    title: "Surface level",
    icon: "◉",
    view: "LEVEL VIEW",
    instruction: "Place your phone flat on the surface",
    resultTitle: "LEVEL DEVIATION",
    resultUnit: "°",
    detail: "Enable the sensor or adjust the angle manually.",
    disclaimer: "Sensor access requires a secure (HTTPS) page and may need permission.",
    controls: `    <div class="form-group"><label class="field-label" for="level-angle">Manual tilt <small>for desktop / no sensor</small></label><div class="input-wrap"><input id="level-angle" type="number" min="-90" max="90" step="0.1" value="0"><span>°</span></div></div>
    <button class="sensor-button" type="button" data-action="sensor">◎ &nbsp; Enable device level</button>`,
    result: "0.0",
    unit: "°",
    action: "Check level",
    calc: "level"
  },
  picture: {
    crumb: "PICTURE ALIGN",
    eyebrow: "HANGING PICTURE CALIBRATION",
    heading: "Hang it straight<br>the first time.",
    description: "Check whether a frame or wall edge is tilted before you put in the next nail.",
    title: "Picture alignment",
    icon: "▱",
    view: "ALIGNMENT VIEW",
    instruction: "Line up the guide with the top edge of your frame",
    resultTitle: "FRAME TILT",
    resultUnit: "°",
    detail: "A level reading near zero means your picture is straight.",
    disclaimer: "Use the live guide as a reference; camera perspective can affect the reading.",
    controls: `<div class="form-group"><label class="field-label" for="picture-angle">Frame tilt <small>adjust or use sensor</small></label><div class="input-wrap"><input id="picture-angle" type="number" min="-45" max="45" step="0.1" value="0"><span>°</span></div></div>
    <button class="sensor-button" type="button" data-action="sensor">◎ &nbsp; Read device tilt sensor</button>`,
    result: "0.0",
    unit: "°",
    action: "Check alignment",
    calc: "picture"
  },
  straightedge: {
    crumb: "STRAIGHT EDGE",
    eyebrow: "ON-SCREEN RULER",
    heading: "A ruler, wherever<br>you need one.",
    description: "Calibrate the ruler against a real object, then use your screen to check small items.",
    title: "Screen ruler",
    icon: "╱",
    view: "RULER",
    instruction: "Adjust calibration to match a real-world reference",
    resultTitle: "RULER SCALE",
    resultUnit: "cm",
    detail: "The ruler updates with your calibration value.",
    disclaimer: "Screen size and pixel density vary; always calibrate before measuring.",
    controls: `<div class="form-group"><label class="field-label" for="screen-calibration">Calibration <small>pixels per centimeter</small></label><div class="input-wrap"><input id="screen-calibration" type="number" min="1" max="300" step="1" value="38"><span>px/cm</span></div></div>
    <div class="form-group"><label class="field-label" for="ruler-length">Object width on screen</label><div class="input-wrap"><input id="ruler-length" type="number" min="0" step="0.1" value="5" data-unit="cm"><span>cm</span></div></div>`,
    result: "38",
    unit: "px/cm",
    action: "Update ruler",
    calc: "straightedge"
  },
  angle: {
    crumb: "ANGLE METER",
    eyebrow: "ANGLE MEASUREMENT",
    heading: "Check any angle<br>in a moment.",
    description: "Measure the tilt of a surface or use your phone as a simple inclinometer.",
    title: "Angle reading",
    icon: "∠",
    view: "ANGLE VIEW",
    instruction: "Hold your device against the surface",
    resultTitle: "CURRENT ANGLE",
    resultUnit: "°",
    detail: "Enter an angle or read the device motion sensor.",
    disclaimer: "Sensor readings depend on how your device is held and may need calibration.",
    controls: `    <div class="form-group"><label class="field-label" for="angle-value">Angle <small>manual input</small></label><div class="input-wrap"><input id="angle-value" type="number" min="-180" max="180" step="0.1" value="0"><span>°</span></div></div>
    <button class="sensor-button" type="button" data-action="sensor">◎ &nbsp; Read device angle</button>`,
    result: "0.0",
    unit: "°",
    action: "Read angle",
    calc: "angle"
  }
};

export const defaultTool = "rangefinder";
