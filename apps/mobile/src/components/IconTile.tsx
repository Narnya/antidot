// Shared icon tile, matched to the mockups' `.ic-tile`: a 42×42 rounded-square
// (radius 12) with a soft trust-green fill, holding an icon. Replaces the ad-hoc
// full-circle icon wrappers used on Notifications / Circle Home / Rhythm / Settings.
import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius } from '@social-events/ui';

type Props = {
  children: ReactNode;
  /** Fill colour — defaults to the soft trust-green (mockup default). */
  bg?: string;
  size?: number;
  /** Full-circle tile (mockup `.av-lg`) instead of the rounded square (`.ic-tile`). */
  round?: boolean;
  style?: ViewStyle;
};

export function IconTile({ children, bg = colors.trust.verifiedBg, size = 42, round, style }: Props) {
  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size, borderRadius: round ? radius.full : radius.md, backgroundColor: bg },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
