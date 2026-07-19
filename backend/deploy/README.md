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

   **Do NOT pre-create the access-log file as root.** The block's `log`
   directive writes to `/var/log/caddy/zyeth-admin-access.log`. Caddy runs
   as the `caddy` user and creates that file itself on first write with the
   right ownership — leave it alone and let it happen. If the file must be
   pre-created for some other reason (e.g. to pre-set log rotation
   tooling), `chown caddy:caddy` it **immediately** after creating it:
   ```sh
   touch /var/log/caddy/zyeth-admin-access.log
   chown caddy:caddy /var/log/caddy/zyeth-admin-access.log
   ```
   A `sudo touch` (or any root-owned redirect) leaves the file
   `root:root 0600`. Caddy can't open a log file it doesn't own, so
   **every** subsequent config reload fails at `loading new config: setting
   up custom log ... permission denied` — not just for `admin.zyeth.work`,
   for the whole shared Caddyfile. The service gets stuck in
   `ActiveState=reloading` (the reload times out/gets killed roughly every
   90s and retries), the `admin.zyeth.work` block never finishes loading,
   and every request to it is served as an empty response
   (`"msg":"NOP","status":0,"size":0` in the access log) — i.e. a **blank
   page**, with no error visible to the browser. This exact failure mode
   took `admin.zyeth.work` down for over a day on staging (see #51) before
   the root cause was traced to file ownership rather than the app or
   Cloudflare Access.
4. **Verify**:
   - After the `systemctl reload caddy` above, confirm the reload actually
     succeeded before moving on:
     ```sh
     systemctl is-active caddy    # must print "active", not "reloading"
     systemctl status caddy       # `Status:` line must show no error —
                                   # in particular no "permission denied"
     ```
     If `is-active` reports anything other than `active`, or `status`
     shows a `permission denied` (or any other) error in `Status:`, the
     new config did **not** load — stop and fix that before touching DNS/
     Access, the block above is not live yet.
   - `curl -I https://admin.zyeth.work` returns a valid TLS handshake and
     an app response (through the CF Access redirect for an unauthenticated
     request).
   - An unauthenticated browser hitting `https://admin.zyeth.work` lands on
     the Cloudflare Access identity gate first, before ever seeing the
     app's own `/admin` login.
   - `zyeth.work`, `www.zyeth.work`, `staging.zyeth.work`, findash, and
     photoshowcase are all unaffected — confirm each still serves normally
     after the reload.

   **Diagnostic signal for future debugging**: a `zyeth-admin-access.log`
   (or any Caddy access log) line reading `"msg":"NOP","status":0` means
   the reload wedged or failed and the block serving that log is not
   actually loaded — the empty response is the symptom, not the cause.
   Check `systemctl status caddy`'s `Status:` line for the actual
   config-load error (e.g. `permission denied` opening a log file, or a
   syntax error) rather than debugging the app or Cloudflare Access first.

The DNS record, the Access policy, and the actual `caddy reload` on the
droplet are **operator steps**, run outside this repo/CI. This repo only
carries the versioned Caddy block (`backend/deploy/caddy/admin.zyeth.work.caddy`)
that gets appended.

## Database + uploads backups (#35)

Daily `pg_dump` of the database plus a `tar` of the CV uploads directory,
with local retention. Runs as the `zyeth` OS user via cron, mirroring the
findash droplet's existing backup pattern (`findash-backup.sh` /
`/etc/cron.d/findash-backup`) but scoped to local backups only — off-site
sync (e.g. R2) is a future enhancement, not part of #35.

The script never hardcodes credentials: it sources `DATABASE_URL` and
`UPLOADS_DIR` from the same `/etc/zyeth-backend/<env>.env` file the systemd
unit uses (see § One-time provisioning above), so it fails loudly if either
is missing rather than falling back to a guessed connection string or path.

### 1. Install (one-time, per environment)

As root:

```sh
cp backend/deploy/backup/zyeth-backup.sh /usr/local/bin/
chmod 0755 /usr/local/bin/zyeth-backup.sh

cp backend/deploy/cron/zyeth-backup.cron /etc/cron.d/zyeth-backup
chmod 0644 /etc/cron.d/zyeth-backup
chown root:root /etc/cron.d/zyeth-backup
```

The cron file runs `staging` at 03:45 UTC — deliberately staggered 30
minutes off findash's 03:15 UTC dump to avoid IO contention on the shared
2-core/2GB droplet. Once `prod` is provisioned (its own DB role and its own
`/etc/zyeth-backend/prod.env`, per § Prod: intentionally deferred above),
uncomment the `@prod` line in the installed cron file.

### 2. Manual run

```sh
sudo -u zyeth /usr/local/bin/zyeth-backup.sh staging
```

Output and every prune action are appended to
`/srv/zyeth-backend/staging/backups/backup.log`. The backup dir itself
(`/srv/zyeth-backend/staging/backups/`) is created on first run with mode
`0750`, owned by `zyeth`.

### 3. Restore procedure (verifying a dump is actually restorable)

This is what makes the DoD's "restorable dumps" real — a dump that was
never test-restored is just an unverified file. As a host operator with
Postgres superuser access:

```sh
# Pick the dump to verify, e.g. the most recent:
DUMP=/srv/zyeth-backend/staging/backups/zyeth-staging-db-<timestamp>.sql.gz

# 1. Restore into a scratch DB — never the live staging DB.
createdb -U postgres zyeth_restore_check
gunzip -c "$DUMP" | psql -U postgres -d zyeth_restore_check

# 2. Sanity-check the restore — row counts on a couple of known tables,
#    e.g. talent applications and client leads:
psql -U postgres -d zyeth_restore_check -c "\dt"
psql -U postgres -d zyeth_restore_check -c "SELECT count(*) FROM talent_applications;"

# 3. Drop the scratch DB once satisfied:
dropdb -U postgres zyeth_restore_check
```

For the uploads archive, list its contents to confirm it's a valid,
non-empty tar (or a valid empty one, if uploads is currently empty):

```sh
tar -tzf /srv/zyeth-backend/staging/backups/zyeth-staging-uploads-<timestamp>.tar.gz
```

### 4. Retention

The script keeps the 14 most recent backups of **each** artifact type
(`zyeth-<env>-db-*.sql.gz` and `zyeth-<env>-uploads-*.tar.gz`), pruned
independently on every run — a quiet uploads dir doesn't cause DB dumps to
be pruned early or vice versa. `LOCAL_KEEP` is a variable at the top of
`zyeth-backup.sh` if the retention window needs to change later.

Prod backup is a one-liner once its env file exists: uncomment the `@prod`
line in the installed `/etc/cron.d/zyeth-backup` (no script changes
needed — the script already takes the environment as its first argument).

### 5. What's a CI step vs. an operator step

Everything above — installing the script/cron file on the droplet, running
a manual backup, and running the restore-verification procedure — is
**host-operator work**, done by hand outside this repo's CI, same category
as the rest of this runbook's one-time provisioning steps. This repo only
carries the versioned script, cron file, and this procedure.

## Env var contract (reminder)

The full contract — `DATABASE_URL`, `UPLOADS_DIR`, `MAX_CV_BYTES`,
`ALLOWED_ORIGINS`, plus adapter-level `PORT` / `HOST` — lives **only** in
the host's `/etc/zyeth-backend/<env>.env` file. It is never committed,
never a GitHub Actions secret, and never generated by CI. See
`backend/README.md` for what each variable does; see `.env.example` in
`backend/` for local dev.
