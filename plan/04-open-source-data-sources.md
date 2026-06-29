# 04 — Open-Source Data & Tooling

> Always verify the **current license** of each source before shipping. Licenses change; this is a starting map, not legal advice.

## Exercises
| Source | What it gives | Notes |
|--------|---------------|-------|
| **Free Exercise DB** (yuhonas/free-exercise-db) | ~800 exercises: name, target muscles, equipment, category, instructions, images | Public-domain-style; great seed for Phase 1 |
| **wger** (wger-project) | Exercise DB + workout manager, multilingual | AGPL — fine for data/self-host; check before reuse in closed product |
| ExerciseDB-style APIs | Structured exercise data + GIFs | Watch licensing/cost; prefer self-hosted open data |

**Plan:** seed our DB from Free Exercise DB, normalize into our schema (`10-data-model.md`), map each exercise to a mannequin animation clip.

## 3D mannequin & animations
| Source | Use |
|--------|-----|
| **Mixamo** (Adobe, free) | Rigged characters + thousands of motion clips (incl. workout motions); export glTF/FBX |
| **Ready Player Me** | Customizable avatars (glTF) |
| **Quaternius / Kenney** | Free low-poly characters (CC0) |
| **three.js + react-three-fiber + drei** | Render + animation playback |

**Plan:** one rigged GLB model + per-exercise animation clips. Where a real clip doesn't exist, author/retarget in Blender or approximate with the closest Mixamo motion.

## Yoga
| Source | Use |
|--------|-----|
| Open yoga pose datasets (e.g. Yoga-82 image dataset) | Pose names, categories, reference images |
| Public-domain pose descriptions | Benefits, alignment cues |

**Plan:** curate a starter set of common asanas; reuse mannequin pipeline or static imagery for demos.

## Nutrition / food
| Source | What it gives | Notes |
|--------|---------------|-------|
| **Open Food Facts** | Huge crowd-sourced product DB + barcodes | Open data (ODbL) |
| **USDA FoodData Central** | Authoritative nutrient data | Public domain, US-centric |
| **CalorieNinjas / Nutritionix** | NL food → nutrition APIs | Freemium; useful fallback |

**Plan:** Phase 3 logging uses Open Food Facts + USDA; barcode scan via Open Food Facts.

## Food image recognition (Phase 3)
| Option | Use |
|--------|-----|
| Open food-classification models (Food-101 etc.) | Baseline dish recognition |
| Self-hosted vision models | Identify dish → map to nutrition DB → estimate portions |
| Commercial vision/LLM APIs | Higher accuracy fallback if needed |

## Pose / form detection (Phase 4)
| Tool | Use |
|------|-----|
| **MediaPipe Pose** (Google, Apache-2.0) | On-device skeleton/landmarks |
| **MoveNet / TensorFlow(.js)** | Fast pose estimation, web + mobile |
| Custom rules / lightweight model | Compare user joints vs. reference angles |

## Licensing discipline
- Track each dataset's license in a `LICENSES.md` when we import it.
- Prefer **CC0 / public domain / permissive** for anything bundled in the app.
- Treat AGPL sources (e.g. wger) carefully — fine for data/self-hosted services, review before embedding code.
- Keep attributions where required.
