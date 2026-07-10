# Database Schema v2 — Antidot

> **Status:** v2 (schema blueprint для closed beta, circle-first).
> **Owner:** Technical / Backend
> **Last updated:** 2026-05-31
> **First source of truth:** [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2).
> **Architecture source:** [`/docs/05_ARCHITECTURE.md`](05_ARCHITECTURE.md) (Architecture v2).
> **Requirements sources:** [`/docs/01_PRD.md`](01_PRD.md), [`/docs/02_USER_STORIES.md`](02_USER_STORIES.md), [`/docs/03_USER_FLOWS.md`](03_USER_FLOWS.md).
> **Supersedes:** Database Schema v1 (event-first, 2026-05-18).
> **Sequenced by:** [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md) §24 Phase C step 7.

> ⚠️ Это **blueprint**, не migrations. **Никакого SQL не написано.** `.sql` файлы и migrations создаются **позже** (Sprint 2+) после approval этого blueprint'а и [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md) v2.

---

## 1. Source of Truth

- **Product Core v2** ([`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md)) — first source of truth.
- **Architecture v2** ([`/docs/05_ARCHITECTURE.md`](05_ARCHITECTURE.md)) — technical direction; §11 location matrix и §25 RLS overview — input для этого документа.
- Schema v2 следует **HYBRID ACCEPT** ([`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md)).
- **User-facing primitive** — Circle.
- **Operational primitive** — Meeting.
- **Старая event-first схема superseded** как MVP core.
- Это **blueprint для future Supabase migrations** (которые ещё не созданы).
- **Полные RLS-политики** — в [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md) v2 (которая ещё не написана).

---

## 2. Schema Goals v2

1. **Поддержать circle-first MVP.**
2. **Поддержать meeting-based offline operations.**
3. **Защитить exact meeting location** через **separate `meeting_locations` table** (Инв. 1).
4. **Membership-based access** — RLS keyed на `circle_memberships.status` (10+ states).
5. **Intro meeting before full membership** — explicit `membership_request_status` + `circle_membership_status` transitions.
6. **Circle Chat только для approved members / allowed intro participants** (Инв. 2).
7. **RSVP и attendance** — отдельные таблицы; no-show internal only (Инв. 3).
8. **Pause / leave / removal без public shame** (Инв. 12).
9. **No betrayal mechanics** (Инв. 11) — никаких public transition records.
10. **Staged composition visibility** — separate views для discovery vs member context.
11. **Trust через repeated attendance** — append-only `trust_events` + admin-only `user_trust_summary` (Инв. 3, 10).
12. **Report / block / moderation / audit** — full coverage (Инв. 4, 6).
13. **Invite-only beta** — `invite_codes` + `waitlist_entries`.
14. **Analytics без sensitive data** (Инв. 1, 3).
15. **Совместимость с Supabase / PostgreSQL / RLS.**

---

## 3. Schema Non-Goals

Schema v2 **не поддерживает в MVP**:

- standalone event marketplace;
- people marketplace (Инв. 13);
- swipe механики;
- open DMs (Инв. 2);
- people-first discovery;
- public followers;
- public ratings (Hard rule 5);
- raw trust score exposure (Инв. 3);
- live location (Инв. 9);
- exact public map pins (Инв. 1);
- payments (Hard rule 7);
- tickets;
- paid events;
- promoted circles;
- nightlife / party mechanics;
- streams / online broadcast;
- complex AI matching;
- B2B monetization;
- **microservices** (Modular Monolith — doc 17);
- **multiple databases**.

> Эти entities **не закладываются в таблицы**. Добавление — только через product decision + Product Core update (CLAUDE.md §3).

---

## 4. Database Conventions

### 4.1 Naming

- Таблицы: `snake_case` множественное число.
- Колонки: `snake_case`.
- Enum'ы: `snake_case`.
- PK: `id uuid`.
- FK: `entity_id uuid`.
- Timestamps: `created_at`, `updated_at`.
- Soft delete: `deleted_at` (where needed).

### 4.2 Common columns

Для большинства таблиц:

- `id uuid primary key`;
- `created_at timestamptz not null default now()`;
- `updated_at timestamptz not null default now()`.

Для sensitive / moderation таблиц дополнительно:

- `created_by uuid nullable`;
- `updated_by uuid nullable`;
- `deleted_at timestamptz nullable`;
- `metadata jsonb nullable`.

### 4.3 Security principles

- **Exact meeting location separated** от circle public data (`meeting_locations` отдельной таблицей);
- **Raw trust score separated** от profile (`user_trust_summary` admin-only);
- **Private profile data separated** (`profile_private_details`);
- **Public / safe views** для discovery;
- **Admin-only tables** clearly marked;
- **RLS обязательна** для exposed таблиц;
- **Service role только server-side** (Инв. 12).

---

## 5. Enum Definitions v2

| Enum | Values | Used by | Notes |
|---|---|---|---|
| `profile_status` | `incomplete`, `active`, `restricted`, `suspended`, `banned`, `deleted` | `profiles` | gating; `banned`/`suspended` блокируют interaction |
| `verification_level` | `none`, `email_verified`, `phone_verified`, `identity_reviewed` | `profiles`, `profile_private_details` | `identity_reviewed` зарезервирован (не MVP) |
| `trust_tier` | `new`, `verified`, `reliable`, `trusted_host`, `restricted`, `suspended` | `profiles`, `user_trust_summary` | derived, **non-numeric**; raw score не здесь |
| `circle_status` | `draft`, `pending_review`, `live`, `paused`, `full`, `archived`, `removed_for_safety` | `circles` | см. §25 transitions |
| `circle_visibility` | `public`, `unlisted`, `private` | `circles` | `unlisted` / `private` — open §34 |
| `circle_comfort_composition` | `open_mixed`, `female_friendly`, `women_only`, `host_defined` | `circles` | `women_only` / `female_friendly` **gated на validation** (Core v2 §21) |
| `circle_rhythm` | `weekly`, `biweekly`, `monthly`, `flexible`, `one_time_intro_only` | `circles` | `one_time_intro_only` — для P1 одноразовых intro |
| `membership_request_status` | `requested`, `approved_for_intro_meeting`, `rejected`, `waitlisted`, `cancelled_by_user`, `expired` | `circle_membership_requests` | см. §25 |
| `circle_membership_status` | `member`, `paused`, `left`, `removed`, `removed_for_safety`, `banned_from_circle` | `circle_memberships` | terminal состояния — Инв. 12 (no public labels) |
| `member_role` | `host`, `cohost`, `member`, `intro_guest` | `circle_memberships` | `cohost` зарезервирован (P1 — US-P1-08); `intro_guest` для `approved_for_intro` |
| `meeting_status` | `scheduled`, `starting_soon`, `in_progress`, `completed`, `cancelled`, `removed_for_safety` | `circle_meetings` | system-driven transitions |
| `rsvp_status` | `not_responded`, `going`, `not_going`, `maybe`, `cancelled_by_user` | `meeting_rsvps` | `maybe` — open §34 |
| `attendance_status` | `unknown`, `attended`, `no_show`, `excused_absence` | `meeting_attendance` | no-show internal only (Инв. 3) |
| `location_reveal_policy` | `after_intro_approval`, `after_membership_approval`, `near_start_time`, `manual_host_release` | `circle_meetings` | default `after_intro_approval` (Инв. 1) |
| `moderation_status` | `not_required`, `pending`, `approved`, `flagged`, `rejected`, `removed` | `profile_photos`, `circles`, `circle_meetings`, `circle_chat_messages` | AI assistive (Инв. 5) |
| `report_status` | `new`, `in_review`, `action_taken`, `dismissed`, `escalated` | `reports` | — |
| `report_priority` | `low`, `medium`, `high`, `critical` | `reports`, `suspicious_activity_events` | AI-assistive prioritization (Инв. 5) |
| `report_category` | `harassment`, `spam`, `scam`, `unsafe_behavior`, `inappropriate_content`, `fake_profile`, `circle_safety`, `meeting_safety`, `location_issue`, `comfort_composition_violation`, `host_abuse`, `other` | `reports` | категории фиксированы; description свободный текст |
| `moderation_action_type` | `warn_user`, `restrict_user`, `unrestrict_user`, `ban_user`, `unban_user`, `remove_circle`, `restore_circle`, `remove_meeting`, `restore_meeting`, `hide_message`, `restore_message`, `freeze_chat`, `unfreeze_chat`, `dismiss_report`, `escalate_report`, `admin_note` | `moderation_actions` | каждое action → audit log (Инв. 4) |
| `trust_event_type` | `profile_completed`, `phone_verified`, `meeting_attended`, `meeting_no_show`, `circle_member_confirmed`, `circle_left`, `circle_paused`, `circle_removed_for_safety`, `host_positive_feedback`, `host_negative_feedback`, `report_received`, `block_received`, `moderation_warning`, `restriction_applied`, `suspicious_velocity`, `circle_hosted_successfully` | `trust_events` | **`circle_left` и `circle_paused` — neutral default**, не negative (Инв. 11, 12) |
| `notification_type` | `membership_request_approved_for_intro`, `membership_request_rejected`, `membership_request_waitlisted`, `membership_request_received_for_host`, `meeting_reminder`, `meeting_update`, `meeting_cancelled`, `circle_update`, `circle_chat_update`, `report_update`, `invite_available`, `system_notice` | `notifications` | push без exact location в body (Инв. 1) |
| `invite_code_status` | `active`, `used`, `expired`, `revoked` | `invite_codes` | — |
| `feature_flag_status` | `active`, `inactive` | `feature_flags` | server-driven; safe default inactive |

---

## 6. Core Tables Overview v2

| Table | Domain | Purpose | P0/P1 | Sensitive? | RLS Required? |
|---|---|---|:--:|:--:|:--:|
| **Identity** | | | | | |
| `profiles` | Identity | safe public profile | P0 | partial | ✅ |
| `profile_private_details` | Identity | private fields | P0 | **high** | ✅ |
| `profile_photos` | Identity | photo refs | P0 | partial | ✅ |
| `interests` | Identity | global interests list | P0 | no | read all |
| `vibe_tags` | Identity | curated vibe descriptors | P0 | no | read all |
| `user_interests` | Identity | join | P0 | no | ✅ |
| `user_vibe_tags` | Identity | join | P0 | no | ✅ |
| `cities` | Identity | supported beta cities | P0 | no | read all |
| **Circles** | | | | | |
| `circle_categories` | Circles | allowed categories | P0 | no | read all |
| `circles` | Circles | primary circle object | P0 | partial | ✅ |
| `circle_vibe_tags` | Circles | join | P0 | no | ✅ |
| `circle_rules` | Circles | host-defined rules | P0 | no | ✅ |
| **Membership** | | | | | |
| `circle_membership_requests` | Membership | user → circle requests | P0 | partial | ✅ |
| `circle_memberships` | Membership | approved relationships | P0 | partial | ✅ |
| `circle_membership_history` | Membership | internal transition log | **P1** | **high** | admin-only |
| **Meetings** | | | | | |
| `circle_meetings` | Meetings | scheduled meetings | P0 | partial | ✅ |
| **`meeting_locations`** | Meetings | **protected exact location** | **P0** | **critical** | ✅ **strict** |
| `meeting_rsvps` | Meetings | RSVP records | P0 | partial | ✅ |
| `meeting_attendance` | Meetings | attendance / no-show | P0 | partial | ✅ |
| **Chat** | | | | | |
| `circle_chat_messages` | Chat | per-circle messages | P0 | partial | ✅ |
| `circle_chat_states` | Chat | frozen / open state | P0 | no | ✅ |
| **Safety** | | | | | |
| `user_blocks` | Safety | bilateral blocks | P0 | partial | ✅ |
| `reports` | Safety | user / circle / meeting / message reports | P0 | **high** | ✅ |
| `suspicious_activity_events` | Safety | system flags | P0 | high | admin-only |
| **Moderation / Audit** | | | | | |
| `moderation_actions` | Moderation | admin actions | P0 | high | admin-only |
| `audit_logs` | Audit | append-only log | P0 | high | admin-only |
| **Trust** | | | | | |
| `trust_events` | Trust | append-only signals | P0 | **high** | admin / system only |
| `user_trust_summary` | Trust | derived internal summary (raw score!) | P0 | **critical** | **admin / system only** |
| **Beta** | | | | | |
| `invite_codes` | Beta | invite-only access | P0 | partial | admin |
| `waitlist_entries` | Beta | waitlist | P0 | partial | admin |
| **Notifications** | | | | | |
| `notifications` | Notif | in-app notifications | P0 | partial | ✅ |
| `push_tokens` | Notif | device tokens | P0 | partial | ✅ |
| **Feature Flags** | | | | | |
| `feature_flags` | Config | flag registry | P0 | no | admin |
| `feature_flag_exposures` | Config | exposure log | P0 | partial | ✅ |

---

## 7. Identity & Profile Tables

### 7.1 `profiles`

**Purpose:** safe / public profile information.

**Columns:**

- `id uuid pk`
- `user_id uuid fk auth.users unique not null`
- `username text unique nullable`
- `display_name text not null`
- `bio text nullable`
- `birth_year int nullable` (age band derived; exact DOB → `profile_private_details`)
- `age_range text nullable` (derived bucket, не raw)
- `city_id uuid fk cities nullable`
- `primary_intent text nullable`
- `profile_status profile_status not null default 'incomplete'`
- `verification_level verification_level not null default 'none'`
- `trust_tier trust_tier not null default 'new'`
- `profile_completeness int not null default 0`
- `is_private boolean not null default false`
- `onboarding_completed_at timestamptz nullable`
- `last_active_at timestamptz nullable`
- `created_at timestamptz`
- `updated_at timestamptz`
- `deleted_at timestamptz nullable`

**Sensitive notes:**

- **raw trust score не хранится здесь** — `user_trust_summary.trust_score_internal` (Инв. 3);
- **exact user location не хранится** (Инв. 9);
- **other circles / membership history** не exposed публично по дефолту (Инв. 13).

**Indexes:**

- `user_id unique`;
- `username unique`;
- `city_id`;
- `profile_status`;
- `verification_level`.

**RLS notes:**

- owner — read / update own;
- safe public profile через view (§18.1);
- admins через server-side path.

### 7.2 `profile_private_details`

**Purpose:** private / internal profile data.

**Columns:**

- `id uuid pk`
- `user_id uuid fk auth.users unique not null`
- `legal_name text nullable`
- `phone_number text nullable`
- `phone_verified_at timestamptz nullable`
- `email_verified_at timestamptz nullable`
- `date_of_birth date nullable`
- `internal_notes text nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

**Notes:**

- **highly sensitive**;
- никогда не public;
- `internal_notes` — admin only;
- owner может read limited verification status если нужно через separate view.

### 7.3 `profile_photos`

**Purpose:** profile media references.

**Columns:**

- `id uuid pk`
- `user_id uuid fk auth.users not null`
- `storage_path text not null`
- `position int not null default 0`
- `moderation_status moderation_status not null default 'pending'`
- `moderation_reason text nullable`
- `is_primary boolean not null default false`
- `created_at timestamptz`
- `updated_at timestamptz`
- `deleted_at timestamptz nullable`

**Notes:**

- unsafe photos hidden;
- moderation status влияет на visibility (только `approved` photos surface'ятся публично).

### 7.4 `interests`

**Purpose:** global interests list.

**Columns:**

- `id uuid pk`
- `name text not null unique`
- `category text nullable`
- `is_active boolean not null default true`
- `sort_order int not null default 0`
- `created_at timestamptz`
- `updated_at timestamptz`

### 7.5 `vibe_tags`

**Purpose:** vibe / atmosphere descriptors.

**Columns:**

- `id uuid pk`
- `name text not null unique`
- `description text nullable`
- `is_active boolean not null default true`
- `sort_order int not null default 0`
- `created_at timestamptz`
- `updated_at timestamptz`

**Seed examples** (curated, не free-text):

- спокойный;
- открытый;
- без давления;
- творческий;
- интеллектуальный;
- international;
- introvert-friendly;
- slow-life;
- ambitious;
- emotionally open.

**Notes:**

- avoid elitist / dating-coded labels (Core v2 §8);
- managed admin-only (seed + occasional add).

### 7.6 `user_interests`

**Purpose:** join.

**Columns:**

- `user_id uuid fk auth.users`
- `interest_id uuid fk interests`
- `created_at timestamptz`

**PK:** `(user_id, interest_id)`.

### 7.7 `user_vibe_tags`

**Purpose:** join.

**Columns:**

- `user_id uuid fk auth.users`
- `vibe_tag_id uuid fk vibe_tags`
- `created_at timestamptz`

**PK:** `(user_id, vibe_tag_id)`.

### 7.8 `cities`

**Purpose:** supported beta cities / areas.

**Columns:**

- `id uuid pk`
- `name text not null`
- `country_code text not null`
- `timezone text nullable`
- `is_beta_active boolean not null default false`
- `approximate_center_lat numeric nullable`
- `approximate_center_lng numeric nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

**Notes:**

- launch control (PRD v2 §27 #1 — first beta city);
- **no exact live user location** (Инв. 9) — города approximate center только.

---

## 8. Circle Tables

### 8.1 `circle_categories`

**Purpose:** allowed circle categories / activity surfaces.

**Columns:**

- `id uuid pk`
- `name text not null unique`
- `description text nullable`
- `icon_name text nullable`
- `is_active boolean not null default true`
- `sort_order int not null default 0`
- `created_at timestamptz`
- `updated_at timestamptz`

**Seed examples** (Core v2 §27):

- Coffee / Calm conversation;
- Walk / City exploring;
- Brunch / Slow social;
- Board games;
- Light sports;
- Creative session;
- Reading / Discussion;
- Community hangout.

**Avoid MVP categories** (Core v2 §27):

- ~~nightlife~~;
- ~~parties~~;
- ~~dating events~~;
- ~~business networking~~;
- ~~paid workshops~~;
- ~~large public events~~.

### 8.2 `circles`

**Purpose:** **primary user-facing social group object.**

**Columns:**

- `id uuid pk`
- `host_id uuid fk auth.users not null`
- `category_id uuid fk circle_categories not null`
- `city_id uuid fk cities not null`
- `title text not null`
- `description text not null`
- `vibe_summary text nullable`
- `rhythm circle_rhythm not null default 'weekly'`
- `capacity int not null`
- `comfort_composition circle_comfort_composition not null default 'open_mixed'`
- `comfort_composition_note text nullable`
- `approval_required boolean not null default true`
- `visibility circle_visibility not null default 'public'`
- `status circle_status not null default 'draft'`
- `approximate_area_text text nullable`
- `approximate_lat numeric nullable`
- `approximate_lng numeric nullable`
- `next_meeting_id uuid nullable` (derived; updated on meeting changes)
- `moderation_status moderation_status not null default 'pending'`
- `moderation_reason text nullable`
- `published_at timestamptz nullable`
- `paused_at timestamptz nullable`
- `archived_at timestamptz nullable`
- `removed_at timestamptz nullable`
- `removed_by uuid nullable`
- `removal_reason text nullable`
- `created_at timestamptz`
- `updated_at timestamptz`
- `deleted_at timestamptz nullable`

**Important (Инв. 1):**

- **exact meeting location НЕ хранится в `circles`**;
- только `approximate_area_text` + `approximate_lat/lng` (fuzzed bucket, не точка);
- discovery читает `circles` или **safe view** (§18.2);
- **никакого full member list в public circle view**;
- **no people marketplace** (Инв. 13).

**Constraints:**

- `capacity > 0`;
- `title <> ''`;
- `description <> ''`.

**Indexes:**

- `host_id`;
- `city_id`;
- `category_id`;
- `status`;
- `rhythm`;
- `comfort_composition`;
- `moderation_status`;
- composite: `(city_id, status)`, `(category_id, status)`, `(host_id, status)`.

**RLS notes:**

- onboarded users могут read safe `live` circles;
- host может manage own circles;
- admins server-side;
- **exact location идёт ТОЛЬКО из `meeting_locations`** — никогда из `circles`.

### 8.3 `circle_vibe_tags`

**Purpose:** join между `circles` и `vibe_tags`.

**Columns:**

- `circle_id uuid fk circles`
- `vibe_tag_id uuid fk vibe_tags`
- `created_at timestamptz`

**PK:** `(circle_id, vibe_tag_id)`.

### 8.4 `circle_rules`

**Purpose:** circle-specific rules and expectations.

**Columns:**

- `id uuid pk`
- `circle_id uuid fk circles unique not null`
- `rules_text text nullable`
- `safety_note text nullable`
- `attendance_expectation text nullable`
- `communication_expectation text nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

**Notes:**

- visible по circle visibility;
- copy должна избегать fear-based / bureaucratic тона (Manifesto §14, Figma Plan v2 §21).

---

## 9. Membership Request & Membership Tables

### 9.1 `circle_membership_requests`

**Purpose:** user request to enter a circle.

**Columns:**

- `id uuid pk`
- `circle_id uuid fk circles not null`
- `user_id uuid fk auth.users not null`
- `status membership_request_status not null default 'requested'`
- `intro_note text nullable`
- `host_note text nullable`
- `decided_by uuid fk auth.users nullable`
- `decided_at timestamptz nullable`
- `related_intro_meeting_id uuid fk circle_meetings nullable`
- `cancelled_at timestamptz nullable`
- `expires_at timestamptz nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

**Constraints:**

- **unique partial index** на `(circle_id, user_id)` для **active** statuses (`requested`, `approved_for_intro_meeting`, `waitlisted`) — позволяет user снова попробовать после rejection / expiry / cancellation;
- альтернатива: simple unique `(circle_id, user_id)` + soft-delete pattern (decision — Schema v2 design pass, либо §34 open).

**Indexes:**

- `circle_id`;
- `user_id`;
- `status`;
- composite: `(circle_id, status)`, `(user_id, status)`.

**RLS notes:**

- requester reads own request;
- host reads requests для own circle;
- status changes — через Edge Functions (`request_circle_place`, `approve_for_intro_meeting`, `reject_membership_request`, `waitlist_membership_request`);
- rejected / waitlisted **не могут access** meeting location / chat (Инв. 1, 2).

**Sensitive notes:**

- `intro_note` visible: requester + host + admin;
- `host_note` — internal; **никогда не public** (Инв. 12).

### 9.2 `circle_memberships`

**Purpose:** approved relationship между user и circle.

**Columns:**

- `id uuid pk`
- `circle_id uuid fk circles not null`
- `user_id uuid fk auth.users not null`
- `role member_role not null default 'member'`
- `status circle_membership_status not null default 'member'`
- `approved_request_id uuid fk circle_membership_requests nullable`
- `intro_meeting_id uuid fk circle_meetings nullable`
- `joined_at timestamptz not null default now()`
- `paused_at timestamptz nullable`
- `left_at timestamptz nullable`
- `removed_at timestamptz nullable`
- `removed_by uuid nullable`
- `removal_reason_category text nullable`
- `removal_reason_note text nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

**Constraints:**

- `unique(circle_id, user_id)` — один membership record per (user, circle); status — terminal или нет;
- альтернатива (для re-joining): partial unique на active states (open §34).

**Indexes:**

- `circle_id`;
- `user_id`;
- `role`;
- `status`;
- composite: `(circle_id, status)`, `(user_id, status)`.

**Notes (binding):**

- **leaving / pausing neutral by default** (Инв. 11, 12; US-TRUST-12);
- **removal приватно** — `removal_reason_category` internal only;
- **no public removal labels** (Инв. 12);
- **removed users теряют future access** (handled через RLS + Edge Function on transition);
- **safety removals** создают `trust_events` + `moderation_actions` + `audit_logs` записи.

### 9.3 `circle_membership_history` (**P1** — internal only)

**Purpose:** internal lifecycle change log без public exposure.

**Columns:**

- `id uuid pk`
- `circle_id uuid fk circles not null`
- `user_id uuid fk auth.users not null`
- `previous_status text nullable`
- `new_status text not null`
- `changed_by uuid nullable`
- `change_reason text nullable`
- `metadata jsonb nullable`
- `created_at timestamptz`

**Notes:**

- **admin only** (RLS deny by default; admin read only);
- **никогда не public** (Инв. 11, 12);
- полезно для audit и social friction analysis;
- **P1** unless audit требуется в P0 (open §34).

---

## 10. Meeting Tables

### 10.1 `circle_meetings`

**Purpose:** scheduled offline instances of a circle.

**Columns:**

- `id uuid pk`
- `circle_id uuid fk circles not null`
- `host_id uuid fk auth.users not null`
- `title text nullable`
- `description text nullable`
- `starts_at timestamptz not null`
- `ends_at timestamptz nullable`
- `status meeting_status not null default 'scheduled'`
- `capacity_override int nullable`
- `approximate_area_text text nullable`
- `approximate_lat numeric nullable`
- `approximate_lng numeric nullable`
- `location_reveal_policy location_reveal_policy not null default 'after_intro_approval'`
- `moderation_status moderation_status not null default 'not_required'`
- `moderation_reason text nullable`
- `cancelled_at timestamptz nullable`
- `cancelled_by uuid nullable`
- `cancellation_reason text nullable`
- `created_at timestamptz`
- `updated_at timestamptz`
- `deleted_at timestamptz nullable`

**Important (Инв. 1):**

- **exact location НЕ хранится здесь**;
- только `approximate_area_text` + approx coords (если нужно для discovery карты);
- **exact location живёт в `meeting_locations`** — отдельной table.

**Indexes:**

- `circle_id`;
- `host_id`;
- `status`;
- `starts_at`;
- composite: `(circle_id, starts_at)`, `(circle_id, status)`;
- `moderation_status`.

**Constraints:**

- `ends_at > starts_at` if `ends_at not null`.

### 10.2 `meeting_locations`

> 🔒 **Critical safety table — Инв. 1.** Самая sensitive таблица в schema.

**Purpose:** protected exact meeting location и arrival instructions.

**Columns:**

- `id uuid pk`
- `meeting_id uuid fk circle_meetings unique not null`
- `exact_location_text text nullable`
- `exact_address text nullable`
- `exact_lat numeric nullable`
- `exact_lng numeric nullable`
- `arrival_instructions text nullable`
- `host_contact_note text nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

**Critical safety notes (binding):**

- **highly sensitive** — самые охраняемые данные продукта;
- visible **только** к:
  - circle **host**;
  - **`approved_for_intro_meeting`** participant **для этой одной встречи**;
  - **active** circle **member** для **allowed** meeting (upcoming в reveal window);
  - **admin** server-side (через admin app);
- **НЕ visible** к: `requested` / `waitlisted` / `rejected` / `paused` / `left` / `removed` / `removed_for_safety` / `banned_from_circle` / `blocked` / `restricted` / `banned`;
- **НЕ включается** в notifications (push payload без exact location — Инв. 1);
- **НЕ включается** в analytics events (privacy boundary).

**Indexes:**

- `meeting_id unique`.

**RLS notes:**

- **strict RLS** keyed на: `circle_memberships.status` + `circle_membership_requests.status` + `meeting_locations.meeting_id`'s `circle_meetings.host_id`;
- access **только через secure view** (§18.4) или через Edge Function `reveal_meeting_location`;
- **service role / admin server-side only** (Инв. 12).

### 10.3 `meeting_rsvps`

**Purpose:** user RSVP для meeting.

**Columns:**

- `id uuid pk`
- `meeting_id uuid fk circle_meetings not null`
- `circle_id uuid fk circles not null`
- `user_id uuid fk auth.users not null`
- `status rsvp_status not null default 'not_responded'`
- `responded_at timestamptz nullable`
- `note text nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

**Constraints:**

- `unique(meeting_id, user_id)`.

**Indexes:**

- `meeting_id`;
- `circle_id`;
- `user_id`;
- `status`;
- composite: `(meeting_id, status)`, `(user_id, status)`.

**RLS notes:**

- user может manage own RSVP если allowed participant / member;
- host может view RSVPs для own circle;
- non-members **не могут** RSVP.

### 10.4 `meeting_attendance`

**Purpose:** attendance / no-show record.

**Columns:**

- `id uuid pk`
- `meeting_id uuid fk circle_meetings not null`
- `circle_id uuid fk circles not null`
- `user_id uuid fk auth.users not null`
- `status attendance_status not null default 'unknown'`
- `confirmed_by uuid nullable`
- `confirmed_at timestamptz nullable`
- `dispute_status text nullable`
- `note text nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

**Constraints:**

- `unique(meeting_id, user_id)`.

**Indexes:**

- `meeting_id`;
- `circle_id`;
- `user_id`;
- `status`;
- composite: `(meeting_id, status)`, `(user_id, status)`.

**Notes:**

- **no-show internal only** (Инв. 3);
- **никаких public negative labels** (Инв. 12);
- dispute flow — P1 / open §34;
- first no-show — neutral (US-INTRO-07).

---

## 11. Circle Chat Tables

### 11.1 `circle_chat_messages`

**Purpose:** messages **inside circle chat only** (Инв. 2).

**Columns:**

- `id uuid pk`
- `circle_id uuid fk circles not null`
- `meeting_id uuid fk circle_meetings nullable` (если message tagged к specific meeting)
- `sender_id uuid fk auth.users not null`
- `body text not null`
- `moderation_status moderation_status not null default 'not_required'`
- `moderation_reason text nullable`
- `is_system_message boolean not null default false`
- `system_message_type text nullable` (e.g., `lifecycle_change`, `meeting_reminder`, `host_update`)
- `reply_to_message_id uuid fk circle_chat_messages nullable`
- `created_at timestamptz`
- `updated_at timestamptz`
- `deleted_at timestamptz nullable`
- `deleted_by uuid nullable`

**Critical notes (binding):**

- **no open DMs** (Инв. 2) — никакого 1:1 channel в MVP;
- **только active members** / **allowed intro participants** могут read / write per policy;
- **reported messages** могут быть hidden (через `moderation_status`);
- **no raw message body в analytics** (privacy boundary).

**Indexes:**

- composite: `(circle_id, created_at desc)` — для chat pagination;
- composite: `(meeting_id, created_at desc)` — для meeting-tagged updates;
- `sender_id`;
- `moderation_status`;
- `deleted_at`.

**RLS notes:**

- read / write **только** для allowed users;
- non-members **не могут** read / write;
- removed / left / paused access — per policy (open §34 — intro chat access);
- admin server-side через admin app.

### 11.2 `circle_chat_states`

**Purpose:** chat status per circle.

**Columns:**

- `id uuid pk`
- `circle_id uuid fk circles unique not null`
- `is_frozen boolean not null default false`
- `frozen_by uuid nullable`
- `frozen_at timestamptz nullable`
- `freeze_reason text nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

**Notes:**

- **frozen chat** блокирует normal writes (RLS predicate denies inserts когда `is_frozen = true`);
- **admin может freeze** (Edge Function + audit);
- host freeze — open §34.

---

## 12. Safety Tables

### 12.1 `user_blocks`

**Purpose:** bilateral user-to-user blocking.

**Columns:**

- `id uuid pk`
- `blocker_id uuid fk auth.users not null`
- `blocked_id uuid fk auth.users not null`
- `reason text nullable` (optional internal)
- `created_at timestamptz`
- `deleted_at timestamptz nullable` (для unblock P1)

**Constraints:**

- `unique(blocker_id, blocked_id)`;
- `blocker_id <> blocked_id` (check constraint).

**Behavior (binding):**

- blocked user **не может request membership** в blocker's hosted circles (US-REQ-13);
- direct interaction blocked;
- same-circle block — special handling (open §34, EC-14);
- **никакого notification** blocked user'у.

**Indexes:**

- `blocker_id`;
- `blocked_id`;
- composite: `(blocker_id, blocked_id)`.

### 12.2 `reports`

**Purpose:** reports для users / circles / meetings / messages.

**Columns:**

- `id uuid pk`
- `reporter_id uuid fk auth.users not null`
- `reported_user_id uuid fk auth.users nullable`
- `reported_circle_id uuid fk circles nullable`
- `reported_meeting_id uuid fk circle_meetings nullable`
- `reported_message_id uuid fk circle_chat_messages nullable`
- `category report_category not null`
- `description text nullable`
- `status report_status not null default 'new'`
- `priority report_priority not null default 'medium'`
- `assigned_admin_id uuid nullable`
- `ai_summary text nullable` (assistive only — Инв. 5)
- `admin_resolution_note text nullable`
- `resolved_at timestamptz nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

**Constraints (check):**

- **по крайней мере один** из `reported_user_id`, `reported_circle_id`, `reported_meeting_id`, `reported_message_id` is **not null**.

**Indexes:**

- `reporter_id`;
- `reported_user_id`;
- `reported_circle_id`;
- `reported_meeting_id`;
- `reported_message_id`;
- `status`;
- `priority`;
- `created_at`.

**RLS notes:**

- user может create report;
- **reporter** может see limited own report status;
- **reported user** **НЕ может** see report details (privacy / retaliation prevention — Инв. 6);
- admin full access server-side.

### 12.3 `suspicious_activity_events`

**Purpose:** system-generated suspicious behavior flags (FLOW-023).

**Columns:**

- `id uuid pk`
- `user_id uuid fk auth.users nullable`
- `circle_id uuid fk circles nullable`
- `meeting_id uuid fk circle_meetings nullable`
- `activity_type text not null` (например: `too_many_requests`, `repeated_no_shows`, `frequent_host_removals`)
- `severity report_priority not null default 'medium'`
- `description text nullable`
- `metadata jsonb nullable`
- `reviewed_at timestamptz nullable`
- `reviewed_by uuid nullable`
- `created_at timestamptz`

**Examples:**

- too many membership requests (rate-limit threshold);
- repeated reports against same user;
- repeated no-shows by user;
- repeated host removals by host;
- comfort composition violation pattern;
- suspicious chat velocity.

**Notes:**

- **system flag only** — НЕ final enforcement (Инв. 5);
- admin review для serious actions;
- soft friction (rate-limit) может applied автоматически.

---

## 13. Moderation & Audit Tables

### 13.1 `moderation_actions`

**Purpose:** concrete admin / system moderation actions.

**Columns:**

- `id uuid pk`
- `action_type moderation_action_type not null`
- `actor_admin_id uuid nullable`
- `target_user_id uuid fk auth.users nullable`
- `target_circle_id uuid fk circles nullable`
- `target_meeting_id uuid fk circle_meetings nullable`
- `target_message_id uuid fk circle_chat_messages nullable`
- `related_report_id uuid fk reports nullable`
- `reason text not null` (REQUIRED — US-ADM-17)
- `metadata jsonb nullable`
- `created_at timestamptz`

**Important:**

- **Serious actions require reason** (US-ADM-17);
- **Каждое moderation action создаёт `audit_logs` entry** (Инв. 4);
- **AI не final actor** для serious actions (Инв. 5).

**Indexes:**

- `action_type`;
- `actor_admin_id`;
- `target_user_id`;
- `target_circle_id`;
- `target_meeting_id`;
- `related_report_id`;
- `created_at`.

### 13.2 `audit_logs`

**Purpose:** append-only audit trail для sensitive actions.

**Columns:**

- `id uuid pk`
- `actor_id uuid nullable` (admin user id, system, или anonymous)
- `actor_type text not null` (`admin`, `system`, `user`, `service_role`)
- `action text not null` (typed action key)
- `entity_type text not null` (e.g., `circle`, `meeting`, `user`, `report`, `membership`)
- `entity_id uuid nullable`
- `before_state jsonb nullable`
- `after_state jsonb nullable`
- `metadata jsonb nullable`
- `ip_address inet nullable`
- `user_agent text nullable`
- `created_at timestamptz`

**Notes:**

- **append-only-ish** (DB-level no update / delete policy);
- **admin / system only**;
- sensitive values redacted (exact location → `[REDACTED]`, raw trust score never logged);
- **failed audit write блокирует action** (US-SAFE-14 EC).

**Indexes:**

- `actor_id`;
- `actor_type`;
- composite: `(entity_type, entity_id)`;
- `action`;
- `created_at`.

---

## 14. Trust Tables

### 14.1 `trust_events`

**Purpose:** **append-only internal trust signal events.**

**Columns:**

- `id uuid pk`
- `user_id uuid fk auth.users not null`
- `event_type trust_event_type not null`
- `weight numeric not null default 0`
- `source text not null` (`system_lifecycle`, `host_action`, `admin_action`, `ai_assist`)
- `related_circle_id uuid fk circles nullable`
- `related_meeting_id uuid fk circle_meetings nullable`
- `related_report_id uuid fk reports nullable`
- `metadata jsonb nullable`
- `created_at timestamptz`

**Notes (binding):**

- **internal only** (Инв. 3 — never user-visible);
- used для derive `user_trust_summary.trust_score_internal` и `trust_tier`;
- **`circle_left` и `circle_paused` events — neutral by default** (Инв. 11, 12; US-TRUST-12);
- **append-only** — DB-level no update / delete;
- **никогда не показывать пользователю содержание `trust_events`** через любой API / view.

**Indexes:**

- `user_id`;
- `event_type`;
- `related_circle_id`;
- `related_meeting_id`;
- `created_at`.

### 14.2 `user_trust_summary`

> 🔒 **Critical sensitive table — Инв. 3.** Raw trust score живёт здесь и **никогда** не exposed user'у.

**Purpose:** internal derived trust summary.

**Columns:**

- `user_id uuid pk fk auth.users`
- `trust_score_internal numeric not null default 0` ← **NEVER public** (Инв. 3)
- `trust_tier trust_tier not null default 'new'`
- `attended_meetings_count int not null default 0`
- `hosted_circles_count int not null default 0`
- `hosted_meetings_count int not null default 0`
- `no_show_count int not null default 0` ← **internal** (Инв. 3, 12)
- `report_count int not null default 0` ← **internal**
- `block_count int not null default 0` ← **internal**
- `last_trust_event_at timestamptz nullable`
- `updated_at timestamptz`

**Critical notes (binding):**

- **`trust_score_internal` никогда не exposed** user'у через любой API / view (Инв. 3);
- **counts** (`no_show_count`, `report_count`, `block_count`) — **internal** (Инв. 10, 12);
- **no public negative labels** (Инв. 10, 12);
- **no public ratings** (Hard rule 5);
- public surface'ы — **только soft badges** через computed view (Проверен / Reliable / Hosted / Attended).

**RLS notes:**

- **system / admin only**;
- **никакой direct read** для regular user — даже own.

---

## 15. Beta & Access Tables

### 15.1 `invite_codes`

**Purpose:** invite-only beta access.

**Columns:**

- `id uuid pk`
- `code text unique not null`
- `status invite_code_status not null default 'active'`
- `created_by uuid nullable` (admin who issued)
- `assigned_to_email text nullable` (optional pre-assignment)
- `used_by uuid fk auth.users nullable`
- `used_at timestamptz nullable`
- `expires_at timestamptz nullable`
- `max_uses int not null default 1`
- `use_count int not null default 0`
- `metadata jsonb nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

**Indexes:**

- `code unique`;
- `status`;
- `used_by`.

### 15.2 `waitlist_entries`

**Purpose:** users waiting для beta access.

**Columns:**

- `id uuid pk`
- `email text not null`
- `city_id uuid fk cities nullable`
- `name text nullable`
- `source text nullable`
- `status text not null default 'new'`
- `invited_at timestamptz nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

**Indexes:**

- `email`;
- `city_id`;
- `status`;
- `created_at`.

---

## 16. Notifications Tables

### 16.1 `notifications`

**Purpose:** in-app notifications.

**Columns:**

- `id uuid pk`
- `user_id uuid fk auth.users not null`
- `type notification_type not null`
- `title text not null`
- `body text not null`
- `related_circle_id uuid fk circles nullable`
- `related_meeting_id uuid fk circle_meetings nullable`
- `related_membership_request_id uuid fk circle_membership_requests nullable`
- `related_report_id uuid fk reports nullable`
- `read_at timestamptz nullable`
- `metadata jsonb nullable`
- `created_at timestamptz`

**Privacy notes (binding):**

- **no exact location в notification body** для non-approved users (Инв. 1);
- sensitive details fetched **из authorized screen**, не из push payload;
- **no report description** в notification text;
- **no transition notifications других user'ов** (Инв. 11 — no betrayal mechanics).

**Indexes:**

- composite: `(user_id, created_at desc)`;
- composite: `(user_id, read_at)`;
- `type`.

### 16.2 `push_tokens`

**Purpose:** device push tokens.

**Columns:**

- `id uuid pk`
- `user_id uuid fk auth.users not null`
- `token text not null`
- `platform text not null` (`ios`, `android`, `web`)
- `is_active boolean not null default true`
- `last_used_at timestamptz nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

**Constraints:**

- `unique(token)`.

**Indexes:**

- `user_id`;
- `is_active`.

---

## 17. Feature Flags Tables

### 17.1 `feature_flags`

**Purpose:** feature flag registry (если не fully handled by PostHog позже).

**Columns:**

- `id uuid pk`
- `key text unique not null`
- `description text nullable`
- `status feature_flag_status not null default 'inactive'`
- `rollout_percentage int nullable`
- `metadata jsonb nullable`
- `created_at timestamptz`
- `updated_at timestamptz`

### 17.2 `feature_flag_exposures`

**Purpose:** track feature exposure.

**Columns:**

- `id uuid pk`
- `user_id uuid fk auth.users nullable`
- `flag_key text not null`
- `variant text nullable`
- `exposed_at timestamptz not null default now()`
- `metadata jsonb nullable`

**Indexes:**

- `user_id`;
- `flag_key`;
- `exposed_at`.

---

## 18. Public / Safe Views v2

> **Без final SQL.** Это описание views для discovery / safe-profile / authorized location reveal.

### 18.1 `public_profiles_view`

**Purpose:** safe profile fields для отображения другим users.

**Fields:**

- `user_id`;
- `display_name`;
- `bio`;
- `city_id`;
- `primary_intent`;
- `verification_level`;
- safe badge-derived field (computed из `user_trust_summary.trust_tier`);
- approved primary photo reference (через `profile_photos` where `moderation_status = 'approved'` and `is_primary = true`);
- safe vibe / interests если allowed.

**Must NOT include (Инв. 3, 13):**

- ~~phone~~;
- ~~email~~;
- ~~DOB~~;
- ~~legal name~~;
- ~~`trust_score_internal`~~;
- ~~`report_count`~~;
- ~~`block_count`~~;
- ~~`no_show_count`~~;
- ~~internal notes~~;
- ~~other circles user belongs to~~ (default).

### 18.2 `public_circles_view`

**Purpose:** safe circle discovery data.

**Fields:**

- `circle_id`;
- `host_id`;
- `category_id`;
- `city_id`;
- `title`;
- `description`;
- `vibe_summary` (или joined vibe_tags);
- `rhythm`;
- `capacity`;
- `approximate_area_text`;
- `approximate_lat / lng` (если fuzzed достаточно — open §34);
- `comfort_composition`;
- `approval_required`;
- `status` (filtered: `live` only);
- `moderation_status` (filtered: `approved` / `not_required`);
- `next_meeting_starts_at` (опционально, **без exact location**);
- `member_count_bucket` (NOT raw count — §22).

**Must NOT include (Инв. 1, 3, 13):**

- ~~exact_location~~;
- ~~exact_address~~;
- ~~full member list~~;
- ~~internal safety signals~~;
- ~~raw trust scores~~;
- ~~private host / admin notes~~;
- ~~`removed_for_safety` circles~~.

### 18.3 `member_circle_details_view`

**Purpose:** member-safe circle details (после approval).

**May include:**

- member-safe profiles других участников (через `public_profiles_view` join);
- upcoming meetings (approx fields);
- **allowed** meeting details (per access policy);
- circle chat availability flag.

**Must NOT include:**

- ~~raw trust score~~;
- ~~report / block counts~~;
- ~~internal moderation notes~~;
- ~~other circles other members belong to~~ (Инв. 13).

### 18.4 `approved_meeting_details_view`

**Purpose:** expose exact meeting location **только authorized users**.

**May include:**

- **exact location** (`meeting_locations.exact_location_text` + `exact_address` + `exact_lat/lng`);
- arrival instructions;
- RSVP state для requesting user;
- meeting details.

**Access (CRITICAL):**

- **circle host** (своего circle);
- **`approved_for_intro_meeting`** user **для этой одной встречи** (scoped predicate);
- **active circle member** (`status = 'member'`) для **allowed** (upcoming в reveal window) meeting;
- **admin** server-side.

**Critical:**

- protected by RLS predicate **или** secure function (preferred);
- **НЕ available** к `requested` / `waitlisted` / `rejected` / `paused` / `left` / `removed` users;
- accessed через Edge Function `reveal_meeting_location` (Architecture v2 §8.3 P0).

---

## 19. Relationship Map v2

### 19.1 Textual map

```
auth.users
  → profiles (1:1)
  → profile_private_details (1:1)
  → profile_photos (1:N)
  → user_interests (N:M with interests)
  → user_vibe_tags (N:M with vibe_tags)
  → push_tokens (1:N)
  → notifications (1:N)

auth.users (as host)
  → circles (1:N)
  → circle_rules (через circle_id, 1:1 per circle)
  → circle_vibe_tags (N:M)
  → circle_chat_states (1:1 per circle)

circles
  → circle_membership_requests (1:N)
  → circle_memberships (1:N)
  → circle_meetings (1:N)
  → circle_chat_messages (1:N)

circle_meetings
  → meeting_locations (1:1)
  → meeting_rsvps (1:N)
  → meeting_attendance (1:N)
  → circle_chat_messages (через meeting_id, optional tag)

auth.users
  → user_blocks as blocker (1:N) / blocked (1:N)
  → reports as reporter (1:N)
  → trust_events (1:N)
  → user_trust_summary (1:1)

reports
  → moderation_actions (1:N via related_report_id)

moderation_actions
  → audit_logs (1:1 mandatory)

invite_codes
  → auth.users (1:1 via used_by)

waitlist_entries
  → cities (N:1 optional)
```

### 19.2 High-level ERD (textual, не Mermaid — keeps doc lean)

**Core circle-meeting hierarchy:**

```
Host (User)
  └─ owns ─→ Circle ─ has ─→ CircleRules
                  ├─ scheduled ─→ CircleMeeting ─ protected ─→ MeetingLocation
                  │                          ├─ tracked ─→ MeetingRSVP
                  │                          └─ tracked ─→ MeetingAttendance
                  ├─ received ─→ CircleMembershipRequest
                  ├─ approved ─→ CircleMembership
                  └─ contains ─→ CircleChatMessage (scoped к meeting опционально)
```

**Safety / moderation:**

```
User ─ files ─→ Report ─ resolved by ─→ Admin (ModerationAction)
                              └─ creates ─→ AuditLog (mandatory)
```

**Trust:**

```
System / Edge Function ─ appends ─→ TrustEvent
                                      └─ derives ─→ UserTrustSummary (admin-only)
                                                         └─ surface ─→ Soft badges (через public_profiles_view)
```

---

## 20. Access Sensitivity Matrix v2

| Table | Public User | Owner | Circle Host | Intro Approved | Circle Member | Admin | Sensitive Fields |
|---|:--:|:--:|:--:|:--:|:--:|:--:|---|
| `profiles` | safe view | full | n/a | n/a | n/a | full | — |
| `profile_private_details` | ❌ | self (limited) | ❌ | ❌ | ❌ | full | phone, DOB, legal_name, internal_notes |
| `profile_photos` | approved only | full | n/a | n/a | n/a | full | moderation_reason |
| `circles` | safe view (live) | n/a | full (own) | safe + intro | safe + member | full | moderation_reason, removal_reason |
| `circle_membership_requests` | ❌ | self only | full (own circle) | own only | n/a | full | intro_note (limited), host_note (admin) |
| `circle_memberships` | ❌ | self own | full (own circle) | n/a | self own + safe member list | full | removal_reason_note |
| `circle_meetings` | safe view (approx) | n/a | full (own) | scoped to one | safe + upcoming | full | description (sometimes) |
| **`meeting_locations`** | ❌ | ❌ | ✅ (own circle) | ✅ scoped к одной | ✅ allowed upcoming | full server-side | **exact_location_text, exact_address, exact_lat/lng, arrival_instructions** |
| `meeting_rsvps` | ❌ | self own | full (own circle) | self own | own + members per policy | full | note |
| `meeting_attendance` | ❌ | self own | full (own circle) | self own | self own | full | no_show (Инв. 3) |
| `circle_chat_messages` | ❌ | n/a | full (own circle) | per policy (meeting-context) | full (member) | full | body |
| `reports` | ❌ | reporter limited | ❌ | ❌ | ❌ | full | description, ai_summary |
| `user_blocks` | ❌ | self own | ❌ | ❌ | ❌ | full | reason |
| `trust_events` | ❌ | ❌ | ❌ | ❌ | ❌ | full | event_type, weight |
| **`user_trust_summary`** | ❌ | ❌ (self badge derived only) | ❌ | ❌ | ❌ | full | **trust_score_internal, all counts** |
| `moderation_actions` | ❌ | ❌ | ❌ | ❌ | ❌ | full | reason, metadata |
| `audit_logs` | ❌ | ❌ | ❌ | ❌ | ❌ | full | before_state, after_state |

> **Cells marked ❌** означают что user / role **не имеет access** через прямые SELECT — даже через RLS. Где applicable, access идёт через **secure views** (§18) или **Edge Functions**.

---

## 21. Meeting Location Privacy Schema Design

**Критический раздел.** Это materialization Architecture v2 §11 в schema design.

### 21.1 Design rules

- **Exact location separated** в `meeting_locations` (отдельной table, не columns на `circle_meetings`);
- **Circle discovery** использует **approximate fields only** (`approximate_area_text`, `approximate_lat/lng`);
- **`membership_request_status` и `circle_membership_status` control location access** через RLS predicates;
- **`approved_for_intro_meeting` reads только для одной meeting** (RLS scoped к `meeting_locations.meeting_id IN (SELECT related_intro_meeting_id FROM circle_membership_requests WHERE user_id = auth.uid() AND status = 'approved_for_intro_meeting')`);
- **`member` reads allowed upcoming meeting locations** (через `circle_memberships` + reveal window);
- **Removed / paused / left users теряют future access** immediately (RLS denies на status change);
- **Rejected / waitlisted / requested не могут read `meeting_locations`** — predicate fails;
- **Notifications и analytics никогда не store exact location** (schema-level prohibition + observability alerts).

### 21.2 Schema access matrix

| User State | `circles` safe fields | `circle_meetings` approx fields | `meeting_locations` | `circle_chat_messages` |
|---|:--:|:--:|:--:|:--:|
| `guest` | ❌ | ❌ | ❌ | ❌ |
| `authenticated_not_onboarded` | ❌ | ❌ | ❌ | ❌ |
| `onboarded_not_requested` | ✅ safe view | ✅ approx | ❌ | ❌ |
| `requested` | ✅ | ✅ approx | ❌ | ❌ |
| `waitlisted` | ✅ | ✅ approx | ❌ | ❌ |
| `rejected` | ✅ | ✅ approx | ❌ | ❌ |
| **`approved_for_intro_meeting`** | ✅ | ✅ approx | **✅ ТОЛЬКО для одной meeting** | per policy (open §34) |
| `intro_attended` | ✅ | ✅ approx | scoped post-window | per policy |
| **`member`** | ✅ | ✅ | **✅ upcoming allowed** | ✅ full |
| `paused` | ✅ | ✅ approx | ❌ | per policy (read-only / muted) |
| `left` | ✅ if discovery | ✅ approx | ❌ | ❌ |
| `removed` | per policy | per policy | ❌ | ❌ |
| `blocked` | ❌ (круги блокировщика) | ❌ | ❌ | ❌ |
| `restricted` | per policy | per policy | per policy | per policy |
| `banned` | ❌ (auth gate) | ❌ | ❌ | ❌ |
| **`host`** (own circle) | ✅ admin own | ✅ all | **✅ all meetings own circle** | ✅ |
| **`admin`** | full (admin app) | full (admin app) | full server-side | full (admin app) |

> **Эта матрица — direct input для [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md) v2.** Точные RLS predicates пишутся там.

---

## 22. Composition Visibility Schema Design

### 22.1 Design rules

- **Composition не = full member list**;
- **Before request**: show **aggregate / bucket data** (size band, comfort composition label, host safe profile);
- **After request (pending)**: status + расширенный circle context, **ещё нет** full member list;
- **After approval / member**: show **safe member profiles** через `member_circle_details_view`;
- **Никаких private / internal data** в любом view;
- **Никаких other circles** other members belong to (Инв. 13).

### 22.2 Possible derived fields

- `member_count_bucket` (e.g., `'4-6'`, `'7-10'`, `'11+'`) — НЕ raw `member_count`;
- `comfort_composition` (enum) — surfaced as label, not analytical breakdown;
- `member_visibility_policy` (P1 — host-configured timing);
- `host_safe_profile` (computed view).

### 22.3 Warning

> **Не создавать people marketplace через schema / views.** Любой view, который позволяет SELECT'ить browsable list of users с фильтрами по vibe / interests / location без circle context — **отклоняется** (Инв. 13).

---

## 23. Indexing Plan v2

### 23.1 Circle discovery indexes

- `circles(city_id, status)`;
- `circles(category_id, status)`;
- `circles(rhythm)`;
- `circles(comfort_composition)`;
- `circles(moderation_status)`;
- `circles(host_id)`.

### 23.2 Membership indexes

- `circle_membership_requests(circle_id, status)`;
- `circle_membership_requests(user_id, status)`;
- `circle_membership_requests(circle_id, user_id)`;
- `circle_memberships(circle_id, status)`;
- `circle_memberships(user_id, status)`;
- `circle_memberships(circle_id, user_id) unique`.

### 23.3 Meeting indexes

- `circle_meetings(circle_id, starts_at)`;
- `circle_meetings(status)`;
- `meeting_rsvps(meeting_id, status)`;
- `meeting_rsvps(user_id, status)`;
- `meeting_attendance(meeting_id, status)`;
- `meeting_attendance(user_id, status)`.

### 23.4 Chat indexes

- `circle_chat_messages(circle_id, created_at desc)`;
- `circle_chat_messages(meeting_id, created_at desc)`;
- `circle_chat_messages(sender_id)`;
- `circle_chat_messages(moderation_status)`.

### 23.5 Safety indexes

- `reports(status, priority)`;
- `reports(reported_user_id)`;
- `reports(reported_circle_id)`;
- `reports(reported_meeting_id)`;
- `reports(reported_message_id)`;
- `user_blocks(blocker_id, blocked_id)`.

### 23.6 Trust indexes

- `trust_events(user_id, created_at desc)`;
- `trust_events(event_type)`;
- `trust_events(related_circle_id)`;
- `trust_events(related_meeting_id)`.

### 23.7 Admin indexes

- `moderation_actions(target_user_id)`;
- `moderation_actions(target_circle_id)`;
- `moderation_actions(target_meeting_id)`;
- `audit_logs(entity_type, entity_id)`;
- `audit_logs(created_at)`.

---

## 24. Constraints & Data Integrity

### 24.1 DB-level constraints

- **One profile per auth user** — `profiles.user_id unique`;
- **Unique active membership request** per (circle, user) — partial unique index OR simple unique + cancellation pattern (decision §34);
- **Unique membership** per (circle, user) — `circle_memberships(circle_id, user_id) unique`;
- **Unique RSVP** per (meeting, user) — `meeting_rsvps(meeting_id, user_id) unique`;
- **Unique attendance** per (meeting, user) — `meeting_attendance(meeting_id, user_id) unique`;
- **Cannot block self** — check `blocker_id <> blocked_id`;
- **Capacity > 0** — check `circles.capacity > 0`;
- **Meeting ends_at > starts_at** if `ends_at not null` — check constraint;
- **Report must target at least one entity** — check constraint;
- **No `meeting_location` без meeting** — FK enforced;
- **No `circle_meeting` без circle** — FK enforced;
- **No `circle_chat_message` без circle и sender** — FK enforced.

### 24.2 Business-logic-level (Edge Functions enforced)

- **`approved_for_intro_meeting` должен reference intro meeting** (`circle_membership_requests.related_intro_meeting_id IS NOT NULL` при status transition);
- **Removed / left users теряют future access** — handled через RLS predicates на status check;
- **No public member list before approval** — enforced через views (`public_circles_view` excludes member data);
- **Moderation action requires reason** — `reason text not null` + Edge Function rejects empty;
- **Audit log mandatory** для каждого moderation action — Edge Function pattern (см. Architecture v2 §19.2).

---

## 25. Lifecycle Data Rules

### 25.1 Circle status transitions

```
draft → pending_review / live
pending_review → live / removed_for_safety
live → paused / full / archived / removed_for_safety
full → live (если capacity opens)
paused → live / archived
any → removed_for_safety (admin only)
```

### 25.2 Membership request transitions

```
requested → approved_for_intro_meeting / rejected / waitlisted / cancelled_by_user / expired
waitlisted → approved_for_intro_meeting / rejected / cancelled_by_user
rejected → terminal (если new request policy не allows — §34)
expired → terminal
cancelled_by_user → terminal
```

### 25.3 Membership transitions

```
(none) → member (после approval + intro flow)
member → paused / left / removed / removed_for_safety / banned_from_circle
paused → member / left
left → terminal (re-request через новый flow)
removed / removed_for_safety → terminal для этого membership record (admin restore может create new record)
banned_from_circle → terminal
```

### 25.4 Meeting transitions

```
scheduled → starting_soon / in_progress / cancelled / removed_for_safety
starting_soon → in_progress / cancelled / removed_for_safety
in_progress → completed
completed → attendance / no_show processing (creates trust_events + meeting_attendance)
cancelled → terminal (RSVPs voided)
removed_for_safety → terminal (audit logged)
```

### 25.5 Transition side-effects

| Transition | Notifications | Audit logs | Trust events | Membership records | Location / chat access |
|---|---|---|---|---|---|
| Circle `draft → live` | host gets confirmation | yes | none | none | circle discoverable |
| Circle `live → removed_for_safety` | members get neutral copy | **yes (Инв. 4)** | host signal | memberships frozen | location revoked, chat frozen |
| Request `requested → approved_for_intro_meeting` | user gets intro invitation | optional | positive intro signal | n/a (membership created on intro confirmation) | location accessible for ONE meeting |
| Request `requested → rejected` | user gets soft copy | optional | neutral | n/a | none |
| Membership `member → removed` | removed user gets private copy | yes | host-accountability signal | record updated | future access revoked |
| Membership `member → paused` | quiet | yes | **neutral** (Инв. 11) | record updated | per policy |
| Meeting `scheduled → cancelled` | members get cancel notification | yes | **no negative trust** | n/a | RSVPs voided, location withdrawn |

---

## 26. Derived Data & Counters

| Derived field | Source table | Update mechanism | P0/P1 | Visible to users? |
|---|---|---|:--:|:--:|
| `profile_completeness` | `profiles` (self) | Edge Function on profile update | P0 | self only (band, not number) |
| `circle_member_count` | derived from `circle_memberships` | view aggregation or trigger | P0 | bucketed only |
| `circle_member_count_bucket` | derived from above | view computed | P0 | yes (bucket) |
| `pending_request_count` | derived from `circle_membership_requests` | view | P0 | host only |
| `next_meeting_id` | derived from `circle_meetings` | trigger or view | P0 | yes (через safe view) |
| `attended_meetings_count` | `user_trust_summary` | Edge Function `update_attendance` | P0 | **NO** (internal — Инв. 3) |
| `hosted_circles_count` | `user_trust_summary` | trigger on `circles.host_id` insert | P0 | yes (через badge derivation) |
| `hosted_meetings_count` | `user_trust_summary` | trigger | P0 | yes (badge) |
| `no_show_count` | `user_trust_summary` | Edge Function `handle_no_show` | P0 | **NO** (Инв. 3, 12) |
| `report_count` | `user_trust_summary` | trigger on `reports.reported_user_id` | P0 | **NO** |
| `block_count` | `user_trust_summary` | trigger on `user_blocks.blocked_id` | P0 | **NO** |
| **`trust_score_internal`** | `user_trust_summary` | Edge Function recompute on each `trust_event` | P0 | **NEVER** (Инв. 3) |
| `trust_tier` | `user_trust_summary` | derived from score | P0 | yes (только tier name, badge only) |

**Important (binding):**

- **raw trust score не visible** (Инв. 3);
- **report / block / no-show counts** не public (Инв. 10, 12);
- **`member_count` bucketed** для public view (не raw) — избегаем people marketplace feel (Инв. 13).

---

## 27. Storage Buckets & DB References

### 27.1 `profile-photos`

- **Stored**: `profile_photos.storage_path`;
- **Upload**: owner only;
- **Moderation**: required (AI assistive — Инв. 5);
- **Signed URLs preferred** (short-lived);
- **Cleanup**: on `profile_photos.deleted_at` → background job removes from storage.

### 27.2 `circle-media` (P1)

- circle cover / media (host-uploaded);
- moderation required;
- **не needed для P0** unless design требует.

### 27.3 `moderation-attachments` (P1)

- report attachments;
- **admin-only**.

### 27.4 Rules

- **DB stores `storage_path`** (relative key), не URL;
- **media access protected** через signed URLs + bucket policies;
- **unsafe media hidden** (UI checks `moderation_status`);
- **cleanup on deletion** обязателен (background job).

---

## 28. Seed Data Plan v2

Для local / staging environments:

### 28.1 Reference data

- **cities** — Moscow, SPb, Lisbon, Tbilisi (test);
- **interests** — coffee, walks, books, board games, light sports, creative, community;
- **vibe_tags** — спокойный, открытый, без давления, творческий, интеллектуальный, international, introvert-friendly, slow-life, ambitious, emotionally open;
- **circle_categories** — Coffee / Calm conversation, Walk / City exploring, Brunch / Slow social, Board games, Light sports, Creative session, Reading / Discussion, Community hangout.

### 28.2 Test users

- onboarded user (basic);
- host (creates circle);
- member (joined active circle);
- requested user (pending);
- waitlisted user;
- rejected user;
- intro approved user;
- paused member;
- removed member;
- admin (admin app);
- banned user.

### 28.3 Sample circles

- live circle (open, accepting);
- full circle (capacity reached, waitlist optional);
- pending_review circle (host first-time);
- paused circle;
- removed_for_safety circle (admin removed).

### 28.4 Sample meetings

- upcoming meeting (next 7 days);
- intro meeting (для approved_for_intro);
- completed meeting (with attendance recorded);
- cancelled meeting.

### 28.5 Sample records

- sample membership requests across statuses;
- sample chat messages (member + system);
- sample reports (across categories);
- sample trust events;
- sample invite codes (active, used, expired, revoked).

### 28.6 Important

- **No real personal data** (seed users — fake emails, no real phones);
- **No production secrets**;
- **Seed must test location privacy** — seed `meeting_locations` для intro / member access scenarios.

---

## 29. Analytics Data Boundary

**Never send (binding):**

- ~~`exact_location_text`~~;
- ~~`exact_address`~~;
- ~~`exact_lat / exact_lng`~~;
- ~~`arrival_instructions`~~;
- ~~raw message body~~ (`circle_chat_messages.body`);
- ~~`intro_note`~~;
- ~~`host_note`~~;
- ~~report description~~ (`reports.description`);
- ~~moderation notes~~ (`reports.admin_resolution_note`, `moderation_actions.reason`);
- ~~`trust_score_internal`~~ (Инв. 3);
- ~~phone / email / DOB~~;
- ~~private profile data~~ (`profile_private_details.*`).

**Allowed:**

- IDs (UUIDs);
- `city_id`;
- `category_id`;
- status values (enums);
- `rhythm`;
- `comfort_composition` как enum;
- counts / buckets (без personal-tie);
- funnel steps (US-AN-01…17);
- non-sensitive error codes.

> **Schema-level enforcement** — analytics tables / event schemas validate'ятся на отсутствие sensitive columns. Observability alerts fire если sensitive field попадает в analytics payload.

---

## 30. RLS Preparation Notes v2

> **Без policies (это [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) v2's job).** Expected behavior — input для RLS v2.

### 30.1 Profiles

- owner own;
- safe public profile через view (§18.1);
- private details restricted.

### 30.2 Circles

- onboarded users read safe `live` circles;
- host manages own;
- unsafe / removed hidden из discovery;
- **no exact location** в circles table.

### 30.3 Membership Requests

- requester reads own;
- host reads requests для own circle;
- status changes через Edge Function (not direct UPDATE).

### 30.4 Memberships

- member reads own membership;
- host reads circle memberships;
- member visibility limited через `member_circle_details_view`;
- **no public removal history** (Инв. 12).

### 30.5 Meetings

- safe approximate meeting info visible per circle state;
- exact location separated в `meeting_locations`.

### 30.6 Meeting Locations (CRITICAL)

Access **только** к:

- circle **host**;
- **`approved_for_intro_meeting`** participant для **этой одной meeting**;
- active **`member`** для **allowed** meeting;
- **admin** server-side.

### 30.7 Circle Chat

- allowed members / participants only;
- frozen chat blocks writes (RLS predicate на `circle_chat_states.is_frozen`).

### 30.8 Reports

- create by users;
- reporter reads limited own status;
- admin full access;
- **reported user no access**.

### 30.9 Trust

- **internal only** — `trust_events` и `user_trust_summary.trust_score_internal` admin / system only.

### 30.10 Admin

- **server-side only** (Инв. 12);
- **service role никогда client**.

---

## 31. Migration Planning Notes v2

Recommended migration **order** (когда implementation gate'ы пройдены):

1. **Enable extensions** (uuid-ossp / pgcrypto если нужно);
2. **Create enums** (§5);
3. **Create base reference tables:**
   - `cities`;
   - `interests`;
   - `vibe_tags`;
   - `circle_categories`;
4. **Create profile tables:**
   - `profiles`;
   - `profile_private_details`;
   - `profile_photos`;
   - `user_interests` (join);
   - `user_vibe_tags` (join);
5. **Create circle tables:**
   - `circles`;
   - `circle_vibe_tags` (join);
   - `circle_rules`;
6. **Create membership requests:** `circle_membership_requests`;
7. **Create memberships:** `circle_memberships` (+ optional `circle_membership_history` P1);
8. **Create meetings:** `circle_meetings`;
9. **Create `meeting_locations`** (separately, after circle_meetings exists);
10. **Create RSVP and attendance:** `meeting_rsvps`, `meeting_attendance`;
11. **Create circle chat tables:** `circle_chat_messages`, `circle_chat_states`;
12. **Create safety tables:** `user_blocks`, `reports`, `suspicious_activity_events`;
13. **Create moderation / audit tables:** `moderation_actions`, `audit_logs`;
14. **Create trust tables:** `trust_events`, `user_trust_summary`;
15. **Create beta / invite tables:** `invite_codes`, `waitlist_entries`;
16. **Create notifications:** `notifications`, `push_tokens`;
17. **Create feature flags:** `feature_flags`, `feature_flag_exposures`;
18. **Create indexes** (§23);
19. **Create views** (§18);
20. **Enable RLS** на всех exposed таблицах;
21. **Add policies** (per [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) v2);
22. **Seed data** (§28);
23. **RLS tests** (Architecture v2 §28.3 — 15 binding tests).

> **Important:** **No actual migrations now.** [`/supabase/migrations/`](../supabase/migrations/) остаётся empty до Sprint 2 implementation gate.

---

## 32. Testing Requirements for Schema v2

Checklist для validation после implementation (binding):

- [ ] User может have one profile (unique constraint);
- [ ] Circle **не хранит** exact location (column-level audit);
- [ ] Meeting exact location stored **separately** (separate table check);
- [ ] One active membership request per (user, circle);
- [ ] One membership per (user, circle);
- [ ] **Requested user не может access location** (RLS test);
- [ ] **Waitlisted user не может access location**;
- [ ] **Rejected user не может access location**;
- [ ] **Intro-approved user accesses только эту meeting location**;
- [ ] **Member accesses allowed meeting location**;
- [ ] **Removed user теряет future access** immediately;
- [ ] **Non-member не может access circle chat**;
- [ ] **Blocked user не может request membership** в blocker's circles;
- [ ] **Report must target something** (check constraint);
- [ ] **Moderation action requires reason** (not null);
- [ ] **Trust score не public** (column-level access audit);
- [ ] **No public removal / rejection history** (no public view exposes);
- [ ] **No public member list before approval** (safe view excludes member data).

---

## 33. Schema Risks v2

| Risk | Impact | Mitigation |
|---|---|---|
| **Old event-first schema leaks** в implementation | medium | CLAUDE.md §8, §12 vocabulary rules; review gate; superseded marker в этом документе |
| **Exact location stored в `circles`** | **critical** (Инв. 1) | separated `meeting_locations`; column-level audit; observability alert |
| **Meeting location exposed через public view** | **critical** (Инв. 1) | `public_circles_view` schema review; SQL linting на forbidden columns; RLS test |
| **Member list exposed too early** | high (§22) | `public_circles_view` excludes member data; integration test |
| **Raw trust score exposed** | **critical** (Инв. 3) | `user_trust_summary` admin-only RLS; `public_profiles_view` excludes; column-level audit |
| **Chat access too broad** | high (Инв. 2) | RLS + Realtime channel auth; "non-member disconnect" integration test |
| **Membership status inconsistency** | high | atomic Edge Function transitions; integration tests на every status pair |
| **Intro approval grants too much access** | high | scoped RLS predicate `meeting_id = related_intro_meeting_id`; integration test |
| **Removed member retains access** | **critical** | RLS predicate denies на status change; Realtime auto-disconnect; integration test |
| **Host abuse не tracked** | medium | host-accountability internal signal через `trust_events` + `suspicious_activity_events` |
| **Removal / rejection history становится public** | high (Инв. 12) | `circle_membership_history` admin-only; no public view exposes; review |
| **Analytics stores sensitive data** | **critical** | §29 binding rules; schema validation; observability alerts |
| **Schema too complex для MVP** | medium | Hybrid Accept (doc 26) keeps operational model close; MVP minimalism (Manifesto §19) |
| **Comfort composition mishandled** | high | enum + gated validation (Core v2 §21); women-only / female-friendly не implement'ятся без validation |

---

## 34. Open Schema Questions v2

1. **PostGIS vs numeric lat/lng** — для approximate area. PostGIS даёт правильный geo-distance, но добавляет dependency. Для MVP — numeric + Haversine на app level может быть достаточно.
2. **Intro-approved access to circle chat or meeting-only thread?** — open question Flows v2 §14 #4, Stories v2 §11 #14.
3. **Full member list visibility timing** — до intro / после intro / после первой встречи? (PRD v2 §27 #8).
4. **How to model comfort composition** — enum (predefined) vs flexible (host-defined text)? Сейчас — enum + nullable note.
5. **Women-only validation requirements** — copy, expectations, legal review (Core v2 §21).
6. **`member_count` exact vs bucket** в public view — bucketed предотвращает marketplace feel; exact полезен hosts. Likely: bucket public, exact admin.
7. **Host removal reason categories** — какие требуют admin review? (PRD v2 §27 #9).
8. **Pause access rules** — TTL? может ли paused RSVP? (PRD v2 §27 #10).
9. **Return-from-pause flow** — simple resume vs host re-approval? (Stories v2 §11 #10).
10. **No-show dispute** — есть ли? как? (Stories v2 §11 #12).
11. **Reported message snapshot policy** — для deleted messages, для deleted users (Stories v2 EC-20, EC-24).
12. **Retention** — reports / audit logs / chat? (Architecture v2 §30).
13. **`circle_membership_history` — P0 или P1?** — depends на нужно ли admin'у real-time view изменений в P0 или это late nice-to-have.
14. **Co-host (`member_role = 'cohost'`) — P0 или future?** (US-P1-08).
15. **`circle-media` bucket — P0 или P1?** (depends на Figma design).
16. **`circle_visibility = 'unlisted' / 'private'` — P0 или later?** (доступ через invite link only).

---

## 35. Summary

**Schema v2:**

- **Поддерживает circle-first model** — `circles` как primary user-facing entity, `circle_meetings` как scheduled instances.
- **Exact meeting location protected separately** в `meeting_locations` (Инв. 1) — самая sensitive table в schema.
- **Membership controls location / chat access** через RLS keyed на `circle_memberships.status` и `circle_membership_requests.status`.
- **Trust остаётся internal** — `trust_events` append-only + `user_trust_summary.trust_score_internal` admin-only (Инв. 3).
- **Safety / moderation / audit — core**, не add-on (Инв. 4, 6).
- **No migrations или SQL created** — это blueprint;
- **No RLS policies created** — это [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) v2's job.
- **Open questions** (§34) explicit'но перечислены — не silently decided.

**Next required document:**

> Update [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md) to **Security / RLS v2** ([doc 27 §24 Phase C step 8](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)).

RLS v2 materializes:

- §11 location access matrix → точные RLS predicates на `meeting_locations`;
- §20 access sensitivity matrix → policies per table;
- §22 composition visibility rules → view-level policies;
- §30 RLS preparation notes → full policy SQL design (без SQL — design only).

После RLS v2 → Sprint Backlog v2 → Sprint 2 phase gate (doc 22) → **Sprint 2 product implementation может начаться.**

---

> Reminder: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2) — **first source of truth**. Этот документ ему и Architecture v2 подчинён. Любой schema change, нарушающий §21 (location matrix), §22 (composition), §29 (analytics boundary), §33 risks, или §20 access matrix — **отклоняется на review**. Никаких migrations / SQL до §31 implementation gate'ов.
