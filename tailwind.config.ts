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
        bg: "var(--bg)",
        "bg-elevated": "var(--bg-elevated)",
        "bg-muted": "var(--bg-muted)",
        foreground: "var(--text)",
        muted: "var(--text-muted)",
        dim: "var(--text-dim)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        bordeaux: "var(--bordeaux)",
        "bordeaux-soft": "var(--bordeaux-soft)",
        gold: "var(--gold)",
        "gold-soft": "var(--gold-soft)",
        card: "var(--card)",
        drawer: "var(--drawer)",
        invert: "var(--invert)",
        "invert-text": "var(--invert-text)",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "680px",
        wide: "1120px",
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
