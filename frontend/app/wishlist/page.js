"use client";

import { useState, useEffect } from "react";
import { useWishlist } from "../../lib/wishlist";
import { useAuth } from "../../lib/auth";
import { fetchProduct } from "../../lib/api";
import { ProductCard } from "../../components/ui";
import ProtectedRoute from "../../components/Protectedroute";
import Link from "next/link";

function WishlistContent() {
  const { savedIds, loading: wishlistLoading } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (wishlistLoading) return;
    if (savedIds.size === 0) { setProducts([]); setLoading(false); return; }

    setLoading(true);
    Promise.all([...savedIds].map((id) => fetchProduct(id)))
      .then((results) => setProducts(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [savedIds, wishlistLoading]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="mb-10 fade-up">
        <p className="font-mono text-xs text-muted uppercase tracking-widest mb-1">Your saves</p>
        <h1 className="font-display text-4xl font-black text-ink">
          Wishlist
          {products.length > 0 && (
            <span className="text-rose ml-3 text-2xl font-display italic">
              ({products.length})
            </span>
          )}
        </h1>
        <p className="text-muted mt-1 text-sm">
          Hey {user?.first_name || user?.username} — here are your saved products.
        </p>
      </div>

      {/* States */}
      {loading || wishlistLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-sand animate-pulse rounded-2xl h-72" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyWishlist />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.product_id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-4 fade-up">
      <span className="text-6xl">♡</span>
      <p className="font-display text-2xl font-bold text-ink">Nothing saved yet</p>
      <p className="text-muted text-sm text-center max-w-xs">
        Tap the heart on any product to save it here for later.
      </p>
      <Link
        href="/"
        className="mt-2 bg-ink text-cream px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose transition-colors"
      >
        Browse Products
      </Link>
    </div>
  );
}

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistContent />
    </ProtectedRoute>
  );
}