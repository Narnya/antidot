# Figma Prototype Plan v2 — Antidot

> **Status:** v2 (prototype plan for closed beta, circle-first).
> **Owner:** Product / Design
> **Last updated:** 2026-05-30
> **First source of truth:** [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2).
> **Requirements sources:** [`/docs/01_PRD.md`](01_PRD.md) (PRD v2), [`/docs/02_USER_STORIES.md`](02_USER_STORIES.md) (User Stories v2), [`/docs/03_USER_FLOWS.md`](03_USER_FLOWS.md) (User Flows v2).
> **Supersedes:** Figma Prototype Plan v1 (event-first, 2026-05-18).
> **Sequenced by:** [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md) §24 step 6.

---

## 1. Source of Truth

- Этот документ основан на **Product Core v2**, **PRD v2**, **User Stories v2** и **User Flows v2**.
- **Product Core v2 — first source of truth.** Figma **не может** override Core. При конфликте — приоритет у Core / PRD / Stories / Flows в этом порядке.
- Прототип должен быть **circle-first**, не event-first.
- Существующий event-first Figma prototype ([[figma-prototype-build]]) может использоваться как **visual / layout inspiration only** — **не как final product UI**.
- Новый прототип должен поддерживать **circles, meetings, membership, belonging mode**.

**Принятая модель:**

- **User-facing primitive:** Circle / Круг.
- **Operational primitive:** Meeting / Встреча круга.
- **Circle-first UX**, **meeting-based operations**, **vibe-based discovery**, **context-first communication**, **trust-first safety model**.

Downstream-документы ([`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md), [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md), [`08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md), [`09_MODERATION.md`](09_MODERATION.md), [`10_ANALYTICS.md`](10_ANALYTICS.md), [`11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md), [`13_DESIGN_HANDOFF.md`](13_DESIGN_HANDOFF.md)) на момент написания ещё в v0.1 — известное состояние миграции.

---

## 2. Prototype Goal v2

Построить **clickable P0 Figma prototype**, который тестирует, понимает ли пользователь:

- **что такое круг** (не разовое событие);
- как работает **circle discovery** (по vibe, не по людям);
- как **request a place**;
- **почему существует approval** (fit protection, не human ranking);
- что такое **intro meeting**;
- **когда** становится видна exact meeting location;
- как работает **circle membership**;
- как работает **My Circles / Belonging Mode**;
- как работает **circle chat**;
- **где** report / block;
- что продукт — **не dating app**;
- что **нет** people marketplace или open DMs.

### 2.1 Main user flow

```
Welcome
→ Invite
→ Onboarding
→ Circle Discovery
→ Circle Detail
→ Request Place
→ Membership Pending
→ Intro Meeting Approved
→ Meeting Location Reveal
→ Circle Chat
→ Become Member
→ My Circles / Circle Home
```

### 2.2 Host flow

```
Create Circle
→ Circle Preview
→ Host Circle Dashboard
→ Membership Requests
→ Request Detail
→ Approve for Intro / Not This Time
→ Member Management
```

### 2.3 Safety flow

```
Safe Public Profile
→ Report User
→ Block User
```

### 2.4 Circle safety flow

```
Circle Detail
→ Report Circle
→ Report Submitted
```

### 2.5 Admin flow

```
Moderation Queue
→ Report Detail
→ User / Circle / Meeting / Message Context
→ Admin Action
→ Audit Log
```

---

## 3. Prototype Principles v2

1. **Circle-first**, не event-first.
2. Users **discover circles**, не people.
3. **Vibe over interests.**
4. **Belonging over browsing.**
5. **Rhythm over randomness.**
6. **Fit protection over human ranking.**
7. **Context before communication.**
8. **No people marketplace** (Инв. 13).
9. **No open DMs** (Инв. 2).
10. **No public shame** (Инв. 12).
11. **No betrayal mechanics** (Инв. 11).
12. **No infinite discovery pressure** (Инв. 14).
13. **Exact meeting location hidden** until approved access (Инв. 1).
14. **Safety visible**, но **не bureaucratic**.
15. Продукт **не должен** ощущаться как dating app.

---

## 4. Existing Figma Prototype Status

| Атрибут | Значение |
|---|---|
| Статус v1 prototype | **Superseded** для product UI; visual base only |
| Что включает v1 | foundations, components, mobile screens, admin screens |
| Wired across | Flow A (user core loop), B (host), C (safety), D (admin moderation) |
| Локализация | Russian |
| Можно использовать как | visual / layout inspiration, token baseline, component baseline |

**Что нельзя делать:**

- реализовывать v1 screens **как final product UI**;
- ссылаться на v1 как **источник правды** по экранам;
- использовать v1 event-first terminology в новом UI ([`CLAUDE.md`](../CLAUDE.md) §8).

**Что нужно сделать:**

- conceptually обновить под circles;
- старая event-first терминология → superseded;
- redesign согласно §9–§14 этого документа.

---

## 5. Figma File Structure v2

Предлагаемая структура страниц в Figma file:

### 00 — Cover / Product Context

- product one-liner (Антидот — operating system for trusted social circles);
- circle-first model;
- core loop diagram;
- key safety rules (16 invariants — summary);
- **no people marketplace**;
- **no open DMs**;
- **no dating mechanics**.

### 01 — Foundations

- colors;
- typography;
- spacing;
- radius;
- shadows;
- icon rules;
- accessibility notes (WCAG 2.1 AA target).

### 02 — Components

См. §8 полный inventory. Основные блоки:

- Button (variants);
- Input (variants);
- Chip / Badge;
- **CircleCard**;
- **CircleDetailHeader**;
- **VibeTag**;
- **RhythmBadge**;
- **ComfortCompositionBadge**;
- **MembershipStatusBanner**;
- **LocationPrivacyNotice**;
- **LocationRevealSection**;
- **MeetingCard**;
- **RSVPControl**;
- ProfileCard / Safe;
- **RequestCard**;
- **ChatMessage**;
- **SystemMessage**;
- ReportModal;
- BlockModal;
- EmptyState;
- ErrorState.

### 03 — Mobile / Guest + Onboarding

- Welcome;
- Invite Code;
- Waitlist;
- Signup / Login;
- Safety Principles;
- City / Area;
- Interests;
- Vibe;
- Rhythm;
- Comfort Composition;
- Group Size;
- Host Willingness;
- Photo;
- Verification placeholder;
- Profile Preview.

### 04 — Mobile / Circle Discovery + Request

- Circle Discovery;
- Filters;
- Circle Card examples (variants);
- Circle Detail — Not Requested;
- Request Place Modal;
- Membership Pending;
- Waitlist Offer;
- Not This Time.

### 05 — Mobile / Circle Member + Belonging

- Intro Meeting Approved;
- Meeting Location Reveal;
- Meeting Detail;
- RSVP;
- Circle Chat;
- Become Member;
- **My Circles**;
- **Circle Home**;
- Pause Participation;
- Leave Circle.

### 06 — Mobile / Host Flow

- Create Circle (multi-step);
- Circle Preview;
- Host Circle Dashboard;
- Membership Requests;
- Request Detail;
- Approve for Intro;
- Not This Time (host);
- Member Management;
- End Participation.

### 07 — Mobile / Safety

- Public Safe Profile;
- Report User;
- Report Circle;
- Report Meeting;
- Report Message;
- Block User;
- Report Submitted;
- Blocked State.

### 08 — Mobile / Settings + Privacy

- Settings;
- Privacy;
- Manage Blocked Users;
- Data Export;
- Delete Account.

### 09 — Admin Dashboard

- Moderation Queue;
- Report Detail;
- User Detail;
- Circle Detail (admin view);
- Meeting Detail (admin view);
- Message Detail (admin view);
- Suspicious Activity;
- Audit Logs;
- Admin Action Modal.

### 10 — Prototype Links

- **Flow A** — User Circle Loop;
- **Flow B** — Host Circle Flow;
- **Flow C** — Safety Flow;
- **Flow D** — Admin Moderation Flow;
- **Flow E** — Belonging Mode;
- **Flow F** — Location Privacy.

### 11 — Dev Handoff Notes

- screen registry (MOB-NNN, ADM-NNN);
- component mapping;
- token mapping (link to `/packages/ui` tokens);
- design-to-code rules;
- safety notes (per screen);
- unresolved UX questions (§28).

---

## 6. Design System Direction v2

Visual direction (preserved unless contradicted):

- **light**, **clean**, **premium**, **soft**, **friendly**, **urban**, **safety-forward**, **not romantic**, **not dating**, **not corporate**.

Visual style (binding):

- **Urban Premium Flat / Urban Premium Social.**
- White / light surfaces.
- Strong typography.
- Soft depth.
- Compact badges.
- Controlled accent colors.
- **No emoji-heavy UI.**
- **No hearts.**
- **No dating visual language.**
- **No people-shopping grids.**

> Если Figma v1 использовал hearts / dating-coded цвета / people grids — **переработать**.

---

## 7. Token / Component Rules

### 7.1 Colors (semantic only)

| Token | Purpose |
|---|---|
| `background/default` | основной background экрана |
| `surface/default` | карточки, modal'ы |
| `text/primary` | главный текст |
| `text/secondary` | метаданные, captions |
| `action/primary` | главная CTA |
| `action/secondary` | вторичная CTA |
| `safety/notice` | privacy / safety notices |
| `trust/verified` | verification, soft trust badges |
| `status/success` | RSVP yes, success states |
| `status/warning` | предупреждения |
| `status/danger` | destructive (report, leave) |
| `accent/coral` | warm accent |
| `accent/violet` | calm accent |
| `accent/lime` | fresh accent |

> Никаких dating-coded цветов (ярко-красные сердечки, неон-розовый, swipe-зелёный).

### 7.2 Typography hierarchy

- **Display** — hero only (Welcome, Onboarding intro).
- **Title** — screen titles.
- **Heading** — section headers.
- **Section** — subsection headers.
- **Body** — основной текст.
- **Caption** — метаданные, helpers.
- **Button** — CTA labels.
- **Badge** — короткие маркеры (vibe, status).

### 7.3 Component principles

- **Cards** — calm, premium, easy to scan.
- **CTA hierarchy** очевидна (primary / secondary / ghost).
- **Location privacy** видима, но **не пугающая**.
- **Approval / fit protection** — ясно понятна.
- **Membership status** — soft, **не judgmental**.
- **Report / block** — видны, но **не агрессивны**.

---

## 8. Core Components Inventory v2

Для каждого component'а указаны: purpose, variants, where used (screen IDs / FLOW IDs), safety notes.

### 8.1 Navigation

| Component | Purpose | Variants | Used in | Safety notes |
|---|---|---|---|---|
| BottomTabNavigation | основная нав. | 5-tab (My Circles, Discover, Create, Notifications, Profile) | mobile authenticated | tab priority — My Circles default при ≥1 circle |
| ScreenHeader | top header | with-back / with-actions / minimal | все экраны | — |
| BackButton | возврат | default / on-dark | универсально | — |
| AdminSidebar | admin nav | collapsed / expanded | admin app | service role server-side (Инв. 12) |

### 8.2 Buttons

| Component | Variants |
|---|---|
| Primary Button | default / pressed / loading / disabled |
| Secondary Button | default / pressed / disabled |
| Ghost Button | default / pressed |
| Destructive Button | default / pressed / disabled |
| Disabled Button | static |
| Loading Button | spinner state |

### 8.3 Inputs

- TextInput;
- TextArea (с char counter — для intro-note ≤500);
- Select;
- MultiSelectChips (vibe, interests);
- RhythmSelector (radio chips);
- ComfortCompositionSelector (segmented);
- SearchInput.

### 8.4 Circle Components

| Component | Purpose | Variants | Used in | Safety notes |
|---|---|---|---|---|
| **CircleCard** | preview в discovery | available / full / requested / waitlisted / intro-approved / member / paused / removed | MOB-030, MOB-070 | aggregated composition only; **no exact location**; no people |
| **CircleDetailHeader** | header на detail | not-requested / requested / waitlisted / intro / member / paused / full / removed | MOB-033…040 | hides exact location |
| **VibeTag** | vibe label | calm / open / ambitious / creative / intl / introvert-friendly / emotionally-open / slow-life | discovery, detail, profile | curated set; **no dating-coded** |
| **RhythmBadge** | rhythm indicator | weekly / biweekly / monthly / flexible | circle card, detail | — |
| **ComfortCompositionBadge** | composition label | open mixed / female-friendly / women-only / host-defined | discovery, detail | non-fear-based copy; gated на validation |
| **CapacityBadge** | size band | 4–6 / 6–10 / 10+ / full | discovery, detail | — |
| **CircleStatusBadge** | lifecycle | live / paused / full / archived / removed | discovery, detail | safety removal: generic copy |
| **MembershipStatusBanner** | user state в круге | requested / waitlisted / intro-approved / member / paused / left / removed | Circle Detail, Membership Pending | non-stigmatizing; Инв. 12 |
| **HostInfoBlock** | host snippet | safe-profile | Circle Detail | **no raw trust score** (Инв. 3); display name + verification badge only |
| **CompositionPreview** | aggregated composition | size band + comfort label | Circle Detail (before approval) | aggregated only; **no member list** |
| **CircleRulesBlock** | host-defined rules | text block | Circle Detail | AI assistive moderated |

### 8.5 Meeting Components

| Component | Purpose | Variants | Used in | Safety notes |
|---|---|---|---|---|
| **MeetingCard** | preview meeting | scheduled / starting_soon / completed / cancelled / removed | Circle Home, Discovery (next meeting summary) | **no exact location** в card до approval |
| **MeetingDetailBlock** | full meeting | + RSVP-aware variants | MOB-060 | — |
| **RSVPControl** | RSVP UI | not-responded / going / not-going / locked | MOB-062 | — |
| **LocationPrivacyNotice** | privacy explainer | before-approval / approved-intro / member | везде, где location surfaces | копи объясняют staged reveal (Инв. 1) |
| **LocationRevealSection** | exact location display | intro-scoped / member-upcoming | MOB-061 | scoped reveal; **no live location** (Инв. 9) |
| **AttendanceStatusBanner** | attendance | attended / no-show (host view only) | Circle Home (host), Meeting Detail | no-show **internal** (Инв. 3); not user-facing |

### 8.6 Membership Components

| Component | Purpose |
|---|---|
| **RequestPlaceModal** | submit запрос |
| **IntroNoteInput** | textarea ≤500 chars |
| **MembershipPendingBanner** | state на Circle Detail / My Circles |
| **IntroApprovedBanner** | intro invitation state |
| **MemberStatusBanner** | member confirmation |
| **PauseParticipationModal** | pause flow |
| **LeaveCircleModal** | leave flow |
| **EndParticipationModal** | host removal (с reason categories) |
| **RequestCard** | item в Membership Requests queue (host) |
| **RequestDetailPanel** | safe applicant context |

Safety notes: все non-stigmatizing copy; no public labels; reason categories internal (Инв. 12, 4).

### 8.7 Trust / Safety

| Component | Variants | Safety notes |
|---|---|---|
| **VerificationBadge** | email / phone / identity (P1) | badge only, не число (Инв. 3) |
| **ReliableMemberBadge** | soft trust signal | positive only (Инв. 10) |
| **HostedBeforeBadge** | host history badge | positive only |
| **AttendedEventsBadge** | participation badge | positive only |
| **SafetyNotice** | inline safety хинт | non-fear-based |
| **ReportCTA** | report action | везде где relevant (Инв. 6) |
| **BlockCTA** | block action | везде где relevant |
| **ModerationStatusBadge** | content under review | internal-facing; soft copy for user |

### 8.8 Chat

| Component | Purpose | Safety notes |
|---|---|---|
| **CircleChatMessage** | message bubble | no DM CTA в message actions |
| **SystemMessage** | lifecycle / system | non-shaming копи |
| **MessageActionSheet** | actions на message | Report + Block sender (no «message user»!) |
| **ReportMessageModal** | report flow | no description в analytics |
| **ChatFrozenBanner** | admin freeze | non-shaming explainer |
| **NoChatAccessState** | 403 state | calm copy |

### 8.9 Empty / Error

- NoCirclesEmptyState;
- NoRequestsEmptyState (host);
- NoMeetingsEmptyState;
- NoChatAccessState;
- AccessDeniedState;
- CircleRemovedState;
- ModerationPendingState.

---

## 9. Mobile Screen List v2

Полный inventory с per-screen описанием.

### 9.1 Guest / Auth

| ID | Screen | Flow | Role | Purpose | Key content | Primary actions | Secondary actions | Variants | Safety notes |
|---|---|---|---|---|---|---|---|---|---|
| MOB-001 | Welcome | FLOW-001 | Guest | landing | brand, value, CTAs | Sign up, Login, Invite | Waitlist | first-time / returning | non-stigmatizing |
| MOB-002 | Login | FLOW-001 | Guest | authenticate | email / OAuth | Login | Recover | error | no enumeration |
| MOB-003 | Signup | FLOW-001 | Guest | new account | email / OAuth | Sign up | Already have account | error | service role hidden |
| MOB-004 | Invite Code | FLOW-002 | Guest | gate | code field | Validate | Waitlist | error / used | rate-limited |
| MOB-005 | Waitlist Signup | FLOW-002 | Guest | email collection | email | Submit | — | confirmation | minimal PII |
| MOB-006 | Auth Error | FLOW-001 | Guest | error | message | Retry | Help | generic error | no enumeration |

### 9.2 Onboarding

| ID | Screen | Flow | Role | Purpose | Safety notes |
|---|---|---|---|---|---|
| MOB-010 | Onboarding Welcome | FLOW-003 | User | set expectations | мини-explainer о circles, no dating, no DMs |
| MOB-011 | Safety Principles | FLOW-003 | User | required gate | accept-to-continue |
| MOB-012 | Basic Profile | FLOW-003 | User | name, age band | no exact PII |
| MOB-013 | City / Area | FLOW-003 | User | location | **area only** (Инв. 9) |
| MOB-014 | Interests | FLOW-003 | User | curated list | no attractiveness framing |
| MOB-015 | Vibe | FLOW-003 | User | **primary signal** | curated tags; no dating-coded |
| MOB-016 | Rhythm | FLOW-003 | User | weekly / biweekly / monthly / flexible | — |
| MOB-017 | Comfort Composition | FLOW-003 | User | open mixed / female-friendly / women-only / no preference | non-fear-based copy («комфортный состав») |
| MOB-018 | Group Size | FLOW-003 | User | 4–6 / 6–10 / 10+ | — |
| MOB-019 | Host Willingness | FLOW-003 | User | opt-in | — |
| MOB-020 | Photo | FLOW-003 | User | min 1 photo | AI assistive moderation |
| MOB-021 | Verification Placeholder | FLOW-003 | User | email / phone | level only, no raw score (Инв. 3) |
| MOB-022 | Profile Preview | FLOW-003 | User | preview safe-profile | mirror staged reveal |
| MOB-023 | Onboarding Complete | FLOW-003 | User | celebration → main app | non-pressure CTA |

### 9.3 Circle Discovery / Detail

| ID | Screen | Flow | Role | Purpose | Variants | Safety notes |
|---|---|---|---|---|---|---|
| MOB-030 | Circle Discovery | FLOW-006 | User | feed | empty / loaded / loading | no people; aggregated only |
| MOB-031 | Circle Filters | FLOW-006 | User | refine | open / applied / reset | — |
| MOB-032 | Circle Card Examples | FLOW-006 | User | reference | available / full / requested / waitlisted / intro / member / paused / removed | no exact location |
| MOB-033 | Circle Detail — Not Requested | FLOW-007 | User | inspect | default | aggregated; no exact location; report CTA |
| MOB-034 | Circle Detail — Requested | FLOW-007 | User | pending state | banner | non-stigmatizing |
| MOB-035 | Circle Detail — Waitlisted | FLOW-007 | User | wait | banner | soft copy |
| MOB-036 | Circle Detail — Intro Approved | FLOW-007, FLOW-010 | User | intro invite | intro card + meeting | scoped exact location |
| MOB-037 | Circle Detail — Member | FLOW-007, FLOW-013 | Member | full member view | next meeting + chat entry | full access per policy |
| MOB-038 | Circle Detail — Full | FLOW-007 | User | full state | waitlist offer if allowed | non-stigmatizing |
| MOB-039 | Circle Detail — Paused | FLOW-007 | User / Member | circle paused | banner | — |
| MOB-040 | Circle Detail — Removed for Safety | FLOW-007 | User / Member | safety removal | generic safe copy | no sensitive details (Инв. 4 audit, not user visibility) |

### 9.4 Request / Membership

| ID | Screen | Flow | Purpose | Safety notes |
|---|---|---|---|---|
| MOB-050 | Request Place Modal | FLOW-008 | submit request | rate-limited |
| MOB-051 | Intro Note | FLOW-008 | optional textarea ≤500 | не «вступительное эссе» |
| MOB-052 | Membership Pending | FLOW-008 | state screen | non-stigmatizing |
| MOB-053 | Verification Required | FLOW-008 | gate | соответствует policy timing |
| MOB-054 | Profile Completion Required | FLOW-008 | gate | non-pressure copy |
| MOB-055 | Waitlist Offer | FLOW-008 | optional waitlist | soft offer |
| MOB-056 | Not This Time | FLOW-009, FLOW-012 | soft rejection | «Не в этот раз» (private) |
| MOB-057 | Become Member Confirmation | FLOW-012 | success | welcome to My Circles |

### 9.5 Meetings

| ID | Screen | Flow | Purpose | Safety notes |
|---|---|---|---|---|
| MOB-060 | Meeting Detail | FLOW-011 | full meeting | location per access policy |
| MOB-061 | Meeting Location Reveal | FLOW-010, FLOW-011 | exact location | scoped per state; no live (Инв. 9) |
| MOB-062 | RSVP | FLOW-011 | choose response | — |
| MOB-063 | Meeting Reminder | FLOW-011 | push preview / in-app | **no exact location в push copy** (Инв. 1) |
| MOB-064 | Meeting Completed | FLOW-011 | post-meeting | — |
| MOB-065 | Attendance Confirmation | FLOW-011 | host UI | no-show internal (Инв. 3) |

### 9.6 My Circles / Belonging

| ID | Screen | Flow | Purpose | Safety notes |
|---|---|---|---|---|
| MOB-070 | My Circles | FLOW-013 | home для members | belonging mode primary surface |
| MOB-071 | Circle Home | FLOW-013 | per-circle hub | next meeting + chat preview |
| MOB-072 | Circle Chat Preview | FLOW-013 | inline preview | — |
| MOB-073 | Pause Participation | FLOW-015 | modal + flow | low-drama copy |
| MOB-074 | Leave Circle | FLOW-016 | modal + flow | private; no public label (Инв. 12) |
| MOB-075 | Paused State | FLOW-015 | post-pause | return option |

### 9.7 Host

| ID | Screen | Flow | Purpose | Safety notes |
|---|---|---|---|---|
| MOB-080 | Create Circle Start | FLOW (Host flow) | step 1 | — |
| MOB-081 | Circle Details Form | (Host flow) | title / theme | AI assistive |
| MOB-082 | Vibe / Rhythm Setup | (Host flow) | vibe + rhythm | curated |
| MOB-083 | Comfort Composition Setup | (Host flow) | composition | gated на validation |
| MOB-084 | First Meeting Setup | (Host flow) | schedule | exact location protected |
| MOB-085 | Circle Preview | (Host flow) | safe view preview | mirror safe |
| MOB-086 | Publish Confirmation | (Host flow) | publish | lifecycle transition |
| MOB-087 | Host Circle Dashboard | FLOW-009 | management hub | host-only |
| MOB-088 | Membership Requests | FLOW-009 | queue | safe applicant context |
| MOB-089 | Request Detail | FLOW-009 | review | no raw trust |
| MOB-090 | Approve for Intro | FLOW-009 | action | fit-protection copy |
| MOB-091 | Not This Time (Host) | FLOW-009 | soft-reject UI | non-shaming |
| MOB-092 | Member Management | FLOW-017 | members list (host) | reason categories private |
| MOB-093 | End Participation | FLOW-017 | host removal | private notification |

### 9.8 Chat

| ID | Screen | Flow | Purpose | Safety notes |
|---|---|---|---|---|
| MOB-100 | Circle Chat | FLOW-014 | group chat | no DM CTA |
| MOB-101 | Message Actions | FLOW-014 | long-press menu | Report + Block sender only (no «write») |
| MOB-102 | Report Message | FLOW-021 | report flow | no description в analytics |
| MOB-103 | Chat Frozen | FLOW-014, FLOW-022 | frozen state | non-shaming |
| MOB-104 | No Chat Access | FLOW-014 | 403 | calm copy |

### 9.9 Profile / Safety

| ID | Screen | Flow | Purpose | Safety notes |
|---|---|---|---|---|
| MOB-110 | My Profile | FLOW-004 | own profile | edit affordances |
| MOB-111 | Edit Profile | FLOW-004 | edit | AI assistive |
| MOB-112 | Public Safe Profile | FLOW-005 | safe view | no raw trust; no other circles (Инв. 13) |
| MOB-113 | Report User | FLOW-019 | report flow | reporter protected |
| MOB-114 | Report Circle | FLOW-020 | report flow | privacy |
| MOB-115 | Report Meeting | FLOW-020 | report flow | priority if starting_soon |
| MOB-116 | Report Submitted | FLOW-019/020/021 | confirmation | non-stigmatizing |
| MOB-117 | Block User Confirmation | FLOW-018 | confirm | no notify blocked |
| MOB-118 | Blocked State | FLOW-018 | post-block | — |

### 9.10 Settings

| ID | Screen | Flow | Purpose | Safety notes |
|---|---|---|---|---|
| MOB-130 | Settings | FLOW-013, FLOW-025 | settings hub | — |
| MOB-131 | Privacy | FLOW-025 | privacy controls | — |
| MOB-132 | Manage Blocked Users | FLOW-018 | block list | unblock action |
| MOB-133 | Data Export | FLOW-025 | request export | P1 baseline |
| MOB-134 | Delete Account | FLOW-025 | account deletion | retention policy disclosed |

---

## 10. Admin Screen List v2

| ID | Screen | Purpose | Key data | Primary actions | Safety / audit notes |
|---|---|---|---|---|---|
| ADM-001 | Admin Login | admin auth | credentials | login | server-side service role (Инв. 12) |
| ADM-002 | Moderation Queue | report queue | list of reports | filter, open | AI assistive (Инв. 5) |
| ADM-003 | Report Detail | report context | original content + AI summary | take action | audit (Инв. 4) |
| ADM-004 | User Detail | user context | safe + internal | restrict / ban / note | privacy |
| ADM-005 | Circle Detail (admin) | circle context | full + reports | remove / archive / freeze | audit (Инв. 4) |
| ADM-006 | Meeting Detail (admin) | meeting context | full + reports | remove meeting | audit (Инв. 4) |
| ADM-007 | Message Detail | chat context | message + surrounding | hide / escalate | snapshot retained |
| ADM-008 | Suspicious Activity Queue | flagged patterns | flag list | review | not auto-enforcement |
| ADM-009 | Audit Logs | history | logs | filter, export | privacy |
| ADM-010 | Admin Action Modal | take action | action + reason | submit | reason required (US-ADM-17) |
| ADM-011 | Restrict User | restrict flow | reason | submit | audit |
| ADM-012 | Ban User | ban flow | reason | submit | force sign-out + audit |
| ADM-013 | Remove Circle | remove circle | reason | submit | members notified neutrally + audit |
| ADM-014 | Remove Meeting | remove meeting | reason | submit | RSVPs voided + audit |
| ADM-015 | Freeze Chat | freeze chat | reason | submit | members see non-shaming state + audit |

---

## 11. Clickable Prototype Scope v2

### 11.1 Prototype A — New User Circle Loop

**Screens:**

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

**Purpose.** Тестируем понимание circle-first loop'а — от welcome до belonging.

### 11.2 Prototype B — Host Circle Flow

```
MOB-080..086 Create Circle
→ MOB-087 Host Circle Dashboard
→ MOB-088 Membership Requests
→ MOB-089 Request Detail
→ MOB-090 Approve for Intro / MOB-091 Not This Time
→ MOB-092 Member Management
```

**Purpose.** Тестируем понимание host'ом fit-protection и membership review.

### 11.3 Prototype C — Safety Flow

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

**Purpose.** Тестируем report / block discoverability.

### 11.4 Prototype D — Admin Moderation Flow

```
ADM-001 Admin Login
→ ADM-002 Moderation Queue
→ ADM-003 Report Detail
→ ADM-004/005/006/007 User / Circle / Meeting / Message Context
→ ADM-010 Action Modal
→ ADM-009 Audit Log
```

**Purpose.** Тестируем moderation loop.

### 11.5 Prototype E — Belonging Mode

```
MOB-070 My Circles
→ MOB-071 Circle Home
→ MOB-060 Meeting Detail
→ MOB-062 RSVP
→ MOB-100 Circle Chat
→ MOB-073 Pause Participation
→ MOB-074 Leave Circle
```

**Purpose.** Тестируем «уже нашёл свой круг» опыт — что Discover не давит, что pause / leave low-drama.

### 11.6 Prototype F — Location Privacy Flow

```
MOB-033 Circle Detail — Not Requested (no exact location)
→ MOB-050 Request Place Modal
→ MOB-052 Membership Pending
→ MOB-036 Circle Detail — Intro Approved
→ MOB-061 Meeting Location Reveal (scoped reveal)
```

**Purpose.** Тестируем staged location reveal — главный safety mechanic.

---

## 12. Priority of Screens

### 12.1 P0 (must draw для первого circle-first прототипа)

- MOB-001 Welcome
- MOB-004 Invite Code
- MOB-011 Safety Principles
- MOB-030 Circle Discovery
- MOB-033 Circle Detail — Not Requested
- MOB-050 Request Place Modal
- MOB-052 Membership Pending
- MOB-036 Circle Detail — Intro Approved
- MOB-061 Meeting Location Reveal
- MOB-100 Circle Chat
- MOB-070 My Circles
- MOB-071 Circle Home
- MOB-080..086 Create Circle (compact)
- MOB-088 Membership Requests
- MOB-089 Request Detail
- MOB-112 Public Safe Profile
- MOB-113 Report User
- MOB-117 Block User Confirmation
- ADM-002 Moderation Queue
- ADM-003 Report Detail

### 12.2 P1 (draw after core loop validates)

- Full onboarding substeps (MOB-010..023 detailed);
- MOB-073 Pause Participation;
- MOB-074 Leave Circle;
- MOB-092 Member Management;
- MOB-062 Meeting RSVP (extended states);
- MOB-065 Attendance Confirmation;
- MOB-131 Privacy Settings;
- ADM-005 Admin Circle Detail (extended);
- ADM-009 Audit Logs.

### 12.3 P2 (не рисовать сейчас, placeholders only)

- mutual opt-in 1:1 (P1 product, P2 prototype-wise);
- crossover circles;
- guest seats;
- seasonal gatherings;
- advanced recommendations;
- B2B / venue tools;
- payments;
- promoted circles.

> **Rule:** P2 экраны рисовать **только как placeholders** в Figma (faded / "coming later"), чтобы не ввести в заблуждение engineering / inspection.

---

## 13. Screen Detail Specs for P0

Подробные спеки для ключевых P0 экранов. Каждая спец: layout sections, content, primary CTA, secondary CTA, empty / error states, safety / trust cues, prototype links.

### 13.1 MOB-001 Welcome

- **Layout sections:** brand mark, hero copy (один-liner), value props (3 bullet), CTAs.
- **Content:** «Антидот — пространство доверительных социальных кругов» (working copy).
- **Primary CTA:** «Зарегистрироваться» (or «У меня есть код»).
- **Secondary CTA:** «Войти» · «Встать в waitlist».
- **States:** first-time / returning.
- **Safety / trust cues:** упоминание safety + no-dating tone subtle.
- **Prototype links:** → Invite Code / Login / Signup / Waitlist.

### 13.2 MOB-011 Safety Principles

- **Layout sections:** title, list of principles, accept CTA.
- **Content:** circles core principles + invariants (как они влияют на пользователя).
- **Primary CTA:** «Принять и продолжить».
- **States:** required gate (нельзя скип).
- **Safety / trust cues:** explicit + warm tone (не пугать).
- **Prototype links:** → next onboarding step.

### 13.3 MOB-030 Circle Discovery

- **Layout sections:** header (city + filter chips), filters drawer, circle cards list, empty state.
- **Content:** circle cards с vibe / rhythm / area / size / comfort composition.
- **Primary CTA:** tap → Circle Detail.
- **Secondary CTA:** filters.
- **States:** loaded / loading / empty / network error.
- **Safety / trust cues:** location privacy notice header («показан только примерный район»).
- **Prototype links:** → Circle Detail (MOB-033).

### 13.4 MOB-032 Circle Card

- **Layout sections:** vibe tag row, title, host snippet, area + rhythm row, comfort + size badges, next meeting summary (area only).
- **Variants:** available / full / requested / waitlisted / intro / member / paused / removed.
- **Safety / trust cues:** no people grid; no exact location; aggregated only.
- **Prototype links:** → Circle Detail (variant-aware).

### 13.5 MOB-033 Circle Detail — Not Requested

- **Layout sections:** header (title, vibe), theme block, host info block (safe-profile snippet), rhythm + size + comfort row, area-only location notice, approval-as-fit-protection explainer block, next meeting summary, request CTA, report CTA.
- **Content:** explainer copy «Подтверждение нужно, чтобы сохранить формат и комфорт круга — не для оценки людей.» (Core v2 §19).
- **Primary CTA:** «Запросить место».
- **Secondary CTA:** «Пожаловаться на круг».
- **States:** default; full (CTA disabled); paused; removed_for_safety.
- **Safety / trust cues:** **no exact location**, **no full member list**, **fit-protection framing**.
- **Prototype links:** → Request Place Modal (MOB-050) или Report Circle (MOB-114).

### 13.6 MOB-050 Request Place Modal

- **Layout sections:** modal title, brief explainer, intro-note textarea (optional ≤500 chars), submit CTA, cancel.
- **Content:** «Хост рассмотрит ваш запрос. Это не оценка — это про формат круга.»
- **Primary CTA:** «Запросить место».
- **Secondary CTA:** «Отмена».
- **States:** default / submitting / rate-limited error.
- **Safety / trust cues:** rate-limit copy soft; non-anxiety pending message.
- **Prototype links:** → Membership Pending (MOB-052).

### 13.7 MOB-052 Membership Pending

- **Layout sections:** circle header, pending banner, area-only summary, cancel-request option, link back to discover.
- **Content:** «Запрос у хоста. Мы напишем, когда есть ответ.»
- **Primary CTA:** none (passive state).
- **Secondary CTA:** «Отменить запрос».
- **States:** pending / waitlisted (MOB-035) / approved-intro (MOB-036) / not-this-time (MOB-056).
- **Safety / trust cues:** non-stigmatizing wait copy.
- **Prototype links:** → other detail variants.

### 13.8 MOB-036 Circle Detail — Intro Approved

- **Layout sections:** circle header, **Intro Invitation banner**, meeting card (one intro meeting), exact location section (scoped), RSVP control, (опц.) meeting-context chat entry per policy.
- **Content:** «Вы приглашены на первую встречу. Точные детали ниже.»
- **Primary CTA:** RSVP «Буду».
- **Secondary CTA:** RSVP «Не смогу».
- **States:** RSVP not-responded / going / not-going / meeting cancelled / removed.
- **Safety / trust cues:** exact location **только для этой встречи**, scoped notice.
- **Prototype links:** → Meeting Location Reveal (MOB-061), → Circle Chat (MOB-100, если policy allows).

### 13.9 MOB-061 Meeting Location Reveal

- **Layout sections:** meeting summary, **exact location** card (address / map crop / venue note), arrival instructions optional, scoped privacy notice.
- **Content:** «Это место круга. Не делитесь публично.» (gentle, не пугать).
- **Primary CTA:** «Открыть в картах» (or «Поделиться» — внутри круга, не публично).
- **States:** scoped-intro / member-upcoming / cancelled / removed.
- **Safety / trust cues:** **no live location** (Инв. 9), scoped reveal (Инв. 1), no exact location в push copy.
- **Prototype links:** → Meeting Detail (MOB-060), → Circle Chat (MOB-100).

### 13.10 MOB-100 Circle Chat

- **Layout sections:** header (circle title + chat label), messages list (member messages + system messages + meeting updates), input bar.
- **Content:** message bubbles (member / system / meeting-tagged update).
- **Primary CTA:** send.
- **Secondary CTA:** long-press → Message Actions (MOB-101).
- **States:** active / frozen (MOB-103) / no-access (MOB-104) / removed user 403.
- **Safety / trust cues:** **no «message user» CTA**, no DM entry; Report and Block sender available.
- **Prototype links:** → Message Actions; → Report Message (MOB-102); → Block User (MOB-117).

### 13.11 MOB-070 My Circles

- **Layout sections:** header «Мои круги», list of circle cards (each with next-meeting summary, unread chat indicator, RSVP status), discover-shortcut link.
- **Content:** list per active membership.
- **Primary CTA:** tap circle → Circle Home.
- **Secondary CTA:** «Найти ещё круг» (soft, non-pressure).
- **States:** ≥1 circle / 0 circles (redirect к Discovery) / has-paused / has-intro-pending.
- **Safety / trust cues:** **no nag** «у тебя 1 круг, добавь ещё»; belonging mode UX.
- **Prototype links:** → Circle Home (MOB-071), → Pause (MOB-073), → Leave (MOB-074).

### 13.12 MOB-071 Circle Home

- **Layout sections:** circle header, **next meeting card** prominent, recent chat preview block, members list (safe profiles), pause / leave entry в settings menu.
- **Content:** next meeting + RSVP state.
- **Primary CTA:** RSVP / open chat / open meeting.
- **Secondary CTA:** notifications, pause, leave.
- **States:** member / paused / intro-approved (limited view).
- **Safety / trust cues:** full member access per policy; no raw trust.
- **Prototype links:** → Meeting Detail (MOB-060), → Circle Chat (MOB-100), → Pause (MOB-073), → Leave (MOB-074).

### 13.13 MOB-080..086 Create Circle (compact spec)

- **Multi-step flow:** Start → Details Form → Vibe/Rhythm → Comfort → First Meeting → Preview → Publish.
- **Primary CTA each step:** «Далее».
- **Final CTA:** «Опубликовать круг».
- **Safety / trust cues:** AI assistive moderation на текстах; exact location protected; comfort composition disclaimer; rule against dating / nightlife wording.
- **Prototype links:** → Host Circle Dashboard (MOB-087) после publish.

### 13.14 MOB-089 Request Detail

- **Layout sections:** safe applicant block (name, photo, vibe overlap, verification badge, intro-note text), action row (Approve for intro / Approve as member if policy / Soft-reject / Waitlist).
- **Content:** safe context; no raw trust; no other circles of applicant.
- **Primary CTA:** «Подтвердить на первую встречу».
- **Secondary CTA:** «Не в этот раз» · «В waitlist».
- **States:** request pending / approved / rejected / waitlisted.
- **Safety / trust cues:** non-shaming soft-reject; AI assist badge (если flagged).
- **Prototype links:** → Approve for Intro (MOB-090), → Not This Time (MOB-091), → Waitlist State.

### 13.15 MOB-112 Public Safe Profile

- **Layout sections:** photo + name + pronouns + verification badge, soft trust badges row, short bio, report / block actions row.
- **Content:** safe fields only.
- **Primary CTA:** none (passive view).
- **Secondary CTA:** Report User · Block User.
- **States:** default / blocked-by-me (invisible variant) / moderation-pending.
- **Safety / trust cues:** **no raw trust score**, **no other circles**, **no «message user»**, **no report/block counts**.
- **Prototype links:** → Report User (MOB-113), → Block User (MOB-117).

### 13.16 MOB-113 Report User

- **Layout sections:** title, reason category select (harassment / impersonation / unsafe behavior / spam / other), optional details textarea, submit / cancel.
- **Content:** «Жалоба видна только модерации. Мы не сообщаем пользователю.»
- **Primary CTA:** «Отправить жалобу».
- **Secondary CTA:** «Отмена».
- **States:** default / submitting / submitted.
- **Safety / trust cues:** reporter protection; description **не в analytics**.
- **Prototype links:** → Report Submitted (MOB-116), opt'ional → Block (MOB-117).

### 13.17 MOB-117 Block User Confirmation

- **Layout sections:** confirmation modal, brief explainer, confirm / cancel.
- **Content:** «Вы больше не увидите этого пользователя. Он не узнает о блокировке.»
- **Primary CTA:** «Заблокировать».
- **Secondary CTA:** «Отмена».
- **States:** default / confirmed.
- **Safety / trust cues:** **block does not notify** blocked user.
- **Prototype links:** → Blocked State (MOB-118).

### 13.18 ADM-002 Moderation Queue

- **Layout sections:** sidebar nav, header (filter chips: priority / type / age), queue list, item summary (target type, reason category, age).
- **Content:** list of open reports with AI-assistive priority signal.
- **Primary CTA:** open report → ADM-003.
- **Secondary CTA:** apply filters.
- **States:** empty / loaded / loading.
- **Safety / trust cues:** AI signal assistive only (Инв. 5).
- **Prototype links:** → Report Detail (ADM-003).

### 13.19 ADM-003 Report Detail

- **Layout sections:** report header (target, reason, age), original content / context, AI summary (assistive), target context links (user / circle / meeting / message), audit log preview, action panel.
- **Content:** all relevant evidence; surrounding messages для message reports.
- **Primary CTA:** open Action Modal (ADM-010).
- **Secondary CTA:** add private note · escalate.
- **States:** new / in-review / action-taken / dismissed / escalated.
- **Safety / trust cues:** snapshot preserved (Инв. 4); audit on every action.
- **Prototype links:** → Action Modal (ADM-010), → User/Circle/Meeting/Message Detail.

---

## 14. Circle Detail State Design

Критический раздел. Каждый variant получает отдельный frame в Figma.

### 14.1 Not Requested

- **Show:** title, vibe, rhythm, approximate area, size / capacity, comfort composition, host safe profile, approval / fit-protection explanation, request place CTA, report circle.
- **Do NOT show:** exact meeting location, full member list, circle chat, private member data.

### 14.2 Requested

- **Show:** request pending banner, approximate area, explanation of host review, cancel request option.
- **Do NOT show:** exact location, chat, full member list.

### 14.3 Waitlisted

- **Show:** waitlist status, approximate area, explanation.
- **Do NOT show:** exact location, chat.

### 14.4 Intro Approved

- **Show:** intro meeting approved banner, **exact location для intro meeting only**, RSVP, meeting details, limited chat access (per policy — open §28).

### 14.5 Member

- **Show:** member banner, next meeting, **exact location для upcoming allowed meeting**, circle chat entry, safe member context, pause / leave options.

### 14.6 Not This Time / Rejected

- **Show:** respectful **private** state, no exact location, no chat, (опц.) suggested other circles.
- **Copy:** «Не в этот раз» или «Постоянное участие не было подтверждено» (depending context).

### 14.7 Paused

- **Show:** participation paused, no active meeting notifications, return-request option if allowed.

### 14.8 Removed

- **Show:** private neutral state. **No public shame** (Инв. 12).

### 14.9 Removed for Safety

- **Show:** safe generic message. **No sensitive details.** Audit на admin side (Инв. 4).

---

## 15. Meeting Location Privacy Design

**Requirements (binding):**

- **exact meeting location никогда не visible** на Circle Card;
- **exact meeting location никогда не visible** на Circle Detail before approval;
- `requested` / `waitlisted` / `rejected` **никогда** не видят exact location;
- intro-approved user видит exact location **только** для этой встречи;
- member видит exact location для upcoming meetings (в окне раскрытия);
- **notifications не leak'ают** exact location non-approved пользователям;
- maps (если используются) — show approximate area only before approval;
- **analytics не содержат** exact location.

### 15.1 Sample Russian copy (для Figma)

- «Точное место встречи будет доступно после подтверждения.»
- «Вы приглашены на первую встречу — теперь доступны точные детали.»
- «Пока вы видите только примерный район.»
- «Точное место доступно участникам круга.»
- «Не делитесь точным местом публично.» (soft tip)

---

## 16. Composition Visibility Design

**Before request:**

- show **aggregate composition only**;
- no full member list;
- **no people-shopping grid.**

**After approval / member:**

- show safe member profiles **per policy**;
- **no raw trust score**;
- **no report / block counts**;
- **no other circles** (для других участников);
- no private / internal data.

### 16.1 Sample copy

- «Состав круга прозрачен для участников после подтверждения.»
- «До подтверждения показывается только общий формат круга.»
- «Комфортный состав: mixed / female-friendly / women-only.»

---

## 17. Approval / Fit Protection UX

**Design requirements:**

- избегать harsh rejection states;
- объяснять small group size;
- объяснять comfort / rhythm protection;
- сделать «request place» softer чем «apply»;
- избегать «selected / rejected» language.

### 17.1 Preferred copy

- «Запросить место»
- «Организатор помогает сохранить формат и комфорт круга.»
- «Не в этот раз»
- «Это не отображается в вашем профиле.»
- «Подтверждение нужно, чтобы сохранить формат круга — не для оценки людей.»

### 17.2 Avoid

- ~~«Отклонено»~~
- ~~«Вы не подошли»~~
- ~~«Вас исключили»~~

---

## 18. Pause / Leave / Removal UX

**Design requirements:**

- pause **before** hard exit;
- private state;
- **no public labels**;
- **no betrayal mechanics**;
- neutral notifications.

### 18.1 Sample copy

| Action | Copy |
|---|---|
| Pause | «Поставить участие на паузу?» |
| Leave | «Выйти из круга?» |
| Private removal notification | «Участие в круге завершено.» |
| Other members see | «Состав круга обновился.» |
| Not-confirmed after intro | «Постоянное участие не было подтверждено.» |

---

## 19. Circle Chat UX

**Requirements:**

- **circle chat only**;
- **no open 1:1**;
- **no «message user» CTA**;
- message report available;
- blocked user handling clear;
- **no dating-style** communication prompts (reactions с сердцами, «liked your message» и т.п. — запрещено).

### 19.1 Copy

- «Чат круга»
- «Чат доступен участникам круга.»
- «Если что-то вызывает дискомфорт, вы можете пожаловаться или заблокировать пользователя.»

---

## 20. Trust / Safety UX Cues

### 20.1 Allowed cues

- **Проверен**
- **Надёжный участник**
- **Уже проводил встречи**
- **Участвовал во встречах**
- Location privacy notice
- Approval required / confirmation needed
- Report / block actions
- Safety principles reminder
- Moderation pending (внутри admin)
- Audit log entries (admin)

### 20.2 Forbidden cues

- ~~raw trust score (число)~~
- ~~public ratings~~
- ~~public negative badges~~
- ~~popularity labels («популярный круг»)~~
- ~~dating compatibility~~
- ~~«top member»~~
- ~~«low trust»~~

---

## 21. Russian Copy Guidelines v2

### 21.1 Tone

- warm;
- clear;
- modern;
- urban;
- premium but simple;
- socially alive;
- safety-forward;
- **not romantic**;
- **not bureaucratic**.

### 21.2 Preferred terms

| Term | Use |
|---|---|
| **Круг** | core primitive (user-facing) |
| **Встреча круга** | meeting |
| **Запросить место** | apply equivalent |
| **Организатор** | circle host (RU) |
| **Участник** | circle member |
| **Чат круга** | circle chat |
| **Примерный район** | approximate area |
| **Точное место встречи** | exact meeting location |
| **Комфортный состав** | comfort composition |
| **Поставить участие на паузу** | pause |
| **Не в этот раз** | soft rejection |

### 21.3 Avoid

- event marketplace tone («ярмарка», «больше событий в твоём городе»);
- dating language («match», «chemistry», «spark», «понравился человек», «выбрали лучших»);
- harsh rejection («отклонено», «не подошёл»);
- bureaucratic safety copy («заявка подана в систему модерации»);
- «выбирай из 100+ событий»;
- «свайпай» / любая swipe-related терминология.

---

## 22. Empty States v2

| Empty state | Message | CTA | Safety / trust note |
|---|---|---|---|
| No circles nearby | «Пока кругов рядом нет. Расширьте фильтры или попробуйте другой район.» | «Изменить фильтры» | non-stigmatizing |
| No circles joined yet | «У вас пока нет кругов. Найдём подходящий?» | «Открыть Discover» | non-pressure |
| No membership requests yet (host) | «Запросов пока нет — это нормально для нового круга.» | — | calm |
| No upcoming meetings | «Пока следующая встреча не назначена.» | (host) «Запланировать» | — |
| No chat messages | «Здесь будут сообщения круга.» | — | — |
| No reports (admin) | «Новых жалоб нет.» | — | — |
| Circle full | «Этот круг сейчас полон.» | «В waitlist» если разрешено | non-stigmatizing |
| Circle paused | «Круг сейчас на паузе.» | — | — |
| Waitlist joined | «Вы в waitlist. Мы напишем, когда появится место.» | — | non-anxiety |
| Not looking for new circles (P1) | «Вы не ищете новые круги. Discover доступен в один тап.» | (toggle off если хочется) | belonging mode |
| No access to chat | «Чат доступен участникам круга.» | (если pending) «Запрос у хоста» | calm |
| No access to meeting location | «Точное место доступно после подтверждения.» | — | Инв. 1 |

---

## 23. Error States v2

| Error state | User message | Recovery | Safety note |
|---|---|---|---|
| Invalid invite code | «Этот код недействителен.» | «Встать в waitlist» | rate-limit |
| Auth error | «Не получилось войти. Попробуйте ещё раз.» | retry | no enumeration |
| Profile incomplete | «Заполните профиль, чтобы запросить место.» | «Дозаполнить» | non-pressure |
| Verification required | «Подтвердите телефон, чтобы запросить место.» | «Подтвердить» | per policy |
| Circle full | «Этот круг сейчас полон.» | «В waitlist» | — |
| Circle paused | «Круг на паузе.» | — | — |
| Request already submitted | «Вы уже запросили место.» | (back to detail) | — |
| User restricted | «Действие временно ограничено.» | (см. Settings) | audit на admin side |
| Banned access denied | «Доступ к Antidot закрыт.» | — | non-deep-stigma (Инв. 12) |
| Cannot access meeting location | «Точное место будет доступно после подтверждения.» | — | Инв. 1 |
| Cannot access circle chat | «Чат доступен участникам круга.» | — | — |
| Report submission failed | «Не получилось отправить жалобу. Попробуйте ещё раз.» | retry | — |
| Blocked user interaction | (UI hides target) | — | block does not notify |

---

## 24. State Variants to Design

### 24.1 Buttons

- default;
- pressed;
- loading;
- disabled;
- destructive.

### 24.2 Circle Card

- available;
- full;
- requested;
- waitlisted;
- intro approved;
- member;
- paused;
- removed.

### 24.3 Membership Status

- none;
- requested;
- waitlisted;
- rejected;
- approved_for_intro;
- member;
- paused;
- removed.

### 24.4 Meeting

- scheduled;
- starting soon;
- RSVP going;
- RSVP not going;
- completed;
- cancelled;
- removed.

### 24.5 Chat

- active;
- frozen;
- no access;
- removed user;
- paused user.

### 24.6 Admin Report

- new;
- in review;
- action taken;
- dismissed;
- escalated.

---

## 25. Prototype Testing Script v2

### 25.1 Testing goals

Участники должны понимать:

- **что такое круг** (не разовое событие, не группа в Telegram);
- что это **не dating**;
- как работает **request / place**;
- **зачем существует approval** (fit protection);
- **когда** раскрывается exact location;
- что **chat — circle-based**, не direct;
- **где** report / block;
- что значит **My Circles** (belonging);
- что **belonging is success**.

### 25.2 Tasks

1. Открой Welcome — объясни, **что это за продукт**.
2. **Найди круг.**
3. **Открой circle detail.**
4. **Запроси место.**
5. Объясни, **что значит pending state.**
6. Дойди до **intro approved** state.
7. Объясни, **когда появляется exact location.**
8. **Открой circle chat.**
9. Стань **member** / открой **My Circles**.
10. Найди **report / block.**
11. Как host — **рассмотри request.**
12. Как admin — **обработай report.**

### 25.3 Questions

- Что это за продукт?
- Это dating app?
- Что такое круг?
- Что значит «запросить место»?
- Зачем host подтверждает?
- Когда видно точное место встречи?
- Можешь ли ты написать кому-то напрямую?
- Где report / block?
- Что произойдёт, если ты перестанешь искать круги?
- Чувствуется ли продукт безопасным?
- Не чувствуется ли продукт слишком эксклюзивным?

### 25.4 Validation focus (приоритетно)

- copy approval-as-fit-protection (US-ONB-15, US-CIRC-09, US-REQ-08, US-INTRO-06) — резонирует ли;
- comfort composition / women-only copy (§21 PRD validation, §28 #5 below);
- recurring commitment perception (не пугает ли);
- belonging mode comprehension;
- что «нет direct message» — это **дизайн-намерение**, не недостаток.

---

## 26. Figma Build Order v2

Рекомендованный порядок реализации:

1. **Cover / Product Context v2** (00).
2. Update **foundations** if needed (01).
3. Update **core components** (02): Button, Input, Badge, Empty/Error.
4. **CircleCard** (02) — главный component для discovery.
5. **Circle Detail states** (04, 13.5–14): not-requested, requested, waitlisted, intro-approved, member, paused, full, removed.
6. **Request Place flow** (04, 11.1): MOB-050 → MOB-052.
7. **Intro Meeting Approved / Location Reveal** (05, 11.6): MOB-036 → MOB-061.
8. **Circle Chat** (05, 13.10): MOB-100 + variants (MOB-101..104).
9. **My Circles / Circle Home** (05): MOB-070 + MOB-071.
10. **Host Membership Review** (06): MOB-087..091.
11. **Report / Block** (07): MOB-112..118.
12. **Admin Moderation** (09): ADM-002..010.
13. **Prototype links** (10).
14. **Test notes** (11).

---

## 27. Handoff Notes for Engineering

- **P0 screens** — list из §12.1; engineering должен видеть только их как «implementation-ready» после Sprint 2 phase gate ([`/docs/22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md`](22_PHASE_GATE_TO_AUTH_BETA_ONBOARDING.md), to be authored).
- **Required states** — §24.
- **Safety-critical states** — Circle Detail variants (§14), Location Reveal (§15), No Chat Access (MOB-104), Removed for Safety (MOB-040).
- **Components reused** — §8 inventory; binds к `/packages/ui` token namespace.
- **Copy strings** — §17, §18, §19, §21, §22, §23.
- **Analytics events** — see [`/docs/03_USER_FLOWS.md`](03_USER_FLOWS.md) §12 (Analytics Event Map v2).
- **Data needed per screen** — per-screen tables в §9, §10.
- **What is mocked vs future backend** — все API-driven данные mocked в P0 прототипе; backend подключается **после** соответствующих миграций ([`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) v2, [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md) v2 — пока в v0.1, migration sequenced в [doc 27](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)).

### 27.1 Warnings (binding)

- **Не реализовывать** old event-first screens (event detail, apply modal, event chat — superseded).
- **Не добавлять** people marketplace (Инв. 13).
- **Не добавлять** open DMs (Инв. 2; CLAUDE.md §10).
- **Не показывать** exact location до approved access (Инв. 1).
- **Не показывать** raw trust score (Инв. 3).
- **Не добавлять** public ratings (Hard rule 5).
- **Не добавлять** dating mechanics (Hard rule 6).

---

## 28. Open Design Questions

1. **Visual distinction circle vs meeting** — как одним взглядом понимать иерархию (круг как контейнер, встреча как событие внутри)?
2. **Vibe presentation** — как показать vibe без elitist-ощущения?
3. **Comfort composition presentation** — иконки / цвета / копи?
4. **Women-only / female-friendly wording** — валидация с женщинами (§21 PRD validation; §14 #5 Flows v2).
5. **Intro-approved chat access** — meeting-context only / full read-only / muted? (Flows v2 §14 #4)
6. **Member list visibility timing** — до intro / после intro / после первой встречи? (PRD v2 §27 #8)
7. **My Circles vs Discover priority** — replaces Discover полностью или Discover остаётся 1 tap away? (Flows v2 §14 #19)
8. **Pause / Leave UX softness** — modal copy variants для теста.
9. **«Не в этот раз» visual treatment** — нейтральный? тёплый? чтобы не shame.
10. **Социальная температура alive vs chaos** — как держать «живым» без dating-coded аффордансов?
11. **Safety без bureaucracy** — где грань между prominent и suffocating?
12. **Figma v2 prototype scope** — minimum viable что'бы тестировать? (предполагается §12.1 P0 list).
13. **Approval-as-fit-protection** — точный visual + copy treatment (§17.1).
14. **Onboarding rhythm** — сколько шагов одобрит пользователь без отвала? subset фактической миграции.

---

## 29. Summary

- **Figma Prototype Plan v2** переводит прототип с event-first на **circle-first**.
- **Primary UX object** — Circle.
- **Meetings — operational instances** под circles.
- **Core flows** теперь тестируют **belonging**, не просто attendance.
- **Safety / location / privacy** остаются центральными (16 invariants, §3 принципы).
- **Existing v1 prototype** — visual base only; **не source of truth** для UI.
- **Implementation freeze** в силе до завершения migration ([`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)).

**Next document:** [`/docs/13_DESIGN_HANDOFF.md`](13_DESIGN_HANDOFF.md) должен быть обновлён до **Design Handoff v2** (по [doc 27 §24 step 6 продолжение / §6 Phase B](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)). После этого по сequence — Phase C технические доки (Schema, RLS, Trust, Moderation, Analytics) и Phase D delivery doc (Backlog, Phase Gate, CLAUDE.md update).

---

> Reminder: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2) — **first source of truth**. Этот документ ему, PRD v2, User Stories v2 и User Flows v2 подчинён. Любой Figma artifact / screen design / engineering implementation должен ссылаться на screen IDs (MOB-NNN / ADM-NNN), FLOW IDs и Story IDs.
