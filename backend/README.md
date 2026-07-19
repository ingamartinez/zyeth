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
| `SMTP_HOST` | _(none — required)_ | SMTP server host for new-submission notification emails (#32). Without it, `src/lib/notify.ts` is a silent no-op (logs one warning) — the submission API keeps working either way. |
| `SMTP_PORT` | `587` | SMTP server port. |
| `SMTP_SECURE` | `false` | Set to `true` for implicit TLS (typically port 465). Leave unset/`false` for STARTTLS on 587. |
| `SMTP_USER` | _(none)_ | SMTP auth username. Optional — omit for an unauthenticated local relay. |
| `SMTP_PASS` | _(none)_ | SMTP auth password. Optional, paired with `SMTP_USER`. |
| `NOTIFY_EMAIL_FROM` | _(none — required)_ | `From` address for notification emails. |
| `NOTIFY_EMAIL_TO` | _(none — required)_ | Internal recipient (Zyeth business owner) alerted on every new lead/application. Not a submitter confirmation. |

`SMTP_HOST`, `NOTIFY_EMAIL_FROM` and `NOTIFY_EMAIL_TO` are all required for
notifications to send; if any is missing, `notifyNewSubmission()` no-ops
instead of throwing. Wiring real SMTP credentials into the per-env `.env` /
systemd `EnvironmentFile=` is the host owner's job (same as `UPLOADS_DIR` /
`MAX_CV_BYTES` / `ALLOWED_ORIGINS` above) — an agent sandbox cannot write
`.env` files. A real end-to-end send (an email actually arriving) can only
be verified manually once those credentials are provisioned.

Client IP for rate limiting is derived from `X-Forwarded-For`, on the
assumption that this service is only ever reached through the Caddy
reverse proxy on the same host (see `src/lib/rate-limit.ts`).

## Admin auth

`/admin/*` trusts **Cloudflare Access** as the sole identity gate (#52,
replacing the earlier #30 app-level password login — see
`src/middleware.ts`, `src/lib/cf-access.ts`):

- Cloudflare Access (configured at the edge, see `deploy/README.md` §
  Admin subdomain) authenticates the user by email OTP and injects a
  signed `Cf-Access-Jwt-Assertion` header on every request that passed.
- `src/middleware.ts` verifies that JWT on every `/admin/*` request using
  `jose`: signature against Cloudflare's JWKS (cached and rotated
  automatically by `jose`'s `createRemoteJWKSet`, no hand-rolled caching),
  plus `iss`, `aud`, and `exp`/`nbf` checks. A missing or invalid JWT gets
  a **403** — never a redirect, since there is no app-level login page
  anymore and a redirect would fail to close the direct-to-origin bypass
  (see the "Critical constraint" in issue #52).
- `Astro.locals.user` is set from the JWT's `email` claim — there is no
  `users` table lookup and no session cookie anymore.
- **Logout** (`GET /admin/logout`) redirects to Cloudflare Access's own
  logout URL (`https://<team-domain>/cdn-cgi/access/logout`), which clears
  the `CF_Authorization` cookie Access set.
- **Local dev**: there is no Cloudflare Access in front of `localhost`, so
  `src/middleware.ts` gates a dev-only bypass on `import.meta.env.DEV` (a
  Vite compile-time constant, dead-code-eliminated in a production build —
  not a `process.env` flag, which could be set by accident on a real
  deploy). Under `astro dev`, `/admin/*` is reachable with
  `Astro.locals.user = { email: 'dev@localhost' }` and no JWT.
- **CSRF**: `src/lib/csrf.ts` is retained but currently unused — the only
  two mutating admin routes (`POST /admin/login`, `POST /admin/logout`)
  are both gone. Kept for the next `/admin` route that mutates state,
  since a valid Access JWT header does NOT substitute for CSRF protection
  (the `CF_Authorization` cookie travels cross-site).
- **Fallback / break-glass**: if Cloudflare Access is misconfigured or
  down, admins can't reach `/admin` at all. Recovery is via the Cloudflare
  dashboard (Zero Trust → Access → Applications) — fix or temporarily
  relax the Access policy there. There is no app-level bypass by design.
- **Rollback**: the `users`/`sessions` Drizzle tables and `password_hash`
  column are intentionally still in `src/db/schema.ts` (unused, no code
  reads/writes them) in case JWT auth needs to be rolled back before it's
  verified live. Dropping them is a separate follow-up, not part of #52.

### Required environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `CF_ACCESS_TEAM_DOMAIN` | `alejoframes.cloudflareaccess.com` | The Cloudflare Access team/org domain — used to build both the JWKS URL (`.../cdn-cgi/access/certs`) and the expected JWT `iss`. |
| `CF_ACCESS_AUD` | _(none — required in prod)_ | The Access application's AUD tag, from that Access app's **Overview** tab in the Cloudflare Zero Trust dashboard — an operator step, never generated by this repo. If unset, `verifyAccessJwt()` throws and every `/admin/*` request 403s (fail closed) rather than skipping the audience check. |
