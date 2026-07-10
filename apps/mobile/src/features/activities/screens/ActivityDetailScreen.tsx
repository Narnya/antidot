// ACT-004 — Activity detail. Full info + AGGREGATE composition + claim.
// Respects safety invariants: only the AREA is shown (exact location is revealed
// only after the user claims a spot), and composition is aggregate — there is no
// browsable list of people (no people marketplace).
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@social-events/ui';

import type { ActivityView } from '../data/repository';
import { formatWhen, kindEmoji } from '../lib/format';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';

type Props = { activityId: string };

export function ActivityDetailScreen({ activityId }: Props) {
  const router = useRouter();
  const { repo, userId } = useActivitiesRepo();
  const [view, setView] = useState<ActivityView | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const load = useCallback(async () => {
    const next = await repo.getActivity(activityId, userId);
    setView(next);
    setLoading(false);
  }, [activityId, repo, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleClaim = useCallback(async () => {
    setClaiming(true);
    try {
      await repo.claimSlot(activityId, userId);
      await load();
    } finally {
      setClaiming(false);
    }
  }, [activityId, load, repo, userId]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Pressable
        onPress={() => router.back()}
        style={styles.back}
        accessibilityRole="button"
        testID="detail-back"
      >
        <Text style={styles.backText}>‹ Назад</Text>
      </Pressable>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.text.muted} />
        </View>
      ) : !view ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Активность не найдена.</Text>
        </View>
      ) : (
        <DetailBody view={view} claiming={claiming} onClaim={handleClaim} />
      )}
    </SafeAreaView>
  );
}

function DetailBody({
  view,
  claiming,
  onClaim,
}: {
  view: ActivityView;
  claiming: boolean;
  onClaim: () => void;
}) {
  const { activity, group } = view;
  const remaining = view.spotsRemaining;
  const taken = view.spotsTaken;
  const full = remaining === 0;
  const alreadyGoing = view.mine !== null;
  const disabled = claiming || full || alreadyGoing;
  const label = claiming
    ? 'Записываем…'
    : alreadyGoing
      ? '✓ Вы записаны'
      : full
        ? 'Мест нет'
        : 'Занять место';

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={styles.titleRow}>
        <Text style={styles.emoji}>{kindEmoji(activity.kind)}</Text>
        <Text style={styles.title}>{activity.title}</Text>
      </View>

      <View style={styles.card}>
        <Row label="Когда" value={formatWhen(activity.startsAt)} />
        <Row label="Район" value={activity.area} />
        <Row label="Идут" value={`${taken} · нужно ещё ${remaining}`} />
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeText}>📍 Точное место откроется после записи</Text>
      </View>

      <View style={styles.circleRow}>
        <Text style={styles.circleName} numberOfLines={1}>
          Круг «{group.name}»
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓ Проверен</Text>
        </View>
      </View>

      <Pressable
        onPress={onClaim}
        disabled={disabled}
        style={({ pressed }) => [
          styles.button,
          alreadyGoing && styles.buttonClaimed,
          full && !alreadyGoing && styles.buttonFull,
          pressed && !disabled && styles.buttonPressed,
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        testID="detail-claim"
      >
        <Text
          style={[
            styles.buttonText,
            alreadyGoing && styles.buttonTextClaimed,
            full && !alreadyGoing && styles.buttonTextFull,
          ]}
        >
          {label}
        </Text>
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
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  emoji: { fontSize: 28 },
  title: { ...typography.title, color: colors.text.primary, flex: 1 },
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
  notice: {
    backgroundColor: colors.safety.noticeBg,
    borderRadius: radius.md,
    padding: spacing[3],
  },
  noticeText: { ...typography.caption, color: colors.safety.noticeText },
  circleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  circleName: { ...typography.body, color: colors.text.secondary, flex: 1 },
  badge: {
    backgroundColor: colors.trust.verifiedBg,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: { ...typography.badge, color: colors.trust.verifiedText },
  button: {
    backgroundColor: colors.action.primary,
    borderRadius: radius.md,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginTop: spacing[2],
  },
  buttonClaimed: { backgroundColor: colors.safety.noticeBg },
  buttonFull: { backgroundColor: colors.action.secondary },
  buttonPressed: { opacity: 0.85 },
  buttonText: { ...typography.button, color: colors.action.primaryText },
  buttonTextClaimed: { color: colors.safety.noticeText },
  buttonTextFull: { color: colors.text.muted },
});
