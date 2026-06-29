# 09 — Mobile MVP (Concrete First Build)

The exact first thing we build and ship. Equals **Phase 0 + Phase 1**. Mobile only.

## One-line definition
> An Expo app where a user logs in, browses gym/home exercises by body part, watches each exercise demonstrated on an animated figure (pre-rendered loop), and sees a muscle heatmap of the parts it targets.

## Build order
1. **Scaffold monorepo** (apps/mobile, apps/api, packages/shared-types).
2. **API foundation**: NestJS + Prisma + PostgreSQL (Docker Compose), auth module.
3. **Mobile foundation**: Expo + expo-router + TanStack Query + auth screens.
4. **Seed data**: import + normalize Free Exercise DB; tag body part / equipment / gym-home; map muscles → body-map regions.
5. **Exercise browse + detail** screens wired to API.
6. **Demonstration player** (pre-rendered loop) in exercise detail.
7. **Muscle heatmap** component (body map colored from exercise muscle data).
8. **Favorites**.
9. **Analytics + feedback hook**, then distribute to testers.

## Mobile screen list (MVP)
- Auth: Login, Register
- Browse (body-part grid + Gym/Home toggle)
- Exercise List (filtered)
- Exercise Detail (**demonstration loop**, **muscle heatmap**, steps, muscles, equipment, Save)
- My List (favorites)
- Profile (minimal)

## Demonstration figure pipeline (primary: pre-rendered loops)
Rationale and full options comparison in `11-figure-demonstration-options.md`. We ship pre-rendered video loops, NOT real-time 3D, for v1.

1. **Model + animation:** one rigged humanoid (Mixamo / Ready Player Me / Quaternius), animated per exercise in Blender.
2. **Render once:** export each exercise as a short **looping video/GIF** (optionally front + side angle). No 3D engine ships in the app.
3. **Storage:** clips in object storage (MinIO dev → S3 prod); CDN later.
4. **Playback:** native video player / Lottie in the detail screen — runs on every phone, no `expo-gl` bridge.
5. **Controls:** play/pause, slow-mo (loop speed).
6. **Fallback:** missing loop → open-dataset GIF/image + step text. Never block launch on coverage.

> Real-time, free-rotate 3D (three.js / `@react-three/fiber` over `expo-gl`) is a **Phase-2 upgrade**, gated on a week-1 spike (load one rigged GLB + play one clip on a real low-end phone, iOS + Android) before any UI commits to it.

## Muscle heatmap pipeline
1. **Body-map asset:** one reusable figure (front + back) with named, separately-colorable muscle regions — **SVG recommended** (crisp, tiny, data-driven coloring).
2. **Mapping:** exercise `primaryMuscles` / `secondaryMuscles` → body-map region ids (done at seed time).
3. **Render:** color primary regions strongly, secondary lighter; show on exercise detail. Pure data → no ML.
4. **Reuse:** same component later powers profile "muscles trained this week" and plan balancing.

## Tech checklist (mobile)
- expo, expo-router, typescript (strict)
- @tanstack/react-query, zustand
- expo-av / expo-video (demonstration loop playback), lottie-react-native (if Lottie used)
- react-native-svg (muscle heatmap body map)
- react-hook-form, zod (shared via packages/shared-types)
- _(Phase-2 upgrade only)_ three, @react-three/fiber, @react-three/drei, expo-gl
- expo-secure-store
- analytics (open-source/self-host friendly)

## Distribution to testers
- iOS: TestFlight via EAS.
- Android: Play internal testing track via EAS.
- Quick path: Expo dev/preview builds for a small group.

## Definition of done
- [ ] Login/register works on a real device.
- [ ] Browse by body part + Gym/Home returns correct exercises.
- [ ] ≥30–50 exercises show a pre-rendered demonstration loop; others fall back cleanly to GIF/image.
- [ ] Exercise detail shows a muscle heatmap (primary/secondary) from exercise data.
- [ ] Save/unsave persists per user.
- [ ] Build in testers' hands + feedback/retention tracking live.

## Cut list (explicitly NOT in MVP)
Real-time free-rotate 3D figure (Phase-2 upgrade), yoga, diet/nutrition, food scan, AI form coach, plan generation, web UI, social, offline mode.
