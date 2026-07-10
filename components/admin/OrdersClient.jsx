"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Paperclip, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { telHref } from "@/lib/data";
import { ORDER_STATUSES, IDEA_STATUSES, composeOrderText } from "@/lib/orders";

const fmtWhen = (iso) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).toLowerCase();

function StatusSelect({ table, row, statuses, onChange, onError }) {
  const update = async (status) => {
    const prev = row.status;
    onChange(row.id, status); // optimistic
    const supabase = createClient();
    const { error } = await supabase.from(table).update({ status }).eq("id", row.id);
    if (error) {
      onChange(row.id, prev); // revert
      onError(error.message || "couldn't update status");
    }
  };
  return (
    <select className={`adm-select ord-status s-${row.status}`} value={row.status} onChange={(e) => update(e.target.value)} aria-label="status">
      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}

function Contact({ name, email, phone, contacts }) {
  return (
    <div className="ord-contact">
      <b>{name || "no name"}</b>
      {email && <a href={`mailto:${email}`}>{email}</a>}
      {phone && <a href={telHref(phone)}>{phone}</a>}
      {(contacts || []).map((c, i) => (
        <span className="ord-cx" key={i}>{c.type}: <b>{c.value}</b></span>
      ))}
    </div>
  );
}

export default function OrdersClient({ initialOrders, initialIdeas, userEmail }) {
  const [orders, setOrders] = useState(initialOrders);
  const [ideas, setIdeas] = useState(initialIdeas);
  const [tab, setTab] = useState("orders");
  const [filter, setFilter] = useState("all");
  const [err, setErr] = useState("");

  const patchStatus = (setList) => (id, status) =>
    setList((list) => list.map((r) => (r.id === id ? { ...r, status } : r)));

  const list = tab === "orders" ? orders : ideas;
  const statuses = tab === "orders" ? ORDER_STATUSES : IDEA_STATUSES;
  const shown = filter === "all" ? list : list.filter((r) => r.status === filter);
  const newCount = (rows) => rows.filter((r) => r.status === "new").length;

  return (
    <section className="admin">
      <div className="admin-bar">
        <div>
          <span className="admin-eyebrow">admin{userEmail ? ` · ${userEmail}` : ""}</span>
          <h1 className="admin-title">Requests</h1>
        </div>
        <div className="admin-actions">
          <Link className="adm-ghost" href="/admin/manage"><Wrench size={14} /> manage the shop</Link>
          <Link className="adm-primary" href="/"><ArrowLeft size={14} /> view site</Link>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`chip ${tab === "orders" ? "on" : ""}`} onClick={() => { setTab("orders"); setFilter("all"); }}>
          orders{newCount(orders) > 0 ? ` (${newCount(orders)} new)` : ""}
        </button>
        <button className={`chip ${tab === "ideas" ? "on" : ""}`} onClick={() => { setTab("ideas"); setFilter("all"); }}>
          custom ideas{newCount(ideas) > 0 ? ` (${newCount(ideas)} new)` : ""}
        </button>
      </div>

      <div className="chips ord-filters">
        <button className={`chip ${filter === "all" ? "on" : ""}`} onClick={() => setFilter("all")}>all ({list.length})</button>
        {statuses.map((s) => {
          const n = list.filter((r) => r.status === s).length;
          return (
            <button key={s} className={`chip ${filter === s ? "on" : ""}`} onClick={() => setFilter(s)}>
              {s} ({n})
            </button>
          );
        })}
      </div>

      {err && <p className="login-error">{err}</p>}

      {shown.length === 0 ? (
        <p className="sec-note ord-empty">nothing here{filter !== "all" ? ` with status "${filter}"` : " yet"}.</p>
      ) : (
        <div className="ord-list">
          {shown.map((r) =>
            tab === "orders" ? (
              <article className="ord-card" key={r.id}>
                <div className="ord-head">
                  <span className="ord-when">{fmtWhen(r.created_at)}</span>
                  <StatusSelect table="orders" row={r} statuses={ORDER_STATUSES} onChange={patchStatus(setOrders)} onError={setErr} />
                </div>
                <Contact name={r.name} email={r.email} phone={r.phone} contacts={r.contacts} />
                <pre className="ord-items">{composeOrderText(r.items)}</pre>
                {r.message && <p className="ord-msg">“{r.message}”</p>}
              </article>
            ) : (
              <article className="ord-card" key={r.id}>
                <div className="ord-head">
                  <span className="ord-when">{fmtWhen(r.created_at)} · <b>{(r.category || "?").toLowerCase()}</b></span>
                  <StatusSelect table="idea_submissions" row={r} statuses={IDEA_STATUSES} onChange={patchStatus(setIdeas)} onError={setErr} />
                </div>
                <Contact name={r.name} email={r.email} phone={r.phone} contacts={r.contacts} />
                {r.fields && Object.keys(r.fields).length > 0 && (
                  <dl className="ord-fields">
                    {Object.entries(r.fields).map(([k, v]) => (
                      <div key={k}><dt>{k}</dt><dd>{String(v)}</dd></div>
                    ))}
                  </dl>
                )}
                {r.idea && <p className="ord-msg">“{r.idea}”</p>}
                {r.files?.length > 0 && (
                  <div className="ord-files">
                    {r.files.map((f) => (
                      <a key={f.path} href={f.url || "#"} target="_blank" rel="noreferrer" className={f.url ? "" : "dead"}>
                        <Paperclip size={12} /> {f.path.split("/").pop()}
                      </a>
                    ))}
                  </div>
                )}
              </article>
            )
          )}
        </div>
      )}
    </section>
  );
}
