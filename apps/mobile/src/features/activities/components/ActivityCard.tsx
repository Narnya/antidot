// ACT-003 — Activity card for the feed (объявления). Presentation only; the
// claim decision lives in the slot rules / repository. Built on @social-events/ui
// tokens (warm-minimal). You claim a SLOT here — never a person (Invariant: no
// people marketplace).
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@social-events/ui';

import type { ActivityView } from '../data/repository';
import { formatWhen, kindEmoji } from '../lib/format';

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
      <View style={styles.titleRow}>
        <Text style={styles.emoji}>{kindEmoji(activity.kind)}</Text>
        <Text style={styles.title}>{activity.title}</Text>
      </View>

      <Text style={styles.meta}>
        {formatWhen(activity.startsAt)} · {activity.area}
      </Text>

      <Text style={styles.spots}>
        {full ? 'Мест не осталось' : `Не хватает ${remaining} из ${activity.totalSpots}`}
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.default,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing[4],
    gap: spacing[2],
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  emoji: { fontSize: 22 },
  title: { ...typography.section, color: colors.text.primary, flex: 1 },
  meta: { ...typography.body, color: colors.text.secondary },
  spots: { ...typography.bodyMedium, color: colors.text.primary },
  circleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[1],
  },
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
