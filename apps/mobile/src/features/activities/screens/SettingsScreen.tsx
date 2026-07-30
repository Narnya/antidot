// ACT / T6 — Settings. Minimal account hygiene, pixel-matched to
// mockups/all-screens.html frame 12: «Заблокированные» list (unblock) first, then
// «Аккаунт» (Выйти / Удалить аккаунт), then a privacy notice. Blocked users are
// shown as «Скрытый участник» — never their real name (Inv. 3/12).
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, INTER_MEDIUM, INTER_SEMIBOLD, radius, spacing, typography } from '@social-events/ui';

import { useGoBack } from '../../../lib/useGoBack';
import { Button, IconShield, IconTile, ScreenHeader, SectionLabel } from '../../../components';
import { useAuthSession } from '../../auth';
import type { Profile } from '../data/repository';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';

const AVATAR_TINTS = ['#D3C4B2', '#C9BDA9', '#D9CBB8', '#C2B4A0'];

export function SettingsScreen() {
  const goBack = useGoBack();
  const { repo, userId } = useActivitiesRepo();
  const { signOut, isSigningOut } = useAuthSession();

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
    } catch {
      setError('Не удалось удалить аккаунт. Попробуйте ещё раз.');
      setDeleting(false);
    }
  }, [repo, userId, signOut]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader title="Настройки" onBack={goBack} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <SectionLabel first>Заблокированные</SectionLabel>
        {loading ? (
          <ActivityIndicator color={colors.text.muted} style={{ alignSelf: 'flex-start' }} />
        ) : blocked.length === 0 ? (
          // Empty is the common case — a lone gray line read as unfinished, so give
          // it a real card (matches the account rows below and the /manage empty state).
          <View style={[styles.listrow, styles.blockedEmpty]}>
            <IconTile>
              <IconShield color={colors.action.primary} size={21} />
            </IconTile>
            <View style={styles.rowTxt}>
              <Text style={styles.t1}>Список пуст</Text>
              <Text style={[styles.t2, styles.blockedEmptySub]}>
                Заблокируешь кого-то — он исчезнет из твоих активностей и чатов. Разблокировать
                можно здесь.
              </Text>
            </View>
          </View>
        ) : (
          blocked.map((p, i) => (
            <View key={p.userId} style={styles.listrow}>
              <View style={[styles.avatar, { backgroundColor: AVATAR_TINTS[i % AVATAR_TINTS.length] }]} />
              <View style={styles.rowTxt}>
                <Text style={styles.t1}>Скрытый участник</Text>
                <Text style={styles.t2} numberOfLines={1}>
                  Не увидит тебя и твои активности
                </Text>
              </View>
              <Pressable
                onPress={() => handleUnblock(p.userId)}
                disabled={unblockingId === p.userId}
                style={styles.unblockChip}
                accessibilityRole="button"
                testID={`set-unblock-${p.userId}`}
              >
                <Text style={styles.unblockText}>
                  {unblockingId === p.userId ? '…' : 'Разблокировать'}
                </Text>
              </Pressable>
            </View>
          ))
        )}

        <SectionLabel>Аккаунт</SectionLabel>
        <Pressable
          onPress={signOut}
          disabled={isSigningOut}
          style={[styles.listrow, styles.accountRow]}
          accessibilityRole="button"
          testID="set-signout"
        >
          <IconTile bg="#ECE6DA">
            <Ionicons name="log-out-outline" size={20} color={colors.text.secondary} />
          </IconTile>
          <View style={styles.rowTxt}>
            <Text style={styles.t1}>{isSigningOut ? 'Выход…' : 'Выйти'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
        </Pressable>

        <Pressable
          onPress={() => setConfirmingDelete(true)}
          style={[styles.listrow, styles.deleteRow]}
          accessibilityRole="button"
          testID="set-delete"
        >
          <IconTile bg="#F7DED6">
            <Ionicons name="trash-outline" size={20} color={colors.accent.coral} />
          </IconTile>
          <View style={styles.rowTxt}>
            <Text style={[styles.t1, styles.deleteTitle]}>Удалить аккаунт</Text>
            <Text style={styles.t2}>Безвозвратно удалит профиль и данные</Text>
          </View>
        </Pressable>

        {confirmingDelete ? (
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
            <View style={styles.confirmActions}>
              <Button
                label={deleting ? 'Удаляем…' : 'Да, удалить навсегда'}
                variant="coral"
                disabled={deleting}
                onPress={handleDelete}
              />
              <Pressable
                onPress={() => {
                  setConfirmingDelete(false);
                  setError(null);
                }}
                disabled={deleting}
                style={styles.cancel}
                accessibilityRole="button"
                testID="set-delete-cancel"
              >
                <Text style={styles.cancelText}>Отмена</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.notice}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.text.muted} />
          <Text style={styles.noticeText}>
            Antidot не показывает рейтинги, счётчики жалоб или отказов. Кто вышел или на паузе —
            просто исчезает из состава.
          </Text>
        </View>

        {/* Push the footer to the bottom on short content; anchors the screen. */}
        <View style={styles.footerSpacer} />
        <Text style={styles.footer}>Antidot · версия {Constants.expoConfig?.version ?? '0.0.0'}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.default },
  body: { paddingHorizontal: spacing[6], paddingTop: spacing[1], paddingBottom: spacing[8], flexGrow: 1 },
  emptyRow: { ...typography.body, color: colors.text.muted, paddingVertical: spacing[1] },
  blockedEmpty: { alignItems: 'flex-start' },
  blockedEmptySub: { lineHeight: 18 },
  footerSpacer: { flexGrow: 1, minHeight: spacing[6] },
  footer: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
    paddingBottom: spacing[2],
  },

  listrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  accountRow: {},
  deleteRow: { borderColor: '#F0D4CB' },
  avatar: { width: 46, height: 46, borderRadius: radius.full },
  rowTxt: { flex: 1 },
  t1: { fontFamily: INTER_SEMIBOLD, fontSize: 15.5, color: colors.text.primary },
  t2: { ...typography.caption, color: colors.text.secondary, marginTop: 2 },
  deleteTitle: { color: colors.accent.coral },
  unblockChip: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.full,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  unblockText: { fontFamily: INTER_MEDIUM, fontSize: 13, color: colors.text.secondary },

  confirmBox: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: '#F0D4CB',
    borderRadius: 18,
    padding: spacing[4],
    gap: spacing[3],
    marginTop: 2,
    marginBottom: 10,
  },
  confirmTitle: { fontFamily: INTER_SEMIBOLD, fontSize: 15.5, color: colors.text.primary },
  confirmText: { ...typography.caption, color: colors.text.secondary, lineHeight: 18 },
  error: { ...typography.caption, color: colors.status.danger },
  confirmActions: { gap: spacing[2] },
  cancel: { paddingVertical: spacing[2], alignItems: 'center' },
  cancelText: { ...typography.body, color: colors.text.secondary },

  notice: { flexDirection: 'row', gap: 8, marginTop: 22, paddingHorizontal: 2 },
  noticeText: { ...typography.caption, color: colors.text.muted, flex: 1, lineHeight: 18 },
});
