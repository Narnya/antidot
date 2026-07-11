-- ACT / T6 — self-service account deletion. Source: /docs/32 §5 (Settings).
--
-- A user must be able to delete their own account without the client ever holding
-- the service role (Инв. 12 — no service role on the client). This security-definer
-- RPC deletes the caller's auth.users row; every app table references
-- auth.users(id) ON DELETE CASCADE, so profiles, memberships, activities they
-- created, slot_claims, meeting_locations, reports and blocks all cascade away.
--
-- NOTE (MVP simplification): deleting a host also cascade-deletes the circles they
-- OWN (groups.owner_id → auth.users ON DELETE CASCADE) and everything under them —
-- there is no ownership transfer yet. This is a hard, irreversible delete.
--
-- Locked to the `authenticated` role; the delete target is always auth.uid(), so a
-- caller can only ever delete themselves.
create or replace function public.delete_own_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = (select auth.uid());
$$;

revoke execute on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
