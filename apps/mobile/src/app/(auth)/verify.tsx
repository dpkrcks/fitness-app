import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { LogoMark } from '@/components/brand/logo';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth/auth-context';
import { motion, spacing } from '@/theme/tokens';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

/** Email OTP entry. Reached after register, or after login of an unverified account. */
export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { verifyEmail, resendCode } = useAuth();
  const router = useRouter();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // A code was just sent on the way in, so start the resend timer immediately.
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  async function handleVerify() {
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code.');
      return;
    }
    if (!email) {
      setError('Missing email — go back and sign up again.');
      return;
    }
    setSubmitting(true);
    try {
      await verifyEmail({ identifier: email, code, purpose: 'SIGNUP' });
      // Freshly verified account → finish onboarding.
      router.replace('/profile-setup');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || !email) return;
    setError(null);
    try {
      await resendCode({ identifier: email, purpose: 'SIGNUP' });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (e) {
      // Server enforces its own cooldown — honor the seconds it reports.
      if (e instanceof ApiError && e.code === 'OTP_COOLDOWN') {
        const retry = (e.details as { retryAfterSeconds?: number } | undefined)
          ?.retryAfterSeconds;
        setCooldown(typeof retry === 'number' ? retry : RESEND_COOLDOWN_SECONDS);
        return;
      }
      setError(e instanceof ApiError ? e.message : 'Could not resend the code.');
    }
  }

  return (
    <Screen center>
      <Animated.View
        entering={FadeInDown.duration(motion.duration.base)}
        style={styles.content}
      >
        <LogoMark size={44} />
        <View style={styles.header}>
          <ThemedText type="title">Verify your email</ThemedText>
          <ThemedText type="body" themeColor="textMuted">
            {email
              ? `Enter the 6-digit code we sent to ${email}.`
              : 'Enter the 6-digit code we sent you.'}
          </ThemedText>
        </View>

        <TextField
          label="Verification code"
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, CODE_LENGTH))}
          error={error ?? undefined}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={CODE_LENGTH}
          placeholder="123456"
          editable={!submitting}
          returnKeyType="go"
          onSubmitEditing={handleVerify}
        />

        <Button label="Verify" onPress={handleVerify} loading={submitting} />

        <View style={styles.footer}>
          <ThemedText type="small" themeColor="textMuted">
            Didn&rsquo;t get it?
          </ThemedText>
          {cooldown > 0 ? (
            <ThemedText type="small" themeColor="textMuted">
              Resend in {cooldown}s
            </ThemedText>
          ) : (
            <ThemedText type="linkPrimary" onPress={handleResend}>
              Resend code
            </ThemedText>
          )}
        </View>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.four, alignItems: 'stretch' },
  header: { gap: spacing.one },
  footer: {
    flexDirection: 'row',
    gap: spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
