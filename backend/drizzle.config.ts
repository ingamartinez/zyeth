import { defineConfig } from 'drizzle-kit';

// drizzle-kit config for `db:generate` / `db:studio`.
// `DATABASE_URL` must point at the dedicated `zyeth` database — see
// backend/scripts/db-setup.sql and backend/README.md.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
