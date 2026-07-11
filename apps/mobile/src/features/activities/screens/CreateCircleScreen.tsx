// ACT-009 — Create Circle (host makes a circle). Name / area / theme / rhythm;
// the creator becomes its owner-member. Mirrors docs/32 §T1 and the Figma Create
// Circle screen. Live repo via the selector.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@social-events/ui';

import { useActivitiesRepo } from '../hooks/useActivitiesRepo';
import type { CircleRhythm } from '../lib/model';

const RHYTHMS: { v: CircleRhythm; label: string }[] = [
  { v: 'weekly', label: 'Еженедельно' },
  { v: 'biweekly', label: 'Раз в 2 недели' },
  { v: 'monthly', label: 'Ежемесячно' },
  { v: 'adhoc', label: 'По случаю' },
];

export function CreateCircleScreen() {
  const router = useRouter();
  const { repo, userId } = useActivitiesRepo();
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [theme, setTheme] = useState('');
  const [rhythm, setRhythm] = useState<CircleRhythm>('weekly');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (name.trim().length === 0) {
      setError('Введите название круга.');
      return;
    }
    if (area.trim().length === 0) {
      setError('Укажите район.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const created = await repo.createCircle({
        name: name.trim(),
        area: area.trim(),
        theme: theme.trim() || null,
        rhythm,
        ownerId: userId,
      });
      router.replace(`/circle/${created.id}`);
    } catch {
      setError('Не удалось создать круг. Попробуйте ещё раз.');
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Pressable
        onPress={() => router.back()}
        style={styles.back}
        accessibilityRole="button"
        testID="cc-back"
      >
        <Text style={styles.backText}>‹ Назад</Text>
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Новый круг</Text>
        <Text style={styles.subtitle}>
          Собери своих — и открывай места соседним, когда не хватает.
        </Text>

        <Text style={styles.label}>Название</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Четверговый футбол"
          placeholderTextColor={colors.text.muted}
          style={styles.input}
          testID="cc-name"
        />

        <Text style={styles.label}>Район</Text>
        <TextInput
          value={area}
          onChangeText={setArea}
          placeholder="Приморский"
          placeholderTextColor={colors.text.muted}
          style={styles.input}
          testID="cc-area"
        />

        <Text style={styles.label}>О чём круг</Text>
        <TextInput
          value={theme}
          onChangeText={setTheme}
          placeholder="Играем в футбол по четвергам. Свои и друзья друзей."
          placeholderTextColor={colors.text.muted}
          style={[styles.input, styles.inputMultiline]}
          multiline
          testID="cc-theme"
        />

        <Text style={styles.label}>Ритм</Text>
        <View style={styles.chips}>
          {RHYTHMS.map((r) => {
            const active = r.v === rhythm;
            return (
              <Pressable
                key={r.v}
                onPress={() => setRhythm(r.v)}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="button"
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{r.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {error && (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={({ pressed }) => [
            styles.submit,
            submitting && styles.submitDisabled,
            pressed && !submitting && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityState={{ disabled: submitting, busy: submitting }}
          testID="cc-submit"
        >
          <Text style={styles.submitText}>{submitting ? 'Создаём…' : 'Создать круг'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  back: { paddingHorizontal: spacing[5], paddingVertical: spacing[3] },
  backText: { ...typography.body, color: colors.text.secondary },
  body: { padding: spacing[6], paddingTop: spacing[2], gap: spacing[3] },
  title: { ...typography.title, color: colors.text.primary },
  subtitle: { ...typography.body, color: colors.text.secondary, marginBottom: spacing[2] },
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
  inputMultiline: { minHeight: 88, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.full,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  chipActive: { backgroundColor: colors.action.primary, borderColor: colors.action.primary },
  chipText: { ...typography.body, color: colors.text.primary },
  chipTextActive: { color: colors.action.primaryText },
  error: { ...typography.body, color: colors.status.danger },
  submit: {
    backgroundColor: colors.action.primary,
    borderRadius: radius.md,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginTop: spacing[4],
  },
  submitDisabled: { opacity: 0.6 },
  pressed: { opacity: 0.85 },
  submitText: { ...typography.button, color: colors.action.primaryText },
});
