// ACT / T3 — Report. File a report on a subject (activity / circle / user /
// message). Calm, non-punitive tone. Mirrors the Figma Report screen + Inv. 6.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@social-events/ui';

import type { ReportReason, ReportSubjectType } from '../data/repository';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';

const REASONS: { v: ReportReason; label: string }[] = [
  { v: 'unsafe', label: 'Небезопасное поведение' },
  { v: 'spam', label: 'Спам или реклама' },
  { v: 'abuse', label: 'Оскорбления' },
  { v: 'fake', label: 'Не тот человек / фейк' },
  { v: 'other', label: 'Другое' },
];

type Props = { subjectType: ReportSubjectType; subjectId: string };

export function ReportScreen({ subjectType, subjectId }: Props) {
  const router = useRouter();
  const { repo, userId } = useActivitiesRepo();
  const [reason, setReason] = useState<ReportReason>('unsafe');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await repo.createReport({
        reporterId: userId,
        subjectType,
        subjectId,
        reason,
        note: note.trim() || null,
      });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Pressable
        onPress={() => router.back()}
        style={styles.back}
        accessibilityRole="button"
        testID="rp-back"
      >
        <Text style={styles.backText}>‹ Назад</Text>
      </Pressable>

      {done ? (
        <View style={styles.center}>
          <Text style={styles.doneTitle}>Жалоба отправлена</Text>
          <Text style={styles.doneText}>Спасибо. Разберёмся тихо и по-человечески.</Text>
          <Pressable onPress={() => router.back()} style={styles.submit} testID="rp-close">
            <Text style={styles.submitText}>Готово</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Пожаловаться</Text>
          <Text style={styles.subtitle}>Что случилось? Разберёмся тихо и по-человечески.</Text>

          <View style={styles.list}>
            {REASONS.map((r) => {
              const sel = r.v === reason;
              return (
                <Pressable
                  key={r.v}
                  onPress={() => setReason(r.v)}
                  style={[styles.radio, sel && styles.radioActive]}
                  accessibilityRole="button"
                  testID={`rp-reason-${r.v}`}
                >
                  <View style={[styles.dot, sel && styles.dotActive]} />
                  <Text style={styles.radioText}>{r.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Опишите, что произошло (необязательно)"
            placeholderTextColor={colors.text.muted}
            style={[styles.input, styles.inputMultiline]}
            multiline
            testID="rp-note"
          />

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            style={({ pressed }) => [
              styles.submit,
              submitting && styles.submitDisabled,
              pressed && !submitting && styles.pressed,
            ]}
            accessibilityRole="button"
            testID="rp-submit"
          >
            <Text style={styles.submitText}>{submitting ? 'Отправляем…' : 'Отправить жалобу'}</Text>
          </Pressable>
        </ScrollView>
      )}
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
  list: { gap: spacing[2] },
  radio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  radioActive: { borderColor: colors.action.primary, borderWidth: 2 },
  dot: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.border.strong,
  },
  dotActive: { backgroundColor: colors.action.primary, borderColor: colors.action.primary },
  radioText: { ...typography.body, color: colors.text.primary },
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
  inputMultiline: { minHeight: 96, textAlignVertical: 'top' },
  submit: {
    backgroundColor: colors.action.primary,
    borderRadius: radius.md,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginTop: spacing[2],
  },
  submitDisabled: { opacity: 0.6 },
  pressed: { opacity: 0.85 },
  submitText: { ...typography.button, color: colors.action.primaryText },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6], gap: spacing[3] },
  doneTitle: { ...typography.heading, color: colors.text.primary },
  doneText: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
});
