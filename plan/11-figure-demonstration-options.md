# 11 — Figure Demonstration Options

How we show "a figure performing the exercise with correct form." The figure is the **requirement**; real-time 3D is only one way to deliver it. This doc records the options and our decision.

## Key insight
The goal — **demonstrate correct form** — needs a *clear, correct, repeatable demonstration*. Free rotation of a live 3D model is a nice-to-have, not the core value. Most successful fitness apps (Fitbod, Freeletics, Centr) use **pre-rendered 3D loops or video**, not real-time 3D.

## The options

### 1. Real-time interactive 3D (three.js / r3f over expo-gl)
Rigged model animates live on the phone; user can rotate/zoom.
- ✅ Free rotate/zoom to any angle, change speed live, one model reused everywhere.
- ❌ Hardest to build; fragile toolchain (expo-gl ↔ three.js ↔ expo-three version drift); performance/crash risk on low-end phones; skeletal animation is the riskiest part.

### 2. Pre-rendered 3D video/GIF loops ⭐ CHOSEN for v1
Same 3D figure built once in Blender, rendered to a short looping clip; the app just plays it.
- ✅ Looks identical to live 3D; rock-solid playback on every phone; near-zero rendering risk.
- ✅ Render 2–3 fixed angles (front/side/45°) to recover most multi-angle value.
- ❌ Not freely rotatable; each exercise is a file to produce/store.

### 3. Real human demonstration video
Film a trainer (or license a stock library).
- ✅ Most authentic for form — real muscle, tempo, breathing cues; high user trust.
- ❌ Doesn't scale cheaply (filming hundreds), fixed angle, larger files, costly reshoots. Good for a curated top set.

### 4. Lottie / 2D vector animation
Animator-drawn figure exported as Lottie JSON.
- ✅ Tiny files, very smooth, resolution-independent, trivial to play in RN.
- ❌ Stylized (not realistic), fixed angle, each exercise needs an animator.

### 5. Animated GIF / image sequences
Looping GIF per exercise — the open Free Exercise DB already ships these.
- ✅ Trivial; large open libraries already exist; works everywhere.
- ❌ Lower quality, fixed angle, no interactivity. Used as our **fallback**.

### 6. Embedded `<model-viewer>` / Spline in a WebView
A web 3D component renders a GLB with orbit controls inside a WebView.
- ✅ Interactive 3D without fighting the expo-gl bridge; loading/animation/controls handled for you.
- ❌ WebView overhead; less native feel; still a perf question on low-end devices. Possible middle-ground for the Phase-2 rotate upgrade.

## Comparison

| Approach | Form clarity | Multi-angle | Build effort | Reliability | Scales to 100s |
|---|---|---|---|---|---|
| 1. Real-time 3D | High | ✅ free rotate | **Hard** | Risky | ✅ (1 model) |
| **2. Pre-rendered 3D video** ⭐ | High | ⚠️ fixed angles | Medium | **Solid** | ⚠️ render each |
| 3. Human video | **Highest** | ❌ | High (filming) | Solid | ❌ costly |
| 4. Lottie | Medium | ❌ | Medium | Solid | ⚠️ animate each |
| 5. GIF/images | Low–Med | ❌ | **Easy** | Solid | ✅ open libs |
| 6. WebView 3D | High | ✅ rotate | Medium | Medium | ✅ (1 model) |

## Decision
- **v1 (Phase 1):** **#2 pre-rendered 3D loops** as primary, **#5 open GIFs/images** as fallback for un-rendered exercises. Ships the figure on time with no on-device 3D risk.
- **Phase 2 upgrade:** add **#1 real-time free-rotate 3D** (or **#6** WebView 3D) — only after a **week-1 spike** proves viability on a real low-end phone (iOS + Android).
- The rigged-model asset pipeline is built once and **reused** across #2, #1, and the Phase-4 AI form-coach reference angles — no wasted work.

## Week-1 spike (GO / NO-GO for real-time 3D)
> Can we load one rigged GLB and play one Mixamo clip at acceptable FPS on a real low-end phone, on both iOS and Android?
- **GO** → schedule real-time 3D as the Phase-2 rotate upgrade.
- **NO-GO** → stay on pre-rendered loops; optionally evaluate WebView 3D (#6). Either way v1 is unaffected.

## Companion feature: muscle heatmap / hotspots
Independent of which figure approach we use. A reusable body-map figure (front/back) colors the muscles an exercise targets (**primary** strong, **secondary** light), driven purely by exercise muscle data — **SVG body map** recommended for v1. See `05-phase1-exercise-library.md` and `10-data-model.md`.
