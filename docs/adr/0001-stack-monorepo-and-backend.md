# ADR 0001 — Tech stack, monorepo, and backend architecture

- **Status:** Accepted
- **Date:** 2026-06-29
- **Deciders:** Project owner + engineering

## Context
We are building a fitness platform (mobile-first) covering exercises (gym/home), yoga, and nutrition, with later AI features (food scan, pose/form coaching). We want to ship an audience-testable MVP fast, open-source-first, while keeping the system scalable and maintainable.

## Decision
1. **Monorepo** with pnpm workspaces + Turborepo: `apps/*` (deployables) and `packages/*` (shared code).
2. **Mobile:** Expo (React Native) + TypeScript — the primary client.
3. **Web:** React + Vite (deferred to Phase 5).
4. **Backend:** Node.js (LTS) + **NestJS as a modular monolith**, organized by feature/domain with a strict `API → Service → Repository → DB` layering and dependency injection. PostgreSQL + Prisma (migrations, indexed FKs, pooled connections).
5. **AI/ML:** a separate **Python FastAPI microservice**, introduced only in Phase 3 (food scan) — the first justified service split (different runtime + scaling profile). It syncs with the API via an explicit HTTP/OpenAPI contract, not shared TS types.
6. **Shared contracts:** `@fit/shared-types` (zod schemas + inferred types), compiled and consumed via `workspace:*` by mobile/web/api — one source of truth, validation at boundaries.
7. **API:** REST, versioned from day one (`/api/v1`), consistent error envelope `{ code, message, details }`, pagination on all list endpoints.

## Consequences
- One language (TypeScript) across mobile/web/api early → faster iteration, fewer contract bugs.
- Modular monolith avoids premature distributed-systems complexity; clean module seams allow extraction later.
- The ML split is deliberate and isolated; the monolith stays the default until a module proves it needs independence.
- Shared types are a build-time concern (compiled), avoiding Metro/Expo issues with raw TS in `node_modules`.

## References
- `plan/01-tech-stack.md`, `plan/02-architecture.md`, `plan/12-monorepo-and-shared-types.md`
