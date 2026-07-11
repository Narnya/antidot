// ACT-002 — In-memory mock of ActivitiesRepository. Seeded so screens render and
// the create / claim loop works without a live Supabase project. Replaced by a
// Supabase-backed implementation later (ACT-00X). Not for production.
import type { Activity, Group, GroupMembership, Id, SlotClaim } from '../lib/model';
import { canClaim, isSeekingOverflow, spotsRemaining, spotsTaken } from '../lib/slots';
import type {
  ActivitiesRepository,
  ActivityView,
  CircleView,
  CreateActivityInput,
  CreateCircleInput,
  CreateReportInput,
  MemberCandidate,
} from './repository';

/** The signed-in user in mock mode (screens read this until real auth is wired). */
export const MOCK_USER_ID: Id = 'me';

let seq = 1000;
const nextId = (prefix: string): Id => `${prefix}-${(seq += 1)}`;

const groups: Group[] = [
  { id: 'g1', name: 'Четверговый футбол', area: 'Приморский', theme: 'Играем в футбол по четвергам. Свои и друзья друзей.', rhythm: 'weekly', ownerId: 'me', createdAt: '2026-06-01T00:00:00Z' },
  { id: 'g2', name: 'Тихие прогулки', area: 'Центр', theme: null, rhythm: 'biweekly', ownerId: 'u2', createdAt: '2026-06-05T00:00:00Z' },
  { id: 'g3', name: 'Настолки у Ани', area: 'Центр', theme: null, rhythm: 'weekly', ownerId: 'u3', createdAt: '2026-06-10T00:00:00Z' },
  { id: 'g4', name: 'Утренний бег', area: 'Приморский', theme: null, rhythm: 'weekly', ownerId: 'u4', createdAt: '2026-06-12T00:00:00Z' },
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
  // an overflow guest on my football circle (g1) — a member candidate for the host.
  { id: 'c-a1-of', activityId: 'a1', userId: 'guest1', status: 'going', source: 'overflow', createdAt: '2026-07-05T00:00:00Z' },
];

// T3 — in-memory report/block stores (mock).
const reports: CreateReportInput[] = [];
const blocks: { blockerId: Id; blockedId: Id }[] = [];

function isMemberOf(groupId: Id, userId: Id): boolean {
  return memberships.some(
    (m) => m.groupId === groupId && m.userId === userId && m.status === 'active',
  );
}

function claimsFor(activityId: Id): SlotClaim[] {
  return claims.filter((c) => c.activityId === activityId);
}

function toView(activity: Activity, userId: Id): ActivityView {
  const group = groups.find((g) => g.id === activity.groupId);
  if (!group) throw new Error(`group_not_found:${activity.groupId}`);
  const claims = claimsFor(activity.id);
  const mine =
    claims.find((c) => c.userId === userId && (c.status === 'going' || c.status === 'attended')) ??
    null;
  return {
    activity,
    group,
    claims,
    spotsTaken: spotsTaken(claims),
    spotsRemaining: spotsRemaining(activity, claims),
    mine,
  };
}

export class MockActivitiesRepository implements ActivitiesRepository {
  async listMyGroups(userId: Id): Promise<Group[]> {
    return groups.filter((g) => isMemberOf(g.id, userId));
  }

  async createCircle(input: CreateCircleInput): Promise<Group> {
    const group: Group = {
      id: nextId('g'),
      name: input.name,
      area: input.area,
      theme: input.theme,
      rhythm: input.rhythm,
      ownerId: input.ownerId,
      createdAt: new Date().toISOString(),
    };
    groups.push(group);
    memberships.push({
      groupId: group.id,
      userId: input.ownerId,
      role: 'owner',
      status: 'active',
      createdAt: new Date().toISOString(),
    });
    return group;
  }

  async getCircle(circleId: Id, userId: Id): Promise<CircleView | null> {
    const group = groups.find((g) => g.id === circleId);
    if (!group) return null;
    const memberCount = memberships.filter(
      (m) => m.groupId === circleId && m.status === 'active',
    ).length;
    const upcoming = activities
      .filter((a) => a.groupId === circleId && a.status === 'scheduled')
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    const first = upcoming[0];
    return {
      group,
      memberCount,
      isMember: isMemberOf(circleId, userId),
      isOwner: group.ownerId === userId,
      nextActivity: first ? toView(first, userId) : null,
    };
  }

  async listMemberCandidates(circleId: Id): Promise<MemberCandidate[]> {
    const circleActs = new Set(activities.filter((a) => a.groupId === circleId).map((a) => a.id));
    const titleByActivity = new Map(activities.map((a) => [a.id, a.title]));
    const seen = new Set<Id>();
    const out: MemberCandidate[] = [];
    for (const c of claims) {
      if (!circleActs.has(c.activityId)) continue;
      if (c.source !== 'overflow') continue;
      if (c.status !== 'going' && c.status !== 'attended') continue;
      if (isMemberOf(circleId, c.userId) || seen.has(c.userId)) continue;
      seen.add(c.userId);
      out.push({ userId: c.userId, throughActivityTitle: titleByActivity.get(c.activityId) ?? '' });
    }
    return out;
  }

  async confirmMember(circleId: Id, userId: Id): Promise<void> {
    const existing = memberships.find((m) => m.groupId === circleId && m.userId === userId);
    if (existing) {
      existing.status = 'active';
      return;
    }
    memberships.push({
      groupId: circleId,
      userId,
      role: 'member',
      status: 'active',
      createdAt: new Date().toISOString(),
    });
  }

  async createReport(input: CreateReportInput): Promise<void> {
    reports.push(input);
  }

  async blockUser(blockerId: Id, blockedId: Id): Promise<void> {
    if (!blocks.some((b) => b.blockerId === blockerId && b.blockedId === blockedId)) {
      blocks.push({ blockerId, blockedId });
    }
  }

  async listBlockedUserIds(userId: Id): Promise<Id[]> {
    return blocks.filter((b) => b.blockerId === userId).map((b) => b.blockedId);
  }

  async listMyActivities(userId: Id): Promise<ActivityView[]> {
    return activities
      .filter((a) => a.status === 'scheduled' && isMemberOf(a.groupId, userId))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .map((a) => toView(a, userId));
  }

  async listOpenInCity(userId: Id): Promise<ActivityView[]> {
    // Feed / объявления: overflow-open activities from groups the user is NOT in,
    // still upcoming with spots remaining. City-wide (product decision 2026-07).
    return activities
      .filter((a) => !isMemberOf(a.groupId, userId) && isSeekingOverflow(a, claimsFor(a.id)))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .map((a) => toView(a, userId));
  }

  async getActivity(activityId: Id, userId: Id): Promise<ActivityView | null> {
    const activity = activities.find((a) => a.id === activityId);
    return activity ? toView(activity, userId) : null;
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
