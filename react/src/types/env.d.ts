/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PROD: boolean;
  readonly VITE_BACKEND_DOMAIN: string;
  readonly VITE_BACKEND_PATH_PREFIX: string;
  readonly VITE_BACKEND_PORT: number;
  readonly VITE_FRONTEND_AUTH: string;
  readonly VITE_FRONTEND_ENABLE_DMP_ID: string;
  // Add other environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
