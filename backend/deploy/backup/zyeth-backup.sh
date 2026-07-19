#!/usr/bin/env bash
# zyeth-backup.sh — daily pg_dump + uploads tar, with local retention (#35).
#
# Designed to run as the `zyeth` OS user (system user, nologin, member of
# group `zyeth`), which can read the env file it sources for credentials.
#
# Install path (see backend/deploy/README.md § Database + uploads backups):
#   /usr/local/bin/zyeth-backup.sh
# Scheduled via:
#   /etc/cron.d/zyeth-backup (backend/deploy/cron/zyeth-backup.cron)
#
# Usage:
#   sudo -u zyeth /usr/local/bin/zyeth-backup.sh [staging|prod]   # default: staging
#
# Local retention: 14 most recent of EACH artifact type (DB dump, uploads
# tar), pruned independently, under /srv/zyeth-backend/<env>/backups/.
#
# Off-site sync (e.g. to R2, mirroring findash's weekly sync) is out of
# scope for #35 — local backups + retention only. Future enhancement.
#
set -euo pipefail

ENV="${1:-staging}"
ENV_FILE="/etc/zyeth-backend/${ENV}.env"
BACKUP_DIR="/srv/zyeth-backend/${ENV}/backups"
LOG_FILE="/srv/zyeth-backend/${ENV}/backups/backup.log"
TIMESTAMP="$(date +%Y%m%dT%H%M)"
DB_DUMP_FILE="$BACKUP_DIR/zyeth-${ENV}-db-${TIMESTAMP}.sql.gz"
UPLOADS_TAR_FILE="$BACKUP_DIR/zyeth-${ENV}-uploads-${TIMESTAMP}.tar.gz"
LOCAL_KEEP=14

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" | tee -a "$LOG_FILE"
}

# ---------------------------------------------------------------------------
# Sanity checks
# ---------------------------------------------------------------------------
if [[ "$(id -un)" != "zyeth" ]]; then
  printf 'ERROR: must run as zyeth user (current: %s)\n' "$(id -un)" >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  printf 'ERROR: env file not found: %s\n' "$ENV_FILE" >&2
  exit 1
fi

# Credentials and paths are never hardcoded here — sourced from the host's
# env file, same contract as the systemd unit's EnvironmentFile=.
# shellcheck source=/dev/null
. "$ENV_FILE"

if [[ -z "${DATABASE_URL:-}" ]]; then
  printf 'ERROR: DATABASE_URL not set in %s\n' "$ENV_FILE" >&2
  exit 1
fi

if [[ -z "${UPLOADS_DIR:-}" ]]; then
  printf 'ERROR: UPLOADS_DIR not set in %s\n' "$ENV_FILE" >&2
  exit 1
fi

install -d -m 0750 "$BACKUP_DIR"

# ---------------------------------------------------------------------------
# Database dump
# ---------------------------------------------------------------------------
log "backup: starting db dump to $DB_DUMP_FILE"
if pg_dump "$DATABASE_URL" | gzip -9 >"$DB_DUMP_FILE"; then
  SIZE="$(du -sh "$DB_DUMP_FILE" | cut -f1)"
  log "backup: db dump complete — $SIZE"
else
  log "ERROR: pg_dump failed — aborting"
  exit 1
fi

# Prune to LOCAL_KEEP most recent db dumps
log "backup: pruning db dumps (keep $LOCAL_KEEP)"
# shellcheck disable=SC2012
ls -1t "$BACKUP_DIR"/zyeth-"${ENV}"-db-*.sql.gz 2>/dev/null | tail -n +$((LOCAL_KEEP + 1)) | while read -r old; do
  rm -f "$old"
  log "backup: pruned db dump $old"
done

# ---------------------------------------------------------------------------
# Uploads archive
# ---------------------------------------------------------------------------
log "backup: starting uploads tar to $UPLOADS_TAR_FILE"
if [[ ! -d "$UPLOADS_DIR" ]]; then
  log "ERROR: UPLOADS_DIR does not exist: $UPLOADS_DIR"
  exit 1
fi

# -C into the parent dir + tar the basename so restores extract a clean
# top-level "uploads/" dir. Works fine on an empty dir — tar still produces
# a valid (empty) archive rather than failing.
if tar -czf "$UPLOADS_TAR_FILE" -C "$(dirname "$UPLOADS_DIR")" "$(basename "$UPLOADS_DIR")"; then
  SIZE="$(du -sh "$UPLOADS_TAR_FILE" | cut -f1)"
  log "backup: uploads tar complete — $SIZE"
else
  log "ERROR: uploads tar failed — aborting"
  exit 1
fi

# Prune to LOCAL_KEEP most recent uploads tars
log "backup: pruning uploads tars (keep $LOCAL_KEEP)"
# shellcheck disable=SC2012
ls -1t "$BACKUP_DIR"/zyeth-"${ENV}"-uploads-*.tar.gz 2>/dev/null | tail -n +$((LOCAL_KEEP + 1)) | while read -r old; do
  rm -f "$old"
  log "backup: pruned uploads tar $old"
done

log "backup: done"
