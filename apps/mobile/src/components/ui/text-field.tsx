import { forwardRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
  type TextInputProps,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { radii, spacing } from '@/theme/tokens';

export type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, style, onFocus, onBlur, ...rest },
  ref,
) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? theme.danger : focused ? theme.accent : theme.border;

  function handleFocus(event: NativeSyntheticEvent<TextInputFocusEventData>) {
    setFocused(true);
    onFocus?.(event);
  }
  function handleBlur(event: NativeSyntheticEvent<TextInputFocusEventData>) {
    setFocused(false);
    onBlur?.(event);
  }

  return (
    <View style={styles.container}>
      <ThemedText type="label" themeColor="textMuted">
        {label}
      </ThemedText>
      <TextInput
        ref={ref}
        style={[
          styles.input,
          { color: theme.text, backgroundColor: theme.surface, borderColor },
          style,
        ]}
        placeholderTextColor={theme.textFaint}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />
      {error ? (
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: spacing.one },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.three,
    fontSize: 16,
  },
});
