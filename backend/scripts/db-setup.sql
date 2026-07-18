-- Zyeth backend — dedicated Postgres role + database provisioning.
--
-- CRITICAL: the droplet's Postgres instance is SHARED with other projects
-- (e.g. findash). This script ONLY creates/touches the zyeth-owned role and
-- database below. It never references, drops, or grants access to any other
-- project's role or database.
--
-- Staging and prod MUST use separate databases + separate role passwords.
-- Run this script once per environment, passing different variables, e.g.:
--
--   sudo -u postgres psql \
--     -v role_name=zyeth_app_staging \
--     -v db_name=zyeth_staging \
--     -v role_password=REPLACE_WITH_STRONG_STAGING_PASSWORD \
--     -f db-setup.sql
--
--   sudo -u postgres psql \
--     -v role_name=zyeth_app_prod \
--     -v db_name=zyeth_prod \
--     -v role_password=REPLACE_WITH_STRONG_PROD_PASSWORD \
--     -f db-setup.sql
--
-- If no -v overrides are given, it falls back to role_name=zyeth_app,
-- db_name=zyeth, role_password='CHANGEME' — fine for a local/throwaway run,
-- NEVER for staging or prod. Generate real passwords with e.g.
-- `openssl rand -base64 32` and store them in the per-env `.env` only
-- (never commit them).
--
-- Idempotent: safe to re-run. Must be run by a Postgres superuser
-- (e.g. `sudo -u postgres psql -f db-setup.sql`).

-- Defaults, only applied when the caller didn't pass -v overrides.
\if :{?role_name}
\else
\set role_name zyeth_app
\endif

\if :{?db_name}
\else
\set db_name zyeth
\endif

\if :{?role_password}
\else
\set role_password CHANGEME
\endif

-- 1. Dedicated least-privilege login role (idempotent — CREATE ROLE has no
--    IF NOT EXISTS in Postgres, so we branch via \gexec instead of a
--    DO $$ ... $$ block: psql does NOT substitute :variables inside
--    dollar-quoted text, so plpgsql-side substitution silently fails).
SELECT format(
    'CREATE ROLE %I LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE',
    :'role_name', :'role_password'
  )
WHERE NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = :'role_name')
\gexec

-- Role already exists (e.g. re-run to rotate the password) — update it.
SELECT format('ALTER ROLE %I LOGIN PASSWORD %L', :'role_name', :'role_password')
WHERE EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = :'role_name')
\gexec

-- 2. Dedicated database owned by that role (CREATE DATABASE cannot run
--    inside a DO block / transaction, so use \gexec to run it conditionally).
SELECT format('CREATE DATABASE %I OWNER %I', :'db_name', :'role_name')
WHERE NOT EXISTS (SELECT FROM pg_catalog.pg_database WHERE datname = :'db_name')
\gexec

-- 3. Lock down the database to only this role: revoke the default public
--    CONNECT grant, then grant CONNECT + schema usage to the dedicated role
--    only. This matters because the instance is shared with other projects.
SELECT format('REVOKE ALL ON DATABASE %I FROM PUBLIC', :'db_name') \gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO %I', :'db_name', :'role_name') \gexec

-- Everything from here on needs to run inside the target database.
\connect :db_name

REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA public TO :"role_name";

-- Table/sequence privileges for tables the app creates via migrations
-- (owned by :role_name since it owns the DB, but be explicit + future-proof
-- in case migrations are ever run by a different superuser account).
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"role_name";
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO :"role_name";

-- Cover tables/sequences that may already exist from a prior run.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO :"role_name";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO :"role_name";

\echo 'Done. Role and database ready. Set DATABASE_URL to:'
\echo '  postgresql://<role_name>:<password>@127.0.0.1:5432/<db_name>'
