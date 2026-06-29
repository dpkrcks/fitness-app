import { z } from "zod";

/**
 * Controlled vocabularies for the body/exercise domain.
 * Enums (not free strings) keep filtering and the muscle heatmap consistent
 * across mobile, web, and api. See plan/10-data-model.md.
 */

export const BODY_PARTS = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
  "fullBody",
] as const;
export const BodyPartSchema = z.enum(BODY_PARTS);
export type BodyPart = z.infer<typeof BodyPartSchema>;

export const EQUIPMENT = [
  "none",
  "machine",
  "dumbbell",
  "barbell",
  "kettlebell",
  "band",
  "cable",
  "bodyweight",
  "other",
] as const;
export const EquipmentSchema = z.enum(EQUIPMENT);
export type Equipment = z.infer<typeof EquipmentSchema>;

/** Where the exercise can be performed (drives the gym/home filter). */
export const LOCATIONS = ["gym", "home", "both"] as const;
export const LocationSchema = z.enum(LOCATIONS);
export type Location = z.infer<typeof LocationSchema>;

export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
export const DifficultySchema = z.enum(DIFFICULTIES);
export type Difficulty = z.infer<typeof DifficultySchema>;

/**
 * Named regions on the reusable body-map figure (front/back) used by the
 * muscle heatmap. Exercises reference these to highlight what they target.
 */
export const MUSCLE_REGIONS = [
  "neck",
  "trapezius",
  "frontDeltoids",
  "sideDeltoids",
  "rearDeltoids",
  "chest",
  "biceps",
  "triceps",
  "forearms",
  "abdominals",
  "obliques",
  "lats",
  "upperBack",
  "lowerBack",
  "glutes",
  "quadriceps",
  "hamstrings",
  "adductors",
  "abductors",
  "calves",
] as const;
export const MuscleRegionSchema = z.enum(MUSCLE_REGIONS);
export type MuscleRegion = z.infer<typeof MuscleRegionSchema>;
