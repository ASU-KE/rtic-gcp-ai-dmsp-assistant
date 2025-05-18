/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PROD: boolean;
  readonly VITE_BACKEND_DOMAIN: string;
  readonly VITE_BACKEND_PORT: number;
  readonly VITE_BACKEND_AUTH: string;
  // Add other environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
