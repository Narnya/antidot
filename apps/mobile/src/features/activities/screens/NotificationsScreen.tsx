// ACT / DS v2 (docs/35 §7) — Уведомления (mockup frame 10). Activity-scoped events
// only, each an `ic-tile` (rounded-square) glyph + t1/t2. It must NEVER surface
// another user's membership transitions beyond the neutral «Состав круга обновился»
// (Инв. 11/12). Data comes from repo.listNotifications (mock = the illustrative set;
// live = reminders derived from upcoming activities).
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, PLAYFAIR_FAMILY, radius, spacing, typography } from '@social-events/ui';

import {
  IconChat,
  IconCheck,
  IconClock,
  IconPin,
  IconTile,
  IconUsers,
} from '../../../components';
import type { NotificationItem, NotificationKind } from '../data/repository';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';
import { useUnreadNotifications } from '../hooks/useUnreadNotifications';

const GREEN = colors.action.primary;
const CORAL = colors.accent.coral;

// Per-kind tile glyph + colours, mapped to the mockup's ic-tile variants.
const TILE: Record<
  NotificationKind,
  { Icon: (p: { color: string; size?: number }) => JSX.Element; bg: string; fg: string; dim?: boolean }
> = {
  member_confirmed: { Icon: IconCheck, bg: colors.trust.verifiedBg, fg: GREEN },
  location_open: { Icon: IconPin, bg: colors.trust.verifiedBg, fg: GREEN },
  reminder: { Icon: IconClock, bg: '#F7DED6', fg: CORAL },
  chat: { Icon: IconChat, bg: colors.trust.verifiedBg, fg: GREEN },
  roster_updated: { Icon: IconUsers, bg: colors.background.subtle, fg: colors.text.secondary, dim: true },
  slot_claimed: { Icon: IconUsers, bg: colors.trust.verifiedBg, fg: GREEN },
};

export function NotificationsScreen() {
  const router = useRouter();
  const { repo, userId } = useActivitiesRepo();
  const { refresh: refreshBadge } = useUnreadNotifications();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setItems(await repo.listNotifications(userId));
    setLoading(false);
    // Mark pushed notifications read once the user is looking at them, then clear
    // the bell-tab badge.
    await repo.markNotificationsRead(userId);
    refreshBadge();
  }, [repo, userId, refreshBadge]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Уведомления</Text>

        {loading ? (
          <ActivityIndicator color={colors.text.muted} style={styles.loader} />
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <IconTile bg={colors.background.subtle}>
              <IconClock color={colors.text.muted} size={22} />
            </IconTile>
            <Text style={styles.emptyText}>Пока тихо. Здесь появятся напоминания о встречах.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {items.map((n) => {
              const t = TILE[n.kind];
              const Icon = t.Icon;
              const content = (
                <>
                  <IconTile bg={t.bg}>
                    <Icon color={t.fg} size={22} />
                  </IconTile>
                  <View style={styles.rowMain}>
                    <Text style={styles.rowTitle} numberOfLines={2}>
                      {n.title}
                    </Text>
                    <Text style={styles.rowMeta} numberOfLines={2}>
                      {n.detail}
                    </Text>
                  </View>
                </>
              );
              if (!n.href) {
                return (
                  <View key={n.id} style={[styles.row, t.dim && styles.rowDim]} testID={`noti-${n.id}`}>
                    {content}
                  </View>
                );
              }
              const href = n.href;
              return (
                <Pressable
                  key={n.id}
                  onPress={() => router.push(href as never)}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.row, t.dim && styles.rowDim, pressed && styles.pressed]}
                  testID={`noti-${n.id}`}
                >
                  {content}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  body: { padding: spacing[6], paddingTop: spacing[4] },
  title: {
    fontFamily: PLAYFAIR_FAMILY,
    fontSize: 24,
    letterSpacing: -0.3,
    color: colors.text.primary,
    marginBottom: spacing[4],
  },
  loader: { alignSelf: 'flex-start' },
  empty: { alignItems: 'center', gap: spacing[3], paddingVertical: spacing[12] },
  emptyText: { ...typography.body, color: colors.text.muted, textAlign: 'center', maxWidth: 260 },
  list: { gap: spacing[3] },
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
  rowDim: { opacity: 0.7 },
  rowMain: { flex: 1, minWidth: 0 },
  rowTitle: { fontFamily: typography.badge.fontFamily, fontSize: 15.5, color: colors.text.primary },
  rowMeta: { fontSize: 13, color: colors.text.secondary, marginTop: 2, fontFamily: typography.caption.fontFamily },
  pressed: { opacity: 0.85 },
});
