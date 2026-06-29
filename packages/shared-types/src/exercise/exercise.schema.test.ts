import { describe, expect, it } from "vitest";
import { ExerciseListQuerySchema, ExerciseSchema } from "./exercise.schema";

describe("ExerciseSchema", () => {
  const valid = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Barbell Bench Press",
    slug: "barbell-bench-press",
    description: "",
    instructions: ["Lie on the bench", "Lower the bar to your chest", "Press up"],
    bodyPart: "chest",
    primaryMuscles: ["pectoralis major"],
    secondaryMuscles: ["triceps", "front deltoid"],
    equipment: "barbell",
    location: "gym",
    difficulty: "intermediate",
    imageUrls: ["https://cdn.example.com/bench/0.png"],
    demoLoopUrls: { front: "https://cdn.example.com/bench/front.mp4" },
    animationClipId: null,
    bodyMapRegions: { primary: ["chest"], secondary: ["triceps", "frontDeltoids"] },
    source: "free-exercise-db",
    license: "public-domain",
  };

  it("accepts a valid exercise", () => {
    expect(ExerciseSchema.parse(valid)).toMatchObject({ slug: "barbell-bench-press" });
  });

  it("rejects an invalid body part", () => {
    expect(() => ExerciseSchema.parse({ ...valid, bodyPart: "wings" })).toThrow();
  });

  it("rejects an unknown muscle region in the heatmap mapping", () => {
    expect(() =>
      ExerciseSchema.parse({ ...valid, bodyMapRegions: { primary: ["gills"], secondary: [] } }),
    ).toThrow();
  });
});

describe("ExerciseListQuerySchema", () => {
  it("applies pagination defaults and coerces numeric strings", () => {
    const parsed = ExerciseListQuerySchema.parse({ page: "2" });
    expect(parsed).toMatchObject({ page: 2, limit: 20 });
  });

  it("rejects a limit above the cap", () => {
    expect(() => ExerciseListQuerySchema.parse({ limit: "500" })).toThrow();
  });
});
