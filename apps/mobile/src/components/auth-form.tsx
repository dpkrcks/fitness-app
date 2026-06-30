import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { ApiError } from '@/lib/api';
import { spacing } from '@/theme/tokens';

type Credentials = { email: string; password: string };

/**
 * The slice of a zod schema this form relies on. Typed structurally so mobile
 * doesn't need a direct `zod` dependency — the loginSchema/registerSchema from
 * @fit/shared-types satisfy it.
 */
type CredentialSchema = {
  safeParse: (data: unknown) =>
    | { success: true; data: Credentials }
    | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } };
};

type AuthFormProps = {
  title: string;
  subtitle?: string;
  submitLabel: string;
  /** loginSchema or registerSchema from @fit/shared-types. */
  schema: CredentialSchema;
  onSubmit: (values: Credentials) => Promise<void>;
  footer: ReactNode;
};

/**
 * Email/password form shared by login + register. Validates with the shared zod
 * schema, surfaces per-field + form-level errors, and disables while submitting.
 */
export function AuthForm({
  title,
  subtitle,
  submitLabel,
  schema,
  onSubmit,
  footer,
}: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof Credentials, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setFormError(null);
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      const errors: Partial<Record<keyof Credentials, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Credentials;
        if (key && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await onSubmit(parsed.data);
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">{title}</ThemedText>
        {subtitle ? (
          <ThemedText type="body" themeColor="textMuted">
            {subtitle}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.fields}>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={fieldErrors.email}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder="you@example.com"
          editable={!submitting}
          returnKeyType="next"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          error={fieldErrors.password}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          textContentType="password"
          placeholder="••••••••"
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

      <Button label={submitLabel} onPress={handleSubmit} loading={submitting} />

      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.four, width: '100%' },
  header: { gap: spacing.one },
  fields: { gap: spacing.three },
});
