// ACT / T6 — Settings. Minimal account hygiene: your account, the blocked-users
// list (unblock), sign out, and permanent account deletion. Mirrors docs/32 §5
// (Settings + Manage Blocked + Delete Account). Privacy / data-export are post-MVP.
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@social-events/ui';

import { useAuthSession } from '../../auth';
import type { Profile } from '../data/repository';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';

export function SettingsScreen() {
  const router = useRouter();
  const { repo, userId } = useActivitiesRepo();
  const { user, signOut, isSigningOut } = useAuthSession();

  const [blocked, setBlocked] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBlocked(await repo.listBlockedProfiles(userId));
    setLoading(false);
  }, [repo, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUnblock = useCallback(
    async (blockedId: string) => {
      setUnblockingId(blockedId);
      try {
        await repo.unblockUser(userId, blockedId);
        await load();
      } finally {
        setUnblockingId(null);
      }
    },
    [repo, userId, load],
  );

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    setError(null);
    try {
      await repo.deleteAccount(userId);
      await signOut();
      // The (app) gate redirects to /welcome once the session clears.
    } catch {
      setError('Не удалось удалить аккаунт. Попробуйте ещё раз.');
      setDeleting(false);
    }
  }, [repo, userId, signOut]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Pressable
        onPress={() => router.back()}
        style={styles.back}
        accessibilityRole="button"
        testID="set-back"
      >
        <Text style={styles.backText}>‹ Назад</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Настройки</Text>

        <Text style={styles.sectionLabel}>Аккаунт</Text>
        <View style={styles.card}>
          <Row label="Вход" value={user?.email ?? '—'} />
          <Pressable
            onPress={() => router.push('/profile')}
            style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
            accessibilityRole="button"
            testID="set-profile"
          >
            <Text style={styles.linkRowText}>Мой профиль</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>Заблокированные</Text>
        {loading ? (
          <ActivityIndicator color={colors.text.muted} style={{ alignSelf: 'flex-start' }} />
        ) : blocked.length === 0 ? (
          <Text style={styles.emptyRow}>Вы никого не заблокировали.</Text>
        ) : (
          <View style={styles.blockList}>
            {blocked.map((p) => (
              <View key={p.userId} style={styles.blockRow}>
                <Text style={styles.blockName} numberOfLines={1}>
                  {p.displayName}
                </Text>
                <Pressable
                  onPress={() => handleUnblock(p.userId)}
                  disabled={unblockingId === p.userId}
                  style={({ pressed }) => [styles.unblockBtn, pressed && styles.pressed]}
                  accessibilityRole="button"
                  testID={`set-unblock-${p.userId}`}
                >
                  <Text style={styles.unblockText}>
                    {unblockingId === p.userId ? '…' : 'Разблокировать'}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <Pressable
          onPress={signOut}
          disabled={isSigningOut}
          style={({ pressed }) => [
            styles.signOut,
            isSigningOut && styles.disabled,
            pressed && !isSigningOut && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
          testID="set-signout"
        >
          <Text style={styles.signOutText}>{isSigningOut ? 'Выход…' : 'Выйти'}</Text>
        </Pressable>

        <View style={styles.dangerZone}>
          {!confirmingDelete ? (
            <Pressable
              onPress={() => setConfirmingDelete(true)}
              style={({ pressed }) => [styles.deleteLink, pressed && styles.pressed]}
              accessibilityRole="button"
              testID="set-delete"
            >
              <Text style={styles.deleteLinkText}>Удалить аккаунт</Text>
            </Pressable>
          ) : (
            <View style={styles.confirmBox}>
              <Text style={styles.confirmTitle}>Удалить аккаунт навсегда?</Text>
              <Text style={styles.confirmText}>
                Профиль, участие и созданные вами круги будут удалены. Это действие нельзя отменить.
              </Text>
              {error ? (
                <Text style={styles.error} accessibilityRole="alert">
                  {error}
                </Text>
              ) : null}
              <Pressable
                onPress={handleDelete}
                disabled={deleting}
                style={({ pressed }) => [
                  styles.deleteConfirm,
                  deleting && styles.disabled,
                  pressed && !deleting && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityState={{ disabled: deleting, busy: deleting }}
                testID="set-delete-confirm"
              >
                <Text style={styles.deleteConfirmText}>
                  {deleting ? 'Удаляем…' : 'Да, удалить навсегда'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setConfirmingDelete(false);
                  setError(null);
                }}
                disabled={deleting}
                style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
                accessibilityRole="button"
                testID="set-delete-cancel"
              >
                <Text style={styles.cancelText}>Отмена</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  back: { paddingHorizontal: spacing[5], paddingVertical: spacing[3] },
  backText: { ...typography.body, color: colors.text.secondary },
  body: { padding: spacing[6], paddingTop: spacing[2], gap: spacing[3] },
  title: { ...typography.title, color: colors.text.primary, marginBottom: spacing[2] },
  sectionLabel: { ...typography.bodyMedium, color: colors.text.secondary, marginTop: spacing[2] },
  card: {
    backgroundColor: colors.surface.default,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing[4],
    gap: spacing[3],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing[3],
  },
  rowLabel: { ...typography.body, color: colors.text.muted },
  rowValue: { ...typography.bodyMedium, color: colors.text.primary, flexShrink: 1 },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    paddingTop: spacing[3],
  },
  linkRowText: { ...typography.bodyMedium, color: colors.text.primary },
  chevron: { ...typography.body, color: colors.text.muted },
  emptyRow: { ...typography.body, color: colors.text.muted, paddingVertical: spacing[1] },
  blockList: { gap: spacing[2] },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    padding: spacing[3],
  },
  blockName: { ...typography.bodyMedium, color: colors.text.primary, flex: 1 },
  unblockBtn: {
    backgroundColor: colors.action.secondary,
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  unblockText: { ...typography.caption, color: colors.text.primary },
  signOut: {
    backgroundColor: colors.action.secondary,
    borderRadius: radius.md,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginTop: spacing[4],
  },
  signOutText: { ...typography.button, color: colors.text.primary },
  dangerZone: { marginTop: spacing[4] },
  deleteLink: { paddingVertical: spacing[3], alignItems: 'center' },
  deleteLinkText: { ...typography.body, color: colors.status.danger },
  confirmBox: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.status.danger,
    borderRadius: radius.lg,
    padding: spacing[4],
    gap: spacing[3],
  },
  confirmTitle: { ...typography.bodyMedium, color: colors.text.primary },
  confirmText: { ...typography.caption, color: colors.text.secondary },
  error: { ...typography.caption, color: colors.status.danger },
  deleteConfirm: {
    backgroundColor: colors.status.danger,
    borderRadius: radius.md,
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  deleteConfirmText: { ...typography.button, color: colors.text.inverse },
  cancel: { paddingVertical: spacing[2], alignItems: 'center' },
  cancelText: { ...typography.body, color: colors.text.secondary },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.85 },
});
