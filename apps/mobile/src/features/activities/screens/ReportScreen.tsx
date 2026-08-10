// ACT / T3 — Report. File a report on a subject (activity / circle / user), calm and
// non-punitive. Pixel-matched to mockups/all-screens.html frame E «Пожаловаться»
// (round back button, reason radios, «Подробнее», «Также заблокировать», coral CTA
// bar) and frame O for the sent state. We never reveal who reported (Inv. 6).
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, INTER_REGULAR, INTER_SEMIBOLD, spacing, typography } from '@social-events/ui';

import { useGoBack } from '../../../lib/useGoBack';
import { AppTextInput, Button, CtaBar, FieldLabel, HeroTitle, ScreenHeader } from '../../../components';
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
  const goBack = useGoBack();
  const insets = useSafeAreaInsets();
  const { repo, userId } = useActivitiesRepo();
  const [reason, setReason] = useState<ReportReason>('unsafe');
  const [note, setNote] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(subjectType === 'user');
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
      if (alsoBlock && subjectType === 'user') {
        await repo.blockUser(userId, subjectId);
      }
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <View style={styles.root}>
        <View style={styles.succ}>
          <View style={styles.succIc}>
            <Ionicons name="shield-checkmark-outline" size={42} color={colors.action.primary} />
          </View>
          <HeroTitle style={styles.succTitle}>Жалоба отправлена</HeroTitle>
          <Text style={styles.succText}>Спасибо. Разберёмся тихо и по-человечески.</Text>
          <View style={styles.notice}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.text.muted} />
            <Text style={styles.noticeText}>
              Мы не показываем, кто пожаловался. Никаких публичных ярлыков.
            </Text>
          </View>
        </View>
        <CtaBar>
          <Button label="Готово" onPress={goBack} />
        </CtaBar>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="Пожаловаться" onBack={goBack} />

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: 120 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sub}>Что случилось? Разберёмся тихо и по-человечески.</Text>

        <FieldLabel>Причина</FieldLabel>
        <View style={styles.radios}>
          {REASONS.map((r) => {
            const sel = r.v === reason;
            return (
              <Pressable
                key={r.v}
                onPress={() => setReason(r.v)}
                style={[styles.radioRow, sel && styles.radioRowSel]}
                accessibilityRole="button"
                accessibilityState={{ selected: sel }}
                testID={`rp-reason-${r.v}`}
              >
                <View style={[styles.rdot, sel && styles.rdotSel]} />
                <Text style={styles.radioText}>{r.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <FieldLabel>
          Подробнее <Text style={styles.optional}>(необязательно)</Text>
        </FieldLabel>
        <AppTextInput
          value={note}
          onChangeText={setNote}
          placeholder="Опиши, что произошло…"
          style={styles.textarea}
          multiline
          testID="rp-note"
        />

        <Pressable
          onPress={() => setAlsoBlock((v) => !v)}
          style={styles.blockRow}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: alsoBlock }}
          testID="rp-block"
        >
          <View style={[styles.checkbox, alsoBlock && styles.checkboxOn]}>
            {alsoBlock ? <Ionicons name="checkmark" size={14} color={colors.text.inverse} /> : null}
          </View>
          <View style={styles.blockTxt}>
            <Text style={styles.t1}>Также заблокировать</Text>
            <Text style={styles.t2}>Не увидит тебя, твои активности и сообщения</Text>
          </View>
        </Pressable>
      </ScrollView>

      <CtaBar>
        <Button
          label={submitting ? 'Отправляем…' : 'Отправить жалобу'}
          variant="coral"
          disabled={submitting}
          onPress={handleSubmit}
        />
      </CtaBar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.default },
  // paddingBottom (clearance under the absolute CtaBar) is added inline: 120 + insets.bottom.
  body: { paddingHorizontal: spacing[6], paddingTop: spacing[1] },
  sub: { ...typography.body, fontSize: 15, color: colors.text.secondary, marginBottom: 18 },

  radios: { gap: 10, marginBottom: 20 },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  radioRowSel: { borderColor: colors.action.primary, backgroundColor: '#F1F5EF' },
  rdot: { width: 22, height: 22, borderRadius: 999, borderWidth: 2, borderColor: colors.text.muted },
  rdotSel: { borderWidth: 7, borderColor: colors.action.primary },
  radioText: { fontFamily: INTER_SEMIBOLD, fontSize: 15.5, color: colors.text.primary },

  optional: { fontFamily: INTER_REGULAR, color: colors.text.muted },
  textarea: {
    backgroundColor: colors.surface.field,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    lineHeight: 21,
    color: colors.text.primary,
    minHeight: 76,
    textAlignVertical: 'top',
  },

  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginTop: 16,
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.text.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.action.primary, borderColor: colors.action.primary },
  blockTxt: { flex: 1 },
  t1: { fontFamily: INTER_SEMIBOLD, fontSize: 15.5, color: colors.text.primary },
  t2: { ...typography.caption, color: colors.text.secondary, marginTop: 2 },

  // sent (frame O)
  succ: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34 },
  succIc: {
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: colors.trust.verifiedBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  succTitle: { fontSize: 28, textAlign: 'center' },
  succText: { ...typography.body, fontSize: 15.5, color: colors.text.secondary, textAlign: 'center', marginTop: 14 },
  notice: { flexDirection: 'row', gap: 8, marginTop: 20, alignItems: 'flex-start' },
  noticeText: { ...typography.caption, color: colors.text.muted, flex: 1, lineHeight: 18, textAlign: 'left' },
});
