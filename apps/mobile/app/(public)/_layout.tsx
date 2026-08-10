// (public) layout (AUTH-007 / BETA-001) — guests are allowed; authenticated
// users are redirected forward to invite (no beta), onboarding (no onboarding),
// or app (fully onboarded).
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

export default function PublicLayout() {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuthSession();
  const { isLoading: isBetaLoading, hasBetaAccess } = useBetaAccess();
  const { isLoading: isOnboardingLoading, isOnboarded } = useOnboarding();

  const decision = decideRouteAccess('public', {
    isLoading: isAuthLoading || isBetaLoading || isOnboardingLoading,
    isAuthenticated,
    hasBetaAccess,
    isOnboarded,
  });

  if (decision.kind === 'loading') return <SessionLoadingScreen />;
  if (decision.kind === 'redirect') return <Redirect href={decision.to} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
