# Design Handoff v1 — Social Events App

> **Status:** v1 (design → implementation handoff)
> **Owner:** Founder / Product Designer / Technical Founder
> **Last updated:** 2026-05-19

> ⚠️ Этот документ — **мост между Figma и реализацией**, а не источник продуктовых правил.
> Источник правил — [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (first source of truth) и downstream-документы `01`–`12`.
> Документ практический: его читают founder, дизайнер и инженер перед тем, как передавать экран в Claude Code.
> Этот документ **не изменяет** другие документы. Найденные несоответствия фиксируются как заметки/open questions, не правятся здесь.

---

## 1. Source of Truth

- [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — **first source of truth**. Все продуктовые, security, trust и scope-правила берутся из docs, а не из Figma.
- **Figma не может переопределять Product Core.** Figma — это визуальная спецификация (как выглядит экран и как он связан в прототипе), но не источник продуктовой логики, прав доступа, RLS, trust-формул, moderation-правил или scope.
- Если в Figma появляется любое из перечисленного — это **ошибка дизайна**, а не новая фича:
  - exact location / точный адрес / точечный map pin **до approval**;
  - open DM / личные сообщения вне контекста события;
  - raw trust score (число, например `Trust 74/100`);
  - public user ratings / публичные негативные ярлыки;
  - dating mechanics (swipe/match, chemistry/attractiveness, «who liked you»).
- **Claude Code обязан проверять каждый экран against Product Core** до реализации и заявлять применимые safety-инварианты (CLAUDE.md §1, [`12_IMPLEMENTATION_READINESS_REVIEW.md`](12_IMPLEMENTATION_READINESS_REVIEW.md) §20).
- Design Handoff — это **bridge между Figma и implementation**: он структурирует Figma, связывает экраны с docs и задаёт безопасный workflow. Он не заменяет ни Product Core, ни Figma Prototype Plan ([`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md)).

> Правило приоритета: **Product Core > downstream docs > Design Handoff > Figma**. При конфликте — выигрывает Product Core; при неясности — surface decision, не «додумывать» (CLAUDE.md §2/§3).

---

## 2. Purpose of This Document

Design Handoff нужен, чтобы:

- **структурировать Figma** так, чтобы её можно было передавать в реализацию по частям;
- **связать Figma screens с docs** (Screen ID ↔ Flow ID ↔ Story ↔ Analytics ↔ Security);
- **передавать Claude Code конкретные экраны/компоненты**, а не «весь продукт»;
- обеспечить **consistency между дизайном и кодом** (tokens, naming, состояния);
- **защитить safety-инварианты** на этапе перехода design → code;
- **не дать Claude Code «угадывать» продукт** из картинки (схема, права доступа, scope — только из docs);
- обеспечить **React Native / Expo-friendly** реализацию (UI-first, mocked data, без backend на первом проходе).

| Кому | Что даёт документ |
|------|-------------------|
| Founder | Как готовить и приоритизировать экраны для передачи в код |
| Designer | Как именовать screens/frames/components и какие Dev Notes добавлять |
| Engineer / Claude Code | Что реализовывать, в каком объёме, с какими safety-границами |

---

## 3. Figma File Naming

Рекомендуемое имя Figma-файла:

> **Social Events App — MVP Prototype**

Метаданные файла (заполняются по мере готовности):

| Поле | Значение |
|------|----------|
| Figma file link | `https://www.figma.com/design/xZkaKij7DhLPpRE3Ob0Znd` (текущий рабочий файл «Social Events App — Prototype v1») |
| P0 clickable prototype link | TODO |
| Last design review date | TODO |
| Current design status | `draft` (in progress — собраны 3 страницы и токены; экраны не собраны) |

> **Note (несоответствие имён):** рекомендованное имя — «Social Events App — MVP Prototype»; фактический файл создан как «Social Events App — Prototype v1». Это не блокер; при следующем обновлении дизайна стоит выровнять имя (не править другие docs автоматически — CLAUDE.md §4).

---

## 4. Figma Page Structure

Ниже — **рекомендуемая логическая структура страниц**. Каждая страница = один логический раздел.

### 00 — Cover / Product Context
Содержит: product one-liner; core loop (Discover → Apply → Approve → Attend → Reconnect); key safety rules; prototype scope.

### 01 — Foundations
Содержит: typography; color roles; spacing scale; radius; shadows (если нужны); accessibility notes.

### 02 — Components
Содержит: buttons; inputs; cards; badges; banners; modals; chat components; empty states; error states.

### 03 — Mobile / Guest + Onboarding
Содержит: Welcome; Signup/Login; Invite Code; Waitlist; Onboarding steps; Safety Principles; Profile Preview.

### 04 — Mobile / User Core Loop
Содержит: Home / Discover; Filters; Event Detail states; Apply Modal; Pending; Approved; Event Chat; Post-event.

### 05 — Mobile / Host Flow
Содержит: Create Event; Event Preview; Hosted Event Dashboard; Applications List; Applicant Detail; Approve/Reject; Attendee Management.

### 06 — Mobile / Safety
Содержит: Public Safe Profile; Report User; Report Event; Report Message; Block User; Safety states.

### 07 — Mobile / Settings + Privacy
Содержит: Settings; Privacy; Manage blocked users; Data export; Delete account.

### 08 — Admin Dashboard
Содержит: Moderation Queue; Report Detail; User Detail; Event Detail; Message Detail; Audit Logs; Action Modal.

### 09 — Prototype Links
Содержит: clickable prototype map; core user loop; host flow; safety flow; admin flow.

### 10 — Dev Handoff Notes
Содержит: screen registry; component mapping; token mapping; unresolved design questions; implementation notes.

> **Operational note (Figma plan / Starter constraint).** Если файл на **Figma Starter** (лимит 3 страницы), 11 логических разделов сворачиваются в 3 физические страницы Figma + **Sections** внутри страниц. Рекомендуемый маппинг:
>
> | Физическая страница Figma | Логические разделы (Sections) |
> |---|---|
> | `01 · Foundations & Components` | 00 Cover · 01 Foundations · 02 Components · 10 Dev Handoff Notes |
> | `02 · Screens — Mobile` | 03 Guest+Onboarding · 04 Core Loop · 05 Host · 06 Safety · 07 Settings |
> | `03 · Admin & Prototype` | 08 Admin Dashboard · 09 Prototype Links |
>
> Prototype-связи в Figma работают между страницами одного файла. Логические ID разделов и Screen ID сохраняются как **имена Sections/frames** независимо от физической страницы. Это вынужденная адаптация под Starter, а не изменение Figma Prototype Plan §4 — выровнять при апгрейде плана / обновлении [`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) (не в этом документе).

---

## 5. Screen ID Naming Rules

Каждый frame экрана **обязан** называться через Screen ID из документации ([`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) §7/§8).

Формат: `<SCREEN-ID> <Name>` (например `MOB-033 Event Detail — Not Applied`).

**Правильные названия (примеры):**

| Screen ID | Name |
|-----------|------|
| MOB-001 | Welcome |
| MOB-004 | Invite Code |
| MOB-010 | Onboarding Welcome |
| MOB-011 | Safety Principles |
| MOB-030 | Home / Discover |
| MOB-033 | Event Detail — Not Applied |
| MOB-034 | Event Detail — Pending |
| MOB-035 | Event Detail — Waitlisted |
| MOB-036 | Event Detail — Approved |
| MOB-037 | Event Detail — Rejected |
| MOB-050 | Apply Modal |
| MOB-060 | Create Event Start |
| MOB-071 | Applications List |
| MOB-072 | Applicant Detail |
| MOB-080 | Event Chat |
| MOB-095 | Public Safe Profile |
| MOB-110 | Report User |
| MOB-111 | Report Event |
| MOB-114 | Block User Confirmation |
| ADM-002 | Moderation Queue |
| ADM-003 | Report Detail |
| ADM-009 | Admin Action Modal |

**Запрещённые названия** (frame не передаётся в реализацию, пока не переименован):

`Frame 1` · `Screen copy` · `iPhone 14 - 23` · `Untitled` · `Final final` · `New screen` · любое имя без Screen ID.

> **Правило:** Claude Code реализует экраны **только по explicit Screen ID**. Нет Screen ID → нет реализации. Если в задаче нет ID — Claude Code должен запросить его, а не угадывать экран по картинке.

---

## 6. Required Dev Notes per Screen

Рядом с каждым важным Figma-экраном (минимум — все P0) должен быть текстовый блок **Dev Notes** по шаблону.

**Шаблон:**

```
Screen:
Flow:
Role:
State:
Primary CTA:
Secondary actions:
Data required:
Safety notes:
Analytics events:
Related docs:
Implementation notes:
Out of scope:
```

**Пример — Event Detail — Not Applied:**

```
Screen: MOB-033 Event Detail — Not Applied
Flow: FLOW-007 Event Detail
Role: User
State: not_applied

Primary CTA:
Apply

Secondary actions:
Report Event

Data required:
- event title
- category
- date/time
- host safe profile
- capacity
- approximate area
- approval_required

Safety notes:
- exact location hidden
- no event chat access
- no full attendee list unless policy allows (OD-12)
- no raw trust score
- no public ratings

Analytics events:
- event_viewed
- location_privacy_notice_viewed
- apply_cta_tapped
- report_event_started (если открыт report)

Related docs:
- /docs/00_PRODUCT_CORE.md
- /docs/03_USER_FLOWS.md
- /docs/04_FIGMA_PROTOTYPE_PLAN.md
- /docs/07_SECURITY_RLS.md

Implementation notes:
- UI only first
- mocked data acceptable
- no backend logic in first implementation

Out of scope:
- exact location reveal
- Supabase queries
- RLS policies
```

> Имена аналитических событий должны совпадать с [`10_ANALYTICS.md`](10_ANALYTICS.md) §31/§32 (event taxonomy). Не выдумывать новые имена событий в Dev Notes.

---

## 7. P0 Prototype Scope

P0 clickable prototype, который нужно собрать в Figma (см. также [`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) §9/§10):

### User Core Loop
```
Welcome
→ Invite Code
→ Signup/Login
→ Onboarding
→ Safety Principles
→ Home / Discover
→ Event Detail — Not Applied
→ Apply Modal
→ Pending State
→ Approval Notification
→ Event Detail — Approved
→ Exact Location Reveal
→ Event Chat
→ Post-event State
```

### Host Flow
```
Create Event
→ Event Preview
→ Hosted Event Dashboard
→ Applications List
→ Applicant Detail
→ Approve / Reject
→ Attendee Management
```

### Safety Flow
```
Public Safe Profile
→ Report User
→ Report Details
→ Report Submitted
→ Block User
→ Blocked State
```

### Admin Low-fi Flow
```
Moderation Queue
→ Report Detail
→ Admin Action Modal
→ Audit Log
```

> P0 prototype успешен, если тестировщик понимает: что это **не dating app**; как работает approval; почему location скрыта; где report/block (см. тест-скрипт [`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) §19).

---

## 8. Critical Screen States

Экраны с состояниями нельзя реализовывать только в happy-path.

### Event Detail states
`not_applied` · `pending` · `waitlisted` · `approved` · `rejected` · `full` · `cancelled` · `removed_for_safety` · `host_view`.

### Application states
`none` · `pending` · `approved` · `rejected` · `waitlisted` · `cancelled_by_user`.

### Chat states
`active` · `frozen` · `post_event_expiring` · `no_access`.

### Profile states
`own_profile` · `public_safe_profile` · `blocked_user` · `restricted_user` · `moderation_pending`.

### Report states
`report_reason` · `report_details` · `report_submitted`.

> **Правило:** Claude Code никогда не реализует только happy path для safety-critical экранов. Состояния `pending/waitlisted/rejected/cancelled/removed_for_safety`, `no_access`, `frozen`, `blocked/restricted/moderation_pending` обязательны там, где применимы (см. [`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) §12/§18, [`12_IMPLEMENTATION_READINESS_REVIEW.md`](12_IMPLEMENTATION_READINESS_REVIEW.md) §5).

---

## 9. Design Token Naming Rules

Токены в Figma именуются семантически, чтобы переноситься в код без «магических» значений.

### Color roles (semantic)
```
background/default
background/subtle
surface/default
surface/elevated
text/primary
text/secondary
text/muted
border/default
action/primary
action/secondary
action/destructive
status/success
status/warning
status/danger
status/info
trust/verified
safety/notice
```

Не использовать как **основную** UI-систему semantic-less имена: `blue-500`, `green-300`, «random purple», `Rectangle color`. Сырые палитры допустимы только как **primitives**, на которые ссылаются семантические роли.

### Typography roles
`display` · `title` · `heading` · `body` · `body_small` · `caption` · `button` · `label`.

### Spacing scale
`4` · `8` · `12` · `16` · `20` · `24` · `32` · `40` · `48`.

### Radius
`radius_sm` · `radius_md` · `radius_lg` · `radius_xl`.

> **Правило:** при реализации Claude Code маппит Figma styles на design tokens, **а не хардкодит** случайные значения, где это возможно. Если в Figma токен отсутствует — отметить в Dev Notes / open question, не выдумывать значение молча.
>
> *Note:* в текущем рабочем файле уже созданы variable-коллекции `Primitives` / `Semantic` / `Scale` (warm-minimal направление). Имена там slash-разделённые (`color/...`, `space/...`, `radius/...`); семантический смысл соответствует ролям выше — при коде ориентироваться на семантику, а не на конкретные hex.

---

## 10. Component Naming Rules

Рекомендуемые компоненты (см. инвентарь [`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) §6):

### Navigation
`BottomTabNavigation` · `ScreenHeader` · `BackButton` · `ActionHeader` · `AdminSidebar`.

### Buttons
`Button / Primary` · `Button / Secondary` · `Button / Ghost` · `Button / Destructive` · `Button / Disabled` · `Button / Loading`.

### Inputs
`TextInput` · `TextArea` · `Select` · `MultiSelectChips` · `DateTimePickerPlaceholder` · `LocationInput` · `PhoneInput` · `SearchInput`.

### Cards
`EventCard` · `ProfileCard` · `ApplicantCard` · `NotificationCard` · `ReportCard` · `AdminQueueItem`.

### Trust / Safety
`TrustBadge` · `VerificationBadge` · `ApprovalRequiredBadge` · `CapacityBadge` · `LocationPrivacyNotice` · `SafetyNotice` · `ReportCTA` · `BlockCTA` · `ModerationStatusBadge`.

### Event
`EventCategoryChip` · `CapacityIndicator` · `ApplicationStatusBanner` · `WaitlistBanner` · `LocationRevealSection` · `HostInfoBlock` · `AttendeePreview` · `EventLifecycleBadge`.

### Chat
`ChatMessage` · `SystemMessage` · `MessageActionSheet` · `ReportMessageModal` · `ChatFrozenBanner` · `PostEventChatExpiryBanner`.

### Empty / Error
`EmptyState` · `ErrorState` · `AccessDeniedState` · `ModerationPendingState`.

---

## 11. Safety Checklist for Figma Screens

Применять перед передачей **любого** экрана в Claude Code:

- [ ] Frame has correct Screen ID.
- [ ] Frame name matches docs.
- [ ] Dev Notes exist.
- [ ] Exact location is not shown before approval.
- [ ] Event card does not show exact address.
- [ ] Pending/waitlisted/rejected states do not show exact location.
- [ ] Chat is not available before approval.
- [ ] No open DMs exist.
- [ ] Raw trust score is not visible.
- [ ] Public ratings are not visible.
- [ ] Public negative labels are not visible.
- [ ] Dating language is not used.
- [ ] Report/block are accessible where relevant.
- [ ] Safety copy is clear.
- [ ] Primary CTA is clear.
- [ ] Empty/error states are considered.
- [ ] Analytics events are noted.
- [ ] Related docs are noted.

---

## 12. Product Core Violations in Figma

Если Figma-экран содержит любое из перечисленного — Claude Code обязан **отказаться реализовывать «как есть» и эскалировать как product decision** (CLAUDE.md §2/§3, [`12_IMPLEMENTATION_READINESS_REVIEW.md`](12_IMPLEMENTATION_READINESS_REVIEW.md) §20):

| # | Нарушение в дизайне | Связанный инвариант |
|---|---------------------|---------------------|
| 1 | exact address before approval | Инвариант 1 |
| 2 | exact map pin before approval | Инвариант 1/9 |
| 3 | open DM button | Инвариант 2 |
| 4 | raw trust score (число) | Инвариант 3 |
| 5 | public user rating | Инвариант 5/10 |
| 6 | negative public badge | Инвариант 3/10 |
| 7 | dating-style match | Анти-dating |
| 8 | chemistry score | Анти-dating |
| 9 | attractiveness ranking | Анти-dating |
| 10 | payments / tickets в MVP | «Не входит в MVP» |
| 11 | public follower mechanics | «Не входит в MVP» |
| 12 | live user location | Инвариант 9 |
| 13 | admin-only data в mobile screen | Web-only admin |
| 14 | report details visible to reported user | No retaliation |
| 15 | sensitive analytics properties в Dev Notes | Privacy boundary ([`10_ANALYTICS.md`](10_ANALYTICS.md) §33) |

---

## 13. Figma-to-Code Workflow

1. Designer/founder создаёт Figma-экран.
2. Экран назван через **Screen ID**.
3. Добавлены **Dev Notes**.
4. Пройден **Safety checklist** (§11).
5. Скопирована **точная ссылка на frame** (не на файл).
6. Claude Code получает задачу на **один экран/компонент**.
7. Claude Code читает relevant docs.
8. Claude Code заявляет применимые safety-инварианты (CLAUDE.md §1).
9. Claude Code реализует UI с **mocked data** сначала.
10. Human review: fidelity + safety.
11. **Только после review** добавляется backend/data integration.

> Не просить Claude Code реализовать весь app из Figma за один раз.

| ✅ Correct | ❌ Incorrect |
|-----------|-------------|
| implement `Button` | implement all screens from Figma |
| implement `EventCard` | build the whole app |
| implement `MOB-033 Event Detail — Not Applied` | infer the backend from Figma |

---

## 14. Claude Code Prompt Template — Implement One Figma Screen

```
Implement one screen from Figma.

Figma frame:
[PASTE EXACT FRAME LINK]

Screen:
[SCREEN ID + SCREEN NAME]

Before coding, read:
- CLAUDE.md
- /docs/00_PRODUCT_CORE.md
- /docs/03_USER_FLOWS.md
- /docs/04_FIGMA_PROTOTYPE_PLAN.md
- /docs/07_SECURITY_RLS.md
- /docs/11_SPRINT_BACKLOG.md
- /docs/13_DESIGN_HANDOFF.md

Task:
Create a React Native + Expo + TypeScript screen component.

Scope:
- UI only
- mocked data only
- no backend calls
- no Supabase integration
- no RLS implementation
- no real analytics implementation
- no navigation changes unless required

Safety invariants:
- exact location must not be shown before approval
- no open DMs
- no raw trust score
- no public ratings
- no dating mechanics
- report/block must remain accessible where relevant

Before coding, state:
1. Which docs apply.
2. Which files you will modify.
3. Which safety invariants apply.
4. Whether this task touches sensitive data.
5. What is out of scope.
6. What tests or visual checks are needed.

After coding, summarize:
1. Files changed.
2. How the Figma design maps to components.
3. What assumptions were made.
4. What needs human review.
```

---

## 15. Claude Code Prompt Template — Review Figma Screen

```
Review this Figma screen against our product documentation.

Figma frame:
[PASTE FRAME LINK]

Screen:
[SCREEN ID + SCREEN NAME]

Before reviewing, read:
- CLAUDE.md
- /docs/00_PRODUCT_CORE.md
- /docs/03_USER_FLOWS.md
- /docs/04_FIGMA_PROTOTYPE_PLAN.md
- /docs/07_SECURITY_RLS.md
- /docs/08_TRUST_SYSTEM.md
- /docs/09_MODERATION.md
- /docs/13_DESIGN_HANDOFF.md

Do not write code.
Do not modify files.

Review for:
1. Product Core alignment.
2. Safety invariant violations.
3. Location privacy issues.
4. Dating-app perception.
5. Missing report/block paths.
6. Trust score or public rating issues.
7. Missing states.
8. Implementation risks.
9. Missing Dev Notes.
10. Missing analytics notes.

Return:
- what is good;
- what violates Product Core;
- what should be fixed before implementation;
- what can be deferred;
- specific recommendations by section.
```

---

## 16. Claude Code Prompt Template — Implement Component from Figma

```
Implement one reusable component from Figma.

Figma component/frame:
[PASTE FRAME LINK]

Component:
[COMPONENT NAME]

Before coding, read:
- CLAUDE.md
- /docs/00_PRODUCT_CORE.md
- /docs/04_FIGMA_PROTOTYPE_PLAN.md
- /docs/11_SPRINT_BACKLOG.md
- /docs/13_DESIGN_HANDOFF.md

Task:
Create a reusable React Native + Expo + TypeScript component.

Scope:
- component only
- no backend
- no navigation
- no analytics
- no business logic
- use mocked props
- use design tokens if available

Requirements:
- support variants shown in Figma
- support loading/disabled/error states if applicable
- use accessible labels where appropriate
- avoid hardcoding sensitive/product logic

Before coding, state files to modify and assumptions.

After coding, summarize variants and usage examples.
```

---

## 17. React Native Implementation Constraints

Claude Code генерирует **React Native / Expo / TypeScript** код.

**Allowed primitives:** `View` · `Text` · `Pressable` · `ScrollView` · `FlatList` · `Image` · `TextInput` · `Modal`.

**Do not generate:** HTML `div/span/button` · web CSS-файлы · Tailwind (если явно не принят) · web-only компоненты · browser-only APIs.

**Use:** TypeScript · design tokens · переиспользуемые компоненты · безопасные mocked data на первом UI-проходе · accessibility labels где уместно.

> Admin dashboard — отдельный таргет (Next.js, web-only). Mobile-экраны не тянут admin-данные/логику ([`05_ARCHITECTURE.md`] §19, [`12_IMPLEMENTATION_READINESS_REVIEW.md`](12_IMPLEMENTATION_READINESS_REVIEW.md) §5 инвариант 15).

---

## 18. Figma MCP Notes

- Figma MCP может давать Claude Code доступ к контексту конкретного frame (структура, токены, скриншот).
- Использовать **точные ссылки на frame** (`?node-id=...`), а не только ссылку на файл.
- Если MCP недоступен — Claude Code может работать по screenshot/specs, но качество fidelity ниже.
- Claude Code **не выводит продуктовое поведение** из визуала: схема, права, scope — только из docs.

Плейсхолдеры статуса:

| Поле | Статус |
|------|--------|
| MCP configured | partial — Figma MCP подключён (OAuth), но на Figma **Starter** действует лимит вызовов MCP (квота периодически блокирует запись). TODO: апгрейд плана для стабильной работы |
| MCP not configured | n/a |
| Figma file access granted | yes (файл создан под текущим аккаунтом) |
| Frame link workflow tested | TODO (нужны собранные P0-frames с node-id) |

---

## 19. What Claude Code Must Not Infer from Figma

Claude Code **не выводит из Figma**:

- backend schema;
- RLS policies;
- exact location access rules;
- trust scoring formula;
- moderation enforcement rules;
- analytics sensitive properties;
- admin permissions;
- product scope changes;
- P1/P2 features;
- dating mechanics;
- payment flows.

Эти решения берутся из docs: [`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md), [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md), [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md), [`08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md), [`09_MODERATION.md`](09_MODERATION.md), [`10_ANALYTICS.md`](10_ANALYTICS.md), [`11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md).

---

## 20. Design QA Checklist

Перед началом UI-реализации:

- [ ] P0 frames named correctly (Screen ID).
- [ ] P0 prototype clickable.
- [ ] Core loop works.
- [ ] Host flow works.
- [ ] Safety flow works.
- [ ] Admin low-fi flow exists.
- [ ] Event Detail states complete.
- [ ] Location privacy visible.
- [ ] Report/block visible.
- [ ] No dating language.
- [ ] No raw trust score.
- [ ] No public ratings.
- [ ] Dev Notes exist for P0 screens.
- [ ] Figma frame links can be copied.
- [ ] Figma MCP access tested or fallback process defined.
- [ ] Design tokens documented.
- [ ] Component names documented.

---

## 21. Implementation Order from Figma

1. Design tokens.
2. Base components: `Button` · `TextInput` · `Badge` · `Card` · `StatusBanner` · `EmptyState`.
3. `EventCard`.
4. `ProfileCard`.
5. Welcome/Auth shell.
6. Onboarding screens.
7. Home / Discover.
8. Event Detail states.
9. Apply Modal.
10. Host Application Review.
11. Event Chat.
12. Report / Block.
13. Admin Moderation.

> **Не реализовывать Event Detail location reveal**, пока не пройден human review правил location privacy / security ([`07_SECURITY_RLS.md`](07_SECURITY_RLS.md), [`12_IMPLEMENTATION_READINESS_REVIEW.md`](12_IMPLEMENTATION_READINESS_REVIEW.md) §6/§18). Это явный gate.

---

## 22. Open Design Handoff Questions

| # | Вопрос |
|---|--------|
| 1 | Is Figma MCP configured in Claude Code? (частично — есть лимит Starter) |
| 2 | Is Figma MCP configured in VS Code? |
| 3 | What is the final Figma file link? (имя файла выровнять: «MVP Prototype» vs «Prototype v1») |
| 4 | What is the P0 prototype link? |
| 5 | Are P0 frames named with Screen IDs? |
| 6 | Are Dev Notes added to all P0 screens? |
| 7 | Are design tokens finalized enough for coding? |
| 8 | Which screen should be implemented first? |
| 9 | Is there a preferred React Native styling approach? |
| 10 | Should Claude Code implement UI with StyleSheet or token-based style helpers? |
| 11 | Which components should be implemented before screens? |
| 12 | Has the Figma prototype been tested with 5–7 users? (FIG-002) |
| 13 | Did users perceive the product as dating app? |
| 14 | Did users understand location privacy? |
| 15 | Did users find report/block? |
| 16 | Figma Starter constraint: остаёмся на 3 страницы + Sections или апгрейд до Professional (см. §4)? |

> Связанные нерешённые product-развилки (не дизайнерские) — единый реестр в [`12_IMPLEMENTATION_READINESS_REVIEW.md`](12_IMPLEMENTATION_READINESS_REVIEW.md) §15 (OD-1/3/4/6/9/12/13, Q-RJ и др.). Их закрывает product owner, не дизайн.

---

## 23. Summary

- Design Handoff соединяет **Figma и реализацию в Claude Code**.
- **Figma подчинена Product Core**; продуктовые/security/trust/scope-правила берутся из docs, а не из визуала.
- Каждый экран требует **Screen ID**, **Dev Notes** и прохождения **safety-проверок**.
- Claude Code реализует **один экран/компонент за раз**, UI-first, mocked data, без backend на первом проходе.
- Product logic, security и trust — из документов, не из «угадывания» по картинке.
- **Следующий рекомендуемый шаг:** продолжить сборку **P0 Figma-прототипа** и добавить **Dev Notes** к ключевым frames, затем прогнать **Figma review** (§15) до начала UI-реализации.

---

> Напоминание: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth. Этот документ — мост design → code и ему подчинён. Код приложения, `package.json`, SQL, migrations, SDK **не создавались**; другие документы **не изменялись**.
