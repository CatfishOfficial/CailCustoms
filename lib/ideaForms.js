// Per-category custom-idea form config. Every form also gets the shared bits
// (idea textarea, file drop, name + email) — these are just the structured
// prompts that make each category feel purpose-built. Unknown/renamed
// categories fall back to pure freeform.

export const IDEA_FORMS = {
  "Shirts & Merch": {
    pitch: "want it on a shirt, a hat, a patch? tell us what you're picturing.",
    fields: [
      { key: "garment", label: "garment type", ph: "tee / hoodie / hat / patch…" },
      { key: "sizes", label: "size(s)", ph: "e.g. 2× M, 1× XL" },
      { key: "print", label: "colors / print idea", ph: "colors, placement, vibe" },
    ],
  },
  "Digital Design": {
    pitch: "logos, covers, layouts — pitch us the brief.",
    fields: [
      { key: "type", label: "design type", ph: "logo / album art / layout / other" },
      { key: "refs", label: "references", ph: "links or artists you like" },
    ],
  },
  "Mat. Stuff": {
    pitch: "a gadget that doesn't exist yet? we can probably wire it up.",
    fields: [
      { key: "build", label: "what to build", ph: "lamp / led sign / custom controller / something weirder" },
      { key: "does", label: "what should it do", ph: "glow / move / make noise / all three" },
      { key: "specs", label: "specs / parts", ph: "rough size, power, materials — whatever you know" },
    ],
  },
  "Music & Sound": {
    pitch: "loops, tapes, sound for your thing — what are you hearing?",
    fields: [
      { key: "format", label: "format", ph: "tape / digital / live" },
      { key: "genre", label: "genre / vibe", ph: "" },
      { key: "length", label: "length", ph: "e.g. 30s loop, full track" },
    ],
  },
  "Photo & Video": {
    pitch: "got something worth shooting? give us the picture.",
    fields: [
      { key: "shoot", label: "shoot type", ph: "product / portrait / event / video" },
      { key: "location", label: "location", ph: "" },
      { key: "date", label: "date", ph: "rough timing is fine" },
    ],
  },
  "Everything": {
    pitch: "doesn't fit a box? perfect. just tell us everything.",
    fields: [],
  },
};

export const ideaFormFor = (cat) => IDEA_FORMS[cat] || { pitch: "tell us what you're picturing.", fields: [] };
