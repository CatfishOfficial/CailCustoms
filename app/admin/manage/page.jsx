import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_DATA } from "@/lib/data";
import AdminClient from "@/components/admin/AdminClient";

export const metadata = { title: "admin", robots: { index: false, follow: false } };

// Loads content as an admin-editable shape that keeps the DB ids (categories &
// hero slides), so the client can reconcile updates/deletes precisely.
export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [settingsRes, catsRes, prodsRes, slidesRes] = await Promise.all([
    supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("categories").select("*").order("position", { ascending: true }),
    supabase.from("products").select("*").order("position", { ascending: true }),
    supabase.from("hero_slides").select("*").order("position", { ascending: true }),
  ]);

  const row = settingsRes.data;
  const settings = row
    ? {
        email: row.email, phone: row.phone, location: row.location, tagline: row.tagline,
        heroLines: Array.isArray(row.hero_lines) ? row.hero_lines : DEFAULT_DATA.settings.heroLines,
        heroSub: row.hero_sub, statement: row.statement, about: row.about, bigmark: row.bigmark,
        ticker: row.ticker, marquee: row.marquee, instagram: row.instagram, youtube: row.youtube,
      }
    : { ...DEFAULT_DATA.settings };

  const initialData = {
    settings,
    categories: (catsRes.data || []).map((c) => ({
      id: c.id, name: c.name, blurb: c.blurb, tone: c.tone, image: c.image,
      parentId: c.parent_id || null, layout: c.layout || "standard", isItem: !!c.is_item,
    })),
    products: (prodsRes.data || []).map((p) => ({
      id: p.id, name: p.name, cat: p.cat, price: p.price, tone: p.tone,
      blurb: p.blurb, desc: p.description, images: Array.isArray(p.images) ? p.images : [],
      sizes: Array.isArray(p.sizes) ? p.sizes : [], specs: Array.isArray(p.specs) ? p.specs : [], featured: !!p.featured,
    })),
    heroSlides: (slidesRes.data || []).map((sl) => ({ id: sl.id, tone: sl.tone, label: sl.label, image: sl.image })),
  };

  return <AdminClient initialData={initialData} userEmail={user.email} />;
}
