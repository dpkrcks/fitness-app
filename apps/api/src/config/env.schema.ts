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
  // Auth — JWT signing. Access tokens are short-lived JWTs; refresh tokens are
  // opaque (not JWTs) but the access-token secret must still be strong.
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  // Lifetimes as duration strings (e.g. "15m", "30d"); parsed by auth/duration.ts.
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("30d"),
  // Email (SMTP) — OTP delivery transport. All optional: with no SMTP_HOST the
  // notifications module falls back to logging the code to the console (dev),
  // so the verify flow is testable without a mail server. Point these at
  // Mailpit or any relay to send real email — no code change. (plan/15 §B)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("Fitness App <no-reply@fitness.local>"),
  // OTP policy. TTL is a duration string (parsed by auth/duration.ts); attempts
  // and cooldown bound online brute-force of the 6-digit code.
  OTP_TTL: z.string().default("10m"),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  OTP_RESEND_COOLDOWN: z.coerce.number().int().nonnegative().default(60),
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
