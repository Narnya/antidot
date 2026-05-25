# Implementation Readiness Review v1 — Social Events App

> **Status:** v1 (pre-implementation review)
> **Owner:** Technical Founder / Product / Safety Reviewer
> **Last updated:** 2026-05-18
> **Reviewer note:** Этот документ только оценивает готовность. Он **не изменяет** другие документы; найденные несоответствия описаны с correction path, но не исправлены автоматически.

---

## 1. Review Summary

- **Documentation status:** все 12 foundational-документов (`00`–`11`) + `CLAUDE.md` существуют и заполнены подробно; placeholders не осталось.
- **Внутренняя согласованность:** высокая. Все документы явно подчинены Product Core, ссылаются на него как first source of truth, не нарушают safety-инварианты. Прямых противоречий с Product Core **не обнаружено**.
- **Готовность к реализации:** документация design-уровня (schema/RLS/Edge Functions — blueprints, не код). Этого достаточно для инфраструктурного спринта, но **не** для product/security logic, пока не закрыты P0 open decisions и не сделан P0 Figma-прототип.

### Recommended decision: **CONDITIONAL GO**

Можно начинать **только Sprint 1 / Infrastructure** (repo, skeletons, packages, env-шаблоны, CI) — это не трогает product logic, location privacy, RLS или sensitive-данные. Product logic, миграции схемы, RLS-политики, location reveal, auth-гейты — **заблокированы** до:
1. закрытия критичных P0 open decisions (OD-1, OD-3, OD-4, OD-6, OD-9, OD-10, OD-13);
2. готового P0 Figma clickable-прототипа (FIG-001) + теста (FIG-002);
3. human review gates: location privacy design, RLS policies, trust logic.

- **Main blockers:** не «противоречия», а **нерешённые product decisions** + **отсутствие собранного Figma-прототипа** (есть только план). Это ожидаемое состояние early-stage и не является NO-GO.
- **Next recommended step:** Sprint 1 / **INFRA-001 — Initialize monorepo structure** (safe), параллельно — резолюция P0 open decisions владельцем продукта.

---

## 2. Documents Reviewed

| Document | Exists? | Purpose | Status | Notes |
|----------|:-------:|---------|--------|-------|
| `00_PRODUCT_CORE.md` | ✅ | First source of truth: концепция, loop, safety-инварианты | complete | Стабилен; не менялся |
| `01_PRD.md` | ✅ | Требования MVP, scope, non-goals, OD-1..13 | complete | 74 FR, согласован с Core |
| `02_USER_STORIES.md` | ✅ | Stable Story IDs (US-*), P0/P1/P2, edge cases | complete | Traceability + coverage checklist |
| `03_USER_FLOWS.md` | ✅ | FLOW-001..024, location privacy matrix | complete | Forward-refs на Stories закрыты |
| `04_FIGMA_PROTOTYPE_PLAN.md` | ✅ | Screen inventory, P0 specs, build order | complete (plan) | **Прототип не собран** (только план) |
| `05_ARCHITECTURE.md` | ✅ | Stack, domains, Edge Functions, environments | complete | Readiness checklist §32 |
| `06_DATABASE_SCHEMA.md` | ✅ | Таблицы/enums/views/indexes (blueprint) | complete (blueprint) | Миграции не созданы (намеренно) |
| `07_SECURITY_RLS.md` | ✅ | RLS strategy, access matrix, policy blueprints | complete (blueprint) | Реальные policies не написаны (намеренно) |
| `08_TRUST_SYSTEM.md` | ✅ | Internal trust, badges, guardrails | complete | Rule-based MVP, без raw score |
| `09_MODERATION.md` | ✅ | Report/queue/actions/audit/AI assist | complete | Beta safety operations определены |
| `10_ANALYTICS.md` | ✅ | NSM, taxonomy >80 events, privacy boundary | complete | Privacy boundary строгий |
| `11_SPRINT_BACKLOG.md` | ✅ | Sprint 0–7, P0 list, deps, guardrails | complete | DOC-001..011 ✅ |
| `CLAUDE.md` | ✅ | Operating rules, hard rules, pre-task checklist | complete | Binding для Claude Code |

Все документы — **complete**. Один уточняющий статус: `04` — план полный, но **сам прототип не существует** (это не дефект документа, а gating-артефакт для product UI).

---

## 3. Source of Truth Consistency

| Topic | Product Core Decision | Other Docs Alignment | Issue? | Recommendation |
|-------|-----------------------|----------------------|:------:|----------------|
| Product loop | Discover→Apply→Approve→Attend→Reconnect | PRD/Stories/Flows/Backlog все строят вокруг него | Нет | — |
| Target user | Городские 22–38, не dating | PRD §3 personas, Figma copy anti-dating | Нет | — |
| MVP scope | Auth/Onb/Profiles/Events/Apps/Chat/Safety/Trust/Beta | PRD §6, Backlog Sprint 2–7 | Нет | — |
| Non-goals | Без payments/DMs/dating/… | PRD §7, Stories §7, Backlog §20 | Нет | — |
| Safety invariants 1–10 | Заданы в Core | Прокинуты во все docs | Нет | — |
| No open DMs | Запрещено | Schema (только event_chat), Security §15, Backlog CHAT-004 | Нет | — |
| Location privacy | Exact только approved | Schema `event_locations`, Security §12, Flows §9 | Нет | RLS-тесты обязательны |
| No raw trust score | Internal only | Trust §11/§12, Schema `user_trust_summary` admin-only | Нет | — |
| No public ratings | Запрещено | Trust §10/§30, Stories P2 | Нет | — |
| No dating mechanics | Запрещено | Figma copy guidelines, Stories P2 | Нет | — |
| No payments/tickets | Запрещено в MVP | PRD §7, Backlog §20 | Нет | — |
| Invite-only beta | Да | Backlog BETA-001..003, Security §20 | Нет | — |
| Mobile-first | iOS+Android, web только admin | Architecture §2/§7, Figma | Нет | — |
| Admin dashboard | Web only, server-side | Architecture §19, Security §27 | Нет | — |
| AI moderation assistant only | Не judge | Moderation §26, Trust §20, Security §28 | Нет | — |

**Вывод:** сквозная согласованность с Product Core подтверждена. Противоречий нет. Единственное наблюдение — см. §15: open-decision ID нумеруются локально по-разному в разных документах (OD-* / Q-* / AQ-*) — это не противоречие, но стоит консолидировать в едином реестре (этот документ §15 выполняет роль такого реестра).

---

## 4. MVP Scope Consistency

### Confirmed P0 (в MVP)
Auth (email/Google/Apple, sessions, protected routes, banned gate) · invite-only + waitlist · onboarding + safety acceptance · profiles + safe view + photos (moderation) · phone verification (timing — OD-1) · events (create/discovery/detail, **approximate location**) · **protected exact location** · applications (apply/approve/reject/waitlist) · attendee management · **location reveal только approved** · event chat (approved-only, no open DM) · report/block · trust foundations (internal, badges) · moderation queue + admin actions + audit logs · AI moderation assist (advisory) · analytics core events · crash monitoring · privacy/terms.

### Confirmed P1 (после беты)
Smart post-event intros (shared-context only) · recommendations · recurring events · co-hosts · richer host tools · host analytics · advanced trust signals · community circles · admin risk dashboard · appeals flow · privacy automation · stronger identity verification · event media · notification preferences · advanced AI moderation.

### Confirmed P2 / Deferred (запрещено без product decision)
payments · tickets · paid events · premium hosts · public followers · **public ratings** · **dating mechanics** · **open DMs** · nightlife/party · **exact public map pins** · **live location** · large marketplace · business networking · monetization · enterprise admin.

**P2-leak check:** просмотрены P0 ticket list (`11` §18) и все Sprint 2–7 тикеты — **ни один P2-пункт не попал в P0**. `event_visibility` enum содержит `unlisted/private`, `attendee_role` содержит `cohost`, `verification_level` содержит `identity_reviewed` — но они **явно помечены как зарезервированные, не используемые логикой MVP** (Schema §3/§5). Это допустимо (enum-резерв ≠ feature). ✅

---

## 5. Safety Invariant Audit

| # | Invariant | Covered in Docs? | Covered in Backlog? | Risk | Notes / Required Action |
|---|-----------|:---------------:|:-------------------:|:----:|--------------------------|
| 1 | Exact location не виден non-approved | ✅ Schema §8.3/§20, Security §12, Flows §9 | ✅ EVT-003/015, APP-016, SEC-001 | high | RLS-тесты обязательны до product release |
| 2 | No open DMs | ✅ Schema (только event_chat), Security §15 | ✅ CHAT-004/007 | medium | Архитектурно нет DM-механизма |
| 3 | Raw trust score не показывается | ✅ Trust §11/§12, Schema §13.2 | ✅ TRUST-006, SEC-004 | high | Тест: нет в view/API/analytics |
| 4 | Нет публичных негативных ярлыков | ✅ Trust §10/§30 | ✅ DoD §7 | medium | UX-review копи |
| 5 | Нет public ratings | ✅ Trust §10, Stories §7 | ✅ §20 P2 | low | Запрещено архитектурно |
| 6 | Нет dating mechanics | ✅ Figma §14/§15 | ✅ §20 P2 | medium | UX-копи + categories enum |
| 7 | Нет payments/tickets в MVP | ✅ PRD §7 | ✅ §20 P2 | low | Не в схеме |
| 8 | Moderation-sensitive → audit log | ✅ Moderation §27, Schema §12.2 | ✅ MOD-010, SEC-005 | high | audit append-only; тест |
| 9 | AI assistant, не judge | ✅ Moderation §26, Trust §20 | ✅ AI-001..003 | medium | Human review для serious |
| 10 | Blocked не взаимодействуют | ✅ Security §16, Moderation §11 | ✅ SAFE-003, QA-003 | medium | Edge cases определены |
| 11 | Banned не взаимодействуют | ✅ Security §6/§7 | ✅ AUTH-007, SEC-006 | high | Session invalidation тест |
| 12 | Service role не на клиенте | ✅ Architecture §8.2, Security §22 | ✅ INFRA-007, SEC-006 | critical | CI secret-check обязателен |
| 13 | Notifications не утекают sensitive | ✅ Security §21, Moderation §28 | ✅ APP-018, QA-002 | high | Payload без exact location |
| 14 | Analytics не утекают sensitive | ✅ Analytics §33, Security §22 | ✅ ANA-007, QA-002 | high | Privacy boundary тест |
| 15 | Admin-only данные не из mobile | ✅ Architecture §19, Security §9 | ✅ ADMIN-001, SEC-006 | high | Web-only admin |

**Все 15 инвариантов покрыты в документах и в backlog.** Остаточный риск — **реализационный** (RLS/тесты ещё не написаны), не документационный. Required action: SEC-001..006 + QA-002/003 должны быть зелёными до product release (не до infra-старта).

---

## 6. Location Privacy Readiness

| Проверка | Статус |
|----------|:------:|
| Exact location вынесен в `event_locations` (1:1) | ✅ Schema §8.3 |
| `events` содержит только approximate | ✅ Schema §8.2 |
| `public_events_view` без exact | ✅ Schema §17.2 |
| `approved_event_details_view`/function требует approval | ✅ Schema §17.3, Security §11 |
| Application status управляет доступом | ✅ Security §12, Flows §9 |
| pending/waitlisted/rejected не читают `event_locations` | ✅ Security §9/§12 (RLS blueprint) |
| Notifications без exact для non-approved | ✅ Security §21, Architecture §16 |
| Analytics без exact | ✅ Analytics §33 |
| RLS-тесты запланированы | ✅ Backlog SEC-001, §23 |

**Verdict: Ready (design) / Needs implementation tests.** Дизайн location privacy полон и согласован. Перед product release обязательны тесты:
- non-approved/pending/waitlisted/rejected **не** читают `event_locations`;
- approved читает exact **только** для своего approved события;
- removed attendee теряет доступ;
- host читает только своё событие;
- notification body не содержит exact для non-approved.

Открытый вопрос, влияющий на UX (не на безопасность): **Q-RJ** — exact раскрывается сразу после approval или ближе к старту. Не блокирует infra, влияет на APP-016.

---

## 7. Security / RLS Readiness

| Area | Readiness | Risk | Missing Detail | Recommendation |
|------|-----------|:----:|----------------|----------------|
| profiles | design ✅ | medium | allowlist полей view финализировать в миграции | RLS test SEC-003 |
| profile_private_details | design ✅ | high | нужны ли legal_name/DOB в MVP (privacy minimization) | решить до PROF-001 миграции |
| events | design ✅ | medium | — | — |
| event_locations | design ✅ | **critical** | политика точечная — финализировать предикаты | SEC-001 обязателен |
| event_applications | design ✅ | high | смена статуса только Edge Function | подтвердить в APP-005/011 |
| event_attendees | design ✅ | medium | OD-12 (видимость списка) | решить до APP-010 |
| event_chat_messages | design ✅ | high | helper `is_approved_attendee` | SEC-002 |
| reports | design ✅ | high | reporter identity protection | SEC-005 |
| user_blocks | design ✅ | medium | Q-BLK обратимость | решить до SAFE-002 |
| trust_events | design ✅ | high | — | SEC-004 |
| user_trust_summary | design ✅ | high | derived vs stored (Q-TIER-STORE) | решить до TRUST-002 |
| moderation_actions | design ✅ | high | reason обязателен | MOD-010 |
| audit_logs | design ✅ | high | append-only enforcement | SEC-005 |
| storage | design ✅ | medium | signed URL TTL значения | финализировать в PROF-002 |
| admin dashboard | design ✅ | **critical** | admin role model (Q-ADMIN-ROLE) | решить до ADMIN-001 |

RLS-first стратегия, table access matrix, profile/location/chat/report/trust boundaries, RLS test backlog, service-role-exposure mitigation — **все описаны** (`07` §8/§9/§23/§30 + `11` §23). Реальных policies нет (намеренно). **Вывод:** Security дизайн готов; реализация RLS — за human review gate (CLAUDE.md §3, Backlog §26).

---

## 8. Database Schema Readiness

| Проверка | Статус |
|----------|:------:|
| Enums defined | ✅ §5 (18 enums) |
| Core tables defined | ✅ §6–§16 (27 таблиц) |
| Relationships clear | ✅ §18 (map + ERD) |
| Sensitive fields separated | ✅ exact→`event_locations`, trust→`user_trust_summary` |
| Indexes planned | ✅ §21 |
| Views planned | ✅ §17 |
| Constraints planned | ✅ §22 (DB vs Edge Function разделено) |
| Migration order planned | ✅ §29 |
| Seed data planned | ✅ §26 |
| Testing requirements defined | ✅ §30 |

### Ready for migration planning
event_categories · cities · interests · profiles (базовые поля) · events (approximate) · event_locations (структура) · event_applications · event_attendees · event_chat_messages/states · user_blocks · reports · moderation_actions · audit_logs · trust_events · invite_codes · notifications.

### Needs decision before migration
- `event_locations` separation — дизайн ок, подтвердить «отдельная таблица vs encrypted fields» (**AQ-LOC**, текущее решение — отдельная таблица, рекомендую зафиксировать).
- `public_profiles_view` / `public_events_view` — финализировать точный allowlist полей (**OD-3** влияет на profile view).
- cohost role — оставить зарезервированным, не использовать (**OD-7**).
- phone verification timing — **OD-1** (влияет на `profile_private_details`, application-гейт).
- attendee list visibility — **OD-12** (влияет на `event_attendees` RLS).
- post-event chat retention — **OD-4 / Q-CHAT-RET**.
- reported message snapshot policy — **Q-MSG-SNAP** (влияет на `reports`/`event_chat_messages`).
- legal_name/DOB необходимость — privacy minimization решение до `profile_private_details`.
- trust_tier stored vs derived — **Q-TIER-STORE**.
- retention windows — **OD-9** (audit/reports/analytics).

Схема готова к **планированию** миграций; миграции **не создавать**, пока перечисленные решения не закрыты + human review RLS.

---

## 9. Architecture Readiness

Покрыто полностью (`05`): mobile (§7), backend/Supabase (§8), Edge Functions (§8.3), storage (§15), realtime (§14), notifications (§16), admin (§19), analytics (§20), AI moderation (§21), CI/CD (§25), environments (§24), testing strategy (§26).

### Can start now (safe)
Monorepo structure · TypeScript workspace · Expo skeleton · Next.js admin skeleton · shared packages · env-variable strategy/templates · CI basic checks · EAS config · design tokens · navigation skeleton · Supabase client wrapper (anon/auth, без service role) · Sentry/PostHog **config plan placeholders** (без подключения).

### Must wait (нужны product/security решения)
DB migrations · RLS policies · Edge Functions реализация (approve/reveal/report/moderation) · auth-гейты (OD-1) · location reveal · trust scoring · AI enforcement behavior · notification content · analytics с реальными properties.

**Verdict:** архитектура **готова для Sprint 1**; **готова для product logic по дизайну**, но реализация product logic — за decision-closure + human review. Архитектурных блокеров нет.

---

## 10. Trust System Readiness

| Проверка | Статус |
|----------|:------:|
| Trust philosophy | ✅ §4 |
| Raw score internal only | ✅ §11/§12 |
| Trust events defined | ✅ §7 (12 типов) |
| Trust tiers defined | ✅ §9 |
| Public badges defined | ✅ §10 |
| No public negative labels | ✅ §30 |
| No social credit | ✅ §3/§12 |
| Verification model | ✅ §13 |
| No-show model (MVP-достаточно) | ⚠️ §16 — структура есть, метод фиксации открыт |
| Host feedback boundaries | ✅ §17 |

### Ready
Философия, internal-only score, trust_events, tiers, badges allowlist, guardrails, verification states, host feedback приватность.

### Needs decision
- Reliable attendee threshold (Q-RA-THR) — можно дефолтить и тюнить в бете.
- Trusted host threshold (Q-TH-THR) — P1-уровень.
- No-show confirmation method (**OD-8**) — нужно до ATT-001/002 реализации.
- No-show dispute в MVP (Q-NS-DISP) — можно отложить до беты.
- Host видит attended count или только badge (Q-HOST-VIS) — влияет на APP-010.
- trust_tier stored vs derived (Q-TIER-STORE) — влияет на схему.

Trust не блокирует infra; блокирует TRUST-*/ATT-* product-тикеты до OD-8 и Q-TIER-STORE.

---

## 11. Moderation Readiness

Покрыто полностью (`09`): categories (§7), priorities (§8), lifecycle (§9), block flow (§11), queue (§12), admin review (§13), actions (§14), enforcement levels (§15), audit logging (§27), event/chat/profile moderation (§16–19), AI (§26), unsafe event (§20), location incident (§21), beta safety operations (§31).

**Проверки safety:** все serious actions требуют reason ✅ (§14/§17), все moderation-sensitive → audit log ✅ (§27, MOD-010), AI не делает финальный ban ✅ (§26, Инвариант 5), report data privacy ясна ✅ (§35).

**Verdict:**
- Moderation **готова для closed beta** по дизайну.
- Moderation dashboard **должен быть построен до входа внешних юзеров** (Backlog Sprint 6, до Sprint 7 beta launch) — подтверждено как P0.
- Что P0: report user/event/message, block, moderation queue, admin actions + reason, audit logs, AI assist (advisory), unsafe event handling, location incident handling.
- Open: AI provider/setup и первый набор категорий (**AQ-MODCAT**), P0 rate limits (**AQ-RATE**), кто ревьюит critical в бете (Q-CRIT-WHO), appeals в бете (Q-APPEAL).

---

## 12. Analytics Readiness

Покрыто полностью (`10`): NSM (§5), activation funnel (§12), core loop analytics (§11), event taxonomy >80 events (§32), dashboard plan (§29), privacy boundary (§33), instrumentation maps (§30/§31), QA (§34), beta success metrics (§36).

### Must instrument before beta
signup/onboarding/profile completion · event_viewed/created/published · application created/approved/rejected/waitlisted · event_chat_opened/message_sent/reported · report_created/block_created/moderation_action_taken · phone_verified/attendance_confirmed/no_show_recorded · invite_code_used/waitlist_joined/beta_access_granted · crash monitoring.

### Can instrument after beta
event_card_seen (шум — Q-CARD-SEEN) · advanced retention cohorts · experiment analytics · trust internal tier analytics детализация.

**Privacy check:** §33 явно запрещает exact location / raw message body / report description / moderation notes / raw trust score / private profile data в analytics. Согласовано с Security §22 и Trust §33. ✅

Open: safety quality multiplier формула (Q-NSM-FORMULA), admin analytics проект (AQ-ADMIN-PROJECT), identity merge (Q-IDENTITY-MERGE) — ни один не блокирует infra.

---

## 13. Sprint Backlog Readiness

| Проверка | Статус |
|----------|:------:|
| Sprint 0–7 structure | ✅ §4/§9–16 |
| P0 tickets ясны | ✅ §18 |
| Dependencies ясны | ✅ §21 |
| Safety-critical tickets идентифицированы | ✅ §22 |
| RLS tests включены | ✅ §23 |
| Analytics implementation включена | ✅ §24 |
| QA plan включён | ✅ §25 |
| Human review gates включены | ✅ §26 |
| Claude Code usage plan включён | ✅ §27 |
| Closed beta criteria включены | ✅ §29 |

**Verdict:** backlog **готов для Sprint 1**. Missing tickets не обнаружено для P0-объёма. Dependencies непротиворечивы (§21). P0/P1/P2 конфликтов нет (см. §4 P2-leak check). Единственная зависимость-предупреждение: многие Sprint 2+ тикеты несут «AC / Safety» с OD-ссылками — это корректно (decisions трекаются), но владельцу продукта нужно закрыть OD до соответствующих спринтов, а не до Sprint 1.

---

## 14. Figma / Design Readiness

| Проверка | Статус |
|----------|:------:|
| Figma Prototype Plan существует | ✅ `04` |
| P0 clickable prototype определён | ✅ план (§9 Backlog FIG-001) |
| Core loop screens определены | ✅ `04` §7 |
| Event detail states определены | ✅ `04` §12 |
| Location privacy UI определён | ✅ `04` §13 |
| Report/block UI определён | ✅ `04` §11.13/§11.14 |
| Host review UI определён | ✅ `04` §11.11 |
| Admin moderation UI определён | ✅ `04` §11.15/§11.16 |

**Status: Figma plan complete; clickable prototype draft needed (FIG-001 не выполнен).**

- **Figma не блокирует infrastructure** (Sprint 1 не зависит от прототипа).
- **Figma блокирует product UI implementation** — нельзя строить product-экраны (onboarding/discovery/event detail/apply/chat) без собранного и протестированного P0-прототипа (FIG-001 → FIG-002).

Recommendation: repo setup можно начинать **до** Figma; product screens — **только после** FIG-001/FIG-002 + human UX review.

---

## 15. Open Decisions Inventory

Консолидированный реестр (источники: PRD §21, Stories §11, Flows §13, Trust §37, Moderation §40, Analytics §42, Backlog §31). ID не были полностью унифицированы между документами — рекомендация: считать **этот раздел** единым реестром.

### Must decide before coding (Sprint 1 не блокируют, но нужны до product-логики)
*Нет решений, блокирующих сам infra-старт.* Перед началом product logic (Sprint 2+) нужны решения ниже.

### Must decide before migrations (Sprint 2–3 schema/RLS)
- **OD-1** — phone verification до apply или до approval.
- **OD-3** — host видит safe или full applicant profile (влияет на `public_profiles_view`/applicant detail).
- **OD-12** — approved видят attendee list до события (влияет на `event_attendees` RLS).
- **AQ-LOC** — exact location: отдельная таблица (текущее) vs encrypted fields — зафиксировать.
- **Q-TIER-STORE** — trust_tier stored vs fully derived.
- **OD-9** — retention reports/audit/analytics.
- legal_name/DOB необходимость в MVP (privacy minimization).
- **Q-MSG-SNAP** — снапшот reported message body.

### Must decide before mobile UI (Sprint 3–5 screens)
- **Q-RJ** — exact location сразу после approval или ближе к старту.
- **OD-6** — минимальный profile completeness для apply.
- **OD-4** — длительность post-event chat.
- **Q-HOST-VIS** — host видит attended count или только badge.
- **Q-REJ-TONE / Q-DATING-COPY** — тон rejected / анти-dating копи.

### Must decide before closed beta (Sprint 6–7)
- **OD-10** — первый beta city.
- **OD-13** — все first-time host события через manual review.
- **AQ-RATE** — P0 rate-limit значения.
- **AQ-MODCAT** — AI moderation provider/setup + первый набор категорий.
- **Q-FREEZE** — host может freeze чат или только admin.
- **Q-RM / Q-RM2** — host удаляет approved attendee / read истории чата.
- **OD-8** — метод фиксации no-show.
- **Q-BRAND** — имя/брендинг для беты.
- **Q-LEGAL** — legal/privacy шаблоны.
- **Q-CRIT-WHO** — кто ревьюит critical reports в бете.

### Can defer to P1
- **OD-7** — co-hosts (гипотеза: нет).
- **Q-APPEAL** — appeals workflow.
- **Q-NS-DISP** — no-show dispute.
- **Q-RA-THR / Q-TH-THR** — точные badge-пороги.
- **Q-BLK** — обратимость block (можно дефолтить «reversible»).
- **Q-IMG** — event images.
- **Q-NSM-FORMULA** — точная safety multiplier формула.

---

## 16. Implementation Blockers

| Blocker | Severity | Blocks What? | Related Docs | Recommendation | Owner |
|---------|:--------:|--------------|--------------|----------------|-------|
| P0 product decisions не закрыты (OD-1/3/6/9/12/13, AQ-LOC, Q-TIER-STORE) | high | Schema migrations, RLS, auth-гейты, applicant UI | `06`,`07`,`08`, §15 | Закрыть как product decisions до Sprint 2/3 (CLAUDE.md §3) | Founder/Product |
| P0 Figma прототип не собран (FIG-001) + не протестирован (FIG-002) | high | Product UI implementation (Sprint 2+ screens) | `04`, Backlog §9 | Собрать прототип параллельно с Sprint 1 infra | Designer/Founder |
| Human review gates не пройдены (location privacy, RLS, trust logic) | high | Реализация security-sensitive логики | `11` §26 | Запланировать review до Sprint 3 product logic | Technical Founder / Safety |
| Open-decision ID не унифицированы между документами | low | Трассируемость (не функциональность) | все docs | Использовать §15 как единый реестр; при будущем обновлении docs — выровнять ID (вручную, не авто) | Product |
| Beta city / branding / legal не выбраны | medium | Beta launch (Sprint 7), не раньше | §15 | Решить до Sprint 7 | Founder |

**Критических (NO-GO) блокеров нет.** Все блокеры — ожидаемые decision/design-gating, не противоречия и не нарушения safety. Infra-старт ими не блокируется.

---

## 17. Safe-to-Start Tasks

Можно начинать без риска даже при открытых decisions (не трогают product logic / security-sensitive поведение):

- INFRA-001 monorepo structure (сохранить `/docs`);
- INFRA-002 TypeScript workspace (strict);
- INFRA-003 пустой Expo app (boot, без экранов/логики);
- INFRA-004 пустой Next.js admin (boot, без service role);
- INFRA-005 shared packages placeholders (types/validators/config/analytics/ui — пустые каркасы);
- lint/format tooling;
- env-variable **templates** (`.env.example`, без реальных секретов);
- placeholder `/supabase/{migrations,functions,seed,tests}` структура (пустые папки, без SQL);
- CI basic checks (TS/lint);
- design token placeholder (из Figma §5 ролей, без финальных hex);
- testing folder structure.

Эти задачи **не реализуют** product logic, location privacy, RLS, auth-гейты или sensitive-поведение.

---

## 18. Not Safe to Start Yet

Нельзя начинать до закрытия decisions + human review:

- реальные RLS policies;
- database migrations для спорной схемы (`event_locations`, `profile_private_details`, `user_trust_summary`, attendee visibility);
- exact location reveal logic;
- auth-гейты, зависящие от OD-1 (verification timing);
- trust scoring формула / trust_tier деривация;
- moderation enforcement automation;
- AI auto-enforcement;
- notification content (риск location leak);
- analytics instrumentation с реальными properties;
- public profile поля (OD-3);
- event attendee visibility (OD-12);
- no-show penalties / логика (OD-8).

---

## 19. Recommended First Coding Step

**Sprint 1 / INFRA-001 — Initialize monorepo structure only.**

Scope: создать структуру папок (`/apps/mobile`, `/apps/admin`, `/packages/{ui,types,validators,config,analytics}`, `/supabase/{migrations,functions,seed,tests}`), **сохранить `/docs`**, добавить placeholder-каркасы apps/packages. **Без** business logic, **без** migrations, **без** schema, **без** auth, **без** product screens.

Почему безопасно: не трогает product logic; не рискует location privacy; не раскрывает данные; не зависит ни от одного открытого decision; создаёт фундамент для последующей работы; полностью обратимо.

---

## 20. Claude Code Guardrails for Implementation

Перед **каждым** coding task Claude обязан заявить (CLAUDE.md §1):
1. Какая фича/задача реализуется.
2. Какие docs применимы.
3. Какие safety-инварианты применимы.
4. Какие файлы будут изменены.
5. Трогает ли задача sensitive-данные.
6. Нужен ли RLS/security review.
7. Какие тесты нужны.
8. Что явно вне scope.

Claude **не должен**: молча добавлять P1/P2 фичи · добавлять open DMs · добавлять payments/tickets · раскрывать exact location · раскрывать raw trust score · создавать public ratings · добавлять dating mechanics · раскрывать service role · слать sensitive в analytics · делать AI финальным судьёй для serious enforcement. При конфликте удобства реализации и Product Core — приоритет Product Core; при неясности — surface decision, не «додумывать» (CLAUDE.md §2/§3).

---

## 21. Recommended Next Prompts

**Поскольку статус CONDITIONAL GO:**

Параллельный трек A (product owner, без кода):
1. Закрыть «Must decide before migrations» decisions (§15) как явные product decisions.
2. Собрать P0 Figma прототип (FIG-001) → тест с 5–7 людьми (FIG-002).
3. Назначить human review gates (location privacy, RLS, trust).

Трек B (coding, безопасно начинать сейчас):
1. INFRA-001 — Initialize monorepo structure.
2. INFRA-002 — TypeScript workspace.
3. INFRA-003 — Expo app skeleton.
4. INFRA-004 — Next.js admin skeleton.
5. INFRA-005 — shared packages placeholders.
6. INFRA-006/007/008 — Supabase env structure (placeholders) / env templates / CI basics.

**Только после треков A+B и review:** первая миграция (после schema/RLS decision review), затем auth (после OD-1 ясности).

(Если бы статус был NO-GO: resolve blockers → manually update affected docs → re-run этот review. Здесь не применимо.)

---

## 22. Final Readiness Decision

**Status: CONDITIONAL GO**

**Reason:** Вся foundational-документация (`00`–`11` + `CLAUDE.md`) полна, внутренне согласована и не нарушает Product Core или 15 safety-инвариантов. Критических противоречий или missing docs нет. Однако ряд **P0 product decisions** не закрыт, а **P0 Figma прототип не собран** — этого достаточно, чтобы безопасно начать **только infrastructure**, но не product/security logic.

**Next action:** Запустить параллельно — (A) резолюцию «before migrations» decisions владельцем продукта + сборку FIG-001/002, (B) Sprint 1 / **INFRA-001 — Initialize monorepo structure**.

**Expected next file/task:**
- No file changes кроме `/docs/12_IMPLEMENTATION_READINESS_REVIEW.md` (этот документ).
- Next coding task: **INFRA-001 — Initialize monorepo structure** (safe, без product logic / migrations / SDK).

> Напоминание: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth. Документы не изменялись; код/SQL/migrations/SDK не создавались.
