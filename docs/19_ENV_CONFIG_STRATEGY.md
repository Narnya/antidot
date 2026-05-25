# 19 — Environment Config Strategy

> **Status:** v1 (infrastructure convention)
> **Owner:** Technical / Security
> **Last updated:** 2026-05-24

---

## 1. Source of Truth & purpose

- [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — **first source of truth**.
- Builds on the env strategy in [`/docs/16_PHASE_GATE_TO_INFRASTRUCTURE.md`](16_PHASE_GATE_TO_INFRASTRUCTURE.md)-era INFRA-006 (`.env.example` files) and the import convention in [`/docs/18_WORKSPACE_IMPORTS.md`](18_WORKSPACE_IMPORTS.md).
- **Purpose:** a small, typed config layer that cleanly separates **public** (client-safe) config from **server-only** config, with shared types/helpers in `@social-events/config` and app-specific readers in each app. No SDK is connected and no secret is stored.

---

## 2. Public vs server-only (the safety boundary)

| Kind | Where it may run | Examples |
|---|---|---|
| **Public** | client bundle + server | Supabase URL, anon key, PostHog key/host, Sentry DSN, app env |
| **Server-only** | server code / Edge Functions / CI only | `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `ADMIN_ALLOWED_EMAILS` |

- **Expo rule:** only `EXPO_PUBLIC_*` vars are inlined into the mobile client. Read nothing else in mobile.
- **Next rule:** only `NEXT_PUBLIC_*` vars reach the browser. Unprefixed vars are server-only.
- **Service-role rule:** `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — **server-side only, never in any client bundle, never behind a public prefix** ([`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §8).

---

## 3. Shared package — `@social-events/config`

Context-agnostic only: **no `process.env` access, no secrets.** Exports:

- `AppEnv` = `'local' | 'staging' | 'production'`; `APP_ENVS`; `isAppEnv`; `getAppEnv(raw)`.
- `PublicRuntimeConfig` (shape shared by mobile + admin) and `buildPublicConfig(input)` (pure).
- `AdminServerConfig` (server-only shape).

App readers extract their own env vars and call these helpers, so mobile/admin/server contexts never mix in the shared package.

---

## 4. Mobile allowed variables (`apps/mobile/src/config/env.ts`)

`EXPO_PUBLIC_*` only → `mobilePublicConfig` / `mobileEnv`:

- `EXPO_PUBLIC_APP_ENV`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_POSTHOG_KEY`
- `EXPO_PUBLIC_POSTHOG_HOST`
- `EXPO_PUBLIC_SENTRY_DSN`

No service role, no AI keys, no server-only vars. (`expo-env.d.ts` provides the `process.env.EXPO_PUBLIC_*` typing.)

---

## 5. Admin public variables (`apps/admin/src/config/publicEnv.ts`)

`NEXT_PUBLIC_*` only → `adminPublicConfig` / `adminEnv`:

- `NEXT_PUBLIC_APP_ENV`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_SENTRY_DSN`

Safe to import from client or server components.

---

## 6. Admin server-only variables (`apps/admin/src/config/serverEnv.ts`)

`adminServerConfig` (+ `adminServerEnv`). Guarded by `import 'server-only'` — the build
**fails** if this module is imported into a client component:

- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_ALLOWED_EMAILS` (comma-separated → `string[]`)
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`

**Never import `serverEnv.ts` from a client component.**

---

## 7. Not implemented yet

- No real values/secrets (all empty placeholders; config does not hard-fail on empties).
- No Supabase client (anon or service-role), no auth, no analytics tracking.
- No PostHog / Sentry / AI SDKs.
- Env values are **never displayed in UI**.

---

## 8. Future steps

- Supabase **anon** client wrapper (mobile + admin) consuming `*PublicConfig`.
- Admin **server-only** Supabase service-role client consuming `adminServerConfig` (server-side, audited).
- PostHog wrapper in `@social-events/analytics` (public keys).
- Sentry init (public DSN).
- AI moderation (server-only keys; assistive, never the final judge).
- Replace empty-placeholder tolerance with required-var validation per environment where appropriate.

---

> Reminder: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) is the first source of truth; this strategy is subordinate to it. No secrets were committed.
