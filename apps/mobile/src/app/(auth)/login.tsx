import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { loginSchema } from '@fit/shared-types';

import { AuthForm } from '@/components/auth-form';
import { LogoMark } from '@/components/brand/logo';
import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth/auth-context';
import { motion, spacing } from '@/theme/tokens';

export default function LoginScreen() {
  const { status, signIn } = useAuth();
  const router = useRouter();

  if (status === 'authenticated') return <Redirect href="/profile" />;

  return (
    <Screen center>
      <Animated.View entering={FadeInDown.duration(motion.duration.base)} style={styles.content}>
        <LogoMark size={44} />
        <AuthForm
          title="Welcome back"
          subtitle="Log in to continue your training."
          submitLabel="Log in"
          schema={loginSchema}
          onSubmit={async (values) => {
            try {
              await signIn(values);
              router.replace('/profile');
            } catch (error) {
              // Unverified account → send them to finish email verification.
              if (error instanceof ApiError && error.code === 'EMAIL_NOT_VERIFIED') {
                router.push({ pathname: '/verify', params: { email: values.email } });
                return;
              }
              throw error; // let AuthForm surface other failures
            }
          }}
          footer={
            <View style={styles.footer}>
              <ThemedText type="small" themeColor="textMuted">
                No account?
              </ThemedText>
              <ThemedText type="linkPrimary" onPress={() => router.replace('/register')}>
                Create one
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
