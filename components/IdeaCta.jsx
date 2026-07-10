import Link from "next/link";
import { slugify } from "@/lib/data";
import { ideaFormFor } from "@/lib/ideaForms";

// The 70s "got an idea?" card at the bottom of category pages — links to the
// category's pitch page at /ideas/[slug].
export default function IdeaCta({ category }) {
  const form = ideaFormFor(category);
  return (
    <div className="idea">
      <div className="section-head">
        <span className="sec-eyebrow">custom work</span>
      </div>
      <Link className="idea-cta" href={`/ideas/${slugify(category)}`}>
        <span className="idea-arcs" aria-hidden="true" />
        <span className="idea-burst" aria-hidden="true">✶</span>
        <span className="idea-cta-txt">
          <b>got an idea?</b>
          <em>{form.pitch}</em>
        </span>
        <span className="idea-go">pitch it →</span>
      </Link>
    </div>
  );
}
