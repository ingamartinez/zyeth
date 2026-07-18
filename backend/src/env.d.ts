/// <reference types="astro/client" />

import type { User } from './db';

declare global {
  namespace App {
    interface Locals {
      // Set by src/middleware.ts once a request under /admin/* passes the
      // session guard. Only ever present on guarded admin routes.
      user?: User;
    }
  }
}
