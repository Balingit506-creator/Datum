// Room-by-room planning standards: door sizes and room sizes.
// Code minimums cite PD 1096 / BP 344; everything else is common Philippine residential practice.
// Sizes are in millimetres (doors) and metres (rooms).

export const roomStandards = [
  {
    id: "entrance", name: "Main entrance", group: "Living",
    door: { width: 1000, height: 2100, range: "900–1,000 × 2,100", leaves: 1, minWidth: 900, minHeight: 2000 },
    room: { label: "Foyer", codeArea: null, minArea: 2.25, least: 1.5, typical: "1.5 × 1.5 m+" },
    exit: true, accessible: true,
    note: "Main exit door. Swing it in the direction of exit travel where required."
  },
  {
    id: "living", name: "Living room", group: "Living",
    door: { width: 900, height: 2100, range: "900 × 2,100 or open", leaves: 1, minWidth: 800, minHeight: 2000 },
    room: { label: "Living room", codeArea: 6, codeLeast: 2, minArea: 12, least: 3, typical: "3.0 × 4.0 m (12–20 m²)" },
    accessible: true,
    note: "Habitable room. Plan furniture first; 3.0 m is a comfortable least dimension."
  },
  {
    id: "dining", name: "Dining room", group: "Living",
    door: { width: 900, height: 2100, range: "900 × 2,100 or open", leaves: 1, minWidth: 800, minHeight: 2000 },
    room: { label: "Dining room", codeArea: 6, codeLeast: 2, minArea: 9, least: 2.7, typical: "3.0 × 3.0 m (9–12 m²)" },
    note: "Allow about 900 mm behind chairs for circulation around a 4–6 seat table."
  },
  {
    id: "kitchen", name: "Kitchen", group: "Service",
    door: { width: 900, height: 2100, range: "800–900 × 2,100", leaves: 1, minWidth: 800, minHeight: 2000 },
    room: { label: "Kitchen", codeArea: 3, codeLeast: 1.5, minArea: 3, least: 1.5, typical: "2.4 × 3.0 m (7–10 m²)" },
    note: "NBC minimum is 3.00 m² with a 1.50 m least dimension (Rule VIII §806)."
  },
  {
    id: "master", name: "Master bedroom", group: "Private",
    door: { width: 900, height: 2100, range: "900 × 2,100", leaves: 1, minWidth: 800, minHeight: 2000 },
    room: { label: "Master bedroom", codeArea: 6, codeLeast: 2, minArea: 12, least: 3, typical: "3.6 × 4.0 m (14–18 m²)" },
    note: "Fits a queen or king bed with 600–700 mm on each side."
  },
  {
    id: "bedroom", name: "Bedroom", group: "Private",
    door: { width: 800, height: 2100, range: "800–900 × 2,100", leaves: 1, minWidth: 700, minHeight: 2000 },
    room: { label: "Bedroom", codeArea: 6, codeLeast: 2, minArea: 9, least: 2.7, typical: "3.0 × 3.0 m (9–12 m²)" },
    note: "NBC minimum is 6.00 m² with a 2.00 m least dimension for habitable rooms."
  },
  {
    id: "bath", name: "Toilet & bath", group: "Service",
    door: { width: 700, height: 2100, range: "700–800 × 2,100", leaves: 1, minWidth: 600, minHeight: 2000 },
    room: { label: "Toilet & bath", codeArea: 1.2, codeLeast: 0.9, minArea: 2.4, least: 0.9, typical: "1.5 × 2.0 m (3–4 m²)" },
    window: 0.05,
    note: "NBC minimum is 1.20 m² with a 0.90 m least dimension. Doors often swing out or slide."
  },
  {
    id: "powder", name: "Powder room", group: "Service",
    door: { width: 700, height: 2100, range: "700 × 2,100", leaves: 1, minWidth: 600, minHeight: 2000 },
    room: { label: "Powder room", codeArea: 1.2, codeLeast: 0.9, minArea: 1.5, least: 0.9, typical: "1.0 × 1.5 m" },
    window: 0.05,
    note: "WC and lavatory only. Mechanical exhaust if there is no window."
  },
  {
    id: "accessible-bath", name: "Accessible toilet", group: "Service",
    door: { width: 900, height: 2100, range: "≥ 900 × 2,100", leaves: 1, minWidth: 900, minHeight: 2000 },
    room: { label: "Accessible toilet", codeArea: 3.06, codeLeast: 1.7, minArea: 3.06, least: 1.7, typical: "1.7 × 1.8 m min." },
    accessible: true, window: 0.05,
    note: "BP 344 cubicle 1.70 × 1.80 m with grab bars and 1.50 m turning space. Door gives 800 mm clear."
  },
  {
    id: "laundry", name: "Laundry / service", group: "Service",
    door: { width: 800, height: 2100, range: "800 × 2,100", leaves: 1, minWidth: 700, minHeight: 2000 },
    room: { label: "Laundry", codeArea: null, minArea: 3, least: 1.5, typical: "1.5 × 2.0 m" },
    note: "Plan for washer, sink and a floor drain."
  },
  {
    id: "maids", name: "Maid's room", group: "Service",
    door: { width: 800, height: 2100, range: "800 × 2,100", leaves: 1, minWidth: 700, minHeight: 2000 },
    room: { label: "Maid's room", codeArea: 6, codeLeast: 2, minArea: 6, least: 2, typical: "2.0 × 3.0 m" },
    note: "Still a habitable room: 6.00 m² minimum, with light and ventilation."
  },
  {
    id: "office", name: "Home office / study", group: "Private",
    door: { width: 800, height: 2100, range: "800–900 × 2,100", leaves: 1, minWidth: 700, minHeight: 2000 },
    room: { label: "Study", codeArea: 6, codeLeast: 2, minArea: 7, least: 2.4, typical: "2.4 × 3.0 m (7–9 m²)" },
    note: "Allow about 1.0 m behind the desk chair."
  },
  {
    id: "closet", name: "Walk-in closet / storage", group: "Private",
    door: { width: 700, height: 2100, range: "600–800 × 2,100", leaves: 1, minWidth: 600, minHeight: 2000 },
    room: { label: "Walk-in closet", codeArea: null, minArea: 2.7, least: 1.5, typical: "1.5 × 1.8 m" },
    note: "Shelves 600 mm deep on one side plus a 900 mm aisle."
  },
  {
    id: "balcony", name: "Balcony / patio", group: "Outdoor",
    door: { width: 1800, height: 2100, range: "1,500–2,400 × 2,100 sliding", leaves: 2, minWidth: 1200, minHeight: 2000 },
    room: { label: "Balcony", codeArea: null, minArea: 2.4, least: 1.2, typical: "1.2 m deep min." },
    note: "Sliding or French doors. Guard about 1.0 m high; verify locally."
  },
  {
    id: "garage", name: "Garage (single car)", group: "Outdoor",
    door: { width: 2700, height: 2400, range: "2,400–3,000 × 2,100–2,400", leaves: 2, minWidth: 2400, minHeight: 2100 },
    room: { label: "Garage", codeArea: null, minArea: 15, least: 3, typical: "3.0 × 5.5 m" },
    note: "Parking stall is 2.50 × 5.00 m; add space to open car doors."
  }
];

export const roomGroups = ["Living", "Private", "Service", "Outdoor"];

// Typical window per room (mm). Sill and head are measured from finished floor.
// Required glazing: 10% of floor area (1.00 m² min.) for rooms, 1/20 (0.24 m² min.) for toilets — NBC Rule VIII §808.
const roomWindows = {
  living: { width: 1800, height: 1200, sill: 900, type: "Sliding / awning", range: "1,500–2,400 × 1,200" },
  dining: { width: 1500, height: 1200, sill: 900, type: "Sliding / casement", range: "1,200–1,800 × 1,200" },
  kitchen: { width: 1200, height: 900, sill: 1100, type: "Awning / sliding", range: "900–1,500 × 900, above counter" },
  master: { width: 1500, height: 1200, sill: 900, type: "Sliding / casement", range: "1,200–1,800 × 1,200" },
  bedroom: { width: 1200, height: 1200, sill: 900, type: "Sliding / casement", range: "1,000–1,500 × 1,200" },
  bath: { width: 600, height: 600, sill: 1500, type: "Jalousie / awning, obscure glass", range: "600–900 × 400–600, high sill" },
  powder: { width: 600, height: 400, sill: 1600, type: "Jalousie / awning, obscure glass", range: "600 × 400, high sill" },
  "accessible-bath": { width: 600, height: 600, sill: 1500, type: "Awning, obscure glass", range: "600 × 600, high sill" },
  laundry: { width: 1200, height: 900, sill: 1100, type: "Jalousie / awning", range: "1,200 × 900" },
  maids: { width: 900, height: 1200, sill: 900, type: "Sliding / casement", range: "900–1,200 × 1,200" },
  office: { width: 1200, height: 1200, sill: 900, type: "Sliding / casement", range: "1,200–1,500 × 1,200" },
  closet: { width: 600, height: 600, sill: 1500, type: "Fixed / awning vent", range: "Optional, 600 × 600" },
  garage: { width: 1200, height: 600, sill: 1500, type: "Fixed louvre vent", range: "Ventilation openings" }
};

roomStandards.forEach((room) => {
  room.glazing = roomWindows[room.id] ?? null;
});

// Storage and garages need ventilation openings, not the habitable-room glazing ratio.
const ventilationOnly = new Set(["closet", "garage"]);

// Required window area for a given floor area, per NBC Rule VIII §808. Null = ventilation only.
export function requiredWindowArea(room, floorArea) {
  if (ventilationOnly.has(room.id)) return null;
  const isToilet = Boolean(room.window);
  return Math.max(floorArea * (isToilet ? 0.05 : 0.1), isToilet ? 0.24 : 1);
}
