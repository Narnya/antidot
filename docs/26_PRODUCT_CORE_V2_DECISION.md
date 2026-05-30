# Product Core v2 Decision — Circle-first / Meeting-based Model

> **Status:** ✅ **DECISION RECORD — binding once committed and merged.**
> [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (v0.1) remains the **first source of truth** until this decision is applied through the documentation migration described in §17, §24, §25.
> **Owner:** Founder / Product
> **Decision date:** 2026-05-29
> **Decision type:** Product Core v2 — primary primitive change.
> **Decision:** **HYBRID ACCEPT** (see §1, §26).
> **Source proposals:**
> - [`/docs/22_PRODUCT_CORE_RECORE_PROPOSAL.md`](22_PRODUCT_CORE_RECORE_PROPOSAL.md) v0.3 (RU);
> - [`/docs/24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md`](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md) (EN, 37 sections);
> - [`/docs/25_PRODUCT_CORE_MANIFESTO.md`](25_PRODUCT_CORE_MANIFESTO.md) (EN, 30 sections, principles).
> **Phase note:** repository is in Infrastructure Phase ([`CLAUDE.md`](../CLAUDE.md) §6, [`/docs/16_PHASE_GATE_TO_INFRASTRUCTURE.md`](16_PHASE_GATE_TO_INFRASTRUCTURE.md)). Infrastructure remains valid (see §17). This decision does **not** authorize product implementation — it authorizes a controlled docs migration that must complete before product work resumes.
> **Existence checks at write time (2026-05-29):**
> - [`/docs/22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md`](22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md) does **not** exist (the only `22_*` doc is `22_PRODUCT_CORE_RECORE_PROPOSAL.md`). Any reference below is to the *future* Sprint 2 gate doc.
> - [`/docs/23_COMPETITIVE_ANALYSIS_INPARTY.md`](23_COMPETITIVE_ANALYSIS_INPARTY.md) does **not** exist. Competitive claims here rest on the InParty diagnosis in doc 22 §0 and memory [[inparty-shadow-risk]].

---

## 1. Decision Status

**Decision: HYBRID ACCEPT.**

The product will move from event-first MVP to **circle-first MVP**.

- **Primary user-facing primitive:** **Circle / Круг**.
- **Operational primitive:** **Meeting / Встреча круга**.

This decision **does not immediately rewrite** existing docs. It **authorizes a controlled documentation migration** (§17, §24, §25) that must complete **before further product implementation**. Until then:

- [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) remains the *current* source of truth for any contradiction.
- This decision is the *direction* every doc migration must satisfy.
- No product UI / schema / RLS / migration / SDK work begins until the migration plan ([§24](#24-required-follow-up-documents) item 1) is in place.

---

## 2. Decision Summary

> We are not building a generic event app.
> We are not building a people marketplace.
> We are not building a dating app.
>
> We are building an **operating system for trusted social circles**.

The product will help people **safely find, enter and belong to small recurring social circles with regular offline meetings**. Belonging is the success state; attendance is the mechanic underneath it.

---

## 3. Why We Are Making This Decision

- The event-first model overlaps too much with InParty- and Meetup-class competitors; differentiation is reduced to adjectives.
- **Circles create stronger differentiation** — the unit of value is a recurring relationship, not a transaction.
- **Repeated meetings create deeper trust** than one-off events; trust accrues from repeated co-presence in a known context.
- **Belonging is a stronger outcome than attendance** — the durable form of social connection.
- The circle model **better supports retention** without push-notification gamification.
- The circle model **better supports trust, safety and staged access** — composition rules, host accountability, member continuity.
- The circle model **avoids infinite event browsing** — finding your circle and stopping is a *success*, not churn.
- It **aligns with** the existing Core thesis "trust infrastructure for modern social connection".
- It **enables** the v2 framing "trust infrastructure for modern social belonging".

---

## 4. What Is Accepted

- **Circle** is the primary object users discover.
- **Meeting** is the scheduled offline instance of a circle.
- Users **request a place in a circle**, not just attendance at one event.
- A person may first be **approved for an intro meeting** (low-stakes entry).
- **Full membership** may happen after the first meeting or after host confirmation, per circle policy.
- **Circle chat replaces event chat** as the chat primitive.
- **Exact meeting location remains protected** and visible only to approved users / members (Inv. 1).
- Users may **belong to multiple circles** (§13).
- **Leaving / pausing / removal must be private and low-drama** (§13).
- **No betrayal mechanics** — no system-generated drama on transitions.
- **No public rejection / removal labels** (§13).
- **Vibe becomes more important than simple interests** (Manifesto §7).
- **Belonging mode** becomes a success state (§15).
- Approval is reframed as **fit protection for the circle**, not human ranking (Manifesto §9).
- **Staged composition visibility** before request / after request / after approval (§12).

---

## 5. What Is Not Accepted

The following remain explicitly out of scope (carried forward from current Core §"Не входит в MVP" and Manifesto §20):

- people-first discovery;
- swipe mechanics;
- open DMs (Inv. 2);
- dating mechanics (Core rule 6);
- public ratings (Core rule 5);
- raw trust scores visible to users (Inv. 3);
- follower economy;
- public profile marketplace;
- live / exact public location (Inv. 9);
- paid events / tickets in MVP (Core rule 7);
- promoted circles in MVP;
- nightlife / party mechanics;
- streams / online broadcast mode;
- complex auto-matching in MVP.

> **Hard guardrail:** none of these may be reintroduced silently. Any future addition requires an explicit Product Core update following the same kind of deliberate process recorded here ([`CLAUDE.md`](../CLAUDE.md) §3, §4).

---

## 6. Core Product Definition v2

To be applied to [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) during the migration (§17, §24):

> A **mobile-first product where people safely enter small recurring social circles in their city**. Each circle has a **vibe**, **rhythm**, **host**, **capacity** and **regular meetings**. People **request a place**, enter through **approval**, attend an **intro meeting**, become **members**, and build **trust through repeated offline presence**.

Headline (both preserved, cumulative):

- **Trust infrastructure for modern social connection** (current Core).
- **Trust infrastructure for modern social belonging** (v2 framing).

---

## 7. Core Loop v2

> **Find the right vibe → Request a place → Enter safely → Attend first meeting → Become part of the rhythm → Belong → Grow trusted graph.**

| Step | User action | System behavior | Safety / trust mechanic | Key UI implication |
|---|---|---|---|---|
| **1. Find the right vibe** | browses circles | shows circle cards filtered by vibe, rhythm, area, capacity, comfort composition | aggregated composition only; no people feed; no exact location (Inv. 1, 9) | Discovery is a **circle feed**, never a people feed |
| **2. Request a place** | sends a membership request with optional intro note | creates a membership request to the host | non-stigmatizing copy; rate-limited; blocked users cannot request | **Request** modal, not Apply; no "rejection history" surface |
| **3. Enter safely** | host reviews; approves for intro or as member | transitions membership state | approval framed as **fit protection** (Manifesto §9); host accountability; appeal path (Inv. 8) | Host Review screen with non-stigmatizing copy; soft rejection language |
| **4. Attend first meeting** | RSVPs, attends intro meeting | reveals exact location for that one meeting only; records attendance | Inv. 1 (location), Inv. 9 (no live location), Inv. 4 (audit) | Intro meeting card distinguished from regular meeting card |
| **5. Become part of the rhythm** | converts to `member`; RSVPs to upcoming meetings | accrues attendance / repeat-attendance trust signals (internal, Inv. 3) | pause / leave one-tap (§13); no churn pressure | Circle Home becomes primary surface |
| **6. Belong** | uses "My Circles" as home; no active discovery needed | quiets discovery prompts; surfaces upcoming meetings and chat | belonging-mode toggle (§15); no nag notifications | Home defaults to "My Circles" once user has ≥1 circle |
| **7. Grow trusted graph** | repeated co-presence accrues soft graph edges (internal) | optional in-context surfaces in P1; no cold outreach | Inv. 2 (no open DMs), Inv. 10 (no social credit) | Reconnect is P1; never a people marketplace |

---

## 8. Product Vocabulary Change

| Old term | New term | Notes |
|---|---|---|
| Event | **Circle** or **Meeting** depending on context | Discovery → Circle; scheduled instance → Meeting |
| Event Discovery | **Circle Discovery** | feed of circles, not events |
| Event Detail | **Circle Detail** | + secondary "Upcoming Meeting" section |
| Apply to Event | **Request a Place** | one decision per circle, not per meeting |
| Event Application | **Circle Membership Request** | one request per (user, circle) |
| Event Attendee | **Circle Member** (durable) + **Meeting Attendee** (per-meeting) | two distinct concepts |
| Event Chat | **Circle Chat** | chat anchored to circle, not meeting |
| Event Location | **Meeting Location** | exact location protection scoped to a meeting under a circle |
| Event Host | **Circle Host** | continuous role, not per-event |
| Event Lifecycle | **Circle Lifecycle** + **Meeting Lifecycle** | two lifecycles instead of one |

> **Transitional rule:** "Event" may still appear in **internal docs, code identifiers, or older artifacts** during the migration window. User-facing language must move to **Круг / Circle** and **Встреча круга / Meeting**. Any new user-facing copy written from this decision forward must use the new vocabulary.

---

## 9. MVP Scope v2

### Access

- invite-only beta;
- waitlist;
- auth (email / Google / Apple);
- phone verification decision (kept as in current Core; "phone before application or before approval");
- feature flags;
- privacy / terms.

### Onboarding

- city / area (area only — Inv. 9);
- interests;
- **vibe** (primary signal — Manifesto §7);
- preferred **rhythm** (weekly / biweekly / monthly / flexible);
- **comfort composition** (open mixed / female-friendly / women-only — pending §14);
- **group size comfort**;
- **host willingness** (opt-in);
- safety principles acceptance.

### Profiles

- basic profile;
- photos;
- vibe / interests;
- verification states;
- soft trust badges (Verified / Reliable attendee / Hosted before / Attended events);
- privacy settings.

### Circles

- create / edit / pause circle;
- circle title / vibe / theme;
- rhythm;
- capacity;
- approximate area only;
- comfort composition;
- host;
- lifecycle (§10).

### Discovery

- **feed of circles**, not people;
- **no swipe**;
- staged composition reveal (§12);
- **no people marketplace**.

### Membership

- request place;
- approve / reject / waitlist;
- intro meeting;
- member state;
- pause / leave / removal (§13).

### Meetings

- recurring meetings;
- next meeting card;
- RSVP;
- exact location reveal only for approved access (Inv. 1);
- attendance / no-show tracking (internal, Inv. 3).

### Communication

- circle chat;
- system messages;
- report message (Inv. 6);
- **no open 1:1 in MVP** (Inv. 2).

### Safety

- report / block everywhere (Inv. 6);
- comfort composition (§14);
- moderation queue;
- audit logs (Inv. 4);
- **AI assistive only** (Inv. 5).

### Trust

- attendance reliability;
- no-show tracking;
- host reliability;
- soft badges;
- **raw score internal only** (Inv. 3).

### Admin

- reports;
- user / circle / meeting / message details;
- moderation actions;
- audit logs.

---

## 10. Lifecycle Decisions

### Circle lifecycle

```
draft
  → pending_review
  → live
  → paused
  → full
  → archived
  → removed_for_safety
```

### Meeting lifecycle

```
scheduled
  → starting_soon
  → in_progress
  → completed
  → cancelled
  → removed_for_safety
```

### Membership lifecycle

```
none
  → requested
  → approved_for_intro_meeting
  → intro_attended
  → member
  → paused
  → left
  → removed
  → removed_for_safety
  → banned_from_circle
```

These lifecycles **replace** the current event / application / attendee lifecycles in [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) §"Event lifecycle" and §"Application lifecycle" as the core product model. The replacement is applied during the docs migration (§17, §24), not by this decision document.

> Detailed transition matrices (who can set, what user sees, location access, chat access, social sensitivity) are recorded in [doc 24 §10–§13](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md) and are authoritative for design.

---

## 11. Communication Decision

**MVP communication model:**

- circle chat only;
- meeting / system updates;
- report message;
- block user;
- admin freeze chat (with mandatory audit log — Inv. 4).

**Not in MVP:**

- open 1:1 DMs (Inv. 2);
- cold messages;
- direct messaging from profile;
- "write to participant" before shared context.

**P1 possible (only after the core circle loop is validated):**

Mutual opt-in 1:1 after shared context. Rules:

- both users must share **circle / meeting context** (members of the same circle, at least one attended meeting together);
- both must **opt in**;
- **no free custom first message** before acceptance — the recipient sees only a structured opt-in prompt;
- **report / block always available**.

**Hard rule (Inv. 2):** no cold DMs.

---

## 12. Composition Visibility Decision

Staged reveal:

**Before request:**

- aggregated composition only (e.g., "small group, 6 members, female-friendly");
- size;
- rhythm;
- vibe;
- comfort composition label;
- host safe profile (display name, verification badge);
- approximate area.

**After request (waiting for host):**

- request state;
- host / context / rules / circle description;
- **no full member list yet**.

**After approval (intro meeting or member):**

- **safe profiles of members / participants** per policy;
- no private / internal data.

**Never show (to anyone non-admin):**

- raw trust score (Inv. 3);
- report counts;
- block counts;
- removal history;
- rejection history;
- other circles a user belongs to;
- exact / live user location (Inv. 9).

---

## 13. Leave / Pause / Removal Decision

Principles (binding):

- users **may belong to multiple circles**;
- **no betrayal mechanics** — leaving one circle to join another generates no notification or visible signal;
- **no public transition history**;
- **no public "left / removed / rejected"** labels;
- **leaving should be normal** — one tap, optional reason;
- **pausing should be easy** (offer pause before leave where appropriate);
- membership changes must be **low-drama**.

UX language (Russian):

- **«Поставить участие на паузу»**
- **«Выйти из круга»**
- **«Участие завершено»**
- **«Не в этот раз»**
- **«Состав круга обновился»**

Avoid:

- ~~«Вас исключили»~~
- ~~«Вас отклонили»~~
- ~~«Участник предал круг»~~
- ~~«Ушёл в другой круг»~~

---

## 14. Women-only / Comfort Composition Decision

**Decision:** comfort composition is **accepted as a product direction**. Implementation is **gated on validation**.

Possible modes:

- open mixed;
- female-friendly;
- women-only;
- host-defined comfort rules.

Status: **P0 / P1 boundary remains open** until validation with women is complete.

**Requirement:** Do **not** implement women-only / female-friendly mechanics until user research has validated:

- the **wording** (Russian copy: prefer **«комфортный состав»**, not fear-based framing);
- the **expectations** about what is verified;
- the **safety implications** (false sense of safety, verification expectations, moderation burden, misrepresentation, legal / platform considerations).

> See [doc 24 §22](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md) and [doc 25 §18](25_PRODUCT_CORE_MANIFESTO.md). Validation method: 5–7 women interviews, female-weighted sample, transcripts logged.

---

## 15. Belonging Mode Decision

**Accepted principle:** *If a user finds their circle and stops searching, the product succeeded.*

The product must support:

- **My Circles** home (primary surface for users with ≥1 circle);
- next meeting card;
- RSVP;
- circle chat;
- reminders;
- pause / leave (§13);
- **guest seats** later (P1, gated by §8 Manifesto controlled growth);
- **no infinite discovery pressure** — discovery is one tap away but is not the default for users in belonging mode.

**Principle (binding):** *Belonging is a success state, not churn.*

---

## 16. Safety Invariants

### Carried-forward invariants (from current Core, §"Главные safety-инварианты" 1–10)

All ten remain **binding**:

1. **Exact location is never visible to non-approved users** (Inv. 1).
2. **No open DMs** before shared context (Inv. 2).
3. **Raw trust score is never shown to users** (Inv. 3).
4. **All moderation-sensitive actions must be logged** in an audit log (Inv. 4).
5. **AI is assistant, not judge** for serious enforcement (Inv. 5; CLAUDE.md §2.11).
6. **Users can block and report easily** (Inv. 6).
7. **Safety is part of UX, not hidden admin feature** (Inv. 7).
8. **Approval is a core trust mechanic** — preserved, reframed as fit protection (Inv. 8; Manifesto §9).
9. **No exact user location** (Inv. 9).
10. **Trust system must not become social credit** (Inv. 10).

Plus operational constraints already in CLAUDE.md / infrastructure docs:

- **blocked users cannot interact**;
- **banned users cannot interact**;
- **service role never exposed to client** ([`/docs/19_ENV_CONFIG_STRATEGY.md`](19_ENV_CONFIG_STRATEGY.md));
- **notifications and analytics must not leak sensitive data**.

### Circle-specific anti-drift invariants (new — adopted with this decision)

Promoted from [doc 22 §12](22_PRODUCT_CORE_RECORE_PROPOSAL.md), [doc 24 §11/§26](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md), and [doc 25 §10/§11/§20/§28](25_PRODUCT_CORE_MANIFESTO.md):

11. **No betrayal mechanics** — system never surfaces "user left for another circle" or equivalent.
12. **No public leave / removal / rejection labels** — the member list simply no longer shows the person.
13. **No people marketplace** — users discover circles, not browseable people.
14. **No infinite discovery pressure** — belonging mode is a first-class success state, not a retention failure.
15. **Circle membership is not ownership** — circles do not own people; users may belong to multiple circles.
16. **Users may belong to multiple circles** — no exclusivity, no "primary circle" badge.

These six are **adopted as binding** by this decision and must be added to [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) during the migration (§17, §24).

---

## 17. Impact on Existing Documentation

Docs that **must be updated** after this decision (the migration plan in §24 item 1 will sequence them):

| Doc | Why it must change |
|---|---|
| [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) | replace event-first primitive, loop, lifecycles, screens, metrics, entities; adopt anti-drift invariants 11–16 |
| [`/docs/01_PRD.md`](01_PRD.md) | rewrite around circle / meeting modules |
| [`/docs/02_USER_STORIES.md`](02_USER_STORIES.md) | rewrite user stories around circle / meeting flows |
| [`/docs/03_USER_FLOWS.md`](03_USER_FLOWS.md) | rewrite flows around Find vibe → Request → Enter → Attend → Belong → Reconnect |
| [`/docs/04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) | update screen list per [doc 24 §29](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md) |
| [`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) | rewrite around circles / meetings / memberships / requests; conceptual mapping in [doc 24 §27](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md) |
| [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md) | re-anchor RLS policies on membership status; see [doc 24 §28](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md) |
| [`/docs/08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md) | reanchor trust signals on membership continuity + repeat attendance |
| [`/docs/09_MODERATION.md`](09_MODERATION.md) | extend targets to circle / meeting; preserve Inv. 4, 5 |
| [`/docs/10_ANALYTICS.md`](10_ANALYTICS.md) | rename event taxonomy → circle / meeting taxonomy (§21) |
| [`/docs/11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md) | reorder Sprint 2+ tasks around circle scope |
| [`/docs/13_DESIGN_HANDOFF.md`](13_DESIGN_HANDOFF.md) | update tokens / components / handoff around circle UI |
| `/docs/22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md` | **does not yet exist;** when written, must reflect circle-aware onboarding fields |

Docs that **remain valid as-is** (no rewrite required by this decision):

- [`/docs/14_PHASE_GATE_AND_PRODUCT_DECISIONS.md`](14_PHASE_GATE_AND_PRODUCT_DECISIONS.md) — historical;
- [`/docs/15_FIGMA_TEST_PLAN_AND_RESULTS.md`](15_FIGMA_TEST_PLAN_AND_RESULTS.md) — historical;
- [`/docs/16_PHASE_GATE_TO_INFRASTRUCTURE.md`](16_PHASE_GATE_TO_INFRASTRUCTURE.md) — infrastructure-only gate; unaffected;
- [`/docs/17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md) — architecture decision; unaffected (primitive change is product, not architecture);
- [`/docs/18_WORKSPACE_IMPORTS.md`](18_WORKSPACE_IMPORTS.md);
- [`/docs/19_ENV_CONFIG_STRATEGY.md`](19_ENV_CONFIG_STRATEGY.md);
- [`/docs/20_TESTING_STRATEGY.md`](20_TESTING_STRATEGY.md);
- [`/docs/21_SPRINT_1_INFRASTRUCTURE_REVIEW.md`](21_SPRINT_1_INFRASTRUCTURE_REVIEW.md) — PASS; unaffected;
- [`/docs/22_PRODUCT_CORE_RECORE_PROPOSAL.md`](22_PRODUCT_CORE_RECORE_PROPOSAL.md) — frozen as the RU v0.3 proposal;
- [`/docs/24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md`](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md) — frozen as the EN v2 proposal;
- [`/docs/25_PRODUCT_CORE_MANIFESTO.md`](25_PRODUCT_CORE_MANIFESTO.md) — frozen as the manifesto.

> Note: docs 22, 24, 25 are *proposal* artifacts; this decision *adopts* them. They remain in the repo as historical context for the decision, not as ongoing sources of truth (which is what Product Core v2 will become once migrated).

---

## 18. Impact on Sprint 2

**Allowed to continue after this decision** (primitive-agnostic, no dependency on circle-specific fields):

- generic **auth** planning (email / Google / Apple / phone / sessions / protected routes / banned gate);
- **invite-only beta gate** planning;
- **waitlist** planning;
- **protected route** planning.

**Must pause until the circle docs are updated** (depends on the new primitive / new onboarding fields):

- **onboarding implementation** (the new fields in §9 — vibe primary, rhythm, comfort composition, group size, host willingness — cannot be retrofitted after activation without cost);
- **profile fields implementation**;
- **discovery implementation**;
- **any product UI screen** (Circle Discovery, Circle Detail, Request a Place, Circle Chat, Create Circle, etc.).

**First next task after this decision** is **not** auth implementation. It is:

> **[`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)** — the ordered migration plan that takes docs 00, 01, 02, 03, 04, 06, 07, 08, 09, 10, 11, 13 from event-first to circle-first.

Once that plan exists and the highest-priority docs (00, 01, 02, 06, 07, 11) are updated, Sprint 2 may proceed.

---

## 19. Impact on Database Schema

The existing event-first [`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) **must be rewritten before any migration** is created.

Conceptual mapping (already captured in [doc 24 §27](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md), restated here for the decision record):

- `events` → **`circles`** + **`circle_meetings`**;
- `event_applications` → **`circle_membership_requests`**;
- `event_attendees` → **`circle_memberships`** + **`meeting_attendance`**;
- `event_locations` → **`meeting_locations`**;
- `event_chat_messages` → **`circle_chat_messages`**;
- `reports` → adds **`target_type`** values for circle / meeting / message;
- `trust_events` → **unchanged** (signals extended via new source types);
- `audit_logs` → **unchanged shape** (event-type taxonomy extended).

**No `.sql` migrations** may be authored until schema v2 is complete. The Sprint 1 [`/supabase/migrations/`](../supabase/migrations/) directory remains empty by design.

---

## 20. Impact on Figma

The existing Figma prototype is **useful as a visual / interaction base** but **needs conceptual update**:

| Existing screen | New screen |
|---|---|
| Discover | **Circle Discovery** |
| Event Detail | **Circle Detail** (+ secondary "Upcoming Meeting") |
| Apply Modal | **Request Place** |
| Pending | **Membership Pending** |
| Approved | **Intro Meeting** / **Member State** |
| Event Chat | **Circle Chat** |
| Create Event | **Create Circle** (+ "Schedule a Meeting" sub-flow) |
| Applications List | **Membership Requests** |
| Applicant Detail | **Request Detail** |

New screens implied:

- **My Circles** home;
- **Pause / Leave** modal with non-stigmatizing copy;
- **Composition settings** for hosts at circle creation.

> Figma must **not** be updated until the Product Core v2 docs are updated **enough to guide redesign** (at minimum docs 00, 01, 02, 03, 04 — see §24).

---

## 21. Impact on Analytics

**North Star shift** (final choice deferred to [`/docs/10_ANALYTICS.md`](10_ANALYTICS.md) update):

- **Old:** trusted offline interactions.
- **New candidate A:** trusted recurring offline interactions.
- **New candidate B:** active trusted circles with confirmed recurring attendance.

Both candidates refine, not contradict, the existing North Star.

**Event taxonomy migration:**

| Old | New |
|---|---|
| `event_viewed` | `circle_viewed` |
| `application_created` | `circle_join_requested` |
| `application_approved` | `circle_membership_approved` |
| `event_attended` | `circle_meeting_attended` |
| `repeat_attendance` | `repeat_meeting_attendance` |

> No analytics SDK is connected yet (PostHog deferred per [`/docs/21_SPRINT_1_INFRASTRUCTURE_REVIEW.md`](21_SPRINT_1_INFRASTRUCTURE_REVIEW.md)). The taxonomy migration is a documentation step, not a code step.

---

## 22. Impact on Competitive Strategy

This decision **strengthens differentiation from InParty- and Meetup-class event apps**.

We are **not** competing as another event feed. We are competing as **trust-first recurring social circles**.

Differentiation surface:

- **recurring context** — relationships have time to deepen;
- **vibe-based circles** — atmosphere / rhythm / energy, not just topic;
- **staged access** — composition-aware entry, not open marketplace;
- **belonging mode** — finding your circle and stopping is success, not churn;
- **no people marketplace** — circles, not catalogs of people;
- **no open DMs** — context-first communication;
- **no paid / promoted events** in MVP — trust not corrupted by pay-to-be-seen.

> The full competitive analysis is **deferred** to a future [`/docs/23_COMPETITIVE_ANALYSIS_INPARTY.md`](23_COMPETITIVE_ANALYSIS_INPARTY.md), which **does not yet exist** at the time of this decision. The decision rests on the InParty diagnosis recorded in doc 22 §0 and in memory [[inparty-shadow-risk]]. Creating doc 23 is recommended but **not blocking** for this decision.

---

## 23. Risks Accepted

| Risk | Accepted? | Mitigation |
|---|:--:|---|
| **Scope increase** — circle model touches every product module | ✅ | controlled docs migration (§24) before any implementation; Hybrid Accept keeps operational model close to existing event entity |
| **Schema rewrite** — non-trivial schema changes vs. current doc 06 | ✅ | conceptual mapping already captured (§19); design pass happens during docs migration, before any `.sql` |
| **Figma rewrite** — prototype screens require relabeling and some new screens | ✅ | Figma updated only after docs 00, 01, 02, 03, 04 are updated (§20); existing prototype remains useful as visual base |
| **Onboarding redesign** — new fields (vibe primary, rhythm, comfort composition, etc.) | ✅ | onboarding implementation is paused (§18) until docs are migrated; activation cost of retrofitting is avoided |
| **Recurring commitment may feel too serious** | ✅ | intro meeting as low-stakes lane; rhythm transparency; pause one-tap (§13); validation in [doc 24 §33](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md) |
| **Circles may feel exclusive** (in-group / out-group friction) | ✅ | multi-circle membership encouraged (§13); non-stigmatizing copy; staged composition reveal (§12) |
| **Approval may feel like ranking** | ✅ | **fit protection, not human ranking** framing (Manifesto §9; copy validated in [doc 24 §33](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md) item 5, 7) |
| **Host power risk** — bad host kills a circle, or abuses position | ✅ | host accountability + audit (Inv. 4) + admin review (Inv. 5, 11); rotating host moments (Manifesto §8); one-tap leave (§13) |
| **Social drama risk** — leaving / removing creates friction | ✅ | strict no-public-labels rule (§13, Inv. 12); no transition notifications; non-stigmatizing copy |
| **Women-only validation complexity** | ✅ | implementation gated on validation (§14); language principle **«комфортный состав»**, not fear-based |
| **Slower implementation start** — docs migration delays Sprint 2 product work | ✅ | accepted as the price of avoiding a primitive mismatch; auth / waitlist / invite continue in parallel (§18) |

---

## 24. Required Follow-up Documents

In order:

1. **[`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)** — the ordered migration plan. Sequences the doc updates below and the merge points at which Sprint 2 product work may resume.
2. **Updated [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md)** — v2 Core, applies §1, §6, §7, §10, §16 of this decision. Becomes the new source of truth.
3. **Updated [`/docs/01_PRD.md`](01_PRD.md)** — circle / meeting modules.
4. **Updated [`/docs/02_USER_STORIES.md`](02_USER_STORIES.md)** — circle-first user stories.
5. **Updated [`/docs/03_USER_FLOWS.md`](03_USER_FLOWS.md)** — circle-first flows.
6. **Updated [`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md)** — schema v2 blueprint (no `.sql`).
7. **Updated [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md)** — membership-based RLS.
8. **Updated [`/docs/11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md)** — Sprint 2+ reordered around circle scope.
9. **Updated [`/docs/22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md`](22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md)** if / when written — must reflect circle-aware onboarding fields.

> Items 4, 5, 7, 8 may run in parallel once item 2 (the Core update) lands.
> Items 9, 10, 11 (docs 04, 08, 09, 10, 13) follow on a slower track and do not block Sprint 2 auth / waitlist work.

---

## 25. Implementation Freeze Until Docs Update

**Product implementation remains frozen** until the Product Core v2 update plan (§24 item 1) exists and the high-priority docs (00, 01, 02, 06, 07, 11) are updated.

**Allowed during the freeze:**

- documentation migration (§24);
- **generic auth** planning **if** it does not depend on onboarding fields;
- infrastructure maintenance (lockfile, lint, format, type-check, CI);
- design exploration in Figma **for understanding only**, not committed updates.

**Not allowed during the freeze:**

- onboarding implementation;
- schema migrations (`.sql` files);
- event / circle product implementation in `apps/mobile` or `apps/admin`;
- product UI screen implementation;
- RLS policies;
- analytics implementation;
- AI moderation integration;
- any "Still Not Allowed" item from [`/docs/16_PHASE_GATE_TO_INFRASTRUCTURE.md`](16_PHASE_GATE_TO_INFRASTRUCTURE.md) §4.

> The Infrastructure Phase guardrails from CLAUDE.md §6 remain binding through the freeze.

---

## 26. Final Decision

> **Final decision: HYBRID ACCEPT.**

The product adopts **circle-first UX** and **meeting-based operations**.

- Primary user-facing primitive: **Circle / Круг**.
- Operational primitive: **Meeting / Встреча круга**.
- All ten current safety invariants remain binding; six circle-specific anti-drift invariants are added (§16, items 11–16).
- Infrastructure stands.
- Product implementation is frozen until the docs migration completes (§25).

---

## 27. Summary

- **Circle-first model is accepted.**
- **Events become meetings** under a circle umbrella; "event" survives as an internal / historical term only.
- **Belonging becomes the success state** — finding your circle and stopping is success, not churn.
- **All safety invariants remain intact**; six new circle-specific anti-drift invariants are adopted.
- **Existing infrastructure remains valid** — [`/docs/17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md), the Sprint 1 PASS status ([`/docs/21_SPRINT_1_INFRASTRUCTURE_REVIEW.md`](21_SPRINT_1_INFRASTRUCTURE_REVIEW.md)), env / config / testing strategy.
- **Product docs must be migrated** before implementation continues (§17, §24, §25).

**Next recommended task:** create [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md) — the ordered migration plan that takes docs 00, 01, 02, 03, 04, 06, 07, 08, 09, 10, 11, 13 from event-first to circle-first.

---

> Reminder: this is a **decision record**. [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) remains the **first source of truth** until the migration plan in §24 item 1 sequences its update. The repository remains in the Infrastructure Phase per [`/docs/16_PHASE_GATE_TO_INFRASTRUCTURE.md`](16_PHASE_GATE_TO_INFRASTRUCTURE.md). The next product step is the docs migration plan, **not** implementation.
