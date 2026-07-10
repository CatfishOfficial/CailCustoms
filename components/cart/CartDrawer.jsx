"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import Frame from "@/components/Frame";
import { lineKey } from "@/lib/orders";
import { useCart } from "./CartContext";

export default function CartDrawer() {
  const { items, count, open, setQty, removeItem, closeCart } = useCart();
  const closeRef = useRef(null);
  const returnRef = useRef(null);

  // Focus in on open, restore on close, Escape closes.
  useEffect(() => {
    if (!open) return;
    returnRef.current = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (returnRef.current instanceof HTMLElement) returnRef.current.focus();
    };
  }, [open, closeCart]);

  return (
    <>
      <div className={`cart-overlay ${open ? "open" : ""}`} onClick={closeCart} aria-hidden="true" />
      <aside className={`cart-drawer ${open ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="cart" aria-hidden={!open}>
        <div className="cart-head">
          <span className="cart-eyebrow">your cart · {count}</span>
          <button ref={closeRef} className="cart-close" onClick={closeCart} aria-label="close cart" tabIndex={open ? 0 : -1}>
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <p className="cart-empty">nothing in here yet — go find something cool.</p>
        ) : (
          <>
            <ul className="cart-lines">
              {items.map((it) => {
                const key = lineKey(it.id, it.size);
                return (
                  <li className="cart-line" key={key}>
                    <Link className="cart-thumb" href={`/product/${it.id}`} onClick={closeCart} tabIndex={open ? 0 : -1}>
                      <Frame tone={it.image ? undefined : it.tone} image={it.image || undefined} />
                    </Link>
                    <div className="cart-line-info">
                      <span className="cart-line-name">{it.name}</span>
                      {it.size && <span className="cart-line-size">size {it.size}</span>}
                      <span className="cart-line-price">{it.price}</span>
                    </div>
                    <div className="cart-line-ctl">
                      <div className="cart-qty">
                        <button onClick={() => setQty(key, it.qty - 1)} aria-label={`one less ${it.name}`} tabIndex={open ? 0 : -1}><Minus size={13} /></button>
                        <span>{it.qty}</span>
                        <button onClick={() => setQty(key, it.qty + 1)} aria-label={`one more ${it.name}`} tabIndex={open ? 0 : -1}><Plus size={13} /></button>
                      </div>
                      <button className="cart-remove" onClick={() => removeItem(key)} aria-label={`remove ${it.name}`} tabIndex={open ? 0 : -1}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="cart-foot">
              <p className="cart-note">no payment here — send the request and we'll confirm price + shipping by email.</p>
              <Link className="btn cart-cta" href="/order" onClick={closeCart} tabIndex={open ? 0 : -1}>
                send order request
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
