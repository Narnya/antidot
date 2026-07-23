// ACT / pull payoff — «Место за тобой» (mockup frame N). The success screen after
// claiming a slot: a big check, the activity line, and — the payoff — the EXACT
// meeting location revealed (Инв. 1: visible only to those who claimed this
// activity). «Добавить в календарь» is a stub for now; «К активности» returns to
// the detail.
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, PLAYFAIR_FAMILY, radius, spacing, typography } from '@social-events/ui';

import { Button, CtaBar, IconCalendar, IconCheck, IconPin } from '../../../components';
import type { ActivityView } from '../data/repository';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';
import { formatWhen } from '../lib/format';

type Props = { activityId: string };

export function ClaimSuccessScreen({ activityId }: Props) {
  const router = useRouter();
  const { repo, userId } = useActivitiesRepo();
  const [view, setView] = useState<ActivityView | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [v, loc] = await Promise.all([
        repo.getActivity(activityId, userId),
        repo.getMeetingLocation(activityId, userId),
      ]);
      if (active) {
        setView(v);
        setLocation(loc);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [repo, activityId, userId]);

  const goToActivity = () => router.replace(`/activity/${activityId}`);

  return (
    <View style={styles.root}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.text.muted} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
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
              <Button label="Добавить в календарь" variant="ghost" icon={<IconCalendar color={colors.text.primary} size={18} />} />
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
  body: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34, paddingBottom: 120 },

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
