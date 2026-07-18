import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

// Singleton Drizzle client backed by the postgres.js driver.
//
// `DATABASE_URL` must point at the dedicated `zyeth` database/role (never
// findash's) — see backend/scripts/db-setup.sql and backend/README.md.
//
// Module-level `const` gives us the singleton for free: Node's ESM loader
// caches the module instance, so every import of `db` shares one
// connection pool for the lifetime of the process.
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. Copy backend/.env.example to backend/.env and point it at the dedicated zyeth database.',
  );
}

const client = postgres(connectionString);

export const db = drizzle(client, { schema });

export * from './schema';
