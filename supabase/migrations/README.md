# supabase/migrations

SQL migrations — the source of truth for schema and RLS policies. **Created in a later phase, not now.**
See [`/docs/06_DATABASE_SCHEMA.md`](../../docs/06_DATABASE_SCHEMA.md) and [`/docs/07_SECURITY_RLS.md`](../../docs/07_SECURITY_RLS.md).

## Status

Empty placeholder folder (INFRA-001). **No `.sql` files, no migrations.**

## Gate

Migrations and RLS policies are **Still NOT allowed** in the current phase ([`/docs/16_PHASE_GATE_TO_INFRASTRUCTURE.md`](../../docs/16_PHASE_GATE_TO_INFRASTRUCTURE.md) §4). They require closed product decisions + human review of location-privacy and RLS design ([`/docs/11_SPRINT_BACKLOG.md`](../../docs/11_SPRINT_BACKLOG.md) §26).

One system, **one database** ([`/docs/17_ADR_MODULAR_MONOLITH.md`](../../docs/17_ADR_MODULAR_MONOLITH.md)) — no multiple databases.
