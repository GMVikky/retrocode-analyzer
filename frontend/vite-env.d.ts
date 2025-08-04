/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GITHUB_CLIENT_ID: string;
  // Add more VITE_ variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}