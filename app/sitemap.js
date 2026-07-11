import { getSiteData } from "@/lib/site";
import { slugify, ALL_SLUG, publicProducts } from "@/lib/data";

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const { categories, products } = await getSiteData();
  const now = new Date();

  const staticPages = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/shop/${ALL_SLUG}`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  ];

  const categoryPages = categories.map((c) => ({
    url: `${base}/shop/${slugify(c.name)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const ideaPages = categories.map((c) => ({
    url: `${base}/ideas/${slugify(c.name)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const productPages = publicProducts(products).map((p) => ({
    url: `${base}/product/${p.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...ideaPages];
}
