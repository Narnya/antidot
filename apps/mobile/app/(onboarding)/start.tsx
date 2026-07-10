// (onboarding) → start (AUTH-007 placeholder).
//
// This is NOT the real onboarding. Real circle-fit onboarding is ONB-001…014.
// The screen exists only to let the route gates be exercised end-to-end:
//   - dev can flip the in-memory onboarding placeholder to "complete" and watch
//     the (onboarding) gate redirect them to the app placeholder;
//   - dev can sign out and return to welcome.
//
// Russian copy is intentionally generic and clearly marked as temporary so it
// cannot be mistaken for a real onboarding screen.
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@social-events/ui';

import { useAuthSession, useOnboardingPlaceholder } from '../../src/features/auth';

export default function OnboardingStart() {
  const { isSigningOut, signOut } = useAuthSession();
  const { markOnboardedPlaceholder } = useOnboardingPlaceholder();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <Text style={styles.title}>Онбординг</Text>
          <Text style={styles.subtitle}>
            Здесь будет настройка профиля и предпочтений для кругов.
          </Text>
          <Text style={styles.note}>
            Временный экран. Настоящий онбординг будет добавлен отдельными задачами.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={markOnboardedPlaceholder}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            accessibilityRole="button"
            testID="onboarding-complete-placeholder"
          >
            <Text style={styles.primaryButtonText}>Завершить онбординг (placeholder)</Text>
          </Pressable>

          <Pressable
            onPress={signOut}
            disabled={isSigningOut}
            style={({ pressed }) => [
              styles.secondaryButton,
              isSigningOut && styles.buttonDisabled,
              pressed && !isSigningOut && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
            testID="onboarding-signout"
          >
            <Text style={styles.secondaryButtonText}>{isSigningOut ? 'Выход…' : 'Выйти'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  container: {
    flexGrow: 1,
    padding: spacing[6],
    justifyContent: 'space-between',
  },
  body: {
    marginTop: spacing[12],
    gap: spacing[3],
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  note: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing[2],
  },
  actions: {
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  primaryButton: {
    backgroundColor: colors.action.primary,
    borderRadius: 12,
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.action.primaryText,
  },
  secondaryButton: {
    backgroundColor: colors.action.secondary,
    borderRadius: 12,
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.text.primary,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonPressed: { opacity: 0.85 },
});
