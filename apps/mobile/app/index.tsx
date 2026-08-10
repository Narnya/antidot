// "/" — app entry. Redirects to the right screen for the current auth / beta /
// onboarding state, reusing the SAME gate decision as the route-group layouts
// (`decideRouteAccess`) so the front-door logic lives in one place:
//   guest → /welcome · authed-no-beta → /invite · beta-not-onboarded → /start ·
//   fully onboarded → /home.
//
// Replaces the earlier dev shell (a manual list of links). Route gates are
// UX-level only — real access is enforced server-side by RLS.
import { Redirect } from 'expo-router';

import {
  SessionLoadingScreen,
  decideRouteAccess,
  useAuthSession,
  useOnboarding,
} from '../src/features/auth';
import { useBetaAccess } from '../src/features/beta';

export default function Index() {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuthSession();
  const { isLoading: isBetaLoading, hasBetaAccess } = useBetaAccess();
  const { isLoading: isOnboardingLoading, isOnboarded } = useOnboarding();

  // The 'app' gate resolves the full forward-routing. 'allow' means the user is
  // authenticated + has beta + is onboarded → send them to the app home.
  const decision = decideRouteAccess('app', {
    isLoading: isAuthLoading || isBetaLoading || isOnboardingLoading,
    isAuthenticated,
    hasBetaAccess,
    isOnboarded,
  });

  if (decision.kind === 'loading') return <SessionLoadingScreen />;
  if (decision.kind === 'redirect') return <Redirect href={decision.to} />;
  return <Redirect href="/feed" />;
}
