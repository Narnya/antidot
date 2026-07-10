# Phase Gate to Sprint 2 — Circle Auth, Beta Access & Onboarding v1

> **Status:** ✅ **APPROVED FOR SPRINT 2 PREPARATION** (2026-05-31).
> **Owner:** Product / Founder / Technical Founder
> **First source of truth:** [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2).
> **Upstream basis (binding):** [`01_PRD.md`](01_PRD.md), [`02_USER_STORIES.md`](02_USER_STORIES.md), [`03_USER_FLOWS.md`](03_USER_FLOWS.md), [`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md), [`05_ARCHITECTURE.md`](05_ARCHITECTURE.md), [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md), [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md), [`08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md), [`09_MODERATION.md`](09_MODERATION.md), [`10_ANALYTICS.md`](10_ANALYTICS.md), [`11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md), [`13_DESIGN_HANDOFF.md`](13_DESIGN_HANDOFF.md).
> **Sprint 1 status:** ✅ **PASS** ([`/docs/21_SPRINT_1_INFRASTRUCTURE_REVIEW.md`](21_SPRINT_1_INFRASTRUCTURE_REVIEW.md), updated 2026-05-28 после FIX-INFRA-001).
> **Authorized by:** HYBRID ACCEPT ([`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md)).
> **Sequenced by:** [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md) (Phase D completion → Sprint 2 gate).
> **Supersedes for Sprint 2:** [`/docs/22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md`](22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md) (старый event-first gate). See §14.

> ⚠️ Этот phase gate **не authorize** массовую реализацию Sprint 2. Каждый ticket должен запускаться **отдельным explicit prompt'ом**. Phase gate описывает **what is now allowed**, не **what to build now**.

---

## 1. Decision

**Status:** ✅ **APPROVED FOR SPRINT 2 PREPARATION.**

Проект переходит из фазы **Product Core v2 Documentation Migration** в фазу **Sprint 2 — Circle Auth, Beta Access & Onboarding Preparation**.

### Sprint 2 focus

- **Auth** (email / Google / Apple / session / logout / protected routes);
- **Invite-only beta access**;
- **Waitlist**;
- **Circle-fit onboarding** (vibe / rhythm / comfort composition / group size / host willingness);
- **Basic profile foundation** (completeness, safe public profile boundary);
- **Protected route gates** (guest / not_onboarded / onboarded / restricted / banned).

### Important

> **Это решение не authorize всю Sprint 2 implementation сразу.** Каждая implementation task должна быть запущена отдельным explicit prompt'ом по своему ticket ID. Phase gate открывает фазу, но не запускает её.

---

## 2. Basis for Decision

- **Product Core v2** ([`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md)) принят как first source of truth.
- **Circle-first model** принят через **HYBRID ACCEPT** ([`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md)).
- **PRD v2** ([`01_PRD.md`](01_PRD.md)), **User Stories v2** ([`02_USER_STORIES.md`](02_USER_STORIES.md)), **User Flows v2** ([`03_USER_FLOWS.md`](03_USER_FLOWS.md)), **Figma Plan v2** ([`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md)), **Architecture v2** ([`05_ARCHITECTURE.md`](05_ARCHITECTURE.md)), **Schema v2** ([`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md)), **Security/RLS v2** ([`07_SECURITY_RLS.md`](07_SECURITY_RLS.md)), **Trust v2** ([`08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md)), **Moderation v2** ([`09_MODERATION.md`](09_MODERATION.md)), **Analytics v2** ([`10_ANALYTICS.md`](10_ANALYTICS.md)), **Sprint Backlog v2** ([`11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md)), **Design Handoff v2** ([`13_DESIGN_HANDOFF.md`](13_DESIGN_HANDOFF.md)) — все обновлены до v2.
- **Sprint 1 Infrastructure — PASS** ([`/docs/21_SPRINT_1_INFRASTRUCTURE_REVIEW.md`](21_SPRINT_1_INFRASTRUCTURE_REVIEW.md)) — monorepo, mobile shell, admin shell, env strategy, CI, lockfile, React 18 alignment.
- **Modular Monolith** ([`/docs/17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md)) — без изменений.
- **No microservices** introduced.
- **No secrets** committed.
- **No Supabase / RLS / migrations** созданы преждевременно.
- **No implementation** не стартовала на основе старой event-first модели.

---

## 3. Current Product Model

The product is now:

- **Circle-first UX**;
- **Meeting-based operations**;
- **Vibe-based discovery**;
- **Context-first communication**;
- **Trust-first safety model**.

### Primary user-facing primitive

- **Circle / Круг**.

### Operational primitive

- **Meeting / Встреча круга**.

### Superseded

- **Old event-first MVP** — superseded.
- **Standalone event marketplace** — не MVP (Core v2 §2, §26).

---

## 4. Current Phase

**Current phase:**

> **Sprint 2 — Circle Auth, Beta Access & Onboarding Preparation.**

**Immediate next task:**

> **RU-DOCS-001 — RU Documentation Consistency Pass.**

### Reason

Основные v2 docs должны быть **Russian-first** в продуктовой / explanatory части **до** запуска product implementation, Figma v2, onboarding implementation или schema work. Это предотвращает несоответствие между документами и Russian UI (которая будет writing к Russian-speaking beta cohort).

Технические идентификаторы (event names, enum values, ticket IDs, file paths, table names) остаются на английском.

---

## 5. What Is Now Allowed

> **Только по explicit ticket prompts.** Allowed список не значит «делать всё сразу».

### Documentation / Readiness

- **RU-DOCS-001** RU Documentation Consistency Pass;
- update wording consistency между v2 docs;
- update phase-gate notes;
- update superseded-doc annotations (но **не редактировать** старые phase gates без отдельной задачи).

### Auth Planning

- **AUTH-000** Supabase Auth Implementation Plan:
  - define dependencies;
  - define env variables;
  - define public / private boundary;
  - define protected route model;
  - define auth state model.

### Auth Implementation (только после AUTH-000 approval)

- install Supabase client;
- create public anon client wrapper;
- email signup / login;
- Google login;
- Apple login;
- session persistence (expo-secure-store);
- logout;
- protected route gates.

### Beta Access

- invite code validation flow;
- waitlist signup flow;
- beta access gate;
- beta access states.

### Circle-fit Onboarding (только после docs / Figma readiness)

- onboarding welcome;
- safety principles screen;
- city / area selection (Инв. 9 — area only);
- interests;
- vibe (primary discovery signal — Core v2 §8);
- rhythm;
- comfort composition (women-only / female-friendly — **placeholder** до validation per Core v2 §21);
- group size;
- host willingness;
- profile preview;
- onboarding completion gate.

### Basic Profile Foundation

- profile foundation planning;
- profile completeness calculation;
- safe public profile boundary planning.

---

## 6. What Is Still Blocked

### Circle product UI

- ❌ **Circle Discovery** implementation;
- ❌ **Circle Detail** implementation;
- ❌ **Request Place** implementation;
- ❌ **Membership Requests** implementation;
- ❌ **Circle Creation** implementation;
- ❌ **Meetings** implementation;
- ❌ **Meeting Location Reveal** implementation;
- ❌ **Circle Chat** implementation;
- ❌ **My Circles / Belonging** implementation.

### Backend / safety

- ❌ reports / backend moderation logic;
- ❌ trust scoring implementation;
- ❌ analytics SDK implementation (PostHog connection);
- ❌ Sentry implementation;
- ❌ AI moderation integration;
- ❌ database migrations;
- ❌ SQL;
- ❌ actual RLS policies;
- ❌ service role usage;
- ❌ production secrets.

### Forbidden (Core v2 §26 + 23 hard rules)

- ❌ open DMs (Инв. 2);
- ❌ people marketplace (Инв. 13);
- ❌ dating mechanics (Hard rule 6);
- ❌ public ratings;
- ❌ payments / tickets (Core v2 §26);
- ❌ promoted circles;
- ❌ microservices ([`/docs/17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md) binding).

---

## 7. Sprint 2 Safety Invariants

Эти 15 правил действуют для **каждого** Sprint 2 ticket'а. Дублируют выборочно CLAUDE.md §2 + добавляют Sprint 2 specific boundaries.

1. **Guest** не может access Circle Discovery (AUTH-007 gate).
2. **`authenticated_not_onboarded`** не может access Circle Discovery (ONB-014 gate).
3. **Exact meeting location** остаётся out of scope до approved meeting-location tasks (Sprint 5; Инв. 1).
4. **No open DMs** (Инв. 2). Никаких DM tables / screens / "message user" CTAs.
5. **No people marketplace** (Инв. 13). Onboarding и profiles не позиционируют пользователя как товар.
6. **No raw trust score** (Инв. 3). Profile completeness — bucket, не raw %.
7. **No public ratings** (Hard rule 5).
8. **No dating mechanics** (Hard rule 6). Onboarding copy не должен использовать dating-coded терминологию.
9. **No public shame** (Инв. 12). Никаких public negative labels.
10. **No betrayal mechanics** (Инв. 11). Никаких "X paused you" / "X left for another circle" — даже как placeholder.
11. **Service role никогда не exposed** (Инв. 12 operational). Mobile использует **только** `EXPO_PUBLIC_*` env vars.
12. **Mobile может использовать только public / anon-safe env vars.** `SUPABASE_SERVICE_ROLE_KEY` — server-only (admin app's `serverEnv.ts` с `import 'server-only'`).
13. **Admin server-only values** не должны importиться в client components (admin Next.js boundary).
14. **No sensitive analytics** (Analytics v2 §33). Никаких exact location / raw bio / phone / email в payloads.
15. **No production secrets.** Только placeholder / staging credentials.

---

## 8. Sprint 2 Tickets Unlocked

Перечисляются tickets, которые **могут** быть реализованы **по одному**, после отдельного explicit prompt'а на каждый.

### Readiness (start here)

- **RU-DOCS-001** RU Documentation Consistency Pass;
- **AUTH-000** Supabase Auth Implementation Plan.

### Auth

- **AUTH-001** Install Supabase client and create public anon client wrapper (после AUTH-000);
- **AUTH-002** Email signup / login;
- **AUTH-003** Google login;
- **AUTH-004** Apple login;
- **AUTH-005** Session persistence (expo-secure-store);
- **AUTH-006** Logout;
- **AUTH-007** Protected route gates (guest / authenticated_not_onboarded / onboarded_user);
- **AUTH-008** Restricted / banned placeholder gate.

### Beta

- **BETA-001** Invite code validation flow;
- **BETA-002** Waitlist signup flow;
- **BETA-003** Beta access gate.

### Onboarding

- **ONB-001** Onboarding Welcome;
- **ONB-002** Safety Principles screen;
- **ONB-003** Basic Profile;
- **ONB-004** City / Area (no exact location — Инв. 9);
- **ONB-005** Interests;
- **ONB-006** Vibe (primary discovery signal — Core v2 §8);
- **ONB-007** Preferred Rhythm;
- **ONB-008** Comfort Composition Preference (carefully — Core v2 §21 validation);
- **ONB-009** Group Size Comfort;
- **ONB-010** Host Willingness;
- **ONB-011** Photo Upload Placeholder;
- **ONB-012** Verification Step Placeholder;
- **ONB-013** Profile Preview;
- **ONB-014** Onboarding Completion Gate.

### Profiles

- **PROF-001** Profile Foundation;
- **PROF-002** Profile Completeness Calculation;
- **PROF-003** Safe Public Profile Boundary Planning.

### Important

> **Не имплементировать все тикеты сразу.** Каждый ticket требует отдельный explicit prompt с указанием ID. Claude Code должен на каждый запрос отвечать pre-flight checklist (CLAUDE.md §1).

---

## 9. Required First Task

> **RU-DOCS-001 — RU Documentation Consistency Pass.**

### Purpose

- сделать explanatory / product text **Russian-first** в основных v2 docs;
- **сохранить English technical identifiers** (ticket IDs, event names, enum values, table names, file paths, function names);
- сделать **circle-first vocabulary consistent** во всех v2 docs (нет остаточных event-first wordings в Russian copy);
- обеспечить, что future Figma v2 / product implementation используют correct Russian wording;
- избежать mismatch между docs и Russian UI, которую будут видеть beta users.

### Scope (что входит в RU-DOCS-001)

- pass по docs 00–11 + 13 + CLAUDE.md;
- проверить consistency Russian wording: «Круг», «Встреча круга», «Запросить место», «Чат круга», «Участие подтверждено», «Поставить участие на паузу», «Не в этот раз», «Состав круга обновился»;
- проверить, что **English technical identifiers сохранены**: enum values (`approved_for_intro_meeting`, `circle_status`, etc.), event names (`circle_viewed`, `meeting_location_revealed`), table names (`circle_memberships`), ticket IDs (`AUTH-000`);
- найти остаточные «событие» в user-facing copy и заменить на «круг» / «встреча круга»;
- найти dating-coded language и удалить.

### Out of scope для RU-DOCS-001

- ❌ изменение product decisions;
- ❌ изменение safety invariants;
- ❌ переименование technical identifiers;
- ❌ редактирование старых phase gates (docs/14, /16, /22) — только аннотация «superseded» если нужно;
- ❌ любой код.

---

## 10. Second Task After RU Pass

> **AUTH-000 — Supabase Auth Implementation Plan.**

### Purpose

**До** installing или connecting Supabase, определить:

- **dependencies** (Supabase Auth, `expo-auth-session`, `expo-apple-authentication`, `expo-secure-store`, GoTrue client);
- **env variables** (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` для mobile; `SUPABASE_SERVICE_ROLE_KEY` **только** для admin `serverEnv.ts`);
- **public / private boundary** (mobile никогда не получает service role);
- **auth state model** (guest / authenticated_not_onboarded / onboarded_user / restricted_user / banned_user);
- **protected routes** (router gates, redirect logic);
- **invite gate** (как BETA-001 wraps auth);
- **onboarding gate** (как ONB-014 blocks Circle Discovery до completion);
- **what is mocked vs real** (на этапе плана — что заглушка, что реальный provider);
- **what remains out of scope** для AUTH-000 (например, phone verification — open §11 Sprint Backlog v2 #3).

### AUTH-000 не делает

- ❌ install dependencies (это AUTH-001);
- ❌ create Supabase project / database (это backend setup task позже);
- ❌ написать SDK wrapper code;
- ❌ создать env files;
- ❌ touch `package.json`.

AUTH-000 — **только markdown план** (например, в виде `/docs/29_AUTH_000_IMPLEMENTATION_PLAN.md` или подобного).

---

## 11. CLAUDE.md Update Required

> Этот phase gate требует **минимального** edit в [`CLAUDE.md`](../CLAUDE.md) §6 (Current phase). Остальные секции (§0–§5, §7–§15) **не трогаются**.

### Required §6 changes

**Current phase** меняется на:

> **Sprint 2 — Circle Auth, Beta Access & Onboarding Preparation.**

**Immediate next required task:**

> **RU-DOCS-001 — RU Documentation Consistency Pass.**

**Then:**

> **AUTH-000 — Supabase Auth Implementation Plan.**

### Allowed now (Sprint 2 prep + readiness)

- RU docs consistency (RU-DOCS-001);
- auth planning (AUTH-000);
- invite / waitlist planning;
- protected route planning;
- **auth implementation только после AUTH-000** (AUTH-001…008);
- **onboarding implementation только после docs / Figma readiness** (ONB-001…014);
- basic profile foundation (PROF-001…003);
- infrastructure maintenance (lockfile, lint, format, typecheck, CI).

### Still blocked (binding до отдельных Sprint 3+ tickets)

- circle discovery;
- circle detail;
- request place;
- membership requests;
- meetings;
- meeting location reveal;
- circle chat;
- My Circles / Belonging;
- schema migrations;
- SQL of any kind;
- RLS policies;
- analytics SDK подключение;
- Sentry SDK подключение;
- AI moderation integration;
- trust scoring implementation;
- moderation enforcement;
- open DMs (Инв. 2);
- people marketplace (Инв. 13);
- dating mechanics (Hard rule 6);
- microservices;
- service role exposed к client;
- production credentials / real secrets.

### Keep unchanged в CLAUDE.md

- §0 First source of truth (Product Core v2);
- §1 Mandatory pre-task checklist;
- §2 23 Hard rules (safety invariants);
- §3 Conflict resolution;
- §4 Documentation discipline;
- §5 Scope discipline;
- §7 Current Product Core v2;
- §8 Vocabulary rules;
- §9 Circle access rules (staged);
- §10 Communication rules;
- §11 Belonging / membership ethics;
- §12 Database / schema guardrails;
- §13 Figma / design guardrails;
- §14 Competitive guardrail;
- §15 Documentation priority.

---

## 12. Implementation Guardrails

### Pre-task checklist (binding — CLAUDE.md §1 echo)

Перед **каждой** Sprint 2 task Claude Code должен явно state:

1. Какой ticket implements (с ID).
2. Какие docs apply (Product Core v2 sections + downstream).
3. Какие Product Core v2 invariants apply (из 23).
4. Какие files will be changed.
5. Будет ли изменён `package.json`.
6. Будут ли added dependencies.
7. Будет ли connected Supabase (или any SDK).
8. Touches ли task sensitive data (location, trust, moderation, audit, PII).
9. Что explicitly out of scope.
10. Какие checks / tests needed.

### Claude Code must not

- ❌ implement несколько Sprint 2 tickets за один prompt;
- ❌ drift обратно к event-first terminology в коде / комментариях / commit messages;
- ❌ implement circle / product UI **до** Figma v2 readiness (FIGV2-001…008 sequence);
- ❌ создать migrations **до** explicit DBV2 schema task;
- ❌ создать RLS policies **до** explicit RLSV2 task;
- ❌ expose service role к mobile / client;
- ❌ добавить open DMs (даже как «временная» DM tab);
- ❌ добавить people marketplace (даже как «browse users» screen);
- ❌ добавить dating mechanics (swipe / like / chemistry / match).

---

## 13. Sprint 2 Exit Criteria

Sprint 2 considered complete когда **все** PASS:

- ✅ RU docs consistency pass completed (RU-DOCS-001);
- ✅ auth implementation plan completed (AUTH-000);
- ✅ Supabase auth client safely connected (если authorized отдельной задачей);
- ✅ email signup / login работает (AUTH-002);
- ✅ Google login работает (AUTH-003 — если включено в P0);
- ✅ Apple login работает (AUTH-004 — если включено в P0);
- ✅ session persists через app restart (AUTH-005);
- ✅ logout invalidates session (AUTH-006);
- ✅ invite-only gate существует (BETA-001, BETA-003);
- ✅ waitlist flow существует (BETA-002);
- ✅ onboarding route flow существует (ONB-001…013);
- ✅ Safety Principles screen существует (ONB-002);
- ✅ basic circle-fit onboarding fields existить (city / vibe / rhythm / comfort / size / host willingness — ONB-004…010);
- ✅ onboarding completion gate работает (ONB-014);
- ✅ `authenticated_not_onboarded` cannot access main app (AUTH-007 + ONB-014);
- ✅ **нет circle discovery / product data** implemented prematurely;
- ✅ **нет exact meeting location logic** существует (Sprint 5 territory);
- ✅ **нет service role exposure** в mobile / client;
- ✅ typecheck / lint / test / format checks pass (Sprint 1 baseline maintained).

---

## 14. Follow-up Docs / Superseded Notes

### Superseded

- **[`/docs/22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md`](22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md)** — этот документ был старым event-first phase gate для Sprint 2. **Superseded by этот phase gate (docs/28) для Sprint 2 под Product Core v2.** Старый документ остаётся в репозитории как историческая запись, но **не binding** для Sprint 2 implementation.

- **[`/docs/14_PHASE_GATE_AND_PRODUCT_DECISIONS.md`](14_PHASE_GATE_AND_PRODUCT_DECISIONS.md)** — superseded для implementation sequencing более поздними phase gates (16 — infrastructure, 28 — Sprint 2 v2). Product decisions внутри docs/14 остаются useful **только если** не противоречат Product Core v2.

### Не редактировать

> **Старые phase gates (docs/14, /16, /22) не редактируются** в рамках этого документа. Аннотации «superseded» можно добавить **только** в рамках отдельной задачи (например, как часть RU-DOCS-001 cleanup, если решено включить).

---

## 15. Final Decision

> **Sprint 2 preparation is APPROVED.**

> **Implementation remains gated ticket-by-ticket** — каждый ticket требует отдельный explicit prompt.

### Immediate next task

> **RU-DOCS-001 — RU Documentation Consistency Pass.**

### Then

> **AUTH-000 — Supabase Auth Implementation Plan.**

После этих двух — последовательная реализация AUTH-001…008, BETA-001…003, ONB-001…014, PROF-001…003 по одному ticket'у, каждый под explicit prompt'ом и human review.

---

## 16. Summary

- **Продукт теперь circle-first.** Старая event-first модель superseded во всех v2 docs.
- **Sprint 1 infrastructure complete** (PASS, [`/docs/21_SPRINT_1_INFRASTRUCTURE_REVIEW.md`](21_SPRINT_1_INFRASTRUCTURE_REVIEW.md)).
- **Sprint 2 может начаться в controlled way** — ticket-by-ticket, под этим phase gate.
- **First task — RU documentation consistency** (RU-DOCS-001), не код.
- **Auth implementation не должен стартовать** до AUTH-000 plan completed.
- **Все 23 safety invariants** (CLAUDE.md §2) остаются binding.
- **Старый phase gate docs/22 superseded** для Sprint 2 под Product Core v2.

---

> Reminder: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2) — **first source of truth**. Этот phase gate ему подчинён. Любой ticket, нарушающий §7 (15 Sprint 2 safety invariants), §6 (blocked list), или 23 hard rules из CLAUDE.md §2, — **отклоняется на review**. Никакой mass-implementation Sprint 2 без explicit per-ticket prompts.
