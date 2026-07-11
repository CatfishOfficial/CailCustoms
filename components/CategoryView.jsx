import Link from "next/link";
import ProductCard from "./ProductCard";
import Frame from "./Frame";
import { slugify, ALL_SLUG, topLevel, childrenOf, countIn, ideaHref } from "@/lib/data";

// `cat` is a category name, or "All" for the everything/all-products view.
export default function CategoryView({ data, cat }) {
  const { categories, products, settings } = data;
  const isAll = cat === "All";
  const list = isAll ? products : products.filter((p) => p.cat === cat);
  const meta = categories.find((c) => c.name === cat);
  const subs = meta ? childrenOf(categories, meta.id) : [];
  const isApparel = meta?.layout === "apparel";
  const showItemBox = !!meta?.isItem;
  const hasItems = list.length > 0 || showItemBox;

  return (
    <section className="page">
      <Link className="crumb" href="/">← home</Link>
      <div className="cat-head">
        <span className="sec-eyebrow">{isAll ? "everything" : "category"}</span>
        <h2 className="cat-title">{cat}</h2>
        {meta && <p className="sec-note">{meta.blurb}</p>}
      </div>

      <div className="chips">
        {topLevel(categories).map((c) => (
          <Link key={c.name} className={`chip ${c.name === cat ? "on" : ""}`} href={`/shop/${slugify(c.name)}`}>
            {c.name.toLowerCase()}
          </Link>
        ))}
        <Link className={`chip ${isAll ? "on" : ""}`} href={`/shop/${ALL_SLUG}`}>
          everything
        </Link>
      </div>

      {subs.length > 0 && (
        <div className="subcats">
          {subs.map((sc) => {
            const n = countIn(products, sc.name);
            return (
              <Link key={sc.id} className="catcard subcatcard" href={`/shop/${slugify(sc.name)}`}>
                <div className="catcard-media">
                  <Frame tone={sc.tone} image={sc.image} />
                  <span className="catcard-count">{n} {n === 1 ? "thing" : "things"}</span>
                  <div className="catcard-overlay">
                    <span className="catcard-name">{sc.name}</span>
                    <span className="catcard-go">browse →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {subs.length > 0 && hasItems && <div className="subcat-divider" aria-hidden="true" />}

      {hasItems ? (
        <div className="grid">
          {list.map((p, i) => (
            <ProductCard key={p.id} p={p} i={i} showSizes={isApparel} />
          ))}
          {showItemBox && (
            <a className="card idea-card" href={ideaHref(settings)}>
              <div className="card-media">
                <Frame tone={meta?.tone || "t4"} />
                <span className="idea-plus" aria-hidden="true">+</span>
              </div>
              <div className="card-body">
                <span className="card-name">give us your idea</span>
                <span className="card-price">→</span>
              </div>
            </a>
          )}
        </div>
      ) : (
        <p className="sec-note">nothing here yet — check back soon.</p>
      )}
    </section>
  );
}
