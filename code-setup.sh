#!/bin/bash
set -e

echo "🚀 Setting up NestJS + Next.js Monorepo..."

# ─── 1. Root init ────────────────────────────────────────────────
mkdir -p my-monorepo && cd my-monorepo

npm init -y

# Patch package.json with workspaces + scripts
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.private = true;
pkg.workspaces = ['apps/*', 'packages/*'];
pkg.scripts = {
  dev:    'turbo dev',
  build:  'turbo build',
  lint:   'turbo lint',
  test:   'turbo test',
  'test:e2e': 'turbo test:e2e'
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

# ─── 2. Turborepo ────────────────────────────────────────────────
npm install -D turbo

cat > turbo.json << 'JSON'
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "outputs": ["coverage/**"]
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "outputs": ["e2e-results/**"]
    }
  }
}
JSON

# ─── 3. Folder structure ─────────────────────────────────────────
mkdir -p apps packages

# ─── 4. Shared packages (manual, no extra package.json) ──────────

# packages/types
mkdir -p packages/types/src
cat > packages/types/src/index.ts << 'TS'
// Shared DTOs and interfaces between NestJS and Next.js

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}
TS

cat > packages/types/tsconfig.json << 'JSON'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
JSON

# packages/utils
mkdir -p packages/utils/src
cat > packages/utils/src/index.ts << 'TS'
// Shared utility functions

export const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date);

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export const slugify = (str: string): string =>
  str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

export const paginate = <T>(items: T[], page: number, limit: number) => {
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    total: items.length,
    page,
    limit,
  };
};
TS

cat > packages/utils/tsconfig.json << 'JSON'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
JSON

# ─── 5. Root tsconfig with path aliases ──────────────────────────
cat > tsconfig.base.json << 'JSON'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "paths": {
      "@shared/types": ["./packages/types/src/index.ts"],
      "@shared/utils": ["./packages/utils/src/index.ts"]
    }
  }
}
JSON

# ─── 6. NestJS API ───────────────────────────────────────────────
echo "📦 Scaffolding NestJS API..."
cd apps
npx @nestjs/cli new api --package-manager npm --skip-git --skip-install

# Change port to 4000
sed -i '' 's/await app.listen(3000)/await app.listen(process.env.PORT ?? 4000)/' api/src/main.ts 2>/dev/null || \
sed -i 's/await app.listen(3000)/await app.listen(process.env.PORT ?? 4000)/' api/src/main.ts

# Add e2e test folder for NestJS (already created by CLI, just ensure structure)
mkdir -p api/test

# Add .env for api
cat > api/.env << 'ENV'
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
JWT_SECRET=your-secret-key
ENV

cat > api/.env.example << 'ENV'
PORT=4000
NODE_ENV=development
DATABASE_URL=
JWT_SECRET=
ENV

# ─── 7. Next.js Web ──────────────────────────────────────────────
echo "📦 Scaffolding Next.js Web..."
npx create-next-app@latest web --typescript --eslint --tailwind --app --skip-install --no-git

# Fix stray pnpm-workspace.yaml if created
rm -f web/pnpm-workspace.yaml

# Fix next.config
cat > web/next.config.ts << 'TS'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    root: '../../',
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
}

export default nextConfig
TS

# Add .env for web
cat > web/.env.local << 'ENV'
NEXT_PUBLIC_API_URL=http://localhost:4000
ENV

cat > web/.env.example << 'ENV'
NEXT_PUBLIC_API_URL=
ENV

# ─── 8. E2E tests folder ─────────────────────────────────────────
cd ..
mkdir -p e2e/tests e2e/fixtures e2e/pages

cat > e2e/package.json << 'JSON'
{
  "name": "e2e",
  "private": true,
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  },
  "devDependencies": {
    "@playwright/test": "^1.44.0"
  }
}
JSON

cat > e2e/playwright.config.ts << 'TS'
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'npm run dev --workspace=apps/web',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev --workspace=apps/api',
      url: 'http://localhost:4000',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
TS

cat > e2e/tests/home.spec.ts << 'TS'
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/my app/i);
});

test('api health check', async ({ request }) => {
  const res = await request.get('http://localhost:4000/health');
  expect(res.ok()).toBeTruthy();
});
TS

cat > e2e/fixtures/users.ts << 'TS'
export const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
};
TS

# ─── 9. Root .gitignore ──────────────────────────────────────────
cat > .gitignore << 'GIT'
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
.next/
out/
build/

# Env files
.env
.env.local
.env.*.local
!.env.example

# Turbo
.turbo/

# Testing
coverage/
e2e-results/
playwright-report/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
GIT

# ─── 10. Root README ─────────────────────────────────────────────
cat > README.md << 'MD'
# My Monorepo

NestJS + Next.js monorepo powered by Turborepo.

## Apps
- `apps/api` — NestJS backend on :4000
- `apps/web` — Next.js frontend on :3000

## Packages
- `packages/types` — shared TypeScript interfaces/DTOs
- `packages/utils` — shared utility functions

## E2E
- `e2e/` — Playwright end-to-end tests

## Commands
```bash
npm run dev        # run all apps in parallel
npm run build      # build all apps
npm run test       # unit tests
npm run test:e2e   # e2e tests via Playwright
```

## Shared imports
```ts
import { User, ApiResponse } from '@shared/types'
import { slugify, formatDate } from '@shared/utils'
```
MD

# ─── 11. Install all deps from root ──────────────────────────────
echo "📦 Installing all dependencies..."
npm install

echo ""
echo "✅ Monorepo ready!"
echo ""
echo "   apps/api  → http://localhost:4000"
echo "   apps/web  → http://localhost:3000"
echo ""
echo "   npm run dev        → start both apps"
echo "   npm run test:e2e   → run Playwright tests"
