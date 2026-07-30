// AUTH — Signup (social sign-in), pixel-matched to mockups/all-screens.html frame B
// «Создай аккаунт»: ANTIDOT wordmark, hero title, Apple / Google / e-mail buttons, a
// consent notice, and a bottom «Уже есть аккаунт? Войти». Design-v2 auth model — no
// password field. E-mail routes to the passwordless OTP login.
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, INTER_SEMIBOLD, spacing, typography } from '@social-events/ui';

import { useGoBack } from '../../../lib/useGoBack';
import { BrandMini, HeroTitle, ScreenHeader } from '../../../components';
import { signInWithProvider } from '../actions/otpAuth';

function GoogleLogo() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path fill="#4285F4" d="M21.6 12.2c0-.7-.06-1.3-.2-2H12v3.8h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z" />
      <Path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6C4.7 19.9 8.1 22 12 22Z" />
      <Path fill="#FBBC05" d="M6.4 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.6H3.1C2.4 8.9 2 10.4 2 12s.4 3.1 1.1 4.4l3.3-2.6Z" />
      <Path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.9 14.7 2 12 2 8.1 2 4.7 4.1 3.1 7.6l3.3 2.6C7.2 7.6 9.4 5.9 12 5.9Z" />
    </Svg>
  );
}

export function SignupScreen() {
  const router = useRouter();
  const goBack = useGoBack('/welcome');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withProvider = async (provider: 'apple' | 'google') => {
    setError(null);
    setBusy(true);
    const r = await signInWithProvider(provider);
    setBusy(false);
    if (!r.ok) setError(r.error.message);
  };

  return (
    <View style={styles.root}>
      <ScreenHeader onBack={goBack} />

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <BrandMini />
        <HeroTitle style={styles.title}>Создай аккаунт</HeroTitle>
        <Text style={styles.sub}>Это займёт минуту. Никакого свайпа и каталогов людей.</Text>

        <View style={styles.socs}>
          <Pressable
            style={[styles.soc, styles.apple]}
            disabled={busy}
            onPress={() => withProvider('apple')}
            accessibilityRole="button"
            testID="signup-apple"
          >
            <Ionicons name="logo-apple" size={19} color={colors.text.inverse} />
            <Text style={[styles.socLabel, styles.appleLabel]}>Продолжить с Apple</Text>
          </Pressable>

          <Pressable
            style={[styles.soc, styles.outline]}
            disabled={busy}
            onPress={() => withProvider('google')}
            accessibilityRole="button"
            testID="signup-google"
          >
            <GoogleLogo />
            <Text style={styles.socLabel}>Продолжить с Google</Text>
          </Pressable>

          <Pressable
            style={[styles.soc, styles.outline]}
            disabled={busy}
            onPress={() => router.push('/login')}
            accessibilityRole="button"
            testID="signup-email"
          >
            <Ionicons name="mail-outline" size={19} color={colors.text.secondary} />
            <Text style={styles.socLabel}>Продолжить с почтой</Text>
          </Pressable>
        </View>

        {error ? (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}

        <View style={styles.notice}>
          <Ionicons name="lock-closed-outline" size={16} color={colors.text.muted} />
          <Text style={styles.noticeText}>
            Продолжая, ты соглашаешься с правилами сообщества. Профиль виден только участникам ваших
            общих активностей.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <Text style={styles.bottomText}>Уже есть аккаунт? </Text>
        <Pressable onPress={() => router.push('/login')} accessibilityRole="button" testID="signup-login">
          <Text style={styles.bottomLink}>Войти</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.default },
  body: { paddingHorizontal: spacing[6], paddingTop: 22, paddingBottom: 90 },
  title: { marginTop: 22 },
  sub: { ...typography.body, fontSize: 15, lineHeight: 22, color: colors.text.secondary, marginTop: 10 },

  socs: { gap: 12, marginTop: 32 },
  soc: { height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  apple: { backgroundColor: '#15130F' },
  outline: { backgroundColor: colors.surface.default, borderWidth: 1, borderColor: colors.border.default },
  socLabel: { fontFamily: INTER_SEMIBOLD, fontSize: 15.5, color: colors.text.primary },
  appleLabel: { color: colors.text.inverse },

  error: { ...typography.body, fontSize: 14, color: colors.status.danger, marginTop: 14 },
  notice: { flexDirection: 'row', gap: 8, marginTop: 22, paddingHorizontal: 2 },
  noticeText: { ...typography.caption, color: colors.text.muted, flex: 1, lineHeight: 18 },

  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingBottom: spacing[8],
  },
  bottomText: { ...typography.body, fontSize: 15, color: colors.text.secondary },
  bottomLink: { ...typography.body, fontSize: 15, fontWeight: '600', color: colors.accent.coral },
});
