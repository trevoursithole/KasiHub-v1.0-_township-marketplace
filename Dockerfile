FROM node:22-alpine AS builder

WORKDIR /app

# Install frontend deps and build
COPY frontend/package*.json ./frontend/
RUN npm ci --prefix frontend

COPY frontend/ ./frontend/
RUN npm run build --prefix frontend

# ---- Production image ----
FROM node:22-alpine AS production

WORKDIR /app

# Install backend deps
COPY backend/package*.json ./backend/
RUN npm ci --prefix backend --omit=dev

# Copy backend source
COPY backend/src/ ./backend/src/
COPY backend/.env.example ./backend/.env

# Copy built frontend into backend's expected path
COPY --from=builder /app/frontend/dist ./frontend/dist

# Create uploads dir
RUN mkdir -p ./backend/uploads

# Seed on first run via entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 4000
ENV NODE_ENV=production
ENV PORT=4000
ENV DB_PATH=/app/data/kasihub.db

VOLUME ["/app/data", "/app/backend/uploads"]

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "backend/src/server.js"]
