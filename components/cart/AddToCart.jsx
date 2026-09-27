"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useCart } from "./CartContext";

// The buy CTA. Unsized products go straight into the cart; sized products get
// a quick size-confirm dialog first. Opening the drawer is the "added" feedback.
export default function AddToCart({ product, sizes: sizesProp }) {
  const { addItem, openCart } = useCart();
  const sizes = (sizesProp || (product.sizes || []).map((size) => ({ size, inStock: true }))).filter((s) => s.size);
  const [modal, setModal] = useState(false);
  const [size, setSize] = useState("");
  const dialogRef = useRef(null);
  const returnRef = useRef(null);

  const selected = sizes.find((s) => s.size === size);
  const preorder = !!selected && !selected.inStock;

  const add = (chosen, isPreorder) => {
    addItem(product, chosen, isPreorder);
    setModal(false);
    setSize("");
    openCart();
  };

  const onClick = () => {
    if (sizes.length === 0) return add(null, false);
    setSize("");
    setModal(true);
  };

  useEffect(() => {
    if (!modal) return;
    returnRef.current = document.activeElement;
    dialogRef.current?.querySelector("button")?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") setModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (returnRef.current instanceof HTMLElement) returnRef.current.focus();
    };
  }, [modal]);

  return (
    <>
      <button className="btn pdp-buy" onClick={onClick}>add to cart</button>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="pick a size" ref={dialogRef}>
            <div className="modal-head">
              <span className="modal-eyebrow">pick a size</span>
              <button className="cart-close" onClick={() => setModal(false)} aria-label="close"><X size={16} /></button>
            </div>
            <p className="modal-name">{product.name}</p>
            <div className="size-chips">
              {sizes.map((s) => (
                <button
                  key={s.size}
                  className={`chip ${size === s.size ? "on" : ""} ${!s.inStock ? "chip-preorder" : ""}`}
                  onClick={() => setSize(s.size)}
                  aria-pressed={size === s.size}
                >
                  {s.size.toLowerCase()}
                </button>
              ))}
            </div>
            <button className="btn modal-confirm" disabled={!size} onClick={() => add(size, preorder)}>
              {size ? (preorder ? `pre-order — size ${size.toLowerCase()}` : `add — size ${size.toLowerCase()}`) : "pick one first"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
