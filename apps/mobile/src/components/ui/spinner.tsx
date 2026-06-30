import { useEffect } from 'react';
import { type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

export type SpinnerProps = {
  size?: number;
  /** Ring highlight color (defaults to the accent). */
  color?: string;
};

/** Branded spinner: an accent arc rotating over a faint track. */
export function Spinner({ size = 28, color }: SpinnerProps) {
  const theme = useTheme();
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 900, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(rotation);
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const ring: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: Math.max(2, Math.round(size / 10)),
    borderColor: theme.border,
    borderTopColor: color ?? theme.accent,
  };

  return <Animated.View style={[ring, animatedStyle]} />;
}
