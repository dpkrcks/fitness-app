import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { API_BASE_URL, getHealth } from '@/lib/api';

export default function HomeScreen() {
  const health = useQuery({ queryKey: ['health'], queryFn: getHealth });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle">API health</ThemedText>

        <ThemedView type="backgroundElement" style={styles.card}>
          <Field label="Endpoint">
            <ThemedText type="code">{`${API_BASE_URL}/health`}</ThemedText>
          </Field>

          {health.isPending && (
            <ThemedView type="backgroundElement" style={styles.statusRow}>
              <ActivityIndicator />
              <ThemedText type="small">Checking…</ThemedText>
            </ThemedView>
          )}

          {health.isError && (
            <Field label="Status">
              <ThemedText type="smallBold">❌ unreachable</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {health.error.message}
              </ThemedText>
            </Field>
          )}

          {health.isSuccess && (
            <>
              <Field label="Status">
                <ThemedText type="smallBold">✅ {health.data.status}</ThemedText>
              </Field>
              <Field label="Server time">
                <ThemedText type="small">{health.data.timestamp}</ThemedText>
              </Field>
            </>
          )}
        </ThemedView>

        <ThemedText
          type="linkPrimary"
          style={styles.retry}
          onPress={() => health.refetch()}
        >
          Re-check
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <ThemedView type="backgroundElement" style={styles.field}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {label}
      </ThemedText>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.four,
    gap: Spacing.four,
  },
  card: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.three,
  },
  field: {
    gap: Spacing.one,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  retry: {
    alignSelf: 'flex-start',
  },
});
