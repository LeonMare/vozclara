/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRANSLATION_EMAIL?: string;
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
