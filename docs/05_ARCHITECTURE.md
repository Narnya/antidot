# Architecture v1 — Social Events App

> **Status:** v1 (architecture for closed beta)
> **Owner:** Technical
> **Last updated:** 2026-05-18

---

## 1. Source of Truth

- Документ основан на [`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md), [`01_PRD.md`](01_PRD.md), [`02_USER_STORIES.md`](02_USER_STORIES.md), [`03_USER_FLOWS.md`](03_USER_FLOWS.md), [`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md).
- **[`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth.** При конфликте приоритет у Product Core.
- Архитектура **не должна нарушать** safety-инварианты (Инварианты 1–10).
- Все будущие implementation tasks должны ссылаться на этот документ и на Story ID из документа 02.
- Нерешённые архитектурные развилки — в [§31 Open Architecture Questions](#31-open-architecture-questions), не «додуманы» молча (CLAUDE.md §3).

---

## 2. Architecture Goals

1. Mobile-first MVP.
2. iOS + Android одновременно (single codebase).
3. Быстрая разработка early-stage продукта.
4. Secure by default.
5. Privacy by design.
6. RLS-first backend (доступ enforced на БД, не только на клиенте).
7. Safety/moderation встроены с первого дня.
8. Чёткий event/application lifecycle.
9. Контролируемый beta launch (invite-only).
10. Фундамент для будущего intelligence layer (без него в MVP).

---

## 3. Architecture Non-Goals (MVP)

Архитектура MVP **намеренно не поддерживает**: payments · tickets · paid events · large marketplace · open DMs · dating mechanics · public followers · public ratings · live location · exact public map pins · advanced AI matching · complex recommendation engine · host monetization · enterprise admin features.

> Эти возможности не закладываются в схему/API. Добавление — только через product decision + обновление Product Core (CLAUDE.md §2/§5).

---

## 4. High-Level System Overview

| Компонент | Технология | Роль |
|-----------|------------|------|
| Mobile App | React Native + Expo | Единственный клиент для пользователей (iOS+Android) |
| Backend | Supabase + PostgreSQL | БД, доступ, бизнес-логика |
| Auth | Supabase Auth | Email/Google/Apple, сессии |
| Storage | Supabase Storage | Фото профилей/медиа (с moderation) |
| Realtime | Supabase Realtime | Event chat, статусы, нотификации |
| Edge Functions | Supabase Edge Functions | Sensitive server-side операции |
| Admin Dashboard | Next.js (web) | Модерация, audit, только admin |
| Analytics | PostHog | Продуктовые метрики |
| Crash Reporting | Sentry | Mobile + admin crash/observability |
| AI Moderation | OpenAI / Claude | Assistive moderation (не judge) |
| Notifications | Push (Expo/APNs/FCM) | Статусы, напоминания (без exact location) |
| CI/CD | GitHub Actions + EAS | Сборка, миграции, деплой |

```
                       ┌─────────────────────────────┐
   Mobile App (RN/Expo) │  anon/auth client (RLS)     │
        │               └─────────────────────────────┘
        ▼
  Supabase Auth ──► PostgreSQL (RLS) ──► Supabase Storage
        │                  │                   │
        ▼                  ▼                   ▼
  Edge Functions   Supabase Realtime     Signed URLs
        │                  │
        ▼                  ▼
  Notifications        Analytics (PostHog)
        │
        ▼
  Admin Dashboard (Next.js, service role server-side) ──► Moderation / Audit
        ▲
        └── AI Moderation (assistive) ──► Moderation Queue
```

**Loop alignment:** Discover (read events via RLS) → Apply (Edge Function) → Approve (Edge Function + Realtime) → Attend (Realtime chat, location reveal) → Reconnect (post-event chat window).

---

## 5. Recommended Tech Stack

| Layer | Technology | Reason | Notes |
|-------|------------|--------|-------|
| Mobile UI | React Native | Cross-platform iOS+Android, один код | Mobile-first (Core) |
| Tooling | Expo | Быстрый старт, EAS, OTA | Managed workflow |
| Language | TypeScript | Типобезопасность, shared types | Везде (mobile/admin/functions) |
| Navigation | Expo Router (или React Navigation) | Декларативная навигация, deep links | Stack/tab/modal модель |
| Server state | TanStack Query | Кэш, refetch, инвалидация | Refetch sensitive on focus |
| Local UI state | Zustand | Лёгкий стор UI/сессии | Не хранить sensitive |
| Forms | React Hook Form | Производительные формы | Onboarding/Create Event |
| Validation | Zod | Схемы, shared validators | Client + Edge Functions |
| Backend | Supabase | Auth+DB+Storage+Realtime+Functions из коробки | Ускоряет early-stage |
| Database | PostgreSQL | Реляционная модель, RLS | Core security layer |
| Auth | Supabase Auth | Email/OAuth/Apple, сессии | Onboarding/beta gates сверху |
| Storage | Supabase Storage | Медиа + policies + signed URLs | Moderation перед публичностью |
| Realtime | Supabase Realtime | Chat/статусы | Только в рамках RLS |
| Functions | Supabase Edge Functions | Sensitive бизнес-операции | Server-side enforcement |
| Admin | Next.js | SSR, server-side service role | Web only, admin only |
| Analytics | PostHog | Funnels, события, flags | Privacy-aware |
| Crash/obs. | Sentry | Ошибки, перформанс | Mobile + admin |
| CI | GitHub Actions | TS/lint/test/RLS/migrations | Описано, не создаётся сейчас |
| Build | EAS Build | iOS/Android сборки, signing | Preview/production |
| AI moderation | OpenAI / Claude | Флаг/суммаризация/приоритет | Assistive only (Инвариант 5) |

---

## 6. Repository Architecture

> Пока **только описание структуры**. Папки/код не создаются на этом шаге (CLAUDE.md §6).

```
/apps
  /mobile      — React Native + Expo приложение (пользователи)
  /admin       — Next.js admin dashboard (модерация, audit)

/packages
  /ui          — общие UI-примитивы/дизайн-система (если шарится)
  /types       — общие TypeScript-типы (entities, enums, lifecycle)
  /validators  — Zod-схемы (shared client/server validation)
  /config      — общая конфигурация, env-схемы, feature-flag ключи
  /analytics   — обёртка над PostHog, единый event taxonomy

/supabase
  /migrations  — SQL миграции (схема, RLS) — создаётся позже
  /functions   — Edge Functions — создаётся позже
  /seed        — seed/mock data (beta city) — создаётся позже
  /tests       — RLS/integration тесты БД — создаётся позже

/docs
  00_PRODUCT_CORE.md … 11_SPRINT_BACKLOG.md  — документация (this layer)
```

| Папка | Назначение |
|-------|------------|
| `/apps/mobile` | Клиент пользователей; не содержит service role |
| `/apps/admin` | Только admin; service role строго server-side |
| `/packages/types` | Единый источник типов сущностей/статусов |
| `/packages/validators` | Zod-схемы, переиспользуемые на клиенте и в Edge Functions |
| `/packages/analytics` | Единая taxonomy событий (privacy-aware) |
| `/supabase/migrations` | Источник истины схемы и RLS |
| `/supabase/functions` | Sensitive операции (approve, report, moderation…) |
| `/docs` | Документы; Product Core — first source of truth |

---

## 7. Mobile App Architecture

### 7.1 App Layers
Navigation → Screen → Feature modules → API/data access (Supabase client + TanStack Query) → State (Zustand) → Validation (Zod) → Analytics (PostHog wrapper) → Error handling → Design system. Каждый слой не «протекает» вниз sensitive-логикой: доступ к данным всегда enforced RLS/Edge Functions, клиент не доверяет себе.

### 7.2 Feature Modules
`auth · onboarding · profiles · discovery · events · applications · chat · notifications · safety · settings · beta/invites`. Каждый модуль = экраны + data hooks + локальный стор + валидаторы; safety-модуль доступен из profiles/events/chat (Инвариант 6).

### 7.3 Navigation Model
| Стек | Состояние пользователя | Доступ |
|------|------------------------|--------|
| Guest stack | `guest` | Welcome/Auth/Invite/Waitlist |
| Onboarding stack | `authenticated_not_onboarded` | Только onboarding |
| Authenticated tabs | `onboarded` | Home/MyEvents/Create/Notifications/Profile |
| Host flows | `host` (внутри tabs) | Create/Hosted/Review/Manage |
| Modal flows | любые | Apply/Report/Block/Confirmations |
| Restricted state | `restricted` | Ограниченный набор + объяснение |
| Banned state | `banned` | Нет доступа (logout/Access Denied) |

### 7.4 State Management
- **Server state:** TanStack Query (events, applications, chat, profile) — кэш + инвалидация по статусам.
- **Local UI state:** Zustand (навигация UI, флаги модалок) — без sensitive.
- **Form state:** React Hook Form (+ Zod resolver).
- **Auth/session:** Supabase client (single source сессии).
- **Feature flags:** PostHog (или config) — safety-флаги нельзя выключать без product decision.

### 7.5 Validation
Zod-схемы в `/packages/validators`, переиспользуются клиентом и Edge Functions. **Клиентская валидация — только UX**; авторитетная валидация sensitive-операций — на сервере (Edge Functions/RLS). «No trust in client-only validation.»

### 7.6 Error Handling
Единый маппинг: auth error · permission/RLS denied (generic «нет доступа», без раскрытия sensitive) · upload error · moderation pending · event full · restricted/banned (нейтрально) · network. Ошибки доступа к exact location/chat → safe-сообщение «доступно после approval», не утечка факта существования данных.

### 7.7 Offline / Caching
MVP: ограниченное кэширование, **не offline-first**. Sensitive-экраны (Event Detail, Chat, Application) — refetch on focus и инвалидация после смены статуса (approve/reject/cancel/ban). Запрещено отдавать stale exact location/chat при отозванном доступе.

---

## 8. Backend Architecture

### 8.1 Supabase Services
Auth · PostgreSQL · RLS · Storage · Realtime · Edge Functions · scheduled jobs (через pg_cron/Scheduled Functions).

### 8.2 Database Access Pattern
- Mobile читает/пишет **разрешённые** данные через Supabase client; **RLS обязателен** на всех exposed таблицах.
- Sensitive бизнес-операции (approve, reject, report, moderation, trust update, invite validation) — **через Edge Functions**, не прямой client-write.
- Admin dashboard использует **service role только server-side** (Next.js серверная часть).
- **Service role никогда** не попадает в mobile/браузер.

### 8.3 Edge Functions

| Function | Purpose | Inputs | Outputs | Security | Priority |
|----------|---------|--------|---------|----------|----------|
| `invite_code_validation` | Проверка invite при signup | code, user | valid/invalid, binding | Атомарное использование; rate limit | P0 |
| `create_event_with_validation` | Создание события с проверками | event payload | event id, status | Разделение approx/exact; content→moderation | P0 |
| `submit_application` | Подача заявки | event_id, note | application=pending | Гейты onboarding/verif (OD-1); velocity | P0 |
| `approve_application` | Approve заявки | application_id | status=approved, grants | Уважает capacity; открывает exact/chat | P0 |
| `reject_application` | Reject заявки | application_id | status=rejected | Никогда не раскрывает exact | P0 |
| `cancel_event` | Отмена события | event_id, reason | status, notifications | Admin-cancel → audit log | P0 |
| `report_content` | Report user/event/message | target, reason | report → queue | Снапшот контекста; no retaliation | P0 |
| `block_user` | Блокировка | target | block record | Пересчёт visibility/interaction | P0 |
| `moderate_profile_content` | Модерация текста/фото профиля | content ref | safe/flagged/needs_review | AI assistive (Инвариант 5) | P0 |
| `moderate_event_content` | Модерация события | event id | safe/flagged | AI assistive | P0 |
| `send_notification` | Отправка уведомления | type, recipient | delivery | **Payload без exact location** | P0 |
| `update_trust_events` | Запись trust-сигналов | signal | trust_event | Server-only; не возвращает score | P0 |
| `handle_post_event_attendance` | Attendance/no-show | event id | attended/no_show | Метод — OD-8; внутренний trust | P1 |

### 8.4 Scheduled Jobs
`mark events starting_soon` · `mark events completed` · `send reminders` (safe wording) · `expire post-event chat` (OD-4) · `process no-show prompts` (OD-8) · `cleanup temporary media` · `review stale pending moderation items`. Все, что меняют доступ (completed/expiry), инвалидируют клиентский кэш через статус.

---

## 9. Core Domain Architecture

| Domain | Сущности | Responsibilities |
|--------|----------|------------------|
| **9.1 Identity** | User, Profile, ProfilePhoto, Interest, UserInterest, VerificationState | Onboarding, completeness, safe public profile, privacy settings |
| **9.2 Events** | Event, EventCategory, EventLocation, EventLifecycle, EventAttendee | Создание, discovery, lifecycle, capacity, waitlist, **location privacy** |
| **9.3 Applications** | EventApplication, ApplicationStatus, HostDecision | Apply, approve, reject, waitlist, конвертация в attendee |
| **9.4 Messaging** | EventChatMessage, ChatAccess, MessageModerationStatus | Только event chat, **no open DMs**, reporting, freeze, post-event expiry |
| **9.5 Safety** | Report, Block, ModerationAction, AuditLog, SuspiciousActivity | Reports, blocks, queue, ban/restrict, **auditability** |
| **9.6 Trust** | TrustEvent, TrustTier, PublicTrustBadge | Internal сигналы, attendance/no-show, host feedback, **нечисловые** badges |
| **9.7 Beta** | InviteCode, WaitlistEntry, FeatureFlagExposure | Invite-only, контролируемая бета, ограничение доступа |

Ключевое разделение: **EventLocation** хранит approximate и exact раздельно (см. §11); **Trust** internal-поля никогда не выходят на клиент (см. §18).

---

## 10. Auth & Access Architecture

**Методы:** email · Google · Apple · phone verification · session persistence · logout · protected routes.

**Гейты (последовательно):**
```
Guest → Invite check → Auth → Onboarding → Phone verification (if required, OD-1) → Onboarded app access
```

| Роль | Где | Доступ |
|------|-----|--------|
| `guest` | mobile | Welcome/Auth/Invite/Waitlist |
| `authenticated_not_onboarded` | mobile | Только onboarding |
| `onboarded_user` | mobile | Полный loop (по статусам) |
| `host` | mobile | + создание/управление своими событиями |
| `restricted` | mobile | Ограниченный набор + объяснение |
| `banned` | — | Нет доступа; сессии инвалидированы |
| `admin` | **web only** | Admin dashboard, server-side permissions |

> **Admin — не обычная mobile-роль.** Admin-доступ только через web dashboard и server-side проверки; service role не на клиенте.

---

## 11. Location Privacy Architecture *(критический раздел)*

- **Exact location хранится отдельно** от approximate (отдельная защищённая таблица/поля — финализация в §31/[`07_SECURITY_RLS.md`](07_SECURITY_RLS.md)).
- Public discovery возвращает **только approximate area** (через safe view).
- Event detail до approval **не возвращает** exact location ни в каком поле/endpoint.
- Approved-пользователь получает exact **только** через разрешённый RLS-доступ / защищённый view / Edge Function.
- Rejected/waitlisted/pending **никогда** не получают exact.
- Notifications для non-approved **не содержат** exact location в payload.
- Карты (если появятся) — fuzzy area, без точечного pin.
- Exact **user live location** не используется и не хранится (Инвариант 9).

| User/Application State | Approximate area | Exact location | Chat access | Notes |
|------------------------|:----------------:|:--------------:|:-----------:|-------|
| guest | ❌ | ❌ | ❌ | Нет доступа к событиям |
| authenticated_not_onboarded | ❌ | ❌ | ❌ | Только onboarding |
| onboarded (не подал) | ✅ | ❌ | ❌ | Discovery |
| pending | ✅ | ❌ | ❌ | Ожидание решения |
| waitlisted | ✅ | ❌ | ❌ | Нет exact/chat |
| approved | ✅ | ✅ | ✅ | Exact только здесь |
| rejected | ограниченно | ❌ | ❌ | Никогда exact |
| blocked | ❌ | ❌ | ❌ | Скрыто/недоступно |
| restricted | по политике | по статусу | ограниченно | Зависит от ограничения |
| banned | ❌ | ❌ | ❌ | Нет взаимодействия |
| host (свои) | ✅ | ✅ | ✅ | Владелец события |
| admin | ✅ | ✅ (logged) | ✅ (модерация) | Доступ к exact логируется |

---

## 12. Event Lifecycle Architecture

| Status | Кто ставит | Доступные actions | Notifications | RLS/access | Analytics |
|--------|-----------|-------------------|---------------|------------|-----------|
| `draft` | Host | edit, submit | — | Видит только host | `event_create_started` |
| `pending_review` | System/AI/Admin | approve→live, block | host (если block) | Не в discovery | `event_pending_review` |
| `live` | System/Admin | apply, host review | — | Discovery: approx only | `event_published` |
| `full` | System | waitlist, review | waitlisted users | Новые → waitlist | — |
| `starting_soon` | System (time) | final updates, chat | approved (safe) | Approved: exact | — |
| `in_progress` | System (time) | chat, report | — | Повышенная модерация | — |
| `completed` | System | post-event chat, feedback | attendees | Attendance/no-show | `event_completed` |
| `archived` | System | read-only | — | Retention policy (OD-9) | — |
| `cancelled_by_host` | Host | notify | all applicants | Exact не раскрывается | `event_cancelled` |
| `cancelled_by_admin` | Admin | notify + audit | all applicants | **Audit log** | `moderation_action_taken` |
| `removed_for_safety` | Admin | notify + audit | all applicants | **Audit log**, generic msg | `event_removed_for_safety` |

---

## 13. Application Lifecycle Architecture

| Status | Кто меняет | User видит | Host видит | Location | Chat | Notification | Trust impact |
|--------|-----------|------------|------------|----------|------|--------------|--------------|
| `none` | — | Apply CTA | — | approx | ❌ | — | — |
| `pending` | User | «на рассмотрении» | safe profile+note | approx | ❌ | host: new app | — |
| `approved` | Host | детали+инструкции | в attendee list | **exact** | ✅ | user: approved | + reliability путь |
| `rejected` | Host | мягкий отказ | решение зафикс. | ❌ | ❌ | user: rejected | нейтрально |
| `waitlisted` | Host/System | «в листе ожидания» | в waitlist | approx | ❌ | user: waitlisted | — |
| `cancelled_by_user` | User | «отменено вами» | отменён | approx | ❌ | host (опц.) | повторность — сигнал |
| `attended` | Host/System | «вы посетили» | attended | exact (истор.) | post-event | — | + reliability |
| `no_show` | Host/System | «отмечен no-show» | no_show | — | ❌ | user (нейтр.) | − internal trust |

---

## 14. Realtime Architecture

**P0 realtime:** event chat · application status updates · host application list · notifications · event status changes. **Не использовать realtime для всего** (discovery — обычный fetch/cache).

**Constraints:**
- Только approved attendees могут подписаться на канал event chat.
- rejected/waitlisted/pending **не** подписываются на чат.
- Admin мониторит reports через dashboard (server-side), не клиентский realtime.
- Все подписки **уважают RLS** (Realtime authorization).
- При изменении прав (reject/ban/cancel) — клиент refetch'ит и отписывается от запрещённых каналов.

---

## 15. Storage Architecture

| Bucket | Purpose | Upload | View | Moderation | Signed URL | Limits | Deletion |
|--------|---------|--------|------|------------|------------|--------|----------|
| `profile-photos` | Фото профиля | owner (auth) | через safe view/policy, после approval | Обязательна перед публичной видимостью | Короткоживущие signed URLs | тип (jpg/png/webp), размер cap | Удаляется при удалении профиля (safety-retention §28) |
| `event-media` (если нужно) | Медиа события | host | по доступу к событию | Обязательна | Signed | размер cap | При удалении/removal события |
| `moderation-attachments` (если нужно) | Вложения для модерации | system/admin | admin only | n/a | Server-side only | — | По retention-политике |

> Никаких public unrestricted bucket'ов для sensitive media. Unsafe-фото не видны публично до прохождения moderation. Доступ к Storage уважает policies/RLS.

---

## 16. Notification Architecture

| Type | Trigger | Recipient | Content privacy | Exact location? | Analytics |
|------|---------|-----------|-----------------|:---------------:|-----------|
| approval | application→approved | user | safe wording | ❌ | `application_approved` |
| rejection | application→rejected | user | мягко | ❌ | `application_rejected` |
| waitlist | application→waitlisted | user | нейтрально | ❌ | — |
| event update | host edit | approved | без места в payload | ❌ | — |
| event reminder | scheduled | approved | safe reminder | ❌ | — |
| event cancellation | cancel/removed | all applicants | safe | ❌ | `event_cancelled` |
| new application | application created | host | без sensitive applicant data | ❌ | — |
| report/moderation (если нужно) | admin action | target | нейтрально | ❌ | `moderation_action_taken` |
| invite/waitlist | admin/beta | invited | code/link | ❌ | `invite_code_used` |

> **Жёстко:** ни одно уведомление не содержит exact location для кого-либо в payload (exact доступен только внутри approved Event Detail). Инвариант 1/9.

---

## 17. Safety & Moderation Architecture

**P0:** report user/event/message · block user · moderation queue · admin action · audit log · restrict · ban · remove event · freeze chat · AI moderation assist.

```
Report created → Queue item → Admin review → Action OR dismiss → Audit log → User/event/chat state updated
```

- **Moderation action types:** dismiss · warn · restrict · ban · remove_event · hide_content · freeze_chat · escalate.
- **Admin notes:** привязаны к user/event/report, входят в audit-контекст, не публичны.
- **Priority levels:** по типу/серьёзности + AI risk (assistive).
- **Report categories:** harassment, unsafe, spam/scam, inappropriate content, impersonation, other (финализация P0-набора — §31).
- **Suspicious behavior flags:** velocity (apply/message/report), repeated no-show, ban-evasion, suspicious profile changes → Suspicious Activity queue.
- **Audit logging:** каждое moderation-sensitive действие → `AuditLog` (кто/что/когда/причина) — **Инвариант 4**.
- **Human review:** serious enforcement (permanent ban, серьёзный restrict, спорное removal) требует human (Инвариант 5).

---

## 18. Trust System Architecture v1

**Internal inputs:** phone verification · profile completeness · attendance · no-show · reports · blocks · host feedback · suspicious velocity · moderation actions.

**Internal outputs (server-only):** `trust_events` · internal `trust_score` · `trust_tier` · safety restrictions · admin review priority.

**Public outputs (нечисловые):** Verified · Reliable attendee · Hosted before · Attended events.

**Запрещено (Инвариант 3/10, CLAUDE.md §2):** raw trust score на клиент · публичные числовые рейтинги · публичные негативные ярлыки · social credit механики.

> Internal trust_score/tier вычисляются и хранятся серверно; ни один mobile/public endpoint или view не возвращает число. Badges деривируются серверно и отдаются как enum-флаги.

---

## 19. Admin Dashboard Architecture

- **Tech:** Next.js; доступ к Supabase **server-side**; admin-only auth/authorization; **service role только server-side**, никогда в браузер/mobile.
- **Sections:** moderation queue · report detail · user detail · event detail · message detail · suspicious activity · audit logs · action modal.
- **Admin actions:** dismiss report · warn · restrict · ban · remove event · freeze chat · add note · escalate.
- **Все actions создают audit log** (Инвариант 4). Доступ admin к exact location/sensitive — логируется.

---

## 20. Analytics Architecture

- **Tool:** PostHog. Единая taxonomy в `/packages/analytics`.
- **Категории:** activation · onboarding · discovery · events · applications · chat · safety · moderation · beta · retention.
- **Key events:** `signup_started/completed`, `onboarding_completed`, `profile_completed`, `event_viewed`, `event_created`, `application_created/approved`, `event_chat_opened`, `chat_message_sent`, `report_created`, `block_created`, `moderation_action_taken`, `event_completed`, `attendance_confirmed`, `no_show_recorded`, `invite_code_used`.
- **Privacy notes:** не отправлять в analytics — sensitive PII, **exact location**, raw message content, **raw trust score**. Только id/enum/bucket-свойства.

---

## 21. AI Moderation Architecture

**Use cases:** profile text · profile photo · event title/description · chat harassment detection (P1) · spam/scam detection (P1) · report summarization (P1) · risk prioritization (P1).

```
User-generated content → moderation check → {safe | flagged | needs_review}
   → moderation queue (если flagged/needs_review) → admin decision (serious cases)
```

**Rules:** AI assistant, **не judge**; serious enforcement требует human/admin review; AI-вывод логируется как **moderation signal**, не финальная истина; false positives восстановимы без штрафа пользователю (Инвариант 5).

---

## 22. Security Architecture

Baseline: RLS на всех exposed таблицах · least privilege · service role не на клиенте · exact location защищён RLS/views/functions · signed URLs для медиа · Zod-валидация · server-side валидация sensitive-операций · rate limiting (auth/applications/messages/reports) · audit logs для moderation · secure deletion · privacy by design · admin action logging · управление секретами через env.

**Critical security invariants:**
1. Non-approved user **не может** прочитать exact location.
2. Rejected/waitlisted user **не может** получить доступ к event chat.
3. Raw trust score **никогда** не возвращается публичными mobile API.
4. Service role **никогда** не на клиенте.
5. Admin-only данные **недоступны** из mobile app.
6. Moderation actions **всегда** создают audit log.
7. Banned users **не могут** взаимодействовать.
8. Blocked users **не могут** взаимодействовать с блокирующим.

---

## 23. RLS Architecture Overview

> Полные SQL-политики — в [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md). Здесь — принципы.

| Table | Read | Insert | Update | Delete | Sensitive fields |
|-------|------|--------|--------|--------|------------------|
| `profiles` | self + safe view для других | self (onboarding) | self | self/admin | internal trust, privacy, contact |
| `events` | safe view (approx) публично; full — host/admin | host | host (own) | host/admin | **exact location** |
| `event_applications` | applicant + host(своё) | applicant (Edge) | host (Edge) | applicant (cancel) | note |
| `event_attendees` | event scope (approved/host/admin) | system (Edge) | system | system | — |
| `event_chat_messages` | approved attendees only | approved (Edge/RLS) | автор (огранич.) | author/admin | content |
| `reports` | reporter (свои) + admin | reporter (Edge) | admin | admin | reporter identity |
| `blocks` | involved users | user (Edge) | — | user (если разрешено) | — |
| `trust_events` | **server/admin only** | system | system | — | **всё внутреннее** |
| `moderation_actions` | admin only | admin (Edge) | admin | — | reason, target |
| `audit_logs` | admin only (append) | system | ❌ (immutable) | ❌ | actor/target |
| `invite_codes` | admin; validation via Edge | admin | system | admin | code |

Принципы: **public safe profile = view** (без internal/contact); **exact location отделён/защищён**; **internal trust поля не exposed**; **admin data — server-side only**; audit logs — append-only.

---

## 24. Environment Architecture

| Env | Purpose | DB | Auth | Storage | Analytics | Notifications | AI mod | Admin access |
|-----|---------|----|------|---------|-----------|---------------|--------|--------------|
| local | Разработка | local/branch Supabase | test users | local bucket | dev/disabled | sandbox/mock | mock/sandbox | dev only |
| staging | Предпрод, зеркало security | staging project | staging | staging bucket | staging project | sandbox | sandbox | restricted team |
| production | Реальные beta-users | prod project | prod | prod bucket | prod project | prod push | prod (assistive) | минимальный круг |

Правила: **нет prod-секретов в local**; staging зеркалит prod security/RLS; миграции сначала в staging; prod data access ограничен и логируется.

---

## 25. CI/CD Architecture *(описание, без создания workflow)*

- **Mobile:** EAS Build — preview builds (PR) + production builds; app signing управляется безопасно (EAS credentials).
- **Backend:** Supabase migrations с проверкой; деплой Edge Functions; запрет «дрейфа» схемы вне миграций.
- **Admin:** деплой Next.js (server-side env, без service role в бандле).
- **CI checks:** TypeScript · lint · unit/integration tests · **RLS tests** · migration validation · dependency/secret checks.

---

## 26. Testing Strategy

- **Unit:** validators (Zod) · helpers · trust calculations · lifecycle transitions (event/application).
- **Integration:** auth/onboarding · event creation · application approval · location reveal · report/block.
- **RLS tests (обязательно):**
  - non-approved/rejected/waitlisted **не** видят exact location;
  - approved **видит** exact location;
  - non-approved **не** читает event chat;
  - blocked **не** может apply к событиям блокирующего;
  - banned **не** взаимодействует;
  - raw trust score **не** exposed.
- **E2E (P0 flows):** signup/onboarding · discover/apply · host approve · approved sees location/chat · report/block · admin moderation.

---

## 27. Performance & Scalability

Оптимизация под раннюю бету, не под массовый масштаб: индексы для discovery (city/category/date/status) и для applications (по event/user); пагинация чата; не over-fetch профилей (safe view); views для safe public data; кэш non-sensitive; refetch sensitive после смены статуса; мониторинг медленных запросов (Supabase + Sentry).

---

## 28. Data Privacy & Retention

Privacy by design; минимизация sensitive-данных; **нет exact location в analytics**; user delete/export flow (FLOW-024); reports/audit logs могут иметь retention-исключения (safety); moderation records требуют политики; стратегия удаления медиа; обработка данных blocked-пользователей; логирование admin-доступа. Конкретные сроки retention — Open Question (OD-9).

---

## 29. Architecture Decisions (ADR, кратко)

| # | Decision | Why | Tradeoff | Status |
|---|----------|-----|----------|--------|
| 1 | React Native + Expo (mobile) | Cross-platform, скорость early-stage | Меньше нативного контроля | Accepted |
| 2 | Supabase как backend foundation | Auth+DB+Storage+Realtime+Functions из коробки | Vendor lock-in риск | Accepted |
| 3 | PostgreSQL + RLS как access control | Enforced security на БД | Сложность политик | Accepted |
| 4 | Next.js для admin dashboard | SSR + server-side service role | Отдельное приложение | Accepted |
| 5 | No open DMs в MVP | Инвариант 2 (anti-creep) | Меньше «социальности» | Accepted |
| 6 | Exact location защищён до approval | Инвариант 1 (safety) | Доп. сложность модели/RLS | Accepted |
| 7 | Event chat только для approved | Инвариант 2 | Нет до-approval координации | Accepted |
| 8 | Raw trust score internal-only | Инвариант 3/10 | Нет «прозрачности» рейтинга | Accepted |
| 9 | AI moderation assistive only | Инвариант 5 | Больше нагрузки на human review | Accepted |
| 10 | Invite-only beta | Контролируемый запуск/safety | Медленнее рост | Accepted |

---

## 30. Architecture Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Ошибки RLS раскрывают sensitive | Высокий (privacy breach) | RLS tests обязательны в CI; review политик; staging-зеркало |
| Утечка exact location | Высокий (физ. безопасность) | Отдельная защита exact; запрет в payload/analytics; тесты |
| Экспозиция admin service role | Критический | Service role только server-side; секрет-чек в CI |
| AI false positives | Средний (несправедливость) | Human review для serious; recoverable; логировать как signal |
| Переусложнённый trust system | Средний (медленно/баги) | v1 простой; нечисловые badges; итерации позже |
| Empty city problem | Высокий (нет ценности) | Seed/host-инициатива; одна beta city (OD-10) |
| Moderation workload | Средний | Очередь+приоритеты; AI-приоритизация (assistive) |
| Chat abuse | Средний | Velocity limits; report/freeze; moderation |
| Notification privacy leak | Высокий | Жёсткое правило: payload без exact location |
| Stale client cache даёт неверный доступ | Средний | Refetch on focus; инвалидация по статусу; отписка от каналов |
| Лимиты Supabase | Средний | Мониторинг; индексы; пагинация; план роста |
| Неясный тайминг phone verification | Средний (UX/safety) | OD-1 — решить до реализации Auth/Apply |

---

## 31. Open Architecture Questions

| # | Вопрос | Связь |
|---|--------|-------|
| OD-1 | Phone verification до apply или до approval? | §10/§8.3, PRD OD-1 |
| AQ-LOC | Exact location в той же таблице events или в отдельной защищённой? | §11/§23, PRD §12 |
| AQ-VIEW | Public profiles через DB view? (вероятно да) | §23 |
| AQ-GEO | Discovery: PostGIS или простой city/area-фильтр для MVP? | §27, Q-MAP |
| OD-13 | Все новые события через `pending_review` в бете? | §12, PRD OD-13 |
| OD-4 | Сколько открыт post-event chat? | §8.4/§14 |
| OD-3 | Host видит полный или safe профиль applicant? | §13/§19 |
| OD-6 | Минимальный profile completeness для apply? | §8.3 |
| OD-7 | Co-hosts в MVP? (гипотеза: нет) | §9.2 |
| AQ-ADMIN | Admin dashboard сразу или после core mobile flows? | §19/§32 |
| AQ-MODCAT | Какие moderation categories — P0? | §17 |
| AQ-RATE | Какие rate limits нужны первыми? | §22 |
| OD-10 | Какой first beta city/context для seed data? | §24/§30 |
| OD-9 | Сроки retention reports/audit/safety records? | §28 |

---

## 32. Implementation Readiness Checklist

- [x] Product Core completed
- [x] PRD completed
- [x] User Stories completed
- [x] User Flows completed
- [x] Figma Prototype Plan completed
- [x] Architecture completed (этот документ)
- [ ] Database Schema completed → [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md)
- [ ] Security/RLS completed → [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md)
- [ ] Trust System completed → [`08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md)
- [ ] Moderation plan completed → [`09_MODERATION.md`](09_MODERATION.md)
- [ ] Analytics plan completed → [`10_ANALYTICS.md`](10_ANALYTICS.md)
- [ ] Sprint Backlog completed → [`11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md)
- [ ] P0 Figma prototype хотя бы черновик
- [ ] Critical open product decisions resolved или задокументированы (OD-1, OD-3, OD-4, OD-6, OD-9, OD-10, OD-13)

> Код не начинается, пока не закрыты строки выше (особенно Schema/RLS) и не разрешены/задокументированы critical product decisions.

---

## 33. Summary

- Документ описывает foundation: **mobile (RN/Expo) + backend (Supabase/PostgreSQL) + admin (Next.js) + safety/trust/moderation**, встроенные с первого дня.
- **Supabase + RLS — core security layer**; sensitive-операции — через Edge Functions; service role только server-side.
- **Location privacy — critical architecture rule**: exact отделён и доступен только approved/host/admin, никогда в payload/analytics.
- Admin/moderation/trust и audit заложены сразу; AI — assistive, не judge.
- Нерешённые развилки — §31; готовность к коду — §32.
- **Следующий документ:** [`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md).

> Напоминание: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth; все документы и эта архитектура ему подчинены.
