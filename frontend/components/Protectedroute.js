"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth";

/**
 * Wrap any page that requires login with this component.
 *
 * Usage in a page: 
 *   export default function MyPage() { 
 *   }
 */
export default function ProtectedRoute({ children, redirectTo = "/auth/login" }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push(redirectTo);
  }, [user, loading, router, redirectTo]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-sand animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );

  if (!user) return null; // redirect in progress

  return children;
}