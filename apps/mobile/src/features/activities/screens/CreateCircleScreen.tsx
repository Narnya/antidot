// ACT-009 — Create Circle (host makes a circle). Name / area / theme / rhythm; the
// creator becomes its owner-member. Pixel-matched to mockups/all-screens.html frame
// J «Новый круг» — DS ScreenHeader, warm fields, rhythm chips, fixed CtaBar.
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, INTER_MEDIUM, radius, spacing, typography } from '@social-events/ui';

import { useGoBack } from '../../../lib/useGoBack';
import { AppTextInput, Button, CtaBar, Field, FieldLabel, ScreenHeader } from '../../../components';
import { useActivitiesRepo } from '../hooks/useActivitiesRepo';
import type { CircleRhythm } from '../lib/model';

const RHYTHMS: { v: CircleRhythm; label: string }[] = [
  { v: 'weekly', label: 'Еженедельно' },
  { v: 'biweekly', label: 'Раз в 2 недели' },
  { v: 'monthly', label: 'Ежемесячно' },
  { v: 'adhoc', label: 'По случаю' },
];

export function CreateCircleScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const insets = useSafeAreaInsets();
  const { repo, userId } = useActivitiesRepo();
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [theme, setTheme] = useState('');
  const [rhythm, setRhythm] = useState<CircleRhythm>('weekly');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (name.trim().length === 0) {
      setError('Введи название круга.');
      return;
    }
    if (area.trim().length === 0) {
      setError('Укажи район.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const created = await repo.createCircle({
        name: name.trim(),
        area: area.trim(),
        theme: theme.trim() || null,
        rhythm,
        ownerId: userId,
      });
      router.replace(`/circle/${created.id}`);
    } catch {
      setError('Не удалось создать круг. Попробуй ещё раз.');
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScreenHeader title="Новый круг" onBack={goBack} />

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: 120 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sub}>Круг — это постоянная компания вокруг общего занятия.</Text>

        <FieldLabel>Название</FieldLabel>
        <Field
          value={name}
          onChangeText={setName}
          placeholder="Четверговый футбол"
          testID="cc-name"
        />

        <View style={styles.gap} />
        <FieldLabel>Район</FieldLabel>
        <Field
          value={area}
          onChangeText={setArea}
          placeholder="Приморский"
          leftIcon={<Ionicons name="location-outline" size={18} color={colors.text.muted} />}
          testID="cc-area"
        />

        <View style={styles.gap} />
        <FieldLabel>О чём круг</FieldLabel>
        <AppTextInput
          value={theme}
          onChangeText={setTheme}
          placeholder="Играем в футбол по четвергам. Свои и друзья друзей."
          style={styles.textarea}
          multiline
          testID="cc-theme"
        />

        <View style={styles.gap} />
        <FieldLabel>Ритм</FieldLabel>
        <View style={styles.chips}>
          {RHYTHMS.map((r) => {
            const active = r.v === rhythm;
            return (
              <Pressable
                key={r.v}
                onPress={() => setRhythm(r.v)}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{r.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {error ? (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
      </ScrollView>

      <CtaBar>
        <Button
          label={submitting ? 'Создаём…' : 'Создать круг'}
          disabled={submitting}
          onPress={handleSubmit}
        />
      </CtaBar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.default },
  // paddingBottom (clearance under the absolute CtaBar) is added inline: 120 + insets.bottom.
  body: { paddingHorizontal: spacing[6], paddingTop: spacing[1] },
  sub: { ...typography.body, fontSize: 15, color: colors.text.secondary, marginBottom: 20 },
  gap: { height: 16 },
  textarea: {
    backgroundColor: colors.surface.field,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    lineHeight: 21,
    color: colors.text.primary,
    minHeight: 84,
    textAlignVertical: 'top',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.full,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: colors.action.primary, borderColor: colors.action.primary },
  chipText: { fontFamily: INTER_MEDIUM, fontSize: 13.5, color: colors.text.secondary },
  chipTextActive: { color: colors.action.primaryText },
  error: { ...typography.body, fontSize: 14, color: colors.status.danger, marginTop: 14 },
});
