import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { typography, type ColorRole } from '@/theme/tokens';

type Variant =
  | 'display'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'label'
  | 'small'
  | 'smallBold'
  | 'code'
  | 'linkPrimary';

export type ThemedTextProps = TextProps & {
  type?: Variant;
  themeColor?: ColorRole;
};

const variants = StyleSheet.create({
  display: typography.display,
  title: typography.title,
  subtitle: typography.subtitle,
  body: typography.body,
  label: typography.label,
  small: typography.small,
  smallBold: { ...typography.small, fontWeight: '700' },
  code: { ...typography.code, fontFamily: Fonts?.mono },
  linkPrimary: typography.label,
});

export function ThemedText({ style, type = 'body', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  // Links use the accent role; everything else uses the requested role (or text).
  const color = type === 'linkPrimary' ? theme.accentText : theme[themeColor ?? 'text'];

  return <Text style={[{ color }, variants[type], style]} {...rest} />;
}
