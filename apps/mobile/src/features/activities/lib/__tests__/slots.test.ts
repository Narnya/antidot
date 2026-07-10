// ACT-001 — Unit tests for the pure slot rules. Vitest, Node env (no RN, no I/O).
//
// NOTE: like the AUTH-001 client test, this file is not yet executed by
// `pnpm test` (vitest.config.ts scopes runs to packages/**). It stays for
// typecheck coverage and as executable intent documentation until the mobile
// runner (jest-expo / vitest mobile project) is wired — see /docs/20.
import { describe, expect, it } from 'vitest';

import type { Activity, SlotClaim } from '../model';
import {
  canClaim,
  isFull,
  isOpenForClaims,
  isSeekingOverflow,
  pullClaims,
  spotsRemaining,
  spotsTaken,
} from '../slots';

const activity = (over: Partial<Activity> = {}): Activity => ({
  id: 'a1',
  groupId: 'g1',
  createdBy: 'owner',
  title: 'Футбол 5×5',
  kind: 'football',
  area: 'Приморский',
  startsAt: '2026-07-09T16:00:00Z',
  totalSpots: 10,
  status: 'scheduled',
  visibility: 'group_only',
  createdAt: '2026-07-01T00:00:00Z',
  ...over,
});

const claim = (over: Partial<SlotClaim> = {}): SlotClaim => ({
  id: 'c1',
  activityId: 'a1',
  userId: 'u1',
  status: 'going',
  source: 'member',
  createdAt: '2026-07-02T00:00:00Z',
  ...over,
});

describe('spotsTaken / spotsRemaining (ACT-001)', () => {
  it('counts only going + attended as occupying a spot', () => {
    const claims = [
      claim({ id: 'c1', userId: 'u1', status: 'going' }),
      claim({ id: 'c2', userId: 'u2', status: 'attended' }),
      claim({ id: 'c3', userId: 'u3', status: 'cancelled' }),
      claim({ id: 'c4', userId: 'u4', status: 'no_show' }),
    ];
    expect(spotsTaken(claims)).toBe(2);
  });

  it('remaining is total minus taken and never negative', () => {
    const a = activity({ totalSpots: 3 });
    const claims = [
      claim({ id: 'c1', userId: 'u1' }),
      claim({ id: 'c2', userId: 'u2' }),
      claim({ id: 'c3', userId: 'u3' }),
      claim({ id: 'c4', userId: 'u4' }), // over capacity — clamped
    ];
    expect(spotsRemaining(a, claims)).toBe(0);
    expect(isFull(a, claims)).toBe(true);
  });
});

describe('isOpenForClaims (ACT-001)', () => {
  it('is false when cancelled or completed', () => {
    expect(isOpenForClaims(activity({ status: 'cancelled' }), [])).toBe(false);
    expect(isOpenForClaims(activity({ status: 'completed' }), [])).toBe(false);
  });

  it('is false when full, true when space remains', () => {
    const a = activity({ totalSpots: 1 });
    expect(isOpenForClaims(a, [claim()])).toBe(false);
    expect(isOpenForClaims(a, [])).toBe(true);
  });
});

describe('canClaim (ACT-001)', () => {
  it('lets a group member claim when there is space', () => {
    expect(canClaim(activity(), [], 'u9', true)).toEqual({ ok: true });
  });

  it('blocks a second claim from someone already going', () => {
    const claims = [claim({ userId: 'u9', status: 'going' })];
    expect(canClaim(activity(), claims, 'u9', true)).toEqual({
      ok: false,
      reason: 'already_claimed',
    });
  });

  it('blocks an outsider on a group-only activity', () => {
    expect(canClaim(activity({ visibility: 'group_only' }), [], 'stranger', false)).toEqual({
      ok: false,
      reason: 'not_in_overflow',
    });
  });

  it('lets an outsider claim once overflow is open (the pull path)', () => {
    expect(canClaim(activity({ visibility: 'overflow' }), [], 'stranger', false)).toEqual({
      ok: true,
    });
  });

  it('blocks when full', () => {
    const a = activity({ totalSpots: 1, visibility: 'overflow' });
    expect(canClaim(a, [claim()], 'stranger', false)).toEqual({ ok: false, reason: 'full' });
  });

  it('blocks when the activity is closed', () => {
    expect(canClaim(activity({ status: 'cancelled' }), [], 'u9', true)).toEqual({
      ok: false,
      reason: 'closed',
    });
  });
});

describe('pullClaims — the retention/growth signal (ACT-001)', () => {
  it('returns only overflow claims that occupy a spot', () => {
    const claims = [
      claim({ id: 'c1', userId: 'u1', source: 'member', status: 'going' }),
      claim({ id: 'c2', userId: 'u2', source: 'overflow', status: 'going' }),
      claim({ id: 'c3', userId: 'u3', source: 'overflow', status: 'cancelled' }),
      claim({ id: 'c4', userId: 'u4', source: 'overflow', status: 'attended' }),
    ];
    const pull = pullClaims(claims);
    expect(pull.map((c) => c.id)).toEqual(['c2', 'c4']);
  });
});

describe('isSeekingOverflow (ACT-001)', () => {
  it('is true only when scheduled, opened for overflow, and not full', () => {
    expect(isSeekingOverflow(activity({ visibility: 'overflow' }), [])).toBe(true);
    expect(isSeekingOverflow(activity({ visibility: 'group_only' }), [])).toBe(false);
    const full = activity({ visibility: 'overflow', totalSpots: 1 });
    expect(isSeekingOverflow(full, [claim()])).toBe(false);
    expect(isSeekingOverflow(activity({ visibility: 'overflow', status: 'completed' }), [])).toBe(
      false,
    );
  });
});
