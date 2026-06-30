# 13 — Task Tracker (Source of Truth for Progress)

**Purpose:** the single place that records what is done, in progress, and pending — so work can resume correctly even if all conversation context is lost. Update this file as tasks change state; trust it over memory.

## How to use
- Each task is a checkbox. Mark `[x]` only when **done and verified**.
- Tasks are broken into **indented sub-tasks**. Mark a parent `[x]` only when **all** its sub-tasks are `[x]`.
- Each group ends with a `✅ Verify:` sub-task — the concrete check that proves the work before ticking the parent.
- Use the status tags inline when useful: `🟢 done` · `🟡 in-progress` · `🔴 blocked` · `⚪ todo`.
- When you finish a work session, update **Current focus** below so the next session knows where to pick up.
- Keep this honest: a half-finished task is `🟡`, not `[x]`.

## Current focus
> **Phase:** Phase 0 — Foundation — 🟡 in progress
> **Status:** Monorepo skeleton + pinned deps. `@fit/shared-types` builds (ESM+CJS+d.ts), 5/5 tests. `apps/api` (NestJS 11 + Express) scaffolded + verified (committed `48e1848`). **PostgreSQL + Prisma 7 added and verified end-to-end** against **Neon** (remote): `prisma-client` generator → `src/generated/prisma`, Rust-free client connected via the **node-postgres driver adapter** (`@prisma/adapter-pg`) to Neon's **pooled** endpoint; migrations run over the **direct** endpoint via `prisma.config.ts` (`DIRECT_URL`). First migration `…_init` created the `users` table. `typecheck` + `nest build` clean; `/health`, `/ready` (real DB ping), `/docs` all 200. (Prisma work + stray `tsconfig.json` fix not yet committed.)
>
> **▶️ RESUME HERE — next task: Docker Compose for local dev.**
> - **Postgres is now Neon (remote)**, so Compose is primarily for **MinIO** (object storage, Phase 1 assets). Decide whether to also add a *local* Postgres service as an offline-dev alternative to Neon.
> - `docker-compose.yml`: MinIO (API + console ports, named volume, healthcheck); optionally postgres; document the `docker compose up` flow + `.env` wiring.
> - **Open question (resolve first):** is Docker Desktop installed? If not, this task can be deferred and we jump to **Scaffold `apps/mobile` (Expo)** — Neon already unblocks the API.
>
> **Decisions resolved this session:** DB = Neon Postgres (dev branch for migrations); runtime = pooled endpoint via adapter-pg; migrations = direct endpoint via `DIRECT_URL`. TS pinned 5.9.3 needs `ignoreDeprecations: "5.0"` (editor's newer bundled TS disagrees — cosmetic; consider pointing the IDE at the workspace TS).
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
- [x] **Scaffold `apps/api` (NestJS) — boots + health endpoint** 🟢
  - [x] Init `apps/api` (`package.json`, `tsconfig.json` extends `@fit/config`, `tsconfig.build.json`, `nest-cli.json`)
  - [x] Install approved deps (runtime + dev, pinned `-E`; also added `zod`, `@types/express`, `@types/node`)
  - [x] `config/` — zod env schema validated at boot (fails fast on bad env)
  - [x] `common/` — exception filter → `{ code, message, details }` (base guard/interceptor deferred to first real use)
  - [x] `src/main.ts` thin bootstrap: Express adapter, global prefix `/api/v1`, helmet, pino
  - [x] `app.module.ts` wires config + health module
  - [x] `modules/health` — `GET /api/v1/health` + `/ready`
  - [x] Swagger/OpenAPI served at `/api/v1/docs`
  - [x] ✅ Verify: `nest build` clean; boots; `/health` + `/ready` + `/docs` all return 200
- [x] **Add PostgreSQL + Prisma; first migration runs** 🟢
  - [x] Install `prisma` + `@prisma/client` + `@prisma/adapter-pg` + `pg` + `dotenv` (pinned `-E`) in `apps/api`
  - [x] `prisma/schema.prisma` — `prisma-client` generator (→ `src/generated/prisma`) + `User` model (uuid id, unique email, timestamps, soft-delete `deletedAt` + index)
  - [x] `PrismaModule` (@Global) + `PrismaService` (adapter-pg, pool sizing, connect/disconnect lifecycle, `ping()`)
  - [x] `prisma.config.ts` → `DIRECT_URL`; `DATABASE_URL` (required) + `DIRECT_URL` (optional) in zod env schema; `.env`/`.env.example` updated
  - [x] ✅ Verify: `prisma migrate dev --name init` created `users` table on Neon; `/ready` pings DB → 200; typecheck + build clean
- [ ] **Docker Compose for local dev (MinIO; postgres now via Neon)** ⬅️ RESUME HERE
  - [ ] Confirm Docker Desktop installed (open question — resolve first)
  - [ ] `docker-compose.yml`: postgres service (named volume + healthcheck)
  - [ ] Add MinIO service (API + console ports, volume)
  - [ ] Add api service (or document running api on host against compose db)
  - [ ] `.env` wiring + documented `docker compose up` flow
  - [ ] ✅ Verify: `docker compose up` → api connects to postgres; MinIO console reachable
- [ ] **Scaffold `apps/mobile` (Expo + expo-router + TanStack Query)**
  - [ ] Init Expo app in `apps/mobile` (TypeScript + expo-router)
  - [ ] Install + pin deps (expo-router, `@tanstack/react-query`, `@fit/shared-types`)
  - [ ] App shell: root layout + one route + `QueryClientProvider`
  - [ ] API client base (reads base URL from env/config)
  - [ ] ✅ Verify: runs on simulator/device; calls api `/health` and renders result
- [ ] **Auth module (register/login/JWT/refresh) end-to-end: mobile → api → db**
  - [ ] DB: `User` (+ credential / refresh-token) model + migration
  - [ ] `POST /auth/register` (validate input, hash password)
  - [ ] `POST /auth/login` → access + refresh JWT
  - [ ] `POST /auth/refresh` → rotate tokens
  - [ ] Auth guard protects a sample `GET /me` route
  - [ ] Mobile: login/register forms + secure token storage + auth state
  - [ ] ✅ Verify: register → login → call protected route works mobile → api → db
- [ ] **CI (lint + typecheck + build) via GitHub Actions**
  - [ ] Workflow on push/PR: setup pnpm + node + cache
  - [ ] `turbo run lint typecheck build` across workspace
  - [ ] ✅ Verify: green check on a PR
- [ ] **EAS build pipeline configured (mobile)**
  - [ ] `eas.json` profiles (dev / preview / prod) + app config
  - [ ] Configure project + credentials
  - [ ] ✅ Verify: a preview build completes on EAS
- [ ] **Week-1 spike: rigged GLB + Mixamo clip in Expo on a low-end phone** (`11`)
  - [ ] Load one rigged GLB in Expo (three / expo-gl or similar)
  - [ ] Play one Mixamo animation clip
  - [ ] Test on a real low-end Android + iOS (fps, load time, memory)
  - [ ] ✅ Verify: record GO/NO-GO for real-time 3D in the Decisions log

## Phase 1 — Exercise Library + Figure Demo + Heatmap ⭐ (First MVP)
**Data & assets**
- [ ] **Import Free Exercise DB → normalize into `Exercise` schema** (`10`)
  - [ ] Fetch / vendor the Free Exercise DB dataset
  - [ ] Normalizer → `Exercise` schema (zod-validated)
  - [ ] Seed script loads exercises into DB
  - [ ] ✅ Verify: row count + sample record matches schema
- [ ] **Tag each exercise: `bodyPart`, `equipment`, `location` (gym/home), `difficulty`**
  - [ ] Derive `bodyPart`, `equipment`, `difficulty` from source
  - [ ] Classification rule for `location` (gym/home)
  - [ ] ✅ Verify: every exercise has all 4 tags populated
- [ ] **Map `primaryMuscles`/`secondaryMuscles` → body-map region ids** (`10`)
  - [ ] Define canonical body-map region id list
  - [ ] Map primary + secondary muscle names → region ids
  - [ ] ✅ Verify: no unmapped muscle names remain
- [ ] **Build reusable SVG body-map figure (front/back, named regions)**
  - [ ] Source / build front + back SVG with named region paths
  - [ ] Region ids align with the mapping table
  - [ ] ✅ Verify: render shows every named region individually selectable
- [ ] **Pre-render demonstration loops for top 30–50 exercises** (Blender → video/GIF, front + side)
  - [ ] Pick the top 30–50 exercises
  - [ ] Blender render front + side loop per exercise
  - [ ] Export to video/GIF at target size/format
  - [ ] ✅ Verify: loops play smoothly; file sizes acceptable
- [ ] **Upload loops, images, body-map assets to object storage (MinIO)**
  - [ ] Create bucket(s) + upload script
  - [ ] Store asset URLs/keys on exercise records
  - [ ] ✅ Verify: assets fetchable via storage URL

**API (NestJS)**
- [ ] **`GET /exercises` with filters (bodyPart, equipment, location, difficulty, q, page)**
  - [ ] Endpoint + query DTO (zod) for filters + pagination
  - [ ] Repository query honoring all filters
  - [ ] ✅ Verify: filter combinations return correct sets
- [ ] **`GET /exercises/:id`**
  - [ ] Returns full detail (asset urls + mapped muscles); 404 on missing
  - [ ] ✅ Verify: known id returns complete record
- [ ] **`GET /body-parts`**
  - [ ] Endpoint returns body-part list (with counts)
  - [ ] ✅ Verify: matches tagged data
- [ ] **`GET/POST/DELETE /me/favorites`**
  - [ ] `Favorite` model + migration
  - [ ] List / add / remove endpoints (auth-guarded)
  - [ ] ✅ Verify: favorites persist per user

**Mobile**
- [ ] **Auth screens (login/register) wired to api**
  - [ ] Build login/register UI
  - [ ] Wire to api + handle loading/error states
  - [ ] ✅ Verify on device: register + login succeed
- [ ] **Browse screen (body-part grid + Gym/Home toggle)**
  - [ ] Body-part grid UI
  - [ ] Gym/Home toggle state
  - [ ] ✅ Verify: navigates to correctly filtered list
- [ ] **Exercise list (filtered cards)**
  - [ ] Card list bound to `GET /exercises` (TanStack Query)
  - [ ] Filters + pagination wired
  - [ ] ✅ Verify: list reflects filters
- [ ] **Exercise detail: demonstration loop player + steps + equipment + muscles**
  - [ ] Detail layout (player + steps + equipment + muscles)
  - [ ] Loop player component
  - [ ] ✅ Verify with real data on device
- [ ] **Muscle heatmap component (colors body map from exercise data)**
  - [ ] Color SVG regions from exercise muscle data
  - [ ] Distinct primary vs secondary intensity
  - [ ] ✅ Verify: colors match exercise data
- [ ] **Image/GIF fallback when a loop is missing**
  - [ ] Detect missing loop → render image/GIF
  - [ ] ✅ Verify: fallback path renders cleanly
- [ ] **My List (favorites) screen**
  - [ ] Favorites screen bound to api
  - [ ] Add/remove from list + detail
  - [ ] ✅ Verify: persists across app restart
- [ ] **Minimal profile screen**
  - [ ] Profile screen (user info + logout)
  - [ ] ✅ Verify: shows user + logout works

**Ship**
- [ ] **Analytics + feedback instrumentation in place**
  - [ ] Add analytics SDK + key events
  - [ ] In-app feedback hook
  - [ ] ✅ Verify: events arrive in dashboard
- [ ] **Build distributed to testers (TestFlight / Play internal / Expo)**
  - [ ] EAS build
  - [ ] Distribute via TestFlight / Play internal / Expo
  - [ ] ✅ Verify: a tester can install + launch
- [ ] **Retention/feedback collected**
  - [ ] Retention/feedback dashboard wired
  - [ ] ✅ Verify: data flowing from testers

**Phase 1 Definition of Done** (`05`)
- [ ] Register/login works on a real device
- [ ] Browse by body part + gym/home returns correct exercises
- [ ] ≥30–50 exercises show a pre-rendered loop; rest fall back cleanly
- [ ] Exercise detail shows muscle heatmap (primary/secondary)
- [ ] Save/unsave persists per user
- [ ] In testers' hands with feedback tracking live

## Phase 2 — Yoga
- [ ] **Curate ~40–60 asanas (name, sanskrit, category, difficulty, benefits, cues, cautions)**
  - [ ] Define `Asana` schema fields
  - [ ] Curate ~40–60 entries
  - [ ] Seed + validate
  - [ ] ✅ Verify: count + every record matches schema
- [ ] **Map poses → figure poses or curated images**
  - [ ] Source curated images or figure poses
  - [ ] Link visuals to asanas
  - [ ] ✅ Verify: every pose has a visual
- [ ] **Build 3–5 sequences (ordered poses + hold durations)**
  - [ ] `Sequence` schema (ordered poses + hold durations)
  - [ ] Author 3–5 sequences
  - [ ] ✅ Verify: ordering + durations correct
- [ ] **API: `GET /yoga/poses`, `/yoga/poses/:id`, `/yoga/sequences`, `/yoga/sequences/:id`**
  - [ ] `GET /yoga/poses` + `/yoga/poses/:id`
  - [ ] `GET /yoga/sequences` + `/yoga/sequences/:id`
  - [ ] ✅ Verify: responses match seeded data
- [ ] **Mobile: yoga browse, pose detail, sequences list, flow player (timer)**
  - [ ] Yoga browse + pose detail screens
  - [ ] Sequences list screen
  - [ ] Flow player with per-hold timer
  - [ ] ✅ Verify: a full sequence runs end-to-end
- [ ] _(optional)_ Real-time free-rotate 3D figure upgrade — only if week-1 spike passed (`11`)

## Phase 3 — Diet & Nutrition (+ Food Scan)
- [ ] **Body profile input + BMI/BMR/TDEE/macro target calculations** (`07`)
  - [ ] Profile input form + model
  - [ ] BMI/BMR/TDEE/macro calc functions (unit-tested, in shared-types)
  - [ ] ✅ Verify: outputs match known reference values
- [ ] **Open Food Facts / USDA proxy + cache (`GET /foods`)**
  - [ ] `GET /foods` proxy to OFF/USDA
  - [ ] Cache layer
  - [ ] ✅ Verify: lookup works + cache hit on repeat
- [ ] **Barcode scan → Open Food Facts lookup**
  - [ ] Mobile barcode scanner
  - [ ] Scan → OFF lookup wired
  - [ ] ✅ Verify: a real barcode resolves to a food
- [ ] **Manual meal logging (`POST /me/meals`, `GET /me/meals?date=`)**
  - [ ] `Meal` model + migration
  - [ ] `POST /me/meals` + `GET /me/meals?date=`
  - [ ] Mobile logging UI
  - [ ] ✅ Verify: meals persist + query by day
- [ ] **Stand up Python FastAPI ML microservice (`/infer/food-image`)**
  - [ ] Scaffold FastAPI service + `/infer/food-image`
  - [ ] Containerize + add to compose
  - [ ] ✅ Verify: endpoint returns an inference
- [ ] **Food platter scan flow → editable nutrition estimate (`POST /me/meals/scan`)**
  - [ ] `POST /me/meals/scan` wires api → ML service
  - [ ] Mobile capture + editable estimate UI
  - [ ] ✅ Verify: edit + save produces a logged meal
- [ ] **Rule-based diet plan suggestions (`GET /me/diet-plan`)**
  - [ ] `GET /me/diet-plan` from profile + targets
  - [ ] ✅ Verify: plan respects macro targets
- [ ] **Disclaimers + photo data-deletion controls**
  - [ ] Disclaimers UI
  - [ ] Photo data-deletion controls
  - [ ] ✅ Verify: deletion actually removes stored photos/data

## Phase 4 — AI Form Coach
- [ ] **On-device pose estimation (MediaPipe/MoveNet) working in the app** (`08`)
  - [ ] Integrate MediaPipe/MoveNet in the app
  - [ ] Render landmarks from camera feed
  - [ ] ✅ Verify: live landmarks at usable fps
- [ ] **Reference joint-angle definitions for 3–5 exercises (squat/push-up/plank/lunge/curl)**
  - [ ] Define reference angles per exercise
  - [ ] ✅ Verify: angles match sample footage
- [ ] **Comparison engine (live angles vs reference) → rule-based cues**
  - [ ] Compare live angles vs reference → rule-based cues
  - [ ] ✅ Verify: cue triggers on bad form
- [ ] **Rep counting via key-joint trajectory**
  - [ ] Rep counter from key-joint trajectory
  - [ ] ✅ Verify: count accurate on sample reps
- [ ] **Skeleton overlay + concise feedback UX + calibration step**
  - [ ] Skeleton overlay + concise feedback UI
  - [ ] Calibration step
  - [ ] ✅ Verify: a usable coached session runs
- [ ] **Session summary (reps, form score) persisted**
  - [ ] Persist reps + form score
  - [ ] ✅ Verify: summary saved + viewable

## Phase 5 — Personalization & Web
- [ ] **Plan generation combining exercises + yoga + diet + progress**
  - [ ] Combine exercises + yoga + diet + progress into a plan
  - [ ] ✅ Verify: generates a coherent plan
- [ ] **Progress tracking, streaks, goals**
  - [ ] Progress / streaks / goals models + UI
  - [ ] ✅ Verify: streak + goal logic correct
- [ ] **Scaffold `apps/web` (React + Vite) — browse + dashboard**
  - [ ] Init React + Vite app
  - [ ] Browse + dashboard pages
  - [ ] ✅ Verify: web app runs + renders pages
- [ ] **Reuse `@fit/shared-types` + heatmap component on web**
  - [ ] Consume `@fit/shared-types` on web
  - [ ] Port heatmap component to web
  - [ ] ✅ Verify: heatmap renders correctly on web
- [ ] _(optional)_ Social / sharing

---

## Changelog (append-only — what actually shipped, newest first)
- 2026-06-30 — Phase 0: added **PostgreSQL + Prisma 7** to `apps/api`, verified end-to-end on **Neon**. Pinned deps `@prisma/client` 7.8.0, `prisma` 7.8.0, `@prisma/adapter-pg` 7.8.0, `pg` 8.22.0, `dotenv` 17.4.2, `@types/pg` 8.20.0. New `prisma-client` generator emits to `src/generated/prisma` (git-ignored); Rust-free client connects via node-postgres **driver adapter** to Neon **pooled** endpoint (`DATABASE_URL`); CLI/migrations use **direct** endpoint (`DIRECT_URL`) via `prisma.config.ts`. `PrismaModule` (@Global) + `PrismaService` (pool max/idle/conn timeouts, connect/disconnect, `ping()`); `/ready` now pings the DB (503 on failure). First migration `20260630051541_init` → `users` table (uuid PK, unique email, timestamps, soft-delete `deleted_at` + index). Also fixed stray uncommitted `tsconfig.json` (`ignoreDeprecations` `"6.0"`→`"5.0"` for pinned TS 5.9.3). `typecheck` + `nest build` clean; `/health`, `/ready`, `/docs` all 200. Not yet committed.
- 2026-06-30 — Phase 0: scaffolded `apps/api` (NestJS 11.1.27 on Express). zod env validation at boot, pino structured logging, helmet, global prefix `/api/v1`, uniform `{ code, message, details }` exception filter, Swagger at `/api/v1/docs`, `health`/`ready` endpoints. Added deps pinned `-E` (incl. `zod`, `@types/express`, `@types/node`). `nest build` clean; app boots; `/health` + `/ready` + `/docs` all return 200. Not yet committed.
- 2026-06-29 — Phase 0: deps installed + pinned; `@fit/shared-types` builds (ESM/CJS/d.ts) and tests pass (5/5). TypeScript pinned 5.9.3 (TS6 reverted for tooling compat); zod 4 native API.
- 2026-06-29 — Phase 0: monorepo skeleton scaffolded + committed (`chore: initialize monorepo scaffold`, commit `ad4ea62`, branch `main`). pnpm+Turborepo workspace, `@fit/config`, `@fit/shared-types` (first contract + test). No deps installed yet.
