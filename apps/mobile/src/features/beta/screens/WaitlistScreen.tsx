// BETA-002 — Waitlist signup, pixel-matched to mockups/all-screens.html frame G
// «Лист ожидания»: ANTIDOT wordmark, hero title, e-mail + optional name / area
// fields, «Встать в лист ожидания», and an «У меня есть инвайт-код» link. Validation
// + placeholder submit unchanged.
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@social-events/ui';

import { BrandMini, Button, Field, FieldLabel, HeroTitle, ScreenHeader } from '../../../components';
import { submitWaitlistPlaceholder } from '../lib/waitlistPlaceholder';
import { validateWaitlistInput } from '../lib/waitlistValidation';

type UiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success' };

export function WaitlistScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [uiState, setUiState] = useState<UiState>({ status: 'idle' });

  const isLoading = uiState.status === 'loading';
  const isSuccess = uiState.status === 'success';
  const clearErr = () => {
    if (uiState.status === 'error') setUiState({ status: 'idle' });
  };

  const handleSubmit = async () => {
    const result = validateWaitlistInput({ email, name, city });
    switch (result.kind) {
      case 'empty_email':
        setUiState({ status: 'error', message: 'Введите e-mail.' });
        return;
      case 'invalid_email':
        setUiState({ status: 'error', message: 'Проверьте формат e-mail.' });
        return;
      case 'valid': {
        setUiState({ status: 'loading' });
        try {
          const submission = await submitWaitlistPlaceholder(result.values);
          setUiState(
            submission.ok
              ? { status: 'success' }
              : { status: 'error', message: submission.message },
          );
        } catch {
          setUiState({ status: 'error', message: 'Не удалось отправить. Попробуйте ещё раз.' });
        }
        return;
      }
    }
  };

  return (
    <View style={styles.root}>
      <ScreenHeader onBack={() => router.back()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BrandMini />
          <HeroTitle style={styles.title}>Лист ожидания</HeroTitle>
          <Text style={styles.sub}>
            Antidot пока в закрытой бете. Оставь почту — позовём, как откроем твой район.
          </Text>

          {isSuccess ? (
            <View style={styles.successBlock} accessibilityRole="alert">
              <Text style={styles.successTitle}>Вы в листе ожидания</Text>
              <Text style={styles.successBody}>Спасибо. Позовём, как только откроем доступ.</Text>
            </View>
          ) : (
            <>
              <View style={styles.field}>
                <FieldLabel>E-mail</FieldLabel>
                <Field
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    clearErr();
                  }}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isLoading}
                  leftIcon={<Ionicons name="mail-outline" size={19} color={colors.text.muted} />}
                  testID="waitlist-email"
                />
              </View>
              <View style={styles.field}>
                <FieldLabel>
                  Имя <Text style={styles.optional}>(необязательно)</Text>
                </FieldLabel>
                <Field
                  value={name}
                  onChangeText={(t) => {
                    setName(t);
                    clearErr();
                  }}
                  placeholder="Как тебя звать"
                  editable={!isLoading}
                  testID="waitlist-name"
                />
              </View>
              <View style={styles.field}>
                <FieldLabel>
                  Город или район <Text style={styles.optional}>(необязательно)</Text>
                </FieldLabel>
                <Field
                  value={city}
                  onChangeText={(t) => {
                    setCity(t);
                    clearErr();
                  }}
                  placeholder="Санкт-Петербург · Приморский"
                  editable={!isLoading}
                  leftIcon={<Ionicons name="location-outline" size={19} color={colors.text.muted} />}
                  testID="waitlist-city"
                />
              </View>

              {uiState.status === 'error' ? (
                <Text style={styles.error} accessibilityRole="alert">
                  {uiState.message}
                </Text>
              ) : null}

              <View style={styles.cta}>
                <Button
                  label={isLoading ? 'Отправляем…' : 'Встать в лист ожидания'}
                  disabled={isLoading}
                  onPress={handleSubmit}
                />
              </View>
            </>
          )}

          <Pressable
            onPress={() => router.push('/invite')}
            style={styles.link}
            accessibilityRole="button"
            testID="waitlist-invite-link"
          >
            <Text style={styles.linkText}>
              У меня есть <Text style={styles.linkAccent}>инвайт-код</Text>
            </Text>
          </Pressable>
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
  optional: { fontWeight: '400', color: colors.text.muted },
  error: { ...typography.body, fontSize: 14, color: colors.status.danger, marginTop: 14 },
  cta: { marginTop: 26 },
  link: { alignItems: 'center', paddingVertical: 18 },
  linkText: { ...typography.body, fontSize: 15, color: colors.text.secondary },
  linkAccent: { fontWeight: '600', color: colors.accent.coral },
  successBlock: {
    gap: 4,
    marginTop: 24,
    padding: spacing[4],
    backgroundColor: colors.safety.noticeBg,
    borderRadius: 16,
  },
  successTitle: { ...typography.section, color: colors.safety.noticeText },
  successBody: { ...typography.body, fontSize: 14.5, color: colors.safety.noticeText },
});
