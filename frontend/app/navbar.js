"use client";

import { useAuth } from "../lib/auth";
import { useWishlist } from "../lib/wishlist";

export default function NavbarClient() {
  const { user, logout, loading } = useAuth();
  const { savedIds } = useWishlist();
  const wishlistCount = savedIds.size;

  return (
    <nav
      style={{ borderBottom: "1.5px solid #D4C5A9" }}
      className="bg-cream sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
    >
      <Link href="/" className="font-display text-2xl font-black tracking-tight text-ink">
        Shein<span className="text-rose">Review</span>
      </Link>

      <div className="flex gap-4 items-center text-sm font-medium text-muted">
        <Link href="/" className="hover:text-ink transition-colors">Browse</Link>
        <Link href="/about" className="hover:text-ink transition-colors">About</Link>
        <Link href="/dashboard" className="hover:text-ink transition-colors">Dashboard</Link>

        {/* Wishlist icon */}
        <Link href="/wishlist" className="relative hover:text-rose transition-colors" aria-label="Wishlist">
          <span className="text-lg leading-none">♥</span>
          {wishlistCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-rose text-cream text-[10px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {wishlistCount > 9 ? "9+" : wishlistCount}
            </span>
          )}
        </Link>
        <Link href="/about" className="hover:text-ink transition-colors">About</Link>

        {!loading && (
          user ? (
            <div className="flex items-center gap-3 ml-1">
              <Link href="/profile">
                <span className="text-xs font-mono bg-sand text-ink px-3 py-1 rounded-full">
                  {user.username}
                </span>
              </Link>
              <Link href="/profile" className="text-xs text-muted hover:text-ink transition-colors">Profile</Link>
              <button
                onClick={logout}
                className="text-xs text-muted hover:text-rose transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex gap-2 ml-1">
              <Link href="/login"
                className="text-xs border border-sand px-3 py-1.5 rounded-lg hover:border-ink hover:text-ink transition-colors">
                Login
              </Link>
              <Link href="/register"
                className="text-xs bg-ink text-cream px-3 py-1.5 rounded-lg hover:bg-rose transition-colors">
                Register
              </Link>
            </div>
          )
        )}
      </div>
    </nav>
  );
}