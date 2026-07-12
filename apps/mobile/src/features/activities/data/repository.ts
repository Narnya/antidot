// ACT-002 — Data-access contract for the activities feature.
//
// Screens depend on THIS interface, not on Supabase directly, so the UI can be
// built and run against an in-memory mock now and swapped to a Supabase-backed
// implementation once a project exists (ACT-00X). Keeps the whole UX verifiable
// without a live database.
import type {
  Activity,
  AreaLabel,
  CircleRhythm,
  ClaimSource,
  ClaimStatus,
  Group,
  Id,
  SlotClaim,
} from '../lib/model';

/** An activity plus everything a card / detail screen needs to render it. */
export interface ActivityView {
  activity: Activity;
  group: Group;
  /** Authoritative spot counts (from the roster for members, from a counts RPC for non-members). */
  spotsTaken: number;
  spotsRemaining: number;
  /** Roster — populated for group members; empty for non-members (privacy: no people list). */
  claims: SlotClaim[];
  /** The current user's own claim on this activity, if any. */
  mine: SlotClaim | null;
}

export interface CreateActivityInput {
  groupId: Id;
  createdBy: Id;
  title: string;
  kind: Activity['kind'];
  area: AreaLabel;
  startsAt: string;
  totalSpots: number;
  /** Open to other groups across the city from the start? (MVP: city-wide.) */
  overflow: boolean;
  /**
   * Exact meeting point (address / landmark). Stored separately and revealed only
   * to users who have claimed a spot (Inv. 1). Optional — the host may add it later.
   */
  exactLocation: string | null;
}

export interface CreateCircleInput {
  name: string;
  area: AreaLabel;
  theme: string | null;
  rhythm: CircleRhythm;
  ownerId: Id;
}

/** A circle's home view — aggregate composition (no people list) + next activity. */
export interface CircleView {
  group: Group;
  memberCount: number;
  isMember: boolean;
  isOwner: boolean;
  nextActivity: ActivityView | null;
}

/** An overflow guest who can be confirmed into the circle (host-confirm — §4.1 A). */
export interface MemberCandidate {
  userId: Id;
  throughActivityTitle: string;
}

/** A claimant as the host sees them when marking attendance (T5). Host-only view. */
export interface AttendanceEntry {
  userId: Id;
  /** Safe display name from the profile, if set; null falls back to a neutral label in UI. */
  displayName: string | null;
  status: ClaimStatus;
  source: ClaimSource;
}

/** Attendance states a host can set after the meeting (never surfaced publicly — Inv. 12). */
export type AttendanceMark = Extract<ClaimStatus, 'attended' | 'no_show'>;

/**
 * The PULL signal for closed testing (docs/31 Phase 5) — aggregate counts across
 * the user's own circles. Answers "did outsiders claim open slots themselves?"
 * Aggregate only — no identities, no PII (safe under Inv. 3/13/14). Not a global
 * analytics view (that's a later PostHog concern); scoped to circles the user is in.
 */
export interface PullMetrics {
  /** Occupying claims made by outsiders (source = overflow) — the pull. */
  overflowClaims: number;
  /** Occupying claims made by circle members (source = member) — the push baseline. */
  memberClaims: number;
  /** Activities in the user's circles that received at least one overflow claim. */
  activitiesWithPull: number;
  /** Distinct outsiders who claimed a slot across the user's circles. */
  pullUsers: number;
}

export type ReportSubjectType = 'user' | 'activity' | 'circle' | 'message';
export type ReportReason = 'unsafe' | 'spam' | 'abuse' | 'fake' | 'other';

export interface CreateReportInput {
  reporterId: Id;
  subjectType: ReportSubjectType;
  subjectId: Id;
  reason: ReportReason;
  note: string | null;
}

/** Minimal safe profile — display name + area only (no sensitive fields). */
export interface Profile {
  userId: Id;
  displayName: string;
  area: string | null;
}

export interface UpsertProfileInput {
  userId: Id;
  displayName: string;
  area: string | null;
}

export interface ActivitiesRepository {
  /** Groups the user belongs to — the "My Circles" home (belonging surface). */
  listMyGroups(userId: Id): Promise<Group[]>;
  /** Create a new circle; the creator becomes its owner-member. */
  createCircle(input: CreateCircleInput): Promise<Group>;
  /** A circle's home view — aggregate composition + next activity. */
  getCircle(circleId: Id, userId: Id): Promise<CircleView | null>;
  /** Overflow guests on this circle's activities who can be confirmed as members (host). */
  listMemberCandidates(circleId: Id): Promise<MemberCandidate[]>;
  /** Host confirms a guest into the circle as an active member (§4.1 A). */
  confirmMember(circleId: Id, userId: Id): Promise<void>;
  /** File a report on any subject (Inv. 6). */
  createReport(input: CreateReportInput): Promise<void>;
  /** Block a user — blocked users cannot interact (Inv. 6). */
  blockUser(blockerId: Id, blockedId: Id): Promise<void>;
  /** Ids the user has blocked (used to hide their content). */
  listBlockedUserIds(userId: Id): Promise<Id[]>;
  /** Blocked users as safe profiles (name/area) — for the Settings blocked list. */
  listBlockedProfiles(userId: Id): Promise<Profile[]>;
  /** Remove a block — the user can interact again. */
  unblockUser(blockerId: Id, blockedId: Id): Promise<void>;
  /**
   * Permanently delete the caller's account and all their data (hard delete,
   * cascades server-side). After this succeeds the caller must be signed out.
   */
  deleteAccount(userId: Id): Promise<void>;
  /** A user's safe profile (name + area). */
  getProfile(userId: Id): Promise<Profile | null>;
  /** Create or update the current user's profile. */
  upsertProfile(input: UpsertProfileInput): Promise<void>;
  /** Upcoming activities from the user's own groups. */
  listMyActivities(userId: Id): Promise<ActivityView[]>;
  /** Open slots across the city the user can claim — the feed / объявления. */
  listOpenInCity(userId: Id): Promise<ActivityView[]>;
  getActivity(activityId: Id, userId: Id): Promise<ActivityView | null>;
  createActivity(input: CreateActivityInput): Promise<Activity>;
  /**
   * Claim a spot. Whether it counts as a 'member' or 'overflow' claim (the pull
   * signal) is derived from the user's membership, not passed by the caller.
   */
  claimSlot(activityId: Id, userId: Id): Promise<SlotClaim>;
  cancelClaim(activityId: Id, userId: Id): Promise<void>;
  /**
   * The exact meeting location — returns it only when the caller is allowed to see
   * it (has an active claim, or is the host). RLS enforces this; null means either
   * "not revealed to you" or "not set yet" (the UI treats both as hidden).
   */
  getMeetingLocation(activityId: Id, userId: Id): Promise<string | null>;
  /** Host sets / updates the exact meeting location for one of their activities. */
  setMeetingLocation(activityId: Id, userId: Id, location: string): Promise<void>;
  /** Roster of an activity's claimants for the host to mark attendance (host-only). */
  listClaimants(activityId: Id, userId: Id): Promise<AttendanceEntry[]>;
  /**
   * Host marks a claimant present / absent after the meeting (feeds attend→member).
   * `claimantId` is the user being marked; host authority is enforced by RLS.
   */
  markAttendance(activityId: Id, claimantId: Id, status: AttendanceMark): Promise<void>;
  /** Pull signal (closed testing) — aggregate overflow-vs-member claims over the user's circles. */
  getPullMetrics(userId: Id): Promise<PullMetrics>;
}
