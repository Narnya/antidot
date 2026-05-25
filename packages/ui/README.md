# packages/ui — `@social-events/ui`

Shared UI primitives / design-system components reused across apps (where sharing makes sense).
See [`/docs/05_ARCHITECTURE.md`](../../docs/05_ARCHITECTURE.md) §6 and [`/docs/13_DESIGN_HANDOFF.md`](../../docs/13_DESIGN_HANDOFF.md).

## Status

Design tokens baseline (INFRA-009): semantic tokens under `src/tokens/`, exported from
`src/index.ts`. Framework-agnostic plain TypeScript — **no components and no React/RN
dependency yet.**

## Tokens

- **Semantic, not raw** names: `colors.text.primary`, `colors.action.destructive`,
  `spacing[4]`, `radius.md`, `typography.body`, `shadows.card`, `zIndex.modal` — and a
  single aggregate `tokens`.
- Groups: `colors`, `spacing`, `radius`, `typography`, `shadows`, `zIndex` (each with a
  derived type, e.g. `Colors`, `Spacing`, plus `Tokens`).
- Direction: warm-minimal — light, clean, friendly, premium, soft, safety-forward; not
  romantic / not dating / not Material-default.
- These are **infrastructure placeholders** intended to map to Figma foundations and are
  subject to design review (see [`/docs/13_DESIGN_HANDOFF.md`](../../docs/13_DESIGN_HANDOFF.md) §9).
- **Product Core overrides visual design on conflict.** No dating visuals, public
  ratings, or raw/numeric trust score are encoded — `colors.trust.*` styles the soft
  "Verified" badge only.
- Typography: `fontFamily` is omitted (intended family **Inter**, loaded later — no font
  files committed); `fontWeight` uses RN-compatible strings (650 → "700"/"600").

```ts
import { tokens, colors, spacing, typography } from '@social-events/ui';
```

## Boundaries

- Presentation only — no business logic, no data access, no sensitive/product logic.
- Components (later) must never hardcode product rules (access control, trust, location) — those come from docs and server-side enforcement.

## Not in scope yet (separate tasks)

Component implementation (Button/Badge/EventCard/…), Figma screen translation, font
loading, theming/dark mode.
