// Renders text with each letter in a 70s palette color — the static version of
// the hero's little rainbow flash. Used by the "custom" tag.
const CC = ["#C1502E", "#E8853B", "#E9B44C", "#7A8B4C", "#2540E6", "#8F66C0"];

export default function RainbowText({ text }) {
  return (
    <>
      {text.split("").map((ch, i) =>
        ch === " " ? " " : <span key={i} style={{ color: CC[i % CC.length] }}>{ch}</span>
      )}
    </>
  );
}
