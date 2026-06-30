/**
 * Design tokens — the single source of truth for the app's visual language.
 *
 * Pure data: NO react-native / react imports, so these lift directly into
 * `apps/web` later (e.g. emitted as CSS custom properties). The mobile theme
 * (`hooks/use-theme.ts`) and primitives consume the semantic `colors` below;
 * everything else (spacing, radii, type, motion) is shared verbatim.
 *
 * Scheme: "Volt" — an athletic lime accent on near-black, with a clean light
 * mode. Pick colors by ROLE (e.g. `accent`, `surface`), never by raw hex.
 */

/** Raw palette — the only place hex literals live. Roles map onto these. */
export const palette = {
  black: '#0A0B0D',
  ink900: '#16181D',
  ink800: '#1E2128',
  ink700: '#2A2E37',
  ink600: '#3A3F4B',
  white: '#FFFFFF',
  gray100: '#F4F5F7',
  gray200: '#E4E6EB',
  gray400: '#9AA0AA',
  gray500: '#6B7280',
  gray600: '#5B616E',
  // Volt lime
  volt: '#A3E635',
  voltPressed: '#8FCC2E',
  voltDim: '#4F7A0A', // readable lime for text/links on light backgrounds
  danger: '#E5484D',
  dangerPressed: '#CC3A3F',
} as const;

/** Semantic color roles per scheme. Components reference these names only. */
export const colors = {
  light: {
    background: palette.white,
    surface: palette.gray100,
    surfaceElevated: palette.white,
    border: palette.gray200,
    text: palette.black,
    textMuted: palette.gray600,
    textFaint: palette.gray400,
    accent: palette.volt,
    accentPressed: palette.voltPressed,
    onAccent: palette.black,
    accentText: palette.voltDim,
    danger: palette.danger,
    onDanger: palette.white,
    // legacy aliases (kept so older screens keep compiling during the redesign)
    backgroundElement: palette.gray100,
    backgroundSelected: palette.gray200,
    textSecondary: palette.gray600,
  },
  dark: {
    background: palette.black,
    surface: palette.ink900,
    surfaceElevated: palette.ink800,
    border: palette.ink700,
    text: palette.white,
    textMuted: palette.gray400,
    textFaint: palette.gray500,
    accent: palette.volt,
    accentPressed: palette.voltPressed,
    onAccent: palette.black,
    accentText: palette.volt,
    danger: palette.danger,
    onDanger: palette.white,
    // legacy aliases
    backgroundElement: palette.ink900,
    backgroundSelected: palette.ink800,
    textSecondary: palette.gray400,
  },
} as const;

export type ColorScheme = keyof typeof colors;
export type ColorRole = keyof typeof colors.light & keyof typeof colors.dark;

/** 4px base spacing scale. */
export const spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

/** Corner radii. `pill` for fully-rounded buttons/badges. */
export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Type scale: size / lineHeight / weight. Font family is set by the platform. */
export const typography = {
  display: { fontSize: 40, lineHeight: 46, fontWeight: '800' },
  title: { fontSize: 30, lineHeight: 36, fontWeight: '700' },
  subtitle: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  code: { fontSize: 12, lineHeight: 18, fontWeight: '500' },
} as const;

/** Animation timing (ms) + a standard easing for entrances. */
export const motion = {
  duration: { fast: 150, base: 250, slow: 420 },
  // cubic-bezier control points (easeOutCubic-ish) — usable on web too.
  easeOut: [0.22, 1, 0.36, 1] as const,
} as const;

export const layout = {
  maxContentWidth: 480,
} as const;
