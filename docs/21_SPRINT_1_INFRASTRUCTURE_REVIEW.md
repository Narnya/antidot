# Sprint 1 Infrastructure Review v1 — Social Events App

> **Status:** PASS WITH FIXES
> **Owner:** Technical Founder
> **Last updated:** 2026-05-24
> **Reviewer note:** Read-only audit of INFRA-001…014. This document does not modify implementation files. [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) is the first source of truth.

---

## 1. Review Summary

- **Review date:** 2026-05-24.
- **Review status:** **PASS WITH FIXES.**
- **Is Sprint 1 infrastructure ready?** Structurally **yes** — the monorepo foundation, both app skeletons, shared packages, env strategy, CI definition, tokens, shells, workspace imports, config layer, and testing scaffold all exist, are consistent, and violate no safety invariant.
- **Can the project move toward Sprint 2?** Yes, **after** one verification fix: the toolchain has never been installed/run in this environment, so the foundation is **not yet verified-runnable** and there is **no committed `pnpm-lock.yaml`** (CI cannot pass until one exists). Sprint 2 also requires a new phase gate (Infrastructure → Auth/Beta/Onboarding) + a `CLAUDE.md` §6 update.
- **Top issues:**
  1. (High) Nothing executed — `pnpm install`/`format:check`/`typecheck`/`lint`/`test` never ran; no lockfile (pnpm not installed, network blocked).
  2. (Medium) Hand-authored Expo SDK 52 / Next 15 / React versions are best-effort and unverified.
  3. (Low) Repo not under git; (Low) temporary INFRA-012 smoke markers to remove later.
- **No Critical issues. No safety-invariant violations.**

---

## 2. Scope Reviewed

| Task | Title | Reviewed |
|------|-------|:--:|
| INFRA-001 | Monorepo structure | ✅ |
| INFRA-002 | TypeScript workspace | ✅ |
| INFRA-003 | Expo mobile skeleton | ✅ |
| INFRA-004 | Next.js admin skeleton | ✅ |
| INFRA-005 | Shared packages baseline | ✅ |
| INFRA-006 | Env strategy + Supabase placeholders | ✅ |
| INFRA-007 | Lint/format/typecheck + CI | ✅ |
| INFRA-008 | EAS placeholder | ✅ |
| INFRA-009 | Design tokens placeholder | ✅ |
| INFRA-010 | Mobile app shell | ✅ |
| INFRA-011 | Admin app shell | ✅ |
| INFRA-012 | Workspace imports | ✅ |
| INFRA-013 | Env-safe config placeholders | ✅ |
| INFRA-014 | Testing placeholders | ✅ |

---

## 3. Infrastructure Checklist

| Area | Expected | Status | Notes | Required Action |
|------|----------|:------:|-------|-----------------|
| Repo structure | `/apps/{mobile,admin}`, `/packages/{ui,types,validators,config,analytics}`, `/supabase/{migrations,functions,seed,tests}`, `/docs` | pass | Matches Architecture §6; no service/microservice dirs; docs preserved (22 files) | — |
| pnpm workspace | root `package.json` + `pnpm-workspace.yaml` (`apps/*`,`packages/*`) | pass | `packageManager: pnpm@9.15.0`; consistent `@social-events/*` names | install + lockfile (§6) |
| TypeScript | strict base; packages extend it; apps framework-tuned | pass | base has strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + …; all 5 packages extend `../../tsconfig.base.json` | run `tsc` once installed |
| Expo mobile | Expo Router shell, TS, no product/SDK | pass | placeholder routes only; no Supabase/auth/analytics | `expo install --fix` |
| Next.js admin | App Router shell, TS, no auth/service role | pass | 9 placeholder routes + shell; no data/auth | verify build once installed |
| Shared packages | manifest+tsconfig+`src/index.ts` each | pass | all 5 present; packages have **zero** external deps | — |
| Env examples | root + per-app `.env.example`; real ignored | pass | all credential placeholders empty; `.gitignore` covers real env, keeps `*.example` | — |
| Supabase placeholders | folders + READMEs, no SQL | pass | only READMEs; **no `.sql`/migrations/functions/seed** | — |
| CI | format/typecheck/lint/test, no secrets/deploy | pass | `ci.yml` runs the 4 checks; no secrets/deploy/migrate | needs committed lockfile to run |
| EAS | `eas.json` profiles placeholder | pass | `development`/`preview`/`production`; no submit/credentials/bundle IDs | decide bundle IDs later |
| Design tokens | semantic tokens, no components, no React in ui | pass | colors/spacing/radius/typography/shadows/zIndex; no react import; trust = Verified badge only | confirm hex vs Figma |
| Mobile shell | route-group placeholders, no auth gate | pass | `(public)/(onboarding)/(app)/(modals)`; no gating/product | — |
| Admin shell | placeholder pages, no real data | pass | each page states "no real admin data / no Supabase/service role" | — |
| Workspace imports | apps import `@social-events/*`; no deep relative | pass | both apps depend on all 5 (`workspace:*`); Next `transpilePackages`; no `../../packages/*/src` imports | — |
| Config layer | public vs server split; no secrets/UI display | pass | shared has no `process.env`; mobile=EXPO_PUBLIC_* only; admin server-only guarded by `import 'server-only'`, not imported by routes | — |
| Testing placeholders | strategy doc + smoke test, no product/RLS tests | pass | Vitest (packages only) + 1 config smoke test; mobile/admin test dirs are READMEs; RLS deferred | run `pnpm test` once installed |

---

## 4. Safety / Product Core Audit

| Invariant | Status | Evidence | Risk | Action |
|-----------|:------:|----------|:----:|--------|
| Exact location never visible to non-approved | pass | No location logic exists anywhere; no `event_locations`/SQL | none | enforce at RLS in Sprint 3 |
| No open DMs | pass | No messaging/chat code | none | — |
| Raw trust score never shown | pass | No trust logic; `trust.*` tokens are Verified-badge colors only | none | — |
| No public ratings | pass | No rating code/UI | none | — |
| No dating mechanics | pass | No swipe/match; tokens explicitly anti-dating | none | — |
| No payments/tickets | pass | None present | none | — |
| Service role never exposed | pass | Not in mobile; admin `serverEnv.ts` `import 'server-only'`, not imported by any route; never behind public prefix | none | keep guard when real client added |
| Admin-only data not in mobile | pass | Admin is a separate Next app; mobile has no admin refs | none | — |
| No sensitive data in analytics | pass | No analytics SDK connected; only empty public placeholders | none | enforce when PostHog added |
| No product logic implemented prematurely | pass | Only placeholders/shells/tokens/config helpers/1 smoke test | none | — |
| No microservices | pass | One monorepo, one Supabase target; no service/backend dirs | none | — |

**Result: all safety invariants intact.** No infrastructure task violated Product Core.

---

## 5. Dependency Audit

| Package/App | Dependencies Added | Expected? | Risk | Notes |
|-------------|--------------------|:---------:|:----:|-------|
| root | dev: eslint, @eslint/js, typescript-eslint, prettier, typescript, @types/node, vitest | ✅ | none | tooling only |
| apps/mobile | expo, expo-router, expo-constants, expo-linking, expo-status-bar, react, react-native, react-native-safe-area-context, react-native-screens + 5 `@social-events/*` (`workspace:*`); dev: @babel/core, @types/react | ✅ | low | versions unverified (Medium issue) |
| apps/admin | next, react, react-dom + 5 `@social-events/*` (`workspace:*`); dev: eslint-config-next, @eslint/eslintrc, @types/{node,react,react-dom} | ✅ | low | versions unverified |
| packages/ui | none | ✅ | none | tokens only, no React |
| packages/types | none | ✅ | none | — |
| packages/validators | none | ✅ | none | Zod intentionally not added yet |
| packages/config | none | ✅ | none | — |
| packages/analytics | none | ✅ | none | PostHog intentionally not added yet |

**Forbidden-dependency scan (Supabase, PostHog, Sentry, AI SDKs, auth libs, DB clients, UI component libs, microservice/backend frameworks): NONE found.**

---

## 6. Commands Run

| Command | Result |
|---------|--------|
| repo tree / structure inspection | ✅ complete |
| `node` JSON parse of all manifests/tsconfigs | ✅ valid |
| forbidden-dep / forbidden-import grep | ✅ none found |
| secret-value grep (`.env.example`) | ✅ all empty |
| supabase `*.sql`/code scan | ✅ none (READMEs only) |
| CI secrets/deploy/migrate scan | ✅ none |
| `pnpm format:check` | ❌ **not run** — `command not found: pnpm` |
| `pnpm typecheck` | ❌ **not run** — `command not found: pnpm` |
| `pnpm lint` | ❌ **not run** — `command not found: pnpm` |
| `pnpm test` | ❌ **not run** — `command not found: pnpm` |

**Severity of command failures:** High (operational) — pnpm is not installed and the npm registry is unreachable in this environment, so no install/validation could run. Static validation (syntax/JSON/grep) was used as a substitute throughout INFRA-001…014. The runnable validation is a required pre-Sprint-2 step, not a code defect.

---

## 7. Issues Found

| Issue ID | Severity | Area | Description | Impact | Recommended Fix | Blocks Sprint 2? |
|----------|:--------:|------|-------------|--------|-----------------|:----------------:|
| INFRA-REV-001 | High | Toolchain/CI | Nothing executed; no `pnpm-lock.yaml`. `format:check`/`typecheck`/`lint`/`test` unverified. CI uses `--frozen-lockfile` → cannot pass without a committed lockfile. | Foundation not verified-runnable; CI non-functional | Install pnpm (`npm i -g pnpm@9`), `pnpm install`, commit `pnpm-lock.yaml`, `npx expo install --fix`, `pnpm format`, then confirm `typecheck`/`lint`/`test` green | Yes — clear before product code/CI reliance |
| INFRA-REV-002 | Medium | Versions | Hand-authored Expo SDK 52 / Next 15 / React (18 mobile vs 19 admin) pins are best-effort, unverified | Possible install/version drift | `npx expo install --fix`; reconcile admin on first install | No (resolve during 001) |
| INFRA-REV-003 | Low | VCS | Repo is not a git repository | CI workflow inactive; no history | `git init`, initial commit, add remote | No |
| INFRA-REV-004 | Low | Cleanup | INFRA-012 smoke markers (`workspaceConfigCheck`, `workspace-check.ts` ×2) are temporary | Minor dead scaffolding | Remove when real shared types/config are consumed | No |
| INFRA-REV-005 | Low | Docs hygiene | `docs/14` (old pre-code gate) is superseded by `docs/16` but not annotated | Trace ambiguity | Add a one-line "superseded by 16" note on next docs pass | No |

---

## 8. What Is Ready

- Monorepo foundation (pnpm workspace, strict TypeScript base).
- Mobile skeleton (Expo Router shell, placeholder routes).
- Admin skeleton (Next.js App Router shell + 9 placeholder sections).
- Shared package structure (`@social-events/ui|types|validators|config|analytics`), zero external deps.
- Env strategy (`.env.example` ×3, gitignore boundary, public vs server-only rules).
- Placeholder Supabase structure (folders + READMEs, no SQL).
- CI definition (format/typecheck/lint/test; no secrets/deploy).
- EAS build profiles placeholder.
- Design tokens placeholder (semantic, anti-dating, no React).
- Workspace import wiring (`workspace:*`, Next `transpilePackages`, monorepo Metro).
- Env-safe config layer (public/server split, `server-only` guard).
- Testing scaffold (Vitest for packages + strategy doc + future safety-test list).

---

## 9. What Is Not Ready Yet (intentionally)

Auth · invite/beta gate · waitlist · onboarding · profiles · events/applications/chat/report · admin auth & moderation logic · Supabase project connection · Supabase client wrappers · DB migrations · RLS policies · location reveal · trust scoring · real analytics (PostHog) · Sentry · AI moderation · real product screens / Figma UI · running CI (needs lockfile).

These are deferred by design and gated behind Sprint 2+ tasks and human review.

---

## 10. Recommendation

### PASS WITH FIXES

Infrastructure is structurally complete and safe — no Critical issues, no safety-invariant violations, no forbidden dependencies, no premature product logic. Before Sprint 2 **product implementation**, clear **INFRA-REV-001** (install toolchain, generate & commit `pnpm-lock.yaml`, run `format:check`/`typecheck`/`lint`/`test` green, reconciling version drift via `expo install --fix`). INFRA-REV-002…005 are non-blocking follow-ups.

---

## 11. Next Recommended Step

1. **Clear INFRA-REV-001** (verification + lockfile) — required for a functional CI and a verified foundation.
2. **Create [`/docs/22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md`](22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md)** — the Infrastructure → Sprint 2 phase gate, and update `CLAUDE.md` §6 to authorize Sprint 2 work:
   - Auth (email/Google/Apple, sessions, protected routes, banned gate);
   - Invite-only beta gate;
   - Waitlist;
   - Onboarding;
   - Basic profile foundation.

> Sprint 2 product work remains **blocked** until both the new phase gate is approved (CLAUDE.md §6 currently authorizes Infrastructure only) and INFRA-REV-001 is cleared. The gate doc can be drafted in parallel with the verification fix.

---

## 12. Summary

- **Sprint 1 infrastructure review result: PASS WITH FIXES.**
- **Foundation safe?** Yes — every safety invariant is intact; no secrets, no service-role exposure, no SQL, no SDKs, no premature product logic.
- **Product Core intact?** Yes — nothing contradicts it; the Discover→Apply→Approve→Attend→Reconnect loop is unbuilt by design.
- **Modular Monolith intact?** Yes — one monorepo, one Supabase target, shared packages consumed in-process; no microservices/separate services/multiple databases.
- **Can Sprint 2 be considered?** Yes — after clearing INFRA-REV-001 (verification + lockfile) and opening the Sprint 2 phase gate with a `CLAUDE.md` update.

---

> Reminder: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) is the first source of truth. This review created no code, SQL, migrations, or SDK connections; it modified no implementation files.
