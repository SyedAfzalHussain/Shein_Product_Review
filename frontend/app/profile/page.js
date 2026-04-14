"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth";
import { fetchProduct } from "../../lib/api";
import { Stars, SentimentBadge } from "../../components/ui";
import ProtectedRoute from "../../components/Protectedroute";

const DJANGO = process.env.NEXT_PUBLIC_DJANGO_URL || "http://localhost:8000";

function ProfileContent() {
  const { authFetch, user } = useAuth();
  const [profile, setProfile]     = useState(null);
  const [products, setProducts]   = useState({});
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("reviews");

  useEffect(() => {
    authFetch(`${DJANGO}/api/profile/`)
      .then((r) => r?.json())
      .then(async (data) => {
        setProfile(data);
        // Fetch product names for each review
        const ids = [...new Set([
          ...data.reviews.map((r) => r.product_id),
          ...data.wishlist_ids,
        ])];
        const fetched = await Promise.all(ids.map((id) => fetchProduct(id)));
        const map = {};
        fetched.filter(Boolean).forEach((p) => { map[p.product_id] = p; });
        setProducts(map);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-4">
      {[1,2,3].map((i) => <div key={i} className="h-20 bg-sand animate-pulse rounded-2xl" />)}
    </div>
  );
  if (!profile) return null;

  const { user: u, stats, reviews, wishlist_ids } = profile;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

      {/* Profile Header */}
      <div className="fade-up flex items-center gap-6 mb-10">
        <div className="w-20 h-20 rounded-full bg-rose flex items-center justify-center text-cream text-3xl font-display font-bold flex-shrink-0">
          {u.first_name?.[0] || u.username[0].toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-3xl font-black text-ink">
            {u.first_name ? `${u.first_name} ${u.last_name}` : u.username}
          </h1>
          <p className="text-sm text-muted font-mono">@{u.username} · Joined {u.joined}</p>
          <p className="text-sm text-muted">{u.email}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8 fade-up delay-1">
        {[
          { label: "Reviews Written", value: stats.reviews_written, color: "text-rose" },
          { label: "Wishlist Items",  value: stats.wishlist_count,  color: "text-sage" },
          { label: "Avg Rating Given", value: stats.avg_rating_given ? `${stats.avg_rating_given}★` : "—", color: "text-ink" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-sand rounded-2xl p-4 text-center">
            <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs font-mono text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 fade-up delay-2">
        {["reviews", "wishlist"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-mono capitalize transition-colors ${
              activeTab === tab
                ? "bg-ink text-cream"
                : "bg-white border border-sand text-muted hover:border-ink"
            }`}
          >
            {tab} ({tab === "reviews" ? reviews.length : wishlist_ids.length})
          </button>
        ))}
      </div>

      {/* Reviews Tab */}
      {activeTab === "reviews" && (
        <div className="space-y-3 fade-up">
          {reviews.length === 0 ? (
            <EmptyState icon="✍️" text="No reviews yet." cta="Browse products" href="/" />
          ) : reviews.map((r) => {
            const p = products[r.product_id];
            return (
              <div key={r.product_id} className="bg-white border border-sand rounded-2xl p-4 flex gap-4">
                {p && (
                  <img src={p.image_url} alt={p.product_name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <a href={`/products/${r.product_id}`}
                    className="font-display font-bold text-ink hover:text-rose transition-colors text-sm line-clamp-1">
                    {p?.product_name || `Product #${r.product_id}`}
                  </a>
                  <div className="flex items-center gap-2 my-1">
                    <Stars rating={r.rating} />
                    <SentimentBadge label={r.sentiment_label} score={r.sentiment_score} />
                  </div>
                  <p className="text-sm text-muted line-clamp-2">{r.review_text}</p>
                  <p className="text-xs font-mono text-muted mt-1">{r.created_at?.slice(0,10)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Wishlist Tab */}
      {activeTab === "wishlist" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 fade-up">
          {wishlist_ids.length === 0 ? (
            <div className="col-span-3">
              <EmptyState icon="♡" text="Nothing saved yet." cta="Browse products" href="/" />
            </div>
          ) : wishlist_ids.map((id) => {
            const p = products[id];
            if (!p) return null;
            return (
              <a key={id} href={`/products/${id}`}
                className="card-hover bg-white border border-sand rounded-2xl overflow-hidden">
                <img src={p.image_url} alt={p.product_name}
                  className="w-full h-36 object-cover" />
                <div className="p-3">
                  <p className="text-sm font-display font-bold text-ink line-clamp-1">{p.product_name}</p>
                  <p className="text-xs text-rose font-bold mt-0.5">${p.price?.toFixed(2)}</p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, text, cta, href }) {
  return (
    <div className="flex flex-col items-center py-16 gap-3 text-center">
      <span className="text-5xl">{icon}</span>
      <p className="font-display text-xl text-ink">{text}</p>
      <a href={href}
        className="text-sm bg-ink text-cream px-5 py-2 rounded-xl hover:bg-rose transition-colors">
        {cta}
      </a>
    </div>
  );
}

export default function ProfilePage() {
  return <ProtectedRoute><ProfileContent /></ProtectedRoute>;
}