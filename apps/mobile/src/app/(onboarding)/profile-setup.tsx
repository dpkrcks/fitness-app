import { useQueryClient } from '@tanstack/react-query';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { profileSchema } from '@fit/shared-types';

import { LogoMark } from '@/components/brand/logo';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { ApiError } from '@/lib/api';
import { saveProfile } from '@/lib/auth/auth-api';
import { useAuth } from '@/lib/auth/auth-context';
import { motion, spacing } from '@/theme/tokens';

type RequiredField = 'displayName' | 'dateOfBirth';

/** Post-verification onboarding: name + date of birth are required; rest is later. */
export default function ProfileSetupScreen() {
  const { status, withFreshToken } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<RequiredField, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'unauthenticated') return <Redirect href="/login" />;

  async function handleSubmit() {
    setFormError(null);
    // units defaults to "metric"; body metrics are skipped here and added later.
    const parsed = profileSchema.safeParse({ displayName, dateOfBirth });
    if (!parsed.success) {
      const errors: Partial<Record<RequiredField, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as RequiredField;
        if ((key === 'displayName' || key === 'dateOfBirth') && !errors[key]) {
          errors[key] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await withFreshToken((token) => saveProfile(token, parsed.data));
      // The has-profile gate reads this query — drop the cached 404.
      await queryClient.invalidateQueries({ queryKey: ['me', 'profile'] });
      router.replace('/profile');
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Could not save your profile.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <Animated.View
        entering={FadeInDown.duration(motion.duration.base)}
        style={styles.content}
      >
        <LogoMark size={44} />
        <View style={styles.header}>
          <ThemedText type="title">Tell us about you</ThemedText>
          <ThemedText type="body" themeColor="textMuted">
            Just the essentials to personalize your training — you can add the rest later.
          </ThemedText>
        </View>

        <View style={styles.fields}>
          <TextField
            label="Display name"
            value={displayName}
            onChangeText={setDisplayName}
            error={fieldErrors.displayName}
            autoCapitalize="words"
            placeholder="Alex"
            editable={!submitting}
            returnKeyType="next"
          />
          <TextField
            label="Date of birth"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            error={fieldErrors.dateOfBirth}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
            placeholder="YYYY-MM-DD"
            editable={!submitting}
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
          />
          {formError ? (
            <ThemedText type="small" themeColor="danger">
              {formError}
            </ThemedText>
          ) : null}
        </View>

        <Button label="Continue" onPress={handleSubmit} loading={submitting} />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.four },
  header: { gap: spacing.one },
  fields: { gap: spacing.three },
});
