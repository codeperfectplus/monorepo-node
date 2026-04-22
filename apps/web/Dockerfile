# Dockerfile for Web (Next.js)
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY packages/types/package*.json ./packages/types/
COPY packages/utils/package*.json ./packages/utils/

# Install dependencies and explicitly install the platform-specific lightningcss native binary
RUN npm install --include=optional && \
	ARCH="$(uname -m)" && \
	if [ "$ARCH" = "aarch64" ]; then ARCH_TAG="arm64"; else ARCH_TAG="x64"; fi && \
	if ldd --version 2>&1 | grep -qi musl; then LIBC_TAG="musl"; else LIBC_TAG="gnu"; fi && \
	LC_VER="$(node -p "require('./node_modules/lightningcss/package.json').version")" && \
	OX_VER="$(node -p "require('./node_modules/@tailwindcss/oxide/package.json').version")" && \
	npm install --no-save "lightningcss-linux-${ARCH_TAG}-${LIBC_TAG}@${LC_VER}" "@tailwindcss/oxide-linux-${ARCH_TAG}-${LIBC_TAG}@${OX_VER}" && \
	npm rebuild lightningcss

# Force Next.js package-manager detection to fall back to npm
# (Next checks app-local lockfiles and otherwise probes yarn/pnpm binaries).
RUN rm -f /usr/local/bin/yarn /usr/local/bin/yarnpkg /usr/local/bin/pnpm || true

# Copy source code
COPY . .

# Build web workspace only
RUN npm run build:web

# Production stage
FROM node:20-slim AS production

WORKDIR /app

# Copy the standalone build (which includes server.js and node_modules)
COPY --from=builder /app/apps/web/.next/standalone .
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "apps/web/server.js", "--port", "3000"]