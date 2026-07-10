import Link from "next/link";
import ProductCard from "./ProductCard";
import IdeaCta from "./IdeaCta";
import { slugify, ALL_SLUG } from "@/lib/data";

// `cat` is a category name, or "All" for the everything/all-products view.
export default function CategoryView({ data, cat }) {
  const { categories, products } = data;
  const isAll = cat === "All";
  const list = isAll ? products : products.filter((p) => p.cat === cat);
  const meta = categories.find((c) => c.name === cat);
  // The "all products" view pitches to the catch-all category.
  const ideaCat = isAll ? categories.find((c) => c.name === "Everything") || categories[0] : meta;
  return (
    <section className="page">
      <Link className="crumb" href="/">← home</Link>
      <div className="cat-head">
        <span className="sec-eyebrow">{isAll ? "everything" : "category"}</span>
        <h2 className="cat-title">{cat}</h2>
        {meta && <p className="sec-note">{meta.blurb}</p>}
      </div>
      <div className="chips">
        {categories.map((c) => (
          <Link key={c.name} className={`chip ${c.name === cat ? "on" : ""}`} href={`/shop/${slugify(c.name)}`}>
            {c.name.toLowerCase()}
          </Link>
        ))}
        <Link className={`chip ${isAll ? "on" : ""}`} href={`/shop/${ALL_SLUG}`}>
          everything
        </Link>
      </div>
      {list.length > 0 ? (
        <div className="grid">
          {list.map((p, i) => (
            <ProductCard key={p.id} p={p} i={i} />
          ))}
        </div>
      ) : (
        <p className="sec-note">nothing here yet — check back soon.</p>
      )}
      {ideaCat && <IdeaCta category={ideaCat.name} />}
    </section>
  );
}
