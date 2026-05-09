#!/bin/sh
set -e

DB_FILE="${DB_PATH:-/data/kasihub.db}"

# Seed the database on first boot
if [ ! -f "$DB_FILE" ]; then
  echo "🌱  First boot — seeding database..."
  NODE_ENV=production node backend/src/db/seed.js
  echo "✅  Database ready"
else
  echo "✅  Database exists — skipping seed"
fi

exec "$@"
