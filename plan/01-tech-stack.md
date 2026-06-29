# 01 — Tech Stack

> Principle: stable/LTS versions only. Pin exact versions at install time and verify the current stable release before locking — version numbers below are the intended *lines*, confirm latest patch when scaffolding.

## Mobile (primary target)
| Concern | Choice | Why |
|--------|--------|-----|
| Framework | **Expo (React Native)** | Fastest cross-platform path, OTA updates, huge ecosystem |
| Language | **TypeScript (strict)** | Type safety, shared types with web/backend |
| Navigation | **expo-router** | File-based routing, deep links |
| State/data | **TanStack Query** + Zustand | Server cache + light client state |
| 3D rendering | **three.js + @react-three/fiber + drei** (via `expo-gl`) | Render the animated mannequin |
| Forms/validation | **react-hook-form + zod** | Shared zod schemas with backend |
| Storage | **expo-secure-store** (tokens), AsyncStorage (cache) | |

## Web UI
| Concern | Choice | Why |
|--------|--------|-----|
| Framework | **React + Vite** | Fast dev/build; CRA is deprecated — do not use it |
| Language | TypeScript (strict) | |
| Styling | Tailwind CSS | Utility-first, no global pollution |
| 3D | three.js + @react-three/fiber | Same mannequin code path as mobile |
| Data | TanStack Query | Shared patterns with mobile |

## Backend
| Concern | Choice | Why |
|--------|--------|-----|
| API | **Node.js (LTS) + NestJS** | Structured, modular, DI, scales to microservices cleanly |
| Language | TypeScript | One language across the stack early |
| ORM | **Prisma** | Type-safe DB access, migrations |
| Validation | **zod / class-validator** | Reuse zod schemas from frontend |
| Auth | JWT (access + refresh), bcrypt/argon2 | Standard, self-hostable |
| API style | **REST** (OpenAPI documented) | Simple; revisit GraphQL only if client needs it |

## AI/ML service (added in Phase 3+)
| Concern | Choice | Why |
|--------|--------|-----|
| Service | **Python + FastAPI** microservice | ML ecosystem lives in Python |
| Food image | open vision models / nutrition APIs | Phase 3 |
| Pose/form | **MediaPipe Pose / MoveNet (TensorFlow)** | Phase 4, runs on-device or server |

## Data & infra
| Concern | Choice |
|--------|--------|
| Primary DB | **PostgreSQL** |
| Cache/queue | Redis (when needed) |
| Object storage | S3-compatible (MinIO self-host → S3 in prod) for media/3D assets |
| Containerization | Docker + docker-compose (dev), later Kubernetes if scale demands |
| CI/CD | GitHub Actions; Expo EAS for mobile builds |

## Monorepo
Use a single repo with workspaces (pnpm or npm workspaces / Turborepo):

```
/apps
  /mobile        (Expo)
  /web           (React + Vite)
  /api           (NestJS)
  /ml            (FastAPI, Phase 3+)
/packages
  /shared-types  (zod schemas + TS types shared everywhere)
  /ui            (shared design tokens, optional)
/plan            (these docs)
```

Benefit: **shared TypeScript types and zod validation** between mobile, web, and API — fewer bugs, faster iteration.

> Build mechanics — how shared types are compiled and consumed (`workspace:*`), tooling (pnpm + Turborepo), the Metro gotcha, and per-service hosting — are detailed in `12-monorepo-and-shared-types.md`.

## Version targets (confirm latest stable at setup)
- Node.js: current **LTS** (e.g. 22.x line)
- Expo SDK: latest **stable** SDK
- React: 18+ stable
- NestJS: latest stable
- PostgreSQL: 16+
- Prisma: latest stable

No `@latest`/`@next`/`@beta` tags in manifests — resolve and pin exact versions.
