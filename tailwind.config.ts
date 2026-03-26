import type { Config } from 'tailwindcss';

export default {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary colors
        primary: "#565e74",
        "primary-dim": "#4a5268",
        "primary-container": "#dae2fd",
        "primary-fixed": "#dae2fd",
        "primary-fixed-dim": "#ccd4ee",
        "on-primary": "#f7f7ff",
        "on-primary-container": "#4a5167",
        "on-primary-fixed": "#373f54",
        "on-primary-fixed-variant": "#535b71",

        // Secondary colors
        secondary: "#526074",
        "secondary-dim": "#465468",
        "secondary-container": "#d5e3fc",
        "secondary-fixed": "#d5e3fc",
        "secondary-fixed-dim": "#c7d5ed",
        "on-secondary": "#f8f8ff",
        "on-secondary-container": "#455367",
        "on-secondary-fixed": "#324053",
        "on-secondary-fixed-variant": "#4e5c71",

        // Tertiary colors
        tertiary: "#526075",
        "tertiary-dim": "#465469",
        "tertiary-container": "#d5e3fd",
        "tertiary-fixed": "#d5e3fd",
        "tertiary-fixed-dim": "#c7d5ee",
        "on-tertiary": "#f8f8ff",
        "on-tertiary-container": "#455367",
        "on-tertiary-fixed": "#324054",
        "on-tertiary-fixed-variant": "#4e5c71",

        // Surface colors (core hierarchy)
        surface: "#f7f9fb",
        "surface-bright": "#f7f9fb",
        "surface-dim": "#cfdce3",
        "surface-container": "#e8eff3",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f0f4f7",
        "surface-container-high": "#e1e9ee",
        "surface-container-highest": "#d9e4ea",
        "surface-tint": "#565e74",
        "surface-variant": "#d9e4ea",

        // On surface colors
        background: "#f7f9fb",
        "on-background": "#2a3439",
        "on-surface": "#2a3439",
        "on-surface-variant": "#566166",

        // Outline colors
        outline: "#717c82",
        "outline-variant": "#a9b4b9",

        // Error colors
        error: "#9f403d",
        "error-dim": "#4e0309",
        "error-container": "#fe8983",
        "on-error": "#fff7f6",
        "on-error-container": "#752121",

        // Inverse colors
        "inverse-surface": "#0b0f10",
        "inverse-primary": "#dae2fd",
        "inverse-on-surface": "#9a9d9f",

        // CRUD semantic colors
        "crud-c-bg": "#4ade80",
        "crud-c-fg": "#052e16",
        "crud-r-bg": "#60a5fa",
        "crud-r-fg": "#172554",
        "crud-u-bg": "#facc15",
        "crud-u-fg": "#422006",
        "crud-d-bg": "#f87171",
        "crud-d-fg": "#450a0a",
      },
      fontFamily: {
        "sans": ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        "headline": ["Inter", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"],
        "mono": ["JetBrains Mono", "Roboto Mono", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      fontSize: {
        // Editorial scale
        "display-sm": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "headline-sm": ["1.75rem", { lineHeight: "1.3", letterSpacing: "0px" }],
        "headline-xs": ["1.5rem", { lineHeight: "1.3", letterSpacing: "0px" }],
        "title-sm": ["0.875rem", { lineHeight: "1.4", letterSpacing: "0.01em", fontWeight: "600" }],
        "title-xs": ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.01em", fontWeight: "600" }],
        "body-md": ["1rem", { lineHeight: "1.5" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        "body-xs": ["0.75rem", { lineHeight: "1.5" }],
        "label-lg": ["0.875rem", { lineHeight: "1.4", letterSpacing: "0.01em", fontWeight: "600" }],
        "label-md": ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.02em", fontWeight: "600" }],
        "label-sm": ["0.625rem", { lineHeight: "1.4", letterSpacing: "0.05em", fontWeight: "700", textTransform: "uppercase" }],
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem",
      },
      boxShadow: {
        "ambient-sm": "0 1px 2px rgb(42 52 57 / 0.06), 0 6px 14px rgb(42 52 57 / 0.07)",
        "ambient-md": "0 3px 10px rgb(42 52 57 / 0.08), 0 14px 26px rgb(42 52 57 / 0.07)",
      },
      backdropBlur: {
        "glass": "12px",
      },
    },
  },
} satisfies Config;
