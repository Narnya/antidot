// ACT-009 / T2 — Circle Home. Per-circle hub (belonging surface): aggregate
// composition (no people list — Inv.), theme/rhythm, next activity, actions, and
// — for the host — overflow guests to confirm as members (host-confirm, §4.1 A).
// Mirrors docs/32 §T1–T2 and the Figma Circle Home screen.
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@social-events/ui';

import type { CircleView, MemberCandidate } from '../data/repository';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';
import { formatWhen, kindEmoji } from '../lib/format';
import type { CircleRhythm } from '../lib/model';

const RHYTHM_LABEL: Record<CircleRhythm, string> = {
  weekly: 'раз в неделю',
  biweekly: 'раз в 2 недели',
  monthly: 'раз в месяц',
  adhoc: 'по случаю',
};

type Props = { circleId: string };

export function CircleHomeScreen({ circleId }: Props) {
  const { repo, userId } = useActivitiesRepo();
  const [view, setView] = useState<CircleView | null>(null);
  const [candidates, setCandidates] = useState<MemberCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    const next = await repo.getCircle(circleId, userId);
    setView(next);
    setCandidates(next?.isOwner ? await repo.listMemberCandidates(circleId) : []);
    setLoading(false);
  }, [circleId, repo, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleConfirm = useCallback(
    async (candidateId: string) => {
      setConfirmingId(candidateId);
      try {
        await repo.confirmMember(circleId, candidateId);
        await load();
      } finally {
        setConfirmingId(null);
      }
    },
    [circleId, repo, load],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Pressable
        onPress={() => router.back()}
        style={styles.back}
        accessibilityRole="button"
        testID="ch-back"
      >
        <Text style={styles.backText}>‹ Назад</Text>
      </Pressable>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.text.muted} />
        </View>
      ) : !view ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Круг не найден.</Text>
        </View>
      ) : (
        <Body
          view={view}
          candidates={candidates}
          confirmingId={confirmingId}
          onConfirm={handleConfirm}
        />
      )}
    </SafeAreaView>
  );
}

function Body({
  view,
  candidates,
  confirmingId,
  onConfirm,
}: {
  view: CircleView;
  candidates: MemberCandidate[];
  confirmingId: string | null;
  onConfirm: (candidateId: string) => void;
}) {
  const router = useRouter();
  const { group, memberCount, nextActivity, isMember, isOwner } = view;
  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={styles.head}>
        <Text style={styles.name} numberOfLines={2}>
          {group.name}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓ Проверен</Text>
        </View>
      </View>
      <Text style={styles.meta}>
        {group.area} · {RHYTHM_LABEL[group.rhythm]}
      </Text>
      {group.theme ? <Text style={styles.theme}>{group.theme}</Text> : null}

      <View style={styles.card}>
        <Row label="Участников" value={String(memberCount)} />
        <Row label="Состав" value="открытый" />
      </View>

      <Text style={styles.sectionLabel}>Ближайшая встреча</Text>
      {nextActivity ? (
        <Pressable
          onPress={() => router.push(`/activity/${nextActivity.activity.id}`)}
          style={({ pressed }) => [styles.actRow, pressed && styles.pressed]}
          accessibilityRole="button"
          testID="ch-next"
        >
          <Text style={styles.actEmoji}>{kindEmoji(nextActivity.activity.kind)}</Text>
          <View style={styles.actMain}>
            <Text style={styles.actTitle} numberOfLines={1}>
              {nextActivity.activity.title}
            </Text>
            <Text style={styles.actMeta}>{formatWhen(nextActivity.activity.startsAt)}</Text>
          </View>
          <Text style={styles.actSpots}>
            {nextActivity.spotsRemaining > 0
              ? `нужно +${nextActivity.spotsRemaining}`
              : `идут ${nextActivity.spotsTaken}`}
          </Text>
        </Pressable>
      ) : (
        <Text style={styles.emptyRow}>Пока нет запланированных встреч</Text>
      )}

      {isOwner && candidates.length > 0 ? (
        <View style={styles.candBlock}>
          <Text style={styles.sectionLabel}>Гости, которых можно принять</Text>
          {candidates.map((c) => (
            <View key={c.userId} style={styles.candRow}>
              <Pressable
                style={styles.candMain}
                onPress={() => router.push(`/profile/${c.userId}`)}
                accessibilityRole="button"
                testID={`cand-profile-${c.userId}`}
              >
                <Text style={styles.candName}>Новый гость</Text>
                <Text style={styles.candMeta} numberOfLines={1}>
                  С встречи «{c.throughActivityTitle}»
                </Text>
              </Pressable>
              <Pressable
                onPress={() => onConfirm(c.userId)}
                disabled={confirmingId === c.userId}
                style={({ pressed }) => [
                  styles.confirmBtn,
                  confirmingId === c.userId && styles.pressed,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                testID={`confirm-${c.userId}`}
              >
                <Text style={styles.confirmText}>
                  {confirmingId === c.userId ? '…' : 'Принять'}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <Pressable
        onPress={() => router.push('/create')}
        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        accessibilityRole="button"
        testID="ch-create-activity"
      >
        <Text style={styles.primaryText}>Создать активность</Text>
      </Pressable>
      {isMember && !isOwner ? <Text style={styles.pauseLink}>Поставить участие на паузу</Text> : null}
      <Pressable
        onPress={() => router.push(`/report?type=circle&id=${group.id}`)}
        accessibilityRole="button"
        testID="ch-report"
      >
        <Text style={styles.reportLink}>Пожаловаться на круг</Text>
      </Pressable>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  back: { paddingHorizontal: spacing[5], paddingVertical: spacing[3] },
  backText: { ...typography.body, color: colors.text.secondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  empty: { ...typography.body, color: colors.text.muted },
  body: { padding: spacing[6], paddingTop: spacing[2], gap: spacing[4] },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  name: { ...typography.title, color: colors.text.primary, flex: 1 },
  badge: {
    backgroundColor: colors.trust.verifiedBg,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: { ...typography.badge, color: colors.trust.verifiedText },
  meta: { ...typography.body, color: colors.text.secondary },
  theme: { ...typography.body, color: colors.text.muted },
  card: {
    backgroundColor: colors.surface.default,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing[4],
    gap: spacing[3],
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { ...typography.body, color: colors.text.muted },
  rowValue: { ...typography.bodyMedium, color: colors.text.primary },
  sectionLabel: { ...typography.bodyMedium, color: colors.text.secondary },
  actRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    padding: spacing[3],
  },
  actEmoji: { fontSize: 22 },
  actMain: { flex: 1, gap: 2 },
  actTitle: { ...typography.bodyMedium, color: colors.text.primary },
  actMeta: { ...typography.caption, color: colors.text.secondary },
  actSpots: { ...typography.caption, color: colors.text.muted },
  emptyRow: { ...typography.body, color: colors.text.muted, paddingVertical: spacing[2] },
  candBlock: { gap: spacing[2] },
  candRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    padding: spacing[3],
  },
  candMain: { flex: 1, gap: 2 },
  candName: { ...typography.bodyMedium, color: colors.text.primary },
  candMeta: { ...typography.caption, color: colors.text.secondary },
  confirmBtn: {
    backgroundColor: colors.action.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  confirmText: { ...typography.button, color: colors.action.primaryText },
  primary: {
    backgroundColor: colors.action.primary,
    borderRadius: radius.md,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginTop: spacing[2],
  },
  primaryText: { ...typography.button, color: colors.action.primaryText },
  pauseLink: {
    ...typography.body,
    color: colors.text.muted,
    textAlign: 'center',
    paddingVertical: spacing[2],
  },
  reportLink: {
    ...typography.body,
    color: colors.text.muted,
    textAlign: 'center',
    paddingVertical: spacing[2],
  },
  pressed: { opacity: 0.85 },
});
