import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        clay: {
          bg: "#f0f4f8",
          card: "#ffffff",
          primary: "#2563eb",
          "primary-dark": "#1d4ed8",
          "primary-light": "#38bdf8",
          "metallic-1": "#1e40af",
          "metallic-2": "#3b82f6",
          dark: "#0f172a",
          muted: "#64748b",
          border: "#e2e8f0",
        },
      },
      boxShadow: {
        clay: "8px 8px 18px rgba(163, 177, 198, 0.4), -8px -8px 18px rgba(255, 255, 255, 0.95), inset 2px 2px 4px rgba(255, 255, 255, 0.7)",
        "clay-sm": "4px 4px 10px rgba(163, 177, 198, 0.35), -4px -4px 10px rgba(255, 255, 255, 0.9), inset 1px 1px 2px rgba(255, 255, 255, 0.6)",
        "clay-lg": "12px 12px 24px rgba(163, 177, 198, 0.45), -12px -12px 24px rgba(255, 255, 255, 1), inset 3px 3px 6px rgba(255, 255, 255, 0.8)",
        "clay-inset": "inset 4px 4px 8px rgba(163, 177, 198, 0.35), inset -4px -4px 8px rgba(255, 255, 255, 0.9)",
        "clay-btn": "6px 6px 14px rgba(37, 99, 235, 0.35), -4px -4px 10px rgba(255, 255, 255, 0.8), inset 1px 1px 2px rgba(255, 255, 255, 0.4)",
        "clay-btn-active": "inset 3px 3px 6px rgba(15, 23, 42, 0.3), inset -2px -2px 4px rgba(255, 255, 255, 0.2)",
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
