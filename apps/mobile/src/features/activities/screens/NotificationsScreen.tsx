// ACT / DS v2 (docs/35 §7) — Уведомления. Activity-scoped events only. This first
// cut derives reminders from the user's own upcoming activities; richer events
// (a guest claimed your slot, host confirmed you) are a follow-up. It must NEVER
// surface another user's membership transitions ("X ушёл / removed") — Инв. 11/12.
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@social-events/ui';

import type { ActivityView } from '../data/repository';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';
import { formatWhen } from '../lib/format';

export function NotificationsScreen() {
  const router = useRouter();
  const { repo, userId } = useActivitiesRepo();
  const [upcoming, setUpcoming] = useState<ActivityView[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setUpcoming(await repo.listMyActivities(userId));
    setLoading(false);
  }, [repo, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Уведомления</Text>

        {loading ? (
          <ActivityIndicator color={colors.text.muted} style={styles.loader} />
        ) : upcoming.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="notifications-outline" size={28} color={colors.text.muted} />
            <Text style={styles.emptyText}>Пока тихо. Здесь появятся напоминания о встречах.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {upcoming.map((v) => (
              <Pressable
                key={v.activity.id}
                onPress={() => router.push(`/activity/${v.activity.id}`)}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                accessibilityRole="button"
                testID={`noti-${v.activity.id}`}
              >
                <View style={styles.iconWrap}>
                  <Ionicons name="calendar-outline" size={18} color={colors.action.primary} />
                </View>
                <View style={styles.rowMain}>
                  <Text style={styles.rowTitle} numberOfLines={2}>
                    Напоминание о встрече «{v.activity.title}»
                  </Text>
                  <Text style={styles.rowMeta}>{formatWhen(v.activity.startsAt)}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  body: { padding: spacing[6], gap: spacing[3] },
  title: { ...typography.title, color: colors.text.primary, marginBottom: spacing[1] },
  loader: { alignSelf: 'flex-start' },
  empty: { alignItems: 'center', gap: spacing[3], paddingVertical: spacing[12] },
  emptyText: { ...typography.body, color: colors.text.muted, textAlign: 'center', maxWidth: 260 },
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
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.safety.noticeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMain: { flex: 1, gap: 2 },
  rowTitle: { ...typography.bodyMedium, color: colors.text.primary },
  rowMeta: { ...typography.caption, color: colors.text.secondary },
  pressed: { opacity: 0.85 },
});
