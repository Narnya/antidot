// AUTH — Login (passwordless email OTP), pixel-matched to mockups/all-screens.html
// frame 02 «Вход»: back button, ANTIDOT wordmark, «С возвращением», e-mail + code
// fields, «Продолжить» / «Отправить код заново», and a privacy notice. On verify the
// SDK sets the session and the route gate takes over.
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@social-events/ui';

import { BrandMini, Button, Field, FieldLabel, HeroTitle, ScreenHeader } from '../../../components';
import { sendEmailCode, verifyEmailCode } from '../actions/otpAuth';
import { isValidEmail } from '../lib/auth';

export function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (!isValidEmail(email)) {
      setError('Введите корректный e-mail.');
      return;
    }
    setError(null);
    setLoading(true);
    const r = await sendEmailCode(email);
    setLoading(false);
    if (r.ok) setSent(true);
    else setError(r.error.message);
  };

  const handleContinue = async () => {
    if (!sent) return send();
    if (code.trim().length === 0) {
      setError('Введите код из письма.');
      return;
    }
    setError(null);
    setLoading(true);
    const r = await verifyEmailCode(email, code);
    setLoading(false);
    if (!r.ok) setError(r.error.message);
    // On success the session updates and the (public) gate redirects forward.
  };

  return (
    <View style={styles.root}>
      <ScreenHeader onBack={() => router.back()} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BrandMini />
          <HeroTitle style={styles.title}>С возвращением</HeroTitle>
          <Text style={styles.sub}>Войди по e-mail — пришлём код для входа. Без паролей.</Text>

          <View style={styles.field}>
            <FieldLabel>E-mail</FieldLabel>
            <Field
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (error) setError(null);
              }}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
              leftIcon={<Ionicons name="mail-outline" size={19} color={colors.text.muted} />}
              testID="login-email"
            />
          </View>

          <View style={styles.field}>
            <FieldLabel>Код из письма</FieldLabel>
            <Field
              value={code}
              onChangeText={(t) => {
                setCode(t);
                if (error) setError(null);
              }}
              placeholder="— — — —"
              keyboardType="number-pad"
              editable={!loading}
              testID="login-code"
            />
            {sent ? <Text style={styles.hint}>Код отправлен на {email.trim()}</Text> : null}
          </View>

          {error ? (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          ) : null}

          <View style={styles.cta}>
            <Button
              label={loading ? 'Секунду…' : 'Продолжить'}
              disabled={loading}
              onPress={handleContinue}
            />
          </View>
          <View style={styles.ctaGhost}>
            <Button label="Отправить код заново" variant="ghost" disabled={loading} onPress={send} />
          </View>

          <View style={styles.notice}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.text.muted} />
            <Text style={styles.noticeText}>
              Твой e-mail и активность не видны другим участникам. Точное место встречи открывается
              только когда ты занял слот.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.default },
  flex: { flex: 1 },
  body: { paddingHorizontal: spacing[6], paddingTop: 14, paddingBottom: spacing[8] },
  title: { marginTop: 22 },
  sub: { ...typography.body, fontSize: 15, lineHeight: 22, color: colors.text.secondary, marginTop: 10 },
  field: { marginTop: 16 },
  hint: { ...typography.caption, color: colors.text.muted, marginTop: 8, marginHorizontal: 2 },
  error: { ...typography.body, fontSize: 14, color: colors.status.danger, marginTop: 14 },
  cta: { marginTop: 26 },
  ctaGhost: { marginTop: 12 },
  notice: { flexDirection: 'row', gap: 8, marginTop: 26, paddingHorizontal: 2 },
  noticeText: { ...typography.caption, color: colors.text.muted, flex: 1, lineHeight: 18 },
});
