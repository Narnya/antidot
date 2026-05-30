# Product Core v2 Proposal — Circles as Primary Primitive

> **Status:** ⚠️ **PROPOSAL — NOT source of truth.**
> [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (v0.1) remains the **first source of truth** until a separate, deliberate decision document accepts a change ([`CLAUDE.md`](../CLAUDE.md) §0, §3, §4).
> **Owner:** Product
> **Created:** 2026-05-29
> **Depends on:** customer validation (see §33) → then explicit decision in [`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md) (does not exist yet) → only then a deliberate edit to `00_PRODUCT_CORE.md`.
> **Relation to existing docs:**
> - Successor to [`/docs/22_PRODUCT_CORE_RECORE_PROPOSAL.md`](22_PRODUCT_CORE_RECORE_PROPOSAL.md) v0.3 (RU). This document re-states v0.3's direction in the structure requested by Product, in English, and adds explicit lifecycle, RLS, Figma, analytics and risk mappings.
> - [`/docs/23_COMPETITIVE_ANALYSIS_INPARTY.md`](23_COMPETITIVE_ANALYSIS_INPARTY.md) does **not yet exist** at the time of writing. The InParty diagnosis used here is the one already recorded in doc 22 §0 and in memory [[inparty-shadow-risk]]. If/when doc 23 is created, this proposal should be cross-linked.
> **Phase note:** repository is in Infrastructure Phase / Sprint 1 ([`CLAUDE.md`](../CLAUDE.md) §6, [`/docs/16_PHASE_GATE_TO_INFRASTRUCTURE.md`](16_PHASE_GATE_TO_INFRASTRUCTURE.md)). This proposal **must not** trigger any product implementation, schema, RLS, migration, SDK setup, or Sprint Backlog change. It is a product design artifact only.

---

## 1. Proposal Status

This is a **proposal**.

- It is **not yet accepted**.
- It does **not** modify [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) automatically.
- It does **not** modify [`/docs/01_PRD.md`](01_PRD.md), [`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md), [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md), [`/docs/11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md) or any downstream doc.
- **No implementation** should start from this document.
- Sprint 2 (auth/beta/onboarding) **must not** start product work based on this proposal until an explicit decision is recorded in `/docs/26_PRODUCT_CORE_V2_DECISION.md`.

Possible future decisions (to be made in doc 26):

- **ACCEPT** — rewrite Product Core around circles as the user-facing primitive.
- **PARTIAL ACCEPT** — keep events as MVP primitive; add circles as a Phase 2 layer on top.
- **HYBRID ACCEPT** — user-facing primitive is Circle; operational/internal primitive is Meeting (the current "event" model survives, renamed and scoped). **Recommended in §35.**
- **REJECT** — stay event-first per current Core.

---

## 2. Why This Proposal Exists

The current Product Core ([`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md)) defines the MVP as an event-first loop: Discover → Apply → Approve → Attend → Reconnect. After competitive review (see [[inparty-shadow-risk]] and doc 22 §0) and product reflection, six concerns motivate a re-examination:

1. **Event-first is close to existing competitors.** InParty already runs the same loop, including approval-gated messaging. Differentiation becomes a matter of adjectives ("safer", "more curated"), which is fragile.
2. **Circles create stronger belonging and retention.** A recurring small group sustains attendance over months; a one-off event creates a single transaction.
3. **Trust grows through repeated context.** The hardest type of trust to fake is the trust between people who have shown up multiple times in the same group with the same host.
4. **Recurring groups are more defensible.** A graph that emerged from repeated co-presence is hard to replicate by a competitor with a paid-boost marketplace.
5. **The circle primitive is structurally safer.** Composition rules, host accountability, and member continuity make moderation tractable; an open event marketplace makes it harder.
6. **Users do not need infinite discovery once they find their circle.** Event apps require constant new supply; circle apps let "I found my circle, I'm not actively searching" be a *success* state, not churn.

> Note: the diagnosis above is product reasoning, not validated user research. Concrete validation steps are in §33. The proposal must not be accepted until that validation lands.

---

## 3. Old Core vs New Core

| Area | Current Event Core (`00_PRODUCT_CORE.md` v0.1) | Proposed Circle Core (this doc) |
|---|---|---|
| **Primary primitive (user-facing)** | Event | **Circle** |
| **Operational primitive (system/internal)** | Event | **Circle Meeting** (a scheduled instance under a circle) |
| **User loop** | Discover → Apply → Approve → Attend → Reconnect | Find vibe → Request a place → Enter safely → Attend first meeting → Become member → Meet repeatedly → Belong → Grow trusted graph |
| **Discovery** | Feed of events; one-off cards; time-anchored | Feed of circles; vibe/rhythm-anchored; recurring cards; "next meeting" as a secondary signal |
| **Joining** | Apply to an event (per-event application) | Request a place in a circle (one membership decision per circle, then per-meeting RSVP) |
| **Chat** | Per-event chat for approved attendees only | Per-circle chat for members; per-meeting system messages |
| **Location privacy** | Exact location hidden until per-event approval (Inv. 1) | Exact location hidden until member status (or "approved for intro meeting"). Same invariant, scoped to circle/meeting |
| **Trust** | Internal score + soft badges; signals derived from per-event attendance | Same internal score + soft badges; signals also derived from membership continuity and repeat attendance — score still never shown (Inv. 3) |
| **Reconnect** | Light reconnect tag after an event; secondary feature | Reconnect/belonging is **the core retention mechanic**; "My Circles" is a primary surface |
| **Retention** | Driven by new event supply | Driven by recurring meeting cadence within an existing circle |
| **Admin moderation** | Per-event removal, per-user actions, audit log (Inv. 4, 10) | Per-circle and per-meeting actions; membership removal; same audit-log invariant; same "AI assists, never final judge" (Inv. 5) |

---

## 4. Proposed New Product Definition

If accepted, the product would be defined as:

> A **mobile-first app where people safely join small recurring social circles in their city**. Each circle has a vibe, a rhythm, a host, a capacity, and regular meetings. Users **request a place**, hosts approve entry, exact meeting location is revealed only to approved members, and **belonging** grows through repeated attendance.

Headline thesis (cumulative, both preserved):

- **Trust infrastructure for modern social connection** (current Core thesis — preserved).
- **Trust infrastructure for modern social belonging** (added — the v2 framing).

Both statements are kept because belonging is the durable form of connection: connection without belonging decays into transactions; belonging without connection is hollow. The product aims at the intersection.

---

## 5. Proposed Core Loop

> **Find the right vibe → Request a place → Enter safely → Attend first meeting → Become member → Meet repeatedly → Belong → Grow trusted graph.**

| Step | User goal | System behavior | Safety mechanics | Data needed | UI screens affected |
|---|---|---|---|---|---|
| **1. Find the right vibe** | "Where would I feel comfortable being?" | Show a feed of circles filtered by city/area, vibe, rhythm, capacity, comfort composition. No people feed. | No exact location; aggregated composition only; report/block on host/circle card | circle metadata, vibe tags, area, rhythm, capacity, approval flag, soft host profile | Discovery, Circle Card, Filters |
| **2. Request a place** | "I want to belong here." | User submits a request with optional intro note; host receives a membership-request item, not a per-event application | Approval-gated entry (Inv. 1, 8); rate-limited requests; blocked users cannot request | membership_request (circle_id, user_id, note, status, timestamps) | Circle Detail, Request Modal, "My Requests" |
| **3. Enter safely** | "I want to know what I'm walking into before sharing my evening." | Host reviews request; on approve, user gets *intro meeting* invitation or full membership depending on circle's policy | Composition-aware approval (§22); host accountability; appeal path | request status, intro_meeting_id, comfort-composition fields | Host Review, Membership Pending, Intro Invitation |
| **4. Attend first meeting** | "Show up once, see if this is really for me." | Exact meeting location revealed only after approval, scoped to that meeting; RSVP recorded; check-in optional | Inv. 1 (exact location), Inv. 4 (audit), Inv. 9 (no live location) | meeting (circle_id, starts_at, area, protected exact_location), rsvp, attendance | Meeting Detail, Intro Meeting view, Check-in placeholder |
| **5. Become member** | "I want to be part of this group, not just a guest." | After intro meeting and (optionally) host confirmation, membership transitions from `approved_for_intro_meeting` → `member` | Host can decline conversion with a non-public, non-stigmatizing copy; user can decline equally easily | membership transition log, trust events | Membership Status, You Are In The Circle |
| **6. Meet repeatedly** | "I keep showing up; this rhythm fits my life." | Per-circle meeting cadence; reminders; chat updates; no-show tracked privately | Inv. 1, 4; pause/leave anytime (§11) | recurring meetings, rsvp per meeting, attendance per meeting | Circle Home, Upcoming Meetings, Circle Chat |
| **7. Belong** | "I have a circle. I don't need to keep searching." | Home shifts from discovery-first to circle-first; "not looking for new circles" is a setting | No churn pressure; no notifications nagging for more discovery | belonging mode flag (user setting) | Home (Belonging Mode), Settings |
| **8. Grow trusted graph** | "I have repeated context with these people; reconnect feels natural." | Soft graph of co-presence; opt-in surfaces in P1 only (no cold outreach, no people marketplace) | Inv. 2 (no open DMs), Inv. 10 (no social credit) | trust_events, soft co-presence edges (P1, gated) | Reconnect (P1), Circle members list |

---

## 6. Core Primitive: Circle

A **Circle** is the primary user-facing object: a small recurring social group with a coherent vibe, theme, rhythm, host, capacity, and safe composition rules. It is *not* a single event; an event would be a `Circle Meeting` (see §7).

Conceptual fields (proposed; no schema written here):

- `title` — short, human-readable.
- `vibe` — vibe tags (calm intellectuals, slow brunch, artsy walkers, etc.) — see §8.
- `theme` — what the circle is about (longer description; e.g., "deep conversations about books we actually finished").
- `city` — city only (Inv. 9).
- `approximate area` — district / approximate area / distance bucket (Inv. 9).
- `rhythm` — cadence indicator (weekly / biweekly / monthly / ad-hoc) — proposed enum.
- `capacity` — small-group cap (e.g., 4–12); deliberately small.
- `host` — required; references the user who created the circle.
- `categories` — the existing limited category list from Core ("Coffee", "Dinner", "Walk", "Board games", "Light sports", "Creative", "Community hangout") — no nightlife/parties/business networking.
- `comfort composition` — open mixed / female-friendly / women-only / host-defined (§22).
- `approval required` — boolean; default true (Inv. 8).
- `membership status` (per user) — see §10.
- `next meeting` — derived; references upcoming `Circle Meeting`.
- `lifecycle status` — see §12.

> Circle is the *primary user-facing object*. Users browse circles, request to join circles, belong to circles, and form their social home around circles. Meetings are scheduled instances *under* a circle and are mostly secondary in the UI.

---

## 7. Secondary Primitive: Circle Meeting

A **Circle Meeting** is a scheduled instance of a circle gathering — what users currently call "an event". Meetings exist *under* a circle and inherit its composition, vibe, host, and safety rules.

Conceptual fields (proposed):

- `circle_id` — required parent.
- `starts_at`, `ends_at` — meeting window.
- `approximate area` — shown publicly to members at most; non-members see circle's area (Inv. 1, 9).
- `exact_location_protected` — stored separately and exposed only via the location-reveal rule (§19), per Inv. 1.
- `rsvp` — going / can't make it (per member).
- `attendance` — attended / no-show (per member, recorded post-meeting).
- `no_show` — boolean flag tied to trust signals (internal only, Inv. 3).
- `meeting status` — see §13.

> Meetings are where offline interaction happens. They **replace standalone one-off events** in the core MVP narrative. The system still understands "a scheduled gathering", but the *unit of value* is the circle, not the meeting.

---

## 8. Vibe Over Interests

**Interests are surface-level.** "Books", "coffee", "walks" tell you what people do; they do not tell you whether you will be comfortable in the room.

**Vibe is deeper.** Vibe answers: what is the atmosphere, the pace, the social energy, the level of openness, the hosting style?

Circles should be defined by:

- atmosphere (e.g., calm vs lively);
- rhythm (slow brunch vs after-work);
- social energy (introverted-friendly vs high-energy);
- emotional openness (small talk vs honest conversation);
- pace (relaxed vs structured);
- comfort (quiet rules, no phones, etc. — host-defined);
- group size (4–6 vs 10–12);
- hosting style (host-led vs flat).

Acceptable examples (illustrative, not exhaustive):

- calm intellectuals;
- slow brunch circle;
- ambitious internationals;
- artsy walkers;
- emotionally open conversations;
- slow-life evenings;
- weekend creative sessions.

**Avoid (hard product rules):**

- elitist labels ("exclusive", "high-status");
- attractiveness framing;
- dating-coded labels ("singles", "looking", "available");
- identity ranking ("top circles", leaderboards);
- any label that turns vibe into a status hierarchy.

> Vibe is harder to onboard than interests. The implementation must use curated vibe tags (not free-text personality quizzes), reinforced by the circle's own description and host signal. To be validated in §33.

---

## 9. Social Temperature

The product must not become **sterile or bureaucratic**. Safety taken to its extreme produces a product that is technically safe and emotionally dead. People come for warmth, not paperwork. Doc 22 §6 calls this *controlled serendipity* — the same idea, restated for v2.

Allowed (later, after the core circle loop is validated):

- **occasional guest seats** — a member may bring a vouched guest; trust passes through the voucher;
- **seasonal gatherings** — periodic larger meetings where adjacent circles overlap;
- **crossover circles** — soft links between circles with related vibes;
- **trusted introductions** — opt-in, in-context surfaces only after shared meetings;
- **rotating host moments** — co-host moments inside an existing circle.

**Never** (hard rules — also enforced by Core invariants):

- random cold DMs (Inv. 2);
- swipe;
- people marketplace / browsable user feed;
- open profile browsing of non-members;
- dating mechanics — like/match/interested-in/chemistry/romantic ranking (Core rule 6).

> Social temperature is a *dynamic regulator*, not a fixed parameter. Early in a circle's life and in the early days of the product, the greenhouse is denser. As trust accrues, more serendipity surfaces unlock.

---

## 10. Membership Lifecycle

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

| Status | Who can set it | What user sees | Location access | Chat access | Social sensitivity |
|---|---|---|---|---|---|
| `none` | default | nothing — discovery only | area only | no | neutral |
| `requested` | user | "your request is with the host" | area only | no | low — non-stigmatizing copy required |
| `approved_for_intro_meeting` | host | "you're invited to one intro meeting" | exact location for that meeting only | meeting-context system messages only | low |
| `intro_attended` | system (post-meeting) | "you attended the intro" | scoped to that meeting (post-event) | meeting-context only | low |
| `member` | host (after intro) or system if circle is "intro = member" | "you're in the circle" | exact locations for upcoming meetings | full circle chat | high — this is belonging |
| `paused` | user | "you paused this circle" | none | read-only or muted (TBD §33) | low — must feel normal |
| `left` | user | "you left this circle" | none | none | low — must feel undramatic |
| `removed` | host | non-public removal copy; no audience | none | none | high — host accountability + appeal path (§24) |
| `removed_for_safety` | admin | safety-removal copy; non-public to other members | none | none | very high — audit log mandatory (Inv. 4) |
| `banned_from_circle` | admin | banned from re-requesting this circle | none | none | very high — audit log mandatory |

> **Social-sensitivity rule:** no other member of the circle is told *which* state a removed/left user is in (§11). The user simply disappears from the member list with no public label.

---

## 11. Belonging Without Ownership

Principles (proposed):

- Users **may belong to multiple circles** — no exclusivity, no "primary circle" badge.
- **No betrayal mechanics** — leaving one circle to join another must not generate any notification, status change, or visible signal to the abandoned circle's host or members.
- **No public "left / removed / rejected" labels** — the member list simply no longer shows the user.
- **No public transition history** — past memberships are not visible to other users.
- **No one owns a person socially** — hosts curate circles, not people.
- **Leaving should be normal** — one tap, no dialogue forcing a reason (optional only).
- **Pausing should be easy** — pause keeps your seat (host-policy permitting) without ongoing chat noise.
- **Membership changes should be low-drama** — copy, animation, and UX must never produce a sense of public failure.

---

## 12. Circle Lifecycle

```
draft
  → pending_review
  → live
  → paused
  → full
  → archived
  → removed_for_safety
```

| Status | Meaning | Who can set it | User visibility | Safety implications |
|---|---|---|---|---|
| `draft` | host is creating | host | only the host | none — pre-publication |
| `pending_review` | submitted for admin review (if circle requires it) | host → admin | not in discovery; host sees pending banner | admin reviews host accountability and composition rules |
| `live` | discoverable; can accept requests | admin / host | shown in discovery; can receive requests | normal moderation surface |
| `paused` | not accepting new members; existing members stay | host | members see "paused" copy; not in discovery | reduces moderation surface; preserves belonging |
| `full` | capacity reached | system | shown in discovery as "full"; cannot request | optional waitlist follows §10 |
| `archived` | host ended the circle | host | members see "archived"; no new requests | trust events frozen as historical |
| `removed_for_safety` | safety action | admin only | members see safety-removal copy; not in discovery | mandatory audit log (Inv. 4); appeal path (§24) |

---

## 13. Meeting Lifecycle

```
scheduled
  → starting_soon
  → in_progress
  → completed
  → cancelled
  → removed_for_safety
```

| Status | Meaning | RSVP access | Location access | Chat / system messages | Trust events |
|---|---|---|---|---|---|
| `scheduled` | future meeting on circle calendar | members can RSVP | exact location to members per §19 | reminders queued | none yet |
| `starting_soon` | within reveal window | RSVP can still change | exact location available to approved members | "starts soon" system message | none yet |
| `in_progress` | meeting is happening | RSVP locked | exact location visible to approved members | optional system messages | none yet |
| `completed` | finished | RSVP locked | exact location stops being surfaced after window | "completed" system message | attendance / no-show recorded (Inv. 3 — internal only) |
| `cancelled` | host cancelled before start | RSVPs voided | exact location withdrawn | "cancelled" system message | no negative trust events tied to attendees |
| `removed_for_safety` | admin removed | RSVPs voided | exact location withdrawn | safety-removal copy; non-public reasoning | mandatory audit log (Inv. 4) |

---

## 14. Roles

| Role | Current event-first description | Proposed circle-first description | Key difference |
|---|---|---|---|
| **Guest** | unauthenticated; can see landing only | same — no change | none |
| **User** | authenticated; can browse events, apply, attend, chat in approved events | same scope, but anchored to circles: browse circles, request a place, attend, chat in circle | discovery and chat are circle-scoped, not event-scoped |
| **Circle Member** | (not present) | a User who has `member` status in at least one circle; sees circle home, chat, meetings, exact location for upcoming meetings | **new role** — the durable "belonging" state |
| **Circle Host** | "Host" — creates and manages an event | creates and manages a **circle**; runs membership review; schedules meetings; moderates circle chat | scope expands from one event to a recurring group, with continuous accountability |
| **Admin / Moderator** | reviews reports, bans, audit logs (Inv. 4, 11) | same powers; targets now include `circle_id` and `meeting_id`; safety removal at circle and meeting level | shape unchanged, surface area expands |
| **System** | (implicit) | named explicitly: lifecycle transitions (`completed`, `starting_soon`), RSVP locks, reminders, internal trust-event recording | unchanged in spirit |

---

## 15. MVP Scope Changes

| Module | Current MVP ([`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md)) | Proposed Circle MVP | Impact |
|---|---|---|---|
| **Auth** | email + Google + Apple + phone verification + sessions + protected routes | unchanged | none |
| **Invite / Waitlist** | invite-only beta + waitlist + feature flags | unchanged | none |
| **Onboarding** | welcome, basic profile, city, interests, vibe tags, intent, photos, safety rules acceptance | extended: vibe tags become primary, plus rhythm preference, comfort composition, group size comfort, host willingness — see §16 | medium — reshapes onboarding screens |
| **Profiles** | profile view/edit, photos, interests, vibe tags, privacy, verification, completeness | unchanged in concept; surfacing emphasizes vibe over interests | low |
| **Discovery** | feed of events | feed of **circles** (no people feed; no event-only feed); next-meeting shown as secondary signal | high — Discovery completely reframes |
| **Event Creation** | host creates an event | host creates a **circle**, then schedules **meetings** inside it | high — replaces one-off event creation with two-step "create circle, schedule meetings" |
| **Applications** | per-event application | per-circle **membership request** + per-meeting RSVP | high — replaces application flow |
| **Chat** | per-event chat for approved attendees | per-circle chat for members + meeting-context system messages | medium — chat surface shifts from event to circle |
| **Trust** | profile completeness, verification, attendance, no-show, host feedback, internal score, public badges | unchanged in mechanics; signals now also reflect membership continuity and repeat attendance; raw score still hidden (Inv. 3) | low |
| **Safety** | report user/event/message, block, moderation queue, admin actions, audit logs, basic AI moderation | unchanged in principles; targets now include `circle_id` and `meeting_id`; same audit-log invariant (Inv. 4); same "AI assists, never judges" (Inv. 5) | medium — admin tooling targets expand |
| **Admin** | login, moderation queue, reports, user detail, event detail, moderation actions, audit logs, suspicious activity | same screens; "event detail" extended with circle/meeting axis | medium — admin schema expands |
| **Analytics** | activation, engagement, safety metrics | shift to circle-centric (see §30); North Star candidate shifts from "trusted offline interactions" to "active trusted circles with confirmed recurring attendance" | medium — metric definitions change |

> **Phase note:** these are *proposal-level* scope changes. No Sprint Backlog edits are made by this document. If accepted, the Sprint Backlog needs a separate, deliberate update (§36).

---

## 16. Onboarding Changes

Proposed onboarding fields (with P0 / P1 designation):

| Field | P0 / P1 | Notes |
|---|:--:|---|
| city / area | **P0** | required to surface circles; area only, no exact location (Inv. 9) |
| interests | P0 | kept for compatibility with current Core; weight in discovery is *lower* than vibe |
| vibe tags | **P0** | promoted to primary signal; curated tag set, not free text |
| activity types | P0 | aligned with the existing limited category list (no nightlife/parties) |
| preferred rhythm | **P0** | weekly / biweekly / monthly / flexible |
| comfort composition | **P0** | mixed / female-friendly / women-only / no preference — see §22 |
| group size comfort | P0 | 4–6 / 6–10 / 10+ buckets |
| host willingness | P1 | "would you consider hosting?" — opt-in, low-friction |
| safety principles acceptance | **P0** | unchanged from current Core; required gate |
| photo / verification | P0 | unchanged in invariant — verification level remains internal signal (Inv. 3) |

> P0 fields are required to enter the circle loop. P1 fields are added later without blocking activation.

---

## 17. Discovery Changes

**Users discover circles, not individual people.**

- **No swipe.**
- **No people-first feed.**
- **No dating-style matching.**
- **No browsable user catalog** (even adjacent to circle discovery).

A Circle Discovery card should show:

- circle **title**;
- **vibe** tags (1–3);
- **rhythm** indicator (e.g., "weekly", "biweekly");
- **approximate area** only (Inv. 9);
- **capacity** signal (e.g., "small group of 6–8");
- **comfort composition** (e.g., "female-friendly") — see §22;
- **approval required** flag (always true in MVP per Inv. 8);
- **next meeting** date *if* one is scheduled and *if* circle is `live`;
- a **safe host profile** snippet (display name, verification badge only — never raw trust score, Inv. 3).

Filters allowed:

- area;
- vibe tags;
- rhythm;
- comfort composition;
- group size.

Filters **not** allowed in MVP:

- "available right now" / "tonight";
- "near me, exact distance" (only distance buckets per Inv. 9);
- any host attractiveness / popularity ranking.

---

## 18. Joining Changes

**Old (current Core):** Apply to an event. Each event is its own application.

**New (proposed):** **Request a place in a circle.** One decision creates membership; meetings then accrue via RSVP without re-applying.

Flow:

1. User taps "Request a place" on a circle.
2. Optional intro note (short).
3. Host receives the request in their **Membership Requests** queue (replacing per-event Applications).
4. Host responds:
   - **Approve for intro meeting** — user gets an invitation to one specific upcoming meeting; can convert to `member` after attendance, subject to host policy.
   - **Approve as member directly** — for circles with `intro_meeting = false`.
   - **Decline** — non-public; non-stigmatizing copy; no audience.
   - **Waitlist** — if capacity reached or composition rules require deferring.
5. Once `member`, the user RSVPs to each meeting without further approval.

> The approval mechanic is preserved (Inv. 8). It is reframed as **fit protection for the circle** rather than ranking of the person (doc 22 §7). Copy and UX must reinforce this framing.

---

## 19. Location Privacy Mapping

Default visibility rules (proposed; same spirit as current `Location privacy logic` in Core, scoped to circle/meeting):

| User state vs circle | What they see about location |
|---|---|
| Not registered | nothing — landing only |
| Onboarded, no relationship to circle | **area only** |
| `requested` / `waitlisted` / `rejected` | **area only** |
| `approved_for_intro_meeting` | **exact location for that one meeting only** |
| `member` | **exact location for upcoming meetings** within reveal window |
| `paused` | area only (no upcoming meeting locations) |
| `left` / `removed` / `removed_for_safety` / `banned_from_circle` | **no future exact location**; past locations no longer surfaced |
| `blocked` user (separate block list) | circle hidden or otherwise inaccessible |

**No live user location** at any state (Inv. 9).

These mappings extend, not weaken, Inv. 1 and Inv. 9. Every state is *more or equally restrictive* than the current event-first defaults.

---

## 20. Chat Model

**MVP chat surfaces (proposed):**

- **Circle chat** — group chat for members of a single circle. Replaces per-event chat.
- **System messages** — lifecycle transitions, RSVP locks, meeting reminders, "host approved your request", etc.
- **Meeting updates** — host can post a meeting-scoped announcement (visible inside the circle chat with a meeting tag).
- **Report message** — same as Core; available on every message (Inv. 6).
- **Block user** — same as Core; takes effect across the whole product (Inv. 6).
- **Admin freeze chat** — admin can freeze a circle chat as a moderation action; mandatory audit log (Inv. 4).

**No open DMs (Inv. 2).** This is non-negotiable.

**P1 (later, after core circle loop is validated):**

- Mutual opt-in 1:1 messaging **only** after shared context — both users must be members of the same circle with at least one shared attended meeting. Even then, 1:1 is opt-in by both sides, can be muted/blocked, and produces no notification on the receiver until accepted.

> 1:1 must never become the path of least resistance. It must remain narrower and more expensive than circle chat by design.

---

## 21. Composition Visibility (Staged Reveal)

The amount of information a user sees about a circle grows with their relationship to it. The staged reveal protects member privacy and reinforces approval-as-fit-protection.

| Stage | What is shown |
|---|---|
| **Before request** (discovery) | **Aggregated composition only** — e.g., "small group, 6 members, female-friendly". No individual identities. Vibe, rhythm, area, host display name + verification badge. |
| **After request** (waiting for host) | More circle context: full circle description, theme, rules, host's hosting style. **No individual member identities yet.** |
| **After approval** (intro-meeting or member) | **Safe profiles of members** — display name, photo, verification badge, soft attendance badge. **Never** raw trust score (Inv. 3), report counts, block counts, removal history, list of other circles, or any private/internal data. |
| **Never shown to anyone** | raw trust score (Inv. 3); report counts; block counts; removal history; cross-circle memberships of others; admin notes; internal moderation state. |

---

## 22. Women-only / Female-friendly Option

Treated as a **comfort-composition** attribute of a circle, set by the host at creation.

Options (proposed):

- **Open mixed** — default; no composition constraints beyond category and capacity.
- **Female-friendly** — circle is mixed but composition is host-curated to ensure women are not isolated; explicit copy about expected behavior.
- **Women-only** — only users who self-identified as women in onboarding may request membership. Host accountability is heightened.
- **Host-defined composition constraints** — host can specify a non-discriminatory composition rule appropriate to the circle (e.g., language, age band) within product policy.

**Risks (must be addressed before implementation):**

- **False sense of safety** — a "women-only" label can over-promise; the product must not imply guaranteed safety beyond what the underlying mechanisms (approval, audit, removal, blocking) actually deliver.
- **Verification expectations** — users may expect identity verification; current MVP has only verification levels (Inv. 3 keeps raw signals internal). Copy must be honest about what is verified.
- **Moderation burden** — composition-sensitive circles concentrate moderation workload; need admin capacity.
- **Misrepresentation** — users may misrepresent identity to gain access; the system must rely on host accountability + audit + report/block, not on identity adjudication.
- **Legal / platform considerations** — composition rules must comply with local law and platform store policy; product / legal review required before launch.

**Validation requirement:** Before any implementation of female-friendly / women-only options, the proposal **must be tested with women** (target audience). See §33.

---

## 23. Trust Model Mapping

Trust signals re-anchored from per-event to per-circle, with no change to safety invariants:

- **Attendance reliability across meetings** — a member who reliably attends scheduled meetings raises internal reliability signal.
- **Circle host reliability** — hosts accrue separate signals (timely approvals, well-run circles, no-safety-removal history).
- **Membership history** — duration and breadth of memberships are internal signals.
- **No-show tracking** — preserved from Core; tied to meeting attendance; internal only.
- **Public badges remain soft** — Verified, Reliable attendee, Hosted before, Attended events (the existing list).
- **Raw trust score remains internal only** — Inv. 3. No number is ever shown to users.
- **Trust is not social credit** — Inv. 10. Internal signals must not become a public ranking system or be exposed to other users.

> Trust shape is preserved; surface area changes only to reflect that meetings now occur under a circle umbrella.

---

## 24. Safety Model Mapping

- **Report / block everywhere** — circle card, circle detail, meeting detail, member profile, chat message (Inv. 6).
- **Circle-level moderation** — admin can take action at the circle scope (freeze chat, force pause, archive, remove_for_safety).
- **Membership removal** — host can remove a member from their circle; non-public copy (§11). Member retains other circles. Admin removal is separate.
- **No public shame** — no public lists of removed or banned users.
- **Host accountability** — hosts who run safety-removed circles or generate disproportionate reports trigger admin review (internal signal, Inv. 3 — never shown publicly).
- **Comfort controls** — composition rules (§22), pause/leave one-tap (§11), area-only by default (§19).
- **Admin review** — preserved as the final authority on serious enforcement (Inv. 5, 11). AI assists with triage and signal sorting but never decides bans or safety removals alone.
- **Audit logs** — every moderation-sensitive action creates an audit-log entry (Inv. 4). Targets now include `circle_id` and `meeting_id` in addition to user/event/report IDs.
- **AI assistive only** — Inv. 5. AI may flag, sort, summarize. AI is never the final judge.

---

## 25. Belonging Mode

**If a user found their circle and stops searching, that is success — not churn.**

Principles:

- **Belonging is a success state**, not churn. A user who attends their circle every two weeks and never opens discovery is the *target* outcome, not a retention failure.
- **No infinite discovery pressure** — the product must not nag users to join more circles, push notifications about new circles, or gamify circle count.
- **"My Circles" mode** — primary home surface for users who already belong somewhere; shows next meetings, circle chats, recent activity.
- **User may set "not looking for new circles"** — Settings toggle; turns off discovery prompts; can be reversed at any time.
- **Home shifts from discovery-first to circle-first** for users in belonging mode. Discovery remains one tap away but is not the default screen.

This is a meaningful product stance: most social apps optimize for time-in-feed and would consider belonging-without-searching as churn. The product explicitly does not.

---

## 26. What Remains Explicitly Out of Scope

Carried forward from Core "Не входит в MVP" plus the integrity invariants from doc 22 §12. **None of these are added or relaxed by this proposal.**

- swipe;
- people feed (browsable catalog of users);
- open DMs (Inv. 2);
- dating mechanics — like / match / "interested in" / chemistry score / romantic ranking (Core rule 6);
- public ratings (Core rule 5);
- raw trust score visible to users (Inv. 3);
- public follower / audience graph;
- exact public map pins (Inv. 1);
- live location (Inv. 9);
- payments / tickets / paid events / monetization (Core rule 7);
- nightlife / party mechanics;
- streams / online broadcast mode;
- complex auto-matching algorithms (only curated discovery in MVP);
- B2B monetization in MVP.

> All ten safety invariants of Core remain binding. This proposal does not relax any of them.

---

## 27. Database Implications (Conceptual Only — No SQL)

> **No SQL is written here.** No migrations are created. No edits are made to [`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md). This section is a conceptual mapping to support discussion.

| Current entity (Core / doc 06) | Proposed entity (circle model) | Notes |
|---|---|---|
| `events` | `circles` + `circle_meetings` | A circle replaces "event" as the user-facing unit; meetings replace per-event records as the scheduled instance |
| `event_applications` | `circle_membership_requests` | One request per (user, circle), not per meeting |
| `event_attendees` | `circle_memberships` + `meeting_attendance` | Membership is persistent; attendance is per-meeting |
| `event_chat_messages` | `circle_chat_messages` | Chat anchored to circle, not meeting; meeting context attached as a tag where relevant |
| `event_locations` | `meeting_locations` | Exact-location protection preserved (Inv. 1); access policy keyed on membership status |
| `trust_events` | **stays as `trust_events`** | Internal signals; same shape; new event sources (membership transitions, repeat attendance) |
| `reports` | unchanged shape; targets extended | `target_type` enum gains `circle_id` and `meeting_id` |
| `blocks` | unchanged | block scope is user-to-user; effects propagate to circle requests and chat |
| `audit_logs` | unchanged shape; new event types | new entries for circle/meeting moderation actions (Inv. 4) |
| `invite_codes`, `notifications` | unchanged | scope adjusts to circles/meetings where applicable |

Required schema changes **if** the proposal is accepted (to be designed in a separate sprint; **not** in this doc):

1. New tables: `circles`, `circle_meetings`, `circle_memberships`, `circle_membership_requests`, `circle_chat_messages`, `meeting_locations`, `meeting_rsvps`, `meeting_attendance`.
2. New enums: `circle_status`, `meeting_status`, `membership_status`, `rhythm`, `comfort_composition`.
3. Migration of existing event-shaped placeholders into circle-shaped entities (the codebase has no real schema yet; Sprint 1 only created placeholder folders — see [`/docs/21_SPRINT_1_INFRASTRUCTURE_REVIEW.md`](21_SPRINT_1_INFRASTRUCTURE_REVIEW.md)).
4. `reports.target_type` enum extension.
5. `audit_logs` event-type taxonomy extension.

> These are notes for a future design pass, **not** instructions to implement.

---

## 28. RLS / Security Implications

Conceptual policy mappings (no SQL written; informs a future revision of [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md)):

- **Meeting `exact_location` access** is gated by `membership_status IN ('approved_for_intro_meeting' for that meeting, 'member')` — preserves Inv. 1.
- **Circle chat read/write** is gated by `membership_status = 'member'`.
- **Circle composition (member list)** is visible per staged reveal (§21); pre-request views see aggregates only.
- **Safe circle view** for non-members exposes only public discovery fields.
- **Host permissions** are scoped to the circles they host; cannot be inherited cross-circle.
- **Admin permissions** are global; service role server-side only ([`/docs/16_PHASE_GATE_TO_INFRASTRUCTURE.md`](16_PHASE_GATE_TO_INFRASTRUCTURE.md) §6, [`/docs/19_ENV_CONFIG_STRATEGY.md`](19_ENV_CONFIG_STRATEGY.md)).
- **Removed members** lose read access to upcoming meeting locations and circle chat immediately on transition.
- **Blocked users** cannot create membership requests against a circle whose host is the blocker, and cannot see meetings or chat where the blocker is a member (subject to mutual-blocking semantics).
- **Audit logs** are admin-only read; all moderation-sensitive actions write entries (Inv. 4).

> All Core safety invariants remain enforced at the RLS layer (per current direction in doc 07).

---

## 29. Figma Implications

Screens that need to be revised in the prototype (current screens listed in `/docs/04_FIGMA_PROTOTYPE_PLAN.md` and the Figma file referenced in [[figma-prototype-build]]):

| Current screen | Proposed screen |
|---|---|
| Discover (event feed) | **Circle Discovery** |
| Event Detail | **Circle Detail** (+ secondary "Upcoming Meeting" section) |
| Apply Modal | **Request a Place** |
| Application Pending | **Membership Pending** |
| Application Approved | **Intro Invitation** / **You Are In The Circle** |
| Event Chat | **Circle Chat** |
| Host Applications | **Membership Requests** |
| Create Event | **Create Circle** (+ "Schedule a Meeting" sub-flow) |
| Admin Report Detail | extended to include `target_type = circle | meeting` |

New screens implied (not in current plan):

- **Membership Status / My Circles** (belonging mode home — §25);
- **Pause / Leave Circle** modal with non-stigmatizing copy (§11);
- **Composition Settings** for hosts at circle creation (§22).

> Figma updates are out of scope for this document. They are listed here so that, if the proposal is accepted, the prototype refresh has a clear scope.

---

## 30. Analytics Implications

Old metrics (from current Core §"Главные метрики MVP"):

- `event_viewed`
- `application_created`
- `event_attended`

New metrics (proposed):

- `circle_viewed`
- `circle_join_requested`
- `circle_membership_approved`
- `circle_meeting_rsvp_yes`
- `circle_meeting_attended`
- `circle_retention` — % of members still active after N weeks
- `repeat_meeting_attendance` — number of meetings attended per member per circle

Engagement and safety metrics from current Core are preserved in spirit; the keys shift from event-oriented to circle-oriented.

**North Star Metric candidates** (replacing current "trusted offline interactions"):

- **trusted recurring offline interactions** (incremental rename), or
- **active trusted circles with confirmed recurring attendance** (more explicit; tracks the *unit of value*).

Either candidate is a refinement, not a contradiction, of the current Core formula. To be chosen in the decision doc (§36).

---

## 31. Competitive Differentiation

How circles differentiate from InParty-class event apps:

- **Less one-off** — the unit of value is a recurring relationship, not a single calendar entry.
- **More belonging** — membership creates a "home", not a transaction.
- **More trust context** — repeat co-presence accrues trust signals that no marketplace can replicate.
- **More host control** — hosts shape circles continuously, not just per event.
- **More retention** — built-in cadence (the meeting rhythm) makes the product sticky without push-notification gamification.
- **More safety** — composition rules, persistent host accountability, and member continuity reduce the surface area for abuse vs. an open event marketplace.
- **Less noisy marketplace feel** — discovery is for *places to belong*, not for *people to meet*.

> Quantifying this differentiation in real terms requires `23_COMPETITIVE_ANALYSIS_INPARTY.md` (does not exist yet) and validation per §33.

---

## 32. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Scope creep** — circle model touches every module | high — could blow up Sprint 2 timelines | Hybrid Accept (§35) keeps operational model minimal; phased rollout of "My Circles" / belonging mode |
| **Harder supply** — circles need ongoing hosts, not one-off event creators | high — without hosts there are no circles | seeded/concierge circles for early beta; explicit host onboarding; host-willingness onboarding field |
| **Circles can feel exclusive** — members vs. non-members is a social boundary | medium — risk of in-group/out-group friction | non-stigmatizing copy; multiple-circle membership encouraged; pause/leave are normal |
| **Rejection feels more personal** — "you weren't accepted into the circle" stings more than "we couldn't fit you in this event" | high — could cause early churn | approval-as-fit-protection framing (doc 22 §7); copy validated with users (§33) |
| **Women-only validation complexity** — composition rules need real validation | high — getting this wrong damages trust irreparably | mandatory validation with women before any implementation (§22, §33); honest copy about what is verified |
| **Recurring commitment may scare users** — "do I have to come every week?" | medium — could suppress requests | rhythm transparency; "intro meeting only" path; pause one-tap; no commitment enforced beyond a single intro |
| **Harder first experience** — first meeting is high-stakes vs. casual event drop-in | medium — affects activation rate | intro meeting as a low-stakes lane; clear safety copy; small-group sizes by default |
| **Empty circle problem** — circles below critical mass die | high — kills belonging loop | seeded circles in beta; concierge-curated openings; minimum-viable-circle threshold (TBD) |
| **Host quality dependency** — bad host kills a circle | high — host is single point of social failure | host accountability + audit + admin review (§24); host-rotation moments (§9); ability to leave one-tap (§11) |
| **Schema changes** — significant compared to v0.1 | medium — slows infrastructure → product transition | conceptual mapping only in this doc (§27); design pass deferred until decision doc 26 |
| **Social drama / betrayal dynamics** — leaving / removing surfaces could create drama | high — affects safety perception | strict "no public labels" rule (§11); no notifications on transitions; non-stigmatizing copy |
| **Over-safety bureaucracy** — adding too many controls produces a sterile product | medium — kills magnetism (doc 22 §6) | controlled serendipity (§9); social temperature as dynamic regulator; safety as invisible foundation, not surface texture |

---

## 33. Validation Plan

Before this proposal is accepted, the following must be validated with real users (target: city residents 22–38, skewed female per doc 22 §4):

1. **5–7 women** on comfort and composition (§22) — does the women-only / female-friendly option feel honest, useful, and not over-promising?
2. **5–7 target users** on circle-vs-event preference — "would you rather request a place in a recurring small group, or apply to one specific event?"
3. **3–5 potential hosts** on willingness — "would you create and run a circle (vs. organize a one-off event)?"
4. Whether a **recurring group is more attractive than a one-off event** to the target audience.
5. Whether **requesting to join a circle** feels too serious / committed compared to applying to an event.
6. **Women-only / female-friendly language** — copy variants tested with women specifically.
7. **Rejection copy** — does the approval-as-fit-protection framing land (§18, doc 22 §7)?
8. **Pause / leave / removal language** — does it feel low-drama (§11)?
9. Whether users understand and accept that they **can belong to multiple circles** without conflict.

Method: short structured interviews; female-weighted sample; transcripts and themes logged.

> No implementation should start until at least items 1, 2, 5, 6, and 7 have been completed and reviewed.

---

## 34. Decision Options

### Option A — Accept Circle Core

Rewrite [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) around circles as primary primitive. Update all downstream docs ([`01_PRD.md`](01_PRD.md), [`02_USER_STORIES.md`](02_USER_STORIES.md), [`03_USER_FLOWS.md`](03_USER_FLOWS.md), [`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md), [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md), [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md), [`08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md), [`09_MODERATION.md`](09_MODERATION.md), [`11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md)) **before** any product implementation in Sprint 2+.

- Pros: cleanest mental model; one primitive; no conceptual debt.
- Cons: largest schema rewrite; highest doc churn; biggest validation requirement.

### Option B — Partial Accept

Keep events as MVP primitive. Add circles as a Phase 2 feature (recurring groups built on top of the existing event entity).

- Pros: smallest near-term doc / schema change; preserves Sprint 1 → Sprint 2 momentum.
- Cons: produces two primitives in the user mental model (events vs. circles); discovery has to handle both; delays the strategic differentiation.

### Option C — Hybrid Accept

**User-facing primitive = Circle. Operational/internal primitive = Meeting (the current "event" model, renamed and scoped under a circle).**

- Pros: keeps the operational model close to what already exists in `00_PRODUCT_CORE.md` (events become meetings under a parent); reframes user surface around circles where the strategic value is; smallest mismatch between user model and system model; recommended in §35.
- Cons: still requires non-trivial doc updates and a schema design pass.

### Option D — Reject

Stay event-first per current Core; no rewrite.

- Pros: zero churn; Sprint 2 proceeds on current plan.
- Cons: leaves the strategic concerns in §2 unaddressed; product remains structurally close to event-first competitors.

---

## 35. Recommendation

**Hybrid Accept (Option C).**

- **Primary user-facing primitive:** Circle.
- **Operational primitive:** Meeting.

Rationale:

- The strategic concerns in §2 are best addressed by reframing the user surface around circles. The user mental model needs to be belonging-first.
- The operational model can remain close to the current `events` entity, renamed and scoped. This keeps the schema design pass tractable and avoids throwing away the work in [`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md).
- Hybrid Accept lets Sprint 2 (auth / beta / onboarding) proceed without re-anchoring infrastructure, while pausing product-screen work until the decision doc lands.

Constraints on Hybrid Accept (must be honored):

- Keep MVP **minimal** — no complex auto-matching, no graph intelligence, no monetization (§26).
- **Do not change infrastructure** decisions ([`/docs/17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md) — Modular Monolith) — circles are a product/schema change, not an architectural one.
- **Do not implement product logic** until the decision document `/docs/26_PRODUCT_CORE_V2_DECISION.md` exists, has approved status, and `00_PRODUCT_CORE.md` has been deliberately updated (CLAUDE.md §4).
- Validation per §33 must be at least partially complete before acceptance.

---

## 36. Required Next Step

Create a follow-up **decision document**: [`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md) (does not exist yet).

That document must record:

- **Decision:** ACCEPT / PARTIAL ACCEPT / HYBRID ACCEPT / REJECT — with rationale.
- **What docs must be updated** (and in which order): `00_PRODUCT_CORE.md`, `01_PRD.md`, `02_USER_STORIES.md`, `03_USER_FLOWS.md`, `04_FIGMA_PROTOTYPE_PLAN.md`, `06_DATABASE_SCHEMA.md`, `07_SECURITY_RLS.md`, `08_TRUST_SYSTEM.md`, `09_MODERATION.md`, `10_ANALYTICS.md`, `11_SPRINT_BACKLOG.md`.
- **What implementation is paused** until the doc updates land (likely all product-screen and product-logic work).
- **Whether Sprint 2 Auth can continue** independently — likely **yes**, since auth/beta/waitlist/sessions are primitive-agnostic.
- **Whether Onboarding should wait** for the new fields in §16 — likely **yes** for the vibe / rhythm / comfort-composition fields, since changing them after activation would be costly.

> Optional intermediate document: [`/docs/25_PRODUCT_CORE_MANIFESTO.md`](25_PRODUCT_CORE_MANIFESTO.md) — a short, declarative version of the proposal's principles (anti-drift invariants, belonging > evaluation, etc.) — useful as a one-page reference for design and review conversations.

---

## 37. Summary

- **Circles may be a stronger core primitive** than events for this product's strategic position and safety model.
- **Events become meetings** under a circle umbrella — the operational mechanic survives, the user-facing primitive shifts.
- **All ten safety invariants of [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) remain intact.** No invariant is relaxed by this proposal.
- **This proposal must be validated** (§33) **or explicitly accepted** (§36) before any rewrite of Product Core.
- **No implementation** should start from this document. Sprint 2 Auth may continue independently; product-screen and product-logic work waits for the decision doc.

---

> Reminder: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) is the **first source of truth**. This proposal does not modify it. The repository remains in the Infrastructure Phase per [`/docs/16_PHASE_GATE_TO_INFRASTRUCTURE.md`](16_PHASE_GATE_TO_INFRASTRUCTURE.md). The next product step is a deliberate decision (§36), not implementation.
