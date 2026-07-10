"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AccountLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | busy | error
  const [message, setMessage] = useState("");

  const signIn = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setStatus("busy");
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    router.replace("/account");
    router.refresh();
  };

  return (
    <section className="admin-login">
      <div className="login-card">
        <span className="admin-eyebrow"><User size={13} /> your account</span>
        <h1 className="admin-title">Sign in</h1>
        <form onSubmit={signIn} className="login-form">
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          <button className="btn" type="submit" disabled={status === "busy"}>
            {status === "busy" ? "signing in…" : "sign in"}
          </button>
          {status === "error" && <p className="login-error">{message}</p>}
          <p className="sec-note" style={{ textAlign: "center" }}>
            no account?{" "}
            <Link href="/account/signup" style={{ color: "var(--accent)" }}>
              sign up
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
