// Shared buttons, matched to the mockups' `.btn` / `.btn-ghost`: a 56px green pill
// (radius 18) primary and a 54px surface-bordered ghost. Inter 600 / 16. Replaces
// the ad-hoc radius-12 buttons used across the screens.
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, INTER_SEMIBOLD, radius } from '@social-events/ui';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  /** Optional leading element (e.g. an icon). */
  icon?: ReactNode;
  variant?: 'primary' | 'ghost' | 'coral';
};

export function Button({ label, onPress, disabled, icon, variant = 'primary' }: Props) {
  const ghost = variant === 'ghost';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.base,
        ghost ? styles.ghost : variant === 'coral' ? styles.coral : styles.primary,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.inner}>
        {icon}
        <Text style={[styles.label, ghost ? styles.ghostLabel : styles.solidLabel]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  primary: { backgroundColor: colors.action.primary },
  coral: { backgroundColor: colors.accent.coral },
  ghost: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.5 },
  label: { fontFamily: INTER_SEMIBOLD, fontSize: 16 },
  solidLabel: { color: colors.action.primaryText },
  ghostLabel: { color: colors.text.primary },
});
