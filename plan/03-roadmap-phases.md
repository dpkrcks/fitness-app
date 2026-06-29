# 03 — Roadmap & Phases

Goal: get something **real in front of users fast**, then layer in the harder AI features once the core hook is validated. Mobile app first.

## Phase 0 — Foundation (setup)
**Outcome:** repo, scaffolding, auth, and a "hello data" path working end-to-end.
- Monorepo (apps/mobile, apps/web, apps/api, packages/shared-types).
- NestJS API + PostgreSQL + Prisma; Docker Compose for local dev.
- Expo app skeleton with expo-router + TanStack Query.
- Auth (register/login/JWT) end-to-end on mobile.
- CI (lint/test/build) + EAS build pipeline for mobile.

## Phase 1 — Exercise Library + Figure Demo + Heatmap  ⭐ FIRST MVP
**Outcome:** the audience-testable build. Browse exercises by body part + location (gym/home), each demonstrated on an animated figure (pre-rendered loop) with a muscle heatmap of targeted parts.
- Import open exercise dataset (see `04`).
- Filter by body part, equipment (machine vs none), location.
- Exercise detail: steps, target muscles, **pre-rendered demonstration loop**, **muscle heatmap / hotspots**.
- Basic favorites / "my list".
- Ship to testers via Expo (internal/TestFlight/Play internal track).
- **Figure approach:** pre-rendered 3D loops (real-time free-rotate 3D is a Phase-2 upgrade — see `11`).
- See `05-phase1-exercise-library.md`, `09-mobile-mvp.md`, and `11-figure-demonstration-options.md`.

## Phase 2 — Yoga
**Outcome:** yoga audience served.
- Yoga pose catalog (name, benefits, difficulty, target areas).
- Pose demonstration (mannequin or imagery).
- Simple sequences/flows (beginner/intermediate).
- Same browse/detail patterns reused from Phase 1.
- **Optional upgrade (if week-1 spike passed):** real-time free-rotate 3D figure — slots in here or any later phase without affecting the v1 launch. See `11`.
- See `06-phase2-yoga.md`.

## Phase 3 — Diet & Nutrition (incl. food scan)
**Outcome:** eating side of the product.
- Body profile → BMI/BMR/TDEE → calorie & macro targets.
- Manual food/meal logging against open nutrition data first.
- **Food platter scan**: camera → ML service → nutrition estimate.
- Diet plan suggestions based on body metrics + activity.
- Introduces the **Python FastAPI ML microservice**.
- See `07-phase3-diet-nutrition-scan.md`.

## Phase 4 — AI Form Coach
**Outcome:** the long-term moat.
- On-device/edge pose detection (MediaPipe/MoveNet).
- Compare user pose vs. reference for the exercise.
- Real-time feedback on gesture/form (reps, angles, alignment).
- See `08-phase4-ai-form-coach.md`.

## Phase 5 — Personalization & Web
**Outcome:** retention + reach.
- Smart plan generation combining exercises + yoga + diet + progress.
- Progress tracking, streaks, goals.
- Web UI (React) for browse + dashboard.
- Optional: social/sharing.

## Sequencing rationale
1. **Phase 1 proves the core hook** (do exercises right via the mannequin) with the least build effort and cheapest (open) data.
2. AI features (3 & 4) are the riskiest/most expensive — defer until users confirm the concept.
3. Web comes after mobile because mobile is the primary use context (gym/home).

## Rough milestone checklist
- [ ] Phase 0: e2e auth + data path on mobile
- [ ] Phase 1: exercise browse + figure demo + muscle heatmap shipped to testers
- [ ] Phase 1: feedback collected, retention measured
- [ ] Phase 2: yoga module
- [ ] Phase 3: nutrition + food scan + ML service
- [ ] Phase 4: AI form coach
- [ ] Phase 5: personalization + web
