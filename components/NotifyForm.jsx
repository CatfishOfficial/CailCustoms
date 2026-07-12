"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { knownSizes } from "@/lib/data";

// Shown in place of "add to cart" when a listing is unavailable (notify) or a
// pre-order (reserve). Saves a restock_requests row (public insert) so staff
// can reach out. Same flow either way — just different copy + kind.
export default function NotifyForm({ product, mode = "notify" }) {
  const preorder = mode === "preorder";
  const sizes = knownSizes(product);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", size: sizes[0] || "", qty: 1, message: "",
  });
  const [status, setStatus] = useState("idle"); // idle | busy | done | error
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) {
      setError("add an email so we can reach you.");
      return;
    }
    setStatus("busy");
    setError("");
    const { error } = await createClient().from("restock_requests").insert({
      product_id: product.id,
      product_name: product.name,
      kind: preorder ? "preorder" : "notify",
      size: form.size || "",
      qty: Number(form.qty) || 1,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      message: form.message.trim(),
    });
    if (error) {
      setStatus("error");
      setError(error.message);
      return;
    }
    setStatus("done");
  };

  if (status === "done") {
    return (
      <div className="notify-done">
        <b>{preorder ? "you're on the pre-order list." : "you're on the list."}</b>
        <span>
          {preorder
            ? `we'll reach out to confirm your pre-order of ${product.name.toLowerCase()}.`
            : `we'll email you the moment ${product.name.toLowerCase()} is back.`}
        </span>
      </div>
    );
  }

  return (
    <form className="notify-form" onSubmit={submit}>
      <p className="notify-lead">
        {preorder
          ? "available for pre-order — reserve yours and we'll reach out to lock it in."
          : "currently unavailable — want one when it's back? we'll reach out."}
      </p>
      <div className="notify-row">
        <label className="adm-field">
          <span>email *</span>
          <input className="adm-input" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" required />
        </label>
        <label className="adm-field">
          <span>phone (optional)</span>
          <input className="adm-input" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(806) …" />
        </label>
      </div>
      <div className="notify-row">
        <label className="adm-field">
          <span>name (optional)</span>
          <input className="adm-input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="your name" />
        </label>
        {sizes.length > 0 && (
          <label className="adm-field">
            <span>size</span>
            <select className="adm-select" value={form.size} onChange={(e) => set("size", e.target.value)}>
              {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        )}
        <label className="adm-field notify-qty">
          <span>qty</span>
          <input className="adm-input" type="number" min="1" value={form.qty} onChange={(e) => set("qty", e.target.value)} />
        </label>
      </div>
      <label className="adm-field">
        <span>anything to add? (optional)</span>
        <textarea className="adm-area" value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="a note for us" />
      </label>
      {error && <p className="login-error">{error}</p>}
      <button className="btn pdp-buy" type="submit" disabled={status === "busy"}>
        {status === "busy" ? "sending…" : preorder ? "reserve my pre-order" : "notify me when it's back"}
      </button>
    </form>
  );
}
