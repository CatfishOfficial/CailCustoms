"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | signing | error
  const [message, setMessage] = useState("");

  const signIn = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setStatus("signing");
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
    // Session cookie is set — hand off to the server-guarded admin.
    router.replace("/admin");
    router.refresh();
  };

  return (
    <section className="admin admin-login">
      <div className="login-card">
        <span className="admin-eyebrow"><Lock size={13} /> admin</span>
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
              placeholder="you@cailandco.com"
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
          <button className="btn" type="submit" disabled={status === "signing"}>
            {status === "signing" ? "signing in…" : "sign in"}
          </button>
          {status === "error" && <p className="login-error">{message}</p>}
          <p className="sec-note">accounts are created by the team in Supabase — there's no public sign up.</p>
        </form>
      </div>
    </section>
  );
}
