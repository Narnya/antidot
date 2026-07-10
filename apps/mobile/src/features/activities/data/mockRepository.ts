// ACT-002 — In-memory mock of ActivitiesRepository. Seeded so screens render and
// the create / claim loop works without a live Supabase project. Replaced by a
// Supabase-backed implementation later (ACT-00X). Not for production.
import type { Activity, Group, GroupMembership, Id, SlotClaim } from '../lib/model';
import { canClaim, isSeekingOverflow } from '../lib/slots';
import type { ActivitiesRepository, ActivityView, CreateActivityInput } from './repository';

/** The signed-in user in mock mode (screens read this until real auth is wired). */
export const MOCK_USER_ID: Id = 'me';

let seq = 1000;
const nextId = (prefix: string): Id => `${prefix}-${(seq += 1)}`;

const groups: Group[] = [
  { id: 'g1', name: 'Четверговый футбол', area: 'Приморский', ownerId: 'me', createdAt: '2026-06-01T00:00:00Z' },
  { id: 'g2', name: 'Тихие прогулки', area: 'Центр', ownerId: 'u2', createdAt: '2026-06-05T00:00:00Z' },
  { id: 'g3', name: 'Настолки у Ани', area: 'Центр', ownerId: 'u3', createdAt: '2026-06-10T00:00:00Z' },
  { id: 'g4', name: 'Утренний бег', area: 'Приморский', ownerId: 'u4', createdAt: '2026-06-12T00:00:00Z' },
];

const memberships: GroupMembership[] = [
  { groupId: 'g1', userId: 'me', role: 'owner', status: 'active', createdAt: '2026-06-01T00:00:00Z' },
  { groupId: 'g2', userId: 'me', role: 'member', status: 'active', createdAt: '2026-06-06T00:00:00Z' },
  { groupId: 'g3', userId: 'u3', role: 'owner', status: 'active', createdAt: '2026-06-10T00:00:00Z' },
  { groupId: 'g4', userId: 'u4', role: 'owner', status: 'active', createdAt: '2026-06-12T00:00:00Z' },
];

const activities: Activity[] = [
  { id: 'a1', groupId: 'g1', createdBy: 'me', title: 'Футбол 5×5', kind: 'football', area: 'Приморский', startsAt: '2026-07-09T16:00:00Z', totalSpots: 10, status: 'scheduled', visibility: 'overflow', createdAt: '2026-07-01T00:00:00Z' },
  { id: 'a2', groupId: 'g2', createdBy: 'u2', title: 'Вечерняя прогулка', kind: 'walk', area: 'Центр', startsAt: '2026-07-11T15:00:00Z', totalSpots: 8, status: 'scheduled', visibility: 'group_only', createdAt: '2026-07-02T00:00:00Z' },
  { id: 'a3', groupId: 'g3', createdBy: 'u3', title: 'Настолки: Каркассон', kind: 'boardgames', area: 'Центр', startsAt: '2026-07-10T17:00:00Z', totalSpots: 6, status: 'scheduled', visibility: 'overflow', createdAt: '2026-07-03T00:00:00Z' },
  { id: 'a4', groupId: 'g4', createdBy: 'u4', title: 'Пробежка 5 км', kind: 'run', area: 'Приморский', startsAt: '2026-07-08T05:30:00Z', totalSpots: 12, status: 'scheduled', visibility: 'overflow', createdAt: '2026-07-04T00:00:00Z' },
];

const claims: SlotClaim[] = [
  // a1 (my football): 7 going, needs 3 more.
  ...['me', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6'].map((u, i) => ({
    id: `c-a1-${i}`,
    activityId: 'a1',
    userId: u,
    status: 'going' as const,
    source: 'member' as const,
    createdAt: '2026-07-02T00:00:00Z',
  })),
  // a3 (boardgames): 3 members + 1 overflow (a real pull signal), needs 2 more.
  ...['q1', 'q2', 'q3'].map((u, i) => ({
    id: `c-a3-${i}`,
    activityId: 'a3',
    userId: u,
    status: 'going' as const,
    source: 'member' as const,
    createdAt: '2026-07-04T00:00:00Z',
  })),
  { id: 'c-a3-of', activityId: 'a3', userId: 'x1', status: 'going', source: 'overflow', createdAt: '2026-07-05T00:00:00Z' },
];

function isMemberOf(groupId: Id, userId: Id): boolean {
  return memberships.some(
    (m) => m.groupId === groupId && m.userId === userId && m.status === 'active',
  );
}

function claimsFor(activityId: Id): SlotClaim[] {
  return claims.filter((c) => c.activityId === activityId);
}

function toView(activity: Activity): ActivityView {
  const group = groups.find((g) => g.id === activity.groupId);
  if (!group) throw new Error(`group_not_found:${activity.groupId}`);
  return { activity, group, claims: claimsFor(activity.id) };
}

export class MockActivitiesRepository implements ActivitiesRepository {
  async listMyGroups(userId: Id): Promise<Group[]> {
    return groups.filter((g) => isMemberOf(g.id, userId));
  }

  async listMyActivities(userId: Id): Promise<ActivityView[]> {
    return activities
      .filter((a) => a.status === 'scheduled' && isMemberOf(a.groupId, userId))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .map(toView);
  }

  async listOpenInCity(userId: Id): Promise<ActivityView[]> {
    // Feed / объявления: overflow-open activities from groups the user is NOT in,
    // still upcoming with spots remaining. City-wide (product decision 2026-07).
    return activities
      .filter((a) => !isMemberOf(a.groupId, userId))
      .map(toView)
      .filter((v) => isSeekingOverflow(v.activity, v.claims))
      .sort((a, b) => a.activity.startsAt.localeCompare(b.activity.startsAt));
  }

  async getActivity(activityId: Id): Promise<ActivityView | null> {
    const activity = activities.find((a) => a.id === activityId);
    return activity ? toView(activity) : null;
  }

  async createActivity(input: CreateActivityInput): Promise<Activity> {
    const activity: Activity = {
      id: nextId('a'),
      groupId: input.groupId,
      createdBy: input.createdBy,
      title: input.title,
      kind: input.kind,
      area: input.area,
      startsAt: input.startsAt,
      totalSpots: input.totalSpots,
      status: 'scheduled',
      visibility: input.overflow ? 'overflow' : 'group_only',
      createdAt: new Date().toISOString(),
    };
    activities.push(activity);
    return activity;
  }

  async claimSlot(activityId: Id, userId: Id): Promise<SlotClaim> {
    const activity = activities.find((a) => a.id === activityId);
    if (!activity) throw new Error('activity_not_found');

    const isMember = isMemberOf(activity.groupId, userId);
    const eligibility = canClaim(activity, claimsFor(activityId), userId, isMember);
    if (!eligibility.ok) throw new Error(`cannot_claim:${eligibility.reason}`);

    const existing = claims.find((c) => c.activityId === activityId && c.userId === userId);
    if (existing) {
      existing.status = 'going';
      return existing;
    }
    const slot: SlotClaim = {
      id: nextId('c'),
      activityId,
      userId,
      status: 'going',
      source: isMember ? 'member' : 'overflow',
      createdAt: new Date().toISOString(),
    };
    claims.push(slot);
    return slot;
  }

  async cancelClaim(activityId: Id, userId: Id): Promise<void> {
    const existing = claims.find((c) => c.activityId === activityId && c.userId === userId);
    if (existing) existing.status = 'cancelled';
  }
}

export const mockActivitiesRepository: ActivitiesRepository = new MockActivitiesRepository();
