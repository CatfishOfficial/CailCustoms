"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/data";
import { ideaFormFor } from "@/lib/ideaForms";
import FileDrop from "./FileDrop";

// "got an idea?" — per-category custom-work pitch form at the bottom of each
// category page. Structured prompts come from lib/ideaForms.js; everything
// shares the idea textarea, file drop, and contact fields.
export default function IdeaForm({ category }) {
  const form = ideaFormFor(category);
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState({});
  const [idea, setIdea] = useState("");
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (website) {
      setSent(true); // bot — fake success, save nothing
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const supabase = createClient();

      // 1. upload staged files to the private submissions bucket
      const paths = [];
      for (const f of files) {
        const clean = f.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-60);
        const path = `ideas/${slugify(category)}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${clean}`;
        const { error } = await supabase.storage.from("submissions").upload(path, f, { contentType: f.type || undefined });
        if (error) throw new Error(`upload failed for "${f.name}" — ${error.message}`);
        paths.push(path);
      }

      // 2. file the submission (only non-empty structured answers)
      const cleanFields = Object.fromEntries(Object.entries(fields).filter(([, v]) => v && v.trim()));
      const { error } = await supabase.from("idea_submissions").insert({
        category,
        fields: cleanFields,
        idea,
        files: paths,
        name,
        email,
      });
      if (error) throw error;
      setSent(true);
    } catch (ex) {
      setErr(ex?.message || "something went wrong — try again in a sec.");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="idea">
        <div className="idea-done">
          <span className="sec-eyebrow">custom work</span>
          <p className="idea-pitch">idea received — we'll email you back at <b>{email || "your email"}</b>. nice one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="idea">
      <div className="section-head">
        <span className="sec-eyebrow">custom work</span>
      </div>
      {!open ? (
        <button className="idea-cta" onClick={() => setOpen(true)}>
          <Lightbulb size={20} />
          <span>
            <b>got an idea?</b>
            <em>{form.pitch}</em>
          </span>
          <span className="idea-go">pitch it →</span>
        </button>
      ) : (
        <form className="idea-form" onSubmit={submit}>
          <p className="idea-pitch">{form.pitch}</p>
          {form.fields.length > 0 && (
            <div className="idea-grid">
              {form.fields.map((f) => (
                <label className="f-field" key={f.key}>
                  <span>{f.label}</span>
                  <input
                    className="f-input"
                    value={fields[f.key] || ""}
                    placeholder={f.ph}
                    onChange={(e) => setFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  />
                </label>
              ))}
            </div>
          )}
          <label className="f-field">
            <span>the idea — go as long as you want</span>
            <textarea
              className="f-area"
              rows={6}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              required
              placeholder="what is it, who's it for, what should it feel like…"
            />
          </label>
          <FileDrop files={files} onChange={setFiles} />
          <div className="idea-grid">
            <label className="f-field">
              <span>name</span>
              <input className="f-input" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            </label>
            <label className="f-field">
              <span>email</span>
              <input className="f-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </label>
          </div>
          <label className="hp" aria-hidden="true">
            website
            <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
          </label>
          {err && <p className="login-error">{err}</p>}
          <div className="idea-foot">
            <button className="btn" type="submit" disabled={busy}>{busy ? "sending…" : "send the idea"}</button>
            <button className="idea-cancel" type="button" onClick={() => setOpen(false)}>never mind</button>
          </div>
        </form>
      )}
    </div>
  );
}
