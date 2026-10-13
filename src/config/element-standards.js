// Element-by-element standards for the schedule tabs.
// draw(rowName) returns [drawingKey, presetValues] for the live drawing lab.
// source: "code" = PD 1096 / BP 344 / RA 9514 / PEC / plumbing code; "planning" = common practice; "verify" = practice to confirm locally.

export const elementCategories = [
  {
    id: "stairs",
    draw: (name) => (name.startsWith("Ramp") ? ["ramp"] : ["stair"]),
    label: "Stairs & ramps",
    icon: "∠",
    rows: [
      ["Stair riser height", "200 mm max.", "code", "NBC §1207 · keep uniform within a flight"],
      ["Stair tread / going", "250 mm min.", "code", "NBC §1207 · excluding nosing"],
      ["Comfort rule 2R + G", "600–650 mm", "planning", "Comfortable stride for most users"],
      ["Stair width, occupant load over 50", "1.10 m min.", "code", "NBC §1207"],
      ["Stair width, occupant load 50 or less", "0.90 m min.", "code", "NBC §1207"],
      ["Private stair, under 10 occupants", "0.75 m min.", "code", "NBC §1207"],
      ["Stair headroom", "2.00 m min.", "code", "NBC §1207 · measured from the nosing line"],
      ["Landing depth", "≥ stair width", "verify", "Measured in the direction of travel"],
      ["Stair handrail height", "800–900 mm", "code", "Above the nosing line"],
      ["Ramp gradient", "1:12 max.", "code", "BP 344"],
      ["Ramp width", "1.20 m min.", "code", "BP 344"],
      ["Ramp run between landings", "6.00 m max.", "code", "BP 344"],
      ["Ramp landing", "1.50 × 1.50 m min.", "code", "BP 344 · at top, bottom and turns"],
      ["Ramp handrails", "0.70 m and 0.90 m", "code", "BP 344 · both sides"]
    ]
  },
  {
    id: "kitchen",
    draw: () => ["kitchen"],
    label: "Kitchen & cabinets",
    icon: "⌂",
    rows: [
      ["Counter height", "850–900 mm", "planning", "Finished top above floor"],
      ["Counter depth", "600 mm", "planning", "Fits standard appliances"],
      ["Backsplash / upper cabinet gap", "450–600 mm", "planning", "Counter top to underside of cabinet"],
      ["Upper cabinet depth", "300–350 mm", "planning", ""],
      ["Upper cabinet top", "2,100–2,250 mm", "planning", "Align with door heads"],
      ["Toe kick", "100 × 75 mm", "planning", "Height × depth"],
      ["Range hood above cooktop", "650–750 mm", "planning", "Check the manufacturer's minimum"],
      ["Landing beside cooktop / sink", "≥ 400–600 mm", "planning", "Each side where possible"],
      ["Work aisle, one cook", "1,000–1,200 mm", "planning", ""],
      ["Work aisle, two cooks / island", "1,200–1,500 mm", "planning", ""],
      ["Work triangle, three legs total", "4.0–7.9 m", "planning", "Sink, cooktop and fridge"]
    ]
  },
  {
    id: "bathroom",
    draw: (name) => ["bathroom", /accessible/i.test(name) ? { accessible: "yes" } : {}],
    label: "Bathroom fixtures",
    icon: "◌",
    rows: [
      ["WC centreline to side wall", "380–450 mm", "planning", ""],
      ["Clear space in front of WC", "≥ 600 mm", "planning", ""],
      ["Lavatory rim height", "800–850 mm", "planning", ""],
      ["Lavatory centreline to side wall", "≥ 450 mm", "planning", ""],
      ["Shower size", "900 × 900 mm min.", "planning", "1,000 × 1,200 mm is more comfortable"],
      ["Shower head height", "2,000–2,100 mm", "planning", ""],
      ["Floor slope to drain", "1–2%", "planning", "Wet areas"],
      ["Accessible cubicle", "1.70 × 1.80 m min.", "code", "BP 344"],
      ["Accessible WC seat height", "≈ 450 mm", "code", "BP 344"],
      ["Grab bars (accessible)", "≈ 850 mm high", "verify", "BP 344 · check current IRR figure"],
      ["Accessible lavatory rim", "≤ 800 mm", "verify", "With knee space below"]
    ]
  },
  {
    id: "windows-general",
    draw: () => ["window"],
    label: "Windows & glazing",
    icon: "◫",
    rows: [
      ["Window area, habitable rooms", "≥ 10% of floor area", "code", "NBC Rule VIII §808"],
      ["Minimum window area", "1.00 m²", "code", "NBC Rule VIII §808"],
      ["Toilet / bath opening", "≥ 1/20 of floor, 0.24 m² min.", "code", "NBC §808, or mechanical exhaust"],
      ["Typical sill height", "900 mm", "planning", "Living rooms and bedrooms"],
      ["Kitchen sill height", "1,050–1,100 mm", "planning", "Clears the counter and backsplash"],
      ["Toilet sill height", "1,500 mm+", "planning", "For privacy, with obscure glass"],
      ["Window head height", "2,100 mm", "planning", "Align with door heads"],
      ["Low sill (below 900 mm)", "Guard or safety glass", "verify", "Fall protection on upper floors"],
      ["Glazing near doors / floor", "Safety glass", "planning", "Tempered or laminated"],
      ["Openings near property line", "Check fire separation", "code", "NBC Rule VII and VIII"]
    ]
  },
  {
    id: "electrical",
    draw: (name) => ["electrical", /accessible/i.test(name) ? { accessible: "yes" } : {}],
    label: "Electrical",
    icon: "⚡",
    rows: [
      ["Convenience outlet", "300 mm AFF", "planning", "Above finished floor"],
      ["Kitchen counter outlet", "1,100 mm AFF", "planning", "About 200 mm above the counter"],
      ["Light switch", "1,200–1,400 mm AFF", "planning", "On the latch side of the door"],
      ["Accessible switches and controls", "≤ 1,200 mm AFF", "code", "BP 344"],
      ["Aircon outlet", "2,100–2,400 mm AFF", "planning", "Near the unit location"],
      ["TV / data outlet", "300 or 1,200–1,500 mm", "planning", ""],
      ["Panel board top", "≤ 1,800 mm AFF", "verify", "With clear working space in front (PEC)"],
      ["Wet-area outlets", "GFCI protected", "code", "PEC 2017 · keep away from water"],
      ["Doorbell / intercom", "1,200–1,400 mm", "planning", ""]
    ]
  },
  {
    id: "plumbing",
    draw: () => ["drain"],
    label: "Plumbing & sanitary",
    icon: "≋",
    rows: [
      ["WC soil pipe", "100 mm (4″)", "planning", "Per National Plumbing Code sizing"],
      ["Lavatory / sink drain", "40–50 mm", "planning", ""],
      ["Floor drain", "50–75 mm", "planning", ""],
      ["Horizontal drain slope", "≥ 2% (¼″ per ft)", "code", "National Plumbing Code"],
      ["Vent stack", "50 mm min.", "verify", "Sized by the fixture units served"],
      ["Septic tank", "Sized by occupants", "code", "National Plumbing Code and LGU"],
      ["Cleanouts", "At every change of direction", "code", "National Plumbing Code"],
      ["Water supply to fixtures", "12–20 mm", "planning", ""]
    ]
  },
  {
    id: "heights",
    draw: () => ["section"],
    label: "Ceilings & heights",
    icon: "↕",
    rows: [
      ["Habitable room, artificial ventilation", "2.40 m min.", "code", "NBC Rule VIII §805"],
      ["Natural ventilation, 1st storey", "2.70 m min.", "code", "NBC Rule VIII §805"],
      ["Natural ventilation, 2nd storey", "2.40 m min.", "code", "NBC Rule VIII §805"],
      ["Natural ventilation, 3rd storey up", "2.10 m min.", "code", "NBC Rule VIII §805"],
      ["Mezzanine clear height", "1.80 m min.", "code", "NBC Rule VIII §805"],
      ["Door and window head", "2,100 mm", "planning", ""],
      ["Residential floor-to-floor", "3.00–3.30 m", "planning", "Allows for beams and ceiling space"],
      ["Plinth / finished floor above grade", "150–300 mm", "planning", "Higher in flood-prone areas"]
    ]
  },
  {
    id: "clearances",
    draw: (name) => (/corridor|wheelchair/i.test(name) ? ["corridor"] : ["bedroom"]),
    label: "Furniture & circulation",
    icon: "⇔",
    rows: [
      ["Residential corridor", "900–1,200 mm", "planning", ""],
      ["Exit corridor", "1.12 m min.", "code", "NBC §1207 · 0.90 m if occupant load under 50"],
      ["Wheelchair turning space", "Ø 1,500 mm", "code", "BP 344"],
      ["Beside a bed", "600–700 mm", "planning", ""],
      ["Foot of bed to wall / wardrobe", "900 mm", "planning", ""],
      ["Behind a dining chair", "900 mm", "planning", "750 mm min. against a wall"],
      ["Sofa to coffee table", "400–450 mm", "planning", ""],
      ["In front of wardrobe", "900 mm", "planning", ""],
      ["Desk chair zone", "1,000 mm", "planning", ""]
    ]
  },
  {
    id: "site",
    draw: () => ["parking"],
    label: "Parking & site",
    icon: "▭",
    rows: [
      ["Car stall", "2.50 × 5.00 m", "code", "NBC Rule VII"],
      ["Accessible stall", "3.70 × 5.00 m", "code", "BP 344 · nearest the entrance"],
      ["Two-way driveway", "6.00 m", "planning", ""],
      ["One-way driveway", "3.00–3.50 m", "planning", ""],
      ["Driveway / ramp slope", "≤ 15%", "planning", "With transition slopes at the ends"],
      ["Setbacks and lot coverage", "By zoning and road width", "code", "NBC Rule VII tables and local zoning"],
      ["Firewall at property line", "Per Rule VII", "code", "No openings in firewalls"],
      ["Perimeter fence height", "≈ 3.00 m max.", "verify", "Check the LGU ordinance; front fences are often lower"]
    ]
  }
];
