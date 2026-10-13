export function createAppState() {
  return {
    activeTool: "rangefinder",
    cameraStream: undefined,
    toastTimer: undefined,
    sensorAngle: 0,
    sensorActive: false,
    lastTapPoint: null,
    counterValue: 0,
    currentResult: "—"
  };
}
