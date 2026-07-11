// ACT-002 — Data-access contract for the activities feature.
//
// Screens depend on THIS interface, not on Supabase directly, so the UI can be
// built and run against an in-memory mock now and swapped to a Supabase-backed
// implementation once a project exists (ACT-00X). Keeps the whole UX verifiable
// without a live database.
import type { Activity, AreaLabel, CircleRhythm, Group, Id, SlotClaim } from '../lib/model';

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
}
