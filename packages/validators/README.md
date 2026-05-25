# packages/validators — `@social-events/validators`

Shared Zod schemas — reused for client UX validation and server-side (Edge Function) validation.
See [`/docs/05_ARCHITECTURE.md`](../../docs/05_ARCHITECTURE.md) §6/§7.5 and [`/docs/00_PRODUCT_CORE.md`](../../docs/00_PRODUCT_CORE.md) (first source of truth).

## Status

Baseline workspace package (INFRA-005): `package.json`, `tsconfig.json` (extends the
root strict base), and an empty `src/index.ts`. Importable across the workspace; **no
Zod dependency and no schemas yet.**

## Boundaries

- Client validation is **UX only**; authoritative validation of sensitive operations happens server-side ("no trust in client-only validation").
- Shared so the same schema guards both the form and the Edge Function.

## Not in scope yet (separate tasks)

Schema definitions, validation logic, Edge Function integration.
