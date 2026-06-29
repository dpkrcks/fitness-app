# 00 — Product Overview

## Vision
A fitness platform that helps people **exercise correctly** and **eat right**. Instead of dumping a list of exercises, the app guides users through the *right* plan for their goal and body — in the **gym**, at **home**, or via **yoga** — and helps them understand what they eat.

## The core promise
> "Don't just work out. Work out *right*, for *your* body."

## Target audiences
| Audience | Need | What we give them |
|----------|------|-------------------|
| Gym-goers | Use machines correctly, structured plans | Machine-based exercises by body part + form demos |
| Home exercisers | Fitness without equipment | Bodyweight exercises by body part |
| Yoga practitioners | Pose guidance & sequences | Yoga pose library + flows |
| Diet-conscious users | Understand & plan food | Food scan → nutrition → diet plan based on body + activity |

## Differentiators
1. **Figure demonstrations** — every exercise shown on an animated humanoid figure (pre-rendered 3D loops first; free-rotate live 3D as a later upgrade). Not just static photos.
2. **Muscle heatmap / hotspots** — each exercise highlights the body parts it targets on a body map (primary vs. secondary muscles), so users see *what* the exercise hits, not just how to do it.
3. **Food platter scan** — point the camera at a meal, get nutrition breakdown.
4. **Personalized plans** — driven by the user's body metrics (height/weight/BMI/BMR) and their actual activity.
5. **(Future) AI form coach** — camera watches you and corrects your gesture/form in real time.

## Strategy: open-source first
We build the first versions on **free, open datasets and open-source tooling** so we can ship fast and **test with a real audience cheaply**, then invest in custom/proprietary AI once the concept is validated.

## Success criteria for v1 (audience test)
- A user can pick a body part + location (gym/home) and get relevant exercises.
- Each exercise is demonstrated on the animated figure (pre-rendered loop) clearly enough to follow.
- Each exercise shows a muscle heatmap of the parts it targets.
- 30%+ of test users return for a second session within a week.
- Qualitative: "I understood how to do the exercise" feedback from testers.

## What we are NOT building first
- No AI food scan in the very first build (Phase 3).
- No real-time AI form correction in the first build (Phase 4).
- No social/community features in v1.

## Document map
- `01-tech-stack.md` — chosen stack & versions
- `02-architecture.md` — system design & evolution path
- `03-roadmap-phases.md` — phased delivery plan
- `04-open-source-data-sources.md` — datasets & licenses
- `05-phase1-exercise-library.md` — **first MVP**
- `06-phase2-yoga.md`
- `07-phase3-diet-nutrition-scan.md`
- `08-phase4-ai-form-coach.md`
- `09-mobile-mvp.md` — concrete first-build definition
- `10-data-model.md` — entities & schema sketch
- `11-figure-demonstration-options.md` — how we show the figure (approaches & decision)
