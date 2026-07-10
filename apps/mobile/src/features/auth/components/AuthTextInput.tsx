// AUTH-002 — minimal labeled text input. Not a final design system component; lives
// in the auth feature for Sprint 2. Will be replaced/folded into @social-events/ui
// later when the design system gets real components (see /docs/13_DESIGN_HANDOFF.md).
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, spacing, typography } from '@social-events/ui';

type AuthTextInputProps = {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  autoComplete?: 'email' | 'password' | 'new-password' | 'off';
  textContentType?: 'emailAddress' | 'password' | 'newPassword' | 'none';
  editable?: boolean;
  testID?: string;
};

export function AuthTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  textContentType,
  editable = true,
  testID,
}: AuthTextInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        autoComplete={autoComplete}
        textContentType={textContentType}
        editable={editable}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, focused && styles.inputFocused, !editable && styles.inputDisabled]}
        testID={testID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing[1],
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  input: {
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.surface.default,
    borderColor: colors.border.default,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  inputFocused: {
    borderColor: colors.action.primary,
  },
  inputDisabled: {
    opacity: 0.5,
  },
});
