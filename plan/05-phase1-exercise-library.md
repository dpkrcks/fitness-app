# 05 — Phase 1: Exercise Library + 3D Mannequin (First MVP)

This is the **first build we ship to test with an audience.** Keep it focused.

## User stories
- As a user, I can browse exercises by **body part** (chest, back, legs, shoulders, arms, core, full body).
- As a user, I can filter by **location**: **Gym (with machines)** or **Home (no machines)**.
- As a user, I can open an exercise and see **how to do it on an animated figure** (a looping demonstration), plus steps and target muscles.
- As a user, I can see a **muscle heatmap** on a body figure highlighting which parts the exercise targets (primary vs. secondary).
- As a user, I can save exercises to **My List**.
- As a user, I can register/log in so my list persists.

## Scope (in)
- Exercise catalog seeded from open data (`04`).
- Browse + filter (body part, equipment/location, difficulty).
- Exercise detail with **animated figure demonstration** (pre-rendered loop), instructions, target muscles, equipment.
- **Muscle heatmap / hotspots** on a body figure showing targeted parts (primary vs. secondary).
- Favorites.
- Auth (from Phase 0).

## Scope (out — later phases)
- Yoga, diet/nutrition, AI form correction, plan generation, web UI, social.

## Key screens (mobile)
1. **Home / Browse** — body-part grid; gym/home toggle.
2. **Exercise List** — filtered cards (name, target, equipment badge).
3. **Exercise Detail** — animated figure demonstration (looping), **muscle heatmap**, steps, muscles, equipment, "Save".
4. **My List** — saved exercises.
5. **Auth** — login/register.
6. **Profile** (light) — basic account.

## The demonstration figure (core of this phase)
**Primary approach: pre-rendered 3D loops** (not real-time 3D). We model + animate one rigged humanoid in Blender, render each exercise to a short looping **video/GIF** once, and the app just plays it. This gives the polished "figure performing the exercise" look with none of the on-device 3D-engine risk (see `11-figure-demonstration-options.md` for why).

- Build one rigged humanoid + per-exercise animation; render to a looping clip (optionally 2 angles: front + side).
- Client plays the clip in a video/Lottie player — works on every phone, no `expo-gl`.
- Controls: play/pause, slow-motion (loop speed).
- **Fallback:** if a clip isn't ready, show the open-dataset GIF/image + steps. Animation coverage never blocks launch.
- **Deferred to Phase 2 (upgrade, not launch dependency):** free-rotate real-time 3D, gated on a week-1 spike proving it's viable on low-end phones.

The same rigged-model pipeline later feeds live 3D and the Phase-4 AI form-coach reference angles, so the modeling work is reused. See the asset pipeline in `09-mobile-mvp.md`.

## Muscle heatmap / hotspots
Each exercise highlights the muscles it works on a body figure — a quick visual answer to "what does this hit?"

- A reusable **body-map figure** (front + back) with named muscle regions.
- Per exercise, color regions by activation level: **primary** (strong highlight) vs. **secondary** (lighter).
- Driven by the exercise's `primaryMuscles` / `secondaryMuscles` data (already in the schema) mapped to body-map regions — no new ML needed.
- Implementation options (cheapest first): tinted SVG/layered-PNG muscle regions, or colored overlays on the rendered figure. SVG body map is the recommended v1 — light, crisp, easy to color from data.
- Reused later on the user **profile** ("muscles trained this week") and in plan balancing.

## API (Phase 1)
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh

GET  /api/v1/exercises?bodyPart=&equipment=&location=&difficulty=&q=&page=
GET  /api/v1/exercises/:id
GET  /api/v1/body-parts

GET  /api/v1/me/favorites
POST /api/v1/me/favorites/:exerciseId
DEL  /api/v1/me/favorites/:exerciseId
```

## Data prep tasks
1. Import Free Exercise DB → normalize into our `Exercise` schema (`10-data-model.md`).
2. Tag each exercise: `bodyPart`, `equipment`, `location` (gym/home), `difficulty`.
3. Map `primaryMuscles` / `secondaryMuscles` → **body-map regions** for the heatmap.
4. Render **pre-rendered demonstration loops** for the most common 30–50 exercises; the rest fall back to open-dataset GIFs/images.
5. Build the reusable **body-map figure** (front/back, named regions).
6. Upload clips, images, and body-map assets to object storage.

## Definition of done (Phase 1)
- [ ] User can register/login on a device.
- [ ] Browse by body part and gym/home filter returns correct exercises.
- [ ] At least 30–50 exercises show a pre-rendered demonstration loop; rest gracefully fall back to GIF/image.
- [ ] Exercise detail shows a muscle heatmap highlighting primary/secondary targeted parts.
- [ ] Save/unsave works and persists.
- [ ] Build distributed to testers (TestFlight / Play internal / Expo).
- [ ] Feedback + retention instrumentation in place (basic analytics).

## Risks & mitigations
| Risk | Mitigation |
|------|-----------|
| Not enough quality demonstration loops | Pre-render top exercises; open-dataset GIF/image fallback for the rest |
| Pre-rendering effort per exercise | Render once in Blender, batch/script the pipeline; prioritize top 30–50 |
| Muscle→region mapping inaccurate | Manual QA pass on the body-map mapping for top exercises |
| Exercise data inconsistency | Normalization + manual QA pass on top exercises |
