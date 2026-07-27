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

/** A "My Circles" list item — the circle + its aggregate member count. */
export interface MyCircle {
  group: Group;
  memberCount: number;
}

/** An overflow guest who can be confirmed into the circle (host-confirm — §4.1 A). */
export interface MemberCandidate {
  userId: Id;
  throughActivityTitle: string;
  /** «+1 друг» flagged on their claim (frame C → shown to the host, frame M). */
  plusOne: boolean;
  /** Their short word to the organizer, if any. */
  note: string | null;
}

/** Extras captured on «Занять место» (frame C). */
export interface ClaimOptions {
  plusOne?: boolean;
  note?: string | null;
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
  /** Free-text «О себе» (optional safe field; absent on minimal/legacy rows). */
  bio?: string | null;
  /** Interest chips (safe tags — not a searchable people catalog, Inv. 13). */
  interests?: string[] | null;
  /** Neutral participation counts for the profile header. NOT a trust score and
   *  NOT a public rating (Inv. 3) — just круга / встреч / недель ритма. */
  stats?: { circles: number; meetings: number; rhythmWeeks: number } | null;
  /** Viewer-relative shared context on a FOREIGN profile (co-attended activities +
   *  the circle where it happened). Populated only when the viewer and this user
   *  share history; drives the «Общий контекст» card. Preview/mock for now. */
  sharedContext?: { activities: number; circleName: string } | null;
}

export interface UpsertProfileInput {
  userId: Id;
  displayName: string;
  area: string | null;
  /** Interest chips picked in onboarding (optional safe field). Persisted only
   *  where the profiles table has the column; ignored on the minimal live schema. */
  interests?: string[];
}

/** Activity-scoped notification kinds (mockup frame 10). Each maps to a tile glyph
 *  + tint. `roster_updated` is the ONLY membership-transition signal we ever show,
 *  and it stays neutral/aggregate — never "X ушёл / removed" (Инв. 11–12). */
export type NotificationKind =
  | 'member_confirmed' // check · тебя приняли в круг
  | 'location_open' // pin · место встречи открыто
  | 'reminder' // clock (coral) · напоминание о встрече
  | 'chat' // chat · новое в чате круга
  | 'roster_updated' // users (muted) · состав круга обновился
  | 'slot_claimed'; // users · кто-то занял твой слот (host, pushed event)

export interface NotificationItem {
  id: Id;
  kind: NotificationKind;
  title: string; // t1
  detail: string; // t2
  /** Optional in-app route to open on tap (null = non-navigating system row). */
  href?: string | null;
}

/** Circle chat (mockup frame L). Member-only group chat — the ONE sanctioned
 *  messaging surface (Core §10); never open DMs / 1:1 / cold messages (Инв. 2). */
export interface ChatMessage {
  id: Id;
  kind: 'msg' | 'system';
  /** Author (msg only). */
  authorName?: string | null;
  /** True for the current user's own messages (right-aligned green bubble). */
  mine?: boolean;
  text: string;
}

export interface CircleChatView {
  name: string;
  memberCount: number;
  /** Optional pinned meeting line. On the live path the exact place must respect
   *  the reveal rule (Инв. 1); shown here for members with an upcoming meeting. */
  pinned?: { title: string; detail: string } | null;
  messages: ChatMessage[];
}

/** Per-day state in the «Эта неделя» rhythm grid (Mon..Sun). */
export type RhythmDay = 'none' | 'planned' | 'attended';

/** Personal rhythm surface (mockup frame 09) — the RETURN/belonging axis. Private
 *  and self-only: a gentle reflection of showing up, NOT a public counter, ranking,
 *  or discovery-nag (Инв. 10 / 14). Soft tone by product decision (2026-07-22). */
export interface RhythmView {
  /** Consecutive weeks with at least one circle activity. 0 = no rhythm yet. */
  streakWeeks: number;
  /** Mon..Sun states for the current week (length 7). */
  week: RhythmDay[];
  /** Recently attended activities (past), most recent first. */
  recent: { id: Id; title: string; when: string; icon: 'check' | 'users' }[];
}

export interface ActivitiesRepository {
  /** Groups the user belongs to — plain list (used by circle pickers, etc.). */
  listMyGroups(userId: Id): Promise<Group[]>;
  /** "My Circles" home (belonging surface): each circle + its aggregate member
   *  count (no people list — Inv. 13). */
  listMyCircles(userId: Id): Promise<MyCircle[]>;
  /** Create a new circle; the creator becomes its owner-member. */
  createCircle(input: CreateCircleInput): Promise<Group>;
  /** A circle's home view — aggregate composition + next activity. */
  getCircle(circleId: Id, userId: Id): Promise<CircleView | null>;
  /** Overflow guests on this circle's activities who can be confirmed as members (host). */
  listMemberCandidates(circleId: Id): Promise<MemberCandidate[]>;
  /** Host confirms a guest into the circle as an active member (§4.1 A). */
  confirmMember(circleId: Id, userId: Id): Promise<void>;
  /** Step back from a circle privately — no public signal to others (Inv. 11–12). */
  pauseMembership(circleId: Id, userId: Id): Promise<void>;
  /** Leave a circle privately — the user simply disappears from the roster (Inv. 12). */
  leaveCircle(circleId: Id, userId: Id): Promise<void>;
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
  /** Activity-scoped notifications (mockup frame 10). Must never surface another
   *  user's membership transitions beyond the neutral «Состав круга обновился»
   *  (Инв. 11–12). */
  listNotifications(userId: Id): Promise<NotificationItem[]>;
  /** Mark the user's stored (pushed) notifications as read. Derived events have no
   *  read-state; this only touches the `notifications` table rows. */
  markNotificationsRead(userId: Id): Promise<void>;
  /** Count of the user's UNREAD stored notifications — for the bell tab badge. */
  unreadNotificationCount(userId: Id): Promise<number>;
  /** Personal rhythm surface (mockup frame 09) — streak weeks + this-week grid +
   *  recently-attended. Private / self-only, never a public counter (Инв. 10/14). */
  getRhythm(userId: Id): Promise<RhythmView>;
  /** Member-only circle chat (mockup frame L). Returns null if the circle is not
   *  found or the user is not a member (chat is gated to members — Core §10). */
  getCircleChat(circleId: Id, userId: Id): Promise<CircleChatView | null>;
  /** Post a message to a circle chat as the current user. RLS requires an active
   *  membership + self-authorship (Инв. 2 — no cold/foreign messages). */
  sendCircleMessage(circleId: Id, userId: Id, text: string): Promise<void>;
  /** Subscribe to new messages in a circle chat (Supabase Realtime); `onChange`
   *  fires on each insert. Returns an unsubscribe fn. No-op (returns a noop) where
   *  realtime isn't available (mock/preview). */
  subscribeCircleChat(circleId: Id, onChange: () => void): () => void;
  /** Open slots across the city the user can claim — the feed / объявления. */
  listOpenInCity(userId: Id): Promise<ActivityView[]>;
  getActivity(activityId: Id, userId: Id): Promise<ActivityView | null>;
  createActivity(input: CreateActivityInput): Promise<Activity>;
  /**
   * Claim a spot. Whether it counts as a 'member' or 'overflow' claim (the pull
   * signal) is derived from the user's membership, not passed by the caller.
   */
  claimSlot(activityId: Id, userId: Id, opts?: ClaimOptions): Promise<SlotClaim>;
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
