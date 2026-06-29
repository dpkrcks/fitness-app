import { z } from "zod";
import {
  BodyPartSchema,
  DifficultySchema,
  EquipmentSchema,
  LocationSchema,
  MuscleRegionSchema,
} from "../common/body";

/**
 * Exercise contract shared by api (validation), web, and mobile (typing).
 * Mirrors the persisted model in plan/10-data-model.md.
 */

/** Pre-rendered demonstration loops (the v1 figure approach). */
export const DemoLoopUrlsSchema = z.object({
  front: z.string().url().optional(),
  side: z.string().url().optional(),
});
export type DemoLoopUrls = z.infer<typeof DemoLoopUrlsSchema>;

/** Muscle-heatmap mapping: which body-map regions this exercise activates. */
export const BodyMapRegionsSchema = z.object({
  primary: z.array(MuscleRegionSchema),
  secondary: z.array(MuscleRegionSchema),
});
export type BodyMapRegions = z.infer<typeof BodyMapRegionsSchema>;

export const ExerciseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().default(""),
  instructions: z.array(z.string()),
  bodyPart: BodyPartSchema,
  primaryMuscles: z.array(z.string()),
  secondaryMuscles: z.array(z.string()),
  equipment: EquipmentSchema,
  location: LocationSchema,
  difficulty: DifficultySchema,
  imageUrls: z.array(z.string().url()),
  demoLoopUrls: DemoLoopUrlsSchema.nullable(),
  animationClipId: z.string().nullable(),
  bodyMapRegions: BodyMapRegionsSchema,
  source: z.string(),
  license: z.string(),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

/** Query params for the exercise list endpoint (validated at the api boundary). */
export const ExerciseListQuerySchema = z.object({
  bodyPart: BodyPartSchema.optional(),
  equipment: EquipmentSchema.optional(),
  location: LocationSchema.optional(),
  difficulty: DifficultySchema.optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type ExerciseListQuery = z.infer<typeof ExerciseListQuerySchema>;
