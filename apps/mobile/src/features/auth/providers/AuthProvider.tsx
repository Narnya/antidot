// AUTH-005 — Auth session state provider for the Expo mobile app.
//
// Responsibilities:
//   - On mount: load the current Supabase session via `getSession()`.
//   - Subscribe to `onAuthStateChange` so any sign-in / sign-out / token refresh
//     propagates to all consumers automatically (AUTH-002 Login/Signup screens
//     do not need to wire state explicitly — this provider observes the change).
//   - Expose a minimal, future-compatible state shape: { session, user, isLoading,
//     isAuthenticated, error, refreshSession, signOut }.
//   - Expose a `signOut()` helper for AUTH-006 to reuse. NO UI logout button is
//     added in this ticket.
//
// Safety boundary (binding — CLAUDE.md §2, /docs/07_SECURITY_RLS.md §6, Inv. 12, 13):
//   - Uses ONLY the public Supabase client from AUTH-001 (anon/publishable key).
//   - NEVER renders, logs, or otherwise exposes tokens, the full session object,
//     emails, or user IDs. Consumers see boolean / derived state only.
//   - Beta-access, onboarding, restricted, and banned states (per /docs/07 §6) are
//     intentionally NOT modeled here — they belong to future BETA-003, ONB-014,
//     and admin-side enforcement work. Adding them now without backing logic would
//     give false safety.
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '../../../lib/supabase/client';

export type AuthContextValue = {
  session: Session | null;
  user: User | null;
  // True only during the initial getSession() on mount. Separate from `isSigningOut`
  // so consumers can render distinct UI for "still loading" vs "logging out".
  isLoading: boolean;
  // True while `signOut()` is in flight (AUTH-006). False at rest.
  isSigningOut: boolean;
  isAuthenticated: boolean;
  // User-facing Russian error message, never raw Supabase text. Null when no error.
  error: string | null;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applySession = useCallback((next: Session | null) => {
    setSession(next);
    setUser(next?.user ?? null);
  }, []);

  const loadSession = useCallback(async (): Promise<void> => {
    const { data, error: getError } = await supabase.auth.getSession();
    if (getError) {
      // Generic non-leaking copy — never expose Supabase error text to UI.
      setError('Не удалось проверить сессию.');
      applySession(null);
      return;
    }
    setError(null);
    applySession(data.session);
  }, [applySession]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await loadSession();
        /*DEVLOGIN*/ if (__DEV__ && process.env.EXPO_PUBLIC_DEV_LOGIN === '1') {
          const { data: s } = await supabase.auth.getSession();
          if (!s.session) {
            await supabase.auth.signInWithPassword({
              email: process.env.EXPO_PUBLIC_DEV_EMAIL ?? '',
              password: process.env.EXPO_PUBLIC_DEV_PASSWORD ?? '',
            });
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    // Subscribe to live auth events. `onAuthStateChange` covers SIGNED_IN,
    // SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED, INITIAL_SESSION (depending on
    // current SDK). We handle them uniformly: replace local state with the
    // freshest session the SDK gave us.
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (cancelled) return;
      applySession(nextSession);
      setError(null);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, [applySession, loadSession]);

  const refreshSession = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await loadSession();
    } finally {
      setIsLoading(false);
    }
  }, [loadSession]);

  const signOut = useCallback(async (): Promise<void> => {
    setError(null);
    setIsSigningOut(true);
    try {
      // `scope: 'local'` signs the user out on the current device / session only.
      // We deliberately do NOT use 'global' (which would surprise users by also
      // signing them out on every other device) or 'others' (not relevant here).
      // Supabase clears stored tokens internally as part of this call.
      const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' });
      if (signOutError) {
        // If the session is already gone (e.g., expired), treat as success —
        // the on-device state is already what the user wanted. Otherwise surface
        // a generic Russian message; never leak raw Supabase error text.
        const rawMessage = (signOutError.message ?? '').toLowerCase();
        const alreadySignedOut =
          rawMessage.includes('session not found') ||
          rawMessage.includes('session_not_found') ||
          rawMessage.includes('not authenticated');
        if (!alreadySignedOut) {
          setError('Не удалось выйти. Попробуйте ещё раз.');
          return;
        }
      }
      // On success the SDK emits SIGNED_OUT, which the subscription above handles
      // by clearing local session/user. We do not need to set state manually here.
      //
      // TODO (future): once any sensitive cached data exists in the mobile app,
      // logout must also clear it here. Candidates (none exist in Sprint 2):
      //   - meeting location cache (Inv. 1 — never persist anyway)
      //   - circle chat cache
      //   - profile cache
      //   - membership cache
      //   - query cache (TanStack Query, if introduced later)
    } finally {
      setIsSigningOut(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      isLoading,
      isSigningOut,
      isAuthenticated: session !== null,
      error,
      refreshSession,
      signOut,
    }),
    [session, user, isLoading, isSigningOut, error, refreshSession, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
