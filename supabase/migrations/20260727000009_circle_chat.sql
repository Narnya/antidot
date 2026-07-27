-- ACT / P1 — Circle chat. Member-only group chat: the ONE sanctioned messaging
-- surface (Product Core §10) — never open DMs / 1:1 / cold messages (Инв. 2).
-- Source of truth: /docs/00_PRODUCT_CORE.md §10 · /docs/32 frame L.
--
-- ⚠️ RLS cannot be trusted by eyeballing. The policies below MUST be tested against a
-- live Postgres — positive AND negative — before they protect real users. A recipe
-- is at the bottom of this file. This encodes the intended access model; treat it as
-- a reviewable draft until proven.
--
-- Access model:
--   circle_messages  SELECT: active members of the circle only.
--                    INSERT: an active member, and only as themselves.
--                    UPDATE/DELETE: nobody (messages immutable in MVP; edit/delete +
--                    a moderation freeze are separate admin tasks, never client-side).

create table public.circle_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index circle_messages_group_idx on public.circle_messages (group_id, created_at);

alter table public.circle_messages enable row level security;

-- Read: only ACTIVE members (reuses the security-definer helper is_group_member so
-- the policy does not recurse into group_memberships). Rows are messages, never a
-- browsable roster — no people marketplace (Инв. 13).
create policy circle_messages_select on public.circle_messages
  for select to authenticated
  using (public.is_group_member(group_id));

-- Write: an active member may post, and only as themselves (Инв. 2 — no cold/foreign
-- authorship).
create policy circle_messages_insert on public.circle_messages
  for insert to authenticated
  with check (author_id = auth.uid() and public.is_group_member(group_id));

-- No UPDATE / DELETE policies → RLS denies both by default.

-- Realtime: broadcast INSERTs to subscribed clients. Supabase enforces the SELECT
-- policy on the realtime stream, so a non-member receives nothing.
alter publication supabase_realtime add table public.circle_messages;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS TEST (run manually against the live DB; do NOT rely on reading the policy).
-- Replace the UUIDs with a real circle + a member + a non-member. Simulate each user
-- via request.jwt.claims. Expected results are in the comments.
--
--   -- as a MEMBER of the circle:
--   set local role authenticated;
--   set local request.jwt.claims = '{"sub":"<MEMBER_UUID>","role":"authenticated"}';
--   select count(*) from public.circle_messages where group_id = '<CIRCLE_UUID>';        -- ✅ > 0 (can read)
--   insert into public.circle_messages (group_id, author_id, body)
--     values ('<CIRCLE_UUID>', '<MEMBER_UUID>', 'hi');                                    -- ✅ succeeds
--   insert into public.circle_messages (group_id, author_id, body)
--     values ('<CIRCLE_UUID>', '<OTHER_UUID>', 'spoof');                                  -- ❌ blocked (author_id != auth.uid())
--   reset request.jwt.claims; reset role;
--
--   -- as a NON-MEMBER:
--   set local role authenticated;
--   set local request.jwt.claims = '{"sub":"<NONMEMBER_UUID>","role":"authenticated"}';
--   select count(*) from public.circle_messages where group_id = '<CIRCLE_UUID>';        -- ✅ 0 (cannot read)
--   insert into public.circle_messages (group_id, author_id, body)
--     values ('<CIRCLE_UUID>', '<NONMEMBER_UUID>', 'intrude');                            -- ❌ blocked (not a member)
--   reset request.jwt.claims; reset role;
-- ─────────────────────────────────────────────────────────────────────────────
