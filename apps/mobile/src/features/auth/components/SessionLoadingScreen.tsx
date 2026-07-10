// AUTH-007 — Minimal "checking session" view used by route gates while the
// initial Supabase session load is in flight. Prevents flash-of-wrong-screen.
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@social-events/ui';

export function SessionLoadingScreen() {
  return (
    <View style={styles.container} accessibilityRole="alert" accessibilityLabel="Проверяем сессию">
      <ActivityIndicator color={colors.action.primary} />
      <Text style={styles.label}>Проверяем сессию…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.default,
    gap: spacing[3],
  },
  label: {
    ...typography.body,
    color: colors.text.secondary,
  },
});
