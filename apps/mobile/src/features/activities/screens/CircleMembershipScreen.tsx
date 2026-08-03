// Circle membership sheet (mockups/all-screens.html frame F «Участие в круге»): a
// bottom sheet over the dimmed Circle Home offering the two private, non-stigmatizing
// membership exits — «Поставить участие на паузу» / «Выйти из круга». No public
// signal to other members beyond «Состав круга обновился» (Inv. 11–12).
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, INTER_SEMIBOLD, PLAYFAIR_FAMILY, spacing, typography } from '@social-events/ui';

import { useGoBack } from '../../../lib/useGoBack';
import { Button, IconTile } from '../../../components';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';

type Props = { circleId: string; circleName: string };

export function CircleMembershipScreen({ circleId, circleName }: Props) {
  const router = useRouter();
  const goBack = useGoBack();
  const insets = useSafeAreaInsets();
  const { repo, userId } = useActivitiesRepo();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = goBack;

  const pause = async () => {
    setBusy(true);
    setError(null);
    try {
      await repo.pauseMembership(circleId, userId);
      goBack();
    } catch {
      setError('Не удалось поставить на паузу. Попробуй ещё раз.');
      setBusy(false);
    }
  };

  const leave = async () => {
    setBusy(true);
    setError(null);
    try {
      await repo.leaveCircle(circleId, userId);
      router.replace('/circles');
    } catch {
      setError('Не удалось выйти из круга. Попробуй ещё раз.');
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <Pressable style={styles.dim} onPress={close} accessibilityLabel="Закрыть" testID="cm-dim" />

      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing[6] }]}>
        <View style={styles.grabber} />
        <Text style={styles.title}>Участие в круге</Text>
        {circleName ? <Text style={styles.subtitle}>«{circleName}»</Text> : null}

        <Pressable
          style={styles.optRow}
          onPress={pause}
          disabled={busy}
          accessibilityRole="button"
          testID="cm-pause"
        >
          <IconTile bg={colors.surface.field}>
            <Ionicons name="time-outline" size={22} color={colors.text.secondary} />
          </IconTile>
          <View style={styles.optText}>
            <Text style={styles.ot1}>Поставить участие на паузу</Text>
            <Text style={styles.ot2}>Вернёшься, когда удобно. Место в круге сохранится.</Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.optRow, styles.optRowDivider]}
          onPress={leave}
          disabled={busy}
          accessibilityRole="button"
          testID="cm-leave"
        >
          <IconTile bg="#F7EDE9">
            <Ionicons name="log-out-outline" size={22} color={colors.accent.coral} />
          </IconTile>
          <View style={styles.optText}>
            <Text style={[styles.ot1, styles.leaveText]}>Выйти из круга</Text>
            <Text style={styles.ot2}>Круг пропадёт из «Мои круги».</Text>
          </View>
        </Pressable>

        <View style={styles.notice}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.text.muted} />
          <Text style={styles.noticeText}>
            Другие увидят только «Состав круга обновился». Ни отказов, ни ярлыков.
          </Text>
        </View>

        {error ? (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}

        <Button label="Отмена" variant="ghost" onPress={close} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(21,19,15,0.45)' },
  sheet: {
    backgroundColor: colors.background.default,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  grabber: {
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.border.default,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 14,
  },
  title: { fontFamily: PLAYFAIR_FAMILY, fontSize: 21, color: colors.text.primary, paddingHorizontal: 2 },
  subtitle: { ...typography.caption, color: colors.text.secondary, paddingHorizontal: 2, marginTop: 2, marginBottom: 6 },

  optRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 2 },
  optRowDivider: { borderTopWidth: 1, borderTopColor: colors.border.default },
  optText: { flex: 1 },
  ot1: { fontFamily: INTER_SEMIBOLD, fontSize: 16, color: colors.text.primary },
  ot2: { ...typography.caption, color: colors.text.secondary, marginTop: 2, lineHeight: 17 },
  leaveText: { color: colors.accent.coral },

  notice: { flexDirection: 'row', gap: 8, marginTop: 14, marginBottom: 18, paddingHorizontal: 2 },
  noticeText: { ...typography.caption, color: colors.text.muted, flex: 1, lineHeight: 18 },
  error: { ...typography.body, fontSize: 14, color: colors.status.danger, textAlign: 'center', marginBottom: 12, paddingHorizontal: 2 },
});
