// BETA-001 / BETA-002 — Invite Code screen (minimal infrastructure UI, not
// final Figma v2).
//
// Behavior:
//   - validates input via pure `validateInviteCode` (production-safe);
//   - on valid: calls BetaAccessProvider.grantBetaAccess() — the (beta) route
//     gate then redirects forward to onboarding / app placeholders;
//   - on empty / invalid / production_disabled: shows safe Russian message;
//   - secondary CTA links to /waitlist (BETA-002) — both routes live in the
//     same (beta) gate so navigation does not loop.
//   - "Выйти" is available for dev convenience (e.g., re-signing in with a
//     different test account during placeholder QA).
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

import { mobilePublicConfig } from '../../../config/env';
import { AuthTextInput } from '../../auth/components/AuthTextInput';
import { useAuthSession } from '../../auth';
import { useBetaAccess } from '../providers/BetaAccessProvider';
import { validateInviteCode } from '../lib/inviteValidation';

type UiState = { status: 'idle' } | { status: 'loading' } | { status: 'error'; message: string };

export function InviteCodeScreen() {
  const [code, setCode] = useState('');
  const [uiState, setUiState] = useState<UiState>({ status: 'idle' });
  const { isSigningOut, signOut } = useAuthSession();
  const { grantBetaAccess } = useBetaAccess();

  const isLoading = uiState.status === 'loading';

  const handleSubmit = async () => {
    const result = validateInviteCode(code, mobilePublicConfig.appEnv);
    switch (result.kind) {
      case 'empty':
        setUiState({ status: 'error', message: 'Введите инвайт-код.' });
        return;
      case 'production_disabled':
        setUiState({
          status: 'error',
          message: 'Проверка инвайт-кодов пока не настроена.',
        });
        return;
      case 'invalid':
        setUiState({
          status: 'error',
          message: 'Инвайт-код не найден или больше не действует.',
        });
        return;
      case 'valid': {
        setUiState({ status: 'loading' });
        try {
          await grantBetaAccess();
          // The (beta) gate will redirect to /start (or /home) on next render.
          // No manual router push is needed; we intentionally avoid bypassing
          // future onboarding / restricted gates from here.
        } catch {
          setUiState({
            status: 'error',
            message: 'Не удалось проверить код. Попробуйте ещё раз.',
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
            <Text style={styles.title}>Доступ по приглашению</Text>
            <Text style={styles.subtitle}>
              Сейчас приложение работает в закрытой бете. Введите инвайт-код, чтобы продолжить.
            </Text>

            <View style={styles.form}>
              <AuthTextInput
                label="Инвайт-код"
                value={code}
                onChangeText={(next) => {
                  setCode(next);
                  if (uiState.status === 'error') setUiState({ status: 'idle' });
                }}
                placeholder="ABC-123"
                autoCapitalize="none"
                autoComplete="off"
                textContentType="none"
                editable={!isLoading}
                testID="invite-code-input"
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
                testID="invite-submit"
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? 'Проверяем…' : 'Продолжить'}
                </Text>
              </Pressable>

              <Link href="/waitlist" style={styles.secondaryLinkText} testID="invite-waitlist-link">
                Нет кода? Встать в лист ожидания
              </Link>
            </View>
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
              testID="invite-signout"
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
  secondaryLinkText: {
    ...typography.body,
    color: colors.status.info,
    textAlign: 'center',
    paddingVertical: spacing[3],
  },
  tertiaryButton: {
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  tertiaryButtonText: {
    ...typography.body,
    color: colors.text.muted,
  },
  errorText: {
    ...typography.body,
    color: colors.status.danger,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonPressed: { opacity: 0.85 },
  footer: {
    marginBottom: spacing[3],
  },
});
