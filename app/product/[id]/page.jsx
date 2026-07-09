import { notFound } from "next/navigation";
import { getSiteData } from "@/lib/site";
import ProductView from "@/components/ProductView";

async function resolve(id) {
  const data = await getSiteData();
  const product = data.products.find((p) => p.id === id);
  if (!product) return null;
  return { data, product };
}

export async function generateMetadata({ params }) {
  const resolved = await resolve(params.id);
  if (!resolved) return { title: "not found" };
  const { product } = resolved;
  const cover = (product.images || []).filter(Boolean)[0];
  return {
    title: product.name,
    description: product.blurb || product.desc || "",
    openGraph: {
      title: product.name,
      description: product.blurb || product.desc || "",
      images: cover ? [{ url: cover }] : undefined,
    },
  };
}

export default async function ProductPage({ params }) {
  const resolved = await resolve(params.id);
  if (!resolved) notFound();
  return <ProductView data={resolved.data} product={resolved.product} />;
}
