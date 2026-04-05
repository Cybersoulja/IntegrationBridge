# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start development server (Express + Vite HMR on port 5000)
npm run dev

# Type-check the entire project (no emit)
npm run check

# Build for production (Vite client → dist/public, esbuild server → dist/index.js)
npm run build

# Run production build
npm start

# Push database schema changes to PostgreSQL
npm run db:push
```

There are no dedicated test or lint scripts — `npm run check` (TypeScript) is the primary validation step.

## Architecture

IntegrationBridge is a full-stack TypeScript web app that bridges and manages multiple iOS/Mac development tool integrations (Working Copy, Shellfish, Textastic) with health monitoring.

### Frontend (`client/`)
React 18 + Vite, with [Wouter](https://github.com/molefrog/wouter) for routing and TanStack React Query for server state. UI is built on shadcn/ui (Radix UI primitives + Tailwind). The app has three routes: `/auth` (login/register), `/` (dashboard), and a 404 fallback.

- `client/src/App.tsx` — router and auth-protected route guard
- `client/src/lib/queryClient.ts` — React Query client config; API calls use `apiRequest()` which handles 401s and throws on non-ok responses
- `client/src/hooks/use-user.ts` — primary auth hook used throughout the app

### Backend (`server/`)
Express.js server that also serves the Vite dev middleware in development. All API routes are under `/api` and protected by rate limiting (100 req/min per IP).

- `server/index.ts` — server bootstrap, middleware registration, global error handler
- `server/routes.ts` — registers all service routers
- `server/auth.ts` — Passport.js local strategy, session management, `/api/login`, `/api/logout`, `/api/register`, `/api/user` endpoints
- `server/services/working-copy.ts` — file read/write operations
- `server/services/shellfish.ts` — whitelisted shell command execution (`ls`, `cat`, `grep`, etc.)
- `server/services/textastic.ts` — text editor integration with syntax detection
- `server/services/monitor.ts` — service health status tracking

### Database (`db/`)
PostgreSQL via Drizzle ORM. Schema is defined in `db/schema.ts` (tables: `users`, `serviceConnections`, `apiLogs`, `webhooks`, `fileOperations`). Use `npm run db:push` to sync schema — do not edit migration files manually.

### HuggingFace Integration (`huggingface_integration/`)
A standalone Python module (separate from the Node app). Requires its own `.env` with `HF_API_KEY`. See `huggingface_integration/README.md` for setup.

## Environment

The server requires `DATABASE_URL` (PostgreSQL connection string). Session secret falls back to `REPL_ID` or `"porygon-supremacy"`. This project is configured for Replit deployment (see `.replit`) targeting Google Cloud Run.

## Auth

Passwords are hashed with Node's `scrypt` (256-byte output). Sessions use `express-session` with an in-memory store. In production, session cookies use `sameSite: none` + `secure: true`; in development, `sameSite: lax`.
