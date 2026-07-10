"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { composeOrderText } from "@/lib/orders";
import { useCart } from "./cart/CartContext";

// The "checkout": no payment — composes the cart into a message, takes contact
// details, and files an order request for the team to follow up by email.
export default function OrderForm({ settings }) {
  const { items, ready, clear } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — humans never see it
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(null); // holds the email we confirmed to

  const summary = composeOrderText(items);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (website) {
      // bot filled the honeypot — pretend it worked, save nothing
      setSent(email || "you");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("orders").insert({
        name,
        email,
        phone,
        message,
        items: items.map(({ id, name: n, price, size, qty }) => ({ id, name: n, price, size, qty })),
      });
      if (error) throw error;
      setSent(email);
      clear();
    } catch (ex) {
      setErr(ex?.message || "something went wrong — try again or email us directly.");
    } finally {
      setBusy(false);
    }
  };

  const mailtoFallback = `mailto:${settings.email}?subject=${encodeURIComponent("Cail Customs — order request")}&body=${encodeURIComponent(
    `${summary}\n\n${message}\n\n— ${name}${phone ? ` · ${phone}` : ""}`
  )}`;

  if (sent) {
    return (
      <section className="page order">
        <div className="order-done">
          <span className="sec-eyebrow">order request</span>
          <h1 className="cat-title">sent.</h1>
          <p className="sec-note">
            request sent — we'll email you at <b>{sent}</b> to confirm price, sizing, and shipping. talk soon.
          </p>
          <Link className="btn" href="/">back to the shop</Link>
        </div>
      </section>
    );
  }

  if (ready && items.length === 0) {
    return (
      <section className="page order">
        <div className="order-done">
          <span className="sec-eyebrow">order request</span>
          <h1 className="cat-title">cart's empty.</h1>
          <p className="sec-note">nothing to send yet — go grab something first.</p>
          <Link className="btn" href="/">back to the shop</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page order">
      <Link className="crumb" href="/">← keep shopping</Link>
      <div className="cat-head">
        <span className="sec-eyebrow">order request</span>
        <h2 className="cat-title">almost there</h2>
        <p className="sec-note">no payment here — we'll confirm price, sizing, and shipping by email before anything's final.</p>
      </div>

      <div className="order-grid">
        <div className="order-summary">
          <span className="order-label">your order</span>
          <pre className="order-pre">{summary}</pre>
          <p className="cart-note">this part's automatic — it updates with your cart.</p>
        </div>

        <form className="order-form" onSubmit={submit}>
          <label className="f-field">
            <span>name</span>
            <input className="f-input" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
          </label>
          <label className="f-field">
            <span>email</span>
            <input className="f-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label className="f-field">
            <span>phone (optional)</span>
            <input className="f-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
          </label>
          <label className="f-field">
            <span>anything else?</span>
            <textarea className="f-area" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="sizing notes, deadlines, questions — whatever helps" />
          </label>
          <label className="hp" aria-hidden="true">
            website
            <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
          </label>
          {err && <p className="login-error">{err}</p>}
          <button className="btn order-send" type="submit" disabled={busy}>
            {busy ? "sending…" : "send order request"}
          </button>
          <p className="cart-note">
            rather email? <a className="pdp-alt order-alt" href={mailtoFallback}>send this as an email instead →</a>
          </p>
        </form>
      </div>
    </section>
  );
}
