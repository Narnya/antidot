// ACT-003 — Feed screen ("Активности рядом" / объявления). Open overflow slots
// across the city that the user can claim (product decision 2026-07: city-wide).
// Data comes from the repository (mock now, Supabase later); this screen holds
// only view state. The feed lists ACTIVITIES, never people.
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@social-events/ui';

import { ActivityCard } from '../components/ActivityCard';
import { MOCK_USER_ID, mockActivitiesRepository } from '../data/mockRepository';
import type { ActivityView } from '../data/repository';

const repo = mockActivitiesRepository;

export function FeedScreen() {
  const router = useRouter();
  const [views, setViews] = useState<ActivityView[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimedIds, setClaimedIds] = useState<ReadonlySet<string>>(new Set());

  const load = useCallback(async () => {
    const next = await repo.listOpenInCity(MOCK_USER_ID);
    setViews(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleClaim = useCallback(
    async (activityId: string) => {
      setClaimingId(activityId);
      try {
        await repo.claimSlot(activityId, MOCK_USER_ID);
        setClaimedIds((prev) => new Set(prev).add(activityId));
        await load();
      } finally {
        setClaimingId(null);
      }
    },
    [load],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Активности рядом</Text>
        <Text style={styles.subtitle}>Открытые места в кругах поблизости</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.text.muted} />
        </View>
      ) : views.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Пока нет открытых мест поблизости.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {views.map((v) => (
            <ActivityCard
              key={v.activity.id}
              view={v}
              claimed={claimedIds.has(v.activity.id)}
              claiming={claimingId === v.activity.id}
              onClaim={handleClaim}
              onOpen={(id) => router.push(`/activity/${id}`)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    gap: spacing[1],
  },
  title: { ...typography.title, color: colors.text.primary },
  subtitle: { ...typography.body, color: colors.text.secondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  empty: { ...typography.body, color: colors.text.muted, textAlign: 'center' },
  list: { padding: spacing[6], paddingTop: spacing[2], gap: spacing[4] },
});
