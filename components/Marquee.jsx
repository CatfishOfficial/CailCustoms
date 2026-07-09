import React from "react";

export default function Marquee({ text }) {
  const parts = (text || "").split("·");
  return (
    <span>
      {parts.map((part, idx) => (
        <React.Fragment key={idx}>
          {part}
          {idx < parts.length - 1 ? <em>·</em> : null}
        </React.Fragment>
      ))}{" "}
    </span>
  );
}
