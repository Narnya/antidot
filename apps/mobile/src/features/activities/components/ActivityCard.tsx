// ACT-003 / DS v2 — Activity card for the feed (объявления): a photo-hero
// "invitation" card. Presentation only; the claim decision lives in the slot
// rules / repository. You claim a SLOT here — never a person, and the city feed
// shows only AGGREGATE slots, never who is going (no people marketplace — Inv. 1/13).
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@social-events/ui';

import type { ActivityView } from '../data/repository';
import { formatWhen } from '../lib/format';
import { kindImage } from '../lib/kindImage';

type Props = {
  view: ActivityView;
  claimed: boolean;
  claiming: boolean;
  onClaim: (activityId: string) => void;
  onOpen?: (activityId: string) => void;
};

export function ActivityCard({ view, claimed, claiming, onClaim, onOpen }: Props) {
  const { activity, group } = view;
  const remaining = view.spotsRemaining;
  const full = remaining === 0;
  const disabled = claimed || full || claiming;

  const buttonLabel = claiming
    ? 'Записываем…'
    : claimed
      ? '✓ Вы записаны'
      : full
        ? 'Мест нет'
        : 'Занять место';

  return (
    <Pressable
      style={styles.card}
      onPress={() => onOpen?.(activity.id)}
      accessibilityRole="button"
      testID={`open-${activity.id}`}
    >
      <View style={styles.heroWrap}>
        <Image source={kindImage(activity.kind)} style={styles.hero} resizeMode="cover" />
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
        <Text style={styles.meta}>
          {formatWhen(activity.startsAt)} · {activity.area}
        </Text>
        <Text style={styles.spots}>
          {full ? 'Мест не осталось' : `Идут ${view.spotsTaken} из ${activity.totalSpots}`}
        </Text>

        <View style={styles.circleRow}>
          <Text style={styles.circleName} numberOfLines={1}>
            Круг «{group.name}»
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✓ Проверен</Text>
          </View>
        </View>

        <Pressable
          onPress={() => onClaim(activity.id)}
          disabled={disabled}
          style={({ pressed }) => [
            styles.button,
            claimed && styles.buttonClaimed,
            full && !claimed && styles.buttonFull,
            pressed && !disabled && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          testID={`claim-${activity.id}`}
        >
          <Text
            style={[
              styles.buttonText,
              claimed && styles.buttonTextClaimed,
              full && !claimed && styles.buttonTextFull,
            ]}
          >
            {buttonLabel}
          </Text>
        </Pressable>
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
  heroWrap: { height: 150, width: '100%' },
  hero: { width: '100%', height: 150 },
  slotChip: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    backgroundColor: colors.surface.default,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
  slotChipText: { ...typography.badge, color: colors.text.primary },
  body: { padding: spacing[4], gap: spacing[2] },
  title: { ...typography.section, color: colors.text.primary },
  meta: { ...typography.body, color: colors.text.secondary },
  spots: { ...typography.bodyMedium, color: colors.text.primary },
  circleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginTop: spacing[1] },
  circleName: { ...typography.caption, color: colors.text.muted, flex: 1 },
  badge: {
    backgroundColor: colors.trust.verifiedBg,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: { ...typography.badge, color: colors.trust.verifiedText },
  button: {
    backgroundColor: colors.action.primary,
    borderRadius: radius.md,
    paddingVertical: spacing[3],
    alignItems: 'center',
    marginTop: spacing[2],
  },
  buttonClaimed: { backgroundColor: colors.safety.noticeBg },
  buttonFull: { backgroundColor: colors.action.secondary },
  buttonPressed: { opacity: 0.85 },
  buttonText: { ...typography.button, color: colors.action.primaryText },
  buttonTextClaimed: { color: colors.safety.noticeText },
  buttonTextFull: { color: colors.text.muted },
});
