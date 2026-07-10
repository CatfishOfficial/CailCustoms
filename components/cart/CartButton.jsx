"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "./CartContext";

export default function CartButton() {
  const { count, ready, openCart } = useCart();
  return (
    <button className="cart-btn" onClick={openCart} aria-label={`open cart${ready && count ? ` — ${count} item${count === 1 ? "" : "s"}` : ""}`}>
      <ShoppingBag size={17} strokeWidth={2.2} />
      {ready && count > 0 && <span className="cart-badge">{count > 99 ? "99+" : count}</span>}
    </button>
  );
}
