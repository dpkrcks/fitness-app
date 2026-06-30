import { z } from "zod";

/**
 * Environment contract for the API. Parsed once at boot — the app refuses to
 * start on invalid/missing config rather than failing lazily at request time.
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  // App runtime connection (Neon POOLED endpoint) — consumed by the Prisma
  // driver adapter. Required: the app refuses to boot without a database.
  DATABASE_URL: z.string().url(),
  // Direct (unpooled) endpoint used ONLY by the Prisma CLI for migrations,
  // loaded via prisma.config.ts. Optional at app runtime.
  DIRECT_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Used by `ConfigModule.forRoot({ validate })`. Throws a readable error listing
 * every offending variable so a bad deploy fails fast and obviously.
 */
export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}
