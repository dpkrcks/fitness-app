# 13 — Task Tracker (Source of Truth for Progress)

**Purpose:** the single place that records what is done, in progress, and pending — so work can resume correctly even if all conversation context is lost. Update this file as tasks change state; trust it over memory.

## How to use
- Each task is a checkbox. Mark `[x]` only when **done and verified**.
- Use the status tags inline when useful: `🟢 done` · `🟡 in-progress` · `🔴 blocked` · `⚪ todo`.
- When you finish a work session, update **Current focus** below so the next session knows where to pick up.
- Keep this honest: a half-finished task is `🟡`, not `[x]`.

## Current focus
> **Phase:** Phase 0 — Foundation
> **Status:** Monorepo skeleton + deps installed and pinned. `@fit/shared-types` **builds (ESM+CJS+d.ts) and tests pass (5/5)**. TypeScript pinned to 5.9.3 (TS6 backed out for tooling compatibility).
> **Next task:** scaffold `apps/api` (NestJS) — modular monolith, `API → Service → Repository → DB`, `/api/v1`, health endpoint. REQUIRES permission (new dependencies).
> **Blockers:** none.

## Decisions log (locked — change only deliberately)
- ✅ Backend: NestJS modular monolith now; Python FastAPI ML microservice in Phase 3. (`02`)
- ✅ First MVP: exercise library + animated figure demo + muscle heatmap, mobile only. (`05`, `09`)
- ✅ Figure approach: **pre-rendered 3D loops** for v1; real-time free-rotate 3D deferred to a post-MVP upgrade, gated on the week-1 spike. (`11`)
- ✅ Monorepo: pnpm workspaces + Turborepo; shared types compiled, consumed via `workspace:*`. (`12`)
- ✅ Open-source-first data: Free Exercise DB, Mixamo, Open Food Facts, USDA, MediaPipe. (`04`)

---

## Phase 0 — Foundation
- [x] Initialize git repo + root `package.json` (private) + `pnpm-workspace.yaml` + `turbo.json` (`12`) 🟢
- [x] Create `packages/config` (shared tsconfig/prettier presets) 🟢
- [x] Create `packages/shared-types` (zod schemas + test + tsup build) — builds + tests pass 🟢
- [x] `pnpm install` + pinned deps (turbo 2.10.0, typescript 5.9.3, prettier 3.9.3, zod 4.4.3, tsup 8.5.1, vitest 4.1.9); shared-types builds + 5/5 tests pass 🟢
- [ ] Scaffold `apps/api` (NestJS) — boots, health endpoint
- [ ] Add PostgreSQL + Prisma; first migration runs
- [ ] Docker Compose for local dev (api + postgres + MinIO)
- [ ] Scaffold `apps/mobile` (Expo + expo-router + TanStack Query) — runs on device/simulator
- [ ] Auth module (register/login/JWT/refresh) end-to-end: mobile → api → db
- [ ] CI (lint + typecheck + build) via GitHub Actions
- [ ] EAS build pipeline configured (mobile)
- [ ] **Week-1 spike:** load one rigged GLB + play one Mixamo clip in Expo on a real low-end phone (iOS + Android) → record GO/NO-GO for real-time 3D (`11`)

## Phase 1 — Exercise Library + Figure Demo + Heatmap ⭐ (First MVP)
**Data & assets**
- [ ] Import Free Exercise DB → normalize into `Exercise` schema (`10`)
- [ ] Tag each exercise: `bodyPart`, `equipment`, `location` (gym/home), `difficulty`
- [ ] Map `primaryMuscles`/`secondaryMuscles` → body-map region ids (`10`)
- [ ] Build reusable SVG body-map figure (front/back, named regions)
- [ ] Pre-render demonstration loops for top 30–50 exercises (Blender → video/GIF, front + side)
- [ ] Upload loops, images, body-map assets to object storage (MinIO)

**API (NestJS)**
- [ ] `GET /exercises` with filters (bodyPart, equipment, location, difficulty, q, page)
- [ ] `GET /exercises/:id`
- [ ] `GET /body-parts`
- [ ] `GET/POST/DELETE /me/favorites`

**Mobile**
- [ ] Auth screens (login/register) wired to api
- [ ] Browse screen (body-part grid + Gym/Home toggle)
- [ ] Exercise list (filtered cards)
- [ ] Exercise detail: demonstration loop player + steps + equipment + muscles
- [ ] Muscle heatmap component (colors body map from exercise data)
- [ ] Image/GIF fallback when a loop is missing
- [ ] My List (favorites) screen
- [ ] Minimal profile screen

**Ship**
- [ ] Analytics + feedback instrumentation in place
- [ ] Build distributed to testers (TestFlight / Play internal / Expo)
- [ ] Retention/feedback collected

**Phase 1 Definition of Done** (`05`)
- [ ] Register/login works on a real device
- [ ] Browse by body part + gym/home returns correct exercises
- [ ] ≥30–50 exercises show a pre-rendered loop; rest fall back cleanly
- [ ] Exercise detail shows muscle heatmap (primary/secondary)
- [ ] Save/unsave persists per user
- [ ] In testers' hands with feedback tracking live

## Phase 2 — Yoga
- [ ] Curate ~40–60 asanas (name, sanskrit, category, difficulty, benefits, cues, cautions)
- [ ] Map poses → figure poses or curated images
- [ ] Build 3–5 sequences (ordered poses + hold durations)
- [ ] API: `GET /yoga/poses`, `/yoga/poses/:id`, `/yoga/sequences`, `/yoga/sequences/:id`
- [ ] Mobile: yoga browse, pose detail, sequences list, flow player (timer)
- [ ] _(optional)_ Real-time free-rotate 3D figure upgrade — only if week-1 spike passed (`11`)

## Phase 3 — Diet & Nutrition (+ Food Scan)
- [ ] Body profile input + BMI/BMR/TDEE/macro target calculations (`07`)
- [ ] Open Food Facts / USDA proxy + cache (`GET /foods`)
- [ ] Barcode scan → Open Food Facts lookup
- [ ] Manual meal logging (`POST /me/meals`, `GET /me/meals?date=`)
- [ ] Stand up Python FastAPI ML microservice (`/infer/food-image`)
- [ ] Food platter scan flow → editable nutrition estimate (`POST /me/meals/scan`)
- [ ] Rule-based diet plan suggestions (`GET /me/diet-plan`)
- [ ] Disclaimers + photo data-deletion controls

## Phase 4 — AI Form Coach
- [ ] On-device pose estimation (MediaPipe/MoveNet) working in the app (`08`)
- [ ] Reference joint-angle definitions for 3–5 exercises (squat/push-up/plank/lunge/curl)
- [ ] Comparison engine (live angles vs reference) → rule-based cues
- [ ] Rep counting via key-joint trajectory
- [ ] Skeleton overlay + concise feedback UX + calibration step
- [ ] Session summary (reps, form score) persisted

## Phase 5 — Personalization & Web
- [ ] Plan generation combining exercises + yoga + diet + progress
- [ ] Progress tracking, streaks, goals
- [ ] Scaffold `apps/web` (React + Vite) — browse + dashboard
- [ ] Reuse `@fit/shared-types` + heatmap component on web
- [ ] _(optional)_ Social / sharing

---

## Changelog (append-only — what actually shipped, newest first)
- 2026-06-29 — Phase 0: deps installed + pinned; `@fit/shared-types` builds (ESM/CJS/d.ts) and tests pass (5/5). TypeScript pinned 5.9.3 (TS6 reverted for tooling compat); zod 4 native API.
- 2026-06-29 — Phase 0: monorepo skeleton scaffolded + committed (`chore: initialize monorepo scaffold`, commit `ad4ea62`, branch `main`). pnpm+Turborepo workspace, `@fit/config`, `@fit/shared-types` (first contract + test). No deps installed yet.
