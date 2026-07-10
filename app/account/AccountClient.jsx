"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AccountClient({ user, profile }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [address, setAddress] = useState(profile?.address ?? "");
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | ok | error

  const save = async (e) => {
    e.preventDefault();
    setSaveStatus("saving");
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: fullName, phone, address, updated_at: new Date().toISOString() });
    setSaveStatus(error ? "error" : "ok");
    if (!error) setTimeout(() => setSaveStatus("idle"), 2400);
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <section className="admin-login">
      <div className="login-card" style={{ maxWidth: 500 }}>
        <span className="admin-eyebrow">my account</span>
        <h1 className="admin-title">{fullName || "your profile"}</h1>

        <form onSubmit={save} className="login-form">
          <div className="adm-field">
            <span>email</span>
            <div className="acct-email">{user.email}</div>
          </div>

          <hr className="acct-divider" />

          <label className="adm-field">
            <span>name</span>
            <input
              className="adm-input"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="your name"
            />
          </label>
          <label className="adm-field">
            <span>phone</span>
            <input
              className="adm-input"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 000-0000"
            />
          </label>
          <label className="adm-field">
            <span>address</span>
            <input
              className="adm-input"
              type="text"
              autoComplete="street-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 main st, city, tx 79401"
            />
          </label>

          <button className="btn" type="submit" disabled={saveStatus === "saving"}>
            {saveStatus === "saving" ? "saving…" : "save"}
          </button>
          {saveStatus === "ok" && <p className="acct-save-status ok">saved.</p>}
          {saveStatus === "error" && <p className="acct-save-status err">something went wrong — try again.</p>}
        </form>

        <hr className="acct-divider" style={{ marginTop: 20 }} />
        <button className="acct-sign-out" onClick={signOut}>sign out</button>
      </div>
    </section>
  );
}
