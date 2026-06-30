import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { ColorRole } from '@/theme/tokens';

export type ThemedViewProps = ViewProps & {
  /** Semantic background role (default: `background`). */
  type?: ColorRole;
};

export function ThemedView({ style, type, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();
  return <View style={[{ backgroundColor: theme[type ?? 'background'] }, style]} {...otherProps} />;
}
