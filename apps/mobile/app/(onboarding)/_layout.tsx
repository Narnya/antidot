// (onboarding) layout (AUTH-007 / BETA-001) — requires a session AND beta
// access; redirects already-onboarded (placeholder) users forward to the app
// placeholder.
//
// Route gates here are UX-level protection only. Real data-access enforcement
// must use RLS (Sprint 4+ via RLSV2).
import { Redirect, Stack } from 'expo-router';

import {
  SessionLoadingScreen,
  decideRouteAccess,
  useAuthSession,
  useOnboarding,
} from '../../src/features/auth';
import { useBetaAccess } from '../../src/features/beta';

export default function OnboardingLayout() {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuthSession();
  const { isLoading: isBetaLoading, hasBetaAccess } = useBetaAccess();
  const { isLoading: isOnboardingLoading, isOnboarded } = useOnboarding();

  const decision = decideRouteAccess('onboarding', {
    isLoading: isAuthLoading || isBetaLoading || isOnboardingLoading,
    isAuthenticated,
    hasBetaAccess,
    isOnboarded,
  });

  if (decision.kind === 'loading') return <SessionLoadingScreen />;
  if (decision.kind === 'redirect') return <Redirect href={decision.to} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
