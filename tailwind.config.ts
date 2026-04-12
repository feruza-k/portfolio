import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/ai-elements/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // HSL-based tokens — support bg-primary/10 opacity modifiers
        primary:    "hsl(var(--primary) / <alpha-value>)",
        accent:     "hsl(var(--accent) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card:       "hsl(var(--card) / <alpha-value>)",
        border:     "hsl(var(--border) / <alpha-value>)",
        "muted-fg": "hsl(var(--muted-fg) / <alpha-value>)",
        "terminal-green": "hsl(var(--terminal-green) / <alpha-value>)",
        // Solid aliases
        secondary:  "#111114",
        muted:      "#6b7280",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        mono:    ["var(--font-mono)",    "Menlo",   "monospace"],
        body:    ["var(--font-body)",    "system-ui","sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },
      keyframes: {
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-20px)" },
        },
        "float-medium": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-15px)" },
        },
      },
      animation: {
        "spin-slow":    "spin-slow 20s linear infinite",
        "float-slow":   "float-slow 8s ease-in-out infinite",
        "float-medium": "float-medium 6s ease-in-out infinite -2s",
      },
    },
  },
  plugins: [],
};

export default config;
