"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/data";
import { ideaFormFor } from "@/lib/ideaForms";
import ContactExtras from "./ContactExtras";
import FileDrop from "./FileDrop";

// The custom-work pitch form, rendered on /ideas/[category]. Structured
// prompts come from lib/ideaForms.js; everything shares the idea textarea,
// file drop, and contact fields.
export default function IdeaForm({ category }) {
  const form = ideaFormFor(category);
  const [fields, setFields] = useState({});
  const [idea, setIdea] = useState("");
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contacts, setContacts] = useState([]);
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
        phone,
        contacts: contacts.filter((c) => c.value.trim()),
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
      <div className="idea-form idea-done-card">
        <span className="idea-burst" aria-hidden="true">✶</span>
        <h2 className="ideapage-sub">nice one.</h2>
        <p className="idea-pitch">
          idea received — we'll email you back at <b>{email || "your email"}</b> and figure it out together.
        </p>
        <div className="idea-foot">
          <Link className="idea-go" href={`/shop/${slugify(category)}`}>back to {category.toLowerCase()} →</Link>
        </div>
      </div>
    );
  }

  return (
    <form className="idea-form" onSubmit={submit}>
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
          rows={7}
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
        <label className="f-field">
          <span>phone</span>
          <input className="f-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required autoComplete="tel" />
        </label>
      </div>
      <ContactExtras contacts={contacts} onChange={setContacts} />
      <label className="hp" aria-hidden="true">
        website
        <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
      </label>
      {err && <p className="login-error">{err}</p>}
      <div className="idea-foot">
        <button className="btn-retro" type="submit" disabled={busy}>{busy ? "sending…" : "send the idea ✶"}</button>
      </div>
    </form>
  );
}
