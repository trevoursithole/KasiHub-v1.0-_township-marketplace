#!/bin/sh
set -e

DB_FILE="${DB_PATH:-/data/kasihub.db}"

if [ ! -f "$DB_FILE" ]; then
  echo "🌱 First boot — seeding database..."
  node backend/src/db/seed.js
  echo "✅ Database ready"
else
  echo "✅ Database exists — skipping seed"
fi

exec "$@"
