"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./auth";

const DJANGO = process.env.NEXT_PUBLIC_DJANGO_URL || "http://localhost:4000";
const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user, authFetch } = useAuth();
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading]   = useState(false);

  // Load wishlist whenever user logs in / out
  useEffect(() => {
    if (!user) { setSavedIds(new Set()); return; }
    setLoading(true);
    authFetch(`${DJANGO}/api/wishlist/`)
      .then((r) => r?.json())
      .then((d) => {
        if (d?.product_ids) setSavedIds(new Set(d.product_ids));
      })
      .finally(() => setLoading(false));
  }, [user]);

  const toggle = useCallback(async (productId) => {
    if (!user) return false; // caller can redirect to login
    const res = await authFetch(`${DJANGO}/api/wishlist/toggle/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId }),
    });
    const data = await res?.json();
    if (data) {
      setSavedIds((prev) => {
        const next = new Set(prev);
        data.saved ? next.add(productId) : next.delete(productId);
        return next;
      });
      return data.saved;
    }
    return false;
  }, [user, authFetch]);

  const isSaved = useCallback((productId) => savedIds.has(productId), [savedIds]);

  return (
    <WishlistContext.Provider value={{ savedIds, toggle, isSaved, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be inside <WishlistProvider>");
  return ctx;
}

