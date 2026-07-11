// ACT-006 — My Circles (belonging home). The second centre: the user's circles
// and their upcoming activities — the retention surface («круг = дом»). Mock
// repository; prototype only.
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@social-events/ui';

import type { ActivityView } from '../data/repository';
import { formatWhen, kindEmoji } from '../lib/format';
import type { Group } from '../lib/model';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';

export function MyCirclesScreen() {
  const router = useRouter();
  const { repo, userId } = useActivitiesRepo();
  const [groups, setGroups] = useState<Group[]>([]);
  const [byGroup, setByGroup] = useState<Record<string, ActivityView[]>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [gs, acts] = await Promise.all([
      repo.listMyGroups(userId),
      repo.listMyActivities(userId),
    ]);
    const grouped: Record<string, ActivityView[]> = {};
    for (const v of acts) {
      (grouped[v.activity.groupId] ??= []).push(v);
    }
    setGroups(gs);
    setByGroup(grouped);
    setLoading(false);
  }, [repo, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Мои круги</Text>
        <Text style={styles.subtitle}>Твои круги и их ближайшие встречи</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.text.muted} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.navRow}>
            <Pressable
              onPress={() => router.push('/feed')}
              style={styles.navBtn}
              accessibilityRole="button"
              testID="circles-open-feed"
            >
              <Text style={styles.navBtnText}>Активности рядом →</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/create')}
              style={[styles.navBtn, styles.navBtnPrimary]}
              accessibilityRole="button"
              testID="circles-create"
            >
              <Text style={[styles.navBtnText, styles.navBtnTextPrimary]}>+ Создать</Text>
            </Pressable>
          </View>

          {groups.map((g) => {
            const acts = byGroup[g.id] ?? [];
            return (
              <View key={g.id} style={styles.group}>
                <Pressable
                  style={styles.groupHead}
                  onPress={() => router.push(`/circle/${g.id}`)}
                  accessibilityRole="button"
                  testID={`open-circle-${g.id}`}
                >
                  <Text style={styles.groupName} numberOfLines={1}>
                    {g.name}
                  </Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>✓ Проверен</Text>
                  </View>
                </Pressable>

                {acts.length === 0 ? (
                  <Text style={styles.emptyRow}>Пока нет активностей</Text>
                ) : (
                  acts.map((v) => {
                    const remaining = v.spotsRemaining;
                    const taken = v.spotsTaken;
                    return (
                      <Pressable
                        key={v.activity.id}
                        onPress={() => router.push(`/activity/${v.activity.id}`)}
                        style={({ pressed }) => [styles.actRow, pressed && styles.pressed]}
                        accessibilityRole="button"
                        testID={`circle-act-${v.activity.id}`}
                      >
                        <Text style={styles.actEmoji}>{kindEmoji(v.activity.kind)}</Text>
                        <View style={styles.actMain}>
                          <Text style={styles.actTitle} numberOfLines={1}>
                            {v.activity.title}
                          </Text>
                          <Text style={styles.actMeta}>{formatWhen(v.activity.startsAt)}</Text>
                        </View>
                        <Text style={styles.actSpots}>
                          {remaining > 0 ? `нужно +${remaining}` : `идут ${taken}`}
                        </Text>
                      </Pressable>
                    );
                  })
                )}
              </View>
            );
          })}

          <Pressable
            onPress={() => router.push('/circle/create')}
            style={({ pressed }) => [styles.newCircle, pressed && styles.pressed]}
            accessibilityRole="button"
            testID="circles-new-circle"
          >
            <Text style={styles.newCircleText}>+ Новый круг</Text>
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    gap: spacing[1],
  },
  title: { ...typography.title, color: colors.text.primary },
  subtitle: { ...typography.body, color: colors.text.secondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  body: { padding: spacing[6], paddingTop: spacing[2], gap: spacing[5] },
  navRow: { flexDirection: 'row', gap: spacing[3] },
  navBtn: {
    flex: 1,
    backgroundColor: colors.action.secondary,
    borderRadius: radius.md,
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  navBtnPrimary: { backgroundColor: colors.action.primary },
  navBtnText: { ...typography.button, color: colors.text.primary },
  navBtnTextPrimary: { color: colors.action.primaryText },
  group: { gap: spacing[2] },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  groupName: { ...typography.heading, color: colors.text.primary, flex: 1 },
  badge: {
    backgroundColor: colors.trust.verifiedBg,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: { ...typography.badge, color: colors.trust.verifiedText },
  emptyRow: { ...typography.body, color: colors.text.muted, paddingVertical: spacing[2] },
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
  pressed: { opacity: 0.85 },
  newCircle: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    paddingVertical: spacing[3],
    alignItems: 'center',
    marginTop: spacing[2],
  },
  newCircleText: { ...typography.button, color: colors.text.primary },
});
