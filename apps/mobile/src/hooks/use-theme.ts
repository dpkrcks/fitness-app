import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors, type ColorScheme } from '@/theme/tokens';

/**
 * Resolves the active semantic color set from the design tokens. Honors the
 * system light/dark preference; falls back to dark (the app's primary look).
 */
export function useTheme() {
  const scheme = (useColorScheme() ?? 'dark') as ColorScheme;
  return colors[scheme];
}
