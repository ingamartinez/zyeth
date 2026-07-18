import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// Deploy-time migration runner: applies every migration in ./drizzle
// against DATABASE_URL and exits. Run via `npm run db:migrate`.
async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Copy backend/.env.example to backend/.env and point it at the dedicated zyeth database.',
    );
  }

  // A dedicated single connection (max: 1) is the documented pattern for
  // running migrations — no pooling needed for a one-shot script.
  const migrationClient = postgres(connectionString, { max: 1 });
  const db = drizzle(migrationClient);

  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations applied successfully.');

  await migrationClient.end();
}

main().catch((error: unknown) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
