// Barrel for the beta feature. Public API consumed by app routes / gates.
export {
  BetaAccessProvider,
  useBetaAccess,
  type BetaAccessContextValue,
} from './providers/BetaAccessProvider';

// BETA-001 — invite-code primitives.
export { validateInviteCode, type InviteValidationResult } from './lib/inviteValidation';
export { InviteCodeScreen } from './screens/InviteCodeScreen';

// BETA-002 — waitlist primitives.
export {
  validateWaitlistInput,
  type WaitlistFormValues,
  type WaitlistInput,
  type WaitlistValidationResult,
} from './lib/waitlistValidation';
export {
  submitWaitlistPlaceholder,
  type WaitlistSubmissionResult,
} from './lib/waitlistPlaceholder';
export { WaitlistScreen } from './screens/WaitlistScreen';
