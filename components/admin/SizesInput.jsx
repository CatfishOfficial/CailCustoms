"use client";

import { useEffect, useRef, useState } from "react";
import { parseSizes, sizesToText } from "@/lib/data";

// Sizes are stored as an array but edited as a free comma list. We keep the raw
// typed text locally so commas (and trailing "S, ") never get stripped mid-type
// — the parsed array is pushed to the parent for persistence. Only an external
// change to `value` (e.g. reset to defaults) re-seeds the text.
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
      <span>sizes (comma separated — shown as chips on the product page)</span>
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
