# Fitness App

A platform that helps people **exercise correctly** (gym / home / yoga) and **eat right**, built open-source-first. Mobile app first.

> Product & delivery plan lives in [`plan/`](plan/). Start with [`plan/README.md`](plan/README.md); track progress in [`plan/13-task-tracker.md`](plan/13-task-tracker.md).

## Monorepo layout

```
apps/
  mobile          Expo (React Native) — primary client            (Phase 0/1)
  web             React + Vite                                    (Phase 5)
  api             NestJS — modular monolith, API → Service → Repo  (Phase 0)
  ml              FastAPI (Python) — food scan / pose             (Phase 3+)
packages/
  shared-types    zod schemas + inferred TS types (one contract)
  config          shared tsconfig / prettier presets
docs/adr/         Architecture Decision Records
plan/             product & delivery planning docs
```

Tooling: **pnpm workspaces + Turborepo**. Shared types are compiled and consumed via `workspace:*` — see [`plan/12-monorepo-and-shared-types.md`](plan/12-monorepo-and-shared-types.md).

## Prerequisites

- Node.js **20.19 LTS** (see `.nvmrc`)
- pnpm **10+**
- Docker + Docker Compose (for Postgres + MinIO, added in Phase 0)

## Setup

```bash
# 1. Use the pinned Node version
nvm use            # or install Node 20.19 manually

# 2. Install dependencies (workspaces are linked automatically)
pnpm install

# 3. Configure environment
cp .env.example .env   # then fill in local values
```

## Common commands

```bash
pnpm build         # build all packages/apps (Turborepo, dependency-ordered)
pnpm dev           # run dev tasks
pnpm lint          # lint all workspaces
pnpm typecheck     # type-check all workspaces
pnpm test          # run tests
pnpm format        # prettier write
```

Run one workspace: `pnpm --filter @fit/shared-types build`.

## Testing

Test pyramid (unit-heavy). Tests are **co-located** with source (`*.test.ts`). Business logic targets ≥80% coverage; critical paths 100%.

## Environment

All configuration is env-based and validated at boot. `.env.example` documents every variable; **real secrets never go in source**. See [`.env.example`](.env.example).

## Status

Pre–Phase 0 → **Phase 0 (foundation)**. Current focus and the next task are always in [`plan/13-task-tracker.md`](plan/13-task-tracker.md).

## Conventions

- Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`)
- Architecture decisions recorded in [`docs/adr/`](docs/adr/)
- Engineering guidelines: [`instructions/claude.md`](instructions/claude.md)
