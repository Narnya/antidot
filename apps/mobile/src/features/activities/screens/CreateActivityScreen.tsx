// ACT-005 — Create Activity (supply side). An organizer posts an activity with open
// slots inside one of their circles. Pixel-matched to mockups/all-screens.html frame
// 06: DS ScreenHeader, «Чем займётесь» emoji chips, warm fields (Когда | Слотов in a
// 2-col row, Район, Круг), an «Открыть места городу» overflow rowcard, fixed CtaBar.
// Exact meeting location is NOT set here — the host adds it later on the activity
// (revealed only to claimants, Inv. 1).
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, INTER_MEDIUM, INTER_SEMIBOLD, spacing, typography } from '@social-events/ui';

import { useGoBack } from '../../../lib/useGoBack';
import { Button, CtaBar, Field, FieldLabel, IconCircles, IconTile, ScreenHeader } from '../../../components';
import { WhenPicker } from '../components/WhenPicker';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';
import { formatWhen } from '../lib/format';
import type { ActivityKind, Group } from '../lib/model';

/** Default start: tomorrow at 19:00. */
function defaultWhen(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(19, 0, 0, 0);
  return d;
}

const KIND_OPTIONS: { kind: ActivityKind; label: string }[] = [
  { kind: 'football', label: '⚽ Футбол' },
  { kind: 'walk', label: '🚶 Прогулка' },
  { kind: 'boardgames', label: '🎲 Настолки' },
  { kind: 'coffee', label: '☕ Кофе' },
  { kind: 'run', label: '🏃 Бег' },
  { kind: 'other', label: '✨ Другое' },
];

export function CreateActivityScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const insets = useSafeAreaInsets();
  const { repo, userId } = useActivitiesRepo();
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupIdx, setGroupIdx] = useState(0);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<ActivityKind>('football');
  const [area, setArea] = useState('');
  const [spots, setSpots] = useState(10);
  const [startsAt, setStartsAt] = useState<Date>(defaultWhen);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [overflow, setOverflow] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const gs = await repo.listMyGroups(userId);
        setGroups(gs);
        if (gs[0]) setArea(gs[0].area);
      } catch {
        // Non-fatal: the circle picker just stays empty and submit surfaces
        // «Сначала создайте круг». No spinner to hang here.
      }
    })();
  }, [repo, userId]);

  const group = groups[groupIdx] ?? null;
  const cycleGroup = () => {
    if (groups.length < 2) return;
    const next = (groupIdx + 1) % groups.length;
    setGroupIdx(next);
    setArea(groups[next].area);
  };

  const handleSubmit = async () => {
    if (!group) {
      setError('Сначала создайте круг.');
      return;
    }
    if (title.trim().length === 0) {
      setError('Введи название активности.');
      return;
    }
    if (spots < 2) {
      setError('Нужно хотя бы 2 места.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const created = await repo.createActivity({
        groupId: group.id,
        createdBy: userId,
        title: title.trim(),
        kind,
        area: area.trim(),
        startsAt: startsAt.toISOString(),
        totalSpots: spots,
        overflow,
        exactLocation: null,
      });
      router.replace(`/activity/${created.id}`);
    } catch {
      setError('Не удалось создать. Попробуй ещё раз.');
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title="Новая активность" onBack={goBack} />

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: 120 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FieldLabel>Чем займётесь</FieldLabel>
        <View style={styles.chips}>
          {KIND_OPTIONS.map((k) => {
            const active = k.kind === kind;
            return (
              <Pressable
                key={k.kind}
                onPress={() => setKind(k.kind)}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{k.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.gap} />
        <FieldLabel>Название</FieldLabel>
        <Field value={title} onChangeText={setTitle} placeholder="Футбол 5×5" testID="create-title" />

        <View style={styles.gap} />
        <View style={styles.row2}>
          <View style={styles.rowWhen}>
            <FieldLabel>Когда</FieldLabel>
            <Pressable style={styles.pick} onPress={() => setPickerOpen(true)} testID="create-when">
              <Ionicons name="calendar-outline" size={18} color={colors.text.muted} />
              <Text style={styles.pickValue} numberOfLines={1}>
                {formatWhen(startsAt.toISOString())}
              </Text>
            </Pressable>
          </View>
          <View style={styles.rowSlots}>
            <FieldLabel>Слотов</FieldLabel>
            <Field
              value={spots ? String(spots) : ''}
              onChangeText={(t) => setSpots(Math.min(30, Number(t.replace(/\D/g, '')) || 0))}
              keyboardType="number-pad"
              testID="create-spots"
            />
          </View>
        </View>

        <View style={styles.gap} />
        <FieldLabel>Район</FieldLabel>
        <Field
          value={area}
          onChangeText={setArea}
          placeholder="Приморский"
          leftIcon={<Ionicons name="location-outline" size={18} color={colors.text.muted} />}
          testID="create-area"
        />

        <View style={styles.gap} />
        <FieldLabel>Круг</FieldLabel>
        <Pressable style={styles.pick} onPress={cycleGroup} testID="create-group">
          <IconCircles color={colors.text.muted} size={18} />
          <Text style={styles.pickValue} numberOfLines={1}>
            {group ? group.name : 'Нет кругов'}
          </Text>
        </Pressable>

        <View style={styles.overflowCard}>
          <IconTile>
            <Ionicons name="globe-outline" size={22} color={colors.action.primary} />
          </IconTile>
          <View style={styles.ovText}>
            <Text style={styles.ovTitle}>Открыть места городу</Text>
            <Text style={styles.ovSub}>Свободные слоты займут чужие (overflow)</Text>
          </View>
          <Switch
            value={overflow}
            onValueChange={setOverflow}
            trackColor={{ true: colors.action.primary, false: colors.border.strong }}
            thumbColor={colors.surface.default}
            testID="create-overflow"
          />
        </View>

        {error ? (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
      </ScrollView>

      <CtaBar>
        <Button
          label={submitting ? 'Публикуем…' : 'Опубликовать активность'}
          disabled={submitting}
          onPress={handleSubmit}
        />
      </CtaBar>

      <WhenPicker
        visible={pickerOpen}
        value={startsAt}
        onChange={setStartsAt}
        onClose={() => setPickerOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.default },
  // paddingBottom (clearance under the absolute CtaBar) is added inline: 120 + insets.bottom.
  body: { paddingHorizontal: spacing[6], paddingTop: spacing[1] },
  gap: { height: 16 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: colors.action.primary, borderColor: colors.action.primary },
  chipText: { fontFamily: INTER_MEDIUM, fontSize: 13.5, color: colors.text.secondary },
  chipTextActive: { color: colors.action.primaryText },

  row2: { flexDirection: 'row', gap: 12 },
  rowWhen: { flex: 1 },
  rowSlots: { width: 110 },
  pick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface.field,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pickValue: { flex: 1, fontSize: 15.5, color: colors.text.primary },

  overflowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 22,
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  ovText: { flex: 1 },
  ovTitle: { fontFamily: INTER_SEMIBOLD, fontSize: 14.5, color: colors.text.primary },
  ovSub: { ...typography.caption, fontSize: 12.5, color: colors.text.secondary, marginTop: 2 },
  error: { ...typography.body, fontSize: 14, color: colors.status.danger, marginTop: 14 },
});
