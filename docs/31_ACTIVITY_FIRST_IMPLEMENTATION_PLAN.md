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
| **2** | **Data layer** | `SupabaseActivitiesRepository` implementing the existing `ActivitiesRepository`; feed uses the counts RPC (evolve `ActivityView` to carry spot counts, not raw claims, for non-members); `getActivitiesRepository()` selector (mock ↔ supabase by `isSupabaseConfigured`). | `pnpm typecheck`; live queries return expected rows | AI |
| **3** | **Auth wiring** | Replace `MOCK_USER_ID` with the session user (`useAuthSession`); real email sign-up/login (screens exist); move prototype screens from `(proto)` back under the `(app)` gate. | sign up → land in app; user id flows into repo | AI |
| **4** | **Screens on real data** | Feed / Detail / Create / My Circles against Supabase; add **create-circle** and **join-circle** flows (missing from the mock). | manual E2E of the whole loop with 2 real accounts | AI + user |
| **5** | **Pull instrumentation** | Record `overflow`-source claims as the pull metric; a simple in-app counter / log for closed testing. | overflow claim increments the metric | AI |

## 4. Verification discipline

- Every TS increment: `pnpm --filter @social-events/mobile typecheck` green.
- **RLS is never trusted by eyeballing** — Phase 1 gates on live positive/negative tests (docs/30 is safety-first; a wrong policy leaks the product's core promise).
- Loop verified manually with **two real accounts** (owner + outsider) before v1 is "done".

## 5. Current state (2026-07-10)

- Prototype on mocks: complete & felt viable-by-form ([`(proto)`](../apps/mobile/app/(proto)) routes, `ACT-001…006`).
- **Phase 0 ✅** — Supabase project `antidot-dev` live; migrations applied via the session pooler; `.env` configured (publishable key only — DB password is kept **out of the repo**).
- **Phase 1 ✅** — [schema](../supabase/migrations/20260708000001_activities_mvp_schema.sql) + [RLS](../supabase/migrations/20260708000002_activities_mvp_rls.sql) + [counts RPC](../supabase/migrations/20260710000003_activities_feed_rpc.sql) applied and **RLS verified against the live DB** (positive + negative — the "no people list" privacy invariant holds at the DB layer).
- **Next: Phase 2** — `SupabaseActivitiesRepository` + repo selector + `ActivityView` carrying spot counts.
- Still-open product hypothesis (unchanged): **pull** — real-world test, separate from this build.

> Build order is strict: **0 ✅ → 1 ✅ → 2 → 3 → 4 → 5.**
