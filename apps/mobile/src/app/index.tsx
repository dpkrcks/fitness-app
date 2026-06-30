import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Logo } from '@/components/brand/logo';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/lib/auth/auth-context';
import { motion, spacing } from '@/theme/tokens';

/** Start / splash screen. Doubles as the launch screen while auth bootstraps. */
export default function StartScreen() {
  const { status } = useAuth();
  const router = useRouter();

  // Already signed in → straight into the app.
  if (status === 'authenticated') return <Redirect href="/profile" />;

  return (
    <Screen>
      <Animated.View
        entering={FadeIn.duration(motion.duration.slow)}
        style={styles.hero}
      >
        <Logo />
        <ThemedText type="body" themeColor="textMuted" style={styles.tagline}>
          Train smarter. Move better. Every day.
        </ThemedText>
      </Animated.View>

      {status === 'loading' ? (
        <View style={[styles.actions, styles.center]}>
          <Spinner />
        </View>
      ) : (
        <Animated.View
          entering={FadeInDown.delay(150).duration(motion.duration.slow)}
          style={styles.actions}
        >
          <Button label="Get started" onPress={() => router.push('/register')} />
          <View style={styles.loginRow}>
            <ThemedText type="small" themeColor="textMuted">
              Already have an account?
            </ThemedText>
            <ThemedText type="linkPrimary" onPress={() => router.push('/login')}>
              Log in
            </ThemedText>
          </View>
        </Animated.View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.three,
  },
  tagline: { textAlign: 'center' },
  actions: { gap: spacing.three, paddingBottom: spacing.two },
  center: { alignItems: 'center' },
  loginRow: {
    flexDirection: 'row',
    gap: spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
