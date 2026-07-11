import Link from "next/link";
import Frame from "./Frame";
import { isAvailable, offeredSizes } from "@/lib/data";

// Navigates to the shareable product page. Rendered as a link (was an in-memory
// button in the prototype); keeps the `.card` styling and hover states.
export default function ProductCard({ p, i, showSizes = false }) {
  const cover = (p.images || []).filter(Boolean)[0];
  const sizes = offeredSizes(p);
  const available = isAvailable(p);
  return (
    <Link href={`/product/${p.id}`} className={`card ${available ? "" : "card-unavail"}`} style={{ animationDelay: `${i * 55}ms` }}>
      <div className="card-media">
        <Frame tone={p.tone} image={cover} />
        <span className="card-cat">{p.cat}</span>
        {available ? <span className="card-inquire">view →</span> : <span className="card-soldout">unavailable</span>}
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
