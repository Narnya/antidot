-- FIX (found via a live end-to-end smoke test, 2026-07-27): a circle's OWNER could
-- not SELECT their own group, so createCircle's `insert(group).select()` (INSERT …
-- RETURNING) failed RLS — a brand-new group has no membership row yet, so
-- is_group_member(id) is false at creation time, and the SELECT policy the RETURNING
-- must satisfy rejected the row. Seed groups only existed because they were inserted
-- as postgres (RLS bypassed); no real user could ever create a circle.
--
-- Add `owner_id = auth.uid()` to groups_select so an owner always sees their own
-- circle (which is obviously correct anyway). No other policy changes.

drop policy groups_select on public.groups;

create policy groups_select on public.groups
  for select to authenticated
  using (
    owner_id = auth.uid()
    or public.is_group_member(id)
    or exists (
      select 1 from public.activities a
      where a.group_id = groups.id
        and a.visibility = 'overflow'
        and a.status = 'scheduled'
    )
  );
