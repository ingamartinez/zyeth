/// <reference types="astro/client" />

interface ImportMetaEnv {
  /**
   * Base URL of the submissions backend (e.g. "http://localhost:4321" for
   * local dev). Empty/undefined until #33 (deploy) and #34 (Caddy/DNS) wire
   * up a live backend — every fetch that depends on it must guard for this.
   */
  readonly PUBLIC_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
