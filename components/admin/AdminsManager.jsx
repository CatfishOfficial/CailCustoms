"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Add / list / remove admins. Talks to the SECURITY DEFINER functions from
// migration 004 (list_admins / add_admin / remove_admin) — each re-checks
// is_admin() server-side, so nothing here can be abused from the browser.
export default function AdminsManager() {
  const [admins, setAdmins] = useState([]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("list_admins");
    if (error) setError(error.message);
    else setAdmins(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    const target = email.trim();
    if (!target) return;
    setBusy(true);
    setError("");
    setNotice("");
    const { error } = await createClient().rpc("add_admin", { target_email: target });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setNotice(`${target} is now an admin.`);
    setEmail("");
    load();
  };

  const remove = async (target) => {
    if (!window.confirm(`Remove ${target} as an admin? They'll lose access to the admin area.`)) return;
    setError("");
    setNotice("");
    const { error } = await createClient().rpc("remove_admin", { target_email: target });
    if (error) {
      setError(error.message);
      return;
    }
    load();
  };

  return (
    <div className="adm-section">
      <p className="adm-staff-intro">
        Admins can edit the shop and see the orders &amp; ideas inbox. Add someone by the
        email they signed up with — they need an account first (have them sign up at{" "}
        <code>/account/signup</code>).
      </p>

      <form className="adm-staff-add" onSubmit={add}>
        <input
          className="adm-input"
          type="email"
          placeholder="person@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
        />
        <button className="adm-add-big" type="submit" disabled={busy}>
          <Plus size={16} /> {busy ? "adding…" : "add admin"}
        </button>
      </form>

      {error && <p className="login-error">{error}</p>}
      {notice && <p className="adm-staff-ok">{notice}</p>}

      <ul className="adm-staff-list">
        {admins.map((a) => (
          <li className="adm-staff-row" key={a.email}>
            <span className="adm-staff-email">
              <Shield size={14} /> {a.email}
              {a.is_self && <span className="adm-staff-you">you</span>}
            </span>
            {!a.is_self && (
              <button className="adm-del" onClick={() => remove(a.email)}>
                <Trash2 size={14} /> remove
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
