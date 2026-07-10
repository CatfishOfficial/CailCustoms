"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { lineKey } from "@/lib/orders";

const STORAGE_KEY = "cc-cart-v1";
const CartCtx = createContext(null);

// Client-side cart. Lines carry a display snapshot of the product (name,
// price, tone, image) so the drawer never needs a data lookup. Persisted to
// localStorage; `ready` stays false until the stored cart has hydrated so
// nothing renders a count the server didn't (avoids hydration mismatch).
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setItems(parsed.filter((it) => it && it.id && it.qty > 0));
    } catch {
      // corrupted cart — start fresh
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full/blocked — cart still works for the session
    }
  }, [items, ready]);

  // Lock page scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const addItem = useCallback((product, size) => {
    setItems((list) => {
      const key = lineKey(product.id, size);
      const existing = list.find((it) => lineKey(it.id, it.size) === key);
      if (existing) {
        return list.map((it) => (lineKey(it.id, it.size) === key ? { ...it, qty: it.qty + 1 } : it));
      }
      const cover = (product.images || []).filter(Boolean)[0] || "";
      return [
        ...list,
        { id: product.id, name: product.name, price: product.price, cat: product.cat, tone: product.tone, image: cover, size: size || "", qty: 1 },
      ];
    });
  }, []);

  const setQty = useCallback((key, qty) => {
    setItems((list) =>
      qty <= 0
        ? list.filter((it) => lineKey(it.id, it.size) !== key)
        : list.map((it) => (lineKey(it.id, it.size) === key ? { ...it, qty } : it))
    );
  }, []);

  const removeItem = useCallback((key) => {
    setItems((list) => list.filter((it) => lineKey(it.id, it.size) !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  const count = useMemo(() => items.reduce((n, it) => n + it.qty, 0), [items]);

  const value = useMemo(
    () => ({ items, count, ready, open, addItem, setQty, removeItem, clear, openCart, closeCart }),
    [items, count, ready, open, addItem, setQty, removeItem, clear, openCart, closeCart]
  );

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
