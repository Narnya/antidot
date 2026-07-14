// (public) → welcome. The brand poster (DS v2, docs/35 §Welcome): a full-bleed
// shoreline photo + soft legibility scrims, then ANTIDOT → «Найди свой круг / без
// дейтинга» → «Сначала общее занятие. Потом знакомство.» → CTA «Посмотреть
// активности» (→ signup) → «Уже есть аккаунт? Войти» (→ login).
//
// AUTH-007: authenticated users never reach this screen — the (public) gate
// redirects them forward. The Welcome sells emotion; the app sells activities.
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@social-events/ui';

import WELCOME_BG from '../../assets/images/welcome-bg.png';

export default function Welcome() {
  return (
    <View style={styles.root}>
      <Image source={WELCOME_BG} style={styles.bg} resizeMode="cover" />
      {/* light scrim up top so the dark wordmark/headline read on the sky */}
      <LinearGradient
        colors={['rgba(247,245,239,0.7)', 'rgba(247,245,239,0)']}
        style={styles.topScrim}
        pointerEvents="none"
      />
      {/* dark scrim at the bottom so the CTA + login link read on the rocks */}
      <LinearGradient
        colors={['rgba(21,19,15,0)', 'rgba(21,19,15,0.7)']}
        style={styles.bottomScrim}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.top}>
            <Text style={styles.brand}>ANTIDOT</Text>
            <Text style={styles.headline}>
              Найди свой круг{'\n'}
              <Text style={styles.headlineAccent}>без дейтинга</Text>
            </Text>
            <Text style={styles.subtitle}>Сначала общее занятие.{'\n'}Потом знакомство.</Text>
          </View>

          <View style={styles.actions}>
            <Link href="/signup" style={styles.cta} testID="welcome-signup-link">
              Посмотреть активности
            </Link>
            <Link href="/login" style={styles.login} testID="welcome-login-link">
              Уже есть аккаунт? Войти
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.default, overflow: 'hidden' },
  bg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  topScrim: { position: 'absolute', top: 0, left: 0, right: 0, height: '42%' },
  bottomScrim: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%' },
  safe: { flex: 1 },
  content: { flex: 1, padding: spacing[6], justifyContent: 'space-between' },
  top: { marginTop: spacing[8], gap: spacing[4] },
  brand: { fontSize: 20, fontWeight: '700', letterSpacing: 6, color: colors.text.primary },
  headline: { ...typography.display, fontSize: 44, lineHeight: 50, color: colors.text.primary },
  headlineAccent: {
    ...typography.display,
    fontSize: 44,
    lineHeight: 50,
    color: colors.accent.coral,
  },
  subtitle: { ...typography.body, fontSize: 17, lineHeight: 24, color: colors.text.secondary },
  actions: { gap: spacing[3], marginBottom: spacing[4] },
  cta: {
    ...typography.button,
    color: colors.action.primaryText,
    backgroundColor: colors.action.primary,
    textAlign: 'center',
    paddingVertical: spacing[4],
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  login: {
    ...typography.body,
    color: colors.text.inverse,
    textAlign: 'center',
    paddingVertical: spacing[3],
  },
});
