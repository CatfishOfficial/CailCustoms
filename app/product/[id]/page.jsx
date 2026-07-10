import { notFound } from "next/navigation";
import { getSiteData } from "@/lib/site";
import ProductView from "@/components/ProductView";
import JsonLd from "@/components/JsonLd";

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
  const images = (product.images || []).filter(Boolean);
  const cover = images[0];
  const description = [product.blurb, product.desc].filter(Boolean).join(" — ");
  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      ...(cover && { images: [{ url: cover, alt: product.name }] }),
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title: product.name,
      description,
      ...(cover && { images: [cover] }),
    },
  };
}

export default async function ProductPage({ params }) {
  const resolved = await resolve(params.id);
  if (!resolved) notFound();
  const { product } = resolved;

  const images = (product.images || []).filter(Boolean);
  const priceMatch = (product.price || "").match(/\$(\d+)/);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: [product.blurb, product.desc].filter(Boolean).join(" — "),
    ...(images.length && { image: images }),
    brand: { "@type": "Brand", name: "Cail Customs" },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      ...(priceMatch && { price: priceMatch[1] }),
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Cail Customs" },
    },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <ProductView data={resolved.data} product={product} />
    </>
  );
}
