#!/bin/sh
set -e
DB_FILE="${DB_PATH:-/app/data/kasihub.db}"
if [ ! -f "$DB_FILE" ]; then
  echo "🌱 First run — seeding KasiHub database..."
  DB_PATH="$DB_FILE" node backend/src/db/seed.js
  echo "✅ Database seeded"
fi
exec "$@"
