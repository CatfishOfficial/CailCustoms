import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_DATA } from "@/lib/data";

// Reads all content from Supabase and assembles it into the exact shape the
// front end expects: { settings, categories, products, heroSlides }.
// Falls back to DEFAULT_DATA if Supabase isn't reachable/configured so the
// site never renders empty. Wrapped in cache() so the layout and the page
// share a single fetch within one request.
export const getSiteData = cache(async function getSiteData() {
  try {
    const supabase = createClient();
    const [settingsRes, catsRes, prodsRes, slidesRes, stockRes] = await Promise.all([
      supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("categories").select("*").order("position", { ascending: true }),
      supabase.from("products").select("*").order("position", { ascending: true }),
      supabase.from("hero_slides").select("*").order("position", { ascending: true }),
      supabase.from("product_stock").select("product_id, size, qty"),
    ]);

    // Group on-hand stock by product so each listing carries its own rows.
    const stockByProduct = {};
    for (const r of stockRes.data || []) {
      (stockByProduct[r.product_id] ||= []).push({ size: r.size || "", qty: r.qty });
    }

    const row = settingsRes.data;
    const settings = row
      ? {
          email: row.email,
          phone: row.phone,
          location: row.location,
          tagline: row.tagline,
          heroLines: Array.isArray(row.hero_lines) ? row.hero_lines : DEFAULT_DATA.settings.heroLines,
          heroSub: row.hero_sub,
          statement: row.statement,
          about: row.about,
          bigmark: row.bigmark,
          ticker: row.ticker,
          marquee: row.marquee,
          instagram: row.instagram,
          youtube: row.youtube,
        }
      : DEFAULT_DATA.settings;

    const categories =
      catsRes.data && catsRes.data.length
        ? catsRes.data.map((c) => ({
            id: c.id,
            name: c.name,
            blurb: c.blurb,
            tone: c.tone,
            image: c.image,
            parentId: c.parent_id || null,
            layout: c.layout || "standard",
            isItem: !!c.is_item,
          }))
        : DEFAULT_DATA.categories;

    const products =
      prodsRes.data && prodsRes.data.length
        ? prodsRes.data.map((p) => ({
            id: p.id,
            name: p.name,
            cat: p.cat,
            price: p.price,
            tone: p.tone,
            blurb: p.blurb,
            desc: p.description, // DB column -> prototype's `desc`
            images: Array.isArray(p.images) ? p.images : [],
            sizes: Array.isArray(p.sizes) ? p.sizes : [],
            specs: Array.isArray(p.specs) ? p.specs : [],
            featured: !!p.featured,
            available: p.available !== false,
            preorder: !!p.preorder,
            stock: stockByProduct[p.id] || [],
            private: !!p.private,
          }))
        : DEFAULT_DATA.products;

    const heroSlides =
      slidesRes.data && slidesRes.data.length
        ? slidesRes.data.map((s) => ({ tone: s.tone, label: s.label, image: s.image }))
        : DEFAULT_DATA.heroSlides;

    return { settings, categories, products, heroSlides };
  } catch (e) {
    // Falling back to defaults hides real problems (missing env, RLS blocking
    // reads, tables not created). Log it so it's visible in server logs.
    console.warn("[getSiteData] falling back to DEFAULT_DATA:", e?.message || e);
    return DEFAULT_DATA;
  }
});
