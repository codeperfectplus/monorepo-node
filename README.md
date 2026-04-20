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
```

## Shared imports
```ts
import { User, ApiResponse } from '@shared/types'
import { slugify, formatDate } from '@shared/utils'
```
