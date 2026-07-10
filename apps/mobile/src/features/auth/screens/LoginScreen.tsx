// AUTH-002 — Login screen (minimal infrastructure UI, not final Figma v2).
//
// Behavior:
//   - validates non-empty email/password client-side;
//   - calls supabase.auth.signInWithPassword via signInWithEmail wrapper;
//   - shows loading / error / success states in-place;
//   - does NOT auto-navigate into the app shell (invite/onboarding gates do not
//     exist yet — AUTH-007, BETA-001…003, ONB-014 will handle routing later).
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

import { signInWithEmail } from '../actions/emailAuth';
import { AuthTextInput } from '../components/AuthTextInput';
import { isNonEmptyPassword, isValidEmail } from '../lib/auth';

type UiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success' };

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [uiState, setUiState] = useState<UiState>({ status: 'idle' });

  const isLoading = uiState.status === 'loading';
  const isSuccess = uiState.status === 'success';

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      setUiState({ status: 'error', message: 'Введите email.' });
      return;
    }
    if (!isNonEmptyPassword(password)) {
      setUiState({ status: 'error', message: 'Введите пароль.' });
      return;
    }

    setUiState({ status: 'loading' });
    const result = await signInWithEmail({ email, password });
    if (result.ok) {
      setUiState({ status: 'success' });
    } else {
      setUiState({ status: 'error', message: result.error.message });
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
          <Text style={styles.title}>Войти</Text>
          <Text style={styles.subtitle}>
            Доступ к приложению пока по приглашению. После входа мы проверим доступ к закрытой бете.
          </Text>

          <View style={styles.form}>
            <AuthTextInput
              label="Email"
              value={email}
              onChangeText={(next) => {
                setEmail(next);
                if (uiState.status === 'error') setUiState({ status: 'idle' });
              }}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              editable={!isLoading && !isSuccess}
              testID="login-email"
            />
            <AuthTextInput
              label="Пароль"
              value={password}
              onChangeText={(next) => {
                setPassword(next);
                if (uiState.status === 'error') setUiState({ status: 'idle' });
              }}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              editable={!isLoading && !isSuccess}
              testID="login-password"
            />

            {uiState.status === 'error' && (
              <Text style={styles.errorText} accessibilityRole="alert">
                {uiState.message}
              </Text>
            )}
            {isSuccess && (
              <Text style={styles.successText} accessibilityRole="alert">
                Вы вошли. Дальнейшие шаги (приглашение и onboarding) появятся позже.
              </Text>
            )}

            <Pressable
              onPress={handleSubmit}
              disabled={isLoading || isSuccess}
              style={({ pressed }) => [
                styles.primaryButton,
                (isLoading || isSuccess) && styles.buttonDisabled,
                pressed && !isLoading && !isSuccess && styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ disabled: isLoading || isSuccess, busy: isLoading }}
              testID="login-submit"
            >
              <Text style={styles.primaryButtonText}>{isLoading ? 'Входим…' : 'Войти'}</Text>
            </Pressable>

            <Link href="/signup" style={styles.linkText}>
              Нет аккаунта? Создать
            </Link>
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
  primaryButton: {
    backgroundColor: colors.action.primary,
    borderRadius: 12,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginTop: spacing[2],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.action.primaryText,
  },
  linkText: {
    ...typography.body,
    color: colors.status.info,
    textAlign: 'center',
    marginTop: spacing[2],
  },
  errorText: {
    ...typography.body,
    color: colors.status.danger,
  },
  successText: {
    ...typography.body,
    color: colors.safety.noticeText,
  },
});
