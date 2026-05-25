# apps/mobile — `@social-events/mobile`

React Native + Expo + TypeScript mobile app — the **only** user-facing client (iOS + Android).
See [`/docs/05_ARCHITECTURE.md`](../../docs/05_ARCHITECTURE.md) §7 and [`/docs/00_PRODUCT_CORE.md`](../../docs/00_PRODUCT_CORE.md) (first source of truth).

## Status

Expo Router shell (INFRA-010). Placeholder route groups only — boots to a shell landing
that links to one placeholder per group. **No product screens, no auth/route-gating, no
business logic, no SDK wiring.**

> Scaffolded **by hand** (no pnpm / no network here). Dependency versions target Expo
> SDK 52 but are unverified — run `npx expo install --fix` after the first install.

## Run (after `pnpm install` at the repo root, with network available)

```bash
pnpm --filter @social-events/mobile start   # then press i / a / w
```

## Navigation (Expo Router)

File-based routing under `app/`. Route **groups** (parenthesised — no URL segment) are
placeholders for future flows ([`/docs/05_ARCHITECTURE.md`](../../docs/05_ARCHITECTURE.md) §7.3):

- `app/_layout.tsx` — root `Stack` wrapped in `SafeAreaProvider`. No auth gating yet.
- `app/index.tsx` — `/` shell landing with links to each group.
- `(public)/welcome.tsx` → `/welcome` — future welcome / auth / invite (placeholder).
- `(onboarding)/start.tsx` → `/start` — future onboarding (placeholder).
- `(app)/home.tsx` → `/home` — future authenticated tabs (placeholder).
- `(modals)/placeholder.tsx` → `/placeholder` — future apply / report / block modals (placeholder, modal presentation).

> Each group uses a single **named** route (not bare `index`) because multiple `index`
> files across groups would all resolve to `/` and collide. Protected / auth-gated
> routing is **not** implemented yet.

## Structure

- `app/` — Expo Router routes (file-based). Entry is `expo-router/entry` (`package.json` `main`).
- `components/Placeholder.tsx` — shared placeholder UI (kept outside `app/` so it isn't a route).
- `app.json` — Expo config (`scheme`, `expo-router` plugin, metro web bundler).
- `babel.config.js` — `babel-preset-expo` (handles Expo Router; no extra plugin on SDK 50+).
- `metro.config.js` — monorepo-aware Metro (watches workspace root, hoisted resolution).
- `tsconfig.json` — extends `expo/tsconfig.base` (RN-tuned; intentionally not the shared base).
- `eas.json` — EAS Build profiles placeholder (`development`/`preview`/`production`).
- `BUILDING.md` — EAS build readiness notes + pre-build TODOs.

## Building (EAS)

EAS Build config lives **here in the app dir** ([`eas.json`](./eas.json)), and EAS
commands must be run from `apps/mobile/`. Profiles `development`/`preview`/`production`
are **placeholders only (INFRA-008)** — no builds run, no Expo login, no credentials,
no store submission. See [`BUILDING.md`](./BUILDING.md) for details and the steps
required before the first real build.

## Boundaries

- Uses the Supabase **anon/auth** client only — the **service role is never present in this app** (Invariant: service role not on client).
- Admin/moderation data and logic live in [`../admin`](../admin), not here.
- Sensitive behavior (exact location reveal, chat access, trust, moderation) is enforced server-side via RLS / Edge Functions — the client never decides access.

## Not in scope yet (separate, gated tasks)

Product screens, onboarding, discovery, event detail, apply/approval, chat, report/block,
auth/route-gating, design-system usage in screens, analytics/Sentry/AI SDKs. Architecture
is a **Modular Monolith** ([`/docs/17_ADR_MODULAR_MONOLITH.md`](../../docs/17_ADR_MODULAR_MONOLITH.md)) — no microservices.
