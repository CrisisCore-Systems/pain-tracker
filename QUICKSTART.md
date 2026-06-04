# Quick Start

This is the short local setup path for Pain Tracker. For the deeper user-facing install guide, see [docs/user-guide/INSTALL.md](docs/user-guide/INSTALL.md). For routine developer commands, see [docs/engineering/DEVELOPER_COMMANDS.md](docs/engineering/DEVELOPER_COMMANDS.md).

## Requirements

- Node `>=22.12.0 <23`
- npm `>=9`
- PowerShell on Windows

## Run The Core App

```powershell
npm ci
npm run dev
```

Open the Vite URL shown in the terminal. The core app stores entries locally by default and does not require a database, account, payment service, or remote API for local tracking.

## Optional Local API

Some clinic, weather, payment, and server-style integration paths are backed by Vercel-style API functions. These are not required for core local tracking.

```powershell
# Terminal 1
npm run dev

# Terminal 2
npm run dev:api
```

The Vite dev server proxies `/api` requests to the local API server when configured.

## Optional Database

Database setup is only needed when testing server-side or clinic-auth paths.

```powershell
psql -U postgres -c "CREATE DATABASE paintracker;"
psql -U postgres -d paintracker -f database/schema.sql
psql -U postgres -d paintracker -c "\dt"
```

Minimal local environment shape:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/paintracker
NODE_ENV=development
```

Use [.env.example](.env.example) for non-secret configuration shape. Do not commit `.env`, `.env.local`, API keys, webhook secrets, database credentials, or user data.

## Verification

```powershell
npm run docs:validate
npm run check:quick
npm run build
```

Focused commands:

```powershell
npm run typecheck:ci
npm run test
npm run test:seo
npm run accessibility:scan
npm run security-full
```

## Production Build

The main app and public web/blog surface are separate build surfaces:

```powershell
npm run build
npm run build:vercel
```

`npm run build` generates the Vite app and prerendered public routes. `npm run build:vercel` builds packages, builds/copies the PWA app, then builds `packages/blog`.

## Success Criteria

- Core app loads locally.
- A pain entry can be created without network-dependent services.
- Export paths remain user-controlled.
- Optional API paths fail independently from core local tracking.
- Documentation and claim validation pass before broad release work.
