import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { registerSchema } from '@fit/shared-types';

import { AuthForm } from '@/components/auth-form';
import { LogoMark } from '@/components/brand/logo';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/lib/auth/auth-context';
import { motion, spacing } from '@/theme/tokens';

export default function RegisterScreen() {
  const { status, signUp } = useAuth();
  const router = useRouter();

  if (status === 'authenticated') return <Redirect href="/profile" />;

  return (
    <Screen center>
      <Animated.View entering={FadeInDown.duration(motion.duration.base)} style={styles.content}>
        <LogoMark size={44} />
        <AuthForm
          title="Create account"
          subtitle="Start training in under a minute."
          submitLabel="Sign up"
          schema={registerSchema}
          onSubmit={async (values) => {
            await signUp(values);
            // No session yet — go confirm the emailed code.
            router.push({ pathname: '/verify', params: { email: values.email } });
          }}
          footer={
            <View style={styles.footer}>
              <ThemedText type="small" themeColor="textMuted">
                Already have an account?
              </ThemedText>
              <ThemedText type="linkPrimary" onPress={() => router.replace('/login')}>
                Log in
              </ThemedText>
            </View>
          }
        />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.four, alignItems: 'stretch' },
  footer: {
    flexDirection: 'row',
    gap: spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
