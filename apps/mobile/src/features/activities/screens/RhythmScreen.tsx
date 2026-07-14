// ACT / DS v2 (docs/35 §7) — Мой ритм. Personal rhythm surface: the current week
// + upcoming activities from your circles, plus the closed-test pull card. NOT
// gamified — no streaks, no counters-as-goals (Инв. 14). Derived from the user's
// own activities.
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@social-events/ui';

import { KindIcon } from '../components/KindIcon';
import type { ActivityView, PullMetrics } from '../data/repository';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';
import { formatWhen } from '../lib/format';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** Mon..Sun dates of the current week. */
function currentWeek(): Date[] {
  const now = new Date();
  const monOffset = (now.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() - monOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function RhythmScreen() {
  const router = useRouter();
  const { repo, userId } = useActivitiesRepo();
  const [upcoming, setUpcoming] = useState<ActivityView[]>([]);
  const [pull, setPull] = useState<PullMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [week] = useState(currentWeek);
  const todayKey = new Date().toDateString();

  const load = useCallback(async () => {
    const [acts, metrics] = await Promise.all([
      repo.listMyActivities(userId),
      repo.getPullMetrics(userId),
    ]);
    setUpcoming(acts);
    setPull(metrics);
    setLoading(false);
  }, [repo, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Мой ритм</Text>

        <View style={styles.week}>
          {week.map((d, i) => {
            const isToday = d.toDateString() === todayKey;
            return (
              <View key={d.toISOString()} style={styles.day}>
                <Text style={styles.dayLabel}>{WEEKDAYS[i]}</Text>
                <View style={[styles.dayNum, isToday && styles.dayNumToday]}>
                  <Text style={[styles.dayNumText, isToday && styles.dayNumTextToday]}>
                    {d.getDate()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Предстоящее</Text>
        {loading ? (
          <ActivityIndicator color={colors.text.muted} style={styles.loader} />
        ) : upcoming.length === 0 ? (
          <Text style={styles.emptyRow}>Пока нет запланированных встреч.</Text>
        ) : (
          <View style={styles.list}>
            {upcoming.map((v) => (
              <Pressable
                key={v.activity.id}
                onPress={() => router.push(`/activity/${v.activity.id}`)}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                accessibilityRole="button"
                testID={`rhythm-act-${v.activity.id}`}
              >
                <KindIcon kind={v.activity.kind} size={20} color={colors.action.primary} />
                <View style={styles.rowMain}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {v.activity.title}
                  </Text>
                  <Text style={styles.rowMeta}>{formatWhen(v.activity.startsAt)}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {pull ? (
          <View style={styles.pullCard} testID="rhythm-pull">
            <Text style={styles.pullTitle}>Pull · закрытый тест</Text>
            <Text style={styles.pullHint}>
              Занимают ли чужие открытые слоты сами (по вашим кругам).
            </Text>
            <View style={styles.pullRow}>
              <PullStat value={pull.overflowClaims} label="чужих заняли" />
              <PullStat value={pull.pullUsers} label="человек" />
              <PullStat value={pull.memberClaims} label="своих" />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function PullStat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.pullStat}>
      <Text style={styles.pullValue}>{value}</Text>
      <Text style={styles.pullLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  body: { padding: spacing[6], gap: spacing[3] },
  title: { ...typography.title, color: colors.text.primary, marginBottom: spacing[1] },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
  },
  day: { alignItems: 'center', gap: spacing[1] },
  dayLabel: { ...typography.caption, color: colors.text.muted },
  dayNum: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumToday: { backgroundColor: colors.action.primary },
  dayNumText: { ...typography.bodyMedium, color: colors.text.primary },
  dayNumTextToday: { color: colors.action.primaryText },
  sectionLabel: { ...typography.bodyMedium, color: colors.text.secondary, marginTop: spacing[2] },
  loader: { alignSelf: 'flex-start' },
  emptyRow: { ...typography.body, color: colors.text.muted },
  list: { gap: spacing[2] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    padding: spacing[3],
  },
  rowMain: { flex: 1, gap: 2 },
  rowTitle: { ...typography.bodyMedium, color: colors.text.primary },
  rowMeta: { ...typography.caption, color: colors.text.secondary },
  pressed: { opacity: 0.85 },
  pullCard: {
    marginTop: spacing[4],
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    padding: spacing[4],
    gap: spacing[2],
  },
  pullTitle: { ...typography.bodyMedium, color: colors.text.primary },
  pullHint: { ...typography.caption, color: colors.text.muted },
  pullRow: { flexDirection: 'row', gap: spacing[3], marginTop: spacing[1] },
  pullStat: { flex: 1, alignItems: 'center', gap: 2 },
  pullValue: { ...typography.heading, color: colors.text.primary },
  pullLabel: { ...typography.caption, color: colors.text.secondary, textAlign: 'center' },
});
