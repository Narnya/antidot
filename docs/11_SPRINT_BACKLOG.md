# Sprint Backlog v2 — Antidot

> **Status:** v2 (delivery plan для closed beta, **circle-first**).
> **Owner:** Product / Founder / Technical Founder
> **Last updated:** 2026-05-31
> **First source of truth:** [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2).
> **Upstream docs (binding):** [`01_PRD.md`](01_PRD.md), [`02_USER_STORIES.md`](02_USER_STORIES.md), [`03_USER_FLOWS.md`](03_USER_FLOWS.md), [`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md), [`05_ARCHITECTURE.md`](05_ARCHITECTURE.md), [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md), [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md), [`08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md), [`09_MODERATION.md`](09_MODERATION.md), [`10_ANALYTICS.md`](10_ANALYTICS.md), [`13_DESIGN_HANDOFF.md`](13_DESIGN_HANDOFF.md).
> **Supersedes:** Sprint Backlog v1 (event-first, 2026-05-18).
> **Sequenced by:** [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md) §24 Phase D step 12.

> ⚠️ **Это planning / documentation task only.** Никакого кода, миграций, SDK подключений в рамках самого backlog'а. Backlog описывает **что** делать, **в каком порядке**, **с какими acceptance criteria**. Реализация начинается **только** после Sprint 2 phase gate.

---

## 1. Source of Truth

- **Product Core v2** ([`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md)) — first source of truth.
- **PRD v2**, **User Stories v2**, **User Flows v2**, **Architecture v2**, **Database Schema v2**, **Security/RLS v2**, **Trust v2**, **Moderation v2** и **Analytics v2** определяют requirements.
- Sprint Backlog v2 следует **HYBRID ACCEPT** ([`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md)).
- **User-facing primitive** — Circle / Круг.
- **Operational primitive** — Meeting / Встреча круга.
- **Старый event-first backlog superseded.** Любые v1 тикеты, прямо отражающие event-first MVP, перенесены или закрыты в §0 vocabulary map ниже.
- Implementation **не должен ссылаться** на старый event-first MVP как на текущий product core.
- **Claude Code обязан проверять Product Core v2** перед каждой implementation task (CLAUDE.md §1 mandatory pre-task checklist).

### 0. Vocabulary update (v1 → v2)

| Старое (v1, superseded) | Новое (v2, binding) |
|---|---|
| Events Core | **Circles Core** |
| Event Creation | **Circle Creation** |
| Event Discovery | **Circle Discovery** |
| Event Applications | **Circle Membership Requests** |
| Event Attendees | **Circle Members** / **Meeting Attendees** |
| Event Locations | **Meeting Locations** |
| Event Chat | **Circle Chat** |
| Post-event Reconnect | **Belonging / Trusted Graph Growth** |
| Event-first MVP | **Circle-first MVP** |

> Любые остаточные `event_*` идентификаторы в коде / схемах / комментариях — **superseded / internal only** на transitional periods. Новые тикеты используют v2 vocabulary.

---

## 2. MVP Delivery Goal v2

Создать **invite-only mobile-first** продукт, в котором:

### User может

```
signup
  → пройти invite gate
  → завершить circle-fit onboarding
  → найти круги (Circle Discovery)
  → открыть Circle Detail
  → запросить место (Request a Place)
  → получить approval на intro meeting
  → увидеть exact meeting location (только для intro)
  → RSVP / посетить встречу
  → получить доступ к Circle Chat
  → стать member
  → пользоваться My Circles / Belonging Mode
```

### Host может

```
создать круг
  → настроить vibe / rhythm / comfort composition / capacity
  → запланировать встречу
  → review membership requests
  → approve for intro / reject / waitlist
  → управлять составом
  → управлять встречами
```

### Admin может

```
review reports
  → moderate users / circles / meetings / messages
  → take action (warn / restrict / ban / remove circle / remove meeting / hide message / freeze chat)
  → создать audit logs
```

### Main proof (Core v2 §5 loop)

> **Find vibe → Request place → Intro meeting → Become member → Repeat attendance → Belong.**

Если первая closed beta продемонстрирует этот loop хотя бы для нескольких живых circles — MVP выполнил задачу.

---

## 3. Delivery Assumptions v2

### Сохраняем

- **2-week sprints**;
- **mobile-first**;
- **iOS + Android** через React Native + Expo (SDK 52, выровнен Sprint 1);
- **backend** через Supabase / PostgreSQL / RLS;
- **admin dashboard** через Next.js (React 18, выровнен FIX-INFRA-001);
- **analytics** через PostHog later;
- **crash monitoring** через Sentry later;
- **AI moderation assist** later (Инв. 5 — advisory only);
- **Modular Monolith** ([`/docs/17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md)) — primitive change не меняет архитектуру;
- **Claude Code как engineering multiplier** (§30);
- **human review требуется** для product / security / trust / moderation decisions (§29).

### Добавляем (v2-specific)

- **product implementation остаётся paused** до завершения этого Sprint Backlog v2 + Phase Gate v2;
- **никаких миграций** до полного approval Database Schema v2 + Security/RLS v2;
- **Figma v2 prototype должен быть создан** до implementing product UI screens (Sprint 0B);
- **circle-first vocabulary обязателен** в новых тикетах, идентификаторах, copy.

---

## 4. Current Project Status

### Completed

- foundational docs v1;
- **Product Core v2 decision** ([`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md));
- **Product Core v2** ([`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md));
- **PRD v2** ([`/docs/01_PRD.md`](01_PRD.md));
- **User Stories v2** ([`/docs/02_USER_STORIES.md`](02_USER_STORIES.md));
- **User Flows v2** ([`/docs/03_USER_FLOWS.md`](03_USER_FLOWS.md));
- **Figma Plan v2** ([`/docs/04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md));
- **Architecture v2** ([`/docs/05_ARCHITECTURE.md`](05_ARCHITECTURE.md));
- **Database Schema v2** ([`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md));
- **Security / RLS v2** ([`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md));
- **Trust System v2** ([`/docs/08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md));
- **Moderation v2** ([`/docs/09_MODERATION.md`](09_MODERATION.md));
- **Analytics v2** ([`/docs/10_ANALYTICS.md`](10_ANALYTICS.md));
- **Design Handoff v2** ([`/docs/13_DESIGN_HANDOFF.md`](13_DESIGN_HANDOFF.md));
- **Sprint 1 infrastructure** ([`/docs/21_SPRINT_1_INFRASTRUCTURE_REVIEW.md`](21_SPRINT_1_INFRASTRUCTURE_REVIEW.md)) — **PASS** (2026-05-28 после FIX-INFRA-001);
- **Modular Monolith ADR** ([`/docs/17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md));
- infrastructure repo (pnpm monorepo, mobile + admin shells, env strategy, CI green, lockfile committed).

### Still needed before product implementation

- **Sprint Backlog v2** (этот документ);
- **обновлённый Phase Gate** для возобновления implementation ([§35 next document](#35-sprint-backlog-summary-v2));
- **Figma v2 prototype** (Sprint 0B — клик-прототип circle loop);
- **circle-first test / validation** (Sprint 0B FIGV2-007).

---

## 5. Priority System

### P0

Required for **closed beta**. Без этого beta не запускается.

### P1

Important **после closed beta** / extended beta. Запускается во вторую волну.

### P2

**Explicitly deferred** или **forbidden в MVP**. Требует отдельного product decision до запуска.

### Rules (binding)

- **P2 не может быть имплементировано** без явного product decision (Product Core update);
- **Open DMs** (Инв. 2) — forbidden в MVP;
- **swipe / dating mechanics** (Hard rule 6) — forbidden в MVP;
- **people marketplace** (Инв. 13) — forbidden в MVP;
- **public ratings** — forbidden в MVP;
- **payments / tickets** — forbidden в MVP;
- **women-only / female-friendly** требует validation до implementation (Core v2 §21).

---

## 6. Ticket Format v2

Каждый тикет должен содержать:

- **Ticket ID** (формат `<EPIC>-<NNN>`);
- **Epic** (см. §20);
- **Sprint** (Sprint 0A … Sprint 8);
- **Priority** (P0 / P1 / P2);
- **Type** (см. ниже);
- **Owner** (см. ниже);
- **Dependencies** (other tickets / docs);
- **Related docs** (ссылка на конкретные §);
- **Description**;
- **Acceptance Criteria** (testable, observable);
- **Safety / Security Notes** (какие инварианты затронуты);
- **Analytics Notes** (какие events / properties);
- **Definition of Done** (см. §7 global DoD + ticket-specific).

### Types

- Product;
- Design;
- Frontend;
- Backend;
- Mobile;
- Admin;
- Security;
- RLS;
- Analytics;
- QA;
- AI / Moderation;
- DevOps;
- Research.

### Owners

- **Founder / Product** — продуктовые решения, copy review, qualitative research.
- **Technical Founder** — архитектура, RLS / safety review, code review.
- **Claude Code** — implementation (под review).
- **Designer** — Figma, design tokens, UX states.
- **Admin / Safety Reviewer** — moderation operations, beta safety cadence.
- **Researcher / Founder** — beta interviews, comfort composition validation.

---

## 7. Global Definition of Done v2

Для любой implementation:

- ✅ соответствует **Product Core v2**;
- ✅ использует **circle-first vocabulary** (§0 map);
- ✅ нет standalone event marketplace;
- ✅ нет people marketplace (Инв. 13);
- ✅ нет open DMs (Инв. 2);
- ✅ нет raw trust score (Инв. 3);
- ✅ нет public ratings;
- ✅ нет public negative labels (Инв. 12);
- ✅ нет betrayal mechanics (Инв. 11);
- ✅ нет public leave / removal / rejection labels (Инв. 12);
- ✅ нет exact meeting location, exposed non-approved users (Инв. 1);
- ✅ нет service role, exposed client-side;
- ✅ RLS / security reviewed (если backend involved);
- ✅ analytics privacy boundary соблюдён (Analytics v2 §33);
- ✅ report / block доступны где relevant (Инв. 6);
- ✅ error states обработаны;
- ✅ empty states обработаны;
- ✅ mobile UX reviewed;
- ✅ tests added (где relevant);
- ✅ documentation updated (если behavior changes).

---

## 8. Global Safety Invariants v2

Эти 23 правила (CLAUDE.md §2) — binding для **каждого** тикета:

1. **Exact meeting location** никогда не visible non-approved users (Инв. 1).
2. **No open DMs** (Инв. 2).
3. **Raw trust score** никогда не shown (Инв. 3).
4. **Public ratings** forbidden.
5. **Public negative labels** forbidden.
6. **Dating mechanics** forbidden.
7. **Payments / tickets** forbidden в MVP.
8. **Moderation-sensitive actions** должны быть logged (Инв. 4).
9. **AI assists**, но не принимает final serious enforcement decisions (Инв. 5).
10. **Blocked users** не могут interact.
11. **Banned users** не могут interact.
12. **Service role** никогда не exposed client.
13. **Notifications и analytics** не должны leak'ать sensitive data.
14. **Admin-only data** никогда не available from mobile.
15. **No people marketplace** (Инв. 13).
16. **No follower economy**.
17. **No swipe mechanics**.
18. **No betrayal mechanics** (Инв. 11).
19. **No public leave / removal / rejection labels** (Инв. 12).
20. **No infinite discovery pressure** (Инв. 14).
21. **Circle membership не ownership** (Инв. 15).
22. **Users могут belong к multiple circles** (Инв. 16).
23. **Belonging — success state**, не churn.

---

## 9. Revised Sprint Timeline v2

### Sprint 0A — Product Core v2 Migration

**Status:** ✅ **completed** (все docs 00–10 v2 + 13 v2 написаны).

**Focus:** Product Core v2, Manifesto, PRD v2, User Stories v2, User Flows v2, Figma Plan v2, Architecture v2, Schema v2, Security/RLS v2, Trust v2, Moderation v2, Analytics v2, **Sprint Backlog v2** (этот документ — финальный шаг Sprint 0A).

### Sprint 0B — Figma Circle Prototype v2

**Status:** 🟡 **in progress / not started** (gated после Sprint Backlog v2 acceptance).

**Focus:** circle-first P0 Figma prototype + validation с 5–7 users.

### Sprint 1 — Infrastructure Foundation

**Status:** ✅ **completed and PASS** ([`/docs/21_SPRINT_1_INFRASTRUCTURE_REVIEW.md`](21_SPRINT_1_INFRASTRUCTURE_REVIEW.md) updated 2026-05-28 после FIX-INFRA-001).

**Keep as completed.** Не пере-планировать.

### Sprint 2 — Auth, Beta Access & Circle-fit Onboarding

**Focus:** auth, invite-only gate, waitlist, **circle-fit onboarding** (vibe / rhythm / comfort composition / group size), profile foundation, protected route gates.

### Sprint 3 — Profiles & Circle Discovery Foundation

**Focus:** profiles, safe public profiles, **Circle Discovery** shell, **Circle Detail** UI (read-only states), circle categories / vibe / rhythm seed, circle creation planning.

### Sprint 4 — Circles Core & Membership Requests

**Focus:** circles schema / migrations (после v2 approval), **circle creation**, **request place**, **membership requests**, host review, approval-for-intro, waitlist / reject.

### Sprint 5 — Meetings, Location Reveal & Belonging

**Focus:** **circle meetings**, **meeting locations** (protected), RSVP, **meeting location reveal** (Инв. 1), attendance / no-show, **My Circles**, **Circle Home**, **belonging mode**.

### Sprint 6 — Circle Chat, Safety & Trust Foundations

**Focus:** **Circle Chat** (no open DMs — Инв. 2), report / block, trust events, membership access enforcement, message moderation basics.

### Sprint 7 — Admin Moderation & Security Hardening

**Focus:** **admin moderation queue**, reports, moderation actions, audit logs, restrictions / bans, unsafe circle / meeting handling, **RLS tests**, AI moderation assist placeholder.

### Sprint 8 — Polish, Analytics & Closed Beta Prep

**Focus:** analytics SDK подключение (PostHog), crash monitoring (Sentry), QA, UX polish, beta safety operations, privacy / terms, App Store / Google Play prep.

### Expected closed beta readiness

**После Sprint 8**, если release criteria (§32) проходят.

---

## 10. Sprint 0A — Product Core v2 Migration

### Goal

Завершить controlled documentation migration от event-first к circle-first.

### Tickets

#### DOCV2-001 Product Core v2

- **Status:** ✅ completed ([`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) rewritten).

#### DOCV2-002 CLAUDE.md Product Core v2 guardrails

- **Status:** ✅ completed (CLAUDE.md updated 2026-05-29, enforces Core v2).

#### DOCV2-003 PRD v2

- **Status:** ✅ completed ([`/docs/01_PRD.md`](01_PRD.md) rewritten).

#### DOCV2-004 User Stories v2

- **Status:** ✅ completed ([`/docs/02_USER_STORIES.md`](02_USER_STORIES.md) rewritten).

#### DOCV2-005 User Flows v2

- **Status:** ✅ completed ([`/docs/03_USER_FLOWS.md`](03_USER_FLOWS.md) rewritten).

#### DOCV2-006 Figma Prototype Plan v2

- **Status:** ✅ completed ([`/docs/04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) rewritten).

#### DOCV2-007 Architecture v2

- **Status:** ✅ completed ([`/docs/05_ARCHITECTURE.md`](05_ARCHITECTURE.md) rewritten).

#### DOCV2-008 Database Schema v2

- **Status:** ✅ completed ([`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) rewritten, blueprint only).

#### DOCV2-009 Security / RLS v2

- **Status:** ✅ completed ([`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md) rewritten, policy design only).

#### DOCV2-010 Trust System v2

- **Status:** ✅ completed ([`/docs/08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md) rewritten).

#### DOCV2-011 Moderation v2

- **Status:** ✅ completed ([`/docs/09_MODERATION.md`](09_MODERATION.md) rewritten).

#### DOCV2-012 Analytics v2

- **Status:** ✅ completed ([`/docs/10_ANALYTICS.md`](10_ANALYTICS.md) rewritten).

#### DOCV2-013 Sprint Backlog v2

- **Status:** ✅ **this document.**

### Acceptance criteria для Sprint 0A

- ✅ ни один event-first core не остаётся как current MVP;
- ✅ circle-first docs consistent (все references проверены на §0 vocabulary);
- ✅ ни одного implementation файла не создано в рамках migration;
- ✅ открытые product вопросы перечислены явно (Core v2 §32, PRD v2 §27, далее).

---

## 11. Sprint 0B — Figma Circle Prototype v2

### Goal

Создать и validate P0 clickable circle-first prototype до начала product implementation.

### Tickets

#### FIGV2-001 — Create Circle Prototype v2 Foundations

**Scope:**

- cover / product context page;
- foundations (tokens, type, colors, spacing);
- components: `CircleCard`, `LocationPrivacyNotice`, `MembershipStatusBanner`, `RequestPlaceModal`, `MeetingCard`, `RSVPControl`, `BelongingHeroCard`.

**DoD:** компоненты собраны с auto-layout, variants для states.

#### FIGV2-002 — Create User Circle Loop Screens

**Screens:**

- Welcome;
- Invite Code;
- Safety Principles;
- Circle Discovery;
- Circle Detail (variants: not_requested, requested, waitlisted, rejected, approved_for_intro, member);
- Request Place;
- Membership Pending;
- Intro Meeting Approved;
- Meeting Location Reveal;
- Circle Chat;
- Become Member;
- My Circles;
- Circle Home.

#### FIGV2-003 — Create Host Circle Flow Screens

**Screens:**

- Create Circle (multi-step);
- Circle Preview;
- Host Circle Dashboard;
- Membership Requests List;
- Request Detail;
- Approve for Intro / Reject / Waitlist confirmations;
- Member Management.

#### FIGV2-004 — Create Safety Screens

**Screens:**

- Public Safe Profile;
- Report User;
- Report Circle;
- Report Meeting;
- Report Message;
- Block User;
- Report Submitted;
- Blocked State.

#### FIGV2-005 — Create Admin Low-fi Screens

**Screens:**

- Moderation Queue;
- Report Detail;
- User / Circle / Meeting / Message Context views;
- Action Modal;
- Audit Log.

#### FIGV2-006 — Wire Clickable Prototype

**Flows:**

- User Circle Loop;
- Host Circle Flow;
- Safety Flow;
- Admin Moderation Flow;
- Belonging Mode;
- Location Privacy Flow.

#### FIGV2-007 — Test Circle Prototype with 5–7 users

**Acceptance criteria:**

- **5/7** понимают концепцию круга;
- **5/7** понимают разницу circle vs event;
- **5/7** понимают «request place»;
- **5/7** понимают approval как fit protection (Core v2 §19);
- **6/7** понимают location privacy (когда раскрывается);
- **6/7** находят report / block;
- **6/7** понимают, что нет open DMs;
- **не более 1/7** воспринимают как dating app;
- **не более 1/7** воспринимают как people marketplace.

#### FIGV2-008 — Fix Critical Prototype Issues

Only если test выявил critical issues; иначе not needed.

---

## 12. Sprint 1 — Infrastructure Foundation

**Status:** ✅ **completed and reviewed as PASS** ([`/docs/21_SPRINT_1_INFRASTRUCTURE_REVIEW.md`](21_SPRINT_1_INFRASTRUCTURE_REVIEW.md)).

### Completed tickets (do not re-plan)

- ✅ **INFRA-001** Monorepo structure;
- ✅ **INFRA-002** TypeScript workspace;
- ✅ **INFRA-003** Expo mobile skeleton;
- ✅ **INFRA-004** Next.js admin skeleton;
- ✅ **INFRA-005** Shared packages baseline;
- ✅ **INFRA-006** Env strategy / Supabase placeholders;
- ✅ **INFRA-007** Lint / format / typecheck / CI;
- ✅ **INFRA-008** EAS placeholder;
- ✅ **INFRA-009** Design tokens placeholder;
- ✅ **INFRA-010** Mobile shell;
- ✅ **INFRA-011** Admin shell;
- ✅ **INFRA-012** Workspace imports;
- ✅ **INFRA-013** Env-safe config placeholders;
- ✅ **INFRA-014** Testing placeholders;
- ✅ **INFRA-015** Infrastructure review PASS;
- ✅ **FIX-INFRA-001** Validation fixes (lockfile + React 18 alignment).

### Non-blocking follow-ups (P1 / housekeeping)

- **INFRA-REV-002:** финальная `npx expo install --fix` для подтверждения SDK 52 alignment;
- **INFRA-REV-004:** удалить INFRA-012 smoke markers, когда реальные shared types начнут потребляться;
- **INFRA-REV-005:** аннотировать `docs/14` как superseded by `docs/16`;
- **INFRA-REV-006:** очистить residual `react-dom@19.2.6` nested под `react-helmet-async/`, если повторится на других машинах.

> Эти follow-ups **не блокируют** Sprint 2.

---

## 13. Sprint 2 — Auth, Beta Access & Circle-fit Onboarding

### Goal

Создать identity и controlled beta foundation для circle-first продукта.

### Tickets

#### AUTH-000 — Supabase Auth Implementation Plan

- **Type:** Backend / Planning.
- **Description:** документ-план перед implementation: dependencies (Supabase Auth, expo-auth-session, expo-apple-authentication, expo-secure-store), env variables (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY), client / server boundary, protected route model.
- **AC:**
  - ✅ dependencies defined;
  - ✅ env variables defined;
  - ✅ client / server boundary clear;
  - ✅ protected route model clear;
  - ✅ **no migrations**;
  - ✅ **no SDK installs** (только план).

#### AUTH-001 — Install Supabase client and create public anon wrapper

- **Allowed only after AUTH-000** approval.
- **AC:**
  - ✅ mobile uses **EXPO_PUBLIC** vars only;
  - ✅ **no service role** в mobile;
  - ✅ no schema / migrations;
  - ✅ typecheck passes.

#### AUTH-002 — Email signup / login

#### AUTH-003 — Google login (OAuth)

#### AUTH-004 — Apple login (OAuth)

#### AUTH-005 — Session persistence (expo-secure-store)

#### AUTH-006 — Logout

#### AUTH-007 — Protected route gates

**States (RLS v2 §6 + User Flows v2 §4.1):**

- `guest`;
- `authenticated_not_onboarded`;
- `onboarded_user`;
- `restricted_user`;
- `banned_user` placeholder.

#### BETA-001 — Invite code validation flow

#### BETA-002 — Waitlist signup flow

#### BETA-003 — Beta access gate

#### ONB-001 — Onboarding Welcome

#### ONB-002 — Safety Principles screen

**Must explain:**

- что такое круг (Core v2 §6);
- approval как fit protection (Core v2 §19);
- location privacy (когда раскрывается — Core v2 §17);
- no open DMs (Инв. 2).

#### ONB-003 — Basic Profile

#### ONB-004 — City / Area

**No exact location** (Инв. 9).

#### ONB-005 — Interests

#### ONB-006 — Vibe (primary discovery signal — Core v2 §8)

#### ONB-007 — Preferred Rhythm (weekly / biweekly / monthly / flexible)

#### ONB-008 — Comfort Composition Preference

**Carefully:** women-only / female-friendly могут быть **placeholder** до validation (Core v2 §21).

#### ONB-009 — Group Size Comfort

#### ONB-010 — Host Willingness (opt-in)

#### ONB-011 — Photo Upload Placeholder

#### ONB-012 — Verification Step Placeholder

(phone verification timing — open §34 #3).

#### ONB-013 — Profile Preview

#### ONB-014 — Onboarding Completion Gate

**AC:**

- ✅ `authenticated_not_onboarded` cannot access Circle Discovery;
- ✅ onboarding можно resume;
- ✅ нет dating profile framing;
- ✅ нет exact location collected;
- ✅ нет people marketplace framing.

#### PROF-001 — Profile Foundation

#### PROF-002 — Profile Completeness Calculation

#### PROF-003 — Safe Public Profile Boundary Planning

---

## 14. Sprint 3 — Profiles & Circle Discovery Foundation

### Goal

Создать profile layer и first Circle Discovery experience.

### Tickets

#### PROF-004 — Own Profile View / Edit

#### PROF-005 — Profile Photos Basic

#### PROF-006 — Vibe / Interests Editing

#### PROF-007 — Safe Public Profile

#### PROF-008 — Report / Block from Safe Profile UI

#### CIRCLE-001 — Circle Categories Seed Planning

(Core v2 §27 restricted list: Coffee / Casual meetup, Dinner / Brunch, Walk / City exploring, Board games, Light sports, Creative session, Community hangout.)

#### CIRCLE-002 — Vibe Tags Seed Planning

(curated, не free-text — Core v2 §8).

#### CIRCLE-003 — Circle Discovery Screen (read-only)

#### CIRCLE-004 — Circle Card Component

#### CIRCLE-005 — Circle Filters (city / category / rhythm / comfort composition)

#### CIRCLE-006 — Circle Detail — Not Requested state

#### CIRCLE-007 — Location Privacy Notice (binding — Core v2 §17)

#### CIRCLE-008 — Fit Protection Notice (binding — Core v2 §19)

#### CIRCLE-009 — Report Circle UI Placeholder

#### CIRCLE-010 — No Circles Empty State

### Acceptance criteria для Sprint 3

- ✅ users discover **circles, not people** (Инв. 13);
- ✅ нет exact location;
- ✅ нет full member list (composition staged — Core v2 §16);
- ✅ нет open DMs;
- ✅ нет public ratings;
- ✅ нет raw trust score.

---

## 15. Sprint 4 — Circles Core & Membership Requests

### Goal

Implement circle creation и membership request loop **после** schema / RLS tasks approved.

### Tickets

#### DBV2-001 — Create v2 migration plan

(no SQL until explicit per-table migration task).

#### DBV2-002 — Create enums migration (Schema v2 §5)

#### DBV2-003 — Create reference tables

- `cities`;
- `interests`;
- `vibe_tags`;
- `circle_categories`.

#### DBV2-004 — Create profile tables

- `profiles`;
- `profile_private_details`;
- `profile_photos`;
- `user_interests`;
- `user_vibe_tags`.

#### DBV2-005 — Create circle tables

- `circles`;
- `circle_vibe_tags`;
- `circle_rules`.

#### DBV2-006 — Create membership request tables

- `circle_membership_requests`.

#### DBV2-007 — Create circle membership tables

- `circle_memberships`.

#### RLSV2-001 — RLS plan for circles / membership

(policies из RLS v2 §11 + §12 + §13).

#### CIRCLE-011 — Create Circle Flow (host)

#### CIRCLE-012 — Circle Preview

#### CIRCLE-013 — Publish Circle (lifecycle: `draft` → `pending_review` / `live`)

#### CIRCLE-014 — Host Circle Dashboard

#### MEMBER-001 — Request Place Modal

#### MEMBER-002 — Submit Membership Request

#### MEMBER-003 — Membership Pending State

#### MEMBER-004 — Host Membership Requests list

#### MEMBER-005 — Request Detail (host scope)

#### MEMBER-006 — Approve for Intro

#### MEMBER-007 — Not This Time (soft reject — Core v2 §19)

#### MEMBER-008 — Waitlist

### Acceptance criteria для Sprint 4

- ✅ только onboarded users могут request place;
- ✅ host видит safe requester context (Trust v2 §19; no raw signals);
- ✅ rejected / waitlisted users **никогда не видят** exact location (Инв. 1);
- ✅ approval framed как fit protection (Core v2 §19);
- ✅ **no public rejection labels** (Инв. 12).

---

## 16. Sprint 5 — Meetings, Location Reveal & Belonging

### Goal

Implement circle meetings, RSVP, exact meeting location reveal и My Circles mode.

### Tickets

#### DBV2-008 — Create `circle_meetings`

#### DBV2-009 — Create `meeting_locations` (protected — Schema v2 §10.2)

#### DBV2-010 — Create `meeting_rsvps`

#### DBV2-011 — Create `meeting_attendance`

#### RLSV2-002 — RLS for meeting location privacy (CRITICAL — RLS v2 §15)

#### MEET-001 — Meeting Detail

#### MEET-002 — Meeting Location Reveal (Инв. 1)

#### MEET-003 — RSVP Going / Not Going

#### MEET-004 — Meeting Reminder Placeholder

#### MEET-005 — Attendance Confirmation (host-driven)

#### MEET-006 — No-show Recording (internal — Инв. 3, Trust v2 §16)

#### MEMBER-009 — Confirm Circle Membership (intro_attended → member)

#### MEMBER-010 — Not Confirmed After Intro

#### BELONG-001 — My Circles screen

#### BELONG-002 — Circle Home screen

#### BELONG-003 — Next Meeting Summary

#### BELONG-004 — Pause Participation (neutral — Инв. 11)

#### BELONG-005 — Leave Circle (neutral — Инв. 11)

### Acceptance criteria для Sprint 5

- ✅ exact meeting location **только** для approved_for_intro (one meeting) / member (upcoming) / host / admin;
- ✅ **нет exact location в notifications / analytics** (Инв. 1);
- ✅ paused / left / removed users теряют future access;
- ✅ **no public shame** (Инв. 12);
- ✅ **no betrayal mechanics** (Инв. 11);
- ✅ My Circles работает как belonging mode (Инв. 14 — success state).

---

## 17. Sprint 6 — Circle Chat, Safety & Trust Foundations

### Goal

Добавить context-first communication и basic safety / trust.

### Tickets

#### DBV2-012 — Create `circle_chat_messages`

#### DBV2-013 — Create `circle_chat_states`

#### RLSV2-003 — Circle Chat RLS (RLS v2 §17)

#### CHAT-001 — Circle Chat Screen

#### CHAT-002 — Send Circle Chat Message

#### CHAT-003 — System Messages (lifecycle, RSVP locks, approvals)

#### CHAT-004 — Message Actions (long-press menu)

#### CHAT-005 — Report Message

#### CHAT-006 — Chat Frozen State (read-only banner)

#### CHAT-007 — No Chat Access State

#### SAFE-001 — Create `user_blocks` table

#### SAFE-002 — Implement Block User UI

#### SAFE-003 — Enforce Block Restrictions (bilateral hide; US-REQ-13)

#### SAFE-004 — Create `reports` table

#### SAFE-005 — Report User

#### SAFE-006 — Report Circle

#### SAFE-007 — Report Meeting

#### SAFE-008 — Report Message

#### TRUST-001 — Create `trust_events` (append-only — Schema v2 §14.1)

#### TRUST-002 — Create `user_trust_summary` (internal only — Schema v2 §14.2)

#### TRUST-003 — `meeting_attended` trust event

#### TRUST-004 — `meeting_no_show` trust event (internal — Trust v2 §16)

#### TRUST-005 — `circle_member_confirmed` trust event

#### TRUST-006 — Hide raw trust score (column-level audit; Trust v2 §34.1)

### Acceptance criteria для Sprint 6

- ✅ **no open DMs** (Инв. 2);
- ✅ только allowed users access Circle Chat (membership-gated);
- ✅ report / block доступны везде (Инв. 6);
- ✅ raw trust score **internal only** (Инв. 3);
- ✅ **no public negative labels** (Инв. 12);
- ✅ **no public removal / rejection history** (Инв. 12);
- ✅ `circle_left` / `circle_paused` создают trust events с **weight = 0** (Trust v2 §7.6-7.7).

---

## 18. Sprint 7 — Admin Moderation & Security Hardening

### Goal

Сделать beta-safe moderation / admin / security foundation.

### Tickets

#### ADMIN-001 — Admin auth / authorization plan

#### ADMIN-002 — Moderation Queue (Moderation v2 §34)

#### ADMIN-003 — Report Detail

#### ADMIN-004 — User Detail

#### ADMIN-005 — Circle Detail Admin View

#### ADMIN-006 — Meeting Detail Admin View (exact location access logged)

#### ADMIN-007 — Message Detail Admin View

#### ADMIN-008 — Suspicious Activity Queue

#### ADMIN-009 — Audit Logs viewer

#### MOD-001 — Create `moderation_actions` table

#### MOD-002 — Create `audit_logs` table (append-only — Schema v2 §13.2)

#### MOD-003 — Dismiss Report action

#### MOD-004 — Warn User action

#### MOD-005 — Restrict User action

#### MOD-006 — Ban User action (admin-only, human — Инв. 5)

#### MOD-007 — Remove Circle action

#### MOD-008 — Remove Meeting action

#### MOD-009 — Hide Message action

#### MOD-010 — Freeze Chat action

#### MOD-011 — Ensure Audit Logs for каждое moderation action (Инв. 4)

#### AI-001 — AI Moderation Interface Placeholder (no SDK)

#### AI-002 — Profile / Circle / Message Moderation Assist Placeholder

#### SEC-001 — RLS Tests for Meeting Location Privacy (RLS v2 §15)

#### SEC-002 — RLS Tests for Circle Chat Access (RLS v2 §17)

#### SEC-003 — RLS Tests for Profile Privacy (RLS v2 §10)

#### SEC-004 — RLS Tests for Trust Data (RLS v2 §21)

#### SEC-005 — RLS Tests for Reports / Moderation (RLS v2 §19, §20)

#### SEC-006 — Service Role Boundary Verification

### Acceptance criteria для Sprint 7

- ✅ admin может review report end-to-end;
- ✅ serious actions требуют reason (DB constraint + Edge Function check);
- ✅ каждое moderation action создаёт audit log (Инв. 4);
- ✅ `banned` / `restricted` users limited (Edge Function gates);
- ✅ meeting location tests pass;
- ✅ circle chat tests pass;
- ✅ trust score не exposed (column audit);
- ✅ AI assistive only (Инв. 5).

---

## 19. Sprint 8 — Polish, Analytics & Closed Beta Prep

### Goal

Подготовка closed beta.

### Tickets

#### ANA-001 — Implement PostHog Mobile Tracking (Analytics v2 §35)

#### ANA-002 — Implement Server-side Critical Events (Analytics v2 §35)

#### ANA-003 — Implement Admin Analytics Events (separate project — open §34)

#### ANA-004 — Activation Dashboard (Analytics v2 §29 Dashboard 2)

#### ANA-005 — Safety Dashboard (Analytics v2 §29 Dashboard 5)

#### ANA-006 — Belonging Dashboard (Analytics v2 §29 Dashboard 8)

#### ANA-007 — Beta / Invite Dashboard (Analytics v2 §29 Dashboard 6)

#### ANA-008 — Verify Analytics Privacy Boundary (Analytics v2 §33 — QA cases §34)

#### SENTRY-001 — Setup Sentry Mobile

#### SENTRY-002 — Setup Sentry Admin

#### QA-001 — Full Circle Loop QA

#### QA-002 — Meeting Location Privacy QA (Инв. 1)

#### QA-003 — Report / Block QA

#### QA-004 — Admin Moderation QA

#### QA-005 — Circle Chat QA (no open DMs verified)

#### QA-006 — Mobile Performance QA

#### QA-007 — Accessibility Review

#### UX-001 — Polish Onboarding

#### UX-002 — Polish Circle Discovery

#### UX-003 — Polish Circle Detail States

#### UX-004 — Polish Membership Request States

#### UX-005 — Polish My Circles / Belonging

#### UX-006 — Polish Safety Microcopy

#### BETA-LAUNCH-001 — Closed Beta Launch Checklist

#### BETA-LAUNCH-002 — Seed First Beta Circles

#### BETA-LAUNCH-003 — Invite Batch

#### LEGAL-001 — Privacy Policy

#### LEGAL-002 — Terms of Service

#### STORE-001 — App Store Metadata

#### STORE-002 — Google Play Metadata

#### STORE-003 — Screenshots

### Acceptance criteria для Sprint 8

- ✅ closed beta invite-only launch ready;
- ✅ analytics dashboards live;
- ✅ crash monitoring active;
- ✅ **нет exact location leaks** (QA-002 PASS);
- ✅ report / admin queue работает;
- ✅ P0 UX states polished;
- ✅ privacy policy и terms существуют;
- ✅ app distributable beta users.

---

## 20. Epic Backlog v2

| Epic ID | Purpose | Included tickets (range) | Sprint | Priority |
|---|---|---|---|---|
| **EPIC-DOCV2** | Documentation migration to circle-first | DOCV2-001…013 | 0A | P0 |
| **EPIC-FIGV2** | Circle Figma prototype + validation | FIGV2-001…008 | 0B | P0 |
| **EPIC-INFRA** | Infrastructure foundation | INFRA-001…015, FIX-INFRA-001 | 1 ✅ | P0 |
| **EPIC-AUTH** | Auth (email / Google / Apple / session / logout / gates) | AUTH-000…007 | 2 | P0 |
| **EPIC-BETA** | Invite-only + waitlist gate | BETA-001…003 | 2 | P0 |
| **EPIC-ONB** | Circle-fit onboarding | ONB-001…014 | 2 | P0 |
| **EPIC-PROF** | Profiles (own + safe public) | PROF-001…008 | 2–3 | P0 |
| **EPIC-CIRCLE** | Circles (discovery + creation + detail) | CIRCLE-001…014 | 3–4 | P0 |
| **EPIC-MEMBER** | Membership requests + host review | MEMBER-001…010 | 4–5 | P0 |
| **EPIC-MEET** | Meetings + RSVP + attendance | MEET-001…006 | 5 | P0 |
| **EPIC-LOC** | Meeting location privacy (Инв. 1) | DBV2-009, RLSV2-002, MEET-002 | 5 | P0 |
| **EPIC-CHAT** | Circle Chat (context-first comm.) | CHAT-001…007 | 6 | P0 |
| **EPIC-BELONG** | My Circles / Belonging mode | BELONG-001…005 | 5–6 | P0 |
| **EPIC-SAFE** | Reports + blocks | SAFE-001…008 | 6 | P0 |
| **EPIC-TRUST** | Trust events + summary + tier | TRUST-001…006 | 6 | P0 |
| **EPIC-MOD** | Moderation actions + audit logs | MOD-001…011 | 7 | P0 |
| **EPIC-ADMIN** | Admin dashboard | ADMIN-001…009 | 7 | P0 |
| **EPIC-ANA** | Analytics SDK + dashboards | ANA-001…008 | 8 | P0 |
| **EPIC-QA** | QA full-loop + accessibility | QA-001…007 | 8 | P0 |
| **EPIC-LEGAL** | Privacy policy + terms | LEGAL-001…002 | 8 | P0 |
| **EPIC-STORE** | App Store / Google Play prep | STORE-001…003 | 8 | P0 |

**Dependencies:** см. §24.

---

## 21. P0 Ticket List v2

| Ticket ID | Sprint | Epic | Short Description | Dependency | DoD Summary |
|---|---|---|---|---|---|
| DOCV2-001…013 | 0A | DOCV2 | Migrate docs 00–10 + Sprint Backlog v2 | — | docs rewritten, circle-first |
| FIGV2-001…008 | 0B | FIGV2 | Circle Figma prototype + test | DOCV2 | 5/7 understand circle concept |
| INFRA-001…015, FIX-INFRA-001 | 1 ✅ | INFRA | Infra foundation | — | PASS review |
| AUTH-000 | 2 | AUTH | Supabase auth implementation plan | INFRA | plan approved |
| AUTH-001…006 | 2 | AUTH | Auth implementation | AUTH-000 | sessions work; logout invalidates |
| AUTH-007 | 2 | AUTH | Protected route gates | AUTH-001…006 | guest / not_onboarded / onboarded enforced |
| BETA-001…003 | 2 | BETA | Invite + waitlist + beta gate | AUTH | invite-only access works |
| ONB-001…014 | 2 | ONB | Circle-fit onboarding (vibe / rhythm / comfort / size / host) | AUTH, BETA | onboarding completion gate |
| PROF-001…003 | 2 | PROF | Profile foundation + completeness + safe boundary | ONB | completeness calculated |
| PROF-004…008 | 3 | PROF | Profile view / edit + photos + safe public + report/block | PROF-001 | safe public view works |
| CIRCLE-001…002 | 3 | CIRCLE | Categories + vibe tags seed | DBV2 | seed planning approved |
| CIRCLE-003…010 | 3 | CIRCLE | Discovery + Detail (read-only) | PROF, CIRCLE-001 | discover circles, no exact location |
| DBV2-001…007 | 4 | CIRCLE | Schema migrations: enums, profile, circles, membership | RLSV2-001 | tables created with RLS |
| RLSV2-001 | 4 | CIRCLE | RLS policies для circles / membership | DBV2-005…007 | policies enforced |
| CIRCLE-011…014 | 4 | CIRCLE | Circle creation + dashboard | DBV2-005, RLSV2-001 | host can create + publish circle |
| MEMBER-001…008 | 4 | MEMBER | Request place + host review + approve/reject/waitlist | DBV2-006, RLSV2-001 | full membership request loop |
| DBV2-008…011 | 5 | MEET | Meetings + locations + RSVP + attendance tables | RLSV2-002 | tables created |
| RLSV2-002 | 5 | LOC | RLS for meeting location privacy (CRITICAL) | DBV2-009 | RLS tests pass |
| MEET-001…006 | 5 | MEET | Meeting detail + reveal + RSVP + attendance + no-show | DBV2-008…011 | exact location reveal works for approved only |
| MEMBER-009…010 | 5 | MEMBER | Confirm membership / not confirmed after intro | MEET-005 | intro → member conversion |
| BELONG-001…005 | 5 | BELONG | My Circles + Circle Home + Next Meeting + Pause + Leave | MEMBER-009 | belonging mode active |
| DBV2-012…013 | 6 | CHAT | Chat messages + chat states tables | RLSV2-003 | tables created |
| RLSV2-003 | 6 | CHAT | Circle chat RLS | DBV2-012 | only members can read/write |
| CHAT-001…007 | 6 | CHAT | Circle Chat screen + messaging + frozen + access denied | RLSV2-003 | no open DMs verified |
| SAFE-001…008 | 6 | SAFE | Block + report (user/circle/meeting/message) | DBV2 | report/block accessible |
| TRUST-001…006 | 6 | TRUST | Trust events + summary + hide raw score | DBV2 | raw score internal only |
| ADMIN-001…009 | 7 | ADMIN | Admin dashboard (queue + detail views + audit logs) | MOD | admin can review end-to-end |
| MOD-001…011 | 7 | MOD | Moderation actions + audit logs + serious actions reason | ADMIN | every action audit-logged |
| AI-001…002 | 7 | MOD | AI moderation interface placeholder | MOD | placeholder только, no SDK |
| SEC-001…006 | 7 | SAFE | RLS tests (location / chat / profile / trust / reports / service role) | RLSV2-001…003 | all RLS tests pass |
| ANA-001…008 | 8 | ANA | Analytics SDK + dashboards + privacy boundary verified | (all P0) | analytics live, privacy-safe |
| SENTRY-001…002 | 8 | ANA | Sentry mobile + admin | — | crashes captured |
| QA-001…007 | 8 | QA | Full QA pass | (all P0) | beta-ready QA PASS |
| UX-001…006 | 8 | (multi) | UX polish | (all P0) | beta-ready UX |
| BETA-LAUNCH-001…003 | 8 | BETA | Launch checklist + seed circles + invite batch | (all P0) | beta launched |
| LEGAL-001…002 | 8 | LEGAL | Privacy + terms | — | docs live |
| STORE-001…003 | 8 | STORE | App Store / Google Play prep | — | submission ready |

---

## 22. P1 Backlog v2

### Включает

| Item | Why P1 | Dependency | Risk | Product decision needed |
|---|---|---|---|---|
| **Mutual opt-in 1:1 после shared context** | Validates core loop сначала (Core v2 §18) | Sprint 6 chat | Drift towards open DMs | Core v2 update требуется |
| **Guest seats** (с поручителем) | Social temperature unlock (Core v2 §9) | Validated host trust | Bringing untrusted into circle | Trust threshold |
| **Crossover circles** | Belonging unlock | Stable circles exist | Network sprawl | Cross-circle privacy |
| **Seasonal gatherings** | Annual rhythm | Stable hosting | Coordination overhead | — |
| **Trusted introductions** между circles | Belonging growth | Trust v2 graph foundation | People marketplace drift | Inv. 13 review |
| **Better circle recommendations** | Discovery quality | Beta data | Algorithm bias | Recommendation philosophy |
| **Host analytics** | Host support | ANA v1 done | Host obsession with metrics | Host metric framing |
| **Co-hosts** (US-P1-08) | Host capacity | MEMBER-001…010 | Authority diffusion | Co-host permissions |
| **Stronger identity verification** (`identity_reviewed`) | Trust ceiling | Trust v2 §13 | Privacy / friction | Verification provider |
| **Appeals flow** | Fairness (Moderation v2 §38) | Moderation P0 | Process load | Beta appeals scope |
| **Advanced moderation dashboard** | Scale | Mod v1 done | Admin complexity | — |
| **Better privacy / export / delete automation** | GDPR / user trust | DBV2 P0 | Data integrity | Retention policy |
| **Improved notification preferences** | UX comfort | Notif P0 | Over-engineering | — |
| **Circle language / event language preferences** | International | Beta data | Fragmentation | i18n strategy |
| **AI-assisted vibe matching** | Discovery quality | Real usage data | False matching | Inv. 5 — assistive only |
| **Circle media** (host photos) | Authenticity | DBV2 + storage | Moderation overhead | Mod v1 ready |
| **Return from pause flow** | Belonging UX | BELONG-004 | UX clarity | Pause / return rules (open §34 #11) |

---

## 23. P2 / Explicitly Deferred Backlog v2

### Forbidden in MVP / requires Product Core update

| Item | Why deferred / forbidden | Risk | Required decision |
|---|---|---|---|
| ~~**Open DMs**~~ | Инв. 2 (no cold DMs) | Cold outreach toxic | Core v2 update |
| ~~**Swipe**~~ | Hard rule 6; Анти-дрейф | Dating drift | Product Core rewrite |
| ~~**People-first discovery**~~ | Инв. 13 | People marketplace | Core invariant change |
| ~~**Public followers**~~ | Hard rule §35.17 | Audience economy | Product principle change |
| ~~**Public ratings**~~ | Hard rule 5 | Social credit | Core invariant change |
| ~~**Dating mechanics**~~ | Hard rule 6 | Brand erosion | Product Core rewrite |
| ~~**Romantic matching**~~ | Hard rule 6 | Dating drift | Product Core rewrite |
| ~~**Chemistry score**~~ | Hard rule 6 | Dating drift | Product Core rewrite |
| ~~**Exact public map pins**~~ | Инв. 1 | Safety / privacy | Inv. 1 change (не recommended) |
| ~~**Live location**~~ | Инв. 9 | Safety / privacy | Inv. 9 change (не recommended) |
| ~~**Payments / tickets**~~ | Core v2 §26 | Monetization complexity | Monetization Product Core update |
| ~~**Paid events**~~ | Core v2 §26 | Monetization | Monetization plan |
| ~~**Promoted circles**~~ | Core v2 §26 | Discovery distortion | Monetization plan |
| ~~**Nightlife / party mechanics**~~ | Core v2 §27 (not in MVP) | Safety / brand | Product decision + safety re-eval |
| ~~**Streams / online broadcast mode**~~ | Core v2 §27 | Offline-first thesis | Thesis update |
| ~~**Large event marketplace**~~ | Core v2 §2 ("not generic event app") | Brand drift | Product Core rewrite |
| ~~**B2B monetization**~~ | Core v2 §26 | Business model pivot | Monetization plan |
| ~~**Creator economy**~~ | Hard rule §35.17 | Audience economy | Product principle change |

---

## 24. Dependencies Map v2

| Feature | Depends On | Blocks | Risk if Missing |
|---|---|---|---|
| **Circle Discovery** | onboarding, profile, circle tables | Request Place | discovery unusable |
| **Request Place** | onboarding, profile, circles, membership_requests | Intro Approval | core loop blocked |
| **Intro Approval** | membership requests, host dashboard | Meeting Location Reveal | host can't approve |
| **Meeting Location Reveal** | `meeting_locations`, membership, RLS v2 §15 | Attendance, Chat for intro | **Инв. 1 нарушение risk** |
| **Circle Chat** | circle membership, RLS v2 §17 | Belonging, message reports | no communication |
| **My Circles** | memberships, meetings | Belonging mode | no retention surface |
| **Moderation** | reports, admin app, audit logs | Beta safety | unsafe beta |
| **Trust** | trust_events, attendance, moderation | Reliable badge, soft friction | no trust foundation |
| **Analytics** | event taxonomy (Analytics v2 §32) | Dashboards, beta decisions | blind beta |
| **Beta launch** | invite, auth, onboarding, circles, safety, admin, analytics | external users | premature launch risk |

---

## 25. Security-Critical Tickets v2

| Ticket | Associated Risk | Required Tests | Related Docs |
|---|---|---|---|
| **`meeting_locations` separation** (DBV2-009) | exact location leak | RLS test on `meeting_locations` | Schema v2 §10.2, RLS v2 §14.2 |
| **`meeting_locations` RLS** (RLSV2-002) | non-approved access | full state×access matrix | RLS v2 §15 |
| **`public_circles_view`** safe fields | leak exact location или member list | column-level audit | Schema v2 §18.2 |
| **`public_profiles_view`** safe fields | leak raw trust / private | column audit | Schema v2 §18.1 |
| **Circle chat approved-only** (CHAT-001, RLSV2-003) | non-member read/write | chat RLS tests | RLS v2 §17 |
| **Membership-based access** (RLSV2-001…003) | state confusion | per-state RLS tests | RLS v2 §13 |
| **Removal revokes access** (BELONG-005, MOD-007) | retained access | regression test | Core v2 §11 |
| **Report privacy** (SAFE-004) | reporter identity leak | RLS test reported user | RLS v2 §19 |
| **Trust score protection** (TRUST-006) | raw score leak | column-level audit + CI grep | Trust v2 §34, Инв. 3 |
| **Audit log creation** (MOD-011) | missing audit (Инв. 4) | every action creates audit | Moderation v2 §31 |
| **Service role boundary** (SEC-006) | client gets service role | secrets / env audit | RLS v2 §27 |
| **Analytics privacy boundary** (ANA-008) | sensitive в payload | payload validation | Analytics v2 §33 |
| **Notification privacy** | exact location в push | dispatcher gate test | RLS v2 §23.3 |
| **Block enforcement** (SAFE-003) | blocked user interacts | bilateral tests | Moderation v2 §11 |
| **Banned user gate** (AUTH-007) | banned user accesses | auth gate test | RLS v2 §7.7 |
| **No public removal / rejection history** | Инв. 12 нарушение | UI / view audit | Core v2 §15, §20 |

---

## 26. RLS Test Backlog v2

Каждый — отдельный test case в RLS test suite.

- [ ] guest cannot read circles;
- [ ] `authenticated_not_onboarded` cannot read Circle Discovery;
- [ ] onboarded user видит safe live circles;
- [ ] `requested` user cannot read `meeting_locations`;
- [ ] `waitlisted` user cannot read `meeting_locations`;
- [ ] `rejected` user cannot read `meeting_locations`;
- [ ] `approved_for_intro_meeting` user can read **только approved intro meeting location**;
- [ ] `approved_for_intro_meeting` user cannot read future / unrelated meeting location;
- [ ] `member` can read allowed upcoming meeting location;
- [ ] `member` cannot read unrelated circle meeting location;
- [ ] `paused` / `left` / `removed` лишаются future meeting location access;
- [ ] non-member cannot read circle chat;
- [ ] `requested` user cannot read circle chat;
- [ ] `rejected` user cannot read circle chat;
- [ ] `member` can read own circle chat;
- [ ] `member` cannot read unrelated circle chat;
- [ ] frozen chat blocks writes;
- [ ] public profile excludes private details;
- [ ] public profile excludes raw trust score;
- [ ] public circle view excludes exact location / full member list;
- [ ] normal user cannot read `trust_events`;
- [ ] normal user cannot read `user_trust_summary`;
- [ ] reported user cannot read report;
- [ ] normal user cannot read `moderation_actions`;
- [ ] normal user cannot read `audit_logs`;
- [ ] service role не exposed client-side.

---

## 27. Analytics Implementation Backlog v2

### Activation (Analytics v2 §12)

| Event | Trigger | Properties | Forbidden | Owner |
|---|---|---|---|---|
| `signup_started` | signup opened | `provider` | PII | Claude Code |
| `signup_completed` | account created | `provider` | PII | Claude Code |
| `onboarding_completed` | onboarding done | — | bio / phone / photo | Claude Code |
| `profile_completed` | completeness reached | `profile_completeness_bucket` | raw % | Claude Code |
| `first_circle_viewed` | first Circle Detail | `circle_id` | exact location | Claude Code |
| `first_circle_join_requested` | first request | `circle_id` | `intro_note` | Claude Code |
| `first_meeting_attended` | first attended | `meeting_id` | location value | Claude Code |

### Circles

| Event | Trigger | Properties | Forbidden |
|---|---|---|---|
| `circle_viewed` | Circle Detail opened | `circle_id`, `category_id`, `circle_status` | exact location |
| `circle_created` / `circle_published` | host publish | `category_id`, `circle_status` | description text |
| `circle_paused` | host pauses | — | — |
| `circle_removed_for_safety` | admin removes | `circle_id` (admin scope) | reason text |

### Membership

| Event | Trigger | Properties | Forbidden |
|---|---|---|---|
| `circle_join_requested` | submit | `circle_id` | `intro_note` |
| `circle_request_approved_for_intro` | host approves | `circle_id` | `host_note` |
| `circle_request_rejected` | soft reject | `circle_id`, `reason_category` | description |
| `circle_request_waitlisted` | waitlist | `circle_id` | — |
| `circle_membership_confirmed` | intro → member | `circle_id` | — |

### Meetings

| Event | Trigger | Properties | Forbidden |
|---|---|---|---|
| `meeting_viewed` | detail opened | `meeting_id` | — |
| `meeting_location_revealed` | exact shown | `meeting_id` | **location value** |
| `meeting_rsvp_yes` / `_no` | RSVP | `meeting_id` | — |
| `circle_meeting_attended` | confirmed | `meeting_id` | — |
| `no_show_recorded` | host marks | `meeting_id` (internal) | — |

### Belonging

| Event | Trigger | Properties | Forbidden |
|---|---|---|---|
| `my_circles_opened` | home opens | `active_circle_count_bucket` | — |
| `circle_home_opened` | open circle | `circle_id` | — |
| `repeat_meeting_attendance` | nth attendance | `n`, `circle_id` | — |
| `circle_membership_paused` | neutral | `circle_id` | — |
| `circle_membership_left` | neutral | `circle_id` | — |

### Chat

| Event | Trigger | Properties | Forbidden |
|---|---|---|---|
| `circle_chat_opened` | chat opens | `circle_id` | — |
| `circle_chat_message_sent` | send | `circle_id`, `message_type` | **body** |
| `message_reported` | report | `report_category` | body, description |

### Safety

| Event | Trigger | Properties | Forbidden |
|---|---|---|---|
| `report_created` | report submitted | `target_type`, `report_category`, `report_priority` | **description** |
| `block_created` | block submitted | `block_context` | reason text, blocked PII |
| `moderation_action_taken` | admin action | `action_type`, `target_type` | reason / admin notes |
| `host_abuse_flagged` | system flag | `flag_type` | — |
| `comfort_composition_reported` | report | `circle_id` | description |

### Trust

| Event | Trigger | Properties | Forbidden |
|---|---|---|---|
| `phone_verified` | verify success | — | phone number |
| `meeting_attendance_confirmed` | confirmed | `confirmation_source` | — |
| `reliable_badge_earned` | threshold | `badge_type` | raw score |
| `hosted_before_badge_earned` | threshold | `badge_type` | raw score |

### Beta

| Event | Trigger | Properties | Forbidden |
|---|---|---|---|
| `invite_code_used` | valid code consumed | `invite_status` | raw email |
| `waitlist_joined` | waitlist signup | `city_id` | raw email (or hashed only) |
| `beta_access_granted` | access granted | `beta_cohort` | PII |

---

## 28. QA Plan by Sprint v2

### Sprint 2 — Auth / Beta / Onboarding

- **Test:** session persistence, logout invalidates, invite gate, waitlist, all onboarding steps, completion gate.
- **Critical flows:** signup → invite → onboarding → completion → blocked from Discovery if not done.
- **Safety checks:** **no dating framing** в copy / визуальном языке; no people marketplace framing.
- **Regression risks:** onboarding step skipping leaves user в inconsistent state.

### Sprint 3 — Profiles / Discovery foundation

- **Test:** profile editing, safe public profile, discovery shell, Circle Detail (not_requested state).
- **Critical flows:** discover circles → open detail → see location privacy notice.
- **Safety checks:** **no people marketplace** (focus на circles); **no exact location** в discovery.
- **Regression risks:** safe public profile leaks private fields.

### Sprint 4 — Circles + Membership Requests

- **Test:** create circle, publish, request place, host review, approve / reject / waitlist.
- **Critical flows:** end-to-end request flow.
- **Safety checks:** **request / approval не раскрывают exact location**; rejection — neutral copy; **no public rejection labels**.
- **Regression risks:** rejected user видит location, host_note leak.

### Sprint 5 — Meetings / Location Reveal / Belonging

- **Test:** meeting creation, RSVP, reveal, attendance, My Circles, Pause, Leave.
- **Critical flows:** approved_for_intro видит exact location **только** для intro meeting.
- **Safety checks:** **exact meeting location access** (Инв. 1); paused / left lose access; **no public shame**.
- **Regression risks:** location в notification; location в analytics; betrayal mechanics.

### Sprint 6 — Circle Chat / Safety / Trust

- **Test:** chat messaging, report message, block, freeze, no chat access, trust events.
- **Critical flows:** Circle Chat — **только для members**; no open DMs anywhere.
- **Safety checks:** **no open DMs** verified; chat membership-gated; raw trust score не exposed.
- **Regression risks:** non-member читает chat; trust score leak.

### Sprint 7 — Admin Moderation / Security Hardening

- **Test:** moderation queue, all moderation actions, audit logs, RLS tests.
- **Critical flows:** report → admin review → action → audit logged.
- **Safety checks:** **каждое moderation action audit logged** (Инв. 4); reason required; AI assistive only.
- **Regression risks:** action без audit; AI auto-bans; admin sees raw trust.

### Sprint 8 — Full Beta QA

- **Test:** full circle loop end-to-end, analytics privacy, beta launch checklist.
- **Critical flows:** все P0 flows.
- **Safety checks:** **все Инв. 1–23**; **release criteria §32** PASS.
- **Regression risks:** all-around regressions before launch.

---

## 29. Human Review Gates v2

**Human / founder review обязателен** для:

- Product Core changes;
- PRD changes;
- UX flows (User Flows v2);
- **Figma v2 prototype** (Sprint 0B);
- database schema changes;
- RLS policies;
- **meeting location privacy** (Инв. 1);
- **membership lifecycle** (Core v2 §11);
- **pause / leave / removal UX** (Инв. 11, 12);
- trust scoring (формула, веса);
- moderation actions (taxonomy, copy);
- AI moderation behavior;
- **women-only / female-friendly mechanics** (Core v2 §21 — validation required);
- beta launch decisions;
- privacy policy;
- app store metadata.

> **Claude Code может generate implementation, но human review обязателен для product / security decisions.**

---

## 30. Claude Code Usage Plan v2

### Good Claude tasks (под review)

- boilerplate;
- migrations из approved schema (после DBV2-001 plan);
- CRUD screens;
- forms (validation, error states);
- validators;
- tests (unit / integration);
- **RLS tests** (после policies approved);
- seed data;
- analytics events (taxonomy из Analytics v2);
- admin pages;
- repetitive UI components.

### Requires human review (mandatory)

- architecture changes;
- RLS policies (design, не tests);
- trust scoring (формула, веса, decay);
- moderation rules (taxonomy, escalation);
- **meeting location reveal logic** (Инв. 1);
- **membership lifecycle transitions** (Core v2 §11);
- **pause / leave / removal UX** (Инв. 11, 12);
- comfort composition behavior (Core v2 §21);
- women-only / female-friendly mechanics;
- AI enforcement decisions;
- beta launch decisions.

### Before each coding task Claude must state (CLAUDE.md §1)

1. Feature / ticket.
2. Docs (Core v2 sections + downstream).
3. Safety invariants (из 23).
4. Files changed.
5. Tests needed.
6. Out of scope.

---

## 31. Implementation Readiness Checklist v2

Перед возобновлением product code:

- ✅ Product Core v2 complete;
- ✅ CLAUDE.md v2 complete;
- ✅ PRD v2 complete;
- ✅ User Stories v2 complete;
- ✅ User Flows v2 complete;
- ✅ Figma Plan v2 complete;
- ✅ Architecture v2 complete;
- ✅ Database Schema v2 complete;
- ✅ Security / RLS v2 complete;
- ✅ Trust v2 complete;
- ✅ Moderation v2 complete;
- ✅ Analytics v2 complete;
- ✅ **Sprint Backlog v2 complete** (этот документ);
- 🟡 **Figma v2 prototype drafted** (Sprint 0B — pending);
- 🟡 **Product Core v2 contradictions resolved** (downstream docs aligned);
- ✅ meeting location privacy reviewed (RLS v2 §15);
- ✅ circle membership lifecycle reviewed (Core v2 §11);
- 🟡 **first beta city / community decided или documented** (open §34 #2);
- ✅ repo checks green (Sprint 1 PASS).

> 🟡 = pending; product implementation возобновляется когда все ✅.

---

## 32. Closed Beta Release Criteria v2

Closed beta может launch **только если все** из этих PASS:

- ✅ invite-only access работает;
- ✅ auth работает (email + Google + Apple);
- ✅ onboarding работает (circle-fit, все шаги);
- ✅ profile completion работает;
- ✅ Circle Discovery работает;
- ✅ Circle Creation работает;
- ✅ Request Place flow работает;
- ✅ Host approval работает;
- ✅ Intro Meeting работает;
- ✅ **exact meeting location reveal работает только для approved access** (Инв. 1);
- ✅ My Circles работает (belonging mode);
- ✅ Circle Chat работает **только для members / allowed users** (Инв. 2);
- ✅ report / block работает (Инв. 6);
- ✅ moderation queue работает;
- ✅ admin может restrict / ban / remove circle / remove meeting (Инв. 4 audit);
- ✅ audit logs работают;
- ✅ analytics core events работают (Analytics v2 §43 checklist);
- ✅ crash monitoring работает (Sentry);
- ✅ **нет critical RLS tests failing**;
- ✅ privacy policy и terms существуют;
- ✅ beta safety operations defined (Moderation v2 §35).

---

## 33. Beta Success Metrics v2

Aligned с Analytics v2 §36 и Core v2 §30:

- **60%+** signup users complete onboarding;
- **40%+** onboarded users view at least one circle;
- **30–40%+** onboarded users request a place;
- **25%+** approved users attend first meeting в течение 14 days;
- **20%+** attendees attend second meeting;
- **some circles** reach 2+ completed meetings;
- **hosts create repeat meetings**;
- users понимают круги (qualitative — Analytics v2 §37 survey);
- users понимают approval / fit protection (qualitative);
- users понимают location privacy (qualitative);
- users **не** воспринимают как dating app;
- users **не** воспринимают как people marketplace;
- users находят report / block;
- users report feeling safe.

---

## 34. Open Delivery Questions v2

| # | Вопрос | Связь |
|---|---|---|
| 1 | Figma v2 completion **до** product UI implementation? (рекомендуется yes) | Sprint 0B |
| 2 | First beta city / community? | Core v2 §32, PRD v2 §27 |
| 3 | Phone verification **до request** или **до approval**? | ONB-012, Trust v2 §13 |
| 4 | Women-only / female-friendly — P0 или P1? | ONB-008, Core v2 §21 |
| 5 | Exact comfort composition modes wording (RU)? | ONB-008 |
| 6 | Intro meeting vs immediate membership as default? | MEMBER-006, MEMBER-009 |
| 7 | Сколько meetings до full membership? (1 / 2 / host-defined?) | MEMBER-009 |
| 8 | Intro-approved chat access? (partial / full / meeting-context only) | CHAT-001, Core v2 §18 |
| 9 | Member list visibility timing? (before / after intro?) | Core v2 §16 |
| 10 | Host removal permissions (какие категории, какие требуют admin)? | MOD-007, Core v2 §20 |
| 11 | Pause / return rules (can paused RSVP? does pause expire?) | BELONG-004 |
| 12 | Post-meeting membership confirmation (auto / host-confirm?) | MEMBER-009 |
| 13 | No-show dispute flow (P0 / P1)? | MEET-006, Trust v2 §16 |
| 14 | First-time host manual review (все circles через `pending_review`?) | CIRCLE-013, Moderation v2 §17 |
| 15 | Exact rate limits в P0? | SAFE-001, Trust v2 §21 |
| 16 | AI moderation provider (OpenAI / Claude / both)? | AI-001 |
| 17 | Admin dashboard до external beta? | ADMIN-001 |
| 18 | App name / branding final (Antidot подтверждён в Core v2) | LEGAL, STORE |
| 19 | Legal / privacy templates source? | LEGAL-001, LEGAL-002 |
| 20 | Circle language в Russian UI (final copy decisions)? | UX-006, Core v2 §8 |

---

## 35. Sprint Backlog Summary v2

**Sprint Backlog v2:**

- **переводит circle-first docs** в implementation plan;
- **MVP delivery** организовано в Sprint 0A–8;
- **P0 фокусируется на trusted recurring social circles**;
- **safety / location / privacy / membership** встроены в каждый sprint;
- **Sprint 1 infrastructure ✅ PASS** — не пере-планируется;
- **product implementation возобновится** после Sprint 0B (Figma v2) + Phase Gate v2.

### Next recommended document

Создать **обновлённый Phase Gate** для возобновления Sprint 2 implementation под Product Core v2:

**Опция A (recommended):** новый документ

> [`/docs/28_PHASE_GATE_TO_SPRINT_2_CIRCLE_AUTH_ONBOARDING.md`](28_PHASE_GATE_TO_SPRINT_2_CIRCLE_AUTH_ONBOARDING.md)

**Опция B:** обновить существующий

> [`/docs/22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md`](22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md) → v2 (circle-first).

Этот phase gate должен включать:

- ссылку на все v2 docs (00–11) как complete;
- ссылку на Sprint 1 PASS;
- gate criteria для перехода в Sprint 2 (Figma v2 + open questions §34 — какие нужно решить до Sprint 2);
- explicit listing of Sprint 2 deliverables (auth / beta / onboarding / profile foundation);
- safety invariants reminder;
- human review gates (§29);
- Claude Code usage rules (§30).

После Phase Gate v2 approval → **Sprint 2 implementation может начаться**.

---

> Reminder: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2) — **first source of truth**. Этот документ ему, PRD v2, User Stories v2, Architecture v2, Schema v2, RLS v2, Trust v2, Moderation v2 и Analytics v2 подчинён. Любой ticket, нарушающий §8 (23 safety invariants) или §7 global DoD — **отклоняется на review**. Никакой implementation / SQL / migrations / SDK подключений в code до Phase Gate v2 approved и Sprint 2 explicitly authorized.
