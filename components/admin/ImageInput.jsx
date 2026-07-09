"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "media";

// A single image field: paste a URL (fallback) OR upload a file to Supabase
// Storage. On successful upload the public URL is written back via onChange,
// so nothing downstream changes — the storefront still just reads a URL.
export default function ImageInput({ value, onChange, folder = "uploads", placeholder = "https://… or upload →" }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef(null);

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const supabase = createClient();
      const ext = (file.name.split(".").pop() || "bin").toLowerCase();
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        upsert: false,
        contentType: file.type || undefined,
      });
      if (error) throw error;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e) {
      setErr(e?.message || "upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="adm-imgfield">
      <input
        className="adm-input"
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => upload(e.target.files?.[0])}
      />
      <button
        type="button"
        className="adm-mini adm-upload"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        title="upload image"
        aria-label="upload image"
      >
        {busy ? "…" : <Upload size={14} />}
      </button>
      {err && <span className="login-error adm-uploaderr">{err}</span>}
    </div>
  );
}
