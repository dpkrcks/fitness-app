# ADR 0002 — Exercise figure demonstration: pre-rendered loops first

- **Status:** Accepted
- **Date:** 2026-06-29
- **Deciders:** Project owner + engineering

## Context
A core feature is showing each exercise on a humanoid **figure** so users learn correct form. The intuitive implementation — real-time 3D (three.js over `expo-gl`) — is the riskiest piece on mobile: fragile toolchain across the Expo/Metro bridge, skeletal-animation quirks, and performance/crash risk on low-end phones. The actual product requirement is a *clear, correct, repeatable demonstration*, not necessarily a freely-rotatable live model.

## Decision
- **v1 (Phase 1):** ship **pre-rendered 3D loops** — model + animate once in Blender, render each exercise to a short looping video/GIF (optionally front + side angle). The app just plays video; no 3D engine on device.
- **Fallback:** open-dataset GIF/image + step text when a loop isn't ready — animation coverage never blocks launch.
- **Companion feature:** a muscle **heatmap** on a reusable SVG body map, driven purely by exercise muscle data (no ML).
- **Real-time free-rotate 3D** is deferred to a **post-MVP upgrade**, gated on a **week-1 spike** (load one rigged GLB + play one clip on a real low-end phone, iOS + Android) before any UI commits to it.

## Consequences
- Removes the biggest launch risk while keeping the polished "figure performing the exercise" look (the approach most major fitness apps actually use).
- The rigged-model asset pipeline is built once and reused across pre-rendered loops, later live 3D, and Phase-4 AI form-coach reference angles — no wasted work.
- Cost shifts to producing per-exercise renders; mitigated by prioritizing the top 30–50 exercises and scripting the Blender pipeline.

## References
- `plan/11-figure-demonstration-options.md`, `plan/05-phase1-exercise-library.md`, `plan/09-mobile-mvp.md`
