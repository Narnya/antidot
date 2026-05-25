# Moderation & Safety Operations v1 — Social Events App

> **Status:** v1 (moderation blueprint for closed beta)
> **Owner:** Safety / Product / Backend
> **Last updated:** 2026-05-18

---

## 1. Source of Truth

- Документ основан на [`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md), [`01_PRD.md`](01_PRD.md), [`02_USER_STORIES.md`](02_USER_STORIES.md), [`03_USER_FLOWS.md`](03_USER_FLOWS.md), [`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md), [`05_ARCHITECTURE.md`](05_ARCHITECTURE.md), [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md), [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md), [`08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md).
- **[`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth.** При конфликте приоритет у Product Core.
- Moderation **не нарушает** safety-инварианты; **AI is assistant, not judge** (Инвариант 5); serious enforcement — human/admin reviewable; все moderation-sensitive действия → audit log (Инвариант 4).
- Документ — основа admin dashboard, moderation workflows, AI triage, reports, audit logs, safety tests. SQL/migrations не создаются.
- Нерешённые развилки — в [§40 Open Moderation Questions](#40-open-moderation-questions) (CLAUDE.md §3).

---

## 2. Moderation Goals

1. Защитить пользователей во время офлайн-взаимодействий.
2. Предотвратить harassment, spam, scams, unsafe events.
3. Report/block доступны и понятны.
4. Дать admin достаточно контекста.
5. Быстро обрабатывать high-risk incidents.
6. Не допустить location/privacy leaks.
7. Не допустить abuse в event chat.
8. Не допустить fake/unsafe hosts.
9. Поддержать trust system без social credit.
10. AI для triage, не как final judge.
11. Логировать все moderation-sensitive действия.
12. Поддержать закрытую бету с ручной safety-операцией.

---

## 3. Moderation Non-Goals (MVP)

Не делаем: полностью авто permanent ban без human review · enterprise abuse investigation tooling · legal case management · public dispute threads · public user ratings · public negative labels · automated dating-style policing · advanced fraud ML · payment/ticket fraud review · marketplace dispute resolution · public transparency reports.

---

## 4. Moderation Philosophy

- Safety = product quality.
- Reports — сигналы, не доказательство.
- Block — немедленный контроль пользователя.
- Moderation actions auditable.
- AI помогает приоритизировать/суммаризировать/флагать, но **не решает** serious enforcement.
- High-risk офлайн-инциденты требуют быстрой эскалации.
- Пользователю не нужно спорить публично.
- Privacy сохраняется во время moderation.
- Moderation пропорциональна.
- Бета — консервативна и manual-review friendly.

> **The product should make safe behavior easier, unsafe behavior harder, and serious abuse reviewable.**

---

## 5. Abuse & Risk Taxonomy

| Category | Examples | Severity range | Detection | Expected response |
|----------|----------|----------------|-----------|-------------------|
| **5.1 User Abuse** | harassment, threats, inappropriate messages, repeated unwanted contact, fake profile, impersonation, creepy/discriminatory/stalking-like | medium–critical | report, AI, pattern | warn → restrict → ban; protect reporter |
| **5.2 Event Abuse** | unsafe/fake event, misleading location, bait-and-switch, party/nightlife/dating вне MVP, risky behavior, unsafe venue, host misuse approval | medium–critical | report, AI, manual review | pending_review → edit/remove → host restrict |
| **5.3 Chat Abuse** | harassment, spam, scam links, unsafe requests, hate/sexual content, давление уйти в unsafe channel | medium–critical | report, AI, velocity | hide message → freeze chat → restrict/ban |
| **5.4 Platform Abuse** | spam applications/events, invite abuse, fake accounts, scraping, repeated no-shows, velocity | low–high | velocity/system | rate limit → cooldown → restriction |
| **5.5 Privacy/Location Abuse** | попытка доступа к exact без approval, публикация exact, скриншоты/leaks, notification/location leak, раскрытие чужих данных | high–critical | report, system, audit | hide/remove → notify approved → audit → restrict |
| **5.6 Admin/Internal Abuse** | action без reason/audit, избыточный доступ, leak report details, service role misuse | high–critical | audit review | enforce audit; least privilege; review |

---

## 6. Moderation Actors

| Actor | Может | Не может |
|-------|-------|----------|
| **User** | report user/event/message; block; manage safety settings; получать ограниченные report/action updates | видеть детали report; видеть reporter |
| **Host** | report attendee/applicant; remove attendee (если политика); event updates; freeze own chat (Open Q); post-event feedback | банить платформенно; видеть internal trust/moderation |
| **Admin/Moderator** | review reports/profiles/events/messages; actions; restrict/ban; remove events; freeze chats; admin notes; review suspicious; escalate | действовать без audit/reason; AI как единственное основание serious |
| **System** | flag suspicious; AI moderation signals; rate-limit; queue items; notifications; audit для автоматических действий | финальный serious enforcement |
| **AI** | flag content; classify reports; summarize; prioritize queue; detect spam/scam/harassment | быть final judge; auto permanent ban; раскрывать risk labels публично |

---

## 7. Report Categories

| Category | Meaning / Examples | Default priority | Review path | Possible actions |
|----------|--------------------|:----------------:|-------------|------------------|
| `harassment` | оскорбления/угрозы, повторный unwanted, агрессия | high (critical если угрозы) | fast review | warn/hide/freeze/restrict/ban |
| `spam` | повторяющиеся сообщения, promo-abuse, bot-like | medium | batch/AI | rate limit/hide/cooldown |
| `scam` | подозрительные ссылки, money requests, fake opportunities | high | fast review | hide/restrict/ban |
| `unsafe_behavior` | угрожающее поведение, unsafe offline conduct | high–critical | urgent | restrict/ban/escalate |
| `inappropriate_content` | explicit фото, offensive bio/описание | medium | normal/AI | hide/remove/flag |
| `fake_profile` | impersonation, ложная личность, подозрительные фото | medium–high | review | require verify/hide/restrict |
| `event_safety` | unsafe/misleading event, проблемный host, опасные инструкции | high–critical | urgent (если скоро) | pending_review/remove/restrict host |
| `location_issue` | misuse exact location, неверная локация, leak, unsafe инструкции | high–critical | urgent | hide/remove/notify/audit |
| `other` | не покрыто; нужна ручная классификация | medium | manual triage | по решению |

---

## 8. Report Priorities

| Priority | Examples | Expected response |
|----------|----------|-------------------|
| `low` | минорный контент, неясный report, low-risk профиль | normal moderation window (batch) |
| `medium` | suspicious behavior, умеренный harassment, повторный spam, non-urgent event concern | приоритет выше low |
| `high` | credible harassment, scam, unsafe event risk, повторные reports, location privacy concern | fast review; возможна temp restriction |
| `critical` | угроза вреда, серьёзный офлайн-инцидент, опасное событие, severe location/privacy leak, credible stalking | immediate escalation; urgent restriction/removal; founder/admin review |

**Priority assignment rules:** user-selected category · AI triage · история reports на target · timing события · **скоро ли старт** · **раскрыт ли уже exact location** · **несколько ли пользователей репортят один target** → повышение приоритета.

---

## 9. Report Lifecycle

```
new ──► in_review ──► action_taken
   │           │
   │           ├──► dismissed
   │           └──► escalated ──► action_taken / dismissed
```

| Status | Meaning | Кто ставит | User visibility | Admin actions | Audit |
|--------|---------|-----------|-----------------|---------------|:-----:|
| `new` | Создан, не просмотрен | system | «отправлено» | assign/open | при действии |
| `in_review` | Admin начал review | admin | «на рассмотрении» (ограниченно) | take action/escalate/dismiss | при действии |
| `action_taken` | Действие выполнено | admin | generic «обработано» | follow-up | ✅ |
| `dismissed` | Нет действия / недостаточно данных | admin | generic | reopen (если новое) | ✅ |
| `escalated` | Нужна founder/admin/safety эскалация | admin | generic | protective action/final | ✅ |

---

## 10. Report Creation Flow

**Entry points:** Public Profile · Event Detail · Event Chat · Attendee List · Hosted Event Dashboard · (Notifications где релевантно).

**Steps:** 1) tap Report → 2) выбрать category → 3) опц. описание → 4) system захватывает контекст → 5) `reports` создан → 6) AI triage классифицирует/суммаризирует → 7) попадает в moderation queue → 8) пользователь видит confirmation.

**Context captured:** `reporter_id`, `reported_user_id`/`reported_event_id`/`reported_message_id` (≥1), `category`, `description`, timestamp, relevant metadata, content snapshot (если политика — Q-MSG-SNAP).

**Privacy rules:** reported user не видит детали report; raw description не в analytics; содержимое report admin-only; reporter identity защищён где уместно ([`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §17).

---

## 11. Block Flow

**Purpose:** немедленный контроль пользователя без ожидания модерации.

**Rules:** user блокирует другого; нельзя себя; **не уведомляет** blocked напрямую; blocked не может apply к событиям блокирующего; blocked не взаимодействуют напрямую; видимость профилей/событий ограничена по политике; block сосуществует с report.

**Lifecycle:** `active block → optional unblock → deleted_at (soft)`. Обратимость — Open Question (Q-BLK).

| Edge case | Expected behavior |
|-----------|-------------------|
| User блокирует host после подачи заявки | Заявка нивелируется/скрывается; нет взаимодействия; exact не раскрывается |
| Host блокирует applicant | Заявка не может быть approved; applicant теряет путь к этому событию |
| Два approved блокируют друг друга | Взаимодействие между ними прекращается; host/admin уведомление по политике безопасности |
| Blocked уже approved на то же событие | Пересчёт visibility/interaction; сообщения друг друга скрыты; возможен host/admin review |
| Blocked пытается писать в event chat | Сообщения не доставляются друг другу |
| Blocked пытается смотреть профиль | Ограниченный/скрытый вид |

---

## 12. Moderation Queue

**Источники item'ов:** reports · AI content flags · `suspicious_activity_events` · unsafe profile photo/bio · unsafe event description · unsafe chat message · повторный no-show/velocity паттерн · admin-created review item.

**Поля/концепты:** item type · priority · status · target entity · reporter (если есть) · `assigned_admin_id` · AI summary · created_at · event timing · related trust signals · previous reports · action history.

**Filters:** priority · status · category · content type · event starts soon · assigned/unassigned · user risk pattern · AI flagged · city/beta cohort.

**Sorting:** critical first → high priority → events starting soon → несколько reports на один target → недавний unsafe chat → старые непросмотренные.

---

## 13. Admin Review Flow

1. Открыть moderation queue → 2. фильтр/сортировка → 3. открыть report/detail → 4. review контекста: report details · safe/admin профиль · event context · message context · trust events · previous reports · AI summary · block/report history → 5. выбор действия: dismiss/warn/restrict/ban/remove_event/hide_message/freeze_chat/escalate/admin_note → 6. **reason для serious** → 7. system создаёт `moderation_action` → 8. system создаёт `audit_log` → 9. обновление состояния target → 10. notification если уместно.

**Important:** serious actions требуют reason; **все moderation-sensitive → audit log**; AI summary assistive only; admin видит достаточно контекста, но не лишние sensitive данные.

---

## 14. Moderation Actions

| Action | Purpose | Who | Target | Audit? | Trust event? | User notif? | Reversible? |
|--------|---------|-----|--------|:------:|:------------:|:-----------:|:-----------:|
| `warn_user` | low/medium issue | admin | user | ✅ | moderation_warning | ✅ нейтр. | n/a |
| `restrict_user` | temp/scoped limit | admin | user | ✅ | restriction_applied | ✅ | ✅ |
| `unrestrict_user` | снять restriction | admin | user | ✅ | — | maybe | n/a |
| `ban_user` | severe; блок взаимодействия | admin (**human**, Инв.5) | user | ✅ | restriction_applied | ✅ | через unban |
| `unban_user` | восстановление | admin | user | ✅ | — | maybe | n/a |
| `remove_event` | unsafe/invalid event | admin | event | ✅ | возможно host signal | ✅ attendees | restore |
| `restore_event` | откат ошибки | admin | event | ✅ | — | ✅ attendees | n/a |
| `hide_message` | скрыть unsafe message | admin/system→admin | message | ✅ | — | maybe | restore |
| `restore_message` | false positive | admin | message | ✅ | — | — | n/a |
| `freeze_chat` | остановить сообщения | admin (host? Open Q) | event chat | ✅ | — | ✅ участникам | unfreeze |
| `unfreeze_chat` | восстановить чат | admin | event chat | ✅ | — | maybe | n/a |
| `dismiss_report` | нет действия | admin | report | ✅ | — | — | reopen |
| `escalate_report` | serious review | admin | report | ✅ | — | — | n/a |
| `admin_note` | внутренний контекст | admin | user/event/report | ✅ | — | — | n/a |

---

## 15. Enforcement Levels

| Level | Описание | Examples | Approves | User notif | Audit/Trust |
|-------|----------|----------|----------|:----------:|-------------|
| 0 — No action | report dismissed / недостаточно evidence | неясный/минорный | moderator | — | audit (dismiss) |
| 1 — Soft warning | напоминание о guidelines | разовый минорный | moderator | ✅ | audit + moderation_warning |
| 2 — Content removal | hide/remove photo/message/event content | inappropriate content | moderator | maybe | audit |
| 3 — Temporary restriction | лимит действий на время/scope | повторный spam/no-show | admin | ✅ | audit + restriction_applied |
| 4 — Event-specific | remove attendee / cancel-remove event / freeze chat | unsafe event/chat | admin | ✅ attendees | audit |
| 5 — Account ban/suspension | severe/повторное | confirmed harassment/scam | admin (**human**) | ✅ | audit + restriction_applied |
| 6 — Critical escalation | серьёзный safety-инцидент | угроза вреда, stalking, leak | founder/senior admin | по политике | audit + escalation |

---

## 16. Profile Moderation

**Targets:** display_name · bio · vibe_tags · profile photos · username · suspicious profile patterns.
**Triggers:** profile creation/edit · photo upload · user report · AI flag · повторные suspicious изменения.
**Statuses:** not_required · pending · approved · flagged · rejected · removed.
**Rules:** unsafe контент скрыт/pending; approved фото видны; rejected скрыты; profile text флагается; severe fake → restrict; normal users не видят moderation internals.
**AI:** text/photo moderation, fake/spam pattern — assistive, не final для serious.

---

## 17. Event Moderation

**Targets:** title · description · category · approximate location · exact instructions · host behavior · unsafe event pattern.
**Triggers:** event creation/edit · report event · AI flag · suspicious host · manual review в бете.
**Statuses:** draft · pending_review · live · removed_for_safety · cancelled_by_admin.
**Rules:** unsafe → pending_review; **exact location не утекает во время review**; событие скоро + high-risk report → приоритет; admin может remove; attendees уведомлены при cancel/remove (generic); детали report приватны.
**Beta recommendation:** в ранней закрытой бете — manual review всех новых событий или всех first-time hosts (OD-13).

---

## 18. Event Application Moderation

**Risk cases:** spam applications · inappropriate intro notes · suspicious applicant · повторные rejected · host abuse approval/rejection · harassment после rejection.
**Rules:** `intro_note` модерируется; host может report applicant; applicant может report host/event; повторный spam → `suspicious_velocity`; решения host не раскрывают rejection reason публично; rejected никогда не видит exact location.
**Actions:** application cooldown · user restriction · host review · event review · admin note.

---

## 19. Chat Moderation

**Targets:** message body · spam links · harassment · scam · unsafe инструкции · inappropriate content.
**Triggers:** report message · AI harassment/spam · velocity · admin review · host report.
**Rules:** только approved attendees пишут; **no open DMs**; reported → `reports`; reported message может быть скрыт pending review; удаление автором не разрушает moderation-контекст (политика Q-MSG-SNAP); admin может hide/freeze; banned/restricted не пишут; post-event chat истекает (OD-4).
**AI:** harassment/spam/scam detection, prioritization — без финального serious enforcement alone.

---

## 20. Unsafe Event Handling

**Examples:** fake event · risky location · описание намекает на party/nightlife/dating вне MVP · host зовёт в unsafe channel · несколько reports до старта · location issue · safety concern после approval.

**Flow:** 1) report/AI/system flag → 2) расчёт priority → 3) если high/critical и событие скоро — admin alert → 4) admin review (event/host/applications/attendees) → 5) возможен hold/pending_review → 6) action: dismiss / request host edit / remove_event / restrict host / notify attendees → 7) audit log → 8) trust events если нужно.

**Important:** attendees получают **safe generic** уведомление; sensitive детали не раскрываются; reason для removal может быть generic если требует safety/privacy.

---

## 21. Location Privacy Incidents

**Examples:** exact в public-поле · host вписал адрес в public описание · notification случайно с exact · user делится exact в чате до approval · rejected утверждает доступ к location · cached data leak.

**Response:** hide/remove exposed контент → remove event из discovery если нужно → notify affected approved attendees если уместно → audit incident → review RLS/query path → add test case → restrict host/user если malicious.

**Prevention:** валидация описаний событий · AI/text-scan на address-like content (возможно) · exact в отдельной `event_locations` · review notification-шаблонов · analytics boundary · security tests ([`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §12). Инвариант 1/9.

---

## 22. Scam / Spam Handling

**Signals:** повторные сообщения · подозрительные ссылки · money requests · одинаковый текст в чатах/заявках · много заявок быстро · подозрительный bio · invite abuse.
**Actions:** rate limit · hide message · application cooldown · account restriction · ban для confirmed scam · admin review.
**AI:** spam classification, scam pattern, summary/prioritization.
**Rules:** не авто permanent ban от одного AI-сигнала; повторный/high-confidence scam можно быстро restrict **pending review** (не финально без человека).

---

## 23. Harassment Handling

**Sources:** event chat · application notes · profile content · post-event behavior · host/attendee reports.
**Priority:** harassment с угрозами = critical; повторный unwanted contact = high; оскорбления = medium/high по контексту.
**Actions:** warn · hide message · freeze chat · restrict · ban для severe/повторного · защита reporter identity.
**Important:** user может **block немедленно**; reporter не должен продолжать взаимодействие; event-level safety может требовать удаления attendee или отмены события.

---

## 24. Fake Profile / Identity Concerns

**Signals:** подозрительные фото · несогласованные детали · reports · spammy bio · повторное unsafe поведение · phone не verified.
**Actions:** require phone verification · hide profile/photo pending review · restrict applications · restrict event creation · ban если confirmed malicious.
**Rules:** новый user без истории **не** автоматически suspicious; false positives recoverable; `identity_reviewed` — P1, не MVP без явного решения.

---

## 25. Host Abuse Handling

**Risks:** fake events · unsafe exact location · misleading описание · неадекватный отбор attendees · last-minute отмены · harassment в чате · abuse no-show отметки · просьба платить вне продукта · увод в unsafe external channel.
**Responses:** event review · host warning · host restriction · remove event · freeze chat · скрытие/снятие trusted_host badge · ban для severe/повторного.
**Important:** host control необходим, но **уравновешен** reporting + admin review.

---

## 26. AI Moderation

**Allowed:** profile text · photo · event description · chat harassment · spam/scam · report summarization · priority recommendation · suspicious pattern explanation.
**Outputs:** safe / flagged / needs_review / suggested category / suggested priority / summary / confidence / reasons.
**Rules:** output advisory; AI risk scores **не публичны**; serious enforcement → human/admin review; false positives recoverable; AI не получает лишние sensitive данные; AI summaries admin-only.

```
Content submitted → AI moderation check → {safe | flagged | needs_review}
  → if flagged: queue item → admin review (serious) → action → audit log
```

---

## 27. Audit Logging Requirements

**Actions requiring audit log:** restrict_user · unrestrict_user · ban_user · unban_user · remove_event · restore_event · hide_message · restore_message · freeze_chat · unfreeze_chat · dismiss_report · escalate_report · admin_note · manual trust adjustment (если разрешено) · admin доступ к high-risk incident (если трекается).

**Audit log включает:** actor_id · actor_type · action · entity_type · entity_id · before_state · after_state · reason · metadata · timestamp.

**Rules:** audit logs admin/system-only; **append-only**; sensitive values redacted при необходимости; нет доступа normal users (Инвариант 4; [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) §12.2).

---

## 28. Moderation Notifications

**Types:** report received confirmation · action taken generic · warning · restriction notice · ban notice · event removed/cancelled · message hidden (maybe) · chat frozen · invite/beta safety notice.
**Rules:** не раскрывать reporter identity; не раскрывать полные детали report; generic safe язык; без exact location (если не authorized); serious actions объясняют что делать дальше если применимо.

| Контекст | Sample copy |
|----------|-------------|
| Report submitted | «Thanks for helping keep the community safe. Our team will review this.» |
| Warning | «Some recent activity may not follow our community guidelines. Please review the safety rules before continuing.» |
| Restriction | «Your account has limited access while we review recent activity.» |
| Event removed | «This event is no longer available. We removed it for safety or policy reasons.» |
| Chat frozen | «This chat is temporarily paused while we review a safety concern.» |

---

## 29. Moderation & Trust Integration

Moderation создаёт trust_events: `report_received` · `moderation_warning` · `restriction_applied` · `suspicious_velocity` · `host_negative_feedback` · `event_no_show` (если связано).
Trust помогает moderation: queue priority · repeat pattern detection · suspicious activity · restriction decisions · host review.
**Rules:** report alone ≠ guilt; block alone ≠ proof; AI flag alone ≠ proof; trust score не публичен; нет публичных негативных ярлыков ([`08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md) §20).

---

## 30. Admin Dashboard Requirements

| Screen | Purpose | Key data | Actions | Sensitive notes | Audit |
|--------|---------|----------|---------|-----------------|:-----:|
| Admin Login | Вход | admin session | login | web only admin | — |
| Moderation Queue | Очередь | priority/category/target type/event timing/AI summary/prev reports (internal)/assigned/status | filter/open/assign | AI assistive | при действии |
| Report Detail | Разбор report | context/reporter/target/description/related content/AI summary/trust context/prev actions | take action/escalate/dismiss | reporter защищён; reason обяз. | ✅ |
| User Detail | Пользователь | profile, history, trust context, flags | restrict/ban/note | trust SS-only | доступ logged |
| Event Detail | Событие | full event incl. exact | remove/cancel/restrict host | exact-доступ logged | ✅ при действии |
| Message Detail | Сообщение | snapshot + thread | hide/restore/action | контекст при удалении | ✅ при действии |
| Suspicious Activity | Velocity/pattern | flags | review | не enforcement | при действии |
| Audit Logs | Аудит | log entries | view/filter | append-only/immutable | — |
| Action Modal | Применить действие | action+reason(+duration)+notif choice | confirm | serious→human | **✅ обязательно** |

---

## 31. Beta Safety Operations

**Recommendations:** founder/admin вручную ревьюит queue ежедневно · critical reports — немедленно · first-time hosts — manual event review · узкие event-категории · invite-only · high-risk категории исключены (no nightlife/parties/dating) · мониторинг reports/blocks/no-shows · review AI false positives · weekly safety review.
**Beta safety dashboard metrics:** new reports · open high/critical · avg moderation response time · reports per 100 users · blocks per 100 users · events removed for safety · users restricted/banned · no-show rate · unsafe event flags · AI false positive rate.

---

## 32. Moderation SLAs / Response Targets (beta)

| Priority | Target |
|----------|--------|
| `critical` | как можно скорее; urgent founder/admin attention |
| `high` | same-day review во время beta-операций |
| `medium` | в рамках обычного moderation-цикла |
| `low` | batch review |

Точные SLA уточняются; во время закрытой беты ручная cadence допустима; **event start time влияет на priority**.

> **Rule: reports по событиям, стартующим в ближайшие 24 часа, приоритизируются.**

---

## 33. Escalation Policy

**Escalate когда:** credible угроза вреда · серьёзный harassment/stalking · location privacy leak · unsafe офлайн-инцидент · повторные reports на один target · scam/fraud pattern · неуверенность admin · legal/privacy concern.

```
report → moderator review → founder/senior admin → temporary protective action → final decision → audit log → notification (если уместно)
```

**Protective temporary actions:** freeze chat · restrict user · remove event из discovery · hide content · pause host ability создавать события. (Все → audit log.)

---

## 34. Appeals / Review

MVP — lightweight review, не полная appeals-система. Пользователю может понадобиться: узнать почему restricted · сообщить о false no-show · запросить review ban/restriction · спросить про removed event.
**Rules:** appeals не раскрывают reporter identity; audit logs помогают review; serious actions internally reviewable; полный appeals workflow — P1.
**Open decision:** существуют ли appeals в закрытой бете (Q-APPEAL).

---

## 35. Privacy & Data Handling in Moderation

**Не раскрывать:** report descriptions reported-пользователю · reporter identity (если не необходимо и безопасно) · moderation notes normal users · raw trust score · AI risk scores · private profile details · exact location в reports (если admin не authorized).
**Retention:** reports — retention; audit logs — дольше; deleted user data + safety records — политика; message snapshots — политика; media attachments — политика.
**Open questions:** retention окна (OD-9) · reported message snapshots (Q-MSG-SNAP) · deletion vs safety record retention.

---

## 36. Moderation Analytics Boundary

**Allowed:** `report_created` · `report_category` · `report_priority` · `moderation_action_taken` · `action_type` · `event_removed_for_safety` · `user_restricted` · `user_banned` · `message_reported` · `chat_frozen` · `block_created` · `suspicious_velocity_flagged`.
**Never send:** report description · raw message body · private admin notes · exact location · phone/email/DOB · raw trust score · детальный AI risk text если sensitive.
**Goal:** измерять safety funnel без утечки sensitive (Инвариант 3/9; [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §22).

---

## 37. Moderation Testing Plan

**Report:** user может report user/event/message; report имеет target; reporter видит ограниченный статус своих; reported user не видит report; admin видит full SS.
**Block:** user блокирует другого; не себя; blocked не apply к событиям блокирующего; не взаимодействует напрямую; block не уведомляет blocked.
**Admin action:** dismiss/warn/restrict/ban/remove_event/hide_message/freeze_chat; serious требует reason; каждое действие → audit log.
**AI moderation:** AI flag создаёт queue item; AI summary admin-only; AI не банит автоматически; false positive можно dismiss.
**Event safety:** unsafe event → pending_review/removed; событие скоро + high priority report выше в очереди; removed event не виден normal users; attendees получают safe notification.
**Chat moderation:** reported message создаёт report; hidden message не виден normal users; frozen chat блокирует writes; admin видит контекст сообщения.
**Privacy:** report description не в analytics; exact location не в moderation notifications; reporter identity не показан reported user; moderation notes скрыты от normal users.

---

## 38. Moderation Review Checklist Before Beta

☐ report user/event/message работает ☐ block user работает ☐ moderation queue существует ☐ admin видит report detail ☐ admin может take action ☐ serious actions требуют reason ☐ audit logs создаются ☐ AI moderation assist настроен/запланирован ☐ unsafe event handling определён ☐ event chat moderation определён ☐ location/privacy incident handling определён ☐ notification copy безопасен ☐ analytics boundary проверена ☐ trust integration определена ☐ beta review cadence определена ☐ high/critical escalation path определён.

---

## 39. Moderation Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Moderation добавлена слишком поздно | Критич. | Safety встроена с дня 1; queue до беты |
| Reports игнорируются в бете | Высокий | Ежедневная review cadence; critical немедленно |
| False reports вредят пользователям | Высокий | report ≠ guilt; паттерн; human review |
| Admin actions не логируются | Высокий | Edge Function обязывает audit |
| AI false positives | Средний | Human review serious; recoverable |
| AI false negatives | Средний | Reports + manual review дополняют AI |
| Unsafe event approved | Высокий | pending_review/manual review first-time hosts |
| Location leak через описание | Высокий | Валидация/scan; exact отдельно; tests |
| Host abuse approval/no-show | Средний | Reporting + admin review; trust signals |
| Block-поведение неясно в общих событиях | Средний | Edge cases §11 определены; тесты |
| Chat harassment после approval | Высокий | Report/freeze/restrict; block мгновенный |
| Report data утекает не тому | Высокий | RLS reports не публичны; analytics boundary |
| Moderation workload слишком высокий | Средний | Очередь+приоритеты; AI triage; узкая бета |
| Восприятие app как unsafe | Высокий | Видимый safety UX; быстрый отклик |
| Over-moderation → продукт враждебен | Средний | Пропорциональность; recovery; calm copy |
| Under-moderation → creep behavior | Высокий | Report/block везде; velocity; мануальная бета |

---

## 40. Open Moderation Questions

| # | Вопрос | Связь |
|---|--------|-------|
| OD-13 | Все новые события через manual review в бете? | §17/§31 |
| Q-RM | Может ли host удалить approved attendee? | §11/§25 |
| Q-FREEZE | Host может freeze чат или только admin? | §14/§19 |
| Q-BLK-APV | Как block работает, если оба уже approved на одно событие? | §11 |
| Q-RM2 | Removed attendee теряет read истории чата? | §19 |
| Q-MSG-SNAP | Снапшотить ли body зарепорченного сообщения? | §10/§35 |
| OD-9 | Сколько хранить reports / audit logs? | §35 |
| Q-RES-UPD | Получают ли users update при resolve report? | §28 |
| AQ-RATE | Какие rate limits P0? | §22/§40 |
| Q-RESTR-SCOPE | От каких действий блокируется `restricted_user`? | §14/§15 |
| OD-8 | Как обрабатывать no-show disputes? | §18, Trust §16 |
| Q-HOST-CAP | First-time hosts — лимит capacity? | §25/§31 |
| Q-AUTO-PEND | High-risk описания авто в pending_review? | §17 |
| Q-CRIT-WHO | Кто ревьюит critical reports в закрытой бете? | §32/§33 |
| AQ-ADMIN | Moderation dashboard до внешней беты? | §30 |
| AQ-MODCAT | Первый набор AI moderation категорий? | §26/§7 |
| Q-UNSAFE-DEF | Точное определение «unsafe event»? | §20 |

---

## 41. Summary

- Moderation защищает core офлайн-loop; **report/block/admin queue — P0 safety features**.
- AI ассистирует triage, **не** принимает финальные serious решения (Инвариант 5).
- **Все serious moderation actions → audit logs** (Инвариант 4).
- Покрыты event/chat/profile/location/host safety; unsafe event и location-incident flows определены.
- Закрытая бета требует ручных safety-операций (ежедневный review, manual review first-time hosts, escalation path).
- Нерешённые развилки — §40; следующий документ: [`/docs/10_ANALYTICS.md`](10_ANALYTICS.md).

> Напоминание: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth; все документы и эта moderation-модель ему подчинены. Код/SQL/migrations не создавались.
