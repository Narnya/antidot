-- ACT / RLSV — Activity-first MVP row-level security (baseline).
-- Source of truth: /docs/30_PRODUCT_DIRECTION_ACTIVITY_FIRST.md.
--
-- ⚠️ NOT verified against a live database. RLS cannot be trusted by eyeballing —
-- this baseline MUST be tested against a real Postgres (positive + negative
-- cases) before it protects real users. It encodes the intended access model;
-- treat it as a reviewable draft, not a proven policy set.
--
-- Access model (MVP, city-wide overflow):
--   groups            SELECT: members, or groups that expose a public overflow
--                             activity. INSERT: self as owner. UPDATE/DELETE: owner.
--   group_memberships SELECT: own rows, or co-members of your groups.
--                             INSERT: self-join. UPDATE/DELETE: owner or self.
--   activities        SELECT: group members (all), or anyone for scheduled
--                             overflow (the city feed). INSERT: a group member as
--                             creator. UPDATE/DELETE: creator or group owner.
--   slot_claims       SELECT: own rows, or group members (the roster).
--                             INSERT: self. UPDATE/DELETE: self.
--   group_links       SELECT: members of either group. writes: owner.
--
-- KNOWN GAP (addressed in step 3): non-members must see only aggregate spot
-- COUNTS for a feed activity, never individual claim rows. Raw slot_claims are
-- restricted to members/claimant here; a security-definer counts RPC will feed
-- the city feed's "не хватает N" without exposing who is going.

-- ── Helpers (security definer → bypass RLS to avoid policy recursion) ──────────
create or replace function public.is_group_member(gid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.group_memberships m
    where m.group_id = gid
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.is_group_owner(gid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.groups g where g.id = gid and g.owner_id = auth.uid()
  );
$$;

create or replace function public.is_member_of_activity_group(aid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.is_group_member((select a.group_id from public.activities a where a.id = aid));
$$;

-- ── groups ────────────────────────────────────────────────────────────────────
create policy groups_select on public.groups
  for select to authenticated
  using (
    public.is_group_member(id)
    or exists (
      select 1 from public.activities a
      where a.group_id = groups.id
        and a.visibility = 'overflow'
        and a.status = 'scheduled'
    )
  );

create policy groups_insert on public.groups
  for insert to authenticated
  with check (owner_id = auth.uid());

create policy groups_update on public.groups
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy groups_delete on public.groups
  for delete to authenticated
  using (owner_id = auth.uid());

-- ── group_memberships ─────────────────────────────────────────────────────────
create policy memberships_select on public.group_memberships
  for select to authenticated
  using (user_id = auth.uid() or public.is_group_member(group_id));

create policy memberships_insert on public.group_memberships
  for insert to authenticated
  with check (user_id = auth.uid() or public.is_group_owner(group_id));

create policy memberships_update on public.group_memberships
  for update to authenticated
  using (user_id = auth.uid() or public.is_group_owner(group_id))
  with check (user_id = auth.uid() or public.is_group_owner(group_id));

create policy memberships_delete on public.group_memberships
  for delete to authenticated
  using (user_id = auth.uid() or public.is_group_owner(group_id));

-- ── group_links (reserved; unused by MVP UI) ──────────────────────────────────
create policy group_links_select on public.group_links
  for select to authenticated
  using (public.is_group_member(group_a_id) or public.is_group_member(group_b_id));

create policy group_links_write on public.group_links
  for all to authenticated
  using (public.is_group_owner(group_a_id) or public.is_group_owner(group_b_id))
  with check (public.is_group_owner(group_a_id) or public.is_group_owner(group_b_id));

-- ── activities ────────────────────────────────────────────────────────────────
create policy activities_select on public.activities
  for select to authenticated
  using (
    public.is_group_member(group_id)
    or (visibility = 'overflow' and status = 'scheduled')
  );

create policy activities_insert on public.activities
  for insert to authenticated
  with check (created_by = auth.uid() and public.is_group_member(group_id));

create policy activities_update on public.activities
  for update to authenticated
  using (created_by = auth.uid() or public.is_group_owner(group_id))
  with check (created_by = auth.uid() or public.is_group_owner(group_id));

create policy activities_delete on public.activities
  for delete to authenticated
  using (created_by = auth.uid() or public.is_group_owner(group_id));

-- ── slot_claims ───────────────────────────────────────────────────────────────
-- Raw rows: claimant + group members only. Non-members get counts via RPC (step 3),
-- never these rows — that keeps the feed aggregate ("не хватает N"), not a people list.
create policy slot_claims_select on public.slot_claims
  for select to authenticated
  using (user_id = auth.uid() or public.is_member_of_activity_group(activity_id));

create policy slot_claims_insert on public.slot_claims
  for insert to authenticated
  with check (user_id = auth.uid());

create policy slot_claims_update on public.slot_claims
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy slot_claims_delete on public.slot_claims
  for delete to authenticated
  using (user_id = auth.uid());
