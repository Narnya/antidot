// ACT / T4 — Profile. One screen, two modes (mockup frames 11 · self, D · foreign):
//   - self  → My Profile (TAB): avatar + name + area, soft NON-numeric badges,
//             participation stats (круга/встреч/недель — NOT a trust score, Inv. 3),
//             «О себе» + interest chips. Gear top-right → Settings (no inline edit —
//             editing lives in the onboarding/settings flow, matching the mockup).
//   - other → Public Safe Profile (STACK): back + flag(report), badges, «Общий
//             контекст», «О себе», and a LOCKED «Написать» row — no cold DM before a
//             shared activity (Inv. 2). Block is reachable via the report flow.
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, PLAYFAIR_FAMILY, radius, shadows, spacing, typography } from '@social-events/ui';

import {
  IconButton,
  IconCheck,
  IconGear,
  IconFlag,
  IconLock,
  IconShield,
  IconTile,
  IconUsers,
  ScreenHeader,
} from '../../../components';
import { useGoBack } from '../../../lib/useGoBack';
import type { Profile, TrustBadgeKey } from '../data/repository';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';

const GREEN = colors.action.primary;

type Props = { profileUserId?: string };

// Soft badges are shown ONLY when earned (profile.badges) — never a blanket set.
const BADGE_META: Record<TrustBadgeKey, { label: string; Icon: typeof IconShield }> = {
  verified: { label: 'Проверен', Icon: IconShield },
  reliable: { label: 'Надёжный участник', Icon: IconCheck },
  hosted: { label: 'Проводил встречи', Icon: IconUsers },
};

export function ProfileScreen({ profileUserId }: Props) {
  const router = useRouter();
  const goBack = useGoBack();
  const { repo, userId } = useActivitiesRepo();
  const targetId = profileUserId && profileUserId.length > 0 ? profileUserId : userId;
  const isSelf = targetId === userId;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setProfile(await repo.getProfile(targetId));
    setLoading(false);
  }, [repo, targetId]);

  useEffect(() => {
    void load();
  }, [load]);

  const name = profile?.displayName ?? 'Без имени';
  const initial = name.trim().charAt(0).toUpperCase() || '·';

  const earnedBadges = profile?.badges ?? [];
  const badges =
    earnedBadges.length > 0 ? (
      <View style={styles.badgeWrap}>
        {earnedBadges.map((key) => {
          const { label, Icon } = BADGE_META[key];
          return (
            <View key={key} style={styles.badge}>
              <Icon color={GREEN} size={13} />
              <Text style={styles.badgeText}>{label}</Text>
            </View>
          );
        })}
      </View>
    ) : null;

  const profTop = (
    <View style={styles.profTop}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <Text style={styles.profName}>{name}</Text>
      {profile?.area ? <Text style={styles.profSub}>{profile.area}</Text> : null}
      {badges}
      {isSelf && profile?.stats ? (
        <View style={styles.statRow}>
          <Stat n={profile.stats.circles} l="круга" />
          <Stat n={profile.stats.meetings} l="встреч" />
          <Stat n={profile.stats.rhythmWeeks} l="недель ритм" />
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {isSelf ? (
        <View style={styles.selfHeader}>
          <IconButton onPress={() => router.push('/settings')} label="Настройки" testID="pf-settings">
            <IconGear color={colors.text.primary} size={20} />
          </IconButton>
        </View>
      ) : (
        <ScreenHeader
          onBack={goBack}
          right={
            <IconButton
              onPress={() => router.push(`/report?type=user&id=${targetId}`)}
              label="Пожаловаться"
              testID="pf-report"
            >
              <IconFlag color={colors.text.primary} size={18} />
            </IconButton>
          }
        />
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.text.muted} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          {profTop}

          {/* Fresh self profile (no «О себе» yet) — a soft, honest hint instead of
              a bare empty column. Explains that the profile fills in with activity. */}
          {isSelf && !profile?.bio ? (
            <View style={styles.selfHint}>
              <View style={styles.selfHintIc}>
                <IconUsers color={GREEN} size={26} />
              </View>
              <Text style={styles.selfHintTitle}>Профиль наполняется сам</Text>
              <Text style={styles.selfHintText}>
                Приходи на активности — здесь появятся твои круги, встречи и ритм. Мягкие бейджи
                добавляются, когда ты их заработал.
              </Text>
            </View>
          ) : null}

          {!isSelf && profile?.sharedContext ? (
            <View style={styles.section}>
              <Text style={styles.label}>Общий контекст</Text>
              <View style={styles.contextCard}>
                <IconTile>
                  <IconUsers color={GREEN} size={22} />
                </IconTile>
                <Text style={styles.contextText}>
                  Вы были вместе на{' '}
                  <Text style={styles.contextStrong}>
                    {profile.sharedContext.activities}{' '}
                    {plural(profile.sharedContext.activities, 'активности', 'активностях', 'активностях')}
                  </Text>
                  {'\n'}
                  <Text style={styles.contextMuted}>в кругу «{profile.sharedContext.circleName}»</Text>
                </Text>
              </View>
            </View>
          ) : null}

          {profile?.bio ? (
            <View style={styles.section}>
              <Text style={styles.label}>О себе</Text>
              <View style={styles.bioCard}>
                <Text style={styles.bioText}>{profile.bio}</Text>
              </View>
              {isSelf && profile.interests && profile.interests.length > 0 ? (
                <View style={styles.chips}>
                  {profile.interests.map((tag) => (
                    <View key={tag} style={styles.chip}>
                      <Text style={styles.chipText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          {!isSelf ? (
            <View style={styles.lockRow}>
              <IconTile bg={colors.background.subtle}>
                <IconLock color={colors.text.muted} size={20} />
              </IconTile>
              <View style={styles.lockText}>
                <Text style={styles.lockT1}>Написать</Text>
                <Text style={styles.lockT2}>Будет доступно после общей встречи</Text>
              </View>
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statN}>{n}</Text>
      <Text style={styles.statL}>{l}</Text>
    </View>
  );
}

function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  selfHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[2],
    paddingBottom: spacing[1],
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  body: { paddingBottom: spacing[10] },

  // prof-top
  profTop: { alignItems: 'center', paddingHorizontal: spacing[6], paddingTop: spacing[2] },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: radius.full,
    backgroundColor: '#CDBBA6',
    borderWidth: 3,
    borderColor: colors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.elevated,
  },
  avatarText: { fontFamily: PLAYFAIR_FAMILY, fontSize: 34, color: 'rgba(21,19,15,0.32)' },
  profName: {
    fontFamily: PLAYFAIR_FAMILY,
    fontSize: 26,
    letterSpacing: -0.3,
    color: colors.text.primary,
    marginTop: 14,
  },
  profSub: { ...typography.body, fontSize: 14, color: colors.text.secondary, marginTop: 4 },

  // badges
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    justifyContent: 'center',
    marginTop: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.trust.verifiedBg,
    paddingLeft: 7,
    paddingRight: 9,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgeText: {
    fontFamily: typography.badge.fontFamily,
    fontSize: 12.5,
    color: colors.trust.verifiedText,
  },

  // stat row
  statRow: { flexDirection: 'row', gap: spacing[3], marginTop: 20, alignSelf: 'stretch' },
  stat: {
    flex: 1,
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statN: { fontFamily: PLAYFAIR_FAMILY, fontSize: 24, color: GREEN },
  statL: { fontSize: 12, color: colors.text.secondary, marginTop: 3, fontFamily: typography.caption.fontFamily },

  // sections
  section: { paddingHorizontal: spacing[6], marginTop: 22 },

  // soft self empty hint (fresh profile, no «О себе» yet)
  selfHint: {
    marginHorizontal: spacing[6],
    marginTop: 26,
    alignItems: 'center',
    paddingHorizontal: spacing[4],
  },
  selfHintIc: {
    width: 66,
    height: 66,
    borderRadius: radius.xl,
    backgroundColor: colors.trust.verifiedBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  selfHintTitle: { fontFamily: PLAYFAIR_FAMILY, fontSize: 20, letterSpacing: -0.3, color: colors.action.primary },
  selfHintText: {
    fontSize: 14.5,
    lineHeight: 21,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 10,
  },

  label: {
    fontFamily: typography.badge.fontFamily,
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 8,
    marginHorizontal: 2,
  },

  // context card (foreign)
  contextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 18,
    padding: 15,
  },
  contextText: { flex: 1, fontSize: 14, lineHeight: 20, color: colors.text.primary },
  contextStrong: { fontFamily: typography.badge.fontFamily, color: colors.text.primary },
  contextMuted: { color: colors.text.secondary },

  // bio card
  bioCard: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 18,
    padding: 15,
  },
  bioText: { fontSize: 14, lineHeight: 20, color: colors.text.secondary },

  // interest chips
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], paddingTop: 14 },
  chip: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.full,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  chipText: { fontSize: 13.5, lineHeight: 16, color: colors.text.primary, fontFamily: typography.caption.fontFamily },

  // locked write row (foreign — Inv. 2)
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginHorizontal: spacing[6],
    marginTop: 18,
    backgroundColor: colors.surface.field,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 16,
    padding: 15,
    opacity: 0.85,
  },
  lockText: { flex: 1 },
  lockT1: { fontFamily: typography.badge.fontFamily, fontSize: 15.5, color: colors.text.secondary },
  lockT2: { fontSize: 13, color: colors.text.secondary, marginTop: 2, fontFamily: typography.caption.fontFamily },
});
