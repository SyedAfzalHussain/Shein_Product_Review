const BASE = process.env.NEXT_PUBLIC_DJANGO_URL || "http://localhost:8000";

export async function fetchProducts({ page = 1, limit = 15, category, sort, search } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (category && category !== "All") params.set("category", category);
  if (sort) params.set("sort", sort);
  if (search) params.set("search", search);
  const res = await fetch(`${BASE}/api/products/?${params}`, { cache: "no-store" });
  return res.json();
}

export async function fetchProduct(id) {
  const res = await fetch(`${BASE}/api/products/${id}/`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${BASE}/api/categories/`, { cache: "no-store" });
  return res.json();
}

export async function fetchDashboardStats() {
  const res = await fetch(`${BASE}/api/dashboard/stats/`, { cache: "no-store" });
  return res.json();
}

export async function analyzeText(text) {
  const res = await fetch(`${BASE}/api/analyze/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return res.json();
}