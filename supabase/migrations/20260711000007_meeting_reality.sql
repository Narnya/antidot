-- ACT / T5 — meeting reality: exact-location reveal (Inv. 1) + attendance.
-- Source of truth: /docs/30_PRODUCT_DIRECTION_ACTIVITY_FIRST.md, /docs/32 §4.2/§5.
--
-- Two pieces:
--   1) meeting_locations — the EXACT meeting point, stored in its OWN table (not a
--      column on `activities`). This is deliberate and security-critical: overflow
--      activity rows are SELECTable city-wide (activities_select), so an exact-location
--      COLUMN would leak the address to every authenticated user. Isolating it here
--      lets RLS reveal it ONLY to users with an active claim on that activity, plus
--      the host — carrying forward Inv. 1 (exact location hidden until claim).
--   2) attendance — slot_claims already models 'going'/'attended'/'no_show'. The host
--      needs to mark it after the meeting (feeds attend→member and the pull signal),
--      but the baseline slot_claims_update policy only allows self-updates. A second
--      permissive UPDATE policy lets the activity's host update claims on that activity.
--
-- RLS is never trusted by eyeballing — apply + test positive/negative on the live DB.

-- ── Helpers (security definer → bypass RLS, avoid policy recursion) ────────────

-- Host of an activity = its creator OR the owner of the owning group.
create or replace function public.is_host_of_activity(aid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.activities a
    where a.id = aid
      and (a.created_by = auth.uid() or public.is_group_owner(a.group_id))
  );
$$;

-- May the caller see the exact meeting location? Anyone with an active claim
-- (going/attended) on the activity, plus the host. NOT mere group members — a
-- member reveals the address by claiming a spot (RSVP), keeping the reveal tied
-- to commitment (Inv. 1; docs/32 §4.2 reveal-on-active-claim decision).
create or replace function public.can_see_meeting_location(aid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    public.is_host_of_activity(aid)
    or exists (
      select 1
      from public.slot_claims sc
      where sc.activity_id = aid
        and sc.user_id = auth.uid()
        and sc.status in ('going', 'attended')
    );
$$;

-- ── meeting_locations (one exact spot per activity) ───────────────────────────
create table public.meeting_locations (
  activity_id uuid primary key references public.activities (id) on delete cascade,
  exact_location text not null check (char_length(exact_location) between 1 and 200),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.meeting_locations enable row level security;

-- Read: only claimants + host (the reveal gate). Non-claimants never see the row.
create policy meeting_locations_select on public.meeting_locations
  for select to authenticated
  using (public.can_see_meeting_location(activity_id));

-- Write: only the host may set / change / clear the location for their activity.
create policy meeting_locations_insert on public.meeting_locations
  for insert to authenticated
  with check (public.is_host_of_activity(activity_id));

create policy meeting_locations_update on public.meeting_locations
  for update to authenticated
  using (public.is_host_of_activity(activity_id))
  with check (public.is_host_of_activity(activity_id));

create policy meeting_locations_delete on public.meeting_locations
  for delete to authenticated
  using (public.is_host_of_activity(activity_id));

-- ── slot_claims: let the host mark attendance ─────────────────────────────────
-- Additive permissive policy — combines with the existing self-only update via OR,
-- so a claim row is updatable by its owner (RSVP / cancel) OR by the activity host
-- (attendance). The host is trusted within their own circle; the app only writes
-- `status` here.
create policy slot_claims_host_update on public.slot_claims
  for update to authenticated
  using (public.is_host_of_activity(activity_id))
  with check (public.is_host_of_activity(activity_id));
