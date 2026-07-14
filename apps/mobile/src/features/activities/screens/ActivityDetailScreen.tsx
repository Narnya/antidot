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
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@social-events/ui';

import { Ionicons } from '@expo/vector-icons';

import type { ActivityView, AttendanceEntry, AttendanceMark } from '../data/repository';
import { formatWhen } from '../lib/format';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';
import { KindIcon } from '../components/KindIcon';
import { kindImage } from '../lib/kindImage';

type Props = { activityId: string };

export function ActivityDetailScreen({ activityId }: Props) {
  const { repo, userId } = useActivitiesRepo();
  const router = useRouter();
  const [view, setView] = useState<ActivityView | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [claimants, setClaimants] = useState<AttendanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const isHost = view ? view.activity.createdBy === userId || view.group.ownerId === userId : false;

  const load = useCallback(async () => {
    const next = await repo.getActivity(activityId, userId);
    setView(next);
    if (next) {
      const host = next.activity.createdBy === userId || next.group.ownerId === userId;
      const [loc, roster] = await Promise.all([
        repo.getMeetingLocation(activityId, userId),
        host ? repo.listClaimants(activityId, userId) : Promise.resolve<AttendanceEntry[]>([]),
      ]);
      setLocation(loc);
      setClaimants(roster);
    }
    setLoading(false);
  }, [activityId, repo, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleClaim = useCallback(async () => {
    setClaiming(true);
    try {
      await repo.claimSlot(activityId, userId);
      await load();
    } finally {
      setClaiming(false);
    }
  }, [activityId, load, repo, userId]);

  const handleSaveLocation = useCallback(
    async (text: string) => {
      await repo.setMeetingLocation(activityId, userId, text);
      await load();
    },
    [activityId, load, repo, userId],
  );

  const handleMark = useCallback(
    async (claimantId: string, status: AttendanceMark) => {
      await repo.markAttendance(activityId, claimantId, status);
      await load();
    },
    [activityId, load, repo],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Pressable
        onPress={() => router.back()}
        style={styles.back}
        accessibilityRole="button"
        testID="detail-back"
      >
        <Text style={styles.backText}>‹ Назад</Text>
      </Pressable>

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
          claimants={claimants}
          claiming={claiming}
          onClaim={handleClaim}
          onSaveLocation={handleSaveLocation}
          onMark={handleMark}
        />
      )}
    </SafeAreaView>
  );
}

function DetailBody({
  view,
  location,
  isHost,
  claimants,
  claiming,
  onClaim,
  onSaveLocation,
  onMark,
}: {
  view: ActivityView;
  location: string | null;
  isHost: boolean;
  claimants: AttendanceEntry[];
  claiming: boolean;
  onClaim: () => void;
  onSaveLocation: (text: string) => Promise<void>;
  onMark: (claimantId: string, status: AttendanceMark) => Promise<void>;
}) {
  const router = useRouter();
  const { activity, group } = view;
  const remaining = view.spotsRemaining;
  const taken = view.spotsTaken;
  const full = remaining === 0;
  const alreadyGoing = view.mine !== null;
  const disabled = claiming || full || alreadyGoing;
  const [saved, setSaved] = useState(false);
  const label = claiming
    ? 'Записываем…'
    : alreadyGoing
      ? '✓ Вы записаны'
      : full
        ? 'Мест нет'
        : 'Занять место';

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Image source={kindImage(activity.kind)} style={styles.heroImg} resizeMode="cover" />
        <Pressable
          onPress={() => setSaved((s) => !s)}
          style={styles.saveBtn}
          accessibilityRole="button"
          accessibilityState={{ selected: saved }}
          testID="detail-save"
        >
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={20}
            color={saved ? colors.accent.coral : colors.text.inverse}
          />
        </Pressable>
      </View>

      <View style={styles.titleRow}>
        <KindIcon kind={activity.kind} size={26} color={colors.action.primary} />
        <Text style={styles.title}>{activity.title}</Text>
      </View>

      <View style={styles.card}>
        <Row label="Когда" value={formatWhen(activity.startsAt)} />
        <Row label="Район" value={activity.area} />
        <Row label="Идут" value={`${taken} · нужно ещё ${remaining}`} />
      </View>

      {isHost ? (
        <LocationEditor location={location} onSave={onSaveLocation} />
      ) : location ? (
        <View style={styles.reveal}>
          <View style={styles.noticeHead}>
            <Ionicons name="location-outline" size={16} color={colors.safety.noticeText} />
            <Text style={styles.revealLabel}>Место встречи</Text>
          </View>
          <Text style={styles.revealValue}>{location}</Text>
        </View>
      ) : (
        <View style={styles.noticeRow}>
          <Ionicons name="lock-closed-outline" size={16} color={colors.safety.noticeText} />
          <Text style={styles.noticeText}>
            {alreadyGoing
              ? 'Организатор ещё не указал точное место'
              : 'Точное место откроется после записи'}
          </Text>
        </View>
      )}

      <View style={styles.circleRow}>
        <Text style={styles.circleName} numberOfLines={1}>
          Круг «{group.name}»
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓ Проверен</Text>
        </View>
      </View>

      {!isHost ? (
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
      ) : null}

      {isHost ? <AttendanceSection claimants={claimants} onMark={onMark} /> : null}

      <Pressable
        onPress={() => router.push(`/report?type=activity&id=${activity.id}`)}
        style={styles.reportLink}
        accessibilityRole="button"
        testID="detail-report"
      >
        <Text style={styles.reportText}>Пожаловаться на активность</Text>
      </Pressable>
    </ScrollView>
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
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="Стадион «Волна», у входа"
        placeholderTextColor={colors.text.muted}
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

/** Host-only: after the meeting, mark who actually showed up (feeds attend→member). */
function AttendanceSection({
  claimants,
  onMark,
}: {
  claimants: AttendanceEntry[];
  onMark: (claimantId: string, status: AttendanceMark) => Promise<void>;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  if (claimants.length === 0) {
    return (
      <View style={styles.attendBlock}>
        <Text style={styles.sectionLabel}>Кто пришёл</Text>
        <Text style={styles.emptyRow}>Пока никто не записался.</Text>
      </View>
    );
  }

  const mark = async (claimantId: string, status: AttendanceMark) => {
    setPendingId(claimantId);
    try {
      await onMark(claimantId, status);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <View style={styles.attendBlock}>
      <Text style={styles.sectionLabel}>Кто пришёл</Text>
      <Text style={styles.attendHint}>Отметьте после встречи.</Text>
      {claimants.map((c) => {
        const busy = pendingId === c.userId;
        return (
          <View key={c.userId} style={styles.attendRow}>
            <View style={styles.attendMain}>
              <Text style={styles.attendName} numberOfLines={1}>
                {c.displayName ?? 'Гость'}
              </Text>
              {c.source === 'overflow' ? <Text style={styles.attendMeta}>гость</Text> : null}
            </View>
            <View style={styles.attendActions}>
              <Pressable
                onPress={() => mark(c.userId, 'attended')}
                disabled={busy}
                style={[styles.markBtn, c.status === 'attended' && styles.markBtnYesOn]}
                accessibilityRole="button"
                testID={`attend-yes-${c.userId}`}
              >
                <Text style={[styles.markText, c.status === 'attended' && styles.markTextOn]}>
                  Пришёл
                </Text>
              </Pressable>
              <Pressable
                onPress={() => mark(c.userId, 'no_show')}
                disabled={busy}
                style={[styles.markBtn, c.status === 'no_show' && styles.markBtnNoOn]}
                accessibilityRole="button"
                testID={`attend-no-${c.userId}`}
              >
                <Text style={[styles.markText, c.status === 'no_show' && styles.markTextOn]}>
                  Нет
                </Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  back: { paddingHorizontal: spacing[5], paddingVertical: spacing[3] },
  backText: { ...typography.body, color: colors.text.secondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  empty: { ...typography.body, color: colors.text.muted },
  body: { padding: spacing[6], paddingTop: spacing[2], gap: spacing[4] },
  hero: { borderRadius: radius.lg, overflow: 'hidden', height: 200 },
  heroImg: { width: '100%', height: 200 },
  saveBtn: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(21,19,15,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  title: { ...typography.title, color: colors.text.primary, flex: 1 },
  card: {
    backgroundColor: colors.surface.default,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing[4],
    gap: spacing[3],
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { ...typography.body, color: colors.text.muted },
  rowValue: { ...typography.bodyMedium, color: colors.text.primary },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.safety.noticeBg,
    borderRadius: radius.md,
    padding: spacing[3],
  },
  noticeText: { ...typography.caption, color: colors.safety.noticeText, flex: 1 },
  reveal: {
    backgroundColor: colors.safety.noticeBg,
    borderRadius: radius.md,
    padding: spacing[4],
    gap: 2,
  },
  noticeHead: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  revealLabel: { ...typography.caption, color: colors.safety.noticeText },
  revealValue: { ...typography.bodyMedium, color: colors.text.primary },
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
  circleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  circleName: { ...typography.body, color: colors.text.secondary, flex: 1 },
  badge: {
    backgroundColor: colors.trust.verifiedBg,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: { ...typography.badge, color: colors.trust.verifiedText },
  button: {
    backgroundColor: colors.action.primary,
    borderRadius: radius.md,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginTop: spacing[2],
  },
  buttonClaimed: { backgroundColor: colors.safety.noticeBg },
  buttonFull: { backgroundColor: colors.action.secondary },
  buttonPressed: { opacity: 0.85 },
  buttonText: { ...typography.button, color: colors.action.primaryText },
  buttonTextClaimed: { color: colors.safety.noticeText },
  buttonTextFull: { color: colors.text.muted },
  sectionLabel: { ...typography.bodyMedium, color: colors.text.secondary },
  attendBlock: { gap: spacing[2] },
  attendHint: { ...typography.caption, color: colors.text.muted },
  emptyRow: { ...typography.body, color: colors.text.muted, paddingVertical: spacing[2] },
  attendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    padding: spacing[3],
  },
  attendMain: { flex: 1, gap: 2 },
  attendName: { ...typography.bodyMedium, color: colors.text.primary },
  attendMeta: { ...typography.caption, color: colors.text.muted },
  attendActions: { flexDirection: 'row', gap: spacing[2] },
  markBtn: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  markBtnYesOn: { backgroundColor: colors.trust.verifiedBg, borderColor: colors.trust.verifiedBg },
  markBtnNoOn: { backgroundColor: colors.action.secondary, borderColor: colors.action.secondary },
  markText: { ...typography.caption, color: colors.text.secondary },
  markTextOn: { color: colors.text.primary },
  reportLink: { paddingVertical: spacing[3], alignItems: 'center' },
  reportText: { ...typography.body, color: colors.text.muted },
});
