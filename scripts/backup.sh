#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# backup.sh — Backup PostgreSQL vers fichier local (+ optionnel : GPG + Minio)
# Usage : bash scripts/backup.sh
# Variables requises : DATABASE_BACKUP_URL
# Variables optionnelles : BACKUP_GPG_PASSPHRASE, MINIO_ENDPOINT, MINIO_BUCKET,
#                          MINIO_ACCESS_KEY, MINIO_SECRET_KEY, ADMIN_EMAIL
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-/backups}"
FILENAME="veille_elite_${TIMESTAMP}.sql.gz"
FILEPATH="${BACKUP_DIR}/${FILENAME}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
START_TIME=$(date +%s)

# ─── Vérifications préalables ────────────────────────────────────────────────

if [ -z "${DATABASE_BACKUP_URL:-}" ]; then
  echo "ERROR: DATABASE_BACKUP_URL non définie" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

# ─── pg_dump + gzip ──────────────────────────────────────────────────────────

echo "[backup] Démarrage — ${TIMESTAMP}"
pg_dump "$DATABASE_BACKUP_URL" | gzip > "$FILEPATH"
BACKUP_SIZE=$(du -sh "$FILEPATH" | cut -f1)
echo "[backup] Dump compressé : ${FILEPATH} (${BACKUP_SIZE})"

# ─── Chiffrement GPG (optionnel) ─────────────────────────────────────────────

if [ -n "${BACKUP_GPG_PASSPHRASE:-}" ]; then
  gpg --symmetric --batch --yes \
    --passphrase "$BACKUP_GPG_PASSPHRASE" \
    --output "${FILEPATH}.gpg" \
    "$FILEPATH"
  rm "$FILEPATH"
  FILEPATH="${FILEPATH}.gpg"
  FILENAME="${FILENAME}.gpg"
  echo "[backup] Fichier chiffré : ${FILEPATH}"
fi

# ─── Upload Minio (optionnel) ─────────────────────────────────────────────────

if [ -n "${MINIO_ENDPOINT:-}" ] && [ -n "${MINIO_BUCKET:-}" ]; then
  mc alias set backup "${MINIO_ENDPOINT}" "${MINIO_ACCESS_KEY}" "${MINIO_SECRET_KEY}" --quiet 2>/dev/null || true
  mc cp "$FILEPATH" "backup/${MINIO_BUCKET}/${FILENAME}"
  echo "[backup] Uploadé vers Minio : ${MINIO_BUCKET}/${FILENAME}"
fi

# ─── Nettoyage des anciens backups ────────────────────────────────────────────

DELETED=$(find "$BACKUP_DIR" -name "veille_elite_*.sql.gz*" -mtime "+${RETENTION_DAYS}" -delete -print | wc -l)
echo "[backup] Supprimé ${DELETED} fichier(s) de plus de ${RETENTION_DAYS} jours"

# ─── Rapport final ────────────────────────────────────────────────────────────

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
echo "[backup] Terminé en ${DURATION}s — ${BACKUP_SIZE}"
