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

## Public submission API

Two unauthenticated endpoints accept public submissions and persist them:

- `POST /api/leads` — JSON body (`name`, `email`, `phone?`, `role`,
  `expectedRate?`). Inserts a `leads` row with `source = 'contact_form'`.
- `POST /api/applications` — `multipart/form-data` (`name`, `email`,
  `roleExperience`, `englishLevel`, plus a `cv` file). Validates the CV by
  sniffing its real magic bytes (PDF/DOC/DOCX only, regardless of the
  client-supplied filename or Content-Type), stores it under
  `UPLOADS_DIR` with a UUID filename, and inserts a `talent_applications`
  row.

Both endpoints:

- Reject requests with a **honeypot** field, `company`, non-empty. Bots
  that fill it get a fake `201 { ok: true }` response with nothing
  persisted — the frontend (#29) must render this field hidden and never
  populate it for real users.
- Enforce a per-IP rate limit (in-memory, ~10 submissions / 10 minutes,
  shared across both endpoints) — `429` when exceeded.
- Only send CORS headers (`Access-Control-Allow-Origin`) for origins in
  `ALLOWED_ORIGINS`, without credentials.

### New environment variables

Add these to the per-env `.env` file (see `.env.example`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `UPLOADS_DIR` | `./uploads` | Where CVs are stored. In prod, use `/srv/zyeth-backend/{env}/uploads`. Created on demand with `0700` perms; **never web-served**. |
| `MAX_CV_BYTES` | `5242880` (5 MB) | Max accepted CV size, checked against the actual buffered byte length (not the `Content-Length` header). Oversized uploads get `413`. |
| `ALLOWED_ORIGINS` | `https://zyeth.work,https://staging.zyeth.work` | Comma-separated CORS allowlist for `/api/leads` and `/api/applications`. |

Client IP for rate limiting is derived from `X-Forwarded-For`, on the
assumption that this service is only ever reached through the Caddy
reverse proxy on the same host (see `src/lib/rate-limit.ts`).

## Admin auth

`/admin/*` is a session-guarded dashboard for the single admin user (see
`src/middleware.ts`, `src/lib/{auth,session,csrf}.ts`,
`src/pages/admin/{login,logout,index}`):

- Passwords are hashed with argon2id, falling back to bcrypt if argon2's
  native build fails to load in a given environment (`src/lib/auth.ts`).
- Sessions are server-side rows (`sessions` table) keyed by an opaque
  256-bit token, set as an httpOnly, `sameSite=lax` cookie scoped to
  `path=/admin`; 7-day TTL, expirable and revocable (`src/lib/session.ts`).
- `/admin/login` (login POST) and `/admin/logout` are protected by an
  app-level double-submit CSRF token (`src/lib/csrf.ts`) — see
  `astro.config.mjs` for why this is separate from Astro's built-in
  `security.checkOrigin`, which stays disabled globally for the public
  submission endpoints above.
- Both the session and CSRF cookies set `secure: import.meta.env.PROD` —
  true in any real Astro build (the deployed SSR server), false only
  under `astro dev`. No env var to configure; fail-secure by
  construction.
- Login is rate-limited separately from the public submission endpoints
  (5 attempts / 15 min per IP, `checkLoginRateLimit` in
  `src/lib/rate-limit.ts`).

### Seeding the admin user

There is no automated seed script (deliberately manual for now). Generate
a real argon2id hash and insert the row directly, e.g.:

```sh
node -e "
const argon2 = require('argon2');
argon2.hash('YOUR_PASSWORD', { type: argon2.argon2id }).then(console.log);
"
```

Then:

```sql
INSERT INTO users (email, password_hash)
VALUES ('admin@example.com', 'PASTE_THE_HASH_HERE');
```
