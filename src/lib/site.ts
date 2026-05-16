/**
 * Canonical public URL for the VozClara frontend. Read from
 * VITE_SITE_URL at build time so the domain switch (pages.dev → custom
 * domain) is a single env-var flip, not a code-wide find-replace.
 *
 * Default falls back to the Cloudflare-issued staging URL so local dev
 * and a deploy without .env.production both keep working.
 */
export const SITE_URL: string =
  (import.meta.env.VITE_SITE_URL as string | undefined) ?? 'https://vozclara.pages.dev';
