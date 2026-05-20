/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRANSLATION_EMAIL?: string;
  readonly VITE_API_BASE?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_CF_BEACON_TOKEN?: string;
  readonly VITE_BUILD_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
