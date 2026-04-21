# Dockerfile for API (NestJS)
FROM node:20-slim AS builder

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

# Build API workspace only
RUN npm run build:api

# Production stage
FROM node:20-slim AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "run", "start:prod", "--workspace=api"]