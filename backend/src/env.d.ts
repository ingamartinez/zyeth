/// <reference types="astro/client" />

// `export {}` keeps this file a module (not a global script) so
// `declare global` below is valid TypeScript — it was implicit before via
// the now-removed `import type { User } from './db'`.
export {};

// JWT-derived identity set by src/middleware.ts once a request under
// /admin/* passes Cloudflare Access JWT verification (#52) — or the DEV
// bypass identity under `astro dev`. Deliberately NOT the Drizzle `User`
// row shape: there is no app-level user account anymore, only whatever
// the Access JWT's `email` claim says.
interface AdminIdentity {
  email: string;
}

declare global {
  namespace App {
    interface Locals {
      // Only ever present on guarded admin routes.
      user?: AdminIdentity;
    }
  }
}
