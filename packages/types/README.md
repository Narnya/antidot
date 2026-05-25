# packages/types — `@social-events/types`

Shared TypeScript types — entities, enums, and lifecycle states — single source of types across mobile/admin/functions.
See [`/docs/05_ARCHITECTURE.md`](../../docs/05_ARCHITECTURE.md) §6 and [`/docs/06_DATABASE_SCHEMA.md`](../../docs/06_DATABASE_SCHEMA.md).

## Status

Baseline workspace package (INFRA-005): `package.json`, `tsconfig.json` (extends the
root strict base), and an empty `src/index.ts`. Importable across the workspace; **no
domain types (Profile/Event/Application/Trust) defined yet — those wait on schema/type
generation decisions.**

## Boundaries

- Use neutral technical terms (`User`, `Event`, `Application`, …) — do not bind the data model to the brand ([`/docs/00_PRODUCT_CORE.md`](../../docs/00_PRODUCT_CORE.md)).
- Types describe shape only; they never expose internal-only fields (e.g. raw trust score) to client-facing surfaces.

## Not in scope yet (separate tasks)

Type definitions, enum declarations, schema-derived types.
