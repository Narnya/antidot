// ONB-014 — durable onboarding gate, read from the real source of truth.
//
// «Onboarded» ⇔ the session user has a `profiles` row with a non-empty
// display_name — exactly the row the onboarding form (`(onboarding)/start.tsx`)
// upserts, protected by self-only RLS (migration 006). This replaces the
// AUTH-007 in-memory placeholder: the state now survives cold starts, so a
// returning user opens straight into the app instead of re-seeing /start.
//
// Semantics:
//   - No session user → not onboarded, not loading (guests never wait on this).
//   - Profile check in flight → isLoading (route gates hold on the loading
//     screen rather than flashing a wrong redirect).
//   - Check failed (offline / transient) → treated as NOT onboarded: the user
//     lands on /start, whose own profile check / upsert recovers gracefully.
//   - markOnboarded() flips the flag locally right after a successful profile
//     upsert, so completion navigation never races the refetch.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { getActivitiesRepository } from '../../activities/data/getRepository';
import { useAuthSession } from '../hooks/useAuthSession';

export type OnboardingContextValue = {
  /** Profile check for the current session user is still in flight. */
  isLoading: boolean;
  /** Durable: `profiles` row with a non-empty display_name exists. */
  isOnboarded: boolean;
  /** Optimistic local flip after a successful profile upsert. */
  markOnboarded: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthSession();
  const userId = user?.id ?? null;
  const [isLoading, setIsLoading] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    if (!userId) {
      // Sign-out / account deletion resets the gate for the next session.
      setIsLoading(false);
      setIsOnboarded(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    void (async () => {
      let onboarded = false;
      try {
        const profile = await getActivitiesRepository().getProfile(userId);
        onboarded = profile !== null && profile.displayName.trim().length > 0;
      } catch {
        // Offline / transient failure → fall through as not onboarded; /start
        // re-checks on mount and returning users auto-advance from there.
      }
      if (active) {
        setIsOnboarded(onboarded);
        setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  const markOnboarded = useCallback(() => {
    setIsOnboarded(true);
  }, []);

  const value = useMemo<OnboardingContextValue>(
    () => ({ isLoading, isOnboarded, markOnboarded }),
    [isLoading, isOnboarded, markOnboarded],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (ctx === null) {
    throw new Error('useOnboarding must be used inside <OnboardingProvider>.');
  }
  return ctx;
}
