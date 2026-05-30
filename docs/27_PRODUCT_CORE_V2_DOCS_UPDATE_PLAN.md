# Product Core v2 Docs Update Plan — Circle-first Migration

> **Status:** ✅ **MIGRATION PLAN — operational guide for updating downstream docs.**
> [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (v0.1) remains the **first source of truth** until step 1 of [§24](#24-recommended-migration-sequence) completes and replaces it with v2.
> **Owner:** Founder / Product / Technical Founder
> **Created:** 2026-05-29
> **Authorized by:** [`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md) (HYBRID ACCEPT, 2026-05-29).
> **Companion docs:** [`/docs/24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md`](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md) (proposal), [`/docs/25_PRODUCT_CORE_MANIFESTO.md`](25_PRODUCT_CORE_MANIFESTO.md) (principles), [`/docs/22_PRODUCT_CORE_RECORE_PROPOSAL.md`](22_PRODUCT_CORE_RECORE_PROPOSAL.md) (RU v0.3 predecessor).
> **Phase note:** repository is in Infrastructure Phase ([`CLAUDE.md`](../CLAUDE.md) §6, [`/docs/16_PHASE_GATE_TO_INFRASTRUCTURE.md`](16_PHASE_GATE_TO_INFRASTRUCTURE.md)). This plan does **not** edit any existing doc, write any code, schema, or migration, or connect any SDK. It defines **what** must change, **in what order**, and **what stays frozen** while the migration runs.
> **Existence checks at write time (2026-05-29):**
> - [`/docs/22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md`](22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md) does **not** exist (the only `22_*` doc is `22_PRODUCT_CORE_RECORE_PROPOSAL.md`). Item 9 of [§24](#24-recommended-migration-sequence) is a *future* gate doc to be authored as part of this migration.
> - [`/docs/23_COMPETITIVE_ANALYSIS_INPARTY.md`](23_COMPETITIVE_ANALYSIS_INPARTY.md) does **not** exist. Not blocking; optional companion.

---

## 1. Plan Status

This document is the **migration plan** for updating the project documentation from event-first to circle-first.

- It **does not itself modify** existing docs.
- It defines the **order**, **scope**, and **gates** of future updates.
- It is authorized by [`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md) (HYBRID ACCEPT).
- It is **not a phase gate** for product implementation. The Sprint 2 product-implementation gate ([`/docs/22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md`](22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md), to be written) is downstream of this plan.

**Current accepted decision:** HYBRID ACCEPT.

- **User-facing model:** Circle-first.
- **Operational model:** Meeting-based.

---

## 2. Why This Plan Exists

The project originally documented an **event-first MVP** in [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) v0.1 and all downstream artifacts (`01_PRD.md` through `15_FIGMA_TEST_PLAN_AND_RESULTS.md`).

The accepted v2 decision changes the **core primitive**:

- **From:** Event (single primitive — both user-facing and operational).
- **To:** **Circle** as user-facing primitive **+ Meeting** as operational primitive.

Because this impacts PRD, user stories, flows, schema, RLS, trust, moderation, analytics, Figma, and sprint backlog **simultaneously**, the documents must be updated in a **controlled order**. Otherwise the system will hold contradictory truths during the migration window — and Claude Code, designers, or future contributors will pick the wrong one.

This plan **sequences** the updates and defines the **gates** at which subsequent work may resume.

---

## 3. Migration Principles

Binding principles for the entire migration window:

1. **Do not update implementation before documentation.** Code is downstream of docs.
2. **Do not create migrations before Database Schema v2.** No `.sql` until [`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) v2 is merged.
3. **Do not implement onboarding before Product Core v2 and PRD v2.** The onboarding fields (vibe primary, rhythm, comfort composition, group size, host willingness) cannot be retrofitted after activation.
4. **Do not implement circle UI before Figma Prototype Plan v2.** [`/docs/04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) must be the canonical guide before any product screen is built.
5. **Do not implement RLS before Security/RLS v2.** [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md) must reflect circle / meeting / membership policies before any policy is authored.
6. **Infrastructure remains valid.** Nothing in the Infrastructure Phase work (Sprint 1, [`/docs/21_SPRINT_1_INFRASTRUCTURE_REVIEW.md`](21_SPRINT_1_INFRASTRUCTURE_REVIEW.md): PASS) is invalidated by this migration.
7. **Modular Monolith ADR remains valid.** [`/docs/17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md) is an architecture decision; primitive change is a product decision. No microservices, no separate databases.
8. **Product Core v2 becomes first source of truth only after [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) is updated.** Until then, v0.1 is the binding Core, and this plan plus doc 26 describe the *direction* of the rewrite, not its accepted text.

---

## 4. Current Freeze Rules

Until the documentation migration is complete (per §23 acceptance), the following remain **frozen**:

- onboarding implementation;
- profile field implementation;
- event / circle product screens (mobile and admin);
- database migrations (`.sql` files in [`/supabase/migrations/`](../supabase/migrations/));
- SQL of any kind;
- RLS policies;
- event / circle business logic;
- chat logic;
- trust scoring logic;
- moderation enforcement;
- analytics SDK implementation (PostHog connection);
- Sentry / AI moderation SDK connections;
- production credentials, real secrets.

**Allowed during the migration window:**

- documentation updates (this is the work);
- **generic auth planning** if it does not depend on onboarding fields (sessions, protected routes, banned gate, invite gate, waitlist — all primitive-agnostic);
- **infrastructure maintenance** (lockfile, lint, format, type-check, CI);
- **tooling fixes** (Prettier alignment, version drift cleanup);
- **competitive research** (e.g., authoring [`/docs/23_COMPETITIVE_ANALYSIS_INPARTY.md`](23_COMPETITIVE_ANALYSIS_INPARTY.md));
- **Figma exploration** clearly marked as concept / sketch — never as canonical implementation source until [`/docs/04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) v2 is merged.

---

## 5. Documents to Update

| Document | Current state | Required update | Priority | Blocks implementation? |
|---|---|---|:--:|:--:|
| [`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) | v0.1, event-first | full rewrite to v2 per [doc 26 §6, §7, §10, §16](26_PRODUCT_CORE_V2_DECISION.md); circle-first primitive, new loop, new lifecycles, +6 anti-drift invariants | **P0** | **Yes** (gates all product work) |
| [`01_PRD.md`](01_PRD.md) | event-first MVP modules | full rewrite around circle / meeting modules (§9 of this plan) | **P0** | **Yes** |
| [`02_USER_STORIES.md`](02_USER_STORIES.md) | event-first stories | rewrite around circle / meeting / membership flows (§10) | **P0** | **Yes** |
| [`03_USER_FLOWS.md`](03_USER_FLOWS.md) | event-first flows | rewrite around Find vibe → Request → Enter → Attend → Belong (§11) | **P0** | **Yes** |
| [`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) | event-first screen list | rewrite screen list per [doc 24 §29](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md) / §12 of this plan | **P1** | Yes (blocks Figma rebuild and screen impl) |
| [`05_ARCHITECTURE.md`](05_ARCHITECTURE.md) | domain split around events | **light** update — domain renames; Modular Monolith ADR unaffected (§13) | **P2** | No |
| [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) | event-first tables, enums, lifecycles | full rewrite to schema v2 blueprint (§14); no `.sql` | **P0** | **Yes** (gates all migrations) |
| [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) | event-application-anchored policies | rewrite around membership-based access, meeting-location protection, staged composition reveal (§15) | **P0** | **Yes** (gates RLS impl) |
| [`08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md) | per-event reliability signals | reanchor on membership continuity, repeat attendance, host reliability; soft badges preserved (§16) | **P1** | Partial (blocks trust impl, not auth) |
| [`09_MODERATION.md`](09_MODERATION.md) | event/user moderation | extend targets to circle / meeting; preserve Inv. 4, 5 (§17) | **P1** | Partial (blocks moderation impl) |
| [`10_ANALYTICS.md`](10_ANALYTICS.md) | event-first taxonomy | rename to circle / meeting taxonomy (§18); pick North Star candidate | **P1** | No (analytics SDK is not connected yet) |
| [`11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md) | event-first sprint plan | reorder Sprint 2+ around circle scope (§19) | **P0** | **Yes** (gates Sprint 2 backlog reliance) |
| [`13_DESIGN_HANDOFF.md`](13_DESIGN_HANDOFF.md) | event-first tokens / components | update around circle UI components and copy | **P2** | No |
| [`15_FIGMA_TEST_PLAN_AND_RESULTS.md`](15_FIGMA_TEST_PLAN_AND_RESULTS.md) | event-first flows test plan | author new circle-prototype test plan (history of doc 15 frozen as record) | **P2** | No |
| [`22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md`](22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md) | **does not exist** | author as new Sprint 2 phase gate **after** docs 00, 01, 02, 11 land; must reflect circle-aware onboarding fields | **P0** | **Yes** (gates Sprint 2 implementation) |
| [`CLAUDE.md`](../CLAUDE.md) | references Core v0.1 + Infrastructure Phase | update §0 and §6 to reference Core v2 once doc 00 is migrated; add anti-drift invariants 11–16 to §2 (§20) | **P0** | **Yes** (governs Claude Code behavior) |

**Unaffected by this migration:**

- [`05_ARCHITECTURE.md`](05_ARCHITECTURE.md) — *mostly* valid; only light updates (§13).
- [`12_IMPLEMENTATION_READINESS_REVIEW.md`](12_IMPLEMENTATION_READINESS_REVIEW.md) — historical record; freeze.
- [`14_PHASE_GATE_AND_PRODUCT_DECISIONS.md`](14_PHASE_GATE_AND_PRODUCT_DECISIONS.md) — historical; freeze.
- [`16_PHASE_GATE_TO_INFRASTRUCTURE.md`](16_PHASE_GATE_TO_INFRASTRUCTURE.md) — Infrastructure-only gate; unaffected.
- [`17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md) — architecture decision; unaffected.
- [`18_WORKSPACE_IMPORTS.md`](18_WORKSPACE_IMPORTS.md), [`19_ENV_CONFIG_STRATEGY.md`](19_ENV_CONFIG_STRATEGY.md), [`20_TESTING_STRATEGY.md`](20_TESTING_STRATEGY.md) — infra; unaffected.
- [`21_SPRINT_1_INFRASTRUCTURE_REVIEW.md`](21_SPRINT_1_INFRASTRUCTURE_REVIEW.md) — PASS; unaffected.
- [`22_PRODUCT_CORE_RECORE_PROPOSAL.md`](22_PRODUCT_CORE_RECORE_PROPOSAL.md), [`24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md`](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md), [`25_PRODUCT_CORE_MANIFESTO.md`](25_PRODUCT_CORE_MANIFESTO.md), [`26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md) — frozen as proposal / manifesto / decision records.

---

## 6. Recommended Update Order

### Phase A — Core Product Docs (P0)

1. [`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) → **Product Core v2**
2. [`01_PRD.md`](01_PRD.md) → **PRD v2**
3. [`02_USER_STORIES.md`](02_USER_STORIES.md) → **User Stories v2**
4. [`03_USER_FLOWS.md`](03_USER_FLOWS.md) → **User Flows v2**

### Phase B — Design Docs (P1 / P2)

5. [`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) → **Figma Plan v2**
6. [`13_DESIGN_HANDOFF.md`](13_DESIGN_HANDOFF.md) → **Design Handoff v2**
7. [`15_FIGMA_TEST_PLAN_AND_RESULTS.md`](15_FIGMA_TEST_PLAN_AND_RESULTS.md) → **Circle Prototype Test Plan** (new test plan; the v1 results stay as history)

### Phase C — Technical Docs (P0 / P1)

8. [`05_ARCHITECTURE.md`](05_ARCHITECTURE.md) → **Architecture addendum for circles** (light)
9. [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) → **Database Schema v2**
10. [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) → **Security / RLS v2**
11. [`08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md) → **Trust System v2**
12. [`09_MODERATION.md`](09_MODERATION.md) → **Moderation v2**
13. [`10_ANALYTICS.md`](10_ANALYTICS.md) → **Analytics v2**

### Phase D — Delivery Docs (P0)

14. [`11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md) → **Sprint Backlog v2**
15. [`22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md`](22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md) → **new Sprint 2 phase gate** (authored; does not currently exist)
16. [`CLAUDE.md`](../CLAUDE.md) → **Claude Code rules updated to reference Core v2**

> Items inside the same phase may be parallelized. Phases are strictly ordered: A → B → C → D, with the exception that **CLAUDE.md (item 16) may be updated immediately after item 1** to prevent Claude Code from reasoning against stale Core.

---

## 7. Vocabulary Migration

| Old term | New term | Notes |
|---|---|---|
| Event | **Circle** *or* **Meeting** depending on context | Discovery → Circle; scheduled instance → Meeting |
| Event Discovery | **Circle Discovery** | feed of circles, not events |
| Event Detail | **Circle Detail** | + secondary "Upcoming Meeting" section |
| Event Creation | **Circle Creation** | + "Schedule a Meeting" sub-flow |
| Apply to Event | **Request a Place** | one decision per circle, not per meeting |
| Event Application | **Circle Membership Request** | one request per (user, circle) |
| Event Attendee | **Circle Member** (durable) + **Meeting Attendee** (per-meeting) | two distinct concepts |
| Event Chat | **Circle Chat** | chat anchored to circle, not meeting |
| Event Location | **Meeting Location** | exact-location protection scoped to a meeting |
| Event Host | **Circle Host** | continuous role, not per-event |
| Event Lifecycle | **Circle Lifecycle** + **Meeting Lifecycle** | two lifecycles |
| RSVP | **Meeting RSVP** | per-meeting; no per-circle RSVP |
| Post-event Reconnect | **Belonging / Trusted Graph Growth** | reconnect becomes the durable outcome, not a one-off feature |

**Russian user-facing language** should prefer:

- **Круг** (not «событие» in user-facing copy);
- **Встреча круга** (not «событие»);
- **Запросить место** (not «подать заявку»);
- **Участие подтверждено** (not «вы одобрены»);
- **Чат круга** (not «чат события»);
- **Поставить участие на паузу** (not «выйти», where pause is available — see [doc 25 §12](25_PRODUCT_CORE_MANIFESTO.md));
- **Не в этот раз** (not «отклонено» — see [doc 25 §9](25_PRODUCT_CORE_MANIFESTO.md)).

> "Event" may still appear in **internal docs, code identifiers, or older artifacts** during the migration window. Any new user-facing copy written from doc 26 forward must use the new vocabulary.

---

## 8. Product Core v2 Update Scope

[`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) must, after update, include:

- **Circle-first product definition** ([doc 26 §6](26_PRODUCT_CORE_V2_DECISION.md));
- **Meeting-based operations** (operational primitive);
- **New loop** — Find vibe → Request → Enter safely → Attend first meeting → Become part of rhythm → Belong → Grow trusted graph ([doc 26 §7](26_PRODUCT_CORE_V2_DECISION.md));
- **Roles** updated — Guest, User, Circle Member (new), Circle Host, Admin/Moderator, System;
- **Circle lifecycle** — `draft → pending_review → live → paused → full → archived → removed_for_safety` ([doc 26 §10](26_PRODUCT_CORE_V2_DECISION.md));
- **Meeting lifecycle** — `scheduled → starting_soon → in_progress → completed → cancelled → removed_for_safety`;
- **Membership lifecycle** — `none → requested → approved_for_intro_meeting → intro_attended → member → paused → left → removed → removed_for_safety → banned_from_circle`;
- **Belonging mode** as success state ([doc 26 §15](26_PRODUCT_CORE_V2_DECISION.md));
- **No betrayal mechanics**;
- **No public shame**;
- **Staged composition reveal** ([doc 26 §12](26_PRODUCT_CORE_V2_DECISION.md));
- **Context-first communication** (circle chat only in MVP, [doc 26 §11](26_PRODUCT_CORE_V2_DECISION.md));
- **No open DMs** (Inv. 2 preserved);
- **Trust / safety invariants** — all 10 carried forward + 6 new anti-drift invariants ([doc 26 §16](26_PRODUCT_CORE_V2_DECISION.md));
- **MVP scope v2** ([doc 26 §9](26_PRODUCT_CORE_V2_DECISION.md));
- **Non-goals v2** ([doc 26 §5](26_PRODUCT_CORE_V2_DECISION.md)).

> The Core v2 update is a **deliberate rewrite**, not a patch — see §27 next step.

---

## 9. PRD v2 Update Scope

[`/docs/01_PRD.md`](01_PRD.md) sections that must change:

- Product Summary;
- Problem Statement;
- Target Audience;
- Product Principles;
- Core Product Loop;
- MVP Scope;
- User Roles;
- Circle Lifecycle;
- Meeting Lifecycle;
- Membership Lifecycle;
- Location Privacy Requirements;
- Safety Requirements;
- Trust Requirements;
- Analytics Requirements;
- Functional Requirements;
- Release Criteria.

**New PRD concepts to introduce:**

- **vibe-based discovery** (Manifesto §7);
- **recurring rhythm** (weekly / biweekly / monthly / flexible);
- **comfort composition** (open mixed / female-friendly / women-only / host-defined, gated by validation per [doc 26 §14](26_PRODUCT_CORE_V2_DECISION.md));
- **belonging as success state** ([doc 26 §15](26_PRODUCT_CORE_V2_DECISION.md));
- **My Circles** mode;
- **intro meeting** before full membership.

---

## 10. User Stories v2 Update Scope

[`/docs/02_USER_STORIES.md`](02_USER_STORIES.md) story areas:

- Auth — mostly unchanged (primitive-agnostic);
- Onboarding — updated for vibe / rhythm / comfort composition / group size / host willingness;
- Profiles — updated for circle context (vibe primary, soft badges);
- **Circle Discovery**;
- **Circle Creation** (+ "Schedule a Meeting" sub-flow);
- **Membership Requests**;
- **Intro Meeting**;
- **Circle Meetings** (RSVP, attendance, no-show);
- **Circle Chat**;
- **Pause / Leave / Removal** (low-drama copy per [doc 26 §13](26_PRODUCT_CORE_V2_DECISION.md));
- Report / Block (Inv. 6 preserved);
- Admin Moderation (targets extended to circle / meeting);
- Trust / Attendance (internal signals only — Inv. 3);
- Analytics (taxonomy renamed per §18).

**Remove or deprioritize:**

- standalone event application stories;
- event marketplace stories;
- one-off event discovery as core;
- post-event reconnect as a standalone event concept (reconnect becomes belonging-mode, the durable state).

---

## 11. User Flows v2 Update Scope

[`/docs/03_USER_FLOWS.md`](03_USER_FLOWS.md) required flows:

- Guest / Invite / Auth;
- Onboarding for circle fit (vibe, rhythm, comfort, group size);
- Circle Discovery;
- Circle Detail;
- Request a Place;
- Membership Pending;
- Intro Meeting Approved;
- Become Member (intro → member transition);
- My Circles / Belonging Mode (home);
- Circle Meeting RSVP;
- Circle Chat;
- Pause Participation;
- Leave Circle;
- Host Membership Review;
- Host Meeting Management;
- Report User / Message / Circle / Meeting;
- Admin Moderation;
- Location Reveal for Meeting (staged by membership status).

---

## 12. Figma Plan v2 Update Scope

[`/docs/04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) required screen changes:

| Existing | New |
|---|---|
| Discover | **Circle Discovery** |
| Event Detail | **Circle Detail** (+ Upcoming Meeting section) |
| Apply Modal | **Request Place** |
| Pending | **Membership Pending** |
| Approved | **Intro Meeting** / **Member State** |
| Event Chat | **Circle Chat** |
| Create Event | **Create Circle** (+ Schedule a Meeting) |
| Applications List | **Membership Requests** |
| Applicant Detail | **Request Detail** |
| My Events | **My Circles** |
| — (new) | **My Circle Home** / **Belonging Mode** |
| — (new) | **Pause / Leave** modal with non-stigmatizing copy |
| — (new) | **Composition Settings** for hosts |

**Design principles (binding for the rebuild):**

- no people marketplace;
- no dating UI (no hearts, no flirty imagery, no people-shopping grids);
- no cold DM entry;
- no public shame states (no "rejected" / "removed" labels);
- staged composition visibility ([doc 26 §12](26_PRODUCT_CORE_V2_DECISION.md));
- clear circle rhythm;
- clear comfort composition;
- clear location privacy state per membership.

> The current Figma file ([[figma-prototype-build]]) remains useful as a **visual / interaction base**, but no committed updates until [`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) v2 lands.

---

## 13. Architecture Update Scope

[`/docs/05_ARCHITECTURE.md`](05_ARCHITECTURE.md) remains **mostly valid**. Needed updates:

- **Domain model renames:**
  - Events Domain → **Circles + Meetings Domain**;
  - Applications Domain → **Membership Requests Domain**;
  - Messaging Domain → **Circle Chat Domain**;
- **Edge Function list** — rename event-anchored functions; no functions to be authored yet;
- **Realtime use** — circle-chat channels, meeting-status channels;
- **Storage references** — meeting-location storage protection;
- **Notifications** — meeting reminders, membership-status updates;
- **Admin dashboard references** — circle / meeting / membership detail screens.

**Modular Monolith ADR ([`/docs/17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md)) remains valid** — primitive change is product, not architecture. No microservices, no separate databases.

---

## 14. Database Schema v2 Update Scope

[`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) **must be rewritten before any migration**.

**New or renamed tables (conceptual):**

- `circles`
- `circle_membership_requests`
- `circle_memberships`
- `circle_meetings`
- `meeting_locations` (replaces `event_locations` — protected, RLS-gated)
- `meeting_rsvps`
- `meeting_attendance`
- `circle_chat_messages`
- `circle_chat_states` (frozen / unfrozen)

**Updated tables (shape preserved, scope extended):**

- `reports` — `target_type` extended (circle, meeting, message);
- `trust_events` — new event sources (membership transitions, repeat attendance);
- `notifications` — new types (meeting reminder, membership status);
- `moderation_actions` — new action types (freeze circle chat, force pause, remove member);
- `audit_logs` — event taxonomy extended;
- `user_blocks` — unchanged shape; propagation extended.

**Tables potentially removed or replaced as core:**

- `events`
- `event_locations`
- `event_applications`
- `event_attendees`
- `event_chat_messages`

> "Replaced" is the structural reality; "removed" is the desired user-facing outcome. The schema v2 doc must explicitly state which legacy tables are dropped and which are renamed.

**Hard rule:** **No SQL** may be authored until [`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) v2 is approved. The [`/supabase/migrations/`](../supabase/migrations/) folder remains empty.

---

## 15. Security / RLS v2 Update Scope

[`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md) must be updated around:

- **safe circle views** for non-members (aggregated composition only);
- **meeting location protection** gated by `membership_status` per [doc 24 §19](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md);
- **membership-based access** to circle resources;
- **intro-meeting-based access** to that one meeting's exact location;
- **circle chat access** for `member` only;
- **staged composition reveal** ([doc 26 §12](26_PRODUCT_CORE_V2_DECISION.md));
- **host permissions** scoped to circles they host;
- **pause / leave / removal** — removed members lose access immediately;
- **blocked users cannot request membership** against a circle whose host is the blocker;
- **removed users lose access** to upcoming meeting locations and circle chat;
- **women-only / comfort composition safeguards** if implemented (gated by §14 of [doc 26](26_PRODUCT_CORE_V2_DECISION.md)).

**Critical tests** that the RLS v2 doc must specify (tests authored later, in Sprint 3+):

- non-member cannot see exact meeting location;
- requested / waitlisted / rejected user cannot see exact meeting location;
- approved intro participant can see **only that meeting's** exact location;
- member can see upcoming meeting location;
- removed member loses **future** access;
- non-member cannot read circle chat;
- no public removal / rejection history;
- raw trust score not exposed under any role.

---

## 16. Trust System v2 Update Scope

[`/docs/08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md) must be updated around:

- **repeated meeting attendance** as a signal source;
- **circle membership reliability** (duration, pauses, leaves — all interpreted neutrally per [doc 26 §13](26_PRODUCT_CORE_V2_DECISION.md));
- **host reliability** (separate signal track);
- **no-show across meetings** (internal only, Inv. 3);
- **intro meeting outcomes** (neutral signals — intro-not-converted is administrative, not punitive);
- **pause / leave** are **neutral** — no negative trust impact;
- **removal** is internal — never public;
- **no public shame** ([doc 26 §13](26_PRODUCT_CORE_V2_DECISION.md));
- **no betrayal mechanics** (Inv. 11 / anti-drift §16 of [doc 26](26_PRODUCT_CORE_V2_DECISION.md)).

Trust remains:

- **internal**;
- **contextual**;
- expressed publicly only as **soft positive badges** (Verified / Reliable attendee / Hosted before / Attended events);
- **not social credit** (Inv. 10).

---

## 17. Moderation v2 Update Scope

[`/docs/09_MODERATION.md`](09_MODERATION.md) must be updated around:

- **circle reports** (new target type);
- **meeting reports** (new target type);
- **circle chat reports** (existing report-message extended);
- **membership removal** review;
- **host abuse** detection (internal signal, never public);
- **comfort composition violations**;
- **women-only / female-friendly violations** if implemented (gated by [doc 26 §14](26_PRODUCT_CORE_V2_DECISION.md));
- **social drama risk** — moderation copy avoids public shame;
- **audit logs** (Inv. 4 — all moderation-sensitive actions logged);
- **AI assistive only** (Inv. 5 / CLAUDE.md §2.11).

---

## 18. Analytics v2 Update Scope

[`/docs/10_ANALYTICS.md`](10_ANALYTICS.md) taxonomy migration:

| Old | New |
|---|---|
| `event_viewed` | `circle_viewed` |
| `application_created` | `circle_join_requested` |
| `application_approved` | `circle_membership_approved` |
| `event_attended` | `circle_meeting_attended` |
| `repeat_attendance` | `repeat_meeting_attendance` |
| `event_chat_opened` | `circle_chat_opened` |

**New metrics to define:**

- `active_trusted_circles`;
- `recurring_attendance` (repeat meeting attendance per member);
- `circle_retention` (members still active after N weeks);
- `membership_request_conversion`;
- `intro_meeting_conversion` (intro-attended → member);
- `member_retention` (longitudinal);
- `circle_health` (composite — attendance, no-show rate, chat liveness);
- **no metric** that creates "infinite discovery pressure" (e.g., no "circles per user" KPI — discovery is one tap away but not a target).

**North Star** — choose one of these two (final choice recorded in doc 10 update):

- **A:** trusted recurring offline interactions;
- **B:** active trusted circles with confirmed recurring attendance.

> Both candidates refine, not contradict, the current Core North Star.

---

## 19. Sprint Backlog v2 Update Scope

[`/docs/11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md) reorganization (illustrative — final structure decided in the doc 11 update):

| Sprint | Old scope (current backlog) | New scope (v2) |
|---|---|---|
| Sprint 2 | Auth + invite + waitlist + onboarding + profiles (event-anchored) | Auth + invite + waitlist (unchanged) + **onboarding with vibe / rhythm / comfort / group-size / host-willingness** + profiles (vibe-anchored) |
| Sprint 3 | Events Core (create, edit, discovery) | **Circles Core** (create circle, edit, pause, discovery feed of circles) |
| Sprint 4 | Applications + Location Reveal | **Membership Requests** + **Intro Meeting** + **Meeting Location Reveal** |
| Sprint 5 | Event Chat | **Circle Chat** |
| Sprint 6 | Admin moderation (event-anchored) | Admin moderation extended to **circle / meeting / membership** targets |
| Sprint 7 | Beta prep (event-anchored) | Beta prep for **circle-first** launch (My Circles home, belonging-mode setting) |

---

## 20. CLAUDE.md Update Scope

[`/CLAUDE.md`](../CLAUDE.md) must be updated after [`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) v2 is accepted and applied.

**Add to §2 Hard rules (mapped to the 6 new anti-drift invariants — see [doc 26 §16](26_PRODUCT_CORE_V2_DECISION.md)):**

- **Circle-first UX** is the user-facing model; "event" survives only as internal vocabulary;
- **Meeting-based operations** — scheduled instances under a circle;
- **No people marketplace** — no browsable user catalog;
- **No betrayal mechanics** — no system signal on membership transitions;
- **No public leave / removal / rejection labels** — member list simply no longer shows the person;
- **No infinite discovery pressure** — belonging mode is a first-class success state;
- **A user may belong to multiple circles** — no exclusivity.

**Update §6 phase guidance:**

- onboarding implementation **paused** until docs v2 (specifically 00, 01, 02, 11) updated;
- no migrations until [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) v2 approved;
- no RLS until [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) v2 approved;
- generic auth planning may continue (primitive-agnostic).

**Update §0:**

- [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) remains the *first source of truth* — but the doc now reflects Core v2 after step 1 of [§24](#24-recommended-migration-sequence).

> **Important sequencing:** the CLAUDE.md update should happen **immediately after** the [`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) update lands, so that Claude Code does not reason against stale Core for any meaningful window.

---

## 21. What Remains Valid

The migration **does not invalidate** any of the following:

- **infrastructure** — monorepo, pnpm workspace, TypeScript base ([`/docs/21_SPRINT_1_INFRASTRUCTURE_REVIEW.md`](21_SPRINT_1_INFRASTRUCTURE_REVIEW.md): PASS);
- **monorepo structure**;
- **Expo mobile skeleton** ([`apps/mobile/`](../apps/mobile/));
- **Next.js admin skeleton** ([`apps/admin/`](../apps/admin/));
- **shared packages** ([`packages/`](../packages/) — `ui`, `types`, `validators`, `config`, `analytics`, all empty by design);
- **config / env strategy** ([`/docs/19_ENV_CONFIG_STRATEGY.md`](19_ENV_CONFIG_STRATEGY.md));
- **tokens baseline** ([`packages/ui/`](../packages/ui/) — non-product semantic tokens, no React);
- **testing strategy** ([`/docs/20_TESTING_STRATEGY.md`](20_TESTING_STRATEGY.md));
- **CI** ([`.github/workflows/`](../.github/workflows/));
- **Modular Monolith ADR** ([`/docs/17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md));
- **safety philosophy** (all 10 Core invariants);
- **no open DMs** (Inv. 2);
- **no raw trust score** (Inv. 3);
- **no public ratings** (Core rule 5);
- **no exact public location** (Inv. 1, 9);
- **AI assistive only** (Inv. 5 / CLAUDE.md §2.11).

---

## 22. What Must Be Reworked

| Area | Why |
|---|---|
| Product Core | primitive change; new loop; +6 anti-drift invariants |
| PRD | derived from Product Core; all modules re-anchored |
| User Stories | derived from PRD; story set changes |
| User Flows | new loop; new lifecycles |
| Figma Plan | screen list changes |
| Database Schema | tables / enums / lifecycles change |
| RLS / Security | access policies re-anchored on membership |
| Analytics taxonomy | event names rename to circle / meeting |
| Sprint Backlog | sprint scopes reorder around circle work |
| Figma prototype | screen names and flows change |
| Onboarding fields | vibe primary, rhythm, comfort composition, group size, host willingness |
| Discovery screens | circle feed, never people feed |
| Application flow | replaced by membership request + intro meeting |
| Chat model | per-circle, not per-event |

---

## 23. Product Implementation Freeze

**Product implementation remains frozen** until at least these docs are updated:

1. [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md);
2. [`/docs/01_PRD.md`](01_PRD.md);
3. [`/docs/02_USER_STORIES.md`](02_USER_STORIES.md);
4. [`/docs/03_USER_FLOWS.md`](03_USER_FLOWS.md);
5. [`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md);
6. [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md);
7. [`/docs/11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md);
8. [`/CLAUDE.md`](../CLAUDE.md).

**Generic auth planning** may continue **only if** it does not implement onboarding / product fields. Auth itself is primitive-agnostic (sessions, protected routes, banned gate, invite gate, waitlist).

---

## 24. Recommended Migration Sequence

A linear, gated sequence. Each step finishes (merged) before the next begins, except where parallel marks are noted.

1. **Update [`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) to v2** — apply [doc 26 §6, §7, §10, §16](26_PRODUCT_CORE_V2_DECISION.md). Becomes the new source of truth on merge.
2. **Update [`CLAUDE.md`](../CLAUDE.md)** to reference Core v2 — immediately after step 1, to prevent Claude Code from reasoning against stale Core.
3. **Update [`01_PRD.md`](01_PRD.md) to PRD v2** (§9 of this plan).
4. **Update [`02_USER_STORIES.md`](02_USER_STORIES.md) to User Stories v2** (§10) — **may run in parallel with step 5**.
5. **Update [`03_USER_FLOWS.md`](03_USER_FLOWS.md) to User Flows v2** (§11) — **may run in parallel with step 4**.
6. **Update [`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) to Figma Plan v2** (§12).
7. **Update [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) to Schema v2** (§14).
8. **Update [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) to RLS v2** (§15).
9. **Update [`08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md) / [`09_MODERATION.md`](09_MODERATION.md) / [`10_ANALYTICS.md`](10_ANALYTICS.md) to v2** (§16, §17, §18) — **may run in parallel**.
10. **Update [`11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md) to v2** (§19).
11. **Create [`/docs/22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md`](22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md)** as the new Sprint 2 phase gate — references Core v2, PRD v2, Backlog v2; this is the gate that lets product implementation resume.
12. **Update the Figma prototype** in the canonical file ([[figma-prototype-build]]) per [`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) v2.
13. **Run a new prototype test** if needed (new [`/docs/15_FIGMA_TEST_PLAN_AND_RESULTS.md`](15_FIGMA_TEST_PLAN_AND_RESULTS.md) or a successor).

> **Implementation gate:** steps 1, 3, 4 OR 5, 7, 8, 10, 11 must all be done before product implementation in Sprint 2+ may resume. Steps 6, 9, 12, 13 are not implementation-blocking but are required for Figma rebuild and admin moderation work.

---

## 25. Risks During Migration

| Risk | Impact | Mitigation |
|---|---|---|
| **Partial docs mismatch** — some docs migrated, others still event-first | high — contradictory truths confuse Claude Code, designers, future contributors | strict sequencing in §24; CLAUDE.md update (step 2) early, so reasoning aligns with the freshly-updated Core |
| **Old event terms leaking into implementation** | medium — vocabulary drift undermines the rename | vocabulary migration table in §7; user-facing copy gated by review |
| **Onboarding built for old model** | high — activation cost of retrofitting the new fields | onboarding implementation explicitly frozen (§4, §23) until Core v2 + PRD v2 + Backlog v2 land |
| **Schema migration created too early** | high — irreversible state in supabase | hard rule §3 / §14; no `.sql` until Schema v2 approved |
| **Figma outdated** during implementation prep | medium — designers / engineers reference stale screens | Figma rebuild gated on Figma Plan v2 (step 6 of §24); existing prototype marked as historical |
| **Claude Code implementing from old backlog** | high — implementation drift away from Core v2 | CLAUDE.md §6 update (step 2 of §24) explicitly references the freeze; Backlog v2 (step 10) is implementation gate |
| **Scope creep** in the migration itself | medium — migration becomes endless | sequence in §24 is exhaustive; anything not listed there is out of migration scope |
| **Circle model becoming too complex** during the docs rewrite | high — kills feasibility | Hybrid Accept keeps operational model close to existing event entity (doc 26 §1, §35); guardrails in [doc 24 §32](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md); MVP minimalism per Manifesto §19 |
| **Approval anxiety** in copy of updated screens | medium — undermines retention | fit-protection framing ([doc 25 §9](25_PRODUCT_CORE_MANIFESTO.md)) is binding for user-facing copy |
| **Women-only assumptions unvalidated** | high — false-safety risk | implementation explicitly gated on validation per [doc 26 §14](26_PRODUCT_CORE_V2_DECISION.md); §15 RLS doc must encode safeguards before any policy is authored |

---

## 26. Acceptance Criteria for Migration

The migration is **complete** when **all** of the following hold:

- [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) v2 merged;
- [`/docs/01_PRD.md`](01_PRD.md) v2 merged;
- [`/docs/02_USER_STORIES.md`](02_USER_STORIES.md) v2 merged;
- [`/docs/03_USER_FLOWS.md`](03_USER_FLOWS.md) v2 merged;
- [`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) v2 merged;
- [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md) v2 merged;
- [`/docs/11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md) v2 merged;
- [`/CLAUDE.md`](../CLAUDE.md) updated;
- **no critical event-first contradictions** remain in user-facing docs (grep-able test: no user-facing copy references "event" as a primitive);
- **implementation tasks reference circle-first model** in the Backlog;
- **no migrations / code created prematurely** ([`/supabase/migrations/`](../supabase/migrations/) still empty; no product screens in [`apps/mobile/`](../apps/mobile/) or [`apps/admin/`](../apps/admin/)).

When all criteria hold, the Sprint 2 phase gate ([`/docs/22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md`](22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md)) may be authored and product implementation may resume.

---

## 27. Next Recommended Task

> **Update [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) to Product Core v2.**

**Important:**

- This must be a **deliberate rewrite**, not a patch.
- Keep old Product Core ideas **only where they still fit** under the circle-first model.
- The 10 existing safety invariants must be preserved verbatim in meaning.
- The 6 new anti-drift invariants (§16 items 11–16 of [doc 26](26_PRODUCT_CORE_V2_DECISION.md)) must be added.
- The "Не входит в MVP" list must be updated per [doc 26 §5](26_PRODUCT_CORE_V2_DECISION.md).
- The North Star must be updated per §18 of this plan.
- The new lifecycles (circle / meeting / membership) must be canonical.
- Circle-first becomes **first source of truth on merge**.

Immediately after Core v2 lands, update [`/CLAUDE.md`](../CLAUDE.md) (step 2 of §24) to prevent Claude Code from reasoning against stale Core.

---

## 28. Summary

- **Docs migration is required before product implementation continues.**
- **Infrastructure remains valid** — Sprint 1 PASS, Modular Monolith ADR, env / config / testing strategy, lockfile.
- **Circle-first decision changes product docs, not infra.**
- **Sequencing matters** — Core first, CLAUDE.md immediately after, then PRD / Stories / Flows, then schema / RLS, then Backlog, then the Sprint 2 phase gate.
- **Generic auth, waitlist, invite work** may continue in parallel — they are primitive-agnostic.
- **Next task:** update [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) to Product Core v2 (a deliberate rewrite, not a patch).

---

> Reminder: this is the migration **plan**, not the migration itself. [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) remains the **first source of truth** until step 1 of [§24](#24-recommended-migration-sequence) replaces it. The repository remains in the Infrastructure Phase per [`/docs/16_PHASE_GATE_TO_INFRASTRUCTURE.md`](16_PHASE_GATE_TO_INFRASTRUCTURE.md). The next product step is the Core v2 update (§27), **not** implementation.
