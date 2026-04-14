"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const DJANGO = process.env.NEXT_PUBLIC_DJANGO_URL || "http://localhost:8000";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ── helpers ──────────────────────────────────────────────────
  const getAccess  = () => localStorage.getItem("access");
  const getRefresh = () => localStorage.getItem("refresh");

  const saveTokens = (access, refresh) => {
    localStorage.setItem("access",  access);
    localStorage.setItem("refresh", refresh);
  };

  const clearTokens = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  };

  // ── fetch current user ────────────────────────────────────────
  const fetchMe = useCallback(async (token) => {
    try {
      const res = await fetch(`${DJANGO}/api/auth/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Unauthorized");
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  // ── refresh access token silently ─────────────────────────────
  const refreshAccess = useCallback(async () => {
    const refresh = getRefresh();
    if (!refresh) return null;
    try {
      const res = await fetch(`${DJANGO}/api/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      localStorage.setItem("access", data.access);
      if (data.refresh) localStorage.setItem("refresh", data.refresh);
      return data.access;
    } catch {
      return null;
    }
  }, []);

  // ── boot: restore session ─────────────────────────────────────
  useEffect(() => {
    (async () => {
      let access = getAccess();
      if (access) {
        let userData = await fetchMe(access);
        if (!userData) {
          // try refresh
          access = await refreshAccess();
          if (access) userData = await fetchMe(access);
        }
        setUser(userData);
      }
      setLoading(false);
    })();
  }, [fetchMe, refreshAccess]);

  // ── login ─────────────────────────────────────────────────────
  const login = async (username, password) => {
    const res = await fetch(`${DJANGO}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Login failed");
    saveTokens(data.access, data.refresh);
    const userData = await fetchMe(data.access);
    setUser(userData);
    return userData;
  };

  // ── register ──────────────────────────────────────────────────
  const register = async (fields) => {
    const res = await fetch(`${DJANGO}/api/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    const data = await res.json();
    if (!res.ok) {
      // Flatten DRF validation errors into a readable string
      const msg = Object.entries(data)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
        .join(" | ");
      throw new Error(msg);
    }
    saveTokens(data.access, data.refresh);
    setUser(data.user);
    return data.user;
  };

  // ── logout ────────────────────────────────────────────────────
  const logout = async () => {
    const refresh = getRefresh();
    const access  = getAccess();
    if (refresh && access) {
      await fetch(`${DJANGO}/api/auth/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ refresh }),
      }).catch(() => {});
    }
    clearTokens();
    setUser(null);
    router.push("/auth/login");
  };

  // ── authenticated fetch helper ────────────────────────────────
  const authFetch = useCallback(async (url, options = {}) => {
    let access = getAccess();
    let res = await fetch(url, {
      ...options,
      headers: { ...(options.headers || {}), Authorization: `Bearer ${access}` },
    });
    if (res.status === 401) {
      access = await refreshAccess();
      if (!access) { logout(); return null; }
      res = await fetch(url, {
        ...options,
        headers: { ...(options.headers || {}), Authorization: `Bearer ${access}` },
      });
    }
    return res;
  }, [refreshAccess]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}