# apps/admin — `@social-events/admin`

Next.js admin dashboard — **web-only**, for moderation, reports, and audit.
See [`/docs/05_ARCHITECTURE.md`](../../docs/05_ARCHITECTURE.md) §19 and [`/docs/00_PRODUCT_CORE.md`](../../docs/00_PRODUCT_CORE.md) (first source of truth).

## Status

Admin shell placeholder (INFRA-011): App Router + a static shell (sidebar + header)
wrapping placeholder pages for each future admin section. **No auth, no data fetching,
no Supabase/service-role, no moderation actions — every page states this explicitly.**

> Scaffolded **by hand** (no pnpm / no network here). Next 15 / React 19 versions are
> unverified — reconcile on first install.

## Run (after `pnpm install` at the repo root, with network available)

```bash
pnpm --filter @social-events/admin dev      # http://localhost:3000
```

## Routes (placeholders)

| Path                   | Section             |
| ---------------------- | ------------------- |
| `/`                    | Overview            |
| `/moderation`          | Moderation Queue    |
| `/reports`             | Reports             |
| `/users`               | Users               |
| `/events`              | Events              |
| `/messages`            | Messages            |
| `/suspicious-activity` | Suspicious Activity |
| `/audit-logs`          | Audit Logs          |
| `/settings`            | Settings            |

Each route renders `PlaceholderPage` — "Infrastructure placeholder only / no real admin
data / no Supabase/service role connected".

## Structure

- `src/app/layout.tsx` — root layout; imports `globals.css`, wraps pages in `AdminShell`.
- `src/app/<section>/page.tsx` — one placeholder page per section (see table).
- `src/app/globals.css` — neutral shell styling (not final design).
- `src/components/admin-shell/` — `AdminShell`, `AdminSidebar`, `AdminHeader`, `PlaceholderPage`.
- `next.config.mjs`, `eslint.config.mjs`, `tsconfig.json` (alias `@/* → src/*`).

## Boundaries

- The Supabase **service role is used server-side only** and must **never** ship in the browser bundle (Invariant: service role not on client). None is configured here.
- Admin is **not** a mobile role; admin-only data is never exposed to [`../mobile`](../mobile).
- Every moderation-sensitive action must create an audit log (Invariant 4/10) — to be implemented in later, security-reviewed tickets, not here.
- AI moderation is assistive only — never the final judge (Invariant 5).

## Not in scope yet (separate, gated tasks)

Admin auth/authorization, Supabase access & data fetching, real moderation/report/user/
event/message/audit functionality, admin actions (restrict/ban/remove/freeze), design-system
usage, analytics/Sentry/AI. Architecture is a **Modular Monolith**
([`/docs/17_ADR_MODULAR_MONOLITH.md`](../../docs/17_ADR_MODULAR_MONOLITH.md)) — no separate backend services.
