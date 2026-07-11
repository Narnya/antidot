// ACT-001 — Activities domain model (activity-first "fill the slot" MVP).
//
// Product direction (project decision 2026-07 — supersedes circle-first Core v2
// for this module): users create real-world ACTIVITIES with a limited number of
// spots. Their own group fills first; when spots remain, the activity can be
// opened for OVERFLOW so members of adjacent / trusted groups can claim a spot
// THEMSELVES. The product's core hypothesis is PULL — that people claim open
// spots without being personally recruited. `SlotClaim.source === 'overflow'`
// is how we measure whether that hypothesis holds.
//
// This module is pure types — no Supabase, no React. The data-access layer and
// screens (ACT-002+) derive their shapes from here.

/** Stable unique id (UUID string from the DB). */
export type Id = string;

/** ISO-8601 timestamp string (UTC). */
export type IsoTimestamp = string;

/**
 * Coarse location only — city / district / area label. Never an exact address
 * or live coordinates (carried-forward safety invariant: no exact user location).
 */
export type AreaLabel = string;

/** Kind of activity. Curated set; `other` covers the long tail. */
export type ActivityKind = 'football' | 'walk' | 'boardgames' | 'coffee' | 'run' | 'other';

export type ActivityStatus =
  | 'scheduled' // upcoming, accepting spots
  | 'full' // all spots taken (derived, persisted for cheap filtering)
  | 'completed' // already happened
  | 'cancelled';

/**
 * Who a scheduled activity is currently visible to.
 *  - 'group_only' — only members of the owning group.
 *  - 'overflow'   — also visible to adjacent / trusted groups so they can claim
 *                   remaining spots. Set when the group can't fill it alone.
 */
export type ActivityVisibility = 'group_only' | 'overflow';

export interface Activity {
  id: Id;
  groupId: Id;
  createdBy: Id;
  title: string;
  kind: ActivityKind;
  area: AreaLabel;
  startsAt: IsoTimestamp;
  /** Total spots the activity needs filled (organizer-set, e.g. 10 for 5v5). */
  totalSpots: number;
  status: ActivityStatus;
  visibility: ActivityVisibility;
  createdAt: IsoTimestamp;
}

export type ClaimStatus =
  | 'going' // committed to attend
  | 'attended' // confirmed present after the activity
  | 'no_show' // committed but did not attend (private internal signal)
  | 'cancelled'; // withdrew the claim

/**
 * How a claim was made — the PULL signal.
 *  - 'member'   — someone from the owning group.
 *  - 'overflow' — someone from an adjacent group who claimed an open spot
 *                 themselves. This is the metric that tells us the product works
 *                 without manual recruiting.
 */
export type ClaimSource = 'member' | 'overflow';

export interface SlotClaim {
  id: Id;
  activityId: Id;
  userId: Id;
  status: ClaimStatus;
  source: ClaimSource;
  createdAt: IsoTimestamp;
}

export type GroupRole = 'owner' | 'member';

/** Meeting cadence of a circle. */
export type CircleRhythm = 'weekly' | 'biweekly' | 'monthly' | 'adhoc';

export type MembershipStatus =
  | 'active'
  | 'paused' // temporarily stepped back; no public signal to other members
  | 'left'
  | 'removed';

/**
 * A Circle — the persistent trusted group and the unit of BELONGING / return.
 * Named `Group` in code to stay brand- and concept-neutral; the user-facing term
 * is "круг". A group owns MANY activities over time — this recurring rhythm is
 * the product's retention engine (the "My Circles" home surface). It is NOT a
 * discoverable marketplace listing of people, and it carries none of the heavy
 * circle-first lifecycle (no request-a-place, no staged approval) — that model
 * was superseded.
 */
export interface Group {
  id: Id;
  name: string;
  area: AreaLabel;
  /** What the circle is about (optional free text). */
  theme: string | null;
  /** Meeting cadence. */
  rhythm: CircleRhythm;
  ownerId: Id;
  createdAt: IsoTimestamp;
}

export interface GroupMembership {
  groupId: Id;
  userId: Id;
  role: GroupRole;
  status: MembershipStatus;
  createdAt: IsoTimestamp;
}

/**
 * A trust edge between two groups — RESERVED for a later "trusted radius" mode.
 * MVP shows overflow activities city-wide (product decision 2026-07), so this is
 * not yet wired into visibility. It exists so discovery can later be tightened to
 * linked groups without a model rewrite. Symmetric: a link means each group can
 * see the other's overflow.
 */
export interface GroupLink {
  groupAId: Id;
  groupBId: Id;
  createdAt: IsoTimestamp;
}
