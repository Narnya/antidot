// ACT-007 — Supabase-backed ActivitiesRepository. Same contract as the mock;
// getActivitiesRepository() swaps it in when Supabase is configured. Maps
// snake_case DB columns ↔ the camelCase domain model. Non-member spot counts
// come from the security-definer RPCs (feed_open_activities / activity_spots_taken),
// so raw claim rows are never needed for the feed (RLS would not return them).
import { supabase } from '../../../lib/supabase/client';
import { formatWhen } from '../lib/format';
import type { Activity, Group, Id, SlotClaim } from '../lib/model';
import { spotsRemaining, spotsTaken } from '../lib/slots';
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
  RhythmDay,
  RhythmView,
  UpsertProfileInput,
} from './repository';

type GroupRow = {
  id: string;
  name: string;
  area: string;
  theme: string | null;
  rhythm: Group['rhythm'];
  owner_id: string;
  created_at: string;
};
type ActivityRow = {
  id: string;
  group_id: string;
  created_by: string;
  title: string;
  kind: Activity['kind'];
  area: string;
  starts_at: string;
  total_spots: number;
  status: Activity['status'];
  visibility: Activity['visibility'];
  created_at: string;
};
type ClaimRow = {
  id: string;
  activity_id: string;
  user_id: string;
  status: SlotClaim['status'];
  source: SlotClaim['source'];
  created_at: string;
  plus_one?: boolean;
  note?: string | null;
};
type MessageRow = {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
};
type FeedRow = {
  id: string;
  group_id: string;
  group_name: string;
  area: string;
  title: string;
  kind: Activity['kind'];
  starts_at: string;
  total_spots: number;
  spots_taken: number;
};

const OCCUPYING: ReadonlySet<string> = new Set(['going', 'attended']);

const mapGroup = (r: GroupRow): Group => ({
  id: r.id,
  name: r.name,
  area: r.area,
  theme: r.theme,
  rhythm: r.rhythm,
  ownerId: r.owner_id,
  createdAt: r.created_at,
});

const mapActivity = (r: ActivityRow): Activity => ({
  id: r.id,
  groupId: r.group_id,
  createdBy: r.created_by,
  title: r.title,
  kind: r.kind,
  area: r.area,
  startsAt: r.starts_at,
  totalSpots: r.total_spots,
  status: r.status,
  visibility: r.visibility,
  createdAt: r.created_at,
});

const mapClaim = (r: ClaimRow): SlotClaim => ({
  id: r.id,
  activityId: r.activity_id,
  userId: r.user_id,
  status: r.status,
  source: r.source,
  createdAt: r.created_at,
  plusOne: r.plus_one ?? false,
  note: r.note ?? null,
});

function buildMemberView(
  activity: Activity,
  group: Group,
  claims: SlotClaim[],
  userId: Id,
): ActivityView {
  const mine = claims.find((c) => c.userId === userId && OCCUPYING.has(c.status)) ?? null;
  return {
    activity,
    group,
    claims,
    spotsTaken: spotsTaken(claims),
    spotsRemaining: spotsRemaining(activity, claims),
    mine,
  };
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Local midnight of Monday of the current week. */
function mondayOfCurrentWeek(): Date {
  const now = new Date();
  const monOffset = (now.getDay() + 6) % 7; // 0 = Monday
  const monday = startOfDay(now);
  monday.setDate(monday.getDate() - monOffset);
  return monday;
}

export class SupabaseActivitiesRepository implements ActivitiesRepository {
  async listMyGroups(userId: Id): Promise<Group[]> {
    const { data, error } = await supabase
      .from('group_memberships')
      .select('group:groups(*)')
      .eq('user_id', userId)
      .eq('status', 'active');
    if (error) throw new Error(error.message);
    return ((data ?? []) as unknown as { group: GroupRow | null }[])
      .map((row) => row.group)
      .filter((g): g is GroupRow => g != null)
      .map(mapGroup);
  }

  async listMyCircles(userId: Id): Promise<MyCircle[]> {
    const mine = await this.listMyGroups(userId);
    if (mine.length === 0) return [];
    // Aggregate member counts for the user's circles in one query (no people list).
    const { data: rows, error } = await supabase
      .from('group_memberships')
      .select('group_id')
      .in(
        'group_id',
        mine.map((g) => g.id),
      )
      .eq('status', 'active');
    if (error) throw new Error(error.message);
    const countBy = new Map<string, number>();
    for (const r of (rows ?? []) as { group_id: string }[]) {
      countBy.set(r.group_id, (countBy.get(r.group_id) ?? 0) + 1);
    }
    return mine.map((group) => ({ group, memberCount: countBy.get(group.id) ?? 0 }));
  }

  async createCircle(input: CreateCircleInput): Promise<Group> {
    const { data, error } = await supabase
      .from('groups')
      .insert({
        name: input.name,
        area: input.area,
        theme: input.theme,
        rhythm: input.rhythm,
        owner_id: input.ownerId,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    const group = mapGroup(data as unknown as GroupRow);
    const { error: me } = await supabase
      .from('group_memberships')
      .insert({ group_id: group.id, user_id: input.ownerId, role: 'owner', status: 'active' });
    if (me) throw new Error(me.message);
    return group;
  }

  async getCircle(circleId: Id, userId: Id): Promise<CircleView | null> {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', circleId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const group = mapGroup(data as unknown as GroupRow);

    const { count, error: ce } = await supabase
      .from('group_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', circleId)
      .eq('status', 'active');
    if (ce) throw new Error(ce.message);

    const { data: mineRows, error: mineErr } = await supabase
      .from('group_memberships')
      .select('role')
      .eq('group_id', circleId)
      .eq('user_id', userId)
      .eq('status', 'active');
    if (mineErr) throw new Error(mineErr.message);

    const { data: aData, error: ae } = await supabase
      .from('activities')
      .select('*, slot_claims(*)')
      .eq('group_id', circleId)
      .eq('status', 'scheduled')
      .order('starts_at')
      .limit(1);
    if (ae) throw new Error(ae.message);
    const rows = (aData ?? []) as unknown as (ActivityRow & { slot_claims: ClaimRow[] })[];
    const row = rows[0];
    const nextActivity = row
      ? buildMemberView(mapActivity(row), group, (row.slot_claims ?? []).map(mapClaim), userId)
      : null;

    return {
      group,
      memberCount: count ?? 0,
      isMember: (mineRows ?? []).length > 0,
      isOwner: group.ownerId === userId,
      nextActivity,
    };
  }

  async listMemberCandidates(circleId: Id): Promise<MemberCandidate[]> {
    const { data: acts, error: ae } = await supabase
      .from('activities')
      .select('id, title')
      .eq('group_id', circleId);
    if (ae) throw new Error(ae.message);
    const actRows = (acts ?? []) as unknown as { id: string; title: string }[];
    if (actRows.length === 0) return [];
    const titleById = new Map(actRows.map((a) => [a.id, a.title]));

    const { data: cl, error: ce } = await supabase
      .from('slot_claims')
      .select('user_id, activity_id, plus_one, note')
      .in(
        'activity_id',
        actRows.map((a) => a.id),
      )
      .eq('source', 'overflow')
      .in('status', ['going', 'attended']);
    if (ce) throw new Error(ce.message);
    const claimRows = (cl ?? []) as unknown as {
      user_id: string;
      activity_id: string;
      plus_one: boolean | null;
      note: string | null;
    }[];

    const { data: mem, error: me } = await supabase
      .from('group_memberships')
      .select('user_id')
      .eq('group_id', circleId)
      .eq('status', 'active');
    if (me) throw new Error(me.message);
    const memberSet = new Set(
      ((mem ?? []) as unknown as { user_id: string }[]).map((m) => m.user_id),
    );

    const seen = new Set<string>();
    const out: MemberCandidate[] = [];
    for (const c of claimRows) {
      if (memberSet.has(c.user_id) || seen.has(c.user_id)) continue;
      seen.add(c.user_id);
      out.push({
        userId: c.user_id,
        throughActivityTitle: titleById.get(c.activity_id) ?? '',
        plusOne: c.plus_one ?? false,
        note: c.note ?? null,
      });
    }
    return out;
  }

  async confirmMember(circleId: Id, userId: Id): Promise<void> {
    const { error } = await supabase
      .from('group_memberships')
      .upsert(
        { group_id: circleId, user_id: userId, role: 'member', status: 'active' },
        { onConflict: 'group_id,user_id' },
      );
    if (error) throw new Error(error.message);
  }

  async pauseMembership(circleId: Id, userId: Id): Promise<void> {
    const { error } = await supabase
      .from('group_memberships')
      .update({ status: 'paused' })
      .eq('group_id', circleId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
  }

  async leaveCircle(circleId: Id, userId: Id): Promise<void> {
    const { error } = await supabase
      .from('group_memberships')
      .update({ status: 'left' })
      .eq('group_id', circleId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
  }

  async createReport(input: CreateReportInput): Promise<void> {
    const { error } = await supabase.from('reports').insert({
      reporter_id: input.reporterId,
      subject_type: input.subjectType,
      subject_id: input.subjectId,
      reason: input.reason,
      note: input.note,
    });
    if (error) throw new Error(error.message);
  }

  async blockUser(blockerId: Id, blockedId: Id): Promise<void> {
    const { error } = await supabase
      .from('blocks')
      .upsert(
        { blocker_id: blockerId, blocked_id: blockedId },
        { onConflict: 'blocker_id,blocked_id' },
      );
    if (error) throw new Error(error.message);
  }

  async listBlockedUserIds(userId: Id): Promise<Id[]> {
    const { data, error } = await supabase
      .from('blocks')
      .select('blocked_id')
      .eq('blocker_id', userId);
    if (error) throw new Error(error.message);
    return ((data ?? []) as unknown as { blocked_id: string }[]).map((b) => b.blocked_id);
  }

  async listBlockedProfiles(userId: Id): Promise<Profile[]> {
    const ids = await this.listBlockedUserIds(userId);
    if (ids.length === 0) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, area')
      .in('id', ids);
    if (error) throw new Error(error.message);
    const byId = new Map(
      ((data ?? []) as unknown as { id: string; display_name: string; area: string | null }[]).map(
        (r) => [r.id, r] as const,
      ),
    );
    // One entry per blocked id, even if the user has no profile row.
    return ids.map((id) => {
      const r = byId.get(id);
      return { userId: id, displayName: r?.display_name ?? 'Пользователь', area: r?.area ?? null };
    });
  }

  async unblockUser(blockerId: Id, blockedId: Id): Promise<void> {
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId);
    if (error) throw new Error(error.message);
  }

  async deleteAccount(): Promise<void> {
    // Server-side cascade delete via a security-definer RPC (deletes auth.uid()'s
    // own row). No service role on the client (Инв. 12). Caller signs out after.
    const { error } = await supabase.rpc('delete_own_account');
    if (error) throw new Error(error.message);
  }

  async getProfile(userId: Id): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, area, bio, interests')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const r = data as unknown as {
      id: string;
      display_name: string;
      area: string | null;
      bio: string | null;
      interests: string[] | null;
    };
    return {
      userId: r.id,
      displayName: r.display_name,
      area: r.area,
      bio: r.bio,
      interests: r.interests ?? [],
    };
  }

  async upsertProfile(input: UpsertProfileInput): Promise<void> {
    const payload: Record<string, unknown> = {
      id: input.userId,
      display_name: input.displayName,
      area: input.area,
      updated_at: new Date().toISOString(),
    };
    // Only overwrite interests when the caller supplied them (onboarding does), so a
    // name/area-only update never clears the existing chips.
    if (input.interests !== undefined) payload.interests = input.interests;
    const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
    if (error) throw new Error(error.message);
  }

  async listMyActivities(userId: Id): Promise<ActivityView[]> {
    const groups = await this.listMyGroups(userId);
    if (groups.length === 0) return [];
    const groupById = new Map(groups.map((g) => [g.id, g]));
    const { data, error } = await supabase
      .from('activities')
      .select('*, slot_claims(*)')
      .in(
        'group_id',
        groups.map((g) => g.id),
      )
      .eq('status', 'scheduled')
      .order('starts_at');
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as unknown as (ActivityRow & { slot_claims: ClaimRow[] })[];
    const views: ActivityView[] = [];
    for (const row of rows) {
      const activity = mapActivity(row);
      const group = groupById.get(activity.groupId);
      if (!group) continue;
      views.push(buildMemberView(activity, group, (row.slot_claims ?? []).map(mapClaim), userId));
    }
    return views;
  }

  async getCircleChat(circleId: Id, userId: Id): Promise<CircleChatView | null> {
    // Member-gated: getCircle returns null / isMember=false for non-members, and RLS
    // on circle_messages independently blocks the rows (Инв. 2 — chat is member-only).
    const cv = await this.getCircle(circleId, userId);
    if (!cv || !cv.isMember) return null;

    const { data, error } = await supabase
      .from('circle_messages')
      .select('id, author_id, body, created_at')
      .eq('group_id', circleId)
      .order('created_at', { ascending: true })
      .limit(200);
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as unknown as MessageRow[];

    // Resolve author display names for others' messages in one batch.
    const otherIds = [...new Set(rows.map((r) => r.author_id).filter((id) => id !== userId))];
    const names = new Map<string, string | null>();
    if (otherIds.length > 0) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', otherIds);
      for (const p of (profs ?? []) as unknown as { id: string; display_name: string }[]) {
        names.set(p.id, p.display_name);
      }
    }

    const messages: ChatMessage[] = rows.map((r) => ({
      id: r.id,
      kind: 'msg',
      mine: r.author_id === userId,
      authorName: r.author_id === userId ? null : (names.get(r.author_id) ?? 'Участник'),
      text: r.body,
    }));

    // Pinned meeting — reveal-safe (Инв. 1): the EXACT place is shown only if RLS
    // reveals it (the viewer has an active claim / is a member within the window);
    // otherwise just time + area with a nudge to claim a slot. getMeetingLocation is
    // gated by auth.uid() server-side, so a member who hasn't claimed sees no address.
    let pinned: CircleChatView['pinned'] = null;
    if (cv.nextActivity) {
      const na = cv.nextActivity.activity;
      const place = await this.getMeetingLocation(na.id);
      pinned = {
        title: `Встреча ${formatWhen(na.startsAt)}`,
        detail: place ?? `${na.area} · займи слот, чтобы увидеть место`,
      };
    }
    return { name: cv.group.name, memberCount: cv.memberCount, pinned, messages };
  }

  async sendCircleMessage(circleId: Id, userId: Id, text: string): Promise<void> {
    const body = text.trim();
    if (body.length === 0) return;
    const { error } = await supabase
      .from('circle_messages')
      .insert({ group_id: circleId, author_id: userId, body });
    if (error) throw new Error(error.message);
  }

  subscribeCircleChat(circleId: Id, onChange: () => void): () => void {
    const channel = supabase
      .channel(`circle_messages:${circleId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'circle_messages', filter: `group_id=eq.${circleId}` },
        () => onChange(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }

  async getRhythm(userId: Id): Promise<RhythmView> {
    // First live cut: mark days in the current week that have an upcoming activity
    // as `planned`. Attendance-backed `attended` days, the streak count, and the
    // recently-attended list need the attendance data (T5) wired up — until then
    // they degrade to empty (no fabricated streak; soft-tone product decision).
    const week: RhythmDay[] = ['none', 'none', 'none', 'none', 'none', 'none', 'none'];
    try {
      const upcoming = await this.listMyActivities(userId);
      const monday = mondayOfCurrentWeek();
      for (const v of upcoming) {
        const d = new Date(v.activity.startsAt);
        const idx = Math.floor((startOfDay(d).getTime() - monday.getTime()) / 86_400_000);
        if (idx >= 0 && idx < 7) week[idx] = 'planned';
      }
    } catch {
      // leave the week empty on a transient failure
    }
    return { streakWeeks: 0, week, recent: [] };
  }

  async listNotifications(userId: Id): Promise<NotificationItem[]> {
    // Live events derived from existing data (no notifications table yet). All are
    // the user's OWN events — never another member's transitions (Инв. 11–12), and
    // the place opens only where RLS reveals it (Инв. 1).
    const out: NotificationItem[] = [];

    // «Тебя приняли в круг» — active non-owner memberships (you were host-confirmed).
    const { data: mem, error: me } = await supabase
      .from('group_memberships')
      .select('group_id, group:groups(name)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .eq('role', 'member')
      .order('created_at', { ascending: false });
    if (me) throw new Error(me.message);
    for (const m of (mem ?? []) as unknown as { group_id: string; group: { name: string } | null }[]) {
      if (!m.group) continue;
      out.push({
        id: `confirmed-${m.group_id}`,
        kind: 'member_confirmed',
        title: 'Тебя приняли в круг',
        detail: `«${m.group.name}» · участие подтверждено`,
        href: `/circle/${m.group_id}`,
      });
    }

    // «Место встречи открыто» — my active claims whose EXACT place RLS reveals.
    const { data: cl, error: ce } = await supabase
      .from('slot_claims')
      .select('activity_id, activity:activities(title)')
      .eq('user_id', userId)
      .in('status', ['going', 'attended']);
    if (ce) throw new Error(ce.message);
    const claimRows = (cl ?? []) as unknown as {
      activity_id: string;
      activity: { title: string } | null;
    }[];
    if (claimRows.length > 0) {
      const { data: locs, error: le } = await supabase
        .from('meeting_locations')
        .select('activity_id')
        .in(
          'activity_id',
          claimRows.map((c) => c.activity_id),
        );
      if (le) throw new Error(le.message);
      const revealed = new Set(
        ((locs ?? []) as unknown as { activity_id: string }[]).map((l) => l.activity_id),
      );
      for (const c of claimRows) {
        if (!revealed.has(c.activity_id)) continue;
        out.push({
          id: `location-${c.activity_id}`,
          kind: 'location_open',
          title: 'Место встречи открыто',
          detail: c.activity ? `${c.activity.title} · ты занял слот` : 'Ты занял слот',
          href: `/activity/${c.activity_id}`,
        });
      }
    }

    // Reminders — upcoming activities from your circles.
    const upcoming = await this.listMyActivities(userId);
    for (const v of upcoming) {
      out.push({
        id: `reminder-${v.activity.id}`,
        kind: 'reminder',
        title: 'Напоминание о встрече',
        detail: `${v.activity.title} · ${formatWhen(v.activity.startsAt)}`,
        href: `/activity/${v.activity.id}`,
      });
    }

    return out;
  }

  async listOpenInCity(userId: Id): Promise<ActivityView[]> {
    const { data, error } = await supabase.rpc('feed_open_activities');
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as unknown as FeedRow[];
    if (rows.length === 0) return [];
    const mineByActivity = await this.myClaimsByActivity(
      rows.map((r) => r.id),
      userId,
    );
    return rows.map((r) => {
      const activity: Activity = {
        id: r.id,
        groupId: r.group_id,
        createdBy: '',
        title: r.title,
        kind: r.kind,
        area: r.area,
        startsAt: r.starts_at,
        totalSpots: r.total_spots,
        status: 'scheduled',
        visibility: 'overflow',
        createdAt: '',
      };
      const group: Group = {
        id: r.group_id,
        name: r.group_name,
        area: r.area,
        theme: null,
        rhythm: 'weekly',
        ownerId: '',
        createdAt: '',
      };
      return {
        activity,
        group,
        claims: [],
        spotsTaken: r.spots_taken,
        spotsRemaining: Math.max(0, r.total_spots - r.spots_taken),
        mine: mineByActivity.get(r.id) ?? null,
      };
    });
  }

  async getActivity(activityId: Id, userId: Id): Promise<ActivityView | null> {
    const { data, error } = await supabase
      .from('activities')
      .select('*, group:groups(*), slot_claims(*)')
      .eq('id', activityId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    const row = data as unknown as ActivityRow & { group: GroupRow; slot_claims: ClaimRow[] };
    const activity = mapActivity(row);
    const group = mapGroup(row.group);
    const claims = (row.slot_claims ?? []).map(mapClaim);
    // Authoritative count from the RPC (works for members and non-members alike).
    const { data: takenData, error: te } = await supabase.rpc('activity_spots_taken', {
      aid: activityId,
    });
    if (te) throw new Error(te.message);
    const taken = (takenData as number | null) ?? 0;
    const mine = claims.find((c) => c.userId === userId && OCCUPYING.has(c.status)) ?? null;
    return {
      activity,
      group,
      claims,
      spotsTaken: taken,
      spotsRemaining: Math.max(0, activity.totalSpots - taken),
      mine,
    };
  }

  async createActivity(input: CreateActivityInput): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .insert({
        group_id: input.groupId,
        created_by: input.createdBy,
        title: input.title,
        kind: input.kind,
        area: input.area,
        starts_at: input.startsAt,
        total_spots: input.totalSpots,
        status: 'scheduled',
        visibility: input.overflow ? 'overflow' : 'group_only',
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    const activity = mapActivity(data as unknown as ActivityRow);
    const exact = input.exactLocation?.trim();
    if (exact) {
      const { error: le } = await supabase
        .from('meeting_locations')
        .insert({ activity_id: activity.id, exact_location: exact, created_by: input.createdBy });
      if (le) throw new Error(le.message);
    }
    return activity;
  }

  async getMeetingLocation(activityId: Id): Promise<string | null> {
    // RLS decides visibility (claimant or host) from auth.uid(); a hidden / unset
    // location returns no row. The caller id is unused here — RLS is the gate.
    const { data, error } = await supabase
      .from('meeting_locations')
      .select('exact_location')
      .eq('activity_id', activityId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return (data as unknown as { exact_location: string }).exact_location;
  }

  async setMeetingLocation(activityId: Id, userId: Id, location: string): Promise<void> {
    const { error } = await supabase.from('meeting_locations').upsert(
      {
        activity_id: activityId,
        exact_location: location.trim(),
        created_by: userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'activity_id' },
    );
    if (error) throw new Error(error.message);
  }

  async listClaimants(activityId: Id): Promise<AttendanceEntry[]> {
    // Host reads the full roster (RLS allows it as a group member); non-hosts get
    // an empty set because the host UI is the only caller and RLS blocks the writes.
    const { data, error } = await supabase
      .from('slot_claims')
      .select('user_id, status, source')
      .eq('activity_id', activityId)
      .neq('status', 'cancelled')
      .order('created_at');
    if (error) throw new Error(error.message);
    const rows = (data ?? []) as unknown as {
      user_id: string;
      status: SlotClaim['status'];
      source: SlotClaim['source'];
    }[];
    if (rows.length === 0) return [];
    const names = await this.displayNamesByIds(rows.map((r) => r.user_id));
    return rows.map((r) => ({
      userId: r.user_id,
      displayName: names.get(r.user_id) ?? null,
      status: r.status,
      source: r.source,
    }));
  }

  async markAttendance(activityId: Id, claimantId: Id, status: AttendanceMark): Promise<void> {
    // Host authority is enforced by the slot_claims_host_update RLS policy.
    const { error } = await supabase
      .from('slot_claims')
      .update({ status })
      .eq('activity_id', activityId)
      .eq('user_id', claimantId);
    if (error) throw new Error(error.message);
  }

  async getPullMetrics(userId: Id): Promise<PullMetrics> {
    const empty: PullMetrics = {
      overflowClaims: 0,
      memberClaims: 0,
      activitiesWithPull: 0,
      pullUsers: 0,
    };
    const groups = await this.listMyGroups(userId);
    if (groups.length === 0) return empty;
    const { data: acts, error: ae } = await supabase
      .from('activities')
      .select('id')
      .in(
        'group_id',
        groups.map((g) => g.id),
      );
    if (ae) throw new Error(ae.message);
    const activityIds = ((acts ?? []) as unknown as { id: string }[]).map((a) => a.id);
    if (activityIds.length === 0) return empty;
    // RLS returns these rows because the caller is a member of the owning groups.
    const { data: cl, error: ce } = await supabase
      .from('slot_claims')
      .select('activity_id, user_id, source')
      .in('activity_id', activityIds)
      .in('status', ['going', 'attended']);
    if (ce) throw new Error(ce.message);
    const rows = (cl ?? []) as unknown as {
      activity_id: string;
      user_id: string;
      source: SlotClaim['source'];
    }[];
    const pullActivities = new Set<string>();
    const pullUsers = new Set<string>();
    let overflowClaims = 0;
    let memberClaims = 0;
    for (const r of rows) {
      if (r.source === 'overflow') {
        overflowClaims += 1;
        pullActivities.add(r.activity_id);
        pullUsers.add(r.user_id);
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
    const { data: aRow, error: ae } = await supabase
      .from('activities')
      .select('group_id')
      .eq('id', activityId)
      .single();
    if (ae) throw new Error(ae.message);
    const groupId = (aRow as unknown as { group_id: string }).group_id;

    const { data: mRows, error: me } = await supabase
      .from('group_memberships')
      .select('user_id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .eq('status', 'active');
    if (me) throw new Error(me.message);
    const source: SlotClaim['source'] = (mRows ?? []).length > 0 ? 'member' : 'overflow';

    const { data, error } = await supabase
      .from('slot_claims')
      .upsert(
        {
          activity_id: activityId,
          user_id: userId,
          status: 'going',
          source,
          plus_one: opts?.plusOne ?? false,
          note: opts?.note ?? null,
        },
        { onConflict: 'activity_id,user_id' },
      )
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return mapClaim(data as unknown as ClaimRow);
  }

  async cancelClaim(activityId: Id, userId: Id): Promise<void> {
    const { error } = await supabase
      .from('slot_claims')
      .update({ status: 'cancelled' })
      .eq('activity_id', activityId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
  }

  private async displayNamesByIds(userIds: Id[]): Promise<Map<Id, string>> {
    const unique = [...new Set(userIds)];
    if (unique.length === 0) return new Map();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', unique);
    if (error) throw new Error(error.message);
    const byId = new Map<Id, string>();
    for (const row of (data ?? []) as unknown as { id: string; display_name: string }[]) {
      byId.set(row.id, row.display_name);
    }
    return byId;
  }

  private async myClaimsByActivity(activityIds: Id[], userId: Id): Promise<Map<Id, SlotClaim>> {
    const { data, error } = await supabase
      .from('slot_claims')
      .select('*')
      .in('activity_id', activityIds)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    const byActivity = new Map<Id, SlotClaim>();
    for (const row of (data ?? []) as unknown as ClaimRow[]) {
      const claim = mapClaim(row);
      if (OCCUPYING.has(claim.status)) byActivity.set(claim.activityId, claim);
    }
    return byActivity;
  }
}

export const supabaseActivitiesRepository: ActivitiesRepository =
  new SupabaseActivitiesRepository();
