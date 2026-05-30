# Architecture v2 — Antidot

> **Status:** v2 (architecture для closed beta, circle-first).
> **Owner:** Technical
> **Last updated:** 2026-05-30
> **First source of truth:** [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2).
> **Requirements sources:** [`/docs/01_PRD.md`](01_PRD.md) (PRD v2), [`/docs/02_USER_STORIES.md`](02_USER_STORIES.md) (User Stories v2), [`/docs/03_USER_FLOWS.md`](03_USER_FLOWS.md) (User Flows v2).
> **ADR:** [`/docs/17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md) — **preserved as-is**.
> **Supersedes:** Architecture v1 (event-first, 2026-05-18).
> **Sequenced by:** [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md) §24 Phase C step 8.

> ⚠️ Этот документ — **деdeliberate update**, не патч. Domain model переписана с event-first на circle-first. **Infrastructure / стек / Modular Monolith ADR — без изменений.** Primitive change — продуктовое решение, не архитектурное.

---

## 1. Source of Truth

- **Product Core v2** ([`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md)) — first source of truth.
- Architecture v2 следует **HYBRID ACCEPT** ([`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md)).
- **User-facing primitive** — Circle.
- **Operational primitive** — Meeting.
- **Старая event-first архитектура superseded** как MVP core.
- **Infrastructure decisions из Sprint 1 остаются валидными** (см. [`/docs/21_SPRINT_1_INFRASTRUCTURE_REVIEW.md`](21_SPRINT_1_INFRASTRUCTURE_REVIEW.md) — PASS).
- **Modular Monolith ADR** ([`/docs/17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md)) — **остаётся валидным**.

### Reference docs

- [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md);
- [`/docs/17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md);
- [`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md);
- [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md).

Downstream технические документы ([`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md), [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md), [`08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md), [`09_MODERATION.md`](09_MODERATION.md), [`10_ANALYTICS.md`](10_ANALYTICS.md), [`11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md)) на момент написания ещё в v0.1 — известное состояние миграции. До их обновления авторитетен этот документ.

---

## 2. Architecture Goals v2

1. **Поддержать circle-first MVP.**
2. **Поддержать meeting-based offline operations.**
3. **Защитить exact meeting location** (Инв. 1) — отдельная structure + RLS.
4. **Membership-based access** — RLS keyed на `membership_status`, не на одном boolean «approved».
5. **Intro meeting before full membership** — переход `approved_for_intro_meeting → intro_attended → member` как explicit lifecycle.
6. **Circle Chat только для approved members / allowed intro participants** (Инв. 2).
7. **Report / block / moderation / audit с day one** (Инв. 4, 6).
8. **Trust через повторяемое посещение** — internal signals, soft public badges (Инв. 3, 10).
9. **Invite-only beta** — гейт доступа.
10. **Keep architecture simple** через Modular Monolith — не переусложнять MVP.
11. **Сохранить future extraction options** — domain-bounded модули позволяют выделить отдельные services позже, **если** масштаб потребует.
12. **Avoid microservices** до тех пор, пока scale / complexity не потребуют (ADR §3).

---

## 3. Architecture Non-Goals v2

Архитектура **не поддерживает в MVP**:

- standalone event marketplace;
- people marketplace (Инв. 13);
- open DMs (Инв. 2);
- swipe механики;
- dating механики (Hard rule 6);
- public ratings (Hard rule 5);
- follower economy;
- payments / tickets (Hard rule 7);
- paid events;
- promoted circles;
- nightlife / party механики;
- live location (Инв. 9);
- exact public map pins (Инв. 1);
- complex AI matching;
- B2B venue monetization;
- **microservices**;
- **multiple databases**.

> Эти entities **не закладываются в архитектуру**. Добавление — только через product decision + Product Core update.

---

## 4. High-Level System Overview

### 4.1 Компоненты (без изменений)

| Компонент | Технология |
|---|---|
| Mobile App | React Native + Expo |
| Admin Dashboard | Next.js |
| Backend | Supabase + PostgreSQL |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime |
| Edge Functions | Supabase Edge Functions (для sensitive business operations) |
| Analytics | PostHog (P1, ещё не connected) |
| Crash Reporting | Sentry (P1, ещё не connected) |
| AI Moderation | assistive only (Инв. 5), позже |
| CI/CD | GitHub Actions + EAS |

### 4.2 Textual diagram

```
Mobile App (Expo / RN / TS)
  → Supabase Auth (JWT)
  → Supabase Client (anon key)
  → PostgreSQL (с RLS)
    ├─ circles
    ├─ circle_memberships
    ├─ circle_membership_requests
    ├─ circle_meetings
    ├─ meeting_locations  ← ПРОТИВ Инв. 1 — отдельная таблица, RLS-gated
    ├─ meeting_rsvps
    ├─ meeting_attendance
    ├─ circle_chat_messages
    ├─ trust_events / user_trust_summary
    ├─ reports / user_blocks
    └─ moderation_actions / audit_logs
  → Supabase Realtime (circle chat, status updates)
  → Edge Functions (для sensitive transitions)
  → Notifications (без exact location в payload)
  → Analytics (без PII / location)

Admin Dashboard (Next.js)
  → Supabase Auth (admin JWT)
  → Service Role (server-side only — Инв. 12)
  → Moderation Queue / Audit Logs / Suspicious Activity
```

---

## 5. Recommended Tech Stack

| Layer | Technology | Reason | Notes |
|---|---|---|---|
| Mobile UI | **React Native** (через Expo) | mobile-first (Core v2 §1), iOS + Android, shared TS code | без изменений |
| Mobile framework | **Expo SDK 52** | hosted build (EAS), no native config | без изменений |
| Language | **TypeScript** (strict) | type safety; consistent с admin | без изменений |
| Mobile routing | **Expo Router** | file-based, deep-link friendly | без изменений |
| Server state | **TanStack Query** (P1) | cache + refetch + status-driven invalidation (важно для membership transitions) | не connected |
| Local state | **Zustand** (P1) | lightweight; для UI-only state | не connected |
| Forms | **React Hook Form** (P1) | onboarding multi-step, intro note | не connected |
| Validation | **Zod** (P1) | type-safe schema, shared between mobile/admin/edge functions | не connected |
| Backend | **Supabase** | auth + Postgres + storage + realtime + edge functions в одной плоскости | без изменений |
| Database | **PostgreSQL** | RLS, transactions, JSONB для metadata | без изменений |
| Auth | **Supabase Auth** | email + Google + Apple + phone | без изменений |
| Storage | **Supabase Storage** | photos (profile), media (P1 circle media) | без изменений |
| Realtime | **Supabase Realtime** | circle chat, status updates | без изменений |
| Edge Functions | **Supabase Edge Functions** | sensitive transitions (approval, location reveal, removal) | без изменений |
| Admin | **Next.js 15** | App Router; server components | без изменений |
| Analytics | **PostHog** (P1) | без PII / location | не connected |
| Crash Reporting | **Sentry** (P1) | без PII в crash payloads | не connected |
| AI Moderation | OpenAI / Claude (P1) | **assistive only** (Инв. 5) | не connected |
| CI/CD | **GitHub Actions + EAS** | lint / typecheck / test gates | без изменений |

> **Никакой новой технологии не требуется** из-за circle-first pivot. Infrastructure остаётся валидной — Sprint 1 PASS не затронут.

---

## 6. Repository Architecture

Monorepo (без изменений):

```
/apps
  /mobile     ← Expo + RN
  /admin      ← Next.js 15
/packages
  /ui         ← design tokens + (позже) shared RN components
  /types      ← shared TypeScript types
  /validators ← shared Zod schemas (P1)
  /config     ← env-safe config (public vs server)
  /analytics  ← analytics typings + helpers (PostHog не connected)
/supabase
  /migrations ← пусто до Schema v2 (Core v2 §33, doc 27 §14)
  /functions  ← пусто до Sprint 2 product implementation
  /seed       ← пусто
  /tests      ← пусто (RLS test framework — open §33)
/docs
```

**Modular Monolith remains.** Domain boundaries реализуются через:

- **packages** (`@social-events/ui`, `@social-events/types`, `@social-events/validators`, `@social-events/config`, `@social-events/analytics`);
- **folders** (модули в `apps/mobile/app/(*)/` per domain);
- **database boundaries** (отдельные таблицы для location/trust/audit);
- **RLS** (policies enforcing access);
- **Edge Functions** (single-purpose, transactional);

**не через** отдельные services.

---

## 7. Mobile App Architecture v2

### 7.1 Feature modules (future structure)

- `auth`;
- `beta` (invite / waitlist);
- `onboarding` (vibe, rhythm, comfort composition, group size — PRD v2 §7.2);
- `profiles`;
- **`circle-discovery`** (feed of circles, filters);
- **`circles`** (Circle Detail, Create Circle, Host Dashboard);
- **`membership-requests`** (Request Place, Membership Pending, Host Review queue);
- **`meetings`** (Meeting Detail, RSVP, Location Reveal);
- **`circle-chat`**;
- **`my-circles`** (Belonging Mode primary surface);
- `safety` (Report / Block);
- `notifications`;
- `settings`.

> Event-first модули (`event-discovery`, `events`, `event-applications`, `event-chat`, `my-events`) **superseded** как MVP core. Старые имена / identifiers могут оставаться **только** во временных migration helpers с TODO для cleanup.

### 7.2 Navigation Model

Route groups в Expo Router:

- `(public)` — guest / pre-auth;
- `(onboarding)` — onboarding stack;
- `(app)` — authenticated;
  - `my-circles` (default home при ≥1 active circle);
  - `discover-circles` (default home при 0 circles);
  - `circles/[id]` — Circle Detail;
  - `circles/[id]/request` — Request Place;
  - `circles/[id]/intro-meeting/[meetingId]` — Intro Meeting;
  - `circles/[id]/chat` — Circle Chat;
  - `circles/[id]/host` — Host flow (если host);
- `(modals)` — safety modals (Report / Block / Pause / Leave);
- `settings`.

**Home-priority logic** (US-BELONG-01):

- Если у user есть ≥1 active `circle_membership` (`approved_for_intro_meeting` / `intro_attended` / `member`) → home defaults to **My Circles**.
- Если 0 active circles → home defaults to **Discover**.

### 7.3 State Management

| State type | Solution | Notes |
|---|---|---|
| Server state | TanStack Query (P1) | refetch при membership/meeting/location/chat status changes |
| Auth / session | Supabase Auth (P0 baseline) | session persistence + banned gate |
| Local UI state | Zustand (P1) | filters, draft notes |
| Form state | React Hook Form (P1) | onboarding multi-step, intro note |
| Feature flags | Server-driven (P1) | safe defaults off |

### 7.4 Offline / Caching (security-critical)

- **Sensitive meeting location НЕ кэшируется** beyond короткого окна (per session, не persistent).
- **Refetch membership / location / chat access** после status changes (approval / pause / leave / removal).
- **Removed / paused / left members теряют future access** — клиент **не доверяет** локальному кэшу для location / chat; всегда server-side check через RLS.
- **Stale location access** — security risk; UI должен показывать «обновляем» state если cache miss.
- **Notifications не cache'ируют exact location** (Инв. 1).

---

## 8. Backend Architecture v2

### 8.1 Supabase Services

- **Auth** — email / Google / Apple / phone;
- **PostgreSQL** — основная database;
- **RLS** — primary access control layer;
- **Storage** — profile photos + (P1) circle media;
- **Realtime** — circle chat + status updates;
- **Edge Functions** — sensitive transitions;
- **Scheduled jobs** — meeting lifecycle, reminders, attendance auto-marking (P1).

### 8.2 Database Access Pattern

- **Mobile app reads/writes allowed data** через Supabase client с user JWT.
- **RLS enforces access** на уровне rows.
- **Sensitive membership / location transitions** идут через **Edge Functions** (server-side с service role).
- **Admin service role** — **server-side only** ([`/docs/19_ENV_CONFIG_STRATEGY.md`](19_ENV_CONFIG_STRATEGY.md); Sprint 1 baseline).
- **Service role никогда не попадает в client bundle** (Инв. 12) — checked в CI.

### 8.3 Edge Functions v2

Каждая Edge Function — single-purpose, transactional, server-side с service role.

| Function | Purpose | Inputs | Outputs | Security notes | Priority |
|---|---|---|---|---|---|
| `validate_invite_code` | проверка beta-кода | `code` | `valid: bool` | rate-limit; non-enumerable | P0 |
| `complete_onboarding` | финализация onboarding | profile fields | `onboarded: true` | atomic transition `authenticated_not_onboarded → onboarded_user` | P0 |
| `create_circle` | host создаёт круг | circle fields | `circle_id` | host accountability; lifecycle = `draft`/`pending_review` | P0 |
| `publish_circle` | публикация круга | `circle_id` | lifecycle update | проверка completeness; first-time host review (open §33) | P0 |
| `update_circle` | edit circle | circle fields | update | RLS host-only | P0 |
| `pause_circle` | host ставит круг на паузу | `circle_id` | lifecycle update | members notified neutrally | P0 |
| `request_circle_place` | submit membership request | `circle_id`, `intro_note?` | `request_id` | rate-limit; blocked-user check (Инв. 6) | P0 |
| `approve_for_intro_meeting` | host approve | `request_id`, `meeting_id` | membership transition | atomic: `requested → approved_for_intro_meeting`; reveal location scope | P0 |
| `reject_membership_request` | host soft-reject | `request_id`, reason category | rejection state | private; non-stigmatizing (Инв. 12); audit | P0 |
| `waitlist_membership_request` | host waitlist | `request_id` | waitlist state | — | P1 |
| `confirm_circle_membership` | host confirms intro → member | `membership_id` | `intro_attended → member` | per-circle policy | P0 |
| `pause_membership` | user pauses | `membership_id` | pause state | non-public; quiet | P0 |
| `leave_circle` | user leaves | `membership_id` | `left` state | private; no betrayal (Инв. 11) | P0 |
| `remove_circle_member` | host removes | `membership_id`, reason category | `removed` или `removed_for_safety` | audit (Инв. 4); host-accountability signal | P0 |
| `schedule_circle_meeting` | host schedules meeting | meeting fields + exact location | `meeting_id` | location stored separately; only host of circle | P0 |
| `update_meeting_rsvp` | member RSVP | `meeting_id`, `rsvp` | RSVP state | RLS member-only | P0 |
| `reveal_meeting_location` | reveal exact location | `meeting_id`, requesting user | `exact_location` | server-checked: intro / member / host / admin (§11 matrix) | **P0 critical** |
| `send_circle_chat_message` | send message (если нужна inline moderation) | `circle_id`, message | message id | optional AI assistive check (Инв. 5) | P0 |
| `report_content` | submit report | target_type, target_id, reason | report id | reporter protected; reported user not notified | P0 |
| `block_user` | user blocks user | `blocked_user_id` | bilateral block | propagates к requests / chat | P0 |
| `create_trust_event` | append trust signal | event type, refs | trust event id | append-only; never user-visible (Инв. 3) | P0 |
| `update_attendance` | host marks attendance | `meeting_id`, attendance map | attendance + trust events | atomic | P0 |
| `handle_no_show` | record no-show | `meeting_id`, `user_id` | trust event | internal only (Инв. 3) | P0 |
| `moderate_circle_content` | admin moderation action | target, action, reason | audit log entry | reason required; service role; audit (Инв. 4) | P0 |
| `moderate_circle_chat_message` | admin hides / removes message | message_id, reason | message state update | snapshot preserved | P1 |
| `send_notification` | server-side push | template + recipient + scope | notification id | **no exact location в push body** (Инв. 1) | P0 |

> Edge Functions создаются **только** после Schema v2 ([`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md)) approved. Сейчас `/supabase/functions/` empty.

---

## 9. Core Domain Architecture v2

### 9.1 Identity / Profiles Domain

**Entities:** `User`, `Profile`, `ProfilePhoto`, `Interest`, `VibeTag`, `VerificationState`.

**Responsibilities:**

- onboarding (PRD v2 §7.2);
- profile completeness (internal signal);
- safe public profile (no other circles, no raw trust — Инв. 13);
- privacy settings;
- **no exact user location** (Инв. 9).

### 9.2 Circles Domain

**Entities:** `Circle`, `CircleCategory`, `CircleVibe`, `CircleComfortComposition`, `CircleLifecycle`, `CircleRules`.

**Responsibilities:**

- circle creation (host scope);
- circle discovery (feed of circles, не people — Инв. 13);
- circle detail (staged composition reveal);
- lifecycle (Core v2 §12);
- capacity / rhythm / approximate area;
- host ownership;
- comfort composition (open mixed / female-friendly / women-only / host-defined — Core v2 §21).

### 9.3 Membership Requests Domain

**Entities:** `CircleMembershipRequest`, `MembershipRequestStatus`, `HostDecision`.

**Responsibilities:**

- request place (один запрос на circle, не per meeting);
- pending / waitlist / soft-reject;
- approve for intro meeting (US-REQ-06);
- safe applicant context для host (no raw trust);
- **no public rejection labels** (Инв. 12).

### 9.4 Circle Membership Domain

**Entities:** `CircleMembership`, `MembershipStatus`, `MemberRole`, `PauseState`, `RemovalReason`.

**Responsibilities:**

- member access (location, chat, member list per policy);
- intro meeting transition (`approved_for_intro → intro_attended → member`);
- pause / leave / removal;
- **no betrayal mechanics** (Инв. 11);
- **no public shame** (Инв. 12);
- membership-based permissions (RLS keyed на status).

### 9.5 Meetings Domain

**Entities:** `CircleMeeting`, **`MeetingLocation`** (separate, protected), `MeetingRSVP`, `MeetingAttendance`, `MeetingLifecycle`.

**Responsibilities:**

- recurring / scheduled meetings под circle;
- RSVP (going / not-going / locked);
- **protected exact location** (отдельная structure, RLS-gated);
- attendance (host-confirmed или system);
- no-show (internal, Инв. 3);
- meeting lifecycle (Core v2 §13).

### 9.6 Circle Chat Domain

**Entities:** `CircleChatMessage`, `CircleChatState`, `MessageModerationStatus`.

**Responsibilities:**

- **circle chat only** (Инв. 2);
- **no open DMs**;
- member-only access (или meeting-context only для `approved_for_intro_meeting` per policy);
- meeting / system messages;
- report message (Инв. 6);
- freeze chat (admin action; audit).

### 9.7 Safety Domain

**Entities:** `Report`, `Block`, `SuspiciousActivity`, `ModerationAction`, `AuditLog`.

**Responsibilities:**

- reports (user / circle / meeting / message — Инв. 6);
- blocks (bilateral);
- moderation queue;
- bans / restrictions;
- unsafe circle / meeting / message handling;
- **auditability** (Инв. 4 — все moderation-sensitive actions logged).

### 9.8 Trust Domain

**Entities:** `TrustEvent` (append-only), `UserTrustSummary` (internal), `PublicTrustBadge`.

**Responsibilities:**

- verification levels;
- repeated meeting attendance signals;
- no-show tracking (internal);
- host reliability;
- **internal trust score** (Инв. 3 — никогда не visible);
- **public soft badges only** (Проверен / Надёжный / Hosted / Attended).

### 9.9 Beta Domain

**Entities:** `InviteCode`, `WaitlistEntry`, `FeatureFlagExposure`.

**Responsibilities:**

- invite-only access;
- beta gating;
- cohort control;
- waitlist email collection.

---

## 10. Auth & Access Architecture v2

### 10.1 Access flow

```
Guest
  → Invite check (validate_invite_code Edge Function)
  → Auth (Supabase Auth — email / Google / Apple)
  → Onboarding (complete_onboarding Edge Function)
  → Phone verification (timing — open §33)
  → Home (My Circles если ≥1, иначе Discover)
```

### 10.2 Access states

- `guest` (unauthenticated);
- `authenticated_not_onboarded`;
- `onboarded_user`;
- `phone_unverified`;
- `phone_verified`;
- `circle_requester` (роль в контексте circle);
- `approved_for_intro_meeting` (per circle);
- `circle_member` (per circle);
- `circle_host` (per circle);
- `restricted` (admin restricted);
- `banned` (forced sign-out + auth gate);
- `admin` (web admin app only).

### 10.3 Important

- **Admin — web/server-side only** (Инв. 12 + admin-mobile boundary).
- **Admin не является mobile role** — никакой admin-functionality в mobile app.
- **Banned-user gate** срабатывает на любом auth check (US-AUTH-08); force sign-out.

---

## 11. Circle / Meeting Location Privacy Architecture

**Критический раздел.** Эта архитектурная решётка защищает Инв. 1 и Инв. 9 на уровне DB + RLS + Edge Functions.

### 11.1 Storage rules

- **Circle хранит approximate area only** (`area_code` / `district_id` / bucket — не exact lat/lng).
- **Exact meeting location** хранится **отдельно** в `meeting_locations` таблице, RLS-gated.
- **No exact user location** хранится никогда (Инв. 9).

### 11.2 Access rules

- non-member видит **approximate area only**;
- `requested` / `waitlisted` / `rejected` **не могут читать** `meeting_locations`;
- `approved_for_intro_meeting` может читать **exact location только для одной intro-встречи**;
- `member` может читать exact location для **upcoming allowed meetings** (within reveal window);
- `paused` / `left` / `removed` теряют future access **immediately**;
- `blocked` / `restricted` / `banned` users не могут access;
- **notifications не leak'ают exact location** (push payload без точки — Инв. 1);
- **analytics не содержат exact location**;
- **no live user location** anywhere.

### 11.3 Access matrix

| User / Circle state | Can see circle | Can see approximate area | Can read `meeting_locations` | Can access circle chat | Notes |
|---|:--:|:--:|:--:|:--:|---|
| `guest` | ❌ landing only | ❌ | ❌ | ❌ | sign-up / waitlist |
| `authenticated_not_onboarded` | ❌ | ❌ | ❌ | ❌ | onboarding required |
| `onboarded_not_requested` | ✅ safe view | ✅ | ❌ | ❌ | aggregated only |
| `requested` | ✅ | ✅ | ❌ | ❌ | non-stigmatizing pending |
| `waitlisted` | ✅ | ✅ | ❌ | ❌ | soft state |
| `rejected` | ✅ | ✅ | ❌ | ❌ | «Не в этот раз» |
| `approved_for_intro_meeting` | ✅ | ✅ | ✅ **только для одной встречи** | meeting-context (per policy, open §33) | scoped reveal |
| `intro_attended` | ✅ | ✅ | post-window scoped | per policy | pre-conversion |
| `member` | ✅ | ✅ | ✅ для upcoming meetings | ✅ full | belonging mode |
| `paused` | ✅ | ✅ | ❌ | per policy (read-only / muted) | quiet |
| `left` | ✅ если в discovery | ✅ | ❌ | ❌ | re-request через новый flow |
| `removed` | per policy | per policy | ❌ | ❌ | appeal flow (P1) |
| `removed_for_safety` | safety screen | ❌ | ❌ | ❌ | audit logged |
| `blocked` (by host) | ❌ круги блокировщика | ❌ | ❌ | ❌ | bilateral |
| `restricted` | per policy | per policy | per policy | per policy | bounded actions |
| `banned` | ❌ (auth gate) | ❌ | ❌ | ❌ | force sign-out |
| `host` (своего circle) | ✅ admin своего | ✅ | ✅ всех meetings своего | ✅ | host scope |
| `admin` | ✅ через admin app | ✅ | ✅ через admin app server-side | ✅ через admin app | Инв. 12 server-only |

> Эта матрица — **архитектурный контракт** для Schema v2 ([`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md)) и RLS v2 ([`07_SECURITY_RLS.md`](07_SECURITY_RLS.md)). Любая table / policy / Edge Function, нарушающая её, отклоняется на code review.

---

## 12. Composition Visibility Architecture

Staged composition reveal — структурное правило, не только UI копи.

### 12.1 Before request

- **Show:** aggregate composition (size band, comfort composition label), host safe profile, vibe, rhythm, approximate area.
- **Hide:** full member list, private profiles, exact location, internal trust data.

### 12.2 After request (pending / waitlisted / rejected)

- **Show:** status / context only.
- **Still hide:** full member list.

### 12.3 After approval / member

- **Show:** safe member profiles per policy (display name + photo + verification badge + soft badges).
- **Hide:** raw trust score, report counts, block counts, removal history, rejection history, other circles, internal moderation notes.

### 12.4 Never expose (любой non-admin path)

- raw trust score (Инв. 3);
- report counts;
- block counts;
- removal history;
- rejection history;
- **other circles** конкретного user (Инв. 13);
- internal moderation notes.

> **Архитектурное следствие:** `profiles` table должна разделяться на `profiles` (safe public fields) + `profile_private_details` (sensitive fields, admin-only RLS).

---

## 13. Circle Lifecycle Architecture

```
draft → pending_review → live → paused → full → archived → removed_for_safety
```

| Status | Who can set | Available actions | RLS / access implications | Notifications | Analytics events | Safety |
|---|---|---|---|---|---|---|
| `draft` | host | edit, publish, delete | visible только host | none | `circle_drafted` | host-only |
| `pending_review` | host → admin | admin: approve / reject | hidden из discovery | host gets review status | `circle_submitted_for_review` | admin gate |
| `live` | admin / host | request, RSVP, chat (members) | в discovery; member RLS активны | new request notifications для host | `circle_published` | normal moderation surface |
| `paused` | host | unpause / archive | hidden из discovery; members retained | members notified neutrally | `circle_paused` | reduces moderation surface |
| `full` | system | waitlist (опц.) | shown как «full» | — | `circle_full` | none additional |
| `archived` | host | none (history) | members see «archived» | members notified neutrally | `circle_archived` | trust events frozen |
| `removed_for_safety` | **admin only** | none | hidden everywhere; members see safety copy | members notified neutrally | `circle_removed_for_safety` | **audit log обязателен** (Инв. 4); appeal path (P1) |

---

## 14. Membership Lifecycle Architecture

```
none → requested → approved_for_intro_meeting → intro_attended → member
     → paused → left → removed → removed_for_safety → banned_from_circle
```

| Status | Who can set | User sees | Location access | Chat access | Member visibility | Notifications | Trust / moderation impact |
|---|---|---|---|---|---|---|---|
| `none` | default | discovery only | area only | ❌ | aggregated | — | none |
| `requested` | user | «запрос у хоста» | area only | ❌ | none | acknowledge sent | rate-limited |
| `approved_for_intro_meeting` | host | «приглашены на intro» | exact для одной встречи | meeting-context | partial subset | invitation push (без exact location в copy) | positive intro signal |
| `intro_attended` | system (post-meeting) | «вы посетили intro» | scoped post-window | scoped | partial | — | attendance signal |
| `member` | host / system | «вы в круге» | exact для upcoming | full | full safe profiles | meeting reminders | continuity signal |
| `paused` | user | «участие на паузе» | ❌ | per policy | full | quiet | neutral |
| `left` | user | «участие завершено» | ❌ | ❌ | hidden («состав обновился») | quiet | neutral |
| `removed` | host | non-public copy | ❌ | ❌ | hidden | quiet | internal host-accountability signal |
| `removed_for_safety` | admin | safety copy | ❌ | ❌ | hidden | quiet | audit (Инв. 4) |
| `banned_from_circle` | admin | banned copy | ❌ | ❌ | hidden | quiet | audit (permanent) |

---

## 15. Meeting Lifecycle Architecture

```
scheduled → starting_soon → in_progress → completed → cancelled → removed_for_safety
```

| Status | RSVP access | Location access | Chat / system messages | Notifications | Trust events | Attendance / no-show |
|---|---|---|---|---|---|---|
| `scheduled` | members RSVP'ят | exact для members per §11 | reminders queued | scheduled push | none | none yet |
| `starting_soon` | RSVP меняется | exact доступен approved | «starts soon» system message | reminder push (без exact location в copy) | none | none yet |
| `in_progress` | RSVP locked | exact доступен approved | optional system messages | — | none | none yet |
| `completed` | RSVP locked | exact stops surfacing после window | «completed» system message | post-meeting summary | attendance + no-show recorded | host-confirmed |
| `cancelled` | RSVPs voided | exact withdrawn | «cancelled» message | cancel push | **нет** негативных trust events | — |
| `removed_for_safety` | RSVPs voided | exact withdrawn | safety-removal copy | safety notification | trust events frozen | audit (Инв. 4) |

---

## 16. Realtime Architecture v2

### 16.1 Используется для (P0 / P1)

- **circle chat** (P0);
- **membership status updates** (P0 — для refetch триггеров);
- **host membership request list updates** (P0);
- **notifications** (P0);
- **meeting updates** (host posts, system messages — P0);
- **circle status changes** (P1).

### 16.2 Constraints

- **Только members / allowed intro participants** могут subscribe к circle chat;
- **non-members не могут subscribe** — Realtime channel должен быть RLS-protected (Supabase Realtime поддерживает RLS на channels);
- **removed / paused / left users теряют access immediately** — subscription auto-disconnect;
- **RLS защищает subscriptions** — это **не optional**;
- **sensitive updates** — клиент должен refetch RLS-gated данные после status changes (Edge Function emit'ит event → client refetches).

### 16.3 Architectural risk

- Если Realtime channel настроен **без RLS**, removed user может продолжать слушать chat → critical safety bug.
- Mitigation: integration test «removed user — disconnect within X сек» в RLS test suite ([`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) v2).

---

## 17. Storage Architecture v2

### 17.1 Buckets

- `profile-photos` — P0;
- `circle-media` — P1 (host-uploaded media для circle description);
- `moderation-attachments` — P1 (admin-only, для report context).

### 17.2 Rules

- **Profile photos moderated** — AI assistive check на upload; NSFW → soft block;
- **Unsafe media hidden** — admin может moderate;
- **Signed URLs preferred** — short-lived, не permanent;
- **No unrestricted public sensitive media**;
- **Circle media respects circle visibility** — если added later, доступ keyed на membership.

---

## 18. Notification Architecture v2

### 18.1 Notification types

- `membership_request_received_for_host`;
- `membership_request_approved_for_intro`;
- `membership_request_rejected_not_this_time`;
- `membership_request_waitlisted`;
- `circle_meeting_reminder`;
- `circle_meeting_update`;
- `circle_meeting_cancelled`;
- `circle_chat_update`;
- `report_update` (reporter sees confirmation; reported user gets nothing);
- `invite_available` (waitlist promotion);
- `system_notice`.

### 18.2 Rules (binding)

- **No exact location в notification body** для non-approved users (Инв. 1);
- **Approval notification может say** «details are available» — exact location fetched в authorized screen;
- **Exact location fetched** только в authorized screen, не в push payload;
- **No report details в notification** (privacy);
- **No transitions notifications** для других user'ов (Инв. 11 — no betrayal mechanics);
- **No public removal / rejection labels** в notifications.

---

## 19. Safety & Moderation Architecture v2

### 19.1 P0 capabilities

- report user;
- report circle;
- report meeting;
- report message;
- block user;
- moderation queue (admin);
- admin action (restrict / ban / remove / freeze);
- audit logs;
- AI moderation assist (P1, assistive only).

### 19.2 Moderation flow

```
Report created (Edge Function: report_content)
  → Queue item (RLS: admin only)
  → Admin review (admin app)
  → Action / dismiss / escalate (Edge Function: moderate_circle_content)
  → Audit log entry (мandатory — Инв. 4)
  → User / circle / meeting / message state updated
  → Affected users get neutral notification (per policy)
```

### 19.3 Circle-specific moderation

- **host abuse** — internal signal (частые removals → admin review trigger);
- **frequent member removals** — host-accountability signal;
- **comfort composition violation** — admin review;
- **unsafe circle** — `removed_for_safety` + audit;
- **unsafe meeting location** — admin can override / remove;
- **social drama risk** — no public shame copy (Инв. 12);
- **AI assistive only** — серьёзный enforcement — human (Инв. 5).

---

## 20. Trust System Architecture v2

### 20.1 Internal inputs (append-only `trust_events`)

- profile completeness;
- phone verification;
- meeting attendance;
- repeated attendance (continuity signal);
- no-show;
- host reliability;
- membership history (duration, breadth);
- reports (against this user);
- blocks (against this user);
- moderation actions;
- suspicious velocity.

### 20.2 Internal outputs

- `trust_events` (append-only log);
- internal trust score (number — **never user-visible** — Инв. 3);
- internal trust tier (`new`, `verified`, `reliable`, `trusted_host`, `restricted`, `suspended`);
- safety friction (rate-limit adjustments per tier);
- moderation priority (assist queue).

### 20.3 Public outputs (soft badges only)

- **Проверен**;
- **Надёжный участник**;
- **Уже проводил встречи**;
- **Участвовал во встречах**.

### 20.4 Forbidden

- raw trust score public (Инв. 3);
- public ratings (Hard rule 5);
- public negative labels (Инв. 10, 12);
- no-show labels public;
- **social credit** mechanics (Инв. 10).

---

## 21. Admin Dashboard Architecture v2

### 21.1 Sections

- Moderation Queue (ADM-002);
- Report Detail (ADM-003);
- User Detail (ADM-004);
- Circle Detail admin view (ADM-005);
- Meeting Detail admin view (ADM-006);
- Message Detail admin view (ADM-007);
- Suspicious Activity (ADM-008);
- Audit Logs (ADM-009);
- Admin Action Modal (ADM-010).

### 21.2 Admin actions

- dismiss report;
- warn user;
- restrict user;
- ban user;
- remove circle;
- remove meeting;
- hide message;
- freeze chat;
- add private note;
- escalate.

### 21.3 Rules (binding)

- **Service role server-side only** (Инв. 12; Sprint 1 baseline — `import 'server-only'` guard в `serverEnv.ts`);
- **No service role в browser / mobile**;
- **All serious actions require reason** (US-ADM-17);
- **All moderation-sensitive actions audit logged** (Инв. 4 — failed audit write blocks action).

---

## 22. Analytics Architecture v2

### 22.1 Event categories

- activation;
- onboarding;
- circle discovery;
- membership requests;
- meetings;
- circle chat;
- belonging mode;
- safety;
- moderation;
- trust;
- beta;
- retention.

### 22.2 Key events (taxonomy v2)

- `first_circle_viewed`;
- `circle_viewed`;
- `circle_join_requested`;
- `circle_request_approved_for_intro`;
- `circle_membership_confirmed`;
- `my_circles_opened`;
- `circle_home_opened`;
- `meeting_rsvp_yes`;
- `circle_meeting_attended`;
- `repeat_meeting_attendance`;
- `circle_chat_opened`;
- `report_created` (reason category only — **no description**);
- `block_created`;
- `moderation_action_taken`.

### 22.3 Privacy boundary (binding)

- **No exact location** в любом event'е (Инв. 1);
- **No raw message body** (privacy);
- **No report description** text;
- **No raw trust score** (Инв. 3);
- **No PII** где можно избежать.

### 22.4 North Star candidates

- **A:** trusted recurring offline interactions;
- **B:** active trusted circles with confirmed recurring attendance.

Final choice в [`/docs/10_ANALYTICS.md`](10_ANALYTICS.md) v2.

### 22.5 Forbidden metric directions

- **«circles per user»** как retention KPI (Инв. 14);
- public popularity counters;
- user-facing trust score.

---

## 23. AI Moderation Architecture v2

### 23.1 Allowed AI uses

- profile text moderation;
- photo moderation (NSFW / safety flags);
- circle title / description moderation;
- meeting description moderation;
- circle chat harassment detection;
- spam / scam detection;
- report summarization для admin;
- queue prioritization (signal only).

### 23.2 Rules (binding)

- **AI assistant, не judge** (Инв. 5);
- **Серьёзный enforcement** требует human / admin review;
- **AI risk scores** — internal только, **не public**;
- **False positives recoverable** — admin override + audit;
- **AI provider isolation** — AI moderation API calls идут через Edge Functions, не из client.

---

## 24. Security Architecture v2

### 24.1 Critical security invariants (architecturally enforced)

1. **Non-approved user не может read exact meeting location** (RLS + Edge Function gate).
2. `requested` / `waitlisted` / `rejected` **не могут read `meeting_locations`** (RLS predicate).
3. `approved_for_intro_meeting` читает **только для одной meeting** (scoped predicate).
4. `member` читает **upcoming allowed meeting locations** (window-scoped).
5. **Removed / left / paused теряют future access** (status change → RLS denies).
6. **Non-members не могут read circle chat** (RLS + Realtime channel auth).
7. **Raw trust score** никогда не returned в public APIs (column-level RLS + view separation).
8. **Service role никогда не exposed** (Инв. 12; CI check).
9. **Admin-only data** никогда не available к mobile (admin app boundary).
10. **Reports private** (reporter ≠ reported; reported не видит fact of report).
11. **Moderation actions audit logged** (Инв. 4; failed audit blocks action).
12. **No public removal / rejection history** (no public-facing endpoint exposes these).
13. **No people marketplace data exposure** (no API returns browsable user catalog).

> Эти 13 пунктов — **architectural contract** для Schema v2 + RLS v2 + Edge Functions. Implementation tasks должны verify каждый через test.

---

## 25. RLS Architecture Overview v2

> **Без SQL.** Это architectural overview. Полные policies — в [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md) v2 (которая ещё не написана).

### 25.1 Tables requiring strict RLS

| Table | Who can read | Who can insert | Who can update | Sensitive fields |
|---|---|---|---|---|
| `profiles` | safe view: всем onboarded; full: self + admin | self + Edge Function | self + admin | display_name, photo, badges |
| `profile_private_details` | self + admin | Edge Function | self + admin | phone, email, location preference, internal flags |
| `circles` | safe view: всем onboarded; full: host + members + admin | Edge Function (host) | Edge Function (host) | rules text, internal settings |
| `circle_membership_requests` | self + host of target circle + admin | Edge Function (user) | Edge Function (host) | intro_note |
| `circle_memberships` | self + host of circle + other members per policy + admin | Edge Function | Edge Function | status, transitions |
| `circle_meetings` | members of circle + admin | Edge Function (host) | Edge Function (host) | description, area |
| **`meeting_locations`** | **scoped per §11.3 matrix** | Edge Function (host) | Edge Function (host) | **exact_location — most sensitive** |
| `meeting_rsvps` | self + host + members per policy + admin | Edge Function (user) | Edge Function (user) | status |
| `meeting_attendance` | self + host + admin | Edge Function (host / system) | Edge Function | attended, no_show |
| `circle_chat_messages` | members of circle + admin | Edge Function (member) | Edge Function (admin для moderation) | body, attachments |
| `reports` | reporter + admin | Edge Function (user) | admin only | reason, description |
| `user_blocks` | self + admin | Edge Function (user) | self | — |
| `trust_events` | admin only (internal) | Edge Function (system) | append-only | event type, refs |
| `user_trust_summary` | self (badges only) + admin (full) | Edge Function (system) | Edge Function (system) | **raw score** — admin only |
| `moderation_actions` | admin only | Edge Function (admin) | admin only | reason, action |
| `audit_logs` | admin only | Edge Function (system) | append-only | actor, target, action |
| `invite_codes` | admin only | admin only | admin only | code value |

> **Этот overview — input для [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) v2.** RLS details (точные predicates, helper functions, policy names) — там.

---

## 26. Environment Architecture

Без major изменений vs Sprint 1.

| Env | Purpose | Service role | Mobile env vars |
|---|---|---|---|
| **local** | development | local dev only; no production secrets | `EXPO_PUBLIC_*` only |
| **staging** | mirror prod security | staging service role server-side only | staging `EXPO_PUBLIC_*` |
| **production** | beta launch | production service role server-side only; rotated | production `EXPO_PUBLIC_*` |

**Reaffirm (binding):**

- **No production secrets в local**;
- **Staging mirrors production security**;
- **Service role server-side only** (Инв. 12);
- **Mobile public env only** — `EXPO_PUBLIC_*` prefix gate.

Details: [`/docs/19_ENV_CONFIG_STRATEGY.md`](19_ENV_CONFIG_STRATEGY.md) (Sprint 1 baseline — без изменений).

---

## 27. CI/CD Architecture

Без major изменений vs Sprint 1.

**Mobile:**

- Expo + EAS (P1 — после schema v2 + first product implementation).

**Admin:**

- Next.js deploy (P1 — после product implementation начата).

**Backend:**

- Supabase migrations (P1 — после Schema v2 написана и approved).

**CI:**

- typecheck (Sprint 1 baseline — PASS);
- lint (Sprint 1 baseline — PASS);
- tests (Sprint 1 baseline — Vitest packages);
- future RLS tests (после Schema v2 + RLS v2);
- **no secret usage** в CI (Sprint 1 baseline — PASS).

> Sprint 1 PASS status ([`/docs/21_SPRINT_1_INFRASTRUCTURE_REVIEW.md`](21_SPRINT_1_INFRASTRUCTURE_REVIEW.md)) **не затронут** этим документом.

---

## 28. Testing Strategy v2

### 28.1 Unit tests

- validators (Zod schemas);
- lifecycle transitions (membership / circle / meeting);
- membership logic (`approved_for_intro → intro_attended → member`);
- trust calculations (internal score per event;).

### 28.2 Integration tests

- auth / onboarding (full flow);
- request place (rate-limit, blocked user check);
- host approval для intro;
- **meeting location reveal** (per state — критический);
- circle chat access (per membership status);
- report / block (propagation).

### 28.3 RLS tests (binding — каждый — P0)

- **non-member не может see meeting location** (Инв. 1);
- **`requested` не может see meeting location**;
- **`waitlisted` не может see meeting location**;
- **`rejected` не может see meeting location**;
- **`approved_for_intro_meeting` sees только для intro meeting**, не для других;
- **`member` sees allowed meeting location** (upcoming в reveal window);
- **`removed` member теряет access immediately**;
- **`paused` member loses location access**;
- **non-member не может read circle chat**;
- **removed member loses chat subscription**;
- **public profile excludes private data**;
- **raw trust score не exposed**;
- **reports private** (reporter ≠ reported access);
- **service role не accessible из mobile**;
- **admin-only tables blocked для non-admin**.

### 28.4 E2E tests (P1)

- signup → onboarding (full);
- circle discovery → detail;
- request place → host approval → intro invitation;
- intro meeting location reveal → RSVP → attendance;
- circle chat (send / receive / report);
- My Circles → pause / leave;
- report / block;
- admin moderation full loop.

> **RLS test framework** — open question §33. Без него Schema v2 / Sprint 2 implementation **не может пройти review**.

---

## 29. Performance & Scalability

**MVP approach** (closed beta, ~hundreds to low thousands пользователей):

- **Optimize для closed beta** — не для миллионов;
- **Indexes для circle discovery** (city, area, vibe, rhythm, status);
- **Indexes для membership requests** (circle_id, user_id, status);
- **Indexes для meetings** (circle_id, starts_at, status);
- **Chat pagination** (cursor-based, не offset);
- **Avoid over-fetching member profiles** — safe-profile views;
- **Safe views** для public circle / profile data (columns без sensitive fields);
- **Refetch sensitive screens** после status changes (TanStack Query invalidation);
- **No premature optimization** — measure после real usage.

---

## 30. Data Privacy & Retention

### 30.1 Circle context

- **Membership history internal** (Инв. 3);
- **No public removal / rejection history** (Инв. 12);
- **No transition history** между circles для других user'ов (Инв. 11);
- **Exact meeting location protected** (Инв. 1);
- **Report / audit retention policy** — open (§33; нужно для GDPR);
- **Deleted user handling** в circle context — open (§33; sole-host scenario);
- **Chat retention policy** — open (TTL? export?);
- **Moderation records** могут иметь retention exception (safety > strict deletion).

### 30.2 GDPR-style P1 (US-P1-13)

- export own data;
- delete account (with retention exceptions для audit / reports);
- audit logged on delete.

---

## 31. Architecture Decisions

ADR-like table. Status: **Accepted** (preserved) или **Updated** (новое в v2).

| # | Decision | Why | Tradeoff | Status |
|---|---|---|---|---|
| 1 | **Modular Monolith для MVP** | один Supabase + один monorepo; быстрее iterate; tighter coupling приемлемо в MVP | сложнее extract если scale grow | **Accepted** (ADR doc 17) |
| 2 | **Circle-first UX** | стратегическая differentiation; trust через repeated context | переписать domain model, downstream docs | **Updated** (Core v2 §6) |
| 3 | **Meeting-based operations** | offline-meet primitive остаётся; renamed для clarity | event-first identifiers могут остаться в коде временно | **Updated** (Core v2 §7) |
| 4 | **Membership-based access** | RLS keyed на membership status; не single boolean | сложнее policies | **Updated** |
| 5 | **Meeting location separated / protected** | Инв. 1 структурно enforced | дополнительная join сложность | **Updated** |
| 6 | **Circle chat only** в MVP | Инв. 2 + context-first | возможно user'ы захотят 1:1 — P1 gated на validation | **Accepted** (Core v2 §18) |
| 7 | **No open DMs** | Инв. 2 + anti-drift | trade-off accepted | **Accepted** |
| 8 | **Raw trust score internal only** | Инв. 3 + Анти-социальный credit (Инв. 10) | пользователь не видит «свой score» | **Accepted** |
| 9 | **AI moderation assistive only** | Инв. 5 | человеческая модерация дороже scale | **Accepted** |
| 10 | **Invite-only beta** | контроль cohort + safety ops | slower growth | **Accepted** |
| 11 | **Supabase для backend** | All-in-one (auth + Postgres + storage + realtime + edge) | vendor lock-in (mitigated через standard Postgres) | **Accepted** (Sprint 1) |
| 12 | **Service role server-side only** | Инв. 12 | extra Edge Function layer для admin operations | **Accepted** (Sprint 1) |
| 13 | **Expo + RN для mobile** | iOS + Android shared TS; EAS managed builds | Expo SDK constraints | **Accepted** (Sprint 1) |
| 14 | **Next.js 15 для admin** | App Router; React 18 (FIX-INFRA-001); server-only env guard | — | **Accepted** (Sprint 1 + FIX-INFRA-001) |

---

## 32. Architecture Risks v2

| Risk | Impact | Mitigation |
|---|---|---|
| **Schema rewrite complexity** | high | conceptual mapping готов (Core v2 §27, doc 24 §27); design pass в Schema v2 — не rush |
| **Old event-first terms leaking в implementation** | medium | CLAUDE.md §8 vocabulary rules; review gate на code review |
| **Location leak through meeting data** | **critical** (Инв. 1) | separate `meeting_locations` table; RLS test mandated (§28.3); Edge Function gate |
| **Membership access inconsistency** | high | atomic Edge Function transitions; integration tests на every status pair |
| **Stale cache после removal** | high (security) | TanStack Query invalidation + Realtime push для refetch trigger |
| **Chat access too broad** | high (Инв. 2) | RLS + Realtime channel auth; integration test «non-member disconnect» |
| **Host abuse** (host часто removes members) | medium | internal host-accountability signal; admin review trigger; appeal flow (P1) |
| **Approval anxiety** UX | medium | fit-protection framing в copy (Core v2 §19); Test Plan v2 §12 validation |
| **Women-only / comfort composition complexity** | high | gated на validation (Core v2 §21; Test Plan v2 §4); legal review до launch |
| **Circle model too complex для MVP** | medium | Hybrid Accept (doc 26 §35) keeps operational model close к existing event entity; MVP minimalism (Manifesto §19) |
| **No public shame accidentally violated** | high (Инв. 12) | UI review checklist; Test Plan v2 explicit tasks |
| **Service role exposure** | **critical** (Инв. 12) | Sprint 1 `import 'server-only'` guard; CI check; integration test |
| **RLS mistakes** | **critical** | RLS test framework (open §33); test-driven RLS development; no policy без test |

---

## 33. Open Architecture Questions

1. **Exact schema shape** для `circles` / `meeting_locations` / `circle_memberships` / `circle_meetings` — решается в Schema v2.
2. **Intro meeting access to circle chat** — meeting-context only / full read-only / muted? (PRD v2 §27 #14, Flows v2 §14 #4).
3. **Full member list visibility timing** — до intro / после intro / после первой встречи? (PRD v2 §27 #8).
4. **Host removal permissions** — какие категории требуют admin review? (PRD v2 §27 #9).
5. **Pause access rules** — TTL? может ли paused RSVP? (PRD v2 §27 #10).
6. **Meeting location reveal timing window** — сколько часов до встречи? per circle policy?
7. **First-time host review** — все ли новые круги через `pending_review`? (PRD v2 §27 #13).
8. **Comfort composition data model** — enum vs flexible? (gated на §21 validation).
9. **Women-only validation requirements** — копи, expectations, legal? (Core v2 §21).
10. **No-show logic** — first neutral, second/third — internal signal threshold? (PRD v2 §27 #12).
11. **Report snapshot policy** — для deleted messages, для deleted users? (Stories v2 EC-20, EC-24).
12. **Admin role model** — single admin role или granular (moderator / senior moderator / superadmin)?
13. **RLS test framework** — pgTAP? Supabase native? custom Jest harness? (blocks Schema v2 implementation).
14. **Generic Auth implementation** — может ли начаться до Schema v2? **Да** — primitive-agnostic ([CLAUDE.md §6](../CLAUDE.md)) если не depends на circle / membership fields.
15. **Sole-host account deletion** — handover / archive flow для circles which user is sole host of? (Flows v2 §14 #11).

> **Открытые вопросы — не silently decided.** Каждый должен быть закрыт explicit'ным product decision до соответствующего implementation task.

---

## 34. Implementation Readiness Checklist v2

Перед Sprint 2 product implementation должны быть выполнены:

| Item | Status |
|---|:--:|
| Product Core v2 | ✅ done (commit `a719614`) |
| CLAUDE.md updated | ✅ done (commit `a719614`) |
| PRD v2 | ✅ done (commit `3c7f77a`) |
| User Stories v2 | ✅ done (commit `3c7f77a`) |
| User Flows v2 | ✅ done (commit `3c7f77a`) |
| Figma Prototype Plan v2 | ✅ done (commit `3c7f77a`) |
| Design Handoff v2 | ✅ done (commit `3c7f77a`) |
| **Architecture v2** | **✅ done (this doc, pending commit)** |
| **Database Schema v2** | ⬜ **TODO — next required step** |
| Security / RLS v2 | ⬜ TODO (after Schema v2) |
| Sprint Backlog v2 | ⬜ TODO (after Schema v2 + RLS v2) |
| Trust System v2 | ⬜ TODO (P1) |
| Moderation v2 | ⬜ TODO (P1) |
| Analytics v2 | ⬜ TODO (P1) |
| Sprint 2 Phase Gate (`/docs/22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md`) | ⬜ **TODO — final gate** |
| Critical old event-first contradictions removed | ⬜ verify в Schema v2 / RLS v2 |
| Figma v2 prototype drafted | ⬜ TODO (после design review; Test Plan v2 готов) |
| RLS tests planned | ⬜ TODO (Schema v2 prerequisite) |
| **Circle Prototype Test Plan v2** | ✅ done (commit pending — current working tree) |

---

## 35. Summary

**Architecture v2:**

- **Infrastructure и Modular Monolith — preserved** (ADR doc 17 валиден; Sprint 1 PASS не затронут).
- **Domain model переписана** с events → circles + meetings.
- **Meeting location privacy — критический access layer** (отдельная table + RLS + Edge Function gate).
- **Circle membership drives access** к location / chat / member list.
- **Все 16 safety invariants** Core v2 §35 structurally enforced через RLS + Edge Functions + admin app boundary.
- **Никакой новой технологии** не требуется — стек unchanged.
- **Open questions** explicit'но перечислены (§33) — не «додуманы» молча.

**Next required document:**

> Update [`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) to **Database Schema v2** ([doc 27 §24 Phase C step 7](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)).

Schema v2 — это **P0 / implementation-blocking** doc. Без него:

- нельзя писать migrations (Анти-дрейф §3, §14 doc 27);
- нельзя писать RLS policies ([`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) v2 depends on it);
- нельзя запускать Sprint 2 product implementation;
- нельзя писать Edge Functions (§8.3).

Schema v2 должна materialize architectural contracts из этого документа: **separation `meeting_locations`**, **`circle_memberships` lifecycle**, **`circle_chat_messages` access pattern**, **trust signals separation** (`trust_events` append-only + `user_trust_summary` admin-read-only).

---

> Reminder: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2) — **first source of truth**. Этот документ ему и [`/docs/17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md) подчинён. Любой архитектурный артефакт (Schema, RLS, Edge Function, Realtime channel), нарушающий §11 (location matrix), §24 (security invariants) или §25 (RLS overview) — отклоняется на review.
