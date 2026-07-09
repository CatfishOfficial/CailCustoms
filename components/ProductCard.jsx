import Link from "next/link";
import Frame from "./Frame";

// Navigates to the shareable product page. Rendered as a link (was an in-memory
// button in the prototype); keeps the `.card` styling and hover states.
export default function ProductCard({ p, i }) {
  const cover = (p.images || []).filter(Boolean)[0];
  return (
    <Link href={`/product/${p.id}`} className="card" style={{ animationDelay: `${i * 55}ms` }}>
      <div className="card-media">
        <Frame tone={p.tone} image={cover} />
        <span className="card-cat">{p.cat}</span>
        <span className="card-inquire">view →</span>
      </div>
      <div className="card-body">
        <span className="card-name">{p.name}</span>
        <span className="card-price">{p.price}</span>
      </div>
    </Link>
  );
}
