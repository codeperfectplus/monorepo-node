# ---------- BUILDER ----------
FROM node:20-slim AS builder
WORKDIR /app

# Install deps (for building TS)
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY packages/types/package*.json ./packages/types/
COPY packages/utils/package*.json ./packages/utils/
COPY packages/database/package*.json ./packages/database/
RUN npm install

# Copy source
COPY . .

# Build only API
RUN npm run build:api

# ---------- PRODUCTION ----------
FROM node:20-slim AS production
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/database/package*.json ./packages/database/

RUN npm ci

# Copy built outputs
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma

# Generate Prisma client
RUN npm exec --workspace=packages/database prisma generate

RUN npm prune --omit=dev

EXPOSE 4000
CMD ["npm", "run", "start:prod", "--workspace=api"]