-- ACT — audit_logs: the append-only trail required by Инв. 4 (CLAUDE.md §2 rule 8):
-- every moderation-sensitive action (ban, restriction, report review, circle /
-- activity removal, membership removal, admin decision, freeze chat) must create
-- an audit record. This migration lands the FOUNDATION — the table, its RLS and
-- its immutability — before any real moderation happens. The admin app (server
-- side, service role) is the only writer/reader; the mobile client can never see
-- or touch it (rule 15: admin-only data is never available from the mobile app).
--
-- Design:
--   * deny-all RLS — no policies for anon/authenticated at all. The service role
--     bypasses RLS (server-only per rule 13), which is exactly the intended access.
--   * append-only for EVERYONE including the service role: a BEFORE UPDATE/DELETE
--     trigger raises — triggers fire regardless of RLS bypass. History cannot be
--     rewritten, only appended.
--   * actor_type: 'admin' (human decision), 'system' (automatic enforcement),
--     'ai' (AI may FLAG/triage only — never a ban/removal decision, Инв. 5).
--   * meta jsonb holds action-specific context. Keep it minimal — no message
--     bodies, no exact locations, no report/block counts beyond what the action
--     itself requires (Инв. 14).
--
-- ✅ APPLIED + verified on antidot-dev (2026-08-07, session pooler). All checks
-- passed live (txn + ROLLBACK):
--   positive — owner/service path INSERT + SELECT succeed;
--   immutability — UPDATE and DELETE both raise (append-only holds even for the
--     service role);
--   negative — `authenticated` (with jwt claims) and `anon`: SELECT and INSERT
--     both -> permission denied (revoke + deny-all RLS).
-- Do NOT `supabase db push`.

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_type text not null check (actor_type in ('admin', 'system', 'ai')),
  actor_id uuid,
  action text not null check (length(trim(action)) > 0),
  subject_type text not null check (subject_type in ('user', 'group', 'activity', 'message', 'report', 'membership', 'chat')),
  subject_id uuid,
  reason text,
  meta jsonb not null default '{}'::jsonb,
  -- a human or system actor must be attributable; only 'system' may be anonymous
  constraint audit_logs_actor_attributable check (actor_type = 'system' or actor_id is not null)
);

comment on table public.audit_logs is
  'Append-only moderation audit trail (Инв. 4). Server/admin only — deny-all RLS, no client access ever.';

create index audit_logs_subject_idx on public.audit_logs (subject_type, subject_id, created_at desc);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

-- Deny-all RLS: enabled, zero policies. Only the service role (bypasses RLS,
-- server-side only) can read/write. Belt and braces: revoke table privileges too.
alter table public.audit_logs enable row level security;
revoke all on table public.audit_logs from anon, authenticated;

-- Append-only, even for the service role / table owner.
create or replace function public.audit_logs_immutable()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_logs is append-only (Инв. 4): % is not allowed', tg_op;
end;
$$;

create trigger audit_logs_no_update_delete
  before update or delete on public.audit_logs
  for each row execute function public.audit_logs_immutable();
