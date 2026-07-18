# @zyeth/backend

Submissions backend + admin dashboard for Zyeth (`admin.zyeth.work`). A
second Astro project in SSR mode (`@astrojs/node`, `output: 'server'`),
separate from the static marketing site at the repo root.

## Development

From the repo root (npm workspaces):

```sh
npm install
npm run dev -w @zyeth/backend
npm run build -w @zyeth/backend
npm run check -w @zyeth/backend   # astro check (type errors)
```

## Database setup

The backend uses [Drizzle ORM](https://orm.drizzle.team/) with the
`postgres` (postgres.js) driver against PostgreSQL.

The droplet's Postgres instance is **shared with other projects** (e.g.
findash). Zyeth gets its own dedicated, least-privilege role and database —
`scripts/db-setup.sql` never touches any other project's role or database.

**Staging and prod use separate databases and separate credentials.** Run
the setup script once per environment as a Postgres superuser:

```sh
# staging
sudo -u postgres psql \
  -v role_name=zyeth_app_staging \
  -v db_name=zyeth_staging \
  -v role_password=REPLACE_WITH_STRONG_STAGING_PASSWORD \
  -f backend/scripts/db-setup.sql

# prod
sudo -u postgres psql \
  -v role_name=zyeth_app_prod \
  -v db_name=zyeth_prod \
  -v role_password=REPLACE_WITH_STRONG_PROD_PASSWORD \
  -f backend/scripts/db-setup.sql
```

Generate strong passwords with `openssl rand -base64 32`. Store them only in
the per-env `.env` file (gitignored, `chmod 600`), never committed.

The script is idempotent — re-running it (e.g. to rotate a password) is
safe.

### Configure `DATABASE_URL`

Copy `.env.example` to `.env` and point `DATABASE_URL` at the role/database
created above, e.g.:

```
DATABASE_URL=postgresql://zyeth_app_staging:REPLACE_WITH_STRONG_STAGING_PASSWORD@127.0.0.1:5432/zyeth_staging
```

The app always connects over `127.0.0.1` (localhost) — Postgres is never
exposed to the public network.

### Migrations

Schema lives in `src/db/schema.ts`. Drizzle config is `drizzle.config.ts`.

```sh
# Generate a new SQL migration from schema changes (no live DB required)
npm run db:generate -w @zyeth/backend

# Apply pending migrations against DATABASE_URL (run at deploy time)
npm run db:migrate -w @zyeth/backend

# Optional: browse the DB with Drizzle Studio
npm run db:studio -w @zyeth/backend
```

Generated migration files live in `drizzle/` and are committed to the repo.
