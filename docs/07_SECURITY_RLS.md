# Security & RLS v1 — Social Events App

> **Status:** v1 (security blueprint for closed beta)
> **Owner:** Technical / Security
> **Last updated:** 2026-05-18

---

## 1. Source of Truth

- Документ основан на [`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md), [`01_PRD.md`](01_PRD.md), [`02_USER_STORIES.md`](02_USER_STORIES.md), [`03_USER_FLOWS.md`](03_USER_FLOWS.md), [`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md), [`05_ARCHITECTURE.md`](05_ARCHITECTURE.md), [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md).
- **[`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth.** При конфликте приоритет у Product Core.
- Security/RLS **не нарушает** safety-инварианты (Инварианты 1–10).
- Документ — основа будущих Supabase RLS policies, Edge Function guards и security tests. **SQL/migrations создаются позже.**
- Нерешённые развилки — в [§33 Open Security Questions](#33-open-security-questions), не «додуманы» молча (CLAUDE.md §3).

> ⚠️ Blueprint, не реализация. Политики ниже — natural-language/pseudocode. `.sql`/migrations/код не создаются.

**Product security invariants (binding):** ① exact location не виден non-approved · ② no open DMs · ③ raw trust score не виден пользователям · ④ moderation-sensitive действия логируются · ⑤ AI — assistant, не judge · ⑥ blocked не взаимодействуют · ⑦ banned не взаимодействуют · ⑧ service role не на клиенте · ⑨ admin-only данные недоступны из mobile · ⑩ notifications/analytics не утекают sensitive.

---

## 2. Security Goals

1. Защитить exact event location.
2. Защитить private profile data.
3. Event chat только approved attendees.
4. Не допустить open DMs.
5. Защитить raw trust score.
6. Защитить reports, moderation_actions, audit_logs.
7. Не допустить interaction от banned/restricted.
8. Не допустить interaction между blocked users.
9. Admin access — server-side only.
10. RLS — основа backend security.
11. Все sensitive actions auditable.
12. Снизить privacy leaks через notifications/analytics/cache.

---

## 3. Security Non-Goals (MVP)

Не поддерживаем сейчас: enterprise SSO · сложные org-permissions · payment security · ticket fraud prevention · public follower graph privacy · dating match privacy · live location sharing · marketplace seller verification · сложные identity verification workflows · advanced fraud scoring сверх MVP.

---

## 4. Threat Model Overview

### 4.1 Location Privacy Threats
non-approved читает exact location · rejected тянет старый кэш exact · waitlisted лезет в chat/location · notification утекает exact · analytics содержит exact · `public_events_view` случайно отдаёт `exact_address`.
**Mitigation:** exact только в `event_locations` (deny-by-default RLS); status-зависимый доступ; payload/analytics boundary; cache-инвалидация по статусу.

### 4.2 Social Abuse Threats
harassment в чате · unsafe event · скрейпинг профилей через массовые заявки · blocked пытается взаимодействовать · banned re-entry · host злоупотребляет approval.
**Mitigation:** report/block везде; velocity limits; ban/restrict gates; moderation queue + audit; host-полномочия ограничены своим событием.

### 4.3 Data Privacy Threats
приватные поля профиля публичны · raw trust score exposed · детали report видны не тому · moderation notes видны юзерам · service role утёк на клиент · admin-данные из mobile.
**Mitigation:** safe views с allowlist; `user_trust_summary` admin/system-only; reports не публичны; service role server-side; RLS deny-by-default.

### 4.4 Platform Abuse Threats
spam-заявки/сообщения · фейк-аккаунты · invite abuse · unsafe фото · повторные no-show · velocity abuse.
**Mitigation:** rate limits → `suspicious_activity_events`; invite atomic validation; photo moderation; trust-сигналы; human review для serious.

### 4.5 Admin / Internal Threats
admin-действие без audit · избыточный admin-доступ · misuse service role · непрозрачные moderation-решения · AI false positive → несправедливый enforcement.
**Mitigation:** обязательный audit (Инвариант 4); least privilege; reason для serious; human review (Инвариант 5); recoverable AI ошибки.

---

## 5. Security Principles

1. RLS first. 2. Deny by default. 3. Least privilege. 4. Separate sensitive data. 5. Exact location только в protected table. 6. Service role не на клиенте. 7. Admin access server-side only. 8. Sensitive операции через Edge Functions. 9. Client validation не доверяется. 10. Каждое moderation-sensitive действие → audit log. 11. AI moderation advisory only. 12. Нет sensitive в analytics. 13. Нет sensitive в push. 14. Refetch sensitive после смены статуса. 15. Тестировать security-инварианты до беты.

---

## 6. Auth & Role Model

| Роль | Где | Доступ / границы |
|------|-----|------------------|
| `guest` | mobile | Не аутентифицирован; landing/signup/login/waitlist; нет событий/профилей |
| `authenticated_not_onboarded` | mobile | Только onboarding; нет discovery/applications/chat |
| `onboarded_user` | mobile | Safe events, safe profiles, apply (если гейты пройдены), report/block |
| `phone_verified_user` | mobile | Может требоваться до apply/approval (точка — OD-1) |
| `host` | mobile | Управляет своими событиями; exact location своего события; review заявок своего события |
| `approved_attendee` | mobile | exact location + chat **только для конкретного approved события** |
| `restricted_user` | mobile | Ограниченные действия (зависит от moderation-решения) |
| `banned_user` | — | Нет взаимодействия; только limited account/safety/support state |
| `admin_moderator` | **web only** | Server-side permissions; reports/actions; не mobile-роль |
| `system` | server | Scheduled jobs/Edge Functions/AI signals; **не финальный human-актор для serious** (Инвариант 5) |

---

## 7. Global Access Gates

| Gate | Правило |
|------|---------|
| **7.1 Beta Invite** | Без валидного invite — нет полного app; waitlist разрешён; usage трекается |
| **7.2 Auth** | Protected-экраны требуют аутентифицированную сессию |
| **7.3 Onboarding** | Нет доступа к событиям до завершения onboarding |
| **7.4 Verification** | Phone verification может требоваться до apply или approval — **точка не зафиксирована (OD-1)** |
| **7.5 Restriction** | restricted может быть лишён create/apply/message/upload (по решению модерации) |
| **7.6 Ban** | banned не взаимодействует; видит только limited account/safety/support |
| **7.7 Moderation** | flagged/pending контент скрыт до approve |

Гейты применяются последовательно: Invite → Auth → Onboarding → Verification(OD-1) → Restriction/Ban → Moderation.

---

## 8. RLS Strategy Overview

- RLS на всех exposed таблицах; deny-by-default; никогда не полагаться только на клиент.
- Mobile использует user session JWT (anon/auth key, **не** service role).
- Service role — только server-side (Edge Functions / admin backend).
- Public-данные — через safe views (allowlist полей).
- Exact location — через protected table/view/secure function, status-зависимо (`event_applications`/`event_attendees`).
- Admin-данные не exposed mobile.
- Sensitive writes (status/lifecycle/moderation) — через Edge Functions (server-authoritative).

| Area | Direct Client Access? | Edge Function Required? | RLS Critical? | Notes |
|------|:---------------------:|:-----------------------:|:-------------:|-------|
| profiles | R own / safe view | для status changes | ✅ | owner update own |
| profile_private_details | R limited own | да | ✅ strict | admin server-side |
| events | R safe / R-W own (host) | create/publish/cancel | ✅ | approximate only |
| event_locations | R (host/approved) | reveal via function/view | ✅✅ | deny-by-default |
| event_applications | R own / host | apply/approve/reject/waitlist | ✅ | status via function |
| event_attendees | R (scope) | system | ✅ | non-approved нет |
| event_chat_messages | R-W approved | (moderation inline опц.) | ✅✅ | no open DM |
| reports | INSERT user / R limited | report_content | ✅ | не публичны |
| user_blocks | R-W own | block_user | ✅ | reason скрыт от blocked |
| trust_events | ❌ | system | ✅ | internal only |
| user_trust_summary | ❌ | system | ✅ | never public |
| moderation_actions | ❌ | admin/system | ✅ | admin-only |
| audit_logs | ❌ | system | ✅ | append-only |
| invite_codes | ❌ | validate_invite_code | ✅ | admin manages SS |
| notifications | R own / mark read | system inserts | ✅ | no exact in payload |
| storage | upload own / signed URL | — | ✅ | moderation gate |

---

## 9. Table Access Matrix

(R=read, I=insert, U=update, D=soft-delete; SS=server-side only; ❌=нет доступа)

| Table | Guest | Own User | Other User | Host | Approved Attendee | Admin | System | Notes |
|-------|-------|----------|------------|------|-------------------|-------|--------|-------|
| profiles | ❌ | R/U own | safe view | safe view | safe view | R/U (SS) | U derived | raw trust не здесь |
| profile_private_details | ❌ | R limited | ❌ | ❌ | ❌ | R (SS) | U verif | strict |
| profile_photos | ❌ | R/I/U/D own | R approved-only | R approved-only | R approved-only | R (SS) | U mod | unsafe скрыт |
| interests | R | R | R | R | R | R | — | reference |
| user_interests | ❌ | R/I/D own | ❌ | ❌ | ❌ | R (SS) | — | |
| cities | R | R | R | R | R | R | — | reference |
| event_categories | R | R | R | R | R | R | — | reference |
| events | ❌ | R safe | R safe | R/U own | R safe | R/U (SS) | U lifecycle | approx only |
| event_locations | ❌ | ❌ | ❌ | R/U own event | **R own approved event** | R (SS, logged) | — | Инвариант 1 |
| event_applications | ❌ | R/I own | ❌ | R own event | R own | R (SS) | U via fn | unique(event,user) |
| event_attendees | ❌ | R own row | ❌ | R/U own event | R (policy OD-12) | R (SS) | I/U fn | non-approved ❌ |
| event_chat_messages | ❌ | R/I/D own (approved) | ❌ | R/I own event | **R/I approved event** | R (SS) | I system | no open DM |
| event_chat_states | ❌ | R (if approved) | ❌ | R own event | R approved event | R/U (SS) | U expiry | freeze |
| user_blocks | ❌ | R/I/D own (as blocker) | ❌ | ❌ | ❌ | R (SS) | — | blocked не видит reason |
| reports | ❌ | I; R limited own | ❌ | ❌ | ❌ | R/U (SS) | I system | не публичны |
| suspicious_activity_events | ❌ | ❌ | ❌ | ❌ | ❌ | R/U (SS) | I | не enforcement |
| moderation_actions | ❌ | ❌ | ❌ | ❌ | ❌ | R/I (SS) | I | reason обяз. |
| audit_logs | ❌ | ❌ | ❌ | ❌ | ❌ | R (SS) | I append | immutable |
| trust_events | ❌ | ❌ | ❌ | ❌ | ❌ | R (SS) | I | internal |
| user_trust_summary | ❌ | ❌ | ❌ | ❌ | ❌ | R (SS) | U | never public |
| invite_codes | ❌ | (via fn) | ❌ | ❌ | ❌ | R/I/U (SS) | U use_count | atomic |
| waitlist_entries | I (email) | ❌ | ❌ | ❌ | ❌ | R/U (SS) | — | min PII |
| notifications | ❌ | R/U own (read_at) | ❌ | R own | R own | R (SS) | I | no exact |
| push_tokens | ❌ | R/I/U/D own | ❌ | — | — | ❌ | R (SS) send | — |
| feature_flags | ❌ | ❌ | ❌ | ❌ | ❌ | R/U (SS) | R | safety-флаги защищены |
| feature_flag_exposures | ❌ | I own | ❌ | ❌ | ❌ | R (SS) | I | — |

---

## 10. Profile Security

**profiles:** owner R own / U allowed own fields; другие — только safe-поля (view); banned/restricted видимость ограничена; raw trust score и exact location **не в этой таблице**.
**profile_private_details:** private by default; owner R ограниченный (свой verification-статус), не admin-notes; admin server-side; phone/email/legal/DOB никогда публично; internal_notes admin-only.
**profile_photos:** owner manage own; другим видны только `moderation_status='approved'`; unsafe/rejected/deleted скрыты; signed URLs.
**public_profiles_view:** только safe-поля; **без** phone/email/DOB/legal_name/`trust_score_internal`/report_count/block_count/internal_notes.

**Profile security checklist:** ☐ public view = allowlist ☐ private details deny-by-default ☐ нет raw trust score ☐ только approved фото ☐ banned/restricted ограничены ☐ owner update ограничен разрешёнными полями.

---

## 11. Event Security

**events:** guest/not_onboarded ❌; onboarded R safe live; host R/U own; admin SS; `removed_for_safety` скрыты; cancelled — только где релевантно; approximate only.
**event_locations (critical):** deny-by-default; host R own event; approved attendee R **для этого** события; pending/waitlisted/rejected ❌; blocked/restricted/banned ❌; admin SS (logged); никогда через `public_events_view`.
**public_events_view:** только discovery-safe; approximate area; без exact_address/arrival_instructions; exact_lat/lng только если fuzzy.
**approved_event_details_view / function:** только approved attendee/host; проверяет active approval/attendee; доступ revoked при removal/cancel/ban/restrict.

**Event security checklist:** ☐ exact только в `event_locations` ☐ deny-by-default на нём ☐ approved-проверка ☐ removed/cancelled скрыты ☐ public view без exact ☐ revoke при изменении статуса.

---

## 12. Location Privacy Security *(самый критический раздел)*

- exact только в `event_locations`; event cards/детали до approval — никогда exact.
- pending/waitlisted/rejected — никогда exact; approved — только для своего события; host — своё; admin — только через dashboard/SS (logged).
- notifications не встраивают exact для non-approved (фактически — ни для кого в payload).
- analytics не содержит exact.
- cache-инвалидация после removal/rejection/ban/block.

| User/Application State | Event card | Approximate area | Read event_locations | Event chat | Notes |
|------------------------|:----------:|:----------------:|:--------------------:|:----------:|-------|
| guest | ❌ | ❌ | ❌ | ❌ | нет событий |
| authenticated_not_onboarded | ❌ | ❌ | ❌ | ❌ | onboarding only |
| onboarded_not_applied | ✅ | ✅ | ❌ | ❌ | discovery |
| pending | ✅ | ✅ | ❌ | ❌ | ожидание |
| waitlisted | ✅ | ✅ | ❌ | ❌ | нет exact/chat |
| approved | ✅ | ✅ | ✅ (own event) | ✅ | exact только здесь |
| rejected | огранич. | огранич. | ❌ | ❌ | никогда exact |
| cancelled_by_user | ✅ | ✅ | ❌ | ❌ | доступ снят |
| removed_attendee | огранич. | огранич. | ❌ | ❌ | revoke немедленно |
| blocked | ❌ | ❌ | ❌ | ❌ | скрыто |
| restricted | по политике | по политике | по статусу | огранич. | зависит |
| banned | ❌ | ❌ | ❌ | ❌ | нет взаимодействия |
| host | ✅ | ✅ | ✅ (own) | ✅ (own) | владелец |
| admin | ✅ | ✅ | ✅ (SS, logged) | ✅ (SS) | dashboard only |

**Test cases:** rejected/waitlisted/pending не могут query `event_locations`; approved читает только своё approved event; чужое — ❌; removed attendee теряет доступ; host читает только своё; notification body без exact для non-approved.

---

## 13. Application Security

**Rules:** только onboarded apply; completeness/verification gates (OD-1/OD-6); нельзя apply к своему событию (если политика не разрешает); нельзя apply если blocked host'ом / banned / restricted; `unique(event,user)`; applicant R own; host R для своего события; approve/reject/waitlist через Edge Function с валидацией capacity+event status; rejected/waitlisted — нет location/chat.
**Sensitive fields:** `intro_note` — applicant/host/admin; `host_note` — host/admin (не applicant); `decided_by`/`decided_at` — по роли.

**Checklist:** ☐ onboarded-only ☐ block/ban/restrict проверка ☐ unique constraint ☐ статус через fn ☐ capacity race защищён ☐ rejected/waitlisted без exact/chat.

---

## 14. Attendee Security

**Rules:** attendee создаётся только после approval или для host; host видит/управляет attendees своего события; approved могут видеть список по политике; non-approved — нет full list; removed attendee теряет chat/location; `attendance_status`/`no_show` не создаёт публичных негативных ярлыков (Инвариант 10).

> **Open question (OD-12):** «Should approved attendees see full approved attendee list before event?» — не зафиксировано; по умолчанию минимизировать видимость (deny-by-default) до решения.

---

## 15. Chat Security

**Rules:** no open DMs; чат только в контексте события; R/W только host + approved attendees (если не frozen); pending/waitlisted/rejected — ❌; removed attendee — ❌; banned/restricted не пишут; blocked-взаимодействия обрабатываются; reported messages → moderation queue; deleted messages могут оставаться доступны admin/moderation по политике; post-event chat истекает (OD-4).
**Freeze:** admin может freeze (→ audit log); может ли host freeze своё — **Open Question**; frozen блокирует user writes; system/admin сообщения могут проходить.

**Test cases:** pending/rejected/waitlisted не читают чат; approved читает только своё approved event; чужое — ❌; removed теряет доступ; frozen блокирует writes; banned не пишет; report создаёт `reports`.

---

## 16. Block Security

**Rules:** user блокирует другого; нельзя себя; blocked не может apply к событиям блокирующего; blocked не взаимодействуют в чате если пересекаются; видимость профилей/событий ограничена; block **не уведомляет** blocked напрямую; обратимость (unblock) — **Open Question (Q-BLK)**.

| Edge case | Expected behavior |
|-----------|-------------------|
| User блокирует host после подачи заявки | Заявка нивелируется/скрывается; нет дальнейшего взаимодействия; exact не раскрывается |
| Host блокирует applicant | Заявка не может быть approved; applicant теряет путь к этому событию |
| Два approved блокируют друг друга | Чат-взаимодействие между ними прекращается; host/admin уведомления по политике безопасности |
| Blocked уже в том же событии | Пересчёт visibility/interaction; сообщения друг друга скрыты |
| Blocked пытается смотреть профиль | Ограниченный/скрытый вид; нет взаимодействия |

---

## 17. Report Security

**Rules:** onboarded users создают reports; target = user/event/message (≥1, DB-check); reporter видит ограниченный статус своих; reported user не видит детали report; admin — full SS; descriptions sensitive; **нет raw report text в analytics**; report создаёт moderation queue item; AI summarization/triage допустим, но **не финальное действие** (Инвариант 5).

**Privacy checklist:** ☐ нет публичной видимости reports ☐ нет raw text в analytics ☐ reporter identity защищён где уместно ☐ snapshot reported message — Open Question (Q-MSG-SNAP).

---

## 18. Moderation & Audit Security

**Rules:** обычные users не читают `moderation_actions`/`audit_logs`; admin dashboard — SS; serious требует reason; **каждое moderation-sensitive действие → audit log** (Инвариант 4); audit append-only; before/after redact sensitive; AI не финальный актор для serious (Инвариант 5); system flags → `suspicious_activity_events`, без permanent ban без review.

| Action | Who | Audit | Notification? | Trust event? |
|--------|-----|:-----:|:-------------:|:------------:|
| warn_user | admin | ✅ | maybe (нейтр.) | moderation_warning |
| restrict_user | admin | ✅ | ✅ user | restriction_applied |
| ban_user | admin (human, Инв.5) | ✅ | ✅ user | restriction_applied |
| unban/unrestrict | admin | ✅ | maybe | — |
| remove_event | admin | ✅ | ✅ attendees | возможно host signal |
| restore_event | admin | ✅ | ✅ attendees | — |
| hide_message / restore_message | admin/system→admin | ✅ | — | — |
| freeze_chat / unfreeze_chat | admin (host? Open Q) | ✅ | maybe | — |
| dismiss_report / escalate_report | admin | ✅ | — | — |
| admin_note | admin | ✅ | — | — |

---

## 19. Trust Security

**Rules:** `trust_events`/`user_trust_summary` internal only; `trust_score_internal` никогда не возвращается mobile/public API; публичные badges деривируются безопасно; нет публичных негативных ярлыков/числовых рейтингов/social credit; admin review SS; trust-обновления auditable.
**Allowed public:** Verified · Reliable attendee · Hosted before · Attended events.
**Forbidden public:** «Trust score: 74/100» · report_count · block_count · no_show_count как ярлык · «Suspicious user» · «Risk score».

**Leak test cases:** user не может читать `trust_events`/`user_trust_summary`; `public_profiles_view` не содержит score/counters; API/Realtime не возвращает internal trust; badges — только из allowlist.

---

## 20. Beta / Invite Security

**Rules:** валидация invite — server-side / protected function (атомарно); нельзя превысить `max_uses`; expired/revoked отклоняются; waitlist без полного доступа; usage трекается; `assigned_to_email` не раскрывается широко; admin создаёт/управляет SS.

| Edge case | Expected |
|-----------|----------|
| Used code (single-use) | Deny + waitlist CTA |
| Expired code | Deny + waitlist |
| Revoked code | Deny |
| Beta closed | Только waitlist |
| Уже зарегистрирован | Login flow |
| Email mismatch (если assigned_to_email) | Deny / политика связывания (Open Q) |

---

## 21. Notification Security

**Rules:** уведомления минимальны; **exact location не включается ни для кого** в payload (sensitive детали — только после открытия авторизованного экрана); нет raw report descriptions; нет raw message body для reported; metadata без точного адреса; approval-уведомление сообщает, что детали доступны, но требует открытия authorized Event Detail.

| Notification Type | Recipient | Exact Location Allowed? | Sensitive Content Allowed? | Notes |
|-------------------|-----------|:-----------------------:|:--------------------------:|-------|
| application_approved | user | ❌ | ❌ | «детали доступны в событии» |
| application_rejected | user | ❌ | ❌ | мягкий тон |
| application_waitlisted | user | ❌ | ❌ | нейтрально |
| event_reminder | approved | ❌ | ❌ | safe reminder |
| event_update | approved | ❌ | ❌ | без места в payload |
| event_cancelled | all applicants | ❌ | ❌ | safe |
| new_application_for_host | host | ❌ | ❌ | без sensitive applicant data |
| report_update | reporter/target | ❌ | ❌ | нейтрально |
| invite_available | invited | ❌ | code/link | контроль доступа |
| system_notice | user | ❌ | ❌ | нейтрально |

---

## 22. Analytics Security

**Never send:** exact_location_text/address/lat/lng · phone · email (если не hashed/разрешено) · DOB · raw message body · report description · moderation notes · `trust_score_internal` · private profile details.
**Allowed:** event_id · city_id · category_id · status enums · funnel step · boolean flags · counts · non-sensitive error types · feature flag exposure.
**Rules:** аналитика измеряет поведение, не раскрывает sensitive; safety-события трекаются без sensitive описаний; location privacy распространяется и на analytics (Инвариант 9).

---

## 23. Storage Security

**profile-photos:** owner upload own; pending не публичны; только `approved` видны другим; signed URLs; size/type limits; deleted/rejected скрыты.
**event-media (P1):** host upload; moderation required; видимость по event visibility + moderation status.
**moderation-attachments (P1):** admin-only; никогда public.
**Invariants:** нет unrestricted public sensitive bucket'ов; DB хранит `storage_path`; доступ через policies/signed URLs; unsafe media скрыты; media cleanup при удалении профиля/события.

---

## 24. Edge Function Security

| Function | Auth | Role check | Input val. | RLS interaction | Audit | Rate limit | Notification |
|----------|:----:|------------|:----------:|-----------------|:-----:|:----------:|--------------|
| validate_invite_code | — (pre-auth) | — | Zod | atomic use_count | — | ✅ | — |
| complete_onboarding | ✅ | self | Zod | profiles update | — | — | — |
| create_event / publish_event | ✅ | host(self) | Zod | events insert; content→mod | (publish opt.) | ✅ | — |
| submit_application | ✅ | self; block/ban/restrict check | Zod | applications insert | — | ✅ | host |
| approve/reject/waitlist_application | ✅ | host of event | Zod | status; capacity; attendees | maybe | ✅ | user |
| cancel_event | ✅ | host / admin | Zod | events status | admin→✅ | — | attendees |
| reveal_event_location (view/fn) | ✅ | approved/host/admin | — | event_locations read | admin access logged | — | — |
| send_event_message | ✅ | approved; not frozen/banned | Zod | chat insert | — | ✅ | — |
| report_content | ✅ | onboarded | Zod | reports insert | on review | ✅ | — |
| block_user | ✅ | self≠target | Zod | blocks insert | — | ✅ | — |
| restrict/ban/remove_event/freeze_chat | ✅ | **admin** | Zod | enforcement | **✅ обяз.** | — | target/attendees |
| update_attendance | ✅ | host/system | Zod | attendees | — | — | maybe |
| create_trust_event | server | system | — | trust_events insert | — | — | — |

**Rules:** service role только в secure SS-контексте; валидировать JWT/user; **никогда не доверять client-provided user_id для actor identity** — actor из auth-контекста; проверять ownership/host/admin; валидировать lifecycle transitions; проверять block/ban/restriction state.

---

## 25. Rate Limiting & Abuse Prevention

| Action | Suggested Limit | Abuse Prevented | P0/P1 | Notes |
|--------|-----------------|-----------------|-------|-------|
| auth attempts | ~5–10 / 15 мин / IP+account | brute force | P0 | anti-enumeration |
| invite code attempts | ~5–10 / час / IP | code brute force | P0 | → suspicious event |
| profile edits | ~20 / час | abuse/scrape | P1 | |
| photo uploads | ~10 / час | spam/unsafe flood | P0 | + moderation |
| event creation | ~3–5 / день | spam events | P0 | |
| applications | ~10–20 / день, ~5 / час | scraping/spam | P0 | velocity → suspicious |
| approvals/rejections | разумный burst cap | abuse host tools | P1 | |
| chat messages | ~5–10 / мин | harassment/spam | P0 | |
| reports | ~5–10 / час | report abuse | P0 | dedup |
| blocks | ~20 / час | abuse | P1 | |
| notification sending | system-side throttle | spam | P0 | батчинг |
| admin actions | audit + reason | misuse | P0 | logged |

Точные значения тюнятся в бете; нарушения → `suspicious_activity_events`; **serious наказание требует review** (Инвариант 5).

---

## 26. Cache & Client Security

**Rules:** не кэшировать exact location дольше необходимого; refetch event detail после смены статуса заявки; очищать sensitive при logout; инвалидировать chat/location-доступ после removal/rejection/ban; не хранить service role/admin secrets; не логировать sensitive в client logs; crash-репорты без raw sensitive; локальный стейт не источник истины для permissions.

**Critical cases:** approved→removed (revoke сразу) · event cancelled после reveal (скрыть exact) · user banned при открытом app (force logout) · chat frozen во время набора (блок отправки) · host меняет exact location (refetch для approved) · logout на shared device (полная очистка).

---

## 27. Admin Security

**Rules:** admin dashboard отдельно от mobile; admin auth+authorization обязательны; service role только SS; **нет service role в браузерном бандле**; admin actions требуют reason; **все admin actions audit logged**; минимизировать sensitive exposure во вьюхах; audit фиксирует actor; prod admin access ограничен.

| Admin Screen | Data Accessed | Sensitive? | Audit Required? | Notes |
|--------------|---------------|:----------:|:---------------:|-------|
| Moderation Queue | reports + priority + AI summary | да | при действии | AI assistive |
| Report Detail | report + context | высоко | ✅ при действии | reason обяз. |
| User Detail | profile, history, trust, flags | высоко | доступ logged | trust SS-only |
| Event Detail | full event incl. exact | высоко | exact-доступ logged | |
| Message Detail | snapshot + thread | высоко | ✅ при действии | контекст |
| Suspicious Activity | velocity/pattern flags | да | при действии | не enforcement |
| Audit Logs | log entries | высоко | append-only | immutable |
| Action Modal | action + reason | высоко | ✅ обязательно | serious→human |

---

## 28. AI Moderation Security

**Allowed:** profile text · photo · event description · chat harassment · spam/scam · report summarization · risk prioritization.
**Rules:** AI = signal, не истина; serious enforcement → human/admin review (Инвариант 5); false positives recoverable без штрафа; AI summaries не утекают обычным users; не слать лишние sensitive данные провайдеру; логировать AI-решения как moderation signal; **не показывать AI risk scores публично**.

```
Content created → AI check → {safe | flagged | needs_review}
  → moderation queue (если нужно) → admin decision (serious) → audit log (если действие)
```

---

## 29. RLS Policy Blueprints by Table (pseudocode)

> Natural-language. `auth.uid()` = текущий пользователь. SS = service role/admin backend.

**profiles** — SELECT: `id=auth.uid()` (full own) OR через `public_profiles_view` (safe) OR admin SS. INSERT: self при onboarding. UPDATE: `user_id=auth.uid()` (allowed fields only). DELETE: soft, self/admin. *Note: raw trust/exact не здесь.*

**profile_private_details** — SELECT: `user_id=auth.uid()` (ограниченные поля) OR admin SS; internal_notes admin-only. INSERT/UPDATE: self limited / system (verification) / admin SS. DELETE: admin SS. *No public access.*

**profile_photos** — SELECT: owner all; others only `moderation_status='approved' AND deleted_at IS NULL` (через safe access). INSERT/UPDATE/DELETE: owner own. *Note: unsafe скрыт.*

**events** — SELECT: onboarded → safe live (`status IN (live,full,starting_soon,...) AND moderation_status='approved' AND deleted_at IS NULL`); host own (all statuses); admin SS. INSERT/UPDATE: host own (через fn для publish/cancel). DELETE: soft host/admin. *removed_for_safety скрыт.*

**event_locations** — SELECT: `is_host(event_id, auth.uid())` OR `is_approved_attendee(event_id, auth.uid())` OR admin SS. INSERT/UPDATE: host own event. DELETE: host/admin. *Deny-by-default; no pending/waitlisted/rejected/blocked/banned.*

**event_applications** — SELECT: `user_id=auth.uid()` OR `is_host(event_id,auth.uid())` OR admin SS. INSERT: self, gated (onboarded, not blocked/banned/restricted, unique). UPDATE: status — **только Edge Function** (host/admin). DELETE: applicant cancel (soft).

**event_attendees** — SELECT: host own event; approved attendee (policy OD-12); admin SS. INSERT/UPDATE: system/fn (после approval). DELETE: system/host (remove → revoke). *No non-approved access.*

**event_chat_messages** — SELECT/INSERT: `is_host(event_id,uid)` OR `is_approved_attendee(event_id,uid)`; INSERT blocked если `chat_frozen` OR banned/restricted. UPDATE/DELETE: author limited / admin SS. *No open DM; no event_id-less message.*

**event_chat_states** — SELECT: участники события. UPDATE: admin (freeze) / system (expiry) / host (Open Q). 

**user_blocks** — SELECT: `blocker_id=auth.uid()` (own); blocked не видит reason. INSERT: `blocker_id=auth.uid() AND blocker_id<>blocked_id`. DELETE: blocker (если unblock разрешён — Q-BLK).

**reports** — SELECT: `reporter_id=auth.uid()` (ограниченный статус) OR admin SS. INSERT: onboarded, target≥1. UPDATE: admin SS. *Не публичны.*

**suspicious_activity_events** — SELECT/UPDATE: admin/system SS. INSERT: system. *Не enforcement.*

**moderation_actions** — SELECT/INSERT: admin/system SS; reason обязателен. *Audit log на каждое.*

**audit_logs** — SELECT: admin SS. INSERT: system append-only. UPDATE/DELETE: ❌ (immutable).

**trust_events** — SELECT: admin SS. INSERT: system. UPDATE/DELETE: ❌. *Internal only.*

**user_trust_summary** — SELECT/UPDATE: admin/system SS. *Never public; не в mobile API.*

**invite_codes** — SELECT/validate: через `validate_invite_code` fn (atomic). INSERT/UPDATE: admin SS.

**notifications** — SELECT: `user_id=auth.uid()` own. UPDATE: own `read_at` only. INSERT: system. *No exact in body.*

**push_tokens** — SELECT/INSERT/UPDATE/DELETE: `user_id=auth.uid()` own. Send: system SS.

**feature_flags** — SELECT/UPDATE: admin SS (или config). **feature_flag_exposures** — INSERT: own/system; SELECT: admin SS.

---

## 30. Security Test Plan

**30.1 Location Privacy:** guest/not_onboarded не читают events; onboarded — approximate only; pending/waitlisted/rejected не читают `event_locations`; approved читает только своё approved event; чужое — ❌; removed теряет exact; host читает только своё; non-host ❌; notification без exact для non-approved.
**30.2 Chat Access:** pending/waitlisted/rejected не читают чат; approved читает только своё; чужое — ❌; removed теряет доступ; frozen блокирует writes; banned не пишет.
**30.3 Profile Privacy:** public profile без private details/raw trust score; другой user не читает phone/email/DOB; approved фото видно, rejected скрыто.
**30.4 Application:** not onboarded не apply; blocked/banned не apply; unique(user,event); approval создаёт attendee; rejection — нет; waitlist без location/chat.
**30.5 Report/Moderation:** user создаёт report; reported user не читает report; admin читает SS; moderation action требует reason; создаёт audit log; AI flag не банит автоматически.
**30.6 Trust:** user не читает `trust_events`/`user_trust_summary`; raw score не в public profile; публичные badges только из allowlist.
**30.7 Admin/Service Role:** service role недоступен client-side; mobile не читает admin-only таблицы; admin actions audit logged; banned не взаимодействует.

---

## 31. Security Review Checklist Before Beta

☐ RLS на всех exposed таблицах ☐ нет exact в public events ☐ `event_locations` protected ☐ `public_profiles_view` без sensitive ☐ `public_events_view` без exact ☐ raw trust score не exposed ☐ chat approved-only ☐ reports private ☐ moderation_actions private ☐ audit_logs private/append-only ☐ service role server-side only ☐ storage buckets protected ☐ signed URLs где нужно ☐ notifications проверены на sensitive ☐ analytics проверена на sensitive ☐ rate limits определены ☐ banned/restricted gates реализованы ☐ block interaction rules протестированы ☐ RLS tests passing ☐ admin actions logged.

---

## 32. Security Risks

| Risk | Impact | Mitigation | Test Needed? |
|------|--------|------------|:------------:|
| Exact location leak через public event query | Критич. | Отдельная `event_locations`, allowlist view, RLS | ✅ |
| Exact leak через notification | Высокий | Payload policy, нет exact в body | ✅ |
| Exact leak через analytics | Высокий | Analytics boundary §22 | ✅ |
| Public profile утекает phone/email | Высокий | Safe view allowlist | ✅ |
| Raw trust score exposed | Высокий | `user_trust_summary` admin-only; запрет в view/API | ✅ |
| Chat access слишком широкий | Высокий | RLS approved-only; helper predicates | ✅ |
| Stale cache после removal | Средний | Инвалидация по статусу; refetch on focus | ✅ |
| Service role exposed | Критич. | SS only; CI secret-check | ✅ |
| Report details видны reported user | Высокий | RLS reports не публичны | ✅ |
| Admin action без audit log | Высокий | Edge Function обязывает audit | ✅ |
| AI false positive enforcement | Средний | Human review serious; recoverable | ✅ |
| Invite code brute force | Средний | Rate limit + suspicious event | ✅ |
| Message/application spam | Средний | Velocity limits | ✅ |
| Storage bucket случайно public | Высокий | Policies; no public sensitive bucket | ✅ |
| RLS too permissive | Высокий | Deny-by-default; RLS tests | ✅ |
| RLS too restrictive → UX fail | Средний | Тест happy-path; staging | ✅ |

---

## 33. Open Security Questions

| # | Вопрос | Связь |
|---|--------|-------|
| OD-1 | Phone verification до apply или approval? | §7.4/§13 |
| Q-RJ | Exact location сразу после approval или ближе к старту? | §12 |
| OD-12 | Approved attendees видят attendee list до события? | §14 |
| Q-BLK-APV | Поведение block, если оба уже approved на одно событие? | §16 |
| Q-RM | Может ли host удалить уже approved attendee? | §14/§18 |
| Q-RM2 | Removed attendee теряет read истории чата или только write? | §15/§26 |
| OD-4 | Сколько post-event chat остаётся readable? | §15 |
| Q-MSG-SNAP | Снапшотить ли body зарепорченного сообщения в reports? | §17 |
| OD-9 | Сколько хранить reports и audit_logs? | §18/§28 |
| Q-FREEZE | Host может freeze чат или только admin? | §15/§18 |
| OD-13 | Все новые события через manual review в бете? | §11/§24 |
| AQ-RATE | Какие rate-limit значения P0? | §25 |
| Q-PRV | Private/unlisted events в MVP? | §11 |
| Q-ADMIN-ROLE | Admin через role-таблицу или внешний allowlist? | §27 |
| Q-APPEAL | Как обрабатывать appeals для restrict/ban? | §18 |
| Q-DEL | Как удалять пользователя при наличии reports/audit logs? | §28, OD-9 |

---

## 34. Summary

- Security/RLS blueprint защищает **exact location, профили, чат, reports, trust**.
- **RLS — core backend security layer** (deny-by-default); sensitive writes — Edge Functions; service role server-side only.
- Доступ к exact location зависит от **approved attendee / host / admin** статуса; реализован через protected `event_locations` + status-проверки.
- **No open DMs** и **no raw trust score** enforced как архитектурные правила; admin — web/server-side only.
- Все moderation-sensitive действия → audit log; AI — advisory; notifications/analytics — без sensitive.
- Нерешённые развилки — §33; следующий документ: [`/docs/08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md).

> Напоминание: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth; все документы и эта security-модель ему подчинены. SQL/migrations/policies в коде не создавались.
