# CLAUDE.md — Operating Instructions for Claude Code

> This file governs how Claude Code works in this repository.
> It is binding. If anything below conflicts with implementation convenience, **this file and Product Core win.**
>
> **Updated:** 2026-05-29 — enforces **Product Core v2** (circle-first; HYBRID ACCEPT per [`/docs/26_PRODUCT_CORE_V2_DECISION.md`](docs/26_PRODUCT_CORE_V2_DECISION.md)). The previous event-first guidance is **superseded** by this file. See §0, §5, §6, §7 for the v2 model and the current migration phase.

---

## 0. First source of truth

**[`/docs/00_PRODUCT_CORE.md`](docs/00_PRODUCT_CORE.md) is the first source of truth.** As of 2026-05-29 this document is **Product Core v2** (circle-first; supersedes the event-first v0.1).

Before implementing any new feature, Claude **must** re-read and check against Product Core v2.

All other documents (`/docs/01_PRD.md` … `/docs/13_DESIGN_HANDOFF.md`) are downstream of Product Core and must reference it. Many of them **still hold v0.1 (event-first) wording** at the time of this CLAUDE.md update — that is the known migration state described in [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md). **On any conflict, Product Core v2 wins.** If you spot v0.1 wording in a downstream doc, flag it; do not treat it as binding.

---

## 1. Mandatory pre-task checklist

At the start of **every coding task**, Claude must first answer briefly, before writing any code:

1. **Feature / task:** which task is being implemented.
2. **Which docs apply** (Product Core v2 sections + any relevant downstream doc).
3. **Whether Product Core v2 is affected** by this work.
4. **Which safety invariants apply** (out of the 16 in [`/docs/00_PRODUCT_CORE.md`](docs/00_PRODUCT_CORE.md) §35; see also §2 of this file).
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
6. **No dating mechanics.** No swipe, match, like, "interested in", chemistry score, romantic ranking. Romance may emerge as a side effect of repeated co-presence; it must never be a product mechanic.
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

- Build only what serves the **circle-first core loop**:
  > **Find the right vibe → Request a place → Enter safely → Attend first meeting → Become part of the rhythm → Belong → Grow trusted graph.**
- The previous event-first loop (Discover Event → Apply → Approve → Attend → Reconnect) is **superseded** and must not be referenced for prioritization unless a future accepted product decision restores it.
- If a feature does not serve the circle-first loop, it does not belong in the MVP — say so instead of building it.
- The "Не входит в MVP" list and "Explicit Non-Goals" section of Core v2 ([`/docs/00_PRODUCT_CORE.md`](docs/00_PRODUCT_CORE.md) §26) are authoritative; do not implement anything on it without an explicit product decision.

---

## 6. Current phase

**Product Core v2 Documentation Migration Phase.**

Sprint 1 Infrastructure is **complete and PASS** ([`/docs/21_SPRINT_1_INFRASTRUCTURE_REVIEW.md`](docs/21_SPRINT_1_INFRASTRUCTURE_REVIEW.md), updated 2026-05-28 after FIX-INFRA-001). Product implementation is **paused** until the v2 downstream docs are migrated per [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md).

### Allowed now (documentation migration + infra maintenance)

- update [`/docs/01_PRD.md`](docs/01_PRD.md) to **PRD v2**;
- update [`/docs/02_USER_STORIES.md`](docs/02_USER_STORIES.md) to **User Stories v2**;
- update [`/docs/03_USER_FLOWS.md`](docs/03_USER_FLOWS.md) to **User Flows v2**;
- update [`/docs/04_FIGMA_PROTOTYPE_PLAN.md`](docs/04_FIGMA_PROTOTYPE_PLAN.md) to **Figma Plan v2**;
- update [`/docs/06_DATABASE_SCHEMA.md`](docs/06_DATABASE_SCHEMA.md) to **Schema v2** (blueprint only, no SQL);
- update [`/docs/07_SECURITY_RLS.md`](docs/07_SECURITY_RLS.md) to **RLS v2** (policy design only);
- update [`/docs/08_TRUST_SYSTEM.md`](docs/08_TRUST_SYSTEM.md), [`/docs/09_MODERATION.md`](docs/09_MODERATION.md), [`/docs/10_ANALYTICS.md`](docs/10_ANALYTICS.md) to v2;
- update [`/docs/11_SPRINT_BACKLOG.md`](docs/11_SPRINT_BACKLOG.md) to **Sprint Backlog v2**;
- author [`/docs/22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md`](docs/22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md) as the future Sprint 2 phase gate **after** docs 00, 01, 02, 06, 07, 11 land;
- infrastructure maintenance (lockfile, lint, format, type-check, CI);
- tooling fixes;
- competitive research (e.g., authoring [`/docs/23_COMPETITIVE_ANALYSIS_INPARTY.md`](docs/23_COMPETITIVE_ANALYSIS_INPARTY.md));
- Figma exploration **clearly marked as concept**, not canonical implementation source;
- **generic auth planning** (sessions, protected routes, banned gate, invite gate, waitlist) — primitive-agnostic, allowed only if it does not depend on onboarding / product fields.

### Blocked until v2 docs are updated

- **onboarding implementation** (the new fields — vibe primary, rhythm, comfort composition, group size, host willingness — cannot be retrofitted after activation);
- **profile field implementation**;
- **circle discovery implementation**;
- **circle product UI** (Circle Discovery, Circle Detail, Request a Place, Membership Pending, Intro Invitation, Circle Chat, Create Circle, Membership Requests, My Circles, etc.);
- **database migrations** (`.sql` files in [`/supabase/migrations/`](supabase/migrations/));
- **SQL** of any kind;
- **RLS policies**;
- **circle / meeting business logic**;
- **circle chat logic**;
- **membership request logic**;
- **analytics SDK implementation** (PostHog connection);
- **trust scoring** implementation;
- **moderation enforcement** implementation;
- **AI moderation SDK** connections;
- **production credentials**, real secrets.

> Architecture remains **Modular Monolith** ([`/docs/17_ADR_MODULAR_MONOLITH.md`](docs/17_ADR_MODULAR_MONOLITH.md)) — primitive change is product, not architecture. **All 23 hard rules in §2 stay binding** through the migration. Anything in the "Blocked" list, or any item on the Core v2 §26 non-goals list (open DMs, payments/tickets, dating mechanics, public ratings, exact public map pins, live location, people marketplace, swipe, follower economy), requires a separate task and, where applicable, a Product Core update — do not implement silently (§3).

---

## 7. Current Product Core (v2)

**Product Core v2 is the first source of truth.** The product is **no longer event-first**.

The accepted model is:

- **Circle-first UX**;
- **Meeting-based operations**;
- **Vibe-based discovery**;
- **Context-first communication**;
- **Trust-first safety model**.

- **Primary user-facing primitive:** **Circle / Круг.**
- **Operational primitive:** **Meeting / Встреча круга.**

Events from the previous model are **superseded** as a standalone MVP primitive. Events become **meetings inside circles**.

**What we are building:**

> An **operating system for trusted social circles**. Users safely enter small recurring social circles, attend regular offline meetings, communicate in context, and build trust through repeated presence.

**What we are NOT building:**

- generic event app;
- event marketplace;
- people marketplace;
- dating app;
- follower network;
- swipe app;
- public rating system;
- cold outreach tool;
- nightlife / party app;
- Meetup clone;
- InParty clone;
- chat-first social network.

---

## 8. Vocabulary rules

Use the **new vocabulary** in all new docs, code identifiers, comments, and user-facing copy:

| Old (v0.1, superseded) | New (v2, binding) |
|---|---|
| Event Discovery | **Circle Discovery** |
| Event Detail | **Circle Detail** |
| Event Creation | **Circle Creation** |
| Apply to Event | **Request a Place** |
| Event Application | **Circle Membership Request** |
| Event Attendee | **Circle Member** / **Meeting Attendee** |
| Event Chat | **Circle Chat** |
| Event Location | **Meeting Location** |
| Event Host | **Circle Host** |
| Event Lifecycle | **Circle Lifecycle + Meeting Lifecycle** |

**Russian user-facing language** must prefer:

- **Круг** (not «событие» in user-facing copy);
- **Встреча круга** (not «событие»);
- **Запросить место** (not «подать заявку»);
- **Чат круга** (not «чат события»);
- **Участие подтверждено** (not «вы одобрены»);
- **Поставить участие на паузу** (not «выйти», where pause is available);
- **Не в этот раз** (not «отклонено», where soft rejection is appropriate — see [`/docs/00_PRODUCT_CORE.md`](docs/00_PRODUCT_CORE.md) §19).

**Do not introduce old event-first terminology in new user-facing UI** unless it is explicitly needed as transitional / internal wording (e.g., legacy code identifiers during the migration window). When in doubt, prefer the v2 term.

---

## 9. Circle access rules (staged)

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

## 12. Database / schema guardrails

- **Do not create migrations** until [`/docs/06_DATABASE_SCHEMA.md`](docs/06_DATABASE_SCHEMA.md) v2 is complete and approved.
- **Do not write SQL.**
- **Do not implement RLS policies** until [`/docs/07_SECURITY_RLS.md`](docs/07_SECURITY_RLS.md) v2 is complete and approved.
- **Do not implement old event-first tables** as current MVP core. The event-first schema is **conceptually superseded**.
- The [`/supabase/migrations/`](supabase/migrations/), [`/supabase/functions/`](supabase/functions/), [`/supabase/seed/`](supabase/seed/), [`/supabase/tests/`](supabase/tests/) directories must remain empty until the Sprint 2 schema task explicitly authorizes content.

Future v2 schema should use circle / meeting concepts (conceptual table names, **not** an instruction to create them now):

- `circles`;
- `circle_membership_requests`;
- `circle_memberships`;
- `circle_meetings`;
- `meeting_locations` (protected, RLS-gated);
- `meeting_rsvps`;
- `meeting_attendance`;
- `circle_chat_messages`.

These map to the entity list in Core v2 §27. **Do not create them until an explicit schema task lands.**

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
