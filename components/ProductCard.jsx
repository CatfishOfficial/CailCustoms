import Link from "next/link";
import Frame from "./Frame";
import { listingState, offeredSizes } from "@/lib/data";

// Navigates to the shareable product page. Rendered as a link (was an in-memory
// button in the prototype); keeps the `.card` styling and hover states.
export default function ProductCard({ p, i, showSizes = false, highlight = false }) {
  const cover = (p.images || []).filter(Boolean)[0];
  const sizes = offeredSizes(p);
  const state = listingState(p);
  return (
    <Link href={`/product/${p.id}`} className={`card ${state === "unavailable" ? "card-unavail" : ""} ${highlight ? "card-hl" : ""}`} style={{ animationDelay: `${i * 55}ms` }}>
      <div className="card-media">
        <Frame tone={p.tone} image={cover} />
        {highlight && (
          <span className="card-flair" aria-hidden="true">
            <span className="cf-rainbow" />
            <span className="idea-float cf-f1">✿</span>
            <span className="idea-float cf-f2">✶</span>
            <span className="idea-float cf-f3">❋</span>
            <span className="idea-float cf-f4">✦</span>
            <span className="idea-float cf-f5">❋</span>
            <span className="idea-float cf-f6">✶</span>
          </span>
        )}
        <span className="card-cat">{p.cat}</span>
        {state === "available" && <span className="card-inquire">view →</span>}
        {state === "unavailable" && <span className="card-soldout">unavailable</span>}
        {state === "preorder" && <span className="card-preorder">pre-order</span>}
      </div>
      <div className="card-body">
        <span className="card-name">{p.name}</span>
        <span className="card-price">{p.price}</span>
      </div>
      {showSizes && sizes.length > 0 && (
        <div className="card-sizes">{sizes.join(" · ")}</div>
      )}
    </Link>
  );
}
