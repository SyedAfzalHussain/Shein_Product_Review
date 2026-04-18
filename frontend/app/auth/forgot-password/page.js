"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/forgot-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setMsg("Reset link sent. Check your email.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <form onSubmit={handleSubmit} className="space-y-4 w-80">
        <h2 className="text-xl font-bold">Forgot Password</h2>

        {msg && <p className="text-green-600">{msg}</p>}
        {error && <p className="text-red-600">{error}</p>}

        <input
          type="email"
          placeholder="Enter your email"
          className="w-full bg-cream border border-sand rounded-xl px-4 py-3 text-sm font-body text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors"
          value={email}
          onChange={(e) => setEmail(e.target.value)}

        />

        <button className="w-full bg-cream border border-sand rounded-xl px-4 py-3 text-sm font-body text-ink placeholder-muted focus:outline-none focus:border-ink transition-colors bg-black text-white px-4 py-2 w-full">
          Send Reset Link
        </button>
      </form>
    </div>
  );
}