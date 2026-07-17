// Shared fixed bottom action bar, matched to the mockups' `.stack-cta`: pinned to
// the bottom, translucent ivory + blur, 1px top hairline, safe-area aware. Wrap a
// primary button in it. Replaces the inline in-scroll buttons on the form screens.
import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@social-events/ui';

export function CtaBar({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const pad = { paddingBottom: insets.bottom + spacing[4] };
  // BlurView backdrop only renders on native / supported web; a translucent fill
  // keeps it legible everywhere.
  return (
    <BlurView intensity={Platform.OS === 'web' ? 20 : 30} tint="light" style={[styles.bar, pad]}>
      <View style={styles.tint} />
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    overflow: 'hidden',
  },
  tint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(247,245,239,0.82)' },
});
