-- ACT / RPC — aggregate spot counts for the city feed.
-- Non-members cannot read slot_claims rows (RLS) — but the feed still needs the
-- spot count ("не хватает N"). These security-definer functions return AGGREGATE
-- counts only, never who is going, keeping the feed a list of ACTIVITIES (not a
-- people list). Locked to the `authenticated` role (anon cannot call them).

-- Feed: overflow, scheduled activities from groups the caller is NOT in, each
-- with its taken-spot count and the owning circle's name/area.
create or replace function public.feed_open_activities()
returns table (
  id uuid,
  group_id uuid,
  group_name text,
  area text,
  title text,
  kind text,
  starts_at timestamptz,
  total_spots int,
  spots_taken int
)
language sql
security definer
set search_path = public
stable
as $$
  select
    a.id, a.group_id, g.name, a.area, a.title, a.kind, a.starts_at, a.total_spots,
    (
      select count(*)::int
      from public.slot_claims sc
      where sc.activity_id = a.id and sc.status in ('going', 'attended')
    )
  from public.activities a
  join public.groups g on g.id = a.group_id
  where a.status = 'scheduled'
    and a.visibility = 'overflow'
    and not public.is_group_member(a.group_id)
  order by a.starts_at;
$$;

-- Single activity's taken-spot count (for the detail screen seen by a non-member).
create or replace function public.activity_spots_taken(aid uuid)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int
  from public.slot_claims sc
  where sc.activity_id = aid and sc.status in ('going', 'attended');
$$;

revoke execute on function public.feed_open_activities() from public;
revoke execute on function public.activity_spots_taken(uuid) from public;
grant execute on function public.feed_open_activities() to authenticated;
grant execute on function public.activity_spots_taken(uuid) to authenticated;
