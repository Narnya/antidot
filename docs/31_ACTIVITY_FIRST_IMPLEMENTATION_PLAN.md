# Activity-First MVP — Implementation Plan

> **Status:** ✅ **ACTIVE build plan.** Executes [`/docs/30_PRODUCT_DIRECTION_ACTIVITY_FIRST.md`](30_PRODUCT_DIRECTION_ACTIVITY_FIRST.md).
> **Owner:** Product / Eng
> **Version:** v1 (2026-07-10)
> **Architecture:** Modular Monolith ([`/docs/17`](17_ADR_MODULAR_MONOLITH.md)) — unchanged.

---

## 1. Scope of v1 (the fill-the-slot loop, on real Supabase)

Ship the loop from docs/30 §2 end-to-end, on a real backend, for closed testing:

> Create an activity in a circle → own group fills → open to the city → an outsider claims a slot themselves → attends → becomes part of the circle → returns.

Two centres (docs/30 §1): **activity** (entry — feed / объявления) + **circle** (belonging — My Circles home).

**In scope v1:** auth (email + session), create/join a circle, create an activity, city feed of open slots, claim a slot (with the `member`/`overflow` pull signal), activity detail (area only, aggregate composition), My Circles, RLS enforcement, the pull metric.

## 2. Explicitly out of scope for v1 (carried from docs/30)

Exact-location reveal, circle chat, trust scoring, moderation queue, AI moderation, romance/dating features, women-only composition, trusted radius (`group_links` stays reserved), analytics SDK (PostHog), Sentry, payments.

## 3. Phases

| # | Phase | What | Verify | Who |
|---|---|---|---|---|
| **0 ✅** | **Supabase project** | Project `antidot-dev` created (region eu-central-1); `.env` set with URL + publishable key; **both migrations applied** by AI via the IPv4 **session pooler** (direct `db.<ref>` is IPv6-only → "no route to host"). | `isSupabaseConfigured` true; **5 tables present, RLS enabled** ✓ | User (project) + AI (apply) |
| **1 ✅** | **Backend foundation** | Schema + RLS + counts RPC (`feed_open_activities`, `activity_spots_taken`) applied to live DB. | **RLS verified live, positive + negative** ✓: outsider sees an overflow activity + aggregate count but **not who is going**, not `group_only`, not memberships; member sees all. | AI |
| **2 ✅** | **Data layer** | `SupabaseActivitiesRepository` + `getActivitiesRepository()` selector (mock ↔ supabase by `isSupabaseConfigured`); `ActivityView` carries spot counts (feed uses the RPC, not raw claims). | typecheck green + **live E2E**: feed RPC returns the overflow activity with `spots_taken` via a real JWT. | AI |
| **3 ✅** | **Auth wiring** | `useActivitiesRepo()` hook → session user (`useAuthSession`) + selector; activity routes moved `(proto)` → `(app)` gate; ungated preview retired. | typecheck green; **sign-in + RLS + RPC verified live** (outsider sees overflow + count, not `group_only`, not claim rows). In-app signup UX (email validator / confirm) still open. | AI |
| **4** | **Screens on real data** | Feed / Detail / Create / My Circles against Supabase; add **create-circle** and **join-circle** flows (missing from the mock). | manual E2E of the whole loop with 2 real accounts | AI + user |
| **5 ✅** | **Pull instrumentation** | `getPullMetrics(userId)` aggregates `overflow` vs `member` occupying claims across the user's own circles (RLS-honest, no new migration, aggregate-only — no PII); surfaced as a "Pull · закрытый тест" card on the home screen. | overflow claim increments the metric — **built; typecheck green; verified live (owner: 0 overflow / 3 member)** | AI |

## 4. Verification discipline

- Every TS increment: `pnpm --filter @social-events/mobile typecheck` green.
- **RLS is never trusted by eyeballing** — Phase 1 gates on live positive/negative tests (docs/30 is safety-first; a wrong policy leaks the product's core promise).
- Loop verified manually with **two real accounts** (owner + outsider) before v1 is "done".

## 5. Current state (2026-07-11)

- **Phase 0 ✅** — Supabase project `antidot-dev` live; migrations applied via the session pooler; `.env` configured (publishable key only — DB password kept **out of the repo**).
- **Phase 1 ✅** — schema + RLS + counts RPC applied; **RLS verified live** (positive + negative — the "no people list" invariant holds at the DB layer).
- **Phase 2 ✅** — `SupabaseActivitiesRepository` + selector + `ActivityView` spot counts; typecheck + live E2E.
- **Phase 3 ✅** — screens use the session user via `useActivitiesRepo()`; activity routes under the `(app)` gate; `(proto)` preview retired. **Full stack verified live with a real JWT** (auth → RLS → RPC + REST).
- Demo data + test accounts seeded in the live project: `owner.antidot@gmail.com` / `outsider.antidot@gmail.com` (pw `Passw0rd!`); circle «Четверговый футбол» with two activities.
- **Next: Phase 4** — manual E2E in the app with two accounts (login works; in-app *signup* UX — email validator + confirm — still open). **Phase 5** — pull metric.
- Still-open product hypothesis (unchanged): **pull** — real-world test, separate from this build.

> Build order: **0 ✅ → 1 ✅ → 2 ✅ → 3 ✅ → 4 ✅ → 5 ✅.** All phases built on live Supabase; the MVP loop (T1–T6, docs/32) + pull instrumentation are in place. Remaining is the real-world **pull test** with people (no-code) and opportunistic downstream-doc migration.
