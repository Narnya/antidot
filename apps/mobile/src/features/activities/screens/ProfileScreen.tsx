// ACT / T4 — Profile. One screen, two modes:
//   - self  → My Profile: safe fields (name, area), soft non-numeric badges, edit.
//   - other → Public Safe Profile: safe view + Report / Block, NO message CTA
//             (Inv. 2 — no cold DM before shared context).
// Mirrors the Figma My Profile / Public Safe Profile screens.
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@social-events/ui';

import type { Profile } from '../data/repository';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';

type Props = { profileUserId?: string };

export function ProfileScreen({ profileUserId }: Props) {
  const router = useRouter();
  const { repo, userId } = useActivitiesRepo();
  const targetId = profileUserId && profileUserId.length > 0 ? profileUserId : userId;
  const isSelf = targetId === userId;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [saving, setSaving] = useState(false);
  const [blocking, setBlocking] = useState(false);

  const load = useCallback(async () => {
    const p = await repo.getProfile(targetId);
    setProfile(p);
    setName(p?.displayName ?? '');
    setArea(p?.area ?? '');
    setLoading(false);
  }, [repo, targetId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    if (name.trim().length === 0) return;
    setSaving(true);
    try {
      await repo.upsertProfile({ userId, displayName: name.trim(), area: area.trim() || null });
      setEditing(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const handleBlock = async () => {
    setBlocking(true);
    try {
      await repo.blockUser(userId, targetId);
      router.back();
    } finally {
      setBlocking(false);
    }
  };

  const initial = (profile?.displayName ?? '·').trim().charAt(0).toUpperCase() || '·';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Pressable
        onPress={() => router.back()}
        style={styles.back}
        accessibilityRole="button"
        testID="pf-back"
      >
        <Text style={styles.backText}>‹ Назад</Text>
      </Pressable>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.text.muted} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          {isSelf && editing ? (
            <>
              <Text style={styles.label}>Имя</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Имя"
                placeholderTextColor={colors.text.muted}
                style={styles.input}
                testID="pf-name"
              />
              <Text style={styles.label}>Город и район</Text>
              <TextInput
                value={area}
                onChangeText={setArea}
                placeholder="Приморский, СПб"
                placeholderTextColor={colors.text.muted}
                style={styles.input}
                testID="pf-area"
              />
              <Pressable
                onPress={handleSave}
                disabled={saving}
                style={({ pressed }) => [
                  styles.primary,
                  saving && styles.disabled,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                testID="pf-save"
              >
                <Text style={styles.primaryText}>{saving ? 'Сохраняем…' : 'Сохранить'}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.name}>{profile?.displayName ?? 'Без имени'}</Text>
              <View style={styles.pills}>
                <View style={[styles.pill, styles.trustPill]}>
                  <Text style={[styles.pillText, styles.trustText]}>✓ Проверен</Text>
                </View>
                <View style={styles.pill}>
                  <Text style={styles.pillText}>
                    {isSelf ? 'Участвовал во встречах' : 'Надёжный участник'}
                  </Text>
                </View>
              </View>
              {profile?.area ? <Text style={styles.area}>{profile.area}</Text> : null}

              {isSelf ? (
                <Pressable
                  onPress={() => setEditing(true)}
                  style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
                  accessibilityRole="button"
                  testID="pf-edit"
                >
                  <Text style={styles.secondaryText}>Редактировать профиль</Text>
                </Pressable>
              ) : (
                <>
                  <Text style={styles.note}>Написать можно будет после общей встречи.</Text>
                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => router.push(`/report?type=user&id=${targetId}`)}
                      style={({ pressed }) => [styles.actBtn, pressed && styles.pressed]}
                      accessibilityRole="button"
                      testID="pf-report"
                    >
                      <Text style={styles.actText}>Пожаловаться</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleBlock}
                      disabled={blocking}
                      style={({ pressed }) => [styles.actBtn, pressed && styles.pressed]}
                      accessibilityRole="button"
                      testID="pf-block"
                    >
                      <Text style={[styles.actText, styles.dangerText]}>
                        {blocking ? '…' : 'Заблокировать'}
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  back: { paddingHorizontal: spacing[5], paddingVertical: spacing[3] },
  backText: { ...typography.body, color: colors.text.secondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  body: { padding: spacing[6], paddingTop: spacing[2], gap: spacing[3] },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.action.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.title, color: colors.text.primary },
  name: { ...typography.title, color: colors.text.primary },
  area: { ...typography.body, color: colors.text.secondary },
  label: { ...typography.bodyMedium, color: colors.text.secondary, marginTop: spacing[2] },
  input: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: 16,
    color: colors.text.primary,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  pill: {
    backgroundColor: colors.action.secondary,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
  pillText: { ...typography.caption, color: colors.text.primary },
  trustPill: { backgroundColor: colors.trust.verifiedBg },
  trustText: { color: colors.trust.verifiedText },
  note: { ...typography.caption, color: colors.text.muted, marginTop: spacing[2] },
  primary: {
    backgroundColor: colors.action.primary,
    borderRadius: radius.md,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginTop: spacing[4],
  },
  primaryText: { ...typography.button, color: colors.action.primaryText },
  secondary: {
    backgroundColor: colors.action.secondary,
    borderRadius: radius.md,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginTop: spacing[4],
  },
  secondaryText: { ...typography.button, color: colors.text.primary },
  actions: { flexDirection: 'row', gap: spacing[3], marginTop: spacing[2] },
  actBtn: {
    flex: 1,
    backgroundColor: colors.action.secondary,
    borderRadius: radius.md,
    paddingVertical: spacing[3],
    alignItems: 'center',
  },
  actText: { ...typography.button, color: colors.text.primary },
  dangerText: { color: colors.status.danger },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.85 },
});
