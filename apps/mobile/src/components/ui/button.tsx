import {
  Pressable,
  StyleSheet,
  type GestureResponderEvent,
  type PressableProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Spinner } from '@/components/ui/spinner';
import { useTheme } from '@/hooks/use-theme';
import { motion, radii, spacing } from '@/theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: Variant;
  loading?: boolean;
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  onPressIn,
  onPressOut,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isDisabled = disabled || loading;

  const background: Record<Variant, string> = {
    primary: theme.accent,
    secondary: theme.surfaceElevated,
    ghost: 'transparent',
    danger: theme.danger,
  };
  const foreground: Record<Variant, string> = {
    primary: theme.onAccent,
    secondary: theme.text,
    ghost: theme.accentText,
    danger: theme.onDanger,
  };

  function handlePressIn(event: GestureResponderEvent) {
    scale.value = withTiming(0.97, { duration: motion.duration.fast });
    onPressIn?.(event);
  }
  function handlePressOut(event: GestureResponderEvent) {
    scale.value = withTiming(1, { duration: motion.duration.fast });
    onPressOut?.(event);
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.base,
        {
          backgroundColor: background[variant],
          borderColor: variant === 'secondary' ? theme.border : 'transparent',
          opacity: isDisabled ? 0.5 : 1,
        },
        animatedStyle,
      ]}
      {...rest}
    >
      {loading ? (
        <Spinner size={20} color={foreground[variant]} />
      ) : (
        <ThemedText type="label" style={{ color: foreground[variant] }}>
          {label}
        </ThemedText>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.two,
  },
});
