import { z } from "zod";

/**
 * Profile contracts shared by api (request validation) and mobile (onboarding
 * form + types). Mirrors plan/15 §C: collected once after OTP verification.
 * `displayName` + `dateOfBirth` are required; everything else is skippable and
 * filled in later from a Profile screen (body metrics feed Phase-3 calcs).
 */

/** Minimum age to use the app. Mirrored server-side; keep in sync if changed. */
export const MIN_AGE_YEARS = 13;

export const unitsSchema = z.enum(["metric", "imperial"]);
export type Units = z.infer<typeof unitsSchema>;

export const sexSchema = z.enum(["male", "female", "other"]);
export type Sex = z.infer<typeof sexSchema>;

export const goalSchema = z.enum(["lose", "maintain", "gain"]);
export type Goal = z.infer<typeof goalSchema>;

export const activityLevelSchema = z.enum([
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
]);
export type ActivityLevel = z.infer<typeof activityLevelSchema>;

/** True when `iso` (YYYY-MM-DD) is at least `years` years before today (UTC). */
export function isAtLeastAge(iso: string, years: number): boolean {
  const dob = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(dob.getTime())) return false;
  const now = new Date();
  const threshold = Date.UTC(
    now.getUTCFullYear() - years,
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return dob.getTime() <= threshold;
}

const dateOfBirthField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD")
  .refine(
    (v) => !Number.isNaN(new Date(`${v}T00:00:00Z`).getTime()),
    "Enter a valid date",
  )
  .refine(
    (v) => new Date(`${v}T00:00:00Z`).getTime() < Date.now(),
    "Date of birth must be in the past",
  )
  .refine(
    (v) => isAtLeastAge(v, MIN_AGE_YEARS),
    `You must be at least ${MIN_AGE_YEARS} years old`,
  );

/** Create/complete a profile. Required fields gate onboarding; rest are optional. */
export const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Enter your name")
    .max(50, "Name is too long"),
  dateOfBirth: dateOfBirthField,
  units: unitsSchema.default("metric"),
  sex: sexSchema.optional(),
  heightCm: z.number().int().positive().max(300).optional(),
  weightKg: z.number().positive().max(1000).optional(),
  goal: goalSchema.optional(),
  activityLevel: activityLevelSchema.optional(),
});
export type ProfileInput = z.infer<typeof profileSchema>;

/** Profile as returned to clients (deferred fields are null until filled in). */
export const ProfilePublicSchema = z.object({
  displayName: z.string(),
  dateOfBirth: z.string(), // YYYY-MM-DD
  units: unitsSchema,
  sex: sexSchema.nullable(),
  heightCm: z.number().nullable(),
  weightKg: z.number().nullable(),
  goal: goalSchema.nullable(),
  activityLevel: activityLevelSchema.nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type ProfilePublic = z.infer<typeof ProfilePublicSchema>;
