import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Spinner } from '@/components/ui/spinner';
import { useTheme } from '@/hooks/use-theme';
import { radii, spacing } from '@/theme/tokens';

type LoadingContextValue = {
  /** Show the overlay (ref-counted — pair every show() with a hide()). */
  show: () => void;
  hide: () => void;
  /** Run async work with the overlay visible until it settles. */
  withLoader: <T>(work: Promise<T> | (() => Promise<T>)) => Promise<T>;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

/**
 * App-wide blocking loader. Ref-counted so concurrent operations don't fight
 * over visibility. Mount once near the root; the overlay renders above all
 * routes and absorbs touches while active.
 */
export function LoadingProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const show = useCallback(() => setCount((c) => c + 1), []);
  const hide = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);

  const withLoader = useCallback(
    async function run<T>(work: Promise<T> | (() => Promise<T>)): Promise<T> {
      show();
      try {
        return await (typeof work === 'function' ? work() : work);
      } finally {
        hide();
      }
    },
    [show, hide],
  );

  const value = useMemo(() => ({ show, hide, withLoader }), [show, hide, withLoader]);

  return (
    <LoadingContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        {count > 0 ? <LoadingOverlay /> : null}
      </View>
    </LoadingContext.Provider>
  );
}

function LoadingOverlay() {
  const theme = useTheme();
  return (
    <Animated.View
      entering={FadeIn.duration(120)}
      exiting={FadeOut.duration(120)}
      style={styles.overlay}
      pointerEvents="auto"
    >
      <View style={[styles.card, { backgroundColor: theme.surfaceElevated }]}>
        <Spinner size={32} />
      </View>
    </Animated.View>
  );
}

export function useLoader(): LoadingContextValue {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error('useLoader must be used within a LoadingProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  card: {
    width: 72,
    height: 72,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.three,
  },
});
