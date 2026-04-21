# My Monorepo

NestJS + Next.js monorepo powered by Turborepo.

## Apps
- `apps/api` — NestJS backend on :8000
- `apps/web` — Next.js frontend on :3000

## Packages
- `packages/types` — shared TypeScript interfaces/DTOs
- `packages/utils` — shared utility functions

## Commands
```bash
npm run dev        # run all apps in parallel
npm run build      # build all apps
npm run test       # unit tests
npm run db:up      # start local Postgres on :51214
npm run db:down    # stop local Postgres
```

## Environment setup
Use one env file at the repo root: [ .env ](./.env).

- API reads from root env via [apps/api/src/app.module.ts](apps/api/src/app.module.ts#L12).
- Web loads root env in [apps/web/next.config.ts](apps/web/next.config.ts#L4).
- Prisma scripts load root env from [packages/database/package.json](packages/database/package.json#L16).

Key local values:

- NODE_ENV=development
- PORT=8000
- FRONTEND_URL=http://localhost:3000
- NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8000
- DATABASE_URL=postgresql://postgres:postgres@localhost:51214/postgres

## Shared imports
```ts
import { User, ApiResponse } from '@shared/types'
import { slugify, formatDate } from '@shared/utils'
```
