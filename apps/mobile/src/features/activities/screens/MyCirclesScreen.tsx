// ACT-006 — My Circles (belonging home). The second centre: the user's circles
// and their next meeting — the retention surface («круг = дом»). Pixel-matched to
// mockups/all-screens.html frame 07: a «+» header action, per-circle cards (tinted
// circle tile + name + aggregate «N участников · район» + next-meeting strip), and
// the belonging notice. Composition stays aggregate — no people list (Inv. 13).
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, INTER_REGULAR, INTER_SEMIBOLD, PLAYFAIR_FAMILY, radius, shadows, spacing, typography } from '@social-events/ui';

import { Button, IconButton, IconCircles, IconTile, LoadError, ScreenHeader } from '../../../components';
import type { ActivityView, MyCircle } from '../data/repository';
import { formatWhen } from '../lib/format';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';

// Decorative per-circle tile tints (warm, not tied to identity).
const TINTS = [
  { bg: '#CDDAC4', ic: colors.action.primary },
  { bg: '#E0CDBB', ic: '#8A5A3A' },
  { bg: '#D6C3B0', ic: '#6B4E3A' },
];

// RU plural for «участник»: 1 → участник, 2–4 → участника, 0 / 5+ → участников.
function membersWord(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'участник';
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'участника';
  return 'участников';
}
function spotsWord(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'место';
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'места';
  return 'мест';
}

export function MyCirclesScreen() {
  const router = useRouter();
  const { repo, userId } = useActivitiesRepo();
  const [circles, setCircles] = useState<MyCircle[]>([]);
  const [byGroup, setByGroup] = useState<Record<string, ActivityView[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [cs, acts] = await Promise.all([
        repo.listMyCircles(userId),
        repo.listMyActivities(userId),
      ]);
      const grouped: Record<string, ActivityView[]> = {};
      for (const v of acts) (grouped[v.activity.groupId] ??= []).push(v);
      for (const id of Object.keys(grouped)) {
        grouped[id].sort((a, b) => a.activity.startsAt.localeCompare(b.activity.startsAt));
      }
      setCircles(cs);
      setByGroup(grouped);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [repo, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Мои круги"
        right={
          <IconButton onPress={() => router.push('/circle/create')} label="Новый круг" testID="circles-new">
            <Ionicons name="add" size={22} color={colors.text.primary} />
          </IconButton>
        }
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.text.muted} />
        </View>
      ) : error ? (
        <LoadError onRetry={() => void load()} />
      ) : circles.length === 0 ? (
        <View style={styles.empty}>
          <IconTile size={78} round bg={colors.trust.verifiedBg}>
            <IconCircles color={colors.action.primary} size={34} />
          </IconTile>
          <Text style={styles.emptyTitle}>Пока ни одного круга</Text>
          <Text style={styles.emptySub}>
            Круг появляется сам: займи слот на активности и приходи — или собери свой и открой
            места городу.
          </Text>
          <View style={styles.emptyCta}>
            <Button label="Создать круг" onPress={() => router.push('/circle/create')} />
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {circles.map(({ group, memberCount }, i) => {
            const next = byGroup[group.id]?.[0] ?? null;
            const tint = TINTS[i % TINTS.length];
            const open = next && next.spotsRemaining > 0 ? next.spotsRemaining : 0;
            return (
              <Pressable
                key={group.id}
                onPress={() => router.push(`/circle/${group.id}`)}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                accessibilityRole="button"
                testID={`open-circle-${group.id}`}
              >
                <View style={styles.cardRow}>
                  <IconTile size={46} round bg={tint.bg}>
                    <IconCircles color={tint.ic} size={24} />
                  </IconTile>
                  <View style={styles.cardMain}>
                    <Text style={styles.circleName} numberOfLines={1}>
                      {group.name}
                    </Text>
                    <Text style={styles.circleMeta} numberOfLines={1}>
                      {memberCount} {membersWord(memberCount)} · {group.area}
                    </Text>
                  </View>
                </View>

                <View style={styles.strip}>
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={next ? colors.action.primary : colors.text.muted}
                  />
                  <Text style={[styles.stripText, !next && styles.stripMuted]} numberOfLines={1}>
                    {next ? `Ближайшая: ${formatWhen(next.activity.startsAt)}` : 'Пока нет ближайших встреч'}
                  </Text>
                  {open > 0 ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {open} {spotsWord(open)}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            );
          })}

          <View style={styles.notice}>
            <Ionicons name="checkmark" size={16} color={colors.text.muted} />
            <Text style={styles.noticeText}>
              Нашёл свои круги — это и есть цель. Мы не подгоняем искать новые.
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: {
    fontFamily: PLAYFAIR_FAMILY,
    fontSize: 26,
    letterSpacing: -0.4,
    color: colors.action.primary,
    marginTop: 24,
  },
  emptySub: { fontSize: 15, lineHeight: 22, color: colors.text.secondary, textAlign: 'center', marginTop: 12 },
  emptyCta: { alignSelf: 'stretch', marginTop: 26 },
  body: { paddingHorizontal: spacing[6], paddingTop: spacing[2], paddingBottom: spacing[6] },
  card: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    ...shadows.card,
  },
  pressed: { opacity: 0.92 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardMain: { flex: 1 },
  circleName: { fontFamily: INTER_SEMIBOLD, fontSize: 17, color: colors.text.primary },
  circleMeta: { ...typography.body, fontSize: 14.5, lineHeight: 20, color: colors.text.secondary, marginTop: 1 },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    backgroundColor: colors.surface.field,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  stripText: { flex: 1, fontFamily: INTER_SEMIBOLD, fontSize: 13.5, color: colors.text.primary },
  stripMuted: { fontFamily: INTER_REGULAR, color: colors.text.secondary },
  badge: {
    backgroundColor: colors.trust.verifiedBg,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgeText: { ...typography.badge, fontSize: 12.5, color: colors.trust.verifiedText },
  notice: { flexDirection: 'row', gap: 8, marginTop: 6, marginHorizontal: 4 },
  noticeText: { ...typography.caption, color: colors.text.muted, flex: 1, lineHeight: 18 },
});
