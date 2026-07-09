"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [message, setMessage] = useState("");

  const sendLink = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("sending");
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("sent");
    }
  };

  return (
    <section className="admin admin-login">
      <div className="login-card">
        <span className="admin-eyebrow"><Lock size={13} /> admin</span>
        <h1 className="admin-title">Sign in</h1>
        {status === "sent" ? (
          <p className="sec-note">
            check <b>{email}</b> for a magic link. open it on this device to finish signing in.
          </p>
        ) : (
          <form onSubmit={sendLink} className="login-form">
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
            <button className="btn" type="submit" disabled={status === "sending"}>
              {status === "sending" ? "sending…" : "send magic link"}
            </button>
            {status === "error" && <p className="login-error">{message}</p>}
            <p className="sec-note">access is invite-only — the team is set up in Supabase.</p>
          </form>
        )}
      </div>
    </section>
  );
}
