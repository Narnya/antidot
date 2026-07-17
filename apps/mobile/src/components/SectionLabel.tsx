// Shared section label, matched to the mockups' `.divider-lbl`: uppercase Inter 13
// / 600, letter-spaced, muted, with the mockup's top/bottom rhythm. Replaces the
// 16px Inter-medium section headings used across Circle Home, Rhythm, Settings, etc.
import type { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';

import { colors, INTER_SEMIBOLD } from '@social-events/ui';

export function SectionLabel({ children, first }: { children: ReactNode; first?: boolean }) {
  return <Text style={[styles.label, first && styles.first]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontFamily: INTER_SEMIBOLD,
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.text.muted,
    marginTop: 22,
    marginBottom: 12,
    marginHorizontal: 2,
  },
  first: { marginTop: 4 },
});
