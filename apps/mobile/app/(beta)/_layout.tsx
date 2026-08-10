// (beta) layout (BETA-001) — invite-code gate.
//
//   - guest          → redirect to /welcome (must sign in first);
//   - has beta + not onboarded → redirect to /start;
//   - has beta + onboarded → redirect to /home;
//   - authenticated + no beta → ALLOW (this is where /invite lives).
//
// Route gates here are UX-level protection only. Real invite validation must
// later run server-side against an `invite_codes` table behind RLS
// (Schema v2 §15.1, RLS v2 §22, /docs/29 §10).
import { Redirect, Stack } from 'expo-router';

import {
  SessionLoadingScreen,
  decideRouteAccess,
  useAuthSession,
  useOnboarding,
} from '../../src/features/auth';
import { useBetaAccess } from '../../src/features/beta';

export default function BetaLayout() {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuthSession();
  const { isLoading: isBetaLoading, hasBetaAccess } = useBetaAccess();
  const { isLoading: isOnboardingLoading, isOnboarded } = useOnboarding();

  const decision = decideRouteAccess('beta', {
    isLoading: isAuthLoading || isBetaLoading || isOnboardingLoading,
    isAuthenticated,
    hasBetaAccess,
    isOnboarded,
  });

  if (decision.kind === 'loading') return <SessionLoadingScreen />;
  if (decision.kind === 'redirect') return <Redirect href={decision.to} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
