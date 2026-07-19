# Backend deploy runbook

Operational reference for the `@zyeth/backend` SSR process on the shared
staging droplet. Companion to `.github/workflows/deploy.yml` (the CI job
that automates the steps below on every push to `staging`) and the main
`backend/README.md` (dev setup, DB setup, app-level env vars).

## Topology

The droplet is **shared** with other projects (findash, photoshowcase) and
is Bun-only — there is no Node/npm on the host. Everything backend-side
runs under Bun:

- Host: same DigitalOcean droplet as the frontend static-site deploy
  target, reachable via the existing `DEPLOY_SSH_KEY` / `DEPLOY_HOST` /
  `DEPLOY_USER` GitHub secrets (user `deploy`).
- **Bun binary**: `/opt/bun/bin/bun` — NOT `/usr/local/bin/bun` (that path
  is a symlink into `/home/findash/.bun/`, permission-denied to every
  other user). Always call Bun by its full `/opt/bun/bin/bun` path in
  systemd units, install commands, and migration commands.
- App user: `zyeth` (system user, `--no-create-home`,
  `--shell /usr/sbin/nologin`), same pattern as the other projects on this
  host.
- Ports: **3400** staging, **3401** prod (prod not yet provisioned — see
  below).

### Host layout

```
/srv/zyeth-backend/
  staging/
    current/        # deployed app (dist/, drizzle/, src/, package.json)
    uploads/         # UPLOADS_DIR — CV storage, never web-served
  prod/              # mirrors staging/, once prod is provisioned

/etc/zyeth-backend/
  staging.env        # 640 root:zyeth — EnvironmentFile for the staging unit
  prod.env            # same, once prod is provisioned

/etc/systemd/system/
  zyeth-backend@.service   # templated unit, see systemd/zyeth-backend@.service
```

The `/etc/zyeth-backend` directory itself must be `750 root:zyeth`
(readable/traversable by the `zyeth` group), not just the `.env` files
inside it — otherwise the `zyeth` user can't read its own env file when
running migrations by hand (systemd itself reads `EnvironmentFile=` as
root regardless, so this only bites manual/CI-triggered migration runs).

Env vars live **only** in these host files — never in git, never in
GitHub Secrets. See `backend/README.md` for the full app-level env var
contract (`DATABASE_URL`, `UPLOADS_DIR`, `MAX_CV_BYTES`,
`ALLOWED_ORIGINS`) plus `PORT` / `HOST` (read directly by the
`@astrojs/node` standalone adapter — `astro.config.mjs` sets neither, so
these two env vars are the only way to control the bind address/port).

## One-time provisioning (per environment)

Run once per environment (`staging`, later `prod`) as a host operator with
sudo. None of this is automated by CI — it's environment setup, not
deploy.

1. **Database**: run `backend/scripts/db-setup.sql` as the Postgres
   superuser with a dedicated role/DB per env (see `backend/README.md` §
   Database setup). Idempotent, safe to re-run.
2. **System user**: `useradd --system --user-group --no-create-home
   --home-dir /srv/zyeth-backend --shell /usr/sbin/nologin zyeth` (skip if
   the user already exists from a previous env's setup).
3. **Directories**:
   ```sh
   mkdir -p /srv/zyeth-backend/<env>/{current,uploads}
   chown -R zyeth:zyeth /srv/zyeth-backend/<env>
   ```
4. **Env file**:
   ```sh
   mkdir -p /etc/zyeth-backend
   chmod 750 /etc/zyeth-backend
   chown root:zyeth /etc/zyeth-backend
   $EDITOR /etc/zyeth-backend/<env>.env   # DATABASE_URL, UPLOADS_DIR, ALLOWED_ORIGINS, PORT, HOST
   chmod 640 /etc/zyeth-backend/<env>.env
   chown root:zyeth /etc/zyeth-backend/<env>.env
   ```
   `PORT=3400` / `HOST=127.0.0.1` for staging (3401 for prod, once
   provisioned).
5. **systemd unit**: copy the committed template into place once —
   ```sh
   cp backend/deploy/systemd/zyeth-backend@.service /etc/systemd/system/
   systemctl daemon-reload
   systemctl enable --now zyeth-backend@<env>.service
   ```
   The `@<env>` instance name (`staging` / `prod`) drives
   `WorkingDirectory` and `EnvironmentFile` via the unit's `%i`
   substitution — one template file serves both environments.
6. **Sudoers** (lets CI's `deploy` user drive the app without a login
   shell for `zyeth`, and without granting `deploy` full root):
   ```
   # /etc/sudoers.d/zyeth-deploy
   deploy ALL=(zyeth) NOPASSWD: ALL
   deploy ALL=(root) NOPASSWD: /bin/systemctl restart zyeth-backend@staging.service, /bin/systemctl status zyeth-backend@staging.service, /bin/systemctl start zyeth-backend@staging.service
   ```
   (Extend the systemctl allowlist with the `@prod` unit when prod is
   enabled.)

## What CI does on every push to `staging`

See the `deploy-backend` job in `.github/workflows/deploy.yml`. Summary,
matching the manual recipe validated when #33 was first provisioned:

1. Build the backend workspace on the runner (Node 22, `npm ci` +
   `npm run build -w @zyeth/backend`) — produces `backend/dist/`.
2. Assemble the deploy payload: `dist/`, `package.json`, `drizzle/`
   (migration SQL), `src/` (needed at runtime only for
   `src/db/migrate.ts`, run via `bun`, not compiled).
3. rsync the payload to a scratch dir under `/tmp` on the host (the `deploy`
   user cannot write `/srv/zyeth-backend` directly — it's owned by
   `zyeth`), then `sudo -u zyeth rsync --delete` it into
   `/srv/zyeth-backend/staging/current/`.
4. `sudo -u zyeth /opt/bun/bin/bun install --production --ignore-scripts`
   in `current/`.
5. Migrate: source the env file, then
   `sudo -u zyeth /opt/bun/bin/bun src/db/migrate.ts`.
6. `sudo systemctl restart zyeth-backend@staging.service`.
7. Health gate: poll `curl -fsS http://127.0.0.1:3400/api/health` a few
   times; fail the job if it never returns 200.

This job is **independent of the frontend `deploy` job** — no `needs:`
coupling — so a backend failure never blocks or breaks the static-site
deploy.

### The `--ignore-scripts` / bcrypt gotcha

`bun install --production` (without `--ignore-scripts`) fails on
`bcrypt`'s native postinstall build script, which shells out to `node` —
unavailable to the `zyeth` user on this Bun-only host. `argon2` (the
primary hashing algorithm, see `backend/README.md` § Admin auth) works
fine without any install script — it ships a prebuilt
`node-gyp-build`/musl binary. Since `bcrypt` is only ever used as a lazy
fallback when `argon2`'s native binding fails to load (and it doesn't,
here), running `bun install --production --ignore-scripts` is safe: it
leaves `bcrypt` without its native binding, which is an acceptable gap,
not a regression.

## Prod: intentionally deferred

Prod backend is **not provisioned**. The `deploy-backend` job only runs on
`push` to `staging` (`if: github.ref == 'refs/heads/staging'`) — this is a
deliberate #33 scope decision, not an oversight: the shared droplet is
resource-constrained (2 vCPU / 2 GB RAM, already tight with the other
projects on it), so a second backend process wasn't provisioned yet.

To enable prod later:

1. Provision the host for `prod` (steps above, with `<env>=prod`, port
   3401, its own Postgres role/DB, its own `/etc/zyeth-backend/prod.env`).
2. Extend the sudoers file to allow `deploy` to
   restart/status/start `zyeth-backend@prod.service`.
3. In `.github/workflows/deploy.yml`, drop the branch guard on
   `deploy-backend` (or branch the job's env values on
   `github.ref_name == 'main'` the same way the existing frontend job
   resolves its rsync target path) and parametrize the deploy path, env
   file name, systemd instance, and health-check port per branch.
4. Confirm `admin.zyeth.work` / Caddy routing for prod (tracked
   separately in #34, alongside staging).

## Admin subdomain (admin.zyeth.work) — #34

The backend has no public URL of its own — until now it was only reachable
at `127.0.0.1:3400` on the droplet. `admin.zyeth.work` exposes the admin
dashboard (and the SSR app generally) publicly, fronted by Cloudflare
Access so identity is gated at the edge, in front of the app's own argon2
`/admin` login (defense in depth, not a replacement — see `backend/README.md`
§ Admin auth for the app-level login).

This is **one-time host-operator provisioning**, same category as the
steps in § One-time provisioning above — none of it is automated by CI,
and none of it is part of this repo's deploy pipeline.

1. **Cloudflare DNS**: add an `A` record `admin.zyeth.work` →
   `<droplet IP>`, **proxied** (orange cloud), same as the other zyeth
   records. SSL/TLS mode stays **Full (strict)** — unchanged.
2. **Cloudflare Access**: create a self-hosted Access application for
   `admin.zyeth.work` with a policy that **allows only the client's
   identity** (email allowlist) and blocks everyone else. This is the
   actual identity gate — it runs before any request reaches Caddy or the
   app.
3. **Caddy**: append `backend/deploy/caddy/admin.zyeth.work.caddy` to the
   droplet's `/etc/caddy/Caddyfile` (as **root** — the `deploy` user's
   sudoers entries from § One-time provisioning above do **not** include
   caddy reload/restart). Back up the Caddyfile first. Then, before
   reloading:
   ```sh
   caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
   systemctl reload caddy
   ```
   The `validate` step is mandatory, not optional — this is a **shared**
   Caddy instance serving findash and photoshowcase too, so a syntax error
   in the appended block would take down every site on the host, not just
   admin.zyeth.work.
4. **Verify**:
   - `curl -I https://admin.zyeth.work` returns a valid TLS handshake and
     an app response (through the CF Access redirect for an unauthenticated
     request).
   - An unauthenticated browser hitting `https://admin.zyeth.work` lands on
     the Cloudflare Access identity gate first, before ever seeing the
     app's own `/admin` login.
   - `zyeth.work`, `www.zyeth.work`, `staging.zyeth.work`, findash, and
     photoshowcase are all unaffected — confirm each still serves normally
     after the reload.

The DNS record, the Access policy, and the actual `caddy reload` on the
droplet are **operator steps**, run outside this repo/CI. This repo only
carries the versioned Caddy block (`backend/deploy/caddy/admin.zyeth.work.caddy`)
that gets appended.

## Env var contract (reminder)

The full contract — `DATABASE_URL`, `UPLOADS_DIR`, `MAX_CV_BYTES`,
`ALLOWED_ORIGINS`, plus adapter-level `PORT` / `HOST` — lives **only** in
the host's `/etc/zyeth-backend/<env>.env` file. It is never committed,
never a GitHub Actions secret, and never generated by CI. See
`backend/README.md` for what each variable does; see `.env.example` in
`backend/` for local dev.
