// (public) → welcome. Minimal guest-facing landing surfacing the two auth entry
// points (`/login`, `/signup`). Final Figma v2 welcome will replace this later.
//
// AUTH-007 note: authenticated users do NOT reach this screen — the (public)
// route gate redirects them to /start or /home. Logout therefore lives on the
// onboarding and app placeholders (where authenticated users actually are), not
// here. A minimal SessionStatusLine remains as a dev-time verification surface
// for the rare case where this screen is rendered (e.g., immediately after
// SIGNED_OUT, before navigation settles).
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@social-events/ui';

import { useAuthSession } from '../../src/features/auth';

function SessionStatusLine() {
  const { isLoading, isAuthenticated, error } = useAuthSession();
  let label: string;
  if (isLoading) label = 'Загружаем сессию…';
  else if (error) label = error;
  else if (isAuthenticated) label = 'Сессия активна.';
  else label = 'Сессия неактивна.';
  return <Text style={styles.sessionStatus}>{label}</Text>;
}

export default function Welcome() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.brand}>Antidot</Text>
          <Text style={styles.tagline}>
            Доверенные круги для регулярных встреч. Доступ пока по приглашению.
          </Text>
          <SessionStatusLine />
        </View>

        <View style={styles.actions}>
          <Link href="/signup" style={styles.primaryLink} testID="welcome-signup-link">
            Создать аккаунт
          </Link>
          <Link href="/login" style={styles.secondaryLink} testID="welcome-login-link">
            Уже есть аккаунт? Войти
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  container: {
    flexGrow: 1,
    padding: spacing[6],
    justifyContent: 'space-between',
  },
  hero: {
    marginTop: spacing[12],
    gap: spacing[3],
  },
  brand: {
    ...typography.display,
    color: colors.text.primary,
  },
  tagline: {
    ...typography.body,
    color: colors.text.secondary,
  },
  sessionStatus: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing[2],
  },
  actions: {
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  primaryLink: {
    ...typography.button,
    color: colors.action.primaryText,
    backgroundColor: colors.action.primary,
    textAlign: 'center',
    paddingVertical: spacing[4],
    borderRadius: 12,
    overflow: 'hidden',
  },
  secondaryLink: {
    ...typography.body,
    color: colors.status.info,
    textAlign: 'center',
    paddingVertical: spacing[3],
  },
});
