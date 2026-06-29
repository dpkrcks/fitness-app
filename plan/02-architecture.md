# 02 — Architecture

## Guiding principle
Start as a **modular monolith** (NestJS modules), not microservices. Split a module into its own service **only when it has a real reason** to scale or deploy independently (the ML service is the first natural split). This avoids premature distributed-systems complexity while keeping clean seams.

## High-level diagram (v1 → future)

```
                ┌─────────────┐      ┌─────────────┐
                │  Mobile app │      │   Web app   │
                │   (Expo)    │      │ (React/Vite)│
                └──────┬──────┘      └──────┬──────┘
                       │     HTTPS / REST   │
                       └─────────┬──────────┘
                                 ▼
                       ┌───────────────────┐
                       │   NestJS API      │  (modular monolith)
                       │  ┌─────────────┐  │
                       │  │ auth        │  │
                       │  │ users/body  │  │
                       │  │ exercises   │  │
                       │  │ yoga        │  │
                       │  │ workouts    │  │
                       │  │ nutrition   │  │
                       │  │ media       │  │
                       │  └─────────────┘  │
                       └───┬───────────┬───┘
                           │           │
                  ┌────────▼──┐   ┌────▼─────────┐
                  │ PostgreSQL│   │ Object store │ (3D assets, images)
                  └───────────┘   └──────────────┘
                           │
                           │ (Phase 3+) async / REST
                           ▼
                  ┌────────────────────┐
                  │  Python ML service │  food scan, pose/form
                  │     (FastAPI)      │
                  └────────────────────┘
```

## Module responsibilities (NestJS)
- **auth** — registration, login, JWT issue/refresh, password hashing.
- **users / body-profile** — profile, height/weight/age/sex, goals, BMI/BMR calc.
- **exercises** — exercise catalog, filtering by body part / equipment / location.
- **yoga** — pose catalog and sequences (Phase 2).
- **workouts** — plans, sessions, logging, plan generation rules.
- **nutrition** — food items, meals, diet plans (Phase 3); talks to ML service.
- **media** — serves/streams 3D model + animation metadata and images.

## 3D mannequin delivery
- Store a **single rigged humanoid model** (glTF/GLB) once.
- Store **per-exercise animation clips** (from Mixamo or authored) referenced by the exercise record.
- Client loads model + clip on demand and plays the animation with three.js — no per-exercise video files needed, keeps assets small. See `09-mobile-mvp.md` and `05-phase1-exercise-library.md`.

## API conventions
- REST, JSON, versioned (`/api/v1/...`).
- OpenAPI/Swagger auto-generated from NestJS.
- Consistent error envelope: `{ error: { code, message, details? } }`.
- Pagination: cursor or `page/limit` on list endpoints.
- All inputs validated with zod/class-validator at the boundary.

## Cross-cutting concerns
- **AuthN/Z:** JWT access (short-lived) + refresh tokens; role guard for admin/content endpoints.
- **Config:** env-based, validated at boot; never commit secrets.
- **Logging/observability:** structured logs; add tracing when ML service lands.
- **Caching:** TanStack Query on clients; Redis server-side only when measured need appears.

## When to actually go microservices
Split out a service when **at least one** is true:
1. It needs different scaling (ML/GPU vs. CRUD).
2. It needs a different language/runtime (Python for ML).
3. It has an independent deploy cadence or team.

First split: **ML service (Phase 3)**. Everything else stays in the monolith until proven otherwise.
