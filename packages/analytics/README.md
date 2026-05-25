# packages/analytics — `@social-events/analytics`

Shared analytics wrapper (PostHog) with a single, centralized event taxonomy.
See [`/docs/05_ARCHITECTURE.md`](../../docs/05_ARCHITECTURE.md) §20 and [`/docs/10_ANALYTICS.md`](../../docs/10_ANALYTICS.md).

## Status

Baseline workspace package (INFRA-005): `package.json`, `tsconfig.json` (extends the
root strict base), and an empty `src/index.ts`. Importable across the workspace; **no
PostHog dependency, no wrapper, no taxonomy-in-code yet.**

## Boundaries

- Privacy boundary is strict: **never** send exact location, raw message bodies, report descriptions, private profile data, or the raw trust score. Only ids / enums / buckets / counts.
- Event names come from the taxonomy in [`/docs/10_ANALYTICS.md`](../../docs/10_ANALYTICS.md) — do not invent event names.

## Not in scope yet (separate tasks)

Analytics wrapper, event definitions, real PostHog SDK integration.
