# Trust System v1 — Social Events App

> **Status:** v1 (trust blueprint for closed beta)
> **Owner:** Product / Safety / Backend
> **Last updated:** 2026-05-18

---

## 1. Source of Truth

- Документ основан на [`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md), [`01_PRD.md`](01_PRD.md), [`02_USER_STORIES.md`](02_USER_STORIES.md), [`03_USER_FLOWS.md`](03_USER_FLOWS.md), [`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md), [`05_ARCHITECTURE.md`](05_ARCHITECTURE.md), [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md), [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md).
- **[`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth.** При конфликте приоритет у Product Core.
- Trust system **не нарушает** safety-инварианты; **raw trust score never shown to users** (Инвариант 3); **не social credit** (Инвариант 10).
- Документ — основа implementation tasks, `trust_events`, badges и moderation signals. SQL/migrations не создаются.
- Нерешённые развилки — в [§37 Open Trust Questions](#37-open-trust-questions) (CLAUDE.md §3).

---

## 2. Trust System Goals

1. Повысить безопасность офлайн-встреч.
2. Помочь hosts принимать осознанные решения.
3. Снизить no-show и abuse.
4. Поддержать approval-based participation.
5. Обнаруживать suspicious behavior.
6. Давать мягкие позитивные trust cues.
7. Не создавать публичный рейтинг людей.
8. Не создавать dating-style desirability score.
9. Помогать moderation prioritization.
10. Поддержать future intelligence layer без переусложнения MVP.

---

## 3. Trust System Non-Goals

Trust system **не**: показывает raw score · показывает public numeric ratings · показывает public negative labels · ранжирует людей «лучше/хуже» · social credit · заменяет human moderation · авто-банит без review · использует AI как final judge · поощряет popularity contest · превращается в dating/matching score · даёт host'ам абсолютную власть без safeguards · дискриминирует новых за отсутствие истории.

---

## 4. Core Trust Philosophy

- Trust контекстуален.
- Trust зарабатывается постепенно.
- Отсутствие истории ≠ вина.
- Публичные сигналы — positive/neutral.
- Негативные сигналы — внутренние safety-сигналы.
- Видимые badges понятны пользователю.
- Trust объясним для admin.
- Trust восстановим после ошибок.
- Moderation и trust связаны, но не идентичны.
- Trust защищает реальные офлайн-взаимодействия.

> **The product does not score people publicly. It uses internal signals to reduce risk and support safer social connection.**

---

## 5. Trust Layers

| Слой | Связан с |
|------|----------|
| **5.1 Identity Trust** | email/phone verification, profile completeness, photo moderation, onboarding completion |
| **5.2 Participation Trust** | approved applications, attended events, no-shows, cancellations, repeat attendance |
| **5.3 Host Trust** | successfully hosted events, low cancellation rate, attendee feedback, safe event history, moderation history |
| **5.4 Behavior Trust** | reports, blocks, chat behavior, spam velocity, suspicious activity |
| **5.5 Moderation Trust** | warnings, restrictions, bans, removed content, admin decisions |
| **5.6 Public Trust Cues** | Verified, Reliable attendee, Hosted before, Attended events, Profile complete |

Слои 5.1–5.5 — **внутренние**; только 5.6 имеет публичную проекцию (нечисловые badges).

---

## 6. Trust Data Model Reference

(см. [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) §13, [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §19)

- **`trust_events`** — append-only внутренние сигналы; для записи positive/negative/internal, auditability, деривации summary, moderation-контекста.
- **`user_trust_summary`** — derived internal state: `trust_score_internal`, `trust_tier`, attended/hosted/no_show/report/block counts, `last_trust_event_at`. **Critical:** недоступно normal users напрямую (admin/system SS only).
- **`profiles`** — только safe: `verification_level`, `trust_tier` (как basis для нечислового badge), `profile_completeness`. Raw score **не** здесь.
- **`moderation_actions`** — может создавать trust events.
- **`reports`** — может создавать risk signal, но report alone ≠ guilt.
- **`user_blocks`** — risk signal (особенно повторно), но block alone ≠ proof.

---

## 7. Trust Event Types

| Type | Meaning | Trigger | Source | Class | Weight dir. | User-visible? | Admin? |
|------|---------|---------|--------|-------|:-----------:|:-------------:|:------:|
| `profile_completed` | Профиль/onboarding завершён | completeness достигнута | system | Positive | + | косвенно (badge) | ✅ |
| `phone_verified` | Телефон подтверждён | verification | system | Positive | + | косвенно (Verified) | ✅ |
| `event_attended` | Посещение подтверждено | attendance confirm | host/system | Positive | + | косвенно (Reliable) | ✅ |
| `event_no_show` | Не пришёл | no-show зафиксирован | host/system | Risk/Negative | − | ❌ публично | ✅ |
| `host_positive_feedback` | Позитивный host-feedback | после события | host | Positive | + (осторожно) | ❌ | ✅ |
| `host_negative_feedback` | Негативный host-feedback | после события | host | Risk | − (по паттерну) | ❌ | ✅ |
| `report_received` | Получена жалоба | report создан | system | Risk | review priority | ❌ | ✅ |
| `block_received` | Заблокирован кем-то | block создан | system | Risk | review priority | ❌ | ✅ |
| `moderation_warning` | Предупреждение | admin action | admin | Negative/Risk | − | приватно (account msg) | ✅ |
| `restriction_applied` | Ограничение | admin action | admin | Severe Risk | − − | приватно | ✅ |
| `suspicious_velocity` | Аномальная активность | system threshold | system | Risk | review/friction | ❌ | ✅ |
| `event_hosted_successfully` | Событие проведено безопасно | event completed без инцидентов | system | Positive | + | косвенно (Hosted) | ✅ |

> report alone / AI flag alone / single no-show — **не вина**; это сигналы review и friction, не доказательство (Инвариант 5).

---

## 8. Signal Classification

| Signal | Category | Strength | Public? | Admin? | Notes |
|--------|----------|----------|:-------:|:------:|-------|
| phone_verified | Positive | medium | косвенно | ✅ | → Verified |
| profile_completed | Positive | low–medium | косвенно | ✅ | → Profile complete |
| event_attended | Positive | medium | косвенно | ✅ | → Reliable basis |
| event_hosted_successfully | Positive | medium | косвенно | ✅ | → Hosted before |
| host_positive_feedback | Positive | low (осторожно) | ❌ | ✅ | bias-риск |
| new user / low activity | Neutral | — | ❌ (или «New») | ✅ | ≠ вина |
| early-cancelled application | Neutral | low | ❌ | ✅ | лучше, чем no-show |
| pending moderation | Neutral | — | ❌ | ✅ | временное |
| repeated no-show | Risk | medium–high | ❌ | ✅ | паттерн |
| repeated reports | Risk | high | ❌ | ✅ | review priority |
| repeated blocks received | Risk | medium–high | ❌ | ✅ | review priority |
| suspicious_velocity | Risk | medium | ❌ | ✅ | soft friction |
| unsafe content flagged | Risk | medium | ❌ | ✅ | AI assist |
| confirmed harassment | Negative | high | ❌ | ✅ | human-confirmed |
| moderation_warning | Negative | medium | приватно | ✅ | — |
| event removed for safety | Negative | high | ❌ | ✅ | audit |
| restriction_applied | Negative/Severe | high | приватно | ✅ | reviewable |
| ban | Severe | max | ❌ | ✅ | human (Инв.5) |
| confirmed scam / serious incident | Severe | max | ❌ | ✅ | human + audit |

> **Risk signals are not proof. They are review and friction signals.**

---

## 9. Trust Tiers

| Tier | Meaning | Public UX |
|------|---------|-----------|
| `new` | Новый, мало истории, **не негатив** | Нет badge или мягкое «New member» |
| `verified` | Пройдены ключевые verification/profile шаги | Verified badge |
| `reliable` | Надёжное посещение, нет серьёзных safety-проблем | Reliable attendee badge |
| `trusted_host` | Успешные события, позитивная история, нет серьёзной модерации | Hosted before / trusted-host cue |
| `restricted` | Внутреннее ограничение из-за safety/moderation | **Не** показывать «restricted» публично; пользователю — приватное account-limitation сообщение |
| `suspended` | Серьёзное ограничение / pre-ban | **Не** показывать другим |

> `trust_tier` **не** должен стать публичной иерархией. Публичные badges — контекстные и мягкие. Отсутствие tier ≠ негативный ярлык.

---

## 10. Public Trust Badges

| Badge | Meaning | Source | Visibility | Conditions | Risks |
|-------|---------|--------|------------|------------|-------|
| Verified | Пройдена базовая верификация (phone/email) | verification_level | profile/host card | email+phone verified (OD-1) | Не подразумевать гос-верификацию |
| Reliable attendee | История надёжного посещения | trust_events | profile/applicant | ≥N attended, низкий no-show, нет серьёзной модерации | Bias к новым (decay/recovery) |
| Hosted before | ≥1 завершённое событие как host | events/trust | host card | ≥1 completed hosted | — |
| Successful host (P1) | Несколько безопасных событий | trust | host card | ≥N successful, низкая отмена | Status-конкуренция |
| Profile complete | Onboarding/профиль завершён | profile_completeness | profile | required fields + accepted safety + (approved photo) | Не как «judgement» |
| Attended events | Реальная история участия | trust | profile | ≥1 attended | Не показывать число как рейтинг |

**Rules:** badges positive/neutral; нет публичных негативных badges; нет числового score; нет report/block/no-show счётчиков публично.
**Forbidden:** Risky user · Low trust · Reported · Often blocked · No-show user · «Trust score 74» · Top 10% · Hot/Popular.

---

## 11. Internal Trust Score

`trust_score_internal` — **internal only**: не возвращается mobile client, не в public profile, не в analytics, не показывается host как число; используется для: приоритет moderation queue · решение о доп. verification · velocity limit · флаг suspicious · eligibility создавать событие · решение о manual review.

**Principle-based MVP-модель (не финальная формула):**
- Base — neutral.
- Positive events медленно повышают trust.
- Risk events понижают trust / повышают review priority.
- Severe moderation actions override score.
- Недавнее поведение важнее старого.
- Повторяющиеся паттерны важнее одиночных событий.

> ⚠️ **Не реализовывать сложный scoring до данных беты.** Старт — простые event-based правила и internal tiers (§28).

---

## 12. Trust Score Guardrails

1. Никогда не показывать raw score пользователям.
2. Никогда не отдавать score в public API.
3. Никогда не слать score в analytics.
4. Score — не единственное основание для serious enforcement.
5. Не наказывать по одному неподтверждённому report.
6. Severe consequences → admin review.
7. Scoring объясним.
8. Избегать demographic-sensitive сигналов.
9. Без popularity-ranking.
10. Без dating-style compatibility scoring в MVP.
11. Новые пользователи ≠ подозрительные by default.
12. Изменения score трассируемы к `trust_events`.

---

## 13. Verification Model

| State | Meaning |
|-------|---------|
| `none` | Только базовый аккаунт |
| `email_verified` | Email подтверждён через auth |
| `phone_verified` | Телефон подтверждён; сильный сигнал; может требоваться до apply/create |
| `identity_reviewed` | P1/опц.; усиленная проверка; **не MVP** без явного решения |

Влияние: может анлокать apply / event creation; повышает host confidence; вклад в Verified badge.
**Open decision (OD-1):** phone verification до apply или до approval?
**Recommendation:** для safety-heavy беты — требовать phone verification до apply или до approval; точная точка — product decision.

---

## 14. Profile Completeness Model

Inputs: display name · city · interests · vibe tags · intent · bio (опц.) · photo · принятые safety principles · phone verification (возможно отдельно) · approved photo moderation.
Scoring: `profile_completeness` 0–100 (internal/owner-visible); **не публичное суждение**; минимум может требоваться до apply.
Use cases: onboarding gate · apply eligibility · host confidence · moderation context.
**Open decisions:** минимальный completeness для apply (OD-6); видимость completeness другим (Open Q).

---

## 15. Attendance Reliability

**Positive:** attended confirmed event · host подтвердил · user подтвердил · стабильное участие · ранняя отмена вместо no-show.
**Risk:** no-show · last-minute cancellation · повторные отмены · approved но не пришёл.
**Rules:** один no-show ≠ перманентный урон; повторные no-show снижают reliability; no-show внутренний (проявляется как отсутствие позитивного badge, не как ярлык); **нет публичного no-show ярлыка**.
**Public badge:** Reliable attendee после достаточного confirmed attendance + низкий no-show паттерн.

---

## 16. No-show Logic

Sources: host отмечает no-show · user не подтвердил attendance · system промптит обе стороны · admin review при споре.
Risks: host злоупотребляет отметкой · у user легитимная причина · путаница с отменой события · плохой UX при жёстком наказании.
Rules: no-show — внутренний trust-сигнал; повторные могут влиять на apply/create; user должен иметь способ оспорить/объяснить (хотя бы в будущем); host feedback alone ≠ severe penalty без паттерна.

```
approved → event completed → attendance confirmation prompt
  → attended | no_show | excused_absence → trust_event → user_trust_summary update
```

**Open decisions (OD-8):** как именно отмечать no-show; нужно ли self-confirmation; есть ли dispute в MVP.

---

## 17. Host Feedback Model

Purpose: выявлять надёжных attendees; детектить safety-проблемы; улучшать trust.
Types: attended/did not attend · позитивное участие · issue report · приватная host-заметка (опц.).
**Rules:** host feedback приватный/внутренний; **не** публичный рейтинг/звёзды/негативный ярлык; severe feedback → report/moderation route; позитивный поддерживает reliability badge; негативный требует паттерн/review до серьёзных последствий.
**Запрещено:** public star ratings · public reviews of people · attractiveness/personality scoring · dating-style «would you meet again?» в MVP.

---

## 18. Host Trust Model

**Positive host signals:** event_hosted_successfully · completed event · низкая отмена · attendees подтвердили · нет серьёзных reports · ясные описания · корректная работа с location.
**Risk host signals:** повторные отмены · unsafe описания · reports от attendees · misuse exact location · harassment · fake events.
**Privileges trust может затрагивать:** возможность создавать события · число событий/неделю · capacity limits · нужен ли manual review · хостинг без доп. approval · trusted_host badge.
**Rules:** host accountable; approval power уравновешен report/moderation; trusted_host зарабатывается осторожно.

---

## 19. Applicant Trust Context for Hosts

**Host видит (allowed):** safe public profile · profile completeness · verification badge · attended events (soft signal/badge) · Reliable attendee badge (если заработан) · application note · взаимная история событий (P1).
**Host НЕ видит:** raw trust score · report_count · block_count · no_show_count как ярлык · internal risk score · moderation notes · private phone/email/DOB · sensitive personal data.

> Host видит достаточно контекста для безопасного решения, но **не** внутренние moderation/trust-данные (Инвариант 3, [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §19).

---

## 20. Moderation Integration

Moderation создаёт trust_events: `moderation_warning`, `restriction_applied`, `report_received`, `suspicious_velocity`, confirmed unsafe behavior.
Trust помогает moderation: приоритизация reports · выявление паттернов · триггер manual review · добавление friction · ограничение velocity.
**Rules:** report alone ≠ guilt; AI flag alone ≠ guilt; serious moderation → human/admin review (Инвариант 5); trust **поддерживает**, не заменяет moderation.
Actions, влияющие на trust: warn_user · restrict_user · ban_user · remove_event · hide_message · freeze_chat (каждое → audit log, Инвариант 4).

---

## 21. Suspicious Behavior & Velocity Signals

Examples: много заявок за короткое время · повторные rejected applications · флуд сообщений · reports от разных пользователей · повторные blocks · частые изменения профиля · быстрые создания событий · invite code abuse · spam-like bio/описания.
**Rules:** `suspicious_velocity` → risk signal; soft friction может быть автоматическим; severe enforcement → review; velocity limits настраиваются в бете.
Possible soft restrictions: application cooldown · message cooldown · event creation limit · доп. verification · manual review.

---

## 22. Trust Effects on Product Access

| Trust State / Signal | Possible Product Effect | Publicly Visible? | Requires Admin Review? | Notes |
|----------------------|-------------------------|:-----------------:|:----------------------:|-------|
| phone_verified | apply/create unlocked (OD-1) | косвенно (Verified) | ❌ | gate |
| profile_completed | discovery/apply доступ | косвенно (Profile complete) | ❌ | OD-6 |
| reliable attendee | публичный badge | ✅ (badge) | ❌ | positive |
| repeated no-show | application cooldown (возможно) | ❌ | при эскалации | паттерн |
| suspicious_velocity | manual review / soft limit | ❌ | да (для serious) | friction |
| restriction_applied | лимит messaging/applying/hosting | приватно | ✅ | reviewable |
| banned | нет взаимодействия | ❌ | ✅ (human) | Инвариант 5 |

> Severe restrictions — reviewable; эффекты на доступ — прозрачны затронутому пользователю где уместно; внутренняя причина **не** раскрывается другим.

---

## 23. Trust UX Guidelines

**Principles:** positive/контекстно · без числового scoring · без shame-ярлыков · без popularity ranking · без dating desirability · просто объяснять badges · safety cues спокойные, не paranoid.

| Good | Bad |
|------|-----|
| «Phone verified» | «Trust score: 82» |
| «Reliable attendee» | «Low trust» |
| «Hosted before» | «Often reported» |
| «Profile complete» | «No-show risk» |
| «Attended events» | «Top rated user» / «Popular host» / «High chemistry» |

**Microcopy:** Verified — «This user completed basic verification.» · Reliable attendee — «This user has a history of attending events they join.» · Hosted before — «This host has created events before.» · Location — «Exact location is shared only after approval.»

---

## 24. Trust and Privacy

- Raw score / `trust_events` / `user_trust_summary` — internal only.
- Public badges derived безопасно.
- Нет sensitive в analytics; нет raw trust в notifications.
- Host видит только safe signals; admin — trust-контекст для moderation.
- User видит **позитивный собственный прогресс**, но не полную internal risk-модель.

| User-facing own trust — Allowed | Not allowed / risky |
|---------------------------------|---------------------|
| profile completeness | raw score |
| verification status | hidden risk labels |
| earned badges | report count |
| attendance history | block count / internal moderation score |

---

## 25. Fairness & Abuse Prevention

**Risks:** false reports · biased host feedback · новые без истории · social popularity bias · over-penalizing no-shows · AI false positives · gaming badges · host unfairly excludes · privacy invasion.
**Mitigations:** не реагировать на одиночный сигнал · паттерны, не isolated events · severe → human review · восстановление со временем · избегать demographic-sensitive данных · popularity ≠ trust · trust-логика объяснима · мониторить false positives в бете.

---

## 26. Recovery & Decay

**Principles:** старые мелкие негативные сигналы декеят; позитивное посещение восстанавливает reliability; restrictions истекают/ревьюатся; no-show ≠ вечный шрам; severe safety-инциденты держатся дольше; audit logs остаются для safety, но публичный trust не наказывает вечно.
**Possible decay model:** minor risk decay со временем; недавние повторные проблемы весомее; severe moderation persists; позитивное участие постепенно улучшает reliability.
**Open decision:** точные decay-окна.

---

## 27. Trust Event Creation Rules

| Trigger | trust_event_type | Created By | Requires Review? | Updates Summary? | Notes |
|---------|------------------|------------|:----------------:|:----------------:|-------|
| onboarding completed | profile_completed | system | ❌ | ✅ | автоматически |
| phone verified | phone_verified | system | ❌ | ✅ | автоматически |
| attendance confirmed | event_attended | host/system | ❌ | ✅ | метод OD-8 |
| no-show recorded | event_no_show | host/system | при споре | ✅ | dispute (Open Q) |
| host feedback positive | host_positive_feedback | host | ❌ | ✅ (осторожный вес) | bias-риск |
| host feedback negative | host_negative_feedback | host | по паттерну | ✅ | не авто-наказание |
| user report created | report_received | system | при эскалации | ✅ (risk) | ≠ guilt |
| user blocked | block_received | system | при повторе | ✅ (risk) | ≠ proof |
| admin warning | moderation_warning | admin | ✅ (human) | ✅ | + audit log |
| admin restriction | restriction_applied | admin | ✅ (human) | ✅ | + audit log |
| velocity exceeded | suspicious_velocity | system | для serious | ✅ (risk) | soft friction |
| event completed safely | event_hosted_successfully | system | ❌ | ✅ | host trust |

> `trust_events` append-only; часть автоматическая, часть требует admin-подтверждения; summary деривируется из events.

---

## 28. Trust Summary Update Model

Fields: `trust_score_internal`, `trust_tier`, `attended_events_count`, `hosted_events_count`, `no_show_count`, `report_count`, `block_count`, `last_trust_event_at`.
**Principles:** derived из `trust_events` + связанных таблиц; обновляется Edge Function/scheduled job; не редактируется вручную кроме admin/system correction; изменения трассируемы; severe moderation может override tier.

> ⚠️ **MVP — rule-based tiers, не ML scoring.**

**Rule-based MVP approach:**
- `new` — default;
- `verified` — profile completed + phone/email verified;
- `reliable` — ≥N attended + низкий no-show + нет серьёзной модерации;
- `trusted_host` — N successful hosted + нет серьёзных host-reports;
- `restricted` — активное ограничение;
- `suspended` — активное suspension/ban-adjacent.

---

## 29. Public Badge Eligibility

| Badge | Conditions |
|-------|------------|
| Verified | email verified + phone verified + onboarding complete |
| Reliable attendee | ≥N attended · ≤X no-shows · нет активных restrictions · нет недавних serious moderation actions |
| Hosted before | ≥1 completed hosted event |
| Trusted / Successful host (P1 / careful P0) | ≥N successful events · низкая отмена · нет серьёзных safety reports · позитивные attendee signals |
| Profile complete | required onboarding fields · ≥1 approved photo (если требуется) · safety principles accepted |

**Open decision:** точные пороги N/X — после данных беты (Open Q).

---

## 30. Anti-patterns (запрещено)

public numeric trust score · public star ratings людей · public negative badges · «hotness»/attractiveness сигналы · dating-style compatibility score в MVP · leaderboard доверенных · popularity ranking · «who viewed my profile» · публичные report/block/no-show счётчики · auto-ban по AI-only сигналу · перманентное наказание за один no-show · severe penalty только от host-negative feedback · раскрытие internal trust причин другим · trust как социальный статус.

---

## 31. Trust System Examples

1. **New user:** onboarding + phone verify → Verified badge; tier new → verified.
2. **Reliable attendee:** 3 attended, 0 no-show, нет серьёзных reports → Reliable attendee badge.
3. **One no-show:** internal `event_no_show`; нет публичного ярлыка; badge может не появиться.
4. **Repeated no-shows:** internal risk растёт; возможен application cooldown / host-review friction.
5. **Report received:** risk signal; нет немедленного публичного эффекта; admin review если serious/повторно.
6. **Host с безопасной историей:** несколько событий, attendees подтверждают, нет серьёзных reports → Hosted before / Trusted host.
7. **AI false positive:** AI флагует описание → `pending_review` → admin review → нет авто-severe enforcement.

---

## 32. Trust Metrics

verified user rate · profile completion rate · event attendance rate · no-show rate · repeat attendance rate · host repeat rate · reports per 100 users · blocks per 100 users · moderation-confirmed report rate · AI false positive rate · restrictions per 100 users · badge eligibility rate · reliable attendee conversion rate.

> Метрики улучшают safety, **не** ранжируют пользователей публично.

---

## 33. Trust Analytics Boundary

**Never send:** raw `trust_score_internal` · report descriptions · moderation notes · private trust event metadata · block/report counts как identifiable user-level properties · phone/email/DOB · exact location.
**Allowed:** badge earned event · verification completed · attendance confirmed · `no_show_recorded` (aggregate/safety) · trust tier changed (internal only) · `moderation_action_taken` без sensitive detail.
**Analytics events:** `profile_completed`, `phone_verified`, `attendance_confirmed`, `no_show_recorded`, `reliable_badge_earned`, `hosted_event_completed`, `trust_tier_updated_internal`, `suspicious_velocity_flagged`, `moderation_warning_created`.
**Privacy notes:** только enum/id/bucket/aggregate; никакой sensitive детализации (Инвариант 3/9; [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §22).

---

## 34. Trust Testing Plan

**Public visibility:** raw score никогда в public profile; `user_trust_summary` недоступен normal user; `trust_events` недоступны; host не видит applicant raw score; нет report/block/no-show счётчиков публично; нет публичных негативных badges.
**Badge:** Verified только после verification; Reliable только после eligibility; Hosted before только после completed hosted; badge скрыт при активном restriction.
**Trust event:** phone verify → `phone_verified`; attendance → `event_attended`; no-show → `event_no_show`; report → `report_received` без авто-бана; admin warning → `moderation_warning`; restriction → `restriction_applied`.
**Access effect:** restricted не выполняет лимитированные действия; banned не взаимодействует; новый user не блокируется несправедливо; повторный no-show → только определённый friction.
**Moderation integration:** AI flag не создаёт финальный ban; serious требует admin; moderation action → audit log + trust_event если уместно.

---

## 35. Trust Review Checklist Before Beta

☐ raw trust score скрыт ☐ `trust_events` internal only ☐ `user_trust_summary` internal only ☐ public badges positive/neutral ☐ нет публичных негативных ярлыков ☐ нет публичных ratings ☐ нет dating-style scoring ☐ host видит только safe applicant trust context ☐ reports не наказывают автоматически ☐ no-show логика определена ☐ verification правила определены ☐ Reliable attendee пороги определены/отложены ☐ Trusted host пороги определены/отложены ☐ moderation integration определена ☐ trust tests запланированы ☐ analytics boundary проверена ☐ RLS защищает trust-таблицы.

---

## 36. Trust Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Raw trust score утёк | Высокий | RLS admin/system-only; запрет в view/API/analytics; тесты |
| Восприятие как social credit | Высокий | Нет публичного score/ranking; positive cues only; copy |
| Hosts over-rely на badges | Средний | Badges мягкие; контекст + note; не абсолют |
| False reports вредят trust | Высокий | report ≠ guilt; паттерн; human review |
| Host feedback bias | Средний | Внутренний вес осторожный; review; не авто-наказание |
| No-show несправедливо наказан | Средний | Один ≠ шрам; dispute (future); паттерн |
| Новые в невыгоде | Средний | Отсутствие истории ≠ вина; нейтральный старт |
| AI false positives | Средний | Human review serious; recoverable |
| Badges → status competition | Средний | Нет leaderboard/числа; контекстность |
| Слишком сложная логика рано | Средний | Rule-based MVP; не ML до данных |
| Internal score без review | Высокий | Severe → human; guardrails §12 |
| Trust metadata утекает в analytics | Высокий | Analytics boundary §33 |
| Badge подразумевает больше verification, чем есть | Средний | Точная microcopy; не «identity verified» если не так |

---

## 37. Open Trust Questions

| # | Вопрос | Связь |
|---|--------|-------|
| OD-1 | Phone verification до apply или approval? | §13 |
| OD-6 | Минимальный profile completeness для apply? | §14 |
| Q-RA-BETA | Reliable attendee badge в первой бете или позже? | §10/§29 |
| Q-RA-THR | Точный порог Reliable attendee (N/X)? | §29 |
| Q-TH-THR | Точный порог Trusted host? | §29 |
| OD-8 | Как именно подтверждать attendance / отмечать no-show? | §16 |
| Q-NS-WHO | Кто может отмечать no-show? | §16 |
| Q-NS-DISP | Может ли user оспорить no-show в MVP? | §16/§26 |
| Q-DECAY | Как быстро декеят minor negative сигналы? | §26 |
| Q-HOST-VIS | Host видит attended count или только badge? | §19 |
| Q-PEER-BADGE | Approved attendees видят badges друг друга? | §10/§19 |
| Q-FB-BIAS | Как обрабатывать host feedback bias? | §17/§25 |
| Q-COMPLETE-VIS | Profile completeness видна другим или только owner/host? | §14/§24 |
| Q-RESTR-BADGE | Restriction скрывает публичные badges? | §9/§29 |
| Q-ADMIN-ADJ | Может ли admin вручную менять trust tier? | §28 |
| Q-TIER-STORE | trust_tier хранится или полностью derived? | §28 |

---

## 38. Summary

- Trust system поддерживает **safety и офлайн-надёжность**, не публичный рейтинг.
- **Raw trust score — internal only**; публичные cues — positive/neutral нечисловые badges.
- Нет public ratings, нет social credit, нет dating-style scoring; risk-сигналы внутренние и review-ориентированные.
- `trust_events` (append-only) и `user_trust_summary` (derived, internal) питают moderation prioritization и product-access friction.
- MVP — rule-based tiers, не ML; recovery/decay и fairness встроены; severe → human review (Инвариант 5).
- Нерешённые развилки — §37; следующий документ: [`/docs/09_MODERATION.md`](09_MODERATION.md).

> Напоминание: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth; все документы и эта trust-модель ему подчинены. Код/SQL/migrations не создавались.
