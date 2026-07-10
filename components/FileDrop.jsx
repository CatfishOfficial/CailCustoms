"use client";

import { useState, useRef } from "react";
import { Paperclip, X } from "lucide-react";

const MAX_FILES = 6;
const MAX_BYTES = 10 * 1024 * 1024; // matches the bucket's server-side limit
const OK_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"];

const fmtSize = (b) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)}mb` : `${Math.ceil(b / 1024)}kb`);

// Drag-and-drop / click-to-browse file staging. Doesn't upload — hands the
// staged File objects to the parent via onChange. Server-side, the
// "submissions" bucket enforces the same size/type limits regardless.
export default function FileDrop({ files, onChange }) {
  const [over, setOver] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = useRef(null);

  const stage = (incoming) => {
    setErr("");
    const next = [...files];
    for (const f of incoming) {
      if (next.length >= MAX_FILES) {
        setErr(`max ${MAX_FILES} files`);
        break;
      }
      if (f.size > MAX_BYTES) {
        setErr(`"${f.name}" is over 10mb`);
        continue;
      }
      if (!OK_TYPES.includes(f.type)) {
        setErr(`"${f.name}" — images or pdf only`);
        continue;
      }
      if (!next.some((x) => x.name === f.name && x.size === f.size)) next.push(f);
    }
    onChange(next);
  };

  return (
    <div className="f-field">
      <span>files (optional — sketches, references, photos)</span>
      <button
        type="button"
        className={`filedrop ${over ? "over" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); stage(Array.from(e.dataTransfer.files || [])); }}
      >
        drag files here or click to browse — images or pdf, up to 10mb each
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
        hidden
        onChange={(e) => { stage(Array.from(e.target.files || [])); e.target.value = ""; }}
      />
      {err && <span className="login-error">{err}</span>}
      {files.length > 0 && (
        <ul className="filedrop-list">
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}`}>
              <Paperclip size={12} /> {f.name} <em>{fmtSize(f.size)}</em>
              <button type="button" onClick={() => onChange(files.filter((_, j) => j !== i))} aria-label={`remove ${f.name}`}>
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
