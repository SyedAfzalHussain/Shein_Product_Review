/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      colors: {
        cream: "#F5F0E8",
        ink: "#1A1208",
        rose: "#C8504A",
        sage: "#5C7A5C",
        sand: "#D4C5A9",
        muted: "#8C7B6B",
      },
    },
  },
  plugins: [],
};
