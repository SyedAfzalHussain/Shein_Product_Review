"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/auth";
import Link from "next/link";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.username, form.password);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md fade-up">

        {/* Card */}
        <div className="bg-white border border-sand rounded-3xl p-8 shadow-sm">

          {/* Header */}
          <div className="mb-8">
            <p className="font-mono text-xs text-muted uppercase tracking-widest mb-1">Welcome back</p>
            <h1 className="font-display text-3xl font-black text-ink">
              Sign in to <span className="text-rose italic">SheinReview</span>
            </h1>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-body">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-muted mb-1 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="your_username"
                className="w-full bg-cream border border-sand rounded-xl px-4 py-3 text-sm font-body text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-muted mb-1 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-cream border border-sand rounded-xl px-4 py-3 text-sm font-body text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={Boolean(loading || !form.username || !form.password)}
              className="w-full bg-ink text-cream py-3 rounded-xl text-sm font-semibold hover:bg-rose transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
            <div className="text-right">
              <Link href="/auth/forgot-password" className="text-sm text-muted hover:text-ink transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-sand" />
            <span className="text-xs font-mono text-muted">or</span>
            <div className="flex-1 h-px bg-sand" />
          </div>

          <p className="text-center text-sm text-muted">
            No account?{" "}
            <Link href="/auth/register" className="text-ink font-semibold hover:text-rose transition-colors"> Create one free </Link>
          </p>
        </div>
      </div>
    </div>
  );
}