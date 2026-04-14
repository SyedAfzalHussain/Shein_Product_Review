import "./globals.css";
import { AuthProvider } from "../lib/auth";
import { WishlistProvider } from "../lib/wishlist";
import NavbarClient from "../components/NavbarClient";

export const metadata = {
  title: "SheinReview — AI-Powered Fashion Insights",
  description: "Authentic sentiment analysis for Shein products",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <WishlistProvider>
          <NavbarClient />
          <main>{children}</main>
          <footer style={{ borderTop: "1.5px solid #D4C5A9" }}
            className="mt-20 py-8 text-center text-sm text-muted font-body">
            © {new Date().getFullYear()} SheinReview — AI Sentiment Analysis Platform
          </footer>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}