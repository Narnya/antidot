-- ACT — pushed notification for a new circle-chat message → the circle's other
-- members (the belonging/retention surface). kind='chat' already renders in the
-- notifications screen and is in the realtime publication (013), so this just wires
-- the trigger. The notification carries ONLY the circle name — never the message
-- body (Инв. 14: no sensitive-data leak; the body stays behind the member-only chat
-- RLS). Recipients are active members except the author.
--
-- Anti-noise: at most ONE UNREAD chat notification per (member, circle). Each new
-- message clears the member's stale unread chat row for that circle and inserts a
-- fresh one, so the list shows «новое сообщение в круге X» once, not per-message.
-- Once the member reads notifications (read_at set), the next message makes a new one.
--
-- EXCEPTION-SAFE: a notification failure must NEVER block sending a message.
--
-- ✅ APPLIED + verified on antidot-dev (2026-08-06, session pooler). Trigger tests
-- passed live (txn + ROLLBACK): members notified, author not; a second message does
-- not duplicate the unread row; exception-safe (message send still succeeds if the
-- notification insert is forced to fail). Do NOT `supabase db push`.

create or replace function public.notify_members_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  begin
    select g.name into v_name from public.groups g where g.id = new.group_id;
    -- Keep at most one UNREAD chat notification per member for this circle.
    delete from public.notifications
    where kind = 'chat'
      and href = '/chat/' || new.group_id
      and read_at is null
      and user_id in (
        select m.user_id from public.group_memberships m
        where m.group_id = new.group_id and m.status = 'active' and m.user_id <> new.author_id
      );
    insert into public.notifications (user_id, kind, title, detail, href)
    select m.user_id, 'chat', 'Новое сообщение в круге',
           '«' || coalesce(v_name, 'круг') || '»',
           '/chat/' || new.group_id
    from public.group_memberships m
    where m.group_id = new.group_id
      and m.status = 'active'
      and m.user_id <> new.author_id;
  exception when others then
    null; -- best-effort; must never block sending a message
  end;
  return new;
end;
$$;

drop trigger if exists trg_notify_members_on_message on public.circle_messages;
create trigger trg_notify_members_on_message
  after insert on public.circle_messages
  for each row
  execute function public.notify_members_on_message();

-- ─────────────────────────────────────────────────────────────────────────────
-- TESTS (live, txn + ROLLBACK). <GROUP> with ≥2 active members; <AUTHOR> one of
-- them; <OTHER> another member.
--   begin;
--   insert into public.circle_messages(group_id,author_id,body) values('<GROUP>','<AUTHOR>','hi');
--   select count(*) from public.notifications
--     where kind='chat' and href='/chat/<GROUP>' and user_id='<OTHER>';   -- expect 1
--   select count(*) from public.notifications
--     where kind='chat' and href='/chat/<GROUP>' and user_id='<AUTHOR>'; -- expect 0 (author)
--   insert into public.circle_messages(group_id,author_id,body) values('<GROUP>','<AUTHOR>','again');
--   select count(*) from public.notifications
--     where kind='chat' and href='/chat/<GROUP>' and user_id='<OTHER>';   -- still 1 (dedupe)
--   rollback;
-- ─────────────────────────────────────────────────────────────────────────────
