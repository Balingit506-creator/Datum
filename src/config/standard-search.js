const references = {
  nbc: {
    label: "PD 1096 §1207 · National Building Code",
    url: "https://chanrobles.com/presidentialdecrees/presidentialdecreeno1096.html"
  },
  bp344: {
    label: "BP 344 · Accessibility Law",
    url: "https://lawphil.net/statutes/bataspam/bp1983/bp_344_1983.html"
  },
  bfp: {
    label: "BFP · RA 9514 Fire Code",
    url: "https://bfp.gov.ph"
  },
  dpwh: {
    label: "DPWH laws and codes references",
    url: "https://www.dpwh.gov.ph/dpwh/references/laws_codes_orders"
  }
};

export const standardGuides = [
  {
    id: "office-door",
    title: "Door size for an open office",
    category: "OFFICE · DOORS",
    keywords: ["standard", "size", "door", "doors", "opening", "doorway", "office", "open office", "workplace", "entry", "entrance", "egress", "accessible", "clearance"],
    range: "900–1,000 mm nominal opening",
    suggestion: "For an ordinary single-leaf internal office door, use 900 mm nominal as an initial layout target; consider 1,000 mm for a busy shared office. Nominal leaf/opening width is not the same as clear passage width.",
    steps: [
      "Confirm whether the doorway is an ordinary internal door, an accessible route, or part of a required exit.",
      "Choose a nominal width for the expected traffic; start at 900 mm and consider 1,000 mm in a high-use shared office.",
      "Check the manufacturer’s door schedule for actual clear opening after the frame, hinges, stops, and hardware are included.",
      "Draw the swing and confirm it does not reduce corridor width, block another door, or conflict with furniture.",
      "For an accessible route or required exit, verify the applicable BP 344 IRR, NBCP egress conditions, and local fire review before fixing the opening."
    ],
    basis: "General design starting point, not a universal Philippine code minimum. NBCP §1207 has conditional requirements for required exit doors based on use and occupant load; BP 344 accessibility provisions apply to specified buildings and facilities.",
    references: [references.nbc, references.bp344]
  },
  {
    id: "office-egress",
    title: "Open-office exit and egress doors",
    category: "PHILIPPINES · CONDITIONAL EGRESS",
    keywords: ["office", "open office", "exit", "egress", "fire", "emergency", "door", "doorway", "corridor", "occupant", "occupancy", "life safety", "nbcp", "pd1096", "1207"],
    range: "Depends on occupancy and occupant load",
    suggestion: "Do not set an open-office exit from a generic room-size rule. Establish the occupant load and exit arrangement first, then check NBCP §1207 and the current Fire Code IRR with the Building Official and BFP.",
    steps: [
      "Identify the building occupancy/use and calculate the occupant load for the office area.",
      "Determine required exit count, exit locations, travel paths, and exit access under the applicable rules.",
      "Check required door, corridor, and stair widths against the applicable occupant-load provisions.",
      "Coordinate door swings, hardware, fire ratings, and accessible egress details with the complete plan.",
      "Have the plans reviewed under current Local Building Official and BFP requirements."
    ],
    basis: "Code-based topic with conditional requirements. NBCP §1207 values apply to required means of egress in the stated conditions, not every office door or aisle.",
    references: [references.nbc, references.dpwh]
  },
  {
    id: "office-circulation",
    title: "Open-office aisles and circulation",
    category: "OFFICE · CIRCULATION",
    keywords: ["office", "open office", "aisle", "aisles", "corridor", "hallway", "circulation", "path", "walkway", "clearance", "desk", "workstation", "people", "width"],
    range: "900–1,200 mm as a planning range",
    suggestion: "Reserve about 1,200 mm for a primary path through a shared office and 900 mm or more for secondary paths as an initial furniture-layout check. These are planning targets, not statutory minima.",
    steps: [
      "Mark the main route from the entrance to shared areas and exits before placing workstations.",
      "Keep the primary path clear and use the wider end of the range where traffic is frequent or two-way.",
      "Draw secondary aisles between desks and test chair pull-back, storage, and door swings.",
      "Check any required exit corridor separately against NBCP egress rules and occupant load.",
      "If BP 344 applies, verify accessible route widths, passing/turning areas, and door clearances from its current IRR."
    ],
    basis: "General workplace layout suggestion only. Egress and accessibility dimensions depend on the applicable code and project conditions.",
    references: [references.nbc, references.bp344]
  },
  {
    id: "interior-door",
    title: "Typical interior door opening",
    category: "GENERAL PLANNING · DOORS",
    keywords: ["door", "doors", "interior", "bedroom", "room", "bathroom", "toilet", "opening", "width", "size", "standard", "residential"],
    range: "800–900 mm nominal for common interior doors",
    suggestion: "Use the existing general-planning range as a starting point, then check the actual clear passage, furniture route, privacy needs, and local accessibility requirements.",
    steps: [
      "Choose the door use (room, bathroom, entry, or accessible route).",
      "Select a nominal leaf/opening size that fits the user and furniture movement.",
      "Check clear width after frame and hardware, not only the catalog leaf width.",
      "Draw the swing arc and keep it clear of fixtures and circulation routes.",
      "Verify code requirements for the building location and use."
    ],
    basis: "General residential planning reference from this guide, not a universal Philippine code dimension.",
    references: [references.bp344]
  },
  {
    id: "wall-thickness",
    title: "Wall thickness and partitions",
    category: "GENERAL PLANNING · WALLS",
    keywords: ["wall", "walls", "thickness", "partition", "partitions", "interior", "exterior", "structural", "masonry", "plan", "dimension"],
    range: "Partitions 100–150 mm; exterior assemblies 200–300 mm (early estimate)",
    suggestion: "Draw non-structural partitions using the selected wall-system build-up, including plasterboard or render, finishes, and service cavities. Do not use this estimate to size a structural wall.",
    steps: [
      "Choose the wall assembly and identify whether it is structural, fire-rated, acoustic, or moisture-resistant.",
      "Add all finish and cavity thicknesses to the core material dimension.",
      "Show structural elements only from engineer-coordinated drawings.",
      "Recheck net room dimensions after wall thicknesses and finishes are added.",
      "Confirm fire-separation and property-line requirements with the applicable code and local office."
    ],
    basis: "General planning estimates only; construction system and required ratings change the wall build-up.",
    references: [references.nbc]
  },
  {
    id: "room-size",
    title: "Room size, windows, and ventilation",
    category: "PHILIPPINES · NBCP CHECK",
    keywords: ["room", "bedroom", "kitchen", "bathroom", "area", "size", "window", "ventilation", "light", "ceiling", "height", "habitable", "minimum", "philippines", "nbcp", "rule viii"],
    range: "Check current NBCP IRR Rule VIII §§804–805",
    suggestion: "Before finalizing room dimensions, check the current NBCP IRR for the room’s minimum area/least dimension, ceiling height, natural light, and ventilation. Requirements and exceptions depend on room use and ventilation method.",
    steps: [
      "Classify each room by its intended use and whether it is habitable.",
      "Check the current IRR provisions for area, least dimension, and ceiling height.",
      "Lay out windows, courts, and ventilation openings with the room dimensions.",
      "Recheck setbacks, lot coverage, and neighboring openings.",
      "Confirm the current adopted IRR with the Local Building Official."
    ],
    basis: "Philippine NBCP IRR reference. This guide intentionally does not reproduce unverified numeric thresholds; confirm the current official text and exceptions.",
    references: [references.dpwh, references.nbc]
  },
  {
    id: "stairs",
    title: "Stair width and layout",
    category: "PHILIPPINES · EGRESS CHECK",
    keywords: ["stair", "stairs", "stairway", "step", "riser", "tread", "handrail", "width", "headroom", "exit", "egress", "occupants", "nbcp", "1207"],
    range: "Check NBCP §1207 by occupant load and stair type",
    suggestion: "Lay out the stair with its full flight, landings, handrails, headroom, and door approaches. Verify required width using the applicable occupant-load category; a generic residential target cannot replace that check.",
    steps: [
      "Determine whether this is a private stair or a required exit stair and establish its occupant load.",
      "Check the applicable NBCP §1207 stair-width and egress provisions.",
      "Calculate the floor-to-floor rise and coordinate riser/tread geometry and landings.",
      "Check handrails, guards, headroom, and door conflicts under current applicable rules.",
      "Coordinate the final stair with structural and fire-safety plans."
    ],
    basis: "Code requirements depend on stair type, occupant load, occupancy, and other conditions.",
    references: [references.nbc]
  },
  {
    id: "ceiling-height",
    title: "Minimum ceiling heights",
    category: "PHILIPPINES · NBCP RULE VIII",
    keywords: [
      "ceiling",
      "height",
      "headroom",
      "clear",
      "storey",
      "floor",
      "mezzanine",
      "ventilation",
      "habitable",
      "room",
      "805"
    ],
    range: "2.40 m min. (artificial ventilation)",
    suggestion: "Plan habitable rooms at 2.40 m clear or more where there is artificial ventilation. With natural ventilation, use 2.70 m on the first storey, 2.40 m on the second, and 2.10 m from the third storey up. Mezzanines need 1.80 m.",
    steps: [
      "Confirm whether each room relies on natural or artificial ventilation.",
      "Set floor-to-floor heights that leave the required clear height below beams, soffits, and ducts.",
      "Coordinate structural depth and MEP zones in a building section before fixing levels.",
      "Check mezzanine clear heights above and below the mezzanine floor.",
      "Verify the values against the current NBCP IRR Rule VIII §805."
    ],
    basis: "NBCP IRR Rule VIII §805 values, summarised for planning. Confirm the current official text.",
    references: [references.nbc, references.dpwh]
  },
  {
    id: "windows-ventilation",
    title: "Window and ventilation openings",
    category: "PHILIPPINES · LIGHT & VENTILATION",
    keywords: [
      "window",
      "windows",
      "opening",
      "ventilation",
      "light",
      "natural",
      "air",
      "daylight",
      "glazing",
      "bathroom",
      "toilet",
      "808"
    ],
    range: "≥ 10% of floor area, 1.00 m² min.",
    suggestion: "Size room windows to at least 10% of the floor area, never under 1.00 m². Give toilets and baths an opening of at least 1/20 of the floor area (0.24 m² min.) or mechanical exhaust.",
    steps: [
      "List every room with its floor area.",
      "Calculate the required opening area (10% of floor area, 1.00 m² minimum).",
      "Make sure the openings face a yard, court, or street of the required width.",
      "Substitute mechanical ventilation only where the IRR permits it.",
      "Recheck the openings against setbacks and fire-separation rules for walls near property lines."
    ],
    basis: "NBCP IRR Rule VIII §808 summary for planning.",
    references: [references.nbc]
  },
  {
    id: "accessible-ramp",
    title: "Accessible ramps and routes",
    category: "PHILIPPINES · BP 344",
    keywords: [
      "ramp",
      "ramps",
      "slope",
      "gradient",
      "accessible",
      "accessibility",
      "wheelchair",
      "pwd",
      "handrail",
      "landing",
      "route",
      "bp344",
      "344"
    ],
    range: "1:12 max. · 1.20 m wide",
    suggestion: "Design ramps at 1:12 or gentler, at least 1.20 m wide, with a landing at least every 6.00 m of run and 1.50 × 1.50 m landings at the ends and at turns. Provide handrails at 0.70 m and 0.90 m on both sides.",
    steps: [
      "Measure the level change and calculate the ramp run at 1:12 (1 m of rise needs 12 m of run).",
      "Break the run into flights of 6.00 m or less with level landings.",
      "Provide 1.50 m clear landings at the top, bottom, and changes of direction.",
      "Add dual-height handrails on both sides with curbs or rails at open edges.",
      "Verify the full accessible route, including doors (0.80 m clear) and turning spaces."
    ],
    basis: "BP 344 IRR Annex A summary. Applies to the building types the law covers.",
    references: [references.bp344]
  },
  {
    id: "parking",
    title: "Parking stall dimensions",
    category: "PLANNING · PARKING",
    keywords: [
      "parking",
      "car",
      "stall",
      "slot",
      "garage",
      "driveway",
      "vehicle",
      "accessible",
      "carport"
    ],
    range: "2.50 × 5.00 m standard stall",
    suggestion: "Lay out standard stalls at 2.50 × 5.00 m and accessible stalls at 3.70 × 5.00 m near the accessible entrance. Allow about a 6.00 m aisle for two-way 90° parking.",
    steps: [
      "Determine the required stall count from the occupancy and local ordinance.",
      "Lay out stalls and aisles, checking the vehicle turning paths.",
      "Locate accessible stalls closest to the accessible entrance.",
      "Check ramp slopes, headroom, and columns in basement or podium parking.",
      "Confirm the counts and sizes with the Local Building Official."
    ],
    basis: "NBCP IRR Rule VII and BP 344 planning values. Local ordinances may require more.",
    references: [references.nbc, references.bp344]
  },
  {
    id: "kitchen",
    title: "Kitchen layout and clearances",
    category: "PLANNING · KITCHEN",
    keywords: [
      "kitchen",
      "counter",
      "cabinet",
      "sink",
      "stove",
      "cooktop",
      "fridge",
      "triangle",
      "aisle",
      "pantry"
    ],
    range: "850–900 mm counter · 1.0–1.2 m aisle",
    suggestion: "Use 850–900 mm counter height and 600 mm depth. Keep upper cabinets 450–600 mm above the counter, give a one-cook aisle 1.0–1.2 m, and keep the sink–cooktop–fridge triangle between 4.0 and 7.9 m in total.",
    steps: [
      "Choose a layout (galley, L, U or island) that fits the room.",
      "Place the sink near the plumbing stack and the window if possible.",
      "Check the work triangle and keep through-traffic out of it.",
      "Allow landing space beside the cooktop and fridge.",
      "Confirm the room meets the NBC kitchen minimum of 3.00 m² with a 1.50 m least dimension."
    ],
    basis: "Planning practice with the NBC Rule VIII kitchen minimum.",
    references: [references.nbc]
  },
  {
    id: "bathroom",
    title: "Bathroom fixture clearances",
    category: "PLANNING · BATHROOM",
    keywords: [
      "bathroom",
      "toilet",
      "wc",
      "lavatory",
      "sink",
      "shower",
      "bath",
      "fixture",
      "clearance",
      "cr",
      "comfort"
    ],
    range: "≥ 600 mm in front of the WC",
    suggestion: "Set the WC centreline 380–450 mm from a side wall with at least 600 mm clear in front of it. Lavatory rims sit at 800–850 mm, and a shower should be at least 900 × 900 mm.",
    steps: [
      "Locate the soil stack and floor drains first.",
      "Place fixtures with the clearances above and check that the door swing doesn't clash.",
      "Provide a window of 1/20 of the floor area (0.24 m² min.) or mechanical exhaust.",
      "If BP 344 applies, plan a 1.70 × 1.80 m accessible cubicle with grab bars.",
      "Coordinate with the National Plumbing Code fixture requirements."
    ],
    basis: "Planning practice, NBC Rule VIII and BP 344.",
    references: [references.nbc, references.bp344]
  },
  {
    id: "railings",
    title: "Railings, handrails and guards",
    category: "SAFETY · GUARDS",
    keywords: [
      "railing",
      "railings",
      "handrail",
      "guard",
      "balcony",
      "baluster",
      "parapet",
      "landing",
      "drop",
      "fall"
    ],
    range: "800–900 mm handrail · ≈ 1.0 m guard",
    suggestion: "Put stair handrails at 800–900 mm above the nosing, and guards around 1.0 m at balconies and open landings. Keep baluster gaps under 100 mm.",
    steps: [
      "Mark every edge with a drop and every stair.",
      "Set handrail heights from the stair nosing line.",
      "Set guard heights from the finished floor.",
      "Keep openings small and avoid climbable horizontal rails.",
      "Check the code and have the railing anchorage designed."
    ],
    basis: "NBC §1207 for stairs; guard height is common practice, so verify it locally.",
    references: [references.nbc]
  },
  {
    id: "fire-exits",
    title: "Fire exits and fire safety",
    category: "PHILIPPINES · RA 9514",
    keywords: [
      "fire",
      "exit",
      "exits",
      "emergency",
      "travel",
      "distance",
      "sprinkler",
      "alarm",
      "bfp",
      "9514",
      "evacuation",
      "smoke"
    ],
    range: "By occupancy · RA 9514 IRR",
    suggestion: "Classify the occupancy, compute the occupant load, then lay out at least two remote exits where required, with exit signs and emergency lighting. Check travel distance and dead-end limits in the RA 9514 IRR tables.",
    steps: [
      "Classify the occupancy under RA 9514.",
      "Compute the occupant load per floor.",
      "Locate exits far apart and check travel distances.",
      "Add fire separations, alarms, sprinklers and extinguishers as required.",
      "Get the Fire Safety Evaluation Clearance from BFP before the building permit."
    ],
    basis: "RA 9514 Fire Code IRR; values depend on occupancy.",
    references: [references.bfp, references.nbc]
  },
  {
    id: "structure",
    title: "Preliminary structural sizes",
    category: "STRUCTURE · RULE OF THUMB",
    keywords: [
      "beam",
      "column",
      "slab",
      "footing",
      "structure",
      "structural",
      "span",
      "depth",
      "nscp",
      "concrete",
      "reinforcement"
    ],
    range: "Beam depth ≈ span ÷ 12",
    suggestion: "For early sketches, assume beam depth around span ÷ 12, residential slabs of 100–125 mm, and columns of at least 250 × 250 mm. Use these only to reserve space; the engineer sizes the real members.",
    steps: [
      "Lay out a regular column grid, ideally with 3–6 m spans for housing.",
      "Reserve beam depths in the sections so ceiling heights still work.",
      "Line up columns between floors.",
      "Hand off to a licensed civil engineer for NSCP 2015 design.",
      "Update the architectural drawings with the final sizes."
    ],
    basis: "Rule-of-thumb sizing only, not NSCP design.",
    references: [references.dpwh]
  },
  {
    id: "door-by-room",
    title: "Door sizes by room",
    category: "PLANNING · DOOR SCHEDULE",
    keywords: ["door", "doors", "size", "sizes", "height", "width", "area", "bedroom", "master", "bathroom", "toilet", "kitchen", "garage", "closet", "balcony", "sliding", "entrance", "main", "room", "standard", "dimension", "dimensions"],
    range: "700–1,000 × 2,100 mm for most rooms",
    suggestion: "Use 2,100 mm door height throughout and pick widths by room: main entrance 900–1,000 mm, bedrooms 800–900 mm, toilet and bath 700–800 mm, kitchen and service 800–900 mm, closets 600–800 mm, balcony sliding doors 1,500–2,400 mm, and single garage doors 2,400–3,000 mm wide.",
    steps: [
      "Open the room-by-room table above and pick the room.",
      "Choose a width from its range; go wider for furniture moves or wheelchair access.",
      "Keep door heads at one height (usually 2,100 mm) for clean elevations.",
      "Use Door ↗ to check the size and opening area in the live drawing.",
      "For exits and accessible routes, check NBC §1207 (≥ 900 × 2,000 mm) and BP 344 (≥ 800 mm clear)."
    ],
    basis: "Common Philippine residential practice, with NBC §1207 and BP 344 minimums where they apply.",
    references: [references.nbc, references.bp344]
  }
];

const ignoredTerms = new Set(["a", "an", "and", "for", "in", "of", "on", "or", "the", "to", "what", "with"]);

function normalizeTerm(term) {
  return term.length > 4 && term.endsWith("s") ? term.slice(0, -1) : term;
}

export function searchStandardGuides(query) {
  const terms = query
    .toLocaleLowerCase()
    .match(/[a-z0-9]+/g)
    ?.map(normalizeTerm)
    .filter((term) => !ignoredTerms.has(term)) ?? [];

  if (terms.length === 0) return [];

  return standardGuides
    .map((guide) => {
      const searchableText = `${guide.title} ${guide.category} ${guide.keywords.join(" ")}`.toLocaleLowerCase();
      const normalizedText = ` ${searchableText.replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ")} `;
      const score = terms.reduce((total, term) => total + (normalizedText.includes(` ${term} `) ? 1 : 0), 0);
      return { guide, score };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || standardGuides.indexOf(left.guide) - standardGuides.indexOf(right.guide))
    .slice(0, 4)
    .map(({ guide }) => guide);
}
