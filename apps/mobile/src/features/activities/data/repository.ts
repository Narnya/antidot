// ACT-002 — Data-access contract for the activities feature.
//
// Screens depend on THIS interface, not on Supabase directly, so the UI can be
// built and run against an in-memory mock now and swapped to a Supabase-backed
// implementation once a project exists (ACT-00X). Keeps the whole UX verifiable
// without a live database.
import type { Activity, AreaLabel, Group, Id, SlotClaim } from '../lib/model';

/** An activity plus everything a card / detail screen needs to render it. */
export interface ActivityView {
  activity: Activity;
  group: Group;
  claims: SlotClaim[];
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

export interface ActivitiesRepository {
  /** Groups the user belongs to — the "My Circles" home (belonging surface). */
  listMyGroups(userId: Id): Promise<Group[]>;
  /** Upcoming activities from the user's own groups. */
  listMyActivities(userId: Id): Promise<ActivityView[]>;
  /** Open slots across the city the user can claim — the feed / объявления. */
  listOpenInCity(userId: Id): Promise<ActivityView[]>;
  getActivity(activityId: Id): Promise<ActivityView | null>;
  createActivity(input: CreateActivityInput): Promise<Activity>;
  /**
   * Claim a spot. Whether it counts as a 'member' or 'overflow' claim (the pull
   * signal) is derived from the user's membership, not passed by the caller.
   */
  claimSlot(activityId: Id, userId: Id): Promise<SlotClaim>;
  cancelClaim(activityId: Id, userId: Id): Promise<void>;
}
