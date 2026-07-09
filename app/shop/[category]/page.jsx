import { notFound } from "next/navigation";
import { getSiteData } from "@/lib/site";
import { categoryBySlug, ALL_SLUG } from "@/lib/data";
import CategoryView from "@/components/CategoryView";

async function resolve(slug) {
  const data = await getSiteData();
  if (slug === ALL_SLUG) return { data, cat: "All", meta: null };
  const meta = categoryBySlug(data.categories, slug);
  if (!meta) return null;
  return { data, cat: meta.name, meta };
}

export async function generateMetadata({ params }) {
  const resolved = await resolve(params.category);
  if (!resolved) return { title: "not found" };
  const title = resolved.cat === "All" ? "everything" : resolved.cat;
  return {
    title,
    description: resolved.meta?.blurb || "browse the shop.",
  };
}

export default async function CategoryPage({ params }) {
  const resolved = await resolve(params.category);
  if (!resolved) notFound();
  return <CategoryView data={resolved.data} cat={resolved.cat} />;
}
