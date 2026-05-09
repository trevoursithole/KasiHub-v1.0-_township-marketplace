# ── Stage 1: Build React frontend ────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN npm install --prefix frontend --silent

COPY frontend/ ./frontend/
RUN npm run build --prefix frontend

# ── Stage 2: Production server ────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

# Backend deps (production only)
COPY backend/package*.json ./backend/
RUN npm install --prefix backend --omit=dev --silent

# Backend source
COPY backend/src/ ./backend/src/

# Built frontend
COPY --from=builder /app/frontend/dist ./frontend/dist

# Persistent data dir
RUN mkdir -p /data ./backend/uploads

# Entrypoint seeds DB on first boot
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# ── Runtime env vars ──────────────────────────────────────────────────
# JWT_SECRET must be set via: docker run -e JWT_SECRET=... 
# or in docker-compose.yml / platform dashboard
ENV NODE_ENV=production
ENV PORT=4000
ENV DB_PATH=/data/kasihub.db

EXPOSE 4000

VOLUME ["/data", "/app/backend/uploads"]

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "backend/src/server.js"]
