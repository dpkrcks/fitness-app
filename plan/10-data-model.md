# 10 — Data Model (Schema Sketch)

Starting entity model. Phase 1 needs only a subset; later entities are marked by phase. Treat this as a sketch to refine in Prisma schema.

## Phase 1 entities

### User
| Field | Type | Notes |
|-------|------|-------|
| id | uuid (pk) | |
| email | string unique | |
| passwordHash | string | argon2/bcrypt |
| displayName | string | |
| createdAt / updatedAt | timestamp | |

### Exercise
| Field | Type | Notes |
|-------|------|-------|
| id | uuid (pk) | |
| name | string | |
| slug | string unique | |
| description | text | |
| instructions | string[] | step-by-step |
| bodyPart | enum | chest, back, legs, shoulders, arms, core, fullBody |
| primaryMuscles | string[] | |
| secondaryMuscles | string[] | |
| equipment | enum | none, machine, dumbbell, barbell, band, ... |
| location | enum | gym, home, both (derived from equipment) |
| difficulty | enum | beginner, intermediate, advanced |
| imageUrls | string[] | fallback media (open-dataset GIF/image) |
| demoLoopUrls | json? | pre-rendered demonstration loop(s), e.g. `{ front, side }`; null → use images |
| animationClipId | string? | (Phase-2) real-time 3D clip ref; null → not available |
| bodyMapRegions | json | heatmap mapping: `{ primary: regionId[], secondary: regionId[] }` |
| source / license | string | provenance (open dataset) |

### FigureAsset
| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| type | enum | demoLoop (v1), bodyMap (v1), model (Phase 2), clip (Phase 2) |
| uri | string | object-storage URL |
| meta | json | loop, defaultSpeed, cameraAngle, regionIds (for bodyMap) |

> **Body map:** a single reusable `bodyMap` asset (front/back, named regions) drives the heatmap; exercises reference its `regionId`s via `Exercise.bodyMapRegions` — no per-exercise asset needed for the heatmap.

### Favorite
| Field | Type | Notes |
|-------|------|-------|
| userId | fk User | |
| exerciseId | fk Exercise | |
| createdAt | timestamp | |
| | | unique(userId, exerciseId) |

## Phase 2 entities (Yoga)

### YogaPose
id, name, sanskritName, category(enum), difficulty(enum), benefits[], cues[], cautions[], targetAreas[], imageUrls[], poseAssetId?

### YogaSequence
id, name, level, description

### YogaSequenceItem
id, sequenceId(fk), poseId(fk), order, holdSeconds

## Phase 3 entities (Nutrition)

### BodyProfile
userId(fk, unique), heightCm, weightKg, age, sex, activityLevel(enum), goal(enum lose/maintain/gain), updatedAt
- derived (computed, not stored or cached): bmi, bmr, tdee, calorieTarget, macros

### FoodItem
id, name, source(enum OFF/USDA/manual), externalId?, barcode?, per100g {kcal, protein, carbs, fat, ...}

### Meal
id, userId(fk), eatenAt, type(enum breakfast/lunch/dinner/snack), source(enum manual/barcode/scan)

### MealItem
id, mealId(fk), foodItemId(fk?), quantityGrams, computedNutrition(json), confidence?(for scans)

### DietPlan
id, userId(fk), generatedAt, targets(json), mealSuggestions(json)

## Phase 4 entities (Form Coach)

### WorkoutSession
id, userId(fk), startedAt, endedAt, exerciseId(fk)

### FormResult
id, sessionId(fk), reps, formScore, cues(json), createdAt
> Raw video/landmarks stay on-device; only summaries persist.

## Relationships (summary)
- User 1—N Favorite N—1 Exercise
- Exercise 0..1—1 MannequinAsset (clip)
- User 1—1 BodyProfile
- User 1—N Meal 1—N MealItem N—1 FoodItem
- YogaSequence 1—N YogaSequenceItem N—1 YogaPose
- User 1—N WorkoutSession 1—N FormResult

## Notes
- Use **enums** for controlled vocabularies (bodyPart, equipment, etc.) to keep filtering clean.
- Derive nutrition targets on read (pure function of BodyProfile) — don't store stale copies.
- Keep `source`/`license` on imported content for attribution/compliance (`04`).
