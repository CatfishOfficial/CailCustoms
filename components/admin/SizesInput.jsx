"use client";

import { useEffect, useRef, useState } from "react";
import { parseSizes, sizesToText } from "@/lib/data";

// Sizes are stored as an array but edited as a free comma list. The previous
// field derived its value from the array on every keystroke (join/split), so
// typing "S," round-tripped to "S" and the comma vanished. We keep the raw
// typed text locally and only push the parsed array up; an external change to
// `value` (e.g. reset to defaults) re-seeds the text.
export default function SizesInput({ value, onChange }) {
  const [text, setText] = useState(() => sizesToText(value));
  const lastPushed = useRef(sizesToText(value));

  useEffect(() => {
    const t = sizesToText(value);
    if (t !== lastPushed.current) {
      setText(t);
      lastPushed.current = t;
    }
  }, [value]);

  return (
    <label className="adm-field">
      <span>sizes (comma-separated · blank = one size)</span>
      <input
        className="adm-input"
        value={text}
        placeholder="S, M, L, XL"
        onChange={(e) => {
          const raw = e.target.value;
          setText(raw);
          const arr = parseSizes(raw);
          lastPushed.current = sizesToText(arr);
          onChange(arr);
        }}
      />
    </label>
  );
}
