// Shared circular icon button, matched to the mockups' `.iconbtn`: 38×38 surface
// pill with a hairline border and soft shadow. Used for header right-actions (e.g.
// the «+» on My Circles) and other round affordances.
import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors, radius, shadows } from '@social-events/ui';

type Props = { children: ReactNode; onPress?: () => void; label?: string; testID?: string };

export function IconButton({ children, onPress, label, testID }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.btn}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
});
