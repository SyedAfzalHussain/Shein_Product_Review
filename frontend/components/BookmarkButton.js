"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth";
import { useWishlist } from "../lib/wishlist";

/**
 * <BookmarkButton productId={42} />
 * Shows a heart icon — filled if saved, outline if not.
 * Redirects to /auth/login if user is not authenticated.
 */
export default function BookmarkButton({ productId, size = "md" }) {
  const { user }          = useAuth();
  const { isSaved, toggle } = useWishlist();
  const router            = useRouter();
  const [busy, setBusy]   = useState(false);

  const saved = isSaved(productId);
  const sz    = size === "lg" ? "w-10 h-10 text-xl" : "w-8 h-8 text-base";

  const handleClick = async (e) => {
    e.preventDefault();   // stop card <a> navigation
    e.stopPropagation();
    if (!user) { router.push("/auth/login"); return; }
    if (busy) return;
    setBusy(true);
    await toggle(productId);
    setBusy(false);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      className={`
        ${sz} rounded-full flex items-center justify-center
        transition-all duration-200
        ${saved
          ? "bg-rose text-black shadow-md scale-105"
          : "bg-white/80 backdrop-blur text-muted hover:text-rose hover:scale-110"}
        ${busy ? "opacity-50 cursor-wait" : "cursor-pointer"}
      `}
    >
      {saved ? "♥" : "♡"}
    </button>
  );
}