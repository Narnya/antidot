// ACT / T5 — «Приём в круг · хост» (mockup frame M). The host's single management
// surface for one activity: accept overflow guests into the circle (host-confirm →
// «Участие подтверждено») and, after the meeting, mark who actually showed up.
//
// Per the mockups this is the ONLY place these two host actions live — Circle Home
// (frame 08) is belonging-only and the activity Detail (frame 05) is the claim view.
// So accept moved off Circle Home and attendance moved off Detail into here (no
// duplicated host UI). Composition stays host-scoped management, never a discovery
// surface (no people marketplace — Inv. 13).
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@social-events/ui';

import { IconCheck, ScreenHeader, SectionLabel } from '../../../components';
import type { ActivityView, AttendanceEntry, AttendanceMark, MemberCandidate } from '../data/repository';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';
import { formatWhen } from '../lib/format';

// Warm, anonymous avatar tints (never real identities — no people marketplace).
const AVATAR_TINTS = ['#CDBBA6', '#C1B39F', '#C9B9A2', '#B7C2AE', '#D6C3B0'];
const tint = (id: string) => AVATAR_TINTS[Math.abs(hash(id)) % AVATAR_TINTS.length];
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

// «Занял слот сам · <note> · +1 друг» — the note and/or +1 they gave on frame C,
// falling back to the activity they claimed through.
function candidateDetail(c: MemberCandidate): string {
  const parts = [c.note ? `«${c.note}»` : null, c.plusOne ? '+1 друг' : null].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : `«${c.throughActivityTitle}»`;
}

type Props = { activityId: string };

export function ManageActivityScreen({ activityId }: Props) {
  const router = useRouter();
  const { repo, userId } = useActivitiesRepo();
  const [view, setView] = useState<ActivityView | null>(null);
  const [candidates, setCandidates] = useState<MemberCandidate[]>([]);
  const [roster, setRoster] = useState<AttendanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  // Guests accepted in this session — kept visible as «✓ Принят» so accepting
  // gives clear feedback instead of the row silently vanishing.
  const [acceptedRows, setAcceptedRows] = useState<MemberCandidate[]>([]);

  const isHost = view ? view.activity.createdBy === userId || view.group.ownerId === userId : false;

  const load = useCallback(async () => {
    const v = await repo.getActivity(activityId, userId);
    setView(v);
    if (v && (v.activity.createdBy === userId || v.group.ownerId === userId)) {
      const [cands, entries] = await Promise.all([
        repo.listMemberCandidates(v.group.id),
        repo.listClaimants(activityId, userId),
      ]);
      setCandidates(cands);
      setRoster(entries);
    }
    setLoading(false);
  }, [repo, activityId, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const accept = useCallback(
    async (candidate: MemberCandidate) => {
      if (!view) return;
      setPendingId(candidate.userId);
      try {
        await repo.confirmMember(view.group.id, candidate.userId);
        setAcceptedRows((prev) =>
          prev.some((r) => r.userId === candidate.userId) ? prev : [...prev, candidate],
        );
        await load();
      } finally {
        setPendingId(null);
      }
    },
    [repo, view, load],
  );

  const mark = useCallback(
    async (claimantId: string, status: AttendanceMark) => {
      setPendingId(claimantId);
      try {
        await repo.markAttendance(activityId, claimantId, status);
        await load();
      } finally {
        setPendingId(null);
      }
    },
    [repo, activityId, load],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={view?.activity.title ?? 'Управление'}
        subtitle={view ? `${formatWhen(view.activity.startsAt)} · управление` : undefined}
        onBack={() => router.back()}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.text.muted} />
        </View>
      ) : !view || !isHost ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Управление доступно только организатору.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {/* Activity summary — so the screen reads as complete even when empty. */}
          <View style={styles.summary}>
            <Text style={styles.summaryBig}>
              {view.spotsTaken} из {view.activity.totalSpots} мест занято
            </Text>
            <Text style={styles.summarySub}>
              Круг «{view.group.name}» · {view.activity.area}
              {view.activity.visibility === 'overflow' ? ' · открыта городу' : ''}
            </Text>
          </View>

          {/* Accept overflow guests → members */}
          <SectionLabel first>Заняли слот из ленты · overflow</SectionLabel>
          {acceptedRows.length === 0 && candidates.length === 0 ? (
            <Text style={styles.emptyRow}>
              Пока никто не занял слот из ленты. Как только чужой займёт открытый слот, ты примешь
              его в круг здесь.
            </Text>
          ) : (
            <>
              {/* Just-accepted guests — confirmed, non-vanishing feedback. */}
              {acceptedRows.map((c) => (
                <View key={c.userId} style={styles.row}>
                  <View style={[styles.avLg, { backgroundColor: tint(c.userId) }]} />
                  <View style={styles.txt}>
                    <Text style={styles.t1}>Новый гость</Text>
                    <Text style={styles.t2} numberOfLines={1}>
                      Принят в круг · участие подтверждено
                    </Text>
                  </View>
                  <View style={[styles.chip, styles.chipDone]}>
                    <IconCheck color={colors.trust.verifiedText} size={14} />
                    <Text style={styles.chipTextDone}>Принят</Text>
                  </View>
                </View>
              ))}
              {/* Still-pending guests to accept. */}
              {candidates.map((c) => (
                <View key={c.userId} style={styles.row}>
                  <View style={[styles.avLg, { backgroundColor: tint(c.userId) }]} />
                  <View style={styles.txt}>
                    <Text style={styles.t1}>Новый гость</Text>
                    <Text style={styles.t2} numberOfLines={1}>
                      Занял слот сам · {candidateDetail(c)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => accept(c)}
                    disabled={pendingId === c.userId}
                    style={[styles.chip, styles.chipOn]}
                    accessibilityRole="button"
                    testID={`mng-accept-${c.userId}`}
                  >
                    <Text style={styles.chipTextOn}>{pendingId === c.userId ? '…' : 'Принять'}</Text>
                  </Pressable>
                </View>
              ))}
              {candidates.length > 0 ? (
                <View style={styles.notice}>
                  <IconCheck color={colors.text.muted} size={16} />
                  <Text style={styles.noticeText}>
                    Приняв гостя, ты добавляешь его в круг. Ему придёт «Участие подтверждено».
                  </Text>
                </View>
              ) : null}
            </>
          )}

          {/* Attendance — who showed up */}
          <SectionLabel>Кто пришёл</SectionLabel>
          {roster.length === 0 ? (
            <Text style={styles.emptyRow}>
              Пока никто не записался на встречу. После встречи здесь отметишь, кто пришёл.
            </Text>
          ) : (
            roster.map((e) => {
              const busy = pendingId === e.userId;
              return (
                <View key={e.userId} style={styles.row}>
                  <View style={[styles.avLg, { backgroundColor: tint(e.userId) }]} />
                  <View style={styles.txt}>
                    <Text style={styles.t1} numberOfLines={1}>
                      {e.displayName ?? 'Гость'}
                    </Text>
                    <Text style={styles.t2}>{e.source === 'overflow' ? 'Гость из ленты' : 'Участник круга'}</Text>
                  </View>
                  <View style={styles.attActions}>
                    <Pressable
                      onPress={() => mark(e.userId, 'attended')}
                      disabled={busy}
                      style={[styles.chip, e.status === 'attended' ? styles.chipOn : styles.chipOff]}
                      accessibilityRole="button"
                      testID={`mng-yes-${e.userId}`}
                    >
                      <Text style={e.status === 'attended' ? styles.chipTextOn : styles.chipTextOff}>
                        Пришёл
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => mark(e.userId, 'no_show')}
                      disabled={busy}
                      style={[styles.chip, e.status === 'no_show' ? styles.chipOn : styles.chipOff]}
                      accessibilityRole="button"
                      testID={`mng-no-${e.userId}`}
                    >
                      <Text style={e.status === 'no_show' ? styles.chipTextOn : styles.chipTextOff}>Нет</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  empty: { ...typography.body, color: colors.text.muted, textAlign: 'center' },
  body: { paddingHorizontal: spacing[6], paddingBottom: spacing[10] },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  avLg: { width: 46, height: 46, borderRadius: radius.full, flexShrink: 0 },
  txt: { flex: 1, minWidth: 0 },
  t1: { fontFamily: typography.badge.fontFamily, fontSize: 15.5, color: colors.text.primary },
  t2: { fontSize: 13, color: colors.text.secondary, marginTop: 2, fontFamily: typography.caption.fontFamily },

  attActions: { flexDirection: 'row', gap: 6 },
  summary: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 6,
  },
  summaryBig: { fontFamily: typography.badge.fontFamily, fontSize: 16, color: colors.text.primary },
  summarySub: { fontSize: 13, color: colors.text.secondary, marginTop: 3, fontFamily: typography.caption.fontFamily },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipOn: { backgroundColor: colors.action.primary, borderColor: colors.action.primary },
  chipOff: { backgroundColor: colors.surface.default },
  chipDone: { backgroundColor: colors.trust.verifiedBg, borderColor: colors.trust.verifiedBg },
  chipTextOn: { fontFamily: typography.badge.fontFamily, fontSize: 13, color: colors.action.primaryText },
  chipTextOff: { fontFamily: typography.badge.fontFamily, fontSize: 13, color: colors.text.secondary },
  chipTextDone: { fontFamily: typography.badge.fontFamily, fontSize: 13, color: colors.trust.verifiedText },

  notice: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 2, marginBottom: 4, paddingHorizontal: 2 },
  noticeText: { ...typography.caption, color: colors.text.muted, flex: 1, lineHeight: 18 },
  emptyRow: { ...typography.body, color: colors.text.muted, paddingVertical: spacing[2] },
});
