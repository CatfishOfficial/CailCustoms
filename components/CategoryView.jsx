import Link from "next/link";
import ProductCard from "./ProductCard";
import IdeaCta from "./IdeaCta";
import Frame from "./Frame";
import { slugify, ALL_SLUG, topLevel, childrenOf, countIn, publicProducts, listingState } from "@/lib/data";

// available listings show first, then preorder, then unavailable last.
const STATE_RANK = { available: 0, preorder: 1, unavailable: 2 };

// `cat` is a category name, or "All" for the everything/all-products view.
export default function CategoryView({ data, cat }) {
  const { categories } = data;
  const products = publicProducts(data.products);
  const isAll = cat === "All";
  const list = isAll ? products : products.filter((p) => p.cat === cat);
  // Available listings first, then preorder, then unavailable last. Featured
  // listings float to the front within their bucket; order is otherwise
  // preserved (Array.sort is stable).
  const ordered = [...list].sort((a, b) => {
    const byState = STATE_RANK[listingState(a)] - STATE_RANK[listingState(b)];
    if (byState !== 0) return byState;
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });
  const meta = categories.find((c) => c.name === cat);
  // The "all products" view pitches to the catch-all category.
  const ideaCat = isAll ? categories.find((c) => c.name === "Everything") || categories[0] : meta;
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
          {showItemBox && meta && (
            <Link className="grididea" href={`/ideas/${slugify(meta.name)}`}>
              <div className="grididea-media">
                <span className="idea-arcs" aria-hidden="true" />
                <span className="idea-burst" aria-hidden="true">✶</span>
                <span className="idea-float f1" aria-hidden="true">✿</span>
                <span className="idea-float f2" aria-hidden="true">✶</span>
                <span className="idea-float f3" aria-hidden="true">❋</span>
                <span className="grididea-eyebrow">custom work</span>
                <span className="grididea-title">got an <span className="idea-tilt">idea?</span></span>
                <span className="idea-squiggle" aria-hidden="true" />
              </div>
              <div className="card-body">
                <span className="card-name">pitch us something</span>
                <span className="card-price">pitch it →</span>
              </div>
            </Link>
          )}
          {ordered.map((p, i) => (
            <ProductCard key={p.id} p={p} i={i} showSizes={isApparel} highlight={!!p.featured} />
          ))}
        </div>
      ) : (
        <p className="sec-note">nothing here yet — check back soon.</p>
      )}

      {ideaCat && <IdeaCta category={ideaCat.name} />}
    </section>
  );
}
