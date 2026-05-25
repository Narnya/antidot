# Phase Gate & Product Decisions v1 — Social Events App

> **Status:** v1 (phase-gate snapshot + product decision register)
> **Owner:** Founder / Product / Technical Founder
> **Last updated:** 2026-05-20

> ⚠️ Этот документ фиксирует **текущий phase gate** и набор **продуктовых решений**, нужных до начала имплементации.
> Источник правил — [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (first source of truth); правила фазы — [`/CLAUDE.md`](../CLAUDE.md) (binding для имплементации).
> Документ **не изменяет** другие документы. При расхождении приоритет: Product Core > CLAUDE.md > downstream docs.

---

## 1. Current Phase

**Current phase:** **Pre-code Design / Product Decision Phase.**

### ✅ Allowed work
- Figma **P0 prototype** (FIG-001).
- Figma **screen naming** по `MOB-### / ADM-###` (Design Handoff §5).
- **Dev Notes** на ключевых P0 фреймах (Design Handoff §6).
- **Product decisions** (см. §6 ниже).
- **Design review** (Figma review по §15 Design Handoff).
- **Prototype testing** (FIG-002, тест с 5–7 людьми).
- **Documentation updates**, если они не противоречат Product Core (CLAUDE.md §4 documentation discipline).

### ⛔ Not allowed yet
- `package.json`;
- monorepo scaffolding;
- React Native app (Expo);
- Next.js admin app;
- Supabase setup / клиент-обвязка;
- DB migrations;
- SQL (схема, seeds);
- backend logic / Edge Functions;
- product UI implementation (мобильные и web экраны);
- analytics SDK подключение;
- AI integrations / провайдеры.

### Reason
[`/CLAUDE.md`](../CLAUDE.md) §6 «Current phase» **явно запрещает** scaffolding/`package.json`/app-кода/UI до явного product decision, разблокирующего следующую фазу. Это binding до апдейта.

---

## 2. Phase Gate Status

**Status: CONDITIONAL GO — Design / Product only.**

- Проект **может продолжать** дизайн и закрытие продуктовых решений (treк A).
- Проект **не должен** стартовать код или инфраструктуру до явной смены phase-gate (§10).

---

## 3. Conflict Resolution

### Конфликт
| Документ | Утверждает |
|---|---|
| [`/docs/11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md) §10/§17 | `INFRA-001` (monorepo) — P0, safe to start в Sprint 1. |
| [`/docs/12_IMPLEMENTATION_READINESS_REVIEW.md`](12_IMPLEMENTATION_READINESS_REVIEW.md) §17/§19/§22 | `INFRA-001` — рекомендуемый первый coding step (CONDITIONAL GO). |
| [`/CLAUDE.md`](../CLAUDE.md) §6 | На текущей фазе **запрещён** scaffolding, `package.json`, RN-app, backend, UI. |

### Decision
**До явного нового phase-gate решения побеждает CLAUDE.md.** Sprint Backlog / Readiness Review остаются корректными как **планы**, но их «safe to start» не активируется автоматически — фазу разблокирует только product decision (§10).

### Required action before infrastructure
Создать явное решение:

> **«Move from Pre-code Design Phase to Infrastructure Phase.»**

Только после этого Claude Code может начать **`INFRA-001`** (monorepo). До этого момента любые запросы на scaffolding/`package.json`/app-кода должны быть остановлены и эскалированы как product decision (CLAUDE.md §3).

---

## 4. Figma P0 Completion Requirement

`FIG-001` — **основная текущая задача** дизайн-фазы. P0 прототип должен покрывать ниже перечисленные пути (см. [`/docs/04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) §9, [`/docs/13_DESIGN_HANDOFF.md`](13_DESIGN_HANDOFF.md) §7).

### User Core Loop
Welcome · Invite Code · Signup/Login · Onboarding · Safety Principles · Home / Discover · Event Detail — Not Applied · Apply Modal · Pending State · Approval Notification · Event Detail — Approved · Exact Location Reveal · Event Chat · Post-event State.

### Host Flow
Create Event · Event Preview · Hosted Event Dashboard · Applications List · Applicant Detail · Approve / Reject · Attendee Management.

### Safety Flow
Public Safe Profile · Report User · Report Details · Report Submitted · Block User · Blocked State.

### Admin Low-fi Flow
Moderation Queue · Report Detail · Admin Action Modal · Audit Log.

### Current status (snapshot на момент документа)
- Файл: «Social Events App — Prototype v1» (Figma).
- **Готово (есть в файле и связано в кликабельный прототип):** Welcome, Invite Code, Safety Principles, Home/Discover, Event Detail — Not Applied / Pending / Approved (с location reveal), Apply Modal, Event Chat, Create Event, Applications List, Applicant Detail, Public Safe Profile, Report User, Block User, Moderation Queue, Report Detail, Prototype flow map. Дизайн-токены (62 переменных + 9 типографических стилей) и компонентная библиотека (Button/Badge/Banner/EventCard/ProfileCard/Notice/EmptyState) — собраны. Flow starting points A/B/C/D заданы.
- **Опционально не сделано (не блокеры для FIG-002):** отдельные под-шаги onboarding (Signup/Login, Basic Profile, Photo Upload, Profile Preview, Onboarding Complete), Event Preview/Hosted Dashboard/Attendee Management как отдельные фреймы, Report Details + Report Submitted + Blocked State + Approval Notification + Post-event State, отдельный Admin Action Modal и Audit Log как screen. Часть из них покрыта существующими экранами/баннерами (например, approval приходит как баннер на Pending; audit показан инлайн на ADM-003).
- **Решение:** считать P0 достаточным для FIG-002 при условии, что недостающие под-состояния задокументированы как открытые items этого документа и не противоречат Product Core. Если FIG-002 покажет провалы понимания — добрать конкретные экраны точечно.

> Эта секция отражает реальный статус; framing «FIG-001 — primary task» сохраняется. Если решение об объёме P0 будет «нужно собрать всё перечисленное буквально» — добор экранов остаётся в дизайн-фазе, до коды это не пускает.

---

## 5. Figma Dev Notes Requirement

На каждом P0-экране должен быть текстовый блок Dev Notes по шаблону ([`/docs/13_DESIGN_HANDOFF.md`](13_DESIGN_HANDOFF.md) §6):

```
Screen
Flow
Role
State
Primary CTA
Secondary actions
Data required
Safety notes
Analytics events
Related docs
Implementation notes
Out of scope
```

**Правила:**
- Имена аналитических событий — строго из таксономии [`/docs/10_ANALYTICS.md`](10_ANALYTICS.md) §31/§32 (не выдумывать).
- В Safety notes явно перечислять, что **скрыто** на экране (exact location, chat, full attendee list, raw trust).
- В Out of scope явно отделять backend/RLS/Edge Functions от UI-only задачи.

---

## 6. Critical Product Decisions for P0 Figma

> Дефолты ниже **рекомендованы** и совместимы с Product Core / safety-инвариантами. Это **не финальные решения** — каждый требует явного «yes/edit/no» от product owner. ID решений соответствуют единому реестру в [`/docs/12_IMPLEMENTATION_READINESS_REVIEW.md`](12_IMPLEMENTATION_READINESS_REVIEW.md) §15.

| # | Decision | Recommended Default | Why | Blocks Figma? | Blocks Coding? |
|---|----------|---------------------|-----|:-------------:|:--------------:|
| 1 (OD-10) | **First beta city / context** | Использовать placeholder beta-city в mock data до выбора реального города. | Дизайн и большинство экранов city-agnostic; реальный город нужен только перед закрытой бетой. | No | Partially (для seed data BETA-005) |
| 2 (OD-1) | **Phone verification timing** | В закрытой бете требовать phone verification **до подачи заявки на событие**. | Safety-first бета, снижает риск fake/spam-аккаунтов; ICP терпим к verification gate. | No, но нужен screen-state «verification required» (MOB-053) | Yes (auth/apply гейт) |
| 3 (Q-RJ) | **Exact location reveal timing** | Раскрывать exact location **сразу после approval** в MVP. | Проще UX и имплементация; вариант «ближе к старту события» можно перенести на P1. **Соответствует Инварианту 1**: показывается только approved. | Yes (Approved state MOB-036) | Yes (location access logic, APP-016) |
| 4 (OD-12) | **Attendee list visibility** | Non-approved пользователи **не видят** полный attendee list. Approved могут видеть **ограниченный preview** approved-участников (только safe-поля), без sensitive data. | Минимизирует риск приватности до старта события; **Инвариант 9** (нет точной локации/идентифицирующих данных). | Yes (Event Detail — Approved) | Yes (RLS на `event_attendees`) |
| 5 (Q-RM) | **Host can remove approved attendee** | Да, host может удалить attendee **с указанием причины**; admin может ревьюить через audit log. Removed attendee теряет доступ к exact location и event chat **немедленно**. | Поддерживает host control (Product Core роль Host); **Инвариант 1/2** — revoke сразу. Причина → **audit log (Инвариант 4)**. | Partially (Attendee management screen) | Yes (`APP-017` revoke logic) |
| 6 (Q-FREEZE) | **Host can freeze chat** | В P0 freeze может **только admin**. Host freeze — P1 / Open decision, если safety-данные потребуют. | Уменьшает risk злоупотребления host-полномочиями в бете; **AI/admin assistance** через moderation queue достаточно. | No | Yes (permission model) |
| 7 (OD-4) | **Post-event chat duration** | **7 дней** после события в MVP. | Время для пост-event reconnect, после — закрытие. **Инвариант 2** соблюдается (чат всё ещё в контексте события). | Yes (post-event expiring state) | Yes (`CHAT-010`) |
| 8 (OD-6) | **Minimum profile completeness for apply** | Required: onboarding complete + city + interests + intent + ≥1 photo (pending or approved moderation) + safety principles accepted + **phone verified** (см. #2). | Балансирует safety и friction; **Инвариант 7** — все требования прозрачны пользователю. | Yes (Profile completion required state MOB-054) | Yes (`APP-005` гейт) |
| 9 (OD-13) | **First-time host manual review** | В закрытой бете **первое событие** от first-time host идёт в `pending_review` и пропускается админом. Последующие — `live` сразу (если нет flag). | Защищает бету от unsafe events; **Инвариант 4/7** — решение admin → audit. | Yes (Publish confirmation — pending_review variant) | Yes (`EVT-012`) |
| 10 (OD-7) | **Co-host in MVP** | Сохранить `cohost` в enum `attendee_role`, **не реализовывать cohost UI** в P0. | enum-резерв ≠ feature; cohost — P1 по PRD §7. | No | No |
| 11 (OD-8) | **No-show logic** | Host может пометить attendance **после события**; `no_show` — **internal-only** trust signal; **публичного негативного ярлыка нет**. Dispute flow — P1. | **Инвариант 3/10** — нет публичного rating / social credit. Host видит badge, не цифру. | Partially (Post-event host action) | Yes (`ATT-001/002`, trust signal) |
| 12 (Q-MSG-SNAP) | **Reported message snapshot** | В MVP допустимо хранить **moderation context/snapshot** репортнутого сообщения, **если** privacy policy это разрешит (LEGAL-001 решение). Иначе — только метаданные. | Snapshot нужен для honest moderation; privacy зависит от LEGAL-001/OD-9. | No | Yes (`reports` data model) |
| 13 (OD-9) | **Audit / report retention** | **Open legal/privacy decision** до старта беты; рекомендация — retention windows определить в LEGAL-001/002. | Регуляторные/privacy ограничения; не безопасно зашивать дефолт без legal-ревью. | No | Yes (before beta) |
| 14 (AQ-RATE) | **P0 rate limits** | Зафиксировать **консервативные** лимиты до имплементации: applications/user/day, messages/event/min, reports/user/day, invite-code attempts/IP/hour. | Защита от velocity-абьюза в бете; конкретные числа — Open. | No | Yes (`APP-005`, `CHAT-005`, `SAFE-005`) |
| 15 (AQ-MODCAT) | **AI moderation provider/setup** | AI moderation — **P0 assistive interface** (advisory), не judge (**Инвариант 5**). Провайдер (OpenAI / Anthropic / иной) выбирается **до Sprint 6**, не блокирует Figma. | Дизайн уже отражает «assistive» лейблы (ADM-002/003); реальный провайдер — реализационное решение. | No | Partially (Sprint 6: `AI-001..003`) |

> Каждый дефолт совместим с safety-инвариантами Product Core (Инв.1–10) и `Сафети`-разделом Sprint Backlog §8. Любое отклонение от дефолтов требует явного product decision и обновления downstream docs (CLAUDE.md §4).

---

## 7. Decisions That Block Figma

Эти решения **обязаны** быть отражены в Figma (без них P0-прототип не закроет FIG-002 success criteria):

- **Exact location reveal timing** (#3) — состояние Event Detail — Approved.
- **Attendee list visibility** (#4) — компонент `AttendeePreview` и его state.
- **Phone verification screen / state** (#2) — Onboarding шаг + «verification required» гейт на Apply.
- **Profile completeness required state** (#8) — гейт на Apply.
- **First-time host `pending_review`** (#9) — состояние Publish Confirmation.
- **Post-event chat duration state** (#7) — баннер «chat expiring».
- **Respectful rejected state** — копи и UX (нет «отказа», есть «не подошло сейчас»).
- **No public trust score** — все профили / applicant detail / host info без чисел.
- **No open DMs** — UI **никогда** не предлагает «написать в личку» вне контекста события.
- **Report / Block visibility** — доступны из profile / event / chat / attendee list (Инвариант 6).

---

## 8. Decisions That Block Coding

Эти решения **обязаны** быть закрыты до старта соответствующей реализации (см. также [`/docs/12_IMPLEMENTATION_READINESS_REVIEW.md`](12_IMPLEMENTATION_READINESS_REVIEW.md) §15 «Must decide before migrations / mobile UI / beta»):

- **Phone verification timing** (#2) — auth / apply гейт.
- **Exact location reveal timing** (#3) — location access logic + RLS.
- **Attendee list visibility** (#4) — RLS на `event_attendees`.
- **Host removal permissions** (#5) — `APP-017` revoke + audit.
- **Post-event chat duration** (#7) — `CHAT-010` expiry.
- **Profile completeness gate** (#8) — `APP-005` гейт.
- **First-time host review** (#9) — `EVT-012` flow.
- **RLS rules** — все политики (`SEC-001..006`).
- **Reported message snapshot policy** (#12) — `reports` data model + LEGAL.
- **Audit / report retention** (#13) — `MOD-002`, ANA, LEGAL.
- **Rate limits** (#14) — `APP-005`, `CHAT-005`, `SAFE-005`.
- **Admin role model** (Q-ADMIN-ROLE) — `ADMIN-001`.

---

## 9. Next Recommended Work

### Primary
**Continue `FIG-001`** — довести P0 Figma clickable prototype:
- если решено собирать буквальный список §4: достроить недостающие отдельные экраны (под-шаги onboarding, Event Preview / Hosted Dashboard / Attendee Management, Report Details/Submitted, Blocked State, Approval Notification, Post-event, Admin Action Modal, Audit Log);
- если решено считать текущий объём достаточным: переход к FIG-002 (юзабилити-тест 5–7 человек, [`/docs/04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) §19).

### Secondary
- **Add Dev Notes** ко всем P0 frames по шаблону §5.
- Зафиксировать **product decisions** §6 (выбрать default / edit / другое).
- Sync Design Handoff / `04_FIGMA_PROTOTYPE_PLAN.md` §4 с фактической 3-страничной структурой Figma (при следующем плановом апдейте доков).

### Do not start
- **`INFRA-001`** и любые другие infra/coding задачи — до явной разблокировки фазы (§10).

---

## 10. Future Phase Gate to Infrastructure

### Title
**«Move from Pre-code Design Phase to Infrastructure Phase.»**

### Pre-conditions to invoke
1. `FIG-001` — P0 Figma prototype завершён и approved (включая critical screens / states из §7).
2. `FIG-002` — тест с 5–7 людьми проведён, результаты позитивны по критериям [`/docs/04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) §19.
3. Закрыты product decisions из §6, которые блокируют код (#2, #3, #4, #5, #7, #8, #9, #11, #12, #13, #14).
4. Human review gates запланированы (location privacy, RLS, trust) — [`/docs/11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md) §26.
5. CLAUDE.md §6 обновлён, разрешая Infrastructure Phase.

### Allowed after approval
- Создание **monorepo folders** (`/apps`, `/packages`, `/supabase`);
- создание **`package.json`** (workspace);
- настройка **TypeScript workspace** (strict);
- **Expo app skeleton** (boot, без экранов и логики);
- **Next.js admin skeleton** (boot, **service role server-side only**);
- **placeholder shared packages** (ui/types/validators/config/analytics — пустые каркасы);
- lint/format, env-templates, CI basic checks.

Соответствует `INFRA-001..015` в [`/docs/11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md) §10 и safe-to-start списку [`/docs/12_IMPLEMENTATION_READINESS_REVIEW.md`](12_IMPLEMENTATION_READINESS_REVIEW.md) §17.

### Still NOT allowed until later phase gates
- **Business logic** (auth-гейты, application flow, approval, chat и т.д.);
- **Database migrations** (любые `.sql` файлы в `/supabase/migrations`);
- **RLS policies** (реальные политики на таблицах);
- **Exact location logic / reveal** — за отдельным human review gate;
- **Trust scoring** реализация;
- **Moderation enforcement automation**;
- **Product UI screens** без прохождения Figma review (Design Handoff §15).

Эти пункты требуют последующих явных phase gates и/или human review (Backlog §26).

---

## 11. Summary

- **Current phase остаётся pre-code** (Design / Product Decision Phase).
- **Figma P0 prototype (`FIG-001`)** — текущий приоритет; CONDITIONAL GO даёт Design/Product track, не code.
- **CLAUDE.md §6 binding**: scaffolding / `package.json` / RN-app / backend / UI **запрещены** до явного нового phase gate.
- **Infra / scaffolding** требуют явного будущего решения «Move from Pre-code Design Phase to Infrastructure Phase» (§10).
- **Product decisions §6** задокументированы с safe defaults — каждый требует подтверждения product owner до соответствующего unblock (Figma / coding).

---

> Напоминание: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth; [`/CLAUDE.md`](../CLAUDE.md) — binding для имплементации. Этот документ им подчинён. Код приложения, `package.json`, SQL, миграции, SDK **не создавались**; другие документы **не изменялись**.
