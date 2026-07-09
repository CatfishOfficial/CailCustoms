// Shared constants + pure helpers. No server-only imports here, so this module
// is safe to use from both server and client components.

import {
  Shirt, Tag, Scissors, Package, Star,
  PenTool, Palette, Layers, Type, MousePointer,
  Lightbulb, Wrench, Ruler, Hammer, Cpu,
  Gift, Puzzle, Sparkles, HelpCircle, Magnet,
  Music, Headphones, Disc, Mic, Radio,
  Camera, Video, Film, Aperture, Play,
  Flame, Image as ImageIcon, Plug, Shapes, Volume2, Clapperboard,
} from "lucide-react";

export const TONES = ["t1", "t2", "t3", "t4", "t5", "t6"];
export const TONE_BG = {
  t1: "linear-gradient(140deg,#e8bcbc,#b96f6f)",
  t2: "linear-gradient(135deg,#b9c6ef,#5f74c9)",
  t3: "linear-gradient(150deg,#bfe0c8,#5f9e78)",
  t4: "linear-gradient(140deg,#ecd9a6,#c19a4c)",
  t5: "linear-gradient(135deg,#d6bfe8,#8f66c0)",
  t6: "linear-gradient(140deg,#aadadf,#4f9fa8)",
};

// Default content — mirrors the prototype's DEFAULT_DATA. Used as a fallback
// shape and to reset content in the admin.
export const DEFAULT_DATA = {
  settings: {
    email: "cailandco@gmail.com",
    phone: "(806) 601-7587",
    location: "Lubbock, TX",
    tagline: "make cool stuff.",
    heroLines: ["MAKE", "COOL", "STUFF."],
    heroSub:
      "a small crew making a lot of different things — shirts, builds, sound, design. pick a lane below and have a look around.",
    statement: "Designed by you,\nmade by Cail&Co.",
    about:
      "a small team, a bunch of mediums, and a soft spot for making things that didn't exist yesterday.",
    bigmark: "CAILCUSTOMS",
    ticker:
      "STUDIO OPEN · NEW DROP FRIDAY · MADE IN LUBBOCK, TX · SMALL BATCH, HANDMADE · SHIPPING NOW ·",
    marquee: "THREAD · PIXELS · CIRCUITS · SOUND · LIGHT · MAKE COOL STUFF ·",
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
  },
  categories: [
    { name: "Shirts & Merch", blurb: "wear the brand. small runs, big fits.", tone: "t1", image: "" },
    { name: "Digital Design", blurb: "logos, layouts, album art — you name it.", tone: "t2", image: "" },
    { name: "Mat. Stuff", blurb: "physical builds and objects that actually exist.", tone: "t3", image: "" },
    { name: "Everything", blurb: "the catch-all. weird one-offs live here.", tone: "t4", image: "" },
    { name: "Music & Sound", blurb: "tapes, loops, and noise worth keeping.", tone: "t5", image: "" },
    { name: "Photo & Video", blurb: "shoots, shorts, and little experiments.", tone: "t6", image: "" },
  ],
  products: [
    { id: "static-tee", name: "Static Tee — White", cat: "Shirts & Merch", price: "$28", tone: "t1", blurb: "screen-pulled, small run", desc: "our house blank, pulled by hand a few dozen at a time. soft, boxy, wears in nice.", images: [], featured: true },
    { id: "hoodie", name: "Cail&Co. Hoodie", cat: "Shirts & Merch", price: "$52", tone: "t1", blurb: "heavyweight, boxy fit", desc: "heavyweight fleece with a relaxed cut — the one you'll reach for first.", images: [], featured: false },
    { id: "patch", name: "Signal Patch", cat: "Shirts & Merch", price: "$8", tone: "t6", blurb: "woven, iron-on", desc: "a little woven badge that irons or sews onto just about anything.", images: [], featured: false },
    { id: "stickers", name: "Sticker Pack", cat: "Shirts & Merch", price: "$6", tone: "t4", blurb: "die-cut, 5-pack", desc: "five die-cut designs, weatherproof — good on laptops, bottles, whatever.", images: [], featured: false },
    { id: "logo", name: "Logo Package", cat: "Digital Design", price: "from $150", tone: "t2", blurb: "full mark + all the files", desc: "a full identity: primary mark, alt lockups, and every file you'll need.", images: [], featured: true },
    { id: "album-art", name: "Album Art", cat: "Digital Design", price: "from $80", tone: "t2", blurb: "cover + tracklist layout", desc: "cover, back, and tracklist layout built to your sound.", images: [], featured: false },
    { id: "invislamp", name: "Invislamp", cat: "Mat. Stuff", price: "$65", tone: "t3", blurb: "edge-lit acrylic, hidden driver", desc: "edge-lit acrylic with the driver tucked out of sight, so it looks like light floating.", images: [], featured: true },
    { id: "papiershelf", name: "Papiershelf", cat: "Mat. Stuff", price: "$40", tone: "t3", blurb: "folded-form paper composite", desc: "a folded-form shelf that's lighter than it looks and tougher than it should be.", images: [], featured: false },
    { id: "cassette", name: "Loop Cassette Vol.1", cat: "Music & Sound", price: "$12", tone: "t5", blurb: "limited tape run", desc: "a short run of tapes dubbed one at a time. analog hiss included, on purpose.", images: [], featured: true },
    { id: "shoot", name: "Product Shoot", cat: "Photo & Video", price: "from $120", tone: "t6", blurb: "half-day, edited, delivered", desc: "a half-day shoot for your product or drop — lit, shot, and edited.", images: [], featured: false },
    { id: "mystery", name: "Mystery Box", cat: "Everything", price: "$25", tone: "t4", blurb: "you get what you get", desc: "a box of odds and ends we picked out. no returns, all surprises.", images: [], featured: false },
    { id: "custom", name: "Custom Build", cat: "Everything", price: "let's talk", tone: "t3", blurb: "got an idea? bring it.", desc: "you've got an idea, we've got tools. tell us what you're picturing.", images: [], featured: false },
  ],
  heroSlides: [
    { tone: "t2", label: "fig. 01 — the bench", image: "" },
    { tone: "t1", label: "fig. 02 — fresh tees", image: "" },
    { tone: "t3", label: "fig. 03 — the lamp", image: "" },
    { tone: "t5", label: "fig. 04 — new shelf", image: "" },
    { tone: "t6", label: "fig. 05 — on set", image: "" },
    { tone: "t4", label: "fig. 06 — odds & ends", image: "" },
  ],
};

export const CAT_ICONS = {
  "Shirts & Merch": [Shirt, Tag, Scissors, Package, Star, Flame],
  "Digital Design": [PenTool, Palette, Layers, Type, MousePointer, ImageIcon],
  "Mat. Stuff": [Lightbulb, Wrench, Ruler, Hammer, Cpu, Plug],
  "Everything": [Gift, Puzzle, Sparkles, HelpCircle, Magnet, Shapes],
  "Music & Sound": [Music, Headphones, Disc, Mic, Radio, Volume2],
  "Photo & Video": [Camera, Video, Film, Aperture, Play, Clapperboard],
};
export const ICON_FALLBACK = [Sparkles, Star, Gift, Package, Tag, Puzzle];
export const iconsFor = (name) => CAT_ICONS[name] || ICON_FALLBACK;

export const DRAWER = [
  { left: 9, peek: 40, rot: -11, delay: 0.03, color: "#2540E6" },
  { left: 25, peek: 58, rot: 5, delay: 0, color: "#c19a4c" },
  { left: 41, peek: 26, rot: -4, delay: 0.09, color: "#4f9fa8" },
  { left: 57, peek: 64, rot: 9, delay: 0.02, color: "#b96f6f" },
  { left: 73, peek: 34, rot: -8, delay: 0.06, color: "#8f66c0" },
  { left: 90, peek: 48, rot: 7, delay: 0.11, color: "#5f9e78" },
];

// ---------- helpers ----------
export const uid = () => "id_" + Math.random().toString(36).slice(2, 9);
export const countIn = (products, cat) => products.filter((p) => p.cat === cat).length;
export const madeToOrder = (price) => /^(from|let)/i.test((price || "").trim());
export const mailtoHref = (email, subject) =>
  `mailto:${email}?subject=${encodeURIComponent("Cail Customs — " + subject)}`;
export const telHref = (phone) => {
  const d = (phone || "").replace(/\D/g, "");
  return "tel:" + (d.length === 10 ? "+1" + d : d);
};

// Category name <-> URL slug. "Shirts & Merch" -> "shirts-merch".
export const slugify = (s) =>
  (s || "")
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// The "everything / all products" view lives at /shop/all to avoid colliding
// with the real "Everything" category (slug "everything").
export const ALL_SLUG = "all";

export const categoryBySlug = (categories, slug) =>
  (categories || []).find((c) => slugify(c.name) === slug) || null;
