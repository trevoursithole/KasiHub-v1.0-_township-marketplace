# ── Stage 1: Build frontend ───────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN npm install --prefix frontend --silent

COPY frontend/ ./frontend/
RUN npm run build --prefix frontend

# ── Stage 2: Production image ─────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

COPY backend/package*.json ./backend/
RUN npm install --prefix backend --omit=dev --silent

COPY backend/src/ ./backend/src/
COPY backend/.env.example ./backend/.env

COPY --from=builder /app/frontend/dist ./frontend/dist

RUN mkdir -p /data ./backend/uploads

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=4000
ENV DB_PATH=/data/kasihub.db

EXPOSE 4000

VOLUME ["/data", "/app/backend/uploads"]

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "backend/src/server.js"]
