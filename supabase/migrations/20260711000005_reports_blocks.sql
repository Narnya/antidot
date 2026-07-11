-- ACT / T3 — reports + blocks (safety, Inv. 6). Users can report any subject and
-- block a user. Admin review is server-side (service role) — the full admin app
-- is post-MVP; these tables are the sink. RLS: a user sees/manages only their own
-- reports and blocks.
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  subject_type text not null check (subject_type in ('user', 'activity', 'circle', 'message')),
  subject_id uuid not null,
  reason text not null check (reason in ('unsafe', 'spam', 'abuse', 'fake', 'other')),
  note text,
  created_at timestamptz not null default now()
);
create index reports_subject_idx on public.reports (subject_type, subject_id);

create table public.blocks (
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index blocks_blocked_idx on public.blocks (blocked_id);

alter table public.reports enable row level security;
alter table public.blocks enable row level security;

-- Reports: create your own; read only your own (admin review bypasses RLS via service role).
create policy reports_insert on public.reports
  for insert to authenticated with check (reporter_id = auth.uid());
create policy reports_select on public.reports
  for select to authenticated using (reporter_id = auth.uid());

-- Blocks: manage only your own.
create policy blocks_insert on public.blocks
  for insert to authenticated with check (blocker_id = auth.uid());
create policy blocks_select on public.blocks
  for select to authenticated using (blocker_id = auth.uid());
create policy blocks_delete on public.blocks
  for delete to authenticated using (blocker_id = auth.uid());
