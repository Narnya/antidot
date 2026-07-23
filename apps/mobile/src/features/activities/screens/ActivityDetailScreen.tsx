// ACT-004 / T5 — Activity detail. Full info + AGGREGATE composition + claim, plus
// meeting reality: the EXACT meeting location is revealed only after the user
// claims a spot (Inv. 1), and the host can mark who attended after the meeting.
// Composition stays aggregate — there is no browsable list of people (no people
// marketplace); the host-only attendance roster is a legitimate exception (you
// manage your own meeting), never a discovery surface.
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, INTER_MEDIUM, INTER_SEMIBOLD, radius, shadows, spacing, typography } from '@social-events/ui';

import { Ionicons } from '@expo/vector-icons';

import { AppTextInput } from '../../../components';

import type { ActivityView } from '../data/repository';
import { formatWhen } from '../lib/format';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';
import { kindImage } from '../lib/kindImage';

// Decorative avatar tints (warm, anonymous — the aggregate composition never reveals
// real identities to non-members; no people marketplace). Mirrors ActivityCard.
const AVATAR_TINTS = ['#D9CBB8', '#C9B9A2', '#B7C2AE', '#D6C3B0', '#C2B4A0'];

type Props = { activityId: string };

export function ActivityDetailScreen({ activityId }: Props) {
  const { repo, userId } = useActivitiesRepo();
  const router = useRouter();
  const [view, setView] = useState<ActivityView | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isHost = view ? view.activity.createdBy === userId || view.group.ownerId === userId : false;

  const load = useCallback(async () => {
    const next = await repo.getActivity(activityId, userId);
    setView(next);
    if (next) {
      setLocation(await repo.getMeetingLocation(activityId, userId));
    }
    setLoading(false);
  }, [activityId, repo, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  // The pull moment now runs through the dedicated «Занять место» step (frame C),
  // which claims + routes to the reveal success (frame N). We keep the inline
  // «Вы записаны» / «Мест нет» states for users who already claimed or a full slot.
  const handleClaim = useCallback(() => {
    router.push(`/claim/${activityId}`);
  }, [router, activityId]);

  const handleSaveLocation = useCallback(
    async (text: string) => {
      await repo.setMeetingLocation(activityId, userId, text);
      await load();
    },
    [activityId, load, repo, userId],
  );

  // Host management (accept overflow guests + attendance) is its own screen (frame M).
  const handleManage = useCallback(() => {
    router.push(`/manage/${activityId}`);
  }, [router, activityId]);

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.text.muted} />
        </View>
      ) : !view ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Активность не найдена.</Text>
        </View>
      ) : (
        <DetailBody
          view={view}
          location={location}
          isHost={isHost}
          claiming={false}
          onClaim={handleClaim}
          onSaveLocation={handleSaveLocation}
          onManage={handleManage}
        />
      )}

      {/* Floating header — always accessible over the full-bleed hero. */}
      <View style={[styles.floatRow, { top: insets.top + spacing[2] }]} pointerEvents="box-none">
        <Pressable
          onPress={() => router.back()}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Назад"
          testID="detail-back"
        >
          <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
        </Pressable>
        {view && !isHost ? (
          <Pressable
            onPress={() => router.push(`/report?type=activity&id=${view.activity.id}`)}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Пожаловаться"
            testID="detail-report"
          >
            <Ionicons name="flag-outline" size={18} color={colors.text.primary} />
          </Pressable>
        ) : (
          <View style={styles.iconBtnGhost} />
        )}
      </View>
    </View>
  );
}

function DetailBody({
  view,
  location,
  isHost,
  claiming,
  onClaim,
  onSaveLocation,
  onManage,
}: {
  view: ActivityView;
  location: string | null;
  isHost: boolean;
  claiming: boolean;
  onClaim: () => void;
  onSaveLocation: (text: string) => Promise<void>;
  onManage: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { activity, group } = view;
  const remaining = view.spotsRemaining;
  const taken = view.spotsTaken;
  const full = remaining === 0;
  const alreadyGoing = view.mine !== null;
  const disabled = claiming || full || alreadyGoing;
  const avatarCount = Math.min(taken, 5);
  const label = claiming
    ? 'Записываем…'
    : alreadyGoing
      ? '✓ Вы записаны'
      : full
        ? 'Мест нет'
        : `Занять место · ${remaining} свободно`;

  return (
    <>
      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: (isHost ? spacing[6] : 108) + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Full-bleed hero fading into the ivory background. */}
        <View style={styles.hero}>
          <Image source={kindImage(activity.kind)} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <LinearGradient
            colors={[
              'rgba(21,19,15,0.42)',
              'rgba(21,19,15,0.04)',
              'rgba(247,245,239,0)',
              colors.background.default,
            ]}
            locations={[0, 0.34, 0.64, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{activity.title}</Text>

          <View style={styles.pillRow}>
            <View style={styles.pill}>
              <Ionicons name="time-outline" size={15} color={colors.text.secondary} />
              <Text style={styles.pillText}>{formatWhen(activity.startsAt)}</Text>
            </View>
            <View style={styles.pill}>
              <Ionicons name="location-outline" size={15} color={colors.text.secondary} />
              <Text style={styles.pillText}>{activity.area}</Text>
            </View>
          </View>

          {/* Meeting location — hidden until the user claims a spot (Inv. 1). */}
          {isHost ? (
            <LocationEditor location={location} onSave={onSaveLocation} />
          ) : location ? (
            <View style={styles.revealCard}>
              <View style={styles.revealHead}>
                <Ionicons name="location-outline" size={15} color={colors.safety.noticeText} />
                <Text style={styles.revealLabel}>Место встречи</Text>
              </View>
              <Text style={styles.revealValue}>{location}</Text>
              <Text style={styles.revealNote}>Виден только участникам этой активности.</Text>
            </View>
          ) : (
            <View style={styles.infoCard}>
              <View style={styles.iconTile}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.action.primary} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoTitle}>
                  {alreadyGoing
                    ? 'Организатор ещё не указал точное место'
                    : 'Точное место — после того как займёшь слот'}
                </Text>
                <Text style={styles.infoSub}>Пока виден только район · {activity.area}</Text>
              </View>
            </View>
          )}

          {/* Aggregate composition — decorative avatars, never a browsable member list. */}
          <View style={styles.partCard}>
            <View style={styles.partTop}>
              <View style={styles.avatars}>
                {Array.from({ length: avatarCount }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.avatar,
                      {
                        backgroundColor: AVATAR_TINTS[i % AVATAR_TINTS.length],
                        marginLeft: i === 0 ? 0 : -8,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.partCount}>
                {taken} из {activity.totalSpots} · свои и гости
              </Text>
            </View>
            <View style={styles.circleRow}>
              <Text style={styles.circleName} numberOfLines={1}>
                Круг «{group.name}»
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✓ Проверен</Text>
              </View>
            </View>
          </View>

          {/* Host management (accept overflow guests + attendance) — its own screen
              (frame M); Detail keeps only the host location editor above. */}
          {isHost ? (
            <Pressable
              onPress={onManage}
              style={({ pressed }) => [styles.manageRow, pressed && styles.buttonPressed]}
              accessibilityRole="button"
              testID="detail-manage"
            >
              <View style={styles.iconTile}>
                <Ionicons name="options-outline" size={20} color={colors.action.primary} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoTitle}>Управление активностью</Text>
                <Text style={styles.infoSub}>Приём гостей · кто пришёл</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      {/* Fixed claim bar — the pull moment. */}
      {!isHost ? (
        <View style={[styles.ctaBar, { paddingBottom: insets.bottom + spacing[4] }]}>
          <Pressable
            onPress={onClaim}
            disabled={disabled}
            style={({ pressed }) => [
              styles.button,
              alreadyGoing && styles.buttonClaimed,
              full && !alreadyGoing && styles.buttonFull,
              pressed && !disabled && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            testID="detail-claim"
          >
            <Text
              style={[
                styles.buttonText,
                alreadyGoing && styles.buttonTextClaimed,
                full && !alreadyGoing && styles.buttonTextFull,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </>
  );
}

/** Host-only: set / edit the exact meeting point (revealed to claimants only). */
function LocationEditor({
  location,
  onSave,
}: {
  location: string | null;
  onSave: (text: string) => Promise<void>;
}) {
  const [value, setValue] = useState(location ?? '');
  const [saving, setSaving] = useState(false);
  const dirty = value.trim() !== (location ?? '').trim();

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(value);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.hostCard}>
      <Text style={styles.hostLabel}>Точное место</Text>
      <AppTextInput
        value={value}
        onChangeText={setValue}
        placeholder="Стадион «Волна», у входа"
        style={styles.hostInput}
        testID="detail-location-input"
      />
      <Text style={styles.hostHint}>Видно только тем, кто занял место.</Text>
      <Pressable
        onPress={handleSave}
        disabled={!dirty || saving}
        style={({ pressed }) => [
          styles.hostSave,
          (!dirty || saving) && styles.hostSaveDisabled,
          pressed && dirty && !saving && styles.buttonPressed,
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled: !dirty || saving }}
        testID="detail-location-save"
      >
        <Text style={styles.hostSaveText}>{saving ? 'Сохраняем…' : 'Сохранить место'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.default },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  empty: { ...typography.body, color: colors.text.muted },

  floatRow: {
    position: 'absolute',
    left: spacing[5],
    right: spacing[5],
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  iconBtnGhost: { width: 40, height: 40 },

  body: {},
  hero: { width: '100%', height: 300 },
  content: { paddingHorizontal: spacing[6], marginTop: -48, gap: spacing[4] },
  title: { ...typography.title, color: colors.action.primary },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  pillText: { fontFamily: INTER_MEDIUM, fontSize: 13, color: colors.text.secondary },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  iconTile: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.trust.verifiedBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextWrap: { flex: 1, gap: 2 },
  infoTitle: { ...typography.bodyMedium, fontSize: 14, color: colors.text.primary },
  infoSub: { ...typography.caption, color: colors.text.secondary },

  revealCard: {
    backgroundColor: colors.safety.noticeBg,
    borderRadius: radius.lg,
    padding: spacing[4],
    gap: 4,
  },
  revealHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  revealLabel: {
    ...typography.caption,
    fontFamily: INTER_SEMIBOLD,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: colors.safety.noticeText,
  },
  revealValue: { ...typography.section, color: colors.text.primary },
  revealNote: { ...typography.caption, color: colors.safety.noticeText },

  partCard: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    padding: spacing[4],
  },
  partTop: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  partCount: { ...typography.bodyMedium, fontSize: 14, color: colors.text.primary, flex: 1 },
  avatars: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.surface.default,
  },

  ctaBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    backgroundColor: colors.background.default,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },

  hostCard: {
    backgroundColor: colors.surface.default,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing[4],
    gap: spacing[2],
  },
  hostLabel: { ...typography.bodyMedium, color: colors.text.secondary },
  hostInput: {
    backgroundColor: colors.background.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    fontSize: 16,
    color: colors.text.primary,
  },
  hostHint: { ...typography.caption, color: colors.text.muted },
  hostSave: {
    backgroundColor: colors.action.primary,
    borderRadius: radius.md,
    paddingVertical: spacing[3],
    alignItems: 'center',
    marginTop: spacing[1],
  },
  hostSaveDisabled: { opacity: 0.5 },
  hostSaveText: { ...typography.button, color: colors.action.primaryText },
  circleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  circleName: { ...typography.caption, color: colors.text.muted, flex: 1 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.trust.verifiedBg,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: { ...typography.badge, color: colors.trust.verifiedText },
  button: {
    backgroundColor: colors.action.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  buttonClaimed: { backgroundColor: colors.safety.noticeBg },
  buttonFull: { backgroundColor: colors.action.secondary },
  buttonPressed: { opacity: 0.85 },
  buttonText: { ...typography.button, color: colors.action.primaryText },
  buttonTextClaimed: { color: colors.safety.noticeText },
  buttonTextFull: { color: colors.text.muted },
});
