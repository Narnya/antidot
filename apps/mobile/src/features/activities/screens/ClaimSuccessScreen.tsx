// ACT / pull payoff — «Место за тобой» (mockup frame N). The success screen after
// claiming a slot: a big check, the activity line, and — the payoff — the EXACT
// meeting location revealed (Инв. 1: visible only to those who claimed this
// activity). «Добавить в календарь» opens a pre-filled calendar event (Google
// Calendar template URL — works on web + native via Linking); «К активности»
// returns to the detail.
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, PLAYFAIR_FAMILY, radius, typography } from '@social-events/ui';

import { Button, CtaBar, IconCalendar, IconCheck, IconPin, LoadError, NotFound } from '../../../components';
import type { ActivityView } from '../data/repository';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';
import { formatWhen } from '../lib/format';

type Props = { activityId: string };

export function ClaimSuccessScreen({ activityId }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { repo, userId } = useActivitiesRepo();
  const [view, setView] = useState<ActivityView | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [v, loc] = await Promise.all([
        repo.getActivity(activityId, userId),
        repo.getMeetingLocation(activityId, userId),
      ]);
      setView(v);
      setLocation(loc);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [repo, activityId, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const goToActivity = () => router.replace(`/activity/${activityId}`);

  // Open a pre-filled calendar event. The exact place is included only when it's
  // been revealed to this claimant (Инв. 1) — otherwise just the area.
  const addToCalendar = useCallback(() => {
    if (!view) return;
    const start = new Date(view.activity.startsAt);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // default 2h
    const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const place = location ?? view.activity.area;
    const url =
      'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      `&text=${encodeURIComponent(view.activity.title)}` +
      `&dates=${stamp(start)}/${stamp(end)}` +
      `&location=${encodeURIComponent(place)}` +
      `&details=${encodeURIComponent(`Круг «${view.group.name}»`)}`;
    void Linking.openURL(url);
  }, [view, location]);

  return (
    <View style={styles.root}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.text.muted} />
        </View>
      ) : error ? (
        <LoadError onRetry={() => void load()} />
      ) : !view ? (
        <NotFound
          onBack={() => router.replace('/')}
          icon="calendar-outline"
          title="Активность не найдена"
          sub="Возможно, её отменили или у тебя нет доступа."
          backLabel="К ленте"
        />
      ) : (
        <>
          <ScrollView
            contentContainerStyle={[styles.body, { paddingBottom: 120 + insets.bottom }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.succIc}>
              <IconCheck color={colors.action.primary} size={44} />
            </View>
            <Text style={styles.title}>Место за тобой</Text>
            {view ? (
              <Text style={styles.sub}>
                {view.activity.title} · {formatWhen(view.activity.startsAt)}
              </Text>
            ) : null}

            {/* The reveal — exact place, only for claimants (Инв. 1) */}
            {location ? (
              <View style={styles.revealCard}>
                <View style={styles.revealHead}>
                  <IconPin color={colors.action.primary} size={17} />
                  <Text style={styles.revealLabel}>Место встречи</Text>
                </View>
                <Text style={styles.revealValue}>{location}</Text>
                <Text style={styles.revealNote}>Виден только участникам этой активности.</Text>
              </View>
            ) : (
              <View style={styles.revealCard}>
                <View style={styles.revealHead}>
                  <IconPin color={colors.action.primary} size={17} />
                  <Text style={styles.revealLabel}>Место встречи</Text>
                </View>
                <Text style={styles.revealValue}>Организатор скоро укажет точку</Text>
                <Text style={styles.revealNote}>Придёт уведомление, когда место откроется.</Text>
              </View>
            )}

            <View style={styles.calBtn}>
              <Button
                label="Добавить в календарь"
                variant="ghost"
                onPress={addToCalendar}
                icon={<IconCalendar color={colors.text.primary} size={18} />}
              />
            </View>
          </ScrollView>

          <CtaBar>
            <Button label="К активности" onPress={goToActivity} />
          </CtaBar>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.default },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  // paddingBottom (clearance under the absolute CtaBar) is added inline: 120 + insets.bottom.
  body: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34 },

  succIc: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: colors.trust.verifiedBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { fontFamily: PLAYFAIR_FAMILY, fontSize: 28, letterSpacing: -0.4, color: colors.action.primary, textAlign: 'center' },
  sub: { ...typography.body, fontSize: 15, color: colors.text.secondary, marginTop: 12, textAlign: 'center' },

  revealCard: {
    alignSelf: 'stretch',
    backgroundColor: '#EEF3EC',
    borderWidth: 1,
    borderColor: '#D6E2D0',
    borderRadius: 18,
    padding: 16,
    marginTop: 24,
  },
  revealHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  revealLabel: {
    fontFamily: typography.badge.fontFamily,
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: colors.action.primary,
  },
  revealValue: { fontFamily: typography.badge.fontFamily, fontSize: 17, color: colors.text.primary, marginTop: 8 },
  revealNote: { fontSize: 12.5, color: '#4A5C50', marginTop: 6, fontFamily: typography.caption.fontFamily },

  calBtn: { alignSelf: 'stretch', marginTop: 14 },
});
