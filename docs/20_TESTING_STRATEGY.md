# 20 — Testing Strategy

> **Status:** v1 (infrastructure convention)
> **Owner:** Technical / QA
> **Last updated:** 2026-05-24

---

## 0. Source of Truth

- [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — **first source of truth**.
- Aligns with [`/docs/05_ARCHITECTURE.md`](05_ARCHITECTURE.md) §26 (testing strategy) and the RLS test backlog in [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §30 / [`/docs/11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md) §23.

---

## 1. Testing philosophy

- **Typecheck is the primary safety net** at this stage (strict TypeScript across the workspace).
- Tests are added **staged**, only when the thing they test exists. No product behavior is tested before it is built and reviewed.
- Safety-critical behavior (location privacy, chat access, trust protection, moderation/audit privacy) is tested at the **database/RLS** layer in a dedicated security task — never faked at the UI layer.

## 2. Current testing stage

**Stage 1 — infrastructure smoke tests only** (INFRA-014).

## 3. What is tested now

- A single Vitest smoke test over the **pure config helpers** in `@social-events/config`
  (`packages/config/src/__tests__/workspace-config.test.ts`): `workspaceConfigCheck`,
  `getAppEnv`, `buildPublicConfig`. No env, no secrets, no SDKs, no product logic.

## 4. What is NOT tested yet

Product flows (onboarding/event/application/chat/report), UI/components, RLS/Supabase,
location privacy, trust protection, moderation, analytics, auth, E2E.

## 5. Shared packages testing plan (Stage 2)

- Runner: **Vitest** (already configured, `vitest.config.ts`, scoped to `packages/**`).
- Unit tests for: validators (once Zod schemas exist), config helpers, design-token
  invariants (if useful), and shared type guards.
- Convention: `packages/<pkg>/src/__tests__/*.test.ts`, imports relative within the package.

## 6. Mobile testing plan (Stage 2)

- Runner: **jest-expo** + **React Native Testing Library** (NOT Vitest).
- Tests live in `apps/mobile/__tests__/` (or co-located `*.test.tsx`) — **never inside
  `apps/mobile/app/`** (Expo Router treats those as routes).

## 7. Admin testing plan (Stage 2)

- Runner: Vitest/Jest for components; Playwright possibly for E2E (decided separately).
- Tests live in `apps/admin/src/__tests__/` (or co-located).

## 8. Supabase / RLS testing plan (Stage 3 — separate security task)

- Lives in `supabase/tests/` (see its README). Runs against a real Postgres/Supabase
  with RLS enabled. These gate any product release ([`/docs/11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md) §23).

## 9. E2E testing plan (Stage 4)

- Happy paths + safety-critical flows end-to-end (tooling TBD — Playwright/Detox).
- Not started; do not add Playwright/Cypress yet.

## 10. Safety-critical future tests (REQUIRED before product release — not implemented now)

These must pass (mostly RLS-level), per [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §30:

- non-approved user **cannot** read exact location;
- pending user **cannot** read exact location;
- waitlisted user **cannot** read exact location;
- rejected user **cannot** read exact location;
- approved user can read **only their own approved event** location;
- removed attendee **loses** location access;
- non-approved user **cannot** read event chat;
- approved user can read **only their own** event chat;
- frozen chat **blocks** writes;
- public profile **excludes** private details;
- public profile **excludes** raw trust score;
- normal user **cannot** read `trust_events`;
- normal user **cannot** read `user_trust_summary`;
- reported user **cannot** read the report;
- normal user **cannot** read `moderation_actions`;
- normal user **cannot** read `audit_logs`;
- service role **not exposed** client-side.

## 11. Test directory conventions

| Scope | Location | Runner |
|---|---|---|
| Shared packages | `packages/<pkg>/src/__tests__/*.test.ts` | Vitest |
| Mobile | `apps/mobile/__tests__/` (outside `app/`) | jest-expo + RNTL (later) |
| Admin | `apps/admin/src/__tests__/` | Vitest/Jest (later) |
| DB / RLS | `supabase/tests/` | dedicated security task (later) |

## 12. Commands

```bash
pnpm test          # vitest run (shared packages only)
pnpm test:watch    # vitest (watch)
pnpm typecheck     # tsc --noEmit across packages (primary safety net)
pnpm lint          # eslint
pnpm format:check  # prettier --check
```

> CI runs `format:check → typecheck → lint → test` (see `.github/workflows/ci.yml`).

## 13. Open testing decisions

- Mobile: confirm jest-expo + RNTL versions when components land.
- Admin: Vitest vs Jest for components; Playwright vs Cypress for E2E.
- RLS test harness: pgTAP vs app-level integration tests against a test Supabase project.
- Coverage thresholds (when meaningful) and where to enforce them in CI.
- Whether shared-package test files stay in the lib `tsconfig` or get a separate test tsconfig.

---

> Reminder: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) is the first source of truth; this strategy is subordinate to it. No product tests, RLS tests, SQL, or SDKs were created.
