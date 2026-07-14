// ACT-003 / DS v2 — Activity "invitation" card for the feed. Photo hero + time /
// slots chips + title + area + composition footer. Tapping opens the detail (the
// claim happens there). The city feed shows only AGGREGATE composition: the avatar
// row is DECORATIVE (anonymous — no real identities), because revealing who is
// going to strangers would break Inv. 1/13 + our RLS ("no people marketplace").
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@social-events/ui';

import type { ActivityView } from '../data/repository';
import { formatDayLabel, formatTime } from '../lib/format';
import { kindImage } from '../lib/kindImage';

type Props = {
  view: ActivityView;
  onOpen?: (activityId: string) => void;
};

// Decorative avatar tints (warm, anonymous — NOT tied to any real user).
const AVATAR_TINTS = ['#D9CBB8', '#C9B9A2', '#B7C2AE', '#D6C3B0', '#C2B4A0'];

export function ActivityCard({ view, onOpen }: Props) {
  const { activity, group } = view;
  const remaining = view.spotsRemaining;
  const full = remaining === 0;
  const avatarCount = Math.min(view.spotsTaken, 5);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => onOpen?.(activity.id)}
      accessibilityRole="button"
      testID={`open-${activity.id}`}
    >
      <View style={styles.heroWrap}>
        <Image source={kindImage(activity.kind)} style={styles.hero} resizeMode="cover" />
        <View style={styles.timeChip}>
          <Text style={styles.timeChipText}>{formatTime(activity.startsAt)}</Text>
        </View>
        <View style={styles.slotChip}>
          <Text style={styles.slotChipText}>
            {full ? 'Мест нет' : `${remaining} ${remaining === 1 ? 'место' : 'мест'}`}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {activity.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {activity.area} · {formatDayLabel(activity.startsAt)}
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
            <Text style={styles.badgeText}>✓ Проверен</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.default,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.9 },
  heroWrap: { height: 160, width: '100%' },
  hero: { width: '100%', height: 160 },
  timeChip: {
    position: 'absolute',
    top: spacing[2],
    left: spacing[2],
    backgroundColor: 'rgba(21,19,15,0.55)',
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  timeChipText: { ...typography.badge, color: colors.text.inverse },
  slotChip: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    backgroundColor: colors.surface.default,
    paddingHorizontal: spacing[3],
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  slotChipText: { ...typography.badge, color: colors.text.primary },
  body: { padding: spacing[4], gap: spacing[2] },
  title: { ...typography.section, color: colors.text.primary },
  meta: { ...typography.body, color: colors.text.secondary },
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
  circleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginTop: spacing[1] },
  circleName: { ...typography.caption, color: colors.text.muted, flex: 1 },
  badge: {
    backgroundColor: colors.trust.verifiedBg,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: { ...typography.badge, color: colors.trust.verifiedText },
});
