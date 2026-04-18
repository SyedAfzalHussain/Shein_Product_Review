"use client";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center space-y-6 fade-up">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-[#1A1208]">
            About SheinReview
          </h1>
          <p className="text-xl text-[#8C7B6B] font-body max-w-3xl mx-auto">
            Authentic sentiment analysis powered by AI to help you make informed fashion choices with real customer insights.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-[#D4C5A9]">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 fade-up delay-1">
            <h2 className="text-4xl font-display font-bold text-[#1A1208]">Our Mission</h2>
            <p className="text-lg text-[#5C7A5C] font-body leading-relaxed">
              We believe every online shopper deserves transparent, honest reviews. Our mission is to cut through marketing noise and provide genuine sentiment analysis of Shein products using advanced AI technology.
            </p>
            <p className="text-lg text-[#5C7A5C] font-body leading-relaxed">
              By analyzing real customer feedback, we help you understand what others truly think about products before you buy.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#D4C5A9] to-[#C8504A] opacity-20 rounded-3xl p-12 min-h-64"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-[#D4C5A9]">
        <div className="space-y-12">
          <div className="text-center space-y-2 fade-up delay-1">
            <h2 className="text-4xl font-display font-bold text-[#1A1208]">How It Works</h2>
            <p className="text-[#8C7B6B] font-body">AI-powered insights at your fingertips</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 fade-up delay-2">
            {[
              {
                icon: "📊",
                title: "Smart Analysis",
                desc: "Our AI analyzes thousands of customer reviews to determine genuine sentiment.",
              },
              {
                icon: "⭐",
                title: "Rating Breakdown",
                desc: "See detailed rating distributions to understand product quality across categories.",
              },
              {
                icon: "📈",
                title: "Trending Insights",
                desc: "Discover what customers love and common concerns about specific products.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 shadow-sm border border-[#D4C5A9] card-hover"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-display font-bold text-[#1A1208] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#8C7B6B] font-body">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sentiment Categories Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-[#D4C5A9]">
        <div className="space-y-8 fade-up delay-2">
          <h2 className="text-4xl font-display font-bold text-[#1A1208]">Understanding Sentiment</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                label: "Positive",
                color: "#2d6a4f",
                bg: "#d4edda",
                desc: "Customers are satisfied and recommend this product",
              },
              {
                label: "Neutral",
                color: "#664d03",
                bg: "#fff3cd",
                desc: "Feedback is mixed or factual without strong opinion",
              },
              {
                label: "Negative",
                color: "#842029",
                bg: "#f8d7da",
                desc: "Customers have concerns or report quality issues",
              },
            ].map((sentiment, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#D4C5A9] card-hover">
                <div
                  className="inline-block px-3 py-1 rounded-full font-mono font-semibold text-xs mb-4"
                  style={{ backgroundColor: sentiment.bg, color: sentiment.color }}
                >
                  {sentiment.label}
                </div>
                <p className="text-[#8C7B6B] font-body">{sentiment.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-[#D4C5A9]">
        <div className="bg-gradient-to-r from-[#5C7A5C] to-[#C8504A] rounded-3xl p-12 text-white space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-display font-bold">Why Choose SheinReview?</h2>
            <p className="text-lg opacity-90">
              We're committed to transparency and helping you shop smarter.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              "💯 Unbiased AI Analysis",
              "🔒 Privacy-Focused",
              "⚡ Real-Time Updates",
              "🎯 Detailed Insights",
              "📱 Easy to Use",
              "🌍 Community-Driven",
            ].map((item, i) => (
              <div key={i} className="flex items-start space-x-3">
                <span className="text-2xl">{item.split(" ")[0]}</span>
                <span className="text-white font-body">{item.split(" ").slice(1).join(" ")}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center space-y-6">
        <h2 className="text-4xl font-display font-bold text-[#1A1208]">
          Ready to Shop Smarter?
        </h2>
        <p className="text-lg text-[#8C7B6B] font-body">
          Start exploring authentic product sentiment today.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-8 py-3 bg-[#C8504A] text-white rounded-full font-body font-semibold hover:opacity-90 transition"
          >
            Browse Products
          </Link>
        </div>
      </section>
    </div>
  );
}
