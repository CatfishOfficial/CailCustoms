// Renders text with each letter in a 70s palette color — the static version of
// the hero's little rainbow flash. Used by the "custom" tag.
// Bright 70s palette tuned to pop on a dark pill.
const CC = ["#F28A5C", "#F2A03F", "#F0CB5C", "#9FC46A", "#7C90F5", "#B98BE6"];

export default function RainbowText({ text }) {
  return (
    <>
      {text.split("").map((ch, i) =>
        ch === " " ? " " : <span key={i} style={{ color: CC[i % CC.length] }}>{ch}</span>
      )}
    </>
  );
}
