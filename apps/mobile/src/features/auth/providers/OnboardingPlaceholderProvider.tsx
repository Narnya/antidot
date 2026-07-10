// AUTH-007 — DEV-ONLY in-memory placeholder for onboarding completion state.
//
// PURPOSE:
//   - Allows the AUTH-007 route gates to exercise the full state matrix
//     (guest / signed_in_not_onboarded / signed_in_onboarded) without a real
//     onboarding backend.
//
// EXPLICIT BOUNDARIES (binding — read before touching):
//   - State is held in React useState only. It is NOT persisted to AsyncStorage,
//     SecureStore, Supabase user_metadata, or the `profiles` table. It resets
//     on every cold app start, by design — fake "onboarded" state must NOT
//     survive a restart and create false safety.
//   - The real source of truth will be a row in the `profiles` table
//     (Schema v2 §7.1, `onboarding_completed_at`) populated by ONB-014, behind
//     RLS v2 §10. This file MUST be deleted (or its provider made a no-op
//     reading from the real source) once that lands.
//   - Toggle UI is intentionally exposed only on the dev onboarding/app
//     placeholders, never in any production-facing flow.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type OnboardingPlaceholderContextValue = {
  /** TEMP dev flag — replace with the real profiles-table check in ONB-014. */
  isOnboardedPlaceholder: boolean;
  markOnboardedPlaceholder: () => void;
  resetOnboardedPlaceholder: () => void;
};

const OnboardingPlaceholderContext = createContext<OnboardingPlaceholderContextValue | null>(null);

type OnboardingPlaceholderProviderProps = {
  children: ReactNode;
};

export function OnboardingPlaceholderProvider({ children }: OnboardingPlaceholderProviderProps) {
  const [isOnboardedPlaceholder, setIsOnboardedPlaceholder] = useState(false);

  const markOnboardedPlaceholder = useCallback(() => {
    setIsOnboardedPlaceholder(true);
  }, []);

  const resetOnboardedPlaceholder = useCallback(() => {
    setIsOnboardedPlaceholder(false);
  }, []);

  const value = useMemo<OnboardingPlaceholderContextValue>(
    () => ({
      isOnboardedPlaceholder,
      markOnboardedPlaceholder,
      resetOnboardedPlaceholder,
    }),
    [isOnboardedPlaceholder, markOnboardedPlaceholder, resetOnboardedPlaceholder],
  );

  return (
    <OnboardingPlaceholderContext.Provider value={value}>
      {children}
    </OnboardingPlaceholderContext.Provider>
  );
}

export function useOnboardingPlaceholder(): OnboardingPlaceholderContextValue {
  const ctx = useContext(OnboardingPlaceholderContext);
  if (ctx === null) {
    throw new Error(
      'useOnboardingPlaceholder must be used inside <OnboardingPlaceholderProvider>.',
    );
  }
  return ctx;
}
