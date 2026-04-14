"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/auth";
import Link from "next/link";

const FIELDS = [
  { key: "username", label: "Username", type: "text", placeholder: "your_username", auto: "username" },
  { key: "email", label: "Email", type: "email", placeholder: "you@email.com", auto: "email" },
  { key: "first_name", label: "First Name", type: "text", placeholder: "Aisha", auto: "given-name" },
  { key: "last_name", label: "Last Name", type: "text", placeholder: "Khan", auto: "family-name" },
  { key: "password", label: "Password", type: "password", placeholder: "Min. 8 characters", auto: "new-password" },
  { key: "password2", label: "Confirm Password", type: "password", placeholder: "••••••••", auto: "new-password" },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    username: "", email: "", first_name: "", last_name: "", password: "", password2: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.password2) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register(form);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const allFilled = FIELDS.every((f) => f.key === "first_name" || f.key === "last_name" || form[f.key]);

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md fade-up">

        <div className="bg-white border border-sand rounded-3xl p-8 shadow-sm">

          {/* Header */}
          <div className="mb-8">
            <p className="font-mono text-xs text-muted uppercase tracking-widest mb-1">New here?</p>
            <h1 className="font-display text-3xl font-black text-ink">
              Create your <span className="text-rose italic">account</span>
            </h1>
            <p className="text-sm text-muted mt-1">
              Get access to AI-powered review insights for Shein products.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-body">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              {FIELDS.filter((f) => f.key === "first_name" || f.key === "last_name").map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-mono text-muted mb-1 uppercase tracking-wider">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    autoComplete={field.auto}
                    value={form[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full bg-cream border border-sand rounded-xl px-3 py-2.5 text-sm font-body text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors"
                  />
                </div>
              ))}
            </div>

            {/* Other fields */}
            {FIELDS.filter((f) => f.key !== "first_name" && f.key !== "last_name").map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-mono text-muted mb-1 uppercase tracking-wider">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  autoComplete={field.auto}
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full bg-cream border border-sand rounded-xl px-4 py-3 text-sm font-body text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors"
                />
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={Boolean(loading || !form.username || !form.password)}
              className="w-full bg-rose text-cream py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-sand" />
            <span className="text-xs font-mono text-muted">or</span>
            <div className="flex-1 h-px bg-sand" />
          </div>

          <p className="text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-ink font-semibold hover:text-rose transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}