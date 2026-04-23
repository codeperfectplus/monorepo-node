# My Monorepo

NestJS + Next.js monorepo powered by Turborepo, with shared Prisma database tooling and shared packages.

## What is in this project

- Backend API: [apps/api](apps/api)
- Frontend app: [apps/web](apps/web)
- Shared Prisma package: [packages/database](packages/database)
- Shared types: [packages/types](packages/types)
- Shared utilities: [packages/utils](packages/utils)

## Folder structure

```text
apps/
	api/                    # NestJS API
		src/
			modules/
				auth/             # signup/login/refresh logic
				prisma/           # Prisma service wrapper
	web/                    # Next.js app (App Router)
		app/
			login/
			signup/

packages/
	database/               # Prisma schema, migrations, client export
		prisma/
			schema.prisma
			migrations/
	types/                  # Shared TS types
	utils/                  # Shared helper functions
```

## How things work

### Runtime flow

1. Browser opens [apps/web/app/signup/page.tsx](apps/web/app/signup/page.tsx) or [apps/web/app/login/page.tsx](apps/web/app/login/page.tsx).
2. Web app calls API directly using BACKEND_API_URL.
3. API handles auth in [apps/api/src/modules/auth/auth.controller.ts](apps/api/src/modules/auth/auth.controller.ts) and [apps/api/src/modules/auth/auth.service.ts](apps/api/src/modules/auth/auth.service.ts).
4. API uses Prisma via [apps/api/src/modules/prisma/prisma.service.ts](apps/api/src/modules/prisma/prisma.service.ts), backed by schema in [packages/database/prisma/schema.prisma](packages/database/prisma/schema.prisma).

### Auth behavior

- Login and signup responses return both accessToken and refreshToken.
- Refresh token is also set as httpOnly cookie.
- Refresh token is stored in DB as hash (refreshTokenHash + refreshTokenExpiresAt) in users table.

## Environment setup

This repo uses a single env file at root: [.env](.env).

- API reads env via [apps/api/src/app.module.ts](apps/api/src/app.module.ts#L12).
- Web reads env via [apps/web/next.config.ts](apps/web/next.config.ts#L4).
- Prisma scripts read env via [packages/database/package.json](packages/database/package.json#L16).

Required keys in [.env](.env):

- NODE_ENV=development
- PORT=8000
- FRONTEND_URL=http://localhost:3000
- BACKEND_API_URL=http://localhost:8000/api/v1
- DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
- JWT_ACCESS_SECRET=...
- JWT_ACCESS_EXPIRES_IN=15m
- JWT_REFRESH_SECRET=...
- JWT_REFRESH_EXPIRES_IN=7d

## Local setup process

1. Install dependencies.

```bash
npm install
```

2. Ensure [.env](.env) exists and is filled.

3. Start local Postgres on port 5432.

```bash
npm run db:up
```

4. Validate Prisma configuration.

```bash
npm run db:validate
```

5. Start both apps.

```bash
npm run dev
```

6. Open apps.

- Web: http://localhost:3000
- API health: http://localhost:8000/api/v1/health

## Database and migrations workflow

Prisma is managed in [packages/database](packages/database).

- Schema: [packages/database/prisma/schema.prisma](packages/database/prisma/schema.prisma)
- Baseline migration: [packages/database/prisma/migrations/20260421134859_baseline_init/migration.sql](packages/database/prisma/migrations/20260421134859_baseline_init/migration.sql)

Use this workflow for schema changes:

1. Edit schema.prisma.
2. Create migration.

```bash
npm run db:migrate:dev -- --name your_change_name
```

3. Commit migration files in prisma/migrations.
4. Deploy migrations in CI/prod.

```bash
npm run db:migrate:deploy
```

Useful DB commands:

- npm run db:generate
- npm run db:studio
- npm run db:format
- npm run db:validate
- npm run db:up
- npm run db:down

## Root scripts

- npm run dev: run all apps in parallel
- npm run build: build all workspaces
- npm run lint: run lint across workspaces
- npm run test: run test tasks
- npm run test:e2e: run e2e tasks

## Troubleshooting

- API says cannot reach database:
	- Run npm run db:up
	- Check docker container my-monorepo-postgres is running
	- Confirm DATABASE_URL in [.env](.env)

- Migrations look out of sync:
	- Run npm run db:validate
	- Run npm run db:migrate:deploy
