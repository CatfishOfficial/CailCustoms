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
  const isAll = resolved.cat === "All";
  const title = isAll ? "everything" : resolved.cat;
  const description = resolved.meta?.blurb || "browse the shop.";
  const cover = resolved.meta?.image || null;
  return {
    title,
    description,
    openGraph: {
      title: `${title} — Cail Customs`,
      description,
      type: "website",
      ...(cover && { images: [{ url: cover, alt: title }] }),
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title: `${title} — Cail Customs`,
      description,
      ...(cover && { images: [cover] }),
    },
  };
}

export default async function CategoryPage({ params }) {
  const resolved = await resolve(params.category);
  if (!resolved) notFound();
  return <CategoryView data={resolved.data} cat={resolved.cat} />;
}
