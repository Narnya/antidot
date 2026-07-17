// (public) → welcome. The brand poster (DS v2, docs/35 §Welcome), pixel-matched to
// the approved mockup mockups/welcome.html: full-bleed shoreline photo + soft
// legibility scrims, then the ANTIDOT wordmark (Inter 500, green, coral dot over the
// "I"), centered Playfair headline «Найди свой круг» (600), coral Playfair accent
// «без дейтинга» (500), a thin divider, «Сначала общее занятие. Потом знакомство.»
// (Inter), CTA «Посмотреть активности» (→ signup) and «Уже есть аккаунт? Войти».
//
// AUTH-007: authenticated users never reach this screen — the (public) gate
// redirects them forward. The Welcome sells emotion; the app sells activities.
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  colors,
  INTER_MEDIUM,
  INTER_REGULAR,
  PLAYFAIR_MEDIUM,
  spacing,
  typography,
} from '@social-events/ui';

import WELCOME_BG from '../../assets/images/welcome-bg.png';

const WORDMARK = ['A', 'N', 'T', 'I', 'D', 'O', 'T'];

/** ANTIDOT wordmark — evenly-spaced letters with a coral dot above the "I". */
function Wordmark() {
  return (
    <View style={styles.brandRow}>
      {WORDMARK.map((ch, i) =>
        ch === 'I' ? (
          <View key={i} style={styles.iWrap}>
            <Text style={styles.brandLetter}>I</Text>
            <View style={styles.iDot} />
          </View>
        ) : (
          <Text key={i} style={styles.brandLetter}>
            {ch}
          </Text>
        ),
      )}
    </View>
  );
}

export default function Welcome() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <Image source={WELCOME_BG} style={styles.bg} resizeMode="cover" />
      {/* strong ivory field up top so the green wordmark/headline read on the sky */}
      <LinearGradient
        colors={['#F7F5EF', '#F7F5EF', 'rgba(247,245,239,0)']}
        locations={[0, 0.65, 1]}
        style={styles.topScrim}
        pointerEvents="none"
      />
      {/* dark scrim at the bottom so the CTA + login link read on the rocks */}
      <LinearGradient
        colors={['rgba(21,19,15,0)', 'rgba(21,19,15,0.55)']}
        style={styles.bottomScrim}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Bottom spacing follows the mockup: max(48, home-indicator + 22). */}
        <View style={[styles.content, { paddingBottom: Math.max(48, insets.bottom + 22) }]}>
          <View style={styles.top}>
            <Wordmark />
            <Text style={styles.headline}>Найди{'\n'}свой круг</Text>
            <Text style={styles.accent}>без дейтинга</Text>
            <View style={styles.divider} />
            <Text style={styles.subtitle}>Сначала общее занятие.{'\n'}Потом знакомство.</Text>
          </View>

          <View style={styles.actions}>
            <Link href="/signup" style={styles.cta} testID="welcome-signup-link">
              Посмотреть активности
            </Link>
            <Link href="/login" style={styles.login} testID="welcome-login-link">
              <Text style={styles.loginText}>Уже есть аккаунт? </Text>
              <Text style={styles.loginLink}>Войти</Text>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const GREEN = colors.action.primary;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.default, overflow: 'hidden' },
  bg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  topScrim: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%' },
  bottomScrim: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%' },
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 35,
    paddingTop: spacing[10],
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  top: { alignItems: 'center' },

  // Wordmark — Inter 500, letters evenly spaced (gap), coral tittle over the "I".
  brandRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  iWrap: { position: 'relative', alignItems: 'center' },
  brandLetter: { fontFamily: INTER_MEDIUM, fontSize: 20, lineHeight: 20, color: GREEN },
  iDot: {
    position: 'absolute',
    top: -24,
    left: '50%',
    marginLeft: -3.5,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.accent.coral,
  },

  headline: {
    ...typography.display,
    fontSize: 42,
    lineHeight: 52,
    letterSpacing: -0.5,
    color: GREEN,
    textAlign: 'center',
    marginTop: spacing[8],
  },
  accent: {
    fontFamily: PLAYFAIR_MEDIUM,
    fontSize: 22,
    lineHeight: 24,
    color: colors.accent.coral,
    textAlign: 'center',
    marginTop: 15,
  },
  divider: { width: 1, height: 32, backgroundColor: '#45564C', opacity: 0.55, marginTop: 14 },
  subtitle: {
    fontFamily: INTER_REGULAR,
    fontSize: 13.5,
    lineHeight: 22,
    color: '#33423B',
    textAlign: 'center',
    marginTop: spacing[4],
  },

  actions: { alignSelf: 'stretch', alignItems: 'center', gap: spacing[4], marginBottom: 2 },
  cta: {
    alignSelf: 'stretch',
    fontFamily: INTER_MEDIUM,
    fontSize: 16,
    color: colors.action.primaryText,
    backgroundColor: GREEN,
    textAlign: 'center',
    paddingVertical: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  login: { textAlign: 'center' },
  loginText: { fontFamily: INTER_REGULAR, fontSize: 15, color: '#F0EBE1' },
  loginLink: { fontFamily: INTER_MEDIUM, fontSize: 15, color: colors.accent.coral },
});
