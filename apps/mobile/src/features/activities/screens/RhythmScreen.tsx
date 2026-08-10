// ACT / DS v2 (docs/35 §7) — Мой ритм (mockup frame 09; retitled from «Твой ритм»
// to first person for nav-voice consistency with «Мои круги», product decision
// 2026-08-07 — mockup updated to match). The RETURN / belonging
// axis: a gentle streak hero, a «Эта неделя» grid, and «Недавно» attended rows.
// Private and self-only — NOT a public counter, ranking, or discovery-nag, and
// framed softly so belonging reads as a success state, never a goal to protect
// (Инв. 10 / 14; soft-tone product decision 2026-07-22). Data from repo.getRhythm
// (mock = illustrative; live degrades gracefully until attendance data is wired).
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, PLAYFAIR_FAMILY, radius, spacing, typography } from '@social-events/ui';

import { IconCheck, IconTile, IconUsers, LoadError, ScreenHeader, SectionLabel } from '../../../components';
import type { RhythmView } from '../data/repository';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';

const GREEN = colors.action.primary;
const DAY_LETTERS = ['П', 'В', 'С', 'Ч', 'П', 'С', 'В'];
const DAY_LABELS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

function weeksWord(n: number) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'неделя';
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'недели';
  return 'недель';
}

export function RhythmScreen() {
  const { repo, userId } = useActivitiesRepo();
  const [rhythm, setRhythm] = useState<RhythmView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setRhythm(await repo.getRhythm(userId));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [repo, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const hasRhythm = (rhythm?.streakWeeks ?? 0) > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Мой ритм" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={colors.text.muted} style={styles.loader} />
        ) : error ? (
          <LoadError inline onRetry={() => void load()} />
        ) : (
          <>
            {/* Streak hero — gentle reflection, not a target */}
            <View style={styles.hero}>
              {hasRhythm ? (
                <>
                  <Text style={styles.heroNum}>
                    {rhythm!.streakWeeks} {weeksWord(rhythm!.streakWeeks)}
                  </Text>
                  <Text style={styles.heroSub}>в ритме круга</Text>
                </>
              ) : (
                <>
                  <Text style={styles.heroNumSoft}>Всё впереди</Text>
                  <Text style={styles.heroSub}>приходи на активность — и ритм появится сам</Text>
                </>
              )}
            </View>

            {/* This week */}
            <SectionLabel>Эта неделя</SectionLabel>
            <View style={styles.streak}>
              {(rhythm?.week ?? []).map((state, i) => (
                <View key={DAY_LABELS[i]} style={styles.wk}>
                  <View
                    style={[
                      styles.d,
                      state === 'attended' && styles.dOn,
                      state === 'planned' && styles.dSoft,
                    ]}
                  >
                    {state === 'attended' ? (
                      <IconCheck color={colors.text.inverse} size={16} />
                    ) : (
                      <Text
                        style={[styles.dText, state === 'planned' && styles.dTextSoft]}
                      >
                        {DAY_LETTERS[i]}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.wkLabel}>{DAY_LABELS[i]}</Text>
                </View>
              ))}
            </View>

            {/* Recently attended */}
            {rhythm && rhythm.recent.length > 0 ? (
              <>
                <SectionLabel>Недавно</SectionLabel>
                <View style={styles.recent}>
                  {rhythm.recent.map((r) => (
                    <View key={r.id} style={styles.row} testID={`rhythm-recent-${r.id}`}>
                      <IconTile bg={r.icon === 'users' ? '#EFE6D8' : colors.trust.verifiedBg}>
                        {r.icon === 'users' ? (
                          <IconUsers color="#8A5A3A" size={20} />
                        ) : (
                          <IconCheck color={GREEN} size={20} />
                        )}
                      </IconTile>
                      <View style={styles.rowMain}>
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {r.title}
                        </Text>
                        <Text style={styles.rowMeta}>{r.when}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  body: { padding: spacing[6], paddingTop: spacing[1] },
  loader: { alignSelf: 'flex-start', marginTop: spacing[4] },

  // streak hero
  hero: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: spacing[1],
  },
  heroNum: { fontFamily: PLAYFAIR_FAMILY, fontSize: 40, color: GREEN },
  heroNumSoft: { fontFamily: PLAYFAIR_FAMILY, fontSize: 30, color: GREEN, letterSpacing: -0.4 },
  heroSub: { fontSize: 14, color: colors.text.secondary, marginTop: 4, textAlign: 'center' },

  // week grid
  streak: { flexDirection: 'row', gap: 7 },
  wk: { flex: 1, alignItems: 'center' },
  d: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dOn: { backgroundColor: GREEN, borderColor: GREEN },
  dSoft: { backgroundColor: colors.trust.verifiedBg, borderColor: '#CFE0CA' },
  dText: { fontFamily: typography.badge.fontFamily, fontSize: 13, color: colors.text.muted },
  dTextSoft: { color: GREEN },
  wkLabel: { fontSize: 11, color: colors.text.muted, marginTop: 6, fontFamily: typography.caption.fontFamily },

  // recently attended
  recent: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  rowMain: { flex: 1, minWidth: 0 },
  rowTitle: { fontFamily: typography.badge.fontFamily, fontSize: 15.5, color: colors.text.primary },
  rowMeta: { fontSize: 13, color: colors.text.secondary, marginTop: 2, fontFamily: typography.caption.fontFamily },
});
