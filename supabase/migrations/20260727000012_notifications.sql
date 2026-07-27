-- ACT — notifications. Per-recipient store for real "someone acted on you" events
-- that a user can't derive from their own data. Source of truth: /docs/32 frame 10.
-- Recipient-only (RLS); rows are created by SECURITY DEFINER triggers, never by the
-- client. Time-based reminders + self-derivable events (приняли в круг, место
-- открыто) stay DERIVED in the app — this table is only for pushed events.
--
-- ⚠️ RLS cannot be trusted by eyeballing. Test positive+negative on a live DB (recipe
-- at the bottom) before it protects real users.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade, -- recipient
  kind text not null,
  title text not null,
  detail text,
  href text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

-- Read + mark-read only your own. No INSERT/DELETE policy → clients cannot create or
-- remove notifications (rows come from the definer trigger below).
create policy notifications_select on public.notifications
  for select to authenticated
  using (user_id = auth.uid());

create policy notifications_update on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- When an OVERFLOW guest claims a slot, notify the activity's host. The guest is
-- kept anonymous («Кто-то…») — no people catalog (Инв. 13); the host sees them in
-- «Приём в круг» (frame M). SECURITY DEFINER so it can write the host's row.
create or replace function public.notify_host_on_overflow_claim()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_host uuid;
  v_title text;
begin
  if new.source <> 'overflow' then
    return new;
  end if;
  select a.created_by, a.title into v_host, v_title
  from public.activities a
  where a.id = new.activity_id;
  if v_host is null or v_host = new.user_id then
    return new; -- no self-notification
  end if;
  insert into public.notifications (user_id, kind, title, detail, href)
  values (v_host, 'slot_claimed', 'Кто-то занял твой слот',
          '«' || coalesce(v_title, 'активность') || '» · из ленты',
          '/manage/' || new.activity_id);
  return new;
end;
$$;

create trigger trg_notify_host_on_overflow_claim
  after insert on public.slot_claims
  for each row
  execute function public.notify_host_on_overflow_claim();

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS TEST (run against the live DB after applying). Replace UUIDs with a real
-- recipient + a different user.
--   set local role authenticated;
--   set local request.jwt.claims = '{"sub":"<RECIPIENT>","role":"authenticated"}';
--   select count(*) from public.notifications;                    -- ✅ only own rows
--   -- as <OTHER>: select count(*) ... where user_id='<RECIPIENT>' -- ✅ 0 (can't read others)
--   insert into public.notifications(user_id,kind,title) values ('<RECIPIENT>','x','x'); -- ❌ blocked (no insert policy)
-- ─────────────────────────────────────────────────────────────────────────────
