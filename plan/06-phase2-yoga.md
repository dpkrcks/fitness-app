# 06 — Phase 2: Yoga

Serve the yoga audience by reusing the browse/detail/mannequin patterns from Phase 1.

## User stories
- As a user, I can browse yoga poses by **category** (standing, seated, balance, backbend, twist, restorative) and **difficulty**.
- As a user, I can see how a pose looks and read its **benefits, alignment cues, and cautions**.
- As a user, I can follow a simple **sequence/flow** (e.g. Sun Salutation, Beginner Morning Flow).

## Scope (in)
- Yoga pose catalog (name, Sanskrit name, category, difficulty, benefits, cues, target areas).
- Pose demonstration (mannequin pose or curated imagery).
- Curated **sequences**: ordered list of poses with hold durations.
- Guided flow player: step through poses with a timer.

## Scope (out)
- AI pose correction (that's Phase 4, applies to yoga too).
- Personalized yoga plan generation (Phase 5).

## Key screens
1. **Yoga Browse** — categories + difficulty filter.
2. **Pose Detail** — figure/image, benefits, cues, cautions, target areas.
3. **Sequences** — list of flows.
4. **Flow Player** — timed step-through of a sequence with next/prev.

## Mannequin for yoga
- Yoga poses are mostly **static holds** → store as a single keyframe/pose on the rigged model, or transitions between poses for flows.
- Where good 3D poses aren't available, use curated images first; upgrade to mannequin later.

## API (Phase 2)
```
GET  /api/v1/yoga/poses?category=&difficulty=&q=&page=
GET  /api/v1/yoga/poses/:id
GET  /api/v1/yoga/sequences
GET  /api/v1/yoga/sequences/:id
```

## Data prep
1. Curate a starter set of ~40–60 common asanas with cues/benefits.
2. Build 3–5 beginner/intermediate sequences.
3. Map poses → figure poses or images.

## Definition of done
- [ ] Browse + filter yoga poses.
- [ ] Pose detail with cues/benefits/cautions.
- [ ] At least 3 working guided sequences with timer.
- [ ] Reuses Phase 1 navigation/components (no major new infra).
