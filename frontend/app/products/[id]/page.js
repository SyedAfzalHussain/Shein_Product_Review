"use client";

import { useState, useEffect } from "react";
import { fetchProduct } from "../../../lib/api";
import { Stars, SentimentBadge, SentimentBar, ReviewCard } from "../../../components/ui";
import ReviewForm from "../../../components/Reviewform";
import BookmarkButton from "../../../components/BookmarkButton";
import { useParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function ProductPage() {
  const params = useParams();
  const id = params?.id;
  const [product, setProduct] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ai");
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchProduct(id).then((d) => {
      setProduct(d);
      setLoading(false);
    });
  }, [id]);

  const fetchUserReviews = (id) => {
    fetch(`${process.env.NEXT_PUBLIC_DJANGO_URL || "http://localhost:8000"}/api/reviews/product/${id}/`)
      .then((r) => r.json())
      .then((d) => setUserReviews(d.reviews || []));
  };

  const handleBuyNow = async () => {
  if (!product) return;

  try {
    setBuying(true);

    const res = await fetch("/api/checkout_sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product }),
    });

    const data = await res.json();

    if (data.error) {
      console.error("Checkout session error:", data.error);
      return;
    }

    // ✅ Redirect directly to Stripe Checkout
    window.location.href = data.url;

  } catch (err) {
    console.error("Error:", err);
  } finally {
    setBuying(false);
  }
};

  if (loading)
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-4">
        <div className="h-8 bg-sand animate-pulse rounded w-2/3" />
        <div className="h-64 bg-sand animate-pulse rounded-2xl" />
      </div>
    );

  if (!product)
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-display text-2xl italic text-muted">
        Product not found.
      </div>
    );

  const sentLabel =
    product.avg_sentiment >= 0.05
      ? "Positive"
      : product.avg_sentiment <= -0.05
        ? "Negative"
        : "Neutral";
  const filtered =
    filter === "All"
      ? product.reviews
      : product.reviews.filter((r) => r.sentiment_label === filter);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <nav className="text-xs font-mono text-muted mb-6">
        <a href="/" className="hover:text-ink">
          Home
        </a>{" "}
        / {product.category} / {product.product_name}
      </nav>

      <div className="grid md:grid-cols-2 gap-8 mb-12 fade-up">
        <div className="relative rounded-2xl overflow-hidden h-80 md:h-auto">
          <img
            src={product.image_url}
            alt={product.product_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80";
            }}
          />
          <div className="absolute top-3 right-3">
            <BookmarkButton productId={product.product_id} size="lg" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2 flex-wrap">
            <span className="font-mono text-xs bg-sand text-ink px-2 py-0.5 rounded-full">
              {product.category}
            </span>
            {product.colour && (
              <span className="font-mono text-xs bg-cream border border-sand text-muted px-2 py-0.5 rounded-full">
                {product.colour}
              </span>
            )}
            {product.season && (
              <span className="font-mono text-xs bg-cream border border-sand text-muted px-2 py-0.5 rounded-full">
                {product.season}
              </span>
            )}
            {product.gender && (
              <span className="font-mono text-xs bg-cream border border-sand text-muted px-2 py-0.5 rounded-full">
                {product.gender}
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold text-ink leading-tight">
            {product.product_name}
          </h1>
          <div className="flex items-center gap-3">
            <Stars rating={product.avg_rating} size="lg" />
            <span className="font-mono text-sm text-muted">
              {product.avg_rating} / 5 · {product.review_count} reviews
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-rose">
            ${product.price?.toFixed(2)}
          </p>

          <button
            onClick={handleBuyNow}
            disabled={buying}
            className="bg-ink text-cream px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {buying ? "Redirecting..." : "Buy Now (Test)"}
          </button>

          <div className="bg-cream border border-sand rounded-xl p-4 space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-muted uppercase tracking-widest">
                AI Sentiment Score
              </p>
              <SentimentBadge label={sentLabel} score={product.avg_sentiment} />
            </div>
            <SentimentBar
              positive={product.positive_pct}
              negative={product.negative_pct}
              neutral={product.neutral_pct}
            />
            <p className="text-xs text-muted">
              Based on <strong>{product.review_count}</strong> AI-analyzed reviews
            </p>
          </div>

          <div className="grid grid-cols-4 gap-6 mt-4">
            {[
              { label: "Positive", value: `${product.positive_pct}%`, color: "text-sage" },
              { label: "Neutral", value: `${product.neutral_pct}%`, color: "text-ink" },
              { label: "Negative", value: `${product.negative_pct}%`, color: "text-rose" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-sand rounded-xl p-3 text-center">
                <p className={`font-display font-bold text-xl ${s.color}`}>{s.value}</p>
                <p className="text-xs font-mono text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fade-up delay-1">
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            ["ai", `AI Reviews (${product.reviews.length})`],
            ["users", `User Reviews (${userReviews.length})`],
            ["write", "✍️ Write Review"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-full text-sm font-mono transition-colors ${tab === key
                  ? key === "write"
                    ? "bg-rose text-cream"
                    : "bg-ink text-cream"
                  : "bg-white border border-sand text-muted hover:border-ink"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "ai" && (
          <>
            <div className="flex gap-2 mb-4 flex-wrap">
              {["All", "Positive", "Neutral", "Negative"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs font-mono px-3 py-1 rounded-full border transition-colors ${filter === f ? "bg-ink text-cream border-ink" : "bg-white border-sand text-muted hover:border-ink"
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filtered.map((r, i) => (
                <ReviewCard key={i} review={r} index={i} />
              ))}
            </div>
          </>
        )}

        {tab === "users" && (
          <div className="space-y-3">
            {userReviews.length === 0 ? (
              <div className="text-center py-12 text-muted italic font-display text-lg">
                No user reviews yet — be the first!
              </div>
            ) : (
              userReviews.map((r, i) => (
                <div key={i} className="bg-white border border-sand rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-sand flex items-center justify-center text-xs font-bold text-ink">
                        {r.username[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-ink">@{r.username}</span>
                    </div>
                    <SentimentBadge label={r.sentiment_label} score={r.sentiment_score} />
                  </div>
                  <Stars rating={r.rating} />
                  <p className="text-sm text-ink">{r.review_text}</p>
                  <p className="text-xs font-mono text-muted">{r.created_at?.slice(0, 10)}</p>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "write" && (
          <ReviewForm
            productId={product.product_id}
            onSubmitted={() => {
              fetchUserReviews(params.id);
              setTab("users");
            }}
          />
        )}
      </div>
    </div>
  );
}