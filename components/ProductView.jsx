"use client";

import { useState } from "react";
import Link from "next/link";
import Frame from "./Frame";
import ProductCard from "./ProductCard";
import { mailtoHref, slugify, specsFor } from "@/lib/data";

export default function ProductView({ data, product }) {
  const { products } = data;
  const imgs = (product.images || []).filter(Boolean);
  const useImg = imgs.length > 0;
  const gallery = useImg
    ? imgs
    : [product.tone, "t4", "t6"].filter((t, idx, a) => a.indexOf(t) === idx).slice(0, 3);
  const [active, setActive] = useState(0);
  const cur = Math.min(active, gallery.length - 1);
  const related = products.filter((p) => p.cat === product.cat && p.id !== product.id).slice(0, 3);
  const specs = specsFor(data.settings, product);
  const sizes = (product.sizes || []).filter(Boolean);
  const [size, setSize] = useState("");
  const inquireSubject = product.name + (size ? ` (size ${size})` : "");

  return (
    <section className="page">
      <div className="crumbs">
        <Link className="crumb" href="/">home</Link>
        <span>/</span>
        <Link className="crumb" href={`/shop/${slugify(product.cat)}`}>{product.cat.toLowerCase()}</Link>
        <span>/</span>
        <span className="crumb-here">{product.name.toLowerCase()}</span>
      </div>

      <div className="pdp">
        <div className="pdp-gallery">
          <div className="pdp-main">
            <Frame
              tone={useImg ? undefined : gallery[cur]}
              image={useImg ? gallery[cur] : undefined}
              label={`0${cur + 1}`}
            />
          </div>
          <div className="pdp-thumbs">
            {gallery.map((g, i) => (
              <button
                key={i}
                className={`pdp-thumb ${i === cur ? "on" : ""}`}
                onClick={() => setActive(i)}
                aria-label={`view ${i + 1}`}
              >
                <Frame tone={useImg ? undefined : g} image={useImg ? g : undefined} />
              </button>
            ))}
          </div>
        </div>

        <div className="pdp-info">
          <Link className="pdp-cat" href={`/shop/${slugify(product.cat)}`}>{product.cat}</Link>
          <h1 className="pdp-name">{product.name}</h1>
          <div className="pdp-price">{product.price}</div>
          <p className="pdp-desc">{product.desc}</p>
          {sizes.length > 0 && (
            <div className="pdp-sizes">
              <span className="pdp-sizes-label">size{size ? `: ${size}` : ""}</span>
              <div className="size-chips">
                {sizes.map((sz) => (
                  <button
                    type="button"
                    key={sz}
                    className={`size-chip ${size === sz ? "on" : ""}`}
                    onClick={() => setSize(size === sz ? "" : sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}
          <ul className="pdp-specs">
            {specs.map((row, i) => (
              <li key={i}><span>{row.label}</span><b>{row.value}</b></li>
            ))}
          </ul>
          <a className="btn pdp-buy" href={mailtoHref(data.settings.email, inquireSubject)}>inquire about this</a>
          <p className="pdp-note">no cart — we'll confirm sizing, specs, and final price by email, then get it to you.</p>
        </div>
      </div>

      {related.length > 0 && (
        <div className="related">
          <div className="section-head">
            <span className="sec-eyebrow">more from {product.cat.toLowerCase()}</span>
          </div>
          <div className="grid">
            {related.map((p, i) => (
              <ProductCard key={p.id} p={p} i={i} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
