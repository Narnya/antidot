# Product Core Manifesto v1 — Trusted Social Circles

> **Status:** ⚠️ **MANIFESTO PROPOSAL — NOT source of truth.**
> [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (v0.1) remains the **first source of truth** until a formal Product Core v2 decision is recorded ([`CLAUDE.md`](../CLAUDE.md) §0, §3, §4).
> **Owner:** Product
> **Created:** 2026-05-29
> **Relation to other docs:**
> - Companion to [`/docs/24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md`](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md) — same direction, expressed as principles instead of structure.
> - Successor in spirit to [`/docs/22_PRODUCT_CORE_RECORE_PROPOSAL.md`](22_PRODUCT_CORE_RECORE_PROPOSAL.md) §12 (anti-drift integrity invariants 11–19).
> - [`/docs/23_COMPETITIVE_ANALYSIS_INPARTY.md`](23_COMPETITIVE_ANALYSIS_INPARTY.md) does **not yet exist**. Where relevant, this manifesto references the InParty diagnosis recorded in doc 22 §0 and in memory [[inparty-shadow-risk]].
> **Phase note:** repository is in Infrastructure Phase ([`CLAUDE.md`](../CLAUDE.md) §6, [`/docs/16_PHASE_GATE_TO_INFRASTRUCTURE.md`](16_PHASE_GATE_TO_INFRASTRUCTURE.md)). This manifesto must not trigger product implementation, schema, RLS, migration, SDK setup, or Sprint Backlog edits.

---

## 1. Status

This is a **manifesto proposal**.

- It does **not** override [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) until explicitly accepted through a Product Core v2 decision (the future [`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md)).
- It does **not** modify any downstream doc.
- **No implementation** should start from this document alone.

Possible future decision statuses (recorded in doc 26):

- **ACCEPT**
- **PARTIAL ACCEPT**
- **HYBRID ACCEPT** (recommended in [doc 24 §35](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md))
- **REJECT**

---

## 2. Category Thesis

> **Operating system for trusted social circles.**

People have lost their stable social circles, their **third places**, their **community continuity**, and their **repeated live contact**. The product restores small recurring social contexts where trust grows through:

- **rhythm** — a circle meets again, and again;
- **shared presence** — the same people, in the same room;
- **repeated meetings** — not a single transaction;
- **safe entry** — approval as fit protection, not human ranking;
- **group context** — interaction always within a circle;
- **social continuity** — relationships have time to deepen.

This is **not** another app for browsing people or finding one-off events.

---

## 3. What We Are Building

- small recurring **social circles**;
- **trust-first** offline belonging;
- **safe entry** into group context;
- **regular live meetings**;
- **context-based** online communication;
- a **soft social graph** that emerges from repeated attendance;
- **social continuity** without dating mechanics;
- **belonging without ownership**;
- **safety without bureaucracy**.

Headline (cumulative — both preserved):

- **Trust infrastructure for modern social belonging.**
- **Trust infrastructure for modern social connection.**

Belonging is the durable form of connection. Connection without belonging decays into transactions; belonging without connection is hollow. The product targets the intersection.

---

## 4. What We Are Not Building

- not a **dating app**;
- not an **event marketplace**;
- not a **people marketplace**;
- not a **follower network**;
- not a **swipe app**;
- not a **public rating system**;
- not a **cold outreach tool**;
- not a **nightlife app**;
- not a **party app**;
- not a **corporate wellness club**;
- not a pure **Meetup clone**;
- not an **InParty clone**;
- not a **chat-first social network**.

The product is **not optimized for**:

- endless browsing;
- popularity;
- attraction or attractiveness signals;
- ranking of people;
- attention capture.

It is optimized for **belonging in context**.

---

## 5. Core Loop

> **Find the right vibe → Request a place → Enter safely → Attend first meeting → Become part of the rhythm → Belong → Grow trusted graph.**

| Step | What the user feels | What the system does | What protects the experience | What must not happen |
|---|---|---|---|---|
| **1. Find the right vibe** | "Where would I feel comfortable being?" | shows circles filtered by vibe, rhythm, area, capacity, composition | aggregated composition only; no exact location (Inv. 1, 9); no people feed | no swipe; no popularity ranking; no people catalog |
| **2. Request a place** | "I want to belong here." | creates a membership request to the host | rate-limited; blocked users cannot request; non-stigmatizing copy | no public application history; no "rejected" badge |
| **3. Enter safely** | "I want to know what I'm walking into." | host approves for intro meeting or for full membership | composition-aware approval; host accountability; appeal path (Inv. 8) | approval framed as ranking; harsh rejection copy |
| **4. Attend first meeting** | "Show up once; see if this is for me." | reveals exact location for that meeting only; records attendance | Inv. 1 (location after approval); Inv. 9 (no live location); Inv. 4 (audit) | intro meeting framed as a test |
| **5. Become part of the rhythm** | "I keep showing up; this fits my life." | transitions membership; surfaces meeting cadence and chat | pause one-tap (§12); leave one-tap (§10); no churn pressure | guilt UX about missing meetings |
| **6. Belong** | "I have a circle. I don't need to keep searching." | shifts home to "My Circles"; quiets discovery prompts | belonging-mode setting (§25); no nagging notifications | infinite discovery pressure (§19) |
| **7. Grow trusted graph** | "I have repeated context with these people; reconnect feels natural." | accrues soft co-presence edges (P1, gated) | no cold outreach; no people marketplace (Inv. 2) | open DMs; "who viewed me"; chemistry score |

---

## 6. Core Primitive

- **Primary user-facing primitive: `Circle`.**
- **Operational primitive: `Meeting`.**

A **circle** is the **social container** — a small recurring group with a vibe, a host, a rhythm, a capacity, and composition rules.

A **meeting** is a **scheduled offline instance** of that circle.

> Events do not disappear. They become **meetings of a circle**.

---

## 7. Vibe Over Interests

**Interests are surface-level. Vibe is deeper.**

A circle should not be defined only by:

- coffee;
- books;
- walks;
- board games;
- sports.

A circle should also express:

- **atmosphere**;
- **rhythm**;
- **pace**;
- **social energy**;
- **emotional openness**;
- **group size**;
- **conversation style**;
- **hosting style**;
- **comfort level**.

Examples (illustrative — curated tag set, not free text):

- calm intellectuals;
- slow brunch circle;
- ambitious internationals;
- artsy walkers;
- emotionally open conversations;
- quiet city explorers;
- low-pressure creative people.

**Avoid (hard product rules):**

- elitist labels;
- attractiveness framing;
- dating-coded labels;
- identity ranking;
- popularity language.

---

## 8. Social Temperature

The product must not become **sterile**.

- Too much safety without aliveness → a **cold wellness club**.
- Too much spontaneity without safety → **chaos** (and competitors' failure mode).

The product needs **controlled unpredictability**.

**Allowed later** (after the core circle loop is validated):

- occasional guest seats;
- seasonal gatherings;
- crossover circles;
- trusted introductions between circles;
- rotating host moments;
- temporary shared meetings between compatible circles.

**Never allowed:**

- random cold DMs (Inv. 2);
- swipe mechanics;
- people marketplace;
- open profile browsing of non-members;
- dating mechanics (Core rule 6);
- public attractiveness signals;
- popularity ranking.

Temperature is a **dynamic regulator**, not a fixed parameter. Early in a circle's life, the greenhouse is denser. As trust accrues, more serendipity surfaces unlock.

---

## 9. Approval as Fit Protection

Approval is **dangerous if it feels like human ranking**. If the user feels evaluated as a person, the product reproduces dating-app anxiety.

Approval must feel like:

- protection of **format**;
- protection of **group size**;
- protection of **comfort**;
- protection of **safety**;
- protection of **rhythm**.

Approval must **not** feel like:

- a popularity contest;
- a dating rejection;
- elitist gatekeeping;
- "you are not good enough".

**Principle:** *Fit protection, not human ranking.*

**Russian copy principle:**

> «Подтверждение нужно, чтобы сохранить формат и комфорт круга — не для оценки людей.»

**UX implications:**

- avoid harsh rejection language;
- prefer **«Не в этот раз»** over **«Отклонено»** where possible;
- explain that small circles need confirmation to protect the format;
- never publicly show rejection history (Inv. 10; §11).

---

## 10. Belonging Without Ownership

A circle is **not a clan**. A circle does **not own** a person.

Rules:

- users may belong to **multiple circles**;
- **no betrayal mechanics** — leaving one circle to join another generates no notification or visible signal;
- **no public "left / removed / rejected"** labels;
- **no public transition history** between circles;
- no one **owns** a person socially;
- **leaving should be normal** — one tap, optional reason;
- **pausing should be easy** (§12);
- membership changes must be **low-drama**;
- "found my circle and stopped searching" is **success**, not churn.

**Principle:** *Belonging is a success state, not a retention failure.*

---

## 11. No Public Shame

The product **must not create public social punishment**.

**Never show publicly:**

- removed from circle;
- rejected by host;
- "often leaves circles";
- no-show user;
- low trust;
- reported user;
- "blocked often";
- excluded;
- "betrayed circle".

**Use private, neutral language:**

- participation paused;
- participation ended;
- not this time;
- circle composition updated.

For other members of the circle, show at most:

> «Состав круга обновился.»

No member learns *which* state another member is in, *who* removed *whom*, or *why*. The member list simply no longer shows the person.

---

## 12. Pause Before Exit

People need **low-drama** ways to reduce participation. Forcing a binary "stay or leave" creates social friction that punishes the user for being honest.

The product should support:

- **pause** participation;
- **leave** quietly;
- **return later** if space exists;
- **reduce notifications** without leaving;
- **stop searching** for new circles entirely.

**UX principle:** *Offer "pause" before "leave" where appropriate.*

---

## 13. First Meeting Before Full Membership

To reduce social pain, a user may first be approved for an **intro meeting** before becoming a full member. This makes joining a low-stakes step and makes not-converting a low-stakes outcome.

Lifecycle concept:

```
requested
  → approved_for_intro_meeting
  → intro_attended
  → member
```

This lets the system honestly say:

> «Постоянное участие не было подтверждено.»

instead of:

> «Вас исключили.»

The first is administrative; the second is social punishment. The manifesto chooses the first.

---

## 14. Safety Without Bureaucracy

Safety must be **visible** but not **suffocating**.

**Allowed:**

- report / block (Inv. 6);
- staged location reveal (Inv. 1);
- comfort composition (§18);
- host accountability;
- moderation queue;
- audit logs (Inv. 4);
- AI assist (Inv. 5);
- transparent rules;
- safe, calm copy.

**Avoid:**

- fear-based UX;
- excessive warnings;
- cold bureaucratic language;
- false safety guarantees;
- overcontrolled social experience;
- treating every user as a suspect.

**Principle:**

> Safe enough to trust. Light enough to feel alive.

---

## 15. No People Marketplace

Rules:

- **no people-first discovery**;
- **no swipe**;
- **no follower graph**;
- **no public popularity**;
- **no cold 1:1**;
- **no "who viewed me"**;
- **no attractiveness signals**;
- **no profile shopping** (browsing users adjacent to context).

**Users discover circles, not people.**

People are **encountered through context**, not browsed as inventory.

---

## 16. Context-first Communication

**MVP:**

- **circle chat only**;
- **meeting updates** (host can post a meeting-scoped announcement inside circle chat);
- **system messages** (lifecycle, RSVP, reminders);
- **report message** (Inv. 6);
- **block user** (Inv. 6);
- **no open 1:1** (Inv. 2).

**P1 possible** (only after the core circle loop is validated):

- **mutual opt-in 1:1** — only after shared context (both users members of the same circle, at least one attended meeting together);
- **no free first message** — recipient must opt in before chat is created;
- **no pressure signals** (no read receipts, no "typing");
- **report / block always available**.

**Hard rule (Inv. 2):** *No cold DMs.*

---

## 17. Trust Principles

**Trust is:**

- contextual;
- earned through repeated presence;
- built through rhythm;
- internal for safety;
- public only as **soft positive badges**;
- explainable to admins;
- **recoverable from mistakes** — past missteps must not become permanent labels.

**Trust is not:**

- a public score;
- social credit (Inv. 10);
- a rating;
- popularity;
- dating desirability;
- ranking of human worth.

**Allowed public signals:**

- **Проверен**;
- **Надёжный участник**;
- **Уже проводил встречи**;
- **Участвовал во встречах**.

**Forbidden public signals:**

- "Trust score 87";
- "Low trust";
- "Risky user";
- "Often reported";
- "Top rated";
- "Popular";
- "High chemistry".

Inv. 3 binds: raw trust score is never shown to users.

---

## 18. Women-only / Comfort Composition

Comfort composition can be important — especially for women and safety-conscious users — but it must be handled **carefully**.

**Possible composition modes:**

- open mixed;
- female-friendly;
- women-only;
- host-defined comfort rules.

**Risks (must be addressed before implementation):**

- false sense of safety;
- verification expectations;
- moderation burden;
- misrepresentation;
- legal / platform considerations;
- over-bureaucratization.

**Requirement:** Women-only / female-friendly mechanics **must be validated with women** before implementation. See [doc 24 §33](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md).

**Language principle:** Use **«комфортный состав»** rather than fear-based framing. The point is *protecting the format*, not *implying danger*.

---

## 19. Controlled Growth

A circle does **not need infinite growth**.

A healthy circle may be:

- **full**;
- **closed for new members**;
- **waitlist-only**;
- **invite-only**;
- **paused**;
- **open for one guest seat**.

The product must **respect smallness**. Growth mechanisms should be **social bridges**, not **scale pressure**.

**Allowed later:**

- guest seat (with voucher);
- invite a guest (member-initiated);
- crossover circles;
- seasonal gatherings.

**Avoid:**

- pushing every user to join more circles;
- infinite discovery pressure (§25);
- making stable circles feel incomplete because they aren't growing.

---

## 20. Anti-drift Rules

**Hard no** (binding):

- open DMs (Inv. 2);
- swipe;
- likes;
- matches;
- chemistry score;
- public ratings (Core rule 5);
- public trust score (Inv. 3);
- followers;
- exact public location (Inv. 1);
- "people nearby" feed;
- pay-to-be-seen;
- promoted circles in MVP;
- nightlife / party mechanics;
- live streams / broadcast mode;
- dating-coded copy.

Social products **degrade gradually**: "add DMs" → "add likes" → "add discover people nearby" → suddenly a Tinder/Meetup hybrid. This manifesto exists to **prevent that drift**.

---

## 21. Monetization Guardrail

**MVP:**

- no user payments;
- no tickets;
- no paid events (Core rule 7);
- no pay-to-be-seen;
- no promoted circles;
- no creator economy;
- no follower economy.

**Later possible** (only after the trust loop is proven):

- B2B venues;
- off-peak venue partnerships;
- premium host tooling;
- never user-to-user monetization in MVP scope.

**Rule:** *Monetization must not corrupt trust.*

Any monetization that creates pressure on hosts to boost their circles, on users to pay to be seen, or on the platform to favor paid placement, is a Product Core change and must be decided in a Product Core update — not introduced silently.

---

## 22. Product Tone

Tone should be:

- **warm**;
- **intelligent**;
- **urban**;
- **premium**;
- **light**;
- **socially alive**;
- **safety-forward**;
- **not romantic**;
- **not bureaucratic**;
- **not childish**;
- **not corporate**.

**Russian copy** should avoid:

- overly formal bureaucratic wording;
- dating-coded language;
- harsh rejection wording;
- fear-based safety copy.

---

## 23. Design Implications

**Visual direction:**

- light;
- premium;
- soft;
- attractive;
- friendly;
- not dating;
- not corporate;
- not childish;
- not nightlife.

**The design should feel:**

- **calm but alive**;
- **safe but not sterile**;
- **premium but not cold**;
- **social but not romantic**.

**Avoid:**

- hearts;
- flirty imagery;
- people-shopping grids;
- rating visuals;
- trust score badges;
- nightlife gradients;
- corporate wellness look.

---

## 24. Data / Privacy Implications

The product should **minimize public social data**.

**Never expose:**

- exact user location (Inv. 9);
- live location (Inv. 9);
- raw trust score (Inv. 3);
- report counts;
- block counts;
- removal history;
- rejection history;
- other circles a user belongs to (social comparison vector);
- private moderation notes.

**Membership and composition visibility must be staged** ([doc 24 §21](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md)) — aggregated before request, full only after approval, never raw signals to non-admins.

---

## 25. Admin / Moderation Implications

Moderation must support:

- **reports** (user / circle / meeting / message);
- **blocks**;
- **membership removal review**;
- **host abuse detection** (internal signal, never public);
- **safety removals** (circle, meeting, user);
- **audit logs** for every moderation-sensitive action (Inv. 4);
- **AI assistive summaries** for triage;
- **circle-level reports**;
- **meeting-level reports**;
- **message-level reports**.

**AI remains assistant, not judge (Inv. 5).** AI may flag, sort, summarize, surface risk. AI never decides bans or safety removals alone. Serious enforcement requires human / admin review.

---

## 26. North Star Direction

**Old:**

> trusted offline interactions

**New candidates:**

- **trusted recurring offline interactions** (incremental rename), or
- **active trusted circles with confirmed recurring attendance** (more explicit).

**Explanation:**

> If someone stops searching because they found their circle, **the product succeeded**.

A user who attends their circle every two weeks and never opens discovery is the *target* outcome, not a retention failure. The North Star must reward this.

The choice between the two candidates is recorded in the future decision doc 26.

---

## 27. Strategic Differentiation

How this differs from neighboring products:

- **vs. InParty-class event apps** — fewer one-offs; recurring belonging; host accountability over time; less marketplace feel.
- **vs. Meetup** — small recurring circles, not large open events; vibe-based, not topic-only; trust signals from repeated co-presence.
- **vs. dating apps** — no like / match / chemistry / interested-in / romantic ranking; relationships emerge from context, not transactions.
- **vs. social networks** — no follower economy, no public popularity, no audience metrics, no vanity counters.

**We are not optimizing for:**

- more events;
- more profiles;
- more browsing;
- more messages;
- more notifications;
- more sessions per day.

**We are optimizing for:**

- stable circles;
- repeated attendance;
- safe belonging;
- a trusted social graph that grows from real co-presence.

> Quantifying this against InParty specifically requires [`/docs/23_COMPETITIVE_ANALYSIS_INPARTY.md`](23_COMPETITIVE_ANALYSIS_INPARTY.md), which does not yet exist.

---

## 28. Manifesto Principles

1. **Circles over events.**
2. **Vibe over interests.**
3. **Context over cold outreach.**
4. **Belonging over browsing.**
5. **Rhythm over randomness.**
6. **Fit protection over human ranking.**
7. **Trust over scale.**
8. **Group-first, not people-marketplace.**
9. **Safety without bureaucracy.**
10. **Controlled unpredictability, not chaos.**
11. **No public shame.**
12. **No infinite discovery pressure.**
13. **No open DMs.**
14. **No vanity metrics.**
15. **No follower economy.**
16. **No public ratings.**
17. **No raw trust score.**
18. **No swipe mechanics.**
19. **No dating mechanics.**
20. **AI assists, but does not judge.**

---

## 29. What This Means for Implementation

**If this manifesto is accepted**, implementation **must be paused** until the core docs are updated.

**Docs that must be updated** (ordered):

1. [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md);
2. [`/docs/01_PRD.md`](01_PRD.md);
3. [`/docs/02_USER_STORIES.md`](02_USER_STORIES.md);
4. [`/docs/03_USER_FLOWS.md`](03_USER_FLOWS.md);
5. [`/docs/04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md);
6. [`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md);
7. [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md);
8. [`/docs/08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md);
9. [`/docs/09_MODERATION.md`](09_MODERATION.md);
10. [`/docs/10_ANALYTICS.md`](10_ANALYTICS.md);
11. [`/docs/11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md).

**Infrastructure remains valid** — [`/docs/17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md), the Sprint 1 foundation ([`/docs/21_SPRINT_1_INFRASTRUCTURE_REVIEW.md`](21_SPRINT_1_INFRASTRUCTURE_REVIEW.md): PASS), and the env / config / testing strategy are primitive-agnostic and stand unchanged.

**Sprint 2 work, conditional:**

- **Auth** — may continue **only if** the onboarding decisions are not affected. Auth itself (email / Google / Apple / phone / sessions / protected routes / banned gate) is primitive-agnostic.
- **Onboarding** — should **wait** until the circle-core decision is accepted or rejected. The new onboarding fields (vibe tags as primary, rhythm, comfort composition, group-size comfort) cannot be retrofitted after activation without cost.

---

## 30. Summary

> We are not building another **dating app** or **event marketplace**.
> We are building **trusted recurring social circles** where **belonging grows through context, rhythm and safety**.

This manifesto is a **guardrail against product drift**. It is not a feature spec. It is the test every future feature, design choice, copy variant, and roadmap decision must pass.

**Next recommended task:** create [`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md) and record an explicit Product Core v2 decision (ACCEPT / PARTIAL ACCEPT / HYBRID ACCEPT / REJECT).

---

> Reminder: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) is the **first source of truth**. This manifesto does not modify it. The repository remains in the Infrastructure Phase per [`/docs/16_PHASE_GATE_TO_INFRASTRUCTURE.md`](16_PHASE_GATE_TO_INFRASTRUCTURE.md). The next product step is a deliberate decision document, not implementation.
