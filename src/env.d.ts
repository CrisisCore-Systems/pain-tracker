/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WCB_API_ENDPOINT: string;
  readonly VITE_WCB_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 