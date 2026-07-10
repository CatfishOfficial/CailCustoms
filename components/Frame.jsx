// Placeholder-or-image tile. When there's no image, the `tone` gradient shows
// as a graceful fallback (identical to the prototype).
//
// Optional props (hero-slide context):
//   priority — true on the first slide so it preloads eagerly
//   quality  — 1-100; defaults to Next's 85. Pass 100 for subsequent slides.
//   sizes    — responsive sizes hint for the browser's srcset picker
import Image from "next/image";

export default function Frame({ tone, label, image, priority = false, quality, sizes }) {
  return (
    <div className={`frame ${image ? "" : tone || ""}`}>
      {image ? (
        <Image
          className="frame-img"
          src={image}
          alt=""
          fill
          priority={priority}
          quality={quality}
          sizes={sizes || "100vw"}
          style={{ objectFit: "cover" }}
        />
      ) : null}
      <div className="grain" aria-hidden="true" />
      {label && <span className="frame-label">{label}</span>}
    </div>
  );
}
