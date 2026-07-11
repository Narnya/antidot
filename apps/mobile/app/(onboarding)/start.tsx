// (onboarding) → start. Minimal REAL onboarding (activity-first): display name +
// city/area + safety-principles accept. On submit it WRITES the user's `profiles`
// row (the durable source of truth) and then flips the in-memory nav flag so the
// (onboarding) gate advances to the app.
//
// Durability: on mount we check for an existing profile; returning users (who
// already onboarded) auto-advance without re-filling the form. The nav flag
// itself is still in-memory (dev) — the fully durable gate-from-profiles is the
// larger ONB-014 step; this closes the "onboarding must write the profiles row"
// follow-up (docs/33 §5). Photo / vibe / rhythm are deferred (docs/32 §4.3).
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@social-events/ui';

import { useActivitiesRepo } from '../../src/features/activities/hooks/useActivitiesRepo';
import { useAuthSession, useOnboardingPlaceholder } from '../../src/features/auth';

const SAFETY_POINTS = [
  'Уважение к каждому участнику. Никаких оскорблений и давления.',
  'Точное место встречи видно только тем, кто занял слот.',
  'О любой небезопасной ситуации можно сообщить — и заблокировать.',
];

export default function OnboardingStart() {
  const { repo, userId } = useActivitiesRepo();
  const { isSigningOut, signOut } = useAuthSession();
  const { markOnboardedPlaceholder } = useOnboardingPlaceholder();

  const [checking, setChecking] = useState(true);
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Returning users (a profile already exists) skip straight into the app.
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const existing = await repo.getProfile(userId);
        if (!active) return;
        if (existing && existing.displayName.trim().length > 0) {
          markOnboardedPlaceholder();
          return;
        }
      } catch {
        // Fall through to the form if the check fails (offline / transient).
      }
      if (active) setChecking(false);
    })();
    return () => {
      active = false;
    };
  }, [repo, userId, markOnboardedPlaceholder]);

  const canSubmit = name.trim().length > 0 && accepted && !submitting;

  const handleSubmit = useCallback(async () => {
    if (name.trim().length === 0) {
      setError('Введите имя.');
      return;
    }
    if (!accepted) {
      setError('Примите правила общения, чтобы продолжить.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await repo.upsertProfile({
        userId,
        displayName: name.trim(),
        area: area.trim().length > 0 ? area.trim() : null,
      });
      markOnboardedPlaceholder();
    } catch {
      setError('Не удалось сохранить профиль. Попробуйте ещё раз.');
      setSubmitting(false);
    }
  }, [name, area, accepted, repo, userId, markOnboardedPlaceholder]);

  if (checking) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.text.muted} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>
          <Text style={styles.title}>Давайте познакомимся</Text>
          <Text style={styles.subtitle}>Пара штрихов — и можно заходить в круги и активности.</Text>

          <Text style={styles.label}>Как вас зовут</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Имя"
            placeholderTextColor={colors.text.muted}
            style={styles.input}
            testID="onb-name"
          />

          <Text style={styles.label}>Город и район</Text>
          <TextInput
            value={area}
            onChangeText={setArea}
            placeholder="Приморский, СПб"
            placeholderTextColor={colors.text.muted}
            style={styles.input}
            testID="onb-area"
          />
          <Text style={styles.hint}>Показываем только район — точный адрес никогда.</Text>

          <View style={styles.safetyCard}>
            <Text style={styles.safetyTitle}>Правила общения</Text>
            {SAFETY_POINTS.map((p) => (
              <Text key={p} style={styles.safetyPoint}>
                • {p}
              </Text>
            ))}
          </View>

          <Pressable
            onPress={() => setAccepted((v) => !v)}
            style={styles.acceptRow}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: accepted }}
            testID="onb-accept"
          >
            <View style={[styles.checkbox, accepted && styles.checkboxOn]}>
              {accepted ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
            <Text style={styles.acceptText}>Принимаю правила общения</Text>
          </Pressable>

          {error ? (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.primaryButton,
              !canSubmit && styles.buttonDisabled,
              pressed && canSubmit && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit, busy: submitting }}
            testID="onb-submit"
          >
            <Text style={styles.primaryButtonText}>{submitting ? 'Сохраняем…' : 'Продолжить'}</Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flexGrow: 1, padding: spacing[6], justifyContent: 'space-between' },
  body: { marginTop: spacing[8], gap: spacing[3] },
  title: { ...typography.title, color: colors.text.primary },
  subtitle: { ...typography.body, color: colors.text.secondary },
  label: { ...typography.bodyMedium, color: colors.text.secondary, marginTop: spacing[2] },
  input: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: 16,
    color: colors.text.primary,
  },
  hint: { ...typography.caption, color: colors.text.muted },
  safetyCard: {
    backgroundColor: colors.safety.noticeBg,
    borderRadius: radius.lg,
    padding: spacing[4],
    gap: spacing[2],
    marginTop: spacing[2],
  },
  safetyTitle: { ...typography.bodyMedium, color: colors.safety.noticeText },
  safetyPoint: { ...typography.caption, color: colors.text.secondary },
  acceptRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginTop: spacing[1] },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.action.primary, borderColor: colors.action.primary },
  checkmark: { ...typography.caption, color: colors.action.primaryText },
  acceptText: { ...typography.body, color: colors.text.primary, flex: 1 },
  error: { ...typography.body, color: colors.status.danger },
  actions: { gap: spacing[3], marginTop: spacing[6], marginBottom: spacing[6] },
  primaryButton: {
    backgroundColor: colors.action.primary,
    borderRadius: 12,
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  primaryButtonText: { ...typography.button, color: colors.action.primaryText },
  secondaryButton: {
    backgroundColor: colors.action.secondary,
    borderRadius: 12,
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  secondaryButtonText: { ...typography.button, color: colors.text.primary },
  buttonDisabled: { opacity: 0.6 },
  buttonPressed: { opacity: 0.85 },
});
