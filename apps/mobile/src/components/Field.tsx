// Shared text field, matched to the mockups' `.field`: warm sunken fill
// (surface.field #FBF8F1), 1px border, 15px radius, an optional leading icon, and
// Inter 15.5 text. Replaces the ad-hoc TextInputs (surface bg, radius 12) used
// across the forms. Also exports FieldLabel for the `.label` above fields.
import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { colors, INTER_SEMIBOLD, radius, spacing } from '@social-events/ui';

import { useInputFocus, webNoOutline } from './inputStyle';

type Props = TextInputProps & { leftIcon?: ReactNode };

export function Field({ leftIcon, style, onFocus, onBlur, ...props }: Props) {
  // Web draws a focus ring inside the input; remove it and turn the wrapper's
  // border brand-green while focused (a designed focus state, not the browser's).
  const focus = useInputFocus(onFocus ?? undefined, onBlur ?? undefined);
  return (
    <View style={[styles.wrap, focus.focused && styles.wrapFocused]}>
      {leftIcon}
      <TextInput
        placeholderTextColor={colors.text.muted}
        {...props}
        onFocus={focus.onFocus}
        onBlur={focus.onBlur}
        style={[styles.input, webNoOutline, style]}
      />
    </View>
  );
}

/** `.label` — Inter 13 / 600, secondary, sitting above a field. */
export function FieldLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface.field,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  wrapFocused: { borderColor: colors.action.primary },
  input: { flex: 1, padding: 0, fontSize: 15.5, color: colors.text.primary },
  label: {
    fontFamily: INTER_SEMIBOLD,
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: spacing[2],
    marginHorizontal: 2,
  },
});
