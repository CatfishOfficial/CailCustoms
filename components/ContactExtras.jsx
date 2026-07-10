"use client";

import { Plus, X } from "lucide-react";
import { CONTACT_TYPES } from "@/lib/orders";

// Optional extra contact handles on the public forms. A small "+" adds a row:
// platform picker + handle. Parent owns the [{type, value}] list.
export default function ContactExtras({ contacts, onChange }) {
  const update = (i, patch) => onChange(contacts.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  return (
    <div className="cx">
      {contacts.map((c, i) => (
        <div className="cx-row" key={i}>
          <select className="f-input cx-type" value={c.type} onChange={(e) => update(i, { type: e.target.value })} aria-label="platform">
            {CONTACT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input
            className="f-input"
            value={c.value}
            placeholder="@handle / username"
            onChange={(e) => update(i, { value: e.target.value })}
            aria-label={`${c.type} handle`}
          />
          <button type="button" className="cx-del" onClick={() => onChange(contacts.filter((_, j) => j !== i))} aria-label={`remove ${c.type}`}>
            <X size={14} />
          </button>
        </div>
      ))}
      <button type="button" className="cx-add" onClick={() => onChange([...contacts, { type: "instagram", value: "" }])}>
        <Plus size={13} /> add another way to reach you
      </button>
    </div>
  );
}
