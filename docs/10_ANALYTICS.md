# Analytics v1 — Social Events App

> **Status:** v1 (analytics blueprint for closed beta)
> **Owner:** Product / Founder / Backend
> **Last updated:** 2026-05-18

---

## 1. Source of Truth

- Документ основан на [`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md), [`01_PRD.md`](01_PRD.md), [`02_USER_STORIES.md`](02_USER_STORIES.md), [`03_USER_FLOWS.md`](03_USER_FLOWS.md), [`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md), [`05_ARCHITECTURE.md`](05_ARCHITECTURE.md), [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md), [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md), [`08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md), [`09_MODERATION.md`](09_MODERATION.md).
- **[`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth.** При конфликте приоритет у Product Core.
- Analytics **не нарушает** safety-инварианты и **не собирает sensitive data** (Инвариант 3/9; [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §22, [`08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md) §33).
- Документ — основа PostHog instrumentation, dashboards, beta metrics, product review. SDK/код не подключаются.
- Нерешённые развилки — в [§42 Open Analytics Questions](#42-open-analytics-questions) (CLAUDE.md §3).

---

## 2. Analytics Goals

1. Проверить, работает ли главный product loop.
2. Измерить activation и onboarding completion.
3. Измерить discovery и application behavior.
4. Измерить host supply и host quality.
5. Измерить approval, attendance, no-show.
6. Измерить post-event reconnect.
7. Измерить safety и moderation health.
8. Измерить beta invite funnel.
9. Измерить retention.
10. Помогать founder'у в product decisions.
11. Находить friction в UX.
12. Не нарушать privacy и trust.

---

## 3. Analytics Non-Goals

Не делаем: tracking ради vanity metrics · сбор exact location · raw message content · report descriptions · private moderation notes · показ raw trust score · public rankings · dating compatibility score · analytics как enforcement · замена user interviews · оптимизация addictive engagement · popularity ranking людей · сбор лишних personal data.

---

## 4. Analytics Philosophy

- Измерять trust loop, не vanity engagement.
- Измерять реальные офлайн-исходы.
- Safety-метрики = product-метрики.
- Privacy — часть качества аналитики.
- Retention важен только если взаимодействия безопасны и осмысленны.
- Beta-аналитика actionable, не шумная.
- Аналитика поддерживает human product judgment.
- Качественная обратная связь важна наравне с количественной.

> **The goal is not to maximize screen time. The goal is to increase safe, trusted offline interactions.**

---

## 5. North Star Metric

> **Trusted offline interactions**

MVP-формула: `completed events × confirmed attendees × safety quality multiplier`

- **completed events** — события со статусом `completed`.
- **confirmed attendees** — пользователи с `attendance_status = attended`.
- **safety quality multiplier** — мягкий коэффициент: low report rate · low block rate · low serious incident rate · low event removal rate · manageable no-show rate.

> Safety multiplier **не публичный user score** — это агрегированная продуктовая метрика; точная формула эволюционирует в бете (Open Q).

**Supporting metrics:** events completed/week · confirmed attendees per completed event · repeat attendance rate · report rate per event · no-show rate · host repeat rate.

---

## 6. Metric Hierarchy

| Level | Metrics |
|-------|---------|
| **L1 — North Star** | trusted offline interactions |
| **L2 — Core Loop** | discovery · applications · approvals · attendance · reconnect |
| **L3 — Supply** | active hosts · events created · published · completed · host repeat rate |
| **L4 — Demand** | active users · event views · applications · approval acceptance · attendance |
| **L5 — Safety** | reports · blocks · moderation response time · removed events · restricted/banned · no-show rate |
| **L6 — Quality** | user feedback · host feedback · post-event reconnect · qualitative safety perception |

---

## 7. Analytics Tooling Assumption

- **Product analytics:** PostHog.
- **Crash/error:** Sentry.
- **Backend/DB logs:** Supabase logs.
- **Manual beta review:** founder/admin dashboard; spreadsheet/manual notes допустимы в ранней бете.

> На этом шаге **SDK не подключается** — только requirements; implementation — в coding phase ([`05_ARCHITECTURE.md`](05_ARCHITECTURE.md) §20).

---

## 8. Event Naming Conventions

**Rules:** `snake_case`; глаголы в past tense где возможно; без ambiguous names; consistent domain-префиксы; **без sensitive data в именах**; properties privacy-safe.

| Good | Bad |
|------|-----|
| `signup_completed`, `onboarding_step_completed`, `event_viewed`, `application_created`, `application_approved`, `event_chat_opened`, `report_created`, `moderation_action_taken` | `clicked_button_123`, `user_saw_john_event`, `exact_location_opened_at_berlin_address`, `message_body_sent`, `user_reported_for_harassment_with_text` |

---

## 9. Common Event Properties

**Allowed:** `user_id`/`analytics_distinct_id` · `session_id` · `app_version` · `platform` · `environment` · `city_id` · `beta_cohort` · `feature_flag_keys` · `screen_name` · `flow_id` · `source` · `previous_screen` · `timestamp`.
**Use carefully:** `event_id` · `category_id` · `application_status` · `event_status` · `report_category` · `report_priority` · `moderation_action_type` · `notification_type`.
**Never:** exact_location_text/address/lat/lng · phone_number · email (если не hashed/allowed) · date_of_birth · raw message body · report description · moderation note · raw trust score · private profile fields.

---

## 10. User Properties

**Allowed:** `user_role` · `onboarding_completed` (bool) · `profile_completed` (bool) · `city_id` · `beta_cohort` · `verification_level` (enum) · `profile_completeness_bucket` · `has_created_event` · `has_applied_to_event` · `has_attended_event` · `is_host` · `account_status` (broad enum if safe).
**Use caution:** `trust_tier` (internal analytics only) · `no_show_count` (aggregate/internal, не как ordinary user prop) · `report_count` (не как ordinary analytics user prop).
**Forbidden:** raw `trust_score_internal` · phone · email (если не allowed/hashed) · DOB · legal_name · exact location · report/block counts как PII user property · private moderation notes.

---

## 11. Core Product Loop Analytics

| Stage | Key events | Conversion | Drop-off risk | Privacy notes |
|-------|------------|------------|---------------|---------------|
| **Discover** | `home_opened`, `event_discovery_viewed`, `event_filter_applied`, `event_viewed` | event_viewed / discovery_viewed | пустая лента, нерелевантно | без exact location |
| **Apply** | `application_started`, `application_created`, `application_cancelled`, `application_requirement_blocked` | application_created / event_viewed | verification/completeness гейт, approval-страх | без intro_note |
| **Approve** | `application_reviewed`, `application_approved`, `application_rejected`, `application_waitlisted` | approved / created | host inactivity, недостаток контекста | без host_note |
| **Attend** | `event_reminder_sent`, `event_started`, `event_completed`, `attendance_confirmed`, `no_show_recorded` | attendance_confirmed / approved | no-show, забыл, низкое доверие | без exact location |
| **Reconnect** | `post_event_reconnect_viewed`, `post_event_chat_opened`, `repeat_application_created` | repeat_attendance / first_attendance | окно chat истекло, нет ценности | без feedback text |

---

## 12. Activation Funnel

| # | Event | Trigger | Success metric | Likely drop-off | Product question |
|---|-------|---------|----------------|-----------------|------------------|
| 1 | `app_opened` | запуск | reach | — | трафик |
| 2 | `signup_started` | открыт signup | start rate | invite-барьер | top of funnel |
| 3 | `signup_completed` | аккаунт создан | signup CR | OAuth/email friction | auth работает? |
| 4 | `invite_code_used`/`beta_access_granted` | invite valid | invite CR | нет инвайта | контроль беты |
| 5 | `onboarding_started` | вход в onboarding | start rate | — | onboarding ясен? |
| 6 | `onboarding_completed` | onboarding завершён | onboarding CR | слишком много шагов | friction |
| 7 | `profile_completed` | completeness достигнута | profile CR | photo/verification | gating |
| 8 | `first_event_viewed` | первый Event Detail | discovery activation | пустой город | supply есть? |
| 9 | `first_application_created` | первая заявка | **soft activation** | approval-страх | спрос есть? |
| 10 | `first_application_approved` | первый approve | approval CR | host inactivity | supply quality |
| 11 | `first_event_attended` | первое attended | **hard activation** | no-show | loop работает? |

**Activation definition:** активирован, если **подал первую заявку** (soft) или **посетил первое событие** (hard).
- **Soft activation:** `first_application_created`.
- **Hard activation:** `first_event_attended`. (Какую считать главной — Open Q.)

---

## 13. Onboarding Analytics

**Events:** `onboarding_started`, `onboarding_step_viewed`, `onboarding_step_completed`, `onboarding_step_skipped`, `safety_principles_accepted`, `city_selected`, `interests_selected`, `vibe_tags_selected`, `intent_selected`, `profile_photo_uploaded`, `profile_photo_moderation_pending`, `phone_verification_started`, `phone_verification_completed`, `onboarding_completed`, `onboarding_resumed`, `onboarding_abandoned`.
**Properties:** `step_name`, `step_index`, `required`, `completion_time_bucket`, `city_id`, `selected_count` (где safe), `verification_required` (bool).
**Metrics:** onboarding completion rate · step-level drop-off · time to complete · photo upload success · phone verification CR · profile completion rate.
**Privacy:** без bio text, без photo content, без phone number.

---

## 14. Profile Analytics

**Events:** `profile_viewed`, `own_profile_viewed`, `public_profile_viewed`, `profile_edit_started`, `profile_updated`, `profile_photo_uploaded`, `profile_photo_removed`, `profile_privacy_updated`, `profile_report_started`, `user_block_started`.
**Properties:** `profile_context` (own/public/applicant/host/attendee) · `viewed_user_role` (если safe) · `has_public_badges` (bool) · `verification_level` (enum) · `source`.
**Metrics:** profile completion · edit rate · public profile views из application review · report/block from profile rate.
**Privacy:** без bio text, без private fields, без raw trust score.

---

## 15. Event Discovery Analytics

**Events:** `home_opened`, `event_discovery_viewed`, `event_card_seen`, `event_card_tapped`, `event_filter_opened`, `event_filter_applied`, `event_search_used` (если есть), `event_empty_state_viewed`, `event_viewed`.
**Properties:** `city_id` · `category_id` · `date_filter` · `event_status` · `approval_required` · `waitlist_enabled` · `approximate_distance_bucket` (если есть) · `source` · `result_count_bucket`.
**Metrics:** discovery views · card CTR · filter usage · empty state frequency · views per active user · views per category · discovery→application conversion.
**Privacy:** approximate distance bucket OK; **exact location forbidden** (Инвариант 1/9). `event_card_seen` — высокий шум (Open Q: трекать или только tap).

---

## 16. Event Detail Analytics

**Events:** `event_viewed`, `event_detail_state_viewed`, `location_privacy_notice_viewed`, `apply_cta_viewed`, `apply_cta_tapped`, `report_event_started`, `event_share_started` (если есть).
**States:** not_applied · pending · waitlisted · approved · rejected · full · cancelled · removed_for_safety · host_view.
**Properties:** `event_id` · `category_id` · `city_id` · `event_status` · `application_status` · `approval_required` · `capacity_bucket` · `attendee_count_bucket` · `source`.
**Metrics:** apply CTA conversion · state distribution · detail drop-off · location privacy notice visibility.
**Privacy:** без exact location/instructions.

---

## 17. Event Creation / Host Analytics

**Events:** `event_create_started`, `event_create_step_completed`, `event_draft_saved`, `event_preview_viewed`, `event_published`, `event_pending_review`, `event_updated`, `event_cancelled`, `event_capacity_updated`, `event_location_updated`, `event_removed_for_safety`.
**Properties:** host distinct_id · `category_id` · `city_id` · `capacity_bucket` · `approval_required` · `waitlist_enabled` · `visibility` · `event_status` · `moderation_status` · `has_exact_location` (bool, не значение) · `time_to_publish_bucket`.
**Metrics:** hosts started creation · creation completion rate · draft→publish CR · events per host · first-time host success · cancellation rate · events pending review · hosted completed · host repeat rate.
**Privacy:** без exact location/instructions, без описания события (text).

---

## 18. Application / Approval Analytics

**Events:** `application_started`, `application_requirement_blocked`, `application_note_started`, `application_created`, `application_cancelled`, `application_reviewed`, `application_approved`, `application_rejected`, `application_waitlisted`, `attendee_added`, `attendee_removed`.
**Properties:** `event_id` · `category_id` · `city_id` · `application_status` · `source` · `requirement_block_reason` · host distinct_id (если allowed) · `approval_required` · `capacity_bucket` · `profile_completeness_bucket` · `verification_level`.
**Metrics:** application rate · completion rate · apply blocked by requirements · approval/rejection/waitlist rate · time to approval · applications per event/user · host review time.
**Privacy:** без `intro_note`, без `host_note`, без applicant private details.

---

## 19. Attendance Analytics

**Events:** `event_reminder_sent`, `event_reminder_opened`, `event_started`, `event_completed`, `attendance_prompt_viewed`, `attendance_confirmed`, `attendance_marked_by_host`, `no_show_recorded`, `excused_absence_recorded`, `attendance_disputed` (если есть).
**Properties:** `event_id` · `category_id` · `city_id` · `event_size_bucket` · `attendee_role` · `confirmation_source` (user/host/system/admin) · `attendance_status` · `reminder_timing_bucket`.
**Metrics:** attendance rate · no-show rate · confirmation rate · reminder effectiveness · no-show by category/city/cohort · completed events with confirmed attendance.
**Privacy:** нет публичного no-show labeling; aggregate/product-focused (Инвариант 10).

---

## 20. Post-event / Reconnect Analytics

**Events:** `post_event_screen_viewed`, `post_event_chat_opened`, `post_event_reconnect_viewed`, `post_event_prompt_viewed`, `post_event_feedback_started`, `post_event_feedback_submitted`, `repeat_application_created`, `repeat_attendance_confirmed`.
**Properties:** `event_id` · `category_id` · `city_id` · `attendee_count_bucket` · `reconnect_prompt_type` · `feedback_type` (broad enum) · `days_since_event_bucket`.
**Metrics:** post-event engagement · repeat application rate · repeat attendance rate · feedback completion · social loop continuation.
**Privacy:** без raw feedback text; избегать dating-style «match» терминологии.

---

## 21. Chat Analytics

**Events:** `event_chat_opened`, `chat_message_sent`, `chat_system_message_sent`, `message_actions_opened`, `message_report_started`, `message_reported`, `chat_frozen`, `chat_unfrozen`, `post_event_chat_expiring_viewed`, `chat_access_denied`.
**Properties:** `event_id` · `user_role_in_event` · `chat_state` · `message_type` (user/system) · `moderation_status` · `access_denied_reason` · `post_event` (bool).
**Metrics:** chat open rate после approval · messages per event · active chat events · reported messages rate · chat freeze rate · chat abuse indicators.
**Privacy:** **никогда** raw message body / content / sensitive moderation text.

---

## 22. Safety Analytics

**Events:** `report_started`, `report_created`, `report_cancelled`, `block_started`, `block_created`, `unblock_created` (если есть), `safety_principles_viewed`, `safety_principles_accepted`, `suspicious_activity_flagged`, `velocity_limit_triggered`.
**Properties:** `report_category` · `report_priority` · `target_type` (user/event/message) · `source_screen` · `event_id` (если релевантно) · `city_id` · `velocity_limit_type` · `block_context`.
**Metrics:** reports per 100 users · reports per event · blocks per 100 users · block rate после события · report categories distribution · high/critical reports count · suspicious activity count · velocity triggers.
**Privacy:** без report description, без reported message body, без раскрытия reporter identity сверх обычного actor-трекинга.

---

## 23. Moderation Analytics

**Events:** `moderation_queue_viewed`, `moderation_report_opened`, `moderation_action_started`, `moderation_action_taken`, `moderation_action_cancelled`, `report_status_updated`, `event_removed_for_safety`, `user_warned`, `user_restricted`, `user_unrestricted`, `user_banned`, `user_unbanned`, `message_hidden`, `chat_frozen`, `report_escalated`, `report_dismissed`.
**Properties:** `report_category` · `report_priority` · `action_type` · `target_type` · `time_to_first_review_bucket` · `time_to_resolution_bucket` · `ai_flagged` (bool) · `escalation_required` (bool) · `event_starts_within_24h` (bool).
**Metrics:** moderation response time · time to resolution · open reports by priority · action rate · dismissal rate · escalation rate · AI confirmed flag rate · AI false positive rate · events removed · users restricted/banned.
**Privacy:** без report descriptions, admin notes, raw AI summaries (если sensitive), exact location.

---

## 24. Trust Analytics

**Events:** `profile_completed`, `phone_verified`, `trust_event_created_internal`, `trust_tier_updated_internal`, `reliable_badge_earned`, `hosted_before_badge_earned`, `verification_badge_earned`, `suspicious_velocity_flagged`, `no_show_recorded`, `event_attended_trust_recorded`.
**Properties:** `trust_event_type` · `badge_type` · `previous_tier`/`new_tier` (internal only) · `source` · `aggregate_count_bucket` (если safe).
**Metrics:** verified user rate · profile completion rate · reliable attendee badge rate · host badge rate · no-show rate · trust event volume · restrictions от trust/safety pattern.
**Privacy:** raw `trust_score_internal` **forbidden**; нет публичных негативных trust-ярлыков; избегать user-level sensitive trust analytics кроме strictly internal ([`08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md) §33).

---

## 25. Beta / Invite Analytics

**Events:** `invite_code_required`, `invite_code_entered`, `invite_code_validated`, `invite_code_used`, `invite_code_failed`, `waitlist_joined`, `waitlist_confirmed`, `beta_access_granted`, `beta_access_denied`, `invite_code_created_admin`, `invite_code_revoked_admin`.
**Properties:** `invite_status` · `invite_source` · `city_id` · `beta_cohort` · `failure_reason` · `assigned_invite` (bool если safe).
**Metrics:** invite conversion rate · waitlist signup rate · invite usage rate · failed invite attempts · beta cohort activation · waitlist→signup conversion.
**Privacy:** без raw email (если не allowed/hashed); не раскрывать assigned email широко.

---

## 26. Notification Analytics

**Events:** `notification_created`, `notification_sent`, `push_notification_sent`, `push_notification_opened`, `notification_viewed`, `notification_marked_read`, `notification_failed`.
**Types:** application_approved · application_rejected · application_waitlisted · event_reminder · event_update · event_cancelled · new_application_for_host · report_update · invite_available · system_notice.
**Properties:** `notification_type` · `delivery_channel` · `related_entity_type` · `opened_from_push` (bool) · `event_status` (если релевантно) · `application_status` (если релевантно).
**Metrics:** push open rate · approval notification open rate · reminder open rate · cancellation delivery · notification failure rate.
**Privacy:** нет exact location в analytics; нет sensitive notification body.

---

## 27. Feature Flag / Experiment Analytics

**Events:** `feature_flag_exposed`, `experiment_variant_assigned`, `experiment_goal_completed`.
**Properties:** `flag_key` · `variant` · `experiment_key` · `exposure_context` · `user_cohort`.
**Rules:** флаги для beta rollout; эксперименты не компрометируют safety; **не A/B-тестировать critical safety так, чтобы вредить пользователям**; safety-critical фичи дефолтят в conservative behavior.
**Potential beta flags:** `phone_verification_required_before_apply` · `manual_event_review_enabled` · `post_event_chat_enabled` · `attendee_list_visible_to_approved` · `event_creation_for_verified_only`.

---

## 28. Retention Analytics

**User retention:** D1 · D7 · D14 · D30.
**Product-specific:** applied to second event · attended second event · hosted second event · returned after first attendance · returned after rejection · returned after waitlist.
**Host retention:** created second event · reviewed applications again · hosted completed event again.
**Safety-aware:** retained без safety incidents · retention после report/block · retention после no-show/rejection.

> **Do not optimize retention at the cost of safety.**

---

## 29. Dashboard Plan

| Dashboard | Metrics |
|-----------|---------|
| **1 — Founder Overview** | active users · onboarded · events created · completed · applications · approvals · confirmed attendance · trusted offline interactions · reports · blocks · no-show rate |
| **2 — Activation Funnel** | signup · invite · onboarding · profile complete · first event view · first application · first approval · first attendance |
| **3 — Supply / Host** | active hosts · events created · published · completed · applications per event · approval rate · host repeat rate · cancellation rate |
| **4 — Demand / Attendee** | event views · applications · approvals · attendance · repeat attendance · category interest |
| **5 — Safety / Moderation** | reports by category/priority · open reports · time to review · actions taken · restricted/banned · removed events · message reports · chat freezes |
| **6 — Beta / Invite** | invite codes created/used · waitlist joined · beta access granted · cohort activation · city-level funnel |
| **7 — Trust Health** | verification rate · profile completion · reliable attendee badge · no-show rate · suspicious velocity · trust events |

---

## 30. Instrumentation Map by Flow

| Flow ID | Flow | Key Screens | Events to Track | Primary Metric | Privacy Notes |
|---------|------|-------------|-----------------|----------------|---------------|
| FLOW-001 | Guest Signup/Login | Welcome, Login, Signup | signup_started/completed, login_completed | signup CR | без PII |
| FLOW-002 | Invite Beta Access | Invite Code, Waitlist | invite_code_used, waitlist_joined, beta_access_* | invite CR | без raw email |
| FLOW-003 | Onboarding | Onboarding stack | onboarding_*; safety_principles_accepted | onboarding CR | без bio/phone |
| FLOW-004 | Profile View/Edit | My/Edit/Public Profile | profile_viewed/updated | completion/edit rate | без bio/raw trust |
| FLOW-006 | Discovery | Home, Filters | event_discovery_viewed, event_viewed | discovery→apply CR | без exact loc |
| FLOW-007 | Event Detail | Event Detail states | event_viewed, location_privacy_notice_viewed, apply_cta_tapped | apply CR | без exact loc |
| FLOW-008 | Event Creation | Create flow | event_create_*, event_published | draft→publish CR | без loc/desc text |
| FLOW-009 | Application | Apply Modal | application_started/created/requirement_blocked | application CR | без intro_note |
| FLOW-010 | Host Review | Applications List/Detail | application_reviewed/approved/rejected/waitlisted | approval rate | без host_note |
| FLOW-011 | Approval / Location Reveal | Approved Detail | application_approved, location_privacy_notice_viewed | reveal correctness | **без exact loc** |
| FLOW-012 | Event Chat | Event Chat | event_chat_opened, chat_message_sent, message_reported | chat open rate | **без body** |
| FLOW-013 | Notifications | Notifications | push_notification_sent/opened | open rate | без exact loc |
| FLOW-015 | Attendance/Post-event | Completed, Reconnect | event_completed, attendance_confirmed, no_show_recorded | attendance rate | aggregate |
| FLOW-016 | Report User | Report User | report_started/created | report rate | без description |
| FLOW-017 | Report Event | Report Event | report_created (event) | report rate | без description |
| FLOW-018 | Report Message | Report Message | message_reported | report rate | без body |
| FLOW-019 | Block User | Block Confirm | block_started/created | block rate | без reason text |
| FLOW-020 | Admin Moderation | Admin queue/detail | moderation_*, action_taken | response time | без notes |
| FLOW-023 | Trust Signal Update | (system) | trust_event_created_internal, badge_earned | badge rate | internal only |

---

## 31. Instrumentation Map by Screen (P0)

| Screen ID | Screen | View Event | Action Events | Properties | Notes |
|-----------|--------|-----------|---------------|------------|-------|
| MOB-001 | Welcome | `welcome_viewed` | signup/login tap | source | без PII |
| MOB-004 | Invite Code | `invite_code_screen_viewed` | invite_code_entered/used/failed | invite_status, failure_reason | без raw email |
| MOB-010 | Onboarding Welcome | `onboarding_started` | step_completed | step_name | anti-dating копи |
| MOB-011 | Safety Principles | `safety_principles_viewed` | safety_principles_accepted | — | acceptance фикс. |
| MOB-030 | Home/Discover | `event_discovery_viewed` | filter_applied, event_card_tapped | city_id, category_id, result_count_bucket | без exact loc |
| MOB-033 | Event Detail Not Applied | `event_viewed` | apply_cta_tapped, report_event_started | event_id, category_id, event_status | без exact loc |
| MOB-034 | Event Detail Pending | `event_detail_state_viewed` | application_cancelled | application_status=pending | без exact loc |
| MOB-036 | Event Detail Approved | `event_detail_state_viewed` | event_chat_opened | application_status=approved | **без exact loc в аналитике** |
| MOB-050 | Apply Modal | `apply_cta_viewed` | application_started/created | event_id | без intro_note |
| MOB-060 | Create Event Start | `event_create_started` | step_completed | category_id | без desc text |
| MOB-068 | Event Preview | `event_preview_viewed` | event_published | has_exact_location(bool) | без loc value |
| MOB-071 | Applications List | `applications_list_viewed` | applicant_opened | event_id, count_bucket | host scope |
| MOB-072 | Applicant Detail | `applicant_detail_viewed` | application_approved/rejected/waitlisted | application_status | без applicant PII |
| MOB-080 | Event Chat | `event_chat_opened` | chat_message_sent, message_reported | chat_state | **без body** |
| MOB-095 | Public Safe Profile | `public_profile_viewed` | report/block started | profile_context | без raw trust |
| MOB-110 | Report User | `report_started` | report_created | report_category, target_type | без description |
| MOB-111 | Report Event | `report_started` | report_created | report_category | без description |
| MOB-114 | Block User Confirm | `block_started` | block_created | block_context | без reason text |
| ADM-002 | Moderation Queue | `moderation_queue_viewed` | report_opened | priority, category | admin project |
| ADM-003 | Report Detail | `moderation_report_opened` | action_started | report_priority | без description |
| ADM-009 | Admin Action Modal | `moderation_action_started` | moderation_action_taken | action_type | reason не в analytics |

---

## 32. Event Taxonomy Table

> Columns: Event · Category · Trigger · Actor · Key Properties · Forbidden Properties · P0/P1. (Forbidden — общий baseline §33: exact location, raw body/description, raw trust score, PII; не повторяется построчно где не специфично.)

| Event | Category | Trigger | Actor | Key Properties | P0/P1 |
|-------|----------|---------|-------|----------------|-------|
| app_opened | App/Auth | запуск app | client | platform, app_version | P0 |
| signup_started | App/Auth | открыт signup | client | source | P0 |
| signup_completed | App/Auth | аккаунт создан | client/server | method | P0 |
| login_completed | App/Auth | успешный вход | client | method | P0 |
| logout_completed | App/Auth | logout | client | — | P0 |
| auth_error | App/Auth | ошибка auth | client | error_type | P0 |
| protected_route_redirected | App/Auth | redirect без сессии | client | target_flow | P1 |
| invite_code_required | Beta | требуется invite | client | — | P0 |
| invite_code_entered | Beta | введён код | client | — | P0 |
| invite_code_used | Beta | код применён | server | invite_status | P0 |
| invite_code_failed | Beta | код невалиден | server | failure_reason | P0 |
| waitlist_joined | Beta | запись waitlist | client/server | city_id | P0 |
| beta_access_granted | Beta | доступ выдан | server | beta_cohort | P0 |
| beta_access_denied | Beta | доступ отклонён | server | reason | P0 |
| onboarding_started | Onboarding | вход в onboarding | client | — | P0 |
| onboarding_step_viewed | Onboarding | шаг показан | client | step_name, step_index | P0 |
| onboarding_step_completed | Onboarding | шаг завершён | client | step_name | P0 |
| safety_principles_accepted | Onboarding | принятие правил | client | — | P0 |
| city_selected | Onboarding | выбран город | client | city_id | P0 |
| interests_selected | Onboarding | выбраны интересы | client | selected_count | P0 |
| vibe_tags_selected | Onboarding | выбраны vibe | client | selected_count | P0 |
| intent_selected | Onboarding | выбран intent | client | intent_enum | P0 |
| profile_photo_uploaded | Onboarding | фото загружено | client | — | P0 |
| phone_verification_started | Onboarding | старт verify | client | — | P0 |
| phone_verification_completed | Onboarding | verify завершён | server | — | P0 |
| onboarding_completed | Onboarding | onboarding done | client/server | — | P0 |
| profile_viewed | Profile | открыт профиль | client | profile_context | P0 |
| profile_edit_started | Profile | edit начат | client | — | P1 |
| profile_updated | Profile | профиль сохранён | client/server | fields_changed_keys | P0 |
| public_profile_viewed | Profile | safe-профиль открыт | client | profile_context | P0 |
| profile_photo_removed | Profile | фото удалено | client | — | P1 |
| privacy_settings_updated | Profile | privacy изменён | client | — | P1 |
| home_opened | Discovery | открыт Home | client | — | P0 |
| event_discovery_viewed | Discovery | лента показана | client | city_id, result_count_bucket | P0 |
| event_card_seen | Discovery | карточка в viewport | client | category_id | P1 (шум — Open Q) |
| event_card_tapped | Discovery | тап по карточке | client | category_id | P0 |
| event_filter_applied | Discovery | фильтр применён | client | category_id, date_filter | P0 |
| event_empty_state_viewed | Discovery | пустой стейт | client | filter_context | P0 |
| event_viewed | Discovery/Events | открыт Event Detail | client | event_id, event_status | P0 |
| location_privacy_notice_viewed | Events | показан notice | client | event_id | P0 |
| event_create_started | Event Creation | старт создания | client | — | P0 |
| event_create_step_completed | Event Creation | шаг создания | client | step_name | P0 |
| event_draft_saved | Event Creation | draft сохранён | client/server | — | P0 |
| event_preview_viewed | Event Creation | превью | client | has_exact_location(bool) | P0 |
| event_published | Event Creation | опубликовано | server | category_id, event_status | P0 |
| event_pending_review | Event Creation | на ревью | server | — | P0 |
| event_updated | Event Creation | событие изменено | server | fields_changed_keys | P1 |
| event_cancelled | Event Creation | отменено host | server | — | P0 |
| application_started | Applications | нажат Apply | client | event_id | P0 |
| application_requirement_blocked | Applications | гейт сработал | client | requirement_block_reason | P0 |
| application_created | Applications | заявка создана | server | event_id | P0 |
| application_cancelled | Applications | заявка отозвана | client/server | — | P0 |
| application_reviewed | Applications | host открыл заявку | client | event_id | P0 |
| application_approved | Applications | approve | server | event_id | P0 |
| application_rejected | Applications | reject | server | event_id | P0 |
| application_waitlisted | Applications | waitlist | server | event_id | P0 |
| event_chat_opened | Chat | открыт чат | client | event_id | P0 |
| chat_message_sent | Chat | сообщение отправлено | client/server | event_id, message_type | P0 |
| message_actions_opened | Chat | меню сообщения | client | — | P1 |
| message_reported | Chat | report сообщения | server | report_category | P0 |
| chat_frozen | Chat | чат заморожен | server | — | P0 |
| chat_access_denied | Chat | нет доступа к чату | client | access_denied_reason | P0 |
| event_completed | Attendance | событие completed | server | category_id | P0 |
| attendance_prompt_viewed | Attendance | промпт показан | client | — | P0 |
| attendance_confirmed | Attendance | посещение подтв. | client/server | confirmation_source | P0 |
| no_show_recorded | Attendance | no-show | server | confirmation_source | P0 |
| post_event_reconnect_viewed | Post-event | reconnect показан | client | days_since_event_bucket | P0 |
| repeat_application_created | Post-event | повторная заявка | server | — | P0 |
| report_started | Safety | начат report | client | target_type | P0 |
| report_created | Safety | report создан | server | report_category, report_priority, target_type | P0 |
| block_started | Safety | начат block | client | block_context | P0 |
| block_created | Safety | block создан | server | block_context | P0 |
| suspicious_activity_flagged | Safety | system flag | server | activity_type | P0 |
| velocity_limit_triggered | Safety | velocity limit | server | velocity_limit_type | P0 |
| moderation_queue_viewed | Moderation | очередь открыта | admin | — | P0 |
| moderation_report_opened | Moderation | report открыт | admin | report_priority | P0 |
| moderation_action_taken | Moderation | действие выполнено | admin | action_type, target_type | P0 |
| report_status_updated | Moderation | статус report | admin | report_status | P0 |
| event_removed_for_safety | Moderation | событие удалено | admin | — | P0 |
| user_restricted | Moderation | restrict | admin | — | P0 |
| user_banned | Moderation | ban | admin | — | P0 |
| message_hidden | Moderation | сообщение скрыто | admin | — | P0 |
| report_escalated | Moderation | эскалация | admin | report_priority | P0 |
| report_dismissed | Moderation | dismiss | admin | — | P0 |
| trust_event_created_internal | Trust | trust signal | server | trust_event_type | P0 |
| reliable_badge_earned | Trust | badge выдан | server | badge_type | P1 |
| hosted_before_badge_earned | Trust | badge выдан | server | badge_type | P1 |
| verification_badge_earned | Trust | badge выдан | server | badge_type | P0 |
| notification_created | Notifications | уведомление создано | server | notification_type | P0 |
| push_notification_sent | Notifications | push отправлен | server | notification_type | P0 |
| push_notification_opened | Notifications | push открыт | client | notification_type | P0 |
| notification_viewed | Notifications | просмотрено в app | client | notification_type | P0 |

(>80 events; forbidden properties для всех — §33 baseline.)

---

## 33. Privacy Boundary *(critical)*

### Never Track
exact_location_text · exact_address · exact_lat · exact_lng · arrival_instructions · phone_number · legal_name · date_of_birth · raw message body · application intro_note · host_note · report description · moderation notes · AI detailed summary (если sensitive) · raw `trust_score_internal` · private profile details.

### Safe to Track
IDs · enum values · status values · category IDs · city IDs · boolean flags · buckets · counts · funnel steps · broad reason codes.

### Use Buckets Instead of Raw Values
`capacity_bucket` · `attendee_count_bucket` · `time_to_approval_bucket` · `profile_completeness_bucket` · `reminder_timing_bucket`.

### Location Rule
**Analytics must never receive exact location.** Approximate city/area/`city_id` допустим. (Инвариант 1/9; consistent с [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §22, [`09_MODERATION.md`](09_MODERATION.md) §36.)

---

## 34. Data Quality & QA

**Checklist:** каждый P0 flow имеет события · имена консистентны · нет дублей с разными именами · properties документированы · sensitive исключены · test env отделён · staging события `environment=staging` · production `environment=production` · идентичность пользователя консистентна · anon→authenticated identity merge обработан · dashboards используют правильные события · success metrics проверены вручную.

**QA test cases:** signup шлёт `signup_started/completed` · onboarding step-события 1 раз/шаг · `event_viewed` содержит event_id/category_id без location · `application_created` без intro note · `chat_message_sent` без body · `report_created` без description · `moderation_action_taken` без admin note · approved location reveal **не** шлёт exact location в analytics.

---

## 35. Analytics Implementation Notes *(guidance, без кода)*

- **Mobile:** PostHog client после старта app · identify после auth · reset identity на logout · track screen views/actions · избегать sensitive props.
- **Backend/Edge Functions:** server-side события для критичных операций — `application_approved`, `event_published`, `report_created`, `moderation_action_taken`, `attendance_confirmed`, `no_show_recorded`.
- **Admin:** admin-события трекаются отдельно (проект — Open Q); без sensitive report деталей; action types + timings.
- **Environments:** local / staging / production; нет production-аналитики из local (если явно не сконфигурировано); staging отделён; test users/cohorts помечены.

---

## 36. Closed Beta Success Metrics

| Категория | Цель |
|-----------|------|
| **Activation** | 60%+ signup завершают onboarding · 40%+ onboarded смотрят ≥1 событие · 40%+ onboarded подают ≥1 заявку |
| **Attendance** | 25%+ onboarded посещают ≥1 событие за 14 дней · 20%+ attendees посещают второе · no-show rate управляем и понят |
| **Host** | 20–50 курируемых hosts в начальной бете · повторные события · события получают заявки · hosts понимают approval |
| **Safety** | report/block rate мониторится · high/critical reviewed быстро · нет нерешённых critical инцидентов · unsafe events removable · users чувствуют себя безопасно |
| **Product Understanding** | users понимают «не dating app» · понимают approval · понимают location privacy · знают где report/block |

---

## 37. Qualitative Research Metrics

Собирать в бете: user interview notes · host feedback · post-event survey · safety perception · почему applied/не applied · почему host approved/rejected · точки путаницы · ощущается ли как dating · ясна ли location privacy · справедлив ли approval.

**Survey questions:** 1) Поняли ли вы, когда раскроется точная локация? 2) Чувствовали ли безопасность? 3) Был ли понятен approval flow? 4) Похоже ли на dating app? 5) Пойдёте ли на другое событие? 6) Что заставило колебаться? 7) Какой trust-сигнал был важнее всего? 8) Легко ли найти report/block?

---

## 38. Alerts / Monitoring

**Возможные alerts:** critical report created · high-priority report для события в ≤24ч · `event_removed_for_safety` · спайк reports · suspicious velocity spike · много failed invite attempts · `chat_frozen` · `user_banned` · много no-shows на одном событии · спайк notification failures.
**Rules:** alerting может стартовать manual/simple в бете; founder/admin ревьюит safety-alerts; не каждое событие требует alert.

---

## 39. Analytics Review Cadence

- **Daily (ранняя бета):** signups · onboarding completion · events created · applications · reports/blocks · high/critical safety.
- **Weekly:** activation funnel · host funnel · attendance/no-show · repeat usage · category performance · moderation response time · qualitative feedback.
- **После каждого event batch:** event completion · attendance · no-shows · reports · host feedback · user feedback · reconnect behavior.

---

## 40. Decision Framework

| Сигнал | Investigate |
|--------|-------------|
| Низкое onboarding completion | Много шагов · phone verification friction · photo upload issue · неясная safety копи |
| Много views, мало applications | Неинтересные события · approval пугает · неопределённость location · нет доверия host |
| Много applications, мало approvals | Host review friction · недостаточные профили · host anxiety · supply/demand mismatch |
| Много approvals, мало attendance | Reminders · no-show friction · качество событий · trust/commitment |
| Высокие reports/blocks | Safety issues · риск категории события · chat abuse · слабые onboarding-ожидания |
| Users думают, что это dating | Копи · визуальный язык · категории · дизайн профиля · «match» терминология |

---

## 41. Analytics Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Sensitive data в analytics | Критич. | Privacy boundary §33; QA-тесты |
| Exact location leak | Высокий | Location rule; bucket'и; QA |
| Raw message body tracked | Высокий | Запрет в taxonomy; QA |
| Report descriptions tracked | Высокий | Запрет; admin отдельно |
| Raw trust score tracked | Высокий | Forbidden; internal-only |
| Vanity metrics отвлекают от trust loop | Средний | Metric hierarchy; North Star фокус |
| Over-optimizing engagement | Средний | Философия §4; safety-first |
| Недостаточно safety-метрик | Высокий | L5/Dashboard 5 обязательны |
| Дубли/несогласованные имена | Средний | Naming conventions §8; QA |
| Dashboards вводят в заблуждение (малый sample) | Средний | Buckets; качественные данные; осторожные выводы |
| Игнор качественной обратной связи | Средний | §37 cadence |
| Пропущены события в критичных flows | Высокий | Instrumentation map §30/§31 |
| Admin analytics утекают sensitive | Высокий | Отдельный проект (Open Q); без notes |
| Identity merge ошибки | Средний | Anon→auth merge правило §35 |
| Staging mixed с production | Средний | `environment` property; разделение |

---

## 42. Open Analytics Questions

| # | Вопрос | Связь |
|---|--------|-------|
| Q-NSM-FORMULA | Точная формула safety quality multiplier? | §5 |
| Q-ACTIVATION | Hard activation = first application или first attendance? | §12 |
| OD-10 | Какой beta city/city_id первый? | §25/§36 |
| Q-COMPLETE-BUCKET | Какие profile completeness buckets трекать? | §10/§33 |
| Q-TIER-TRACK | Трекать ли `trust_tier` внутренне в analytics? | §24 |
| Q-NS-LEVEL | No-show — user-level event или aggregate only? | §19/§24 |
| AQ-ADMIN-PROJECT | Admin-события в том же PostHog-проекте или отдельном? | §35 |
| Q-REQUIRED-PROPS | Какие properties обязательны для каждого события? | §9 |
| Q-CARD-SEEN | Трекать `event_card_seen` или только tap (шум)? | §15/§32 |
| Q-ALERT-THRESH | Пороги для alert-спайков? | §38 |
| Q-SURVEY-TOOL | Какой инструмент/процесс для qualitative survey? | §37 |
| Q-IDENTITY-MERGE | Как мёрджить anon pre-signup и authenticated analytics? | §34/§35 |
| OD-9 | Retention policy для analytics-данных? | §35 |
| Q-SAFE-EVENT-ID | Слать ли event_id для safety-событий или только category/city? | §22/§33 |
| Q-EXCLUDE-INTERNAL | Как исключать internal/admin/test users из dashboards? | §34 |

---

## 43. Analytics Checklist Before Beta

☐ North Star определена ☐ activation funnel определён ☐ onboarding events ☐ discovery events ☐ application/approval events ☐ attendance events ☐ host funnel ☐ chat events ☐ safety events ☐ moderation events ☐ trust events boundary ☐ beta/invite events ☐ notification events ☐ privacy boundary review ☐ dashboards спланированы ☐ QA test cases ☐ staging vs production разделение ☐ internal/test user exclusion ☐ нет exact location ☐ нет raw message/report/moderation content ☐ нет raw trust score.

---

## 44. Summary

- Analytics измеряет core **trusted offline social loop**, не vanity engagement.
- **North Star — trusted offline interactions**; safety-метрики — first-class product metrics.
- Privacy boundary строгий: нет exact location / raw message / report-moderation content / raw trust score.
- Определены event taxonomy (>80 events), funnels, dashboards (7), instrumentation maps (flow+screen), QA, beta success metrics, decision framework.
- Нерешённые развилки — §42; следующий документ: [`/docs/11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md).

> Напоминание: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth; все документы и эта analytics-модель ему подчинены. Код/SQL/migrations/SDK не создавались.
