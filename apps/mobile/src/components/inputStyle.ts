// Shared input focus styling. On web, react-native-web draws the browser's focus
// ring INSIDE the input (the orange inner outline). We remove it and instead show a
// designed focus state — the field's border turns brand-green while focused. No-op
// on native (there's no browser outline there).
import { useCallback, useState } from 'react';
import { Platform, type NativeSyntheticEvent, type TextInputFocusEventData, type TextStyle } from 'react-native';

/** Removes the web focus ring; empty (harmless) on native. */
export const webNoOutline = (
  Platform.OS === 'web' ? { outlineStyle: 'none', outlineWidth: 0 } : {}
) as unknown as TextStyle;

type FocusHandler = (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;

/** Tracks focus for a TextInput, chaining any caller-provided onFocus/onBlur, so a
 *  field can swap its border to the brand green while focused. */
export function useInputFocus(onFocusProp?: FocusHandler, onBlurProp?: FocusHandler) {
  const [focused, setFocused] = useState(false);
  const onFocus = useCallback<FocusHandler>(
    (e) => {
      setFocused(true);
      onFocusProp?.(e);
    },
    [onFocusProp],
  );
  const onBlur = useCallback<FocusHandler>(
    (e) => {
      setFocused(false);
      onBlurProp?.(e);
    },
    [onBlurProp],
  );
  return { focused, onFocus, onBlur };
}
