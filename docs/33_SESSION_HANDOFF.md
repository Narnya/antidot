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
- **Tranches (docs/32):** T1 ✅ Create Circle+Home · T2 ✅ membership (host-confirm) · T3 ✅ Report/Block · T4 ✅ Profiles · T5 ✅ Meeting reality (location reveal + attendance) · T6 ✅ Settings (blocked list + delete account). **All T1–T6 done — the activity-first MVP loop is complete.**

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
- **T6 ✅ (done)** — Settings screen: blocked-users list + unblock, sign out, and hard **delete account** via the `delete_own_account()` security-definer RPC (migration `20260711000008_delete_account.sql`, applied). Verified live: deleting a user cascades all their data (profile, memberships, claims, owned circles/activities/locations, blocks) while other users survive; unblock is self-only under RLS. Reachable from the home placeholder and the profile self-view.
- **Follow-up ✅ (done)** — onboarding now writes the real `profiles` row: `(onboarding)/start.tsx` is a minimal form (display name + city/area + safety-principles accept) that upserts the profile via the repo, then flips the nav flag. Returning users (existing profile) auto-advance. Verified live: self-only profile insert holds (a user can write only their own row). **Still pending:** the fully durable gate-from-profiles (the nav flag is still the in-memory `OnboardingPlaceholderProvider`) — that's the larger ONB-014 step.
- **Rewrite ✅ (done, 2026-07-12)** — doc 00 is now **Product Core v3 (activity-first)** with a lineage section; the full circle-first Core v2 is preserved verbatim at [`/docs/34_PRODUCT_CORE_V2_CIRCLE_FIRST_ARCHIVE.md`](34_PRODUCT_CORE_V2_CIRCLE_FIRST_ARCHIVE.md) («мы были когда-то circle-first»). CLAUDE.md binding sections (§0/§2 rule 6/§5/§6/§7/§8/§9/§12) re-pointed to activity-first. Lineage also saved to project memory. Remaining downstream docs (01–13) still carry circle-first wording — migrate opportunistically; v3 wins on conflict.
- **Pull metric ✅ (done)** — `getPullMetrics(userId)` counts overflow vs member occupying claims across the user's own circles (RLS-honest, no migration, aggregate-only); shown as a "Pull · закрытый тест" card on home. Verified live (owner: 0 overflow / 3 member). This is a closed-testing instrument — real analytics (PostHog) is later.
- **Product** — run the real-world **pull** test (the make-or-break; no-code, with people).

## 6. Discipline

Every code increment: `pnpm --filter @social-events/mobile typecheck` (green). **RLS is never trusted by eyeballing** — test against the live DB (positive + negative). Commits are conventional; secrets never committed (`.env` gitignored; grep for the key/password before every commit).
