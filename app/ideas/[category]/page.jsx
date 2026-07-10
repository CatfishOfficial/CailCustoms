import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteData } from "@/lib/site";
import { categoryBySlug, slugify } from "@/lib/data";
import { ideaFormFor } from "@/lib/ideaForms";
import IdeaForm from "@/components/IdeaForm";

export async function generateMetadata({ params }) {
  const data = await getSiteData();
  const cat = categoryBySlug(data.categories, params.category);
  if (!cat) return { title: "got an idea?" };
  return {
    title: `got an idea? · ${cat.name.toLowerCase()}`,
    description: ideaFormFor(cat.name).pitch,
  };
}

export default async function IdeaPage({ params }) {
  const data = await getSiteData();
  const cat = categoryBySlug(data.categories, params.category);
  if (!cat) notFound();
  const form = ideaFormFor(cat.name);

  return (
    <section className="page ideapage">
      <div className="crumbs">
        <Link className="crumb" href="/">home</Link>
        <span>/</span>
        <Link className="crumb" href={`/shop/${slugify(cat.name)}`}>{cat.name.toLowerCase()}</Link>
        <span>/</span>
        <span className="crumb-here">got an idea?</span>
      </div>

      <header className="ideapage-head">
        <span className="idea-arcs" aria-hidden="true" />
        <span className="idea-burst" aria-hidden="true">✶</span>
        <span className="sec-eyebrow">custom work · {cat.name.toLowerCase()}</span>
        <h1 className="ideapage-title">got an idea?</h1>
        <p className="idea-pitch">{form.pitch} tell us everything below — sketches and reference files welcome.</p>
      </header>

      <IdeaForm category={cat.name} />
    </section>
  );
}
