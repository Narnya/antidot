# /supabase

Backend for the **Modular Monolith** — one Supabase project, one PostgreSQL database
(see [`/docs/05_ARCHITECTURE.md`](../docs/05_ARCHITECTURE.md) and [`/docs/17_ADR_MODULAR_MONOLITH.md`](../docs/17_ADR_MODULAR_MONOLITH.md)).
No separate backend services, no multiple databases.

## Status (INFRA-006)

Placeholder structure only. **No Supabase connection, no `config.toml`, no CLI, no SQL,
no migrations, no Edge Functions, no seed, no tests.** Each subfolder holds a README
describing what will live there in a later, gated phase.

## Folders

- `migrations/` — future SQL schema + RLS, derived from [`/docs/06_DATABASE_SCHEMA.md`](../docs/06_DATABASE_SCHEMA.md) and [`/docs/07_SECURITY_RLS.md`](../docs/07_SECURITY_RLS.md).
- `functions/` — future Edge Functions for sensitive operations (apply, approve, report, moderation…).
- `seed/` — future local/staging seed data (no real PII).
- `tests/` — future RLS / security tests.

## Environments

`local` · `staging` · `production` — a separate Supabase project and keys per
environment. Configure via env vars (see the root [`.env.example`](../.env.example));
migrations land in staging before production.

## Service-role safety (binding)

`SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. It is **server-side only** — used by the
Next.js admin server and Edge Functions, **never** in the mobile app and **never** in
any browser/client bundle (Invariant: service role not on client; [`/docs/07_SECURITY_RLS.md`](../docs/07_SECURITY_RLS.md) §8).
Mobile and admin clients otherwise use the anon key under RLS only.
