// BETA-002 — Waitlist signup screen (minimal infrastructure UI, not final Figma v2).
//
// Behavior:
//   - validates via pure `validateWaitlistInput` (trim + permissive email check);
//   - calls placeholder async submit; ALWAYS returns ok in this skeleton phase;
//   - shows success in-place — does NOT grant beta access, does NOT navigate;
//   - submission state is component-local only and clears on unmount;
//   - "У меня есть инвайт-код" links back to /invite for the bidirectional flow.
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@social-events/ui';

import { AuthTextInput } from '../../auth/components/AuthTextInput';
import { useAuthSession } from '../../auth';
import { submitWaitlistPlaceholder } from '../lib/waitlistPlaceholder';
import { validateWaitlistInput } from '../lib/waitlistValidation';

type UiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success' };

export function WaitlistScreen() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [uiState, setUiState] = useState<UiState>({ status: 'idle' });
  const { isSigningOut, signOut } = useAuthSession();

  const isLoading = uiState.status === 'loading';
  const isSuccess = uiState.status === 'success';

  const clearErrorOnEdit = () => {
    if (uiState.status === 'error') {
      setUiState({ status: 'idle' });
    }
  };

  const handleSubmit = async () => {
    const result = validateWaitlistInput({ email, name, city });
    switch (result.kind) {
      case 'empty_email':
        setUiState({ status: 'error', message: 'Введите email.' });
        return;
      case 'invalid_email':
        setUiState({ status: 'error', message: 'Проверьте формат email.' });
        return;
      case 'valid': {
        setUiState({ status: 'loading' });
        try {
          const submission = await submitWaitlistPlaceholder(result.values);
          if (submission.ok) {
            setUiState({ status: 'success' });
          } else {
            setUiState({ status: 'error', message: submission.message });
          }
        } catch {
          setUiState({
            status: 'error',
            message: 'Не удалось отправить заявку. Попробуйте ещё раз.',
          });
        }
        return;
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.body}>
            <Text style={styles.title}>Лист ожидания</Text>
            <Text style={styles.subtitle}>
              Оставьте email, и мы сообщим, когда появится доступ к закрытой бете.
            </Text>

            {isSuccess ? (
              <View style={styles.successBlock} accessibilityRole="alert">
                <Text style={styles.successTitle}>Вы в листе ожидания</Text>
                <Text style={styles.successBody}>
                  Спасибо. Мы сообщим вам, когда появится доступ.
                </Text>
              </View>
            ) : (
              <View style={styles.form}>
                <AuthTextInput
                  label="Email"
                  value={email}
                  onChangeText={(next) => {
                    setEmail(next);
                    clearErrorOnEdit();
                  }}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  editable={!isLoading}
                  testID="waitlist-email"
                />
                <AuthTextInput
                  label="Имя (необязательно)"
                  value={name}
                  onChangeText={(next) => {
                    setName(next);
                    clearErrorOnEdit();
                  }}
                  autoCapitalize="sentences"
                  autoComplete="off"
                  textContentType="none"
                  editable={!isLoading}
                  testID="waitlist-name"
                />
                <AuthTextInput
                  label="Город или район (необязательно)"
                  value={city}
                  onChangeText={(next) => {
                    setCity(next);
                    clearErrorOnEdit();
                  }}
                  autoCapitalize="sentences"
                  autoComplete="off"
                  textContentType="none"
                  editable={!isLoading}
                  testID="waitlist-city"
                />

                {uiState.status === 'error' && (
                  <Text style={styles.errorText} accessibilityRole="alert">
                    {uiState.message}
                  </Text>
                )}

                <Pressable
                  onPress={handleSubmit}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    isLoading && styles.buttonDisabled,
                    pressed && !isLoading && styles.buttonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isLoading, busy: isLoading }}
                  testID="waitlist-submit"
                >
                  <Text style={styles.primaryButtonText}>
                    {isLoading ? 'Отправляем…' : 'Встать в лист ожидания'}
                  </Text>
                </Pressable>
              </View>
            )}

            <Link href="/invite" style={styles.secondaryLink} testID="waitlist-invite-link">
              У меня есть инвайт-код
            </Link>
          </View>

          <View style={styles.footer}>
            <Pressable
              onPress={signOut}
              disabled={isSigningOut}
              style={({ pressed }) => [
                styles.tertiaryButton,
                isSigningOut && styles.buttonDisabled,
                pressed && !isSigningOut && styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
              testID="waitlist-signout"
            >
              <Text style={styles.tertiaryButtonText}>
                {isSigningOut ? 'Выход…' : 'Войти под другим аккаунтом'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: spacing[6],
    justifyContent: 'space-between',
  },
  body: {
    gap: spacing[4],
  },
  title: {
    ...typography.title,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  form: {
    gap: spacing[4],
    marginTop: spacing[4],
  },
  successBlock: {
    gap: spacing[2],
    marginTop: spacing[4],
    padding: spacing[4],
    backgroundColor: colors.safety.noticeBg,
    borderRadius: 12,
  },
  successTitle: {
    ...typography.section,
    color: colors.safety.noticeText,
  },
  successBody: {
    ...typography.body,
    color: colors.safety.noticeText,
  },
  primaryButton: {
    backgroundColor: colors.action.primary,
    borderRadius: 12,
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.action.primaryText,
  },
  secondaryLink: {
    ...typography.body,
    color: colors.status.info,
    textAlign: 'center',
    paddingVertical: spacing[3],
    marginTop: spacing[2],
  },
  errorText: {
    ...typography.body,
    color: colors.status.danger,
  },
  tertiaryButton: {
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  tertiaryButtonText: {
    ...typography.body,
    color: colors.text.muted,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonPressed: { opacity: 0.85 },
  footer: {
    marginBottom: spacing[3],
  },
});
