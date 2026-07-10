# Moderation & Safety Operations v2 — Antidot

> **Status:** v2 (moderation & safety operations blueprint для closed beta, **circle-first**).
> **Owner:** Safety / Product / Backend
> **Last updated:** 2026-05-31
> **First source of truth:** [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2).
> **Schema source:** [`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) §12 (`user_blocks`, `reports`, `suspicious_activity_events`), §13 (`moderation_actions`, `audit_logs`), §14 (trust tables).
> **Security source:** [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §18 (Block), §19 (Report), §20 (Moderation & Audit), §21 (Trust).
> **Trust source:** [`/docs/08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md) (Trust v2).
> **Supersedes:** Moderation v1 (event-first, 2026-05-18).
> **Sequenced by:** [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md) §24 Phase C step 10.

> ⚠️ **Это documentation task only.** Никакой moderation логики не реализовано как код. Никаких database changes. Никаких AI SDK подключений. Никаких admin dashboard implementations. Старая event-first moderation модель — **superseded**.

---

## 1. Source of Truth

- **Product Core v2** ([`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md)) — first source of truth.
- Moderation v2 следует **HYBRID ACCEPT** ([`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md)).
- **User-facing primitive** — Circle / Круг.
- **Operational primitive** — Meeting / Встреча круга.
- **Старая event-first moderation модель superseded.** Любые v1 формулировки (event reports, event chat moderation, event host abuse, event removal, event applications, attendee removal, event safety) трактуются как **circle / meeting** аналоги (см. §0 ниже).
- **AI is assistant, not judge** (Инв. 5). AI триажит, суммаризирует, флагает — но не выносит финальные serious enforcement решения.
- **Serious enforcement** должен быть human / admin reviewable.
- **Moderation не создаёт public shame** (Инв. 12).
- **Moderation не создаёт betrayal mechanics** (Инв. 11).
- Документ — основа будущего admin dashboard, reports, AI triage, audit logs и safety operations. **SQL / migrations / код не создаются.**
- Открытые вопросы — в [§44 Open Moderation Questions](#44-open-moderation-questions). При конфликте с Core v2 — приоритет у Core v2 (CLAUDE.md §3).

### 0. Vocabulary update (v1 → v2)

| Старое (v1, superseded) | Новое (v2, binding) |
|---|---|
| event report | **circle report** + **meeting report** |
| event chat moderation | **circle chat moderation** |
| event host abuse | **circle host abuse** |
| event removal | **circle removal + meeting removal** |
| event application | **membership request** |
| attendee removal | **membership removal** |
| event safety | **circle safety + meeting safety** |

> Если где-то в инструментах / queue UI / Edge Function идентификаторах ещё встречаются старые `event_*` имена — это **transitional / internal**; user-facing copy и новые поверхности должны использовать v2 vocabulary.

---

## 2. Moderation Goals v2

1. **Защитить пользователей** во время повторяющихся офлайн-взаимодействий в кругах.
2. **Предотвратить harassment, spam, scams** и unsafe behavior.
3. **Защитить meeting location privacy** (Инв. 1).
4. **Защитить пользователей** от open DM / cold outreach dynamics (Инв. 2).
5. **Предотвратить people marketplace behavior** (Инв. 13).
6. **Сделать report / block** легко доступными (Инв. 6).
7. **Дать admin'у** достаточно контекста по user / circle / meeting / message.
8. **Быстро обработать** unsafe circles и unsafe meetings.
9. **Обработать host abuse** и membership removal abuse.
10. **Аккуратно обработать** comfort composition violations (Core v2 §21).
11. **Предотвратить public shame** при rejection / removal / leaving (Инв. 11, 12).
12. **Поддержать trust system** без social credit (Инв. 10).
13. **Использовать AI** для triage / summarization, но **не для final judgment** (Инв. 5).
14. **Логировать все moderation-sensitive actions** (Инв. 4).
15. **Поддержать closed beta** с manual safety operations.

---

## 3. Moderation Non-Goals

MVP moderation **НЕ** включает:

- полностью авто permanent bans без human review;
- legal case management;
- public dispute threads;
- public user ratings;
- public negative labels;
- public removal / rejection history;
- dating compatibility policing;
- advanced fraud ML;
- payment / ticket fraud review;
- large marketplace dispute resolution;
- public transparency reports;
- open DM moderation at scale (no open DMs in MVP — Инв. 2);
- follower / fan / community creator moderation;
- enterprise abuse investigation tooling;
- automated dating-style policing.

---

## 4. Moderation Philosophy v2

Принципы (binding):

- **Safety — это product quality**, а не скрытый admin функционал (Инв. 7).
- **Reports — сигналы, не доказательство.** Один report не вина (§8).
- **Block — немедленный пользовательский контроль** без ожидания модерации.
- **Moderation actions auditable** (Инв. 4).
- **AI** помогает приоритизировать / суммаризировать / флагать, но **не решает** serious enforcement (Инв. 5).
- **Circle membership не должен создавать public shame** (Инв. 12).
- **Leaving / pausing / removal** — low-drama (Инв. 11).
- **Host power** уравновешен safety review (§29).
- **Пользователю не нужно спорить публично.** Reports / appeals — приватные процессы.
- **Privacy сохраняется** во время moderation (§39).
- **Moderation пропорциональна** (§15).
- **Closed beta — консервативна и review-friendly** (§35).

> **Продукт должен делать безопасную принадлежность проще, небезопасное поведение труднее, а серьёзные нарушения — доступными для разбора.**

---

## 5. Abuse & Risk Taxonomy v2

### 5.1 User Abuse

**Examples:**

- harassment;
- threats;
- inappropriate messages;
- repeated unwanted behavior;
- fake profile;
- impersonation;
- discriminatory behavior;
- stalking-like behavior;
- pressure to move to external channels.

**Severity range:** medium → critical.
**Likely detection:** user report, AI content flags, pattern analysis (`suspicious_activity_events`).
**Expected response:** warn → restrict → ban; protect reporter; audit log.

### 5.2 Circle Abuse

**Examples:**

- unsafe circle description;
- misleading circle vibe;
- fake circle;
- bait-and-switch circle (заявлен один формат, по факту другой);
- circle, который фактически — dating / nightlife / party mechanic (исключено из MVP — Core v2 §26);
- circle, поощряющий risky behavior;
- circle с people-marketplace language (Инв. 13);
- host misuses approval / removal.

**Severity range:** medium → critical.
**Likely detection:** report circle, AI flag описания, manual review при создании, host pattern.
**Expected response:** `pending_review` → host edit / `remove_circle` → restrict host; safe notification members.

### 5.3 Meeting Abuse

**Examples:**

- unsafe meeting location;
- misleading meeting details;
- exact location misuse (опубликована в неположенном поле);
- unsafe arrival instructions;
- meeting moved to risky / off-platform venue;
- last-minute location bait-and-switch;
- meeting, которая отменяется / удаляется по safety reasons.

**Severity range:** high → critical (особенно если meeting starts within 24h).
**Likely detection:** report meeting, AI flag описания, location privacy scan.
**Expected response:** `remove_meeting` / `cancel` → restrict host если нужно → notify approved attendees neutrally → audit log.

### 5.4 Circle Chat Abuse

**Examples:**

- harassment в circle chat;
- spam;
- scam links;
- unsafe requests;
- hate / discriminatory content;
- давление перейти в DM / external channel (Инв. 2 защита);
- sexual / dating-coded pressure (Hard rule 6);
- sharing exact location в публичном / unauthorized context (Инв. 1).

**Severity range:** medium → critical.
**Likely detection:** report message, AI harassment / spam detection, velocity flags.
**Expected response:** `hide_message` → `freeze_chat` → restrict / ban; reporter защищён.

### 5.5 Membership / Host Abuse

**Examples:**

- host **repeatedly removes members** (pattern);
- host использует approval как popularity contest;
- host rejects / removes по discriminatory reasons;
- host просит private contact / payment вне платформы;
- host злоупотребляет comfort composition;
- member repeatedly requests many circles (spam pattern);
- member repeatedly no-shows;
- member вызывает repeated conflict.

**Severity range:** medium → high.
**Likely detection:** reports against host / member, `suspicious_activity_events` (frequent host removals), member feedback signals.
**Expected response:** review host / member; warn → restrict; в severe случаях `remove_circle` или ban; audit log.

### 5.6 Comfort Composition Abuse

**Examples:**

- misrepresenting identity для попадания в women-only круг;
- нарушение female-friendly ожиданий;
- использование comfort composition для discriminate / exclude unfairly;
- создание ложного ощущения absolute safety;
- harassment внутри comfort-specific круга.

**Severity range:** high → critical (в гендер-чувствительных случаях).
**Likely detection:** report `comfort_composition_violation`, member feedback, AI flag описания.
**Expected response:** circle warning → host edit required → restrict host / remove circle; защита reporter; escalation если нужно (Core v2 §21 — validation требуется до полного roll-out).

### 5.7 Privacy / Location Abuse

**Examples:**

- попытка получить доступ к `meeting_locations` без approval (Инв. 1);
- exact location в public circle description / public meeting summary;
- exact location в notification body;
- exact location в analytics events;
- screenshots / leaks pf exact location;
- rejected / removed user утверждает retained location access.

**Severity range:** high → critical.
**Likely detection:** report `location_issue`, AI text scan на address-like content, RLS / observability alerts.
**Expected response:** hide / remove exposed content → revoke access → audit incident → review RLS path → test case → restrict actor.

### 5.8 Public Shame / Social Harm

**Examples:**

- user publicly labeled "rejected" / "removed" / "left";
- "X left for another circle" framing (Инв. 11);
- visible no-show label (Инв. 12);
- betrayal framing в UI / copy;
- removal reason leak'нула members;
- host публично shames member.

**Severity range:** medium → high (binding нарушение Инв. 11, 12).
**Likely detection:** code review, copy review, QA, user report on copy / UX.
**Expected response:** немедленно скрыть / отредактировать; review поверхности; audit; UX research follow-up.

### 5.9 Platform Abuse

**Examples:**

- spam membership requests (rapid-fire к многим circles);
- spam circle creation;
- invite code abuse (enumeration, sharing);
- bot / fake accounts;
- profile scraping;
- message velocity abuse;
- report abuse (mass / retaliatory reports);
- block abuse (mass block to silence target);
- no-show patterns.

**Severity range:** low → high.
**Likely detection:** `suspicious_activity_events`, rate-limit triggers, AI pattern detection.
**Expected response:** rate limit → cooldown → restriction; review pattern.

### 5.10 Admin / Internal Abuse

**Examples:**

- moderation action без reason;
- action без audit log;
- избыточный admin access;
- leak'нувшиеся report details;
- service role misuse;
- AI false positive, повлёкший unfair action.

**Severity range:** high → critical.
**Likely detection:** audit log review, least-privilege checks, internal observability.
**Expected response:** enforce audit / reason; least privilege; revoke admin where needed; internal review.

---

## 6. Moderation Actors v2

### User

**Может:**

- report user;
- report circle;
- report meeting;
- report message;
- block user;
- управлять safety settings;
- получать ограниченные report / action updates.

**Не может:**

- видеть детали reports;
- видеть reporter identity;
- видеть raw trust score других пользователей.

### Circle Member

**Может:**

- report circle / message / member;
- block user;
- report unsafe meeting;
- pause / leave участие;
- поднять concern о composition или host behavior.

**Не может:**

- видеть internal moderation queue;
- bypass safety / audit rules.

### Circle Host

**Может:**

- review membership requests;
- approve / reject / waitlist;
- управлять составом в рамках платформенной политики;
- report member;
- remove member with reason (категория обязательна — Core v2 §20);
- обновлять meeting details;
- report safety issue;
- при необходимости escalate admin'у.

**Не может:**

- видеть raw trust score (Инв. 3);
- видеть internal reports;
- публично shame rejected / removed users (Инв. 12);
- bypass safety / audit rules.

### Admin / Moderator

**Может:**

- review reports;
- review users / circles / meetings / messages;
- take moderation actions (§14);
- restrict / ban users;
- remove circles / meetings;
- freeze chats;
- добавлять admin notes;
- review suspicious activity;
- escalate critical incidents.

**Не может:**

- действовать без reason на serious actions;
- действовать без audit log (Инв. 4);
- использовать AI как единственное основание serious enforcement (Инв. 5).

### System

**Может:**

- создавать `suspicious_activity_events`;
- rate-limit действия;
- создавать queue items;
- отправлять notifications;
- создавать audit logs для автоматических действий;
- генерировать AI moderation сигналы.

**Не может:**

- быть финальным судьёй для serious enforcement (Инв. 5; Core v2 §10).

### AI

**Может:**

- флагать content;
- классифицировать reports;
- суммаризировать context (admin-only summary в `reports.ai_summary`);
- рекомендовать priority;
- детектить patterns.

**Не может:**

- permanently ban users alone;
- принимать final serious decisions (Инв. 5);
- раскрывать risk labels публично (Инв. 10).

---

## 7. Report Categories v2

Базируется на Schema v2 `report_category` enum: `harassment`, `spam`, `scam`, `unsafe_behavior`, `inappropriate_content`, `fake_profile`, `circle_safety`, `meeting_safety`, `location_issue`, `comfort_composition_violation`, `host_abuse`, `other`.

### 7.1 `harassment`

- **Meaning:** оскорбления, угрозы, повторный unwanted contact, агрессия.
- **Examples:** угроза вреда, оскорбительные сообщения в circle chat, harassment после rejection, повторные нежелательные контакты.
- **Default priority:** `high` (critical если threats).
- **Review path:** fast review.
- **Possible actions:** warn / hide message / freeze chat / restrict / ban; protect reporter.

### 7.2 `spam`

- **Meaning:** повторяющиеся сообщения, promotional abuse, bot-like behavior.
- **Examples:** повторяющиеся chat messages, ссылки на продажи, spam membership requests с тем же intro note.
- **Default priority:** `medium`.
- **Review path:** batch / AI assistive.
- **Possible actions:** rate limit / hide message / request cooldown / restrict.

### 7.3 `scam`

- **Meaning:** подозрительные ссылки, money requests, fake opportunities.
- **Examples:** просьбы перевести деньги, фишинг-ссылки, fake job offers, инвестиционные scams.
- **Default priority:** `high`.
- **Review path:** fast review.
- **Possible actions:** hide content / restrict / ban после confirmation.

### 7.4 `unsafe_behavior`

- **Meaning:** угрожающее или unsafe offline conduct.
- **Examples:** агрессия на встрече, нарушение safety rules круга, попытка изоляции участника.
- **Default priority:** `high` → `critical`.
- **Review path:** urgent.
- **Possible actions:** restrict / ban / escalate; круг / meeting review.

### 7.5 `inappropriate_content`

- **Meaning:** explicit photos, offensive bio / circle description, оскорбительный контент.
- **Examples:** unsafe profile photo, offensive circle description, inappropriate chat content.
- **Default priority:** `medium`.
- **Review path:** normal / AI assistive.
- **Possible actions:** hide / remove / flag content; warn / restrict если pattern.

### 7.6 `fake_profile`

- **Meaning:** impersonation, ложная личность, подозрительные фото.
- **Examples:** фото взято из интернета, поддельные verification claims, несогласованные детали.
- **Default priority:** `medium` → `high`.
- **Review path:** review (often требует phone verification step).
- **Possible actions:** require verify / hide profile / restrict / ban если confirmed.

### 7.7 `circle_safety`

- **Meaning:** circle представляет safety risk — unsafe / fake / misleading.
- **Examples:**
  - unsafe circle (поощряет рискованное поведение);
  - misleading circle (фактически не соответствует описанному vibe);
  - hidden dating / party mechanics (исключено из MVP — Core v2 §26);
  - suspicious host behavior.
- **Default priority:** `high` → `critical` (если есть upcoming meeting в ближайшие 24h).
- **Review path:** urgent.
- **Possible actions:** `pending_review` → request host edit / `remove_circle` / restrict host; notify members neutrally.

### 7.8 `meeting_safety`

- **Meaning:** конкретная meeting представляет safety risk.
- **Examples:**
  - unsafe location;
  - misleading meeting details;
  - risky arrival instructions;
  - meeting location changed suspiciously last-minute.
- **Default priority:** `high` → `critical` (особенно если meeting starts within 24h).
- **Review path:** urgent.
- **Possible actions:** `remove_meeting` / `cancel` / hide location / restrict host; notify approved attendees neutrally.

### 7.9 `location_issue`

- **Meaning:** exact location leak / misuse.
- **Examples:**
  - exact location в public meeting summary;
  - exact location в circle description;
  - неверная локация;
  - exact location leak в notification.
- **Default priority:** `high` → `critical`.
- **Review path:** urgent.
- **Possible actions:** hide / remove exposed content; revoke access; audit; review RLS path (§24).

### 7.10 `comfort_composition_violation`

- **Meaning:** нарушение comfort composition expectations (women-only / female-friendly / host-defined).
- **Examples:**
  - women-only / female-friendly concern;
  - composition mismatch (по факту другой состав);
  - misleading composition в описании.
- **Default priority:** `high`.
- **Review path:** sensitive review (§25); защитить reporter.
- **Possible actions:** circle warning / host edit required / restrict host / `remove_circle`; escalate если серьёзно.

### 7.11 `host_abuse`

- **Meaning:** host злоупотребляет полномочиями.
- **Examples:**
  - abusive approval / removal;
  - repeated unfair removals (pattern);
  - давление перейти в external channels (Инв. 2);
  - discriminatory behavior;
  - просьба об оплате вне платформы.
- **Default priority:** `high`.
- **Review path:** review с учётом host history.
- **Possible actions:** host warning / host restriction / manual review для future circles / `remove_circle` / ban (severe / repeated).

### 7.12 `other`

- **Meaning:** не покрыто другими категориями.
- **Examples:** уникальные edge cases, требующие ручной классификации.
- **Default priority:** `medium`.
- **Review path:** manual triage; admin может recategorize.
- **Possible actions:** по решению admin'а; reclassify в более подходящую категорию.

---

## 8. Report Priorities v2

Базируется на Schema v2 `report_priority` enum: `low`, `medium`, `high`, `critical`.

### 8.1 `low`

- **Examples:** минорный copy / content issue, неясный report, low-risk profile issue.
- **Expected response:** batch review.

### 8.2 `medium`

- **Examples:** suspicious behavior, умеренный harassment, повторный spam, questionable circle content.
- **Expected response:** normal moderation cycle (приоритет выше low).

### 8.3 `high`

- **Examples:** credible harassment, scam, unsafe meeting risk, location privacy issue, повторные reports на один target, host abuse pattern.
- **Expected response:** fast review; возможна temporary protective action (restrict, freeze chat).

### 8.4 `critical`

- **Examples:**
  - угроза вреда;
  - серьёзный офлайн-инцидент;
  - dangerous meeting location;
  - severe location leak;
  - credible stalking / harassment risk;
  - severe comfort composition violation.
- **Expected response:** immediate escalation; urgent restriction / removal; founder / senior admin review.

### 8.5 Priority assignment factors

- user-selected category;
- AI triage suggestion (assistive — Инв. 5);
- report history (target и reporter);
- meeting timing — **meeting starts within 24h → boost priority**;
- whether exact location уже revealed (boost если да);
- whether multiple users report the same target (boost);
- whether host has repeated removal / report pattern (boost).

> **Rule:** reports involving meetings starting within 24 hours **приоритизируются** (см. §36). Reports involving exact location exposure — **high / critical**.

---

## 9. Report Lifecycle v2

Базируется на Schema v2 `report_status` enum: `new`, `in_review`, `action_taken`, `dismissed`, `escalated`.

```
new ──► in_review ──► action_taken
   │           │
   │           ├──► dismissed
   │           └──► escalated ──► action_taken / dismissed
```

| Status | Meaning | Кто ставит | User visibility | Admin actions | Audit |
|---|---|---|---|---|:--:|
| `new` | Создан, ещё не просмотрен | system | reporter видит «отправлено» | assign / open | при действии |
| `in_review` | Admin начал review | admin | reporter видит «на рассмотрении» (ограниченно) | take action / escalate / dismiss | при действии |
| `action_taken` | Действие выполнено | admin | reporter видит generic «обработано» | follow-up | ✅ обязателен |
| `dismissed` | Нет действия / недостаточно данных | admin | reporter видит generic «обработано» | reopen (если новое evidence) | ✅ обязателен |
| `escalated` | Передан founder / senior admin | admin | reporter видит generic | protective action / final decision | ✅ обязателен |

---

## 10. Report Creation Flow v2

### Entry points

- **Public Safe Profile** (Public Profile screen);
- **Circle Detail** (`Пожаловаться на круг`);
- **Meeting Detail** (`Пожаловаться на встречу`);
- **Circle Chat Message** (long-press / context action);
- **Member List / Safe Member Context** (`Пожаловаться на участника`);
- **Host Dashboard** (host жалуется на member / requester);
- **Membership Request Detail** (`Пожаловаться на запрос` / `Пожаловаться на хоста`);
- **Notifications**, если контекст подходит (например, после approval можно report unsafe meeting).

### Steps

1. User нажимает Report.
2. Выбирает target type (user / circle / meeting / message) — обычно derived из context.
3. Выбирает category (§7).
4. Опционально добавляет description (свободный текст).
5. System захватывает context.
6. Создаётся `reports` запись (`status = 'new'`, default `priority = 'medium'` или AI-suggested).
7. AI triage может классифицировать / суммаризировать → `ai_summary` (admin-only — Инв. 5).
8. Report попадает в moderation queue.
9. User видит confirmation copy («Спасибо. Мы рассмотрим жалобу и примем меры, если это потребуется.»).

### Context captured

- `reporter_id`;
- ровно один и более из: `reported_user_id`, `reported_circle_id`, `reported_meeting_id`, `reported_message_id` (DB check enforces ≥1);
- `category`;
- `description` (если предоставлен);
- timestamp;
- relevant metadata (например, meeting_id если report на message в meeting context);
- content snapshot, если политика allows (Q-MSG-SNAP — open §44).

### Privacy rules

- **reported user НЕ видит** report details (Инв. 6, RLS v2 §19);
- **reporter identity защищён** server-side;
- **raw description никогда не в analytics** (RLS v2 §24);
- **content reports admin-only**;
- AI summary admin-only.

---

## 11. Block Flow v2

### Purpose

Block — это **немедленный пользовательский контроль** без ожидания admin'а. Сосуществует с report.

### Rules

- user может block другого user;
- user **не может** block себя (DB check);
- block **не уведомляет** blocked user (Инв. 6);
- blocked user **не может** request membership в circles, которые hostит blocker (US-REQ-13);
- blocked users **не могут** напрямую взаимодействовать (chat сообщения скрыты);
- same-circle block — special handling (§11 edge cases);
- block **сосуществует** с report (одно действие не исключает другое);
- unblock — опционально (P1) через `deleted_at` soft path.

### Edge cases

1. **User блокирует host после запроса.** Membership request нивелируется / скрывается; нет взаимодействия; exact location не раскрывается; existing visibility revoked.
2. **Host блокирует requester.** Request не может быть approved; requester теряет путь к этому circle (но видит только generic «недоступен»).
3. **Два member'а одного circle блокируют друг друга.** Взаимодействие между ними прекращается (chat сообщения друг друга скрыты); host / admin может получить safety alert по политике (open §44 #6).
4. **Blocked user уже approved for intro meeting.** Visibility пересчитывается; сообщения друг друга скрыты; host может получить safe context.
5. **Blocked user — active member.** Сообщения скрыты для обоих; обоим viable путь — pause / leave; circle / host visibility не меняется глобально, только bilateral (open §44 #6).
6. **Blocked user пытается писать в Circle Chat.** Сообщения доставляются круг, но **скрыты для blocker'а** (bilateral hide).
7. **Blocked user пытается смотреть профиль blocker'а.** Ограниченный / скрытый view.
8. **Blocked user пытается request place** в circle blocker'а. Action denied (US-REQ-13) с generic copy.

---

## 12. Moderation Queue v2

### Sources

- `reports` (user-submitted);
- AI content flags (через `moderation_status = 'flagged'` на entities);
- `suspicious_activity_events` (system-generated);
- unsafe profile photo / bio (AI);
- unsafe circle description (AI);
- unsafe meeting details (AI);
- unsafe circle chat message (AI / velocity);
- host abuse signals (`frequent_host_removals`, host-targeted reports);
- repeated no-shows (member-level);
- repeated member removals (host-level);
- comfort composition concerns (specific category boost);
- admin-created review item.

### Queue item fields / concepts

- item type (`report`, `ai_flag`, `suspicious_activity`, `manual`);
- priority (`low` / `medium` / `high` / `critical`);
- status (`new` / `in_review` / ...);
- target entity (user / circle / meeting / message);
- reporter (если applicable);
- `assigned_admin_id`;
- AI summary (admin-only);
- `created_at`;
- meeting timing (если related to meeting — для урgency);
- whether exact location revealed (boolean flag);
- trust signals (current `trust_tier`, presence of restrictions);
- previous reports на target (count, internal only);
- prior actions (last `moderation_action` на target).

### Queue filters

- priority;
- status;
- category;
- content type (user / circle / meeting / message);
- meeting starts soon (within 24h flag);
- assigned / unassigned;
- user / circle / host risk pattern;
- AI flagged;
- city / beta cohort;
- comfort composition concerns (separate filter).

### Queue sorting

- critical first;
- high priority;
- meetings starting soon;
- multiple reports on the same target (deduped, surfaced together);
- location privacy incidents;
- repeated host abuse;
- older unreviewed items (anti-stale).

---

## 13. Admin Review Flow v2

### Steps

1. **Admin открывает moderation queue.**
2. **Filters / sorts** items.
3. **Открывает report / detail.**
4. **Review context:**
   - report details;
   - reporter (limited — identity охраняется при необходимости);
   - target user (safe profile + admin-only trust context);
   - circle (включая `circle_status`, host history);
   - meeting (включая exact location доступ через server-side только);
   - message (snapshot если политика);
   - membership context (request / membership history);
   - host history (предыдущие удаления, reports);
   - trust events (внутренний контекст);
   - previous reports на target;
   - AI summary (advisory);
   - block / report history (counters internal).
5. **Выбирает action:**
   - `dismiss_report`;
   - `warn_user`;
   - `restrict_user` / `unrestrict_user`;
   - `ban_user` / `unban_user`;
   - `remove_circle` / `restore_circle`;
   - `remove_meeting` / `restore_meeting`;
   - `hide_message` / `restore_message`;
   - `freeze_chat` / `unfreeze_chat`;
   - `escalate_report`;
   - `admin_note`.
6. **Reason обязателен** для serious actions (DB constraint + Edge Function check).
7. **System создаёт `moderation_action`** запись.
8. **System создаёт `audit_log`** запись (Инв. 4).
9. **System обновляет target state** (например, `circle.circle_status = 'removed_for_safety'`).
10. **System отправляет safe notification** affected user / participants если уместно (§32).

### Important

- **Serious actions требуют reason** (US-ADM-17).
- **AI summary — assistive only** (Инв. 5).
- **Admin видит достаточно context, но не лишние sensitive данные** (например, raw `trust_score_internal` не показывается даже admin'у — Инв. 3; admin видит `trust_tier` + relevant `trust_events`).

---

## 14. Moderation Actions v2

Базируется на Schema v2 `moderation_action_type` enum.

### 14.1 `warn_user`

- **Purpose:** low / medium issue, формальное напоминание.
- **Who:** admin.
- **Target:** user.
- **When:** одноразовое нарушение, edge case behavior.
- **Audit:** ✅.
- **Trust event:** `moderation_warning`.
- **Notification:** ✅ (neutral copy).
- **Reversible:** n/a (warning не накладывает ограничений).

### 14.2 `restrict_user`

- **Purpose:** временное / scoped ограничение действий.
- **Who:** admin.
- **Target:** user.
- **When:** suspicious activity confirmed, повторный spam / harassment, host abuse.
- **Audit:** ✅.
- **Trust event:** `restriction_applied`.
- **Notification:** ✅ (private; non-stigmatizing).
- **Reversible:** ✅ через `unrestrict_user`.

### 14.3 `unrestrict_user`

- **Purpose:** снять restriction.
- **Who:** admin.
- **Audit:** ✅.
- **Trust event:** — (или positive нейтр.).
- **Notification:** опционально.
- **Reversible:** n/a.

### 14.4 `ban_user`

- **Purpose:** severe / repeated abuse; блокировать платформенно.
- **Who:** admin (**human**, Инв. 5 — AI alone never bans).
- **Target:** user.
- **When:** confirmed harassment / scam / stalking; severe safety violation.
- **Audit:** ✅.
- **Trust event:** `restriction_applied` (tier override → `suspended`).
- **Notification:** ✅ (force sign-out).
- **Reversible:** через `unban_user`.

### 14.5 `unban_user`

- **Purpose:** восстановить доступ.
- **Who:** admin.
- **Audit:** ✅.
- **Notification:** ✅ (на next login attempt).
- **Reversible:** n/a.

### 14.6 `remove_circle`

- **Purpose:** unsafe / invalid circle.
- **Who:** admin.
- **Target:** `circles` (status → `removed_for_safety`).
- **When:** unsafe circle confirmed (fake, misleading, hidden dating / party mechanic, host abuse pattern).
- **Audit:** ✅.
- **Trust event:** возможен host signal (`host_negative_feedback` или severity-driven).
- **Notification:** ✅ members + approved requesters (neutral, generic — §32).
- **Reversible:** через `restore_circle`.

### 14.7 `restore_circle`

- **Purpose:** откат ошибки.
- **Who:** admin.
- **Audit:** ✅.
- **Notification:** members получают neutral notice.
- **Reversible:** n/a (можно повторно remove).

### 14.8 `remove_meeting`

- **Purpose:** unsafe / cancelled / invalid meeting.
- **Who:** admin (host тоже может cancel/delete свою встречу — операционно, но через другую action `cancel`; admin `remove_meeting` — safety-driven).
- **Target:** `circle_meetings` (status → `removed_for_safety`).
- **When:** unsafe location, misleading details, last-minute bait-and-switch, safety report.
- **Audit:** ✅.
- **Trust event:** none по дефолту (severity-driven если host).
- **Notification:** ✅ approved attendees + RSVPs voided (neutral, no exact location, no sensitive details).
- **Reversible:** через `restore_meeting`.

### 14.9 `restore_meeting`

- **Purpose:** откат ошибки.
- **Who:** admin.
- **Audit:** ✅.
- **Notification:** members получают neutral notice.
- **Reversible:** n/a.

### 14.10 `hide_message`

- **Purpose:** скрыть unsafe сообщение в circle chat.
- **Who:** admin / system (system-driven AI flag → hidden pending review).
- **Target:** `circle_chat_messages`.
- **When:** harassment / scam / spam / inappropriate content.
- **Audit:** ✅.
- **Trust event:** none (или small risk если sender pattern).
- **Notification:** sender может видеть hidden state; recipients просто не видят сообщение.
- **Reversible:** через `restore_message`.

### 14.11 `restore_message`

- **Purpose:** false positive recovery.
- **Who:** admin.
- **Audit:** ✅.
- **Notification:** не обязательна.
- **Reversible:** n/a.

### 14.12 `freeze_chat`

- **Purpose:** временно остановить запись в circle chat.
- **Who:** admin (host — open §44 #5 Q-FREEZE).
- **Target:** `circle_chat_states` (per circle).
- **When:** active escalation, harassment pattern, safety review in progress.
- **Audit:** ✅.
- **Trust event:** none.
- **Notification:** ✅ members видят frozen banner («Чат временно приостановлен…»).
- **Reversible:** через `unfreeze_chat`.

### 14.13 `unfreeze_chat`

- **Purpose:** восстановить чат.
- **Who:** admin.
- **Audit:** ✅.
- **Notification:** опционально (banner снимается).
- **Reversible:** n/a.

### 14.14 `dismiss_report`

- **Purpose:** нет действия / недостаточно evidence.
- **Who:** admin.
- **Audit:** ✅ (включая reason).
- **Trust event:** none.
- **Notification:** reporter видит «обработано».
- **Reversible:** reopen возможен (если новое evidence).

### 14.15 `escalate_report`

- **Purpose:** передать founder / senior admin для критической оценки.
- **Who:** admin.
- **Audit:** ✅.
- **Trust event:** none.
- **Notification:** обычно none.
- **Reversible:** n/a.

### 14.16 `admin_note`

- **Purpose:** внутренний контекст / observation (без direct action).
- **Who:** admin.
- **Target:** user / circle / meeting / report.
- **Audit:** ✅.
- **Trust event:** none.
- **Notification:** none.
- **Reversible:** n/a.

### 14.17 Workflows без отдельного enum (use existing action types + categorization)

- **`review_host_behavior`** — workflow: открыть user detail, посмотреть host history, suspicious_activity_events с `frequent_host_removals` → выбор: `warn_user` / `restrict_user` / `remove_circle` / `admin_note`. Не отдельный enum (Schema v2 §5 фиксирует enum).
- **`review_comfort_composition_issue`** — workflow: открыть report `comfort_composition_violation`, проверить circle settings, host response, member feedback → выбор: `admin_note` / request host edit / `remove_circle` / `restrict_user`.

> Эти workflows реализуются комбинацией существующих `moderation_action_type` значений + `admin_note` для контекста. Расширение enum'а — open §44 #21.

---

## 15. Enforcement Levels v2

### Level 0 — No action

- **Description:** dismiss или admin_note.
- **Examples:** unclear report, минорный non-violation.
- **Approval:** moderator.
- **User notification:** none.
- **Audit / trust:** audit (`dismiss_report` / `admin_note`).

### Level 1 — Soft warning

- **Description:** напоминание о guidelines.
- **Examples:** одноразовое минорное нарушение, неподходящий tone в chat.
- **Approval:** moderator.
- **User notification:** ✅ neutral.
- **Audit / trust:** audit + `moderation_warning` trust event.

### Level 2 — Content removal

- **Description:** скрыть / удалить контент.
- **Examples:** inappropriate photo, unsafe message, unsafe circle description.
- **Approval:** moderator.
- **User notification:** опционально (sender видит hidden state).
- **Audit / trust:** audit (`hide_message` / `remove_circle` content edit).

### Level 3 — Temporary restriction

- **Description:** ограничить actions (requests / chat / hosting) на scoped период.
- **Examples:** повторный spam, repeated no-shows pattern, mild host abuse.
- **Approval:** admin.
- **User notification:** ✅ private.
- **Audit / trust:** audit + `restriction_applied` trust event.

### Level 4 — Circle / Meeting-specific action

- **Description:** действие, затрагивающее конкретный круг / встречу / chat.
- **Examples:**
  - remove member (host или admin, safety-driven);
  - pause / `remove_circle`;
  - `remove_meeting` / cancel;
  - `freeze_chat`.
- **Approval:** admin (host removal — host-allowed с categorization).
- **User notification:** ✅ affected members / attendees (neutral).
- **Audit / trust:** ✅ audit; trust event только при severity-driven removal.

### Level 5 — Account ban / suspension

- **Description:** severe / repeated issue, account-level enforcement.
- **Examples:** confirmed harassment, scam, stalking, repeated unsafe behavior после restrictions.
- **Approval:** admin (**human** — Инв. 5).
- **User notification:** ✅ (force sign-out).
- **Audit / trust:** ✅ audit + `restriction_applied` trust event (tier override).

### Level 6 — Critical escalation

- **Description:** серьёзный офлайн-safety / legal / privacy incident.
- **Examples:** угроза вреда, stalking pattern, severe location leak, legal concern.
- **Approval:** founder / senior admin.
- **User notification:** по политике (часто private explanation, sometimes legal coordination).
- **Audit / trust:** ✅ + escalation документация.

---

## 16. Profile Moderation v2

### Targets

- `display_name`;
- `bio`;
- vibe tags assignment;
- profile photos;
- `username`;
- suspicious profile patterns (повторные изменения).

### Triggers

- profile creation / edit;
- photo upload;
- user report `fake_profile` / `inappropriate_content`;
- AI flag (text / photo moderation);
- suspicious profile changes (velocity).

### Rules

- unsafe профиль скрывается / `pending` до review;
- approved фото видимы публично;
- severe fake profile может restrict account;
- normal users **не видят** moderation internals (`moderation_status` поля скрыты от owner кроме own statuses);
- AI assistive (Инв. 5); severe action — human.

### AI

- text moderation (display_name, bio, username);
- photo moderation;
- fake / spam pattern detection — assistive, не final для serious.

---

## 17. Circle Moderation v2

### Targets

- circle title;
- circle description;
- vibe summary / vibe tags;
- category;
- comfort composition setting;
- approximate area / city;
- circle rules (host-defined);
- host behavior (history);
- unsafe circle patterns (AI / report).

### Triggers

- circle creation / edit;
- report `circle_safety` / `host_abuse` / `comfort_composition_violation`;
- AI flag (description, rules);
- suspicious host behavior;
- first-time host review (open §44 #1 OD-13);
- comfort composition concern.

### Rules

- unsafe circle может перейти в `pending_review`;
- **exact location НЕ хранится в circle** (Инв. 1, Schema v2 §8.2) — только в `meeting_locations`;
- circle с upcoming meeting starting soon + high-risk report — приоритет в очереди;
- admin может `remove_circle` (status → `removed_for_safety`);
- members получают safe notification («Этот круг больше недоступен. Мы удалили его из-за нарушения правил или вопросов безопасности.») — §32;
- detail report data private (admin-only).

### Beta recommendation

В ранней закрытой бете — **manual review for first-time hosts и/или для всех новых circles** (open §44 #1 OD-13).

---

## 18. Meeting Moderation v2

### Targets

- meeting title / description;
- meeting exact location (внутри `meeting_locations`);
- arrival instructions;
- timing (планирование, изменения);
- host updates на meeting;
- unsafe venue patterns.

### Triggers

- meeting creation / edit;
- report `meeting_safety` / `location_issue` / `unsafe_behavior`;
- AI flag описания / arrival instructions;
- location privacy issue (exact в неположенном поле);
- meeting starts soon (urgency boost);
- host abuse pattern.

### Rules

- unsafe meeting может быть `remove_meeting` (status → `removed_for_safety`) или cancelled;
- **exact location protected** (Инв. 1) — никогда не возвращается non-approved клиенту;
- **high / critical reports для meetings within 24h приоритизируются** (§8);
- approved attendees получают safe generic notification («Эта встреча больше недоступна. Мы обновили доступ из соображений безопасности.») — §32;
- **никаких sensitive report details в notification** (RLS v2 §23).

---

## 19. Membership Request Moderation v2

### Risk cases

- spam requests (один и тот же intro note по многим circles);
- inappropriate intro notes (harassment / scam / spam в `intro_note`);
- suspicious requester behavior (velocity);
- host abuse approval / rejection;
- repeated rejection patterns (host gatekeeping);
- user harassment после rejection (попытки писать в circle / member);
- discriminatory host behavior (по reports / patterns).

### Rules

- `intro_note` может модерироваться (AI text scan);
- host может report requester;
- requester может report host / circle;
- repeated spam requests триггерят `suspicious_activity_events` (`activity_type = 'too_many_requests'`);
- host decisions **не должны раскрывать sensitive reasons** публично — rejected user видит только «Не в этот раз»;
- **rejected users НИКОГДА не видят exact location** (Инв. 1);
- **no public rejection labels** (Инв. 12).

### Possible actions

- request cooldown (rate-limit per user);
- user restriction (если confirmed abuse);
- host review (если host pattern);
- circle review (если circle attracts complaints);
- admin note.

---

## 20. Membership Removal Moderation v2

**Critical section** — нарушение Инв. 11, 12 здесь — основной риск (см. §5.8).

### Cases

- host прекращает участие (`removed` status — Core v2 §11);
- user removed для inactivity;
- user removed для format mismatch;
- user removed for safety (`removed_for_safety` — Инв. 4);
- user removed после intro meeting (постоянное участие не подтверждено);
- user removed admin'ом.

### Rules (binding)

- **removal приватен** для удаляемого user'а;
- **no public shame** (Инв. 12);
- **no "excluded" label** other members никогда не видят;
- other members видят **максимум** «Состав круга обновился.» (Core v2 §15, §20);
- safety removals создают `moderation_action` + `audit_logs` + `trust_event` (`circle_removed_for_safety`) (Инв. 4);
- host **должен** выбрать reason category (internal — Core v2 §20; categories — open §44 #3);
- **repeated host removals** создают `suspicious_activity_events` (`activity_type = 'frequent_host_removals'`) → admin review host accountability;
- user может **позже запросить review** (lightweight appeal — §38).

### User-facing language (binding — Core v2 §11, §20)

**Use:**

- **«Участие завершено»**
- **«Не в этот раз»** (для rejection)
- **«Постоянное участие не было подтверждено»** (после intro)
- **«Состав круга обновился»** (для других members)

**Avoid (struck-through — never implement):**

- ~~«Вас исключили»~~
- ~~«Вы не подошли»~~
- ~~«Предал круг»~~
- ~~«Покинул круг для другого»~~
- ~~«Removed from N circles»~~

---

## 21. Circle Chat Moderation v2

### Targets

- message body;
- spam links;
- harassment;
- scam attempts;
- unsafe requests (например, «давай встретимся вне круга»);
- inappropriate content;
- pressure to move off-platform (Инв. 2 защита);
- sharing exact location в unauthorized context (Инв. 1).

### Triggers

- report message;
- AI detection (harassment / spam / scam classifiers);
- velocity limit (rate-limit triggers);
- admin review.

### Rules

- **только circle members могут писать** (RLS v2 §17);
- **no open DMs** (Инв. 2) — circle chat — единственная messaging surface в MVP;
- reported message создаёт `reports` запись;
- message может быть `hidden` pending review;
- sender deletion не должен разрушать moderation context, если политика so требует (Q-MSG-SNAP — open §44 #8);
- admin может `hide_message`;
- admin может `freeze_chat`;
- `banned` / `restricted` users не могут писать (Edge Function gate).

### AI

- harassment / spam / scam detection;
- velocity classification;
- prioritization — без финального serious enforcement alone (Инв. 5).

---

## 22. Unsafe Circle Handling v2

### Examples

- fake circle (не существует, бот-host);
- hidden dating / party / nightlife circle (исключено из MVP — Core v2 §26);
- unsafe circle description;
- misleading vibe;
- suspicious host (history of reports);
- multiple reports на один circle;
- comfort composition issue (women-only misrepresentation);
- exact location в public description (Инв. 1);
- host просит users перейти в unsafe external channel.

### Flow

1. **Report / AI / system flag** триггерит queue entry.
2. **Queue priority** рассчитана (§8 factors).
3. Если **high / critical** — admin alerted; meeting timing учтён.
4. **Admin reviews circle, host, requests, members, upcoming meetings.**
5. Возможен **temporary `pending_review` / pause** до полного review.
6. **Admin action:**
   - `dismiss_report` (false positive);
   - request host edit (через `admin_note` + outbound contact);
   - `remove_circle`;
   - `restrict_user` (host);
   - notify members neutrally (§32).
7. **Audit log создаётся** (Инв. 4).
8. **Trust events** если применимо (`circle_removed_for_safety` для host).

---

## 23. Unsafe Meeting Handling v2

### Examples

- unsafe venue (район / место — risk);
- suspicious exact location;
- misleading arrival instructions;
- location changed last-minute (bait-and-switch);
- meeting starts soon + reports converging;
- meeting moved off-platform (через chat / external channel);
- exact location leaked публично (Инв. 1).

### Flow

1. **Report / flag** triggers queue entry.
2. **Priority** based on meeting timing + whether location revealed (§8).
3. **Admin reviews meeting / circle / host.**
4. **Protective action:**
   - `remove_meeting` / cancel;
   - hide / revoke location reveal;
   - `restrict_user` (host);
   - notify approved participants neutrally («Эта встреча больше недоступна…»).
5. **Audit log** (Инв. 4).
6. **Follow-up review** circle / host если pattern.

---

## 24. Location Privacy Incidents v2

### Examples

- exact location в public circle поле (description / vibe / area);
- exact location в public meeting summary поле;
- notification содержит exact location в push body (Инв. 1 нарушение);
- analytics event с exact location (RLS v2 §24);
- rejected user утверждает retained access к exact location;
- removed member ещё видит exact location (RLS regression);
- screenshot / leak (пользователь поделился вовне).

### Response

- **hide / remove exposed content** немедленно;
- **revoke access** если применимо (force re-fetch + RLS);
- **`remove_meeting` / `pause` circle** если incident persisten;
- **notify affected users** если уместно (safe, generic copy);
- **audit incident** (Инв. 4);
- **review RLS / query path** (RLS v2 §15 test cases);
- **add regression test case** (RLS test suite);
- **restrict malicious actor** если намерение clear.

### Prevention

- validation описаний (запрет address-like patterns в public fields);
- AI / text scan на address-like content (P1);
- **exact location всегда в отдельной таблице** `meeting_locations` (Schema v2 §10.2);
- review notification templates (RLS v2 §23.3);
- analytics boundary (RLS v2 §24);
- RLS regression tests (RLS v2 §15.2).

---

## 25. Comfort Composition Incident Handling v2

> Core v2 §21 — comfort composition требует **validation с женщинами до полного roll-out**. До тех пор women-only / female-friendly mechanics — gated.

### Examples

- women-only violation (мужчина попал в women-only круг через misrepresentation);
- female-friendly expectation mismatch;
- host неверно label'ит composition;
- user misrepresentates self чтобы попасть;
- discomfort / report related to composition;
- discriminatory использование composition settings (исключение по нерелевантным признакам).

### Rules

- **обрабатывать аккуратно** — высокая чувствительность;
- **защитить reporter** (identity protected, особенно в gender-sensitive context);
- **avoid public confrontation** — все через приватный admin path;
- **admin review для serious cases**;
- **не обещать absolute safety** в product copy;
- **validate wording / policies с женщинами** до implementation (Core v2 §21).

### Possible actions

- circle warning;
- host edit required (composition wording);
- host restriction;
- `remove_circle`;
- restrict actor user (если misrepresentation confirmed);
- escalate если pattern emerges.

---

## 26. Scam / Spam Handling v2

### Signals

- repeated membership requests (rate);
- suspicious links в chat / intro_note;
- money requests;
- same intro note текст по многим circles;
- many chat messages per minute (velocity);
- invite abuse (enumeration попытки);
- spam profile / circle descriptions.

### Actions

- rate limit (system-level, без human review);
- `hide_message`;
- request cooldown;
- account `restrict_user`;
- `ban_user` для confirmed scam после review.

### AI

- spam classification;
- scam pattern detection;
- admin summary через `reports.ai_summary`.

### Rules

- **не auto permanent ban** от одного AI-сигнала (Инв. 5);
- **высокий-confidence scam** может быстро `restrict_user` **pending review** — но финальное решение должен принять admin.

---

## 27. Harassment Handling v2

### Sources

- circle chat;
- membership requests (intro_note);
- profile content (display_name / bio);
- post-meeting behavior (reports после офлайн-инцидента);
- host / member reports.

### Priority

- **threats = critical**;
- **repeated unwanted contact = high**;
- **insults = medium / high** depending on context.

### Actions

- `warn_user`;
- `hide_message`;
- `freeze_chat`;
- `restrict_user`;
- remove from circle / circle access;
- `ban_user` для severe / repeated cases;
- **protect reporter identity** (RLS v2 §19).

### Important

User может **block немедленно** без ожидания admin'а — Инв. 6.

---

## 28. Fake Profile / Identity Concerns v2

### Signals

- suspicious photos (reverse image search hits — P1);
- inconsistent details;
- reports `fake_profile`;
- spammy bio;
- many suspicious requests;
- no verification (но низкий signal сам по себе).

### Actions

- require phone verification (Edge Function gate);
- hide profile / photo pending review;
- restrict requests;
- restrict hosting;
- `ban_user` если confirmed malicious.

### Rules

- **новый user не автоматически suspicious** (Trust v2 §4.3);
- **false positives recoverable** (`restore_message`, `unrestrict_user`).

---

## 29. Host Abuse Handling v2

### Risks

- fake circles;
- unsafe meeting locations;
- misleading vibe / composition;
- discriminatory approval / removal;
- repeated removals (pattern);
- last-minute cancellations;
- harassment в chat;
- abuse of no-show marking;
- moving users to external channels (Инв. 2 защита);
- asking for money / off-platform payment.

### Signals

- repeated reports against host;
- `suspicious_activity_events` (`frequent_host_removals`);
- high rejected / request patterns (gatekeeping);
- comfort composition reports;
- unsafe meeting reports.

### Responses

- host `warn_user`;
- host `restrict_user`;
- manual review для future circles (host больше не auto-pass);
- `remove_circle`;
- `remove_meeting`;
- `freeze_chat`;
- hide trusted host badge (по Trust v2 §22 effect);
- `ban_user` для severe / repeated abuse.

### Principle

> **Host control необходим, но host power должен быть accountable.** Host не может silently downrank / shame пользователей; host actions auditable; pattern triggers review.

---

## 30. AI Moderation v2

### Allowed uses

- profile text moderation (`display_name`, `bio`);
- photo moderation (`profile_photos`);
- circle description moderation;
- meeting description moderation;
- circle chat harassment detection;
- spam / scam detection;
- report summarization (admin-only `ai_summary`);
- priority recommendation (assistive);
- suspicious pattern explanation.

### AI outputs

- `safe` / `flagged` / `needs_review`;
- suggested category;
- suggested priority;
- summary (admin-only);
- confidence score (internal);
- reasons (admin-only).

### Rules (binding — Инв. 5)

- **AI output — advisory**, не final;
- **AI risk scores не public** (Инв. 10);
- **serious enforcement требует human / admin review**;
- **false positives recoverable** (admin override);
- **AI не получает unnecessary sensitive data** (например, raw phone, raw exact_location в model input — Инв. 1);
- **AI summaries admin-only** (RLS v2 §19).

### Flow

```
Content submitted
  → AI check
  → {safe | flagged | needs_review}
  → if flagged: queue item
  → admin review (serious)
  → action
  → audit log
```

---

## 31. Audit Logging Requirements v2

### Actions requiring audit log (Инв. 4)

- `restrict_user`;
- `unrestrict_user`;
- `ban_user`;
- `unban_user`;
- `remove_circle`;
- `restore_circle`;
- `remove_meeting`;
- `restore_meeting`;
- `hide_message`;
- `restore_message`;
- `freeze_chat`;
- `unfreeze_chat`;
- `dismiss_report`;
- `escalate_report`;
- `admin_note`;
- **remove_member для safety** (host или admin → `circle_removed_for_safety` trust event);
- **host abuse review action** (любое action по результатам review);
- **comfort composition enforcement** (любое action на эту категорию).

### Audit log fields (Schema v2 §13.2)

- `actor_id`;
- `actor_type` (`admin` / `system` / `user` / `service_role`);
- `action` (typed key);
- `entity_type` (`user` / `circle` / `meeting` / `message` / `membership` / `report`);
- `entity_id`;
- `before_state` (jsonb, sensitive values redacted);
- `after_state` (jsonb, sensitive values redacted);
- `reason` (required для serious);
- `metadata` (jsonb);
- `timestamp` (`created_at`).

### Rules

- **admin / system only access** (RLS v2 §20);
- **append-only-ish** (no UPDATE / DELETE policies — Schema v2 §13.2);
- **sensitive values redacted** (exact location → `[REDACTED]`, raw trust score never logged);
- **no normal user access**;
- **failed audit write блокирует action** (US-SAFE-14 EC).

---

## 32. Moderation Notifications v2

### Notification types

- report submitted confirmation;
- report update generic («обработано» / «на рассмотрении»);
- warning (`moderation_warning`);
- restriction notice;
- ban notice;
- circle removed (members notified);
- meeting cancelled / removed (approved attendees notified);
- message hidden (sender может видеть hidden state — opt);
- chat frozen (members видят banner);
- membership participation ended (private к removed user);
- safety notice (generic).

### Rules

- **не раскрывать reporter identity** (Инв. 6);
- **не раскрывать full report details** (RLS v2 §19);
- **не включать exact location** unless authorized (Инв. 1, RLS v2 §23);
- **avoid public shame** (Инв. 12);
- serious actions должны privately объяснить next steps если уместно.

### Sample copy

**Report submitted:**

> «Спасибо. Мы рассмотрим жалобу и примем меры, если это потребуется.»

**Warning:**

> «Некоторые ваши недавние действия могут не соответствовать правилам сообщества. Пожалуйста, ознакомьтесь с принципами безопасности перед продолжением.»

**Restriction:**

> «Доступ к части функций временно ограничен, пока мы рассматриваем недавние действия.»

**Circle removed:**

> «Этот круг больше недоступен. Мы удалили его из-за нарушения правил или вопросов безопасности.»

**Meeting removed:**

> «Эта встреча больше недоступна. Мы обновили доступ из соображений безопасности.»

**Participation ended (приватно к removed user):**

> «Ваше участие в круге завершено. Это не отображается в вашем публичном профиле.»

**Chat frozen:**

> «Чат временно приостановлен, пока мы рассматриваем ситуацию.»

---

## 33. Moderation & Trust Integration v2

### Moderation actions могут создавать trust_events

- `report_received` (при создании report);
- `moderation_warning` (от `warn_user`);
- `restriction_applied` (от `restrict_user` / `ban_user`);
- `suspicious_velocity` (system-generated);
- `circle_removed_for_safety` (если user был host removed circle);
- `meeting_no_show` (через attendance flow, не прямо moderation);
- `host_negative_feedback` (validated через admin process — P1).

### Trust signals помогают moderation

- queue priority (`trust_tier`, prior reports, prior restrictions);
- repeat pattern detection (`suspicious_activity_events`);
- host abuse detection (frequent host removals);
- request spam detection (request velocity);
- repeated no-show (member-level pattern);
- soft friction (rate-limit per tier).

### Rules (binding — Инв. 5)

- **report alone не вина** (Trust v2 §4.3);
- **block alone не proof** (Trust v2 §7.12);
- **AI flag alone не proof** (Инв. 5);
- **trust score не public** (Инв. 3);
- **no public negative labels** (Инв. 10, 12).

---

## 34. Admin Dashboard Requirements v2

### Screens

#### Admin Login

- **Purpose:** аутентификация admin / moderator.
- **Key data:** admin session.
- **Actions:** login.
- **Sensitive notes:** web-only admin (mobile app не имеет admin functionality — CLAUDE.md §2.15).
- **Audit:** login event logged.

#### Moderation Queue

- **Purpose:** видеть pending items.
- **Key data:** priority, category, target type, meeting timing, exact location revealed flag, AI summary, prior reports count (internal), assigned admin, status.
- **Actions:** filter, sort, open, assign.
- **Sensitive notes:** AI summary advisory only.
- **Audit:** при действии.

#### Report Detail

- **Purpose:** review одного report'а.
- **Key data:** report context, reporter (limited), target, description (admin-only), related content, AI summary, trust context (admin-only), prior actions.
- **Actions:** take action, escalate, dismiss.
- **Sensitive notes:** reporter identity защищён; reason обязателен для serious.
- **Audit:** ✅ при действии.

#### User Detail

- **Purpose:** review user'а.
- **Key data:** safe profile, history, trust context (admin-only — tier + events, no raw score), flags, prior actions.
- **Actions:** `warn_user` / `restrict_user` / `ban_user` / `admin_note`.
- **Sensitive notes:** trust internals server-side only (RLS v2 §21); raw score никогда не показывается даже admin.
- **Audit:** access может быть logged для high-risk users.

#### Circle Detail

- **Purpose:** review circle.
- **Key data:** full circle context + host history + request / membership counts + member context (server-side).
- **Actions:** `remove_circle` / `restore_circle` / contact host (через external channel).
- **Sensitive notes:** member personal data redacted кроме safety review need.
- **Audit:** ✅ при действии.

#### Meeting Detail

- **Purpose:** review конкретной meeting.
- **Key data:** full meeting context включая exact location (server-side, logged).
- **Actions:** `remove_meeting` / `restore_meeting` / restrict host.
- **Sensitive notes:** **exact-location access logged** (special audit category).
- **Audit:** ✅ при действии + access logged.

#### Message Detail

- **Purpose:** review message в circle chat.
- **Key data:** snapshot + thread context.
- **Actions:** `hide_message` / `restore_message` / take action на sender.
- **Sensitive notes:** контекст сохраняется при sender deletion (Q-MSG-SNAP — open §44).
- **Audit:** ✅ при действии.

#### Suspicious Activity Queue

- **Purpose:** review `suspicious_activity_events`.
- **Key data:** activity_type, severity, related user / circle / meeting, metadata.
- **Actions:** review, escalate, dismiss.
- **Sensitive notes:** **не enforcement** — review trigger (Инв. 5).
- **Audit:** при действии.

#### Audit Logs

- **Purpose:** просмотр audit trail.
- **Key data:** log entries (read-only).
- **Actions:** view, filter.
- **Sensitive notes:** append-only / immutable; sensitive values redacted (exact location → `[REDACTED]`).
- **Audit:** — (audit log сам себя не аудитит).

#### Action Modal

- **Purpose:** применить moderation action.
- **Key data:** action type, reason, optional duration, notification choice.
- **Actions:** confirm.
- **Sensitive notes:** **serious actions требуют reason** (US-ADM-17).
- **Audit:** ✅ **обязательно**.

### Queue must show

- priority;
- category;
- target type;
- meeting timing (если related);
- **exact location revealed?** (boolean flag);
- AI summary (assistive);
- **previous reports count** (internal — counter only, не лист);
- assigned admin;
- status.

### Action Modal requires

- action type (enum);
- **reason** (required for serious);
- optional duration (для restrictions);
- notification choice (send / suppress);
- audit confirmation (auto + manual checkbox для critical).

---

## 35. Beta Safety Operations v2

### Recommendations

- founder / admin **review queue daily**;
- **critical reports checked immediately**;
- **first-time hosts reviewed manually** (open §44 #1 OD-13);
- **first circles** may require manual review (early beta);
- **high-risk categories excluded** (no nightlife / parties / dating circles — Core v2 §26);
- **monitor reports / blocks / no-shows / removals**;
- **monitor host removal patterns** (`frequent_host_removals`);
- **review AI false positives** weekly;
- **weekly safety review** (cross-functional).

### Beta safety dashboard metrics

- new reports (24h, 7d);
- open high / critical reports;
- response time (avg, p95);
- reports per 100 users;
- reports per circle;
- blocks per 100 users;
- circles removed (for safety);
- meetings removed (for safety);
- users restricted / banned;
- no-show rate (overall);
- host abuse signals (count);
- comfort composition reports (count, monitored separately);
- AI false positive rate (admin overrides / total AI flags).

---

## 36. Moderation SLAs / Response Targets v2

### Beta targets

#### `critical`

- **Target:** immediate founder / admin attention.

#### `high`

- **Target:** same-day review.

#### `medium`

- **Target:** normal moderation cycle (within 1–2 days в бете).

#### `low`

- **Target:** batch review (weekly).

### Rules

- **Reports involving meetings starting within 24 hours приоритизируются.** Запоздалая response — direct safety risk.
- **Reports involving exact location exposure — high / critical** (Инв. 1).

---

## 37. Escalation Policy v2

### Escalate when

- credible угроза вреда;
- серьёзный harassment / stalking concern;
- location privacy leak;
- unsafe offline incident (что-то произошло на встрече);
- repeated reports against same user / host / circle;
- scam pattern;
- comfort composition serious violation;
- admin uncertainty;
- legal / privacy concern.

### Escalation path

```
report
  → moderator review
  → founder / senior admin
  → temporary protective action
  → final decision
  → audit log
  → notification (если уместно)
```

### Protective temporary actions

- `freeze_chat`;
- `restrict_user`;
- pause / `remove_circle`;
- `remove_meeting`;
- hide content;
- pause host ability (через restriction).

> Все protective actions — **через audit log** (Инв. 4).

---

## 38. Appeals / Review v2

### MVP approach

**Lightweight review**, не полная appeals-система.

### Users могут хотеть

- узнать почему restricted;
- сообщить о false no-show;
- запросить review ban / restriction;
- узнать про removed circle / meeting;
- узнать про membership removal.

### Rules

- **appeals не раскрывают reporter identity** (Инв. 6);
- **audit logs поддерживают review** (history available admin-side);
- **serious actions internally reviewable**;
- **full appeal workflow — P1**.

### Open

- **Exist ли appeals в closed beta?** (Q-APPEAL — open §44 #16).

---

## 39. Privacy & Data Handling in Moderation v2

### Do not expose

- report descriptions reported user'у (Инв. 6);
- reporter identity unless необходимо и safe;
- moderation notes normal users;
- raw `trust_score_internal` (Инв. 3);
- AI risk scores (Инв. 10);
- private profile details (`profile_private_details.*` — Schema v2 §7.2);
- exact location в reports / notifications unless admin authorized (Инв. 1);
- membership removal details публично (Инв. 12);
- rejection / removal history публично.

### Retention

- **reports** — retention policy needed (open §44 #9);
- **audit logs** — longer retention (compliance / forensics);
- **deleted user data + safety records** — policy needed;
- **message snapshots** — policy needed (Q-MSG-SNAP);
- **media attachments** — policy needed.

---

## 40. Moderation Analytics Boundary v2

### Allowed analytics events

- `report_created`;
- `report_category` (enum value);
- `report_priority` (enum value);
- `moderation_action_taken`;
- `action_type` (enum value);
- `circle_removed_for_safety` (count);
- `meeting_removed_for_safety` (count);
- `user_restricted` (count);
- `user_banned` (count);
- `message_reported` (count);
- `chat_frozen` (count);
- `block_created` (count);
- `suspicious_velocity_flagged` (count);
- `host_abuse_flagged` (count).

### Never send (binding)

- ~~report description~~;
- ~~raw message body~~;
- ~~private admin notes~~ (`reports.admin_resolution_note`, `moderation_actions.reason`);
- ~~exact location~~;
- ~~phone / email / DOB~~;
- ~~raw trust score~~ (Инв. 3);
- ~~AI detailed risk text~~ если sensitive;
- ~~removal / rejection details as public-like analytics properties~~ (Инв. 12).

### Goal

> **Measure the safety funnel without leaking sensitive details.** Schema-level validation должна refuse forbidden columns. Observability alerts на sensitive field в payload (RLS v2 §24.3).

---

## 41. Moderation Testing Plan v2

### 41.1 Report tests

- [ ] user может report user;
- [ ] user может report circle;
- [ ] user может report meeting;
- [ ] user может report message;
- [ ] report должен иметь как минимум один target (DB check);
- [ ] reporter видит limited own status (без admin_resolution_note);
- [ ] reported user **не** видит report (RLS deny);
- [ ] admin видит full report server-side.

### 41.2 Block tests

- [ ] user может block другого;
- [ ] user **не может** block себя (DB check);
- [ ] blocked user **не может** request membership в circles blocker'а;
- [ ] block **не уведомляет** blocked user;
- [ ] same-circle block обрабатывается (chat сообщения скрыты bilaterally).

### 41.3 Admin action tests

- [ ] admin может `dismiss_report`;
- [ ] admin может `warn_user` / `restrict_user` / `ban_user`;
- [ ] admin может `remove_circle`;
- [ ] admin может `remove_meeting`;
- [ ] admin может `hide_message`;
- [ ] admin может `freeze_chat`;
- [ ] **serious actions требуют reason** (DB constraint);
- [ ] **каждое moderation action создаёт audit log** (Инв. 4).

### 41.4 AI moderation tests

- [ ] AI flag создаёт queue item (через `moderation_status = 'flagged'`);
- [ ] AI summary admin-only (RLS deny от normal user);
- [ ] AI **не** автоматически банит (Инв. 5);
- [ ] false positive можно `dismiss_report` / `restore_message`.

### 41.5 Circle safety tests

- [ ] unsafe circle переходит в `pending_review` / `removed_for_safety`;
- [ ] first-time host review работает (если enabled);
- [ ] `removed_for_safety` circle скрыт от normal users;
- [ ] members получают safe neutral notification.

### 41.6 Meeting safety tests

- [ ] unsafe meeting `removed_for_safety` / cancelled;
- [ ] meeting starting soon приоритизируется в queue;
- [ ] exact location не leak'ается в notification (RLS v2 §23.3 dispatcher gate).

### 41.7 Membership removal tests

- [ ] removal приватен (removed user видит «Участие завершено», не «Вас исключили»);
- [ ] other members **не видят** public shame label;
- [ ] removed user теряет future access (locations, chat, member list);
- [ ] safety removal создаёт `moderation_action` + `audit_log` + `trust_event` (`circle_removed_for_safety`);
- [ ] **repeated host removals** создают `suspicious_activity_events`.

### 41.8 Chat moderation tests

- [ ] reported message создаёт `reports` запись;
- [ ] `hidden` message не visible normal users;
- [ ] `frozen` chat блокирует writes (Edge Function gate);
- [ ] admin видит контекст сообщения server-side.

### 41.9 Privacy tests

- [ ] report description **не** в analytics payload (validation);
- [ ] exact location **не** в moderation notification body;
- [ ] reporter identity не показан reported user;
- [ ] moderation notes скрыты от normal users (RLS v2 §20).

---

## 42. Moderation Review Checklist Before Beta v2

Все обязательны:

- [ ] report user работает;
- [ ] report circle работает;
- [ ] report meeting работает;
- [ ] report message работает;
- [ ] block user работает;
- [ ] moderation queue существует (admin app);
- [ ] admin может view report detail;
- [ ] admin может take action;
- [ ] serious actions требуют reason;
- [ ] audit logs создаются для всех moderation-sensitive actions (Инв. 4);
- [ ] AI assist configured или planned (без auto-enforcement — Инв. 5);
- [ ] unsafe circle handling defined;
- [ ] unsafe meeting handling defined;
- [ ] circle chat moderation defined;
- [ ] **membership removal privacy defined** (no public shame — Инв. 12);
- [ ] location / privacy incident handling defined;
- [ ] comfort composition handling defined;
- [ ] host abuse handling defined;
- [ ] notification copy safe (no sensitive details — §32);
- [ ] analytics boundary checked (RLS v2 §24);
- [ ] trust integration defined (§33);
- [ ] beta review cadence defined (§35);
- [ ] escalation path defined (§37).

---

## 43. Moderation Risks v2

| Risk | Impact | Mitigation |
|---|---|---|
| Moderation добавлена слишком поздно | критич. | Safety built-in с дня 1; queue до беты |
| Reports игнорируются во время беты | высокий | Daily review cadence; critical немедленно |
| False reports вредят пользователям | высокий | Report ≠ guilt; pattern matters; admin review |
| Admin actions не логируются | высокий | Edge Function обязывает audit; failed audit blocks action |
| AI false positives | средний | Human review для serious; recovery actions |
| AI false negatives | средний | Reports + manual review дополняют AI |
| Unsafe circle approved | высокий | `pending_review` / manual review first-time hosts |
| Unsafe meeting approved | высокий | report priority boost для starting soon; manual review |
| Exact location leak | **критич.** (Инв. 1) | Validation описаний; AI scan; `meeting_locations` отдельная таблица; notification dispatcher gate; RLS tests |
| Host abuse approval / removal | высокий | Reporting + admin review; `frequent_host_removals` signal; host accountability |
| Block behavior неясно в same circle | средний | Edge cases §11 defined; tests |
| Chat harassment после approval | высокий | Report / freeze / restrict; block мгновенный |
| Report data leak'ает не тому | критич. | RLS reports не public; analytics boundary; reporter identity protected |
| Moderation workload слишком высокий | средний | Queue + priorities; AI triage; узкая бета |
| Users perceive app as unsafe | высокий | Visible safety UX; fast response; report / block везде |
| **Over-moderation kills social magic** | средний | Proportionality; recovery; calm copy; не bureaucratic |
| **Under-moderation allows creep behavior** | высокий | Report / block везде; velocity; manual beta review |
| Women-only / comfort composition mishandled | высокий | Validation с женщинами до roll-out (Core v2 §21); careful copy; legal review |
| **Public shame утечки** | критич. (Инв. 12) | Copy review; UI audit; «состав обновился» как maximum для других members |
| **Betrayal mechanics accidentally appear** | критич. (Инв. 11) | Code review; UX audit; no transition notifications; weight=0 для leave/pause trust events |

---

## 44. Open Moderation Questions v2

| # | Вопрос | Связь |
|---|---|---|
| 1 (OD-13) | Все новые circles требуют manual review во время беты? | §17 / §35 |
| 2 (Q-RM) | Может ли host removeить member без admin review? | §20 / §29 |
| 3 (Q-RM-CAT) | Какие reason categories показываются host'у при removal? | §20 |
| 4 (Q-RM-USER) | Какой reason показывается removed user? (общий «Участие завершено» vs categorized) | §20 / §32 |
| 5 (Q-FREEZE) | Может ли host `freeze_chat` или только admin? | §14.12 / §21 |
| 6 (Q-BLK-CIRCLE) | Как block работает, если оба user в одном circle? | §11 |
| 7 (Q-RM2) | Removed user теряет read access к past chat? | §21 |
| 8 (Q-MSG-SNAP) | Snapshot ли body зарепорченного сообщения для admin review? | §10 / §39 |
| 9 (OD-9) | Сколько хранить reports / audit logs? | §39 |
| 10 (Q-RES-UPD) | Получают ли users update при resolve report? | §32 |
| 11 (AQ-RATE) | Какие rate limits в P0? | §22 / §26 |
| 12 (Q-RESTR-SCOPE) | От каких действий блокируется `restricted_user`? | §14.2 / §15 |
| 13 (OD-8) | Как обрабатывать no-show disputes? | §19 / Trust v2 §16 |
| 14 (Q-HOST-CAP) | First-time hosts — limit на capacity / number of active circles? | §29 / §35 |
| 15 (Q-AUTO-PEND) | High-risk circle / meeting descriptions автоматически в `pending_review`? | §17 / §18 |
| 16 (Q-CRIT-WHO) | Кто review'ит critical reports в closed beta? | §36 / §37 |
| 17 (AQ-ADMIN) | Полный moderation dashboard до external беты? | §34 |
| 18 (AQ-MODCAT) | Первый набор AI moderation категорий в P0? | §30 / §7 |
| 19 (Q-UNSAFE-DEF) | Точное определение «unsafe circle»? | §22 |
| 20 (Q-UNSAFE-MEET) | Точное определение «unsafe meeting»? | §23 |
| 21 (Q-MOD-ENUM-EXT) | Расширять ли `moderation_action_type` enum для `review_host_behavior` / `review_comfort_composition`? | §14.17 |
| 22 (Q-COMFORT-VALIDATE) | Как валидировать women-only / female-friendly до P0 enable? | §25 / Core v2 §21 |
| 23 (Q-COMFORT-PROCESS) | Точный процесс enforcement для comfort composition violations? | §25 |
| 24 (Q-HOST-APPEAL) | Как обрабатывать host abuse appeals? | §29 / §38 |
| 25 (Q-APPEAL) | Существуют ли appeals в closed beta? | §38 |

---

## 45. Summary

**Moderation v2:**

- **защищает trusted recurring social circles** через safe operations vокруг circles / meetings / membership / chat / location.
- **report / block / admin queue** — **P0 safety features** (Инв. 6, 7).
- **circle safety, meeting safety, membership removal, chat и location** покрыты.
- **AI ассистирует triage**, **не** решает serious enforcement (Инв. 5).
- **public shame и betrayal mechanics — forbidden** (Инв. 11, 12).
- **closed beta** требует manual safety operations (daily review, first-time host manual review, escalation path).
- **все serious moderation actions → audit logs** (Инв. 4).

**Next required document:**

> Update [`/docs/10_ANALYTICS.md`](10_ANALYTICS.md) to **Analytics v2** ([doc 27 §24 Phase C step 11](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)).

Analytics v2 specifies:

- circle-first event taxonomy;
- funnel events aligned с circle / meeting primitives;
- safety / trust analytics boundary (binding на §40 и RLS v2 §24);
- North Star metric finalization (Core v2 §29);
- forbidden metric directions (no "circles per user" KPI — Инв. 14);
- privacy boundary (no exact location / no raw trust / no report descriptions / no removal labels).

После Analytics v2 → **Phase D Backlog v2** → Sprint 2 phase gate (doc 22) → Sprint 2 product implementation может начаться.

---

> Reminder: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2) — **first source of truth**. Этот документ ему, Schema v2, RLS v2 и Trust v2 подчинён. Любое moderation behavior, нарушающее §2 hard rules (особенно Инв. 1, 3, 4, 5, 6, 10, 11, 12) — **отклоняется на review**. Никакой moderation логики / SQL / migrations / AI SDK подключений в code до Sprint 2 schema + RLS land и Phase D Backlog v2 approved.
