// Drop-in replacement for a raw <TextInput> (multiline textareas, the chat box, the
// host location editor, …): removes the web focus ring and turns the input's border
// brand-green while focused. The focused style is appended last so it overrides the
// caller's base borderColor. Border must be on the input itself (for wrapper-bordered
// fields use the `Field` component instead).
import { forwardRef } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { colors } from '@social-events/ui';

import { useInputFocus, webNoOutline } from './inputStyle';

export const AppTextInput = forwardRef<TextInput, TextInputProps>(function AppTextInput(
  { style, onFocus, onBlur, ...props },
  ref,
) {
  const focus = useInputFocus(onFocus ?? undefined, onBlur ?? undefined);
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={colors.text.muted}
      {...props}
      onFocus={focus.onFocus}
      onBlur={focus.onBlur}
      style={[style, webNoOutline, focus.focused && styles.focused]}
    />
  );
});

const styles = StyleSheet.create({
  focused: { borderColor: colors.action.primary },
});
