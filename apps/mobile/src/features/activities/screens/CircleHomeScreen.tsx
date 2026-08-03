// ACT-009 / T2 — Circle Home. Per-circle hub (belonging surface), pixel-matched to
// mockups/all-screens.html frame 08: full-bleed hero → green title + aggregate
// avatar row → «Ближайшая активность» card → circle-chat row. Aggregate composition
// only, no people list (Inv. 13). This is belonging-only: host management (accept
// overflow guests + attendance) lives on the activity's «Управление» screen (frame
// M), reached from the activity detail — not here.
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, INTER_SEMIBOLD, radius, shadows, spacing, typography } from '@social-events/ui';

import { useGoBack } from '../../../lib/useGoBack';
import { Button, HeroTitle, IconButton, IconTile, LoadError, SectionLabel } from '../../../components';
import type { CircleView } from '../data/repository';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';
import { formatWhen } from '../lib/format';
import { kindImage } from '../lib/kindImage';

const AVATAR_TINTS = ['#D9CBB8', '#C9B9A2', '#B7C2AE', '#D6C3B0'];

// RU plural for «участник».
function membersWord(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'участник';
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'участника';
  return 'участников';
}

type Props = { circleId: string };

export function CircleHomeScreen({ circleId }: Props) {
  const { repo, userId } = useActivitiesRepo();
  const [view, setView] = useState<CircleView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const router = useRouter();
  const goBack = useGoBack();
  const insets = useSafeAreaInsets();

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setView(await repo.getCircle(circleId, userId));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [circleId, repo, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View style={styles.root}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.text.muted} />
        </View>
      ) : error ? (
        <LoadError onRetry={() => void load()} />
      ) : !view ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Круг не найден.</Text>
        </View>
      ) : (
        <Body view={view} />
      )}

      <View style={[styles.floatBack, { top: insets.top + spacing[2] }]} pointerEvents="box-none">
        <IconButton onPress={goBack} label="Назад" testID="ch-back">
          <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
        </IconButton>
      </View>
    </View>
  );
}

function Body({ view }: { view: CircleView }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { group, memberCount, nextActivity, isMember, isOwner } = view;
  const avatarCount = Math.min(memberCount, 4);
  const heroKind = nextActivity?.activity.kind ?? 'other';

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing[8] }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Image source={kindImage(heroKind)} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(21,19,15,0.34)', 'rgba(21,19,15,0)', colors.background.default]}
          locations={[0, 0.3, 0.62]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.content}>
        <HeroTitle style={styles.title}>{group.name}</HeroTitle>

        <View style={styles.aggRow}>
          <View style={styles.avatars}>
            {Array.from({ length: avatarCount }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.avatar,
                  { backgroundColor: AVATAR_TINTS[i % AVATAR_TINTS.length], marginLeft: i === 0 ? 0 : -8 },
                ]}
              />
            ))}
          </View>
          <Text style={styles.aggText}>
            {memberCount} {membersWord(memberCount)} · {group.area}
          </Text>
        </View>

        <SectionLabel>Ближайшая активность</SectionLabel>
        {nextActivity ? (
          <Pressable
            onPress={() => router.push(`/activity/${nextActivity.activity.id}`)}
            style={({ pressed }) => [styles.actCard, pressed && styles.pressed]}
            accessibilityRole="button"
            testID="ch-next"
          >
            <View style={styles.actHero}>
              <Image
                source={kindImage(nextActivity.activity.kind)}
                style={styles.actHeroImg}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['rgba(21,19,15,0.28)', 'rgba(21,19,15,0)']}
                locations={[0, 0.5]}
                style={styles.actScrim}
                pointerEvents="none"
              />
              <View style={styles.timeChip}>
                <Ionicons name="time-outline" size={13} color={colors.text.inverse} />
                <Text style={styles.timeChipText}>{formatWhen(nextActivity.activity.startsAt)}</Text>
              </View>
            </View>
            <View style={styles.actBody}>
              <Text style={styles.actTitle} numberOfLines={1}>
                {nextActivity.activity.title}
              </Text>
              <Text style={styles.actMeta}>
                {nextActivity.spotsTaken}/{nextActivity.activity.totalSpots} занято
                {isMember ? ' · ты в составе' : ''}
              </Text>
            </View>
          </Pressable>
        ) : (
          // No next meeting — a soft card (not a bare gray line) that points at the
          // «Создать активность» CTA below for the host, or reassures a member.
          <View style={[styles.listrow, styles.emptyCard]}>
            <IconTile size={42}>
              <Ionicons name="calendar-outline" size={20} color={colors.action.primary} />
            </IconTile>
            <View style={styles.rowTxt}>
              <Text style={styles.t1}>Пока нет встреч</Text>
              <Text style={styles.t2}>
                {isOwner
                  ? 'Создай активность — свои займут места, не хватит — откроешь городу.'
                  : 'Загляни позже — хост назначит следующую встречу.'}
              </Text>
            </View>
          </View>
        )}

        {isMember ? (
          <Pressable
            onPress={() => router.push(`/chat/${group.id}`)}
            style={({ pressed }) => [styles.listrow, pressed && styles.pressed]}
            accessibilityRole="button"
            testID="ch-chat"
          >
            <IconTile size={42}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.action.primary} />
            </IconTile>
            <View style={styles.rowTxt}>
              <Text style={styles.t1}>Чат круга</Text>
              <Text style={styles.t2}>Только для участников</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
          </Pressable>
        ) : null}

        {/* Belonging-only (frame 08). Host management (accept guests + attendance,
            frame M) is reached from the activity detail's «Управление», not here. */}
        <View style={styles.actions}>
          <Button label="Создать активность" onPress={() => router.push('/create')} />
        </View>

        {isMember && !isOwner ? (
          <Pressable
            onPress={() =>
              router.push({ pathname: '/circle-membership', params: { id: group.id, name: group.name } })
            }
            accessibilityRole="button"
            testID="ch-pause"
          >
            <Text style={styles.subtleLink}>Поставить участие на паузу</Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => router.push(`/report?type=circle&id=${group.id}`)}
          accessibilityRole="button"
          testID="ch-report"
        >
          <Text style={styles.subtleLink}>Пожаловаться на круг</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.default },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  empty: { ...typography.body, color: colors.text.muted },
  floatBack: { position: 'absolute', left: spacing[5], zIndex: 10 },

  hero: { width: '100%', height: 190 },
  content: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[3],
    marginTop: -28,
    backgroundColor: colors.background.default,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  title: { fontSize: 27, lineHeight: 32 },

  aggRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  avatars: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.background.default,
  },
  aggText: { fontSize: 13.5, color: colors.text.secondary },

  actCard: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.card,
  },
  actHero: { height: 120, width: '100%' },
  actHeroImg: { width: '100%', height: 120 },
  actScrim: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  timeChip: {
    position: 'absolute',
    top: spacing[3],
    left: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(21,19,15,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  timeChipText: { ...typography.badge, color: colors.text.inverse },
  actBody: { padding: spacing[4], gap: 3 },
  actTitle: { ...typography.section, fontSize: 16, color: colors.text.primary },
  actMeta: { ...typography.body, fontSize: 14.5, lineHeight: 20, color: colors.text.secondary },
  emptyCard: { alignItems: 'flex-start' },

  listrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginTop: 14,
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 16,
    padding: 15,
  },
  rowTxt: { flex: 1 },
  t1: { fontFamily: INTER_SEMIBOLD, fontSize: 15.5, color: colors.text.primary },
  t2: { ...typography.caption, color: colors.text.secondary, marginTop: 2 },

  actions: { marginTop: 22 },
  subtleLink: { ...typography.body, color: colors.text.muted, textAlign: 'center', paddingVertical: spacing[3] },
  pressed: { opacity: 0.9 },
});
