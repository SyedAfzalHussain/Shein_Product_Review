"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchProducts, fetchCategories, analyzeText } from "../lib/api";
import { ProductCard, SentimentBadge } from "../components/ui";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [page, setPage]         = useState(1);
  const [categories, setCategories] = useState([""]);
  const [category, setCategory] = useState("");
  const [sort, setSort]         = useState("popular");
  const [search, setSearch]     = useState("");
  const [query, setQuery]       = useState("");
  const [loading, setLoading]   = useState(true);

  // Live sentiment analyzer state
  const [analyzeInput, setAnalyzeInput] = useState("");
  const [analyzeResult, setAnalyzeResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchCategories().then((d) => setCategories(d.categories || ["All"]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchProducts({ page, limit: 15, category, sort, search: query });
    setProducts(data.products || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
    setLoading(false);
  }, [page, category, sort, query]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  };

  const handleAnalyze = async () => {
    if (!analyzeInput.trim()) return;
    setAnalyzing(true);
    const result = await analyzeText(analyzeInput);
    setAnalyzeResult(result);
    setAnalyzing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

      {/* Hero */}
      <section className="mb-12 fade-up">
        <p className="font-mono text-xs text-muted uppercase tracking-widest mb-2">AI-Powered Reviews</p>
        <h1 className="font-display text-5xl sm:text-6xl font-black text-ink leading-tight mb-4">
          Know before<br />
          <span className="text-rose italic">you buy.</span>
        </h1>
        <p className="text-muted max-w-lg font-body">
          Authentic sentiment analysis on thousands of real Shein product reviews —
          so you can shop smarter, not harder.
        </p>
      </section>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="fade-up delay-1 flex gap-2 mb-8">
        <input
          type="text"
          placeholder="Search dresses, tops, jackets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white border border-sand rounded-xl px-4 py-3 text-sm font-body text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors"
        />
        <button
          type="submit"
          className="bg-ink text-cream px-6 py-3 rounded-xl text-sm font-semibold hover:bg-rose transition-colors"
        >
          Search
        </button>
      </form>

      {/* Filters */}
      <div className="fade-up delay-2 flex flex-wrap gap-2 mb-6 items-center justify-between">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`px-3 py-1 rounded-full text-xs font-mono border transition-colors ${
                category === cat
                  ? "bg-ink text-cream border-ink"
                  : "bg-white border-sand text-muted hover:border-ink hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="bg-white border border-sand text-sm text-ink rounded-lg px-3 py-1.5 font-body focus:outline-none"
        >
          <option value="popular">Most Reviewed</option>
          <option value="rating">Top Rated</option>
          <option value="sentiment">Best Sentiment</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs font-mono text-muted mb-4">{total} products found</p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">



          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-sand animate-pulse rounded-2xl h-72" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-muted font-display italic text-2xl">
          No products found.
        </div>
      ) : (
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((p) => (
            <ProductCard key={p.product_id} product={p} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-full text-sm font-mono transition-colors ${
                page === i + 1 ? "bg-ink text-cream" : "bg-white border border-sand text-muted hover:border-ink"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Live Sentiment Analyzer */}
      <section className="mt-20 bg-white border border-sand rounded-3xl p-8 fade-up">
        <p className="font-mono text-xs text-muted uppercase tracking-widest mb-2">Try It Live</p>
        <h2 className="font-display text-2xl font-bold text-ink mb-4">Analyze Any Review</h2>
        <textarea
          rows={3}
          placeholder="Paste a product review here..."
          value={analyzeInput}
          onChange={(e) => setAnalyzeInput(e.target.value)}
          className="w-full bg-cream border border-sand rounded-xl px-4 py-3 text-sm font-body text-ink placeholder-muted focus:outline-none focus:border-ink resize-none transition-colors"
        />
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="mt-3 bg-rose text-cream px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {analyzing ? "Analyzing…" : "Run Sentiment Analysis"}
        </button>
        {analyzeResult && (
          <div className="mt-5 flex flex-wrap gap-4 items-center">
            <SentimentBadge label={analyzeResult.label} score={analyzeResult.compound} />
            <div className="flex gap-4 text-xs font-mono text-muted">
              <span className="text-sage">+{(analyzeResult.positive * 100).toFixed(0)}% pos</span>
              <span className="text-rose">−{(analyzeResult.negative * 100).toFixed(0)}% neg</span>
              <span>={(analyzeResult.neutral * 100).toFixed(0)}% neu</span>
            </div>
          </div>
        )}
      </section>
    </div> 
  );
}