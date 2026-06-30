import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { radii, spacing } from '@/theme/tokens';

/**
 * Brand name — placeholder. Change this one constant to rebrand the wordmark
 * everywhere (splash, auth headers).
 */
export const APP_NAME = 'Fit';

// Lightning bolt (a "volt" nod) — a closed path filled with the accent color.
const BOLT_PATH =
  'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z';

/** The bolt mark in a rounded tile — reusable in headers/avatars. */
export function LogoMark({ size = 56 }: { size?: number }) {
  const theme = useTheme();
  const tile = Math.round(size * 1.5);

  return (
    <View
      style={[
        styles.tile,
        { width: tile, height: tile, borderRadius: radii.lg, backgroundColor: theme.surfaceElevated },
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={BOLT_PATH} fill={theme.accent} />
      </Svg>
    </View>
  );
}

/** Vertical brand lockup: mark above the wordmark. */
export function Logo({ size = 64 }: { size?: number }) {
  return (
    <View style={styles.lockup}>
      <LogoMark size={size} />
      <ThemedText type="display">{APP_NAME}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', justifyContent: 'center' },
  lockup: { alignItems: 'center', gap: spacing.three },
});
