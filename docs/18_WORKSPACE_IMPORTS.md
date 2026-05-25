# 18 — Workspace Imports & Package Consumption

> **Status:** v1 (infrastructure convention)
> **Owner:** Technical
> **Last updated:** 2026-05-24

---

## 1. Source of Truth

- [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — **first source of truth**. At conflict, Product Core wins.
- Architecture: **Modular Monolith** — one monorepo, shared packages (not services). See [`/docs/05_ARCHITECTURE.md`](05_ARCHITECTURE.md) §6 and [`/docs/17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md).
- Established by INFRA-012. This document defines how apps consume shared workspace packages.

---

## 2. Workspace packages

| Package | Purpose |
|---|---|
| `@social-events/ui` | Design tokens (and, later, UI primitives) |
| `@social-events/types` | Shared TypeScript types (entities, enums, lifecycle) |
| `@social-events/validators` | Shared Zod validation schemas (later) |
| `@social-events/config` | Shared config / env schemas / feature-flag keys (later) |
| `@social-events/analytics` | Analytics taxonomy / wrapper (later) |

Each package: `private`, `type: module`, `main`/`types` = `./src/index.ts`, and
`exports: { ".": "./src/index.ts" }` (consumed as TypeScript source — no build step).

---

## 3. Approved import convention

Import shared packages by their **package name**:

```ts
import { tokens } from '@social-events/ui';
import type { WorkspaceCheck } from '@social-events/types';
import { workspaceConfigCheck } from '@social-events/config';
```

Apps declare them in `package.json` with the workspace protocol:

```json
"dependencies": {
  "@social-events/types": "workspace:*",
  "@social-events/config": "workspace:*"
}
```

### App-local aliases

- **admin** uses `@/*` → `src/*` (configured in `apps/admin/tsconfig.json`) for its own files.
- **mobile** uses **relative imports** for its own files (no `@/*` alias configured yet —
  adding one needs Metro/Babel resolver setup; deferred until needed).

---

## 4. Forbidden

- ❌ Deep relative imports into another package's source:
  ```ts
  import { x } from '../../../packages/types/src'; // do NOT do this
  ```
- ❌ Defining `@social-events/*` as TypeScript `paths` pointing straight at `src` — rely on
  workspace package resolution instead. (Only do this, with a documented reason, if
  workspace exports genuinely fail.)

---

## 5. Next.js (admin)

Workspace packages ship TS source, so Next must transpile them. `apps/admin/next.config.mjs`:

```js
const nextConfig = {
  transpilePackages: [
    '@social-events/ui',
    '@social-events/types',
    '@social-events/validators',
    '@social-events/config',
    '@social-events/analytics',
  ],
};
```

Built-in `transpilePackages` only — do **not** add `next-transpile-modules`.

---

## 6. Expo (mobile)

Expo/Metro resolves workspace packages via the existing monorepo-aware
`apps/mobile/metro.config.js` (watches the workspace root + hoisted `nodeModulesPaths`).
With `node-linker=hoisted` (root `.npmrc`), no extra Metro config is required. Keep it
minimal; follow current Expo monorepo guidance before adding complexity.

---

## 7. Smoke checks (temporary)

To verify consumption before real code exists, INFRA-012 added **infrastructure-only**
markers — these are **not product logic**:

- `@social-events/config`: `export const workspaceConfigCheck = 'workspace-ok'`
- `@social-events/types`: `export type WorkspaceCheck = { ok: true }`
- consumed by non-route `workspace-check.ts` in each app
  (`apps/mobile/workspace-check.ts`, `apps/admin/src/workspace-check.ts`).

> **Remove/replace** these smoke exports and files when real shared types and config land.
> They exist only to prove the import graph resolves and typechecks.

---

## 8. Rules

- Shared package placeholders must **not** contain product/business logic, real domain
  types, validators, analytics events, secrets, or sensitive data (Product Core / safety
  invariants remain binding).
- No microservices, no separate backend services, no multiple databases — shared code is
  consumed in-process via these packages.

---

> Reminder: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) is the first source of truth; this convention is subordinate to it.
