# Design Handoff v2 — Antidot

> **Status:** v2 (design → implementation handoff, circle-first).
> **Owner:** Founder / Product Designer / Technical Founder.
> **Last updated:** 2026-05-30.
> **First source of truth:** [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2).
> **Requirements sources:** [`/docs/01_PRD.md`](01_PRD.md) (PRD v2), [`/docs/02_USER_STORIES.md`](02_USER_STORIES.md) (User Stories v2), [`/docs/03_USER_FLOWS.md`](03_USER_FLOWS.md) (User Flows v2).
> **Figma plan source:** [`/docs/04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) (Figma Prototype Plan v2).
> **Supersedes:** Design Handoff v1 (event-first, 2026-05-19).
> **Sequenced by:** [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md) §24 Phase B step 6.

---

## 1. Source of Truth

- **Product Core v2** ([`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md)) — **first source of truth**.
- **Figma не может override Product Core v2.** При конфликте Figma ↔ Core — приоритет у Core.
- **Design Handoff v2** — мост между Figma v2 и implementation (мобильное приложение / admin dashboard).
- Существующий event-first Figma prototype ([[figma-prototype-build]]) — **superseded conceptually**.
- Любой старый event-first screen должен быть **смаплен на circle-first** до implementation (§7 таблица маппинга).
- **Claude Code не должен реализовывать** старые event-first screens как product UI ([`CLAUDE.md`](../CLAUDE.md) §13).

**Принятая модель (binding):**

- **User-facing primitive:** Circle / Круг.
- **Operational primitive:** Meeting / Встреча круга.
- **Circle-first UX, meeting-based operations, vibe-based discovery, context-first communication, trust-first safety model.**

Downstream технические документы ([`05_ARCHITECTURE.md`](05_ARCHITECTURE.md), [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md), [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md), [`08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md), [`09_MODERATION.md`](09_MODERATION.md), [`10_ANALYTICS.md`](10_ANALYTICS.md), [`11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md)) на момент написания **ещё в v0.1 (event-first)** — известное состояние миграции. Этот handoff им и Figma Plan v2 авторитетнее.

---

## 2. Purpose of This Document

Design Handoff v2 существует, чтобы:

- **структурировать Figma v2** (page structure, screen IDs, dev notes);
- **связать Figma screens** с circle-first документацией (Core / PRD / Stories / Flows / Figma Plan);
- **предотвратить event-first implementation drift** — никакой случайной реализации старых экранов как актуального UI;
- **обеспечить, что Claude Code реализует один screen / component за раз** — не «весь app по Figma»;
- **защитить 16 safety invariants** Product Core v2 на уровне UI;
- **сохранить Product Core v2** — любой Figma artifact, нарушающий Core, должен быть flagged, а не silently реализован;
- **сделать React Native / Expo implementation predictable** — single language, single token system, semantic naming.

---

## 3. Current Figma Status

### 3.1 v1 prototype (event-first)

| Атрибут | Значение |
|---|---|
| Структура | foundations / components / mobile screens / admin screens |
| Wired across | Flow A (User core loop), B (Host), C (Safety), D (Admin moderation) |
| Локализация | Russian |
| Статус | **superseded conceptually** для product UI |
| Допустимое использование | visual inspiration / interaction reference / token baseline / component baseline |

### 3.2 Cannot

- использовать v1 screens **как final product UI**;
- ссылаться на v1 как **источник правды** по экранам / flows;
- использовать v1 event-first terminology в новых UI текстах ([CLAUDE.md §8](../CLAUDE.md)).

### 3.3 Required

- Создать **Figma v2 circle-first prototype** до начала product screen implementation.
- Provide explicit **Screen IDs** на каждом frame.
- Provide **Dev Notes** на каждом P0 frame.

**Current v1 prototype** должен трактоваться как:

> visual base / interaction reference / superseded product concept.

**Future v2 prototype** должен быть:

> circle-first / meeting-based / belonging-oriented.

---

## 4. Figma File Naming

### 4.1 Recommended file name

> **Antidot — Circle Prototype v2**

(или **«Antidot — Circle-first Prototype»** — нейтрально, без версионности, если предпочтительнее).

### 4.2 Placeholders (заполнить при создании файла)

| Поле | Значение |
|---|---|
| Figma v1 file link | **TODO** |
| Figma v2 file link | **TODO** |
| P0 circle prototype link | **TODO** |
| Last design review date | **TODO** |
| Current design status | `draft` / `in progress` / `ready for review` — **TODO** |

> **Правило:** Claude Code и инженеры **не должны** работать со ссылками на v1 как с product source. Если placeholder ещё **TODO** — это означает, что implementation **не должно начинаться** для соответствующего screen / flow до получения v2 link.

---

## 5. Figma Page Structure v2

Структура страниц в Figma v2 файле (зеркалит [Figma Plan v2 §5](04_FIGMA_PROTOTYPE_PLAN.md)):

### 00 — Cover / Product Context

- product one-liner;
- circle-first model;
- core loop diagram;
- key safety rules;
- no people marketplace;
- no open DMs;
- no dating mechanics.

### 01 — Foundations

- typography;
- color roles;
- spacing;
- radius;
- shadows;
- icon usage;
- accessibility notes (WCAG 2.1 AA target — PRD v2 §24).

### 02 — Components

См. §12 inventory. Ключевые блоки:

- buttons; inputs; chips; badges;
- **CircleCard**; **CircleDetailHeader**; **VibeTag**; **RhythmBadge**; **ComfortCompositionBadge**;
- **MembershipStatusBanner**; **MeetingCard**; **RSVPControl**;
- **LocationPrivacyNotice**; **LocationRevealSection**;
- ProfileCard/Safe; **RequestCard**;
- chat components; report/block components; empty/error states.

### 03 — Mobile / Guest + Onboarding

- Welcome; Invite Code; Waitlist; Signup/Login; Safety Principles;
- City/Area; Interests; **Vibe**; **Rhythm**; **Comfort Composition**; Group Size; Host Willingness;
- Profile Preview.

### 04 — Mobile / Circle Discovery + Request

- Circle Discovery; Filters; Circle Card examples;
- **Circle Detail — Not Requested**; Request Place Modal; Membership Pending;
- Waitlist; Not This Time.

### 05 — Mobile / Circle Member + Belonging

- **Intro Meeting Approved**; **Meeting Location Reveal**; Meeting Detail; RSVP;
- **Circle Chat**; Become Member;
- **My Circles**; **Circle Home**; Pause Participation; Leave Circle.

### 06 — Mobile / Host Flow

- Create Circle; Circle Preview; Host Circle Dashboard;
- Membership Requests; Request Detail; Approve for Intro; Not This Time;
- Member Management; End Participation.

### 07 — Mobile / Safety

- Public Safe Profile; Report User; Report Circle; Report Meeting; Report Message; Report Submitted;
- Block User; Blocked State.

### 08 — Mobile / Settings + Privacy

- Settings; Privacy; Manage Blocked Users; Data Export; Delete Account.

### 09 — Admin Dashboard

- Moderation Queue; Report Detail; User Detail; Circle Detail; Meeting Detail; Message Detail;
- Audit Logs; Admin Action Modal.

### 10 — Prototype Links

- **Flow A** — User Circle Loop;
- **Flow B** — Host Circle Flow;
- **Flow C** — Safety Flow;
- **Flow D** — Admin Moderation Flow;
- **Flow E** — Belonging Mode;
- **Flow F** — Location Privacy Flow.

### 11 — Dev Handoff Notes

- screen registry (MOB-NNN / ADM-NNN);
- component mapping (Figma name → `/packages/ui` component name);
- token mapping (Figma token → token namespace);
- design-to-code rules;
- safety notes (per screen);
- unresolved UX questions (§23).

---

## 6. Screen ID Naming Rules v2

**Каждый frame должен использовать explicit Screen ID.** Этот ID — единственный валидный способ ссылаться на screen в implementation task'ах.

### 6.1 Recommended IDs

#### Guest / Auth

- `MOB-001` Welcome
- `MOB-002` Login
- `MOB-003` Signup
- `MOB-004` Invite Code
- `MOB-005` Waitlist Signup
- `MOB-006` Auth Error

#### Onboarding

- `MOB-010` Onboarding Welcome
- `MOB-011` Safety Principles
- `MOB-012` Basic Profile
- `MOB-013` City / Area
- `MOB-014` Interests
- `MOB-015` Vibe
- `MOB-016` Rhythm
- `MOB-017` Comfort Composition
- `MOB-018` Group Size
- `MOB-019` Host Willingness
- `MOB-020` Photo
- `MOB-021` Verification Placeholder
- `MOB-022` Profile Preview
- `MOB-023` Onboarding Complete

#### Circle Discovery / Detail

- `MOB-030` Circle Discovery
- `MOB-031` Circle Filters
- `MOB-032` Circle Card Examples
- `MOB-033` Circle Detail — Not Requested
- `MOB-034` Circle Detail — Requested
- `MOB-035` Circle Detail — Waitlisted
- `MOB-036` Circle Detail — Intro Approved
- `MOB-037` Circle Detail — Member
- `MOB-038` Circle Detail — Full
- `MOB-039` Circle Detail — Paused
- `MOB-040` Circle Detail — Removed for Safety

#### Request / Membership

- `MOB-050` Request Place Modal
- `MOB-051` Intro Note
- `MOB-052` Membership Pending
- `MOB-053` Verification Required
- `MOB-054` Profile Completion Required
- `MOB-055` Waitlist Offer
- `MOB-056` Not This Time
- `MOB-057` Become Member Confirmation

#### Meetings

- `MOB-060` Meeting Detail
- `MOB-061` Meeting Location Reveal
- `MOB-062` RSVP
- `MOB-063` Meeting Reminder
- `MOB-064` Meeting Completed
- `MOB-065` Attendance Confirmation

#### My Circles / Belonging

- `MOB-070` My Circles
- `MOB-071` Circle Home
- `MOB-072` Circle Chat Preview
- `MOB-073` Pause Participation
- `MOB-074` Leave Circle
- `MOB-075` Paused State

#### Host

- `MOB-080` Create Circle Start
- `MOB-081` Circle Details Form
- `MOB-082` Vibe / Rhythm Setup
- `MOB-083` Comfort Composition Setup
- `MOB-084` First Meeting Setup
- `MOB-085` Circle Preview
- `MOB-086` Publish Confirmation
- `MOB-087` Host Circle Dashboard
- `MOB-088` Membership Requests
- `MOB-089` Request Detail
- `MOB-090` Approve for Intro
- `MOB-091` Not This Time (Host)
- `MOB-092` Member Management
- `MOB-093` End Participation

#### Chat

- `MOB-100` Circle Chat
- `MOB-101` Message Actions
- `MOB-102` Report Message
- `MOB-103` Chat Frozen
- `MOB-104` No Chat Access

#### Profile / Safety

- `MOB-110` My Profile
- `MOB-111` Edit Profile
- `MOB-112` Public Safe Profile
- `MOB-113` Report User
- `MOB-114` Report Circle
- `MOB-115` Report Meeting
- `MOB-116` Report Submitted
- `MOB-117` Block User Confirmation
- `MOB-118` Blocked State

#### Settings

- `MOB-130` Settings
- `MOB-131` Privacy
- `MOB-132` Manage Blocked Users
- `MOB-133` Data Export
- `MOB-134` Delete Account

#### Admin

- `ADM-001` Admin Login
- `ADM-002` Moderation Queue
- `ADM-003` Report Detail
- `ADM-004` User Detail
- `ADM-005` Circle Detail (admin view)
- `ADM-006` Meeting Detail (admin view)
- `ADM-007` Message Detail (admin view)
- `ADM-008` Suspicious Activity Queue
- `ADM-009` Audit Logs
- `ADM-010` Admin Action Modal

### 6.2 Forbidden frame names

Эти имена **запрещены** для P0 / P1 screens:

- ~~`Frame 1`~~
- ~~`Copy of screen`~~
- ~~`iPhone 14 - 23`~~
- ~~`Final final`~~
- ~~`Untitled`~~
- ~~`screen_v2_new_FINAL_2`~~
- любые имена без Screen ID или без явного описания screen state.

### 6.3 Rule

> **Claude Code должен реализовывать только screens с explicit Screen ID.** Если task ссылается на frame без Screen ID или с одним из forbidden names — Claude Code должен **отказаться** и попросить дать exact frame link с Screen ID.

---

## 7. Old-to-New Screen Mapping

Таблица маппинга event-first → circle-first. Применяется при пересмотре v1 frames для v2.

| Old (event-first, superseded) | New (circle-first, v2) | Notes |
|---|---|---|
| MOB-030 Discover | **MOB-030 Circle Discovery** | feed of circles, не events; no people |
| MOB-033 Event Detail — Not Applied | **MOB-033 Circle Detail — Not Requested** | aggregated composition; exact location hidden |
| MOB-050 Apply Modal | **MOB-050 Request Place Modal** | один request на circle, не на event |
| MOB-034 Pending | **MOB-052 Membership Pending** | per-circle pending, non-stigmatizing copy |
| MOB-036 Approved | **MOB-036 Circle Detail — Intro Approved** + **MOB-061 Meeting Location Reveal** | scoped reveal к одной intro-встрече |
| MOB-080 Event Chat | **MOB-100 Circle Chat** | per-circle, не per-event |
| MOB-060 Create Event | **MOB-080 Create Circle Start** (+ MOB-081…086) | multi-step circle creation |
| MOB-071 Applications List | **MOB-088 Membership Requests** | host queue per-circle |
| MOB-072 Applicant Detail | **MOB-089 Request Detail** | safe applicant context |
| (v1) My Events | **MOB-070 My Circles** | belonging mode primary home |

### 7.1 State

- Old screens **не должны** реализовываться напрямую.
- Они должны быть **redesigned / mapped** на v2 IDs до implementation.
- Если task ссылается на старый screen ID, который существует и в new mapping (например MOB-030, MOB-050) — implementer должен использовать **circle-first content**, не event-first.

---

## 8. Required Dev Notes per Screen v2

**Каждый P0 Figma screen должен иметь Dev Notes** прикреплённые к frame (в Figma — sticker / annotation; в Dev Handoff Notes странице — registry).

### 8.1 Template

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

### 8.2 Пример — Circle Detail — Not Requested

```
Screen: MOB-033 Circle Detail — Not Requested
Flow: FLOW-007 Circle Detail
Role: User
State: not_requested

Primary CTA:
Запросить место

Secondary actions:
Пожаловаться на круг

Data required:
- circle title
- vibe tags
- rhythm indicator
- approximate area (area only)
- capacity / size band
- comfort composition label
- host safe profile (display name + verification badge)
- next meeting summary (date + area only)
- approval explanation block

Safety notes:
- exact meeting location hidden (Инв. 1)
- no full member list before approval
- no circle chat preview
- no raw trust score (Инв. 3)
- no public ratings
- no people marketplace (Инв. 13)
- approval framed as fit protection (Core v2 §19)

Analytics events:
- circle_viewed
- location_privacy_notice_viewed
- circle_join_started (on CTA tap)

Related docs:
- /docs/00_PRODUCT_CORE.md (§§ 6, 16, 17, 19)
- /docs/01_PRD.md (§7.5)
- /docs/02_USER_STORIES.md (US-CIRC-01…13)
- /docs/03_USER_FLOWS.md (FLOW-007)
- /docs/04_FIGMA_PROTOTYPE_PLAN.md (§13.5)
- /docs/07_SECURITY_RLS.md (после v2 update — для RLS, не для UI)

Implementation notes:
- UI only в первом проходе
- mocked data acceptable
- no backend logic в первом UI pass
- использовать /packages/ui компоненты как single source для дизайн-токенов

Out of scope:
- exact location reveal (это FLOW-010 / MOB-061)
- membership approval backend
- Supabase queries
- RLS policies
```

### 8.3 Правило

- **P0 screen без Dev Notes — implementation не начинается.**
- Dev Notes — обязательная часть design handoff, не «опциональная улучшалка».

---

## 9. P0 Circle Prototype Scope

### 9.1 User Circle Loop (Prototype A)

```
MOB-001 Welcome
→ MOB-004 Invite Code
→ MOB-010..023 Onboarding (sampled)
→ MOB-030 Circle Discovery
→ MOB-033 Circle Detail — Not Requested
→ MOB-050 Request Place Modal
→ MOB-052 Membership Pending
→ MOB-036 Circle Detail — Intro Approved
→ MOB-061 Meeting Location Reveal
→ MOB-100 Circle Chat (limited intro access per policy)
→ MOB-057 Become Member Confirmation
→ MOB-070 My Circles
```

### 9.2 Host Circle Flow (Prototype B)

```
MOB-080..086 Create Circle
→ MOB-087 Host Circle Dashboard
→ MOB-088 Membership Requests
→ MOB-089 Request Detail
→ MOB-090 Approve for Intro (или MOB-091 Not This Time)
→ MOB-092 Member Management
```

### 9.3 Safety Flow (Prototype C)

```
MOB-112 Public Safe Profile
→ MOB-113 Report User
→ MOB-116 Report Submitted
→ MOB-117 Block User Confirmation
→ MOB-118 Blocked State

И:
MOB-033 Circle Detail
→ MOB-114 Report Circle
→ MOB-116 Report Submitted
```

### 9.4 Admin Flow (Prototype D)

```
ADM-001 Admin Login
→ ADM-002 Moderation Queue
→ ADM-003 Report Detail
→ ADM-004/005/006/007 User / Circle / Meeting / Message Context
→ ADM-010 Action Modal
→ ADM-009 Audit Log
```

### 9.5 Belonging Flow (Prototype E)

```
MOB-070 My Circles
→ MOB-071 Circle Home
→ MOB-060 Meeting Detail
→ MOB-062 RSVP
→ MOB-100 Circle Chat
→ MOB-073 Pause Participation
→ MOB-074 Leave Circle
```

---

## 10. Critical Screen States v2

### 10.1 Circle Detail states

- `not_requested`
- `requested`
- `waitlisted`
- `rejected` / `not_this_time`
- `approved_for_intro_meeting`
- `member`
- `paused`
- `full`
- `circle_paused` (circle сам на паузе, не user)
- `removed_for_safety`
- `host_view`

### 10.2 Membership states

- `none`
- `requested`
- `waitlisted`
- `approved_for_intro`
- `intro_attended`
- `member`
- `paused`
- `left`
- `removed`
- `removed_for_safety`
- `banned_from_circle`

### 10.3 Meeting states

- `scheduled`
- `starting_soon`
- `in_progress`
- `completed`
- `cancelled`
- `removed_for_safety`

### 10.4 Chat states

- `active`
- `frozen` (admin freeze)
- `no_access` (non-member или removed)
- `removed_user` (user был removed)
- `paused_user` (user на pause)
- `read_only` (если policy разрешает)

### 10.5 Safety states

- `report_reason` (selecting reason category)
- `report_details` (optional description)
- `report_submitted` (confirmation)
- `block_confirmation`
- `blocked_state`

### 10.6 Rule

> **Claude Code никогда не должен реализовывать только happy path** для safety-critical screens. Если task требует Circle Detail или Meeting screen — все relevant states должны быть рассмотрены и implemented (или явно вынесены в out-of-scope с TODO).

---

## 11. Design Token Naming Rules v2

Tokens живут в [`/packages/ui`](../packages/ui/) (Sprint 1 — placeholder baseline).

### 11.1 Color roles (semantic only)

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
accent/coral
accent/violet
accent/lime
accent/blue
```

### 11.2 Typography roles

```
display
title
heading
section
body
body_small
caption
button
badge
```

### 11.3 Spacing scale

```
4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48
```

### 11.4 Radius

```
radius_sm
radius_md
radius_lg
radius_xl
radius_full
```

### 11.5 Rules

- **Только semantic токены** в screens — не hex / px values напрямую.
- Любой component, использующий hex напрямую (вместо token), **не проходит code review**.
- Tokens должны быть зеркалом Figma styles 1:1 — каждый Figma color style имеет ровно один token.

---

## 12. Component Naming Rules v2

Component naming в Figma == component naming в коде (one-to-one). Names в **PascalCase**.

### 12.1 Circle

- `CircleCard`
- `CircleDetailHeader`
- `VibeTag`
- `RhythmBadge`
- `ComfortCompositionBadge`
- `CapacityBadge`
- `CircleStatusBadge`
- `CircleRulesBlock`
- `HostInfoBlock`
- `CompositionPreview`

### 12.2 Meeting

- `MeetingCard`
- `MeetingDetailBlock`
- `RSVPControl`
- `LocationPrivacyNotice`
- `LocationRevealSection`
- `AttendanceStatusBanner`

### 12.3 Membership

- `RequestPlaceModal`
- `IntroNoteInput`
- `MembershipPendingBanner`
- `IntroApprovedBanner`
- `MemberStatusBanner`
- `PauseParticipationModal`
- `LeaveCircleModal`
- `EndParticipationModal`
- `RequestCard`
- `RequestDetailPanel`

### 12.4 Trust / Safety

- `VerificationBadge`
- `ReliableMemberBadge`
- `HostedBeforeBadge`
- `AttendedEventsBadge`
- `SafetyNotice`
- `ReportCTA`
- `BlockCTA`
- `ModerationStatusBadge`

### 12.5 Chat

- `CircleChatMessage`
- `SystemMessage`
- `MessageActionSheet`
- `ReportMessageModal`
- `ChatFrozenBanner`
- `NoChatAccessState`

### 12.6 Empty / Error

- `NoCirclesEmptyState`
- `NoRequestsEmptyState`
- `NoMeetingsEmptyState`
- `NoChatAccessState`
- `AccessDeniedState`
- `CircleRemovedState`
- `ModerationPendingState`

### 12.7 Rule

> **Forbidden** — generic names типа `Card1`, `Modal2`, `Component`. Если Figma имеет такой component — переименовать перед implementation.

---

## 13. Safety Checklist for Figma Screens v2

Перед тем как любой screen уходит к Claude Code, **проверить:**

- [ ] Frame имеет правильный **Screen ID**.
- [ ] **Dev Notes** прикреплены / в registry.
- [ ] Screen mapping на **circle-first** model.
- [ ] **Нет** old event-first core assumptions (event = primitive, applications, attendees).
- [ ] **Exact meeting location скрыта** before approved access (Инв. 1).
- [ ] **Circle card не показывает exact address.**
- [ ] **Requested / waitlisted / rejected** states **не показывают** exact location.
- [ ] **Non-members не видят** circle chat.
- [ ] **Non-members не видят** full member list.
- [ ] **Нет** people marketplace layout (Инв. 13).
- [ ] **Нет** profile shopping.
- [ ] **Нет** open DMs (Инв. 2) — никакого «message user» CTA.
- [ ] **Нет** raw trust score (Инв. 3).
- [ ] **Нет** public ratings.
- [ ] **Нет** public negative labels (Инв. 12).
- [ ] **Нет** dating language (hearts, match, spark, chemistry).
- [ ] **Нет** betrayal mechanics (Инв. 11).
- [ ] **Нет** public leave / removal / rejection labels (Инв. 12).
- [ ] **Report / block видны** там, где relevant (Инв. 6).
- [ ] **Approval / fit protection** объяснён там, где relevant.
- [ ] **Analytics events** записаны в Dev Notes.
- [ ] **Related docs** перечислены в Dev Notes.

> Любая screen, проваливающая ≥1 пункт checklist'а — **escalated as design issue**, не сдаётся в implementation.

---

## 14. Product Core Violations в Figma v2

**Claude Code должен отказаться / flag implementation**, если Figma screen включает:

1. **Exact meeting location** before approved access (Инв. 1).
2. **Full member list** before approval (Core v2 §16 staged reveal).
3. **«Message user» / DM CTA** anywhere (Инв. 2).
4. **People marketplace layout** (browsable people catalog, Инв. 13).
5. **Swipe / like / match** mechanics (anti-drift).
6. **Raw trust score** (число) (Инв. 3).
7. **Public ratings** (Hard rule 5).
8. **Public negative labels** (no-show / removed / rejected — Инв. 12).
9. **Betrayal mechanics** (Инв. 11) — «X ушёл к другому кругу», уведомления о transitions.
10. **Public removal / rejection / leave labels** (Инв. 12).
11. **Dating-style language** (RU копии, нарушающие [Figma Plan v2 §21](04_FIGMA_PROTOTYPE_PLAN.md)).
12. **Hearts / chemistry / spark** visual language.
13. **Payments / tickets / promoted circles** в MVP (Core rule 7).
14. **Exact public map pins** (Инв. 1).
15. **Live user location** (Инв. 9).
16. **Admin-only data в mobile app** (Инв. 12 / admin-mobile boundary).
17. **Report details visible to reported user** (Инв. 6 / privacy).

### 14.1 Workflow at violation

1. Claude Code распознаёт violation.
2. Claude Code **не реализует** screen.
3. Claude Code **flags violation** в response: «Этот screen противоречит Product Core v2 Инв. N».
4. Founder / Product Designer **решает** — fix Figma или принять product decision о смене Core (с full migration).

---

## 15. Figma-to-Code Workflow v2

### 15.1 Steps

1. **Designer / founder создаёт Figma v2 screen.**
2. Screen **назван с Screen ID** (§6).
3. **Dev Notes** прикреплены (§8).
4. **Safety checklist** заполнен (§13).
5. **Exact Figma frame link** скопирован.
6. **Claude Code получает task для ОДНОГО screen / component**.
7. Claude Code **читает Product Core v2 и Design Handoff v2**.
8. Claude Code **указывает applicable safety invariants** (CLAUDE.md §1 pre-task checklist).
9. Claude Code **реализует UI с mocked data first**.
10. Human **review visual fidelity и safety**.
11. **Только после review**, backend / data integration добавляется.

### 15.2 Никогда

> **Никогда не просите Claude Code реализовать «весь app по Figma»**.

### 15.3 Correct task wording

✅ Examples:
- «implement CircleCard»
- «implement RequestPlaceModal»
- «implement MOB-033 Circle Detail — Not Requested»
- «implement Discover screen states — empty / loaded only»

### 15.4 Incorrect task wording

❌ Examples:
- ~~«implement all screens from Figma»~~
- ~~«build the whole app»~~
- ~~«infer backend from Figma»~~
- ~~«implement old Event Detail as current product UI»~~

---

## 16. Claude Code Prompt Template — Implement One Figma Screen v2

```
Implement one screen from Figma.

Figma frame:
[PASTE EXACT FRAME LINK]

Screen:
[SCREEN ID + SCREEN NAME, e.g. MOB-033 Circle Detail — Not Requested]

Before coding, read:
- CLAUDE.md
- /docs/00_PRODUCT_CORE.md
- /docs/03_USER_FLOWS.md
- /docs/04_FIGMA_PROTOTYPE_PLAN.md
- /docs/13_DESIGN_HANDOFF.md

Task:
Create a React Native + Expo + TypeScript implementation of this screen.

Scope:
- UI only
- mocked data only
- no backend calls
- no Supabase integration
- no RLS implementation
- no real analytics SDK implementation
- no database changes
- no migrations
- no navigation changes unless required
- do not implement other screens
- do not infer missing product behavior from Figma

Safety invariants:
- exact meeting location must not be shown before approved access
- no people marketplace
- no open DMs
- no raw trust score
- no public ratings
- no dating mechanics
- no public shame
- no betrayal mechanics
- report/block must remain accessible where relevant

Before coding, state:
1. Which docs apply.
2. Which safety invariants apply (refer to Core v2 §35 by number).
3. Which files you plan to create or modify.
4. Whether this task touches sensitive data.
5. What is explicitly out of scope.
6. What visual or functional checks are needed.

After coding, summarize:
1. Files changed.
2. How the Figma design maps to components.
3. What assumptions were made.
4. What needs human review.
5. Any Product Core v2 risks noticed.
```

---

## 17. Claude Code Prompt Template — Review Figma Screen v2

```
Review this Figma screen against Product Core v2.

Figma frame:
[PASTE FRAME LINK]

Screen:
[SCREEN ID + SCREEN NAME]

Before reviewing, read:
- CLAUDE.md
- /docs/00_PRODUCT_CORE.md
- /docs/03_USER_FLOWS.md
- /docs/04_FIGMA_PROTOTYPE_PLAN.md
- /docs/13_DESIGN_HANDOFF.md

Do not write code.
Do not modify files.

Review for:
1. Product Core v2 alignment.
2. Circle-first consistency (no event-first carryover).
3. Safety invariant violations (Core v2 §35 invariants 1–16).
4. Location privacy issues (Инв. 1, 9).
5. People marketplace risk (Инв. 13).
6. Dating-app perception (Hard rule 6).
7. Missing report/block paths (Инв. 6).
8. Raw trust score or public rating issues (Инв. 3, Hard rule 5).
9. Public shame / betrayal mechanics (Инв. 11, 12).
10. Missing states (per §10 Critical Screen States).
11. Missing Dev Notes (§8).
12. Missing analytics notes (§8).
13. Implementation risks (component reuse, token usage).

Return:
- what is good;
- what violates Product Core v2 (cite invariant number);
- what should be fixed before implementation;
- what can be deferred;
- specific recommendations.
```

---

## 18. React Native Implementation Constraints

### 18.1 Stack

- **React Native** (через Expo).
- **Expo Router** для routing.
- **TypeScript**.

### 18.2 Allowed primitives

- `View`
- `Text`
- `Pressable` (preferred над `TouchableOpacity` — better semantics)
- `ScrollView`
- `FlatList`
- `Image`
- `TextInput`
- `Modal`
- (later, per platform) `SafeAreaView` от `react-native-safe-area-context`

### 18.3 Forbidden

- ~~HTML `div` / `span` / `button`~~ (это RN, не web)
- ~~web CSS files~~
- ~~Tailwind~~ (если явно не adopted — на момент написания не adopted)
- ~~web-only components~~
- ~~browser-only APIs~~ (`window`, `document`, etc.)

### 18.4 Use

- **TypeScript** strict (per Sprint 1 baseline);
- **design tokens** из `/packages/ui` (не inline values);
- **reusable components** (не one-off styling);
- **mocked data** first;
- **accessibility labels** (`accessibilityLabel`, `accessibilityRole`, etc.);
- **safe area** wrappers где relevant.

### 18.5 Sprint 1 baseline reminder

- Mobile app — Expo SDK 52, React 18 ([FIX-INFRA-001 alignment](21_SPRINT_1_INFRASTRUCTURE_REVIEW.md)).
- Admin app — Next.js 15, React 18.
- Tokens placeholder в [`/packages/ui`](../packages/ui/) — пока без React components; circle-specific токены добавятся к v2.
- **Никаких новых deps без явного разрешения** (per [CLAUDE.md §6](../CLAUDE.md) freeze list).

---

## 19. Figma MCP Notes

### 19.1 Status

- Figma MCP **может** предоставить frame context (если configured).
- Использовать **exact frame links**, не whole-file links.
- Если MCP unavailable — screenshots / specs в frame Dev Notes достаточны.
- **Claude Code не должен infer product logic из visual design в одиночку.**
- **Product Core v2 overrides Figma** — всегда.

### 19.2 MCP status placeholders

| Поле | Значение |
|---|---|
| MCP configured | **TODO** |
| File access granted | **TODO** |
| Frame link workflow tested | **TODO** |

### 19.3 Workflow при использовании Figma MCP

1. Designer / founder копирует exact frame link.
2. Task передаёт frame link + Screen ID.
3. Claude Code (если MCP configured) reads frame через MCP.
4. Claude Code **всё равно** проверяет docs (Core v2, Flows v2, Figma Plan v2, Handoff v2) **перед coding** — MCP не заменяет docs.

---

## 20. What Claude Code Must Not Infer from Figma

Visual design **не источник правды** для следующих аспектов:

- **backend schema** (источник: [`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) v2 после migration);
- **RLS policies** (источник: [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md) v2);
- **exact meeting location access rules** (источник: Core v2 §17, Flows v2 §9);
- **trust scoring formula** (источник: [`/docs/08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md) v2; raw score never visible — Инв. 3);
- **moderation enforcement** (источник: [`/docs/09_MODERATION.md`](09_MODERATION.md) v2);
- **analytics sensitive properties** (источник: PRD v2 §22, Flows v2 §12);
- **admin permissions** (источник: Core v2 §10, Flows v2 §6/FLOW-022);
- **onboarding fields beyond docs** (источник: PRD v2 §7.2, Stories v2 §5.3);
- **membership lifecycle beyond docs** (источник: Core v2 §11);
- **product scope changes** (источник: Core v2 §25, §26);
- **P1 / P2 features** (источник: Stories v2 §6, §7);
- **dating mechanics** (запрещено — Hard rule 6);
- **direct messaging** (запрещено в MVP — Инв. 2);
- **payments / promoted circles** (запрещено в MVP — Core rule 7).

> **Принцип:** Figma — для **as-is UI**; docs — для **product logic**. Если Figma показывает что-то, что не подтверждено в docs — Claude Code **спрашивает**, не **догадывается**.

---

## 21. Design QA Checklist v2

Перед тем как Figma v2 уходит в product implementation:

- [ ] **P0 frames** все имеют правильные Screen IDs.
- [ ] **P0 prototype** clickable end-to-end.
- [ ] **Circle-first loop работает** (Welcome → My Circles).
- [ ] **Host circle flow** работает (Create → Review → Manage).
- [ ] **Safety flow** работает (Report → Submit → Block).
- [ ] **Admin flow** существует (Queue → Detail → Action → Audit).
- [ ] **My Circles / Belonging Mode** существует и feels different from Discover.
- [ ] **Circle Detail states complete** (10 states — §10.1).
- [ ] **Meeting Location Reveal complete** (scoped vs full member).
- [ ] **Location privacy visible** в UI explainer'ах.
- [ ] **Composition visibility staged** (before request / after request / after approval).
- [ ] **Report / block visible** в relevant контекстах.
- [ ] **Нет** people marketplace.
- [ ] **Нет** dating language.
- [ ] **Нет** raw trust score.
- [ ] **Нет** public ratings.
- [ ] **Нет** public shame.
- [ ] **Нет** betrayal mechanics.
- [ ] **Dev Notes существуют** на каждом P0 frame.
- [ ] **Frame links копируются** без выпадения.
- [ ] **Design tokens документированы** (§11).
- [ ] **Component names** соответствуют §12.

---

## 22. Implementation Order from Figma v2

Рекомендованный порядок implementation после того как Figma v2 готова:

1. **Design tokens** (`/packages/ui` — расширить за пределы Sprint 1 placeholder baseline).
2. **Base components:**
   - `Button` (variants)
   - `TextInput`
   - `Badge`
   - `Card`
   - `StatusBanner`
   - `EmptyState`
3. **CircleCard** — главный компонент discovery.
4. **VibeTag / RhythmBadge / ComfortCompositionBadge** — chip-family.
5. **LocationPrivacyNotice** — explainer component.
6. **RequestPlaceModal** — main entry flow.
7. **Circle Detail states** (MOB-033..040 — sequence states one at a time).
8. **Circle Discovery** (MOB-030 — feed).
9. **Intro Meeting Approved / Location Reveal** (MOB-036, MOB-061).
10. **Circle Chat** (MOB-100 + variants).
11. **My Circles / Circle Home** (MOB-070, MOB-071).
12. **Host Membership Review** (MOB-087..091).
13. **Report / Block** (MOB-112..118).
14. **Admin Moderation** (ADM-002..010).

### 22.1 Hard rule

> **Не реализовывать** старые **Event Detail** или **Apply Modal** как current product UI. Если task требует «event detail» — отклонить как event-first carryover и попросить **Circle Detail** spec.

---

## 23. Open Design Handoff Questions

1. **Is Figma v2 created?** — TODO (§4 placeholder).
2. **Figma v2 file link?** — TODO.
3. **P0 circle prototype link?** — TODO.
4. **Are P0 v2 frames named with Screen IDs?** — gating §13 checklist.
5. **Are Dev Notes added** к каждому P0 frame?
6. **How to visually explain circle vs meeting** (контейнер vs scheduled instance) в одном взгляде?
7. **How to show vibe** без elitist tone (Figma Plan v2 §28 #2)?
8. **How to show comfort composition** (иконки / цвета / копи)?
9. **How to show intro meeting vs full membership** — visual hierarchy?
10. **Does intro-approved user get full circle chat?** — gated на open question Flows v2 §14 #4.
11. **How to show member list safely** — timing reveal (PRD v2 §27 #8)?
12. **How to show My Circles as belonging mode** — home priority logic (PRD v2 §27 #16, Flows v2 §14 #19)?
13. **How to show pause / leave softly** — copy + visual без shame?
14. **How to test «no public shame»** — что именно user не должен видеть в prototype'е?
15. **Which screen first** after Figma v2 готов?
16. **Should existing v1 prototype be archived or duplicated в v2 file** — process question.
17. **Are deferred screens** (P2 — DMs, swipe, payments) представлены как **placeholders** или **отсутствуют** полностью?

---

## 24. Summary

**Design Handoff v2** связывает Figma v2 с **circle-first implementation**.

- **Product Core v2** overrides Figma (always).
- **Claude Code реализует один component / screen за раз**, не «весь app по Figma».
- **Старые event-first Figma screens — superseded** и должны быть mapped на circle-first до implementation.
- **Dev Notes обязательны** на каждом P0 frame.
- **Safety checklist (§13) обязателен** перед уходом в implementation.
- **16 safety invariants Core v2 §35** — binding на UI уровне.

**Implementation freeze** в силе до завершения migration (PRD v2 ✅, Stories v2 ✅, Flows v2 ✅, Figma Plan v2 ✅, Handoff v2 ✅; **остаются**: Schema v2, RLS v2, Trust v2, Moderation v2, Analytics v2, Backlog v2, Phase Gate doc 22 — см. [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md) §24).

**Next recommended task** (по migration plan):

> Update [`/docs/15_FIGMA_TEST_PLAN_AND_RESULTS.md`](15_FIGMA_TEST_PLAN_AND_RESULTS.md) to **Circle Prototype Test Plan v2** ([doc 27 §24 Phase B step 7](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)).

Alternative по приоритету (P0): можно сразу к **Phase C technical docs** — [`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) → Schema v2 (doc 27 §24 step 7), которая блокирует Sprint 2 product implementation; Figma Test Plan v2 — P2, non-blocking.

---

> Reminder: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2) — **first source of truth**. Этот документ ему, PRD v2, Stories v2, Flows v2 и Figma Plan v2 подчинён. Любой Figma artifact / implementation task должен ссылаться на Screen IDs (MOB-NNN / ADM-NNN), FLOW IDs и Story IDs из этих документов.
