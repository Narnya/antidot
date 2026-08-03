-- ACT — pushed notifications for the two guest-side payoff moments of the loop:
--   • member_confirmed — «Тебя приняли в круг» (host-confirmed an overflow guest)
--   • location_open    — «Место встречи открыто» (host revealed the exact place)
--
-- These were DERIVED in the app (migration 012 kept them derived on purpose). That
-- works for the notifications LIST but never pushes: no realtime badge, no future
-- push, because nothing is stored. Making them real rows (via SECURITY DEFINER
-- triggers) means they badge live (already in the realtime publication, 013) and
-- persist. The app KEEPS deriving them too, but de-duplicated by (kind, href), so:
--   – pre-apply (no trigger):  derived only          → one entry, as before
--   – post-apply, existing recipients: stored (pushed) → derived skipped (dedupe)
--   – post-apply, LATE claimer (claimed after reveal): no stored row → derived fills
-- i.e. no regression, no duplicates, and late claimers are still covered.
--
-- Both triggers are EXCEPTION-SAFE: a notification failure must NEVER roll back the
-- parent action (host-confirm / setting the location). This is deliberately more
-- defensive than the 012 slot_claimed trigger because these ship unverified — the
-- operator must still run the tests at the bottom on the live DB.
--
-- ✅ APPLIED + verified on antidot-dev (2026-08-03, session pooler). All trigger
-- tests below passed live (txn + ROLLBACK): member_confirmed writes exactly one
-- recipient row and a no-op update does not duplicate; location_open notifies
-- claimants but not the host; and exception-safety holds — with the notifications
-- insert forced to fail, host-confirm still succeeded. Do NOT `supabase db push`
-- (base schema was applied directly; there is no CLI migration history).

-- ── member_confirmed ─────────────────────────────────────────────────────────
-- Fires when a membership BECOMES an active member (overflow guest → member). Skips
-- owners and no-op updates. Recipient = the confirmed user; href matches the app's
-- derived key (`/circle/<group_id>`) so listNotifications can dedupe against it.
create or replace function public.notify_member_on_confirm()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  if new.role <> 'member' or new.status <> 'active' then
    return new;
  end if;
  -- Already an active member before this write → nothing new happened.
  if tg_op = 'UPDATE' and old.role = 'member' and old.status = 'active' then
    return new;
  end if;
  begin
    select g.name into v_name from public.groups g where g.id = new.group_id;
    insert into public.notifications (user_id, kind, title, detail, href)
    values (new.user_id, 'member_confirmed', 'Тебя приняли в круг',
            '«' || coalesce(v_name, 'круг') || '» · участие подтверждено',
            '/circle/' || new.group_id);
  exception when others then
    null; -- best-effort; must never block host-confirm
  end;
  return new;
end;
$$;

drop trigger if exists trg_notify_member_on_confirm on public.group_memberships;
create trigger trg_notify_member_on_confirm
  after insert or update on public.group_memberships
  for each row
  execute function public.notify_member_on_confirm();

-- ── location_open ────────────────────────────────────────────────────────────
-- Fires when a host reveals the exact place (INSERT into meeting_locations). Notifies
-- every current claimant (going/attended) EXCEPT the host, who already knows it. Late
-- claimers (who claim after the reveal) get it from the app's derivation instead.
create or replace function public.notify_claimants_on_location()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
begin
  begin
    select a.title into v_title from public.activities a where a.id = new.activity_id;
    insert into public.notifications (user_id, kind, title, detail, href)
    select sc.user_id, 'location_open', 'Место встречи открыто',
           coalesce(v_title, 'активность') || ' · ты занял слот',
           '/activity/' || new.activity_id
    from public.slot_claims sc
    where sc.activity_id = new.activity_id
      and sc.status in ('going', 'attended')
      and sc.user_id <> new.created_by;
  exception when others then
    null; -- best-effort; must never block the host setting the location
  end;
  return new;
end;
$$;

drop trigger if exists trg_notify_claimants_on_location on public.meeting_locations;
create trigger trg_notify_claimants_on_location
  after insert on public.meeting_locations
  for each row
  execute function public.notify_claimants_on_location();

-- ─────────────────────────────────────────────────────────────────────────────
-- TESTS (run against the live DB after applying; wrap in a txn + ROLLBACK so no
-- test rows persist). Replace UUIDs with real ones (a group + a guest user; an
-- activity with a going claimant + its host).
--
--   begin;
--   -- member_confirmed: confirming a guest inserts exactly one recipient row
--   insert into public.group_memberships(group_id, user_id, role, status)
--     values ('<GROUP>', '<GUEST>', 'member', 'active');
--   select count(*) from public.notifications
--     where user_id='<GUEST>' and kind='member_confirmed';          -- expect 1
--   -- no-op update must NOT create a duplicate
--   update public.group_memberships set status='active'
--     where group_id='<GROUP>' and user_id='<GUEST>';
--   select count(*) from public.notifications
--     where user_id='<GUEST>' and kind='member_confirmed';          -- still 1
--   rollback;
--
--   begin;
--   -- location_open: revealing the place notifies claimants, not the host
--   insert into public.meeting_locations(activity_id, exact_location, created_by)
--     values ('<ACTIVITY>', 'Тест-место', '<HOST>');
--   select user_id from public.notifications
--     where kind='location_open' and href='/activity/<ACTIVITY>';   -- claimants only, no <HOST>
--   rollback;
--
--   -- exception-safety: even if the notifications insert failed, the membership /
--   -- location insert must still succeed (the trigger swallows its own errors).
-- ─────────────────────────────────────────────────────────────────────────────
