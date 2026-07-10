-- ACT / DBV — Activity-first MVP schema.
-- Source of truth: /docs/30_PRODUCT_DIRECTION_ACTIVITY_FIRST.md. Mirrors the
-- domain model in apps/mobile/src/features/activities/lib/model.ts.
--
-- Two centres: `groups` (circle = belonging / retention) own many `activities`
-- (activity = entry). `slot_claims` records who takes a spot; `source` = the
-- pull signal ('overflow' = someone from outside the group claimed a spot).
--
-- RLS is ENABLED on every table with NO policies in this migration → default
-- deny-all for anon/authenticated roles. Access is opened deliberately in the
-- RLS migration (step 2). Do NOT ship this schema without that follow-up.
--
-- NOTE: not yet applied against a live database — written to be applied once a
-- Supabase project exists (supabase db push / migration up).

create extension if not exists pgcrypto;

-- ── Circles (groups) ──────────────────────────────────────────────────────────
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  area text not null check (char_length(area) between 1 and 80),
  owner_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ── Memberships ───────────────────────────────────────────────────────────────
create table public.group_memberships (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  status text not null default 'active'
    check (status in ('active', 'paused', 'left', 'removed')),
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- ── Trust edges between groups (reserved; MVP is city-wide, not radius) ────────
create table public.group_links (
  group_a_id uuid not null references public.groups (id) on delete cascade,
  group_b_id uuid not null references public.groups (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (group_a_id, group_b_id),
  check (group_a_id <> group_b_id)
);

-- ── Activities (a circle's scheduled instance with open spots) ─────────────────
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  kind text not null
    check (kind in ('football', 'walk', 'boardgames', 'coffee', 'run', 'other')),
  area text not null check (char_length(area) between 1 and 80),
  starts_at timestamptz not null,
  total_spots int not null check (total_spots between 1 and 100),
  status text not null default 'scheduled'
    check (status in ('scheduled', 'full', 'completed', 'cancelled')),
  visibility text not null default 'group_only'
    check (visibility in ('group_only', 'overflow')),
  created_at timestamptz not null default now()
);

-- ── Slot claims (RSVP / attendance; `source` = pull signal) ────────────────────
create table public.slot_claims (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'going'
    check (status in ('going', 'attended', 'no_show', 'cancelled')),
  source text not null default 'member' check (source in ('member', 'overflow')),
  created_at timestamptz not null default now(),
  unique (activity_id, user_id)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index group_memberships_user_idx on public.group_memberships (user_id);
create index activities_group_idx on public.activities (group_id);
create index activities_feed_idx on public.activities (status, visibility, starts_at);
create index slot_claims_activity_idx on public.slot_claims (activity_id);
create index slot_claims_user_idx on public.slot_claims (user_id);

-- ── RLS: enable everywhere, deny-all until step 2 adds policies ────────────────
alter table public.groups enable row level security;
alter table public.group_memberships enable row level security;
alter table public.group_links enable row level security;
alter table public.activities enable row level security;
alter table public.slot_claims enable row level security;
