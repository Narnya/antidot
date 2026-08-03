// ACT-003 / DS v2 — Feed «Для тебя»: open overflow slots across the city (product
// decision 2026-07: city-wide), as photo "invitation" cards grouped by day, with
// kind filters. The feed lists ACTIVITIES, never people (aggregate only).
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, INTER_SEMIBOLD, PLAYFAIR_FAMILY, radius, spacing, typography } from '@social-events/ui';

import { IconChevronDown } from '../../../components/NavIcons';
import { Button, IconForYou, IconPlus, LoadError } from '../../../components';

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
  const [error, setError] = useState(false);
  const [filterKey, setFilterKey] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setViews(await repo.listOpenInCity(userId));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
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
      {/* Location context (mockup header) — the feed is city-wide; this is the
          area lens. Placeholder copy until the area picker is wired. */}
      <View style={styles.context}>
        <Ionicons name="location-outline" size={16} color={colors.text.primary} />
        <Text style={styles.contextText}>Санкт-Петербург · Приморский</Text>
        <IconChevronDown size={14} color={colors.text.muted} />
      </View>

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
      ) : error ? (
        <LoadError onRetry={() => void load()} />
      ) : groups.length === 0 ? (
        <View style={styles.emptyCenter}>
          <View style={styles.gateIc}>
            <IconForYou color={colors.action.primary} size={36} />
          </View>
          <Text style={styles.emptyTitle}>Пока тихо</Text>
          <Text style={styles.emptySub}>
            В твоём районе ещё нет открытых активностей. Загляни позже — или собери свою и
            открой места городу.
          </Text>
          <View style={styles.emptyCta}>
            <Button
              label="Создать активность"
              onPress={() => router.push('/create')}
              icon={<IconPlus color={colors.action.primaryText} size={18} />}
            />
          </View>
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
  context: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[1],
    paddingBottom: 14,
  },
  contextText: { fontFamily: INTER_SEMIBOLD, fontSize: 16, letterSpacing: -0.1, color: colors.text.primary },
  filtersRow: { flexGrow: 0 },
  filters: { paddingHorizontal: spacing[6], gap: spacing[2], paddingBottom: 14 },
  chip: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.full,
    paddingHorizontal: spacing[4],
    paddingVertical: 9,
  },
  chipActive: { backgroundColor: colors.action.primary, borderColor: colors.action.primary },
  chipText: { ...typography.bodyMedium, fontSize: 15, lineHeight: 18, color: colors.text.secondary },
  chipTextActive: { color: colors.action.primaryText },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  emptyCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  gateIc: {
    width: 78,
    height: 78,
    borderRadius: radius.xl,
    backgroundColor: colors.trust.verifiedBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontFamily: PLAYFAIR_FAMILY,
    fontSize: 26,
    letterSpacing: -0.4,
    color: colors.action.primary,
  },
  emptySub: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 12,
  },
  emptyCta: { alignSelf: 'stretch', marginTop: 26 },
  list: { paddingHorizontal: spacing[6], paddingTop: spacing[4], paddingBottom: spacing[6] },
  group: { gap: spacing[3], marginBottom: 14 },
  dayLabel: {
    fontFamily: INTER_SEMIBOLD,
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.text.secondary,
  },
});
