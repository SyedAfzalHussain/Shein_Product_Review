"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { fetchDashboardStats } from "../../lib/api";
import { StatCard, SentimentBadge, Stars } from "../../components/ui";
import ProtectedRoute from "../../components/Protectedroute";
import Link from "next/link";

const PIE_COLORS = { Positive: "#2d6a4f", Neutral: "#e9b84a", Negative: "#842029" };

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardStats().then(setStats);
  }, []);

  if (!stats) return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 bg-sand animate-pulse rounded-2xl" />
      ))}
    </div>
  );

  const sentimentPieData = Object.entries(stats.sentiment_distribution).map(([name, value]) => ({
    name, value,
  }));

  const ratingBarData = Object.entries(stats.rating_distribution).map(([star, count]) => ({
    star: `${star}★`, count,
  }));

  const categoryData = Object.entries(stats.category_sentiment)
    .map(([cat, score]) => ({ cat, score }))
    .sort((a, b) => b.score - a.score);

  return (

    <ProtectedRoute>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-10 fade-up">
          <p className="font-mono text-xs text-muted uppercase tracking-widest mb-1">Admin</p>
          <h1 className="font-display text-4xl font-black text-ink">Analytics Dashboard</h1>
          <p className="text-muted mt-1">Sentiment & review intelligence across all products</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 fade-up delay-1">
          <StatCard label="Total Reviews" value={stats.total_reviews.toLocaleString()} accent="ink" />
          <StatCard label="Total Products" value={stats.total_products} accent="rose" />
          <StatCard label="Avg Rating" value={`${stats.avg_rating}★`} sub="out of 5" accent="sage" />
          <StatCard
            label="Positive Rate"
            value={`${Math.round((stats.sentiment_distribution.Positive / stats.total_reviews) * 100)}%`}
            sub="of all reviews"
            accent="sage"
          />
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-10 fade-up delay-2">

          {/* Sentiment Pie */}
          <div className="bg-white border border-sand rounded-2xl p-6">
            <h2 className="font-display font-bold text-lg text-ink mb-4">Sentiment Distribution</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={sentimentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {sentimentPieData.map((entry) => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.name] || "#ccc"} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Rating Bar */}
          <div className="bg-white border border-sand rounded-2xl p-6">
            <h2 className="font-display font-bold text-lg text-ink mb-4">Rating Distribution</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ratingBarData} barSize={28}>
                <XAxis dataKey="star" tick={{ fontSize: 12, fontFamily: "DM Mono" }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: "#F5F0E8" }} />
                <Bar dataKey="count" fill="#C8504A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Sentiment */}
        <div className="bg-white border border-sand rounded-2xl p-6 mb-10 fade-up delay-3">
          <h2 className="font-display font-bold text-lg text-ink mb-4">Sentiment by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData} barSize={32}>
              <XAxis dataKey="cat" tick={{ fontSize: 11, fontFamily: "DM Mono" }} />
              <YAxis domain={[-1, 1]} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v) => [v.toFixed(3), "Avg Sentiment"]}
                cursor={{ fill: "#F5F0E8" }}
              />
              <Bar
                dataKey="score"
                radius={[6, 6, 0, 0]}
                fill="#5C7A5C"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top & Bottom Products */}
        <div className="grid md:grid-cols-2 gap-6 fade-up">

          {/* Top Products */}
          <div className="bg-white border border-sand rounded-2xl p-6">
            <h2 className="font-display font-bold text-lg text-ink mb-4">🏆 Best Sentiment</h2>
            <ul className="space-y-3">
              {stats.top_products.map((p, i) => (
                <li key={i}>
                  <Link href={`/products/${p.product_id}`} className="flex items-center justify-between group">
                    <div>
                      <p className="text-sm font-semibold text-ink group-hover:text-rose transition-colors">
                        {p.product_name}
                      </p>
                      <p className="text-xs font-mono text-muted">
                        {p.review_count} reviews · {p.category}
                      </p>
                    </div>
                    <SentimentBadge
                      label={p.avg_sentiment >= 0.05 ? "Positive" : "Neutral"}
                      score={p.avg_sentiment}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom Products */}
          <div className="bg-white border border-sand rounded-2xl p-6">
            <h2 className="font-display font-bold text-lg text-ink mb-4">⚠️ Needs Attention</h2>
            <ul className="space-y-3">
              {stats.bottom_products.map((p, i) => (
                <li key={i}>
                  <Link href={`/products/${p.product_id}`} className="flex items-center justify-between group">
                    <div>
                      <p className="text-sm font-semibold text-ink group-hover:text-rose transition-colors">
                        {p.product_name}
                      </p>
                      <p className="text-xs font-mono text-muted">
                        {p.review_count} reviews · {p.category}
                      </p>
                    </div>
                    <SentimentBadge
                      label={p.avg_sentiment <= -0.05 ? "Negative" : "Neutral"}
                      score={p.avg_sentiment}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}