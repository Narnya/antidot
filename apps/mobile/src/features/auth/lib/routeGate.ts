// AUTH-007 / BETA-001 — Pure decision helper for Expo Router protected route gates.
//
// IMPORTANT: This module is intentionally framework-agnostic — no React, no
// expo-router imports — so it remains a pure function that is easy to test and
// reason about. Layouts (apps/mobile/app/*/_layout.tsx) read state from hooks
// and call `decideRouteAccess()` to derive the gate decision.
//
// Route gates here are a UX-LEVEL protection only. They reduce the chance that
// users see a wrong screen for the wrong auth state. They are NOT a substitute
// for Row-Level Security (RLS). All sensitive data access must still be
// protected server-side by RLS policies (Schema v2 + RLS v2 — Sprint 4+).

export type GroupKind = 'public' | 'beta' | 'onboarding' | 'app';

export type GateInput = {
  // Initial Supabase session is still being loaded (AuthProvider.isLoading)
  // OR the beta-access placeholder is still being read from storage. Callers
  // should pass `authLoading || betaLoading` so the gate waits for both.
  isLoading: boolean;
  // A Supabase session exists on this device.
  isAuthenticated: boolean;
  // BETA-001 — temporary placeholder. Replace with server-side check against
  // `invite_codes` (Schema v2 §15.1, RLS v2 §22) in Sprint 4+.
  hasBetaAccess: boolean;
  // Temporary dev placeholder for onboarding completion (AUTH-007). The real
  // source of truth will be a `profiles` row column (DBV2-004 / ONB-014).
  isOnboardedPlaceholder: boolean;
};

// Routes used by gates. Kept as a string-union so a typo would fail typecheck.
// We never redirect to a `(group)` literally; Expo Router resolves screens by
// their inner pathname (`/welcome`, `/invite`, `/start`, `/home`).
export type RedirectTarget = '/welcome' | '/invite' | '/start' | '/feed';

export type GateDecision =
  | { kind: 'loading' }
  | { kind: 'allow' }
  | { kind: 'redirect'; to: RedirectTarget };

/**
 * Decide whether the given route group should be allowed, redirect away, or
 * still wait for auth/beta state to load.
 *
 * Group semantics:
 *   - public (welcome / login / signup): allowed for guests; authenticated
 *     users are redirected forward (to /invite if no beta access, /start if
 *     not onboarded, otherwise /home).
 *   - beta (invite-code screen): requires a session; if already has beta
 *     access, redirect forward (to /start or /home).
 *   - onboarding (start placeholder): requires a session AND beta access; if
 *     already onboarded, redirect to /home.
 *   - app (authenticated home placeholder): requires a session AND beta access
 *     AND onboarded placeholder true.
 *
 * Beta check is enforced before onboarding check everywhere — no path can
 * reach /start or /home without beta access.
 */
export function decideRouteAccess(group: GroupKind, input: GateInput): GateDecision {
  if (input.isLoading) {
    return { kind: 'loading' };
  }

  switch (group) {
    case 'public': {
      if (!input.isAuthenticated) return { kind: 'allow' };
      if (!input.hasBetaAccess) return { kind: 'redirect', to: '/invite' };
      if (!input.isOnboardedPlaceholder) return { kind: 'redirect', to: '/start' };
      return { kind: 'redirect', to: '/feed' };
    }
    case 'beta': {
      if (!input.isAuthenticated) return { kind: 'redirect', to: '/welcome' };
      if (input.hasBetaAccess) {
        if (!input.isOnboardedPlaceholder) return { kind: 'redirect', to: '/start' };
        return { kind: 'redirect', to: '/feed' };
      }
      return { kind: 'allow' };
    }
    case 'onboarding': {
      if (!input.isAuthenticated) return { kind: 'redirect', to: '/welcome' };
      if (!input.hasBetaAccess) return { kind: 'redirect', to: '/invite' };
      if (input.isOnboardedPlaceholder) return { kind: 'redirect', to: '/feed' };
      return { kind: 'allow' };
    }
    case 'app': {
      if (!input.isAuthenticated) return { kind: 'redirect', to: '/welcome' };
      if (!input.hasBetaAccess) return { kind: 'redirect', to: '/invite' };
      if (!input.isOnboardedPlaceholder) return { kind: 'redirect', to: '/start' };
      return { kind: 'allow' };
    }
  }
}
