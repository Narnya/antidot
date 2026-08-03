// (onboarding) → start. Activity-first onboarding, ported to the mockups:
//   steps 0–2 → value slides A1–A3 (анти-дейтинг framing: активность, не свидание;
//   группа, не 1:1; принадлежность), each a full-bleed hero fading to ivory.
//   step 3   → profile form (frame 03): имя / город+район / interest chips, a
//   progress bar and a fixed «Далее» CTA. On submit it WRITES the `profiles` row
//   (durable source of truth) and flips the in-memory gate flag.
//
// Per product decision (2026-07-22) the onboarding follows the mockup exactly —
// no safety-rules card / mandatory accept checkbox. The safety promise is carried
// by the value slides. A subtle «Выйти» escape is kept (this is a post-auth screen).
//
// Durability: on mount we check for an existing profile; returning users skip the
// flow. The gate flag is still in-memory (dev); the durable gate-from-profiles is
// the larger ONB-014 step. Interests persist on mock; the live schema stores имя+
// район until the profiles table gains the column (docs/32 §4.3).
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, spacing, typography } from '@social-events/ui';

import { Button, CtaBar, Field, FieldLabel, HeroTitle, IconPin, ScreenHeader } from '../../src/components';
import { kindImage } from '../../src/features/activities/lib/kindImage';
import { useActivitiesRepo } from '../../src/features/activities/hooks/useActivitiesRepo';
import { useAuthSession, useOnboardingPlaceholder } from '../../src/features/auth';

const SLIDES = [
  {
    kind: 'football' as const,
    title: 'Сначала\nобщее занятие',
    sub: 'Ты приходишь на активность, а не на свидание.',
    cta: 'Далее',
  },
  {
    kind: 'coffee' as const,
    title: 'Знакомства\nпроисходят сами',
    sub: 'Ты общаешься в группе, а не один на один.',
    cta: 'Далее',
  },
  {
    kind: 'walk' as const,
    title: 'Круги делают\nлюдей ближе',
    sub: 'Ты становишься частью постоянного круга.',
    cta: 'Начать',
  },
];

const INTERESTS = ['Спорт', 'Настолки', 'Прогулки', 'Кофе', 'Бег', 'Музыка'];

export default function OnboardingStart() {
  const insets = useSafeAreaInsets();
  const { repo, userId } = useActivitiesRepo();
  const { isSigningOut, signOut } = useAuthSession();
  const { markOnboardedPlaceholder } = useOnboardingPlaceholder();
  const router = useRouter();

  // Onboarding completion navigates to the feed EXPLICITLY rather than relying on
  // the route-group gate to redirect once the onboarded placeholder flips. The gate
  // still redirects on the real app, but the preview gate (PREVIEW_UNLOCK) returns
  // `allow` before the onboarded check, so without this the form would just sit
  // there after «Далее». Explicit nav makes completion deterministic everywhere.
  const finishOnboarding = useCallback(() => {
    markOnboardedPlaceholder();
    router.replace('/feed');
  }, [markOnboardedPlaceholder, router]);

  const [checking, setChecking] = useState(true);
  const [step, setStep] = useState(0); // 0–2 value slides · 3 profile form
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Returning users (a profile already exists) skip straight into the app.
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const existing = await repo.getProfile(userId);
        if (!active) return;
        if (existing && existing.displayName.trim().length > 0) {
          finishOnboarding();
          return;
        }
      } catch {
        // Fall through to the flow if the check fails (offline / transient).
      }
      if (active) setChecking(false);
    })();
    return () => {
      active = false;
    };
  }, [repo, userId, finishOnboarding]);

  const toggleInterest = useCallback((tag: string) => {
    setInterests((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (name.trim().length === 0) {
      setError('Введите имя.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await repo.upsertProfile({
        userId,
        displayName: name.trim(),
        area: area.trim().length > 0 ? area.trim() : null,
        interests,
      });
      finishOnboarding();
    } catch {
      setError('Не удалось сохранить профиль. Попробуйте ещё раз.');
      setSubmitting(false);
    }
  }, [name, area, interests, repo, userId, finishOnboarding]);

  if (checking) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.text.muted} />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Value slides (A1–A3) ────────────────────────────────────────────────
  if (step < 3) {
    const slide = SLIDES[step];
    return (
      <View style={styles.slideRoot}>
        <Image source={kindImage(slide.kind)} style={styles.hero} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(21,19,15,0.16)', 'rgba(247,245,239,0)', 'rgba(247,245,239,1)']}
          locations={[0, 0.4, 0.92]}
          style={styles.heroFade}
          pointerEvents="none"
        />
        <Pressable
          onPress={() => setStep(3)}
          style={[styles.skip, { top: insets.top + 14 }]}
          accessibilityRole="button"
          testID="onb-skip"
        >
          <Text style={styles.skipText}>Пропустить</Text>
        </Pressable>

        <View style={[styles.obContent, { paddingBottom: insets.bottom + 40 }]}>
          <HeroTitle style={styles.slideTitle}>{slide.title}</HeroTitle>
          <Text style={styles.slideSub}>{slide.sub}</Text>
          <View style={styles.dots}>
            {SLIDES.map((s, i) => (
              <View key={s.kind} style={[styles.dot, i === step && styles.dotOn]} />
            ))}
          </View>
          <View style={styles.slideCta}>
            <Button label={slide.cta} onPress={() => setStep((s) => s + 1)} />
          </View>
        </View>
      </View>
    );
  }

  // ─── Profile form (frame 03) ─────────────────────────────────────────────
  const canSubmit = name.trim().length > 0 && !submitting;
  return (
    <View style={styles.safe}>
      <SafeAreaView style={styles.formSafe} edges={['top']}>
        <ScreenHeader onBack={() => setStep(2)} />
        <View style={styles.progress}>
          <View style={[styles.seg, styles.segOn]} />
          <View style={[styles.seg, styles.segOn]} />
          <View style={styles.seg} />
        </View>

        <ScrollView
          contentContainerStyle={styles.formBody}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <HeroTitle>{'Немного\nо тебе'}</HeroTitle>
          <Text style={styles.formSub}>
            Это увидят участники круга, когда вы окажетесь на одной активности.
          </Text>

          <View style={styles.fieldBlock}>
            <FieldLabel>Как тебя зовут</FieldLabel>
            <Field
              value={name}
              onChangeText={setName}
              placeholder="Имя"
              autoCapitalize="words"
              testID="onb-name"
            />
          </View>

          <View style={styles.fieldBlock}>
            <FieldLabel>Город и район</FieldLabel>
            <Field
              value={area}
              onChangeText={setArea}
              placeholder="Санкт-Петербург · Приморский"
              leftIcon={<IconPin color={colors.text.muted} size={20} />}
              testID="onb-area"
            />
          </View>

          <View style={styles.fieldBlock}>
            <FieldLabel>Что тебе интересно</FieldLabel>
            <View style={styles.chips}>
              {INTERESTS.map((tag) => {
                const on = interests.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    onPress={() => toggleInterest(tag)}
                    style={[styles.chip, on && styles.chipOn]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    testID={`onb-interest-${tag}`}
                  >
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>{tag}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {error ? (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          ) : null}

          <Pressable
            onPress={signOut}
            disabled={isSigningOut}
            style={styles.signout}
            accessibilityRole="button"
            testID="onboarding-signout"
          >
            <Text style={styles.signoutText}>{isSigningOut ? 'Выход…' : 'Выйти из аккаунта'}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      <CtaBar>
        <Button label={submitting ? 'Сохраняем…' : 'Далее'} onPress={handleSubmit} disabled={!canSubmit} />
      </CtaBar>
    </View>
  );
}

const HERO_HEIGHT = 430;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background.default },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // value slides
  slideRoot: { flex: 1, backgroundColor: colors.background.default },
  hero: { position: 'absolute', top: 0, left: 0, right: 0, height: HERO_HEIGHT },
  heroFade: { position: 'absolute', top: 0, left: 0, right: 0, height: HERO_HEIGHT },
  skip: { position: 'absolute', right: spacing[6], zIndex: 25 },
  skipText: {
    fontFamily: typography.badge.fontFamily,
    fontSize: 14,
    color: colors.text.inverse,
    opacity: 0.95,
    textShadowColor: 'rgba(21,19,15,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  obContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    justifyContent: 'flex-end',
    paddingHorizontal: 30,
  },
  slideTitle: { fontSize: 33, lineHeight: 39 },
  slideSub: { fontSize: 16, lineHeight: 23, color: colors.text.secondary, marginTop: 14 },
  dots: { flexDirection: 'row', gap: 7, marginTop: 30 },
  dot: { width: 7, height: 7, borderRadius: radius.full, backgroundColor: colors.border.default },
  dotOn: { width: 22, backgroundColor: colors.action.primary },
  slideCta: { marginTop: 22 },

  // profile form
  formSafe: { flex: 1 },
  progress: { flexDirection: 'row', gap: 6, paddingHorizontal: spacing[6], paddingTop: 6 },
  seg: { flex: 1, height: 4, borderRadius: radius.full, backgroundColor: colors.border.default },
  segOn: { backgroundColor: colors.action.primary },
  formBody: { paddingHorizontal: spacing[6], paddingTop: 20, paddingBottom: 150 },
  formSub: { ...typography.body, fontSize: 15, lineHeight: 22, color: colors.text.secondary, marginTop: 10 },
  fieldBlock: { marginTop: 18 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    backgroundColor: colors.surface.default,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.full,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  chipOn: { backgroundColor: colors.action.primary, borderColor: colors.action.primary },
  chipText: { fontSize: 13.5, lineHeight: 16, color: colors.text.primary, fontFamily: typography.caption.fontFamily },
  chipTextOn: { color: colors.action.primaryText },
  error: { ...typography.body, color: colors.status.danger, marginTop: spacing[4] },
  signout: { alignSelf: 'center', paddingVertical: spacing[3], marginTop: spacing[6] },
  signoutText: { ...typography.caption, color: colors.text.muted },
});
