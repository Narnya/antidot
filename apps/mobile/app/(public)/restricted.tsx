// AUTH-007 — placeholder "Access Restricted" route. Reachable by URL `/restricted`
// but NOT redirected to by any gate in Sprint 2 — no real moderation backend or
// `profile_status` enum exists yet. Future MOD-005 / MOD-006 work will wire this
// route into the auth state machine once the real schema lands (Schema v2 §7.1
// + Moderation v2 §14).
//
// Copy follows the non-stigmatizing tone of /docs/09 §32 and CLAUDE.md §11:
// no shame, no "вас исключили", and an explicit support hint.
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@social-events/ui';

export default function Restricted() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>Доступ ограничен</Text>
        <Text style={styles.body}>
          Ваш аккаунт временно ограничен. Если вы считаете, что это ошибка, обратитесь в поддержку.
        </Text>
        <Text style={styles.note}>
          Это временный экран. Реальная логика появится после задач модерации.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  container: {
    flex: 1,
    padding: spacing[6],
    justifyContent: 'center',
    gap: spacing[3],
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
  },
  body: {
    ...typography.body,
    color: colors.text.secondary,
  },
  note: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing[3],
  },
});
