// Barrel for the auth feature. Public API consumed by app routes / future gates.
export { AuthProvider, type AuthContextValue } from './providers/AuthProvider';
export { useAuthSession } from './hooks/useAuthSession';

// AUTH-007 — protected route gate primitives.
export {
  OnboardingPlaceholderProvider,
  useOnboardingPlaceholder,
  type OnboardingPlaceholderContextValue,
} from './providers/OnboardingPlaceholderProvider';
export {
  decideRouteAccess,
  type GroupKind,
  type GateInput,
  type GateDecision,
  type RedirectTarget,
} from './lib/routeGate';
export { SessionLoadingScreen } from './components/SessionLoadingScreen';
