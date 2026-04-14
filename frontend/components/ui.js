"use client";

import Link from "next/link";
import { Line } from "recharts";

// ─── Sentiment Badge ───────────────────────────────────────────────
export function SentimentBadge({ label, score }) {
  const cls =
    label === "Positive"
      ? "badge-positive"
      : label === "Negative"
      ? "badge-negative"
      : "badge-neutral";
  const emoji = label === "Positive" ? "↑" : label === "Negative" ? "↓" : "→";
  return (
    <span className={`${cls} text-xs font-mono font-semibold px-2 py-0.5 rounded-full`}>
      {emoji} {label} {score !== undefined ? `(${score > 0 ? "+" : ""}${score})` : ""}
    </span>
  );
}

// ─── Star Rating ───────────────────────────────────────────────────
export function Stars({ rating, size = "sm" }) {
  const sz = size === "lg" ? "text-xl" : "text-sm";
  return (
    <span className={sz}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(rating) ? "star-filled" : "star-empty"}>
          ★
        </span>
      ))}
    </span>
  );
}

// ─── Sentiment Bar ─────────────────────────────────────────────────
export function SentimentBar({ positive, negative, neutral }) {
  return (
    <div className="w-full">
      <div className="flex rounded-full overflow-hidden h-2 w-full gap-0.5">
        <div style={{ width: `${positive}%`, background: "#2d6a4f" }} title={`Positive ${positive}%`} />
        <div style={{ width: `${neutral}%`, background: "#e9b84a" }} title={`Neutral ${neutral}%`} />
        <div style={{ width: `${negative}%`, background: "#842029" }} title={`Negative ${negative}%`} />
      </div>
      <div className="flex gap-4 mt-1 text-xs text-muted font-mono">
        <span>+{positive}%</span>
        <span className="ml-auto">−{negative}%</span>
      </div>
    </div>
  );
}

// ─── Product Card ──────────────────────────────────────────────────
export function ProductCard({ product }) {
  // Lazy import to avoid SSR issues
  const BookmarkButton = require("./BookmarkButton").default;
  return (
    <Link
      href={`/products/${product.product_id}`}
      className="card-hover fade-up bg-white border border-sand rounded-2xl overflow-hidden flex flex-col"
    >
      <div className="relative overflow-hidden h-36">
        <img
          src={product.image_url}
          alt={product.product_name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80"; }}
        />
        <div className="absolute top-2 right-2">
          <BookmarkButton productId={product.product_id} />
        </div>
        <span className="absolute top-2 left-2 bg-ink text-cream text-xs font-mono px-2 py-0.5 rounded-full">
          {product.category}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="font-display font-bold text-ink text-base leading-tight line-clamp-2">
          {product.product_name}
        </p>
        <div className="flex items-center gap-2">
          <Stars rating={product.avg_rating} />
          <span className="text-xs text-muted font-mono">({product.review_count})</span>
        </div>
        <SentimentBar
          positive={product.positive_pct}
          negative={product.negative_pct}
          neutral={product.neutral_pct}
        />
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-display font-bold text-ink">${product.price?.toFixed(2)}</span>
          <SentimentBadge label={product.avg_sentiment >= 0.05 ? "Positive" : product.avg_sentiment <= -0.05 ? "Negative" : "Neutral"} />
        </div>
      </div>
    </Link>
  );
}

// ─── Review Card ───────────────────────────────────────────────────
export function ReviewCard({ review, index }) {
  return (
    <div
      className="fade-up bg-white border border-sand rounded-xl p-4 flex flex-col gap-2"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-center justify-between">
        <Stars rating={review.rating} />
        <SentimentBadge label={review.sentiment_label} score={review.sentiment_score} />
      </div>
      <p className="text-sm text-ink leading-relaxed">{review.review_text}</p>
      {review.age && (
        <p className="text-xs text-muted font-mono">
          Age {review.age} · {review.helpful_count ?? 0} found helpful
        </p>
      )}
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accent }) {
  const colors = {
    rose: "text-rose",
    sage: "text-sage",
    ink: "text-ink",
    muted: "text-muted",
  };
  return (
    <div className="bg-white border border-sand rounded-2xl p-5 flex flex-col gap-1">
      <p className="text-xs font-mono text-muted uppercase tracking-widest">{label}</p>
      <p className={`font-display text-3xl font-bold ${colors[accent] || "text-ink"}`}>{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}