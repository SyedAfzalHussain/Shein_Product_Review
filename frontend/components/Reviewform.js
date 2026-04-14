"use client";

import { useState } from "react";
import { useAuth } from "../lib/auth";
import { SentimentBadge } from "./ui";

const DJANGO = process.env.NEXT_PUBLIC_DJANGO_URL || "http://localhost:8000";

export default function ReviewForm({ productId, onSubmitted }) {
  const { user, authFetch } = useAuth();
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText]       = useState("");
  const [result, setResult]   = useState(null);   // sentiment preview
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  // Live sentiment preview as user types
  const previewSentiment = async (value) => {
    setText(value);
    if (value.length < 20) { setResult(null); return; }
    try {
      const res = await fetch(`${DJANGO}/api/analyze/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      const data = await res.json();
      setResult(data);
    } catch { /* silent */ }
  };

  const handleSubmit = async () => {
    if (!rating) { setError("Please select a star rating."); return; }
    if (text.trim().length < 10) { setError("Review must be at least 10 characters."); return; }
    setError("");
    setLoading(true);
    const res = await authFetch(`${DJANGO}/api/reviews/submit/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, rating, review_text: text }),
    });
    const data = await res?.json();
    setLoading(false);
    if (res?.ok) {
      setSuccess(true);
      onSubmitted?.(data);
    } else {
      setError(data?.error || "Something went wrong.");
    }
  };

  if (!user) return (
    <div className="bg-cream border border-sand rounded-2xl p-5 text-center">
      <p className="text-sm text-muted mb-3">Sign in to leave a review</p>
      <a href="/auth/login"
        className="inline-block bg-ink text-cream text-sm px-5 py-2 rounded-xl hover:bg-rose transition-colors">
        Sign In
      </a>
    </div>
  );

  if (success) return (
    <div className="bg-white border border-sage rounded-2xl p-5 text-center space-y-2">
      <p className="text-2xl">✅</p>
      <p className="font-display font-bold text-ink">Review submitted!</p>
      <p className="text-sm text-muted">Thanks for sharing your experience.</p>
    </div>
  );

  return (
    <div className="bg-white border border-sand rounded-2xl p-5 space-y-4">
      <h3 className="font-display font-bold text-lg text-ink">Write a Review</h3>

      {/* Star picker */}
      <div>
        <p className="text-xs font-mono text-muted uppercase tracking-wider mb-2">Your Rating</p>
        <div className="flex gap-1">
          {[1,2,3,4,5].map((n) => (
            <button
              key={n}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(n)}
              className={`text-2xl transition-transform hover:scale-110 ${
                n <= (hovered || rating) ? "text-yellow-400" : "text-sand"
              }`}
            >
              ★
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-xs font-mono text-muted self-center">
              {["","Terrible","Poor","Okay","Good","Excellent"][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Review text */}
      <div>
        <p className="text-xs font-mono text-muted uppercase tracking-wider mb-2">Your Review</p>
        <textarea
          rows={3}
          value={text}
          onChange={(e) => previewSentiment(e.target.value)}
          placeholder="Share your experience with this product..."
          className="w-full bg-cream border border-sand rounded-xl px-4 py-3 text-sm font-body text-ink placeholder-muted focus:outline-none focus:border-ink resize-none transition-colors"
        />
        {/* Live sentiment preview */}
        {result && (
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs font-mono text-muted">Sentiment preview:</span>
            <SentimentBadge label={result.label} score={result.compound} />
          </div>
        )}
      </div>

      {error && <p className="text-xs text-rose font-mono">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-rose text-cream py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? "Submitting…" : "Submit Review"}
      </button>
    </div>
  );
}