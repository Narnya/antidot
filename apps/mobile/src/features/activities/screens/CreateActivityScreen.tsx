// ACT-005 — Create Activity (supply side). An organizer posts an activity with
// open slots inside one of their circles («круг = дом, создаёшь внутри круга»).
// Mock repository; prototype only.
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@social-events/ui';

import type { ActivityKind, Group } from '../lib/model';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';

const KIND_OPTIONS: { kind: ActivityKind; label: string }[] = [
  { kind: 'football', label: 'Футбол' },
  { kind: 'walk', label: 'Прогулка' },
  { kind: 'boardgames', label: 'Настолки' },
  { kind: 'coffee', label: 'Кофе' },
  { kind: 'run', label: 'Бег' },
  { kind: 'other', label: 'Другое' },
];

function buildWhenPresets(): { label: string; iso: string }[] {
  const at = (days: number, hour: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };
  return [
    { label: 'Сегодня 19:00', iso: at(0, 19) },
    { label: 'Завтра 19:00', iso: at(1, 19) },
    { label: 'Через неделю', iso: at(7, 19) },
  ];
}

export function CreateActivityScreen() {
  const router = useRouter();
  const { repo, userId } = useActivitiesRepo();
  const [presets] = useState(buildWhenPresets);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<ActivityKind>('football');
  const [area, setArea] = useState('');
  const [exactLocation, setExactLocation] = useState('');
  const [spots, setSpots] = useState(10);
  const [whenIso, setWhenIso] = useState(() => presets[0]?.iso ?? '');
  const [overflow, setOverflow] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void (async () => {
      const gs = await repo.listMyGroups(userId);
      setGroups(gs);
      const first = gs[0];
      if (first) {
        setGroupId(first.id);
        setArea(first.area);
      }
    })();
  }, [repo, userId]);

  const selectGroup = (g: Group) => {
    setGroupId(g.id);
    setArea(g.area);
  };

  const handleSubmit = async () => {
    if (!groupId) {
      setError('Выберите круг.');
      return;
    }
    if (title.trim().length === 0) {
      setError('Введите название активности.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const created = await repo.createActivity({
        groupId,
        createdBy: userId,
        title: title.trim(),
        kind,
        area: area.trim(),
        startsAt: whenIso,
        totalSpots: spots,
        overflow,
        exactLocation: exactLocation.trim().length > 0 ? exactLocation.trim() : null,
      });
      router.replace(`/activity/${created.id}`);
    } catch {
      setError('Не удалось создать. Попробуйте ещё раз.');
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Pressable
        onPress={() => router.back()}
        style={styles.back}
        accessibilityRole="button"
        testID="create-back"
      >
        <Text style={styles.backText}>‹ Назад</Text>
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Новая активность</Text>

        <Text style={styles.label}>Круг</Text>
        <View style={styles.chips}>
          {groups.map((g) => {
            const active = g.id === groupId;
            return (
              <Pressable
                key={g.id}
                onPress={() => selectGroup(g)}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="button"
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{g.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Название</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Футбол 5×5"
          placeholderTextColor={colors.text.muted}
          style={styles.input}
          testID="create-title"
        />

        <Text style={styles.label}>Тип</Text>
        <View style={styles.chips}>
          {KIND_OPTIONS.map((k) => {
            const active = k.kind === kind;
            return (
              <Pressable
                key={k.kind}
                onPress={() => setKind(k.kind)}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="button"
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{k.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Когда</Text>
        <View style={styles.chips}>
          {presets.map((p) => {
            const active = p.iso === whenIso;
            return (
              <Pressable
                key={p.label}
                onPress={() => setWhenIso(p.iso)}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="button"
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{p.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Район</Text>
        <TextInput
          value={area}
          onChangeText={setArea}
          placeholder="Приморский"
          placeholderTextColor={colors.text.muted}
          style={styles.input}
          testID="create-area"
        />

        <Text style={styles.label}>Точное место</Text>
        <TextInput
          value={exactLocation}
          onChangeText={setExactLocation}
          placeholder="Стадион «Волна», у входа"
          placeholderTextColor={colors.text.muted}
          style={styles.input}
          testID="create-location"
        />
        <Text style={styles.fieldHint}>
          Видно только тем, кто занял место. Можно добавить позже.
        </Text>

        <Text style={styles.label}>Сколько всего мест</Text>
        <View style={styles.stepper}>
          <Pressable
            onPress={() => setSpots((s) => Math.max(2, s - 1))}
            style={styles.stepBtn}
            accessibilityRole="button"
            testID="create-spots-minus"
          >
            <Text style={styles.stepBtnText}>−</Text>
          </Pressable>
          <Text style={styles.stepValue}>{spots}</Text>
          <Pressable
            onPress={() => setSpots((s) => Math.min(30, s + 1))}
            style={styles.stepBtn}
            accessibilityRole="button"
            testID="create-spots-plus"
          >
            <Text style={styles.stepBtnText}>+</Text>
          </Pressable>
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchTextWrap}>
            <Text style={styles.switchLabel}>Открыть места соседним</Text>
            <Text style={styles.switchHint}>Пока — всем кругам города. Иначе только своим.</Text>
          </View>
          <Switch value={overflow} onValueChange={setOverflow} testID="create-overflow" />
        </View>

        {error && (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={({ pressed }) => [
            styles.submit,
            submitting && styles.submitDisabled,
            pressed && !submitting && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityState={{ disabled: submitting, busy: submitting }}
          testID="create-submit"
        >
          <Text style={styles.submitText}>{submitting ? 'Создаём…' : 'Создать активность'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  back: { paddingHorizontal: spacing[5], paddingVertical: spacing[3] },
  backText: { ...typography.body, color: colors.text.secondary },
  body: { padding: spacing[6], paddingTop: spacing[2], gap: spacing[3] },
  title: { ...typography.title, color: colors.text.primary, marginBottom: spacing[2] },
  label: { ...typography.bodyMedium, color: colors.text.secondary, marginTop: spacing[2] },
  fieldHint: { ...typography.caption, color: colors.text.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.full,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  chipActive: { backgroundColor: colors.action.primary, borderColor: colors.action.primary },
  chipText: { ...typography.body, color: colors.text.primary },
  chipTextActive: { color: colors.action.primaryText },
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
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing[4] },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { fontSize: 24, color: colors.text.primary },
  stepValue: {
    ...typography.heading,
    color: colors.text.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  switchTextWrap: { flex: 1, gap: 2 },
  switchLabel: { ...typography.bodyMedium, color: colors.text.primary },
  switchHint: { ...typography.caption, color: colors.text.muted },
  error: { ...typography.body, color: colors.status.danger },
  submit: {
    backgroundColor: colors.action.primary,
    borderRadius: radius.md,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginTop: spacing[4],
  },
  submitDisabled: { opacity: 0.6 },
  pressed: { opacity: 0.85 },
  submitText: { ...typography.button, color: colors.action.primaryText },
});
