import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  type Theme,
} from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useMemo } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { AuthProvider } from '@/lib/auth/auth-context';
import { LoadingProvider } from '@/lib/loading/loading-context';
import { queryClient } from '@/lib/query-client';
import { type ColorScheme } from '@/theme/tokens';

export default function RootLayout() {
  const scheme = (useColorScheme() ?? 'dark') as ColorScheme;
  const theme = useTheme();

  // Drive the navigator's own scene/card background from our tokens so the
  // dark frame is painted *under* every transition — otherwise native-stack's
  // default white container flashes through during the slide.
  const navTheme = useMemo<Theme>(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: theme.background,
        card: theme.background,
        text: theme.text,
        border: theme.border,
        primary: theme.accent,
      },
    };
  }, [scheme, theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LoadingProvider>
          <SafeAreaProvider>
            <ThemeProvider value={navTheme}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: theme.background },
                }}
              />
            </ThemeProvider>
          </SafeAreaProvider>
        </LoadingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
