// (app) → home (AUTH-007 placeholder).
//
// This is NOT real product UI. The Circle Discovery / My Circles / Circle Chat
// surfaces are explicitly out of scope until Sprint 3+. This screen exists only
// to confirm the (app) gate works end-to-end.
//
// "Сбросить онбординг (placeholder)" reverses the dev onboarding flag so the
// (app) gate redirects back to onboarding. "Выйти" returns to the guest state.
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@social-events/ui';

import { useAuthSession, useOnboardingPlaceholder } from '../../src/features/auth';

export default function Home() {
  const { isSigningOut, signOut } = useAuthSession();
  const { resetOnboardedPlaceholder } = useOnboardingPlaceholder();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <Text style={styles.title}>Антидот</Text>
          <Text style={styles.subtitle}>Черновик продукта на мок-данных.</Text>

          <Link href="/circles" asChild>
            <Pressable
              style={({ pressed }) => [styles.linkButton, pressed && styles.buttonPressed]}
              accessibilityRole="button"
              testID="app-open-circles"
            >
              <Text style={styles.linkButtonText}>Мои круги →</Text>
            </Pressable>
          </Link>

          <Link href="/feed" asChild>
            <Pressable
              style={({ pressed }) => [styles.linkButtonAlt, pressed && styles.buttonPressed]}
              accessibilityRole="button"
              testID="app-open-feed"
            >
              <Text style={styles.linkButtonAltText}>Активности рядом (лента)</Text>
            </Pressable>
          </Link>

          <Link href="/create" asChild>
            <Pressable
              style={({ pressed }) => [styles.linkButtonAlt, pressed && styles.buttonPressed]}
              accessibilityRole="button"
              testID="app-open-create"
            >
              <Text style={styles.linkButtonAltText}>Создать активность</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={resetOnboardedPlaceholder}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            accessibilityRole="button"
            testID="app-reset-onboarding-placeholder"
          >
            <Text style={styles.secondaryButtonText}>Сбросить онбординг (placeholder)</Text>
          </Pressable>

          <Pressable
            onPress={signOut}
            disabled={isSigningOut}
            style={({ pressed }) => [
              styles.primaryButton,
              isSigningOut && styles.buttonDisabled,
              pressed && !isSigningOut && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
            testID="app-signout"
          >
            <Text style={styles.primaryButtonText}>{isSigningOut ? 'Выход…' : 'Выйти'}</Text>
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
  linkButton: {
    backgroundColor: colors.accent.coral,
    borderRadius: 12,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginTop: spacing[2],
  },
  linkButtonText: {
    ...typography.button,
    color: colors.text.inverse,
  },
  linkButtonAlt: {
    backgroundColor: colors.action.secondary,
    borderRadius: 12,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginTop: spacing[2],
  },
  linkButtonAltText: {
    ...typography.button,
    color: colors.text.primary,
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
