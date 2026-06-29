# 08 — Phase 4: AI Form Coach

The long-term moat: the camera watches the user and corrects their **gesture/form** in real time. Hardest and most valuable — build only after the core is validated.

## User stories
- As a user, I point the camera at myself, perform an exercise, and get **real-time feedback** on my form.
- As a user, I get **rep counting** and cues like "go deeper", "keep back straight", "knees over toes".
- As a user (yoga), I get **alignment feedback** on a held pose.

## Approach (incremental)
1. **Pose estimation:** detect body landmarks with **MediaPipe Pose** or **MoveNet (TensorFlow)** — prefer **on-device** for latency/privacy.
2. **Reference model:** for each supported exercise, define the correct motion as **joint-angle ranges + key checkpoints** (derived from the mannequin reference).
3. **Comparison engine:** compare live joint angles vs. reference → rule-based feedback first (angles, alignment, range of motion).
4. **Rep counting:** detect motion cycles via key-joint trajectory (e.g. hip angle for squats).
5. **Feedback UX:** visual overlay on skeleton + concise audio/text cues. Keep it encouraging, not nagging.
6. **(Later) learned model:** train a classifier on good/bad-form examples once data exists.

## Why on-device first
- Low latency (real-time correction needs <100ms feedback loop).
- Privacy (no video leaves the phone).
- Cost (no per-frame server inference).
- Server-side as fallback for heavy analysis or low-end devices.

## Tech
- **MediaPipe Pose / MoveNet** for landmarks (mobile + web).
- TensorFlow Lite / on-device runtime for inference.
- Rule engine for angle/checkpoint comparison (transparent, debuggable).
- Reference angles authored per exercise, validated against the 3D mannequin clips.

## Start small
Pick **3–5 high-value, easy-to-track exercises** first (squat, push-up, plank, lunge, bicep curl) where joint geometry is clear. Expand once the pipeline is solid.

## API / architecture
- Inference runs **on-device**; only aggregate results (reps, form score, session summary) sync to the API.
- Optional server pose service reuses the Phase 3 ML microservice pattern.

## Safety & UX
- Disclaimer: not a substitute for a professional trainer/physio.
- Calibration step (camera distance, full body in frame).
- Graceful degradation when pose confidence is low ("step back so I can see you").

## Definition of done (first cut)
- [ ] On-device pose estimation working in the app.
- [ ] Rep counting for 3–5 exercises.
- [ ] Rule-based form cues with skeleton overlay.
- [ ] Session summary (reps, form score) saved.

## Risks
| Risk | Mitigation |
|------|-----------|
| Real-time performance on phones | On-device lightweight models; cap resolution/FPS |
| False corrections frustrate users | Conservative thresholds; confidence gating; "beta" labeling |
| Camera/privacy concerns | On-device by default; explicit consent; no video upload |
| Exercise variety | Start with a few well-defined movements |
