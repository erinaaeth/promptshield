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
        background: "#F7F8F4",
        surface: "#FFFFFF",
        "surface-2": "#F3F5EF",
        "surface-3": "#F0F3EC",
        border: "#D9E1D6",
        "border-strong": "#E6ECE4",
        "text-primary": "#101311",
        "text-secondary": "#4E5A52",
        "text-muted": "#7A857D",
        accent: "#4C8C63",
        "accent-light": "#7BBE8A",
        "accent-subtle": "#E6F4EA",
        success: "#4F9D69",
        "success-subtle": "#EAF6EE",
        danger: "#D96B5F",
        "danger-light": "#D96B5F",
        "danger-subtle": "#FCEBE8",
        warning: "#D6A24A",
        "warning-subtle": "#FFF5E5",
        ink: "#161616",
      },
      fontFamily: {
        sans: ["var(--font-satoshi)", "system-ui", "sans-serif"],
        serif: ["var(--font-instrument)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      fontSize: {
        "display-xl": ["5rem", { lineHeight: "1.02", letterSpacing: "-0.04em" }],
        "display-lg": ["4rem", { lineHeight: "1.06", letterSpacing: "-0.035em" }],
        "display-md": ["3rem", { lineHeight: "1.08", letterSpacing: "-0.03em" }],
        "display-sm": ["2rem", { lineHeight: "1.14", letterSpacing: "-0.02em" }],
        "body-lg": ["1.125rem", { lineHeight: "1.72" }],
        "body-md": ["1.0625rem", { lineHeight: "1.68" }],
        "body-sm": ["1rem", { lineHeight: "1.64" }],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,19,17,0.04), 0 10px 30px rgba(16,19,17,0.035)",
        "card-hover": "0 2px 6px rgba(16,19,17,0.05), 0 18px 40px rgba(16,19,17,0.05)",
        "card-strong": "0 6px 18px rgba(16,19,17,0.06), 0 24px 54px rgba(16,19,17,0.08)",
        "inner-sm": "inset 0 1px 2px rgba(16,19,17,0.05)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease forwards",
        "slide-up": "slideUp 0.5s ease forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "blink": "blink 1.2s step-end infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
