// ACT-003 / DS v2 — Activity "invitation" card for the feed, pixel-matched to
// mockups/feed.html: photo hero (scrim + clock/time chip + slots chip + bookmark) →
// title → area → composition footer → circle + trust badge. Tapping opens the detail
// (the claim happens there). The city feed shows only AGGREGATE composition: the
// avatar row is DECORATIVE (anonymous — no real identities), because revealing who is
// going to strangers would break Inv. 1/13 + our RLS ("no people marketplace").
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '@social-events/ui';

import type { ActivityView } from '../data/repository';
import { formatTime } from '../lib/format';
import { kindImage } from '../lib/kindImage';

type Props = {
  view: ActivityView;
  onOpen?: (activityId: string) => void;
};

// Decorative avatar tints (warm, anonymous — NOT tied to any real user).
const AVATAR_TINTS = ['#D9CBB8', '#C9B9A2', '#B7C2AE', '#D6C3B0', '#C2B4A0'];

// RU plural for «место»: 1 → место, 2–4 → места, 0 / 5+ → мест.
function spotsWord(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'место';
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'места';
  return 'мест';
}

export function ActivityCard({ view, onOpen }: Props) {
  const { activity, group } = view;
  const remaining = view.spotsRemaining;
  const full = remaining === 0;
  const avatarCount = Math.min(view.spotsTaken, 5);
  const [saved, setSaved] = useState(false);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => onOpen?.(activity.id)}
      accessibilityRole="button"
      testID={`open-${activity.id}`}
    >
      <View style={styles.heroWrap}>
        <Image source={kindImage(activity.kind)} style={styles.hero} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(21,19,15,0.28)', 'rgba(21,19,15,0)']}
          locations={[0, 0.34]}
          style={styles.scrim}
          pointerEvents="none"
        />
        <View style={styles.timeChip}>
          <Ionicons name="time-outline" size={13} color={colors.text.inverse} />
          <Text style={styles.timeChipText}>{formatTime(activity.startsAt)}</Text>
        </View>
        <View style={styles.slotChip}>
          <Text style={styles.slotChipText}>
            {full ? 'Мест нет' : `${remaining} ${spotsWord(remaining)}`}
          </Text>
        </View>
        <Pressable
          onPress={() => setSaved((s) => !s)}
          style={styles.bookmark}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Убрать из сохранённых' : 'Сохранить'}
          accessibilityState={{ selected: saved }}
          testID={`bookmark-${activity.id}`}
        >
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={17}
            color={colors.action.primary}
          />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {activity.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {activity.area}
        </Text>

        <View style={styles.footer}>
          <View style={styles.avatars}>
            {Array.from({ length: avatarCount }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.avatar,
                  {
                    backgroundColor: AVATAR_TINTS[i % AVATAR_TINTS.length],
                    marginLeft: i === 0 ? 0 : -8,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.count}>
            {view.spotsTaken}/{activity.totalSpots} мест занято
          </Text>
        </View>

        <View style={styles.circleRow}>
          <Text style={styles.circleName} numberOfLines={1}>
            Круг «{group.name}»
          </Text>
          <View style={styles.badge}>
            <Ionicons name="checkmark" size={13} color={colors.trust.verifiedText} />
            <Text style={styles.badgeText}>Проверен</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.default,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    ...shadows.card,
  },
  pressed: { opacity: 0.9 },
  heroWrap: { height: 158, width: '100%' },
  hero: { width: '100%', height: 158 },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, height: '100%' },
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
  slotChip: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    backgroundColor: colors.surface.default,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  slotChipText: { ...typography.badge, color: colors.action.primary },
  bookmark: {
    position: 'absolute',
    bottom: spacing[3],
    right: spacing[3],
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,253,249,0.92)',
    borderRadius: radius.full,
  },
  body: { padding: spacing[4], gap: spacing[2] },
  title: { ...typography.section, color: colors.text.primary },
  meta: { ...typography.body, fontSize: 14.5, lineHeight: 20, color: colors.text.secondary },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  avatars: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.surface.default,
  },
  count: { ...typography.caption, color: colors.text.muted },
  circleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[1],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  circleName: { ...typography.caption, color: colors.text.muted, flex: 1 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.trust.verifiedBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgeText: { ...typography.badge, fontSize: 12.5, color: colors.trust.verifiedText },
});
