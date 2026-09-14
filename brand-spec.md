/*
 * Brand Specification for Standalone Portfolio Artifact
 * Generated from extraction of existing portfolio reference
 *
 * This is the canonical brand spec for the portfolio site.
 * All design tokens, colors, typography, and layout rules are declared here.
 * Do not invent or add new values — use only what is explicitly extracted.
 */

:root {
  /* Core palette from theme.ts - 7 tokens as per brand guidelines */
  --bg: #141619;
  --surface: #0a0a0a;
  --fg: #ffffff;
  --muted: #737373;
  --border: #242424;
  --accent: #00e0ff;

  /* Secondary palette (accent-secondary) */
  --accent-secondary: #c6ff3d;

  /* Typography stacks from layout.tsx */
  --font-display: 'Geist', system-ui, -apple-system, Segoe UI, Helvetica Neue, Arial, sans-serif;
  --font-body: 'Plus Jakarta Sans', system-ui, -apple-system, Segoe UI, Helvetica Neue, Arial, sans-serif;
  --font-cursive: 'Dancing Script', cursive;

  /* Layout constants from globals.css */
  --radius: 8px;
  --border-width: 1px;
  --grid: 8px;
}

/* Brand system summary */
.brand-system {
  font-family: var(--font-body);
  background-color: var(--bg);
  color: var(--fg);
}
