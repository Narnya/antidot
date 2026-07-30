// ACT / pull core-moment — «Занять место» (mockup frame C). The dedicated claim
// step an outsider goes through from the feed: a summary of the activity, who they
// bring (solo / +1), an optional word to the organizer, and the safety notice that
// the EXACT place opens only after confirming (Инв. 1). On confirm it claims the
// slot and routes to the reveal success (frame N). «+1» and the note are persisted
// on the claim (slot_claims.plus_one / note) and shown to the host on «Приём в круг»
// (frame M) — per-claim context, not a messaging channel (Инв. 2).
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, INTER_SEMIBOLD, radius, spacing, typography } from '@social-events/ui';

import { useGoBack } from '../../../lib/useGoBack';
import { AppTextInput, Button, CtaBar, FieldLabel, IconCheck, IconPin, ScreenHeader } from '../../../components';
import type { ActivityView } from '../data/repository';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';
import { formatWhen } from '../lib/format';
import { kindImage } from '../lib/kindImage';

function spotsWord(n: number) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'место';
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'места';
  return 'мест';
}

type Props = { activityId: string };

export function ClaimSlotScreen({ activityId }: Props) {
  const router = useRouter();
  const goBack = useGoBack();
  const { repo, userId } = useActivitiesRepo();
  const [view, setView] = useState<ActivityView | null>(null);
  const [loading, setLoading] = useState(true);
  const [plusOne, setPlusOne] = useState(false);
  const [note, setNote] = useState('');
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const v = await repo.getActivity(activityId, userId);
      if (active) {
        setView(v);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [repo, activityId, userId]);

  const handleConfirm = useCallback(async () => {
    setClaiming(true);
    try {
      await repo.claimSlot(activityId, userId, { plusOne, note: note.trim() || null });
      router.replace(`/claimed/${activityId}`);
    } catch {
      setClaiming(false);
    }
  }, [repo, activityId, userId, plusOne, note, router]);

  return (
    <View style={styles.root}>
      <ScreenHeader title="Занять место" onBack={goBack} />

      {loading || !view ? (
        <View style={styles.center}>
          {loading ? <ActivityIndicator color={colors.text.muted} /> : <Text style={styles.empty}>Активность не найдена.</Text>}
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Activity summary */}
            <View style={styles.summary}>
              <Image source={kindImage(view.activity.kind)} style={styles.thumb} resizeMode="cover" />
              <View style={styles.summaryMain}>
                <Text style={styles.summaryTitle} numberOfLines={1}>
                  {view.activity.title}
                </Text>
                <Text style={styles.summaryMeta} numberOfLines={1}>
                  {formatWhen(view.activity.startsAt)} · {view.activity.area}
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {view.spotsRemaining} {spotsWord(view.spotsRemaining)}
                </Text>
              </View>
            </View>

            {/* Who they bring */}
            <FieldLabel>Кого берёшь с собой?</FieldLabel>
            <View style={styles.radios}>
              <Radio
                selected={!plusOne}
                onPress={() => setPlusOne(false)}
                t1="Иду один"
                t2="Займёт один слот"
                testID="claim-solo"
              />
              <Radio
                selected={plusOne}
                onPress={() => setPlusOne(true)}
                t1="Иду с +1"
                t2="Друг придёт вместе с тобой"
                testID="claim-plus"
              />
            </View>

            {/* Word to the organizer */}
            <FieldLabel>
              Пару слов организатору <Text style={styles.optional}>(необязательно)</Text>
            </FieldLabel>
            <AppTextInput
              value={note}
              onChangeText={setNote}
              placeholder="Впервые в этом кругу, но форма есть 🙂"
              style={styles.textarea}
              multiline
              testID="claim-note"
            />

            <View style={styles.notice}>
              <IconPin color={colors.text.muted} size={16} />
              <Text style={styles.noticeText}>
                Точное место встречи откроется сразу после подтверждения. Твои данные видит только
                организатор и участники активности.
              </Text>
            </View>
          </ScrollView>

          <CtaBar>
            <Button
              label={claiming ? 'Занимаем…' : 'Подтвердить — занять место'}
              onPress={handleConfirm}
              disabled={claiming}
              icon={<IconCheck color={colors.action.primaryText} size={18} />}
            />
          </CtaBar>
        </>
      )}
    </View>
  );
}

function Radio({
  selected,
  onPress,
  t1,
  t2,
  testID,
}: {
  selected: boolean;
  onPress: () => void;
  t1: string;
  t2: string;
  testID: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.radioRow, selected && styles.radioRowSel]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      testID={testID}
    >
      <View style={[styles.rdot, selected && styles.rdotSel]} />
      <View style={styles.radioText}>
        <Text style={styles.rt1}>{t1}</Text>
        <Text style={styles.rt2}>{t2}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.default },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  empty: { ...typography.body, color: colors.text.muted },
  body: { paddingHorizontal: spacing[6], paddingTop: spacing[1], paddingBottom: 120 },

  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 18,
    padding: 15,
    marginBottom: 20,
  },
  thumb: { width: 52, height: 52, borderRadius: radius.md },
  summaryMain: { flex: 1, minWidth: 0 },
  summaryTitle: { fontFamily: INTER_SEMIBOLD, fontSize: 15.5, color: colors.text.primary },
  summaryMeta: { fontSize: 13, color: colors.text.secondary, marginTop: 2, fontFamily: typography.caption.fontFamily },
  badge: {
    backgroundColor: colors.trust.verifiedBg,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: { fontFamily: typography.badge.fontFamily, fontSize: 12.5, color: colors.trust.verifiedText },

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
  radioText: { flex: 1 },
  rt1: { fontFamily: INTER_SEMIBOLD, fontSize: 15.5, color: colors.text.primary },
  rt2: { fontSize: 12.5, color: colors.text.secondary, marginTop: 1, fontFamily: typography.caption.fontFamily },

  optional: { fontFamily: undefined, fontWeight: '400', color: colors.text.muted },
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

  notice: { flexDirection: 'row', gap: 8, marginTop: 20, alignItems: 'flex-start' },
  noticeText: { ...typography.caption, color: colors.text.muted, flex: 1, lineHeight: 18 },
});
