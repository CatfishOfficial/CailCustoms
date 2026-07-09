// Placeholder-or-image tile. When there's no image, the `tone` gradient shows
// as a graceful fallback (identical to the prototype).
export default function Frame({ tone, label, image }) {
  return (
    <div className={`frame ${image ? "" : tone || ""}`}>
      {image ? <img className="frame-img" src={image} alt="" loading="lazy" /> : null}
      <div className="grain" aria-hidden="true" />
      {label && <span className="frame-label">{label}</span>}
    </div>
  );
}
