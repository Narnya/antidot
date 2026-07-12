# CLAUDE.md — Operating Instructions for Claude Code

> This file governs how Claude Code works in this repository.
> It is binding. If anything below conflicts with implementation convenience, **this file and Product Core win.**
>
> **Updated:** 2026-07-12 — enforces **Product Core v3 (activity-first)** ([`/docs/00_PRODUCT_CORE.md`](docs/00_PRODUCT_CORE.md), decision record [`/docs/30_PRODUCT_DIRECTION_ACTIVITY_FIRST.md`](docs/30_PRODUCT_DIRECTION_ACTIVITY_FIRST.md)). Both the event-first (v0.1) and circle-first (v2) models are **superseded**. The circle-first Core is preserved as history in [`/docs/34_PRODUCT_CORE_V2_CIRCLE_FIRST_ARCHIVE.md`](docs/34_PRODUCT_CORE_V2_CIRCLE_FIRST_ARCHIVE.md) («мы были когда-то circle-first»).
>
> **Migration status:** this file has been re-pointed to activity-first at the binding sections (§0, §2 hard rule 6, §5, §6, §7, §8). Some later sections (§9 access, §11 belonging, §12 DB, §13 Figma) still carry **circle-first phrasing** — read them through the activity-first lens below. **On any conflict: activity-first (docs/00 v3 + docs/30–32) wins.** The circle-first vocabulary map is in §8.

---

## 0. First source of truth

**[`/docs/00_PRODUCT_CORE.md`](docs/00_PRODUCT_CORE.md) is the first source of truth.** As of 2026-07-12 this document is **Product Core v3 — activity-first** (supersedes circle-first v2 and event-first v0.1).

Before implementing any new feature, Claude **must** re-read and check against Product Core v3, plus the activity-first execution docs [`/docs/30`](docs/30_PRODUCT_DIRECTION_ACTIVITY_FIRST.md) (direction), [`/docs/31`](docs/31_ACTIVITY_FIRST_IMPLEMENTATION_PLAN.md) (plan), [`/docs/32`](docs/32_ACTIVITY_FIRST_MVP_SCREENS.md) (screens/tranches).

All other documents (`/docs/01_PRD.md` … `/docs/13_DESIGN_HANDOFF.md`) are downstream of Product Core and must reference it. **Many still hold circle-first (or event-first) wording** — that is the known migration state. **On any conflict, Product Core v3 (activity-first) wins.** If you spot superseded wording in a downstream doc, flag it; do not treat it as binding.

---

## 1. Mandatory pre-task checklist

At the start of **every coding task**, Claude must first answer briefly, before writing any code:

1. **Feature / task:** which task is being implemented.
2. **Which docs apply** (Product Core v3 sections + docs/30–32 + any relevant downstream doc).
3. **Whether Product Core v3 is affected** by this work.
4. **Which safety invariants apply** (out of the 16 in [`/docs/00_PRODUCT_CORE.md`](docs/00_PRODUCT_CORE.md) §14; see also §2 of this file).
5. **Which files will be changed.**
6. **Whether `package.json` will be modified.**
7. **Whether dependencies will be added.**
8. **Whether Supabase is being connected** (or any SDK).
9. **Whether the task touches sensitive data** (location, trust, moderation, audit).
10. **What is explicitly out of scope.**
11. **What tests / checks are needed** before declaring done.

Only after this short answer may implementation begin.

---

## 2. Hard rules (never violate)

These map directly to the Product Core v2 safety invariants. None of them may be broken for convenience. Numbering matches [`/docs/00_PRODUCT_CORE.md`](docs/00_PRODUCT_CORE.md) §35 where applicable.

### Carried forward from v0.1 (still binding)

1. **Exact meeting location is never visible to non-approved users** (Inv. 1). Reveal happens only on `approved_for_intro_meeting` for that single meeting, or on `member` for upcoming meetings.
2. **No open DMs.** Messaging exists only in **circle chat** in MVP. P1 mutual opt-in 1:1 is allowed only after shared context (members of the same circle who have attended at least one common meeting). No "write to participant" from a profile. (Inv. 2.)
3. **No raw trust score shown to users.** Only soft positive badges: Проверен / Надёжный участник / Уже проводил встречи / Участвовал во встречах. **Never a number.** (Inv. 3.)
4. **No public user ratings** of any kind.
5. **No public negative labels** — no "low trust", "often reported", "no-show", "removed", "rejected", etc.
6. **No dating *mechanics* (recalibrated in v3 — [`/docs/30`](docs/30_PRODUCT_DIRECTION_ACTIVITY_FIRST.md) §4).** The product's real goal is **знакомства через активность** (friends **and** romance). What stays forbidden: **swipe**, **browsing/listing people** (a catalog of people), **cold 1:1 messaging before a shared activity**, and **activity-as-pretext** for dating (ads/intent-signals/matching that foreground romance). Romance is permitted **only as an emergent, background outcome of repeated co-presence** — never a mechanic, ranking, or advertised promise. (Old v2 wording was "no romance, period"; that is superseded.)
7. **No payments, tickets, or monetization in MVP** for users.
8. **Every moderation-sensitive action must create an audit log** — ban, restriction, report review, **circle / meeting removal**, **membership removal** (host or admin), admin decision, freeze chat. (Inv. 4.)
9. **AI is assistant, not judge** for serious enforcement. AI may flag, sort, summarize, prioritize, triage. AI **never** decides bans or safety removals alone. (Inv. 5 / CLAUDE.md §2.)
10. **No exact user location.** City / district / approximate area / distance buckets only. **No live location ever.** (Inv. 9.)

### Operational guardrails (already binding from infrastructure docs)

11. **Blocked users cannot interact** with the blocker — cannot request membership in a circle they host, cannot see their meetings, cannot see their messages.
12. **Banned users cannot interact** with the product at all (auth gate; see future Sprint 2 banned-gate work).
13. **Service role is never exposed to the client.** Server-side only ([`/docs/19_ENV_CONFIG_STRATEGY.md`](docs/19_ENV_CONFIG_STRATEGY.md)). The admin app's `serverEnv.ts` carries `import 'server-only'`.
14. **Notifications and analytics must not leak sensitive data** — no exact location, no raw trust score, no report/block counts, no PII beyond what is strictly needed.
15. **Admin-only data is never available from the mobile app.** Admin endpoints, admin queues, audit logs, moderation actions are all admin-app-only.

### New in v2 — circle-specific anti-drift (Core v2 §35 invariants 11–16)

16. **No people marketplace.** No browsable / searchable / selectable catalog of users. Users discover **circles**, not people. (Inv. 13.)
17. **No public follower economy.** No followers, no audience, no public popularity counters.
18. **No swipe mechanics** anywhere.
19. **No betrayal mechanics.** The system never surfaces "X left for another circle", "X joined a new circle", "X paused you", or any equivalent transition signal. (Inv. 11.)
20. **No public leave / removal / rejection labels.** A user who leaves, pauses, is removed, is rejected, or is safety-removed simply disappears from the member list. Other members see at most **«Состав круга обновился.»** (Inv. 12.)
21. **No infinite discovery pressure.** "Found my circle and stopped searching" is a **success state**, not churn. The product must not nag users to join more circles or gamify circle count. (Inv. 14.)
22. **Circle membership is not ownership.** Circles do not own people; hosts curate circles, not people. (Inv. 15.)
23. **Users may belong to multiple circles.** No exclusivity, no "primary circle" badge, no notification on transitions. (Inv. 16.)

> **Trust system must never become social credit** (Inv. 10) — an umbrella that applies to rules 3, 4, 5, 17, 20. Trust is an internal safety/moderation signal, never a public ranking.

---

## 3. Conflict resolution

- If implementation convenience conflicts with Product Core v2 → **Product Core v2 has priority.**
- If a requested feature conflicts with a safety invariant (any of the 23 hard rules in §2) → **do not implement it silently.** Stop, state the conflict, and propose a product decision.
- When something is ambiguous → **propose a product decision and ask**, rather than silently making a technical decision that shapes the product.
- If a downstream doc (PRD, User Stories, Flows, Schema, RLS, Backlog, etc.) still uses **event-first** wording from v0.1 and contradicts Core v2 — **Core v2 wins**. Flag the stale wording for migration; do not act on it.

---

## 4. Documentation discipline

- All future documents must reference **Product Core v2** as the first source of truth.
- If reality forces a change to product direction, update [`/docs/00_PRODUCT_CORE.md`](docs/00_PRODUCT_CORE.md) **explicitly and deliberately** — do not let drift happen through code.
- Keep downstream docs consistent with Product Core; flag inconsistencies when found.
- The migration path is sequenced in [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md). Follow that order; do not skip into implementation.
- The migration history is preserved in [`/docs/22_PRODUCT_CORE_RECORE_PROPOSAL.md`](docs/22_PRODUCT_CORE_RECORE_PROPOSAL.md), [`/docs/24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md`](docs/24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md), [`/docs/25_PRODUCT_CORE_MANIFESTO.md`](docs/25_PRODUCT_CORE_MANIFESTO.md), [`/docs/26_PRODUCT_CORE_V2_DECISION.md`](docs/26_PRODUCT_CORE_V2_DECISION.md), [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md). Treat these as historical context, **not** as ongoing sources of truth — Core v2 is.

---

## 5. Scope discipline

- Build only what serves the **activity-first core loop** ([`/docs/00`](docs/00_PRODUCT_CORE.md) §3, [`/docs/30`](docs/30_PRODUCT_DIRECTION_ACTIVITY_FIRST.md) §2):
  > **Создай активность в круге → свои заполняют места → не хватает → открой городу (overflow) → чужой сам занимает слот → пришёл, сыграл → хост подтвердил → стал частью круга → возвращается.**
  > Two centres: **activity = вход** (feed / объявления), **circle (`Group`) = принадлежность** (My Circles). The make-or-break hypothesis inside the loop is **pull** (do people claim open slots themselves).
- The circle-first loop (Find vibe → Request a place → staged approval → Belong) and the earlier event-first loop are both **superseded**; do not reference them for prioritization unless a future accepted product decision restores them.
- If a feature does not serve the activity-first loop, it does not belong in the MVP — say so instead of building it.
- The **Non-goals** of Core v3 ([`/docs/00`](docs/00_PRODUCT_CORE.md) §12) are authoritative; do not implement anything on that list without an explicit product decision.

---

## 6. Current phase

**Activity-first MVP build (prototype phase) — on live Supabase (`antidot-dev`).**

Authorized by [`/docs/30_PRODUCT_DIRECTION_ACTIVITY_FIRST.md`](docs/30_PRODUCT_DIRECTION_ACTIVITY_FIRST.md) + [`/docs/31`](docs/31_ACTIVITY_FIRST_IMPLEMENTATION_PLAN.md). Sprint 1 Infrastructure is **complete and PASS**; auth/beta/onboarding scaffolding (Sprint 2) is in place. The activity-first MVP loop **T1–T6 is built and verified live** (see [`/docs/32 §5`](docs/32_ACTIVITY_FIRST_MVP_SCREENS.md) and the handoff [`/docs/33`](docs/33_SESSION_HANDOFF.md)).

> **Implementation is authorized for the activity-first loop, but still moves in verifiable increments.** Every code increment: `pnpm --filter @social-events/mobile typecheck` green; **RLS is never trusted by eyeballing** — test the live DB positive + negative; secrets never committed.

### Built (activity-first, live)

- **Circles (`groups`)**: create circle + Circle Home (aggregate composition, next activity).
- **Activities**: feed of open overflow slots, activity detail (area only, aggregate), create activity.
- **Slot claims**: claim a spot; `source = overflow` is the pull signal.
- **Membership**: host-confirm (overflow guest → member).
- **Meeting reality (T5)**: RLS-gated `meeting_locations` (reveal on active claim — Инв. 1) + host attendance (going/attended/no_show).
- **Safety (T3)**: `reports` + `blocks` (+ RLS).
- **Profiles (T4) + real minimal onboarding**: writes the `profiles` row.
- **Settings (T6)**: blocked list + unblock, sign out, delete account (`delete_own_account` RPC).

### Allowed now

- Iterating the activity-first loop and its screens (feed / detail / create / My Circles / Circle Home / profile / settings / onboarding);
- **activity-first DB migrations + RLS** in [`/supabase/migrations/`](supabase/migrations/) — the circle-first schema freeze is lifted for the activity-first model (migrations are applied to the live DB and RLS-verified);
- circle chat (P1), pull metric, trusted-radius (`group_links`) — when explicitly picked up;
- infrastructure maintenance, tooling, competitive research;
- Figma exploration marked as concept.

### Still blocked (binding — require a product decision + Core update)

- **open DMs / cold 1:1 before shared activity** (Инв. 2);
- **people marketplace** — any browsable/searchable catalog of people (Инв. 13; §12);
- **swipe / like / match**, follower economy, «who viewed me»;
- **dating *mechanics*** — romance foregrounded as a mechanic/promise (Hard rule 6, recalibrated §2);
- **service role exposed to mobile / client**;
- **raw trust score shown to users** (Инв. 3); **live/exact user location** (Инв. 9);
- **analytics / crash / AI-moderation SDK** connections; **trust scoring / moderation enforcement** implementation;
- **production credentials / real secrets** in the repo;
- **microservices** ([`/docs/17`](docs/17_ADR_MODULAR_MONOLITH.md) binding).

> Architecture remains **Modular Monolith** ([`/docs/17_ADR_MODULAR_MONOLITH.md`](docs/17_ADR_MODULAR_MONOLITH.md)) — the primitive change is product, not architecture. **All hard rules in §2 stay binding** (with rule 6 recalibrated). Anything on the Core v3 §12 non-goals list requires a separate task and, where applicable, a Product Core update — do not implement silently (§3).

---

## 7. Current Product Core (v3 — activity-first)

**Product Core v3 is the first source of truth.** The product is **activity-first** (no longer circle-first, no longer event-first).

Two centres on two axes ([`/docs/00`](docs/00_PRODUCT_CORE.md) §2):

- **Activity (Активность)** — примитив **входа/роста**: feed / объявления, overflow к чужим. *«Как ты входишь.»*
- **Circle (Круг / `Group`)** — примитив **возврата/принадлежности**: «Мои круги», ритм → retention. *«Почему остаёшься.»*

An **activity is never an orphan** — it always belongs to a circle. Positioning: **знакомства через активность** — friends **and** romance, where romance is a **background, emergent** outcome, never a mechanic (§2 rule 6).

**What we are building:**

> A way to **meet people through a shared real activity**: post an activity with open slots → your circle fills first → open the rest to the city → an outsider claims a slot themselves → shows up → becomes part of the circle → returns. Trust-first, safety-first, no swipe, no people-browsing, no cold DMs.

**What we are NOT building:**

- generic event app / event marketplace;
- **people marketplace** (Инв. 13);
- dating app / swipe / match;
- follower network;
- public rating system;
- cold outreach tool;
- nightlife / party app;
- Meetup / InParty clone;
- chat-first social network.

---

## 8. Vocabulary rules

Use the **activity-first vocabulary** in all new docs, code identifiers, comments, and user-facing copy. The **entry** primitive is the activity; the **belonging** primitive is the circle (`Group`).

| Concept | v3 term (binding) | Superseded |
|---|---|---|
| Entry primitive | **Activity / Активность** | ~~Circle Discovery as front door~~, ~~Event~~ |
| Discovery surface | **Activity Feed / лента, объявления** | ~~Circle Discovery marketplace~~ (Инв. 13) |
| Take a spot | **Занять слот** (`claimSlot`, `SlotClaim`) | ~~Запросить место~~, ~~Apply to Event~~ |
| Belonging primitive | **Circle / Круг** (code: `Group`) | — (carried; no longer the front door) |
| Become a member | **host-confirm** (overflow guest → member) | ~~Circle Membership Request~~, ~~staged approval~~ |
| Exact place | **Meeting Location** (`meeting_locations`, RLS-gated) | ~~Event Location~~ |
| Attendance | **going / attended / no_show** | — |
| Chat | **Circle Chat** (P1) | ~~Event Chat~~ |

**Russian user-facing language** must prefer:

- **Активность** (вход) / **Круг** (принадлежность) — not «событие»;
- **Занять слот** / **Занять место** (not «подать заявку», not «запросить место в круге»);
- **Открыть места городу** (overflow) — not «пригласить»;
- **Чат круга** (not «чат события»);
- **Принять в круг** (host-confirm) / **Участие подтверждено** (not «вы одобрены»);
- **Поставить участие на паузу** / **Выйти из круга** (private, non-stigmatizing);
- **Состав круга обновился** (the only signal on any leave/removal — Инв. 11–12).

> Circle vocabulary (Круг, Чат круга, пауза/выход, «Состав круга обновился») remains valid for the **belonging** half. What is superseded is the circle-first **entry** mechanic (Circle Discovery marketplace, «Запросить место», staged `approved_for_intro_meeting` lifecycle) — entry is now **claim a slot on an activity**.

**Do not introduce old event-first terminology in new user-facing UI** unless it is explicitly needed as transitional / internal wording (e.g., legacy code identifiers during the migration window). When in doubt, prefer the v2 term.

---

## 9. Access rules

> **v3 (activity-first) — how access actually works now:** the heavy circle-first staged lifecycle below (`approved_for_intro_meeting` → `intro_attended` → …) is **superseded**. In activity-first:
> - **Exact meeting location** reveals to anyone with an **active claim** (`going`/`attended`) on that activity, plus the host (Инв. 1; [`/docs/00`](docs/00_PRODUCT_CORE.md) §8). Not group membership — you claim a slot to see the place.
> - **Circle info + aggregate composition** is visible in the feed / detail to any user; **no browsable member list** (Инв. 13).
> - **Membership** is `active` after **host-confirm** of an overflow guest; there is no request/approval queue.
> - **Circle chat** (P1) is member-only.
> The table below is the **circle-first** model, kept for reference — read it through the v3 lens above; on conflict, v3 wins.

Claude Code must respect **staged access** per Core v2 §16 and §17. Access is keyed on **membership status**, not on a single "approved" boolean.

| State | Sees safe circle info | Sees aggregated composition | Sees full member safe profiles | Sees exact meeting location | Reads circle chat | Writes circle chat |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| `none` (discovering) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `requested` / `waitlisted` / `rejected` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `approved_for_intro_meeting` | ✅ | partial (host + rules) | partial (subset relevant to that meeting, per policy) | ✅ **only for that single meeting** | meeting-context only | meeting-context only |
| `intro_attended` | ✅ | ✅ | ✅ | post-window: location no longer surfaced | ✅ | ✅ |
| `member` | ✅ | ✅ | ✅ | ✅ for upcoming meetings within reveal window | ✅ | ✅ |
| `paused` | ✅ | ✅ | ✅ | ❌ (no upcoming locations) | per policy (read-only / muted, TBD) | ❌ |
| `left` / `removed` / `removed_for_safety` / `banned_from_circle` | per policy | ❌ | ❌ | ❌ | ❌ | ❌ |

> **No public shame** on any transition: removed/left/banned users simply disappear from the member list (rule 20 in §2). The most other members may see is **«Состав круга обновился.»**

---

## 10. Communication rules

**MVP communication surfaces (allowed):**

- **circle chat** — group chat for members of one circle;
- **meeting updates** — host-posted meeting-scoped announcements (visible inside circle chat with a meeting tag);
- **system messages** — lifecycle transitions, RSVP locks, reminders, "host approved your request";
- **report message** (rule 1 in §2 — Inv. 6 in Core v2);
- **block user** (rule 11);
- **admin freeze chat** as a moderation action (mandatory audit log per rule 8).

**Not allowed in MVP:**

- **open 1:1 DMs** (rule 2 — Inv. 2);
- **cold messages**;
- **direct messaging from profile**;
- **"write to participant" before shared context**.

**Possible P1 only** (after the core circle loop is validated):

- **mutual opt-in 1:1 after shared circle / meeting context.** Both users must be members of the same circle and have attended at least one common meeting; both must opt in; no free first message before acceptance; report/block always available.

> **Claude Code must not add DM tables, DM screens, "message user" CTAs, or direct chat routes** unless a future accepted product decision unlocks P1 1:1. Such a decision must come through a Product Core update, not a silent code change.

---

## 11. Belonging / membership ethics

Claude Code **must not** implement:

- betrayal states;
- public "left circle" labels;
- public "removed from circle" labels;
- public "rejected" labels;
- "left for another circle" logic;
- transition history between circles;
- public removal / rejection / leave counts;
- "X paused you" or "X muted you" surfaces;
- any per-user notification on another user's membership transitions.

**Use private and neutral language** in all user-facing copy:

- **«Поставить участие на паузу»**
- **«Выйти из круга»**
- **«Участие завершено»**
- **«Не в этот раз»**
- **«Состав круга обновился»**

Avoid:

- ~~«Вас отклонили»~~
- ~~«Вы не подошли»~~
- ~~«Вас исключили»~~
- ~~«Участник предал круг»~~
- ~~«Ушёл в другой круг»~~

> Belonging is a **success state** (rule 21 in §2 — Inv. 14). A user who attends their circle every two weeks and never opens discovery is the **target** outcome, not a retention failure. The product must not nag, gamify, or push them to join more circles.

---

## 12. Database / schema guardrails (activity-first)

> **Updated for v3.** The circle-first schema freeze is **lifted** for the activity-first model. Migrations now exist and are **applied to the live `antidot-dev` DB**.

- **Activity-first migrations are authorized and live** in [`/supabase/migrations/`](supabase/migrations/): `groups`, `group_memberships`, `group_links` (reserved), `activities`, `slot_claims`, `meeting_locations` (protected, RLS-gated), `reports`, `blocks`, `profiles`, plus RPCs (`feed_open_activities`, `activity_spots_taken`, `delete_own_account`). These are the current MVP core — see [`/docs/00`](docs/00_PRODUCT_CORE.md) §13.
- **RLS is never trusted by eyeballing.** Every table has RLS; any new/changed policy MUST be tested against the live DB **positive + negative** (simulate a real user via `request.jwt.claims`, or use a real JWT) before it protects users. A wrong policy leaks the product's core promise (Инв. 1).
- **Never expose the service role to the client** (Инв. 12). Self-service privileged actions (e.g. account deletion) use `security definer` RPCs scoped to `auth.uid()`, not the service role.
- **Secrets stay out of the repo.** The DB password is not committed; `.env` is gitignored. Grep the diff for keys/passwords before every commit.
- **Do not implement circle-first tables** (`circle_membership_requests`, staged intro-meeting lifecycle, etc.) as MVP core — that model is superseded. Do not implement old event-first tables either.
- **Still gated by a product decision:** any table/column that would enable a non-goal (open DM tables, a people catalog, live location, public trust scores).

---

## 13. Figma / design guardrails

- The existing Figma prototype ([[figma-prototype-build]]) is **event-first** and can be used as a **visual / interaction base only**.
- **Do not implement old Figma screens as product UI** until [`/docs/04_FIGMA_PROTOTYPE_PLAN.md`](docs/04_FIGMA_PROTOTYPE_PLAN.md) v2 and the updated screens exist.

Future Figma must map (mirror of §8 vocabulary):

- Discover → **Circle Discovery**
- Event Detail → **Circle Detail**
- Apply Modal → **Request Place**
- Event Chat → **Circle Chat**
- Create Event → **Create Circle**
- Applications List → **Membership Requests**
- Applicant Detail → **Request Detail**
- My Events → **My Circles**

New screens implied by Core v2:

- **My Circle Home** (belonging mode primary surface);
- **Pause / Leave** modal with non-stigmatizing copy;
- **Composition Settings** for hosts at circle creation.

---

## 14. Competitive guardrail

Competitor discovery — including InParty, Meetup, and dating-app comparisons — **does not justify copying competitor features**.

**Do not copy:**

- people marketplace;
- event marketplace chaos;
- online talk mode;
- paid boosts / pay-to-be-seen;
- public popularity counters;
- open contact mechanics;
- follower / audience metrics;
- "who viewed me";
- swipe / like / match.

**Our differentiation (binding):**

- recurring circles;
- trust-first;
- staged access;
- no cold DMs;
- vibe-based discovery;
- belonging mode.

> If a future [`/docs/23_COMPETITIVE_ANALYSIS_INPARTY.md`](docs/23_COMPETITIVE_ANALYSIS_INPARTY.md) is authored, it must reinforce these differentiators — not propose adopting competitor mechanics.

---

## 15. Documentation priority

Next required docs after Product Core v2 (sequenced by [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md) §24):

1. **PRD v2** ([`/docs/01_PRD.md`](docs/01_PRD.md)) — **next task.**
2. **User Stories v2** ([`/docs/02_USER_STORIES.md`](docs/02_USER_STORIES.md)).
3. **User Flows v2** ([`/docs/03_USER_FLOWS.md`](docs/03_USER_FLOWS.md)).
4. **Figma Prototype Plan v2** ([`/docs/04_FIGMA_PROTOTYPE_PLAN.md`](docs/04_FIGMA_PROTOTYPE_PLAN.md)).
5. **Database Schema v2** ([`/docs/06_DATABASE_SCHEMA.md`](docs/06_DATABASE_SCHEMA.md)).
6. **Security / RLS v2** ([`/docs/07_SECURITY_RLS.md`](docs/07_SECURITY_RLS.md)).
7. **Sprint Backlog v2** ([`/docs/11_SPRINT_BACKLOG.md`](docs/11_SPRINT_BACKLOG.md)).

Then secondary docs ([`08_TRUST_SYSTEM.md`](docs/08_TRUST_SYSTEM.md), [`09_MODERATION.md`](docs/09_MODERATION.md), [`10_ANALYTICS.md`](docs/10_ANALYTICS.md), [`13_DESIGN_HANDOFF.md`](docs/13_DESIGN_HANDOFF.md)), then the Sprint 2 phase gate ([`/docs/22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md`](docs/22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md), to be authored).

**Do not skip directly into implementation.** The implementation freeze in §6 (Blocked list) stays in effect until at least docs 00, 01, 02, 03, 06, 07, 11 and this CLAUDE.md are migrated to v2, **and** the Sprint 2 phase gate is authored and approved.

---

> Summary: think **product-first**, **safety-first**, **circle-first**. **Product Core v2** is the contract. When in doubt, surface the decision — don't drift.
