// (app) layout (AUTH-007 / BETA-001) — requires a session AND beta access AND
// completed onboarding placeholder. Guests → /welcome; no-beta → /invite;
// not-onboarded → /start.
//
// Route gates here are UX-level protection only. Real data-access enforcement
// must use RLS (Sprint 4+ via RLSV2). No product UI is implemented behind this
// gate — only placeholder content.
import { Redirect, Stack } from 'expo-router';

import {
  SessionLoadingScreen,
  decideRouteAccess,
  useAuthSession,
  useOnboardingPlaceholder,
} from '../../src/features/auth';
import { useBetaAccess } from '../../src/features/beta';

export default function AppLayout() {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuthSession();
  const { isLoading: isBetaLoading, hasBetaAccess } = useBetaAccess();
  const { isOnboardedPlaceholder } = useOnboardingPlaceholder();

  const decision = decideRouteAccess('app', {
    isLoading: isAuthLoading || isBetaLoading,
    isAuthenticated,
    hasBetaAccess,
    isOnboardedPlaceholder,
  });

  if (decision.kind === 'loading') return <SessionLoadingScreen />;
  if (decision.kind === 'redirect') return <Redirect href={decision.to} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
