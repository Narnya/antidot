// ACT-003 / DS v2 — Feed «Для тебя»: open overflow slots across the city (product
// decision 2026-07: city-wide), as photo "invitation" cards grouped by day, with
// kind filters. The feed lists ACTIVITIES, never people (aggregate only).
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@social-events/ui';

import { ActivityCard } from '../components/ActivityCard';
import type { ActivityView } from '../data/repository';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';
import { formatDayLabel } from '../lib/format';
import type { ActivityKind } from '../lib/model';

const FILTERS: { key: string; label: string; kinds: ActivityKind[] | null }[] = [
  { key: 'all', label: 'Все', kinds: null },
  { key: 'sport', label: 'Спорт', kinds: ['football', 'run'] },
  { key: 'boardgames', label: 'Настолки', kinds: ['boardgames'] },
  { key: 'walk', label: 'Прогулки', kinds: ['walk'] },
  { key: 'coffee', label: 'Кофе', kinds: ['coffee'] },
];

export function FeedScreen() {
  const router = useRouter();
  const { repo, userId } = useActivitiesRepo();
  const [views, setViews] = useState<ActivityView[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKey, setFilterKey] = useState('all');

  const load = useCallback(async () => {
    setViews(await repo.listOpenInCity(userId));
    setLoading(false);
  }, [repo, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const groups = useMemo(() => {
    const kinds = FILTERS.find((f) => f.key === filterKey)?.kinds ?? null;
    const filtered = kinds ? views.filter((v) => kinds.includes(v.activity.kind)) : views;
    const out: { label: string; items: ActivityView[] }[] = [];
    for (const v of filtered) {
      const label = formatDayLabel(v.activity.startsAt);
      const last = out[out.length - 1];
      if (!last || last.label !== label) out.push({ label, items: [v] });
      else last.items.push(v);
    }
    return out;
  }, [views, filterKey]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Для тебя</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filtersRow}
      >
        {FILTERS.map((f) => {
          const active = f.key === filterKey;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilterKey(f.key)}
              style={[styles.chip, active && styles.chipActive]}
              accessibilityRole="button"
              testID={`feed-filter-${f.key}`}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.text.muted} />
        </View>
      ) : groups.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Пока нет открытых мест поблизости.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {groups.map((g) => (
            <View key={g.label} style={styles.group}>
              <Text style={styles.dayLabel}>{g.label}</Text>
              {g.items.map((v) => (
                <ActivityCard
                  key={v.activity.id}
                  view={v}
                  onOpen={(id) => router.push(`/activity/${id}`)}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  title: {
    ...typography.title,
    color: colors.text.primary,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
  },
  filtersRow: { flexGrow: 0 },
  filters: { paddingHorizontal: spacing[6], gap: spacing[2], paddingBottom: spacing[3] },
  chip: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.full,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  chipActive: { backgroundColor: colors.action.primary, borderColor: colors.action.primary },
  chipText: { ...typography.bodyMedium, color: colors.text.secondary },
  chipTextActive: { color: colors.action.primaryText },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  empty: { ...typography.body, color: colors.text.muted, textAlign: 'center' },
  list: { padding: spacing[6], paddingTop: spacing[1] },
  group: { gap: spacing[3], marginBottom: spacing[5] },
  dayLabel: { ...typography.bodyMedium, color: colors.text.secondary },
});
