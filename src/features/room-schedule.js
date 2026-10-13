import { roomStandards, roomGroups, requiredWindowArea } from '../config/room-standards.js';
import { elementCategories } from '../config/element-standards.js';
import { convertMarkup } from '../core/units.js';

const tags = {
  code: '<span class="tag">code</span>',
  planning: '<span class="tag tag-muted">planning</span>',
  verify: '<span class="tag tag-warn">verify</span>'
};

const roomTabs = [
  { id: "doors", label: "Doors", icon: "▯" },
  { id: "windows", label: "Windows", icon: "◫" },
  { id: "rooms", label: "Room sizes", icon: "▭" }
];

// Tabbed standards schedule: room-by-room doors, windows and sizes, plus element standards.
export function initRoomSchedule(root, drawingLab) {
  if (!root) return;
  const state = { tab: "doors", group: "All", codeOnly: false, query: "" };

  root.innerHTML = `
    <div class="drawing-tabs schedule-tabs" role="tablist" aria-label="Standards category">
      ${[...roomTabs, ...elementCategories].map((tab) => `<button type="button" role="tab" class="drawing-tab" data-tab="${tab.id}" aria-selected="${tab.id === state.tab}"><span aria-hidden="true">${tab.icon}</span>${tab.label}</button>`).join("")}
    </div>
    <div class="schedule-toolbar">
      <div class="chip-row" role="group" aria-label="Filter rooms" data-room-only>${["All", ...roomGroups].map((g) => `<button type="button" class="chip" data-group="${g}" aria-pressed="${g === "All"}">${g}</button>`).join("")}</div>
      <label class="schedule-filter"><span class="visually-hidden">Filter this table</span><input type="search" placeholder="Filter this table…" data-filter></label>
      <div class="toolbar-end">
        <label class="switch"><input type="checkbox" data-code-only><span>Code only</span></label>
      </div>
    </div>
    <div class="table-scroll"><table class="schedule-table"><thead data-schedule-head></thead><tbody data-schedule-body></tbody></table></div>
    <p class="standard-note" data-schedule-note></p>`;

  const head = root.querySelector("[data-schedule-head]");
  const body = root.querySelector("[data-schedule-body]");
  const note = root.querySelector("[data-schedule-note]");

  // Values are written in metric; convertMarkup() switches them when imperial is active.
  const mm = (value) => `${value.toLocaleString("en-US")} mm`;
  const m = (value) => `${value.toFixed(2)} m`;
  const m2 = (value) => `${value.toFixed(2)} m²`;
  const matches = (text) => !state.query || text.toLowerCase().includes(state.query);
  const headRow = (cols) => `<tr>${cols.map((c) => `<th scope="col">${c}</th>`).join("")}</tr>`;
  const roomName = (room) => `<th scope="row"><span class="room-name">${room.name}</span><small>${room.group}</small></th>`;

  const views = {
    doors() {
      head.innerHTML = headRow(["Room", "Door width", "Door height", "Opening area", "Clear opening", "Notes", '<span class="visually-hidden">Actions</span>']);
      note.innerHTML = "Nominal leaf sizes; clear opening is about 40 mm less. Exit doors: ≥ 900 × 2,000 mm (NBC §1207). Accessible doors: ≥ 800 mm clear (BP 344).";
      return roomRows((room) => {
        const { door } = room;
        const tag = room.exit || room.accessible ? tags.code : tags.planning;
        return `${roomName(room)}
          <td data-label="Door width"><b>${mm(door.width)}</b><small>typical ${door.range}</small></td>
          <td data-label="Door height"><b>${mm(door.height)}</b><small>min. ${mm(door.minHeight)}</small></td>
          <td data-label="Opening area"><b>${m2((door.width * door.height) / 1e6)}</b>${door.leaves > 1 ? "<small>2 leaves</small>" : ""}</td>
          <td data-label="Clear opening"><b>${mm(door.width - (door.leaves > 1 ? 80 : 40))}</b>${tag}</td>
          <td data-label="Notes"><small>${room.note}</small></td>
          <td class="row-actions"><button type="button" class="mini-button" data-draw="door" data-room="${room.id}">Draw ↗</button></td>`;
      }, (room) => room.exit || room.accessible);
    },
    windows() {
      head.innerHTML = headRow(["Room", "Window W × H", "Sill / head", "Window area", "Required area", "Type", '<span class="visually-hidden">Actions</span>']);
      note.innerHTML = "Required area is checked against the recommended room size: 10% of floor area (1.00 m² min.) for rooms, 1/20 (0.24 m² min.) for toilets, per NBC Rule VIII §808.";
      return roomRows((room) => {
        const w = room.glazing;
        if (!w) return `${roomName(room)}<td colspan="5" data-label="Window"><small>No window. ${room.id === "balcony" ? "The glazed door is the opening." : "Light comes from adjacent spaces or the door."}</small></td><td></td>`;
        const area = (w.width * w.height) / 1e6;
        const required = requiredWindowArea(room, room.room.minArea);
        const ok = required === null || area >= required;
        return `${roomName(room)}
          <td data-label="Window W × H"><b>${mm(w.width)} × ${mm(w.height)}</b><small>typical ${w.range}</small></td>
          <td data-label="Sill / head"><b>${mm(w.sill)}</b><small>head ${mm(w.sill + w.height)}</small></td>
          <td data-label="Window area"><b class="${ok ? "is-ok" : "is-short"}">${m2(area)}</b></td>
          <td data-label="Required area">${required === null ? "<b>Ventilation only</b>" : `<b>≥ ${m2(required)}</b><small>for ${m2(room.room.minArea)} room</small>`}${required === null ? tags.planning : tags.code}</td>
          <td data-label="Type"><small>${w.type}</small></td>
          <td class="row-actions"><button type="button" class="mini-button" data-draw="window" data-room="${room.id}">Draw ↗</button></td>`;
      }, (room) => room.glazing && requiredWindowArea(room, room.room.minArea) !== null);
    },
    rooms() {
      head.innerHTML = headRow(["Room", "Minimum area", "Least dimension", "Recommended", "Ceiling height", '<span class="visually-hidden">Actions</span>']);
      note.innerHTML = "Code minimums: habitable rooms 6.00 m² / 2.00 m, kitchens 3.00 m² / 1.50 m, toilet and bath 1.20 m² / 0.90 m (NBC Rule VIII §806). Ceilings per §805.";
      return roomRows((room) => {
        const size = room.room;
        const area = size.codeArea ?? size.minArea;
        const least = size.codeLeast ?? size.least;
        return `${roomName(room)}
          <td data-label="Minimum area"><b>${m2(area)}</b>${size.codeArea ? tags.code : tags.planning}</td>
          <td data-label="Least dimension"><b>${m(least)}</b></td>
          <td data-label="Recommended"><b>${size.typical}</b><small>${room.note}</small></td>
          <td data-label="Ceiling height"><b>${room.window ? m(2.1) : m(2.4)}+</b><small>${room.window ? "toilets" : "artificial ventilation"}</small></td>
          <td class="row-actions"><button type="button" class="mini-button" data-draw="room" data-room="${room.id}">Draw ↗</button></td>`;
      }, (room) => room.room.codeArea);
    }
  };

  function roomRows(cells, isCode) {
    return roomStandards
      .filter((room) => state.group === "All" || room.group === state.group)
      .filter((room) => !state.codeOnly || isCode(room))
      .filter((room) => matches(`${room.name} ${room.group} ${room.note}`))
      .map((room) => `<tr>${cells(room)}</tr>`)
      .join("");
  }

  function elementRows(category) {
    head.innerHTML = headRow(["Element", "Standard", "Source", "Notes", '<span class="visually-hidden">Actions</span>']);
    note.innerHTML = '<b>code</b> = PD 1096, BP 344, RA 9514, PEC or plumbing code · <b>planning</b> = common practice · <b>verify</b> = confirm with the current code or LGU.';
    return category.rows
      .filter(([, , source]) => !state.codeOnly || source === "code")
      .filter((row) => matches(row.join(" ")))
      .map(([element, value, source, detail]) => `<tr><th scope="row"><span class="room-name">${element}</span></th><td data-label="Standard"><b>${value}</b></td><td data-label="Source">${tags[source]}</td><td data-label="Notes"><small>${detail || "—"}</small></td>${drawButton(category, element)}</tr>`)
      .join("");
  }

  function drawButton(category, element) {
    if (!category.draw) return "<td></td>";
    const [key, preset = {}] = category.draw(element);
    return `<td class="row-actions"><button type="button" class="mini-button" data-draw="${key}" data-preset='${JSON.stringify(preset)}'>Draw ↗</button></td>`;
  }

  function render() {
    const category = elementCategories.find((item) => item.id === state.tab);
    root.querySelectorAll("[data-room-only]").forEach((el) => { el.hidden = Boolean(category); });
    const rows = category ? elementRows(category) : views[state.tab]();
    body.innerHTML = convertMarkup(rows || `<tr><td colspan="7" class="empty-row">Nothing matches this filter.</td></tr>`);
    note.innerHTML = convertMarkup(note.innerHTML);
  }

  root.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-tab]");
    if (tab) {
      state.tab = tab.dataset.tab;
      root.querySelectorAll("[data-tab]").forEach((item) => item.setAttribute("aria-selected", String(item === tab)));
      render();
      return;
    }
    const chip = event.target.closest("[data-group]");
    if (chip) {
      state.group = chip.dataset.group;
      root.querySelectorAll("[data-group]").forEach((item) => item.setAttribute("aria-pressed", String(item === chip)));
      render();
      return;
    }
    const draw = event.target.closest("[data-draw]");
    if (draw && drawingLab && !draw.dataset.room) {
      drawingLab.show(draw.dataset.draw, JSON.parse(draw.dataset.preset || "{}"));
      return;
    }
    if (draw && drawingLab) {
      const room = roomStandards.find((item) => item.id === draw.dataset.room);
      if (draw.dataset.draw === "room") {
        const width = Math.max(room.room.least, Math.sqrt(room.room.minArea * 0.8));
        drawingLab.show("room", { type: room.id, width: +width.toFixed(2), length: +(room.room.minArea / width).toFixed(2) });
      } else {
        drawingLab.show(draw.dataset.draw, { type: room.id });
      }
    }
  });

  root.addEventListener("input", (event) => {
    if (event.target.matches("[data-filter]")) {
      state.query = event.target.value.trim().toLowerCase();
      render();
    }
  });

  root.addEventListener("change", (event) => {
    if (event.target.matches("[data-code-only]")) state.codeOnly = event.target.checked;
    render();
  });

  render();
  return { refresh: render };
}
