const UNIT_MS = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
} as const;

type Unit = keyof typeof UNIT_MS;

/**
 * Parses a short duration string ("15m", "30d", "24h", "60s") to milliseconds.
 * Used for the refresh-token expiry and the access-token `expiresIn`.
 */
export function durationToMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid duration "${value}" (expected e.g. "15m", "30d")`);
  }
  return Number(match[1]) * UNIT_MS[match[2] as Unit];
}
