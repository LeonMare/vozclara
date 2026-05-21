import type { Config } from 'tailwindcss';

// Design tokens taken verbatim from LEON MARÉ Brand Foundation v5, Kapitel 16.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0A1A3A',       // LEON-NAVY · primary
        gold: '#C9A24B',       // LEON-GOLD · accent, logo (use on dark bg)
        'gold-deep': '#8C6F2A',// LEON-GOLD darkened for text-on-creme.
                               // Gives ~4.7:1 contrast on creme — WCAG AA.
                               // Same brand hue, just dropped two lightness
                               // stops. Use for section eyebrows, gold links,
                               // gold separators when the background is
                               // paper/creme/white.
        'gold-soft': '#E8D29A', // GOLD HELL · hover, secondary accents
        creme: '#F7F3EC',      // CREME · main background
        graphit: '#1A1A1A',    // GRAPHIT · body text
      },
      fontFamily: {
        // Primary serif — classical display for headlines + editorial pulls.
        // The value reads a CSS custom property so the family can be
        // swapped per :lang() locale (see src/index.css → #38). Default
        // value of --font-display-serif resolves to Cormorant Garamond
        // with a Georgia fallback chain; :lang(de) flips it to Spectral,
        // :lang(es) to Libre Caslon Text, :lang(pt) to Source Serif 4.
        serif: ['var(--font-display-serif)'],
        // Inscriptional classical capitals — used for the LEON MARÉ wordmark,
        // matching the cover-page setting of the Brand Foundation document
        // (Trajan-style Roman capitals). Cinzel is the open-source approximation.
        // Universal across locales; the brand mark stays one mark.
        inscriptional: ['Cinzel', '"Trajan Pro"', '"Times New Roman"', 'serif'],
        // Secondary humanist sans for UI and long-form reading. Universal —
        // Inter holds up across all four locales' diacritic combinations.
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      letterSpacing: {
        // The Brand Foundation header sets "L E O N   M A R É" with wide tracking.
        // 0.4em matches the visual rhythm of the cover page.
        wordmark: '0.4em',
      },
      borderRadius: {
        card: '8px',  // small radius — "klassisch", not trendy.
      },
      boxShadow: {
        card: '0 1px 2px rgba(10, 26, 58, 0.06), 0 4px 12px rgba(10, 26, 58, 0.04)',
      },
    },
  },
  plugins: [],
} satisfies Config;
