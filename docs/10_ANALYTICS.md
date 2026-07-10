# Analytics v2 — Antidot

> **Status:** v2 (analytics blueprint для closed beta, **circle-first**).
> **Owner:** Product / Founder / Backend
> **Last updated:** 2026-05-31
> **First source of truth:** [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2).
> **PRD source:** [`/docs/01_PRD.md`](01_PRD.md) §22 (Analytics Requirements).
> **Flows source:** [`/docs/03_USER_FLOWS.md`](03_USER_FLOWS.md) §12 (Analytics Event Map v2).
> **Security source:** [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §24 (Analytics Security).
> **Trust source:** [`/docs/08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md) §33 (Trust Analytics Boundary).
> **Moderation source:** [`/docs/09_MODERATION.md`](09_MODERATION.md) §40 (Moderation Analytics Boundary).
> **Supersedes:** Analytics v1 (event-first, 2026-05-18).
> **Sequenced by:** [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md) §24 Phase C step 11.

> ⚠️ **Это documentation task only.** SDK не подключаются. PostHog / Sentry не инициализируются. Никаких production tracking событий не отправляется. Никакого кода. Этот документ — taxonomy + dashboards + privacy boundary до Sprint 2.

---

## 1. Source of Truth

- **Product Core v2** ([`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md)) — first source of truth.
- Analytics v2 следует **HYBRID ACCEPT** ([`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md)).
- **User-facing primitive** — Circle / Круг.
- **Operational primitive** — Meeting / Встреча круга.
- **Старая event-first analytics модель — superseded.**
- Analytics должен измерять **trusted recurring social belonging**, не vanity engagement.
- Analytics **не должен нарушать privacy / safety invariants** (Инв. 1, 3, 9, 12).
- Документ — основа будущей PostHog instrumentation, dashboards, beta metrics и product review.
- Открытые вопросы — в [§42 Open Analytics Questions](#42-open-analytics-questions).

### 0. Vocabulary update (v1 → v2)

| Старое (v1, superseded) | Новое (v2, binding) |
|---|---|
| `event_viewed` | **`circle_viewed`** |
| `application_started` / `application_created` | **`circle_join_started`** / **`circle_join_requested`** |
| `application_approved` | **`circle_request_approved_for_intro`** / **`circle_membership_confirmed`** |
| `application_rejected` | **`circle_request_rejected`** |
| `application_waitlisted` | **`circle_request_waitlisted`** |
| `event_attended` | **`circle_meeting_attended`** |
| `repeat_attendance` | **`repeat_meeting_attendance`** |
| `event_chat_opened` | **`circle_chat_opened`** |
| `chat_message_sent` | **`circle_chat_message_sent`** |
| `event_removed_for_safety` | **`circle_removed_for_safety`** + **`meeting_removed_for_safety`** |
| `post_event_reconnect` | **belonging / trusted graph growth** (My Circles, repeat attendance) |
| `event_create_*` | **`circle_create_*`** + **`first_meeting_scheduled`** |

> Любые остаточные `event_*` идентификаторы — **superseded / internal only** во время transitional periods; новые поверхности используют v2 vocabulary.

---

## 2. Analytics Goals v2

1. **Проверить, работает ли circle-first loop.**
2. **Измерить activation** в trusted circles.
3. **Измерить onboarding completion** и profile readiness.
4. **Измерить Circle Discovery** и Circle Detail engagement.
5. **Измерить request-place conversion.**
6. **Измерить host approval / intro meeting conversion.**
7. **Измерить meeting RSVP и attendance.**
8. **Измерить repeat meeting attendance** (главный сигнал доверия).
9. **Измерить My Circles / Belonging Mode usage.**
10. **Измерить Circle Chat health.**
11. **Измерить host supply и host quality.**
12. **Измерить safety и moderation health.**
13. **Измерить trust health** без exposing trust scores (Инв. 3).
14. **Измерить beta invite funnel.**
15. **Помогать founder'у** принимать product decisions.
16. **Избегать sensitive data leakage** (Инв. 1, 3, 9, 12).

---

## 3. Analytics Non-Goals

Analytics v2 **НЕ должен**:

- оптимизировать addictive screen time;
- оптимизировать infinite discovery pressure (Инв. 14);
- оптимизировать people browsing (Инв. 13);
- строить popularity rankings (Инв. 10);
- строить public leaderboards;
- строить dating compatibility scores (Hard rule 6);
- трекать exact location (Инв. 1);
- трекать raw messages;
- трекать report descriptions;
- трекать moderation notes;
- трекать raw trust score (Инв. 3);
- exposить private profile data;
- заменять user interviews (качественная обратная связь — §37);
- заменять moderation judgment;
- становиться enforcement system.

---

## 4. Analytics Philosophy v2

Принципы (binding):

- **Измеряем принадлежность, а не просмотры** (belonging, not browsing).
- **Измеряем повторяющееся офлайн-доверие, а не одноразовое посещение** (recurring offline trust, not one-off attendance).
- **Safety metrics — это product metrics**, не side-channel.
- **Retention meaningful только если circles remain safe.**
- **Если user перестал искать новые круги, потому что нашёл свой — это success** (Инв. 14), не churn.
- **Analytics уважает privacy и social dignity** (Инв. 1, 3, 12).
- **Small beta samples требуют qualitative context** (§37).
- **Analytics поддерживает founder judgment**, не заменяет его.

> **Цель — не максимизировать discovery. Цель — помочь людям находить и поддерживать доверённые повторяющиеся социальные круги.**

---

## 5. North Star Metric v2

### Primary candidate

> **Trusted recurring offline interactions.**

### Practical MVP formula

```
completed circle meetings
× confirmed attendees
× repeat attendance multiplier
× safety quality multiplier
```

#### completed circle meetings

Meetings со статусом `completed` (Schema v2 §10.1).

#### confirmed attendees

Users с `attendance_status = attended` (Schema v2 §10.4).

#### repeat attendance multiplier

Награждает repeated участие в **том же круге** через время (1-я встреча → 2-я → N-я). Прямое отражение Core v2 §5 step 5 (Become part of the rhythm) и step 6 (Belong).

#### safety quality multiplier

Product-level aggregate multiplier на основе:

- low report rate;
- low block rate;
- low serious incident rate;
- low circle / meeting removal rate;
- manageable no-show rate;
- moderation response time (within SLA — Moderation v2 §36).

### Important

- **safety multiplier — product-level**, не user-level score;
- **не public**;
- **точная формула эволюционирует во время беты** (open §42 #1).

### Alternative North Star candidates

- **B:** active trusted circles with confirmed recurring attendance (PRD v2 §22.4);
- **C:** weekly active circles с 2+ confirmed meetings;
- **D:** retained circle members с repeat attendance.

### Recommendation

> Использовать **"trusted recurring offline interactions"** как main North Star во время closed beta. Кандидаты B / C / D отслеживать как supporting metrics. Finalize после first cohort data.

---

## 6. Metric Hierarchy v2

### Level 1 — North Star

- `trusted_recurring_offline_interactions` (composite, см. §5).

### Level 2 — Core Circle Loop

- `circle_viewed`;
- `circle_join_requested`;
- `circle_request_approved_for_intro`;
- `circle_meeting_attended` (intro);
- `circle_membership_confirmed` (member);
- `repeat_meeting_attendance`.

### Level 3 — Belonging Metrics

- active circle members (count of `circle_memberships.status = 'member'`);
- `my_circles_opened`;
- `circle_home_opened`;
- `repeat_meeting_attendance`;
- member retention (longitudinal);
- circles с recurring attendance (≥2 completed meetings + repeat attendees).

### Level 4 — Supply / Host Metrics

- active hosts;
- circles created (`circle_published`);
- circles published (live status);
- meetings scheduled;
- meetings completed;
- host repeat rate (hosts со 2+ circles или recurring meetings);
- host safety rate (low report / removal pattern).

### Level 5 — Demand / Member Metrics

- onboarded users;
- circle views;
- request-place conversion (`circle_join_requested` / `circle_viewed`);
- intro approval rate;
- attendance rate;
- repeat participation rate.

### Level 6 — Safety Metrics

- reports (by category / priority);
- blocks;
- moderation response time;
- removed circles (for safety);
- removed meetings (for safety);
- restricted / banned users;
- no-show rate;
- host abuse signals (`suspicious_activity_events`).

### Level 7 — Quality Metrics

- qualitative safety perception (interviews);
- circle concept understanding;
- approval anxiety (Core v2 §19 — fit protection vs human ranking);
- non-dating perception;
- host / member feedback.

---

## 7. Analytics Tooling Assumption

### Primary product analytics

- **PostHog** — later (CLAUDE.md §6: blocked until Sprint 2 + analytics SDK подключение в backlog).

### Crash / error monitoring

- **Sentry** — later.

### Backend / database logs

- **Supabase logs** — later (server-side ingestion).

### Manual beta review

- founder / admin review;
- spreadsheets / manual notes allowed early (closed beta cadence — §39).

### Important

- **Do not connect SDKs в этом документе.**
- Implementation happens later (Sprint Backlog v2 + Sprint 2).
- Analytics taxonomy должен быть **privacy-safe ДО implementation** (это — gate этого документа).

---

## 8. Event Naming Conventions v2

### Rules

- `snake_case`;
- past tense где возможно (`circle_viewed`, `meeting_attended`);
- domain-specific prefixes когда helpful (`circle_`, `meeting_`, `membership_`, `report_`);
- **no sensitive data в event names** (не «report_for_harassment_with_text»);
- **no dating language** (нет `match_`, `like_`, `chemistry_`);
- **no people-marketplace terminology** (нет `user_browsed`, `member_shopped`);
- consistent circle / meeting vocabulary (§0 vocabulary map).

### Good examples

- `circle_viewed`;
- `circle_join_requested`;
- `circle_request_approved_for_intro`;
- `circle_meeting_attended`;
- `my_circles_opened`;
- `circle_chat_opened`;
- `report_created`;
- `moderation_action_taken`.

### Bad examples (struck-through — никогда не использовать)

- ~~`user_saw_maria_circle`~~ (personal data в имени);
- ~~`exact_location_opened_at_address`~~ (Инв. 1 нарушение);
- ~~`message_body_sent`~~ (намёк на raw body);
- ~~`report_text_submitted`~~ (намёк на description);
- ~~`hot_user_clicked`~~ (dating mechanic — Hard rule 6);
- ~~`match_created`~~ (dating mechanic);
- ~~`trust_score_updated_public`~~ (Инв. 3 нарушение).

---

## 9. Common Event Properties v2

### Allowed common properties

- `user_id` или `analytics_distinct_id`;
- `session_id`;
- `app_version`;
- `platform` (`ios` / `android` / `web_admin`);
- `environment` (`local` / `staging` / `production`);
- `city_id`;
- `beta_cohort`;
- `feature_flag_keys` (array);
- `screen_name`;
- `flow_id` (FLOW-001 … FLOW-025);
- `source` (previous action / entry surface);
- `previous_screen`;
- `timestamp`.

### Allowed domain properties

- `circle_id`;
- `meeting_id`;
- `category_id` (circle category);
- `membership_request_status` (enum — Schema v2 §5);
- `membership_status` (enum);
- `circle_status` (enum);
- `meeting_status` (enum);
- `rsvp_status` (enum);
- `report_category` (enum);
- `report_priority` (enum);
- `moderation_action_type` (enum);
- `rhythm` (enum — `weekly` / `biweekly` / `monthly` / `flexible`);
- `comfort_composition` (enum — `open_mixed` / `female_friendly` / `women_only` / `host_defined`);
- `capacity_bucket` (1–4 / 5–8 / 9–12);
- `member_count_bucket`;
- `request_count_bucket`;
- `time_to_approval_bucket`.

### Never include (binding — RLS v2 §24, Moderation v2 §40, Trust v2 §33)

- ~~`exact_location_text`~~ (Инв. 1);
- ~~`exact_address`~~;
- ~~`exact_lat`~~;
- ~~`exact_lng`~~;
- ~~`arrival_instructions`~~;
- ~~raw message body~~;
- ~~`intro_note`~~;
- ~~`host_note`~~;
- ~~report description (`reports.description`)~~;
- ~~moderation note (`reports.admin_resolution_note`, `moderation_actions.reason`)~~;
- ~~`trust_score_internal`~~ (Инв. 3);
- ~~phone number~~;
- ~~email~~ unless hashed / explicitly allowed;
- ~~date of birth~~;
- ~~legal name~~;
- ~~private profile fields (`profile_private_details.*`)~~.

---

## 10. User Properties v2

### Allowed

- `user_role` (broad enum: `user` / `circle_member` / `circle_host` / `admin`);
- `onboarding_completed` (boolean);
- `profile_completed` (boolean);
- `city_id`;
- `beta_cohort`;
- `verification_level` (enum: `none` / `email_verified` / `phone_verified`);
- `profile_completeness_bucket`;
- `has_requested_circle` (boolean);
- `has_attended_meeting` (boolean);
- `is_circle_host` (boolean);
- `has_active_circle` (boolean);
- `account_status` (broad enum if safe — `active` / `restricted` / `suspended` / `banned`).

### Use caution

- `trust_tier` (internal analytics only if needed; never public);
- `no_show_count` aggregate / internal only (Инв. 3);
- `report_count` — **не** ordinary user property (Инв. 12);
- `block_count` — **не** ordinary user property (Инв. 12);
- `circle_count` — bucketed / private only (никогда public-like — Инв. 14).

### Forbidden

- ~~raw `trust_score_internal`~~ (Инв. 3);
- ~~phone~~;
- ~~email~~ unless allowed / hashed;
- ~~DOB~~;
- ~~legal name~~;
- ~~exact location~~;
- ~~report / block counts как user-level profile property~~ (Инв. 12);
- ~~private moderation notes~~;
- ~~removal / rejection history~~ (Инв. 12).

---

## 11. Core Circle Loop Analytics

Loop (Core v2 §5):

> **Find the right vibe → Request a place → Enter safely → Attend first meeting → Become part of the rhythm → Belong → Grow trusted graph.**

### Find the right vibe

**Events:**

- `circle_discovery_viewed`;
- `circle_filter_applied`;
- `circle_card_seen` (P1 — high noise, open §42 #10);
- `circle_card_tapped`;
- `circle_viewed`.

**Conversion:** `circle_viewed / circle_discovery_viewed`.
**Drop-off risk:** пустая лента, нерелевантные circles, vibe непонятен.
**Properties:** `city_id`, `category_id`, `rhythm`, `comfort_composition`, `result_count_bucket`.
**Privacy:** без exact location; approximate area only.

### Request a place

**Events:**

- `circle_join_started`;
- `circle_join_blocked_by_requirement`;
- `circle_join_requested`;
- `circle_join_cancelled`.

**Conversion:** `circle_join_requested / circle_viewed`.
**Drop-off risk:** approval-страх, verification gate, location uncertainty.
**Properties:** `circle_id`, `requirement_block_reason`, `profile_completeness_bucket`, `verification_level`.
**Privacy:** **без `intro_note`** содержимого.

### Enter safely

**Events:**

- `membership_request_reviewed`;
- `circle_request_approved_for_intro`;
- `circle_request_rejected`;
- `circle_request_waitlisted`.

**Conversion:** `circle_request_approved_for_intro / circle_join_requested`.
**Drop-off risk:** host inactivity, request volume.
**Properties:** `circle_id`, `time_to_decision_bucket`, `rhythm`, `comfort_composition`.
**Privacy:** **без `host_note`** содержимого; rejection reason — broad enum only (Инв. 12).

### Attend first meeting

**Events:**

- `intro_meeting_viewed`;
- `meeting_location_revealed` (boolean event — value не передаётся);
- `meeting_rsvp_yes`;
- `meeting_reminder_sent`;
- `circle_meeting_attended` (с `first_meeting = true`).

**Conversion:** `circle_meeting_attended (intro) / circle_request_approved_for_intro`.
**Drop-off risk:** no-show, location uncertainty, last-minute conflict.
**Properties:** `meeting_id`, `circle_id`, `first_meeting = true`, `reminder_timing_bucket`.
**Privacy:** **`meeting_location_revealed` событие — без exact location value** (Инв. 1).

### Become part of the rhythm

**Events:**

- `circle_membership_confirmed`;
- `circle_home_opened`;
- `meeting_rsvp_yes` (post-intro);
- `repeat_meeting_attendance`.

**Conversion:** `circle_membership_confirmed / circle_meeting_attended (intro)`.
**Drop-off risk:** circle fit, intro квалитет, social temperature.
**Properties:** `circle_id`, `repeat_meeting_number_bucket`.

### Belong

**Events:**

- `my_circles_opened`;
- `circle_home_opened`;
- `circle_chat_opened`;
- `next_meeting_viewed`;
- `circle_membership_paused`;
- `circle_membership_left`.

**Conversion:** `repeat_meeting_attendance / circle_meeting_attended (intro)`.
**Drop-off risk:** life circumstances, format mismatch (low-drama exits — Инв. 11).
**Properties:** `active_circle_count_bucket`, `circle_id`.
**Privacy:** **pause / leave — neutral events** (Инв. 11, Trust v2 §7.6-7.7); никаких public shame signals.

### Grow trusted graph

**Events:**

- `repeat_meeting_attendance` (cumulative);
- `reliable_badge_earned`;
- `circle_retention_milestone` (e.g., 2+ / 4+ meetings в одном круге);
- `trusted_graph_edge_created_internal` (P1 — open §42).

**Privacy:** trusted graph — **internal** (Инв. 13: no people marketplace); никаких public follower-style metrics.

---

## 12. Activation Funnel v2

### Steps

1. `app_opened`;
2. `signup_started`;
3. `signup_completed`;
4. `invite_code_used` или `beta_access_granted`;
5. `onboarding_started`;
6. `onboarding_completed`;
7. `profile_completed`;
8. `first_circle_viewed`;
9. `first_circle_join_requested`;
10. `first_circle_request_approved_for_intro`;
11. `first_meeting_location_revealed`;
12. `first_meeting_attended`;
13. `first_circle_membership_confirmed`;
14. `second_meeting_attended` (binding marker для Belonging Activation).

### Activation definitions

#### Soft activation

- `first_circle_join_requested` (user понял механику + захотел место).

#### Strong activation

- `first_meeting_attended` (user реально пришёл оффлайн — главный trust signal).

#### Belonging activation

- `second_meeting_attended` **или** `first_circle_membership_confirmed` (user вошёл в ритм).

### Recommendation

Использовать **multiple activation milestones**:

- **Request Activation** (`first_circle_join_requested`);
- **Meeting Activation** (`first_meeting_attended`);
- **Belonging Activation** (`second_meeting_attended` / `first_circle_membership_confirmed`).

### Per-step expectations

| # | Event | Trigger | Success metric | Likely drop-off reason | Product question |
|---|---|---|---|---|---|
| 1 | `app_opened` | app launch | reach | — | трафик |
| 2 | `signup_started` | signup opened | start rate | invite barrier | top of funnel |
| 3 | `signup_completed` | account created | signup CR | OAuth / email friction | auth работает? |
| 4 | `invite_code_used` | invite valid | invite CR | нет invite | контроль беты |
| 5 | `onboarding_started` | enters onboarding | start rate | — | onboarding clear? |
| 6 | `onboarding_completed` | finished | onboarding CR | too many steps; comfort composition friction; vibe unclear | friction |
| 7 | `profile_completed` | completeness reached | profile CR | photo / phone verification | gating |
| 8 | `first_circle_viewed` | первый Circle Detail | discovery activation | empty city | supply есть? |
| 9 | `first_circle_join_requested` | first request | **soft activation** | approval anxiety; location uncertainty | спрос есть? |
| 10 | `first_circle_request_approved_for_intro` | first approval | approval CR | host inactivity; supply mismatch | supply quality |
| 11 | `first_meeting_location_revealed` | exact location shown | reveal correctness | timing window | reveal works? |
| 12 | `first_meeting_attended` | first meeting attended | **strong activation** | no-show; commitment too high | loop works? |
| 13 | `first_circle_membership_confirmed` | intro → member | belonging gate | not confirmed; format mismatch | conversion |
| 14 | `second_meeting_attended` | repeat attendance | **belonging activation** | circle fit; rhythm fit | rhythm работает? |

---

## 13. Onboarding Analytics v2

### Events

- `onboarding_started`;
- `onboarding_step_viewed`;
- `onboarding_step_completed`;
- `onboarding_step_skipped`;
- `safety_principles_accepted`;
- `city_selected`;
- `interests_selected`;
- `vibe_tags_selected`;
- `rhythm_selected`;
- `comfort_composition_selected`;
- `group_size_selected`;
- `host_willingness_selected`;
- `profile_photo_uploaded`;
- `phone_verification_started`;
- `phone_verification_completed`;
- `onboarding_completed`;
- `onboarding_resumed`;
- `onboarding_abandoned`.

### Properties

- `step_name`;
- `step_index`;
- `required` (boolean);
- `completion_time_bucket`;
- `city_id`;
- `selected_count` (where safe — broad count, не values list);
- `rhythm` (enum);
- `comfort_composition` (enum);
- `verification_required` (boolean).

### Metrics

- onboarding completion rate;
- step-level drop-off;
- time to complete;
- photo upload success rate;
- phone verification completion rate;
- profile completion rate.

### Privacy

- **не отправлять bio text**;
- **не отправлять photo content**;
- **не отправлять phone number**;
- **comfort composition handle aккуратно** — enum value tracked, но не для public ranking (Core v2 §21, Moderation v2 §25).

---

## 14. Profile Analytics v2

### Events

- `profile_viewed`;
- `own_profile_viewed`;
- `public_profile_viewed`;
- `profile_edit_started`;
- `profile_updated`;
- `profile_photo_uploaded`;
- `profile_photo_removed`;
- `profile_privacy_updated`;
- `user_report_started`;
- `user_block_started`.

### Properties

- `profile_context` (`own` / `public` / `requester` / `member` / `host`);
- `source_screen`;
- `has_public_badges` (boolean);
- `verification_level` (enum);
- `profile_completeness_bucket`.

### Metrics

- profile completion rate;
- profile edit rate;
- photo upload rate;
- profile report / block rate;
- profile completeness before first request (proxy for activation friction).

### Privacy

- **без bio text**;
- **без private profile fields** (`profile_private_details.*`);
- **без raw trust score** (Инв. 3);
- **без other circles** (Инв. 13: no people marketplace).

---

## 15. Circle Discovery Analytics v2

### Events

- `circle_discovery_viewed`;
- `circle_card_seen` (P1 — high noise, открыт §42 #10);
- `circle_card_tapped`;
- `circle_filter_opened`;
- `circle_filter_applied`;
- `circle_search_used` (если search exists);
- `circle_empty_state_viewed`;
- `circle_viewed`.

### Properties

- `city_id`;
- `category_id`;
- `vibe_tag_ids` (count / bucket only — open §42 #10);
- `rhythm` (enum);
- `comfort_composition` (enum);
- `circle_status` (enum);
- `approval_required` (boolean);
- `approximate_distance_bucket` (если используется);
- `source`;
- `result_count_bucket`;
- `member_count_bucket`.

### Metrics

- discovery views;
- circle card CTR;
- filter usage distribution;
- empty state frequency;
- circle views per active user;
- discovery → request conversion;
- vibe / rhythm interest distribution.

### Privacy

- **approximate area only** (Инв. 9);
- **без exact location** (Инв. 1);
- **без full member list** (Инв. 16: composition staged);
- **без people-marketplace tracking** (Инв. 13).

---

## 16. Circle Detail Analytics v2

### Events

- `circle_viewed`;
- `circle_detail_state_viewed`;
- `location_privacy_notice_viewed`;
- `fit_protection_notice_viewed` (explanation, что approval — fit protection, не human ranking — Core v2 §19);
- `request_place_cta_viewed`;
- `request_place_cta_tapped`;
- `report_circle_started`.

### States (Core v2 §11 + §12)

- `not_requested`;
- `requested`;
- `waitlisted`;
- `rejected`;
- `approved_for_intro_meeting`;
- `member`;
- `paused`;
- `full`;
- `circle_paused` (circle-level);
- `removed_for_safety`;
- `host_view`.

### Properties

- `circle_id`;
- `category_id`;
- `city_id`;
- `rhythm`;
- `comfort_composition`;
- `membership_status` (current viewer's status);
- `circle_status`;
- `approval_required`;
- `capacity_bucket`;
- `member_count_bucket`;
- `source`.

### Metrics

- request CTA conversion;
- detail state distribution;
- location privacy notice visibility;
- fit protection notice visibility (UX check — approval anxiety mitigation);
- circle detail drop-off.

### Privacy

- **без exact location** (Инв. 1);
- **без member list** (composition staged — Core v2 §16);
- **без private host / user data**.

---

## 17. Circle Creation / Host Analytics v2

### Events

- `circle_create_started`;
- `circle_create_step_completed`;
- `circle_draft_saved`;
- `circle_preview_viewed`;
- `circle_published`;
- `circle_pending_review`;
- `circle_updated`;
- `circle_paused`;
- `circle_archived`;
- `circle_removed_for_safety` (admin-driven — Moderation v2 §22);
- `first_meeting_scheduled`;
- `meeting_updated`;
- `meeting_cancelled`.

### Properties

- `host_user_id` или `distinct_id`;
- `category_id`;
- `city_id`;
- `rhythm`;
- `comfort_composition`;
- `capacity_bucket`;
- `circle_status`;
- `moderation_status`;
- `has_meeting_location` (boolean, **не value**);
- `time_to_publish_bucket`.

### Metrics

- hosts started creation;
- circle creation completion rate;
- draft → publish conversion;
- circles per host;
- first-time host success;
- circle pause / archive rate;
- meetings scheduled per circle;
- host repeat rate;
- circles pending review (queue depth).

### Privacy

- **без exact location** (Инв. 1);
- **без description text** (полнотекстовое описание не tracked);
- **без arrival instructions**.

---

## 18. Membership Request Analytics v2

### Events

- `circle_join_started`;
- `circle_join_blocked_by_requirement`;
- `circle_join_requested`;
- `circle_join_cancelled`;
- `membership_request_reviewed`;
- `circle_request_approved_for_intro`;
- `circle_request_rejected`;
- `circle_request_waitlisted`;
- `circle_membership_confirmed`;
- `membership_not_confirmed_after_intro`.

### Properties

- `circle_id`;
- `category_id`;
- `city_id`;
- `rhythm`;
- `comfort_composition`;
- `request_status` (enum);
- `membership_status` (enum);
- `source`;
- `requirement_block_reason` (broad enum: `not_verified` / `profile_incomplete` / `blocked` / `restricted` / `circle_full`);
- `approval_required`;
- `capacity_bucket`;
- `profile_completeness_bucket`;
- `verification_level`;
- `time_to_decision_bucket`.

### Metrics

- request rate;
- request completion rate;
- blocked by requirements (gate friction);
- approval-for-intro rate;
- rejection rate;
- waitlist rate;
- time to review;
- requests per circle (demand signal);
- requests per user (engagement);
- host review time;
- intro → member conversion (`circle_membership_confirmed / first_meeting_attended`).

### Privacy

- **без `intro_note`** content (Инв. 12 — rejection reasons private);
- **без `host_note`** content;
- **без private profile data**.

---

## 19. Meeting / RSVP / Attendance Analytics v2

### Events

- `meeting_viewed`;
- `meeting_location_revealed` (boolean event — value не передаётся; Инв. 1);
- `meeting_rsvp_yes`;
- `meeting_rsvp_no`;
- `meeting_reminder_sent`;
- `meeting_reminder_opened`;
- `meeting_started`;
- `meeting_completed`;
- `attendance_prompt_viewed`;
- `meeting_attendance_confirmed`;
- `meeting_attendance_marked_by_host`;
- `no_show_recorded` (internal — Инв. 3, 12);
- `excused_absence_recorded`;
- `attendance_disputed` (если exists — P1, open §42 #13).

### Properties

- `meeting_id`;
- `circle_id`;
- `category_id`;
- `city_id`;
- `rhythm`;
- `meeting_status`;
- `member_role` (`host` / `member` / `intro_guest`);
- `confirmation_source` (`user` / `host` / `system` / `admin`);
- `attendance_status` (enum);
- `reminder_timing_bucket`;
- `attendee_count_bucket`;
- `first_meeting` (boolean);
- `repeat_meeting_number_bucket` (1 / 2 / 3-5 / 6+).

### Metrics

- RSVP rate;
- attendance rate;
- no-show rate (aggregate);
- reminder effectiveness;
- first meeting attendance rate;
- repeat meeting attendance rate;
- meetings completed per circle;
- meeting attendance by rhythm / category / city.

### Privacy

- **без exact location** (Инв. 1);
- **`no_show_recorded` — internal only**, никогда не public label (Инв. 12; Trust v2 §16);
- aggregate / product-focused.

---

## 20. My Circles / Belonging Analytics v2

### Events

- `my_circles_opened`;
- `circle_home_opened`;
- `next_meeting_viewed`;
- `circle_chat_preview_viewed`;
- `member_status_viewed`;
- `circle_membership_paused`;
- `circle_membership_left`;
- `return_to_circle_requested` (если exists — re-engagement);
- `not_looking_for_new_circles_selected` (P1 — explicit belonging signal);
- `guest_seat_viewed` (P1 — Core v2 §9 controlled unpredictability).

### Properties

- `active_circle_count_bucket`;
- `circle_id`;
- `membership_status`;
- `next_meeting_status`;
- `has_rsvp` (boolean);
- `unread_message_count_bucket`;
- `source`.

### Metrics

- My Circles usage rate (DAU / WAU openers);
- active circle members;
- member retention (longitudinal — §28);
- repeat meeting attendance;
- circle home opens per member;
- pause / leave rate (neutral);
- circles с stable members (≥2 returning attendees);
- **discovery reduction после membership** (positive signal — Инв. 14, не churn).

### Important (binding — Инв. 14)

> **Belonging is success, not churn.** Не интерпретировать lower discovery как negative, если My Circles / attendance остаются healthy. User, который attendит свой круг каждые две недели и не открывает Discovery, — **target outcome**, не retention failure.

---

## 21. Circle Chat Analytics v2

### Events

- `circle_chat_opened`;
- `circle_chat_message_sent`;
- `circle_system_message_sent`;
- `message_actions_opened`;
- `message_report_started`;
- `message_reported`;
- `circle_chat_frozen`;
- `circle_chat_unfrozen`;
- `circle_chat_access_denied`.

### Properties

- `circle_id`;
- `meeting_id` (если relevant — meeting-scoped update);
- `user_role_in_circle`;
- `membership_status`;
- `chat_state` (`open` / `frozen`);
- `message_type` (`user` / `system`);
- `moderation_status`;
- `access_denied_reason` (broad enum: `not_member` / `paused` / `restricted` / `banned` / `chat_frozen`).

### Metrics

- chat open rate by member;
- messages per circle (volume);
- active chat circles;
- reported message rate;
- chat freeze rate;
- chat abuse indicators (composite).

### Privacy

- **никогда не отправлять message body** (Инв. 12 / RLS v2 §24);
- **без message content**;
- **без sensitive moderation text**;
- **no 1:1 в MVP** (Инв. 2 — circle chat — единственная messaging surface).

---

## 22. Safety Analytics v2

### Events

- `report_started`;
- `report_created`;
- `report_cancelled`;
- `block_started`;
- `block_created`;
- `unblock_created` (если exists — P1);
- `safety_principles_viewed`;
- `safety_principles_accepted`;
- `suspicious_activity_flagged`;
- `velocity_limit_triggered`;
- `location_privacy_incident_flagged` (Moderation v2 §24);
- `comfort_composition_reported` (Moderation v2 §25);
- `host_abuse_flagged` (Moderation v2 §29).

### Properties

- `report_category` (enum);
- `report_priority` (enum);
- `target_type` (`user` / `circle` / `meeting` / `message`);
- `source_screen`;
- `circle_id` (если relevant — open §42 #16);
- `meeting_id` (если relevant — open §42 #16);
- `city_id`;
- `velocity_limit_type`;
- `block_context`.

### Metrics

- reports per 100 users;
- reports per circle;
- reports per meeting;
- blocks per 100 users;
- block rate после первой meeting (signal);
- report categories distribution;
- high / critical reports count;
- suspicious activity count;
- host abuse signals;
- comfort composition reports (monitored отдельно);
- velocity triggers.

### Privacy

- **без report description**;
- **без message body**;
- **без reporter identity** сверх обычного actor tracking;
- **без exact location**.

---

## 23. Moderation Analytics v2

### Events

- `moderation_queue_viewed`;
- `moderation_report_opened`;
- `moderation_action_started`;
- `moderation_action_taken`;
- `moderation_action_cancelled`;
- `report_status_updated`;
- `circle_removed_for_safety`;
- `meeting_removed_for_safety`;
- `user_warned`;
- `user_restricted`;
- `user_unrestricted`;
- `user_banned`;
- `user_unbanned`;
- `message_hidden`;
- `circle_chat_frozen`;
- `report_escalated`;
- `report_dismissed`;
- `host_abuse_reviewed`;
- `comfort_composition_issue_reviewed`.

### Properties

- `report_category`;
- `report_priority`;
- `action_type` (`moderation_action_type` enum);
- `target_type`;
- `time_to_first_review_bucket`;
- `time_to_resolution_bucket`;
- `ai_flagged` (boolean);
- `escalation_required` (boolean);
- `meeting_starts_within_24h` (boolean — для urgency tracking);
- `exact_location_revealed` (boolean — для location-incident severity).

### Metrics

- moderation response time;
- time to resolution;
- open reports by priority;
- action rate;
- dismissal rate;
- escalation rate;
- AI confirmed flag rate;
- AI false positive rate (admin overrides / total AI flags);
- circles removed;
- meetings removed;
- users restricted / banned;
- host abuse reviews.

### Privacy

- **без report descriptions**;
- **без admin notes**;
- **без raw AI summaries** if sensitive (RLS v2 §24);
- **без exact location** (Инв. 1).

---

## 24. Trust Analytics v2

### Events

- `profile_completed`;
- `phone_verified`;
- `trust_event_created_internal`;
- `trust_tier_updated_internal`;
- `verification_badge_earned`;
- `reliable_badge_earned`;
- `hosted_before_badge_earned`;
- `circle_member_confirmed`;
- `meeting_attendance_confirmed`;
- `no_show_recorded`;
- `circle_paused` (neutral — Trust v2 §7.7, weight=0);
- `circle_left` (neutral — Trust v2 §7.6, weight=0);
- `suspicious_velocity_flagged`;
- `circle_hosted_successfully`.

### Properties

- `trust_event_type`;
- `badge_type`;
- `previous_tier` (internal only);
- `new_tier` (internal only);
- `source` (`system_lifecycle` / `host_action` / `admin_action` / `ai_assist`);
- `aggregate_count_bucket` if safe.

### Metrics

- verified user rate (cohort %);
- profile completion rate;
- reliable participant badge rate;
- hosted before badge rate;
- meeting attendance rate;
- no-show rate (aggregate — Инв. 3);
- trust event volume (internal observability);
- restrictions caused by safety / trust patterns;
- pause / leave neutrality tracking (no impact on trust score — verify weight=0);
- host reliability.

### Privacy (binding — Trust v2 §33)

- **raw `trust_score_internal` forbidden** (Инв. 3);
- **no public negative trust labels** (Инв. 10, 12);
- **no removal / rejection history** (Инв. 12);
- **no user-level sensitive trust analytics** unless strictly internal admin observability.

---

## 25. Beta / Invite Analytics v2

### Events

- `invite_code_required`;
- `invite_code_entered`;
- `invite_code_validated`;
- `invite_code_used`;
- `invite_code_failed`;
- `waitlist_joined`;
- `waitlist_confirmed`;
- `beta_access_granted`;
- `beta_access_denied`;
- `invite_code_created_admin`;
- `invite_code_revoked_admin`.

### Properties

- `invite_status`;
- `invite_source`;
- `city_id`;
- `beta_cohort`;
- `failure_reason`;
- `assigned_invite` (boolean if safe).

### Metrics

- invite conversion rate;
- waitlist signup rate;
- invite usage rate;
- failed invite attempts (anti-enumeration signal);
- beta cohort activation;
- waitlist → signup conversion.

### Privacy

- **без raw email** unless allowed / hashed;
- **без broad assigned email exposure** (admin-only).

---

## 26. Notification Analytics v2

### Events

- `notification_created`;
- `notification_sent`;
- `push_notification_sent`;
- `push_notification_opened`;
- `notification_viewed`;
- `notification_marked_read`;
- `notification_failed`.

### Notification types (Schema v2 `notification_type` enum)

- `membership_request_approved_for_intro`;
- `membership_request_rejected`;
- `membership_request_waitlisted`;
- `membership_request_received_for_host`;
- `meeting_reminder`;
- `meeting_update`;
- `meeting_cancelled`;
- `circle_update`;
- `circle_chat_update`;
- `report_update`;
- `invite_available`;
- `system_notice`.

### Properties

- `notification_type`;
- `delivery_channel` (`push` / `in_app` / `email`);
- `related_entity_type`;
- `opened_from_push` (boolean);
- `circle_status` (если relevant);
- `meeting_status` (если relevant);
- `membership_status` (если relevant).

### Metrics

- push open rate;
- approval notification open rate;
- meeting reminder open rate;
- cancellation notification delivery;
- notification failure rate.

### Privacy

- **без exact location** (Инв. 1; RLS v2 §23.3 — dispatcher gate);
- **без sensitive body**;
- **без report details**.

---

## 27. Feature Flag / Experiment Analytics v2

### Events

- `feature_flag_exposed`;
- `experiment_variant_assigned`;
- `experiment_goal_completed`.

### Properties

- `flag_key`;
- `variant`;
- `experiment_key`;
- `exposure_context`;
- `user_cohort`.

### Rules

- feature flags могут control beta rollout;
- **do not A/B test critical safety in harmful way** (Инв. 5 / Инв. 7);
- safety features default conservative (Schema v2 §17 `feature_flag_status` safe default `inactive`).

### Potential beta flags

- `phone_verification_required_before_request`;
- `manual_circle_review_enabled`;
- `first_time_host_review_enabled`;
- `intro_meeting_required_before_membership`;
- `member_list_visible_after_approval`;
- `circle_chat_for_intro_approved_enabled`;
- `comfort_composition_enabled`;
- `women_only_circles_enabled` (Core v2 §21 — gated на validation).

---

## 28. Retention Analytics v2

### Traditional retention

- D1;
- D7;
- D14;
- D30.

### Better product-specific retention

- requested second circle;
- attended first meeting;
- attended second meeting;
- returned to My Circles;
- RSVP к next meeting;
- repeat meeting attendance;
- remained member after intro;
- active в circle chat;
- returned after rejection / waitlist;
- returned after pause (Trust v2 §7.7 — pause neutral).

### Host retention

- created second circle;
- scheduled second meeting;
- reviewed requests again;
- hosted recurring meeting again.

### Safety-aware retention

- retained users **without safety incidents**;
- retention after report / block experience (reporter side);
- retention after no-show / rejection;
- retention after membership pause (Инв. 11 — should be possible).

### Important (binding — Инв. 14)

> **Do not optimize retention at cost of safety or pressure.** Belonging может reduce discovery while increasing healthy retention — это **success**, не отчётный риск. Метрика "circles per user" **запрещена как retention KPI** (PRD v2 §22.6).

---

## 29. Dashboard Plan v2

### Dashboard 1 — Founder Overview

**Metrics:**

- active users;
- onboarded users;
- circles created;
- live circles;
- active circle members;
- membership requests;
- intro approvals;
- meetings scheduled;
- meetings completed;
- confirmed attendance;
- repeat meeting attendance;
- **trusted recurring offline interactions** (North Star);
- reports;
- blocks;
- no-show rate.

### Dashboard 2 — Activation Funnel

**Steps:**

- signup;
- invite;
- onboarding;
- profile complete;
- first circle view;
- first request;
- intro approval;
- first meeting attended;
- member confirmed;
- second meeting attended.

### Dashboard 3 — Circle Supply / Host

**Metrics:**

- active hosts;
- circles created;
- circles published;
- meetings scheduled;
- meetings completed;
- requests per circle;
- intro approval rate;
- host repeat rate;
- circle pause / archive rate;
- host abuse reports.

### Dashboard 4 — Demand / Member

**Metrics:**

- circle views;
- requests;
- approvals;
- first meeting attendance;
- member confirmation;
- My Circles opens;
- repeat meeting attendance;
- circle retention.

### Dashboard 5 — Safety / Moderation

**Metrics:**

- reports by category / priority;
- open reports;
- response time;
- actions taken;
- users restricted / banned;
- circles removed;
- meetings removed;
- message reports;
- chat freezes;
- host abuse reviews;
- comfort composition reports.

### Dashboard 6 — Beta / Invite

**Metrics:**

- invite codes created / used;
- waitlist joined;
- beta access granted;
- cohort activation;
- city-level funnel.

### Dashboard 7 — Trust Health

**Metrics:**

- verification rate;
- profile completion;
- reliable participant badge rate;
- hosted before badge rate;
- no-show rate (aggregate);
- suspicious velocity;
- trust events (internal);
- host reliability.

### Dashboard 8 — Belonging Health (binding — Инв. 14)

**Metrics:**

- active trusted circles (≥1 member, ≥1 meeting completed);
- circles с 2+ completed meetings;
- repeat attendance (rate);
- member retention;
- My Circles usage;
- circles full / closed / paused;
- pause / leave rate (neutral observability);
- stable circle count (≥2 returning attendees over ≥2 meetings).

---

## 30. Instrumentation Map by Flow v2

| Flow ID | Flow Name | Key Screens | Events to Track | Primary Metric | Privacy Notes |
|---|---|---|---|---|---|
| FLOW-001 | Guest Signup / Login | Welcome, Login, Signup | `signup_started`, `signup_completed`, `login_completed` | signup CR | без PII |
| FLOW-002 | Invite-only Beta Access | Invite Code, Waitlist | `invite_code_used`, `waitlist_joined`, `beta_access_*` | invite CR | без raw email |
| FLOW-003 | Onboarding for Circle Fit | Onboarding stack | `onboarding_*`, `safety_principles_accepted`, `city_selected`, `vibe_tags_selected`, `rhythm_selected`, `comfort_composition_selected`, `phone_verification_completed` | onboarding CR | без bio / phone / photo content |
| FLOW-004 | Profile View / Edit | My / Edit Profile | `profile_viewed`, `profile_updated` | completion / edit rate | без bio / raw trust |
| FLOW-005 | Safe Public Profile | Public Safe Profile | `public_profile_viewed`, `user_report_started`, `user_block_started` | profile report rate | без bio / raw trust |
| FLOW-006 | Circle Discovery | Discovery, Filters | `circle_discovery_viewed`, `circle_filter_applied`, `circle_card_tapped`, `circle_viewed` | discovery → request CR | без exact location |
| FLOW-007 | Circle Detail | Circle Detail variants | `circle_viewed`, `circle_detail_state_viewed`, `location_privacy_notice_viewed`, `fit_protection_notice_viewed`, `request_place_cta_tapped` | request CR | без exact location |
| FLOW-008 | Request a Place | Request Modal, Pending | `circle_join_started`, `circle_join_blocked_by_requirement`, `circle_join_requested`, `circle_join_cancelled` | request CR | без `intro_note` |
| FLOW-009 | Host Membership Review | Requests List, Detail | `membership_request_reviewed`, `circle_request_approved_for_intro`, `circle_request_rejected`, `circle_request_waitlisted` | approval rate | без `host_note` |
| FLOW-010 | Intro Meeting Approval / Location Reveal | Intro Approved Detail | `intro_meeting_viewed`, `meeting_location_revealed`, `meeting_rsvp_yes` | reveal correctness | **без exact location value** |
| FLOW-011 | Circle Meeting / RSVP | Meeting Detail | `meeting_viewed`, `meeting_rsvp_yes`, `meeting_reminder_sent`, `meeting_completed`, `meeting_attendance_confirmed`, `no_show_recorded` | attendance rate | aggregate; no-show internal |
| FLOW-012 | Become Member / Belonging | Intro Attended, Member confirmation | `circle_membership_confirmed`, `membership_not_confirmed_after_intro` | intro → member CR | без notes |
| FLOW-013 | My Circles / Belonging Mode | My Circles, Circle Home | `my_circles_opened`, `circle_home_opened`, `next_meeting_viewed`, `repeat_meeting_attendance` | belonging rate (Dashboard 8) | aggregate |
| FLOW-014 | Circle Chat | Circle Chat | `circle_chat_opened`, `circle_chat_message_sent`, `message_reported`, `circle_chat_frozen` | chat open rate | **без body** |
| FLOW-015 | Pause Participation | Pause Modal | `circle_membership_paused` | pause rate (neutral) | без public shame; Инв. 11 |
| FLOW-016 | Leave Circle | Leave Modal | `circle_membership_left` | leave rate (neutral) | без public shame; Инв. 11 |
| FLOW-017 | Host Ends Participation | Host Member Action | `circle_membership_removed_by_host` | host removal rate | reason — broad enum; no description |
| FLOW-018 | Block User | Block Confirm | `block_started`, `block_created` | block rate | без reason text |
| FLOW-019 | Report User | Report User | `report_started`, `report_created` (target_type=user) | report rate | без description |
| FLOW-020 | Report Circle / Meeting | Report Circle / Meeting | `report_created` (target_type=circle/meeting) | report rate | без description |
| FLOW-021 | Report Message | Report Message | `message_reported` | report rate | без body |
| FLOW-022 | Admin Moderation Queue | Admin Queue, Detail, Action Modal | `moderation_queue_viewed`, `moderation_report_opened`, `moderation_action_taken`, `circle_removed_for_safety`, `meeting_removed_for_safety` | response time | без notes |
| FLOW-023 | Suspicious Behavior / Velocity | (system) | `suspicious_activity_flagged`, `velocity_limit_triggered` | suspicious count | internal |
| FLOW-024 | Trust Signal Update | (system) | `trust_event_created_internal`, `*_badge_earned` | badge rate | internal only |
| FLOW-025 | Privacy / Delete Account | Settings / Delete | `account_delete_started`, `account_delete_completed` | delete rate | без PII в payload |

---

## 31. Instrumentation Map by Screen v2

| Screen ID | Screen Name | View Event | Action Events | Properties | Notes |
|---|---|---|---|---|---|
| MOB-001 | Welcome | `welcome_viewed` | signup / login tap | `source` | без PII |
| MOB-004 | Invite Code | `invite_code_screen_viewed` | `invite_code_entered`, `invite_code_used`, `invite_code_failed` | `invite_status`, `failure_reason` | без raw email |
| MOB-011 | Safety Principles | `safety_principles_viewed` | `safety_principles_accepted` | — | acceptance фиксируется |
| MOB-030 | Circle Discovery | `circle_discovery_viewed` | `circle_filter_applied`, `circle_card_tapped` | `city_id`, `category_id`, `result_count_bucket` | без exact location |
| MOB-033 | Circle Detail — Not Requested | `circle_viewed` | `request_place_cta_tapped`, `report_circle_started` | `circle_id`, `category_id`, `circle_status` | без exact location |
| MOB-050 | Request Place Modal | `request_place_cta_viewed` | `circle_join_started`, `circle_join_requested` | `circle_id` | без `intro_note` |
| MOB-052 | Membership Pending | `circle_detail_state_viewed` | `circle_join_cancelled` | `membership_request_status=requested` | без exact location |
| MOB-036 | Circle Detail — Intro Approved | `circle_detail_state_viewed` | `circle_chat_opened` | `membership_status=approved_for_intro_meeting` | **без exact location в analytics** |
| MOB-061 | Meeting Location Reveal | `meeting_viewed` | `meeting_location_revealed` (boolean event), `meeting_rsvp_yes` | `meeting_id` | **без exact location value** |
| MOB-100 | Circle Chat | `circle_chat_opened` | `circle_chat_message_sent`, `message_reported` | `circle_id`, `chat_state` | **без body** |
| MOB-070 | My Circles | `my_circles_opened` | `circle_home_opened` (на tap) | `active_circle_count_bucket` | belonging surface |
| MOB-071 | Circle Home | `circle_home_opened` | `next_meeting_viewed`, `circle_chat_preview_viewed` | `circle_id`, `membership_status` | belonging surface |
| MOB-080 | Create Circle Start | `circle_create_started` | `circle_create_step_completed` | `category_id` | без description text |
| MOB-087 | Host Circle Dashboard | `host_dashboard_viewed` | request review actions | `circle_id` | host scope |
| MOB-088 | Membership Requests | `membership_requests_list_viewed` | `membership_request_reviewed` | `circle_id`, `count_bucket` | host scope |
| MOB-089 | Request Detail | `membership_request_detail_viewed` | `circle_request_approved_for_intro`, `circle_request_rejected`, `circle_request_waitlisted` | `request_status` | без requester private data |
| MOB-112 | Public Safe Profile | `public_profile_viewed` | `user_report_started`, `user_block_started` | `profile_context` | без raw trust |
| MOB-113 | Report User | `report_started` | `report_created` | `report_category`, `target_type=user` | без description |
| MOB-114 | Report Circle | `report_started` | `report_created` | `report_category`, `target_type=circle` | без description |
| MOB-117 | Block User Confirmation | `block_started` | `block_created` | `block_context` | без reason text |
| ADM-002 | Moderation Queue | `moderation_queue_viewed` | `moderation_report_opened` | `priority`, `category` | admin project |
| ADM-003 | Report Detail | `moderation_report_opened` | `moderation_action_started` | `report_priority` | без description |
| ADM-010 | Admin Action Modal | `moderation_action_started` | `moderation_action_taken` | `action_type` | reason **не** в analytics |

---

## 32. Event Taxonomy Table v2

> Columns: Event Name · Category · Trigger · Actor · Key Properties · Forbidden Properties · P0/P1.
> Forbidden baseline для **всех** событий — §33 (exact location, raw body / description / notes, raw trust score, PII).

### App / Auth

| Event | Category | Trigger | Actor | Key Properties | P0/P1 |
|---|---|---|---|---|---|
| `app_opened` | App/Auth | app launch | client | `platform`, `app_version` | P0 |
| `signup_started` | App/Auth | signup opened | client | `source`, `provider` | P0 |
| `signup_completed` | App/Auth | account created | client/server | `provider` | P0 |
| `login_completed` | App/Auth | session established | client | `provider` | P0 |
| `logout_completed` | App/Auth | logout | client | — | P0 |
| `auth_error` | App/Auth | auth error | client | `error_type` | P0 |
| `protected_route_redirected` | App/Auth | redirect without session | client | `target_flow` | P1 |

### Beta

| Event | Category | Trigger | Actor | Key Properties | P0/P1 |
|---|---|---|---|---|---|
| `invite_code_required` | Beta | invite gate hit | client | — | P0 |
| `invite_code_entered` | Beta | code entered | client | — | P0 |
| `invite_code_used` | Beta | valid code consumed | server | `invite_status` | P0 |
| `invite_code_failed` | Beta | invalid code | server | `failure_reason` | P0 |
| `waitlist_joined` | Beta | waitlist email submitted | client/server | `city_id` | P0 |
| `beta_access_granted` | Beta | access granted | server | `beta_cohort` | P0 |
| `beta_access_denied` | Beta | access denied | server | `reason` | P0 |

### Onboarding

| Event | Category | Trigger | Actor | Key Properties | P0/P1 |
|---|---|---|---|---|---|
| `onboarding_started` | Onboarding | enters onboarding | client | — | P0 |
| `onboarding_step_viewed` | Onboarding | step shown | client | `step_name`, `step_index` | P0 |
| `onboarding_step_completed` | Onboarding | step finished | client | `step_name` | P0 |
| `safety_principles_accepted` | Onboarding | accept | client | — | P0 |
| `city_selected` | Onboarding | city selected | client | `city_id` | P0 |
| `interests_selected` | Onboarding | interests selected | client | `selected_count` | P0 |
| `vibe_tags_selected` | Onboarding | vibe selected | client | `selected_count` | P0 |
| `rhythm_selected` | Onboarding | rhythm selected | client | `rhythm` | P0 |
| `comfort_composition_selected` | Onboarding | composition selected | client | `comfort_composition` | P0 |
| `group_size_selected` | Onboarding | group size selected | client | `bucket` | P0 |
| `host_willingness_selected` | Onboarding | host opt-in | client | `host_willingness` | P1 |
| `profile_photo_uploaded` | Onboarding | photo uploaded | client | — | P0 |
| `phone_verification_started` | Onboarding | verify start | client | — | P0 |
| `phone_verification_completed` | Onboarding | verify done | server | — | P0 |
| `onboarding_completed` | Onboarding | onboarding done | client/server | — | P0 |

### Profile

| Event | Category | Trigger | Actor | Key Properties | P0/P1 |
|---|---|---|---|---|---|
| `profile_viewed` | Profile | profile opened | client | `profile_context` | P0 |
| `profile_edit_started` | Profile | edit started | client | — | P1 |
| `profile_updated` | Profile | profile saved | client/server | `fields_changed_keys` | P0 |
| `public_profile_viewed` | Profile | safe profile opened | client | `profile_context` | P0 |
| `profile_photo_removed` | Profile | photo removed | client | — | P1 |
| `privacy_settings_updated` | Profile | privacy updated | client | — | P1 |

### Circle Discovery

| Event | Category | Trigger | Actor | Key Properties | P0/P1 |
|---|---|---|---|---|---|
| `circle_discovery_viewed` | Discovery | Discovery opened | client | — | P0 |
| `circle_card_seen` | Discovery | card in viewport | client | `category_id` | P1 (noise — open §42 #10) |
| `circle_card_tapped` | Discovery | card tap | client | `category_id` | P0 |
| `circle_filter_applied` | Discovery | filter applied | client | `category_id`, `rhythm`, `comfort_composition` | P0 |
| `circle_empty_state_viewed` | Discovery | empty state | client | `filter_context` | P0 |
| `circle_viewed` | Discovery / Circles | Circle Detail opened | client | `circle_id`, `circle_status` | P0 |
| `location_privacy_notice_viewed` | Circles | notice shown | client | `circle_id` | P0 |
| `fit_protection_notice_viewed` | Circles | approval explainer shown | client | `circle_id` | P0 |

### Circle Creation / Host

| Event | Category | Trigger | Actor | Key Properties | P0/P1 |
|---|---|---|---|---|---|
| `circle_create_started` | Circle Creation | creation start | client | — | P0 |
| `circle_create_step_completed` | Circle Creation | step done | client | `step_name` | P0 |
| `circle_draft_saved` | Circle Creation | draft saved | client/server | — | P0 |
| `circle_preview_viewed` | Circle Creation | preview shown | client | `has_meeting_location` (boolean) | P0 |
| `circle_published` | Circle Creation | published | server | `category_id`, `circle_status` | P0 |
| `circle_pending_review` | Circle Creation | in review | server | — | P0 |
| `circle_updated` | Circle Creation | circle updated | server | `fields_changed_keys` | P1 |
| `circle_paused` | Circle Creation | paused (circle-level) | server | — | P0 |
| `circle_archived` | Circle Creation | archived | server | — | P0 |
| `circle_removed_for_safety` | Moderation | admin removes circle | admin | `circle_id` (admin scope) | P0 |
| `first_meeting_scheduled` | Circle Creation | first meeting | server | `circle_id` | P0 |
| `meeting_updated` | Meetings | meeting updated | server | `fields_changed_keys` | P1 |
| `meeting_cancelled` | Meetings | cancelled (host) | server | — | P0 |

### Membership Requests

| Event | Category | Trigger | Actor | Key Properties | P0/P1 |
|---|---|---|---|---|---|
| `circle_join_started` | Membership | Request modal opened | client | `circle_id` | P0 |
| `circle_join_blocked_by_requirement` | Membership | gate triggered | client | `requirement_block_reason` | P0 |
| `circle_join_requested` | Membership | submitted | server | `circle_id` | P0 |
| `circle_join_cancelled` | Membership | request cancelled | client/server | — | P0 |
| `membership_request_reviewed` | Membership | host opens request | client | `circle_id` | P0 |
| `circle_request_approved_for_intro` | Membership | approve intro | server | `circle_id` | P0 |
| `circle_request_rejected` | Membership | soft reject | server | `circle_id`, `reason_category` | P0 |
| `circle_request_waitlisted` | Membership | waitlist | server | `circle_id` | P0 |
| `circle_membership_confirmed` | Membership | intro → member | server | `circle_id` | P0 |
| `membership_not_confirmed_after_intro` | Membership | intro_attended → not confirmed | server | `circle_id` | P0 |

### Meetings / RSVP

| Event | Category | Trigger | Actor | Key Properties | P0/P1 |
|---|---|---|---|---|---|
| `meeting_viewed` | Meetings | meeting detail opened | client | `meeting_id` | P0 |
| `meeting_location_revealed` | Meetings | exact location shown | client | `meeting_id` (no location value) | P0 |
| `meeting_rsvp_yes` | Meetings | RSVP going | client/server | `meeting_id` | P0 |
| `meeting_rsvp_no` | Meetings | RSVP not_going | client/server | `meeting_id` | P0 |
| `meeting_reminder_sent` | Meetings | reminder sent | server | `reminder_timing_bucket` | P0 |
| `meeting_reminder_opened` | Meetings | reminder opened | client | — | P0 |
| `meeting_started` | Meetings | meeting starts | server | — | P0 |
| `meeting_completed` | Meetings | meeting completed | server | `category_id` | P0 |
| `attendance_prompt_viewed` | Meetings | host prompt | client | — | P0 |
| `meeting_attendance_confirmed` | Meetings | attendance confirmed | client/server | `confirmation_source` | P0 |
| `no_show_recorded` | Meetings | no-show | server | `meeting_id` (internal — Инв. 3) | P0 |
| `excused_absence_recorded` | Meetings | excused absence | server | `meeting_id` | P1 |

### Belonging

| Event | Category | Trigger | Actor | Key Properties | P0/P1 |
|---|---|---|---|---|---|
| `my_circles_opened` | Belonging | home opens | client | `active_circle_count_bucket` | P0 |
| `circle_home_opened` | Belonging | circle home opened | client | `circle_id` | P0 |
| `next_meeting_viewed` | Belonging | next meeting card opened | client | `circle_id` | P0 |
| `circle_membership_paused` | Belonging | member pauses | server | `circle_id` (neutral — Инв. 11) | P0 |
| `circle_membership_left` | Belonging | member leaves | server | `circle_id` (neutral — Инв. 11) | P0 |
| `return_to_circle_requested` | Belonging | re-engage after pause | client/server | `circle_id` | P1 |
| `not_looking_for_new_circles_selected` | Belonging | explicit belonging signal | client | — | P1 |

### Circle Chat

| Event | Category | Trigger | Actor | Key Properties | P0/P1 |
|---|---|---|---|---|---|
| `circle_chat_opened` | Chat | chat opens | client | `circle_id` | P0 |
| `circle_chat_message_sent` | Chat | message sent | client/server | `circle_id`, `message_type` | P0 |
| `circle_system_message_sent` | Chat | system message | server | `circle_id`, `system_event_type` | P0 |
| `message_actions_opened` | Chat | message menu | client | — | P1 |
| `message_reported` | Chat | message report | server | `report_category` | P0 |
| `circle_chat_frozen` | Chat | chat frozen | admin | `circle_id` | P0 |
| `circle_chat_access_denied` | Chat | access denied | client | `access_denied_reason` | P0 |

### Safety

| Event | Category | Trigger | Actor | Key Properties | P0/P1 |
|---|---|---|---|---|---|
| `report_started` | Safety | report started | client | `target_type` | P0 |
| `report_created` | Safety | report submitted | server | `report_category`, `report_priority`, `target_type` | P0 |
| `block_started` | Safety | block started | client | `block_context` | P0 |
| `block_created` | Safety | block created | server | `block_context` | P0 |
| `suspicious_activity_flagged` | Safety | system flag | server | `activity_type` | P0 |
| `velocity_limit_triggered` | Safety | velocity limit | server | `velocity_limit_type` | P0 |
| `location_privacy_incident_flagged` | Safety | location leak | server | `incident_type` | P0 |
| `comfort_composition_reported` | Safety | composition issue | server | `circle_id` | P0 |
| `host_abuse_flagged` | Safety | host abuse signal | server | `flag_type` | P0 |

### Moderation

| Event | Category | Trigger | Actor | Key Properties | P0/P1 |
|---|---|---|---|---|---|
| `moderation_queue_viewed` | Moderation | queue opened | admin | — | P0 |
| `moderation_report_opened` | Moderation | report opened | admin | `report_priority` | P0 |
| `moderation_action_taken` | Moderation | action executed | admin | `action_type`, `target_type` | P0 |
| `report_status_updated` | Moderation | status changed | admin | `report_status` | P0 |
| `circle_removed_for_safety` | Moderation | circle removed | admin | `circle_id` | P0 |
| `meeting_removed_for_safety` | Moderation | meeting removed | admin | `meeting_id` | P0 |
| `user_restricted` | Moderation | restrict | admin | — | P0 |
| `user_banned` | Moderation | ban | admin | — | P0 |
| `message_hidden` | Moderation | message hidden | admin | — | P0 |
| `report_escalated` | Moderation | escalation | admin | `report_priority` | P0 |
| `report_dismissed` | Moderation | dismiss | admin | — | P0 |

### Trust

| Event | Category | Trigger | Actor | Key Properties | P0/P1 |
|---|---|---|---|---|---|
| `trust_event_created_internal` | Trust | trust signal | server | `trust_event_type` | P0 (internal) |
| `verification_badge_earned` | Trust | badge earned | server | `badge_type` | P0 |
| `reliable_badge_earned` | Trust | reliable badge | server | `badge_type` | P1 |
| `hosted_before_badge_earned` | Trust | hosted badge | server | `badge_type` | P1 |
| `circle_member_confirmed` | Trust | member confirmed | server | `circle_id` | P0 |
| `circle_hosted_successfully` | Trust | hosting threshold | server | `circle_id` | P1 |

### Notifications

| Event | Category | Trigger | Actor | Key Properties | P0/P1 |
|---|---|---|---|---|---|
| `notification_created` | Notifications | notification created | server | `notification_type` | P0 |
| `push_notification_sent` | Notifications | push sent | server | `notification_type` | P0 |
| `push_notification_opened` | Notifications | push opened | client | `notification_type` | P0 |
| `notification_viewed` | Notifications | viewed in-app | client | `notification_type` | P0 |

> Forbidden properties для **каждой** строки — §33 baseline (exact location, raw body / description / notes, raw trust score, PII).

---

## 33. Privacy Boundary v2

**Critical section** — binding на RLS v2 §24, Trust v2 §33, Moderation v2 §40.

### 33.1 Never Track

- `exact_location_text`;
- `exact_address`;
- `exact_lat`;
- `exact_lng`;
- `arrival_instructions`;
- `phone_number`;
- `legal_name`;
- `date_of_birth`;
- raw message body;
- `intro_note`;
- `host_note`;
- report description;
- moderation notes (`reports.admin_resolution_note`, `moderation_actions.reason`);
- AI detailed summary if sensitive (`reports.ai_summary`);
- raw `trust_score_internal` (Инв. 3);
- private profile details (`profile_private_details.*`);
- **removal / rejection history** (Инв. 12);
- **other circles** as social comparison (Инв. 13).

### 33.2 Safe to Track

- IDs (UUIDs);
- enum values;
- status values;
- category IDs;
- city IDs;
- `rhythm` enum;
- `comfort_composition` enum;
- boolean flags;
- buckets;
- counts;
- funnel steps;
- broad reason codes.

### 33.3 Use Buckets Instead of Raw Values

Examples:

- `capacity_bucket` (1–4 / 5–8 / 9–12);
- `member_count_bucket`;
- `request_count_bucket`;
- `time_to_approval_bucket`;
- `profile_completeness_bucket`;
- `reminder_timing_bucket`;
- `attendee_count_bucket`;
- `repeat_meeting_number_bucket`;
- `active_circle_count_bucket`.

### 33.4 Location Rule

> **Analytics must never receive exact meeting location.** Approximate city / area / `city_id` acceptable. (Инв. 1, Инв. 9; consistent с RLS v2 §24, Moderation v2 §40.)

`meeting_location_revealed` — это **boolean event** (что reveal случился); **значение exact location в payload не передаётся**. Schema-level validation должна refuse forbidden columns; observability alerts на sensitive field в payload.

---

## 34. Data Quality & QA v2

### Checklist

- каждый P0 flow имеет события;
- event names consistent (snake_case, past tense);
- нет дублей с разными именами (особенно при v1→v2 transition);
- properties documented;
- sensitive data excluded;
- test environment separated (`environment` property);
- staging events marked;
- production events marked;
- anonymous / authenticated identity merge handled (open §42 #14);
- dashboards используют correct events (v2 vocabulary);
- internal / test users excluded;
- **старая event-first taxonomy не используется** как current — только migration history.

### QA test cases

- [ ] `circle_viewed` содержит `circle_id` но **без** location values;
- [ ] `circle_join_requested` **не** содержит `intro_note`;
- [ ] `meeting_location_revealed` **не** содержит exact location value (только `meeting_id`);
- [ ] `circle_chat_message_sent` **не** содержит body;
- [ ] `report_created` **не** содержит description;
- [ ] `moderation_action_taken` **не** содержит admin note (`reason`);
- [ ] `no_show_recorded` **не** public label (internal только — Инв. 12);
- [ ] `circle_membership_left` / `circle_membership_paused` **не** negative public events (Инв. 11 — neutral в Trust v2 §7.6-7.7);
- [ ] `circle_card_seen` properly gated (P1, noise concern — open §42 #10);
- [ ] dashboard queries **не** ссылаются на removed v1 event names (`event_viewed`, `application_*`).

---

## 35. Analytics Implementation Notes v2

> Future implementation guidance only. Implementation — после Sprint Backlog v2 + Sprint 2.

### Mobile

- PostHog initialized later (после Sprint 2 backlog approval);
- identify после auth;
- reset on logout;
- track screen views;
- track action events;
- avoid sensitive props (§33);
- **`meeting_location_revealed` — boolean event, без location value в payload**.

### Backend / Edge Functions

Track server-side для critical operations (источник истины — server-side для тех, кто не передоверяется клиенту):

- `circle_join_requested`;
- `circle_request_approved_for_intro`;
- `circle_membership_confirmed`;
- `meeting_rsvp_yes`;
- `meeting_attendance_confirmed`;
- `no_show_recorded`;
- `report_created`;
- `moderation_action_taken`;
- `circle_removed_for_safety`;
- `meeting_removed_for_safety`.

### Admin

- track admin dashboard usage **отдельно** (project / namespace — open §42 #8);
- **без sensitive report details**;
- track action types / timings только.

### Environments

- `local`;
- `staging`;
- `production`.

### Rules

- **no production analytics from local** (если явно не configured);
- staging separated;
- test users marked (`beta_cohort = 'internal_test'` или similar).

---

## 36. Closed Beta Success Metrics v2

### Activation

- **60%+** signup users complete onboarding;
- **40%+** onboarded users view at least one circle;
- **30–40%+** onboarded users request a place.

### Circle Entry

- meaningful request → intro approval rate (cohort-dependent);
- users understand "request place" (qualitative — §37);
- approval не feels like human ranking (qualitative — §37; Core v2 §19).

### Attendance

- **25%+** approved users attend first meeting в течение 14 days;
- **20%+** attendees attend second meeting;
- no-show rate manageable (target — open §42 #15).

### Belonging

- some circles reach **2+ completed meetings**;
- some members return to My Circles;
- users describe **belonging**, не just attendance (qualitative — §37);
- stable active circles emerge.

### Host

- curated hosts create circles;
- hosts review requests (response time monitored);
- hosts understand **fit protection** (Core v2 §19);
- hosts schedule recurring meetings.

### Safety

- report / block rate monitored (Dashboard 5);
- high / critical reports reviewed quickly (Moderation v2 §36 SLA);
- no unresolved critical safety incidents;
- unsafe circles / meetings can be removed;
- users report feeling safe (qualitative — §37).

### Product Understanding

- users understand **circles** (не события / не dating app);
- users understand **location privacy** (когда раскрывается);
- users understand **no open DMs** (Инв. 2);
- users **do not perceive product as dating app**;
- users **do not perceive product as people marketplace** (Инв. 13).

---

## 37. Qualitative Research Metrics v2

### Collect during beta

- user interview notes;
- host feedback;
- post-meeting survey;
- safety perception;
- circle concept understanding;
- why users requested / did not request;
- why hosts approved / rejected;
- approval anxiety (Core v2 §19);
- comfort composition clarity (Core v2 §21);
- whether product feels too bureaucratic;
- whether product feels **alive enough** (Core v2 §9 — controlled unpredictability);
- whether My Circles feels valuable.

### Suggested survey questions

1. Что такое круг в этом продукте?
2. Чем круг отличается от события?
3. Было ли понятно, зачем нужно подтверждение?
4. Когда открывается точное место встречи?
5. Чувствовали ли вы себя безопасно?
6. Это ощущалось как dating app?
7. Это ощущалось как выбор людей?
8. Хотели бы вы прийти на вторую встречу?
9. Что вызвало недоверие?
10. Что дало ощущение принадлежности?

---

## 38. Alerts / Monitoring v2

### Possible alerts

- critical report created;
- high priority report для meeting starting within 24h;
- location privacy incident (`location_privacy_incident_flagged`);
- `circle_removed_for_safety`;
- `meeting_removed_for_safety`;
- unusual report spike;
- suspicious membership request velocity;
- many failed invite attempts (enumeration signal);
- `circle_chat_frozen`;
- `user_banned`;
- many no-shows на одной meeting;
- repeated host removals (`frequent_host_removals` — Moderation v2 §29);
- comfort composition report.

### Rules

- simple / manual alerting acceptable в бете;
- founder / admin reviews safety alerts (cadence — §39);
- **не каждое событие требует alert** — alert fatigue хуже отсутствия alert.

---

## 39. Analytics Review Cadence v2

### Daily (early beta)

**Review:**

- signups;
- onboarding completion;
- circles created;
- membership requests;
- intro approvals;
- reports / blocks;
- high / critical safety issues.

### Weekly

**Review:**

- activation funnel;
- circle supply;
- request conversion;
- meeting attendance;
- repeat attendance;
- My Circles usage;
- moderation response time;
- qualitative feedback.

### After each meeting batch

**Review:**

- meeting completion;
- attendance;
- no-shows;
- reports;
- host feedback;
- member feedback;
- repeat participation.

---

## 40. Decision Framework v2

### Low onboarding completion

**Investigate:**

- too many steps;
- vibe / rhythm unclear;
- comfort composition friction;
- phone verification friction;
- unclear safety copy.

### High circle views but low requests

**Investigate:**

- circles not appealing;
- request-place feels intimidating (approval anxiety);
- location uncertainty;
- lack of trust in host;
- vibe unclear.

### High requests but low approvals

**Investigate:**

- host review friction;
- profiles insufficient;
- host anxiety;
- supply / demand mismatch;
- approval feels too exclusive.

### High approvals but low attendance

**Investigate:**

- reminders;
- no-show friction;
- meeting quality;
- location uncertainty;
- commitment too high.

### High first attendance but low second attendance

**Investigate:**

- circle fit;
- host quality;
- meeting quality;
- social temperature too low / high (Core v2 §9);
- membership confirmation UX.

### High reports / blocks

**Investigate:**

- safety issues;
- chat abuse;
- host abuse;
- comfort composition issues;
- weak onboarding expectations.

### Users think it is dating app

**Investigate:**

- copy;
- visual language;
- profile design;
- "vibe" wording;
- composition display;
- no-DM clarity (Инв. 2).

### Users think it is people marketplace (Инв. 13)

**Investigate:**

- member visibility;
- profile emphasis;
- discovery layout;
- circle vs people hierarchy.

---

## 41. Analytics Risks v2

| Risk | Impact | Mitigation |
|---|---|---|
| Sensitive data sent to analytics | критич. | Privacy boundary §33; schema validation; observability alerts |
| Exact location leak | **критич.** (Инв. 1) | Location rule §33.4; `meeting_location_revealed` — boolean only; QA test cases |
| Raw message body tracked | высокий | Запрет в taxonomy; QA |
| Report descriptions tracked | высокий | Запрет; admin-only path |
| Raw trust score tracked | критич. (Инв. 3) | Forbidden; internal-only |
| Vanity metrics distract from belonging | средний | Metric hierarchy §6; North Star focus |
| Over-optimizing discovery | средний | Belonging Health dashboard (§29 Dashboard 8) |
| **Infinite discovery pressure** (Инв. 14) | высокий | "Circles per user" KPI запрещён (PRD v2 §22.6); belonging — success state |
| Insufficient safety metrics | высокий | L6 / Dashboard 5 обязательны |
| Duplicate event names (v1 / v2 collision) | средний | Vocabulary map §0; QA |
| Dashboards misleading due to small beta | средний | Buckets; qualitative context (§37); careful inference |
| Qualitative feedback ignored | средний | §39 cadence; founder review |
| Critical flows missing instrumentation | высокий | Instrumentation map §30 / §31 |
| Admin analytics leaking sensitive context | высокий | Separate project (open §42 #8); no notes |
| Identity merge errors | средний | Anon→auth merge rule §35 |
| Staging data mixed with production | средний | `environment` property; разделение |
| **Old event-first taxonomy leaking into v2** | средний | Vocabulary map §0; QA test cases §34; dashboard audit |
| **`circle_left` / `circle_paused` treated as negative** | критич. (Инв. 11) | Trust v2 weight=0 verified; dashboard copy review |
| `comfort_composition` misused analytically | высокий | Enum tracked but не для public ranking; aggregate only |

---

## 42. Open Analytics Questions v2

| # | Вопрос | Связь |
|---|---|---|
| 1 (Q-NSM-FORMULA) | Точная формула safety quality multiplier? | §5 |
| 2 (Q-NSM-CHOICE) | "Trusted recurring offline interactions" или "active trusted circles"? (A vs B) | §5 |
| 3 (Q-ACTIVATION) | Hard activation = first request, first meeting, или second meeting? | §12 |
| 4 (OD-10) | Какой beta city / community первый? | §25 / §36 |
| 5 (Q-COMPLETE-BUCKET) | Какие profile completeness buckets трекать? | §10 / §33 |
| 6 (Q-TIER-TRACK) | Трекать ли `trust_tier` внутренне в analytics? | §24 |
| 7 (Q-NS-LEVEL) | `no_show_recorded` — user-level event или aggregate only? | §19 / §24 |
| 8 (AQ-ADMIN-PROJECT) | Admin analytics — same PostHog project или отдельный? | §35 |
| 9 (Q-REQUIRED-PROPS) | Какие properties обязательны для каждого event? | §9 |
| 10 (Q-CARD-SEEN) | Трекать `circle_card_seen` или только tap (шум)? | §15 / §32 |
| 11 (Q-ALERT-THRESH) | Пороги для alert spike? | §38 |
| 12 (Q-SURVEY-TOOL) | Какой инструмент / процесс для qualitative survey? | §37 |
| 13 (Q-ATTENDANCE-DISPUTE) | Attendance disputes в P0 или P1? | §19 |
| 14 (Q-IDENTITY-MERGE) | Как мёрджить anon pre-signup и authenticated analytics? | §34 / §35 |
| 15 (Q-NO-SHOW-TARGET) | Какой target no-show rate в бете? | §36 |
| 16 (Q-SAFE-EVENT-ID) | Слать ли `circle_id` / `meeting_id` для safety events или только category / city? | §22 / §33 |
| 17 (OD-9) | Retention policy для analytics data? | §35 |
| 18 (Q-EXCLUDE-INTERNAL) | Как исключать internal / admin / test users из dashboards? | §34 |
| 19 (Q-PAUSE-LEAVE-CHURN) | Как treat `circle_left` / `circle_paused` в churn calc? (binding answer: NOT churn — Инв. 11) | §20 / §28 |
| 20 (Q-COMFORT-ANALYTICS) | Трекать ли `comfort_composition` как enum в analytics? (binding: yes as enum, но не для public ranking) | §15 / §33 |
| 21 (Q-SOCIAL-TEMP) | Как измерять "social temperature" (Core v2 §9)? | §40 |

---

## 43. Analytics Checklist Before Beta v2

Все обязательны:

- [ ] North Star Metric defined;
- [ ] activation funnel defined;
- [ ] onboarding events defined;
- [ ] circle discovery events defined;
- [ ] circle request events defined;
- [ ] membership events defined;
- [ ] meeting / RSVP / attendance events defined;
- [ ] My Circles / belonging events defined;
- [ ] circle chat events defined;
- [ ] safety events defined;
- [ ] moderation events defined;
- [ ] trust boundary defined;
- [ ] beta / invite events defined;
- [ ] notification events defined;
- [ ] privacy boundary reviewed (§33);
- [ ] dashboards planned (§29);
- [ ] QA test cases defined (§34);
- [ ] staging vs production separation planned;
- [ ] internal / test user exclusion planned;
- [ ] **no exact location tracked** (Инв. 1);
- [ ] **no raw message / report / moderation content tracked** (Инв. 12);
- [ ] **no raw trust score tracked** (Инв. 3);
- [ ] **old event-first taxonomy removed / replaced** (§0 vocabulary map).

---

## 44. Summary

**Analytics v2:**

- **измеряет core trusted recurring circle loop** (Find vibe → Request → Enter → Attend → Belong → Trusted graph).
- **North Star — trusted recurring offline interactions** (composite formula §5).
- **Belonging is a success state** (Инв. 14) — "circles per user" KPI запрещён.
- **Safety metrics — first-class product metrics** (Dashboard 5 + L6 hierarchy).
- **Analytics privacy boundary строгий** — no exact location, no raw message / report / moderation content, no raw trust score, no removal / rejection history.
- **Closed beta dashboards defined** (8 dashboards: Founder Overview, Activation, Supply / Host, Demand / Member, Safety, Beta, Trust, Belonging).
- **No analytics SDK is connected yet.** Implementation — после Sprint 2 backlog approval.

**Next required document:**

> Update [`/docs/11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md) to **Sprint Backlog v2** ([doc 27 §24 Phase D step 12](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)).

Sprint Backlog v2 specifies:

- circle-first epic structure;
- Sprint 2 scope (auth / onboarding / waitlist) на основе PRD v2;
- task estimation aligned с circle / meeting primitives;
- safety / trust / moderation tasks aligned с docs 07 / 08 / 09 v2;
- analytics instrumentation tasks aligned с этой Analytics v2;
- Phase gate criteria для Sprint 2 → Sprint 3 (circle discovery + creation).

После Sprint Backlog v2 → **Sprint 2 phase gate** (doc 22) → Sprint 2 product implementation может начаться.

---

> Reminder: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2) — **first source of truth**. Этот документ ему, PRD v2 §22, RLS v2 §24, Trust v2 §33, Moderation v2 §40 подчинён. Любой analytics event, нарушающий §33 privacy boundary, или dashboard, измеряющий "circles per user" как retention KPI, — **отклоняется на review**. Никакой analytics implementation / SDK подключений / production tracking events в code до Sprint 2 backlog approved.
