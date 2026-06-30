import { StyleSheet, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { layout, spacing } from '@/theme/tokens';

export type ScreenProps = ViewProps & {
  /** Vertically center the content (used by the auth screens). */
  center?: boolean;
};

/** Standard screen frame: themed background + safe area + centered max-width column. */
export function Screen({ children, style, center = false, ...rest }: ScreenProps) {
  return (
    <ThemedView style={styles.fill} {...rest}>
      <SafeAreaView style={styles.fill}>
        <ThemedView style={[styles.content, center && styles.center, style]}>
          {children}
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.four,
    paddingVertical: spacing.four,
    gap: spacing.four,
  },
  center: { justifyContent: 'center' },
});
