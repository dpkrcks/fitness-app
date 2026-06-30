import { useQuery } from '@tanstack/react-query';
import { Redirect } from 'expo-router';
import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { LogoMark } from '@/components/brand/logo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Spinner } from '@/components/ui/spinner';
import { ApiError } from '@/lib/api';
import { getMe, getProfile } from '@/lib/auth/auth-api';
import { useAuth } from '@/lib/auth/auth-context';
import { useLoader } from '@/lib/loading/loading-context';
import { motion, radii, spacing } from '@/theme/tokens';

export default function ProfileScreen() {
  const { status, user, signOut, withFreshToken } = useAuth();
  const { withLoader } = useLoader();

  // Re-fetch /auth/me through the protected path (exercises Bearer + 401→refresh).
  const me = useQuery({
    queryKey: ['me'],
    queryFn: () => withFreshToken(getMe),
    enabled: status === 'authenticated',
  });

  // Has-profile gate: a 404 means onboarding hasn't run yet → route there.
  const profileQuery = useQuery({
    queryKey: ['me', 'profile'],
    queryFn: () => withFreshToken(getProfile),
    enabled: status === 'authenticated',
    retry: false,
  });

  if (status === 'loading' || (status === 'authenticated' && profileQuery.isLoading)) {
    return (
      <Screen center style={styles.loading}>
        <Spinner />
      </Screen>
    );
  }
  if (status === 'unauthenticated') return <Redirect href="/login" />;
  if (
    profileQuery.error instanceof ApiError &&
    profileQuery.error.status === 404
  ) {
    return <Redirect href="/profile-setup" />;
  }

  const profile = me.data ?? user;
  const joined = profile ? new Date(profile.createdAt).toLocaleDateString() : '—';

  return (
    <Screen>
      <Animated.View entering={FadeIn.duration(motion.duration.base)} style={styles.body}>
        <View style={styles.header}>
          <LogoMark size={40} />
          <View style={styles.headerText}>
            <ThemedText type="subtitle">Profile</ThemedText>
            <ThemedText type="small" themeColor="textMuted">
              {profile?.email}
            </ThemedText>
          </View>
        </View>

        <ThemedView type="surface" style={styles.card}>
          <Row label="Email" value={profile?.email} />
          <Divider />
          <Row
            label="Email verified"
            value={profile?.emailVerified ? 'Yes' : 'Not yet'}
            highlight={profile?.emailVerified ? 'accent' : 'textMuted'}
          />
          <Divider />
          <Row label="Member since" value={joined} />
          <Divider />
          <Row label="User ID" value={profile?.id} mono />
        </ThemedView>

        <View style={styles.spacer} />
        <Button label="Log out" variant="danger" onPress={() => withLoader(signOut)} />
      </Animated.View>
    </Screen>
  );
}

function Row({
  label,
  value,
  mono = false,
  highlight,
}: {
  label: string;
  value?: ReactNode;
  mono?: boolean;
  highlight?: 'accent' | 'textMuted';
}) {
  const valueColor =
    highlight === 'accent' ? 'accentText' : highlight === 'textMuted' ? 'textMuted' : undefined;
  return (
    <View style={styles.row}>
      <ThemedText type="small" themeColor="textMuted">
        {label}
      </ThemedText>
      <ThemedText type={mono ? 'code' : 'label'} themeColor={valueColor}>
        {value ?? '—'}
      </ThemedText>
    </View>
  );
}

function Divider() {
  return <ThemedView type="border" style={styles.divider} />;
}

const styles = StyleSheet.create({
  body: { flex: 1, gap: spacing.four },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.three },
  headerText: { gap: spacing.half },
  card: {
    borderRadius: radii.lg,
    paddingHorizontal: spacing.four,
    paddingVertical: spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.three,
    gap: spacing.three,
  },
  divider: { height: StyleSheet.hairlineWidth },
  spacer: { flex: 1 },
  loading: { alignItems: 'center', justifyContent: 'center' },
});
