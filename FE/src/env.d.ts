/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string; // напр. http://localhost:3000
  // дополни позже: VITE_SOCKET_URL и т.п.
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
