// Barrel for the activities feature (ACT-001+) — activity-first "fill the slot" MVP.
// Public API consumed by app routes, the data-access layer, and screens.
export type {
  Activity,
  ActivityKind,
  ActivityStatus,
  ActivityVisibility,
  SlotClaim,
  ClaimStatus,
  ClaimSource,
  Id,
  IsoTimestamp,
  AreaLabel,
  Group,
  GroupRole,
  CircleRhythm,
  MembershipStatus,
  GroupMembership,
  GroupLink,
} from './lib/model';

export {
  spotsTaken,
  spotsRemaining,
  isFull,
  isOpenForClaims,
  canClaim,
  pullClaims,
  isSeekingOverflow,
  type ClaimBlockReason,
  type ClaimEligibility,
} from './lib/slots';

export type {
  ActivitiesRepository,
  ActivityView,
  CreateActivityInput,
  CreateCircleInput,
  CircleView,
  MemberCandidate,
  ReportSubjectType,
  ReportReason,
  CreateReportInput,
} from './data/repository';
export {
  MockActivitiesRepository,
  mockActivitiesRepository,
  MOCK_USER_ID,
} from './data/mockRepository';
export {
  SupabaseActivitiesRepository,
  supabaseActivitiesRepository,
} from './data/supabaseRepository';
export { getActivitiesRepository } from './data/getRepository';
