import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111110",
        secondary: "#374151",
        muted: "#6B7280",
        faint: "#E5E7EB",
        subtle: "#F9FAFB",
        "map-heat": "#E8A020",
        dark: "#0F1923",
        "dark-surface": "#1E293B",
        "dark-accent": "#38BDF8",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "Menlo", "monospace"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#111110",
            fontFamily: "var(--font-body)",
            "h1, h2, h3": {
              fontFamily: "var(--font-display)",
            },
            code: {
              fontFamily: "var(--font-mono)",
            },
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
