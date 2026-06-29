# Fitness App — Planning Docs

A platform that helps people **exercise correctly** (gym / home / yoga) and **eat right**, starting open-source-first so we can test cheaply with a real audience. **Mobile app first.**

## Decisions locked
- **Backend:** Node.js (NestJS) modular monolith now; Python (FastAPI) ML microservice added in Phase 3.
- **First MVP:** Exercise library + animated figure demo + muscle heatmap (mobile only).
- **Figure approach:** pre-rendered 3D loops for v1 (rock-solid, every phone); real-time free-rotate 3D deferred to a Phase-2 upgrade gated on a week-1 spike. See [11](11-figure-demonstration-options.md).

## Read in this order
1. [00 — Overview](00-overview.md) — vision, audiences, success criteria
2. [01 — Tech Stack](01-tech-stack.md)
3. [02 — Architecture](02-architecture.md)
4. [03 — Roadmap & Phases](03-roadmap-phases.md)
5. [04 — Open-Source Data & Tooling](04-open-source-data-sources.md)
6. [05 — Phase 1: Exercise Library + Mannequin](05-phase1-exercise-library.md) ⭐ first MVP
7. [06 — Phase 2: Yoga](06-phase2-yoga.md)
8. [07 — Phase 3: Diet & Nutrition + Food Scan](07-phase3-diet-nutrition-scan.md)
9. [08 — Phase 4: AI Form Coach](08-phase4-ai-form-coach.md)
10. [09 — Mobile MVP (concrete first build)](09-mobile-mvp.md)
11. [10 — Data Model](10-data-model.md)
12. [11 — Figure Demonstration Options](11-figure-demonstration-options.md)
13. [12 — Monorepo & Shared Types (build details)](12-monorepo-and-shared-types.md)

## 📋 Progress tracking
**[13 — Task Tracker](13-task-tracker.md)** is the source of truth for what's done / in progress / pending. Update it as work proceeds — it's designed so progress survives context loss. Start there to see the current focus and the next task.

## Phase summary
| Phase | Focus | Ships |
|-------|-------|-------|
| 0 | Foundation | Repo, auth, e2e data path |
| 1 ⭐ | Exercise library + figure demo + heatmap | First audience-testable mobile build |
| 2 | Yoga | Pose library + sequences |
| 3 | Diet & nutrition + food scan | ML microservice introduced |
| 4 | AI form coach | On-device pose feedback |
| 5 | Personalization + Web | Plans, progress, React web UI |

## Next step
Build the **Mobile MVP** in [09-mobile-mvp.md](09-mobile-mvp.md) — start with the monorepo scaffold and a 3D mannequin spike to de-risk rendering early.
