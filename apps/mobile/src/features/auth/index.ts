// Barrel for the auth feature. Public API consumed by app routes / future gates.
export { AuthProvider, type AuthContextValue } from './providers/AuthProvider';
export { useAuthSession } from './hooks/useAuthSession';

// AUTH-007 / ONB-014 — protected route gate primitives.
export {
  OnboardingProvider,
  useOnboarding,
  type OnboardingContextValue,
} from './providers/OnboardingProvider';
export {
  decideRouteAccess,
  type GroupKind,
  type GateInput,
  type GateDecision,
  type RedirectTarget,
} from './lib/routeGate';
export { SessionLoadingScreen } from './components/SessionLoadingScreen';
