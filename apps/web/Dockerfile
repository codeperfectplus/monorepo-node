# Dockerfile for Web (Next.js)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY packages/types/package*.json ./packages/types/
COPY packages/utils/package*.json ./packages/utils/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the monorepo
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy the standalone build
COPY --from=builder /app/apps/web/.next/standalone ./apps/web/
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "apps/web/server.js"]