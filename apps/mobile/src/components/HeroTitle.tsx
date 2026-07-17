// Shared hero headline, matched to the mockups' `.h-hero`: Playfair 30 / 600 in
// brand green, tight line-height. Used as the standalone screen title on the auth /
// onboarding / gate screens (Login «С возвращением», Signup «Создай аккаунт», …).
import type { ReactNode } from 'react';
import { StyleSheet, Text, type TextStyle } from 'react-native';

import { colors, PLAYFAIR_FAMILY } from '@social-events/ui';

export function HeroTitle({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontFamily: PLAYFAIR_FAMILY,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.4,
    color: colors.action.primary,
  },
});
