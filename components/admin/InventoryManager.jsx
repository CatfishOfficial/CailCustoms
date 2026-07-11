"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const blankLine = () => ({ product_id: "", item_label: "", size: "", quantity: "" });

// Inventory: record batch shipments (which add to stock), edit current on-hand
// counts, and review recent shipments. Talks straight to product_stock (admin
// RLS) and the record_shipment / list_shipments RPCs from migration 005.
export default function InventoryManager({ products }) {
  const nameOf = useMemo(() => {
    const m = {};
    (products || []).forEach((p) => (m[p.id] = p.name));
    return m;
  }, [products]);

  const [stock, setStock] = useState([]); // {product_id, size, qty}
  const [shipments, setShipments] = useState([]);
  const [error, setError] = useState("");

  // shipment form
  const [total, setTotal] = useState("");
  const [received, setReceived] = useState("");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState([blankLine()]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const supabase = createClient();
    const [{ data: st, error: se }, { data: sh, error: he }] = await Promise.all([
      supabase.from("product_stock").select("product_id, size, qty"),
      supabase.rpc("list_shipments"),
    ]);
    if (se) setError(se.message);
    else setStock(st || []);
    if (!he) setShipments(sh || []);
  };
  useEffect(() => {
    load();
  }, []);

  // group current stock by product
  const byProduct = useMemo(() => {
    const m = {};
    stock.forEach((r) => (m[r.product_id] ||= []).push(r));
    return m;
  }, [stock]);

  const setLine = (ix, patch) => setLines((ls) => ls.map((l, i) => (i === ix ? { ...l, ...patch } : l)));
  const addLine = () => setLines((ls) => [...ls, blankLine()]);
  const removeLine = (ix) => setLines((ls) => (ls.length > 1 ? ls.filter((_, i) => i !== ix) : ls));

  const submitShipment = async (e) => {
    e.preventDefault();
    const items = lines
      .filter((l) => l.product_id && Number(l.quantity))
      .map((l) => ({
        product_id: l.product_id,
        item_label: l.item_label.trim() || nameOf[l.product_id] || "",
        size: l.size.trim(),
        quantity: Number(l.quantity) || 0,
      }));
    if (!items.length) {
      setError("add at least one line with a listing and quantity.");
      return;
    }
    setSaving(true);
    setError("");
    const { error } = await createClient().rpc("record_shipment", {
      p_total: Number(total) || 0,
      p_received: received || null,
      p_note: note.trim(),
      p_items: items,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setTotal("");
    setReceived("");
    setNote("");
    setLines([blankLine()]);
    load();
  };

  // edit an on-hand count directly
  const saveQty = async (product_id, size, qty) => {
    const n = Math.max(0, Number(qty) || 0);
    const { error } = await createClient()
      .from("product_stock")
      .upsert({ product_id, size: size || "", qty: n });
    if (error) setError(error.message);
    else setStock((s) => s.map((r) => (r.product_id === product_id && r.size === size ? { ...r, qty: n } : r)));
  };
  const removeRow = async (product_id, size) => {
    const { error } = await createClient().from("product_stock").delete().match({ product_id, size: size || "" });
    if (error) setError(error.message);
    else setStock((s) => s.filter((r) => !(r.product_id === product_id && r.size === size)));
  };

  const money = (n) => `$${Number(n || 0).toFixed(2)}`;

  return (
    <div className="adm-section">
      <p className="adm-staff-intro">
        Log a shipment to add stock — connected listings then show only the sizes you have in stock,
        and flip to a notify-me form when they hit zero. Total price is your cost and stays private.
      </p>

      {/* record a shipment */}
      <form className="inv-ship" onSubmit={submitShipment}>
        <h3 className="inv-h">New shipment</h3>
        <div className="adm-row2">
          <label className="adm-field"><span>total price (your cost)</span>
            <input className="adm-input" type="number" step="0.01" min="0" value={total} onChange={(e) => setTotal(e.target.value)} placeholder="0.00" />
          </label>
          <label className="adm-field"><span>received on</span>
            <input className="adm-input" type="date" value={received} onChange={(e) => setReceived(e.target.value)} />
          </label>
        </div>
        <label className="adm-field"><span>note (optional)</span>
          <input className="adm-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="supplier, PO #, etc." />
        </label>

        <div className="adm-field"><span>items — pick a listing, size, and quantity</span>
          {lines.map((l, ix) => (
            <div className="inv-line" key={ix}>
              <select className="adm-select" value={l.product_id} onChange={(e) => setLine(ix, { product_id: e.target.value })}>
                <option value="">— listing —</option>
                {(products || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input className="adm-input inv-size" value={l.size} onChange={(e) => setLine(ix, { size: e.target.value })} placeholder="size (blank = one size)" />
              <input className="adm-input inv-qty" type="number" min="0" value={l.quantity} onChange={(e) => setLine(ix, { quantity: e.target.value })} placeholder="qty" />
              <button type="button" className="adm-mini" onClick={() => removeLine(ix)} aria-label="remove line"><Trash2 size={14} /></button>
            </div>
          ))}
          <button type="button" className="adm-add" onClick={addLine}><Plus size={14} /> add item</button>
        </div>

        {error && <p className="login-error">{error}</p>}
        <button className="adm-add-big" type="submit" disabled={saving}><Package size={16} /> {saving ? "recording…" : "record shipment"}</button>
      </form>

      {/* current stock */}
      <h3 className="inv-h">Current stock</h3>
      {Object.keys(byProduct).length === 0 ? (
        <p className="sec-note">no stock yet — record a shipment above.</p>
      ) : (
        <div className="inv-stock">
          {Object.entries(byProduct).map(([pid, rows]) => (
            <div className="inv-prod" key={pid}>
              <div className="inv-prod-name">{nameOf[pid] || pid}</div>
              <div className="inv-prod-rows">
                {rows.map((r) => (
                  <div className="inv-srow" key={r.size}>
                    <span className="inv-ssize">{r.size || "one size"}</span>
                    <input
                      className="adm-input inv-qty"
                      type="number"
                      min="0"
                      defaultValue={r.qty}
                      onBlur={(e) => saveQty(pid, r.size, e.target.value)}
                    />
                    <button className="adm-mini" onClick={() => removeRow(pid, r.size)} aria-label="remove size"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* recent shipments */}
      {shipments.length > 0 && (
        <>
          <h3 className="inv-h">Recent shipments</h3>
          <ul className="inv-ships">
            {shipments.map((s) => (
              <li className="inv-ship-row" key={s.id}>
                <div className="inv-ship-head">
                  <b>{money(s.total_price)}</b>
                  <span>{s.received_on || new Date(s.created_at).toLocaleDateString()}</span>
                  {s.note && <em>{s.note}</em>}
                </div>
                <div className="inv-ship-items">
                  {(s.items || []).map((it, i) => (
                    <span className="inv-chip" key={i}>
                      {(nameOf[it.product_id] || it.item_label || "item")}{it.size ? ` · ${it.size}` : ""} × {it.quantity}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
