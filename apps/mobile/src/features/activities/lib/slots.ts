// ACT-001 — Pure slot rules for activities. No I/O, no React; fully unit-testable.
// These functions are the single source of truth for "how many spots are left"
// and "who is allowed to claim one" — screens and the data layer must not
// re-derive this logic locally.
import type { Activity, Id, SlotClaim } from './model';

/** Claim statuses that occupy a spot. */
const OCCUPYING: ReadonlySet<string> = new Set(['going', 'attended']);

/** Count of spots currently taken on an activity. */
export function spotsTaken(claims: readonly SlotClaim[]): number {
  return claims.filter((c) => OCCUPYING.has(c.status)).length;
}

/** Spots still open (never negative). */
export function spotsRemaining(activity: Activity, claims: readonly SlotClaim[]): number {
  return Math.max(0, activity.totalSpots - spotsTaken(claims));
}

export function isFull(activity: Activity, claims: readonly SlotClaim[]): boolean {
  return spotsRemaining(activity, claims) === 0;
}

/** Is the activity accepting new claims at all right now? */
export function isOpenForClaims(activity: Activity, claims: readonly SlotClaim[]): boolean {
  if (activity.status === 'cancelled' || activity.status === 'completed') return false;
  return !isFull(activity, claims);
}

export type ClaimBlockReason =
  | 'already_claimed'
  | 'full'
  | 'closed' // cancelled or completed
  | 'not_in_overflow'; // outsider trying to claim a group-only activity

export type ClaimEligibility = { ok: true } | { ok: false; reason: ClaimBlockReason };

/**
 * Can `userId` claim a spot on this activity?
 * @param isGroupMember whether the user belongs to the owning group. Outsiders
 *   may only claim when the activity has been opened for overflow.
 */
export function canClaim(
  activity: Activity,
  claims: readonly SlotClaim[],
  userId: Id,
  isGroupMember: boolean,
): ClaimEligibility {
  if (activity.status === 'cancelled' || activity.status === 'completed') {
    return { ok: false, reason: 'closed' };
  }
  const existing = claims.find((c) => c.userId === userId);
  if (existing && OCCUPYING.has(existing.status)) {
    return { ok: false, reason: 'already_claimed' };
  }
  if (!isGroupMember && activity.visibility !== 'overflow') {
    return { ok: false, reason: 'not_in_overflow' };
  }
  if (isFull(activity, claims)) {
    return { ok: false, reason: 'full' };
  }
  return { ok: true };
}

/**
 * Overflow claims that occupy a spot — the PULL signal (outsiders who claimed a
 * spot themselves, without being personally recruited).
 */
export function pullClaims(claims: readonly SlotClaim[]): SlotClaim[] {
  return claims.filter((c) => c.source === 'overflow' && OCCUPYING.has(c.status));
}

/**
 * Should this activity surface to adjacent groups right now? True when it is
 * still upcoming, has been opened for overflow, and is not yet full. (Whether
 * overflow opens automatically when short, or only by explicit organizer action,
 * is a later product decision; MVP treats it as an explicit organizer action.)
 */
export function isSeekingOverflow(activity: Activity, claims: readonly SlotClaim[]): boolean {
  return (
    activity.status === 'scheduled' &&
    activity.visibility === 'overflow' &&
    spotsRemaining(activity, claims) > 0
  );
}
