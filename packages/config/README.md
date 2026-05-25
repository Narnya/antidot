# packages/config — `@social-events/config`

Shared configuration — env schemas and feature-flag keys.
See [`/docs/05_ARCHITECTURE.md`](../../docs/05_ARCHITECTURE.md) §6/§24 and [`/docs/00_PRODUCT_CORE.md`](../../docs/00_PRODUCT_CORE.md) (first source of truth).

## Status

Config layer (INFRA-013): context-agnostic types + pure helpers — `AppEnv`,
`PublicRuntimeConfig`, `AdminServerConfig`, `APP_ENVS`, `getAppEnv`, `buildPublicConfig`.
**No secrets, no real values, and no `process.env` access here** — app-specific readers
(`apps/mobile/src/config/env.ts`, `apps/admin/src/config/{publicEnv,serverEnv}.ts`) read
their own env and call these helpers. See [`/docs/19_ENV_CONFIG_STRATEGY.md`](../../docs/19_ENV_CONFIG_STRATEGY.md).

## Boundaries

- **No secrets in the repo.** Real/production secrets are never committed; env templates only (a later ticket).
- The **service role key is never referenced from client-facing config** (mobile/admin browser bundle).
- Safety-related feature flags must not be toggled off without a product decision.

## Not in scope yet (separate tasks)

Env schema, feature-flag registry, `.env.example` templates.
