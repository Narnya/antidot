// ACT-007 — Supabase-backed ActivitiesRepository. Same contract as the mock;
// getActivitiesRepository() swaps it in when Supabase is configured. Maps
// snake_case DB columns ↔ the camelCase domain model. Non-member spot counts
// come from the security-definer RPCs (feed_open_activities / activity_spots_taken),
// so raw claim rows are never needed for the feed (RLS would not return them).
import { supabase } from '../../../lib/supabase/client';
import type { Activity, Group, Id, SlotClaim } from '../lib/model';
import { spotsRemaining, spotsTaken } from '../lib/slots';
import type {
  ActivitiesRepository,
  ActivityView,
  CircleView,
  CreateActivityInput,
  CreateCircleInput,
  CreateReportInput,
  MemberCandidate,
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
      .select('user_id, activity_id')
      .in(
        'activity_id',
        actRows.map((a) => a.id),
      )
      .eq('source', 'overflow')
      .in('status', ['going', 'attended']);
    if (ce) throw new Error(ce.message);
    const claimRows = (cl ?? []) as unknown as { user_id: string; activity_id: string }[];

    const { data: mem, error: me } = await supabase
      .from('group_memberships')
      .select('user_id')
      .eq('group_id', circleId)
      .eq('status', 'active');
    if (me) throw new Error(me.message);
    const memberSet = new Set(((mem ?? []) as unknown as { user_id: string }[]).map((m) => m.user_id));

    const seen = new Set<string>();
    const out: MemberCandidate[] = [];
    for (const c of claimRows) {
      if (memberSet.has(c.user_id) || seen.has(c.user_id)) continue;
      seen.add(c.user_id);
      out.push({ userId: c.user_id, throughActivityTitle: titleById.get(c.activity_id) ?? '' });
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
    return mapActivity(data as unknown as ActivityRow);
  }

  async claimSlot(activityId: Id, userId: Id): Promise<SlotClaim> {
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
        { activity_id: activityId, user_id: userId, status: 'going', source },
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

export const supabaseActivitiesRepository: ActivitiesRepository = new SupabaseActivitiesRepository();
