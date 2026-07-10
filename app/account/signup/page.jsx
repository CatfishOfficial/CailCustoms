"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AccountSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("idle"); // idle | busy | sent | error
  const [message, setMessage] = useState("");

  const signUp = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setStatus("error");
      setMessage("passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setStatus("error");
      setMessage("password must be at least 8 characters.");
      return;
    }
    setStatus("busy");
    setMessage("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    // If email confirmation is off, a session is returned immediately.
    if (data.session) {
      router.replace("/account");
      router.refresh();
    } else {
      setStatus("sent");
    }
  };

  if (status === "sent") {
    return (
      <section className="admin-login">
        <div className="login-card">
          <span className="admin-eyebrow"><User size={13} /> your account</span>
          <h1 className="admin-title">Check your email</h1>
          <p className="sec-note" style={{ marginTop: 10 }}>
            we sent a confirmation link to <strong>{email}</strong>. click it to
            activate your account and you'll land right on your profile.
          </p>
          <p className="sec-note" style={{ marginTop: 12, textAlign: "center" }}>
            already confirmed?{" "}
            <Link href="/account/login" style={{ color: "var(--accent)" }}>
              sign in
            </Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-login">
      <div className="login-card">
        <span className="admin-eyebrow"><User size={13} /> your account</span>
        <h1 className="admin-title">Create account</h1>
        <form onSubmit={signUp} className="login-form">
          <label className="adm-field">
            <span>email</span>
            <input
              className="adm-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="adm-field">
            <span>password</span>
            <input
              className="adm-input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="at least 8 characters"
              required
            />
          </label>
          <label className="adm-field">
            <span>confirm password</span>
            <input
              className="adm-input"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="same as above"
              required
            />
          </label>
          <button className="btn" type="submit" disabled={status === "busy"}>
            {status === "busy" ? "creating account…" : "create account"}
          </button>
          {status === "error" && <p className="login-error">{message}</p>}
          <p className="sec-note" style={{ textAlign: "center" }}>
            already have one?{" "}
            <Link href="/account/login" style={{ color: "var(--accent)" }}>
              sign in
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
