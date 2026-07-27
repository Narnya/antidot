// ACT-002 — In-memory mock of ActivitiesRepository. Seeded so screens render and
// the create / claim loop works without a live Supabase project. Replaced by a
// Supabase-backed implementation later (ACT-00X). Not for production.
import type { Activity, Group, GroupMembership, Id, SlotClaim } from '../lib/model';
import { canClaim, isSeekingOverflow, spotsRemaining, spotsTaken } from '../lib/slots';
import type {
  ActivitiesRepository,
  ActivityView,
  AttendanceEntry,
  AttendanceMark,
  CircleView,
  CreateActivityInput,
  CreateCircleInput,
  CreateReportInput,
  ChatMessage,
  CircleChatView,
  ClaimOptions,
  MemberCandidate,
  MyCircle,
  NotificationItem,
  Profile,
  PullMetrics,
  RhythmView,
  UpsertProfileInput,
} from './repository';

/** The signed-in user in mock mode (screens read this until real auth is wired). */
export const MOCK_USER_ID: Id = 'me';

let seq = 1000;
const nextId = (prefix: string): Id => `${prefix}-${(seq += 1)}`;

const groups: Group[] = [
  {
    id: 'g1',
    name: 'Четверговый футбол',
    area: 'Приморский',
    theme: 'Играем в футбол по четвергам. Свои и друзья друзей.',
    rhythm: 'weekly',
    ownerId: 'me',
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'g2',
    name: 'Тихие прогулки',
    area: 'Центр',
    theme: null,
    rhythm: 'biweekly',
    ownerId: 'u2',
    createdAt: '2026-06-05T00:00:00Z',
  },
  {
    id: 'g3',
    name: 'Настолки у Ани',
    area: 'Центр',
    theme: null,
    rhythm: 'weekly',
    ownerId: 'u3',
    createdAt: '2026-06-10T00:00:00Z',
  },
  {
    id: 'g4',
    name: 'Утренний бег',
    area: 'Приморский',
    theme: null,
    rhythm: 'weekly',
    ownerId: 'u4',
    createdAt: '2026-06-12T00:00:00Z',
  },
];

const memberships: GroupMembership[] = [
  {
    groupId: 'g1',
    userId: 'me',
    role: 'owner',
    status: 'active',
    createdAt: '2026-06-01T00:00:00Z',
  },
  {
    groupId: 'g2',
    userId: 'me',
    role: 'member',
    status: 'active',
    createdAt: '2026-06-06T00:00:00Z',
  },
  {
    groupId: 'g3',
    userId: 'u3',
    role: 'owner',
    status: 'active',
    createdAt: '2026-06-10T00:00:00Z',
  },
  {
    groupId: 'g4',
    userId: 'u4',
    role: 'owner',
    status: 'active',
    createdAt: '2026-06-12T00:00:00Z',
  },
];

const activities: Activity[] = [
  {
    id: 'a1',
    groupId: 'g1',
    createdBy: 'me',
    title: 'Футбол 5×5',
    kind: 'football',
    area: 'Приморский',
    startsAt: '2026-07-09T16:00:00Z',
    totalSpots: 10,
    status: 'scheduled',
    visibility: 'overflow',
    createdAt: '2026-07-01T00:00:00Z',
  },
  {
    id: 'a2',
    groupId: 'g2',
    createdBy: 'u2',
    title: 'Вечерняя прогулка',
    kind: 'walk',
    area: 'Центр',
    startsAt: '2026-07-11T15:00:00Z',
    totalSpots: 8,
    status: 'scheduled',
    visibility: 'group_only',
    createdAt: '2026-07-02T00:00:00Z',
  },
  {
    id: 'a3',
    groupId: 'g3',
    createdBy: 'u3',
    title: 'Настолки: Каркассон',
    kind: 'boardgames',
    area: 'Центр',
    startsAt: '2026-07-10T17:00:00Z',
    totalSpots: 6,
    status: 'scheduled',
    visibility: 'overflow',
    createdAt: '2026-07-03T00:00:00Z',
  },
  {
    id: 'a4',
    groupId: 'g4',
    createdBy: 'u4',
    title: 'Пробежка 5 км',
    kind: 'run',
    area: 'Приморский',
    startsAt: '2026-07-08T05:30:00Z',
    totalSpots: 12,
    status: 'scheduled',
    visibility: 'overflow',
    createdAt: '2026-07-04T00:00:00Z',
  },
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
  {
    id: 'c-a3-of',
    activityId: 'a3',
    userId: 'x1',
    status: 'going',
    source: 'overflow',
    createdAt: '2026-07-05T00:00:00Z',
  },
  // Overflow guests on my football circle (g1) — member candidates for the host,
  // carrying the +1 / note they gave on «Занять место» (frame C → shown in M).
  {
    id: 'c-a1-of',
    activityId: 'a1',
    userId: 'guest1',
    status: 'going',
    source: 'overflow',
    createdAt: '2026-07-05T00:00:00Z',
    note: 'Играю справа',
  },
  {
    id: 'c-a1-of2',
    activityId: 'a1',
    userId: 'guest2',
    status: 'going',
    source: 'overflow',
    createdAt: '2026-07-05T00:00:00Z',
    plusOne: true,
  },
];

// T3 — in-memory report/block stores (mock).
const reports: CreateReportInput[] = [];
const blocks: { blockerId: Id; blockedId: Id }[] = [];

// Preview-only unread bell count: starts non-zero to show the badge, clears when the
// notifications screen is opened (markNotificationsRead). Live uses the real table.
let mockUnread = 3;

// T4 — in-memory profiles (mock).
// Illustrative circle chat threads (mockup frame L), keyed by circle. «Состав круга
// обновился» is the only membership-transition signal we ever surface (Инв. 11–12).
// Sends append here so the preview persists them in-session.
const chatMessages: Record<Id, ChatMessage[]> = {
  g1: [
    { id: 'm1', kind: 'system', text: 'Аня открыла места городу' },
    {
      id: 'm2',
      kind: 'msg',
      authorName: 'Аня',
      text: 'Всем привет! Сегодня как обычно, приходим к 18:50 размяться 🙌',
    },
    { id: 'm3', kind: 'msg', authorName: 'Кирилл', text: 'Буду. Мяч свой брать?' },
    { id: 'm4', kind: 'msg', mine: true, text: 'Я в деле, форма есть 👟' },
    { id: 'm5', kind: 'system', text: 'Состав круга обновился' },
  ],
};

const profiles: Profile[] = [
  {
    userId: 'me',
    displayName: 'Рафаэль',
    area: 'Санкт-Петербург · Приморский',
    bio: 'Играю по четвергам, люблю настолки и утренний бег вдоль залива.',
    interests: ['Спорт', 'Настолки', 'Бег'],
    stats: { circles: 2, meetings: 14, rhythmWeeks: 6 },
  },
  {
    userId: 'u3',
    displayName: 'Аня',
    area: 'Санкт-Петербург · Приморский',
    bio: 'Организую футбол по четвергам уже год. Всем рада 🙂',
    sharedContext: { activities: 2, circleName: 'Четверговый футбол' },
  },
  { userId: 'guest1', displayName: 'Новый гость', area: null },
];

// T5 — in-memory exact meeting locations (activityId → exact spot). Revealed only
// to claimants / host (mirrors the RLS gate). Seeded for the football activity.
const locations = new Map<Id, string>([['a1', 'Стадион «Волна», у входа с ул. Морской']]);

function isHostOfActivity(activityId: Id, userId: Id): boolean {
  const activity = activities.find((a) => a.id === activityId);
  if (!activity) return false;
  if (activity.createdBy === userId) return true;
  const group = groups.find((g) => g.id === activity.groupId);
  return group?.ownerId === userId;
}

function hasActiveClaim(activityId: Id, userId: Id): boolean {
  return claims.some(
    (c) =>
      c.activityId === activityId &&
      c.userId === userId &&
      (c.status === 'going' || c.status === 'attended'),
  );
}

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

  async listMyCircles(userId: Id): Promise<MyCircle[]> {
    return groups
      .filter((g) => isMemberOf(g.id, userId))
      .map((group) => ({
        group,
        memberCount: memberships.filter((m) => m.groupId === group.id && m.status === 'active')
          .length,
      }));
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

  async getCircleChat(circleId: Id, userId: Id): Promise<CircleChatView | null> {
    const group = groups.find((g) => g.id === circleId);
    if (!group || !isMemberOf(circleId, userId)) return null;
    const memberCount = memberships.filter(
      (m) => m.groupId === circleId && m.status === 'active',
    ).length;
    return {
      name: group.name,
      memberCount,
      pinned:
        circleId === 'g1'
          ? { title: 'Встреча сегодня, 19:00', detail: 'Приморский · ул. Савушкина, поле №2' }
          : null,
      messages: chatMessages[circleId] ?? [],
    };
  }

  async sendCircleMessage(circleId: Id, _userId: Id, text: string): Promise<void> {
    const body = text.trim();
    if (body.length === 0) return;
    (chatMessages[circleId] ??= []).push({ id: nextId('msg'), kind: 'msg', mine: true, text: body });
  }

  subscribeCircleChat(_circleId: Id, _onChange: () => void): () => void {
    // No realtime in mock/preview — the screen reloads after its own send.
    return () => {};
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
      out.push({
        userId: c.userId,
        throughActivityTitle: titleByActivity.get(c.activityId) ?? '',
        plusOne: c.plusOne ?? false,
        note: c.note ?? null,
      });
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

  async pauseMembership(circleId: Id, userId: Id): Promise<void> {
    const m = memberships.find(
      (x) => x.groupId === circleId && x.userId === userId && x.status === 'active',
    );
    if (m) m.status = 'paused';
  }

  async leaveCircle(circleId: Id, userId: Id): Promise<void> {
    const m = memberships.find(
      (x) =>
        x.groupId === circleId &&
        x.userId === userId &&
        (x.status === 'active' || x.status === 'paused'),
    );
    if (m) m.status = 'left';
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

  async listBlockedProfiles(userId: Id): Promise<Profile[]> {
    return blocks
      .filter((b) => b.blockerId === userId)
      .map(
        (b) =>
          profiles.find((p) => p.userId === b.blockedId) ?? {
            userId: b.blockedId,
            displayName: 'Пользователь',
            area: null,
          },
      );
  }

  async unblockUser(blockerId: Id, blockedId: Id): Promise<void> {
    const i = blocks.findIndex((b) => b.blockerId === blockerId && b.blockedId === blockedId);
    if (i >= 0) blocks.splice(i, 1);
  }

  async deleteAccount(userId: Id): Promise<void> {
    // Purge the user's in-memory data (mirrors the live cascade delete).
    const drop = <T>(arr: T[], keep: (x: T) => boolean) => {
      for (let i = arr.length - 1; i >= 0; i -= 1) if (!keep(arr[i] as T)) arr.splice(i, 1);
    };
    const ownedGroups = new Set(groups.filter((g) => g.ownerId === userId).map((g) => g.id));
    drop(activities, (a) => a.createdBy !== userId && !ownedGroups.has(a.groupId));
    drop(claims, (c) => c.userId !== userId);
    drop(memberships, (m) => m.userId !== userId && !ownedGroups.has(m.groupId));
    drop(groups, (g) => g.ownerId !== userId);
    drop(blocks, (b) => b.blockerId !== userId && b.blockedId !== userId);
    drop(profiles, (p) => p.userId !== userId);
    for (const [aid] of locations) if (!activities.some((a) => a.id === aid)) locations.delete(aid);
  }

  async getProfile(userId: Id): Promise<Profile | null> {
    return profiles.find((p) => p.userId === userId) ?? null;
  }

  async upsertProfile(input: UpsertProfileInput): Promise<void> {
    const existing = profiles.find((p) => p.userId === input.userId);
    if (existing) {
      existing.displayName = input.displayName;
      existing.area = input.area;
      if (input.interests) existing.interests = input.interests;
    } else {
      profiles.push({
        userId: input.userId,
        displayName: input.displayName,
        area: input.area,
        interests: input.interests,
      });
    }
  }

  async listMyActivities(userId: Id): Promise<ActivityView[]> {
    return activities
      .filter((a) => a.status === 'scheduled' && isMemberOf(a.groupId, userId))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .map((a) => toView(a, userId));
  }

  async getRhythm(_userId: Id): Promise<RhythmView> {
    // Illustrative rhythm (mockup frame 09): a gentle streak, this-week grid, and
    // recently-attended. Private/self-only — never a public counter (Инв. 10/14).
    return {
      streakWeeks: 6,
      week: ['none', 'planned', 'none', 'attended', 'none', 'none', 'none'],
      recent: [
        { id: 'r1', title: 'Футбол 5×5', when: 'Прошлый четверг · пришёл', icon: 'check' },
        { id: 'r2', title: 'Настолки: Каркассон', when: '2 недели назад · пришёл', icon: 'users' },
      ],
    };
  }

  async listNotifications(_userId: Id): Promise<NotificationItem[]> {
    // Illustrative activity-scoped feed (mockup frame 10). Real events (a guest
    // claimed your slot, host confirmed you) are a follow-up on the live path.
    return [
      {
        id: 'n1',
        kind: 'member_confirmed',
        title: 'Тебя приняли в круг',
        detail: '«Четверговый футбол» · участие подтверждено',
        href: '/circle/g1',
      },
      {
        id: 'n2',
        kind: 'location_open',
        title: 'Место встречи открыто',
        detail: 'Футбол 5×5 · ты занял слот',
        href: '/activity/a1',
      },
      {
        id: 'n3',
        kind: 'reminder',
        title: 'Напоминание',
        detail: 'Сегодня в 19:00 · Футбол 5×5',
        href: '/activity/a1',
      },
      {
        id: 'n4',
        kind: 'chat',
        title: 'Новое в чате круга',
        detail: '«Настолки у Ани» · 3 сообщения',
        href: '/circle/g3',
      },
      {
        id: 'n5',
        kind: 'roster_updated',
        title: 'Состав круга обновился',
        detail: '«Четверговый футбол»',
        href: '/circle/g1',
      },
    ];
  }

  async markNotificationsRead(_userId: Id): Promise<void> {
    mockUnread = 0; // clears the bell badge in the preview once the screen is opened
  }

  async unreadNotificationCount(_userId: Id): Promise<number> {
    return mockUnread;
  }

  subscribeNotifications(_userId: Id, _onChange: () => void): () => void {
    return () => {}; // no realtime in mock/preview
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
    if (input.exactLocation && input.exactLocation.trim().length > 0) {
      locations.set(activity.id, input.exactLocation.trim());
    }
    return activity;
  }

  async getMeetingLocation(activityId: Id, userId: Id): Promise<string | null> {
    if (!isHostOfActivity(activityId, userId) && !hasActiveClaim(activityId, userId)) {
      return null; // mirrors the RLS reveal gate
    }
    return locations.get(activityId) ?? null;
  }

  async setMeetingLocation(activityId: Id, userId: Id, location: string): Promise<void> {
    if (!isHostOfActivity(activityId, userId)) throw new Error('not_host');
    const trimmed = location.trim();
    if (trimmed.length === 0) locations.delete(activityId);
    else locations.set(activityId, trimmed);
  }

  async listClaimants(activityId: Id, userId: Id): Promise<AttendanceEntry[]> {
    if (!isHostOfActivity(activityId, userId)) return [];
    return claims
      .filter((c) => c.activityId === activityId && c.status !== 'cancelled')
      .map((c) => ({
        userId: c.userId,
        displayName: profiles.find((p) => p.userId === c.userId)?.displayName ?? null,
        status: c.status,
        source: c.source,
      }));
  }

  async markAttendance(activityId: Id, claimantId: Id, status: AttendanceMark): Promise<void> {
    // Host authority is implicit in mock mode (only the host UI calls this); RLS
    // enforces it live.
    const claim = claims.find((c) => c.activityId === activityId && c.userId === claimantId);
    if (claim) claim.status = status;
  }

  async getPullMetrics(userId: Id): Promise<PullMetrics> {
    const myGroupIds = new Set(groups.filter((g) => isMemberOf(g.id, userId)).map((g) => g.id));
    const myActivityIds = new Set(
      activities.filter((a) => myGroupIds.has(a.groupId)).map((a) => a.id),
    );
    let overflowClaims = 0;
    let memberClaims = 0;
    const pullActivities = new Set<Id>();
    const pullUsers = new Set<Id>();
    for (const c of claims) {
      if (!myActivityIds.has(c.activityId)) continue;
      if (c.status !== 'going' && c.status !== 'attended') continue;
      if (c.source === 'overflow') {
        overflowClaims += 1;
        pullActivities.add(c.activityId);
        pullUsers.add(c.userId);
      } else {
        memberClaims += 1;
      }
    }
    return {
      overflowClaims,
      memberClaims,
      activitiesWithPull: pullActivities.size,
      pullUsers: pullUsers.size,
    };
  }

  async claimSlot(activityId: Id, userId: Id, opts?: ClaimOptions): Promise<SlotClaim> {
    const activity = activities.find((a) => a.id === activityId);
    if (!activity) throw new Error('activity_not_found');

    const isMember = isMemberOf(activity.groupId, userId);
    const eligibility = canClaim(activity, claimsFor(activityId), userId, isMember);
    if (!eligibility.ok) throw new Error(`cannot_claim:${eligibility.reason}`);

    const existing = claims.find((c) => c.activityId === activityId && c.userId === userId);
    if (existing) {
      existing.status = 'going';
      if (opts?.plusOne !== undefined) existing.plusOne = opts.plusOne;
      if (opts?.note !== undefined) existing.note = opts.note;
      return existing;
    }
    const slot: SlotClaim = {
      id: nextId('c'),
      activityId,
      userId,
      status: 'going',
      source: isMember ? 'member' : 'overflow',
      createdAt: new Date().toISOString(),
      plusOne: opts?.plusOne ?? false,
      note: opts?.note ?? null,
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
