// BETA-001 / BETA-002 — Invite Code, pixel-matched to mockups/all-screens.html frame
// H «Доступ по приглашению»: ANTIDOT wordmark, hero title, a big centered code field,
// «Продолжить», an «Нет кода?» waitlist link, and a one-invite notice. On a valid
// code we grant beta access; the (beta) gate redirects forward. Logic unchanged.
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, INTER_SEMIBOLD, spacing, typography } from '@social-events/ui';

import { useGoBack } from '../../../lib/useGoBack';
import { BrandMini, Button, Field, FieldLabel, HeroTitle, ScreenHeader } from '../../../components';
import { mobilePublicConfig } from '../../../config/env';
import { validateInviteCode } from '../lib/inviteValidation';
import { useBetaAccess } from '../providers/BetaAccessProvider';

type UiState = { status: 'idle' } | { status: 'loading' } | { status: 'error'; message: string };

export function InviteCodeScreen() {
  const router = useRouter();
  const goBack = useGoBack('/welcome');
  const [code, setCode] = useState('');
  const [uiState, setUiState] = useState<UiState>({ status: 'idle' });
  const { grantBetaAccess } = useBetaAccess();
  const isLoading = uiState.status === 'loading';

  const handleSubmit = async () => {
    const result = validateInviteCode(code, mobilePublicConfig.appEnv);
    switch (result.kind) {
      case 'empty':
        setUiState({ status: 'error', message: 'Введи инвайт-код.' });
        return;
      case 'production_disabled':
        setUiState({ status: 'error', message: 'Проверка инвайт-кодов пока не настроена.' });
        return;
      case 'invalid':
        setUiState({ status: 'error', message: 'Инвайт-код не найден или больше не действует.' });
        return;
      case 'valid': {
        setUiState({ status: 'loading' });
        try {
          await grantBetaAccess();
        } catch {
          setUiState({ status: 'error', message: 'Не удалось проверить код. Попробуй ещё раз.' });
        }
        return;
      }
    }
  };

  return (
    <View style={styles.root}>
      <ScreenHeader onBack={goBack} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BrandMini />
          <HeroTitle style={styles.title}>Доступ по{'\n'}приглашению</HeroTitle>
          <Text style={styles.sub}>
            Введи код из приглашения — и попадёшь внутрь. Круги растут через доверие.
          </Text>

          <View style={styles.field}>
            <FieldLabel>Инвайт-код</FieldLabel>
            <Field
              value={code}
              onChangeText={(t) => {
                setCode(t);
                if (uiState.status === 'error') setUiState({ status: 'idle' });
              }}
              placeholder="ABC-123"
              autoCapitalize="characters"
              autoComplete="off"
              editable={!isLoading}
              style={styles.codeInput}
              testID="invite-code-input"
            />
          </View>

          {uiState.status === 'error' ? (
            <Text style={styles.error} accessibilityRole="alert">
              {uiState.message}
            </Text>
          ) : null}

          <View style={styles.cta}>
            <Button
              label={isLoading ? 'Проверяем…' : 'Продолжить'}
              disabled={isLoading}
              onPress={handleSubmit}
            />
          </View>

          <Pressable
            onPress={() => router.push('/waitlist')}
            style={styles.link}
            accessibilityRole="button"
            testID="invite-waitlist-link"
          >
            <Text style={styles.linkText}>
              Нет кода? <Text style={styles.linkAccent}>Встать в лист ожидания</Text>
            </Text>
          </Pressable>

          <View style={styles.notice}>
            <Ionicons name="lock-closed-outline" size={16} color={colors.text.muted} />
            <Text style={styles.noticeText}>По одному приглашению заходит один человек.</Text>
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
  field: { marginTop: 30 },
  codeInput: {
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 5,
    fontFamily: INTER_SEMIBOLD,
    paddingVertical: 6,
  },
  error: { ...typography.body, fontSize: 14, color: colors.status.danger, marginTop: 14 },
  cta: { marginTop: 26 },
  link: { alignItems: 'center', paddingVertical: 18 },
  linkText: { ...typography.body, fontSize: 15, color: colors.text.secondary },
  linkAccent: { fontFamily: INTER_SEMIBOLD, color: colors.accent.coral },
  notice: { flexDirection: 'row', gap: 8, marginTop: 10, justifyContent: 'center' },
  noticeText: { ...typography.caption, color: colors.text.muted },
});
