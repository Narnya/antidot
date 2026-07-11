# Session Handoff — Activity-First MVP Build (continue here)

> **Date:** 2026-07-11 · **Branch:** `feat/activity-first-mvp` · **Purpose:** let you (or a fresh Claude session) continue after a large build session that pivoted the product to **activity-first**, built the MVP core on a live Supabase backend, and designed 15 screens in Figma.

---

## 0. Read these first (source of truth, in order)

1. [`/docs/30_PRODUCT_DIRECTION_ACTIVITY_FIRST.md`](30_PRODUCT_DIRECTION_ACTIVITY_FIRST.md) — the product direction. **SUPERSEDES the circle-first Product Core v2 (doc 00) and CLAUDE.md §2/§7 for product shape.**
2. [`/docs/31_ACTIVITY_FIRST_IMPLEMENTATION_PLAN.md`](31_ACTIVITY_FIRST_IMPLEMENTATION_PLAN.md) — build plan (Phases 0–5).
3. [`/docs/32_ACTIVITY_FIRST_MVP_SCREENS.md`](32_ACTIVITY_FIRST_MVP_SCREENS.md) — screen inventory + tranches T1–T6.
4. This doc.

> ⚠️ **CLAUDE.md is stale (circle-first / anti-dating).** Do NOT follow it for product decisions — docs/30 wins. CLAUDE.md §2 hard-rule 6 was recalibrated (see docs/30 §4). Rewriting doc 00 + CLAUDE.md to activity-first is an open follow-up.

## 1. What the product is now

**Activity-first "fill the slot."** Post an **activity** with open spots → your **circle** fills first → when short, open to the city → an outsider claims a slot themselves → attends → host confirms them → member → returns. Two centres: **activity = entry**, **circle = belonging**. Meeting people (friends + romance), romance **emergent/background**, never a mechanic. No swipe, no people-browsing, no cold DMs. See [[activity-first-meeting-direction]] memory.

**Still-open product hypothesis — PULL:** do people claim open slots *themselves*, without being personally recruited? **Unvalidated.** Only a real-world test with people answers it — this is the make-or-break, separate from code.

## 2. What's built (branch `feat/activity-first-mvp`)

- **Backend — live Supabase project `antidot-dev`.** All 6 migrations in [`/supabase/migrations/`](../supabase/migrations/) are **APPLIED to the live DB**: circles/memberships/links/activities/slot_claims + counts RPCs; reports + blocks; profiles + circle theme/rhythm. **RLS on every table, verified with a real JWT** (outsider sees an overflow activity + aggregate count but never who's going / group_only / claim rows).
- **Code — `apps/mobile` (Expo RN + TS).** Feature module [`src/features/activities`](../apps/mobile/src/features/activities): domain model + pure slot rules (+ tests) + repository interface + **mock impl** + **SupabaseActivitiesRepository** + selector `getActivitiesRepository()` (picks live vs mock by `isSupabaseConfigured`). Screens: Feed, Activity Detail, Create Activity, My Circles, **Create Circle**, **Circle Home** (+ host member-confirm), **Report**, **Profile** (self edit / public-safe + block). Routes under `app/(app)/`; entry redirect at `app/index.tsx`.
- **Figma** — file `xZkaKij7DhLPpRE3Ob0Znd`, section `581:118` "Activity-First MVP (v2)" = **15 screens** on token/design-system. Node IDs in [[figma-prototype-build]] memory.
- **Tranches (docs/32):** T1 ✅ Create Circle+Home · T2 ✅ membership (host-confirm) · T3 ✅ Report/Block · T4 ✅ Profiles · T5 ✅ Meeting reality (location reveal + attendance). **T6 remains.**

## 3. Run the MVP live (web)

```bash
pnpm --filter @social-events/mobile exec expo start --web --port 8090
```
Open **http://localhost:8090** (8081 is taken by VS Code). Flow: `/` redirects → Welcome → Login.
- **Test accounts** (seeded, live): `owner.antidot@gmail.com` / `outsider.antidot@gmail.com`, password **`Passw0rd!`**.
- **Dev gates:** invite code **`LOCAL-BETA`**; complete the onboarding placeholder. Then home → «Мои круги» / «Активности рядом» / «Создать».
- **E2E to try:** login as outsider → «Активности рядом» → claim a slot on «Футбол 5×5» → sign out → login as owner → «Мои круги» → «Четверговый футбол» → guest appears under «Гости, которых можно принять» → «Принять».
- Metro note: `metro.config.js` stubs `@opentelemetry/api` (supabase optional dep) — needed for web+native bundling.

## 4. Supabase access

- **URL + publishable (anon) key:** `apps/mobile/.env` (gitignored; present on this machine, safe in client).
- **DB password:** SECRET — in the owner's password manager, **NOT in the repo**. Needed only for direct psql/migrations. A fresh session must ask the user for it.
- **Apply migrations / run SQL** (use the IPv4 **pooler**; direct `db.<ref>.supabase.co` is IPv6-only → "no route to host"):
  ```bash
  PGPASSWORD='<db-password>' psql \
    -h aws-0-eu-central-1.pooler.supabase.com -p 5432 \
    -U postgres.omxvgcafqwwjlwnhrloc -d postgres -f <migration.sql>
  ```

## 5. What's next

- **T5 ✅ (done)** — exact meeting location in its own RLS-gated `meeting_locations` table (revealed only to users with an active claim — Inv. 1) + host attendance marking (going/attended/no_show; feeds attend→member + the pull signal). Migration `20260711000007_meeting_reality.sql` applied to the live DB; RLS verified positive + negative (claimant/host see the location & can mark attendance; non-claimant/non-host cannot). A demo location is seeded on «Футбол 5×5».
- **T6** — Settings (blocked-users list, delete account).
- **Follow-up** — real onboarding should write the `profiles` row (the placeholder currently only flips the dev "onboarded" flag).
- **Rewrite** doc 00 + CLAUDE.md to activity-first (retire the circle-first wording).
- **Product** — run the real-world **pull** test.

## 6. Discipline

Every code increment: `pnpm --filter @social-events/mobile typecheck` (green). **RLS is never trusted by eyeballing** — test against the live DB (positive + negative). Commits are conventional; secrets never committed (`.env` gitignored; grep for the key/password before every commit).
