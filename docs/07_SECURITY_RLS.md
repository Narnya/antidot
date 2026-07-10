# Security & RLS v2 — Antidot

> **Status:** v2 (security blueprint для closed beta, circle-first).
> **Owner:** Technical / Security
> **Last updated:** 2026-05-31
> **First source of truth:** [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2).
> **Architecture source:** [`/docs/05_ARCHITECTURE.md`](05_ARCHITECTURE.md) (Architecture v2).
> **Schema source:** [`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) (Database Schema v2).
> **Supersedes:** Security & RLS v1 (event-first, 2026-05-18).
> **Sequenced by:** [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md) §24 Phase C step 8.

> ⚠️ Это **security / RLS blueprint document only**. **Никакого SQL не написано.** Реальные RLS policies, миграции и database code создаются **позже** (Sprint 2+) после approval этого blueprint'а.

---

## 1. Source of Truth

- **Product Core v2** ([`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md)) — first source of truth.
- **Database Schema v2** ([`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md)) — current schema blueprint.
- **Architecture v2** ([`/docs/05_ARCHITECTURE.md`](05_ARCHITECTURE.md)) §24 (security invariants) и §25 (RLS overview) — input.
- Security / RLS v2 следует **HYBRID ACCEPT** ([`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md)).
- **User-facing primitive** — Circle.
- **Operational primitive** — Meeting.
- **Старая event-first RLS-модель superseded.**
- Этот документ — guide для future Supabase RLS policies, Edge Function guards и security tests.
- **Actual SQL policies и migrations создаются позже** — не в этом документе.

---

## 2. Security Goals v2

1. **Защитить exact meeting location** (Инв. 1) — strict RLS на `meeting_locations`.
2. **Защитить private profile data** — separation `profiles` / `profile_private_details`.
3. **Circle Chat только для approved members / allowed intro participants** (Инв. 2).
4. **Prevent open DMs** (Инв. 2) — никакого 1:1 messaging в MVP.
5. **Prevent people marketplace behavior** (Инв. 13) — views не expose browsable user catalog.
6. **Защитить raw trust score** (Инв. 3) — `user_trust_summary.trust_score_internal` admin-only.
7. **Защитить reports, moderation actions и audit logs** — admin-only RLS.
8. **Prevent access blocked / banned / restricted users** (Инв. 6) — gates на RLS уровне.
9. **Prevent public leave / removal / rejection labels** (Инв. 12).
10. **Prevent betrayal mechanics** (Инв. 11) — никаких public transition records.
11. **Keep service role server-side only** (Инв. 12).
12. **RLS-first backend security** — клиент не доверенный source-of-truth.
13. **Make sensitive actions auditable** (Инв. 4).
14. **Prevent privacy leaks** через notifications, analytics и cache.

---

## 3. Security Non-Goals

MVP **не поддерживает**:

- enterprise SSO;
- complex organization permissions (RBAC за пределы host / member / admin);
- payments / ticket security;
- open DMs (Инв. 2);
- people marketplace privacy (нет такого product surface — Инв. 13);
- public follower graph;
- dating match privacy;
- live location sharing (Инв. 9);
- large marketplace seller verification;
- advanced fraud ML;
- complex identity verification workflows (KYC за пределы phone verification).

---

## 4. Threat Model v2

### 4.1 Meeting Location Privacy Threats

**Threats:**

- `requested` user пытается read exact meeting location;
- `waitlisted` / `rejected` user пытается read `meeting_locations`;
- `approved_for_intro_meeting` user пытается read future meetings beyond the one intro;
- removed / paused / left member пытается access future location;
- notification body leaks exact meeting location;
- analytics event получает exact location;
- public circle view случайно включает exact address;
- cache на client persists exact location после status change.

**Mitigation principles (Инв. 1):**

- **Separate `meeting_locations` table** с RLS predicates keyed на `circle_memberships.status` + `circle_membership_requests.status`;
- access **только через secure view** ([`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) §18.4) или Edge Function `reveal_meeting_location`;
- notification payload validated на forbidden columns at send time;
- analytics schema validates на отсутствие sensitive columns;
- client cache invalidation on `circle_memberships.status` change (через Realtime push).

### 4.2 Circle Access Threats

**Threats:**

- non-member читает Circle Chat;
- `paused` / `left` / `removed` member retains chat / location access;
- blocked user запрашивает membership в blocker's hosted circles;
- banned user продолжает interact с product;
- user scrapes member list через discovery views;
- user uses circle discovery как people marketplace (Инв. 13).

**Mitigation principles (Инв. 2, 6, 13):**

- RLS на `circle_chat_messages` keyed на active `circle_memberships.status = 'member'`;
- `circle_membership_status` change → immediate access revocation (RLS denies; Realtime auto-disconnect);
- `user_blocks` enforced at Edge Function `request_circle_place`;
- banned auth gate (US-AUTH-08) forces sign-out;
- `public_circles_view` excludes member list;
- никакой view не возвращает browsable user catalog.

### 4.3 Social Abuse Threats

**Threats:**

- harassment в circle chat;
- host abuses membership approval / removal (Инв. 8);
- member reports host;
- user creates unsafe circle;
- repeated no-shows by user;
- comfort composition violation (Core v2 §21);
- fake profile requests membership.

**Mitigation principles (Инв. 4, 5, 6, 8):**

- report system covers user / circle / meeting / message (Инв. 6);
- moderation queue with AI assistive triage (Инв. 5);
- host accountability internal signal через `suspicious_activity_events` + `trust_events`;
- host actions audited (Инв. 4);
- AI moderation на profile / circle text — assistive only (Инв. 5);
- comfort composition violation detection через AI + admin review.

### 4.4 Data Privacy Threats

**Threats:**

- private profile fields exposed через JOIN / view;
- raw trust score exposed через API;
- report details visible reported user;
- moderation notes visible normal users;
- other circles exposed как public social graph (Инв. 13);
- service role leaked в client bundle (Инв. 12).

**Mitigation principles (Инв. 3, 6, 12, 13):**

- separation `profile_private_details` admin-only RLS;
- `user_trust_summary` admin / system only — `trust_score_internal` never returned to public APIs;
- `reports.description` — reporter + admin only; reported user never sees;
- internal admin notes в separate columns / metadata;
- никакой view не cross-joins user → circle list для других users;
- CI check на `process.env.SUPABASE_SERVICE_ROLE_KEY` в client bundles.

### 4.5 Public Shame / Social Harm Threats

**Threats:**

- user removal становится public (видно другим участникам круга);
- rejection state visible to other participants;
- "left for another circle" visible (Инв. 11);
- no-show label public (Инв. 12);
- betrayal mechanics emerge как side-effect;
- host ranking / approval создаёт dating-like anxiety.

**Mitigation principles (Инв. 11, 12):**

- `circle_membership_history` admin-only — никакой public exposure;
- no notification к other members on transitions;
- `circle_chat_states` показывает at most «состав обновился» (нейтральный copy);
- soft-reject / removal copy validated на non-stigmatizing language (Core v2 §19, §20);
- approval framed как fit protection в UI (CLAUDE.md §11; Manifesto §9).

### 4.6 Admin / Internal Threats

**Threats:**

- admin action без audit log;
- excessive admin access (one admin reads everything);
- service role misuse;
- AI false positive causing unfair enforcement;
- moderation notes leaked.

**Mitigation principles (Инв. 4, 5, 12):**

- `moderation_actions` requires reason (DB constraint `reason text not null`);
- audit log mandatory — failed audit write blocks action;
- service role только server-side; CI check;
- AI assistive only — admin override required для serious actions (Инв. 5);
- admin notes в separate fields, never в public views.

---

## 5. Security Principles v2

1. **RLS first** — клиент не trusted;
2. **Deny by default** — explicit ALLOW policies, не implicit;
3. **Least privilege** — minimal access per role;
4. **Separate sensitive data** — `meeting_locations`, `profile_private_details`, `user_trust_summary`, `trust_events`, `moderation_actions`, `audit_logs` — отдельные tables;
5. **Exact meeting location в protected table only** (Инв. 1);
6. **Service role никогда не exposed client** (Инв. 12);
7. **Admin access server-side only**;
8. **Sensitive operations через Edge Functions** — not direct INSERT / UPDATE / DELETE из client;
9. **Client validation не trusted** — server-side checks обязательны;
10. **Every moderation-sensitive action создаёт audit log** (Инв. 4);
11. **AI moderation advisory only** (Инв. 5);
12. **Avoid sensitive data в analytics** (privacy boundary);
13. **Avoid sensitive data в push notifications** (Инв. 1 — no exact location в push);
14. **Refetch sensitive access после status changes** — клиент не trusted с stale cache;
15. **No people marketplace** (Инв. 13);
16. **No public shame** (Инв. 12);
17. **No betrayal mechanics** (Инв. 11);
18. **Test security invariants before beta** — 15 binding RLS tests ([Architecture v2 §28.3](05_ARCHITECTURE.md)).

---

## 6. Auth & Role Model v2

### 6.1 `guest`

- не authenticated;
- **нет** circle access;
- может signup / login / waitlist / invite.

### 6.2 `authenticated_not_onboarded`

- authenticated;
- onboarding only;
- **нет** Circle Discovery;
- **нет** membership requests;
- **нет** chat.

### 6.3 `onboarded_user`

- может discover safe circles;
- может view safe public profiles (через `public_profiles_view`);
- может request a place если requirements met (verification / not blocked / not banned);
- может report / block.

### 6.4 `phone_verified_user`

- может быть required перед requesting a place или approval (timing — open [§35 #1](#35-open-security-questions-v2)).

### 6.5 `circle_requester`

- состояние: request `requested` или `waitlisted`;
- может read own request;
- **не может** see exact location;
- **не может** read Circle Chat.

### 6.6 `approved_for_intro_meeting`

- approved для одной specific intro meeting;
- может see exact location **только для этой одной meeting**;
- chat access — per policy (open §35 #3).

### 6.7 `circle_member`

- active membership (`circle_memberships.status = 'member'`);
- может access Circle Chat;
- может access allowed upcoming meeting locations;
- может RSVP.

### 6.8 `circle_host`

- manages own circles (`circles.host_id = auth.uid()`);
- reviews membership requests;
- manages meetings;
- может access exact locations для own meetings.

### 6.9 `paused_member`

- `circle_memberships.status = 'paused'`;
- access / write restrictions per policy (open §35 #8);
- **no public shame** (Инв. 12).

### 6.10 `left_member`

- `circle_memberships.status = 'left'`;
- loses future access;
- **no public label** (Инв. 12).

### 6.11 `removed_member`

- `circle_memberships.status = 'removed'` / `removed_for_safety`;
- participation ended;
- loses future access;
- **no public shame** (Инв. 12).

### 6.12 `restricted_user`

- `profiles.profile_status = 'restricted'`;
- limited actions per moderation policy.

### 6.13 `banned_user`

- `profiles.profile_status = 'banned'`;
- **не может** interact;
- auth gate forces sign-out (US-AUTH-08).

### 6.14 `admin_moderator`

- web admin dashboard **only**;
- server-side permissions через service role;
- может review reports и take actions.

### 6.15 `system`

- scheduled jobs, Edge Functions, AI moderation signals;
- **не final judge** для serious enforcement (Инв. 5).

---

## 7. Global Access Gates v2

### 7.1 Beta Invite Gate

- user **без invite** не может enter full app;
- enforced на onboarding flow + Edge Function `validate_invite_code`.

### 7.2 Auth Gate

- protected screens require active session;
- middleware redirects guest → Login / Welcome.

### 7.3 Onboarding Gate

- `authenticated_not_onboarded` **не может** access Circle Discovery / My Circles / Circle Chat;
- enforced на app navigation + RLS policies (deny если `profiles.profile_status = 'incomplete'`).

### 7.4 Verification Gate

- phone verification **может** be required перед request или approval;
- exact timing — open §35 #1;
- enforced в Edge Function `request_circle_place`.

### 7.5 Membership Gate

- meeting location access keyed на `circle_memberships.status` или `circle_membership_requests.status`;
- Circle Chat access keyed на same;
- enforced на RLS policies на `meeting_locations` / `circle_chat_messages` + Realtime channel auth.

### 7.6 Restriction Gate

- `restricted_user` блокирован from: requesting place, hosting, chatting, uploading;
- enforced в Edge Functions + RLS denies для writes.

### 7.7 Ban Gate

- `banned_user` не может interact;
- auth check на каждом request → force sign-out;
- RLS denies для всех writes;
- read access denied across board.

### 7.8 Moderation Gate

- flagged circles / messages / photos могут быть hidden или pending review;
- enforced через `moderation_status` filter в views.

---

## 8. RLS Strategy Overview v2

**State:**

- **Enable RLS на всех exposed tables;**
- никогда не rely **только** на client logic;
- mobile app использует user JWT (RLS context = `auth.uid()`);
- **Service role только** в secure server-side Edge Functions / admin app;
- **safe data exposed через views** где possible (separates raw schema от public surface);
- **exact meeting location protected** через table separation + view + Edge Function;
- **membership status controls** meeting location и chat access;
- **admin data никогда exposed mobile client**;
- **sensitive writes через Edge Functions** (single-purpose, transactional).

### 8.1 Table access pattern overview

| Area | Direct Client Access? | Edge Function Required? | RLS Critical? | Notes |
|---|:--:|:--:|:--:|---|
| `profiles` (read) | ✅ через `public_profiles_view` | ❌ (read) / ✅ (insert) | ✅ | own full, others safe |
| `profile_private_details` | ❌ | ✅ для updates | ✅✅ | admin / self limited |
| `profile_photos` | ✅ read approved / self full | ✅ для uploads (moderation) | ✅ | unsafe hidden |
| `circles` (read) | ✅ через `public_circles_view` | ✅ для create / publish / pause | ✅ | live + safe view |
| `circle_membership_requests` | ✅ read own / host queue | ✅ для submit / decide | ✅ | rate-limited |
| `circle_memberships` | ✅ read own / member context | ✅ для transitions | ✅ | status-driven |
| `circle_meetings` | ✅ safe summary | ✅ для schedule / cancel | ✅ | approx only direct |
| **`meeting_locations`** | **❌ direct** | **✅ через `reveal_meeting_location` или secure view** | **✅✅✅ CRITICAL** | **Инв. 1** |
| `meeting_rsvps` | ✅ own + host context | ✅ для update | ✅ | — |
| `meeting_attendance` | ✅ own / host writes | ✅ для confirm / no_show | ✅ | no-show internal |
| `circle_chat_messages` | ✅ members read; send через Edge | ✅ (`send_circle_chat_message` для AI assist) | ✅✅ | Инв. 2 |
| `circle_chat_states` | ✅ read | ✅ admin freeze | ✅ | — |
| `reports` | ❌ read | ✅ через `report_content` | ✅✅ | privacy critical |
| `user_blocks` | ✅ own | ✅ через `block_user` | ✅ | bilateral |
| `trust_events` | ❌ | ✅ system / admin only | ✅✅ | Инв. 3 |
| **`user_trust_summary`** | **❌** | **✅ system / admin only** | **✅✅✅ CRITICAL** | **Инв. 3** |
| `moderation_actions` | ❌ | ✅ admin only | ✅✅ | Инв. 4 |
| `audit_logs` | ❌ | ✅ system / admin only | ✅✅ | append-only |
| `invite_codes` | ❌ | ✅ через `validate_invite_code` | ✅✅ | admin manages |
| `notifications` | ✅ read own; mark read | ✅ system inserts | ✅ | privacy notes |
| Storage (`profile-photos`) | ✅ own upload; read approved | ✅ moderation | ✅ | signed URLs |

---

## 9. Table Access Matrix v2

| Table | Guest | Own User | Other User | Circle Host | Intro Approved | Circle Member | Admin | System | Notes |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|---|
| `profiles` | ❌ | R/U (own) | R safe view | n/a | n/a | n/a | R/U full | R/I (system) | safe view excludes private |
| `profile_private_details` | ❌ | R (limited fields) / U через function | ❌ | ❌ | ❌ | ❌ | R/U full | R/I (system) | phone, DOB, internal_notes admin-only |
| `profile_photos` | ❌ | R/I/U/D own | R approved only | n/a | n/a | n/a | R/U/D full | I (moderation) | unsafe hidden |
| `interests` | R | R | R | R | R | R | R/I/U | R/I | reference data |
| `vibe_tags` | R | R | R | R | R | R | R/I/U | R/I | reference data |
| `cities` | R | R | R | R | R | R | R/I/U | R/I | reference data |
| `circle_categories` | R | R | R | R | R | R | R/I/U | R/I | reference data |
| `circles` | ❌ | n/a | R safe (live only) | R/U own full | R safe | R safe + member | R/U full | I/U (lifecycle) | removed_for_safety hidden |
| `circle_vibe_tags` | ❌ | n/a | R if circle visible | R/I/U/D own | R | R | full | I | join |
| `circle_rules` | ❌ | n/a | R if circle visible | R/U own | R | R | full | n/a | non-fear-based tone |
| `circle_membership_requests` | ❌ | R/I/U (own cancel) | ❌ | R/U (own circle) | R (own) | n/a | R/U full | I/U via Edge Function | host_note internal |
| `circle_memberships` | ❌ | R (own own) | ❌ | R (own circle) | n/a | R (safe member list) | R/U full | I/U via Edge Function | removal_reason internal |
| `circle_meetings` | ❌ | n/a | R safe (if circle visible) | R/U (own circle) | R (intro scoped) | R (member upcoming) | R/U full | I/U (lifecycle) | exact location NOT here |
| **`meeting_locations`** | ❌ | ❌ | ❌ | **R (own circle)** | **R scoped к одной meeting** | **R upcoming allowed** | **R/U server-side** | I/U via Edge Function | **Инв. 1 — strict** |
| `meeting_rsvps` | ❌ | R/I/U own | ❌ | R (own circle) | I/U own (intro meeting) | R/I/U own + read circle | full | I/U via Edge Function | — |
| `meeting_attendance` | ❌ | R own | ❌ | R/U (own circle) | R own (intro) | R own | full | I via Edge Function | no_show internal |
| `circle_chat_messages` | ❌ | R own | ❌ | R/I/U full (own circle) | R (per policy — open §35 #3) | R/I full | R/U (moderation) | I (system messages) | Инв. 2 |
| `circle_chat_states` | ❌ | n/a | R if circle visible | R own | R | R | R/U | n/a | freeze admin |
| `user_blocks` | ❌ | R/I/U own (as blocker) | ❌ | ❌ | ❌ | ❌ | R/U full | n/a | bilateral |
| `reports` | ❌ | R limited own status (as reporter) | ❌ | ❌ | ❌ | ❌ | R/U full | I via Edge Function | reported user NEVER reads |
| `suspicious_activity_events` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | R/U | I/U (system) | internal triage |
| `moderation_actions` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | R/I/U | I via Edge Function | Инв. 4 |
| `audit_logs` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | R only | I via Edge Function | append-only |
| `trust_events` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | R | I via Edge Function | Инв. 3 |
| **`user_trust_summary`** | ❌ | ❌ (badge derivation only via view) | ❌ | ❌ | ❌ | ❌ | **R/U** | I/U (system) | **`trust_score_internal` NEVER** |
| `invite_codes` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | R/I/U | I/U via Edge Function | admin manages |
| `waitlist_entries` | I (own email) | n/a | ❌ | ❌ | ❌ | ❌ | R/U | I via Edge Function | minimal PII |
| `notifications` | ❌ | R own; U read_at own | ❌ | ❌ | ❌ | ❌ | full | I (system) | privacy notes |
| `push_tokens` | ❌ | R/I/U own | ❌ | ❌ | ❌ | ❌ | full | n/a | — |
| `feature_flags` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | R/I/U | R | server-driven |
| `feature_flag_exposures` | ❌ | R own | ❌ | ❌ | ❌ | ❌ | R/U | I (system) | — |

**Legend:** R = read; I = insert; U = update; D = delete / soft delete.

---

## 10. Profile Security

### 10.1 `profiles`

**Policies (natural language):**

- **SELECT** — owner может read own row; other onboarded users могут read через `public_profiles_view` (safe subset); admins server-side читают full.
- **INSERT** — через Edge Function `complete_onboarding` (atomic transition); auth.uid() = user_id only.
- **UPDATE** — owner может update allowed editable fields (display_name, bio, photos refs); status / verification_level / trust_tier обновляются **только через Edge Functions** / system.
- **DELETE** — soft delete через `deleted_at`; admin only через `delete_account` flow.

**Forbidden writes от owner:**

- `profile_status`, `verification_level`, `trust_tier`, `profile_completeness` — system / admin only.

### 10.2 `profile_private_details`

**Policies:**

- **SELECT** — owner may read **limited verification status** (phone_verified_at, email_verified_at); admin server-side reads full.
- **INSERT** — via Edge Function `complete_onboarding` (or admin).
- **UPDATE** — phone change via verification flow (Edge Function); admin updates `internal_notes`.
- **DELETE** — admin only (data retention policy).

**Forbidden:**

- Any direct read of `legal_name`, `date_of_birth`, `internal_notes` от non-admin.

### 10.3 `profile_photos`

**Policies:**

- **SELECT** — owner reads own; others read photos где `moderation_status = 'approved'`;
- **INSERT** — owner uploads; AI moderation triggers async (Инв. 5);
- **UPDATE** — owner manages position / `is_primary`; moderation status updated by system / admin;
- **DELETE** — owner soft delete own; storage cleanup background job.

### 10.4 `public_profiles_view`

**Excludes (binding):**

- ~~phone~~;
- ~~email~~;
- ~~legal_name~~;
- ~~date_of_birth~~;
- ~~`trust_score_internal`~~ (Инв. 3);
- ~~`report_count` / `block_count` / `no_show_count`~~ (Инв. 10, 12);
- ~~internal notes~~;
- ~~other circles user belongs to~~ (default — Инв. 13).

### 10.5 Profile privacy checklist

- [ ] `public_profiles_view` test: SELECT-able by all onboarded users; **никогда** не contains private columns;
- [ ] `profile_private_details` SELECT denied для non-owner non-admin;
- [ ] `profile_photos` filter на `moderation_status` для non-owner reads;
- [ ] Raw `trust_score_internal` test: any SELECT path → admin / system check;
- [ ] Owner cannot UPDATE `profile_status` / `trust_tier`;
- [ ] Other circles list never appears в `public_profiles_view`.

---

## 11. Circle Security

### 11.1 `circles`

**Policies:**

- **SELECT** — `guest` denied; `authenticated_not_onboarded` denied (gate §7.3); `onboarded_user` reads через `public_circles_view` where `status = 'live'` and `moderation_status IN ('approved', 'not_required')`; host reads own circles all states; admin full.
- **INSERT** — via Edge Function `create_circle`; auth.uid() = host_id only; rate-limited (host can't create N circles per day — see §27).
- **UPDATE** — via Edge Function `update_circle`; host on own; admin full.
- **DELETE** — via Edge Function `archive_circle` (soft); admin only для hard delete.

### 11.2 `circle_rules`

**Policies:**

- **SELECT** — visible according to circle visibility (если circle SELECT-able);
- **INSERT / UPDATE** — host of circle через Edge Function;
- AI moderation triggers async.

### 11.3 `public_circles_view`

**Excludes (binding — Инв. 1, 3, 13):**

- ~~exact_location~~ (никогда не было в `circles`, но double-check);
- ~~exact_address~~;
- ~~full member list~~;
- ~~internal safety signals~~ (host accountability scores, suspicious flags);
- ~~raw trust scores~~ (host's trust_score_internal);
- ~~private host / admin notes~~;
- ~~`removed_for_safety` circles~~.

### 11.4 Circle status implications

| Circle Status | Normal User Visibility | Host Permissions | Admin Permissions |
|---|---|---|---|
| `draft` | invisible | full edit / publish / delete | read |
| `pending_review` | invisible | edit; cannot publish | review / approve / reject |
| `live` | visible через `public_circles_view` (safe) | full manage | full |
| `paused` | invisible | unpause / archive / soft edit | full |
| `full` | visible с «full» state; CTA disabled / waitlist | full | full |
| `archived` | invisible (history для members) | no actions | read history |
| `removed_for_safety` | invisible | no actions; members notified neutrally | full + audit obligation (Инв. 4) |

---

## 12. Membership Request Security

### 12.1 Rules

- **Only onboarded users** могут request (gate §7.3);
- Verification / profile completeness gates могут apply (open §35 #1);
- **User cannot request если blocked by host** (`user_blocks` check via Edge Function);
- **Banned / restricted users cannot request** (gates §7.6, §7.7);
- **One active request per (user, circle)** (DB constraint — partial unique on active statuses);
- **Requester reads own request**;
- **Host reads requests для own circle**;
- **Status changes через Edge Functions** (`approve_for_intro_meeting`, `reject_membership_request`, `waitlist_membership_request`);
- **Rejected / waitlisted / requested users do not get location / chat / full member list**.

### 12.2 Sensitive fields

- `intro_note` — visible: requester + host + admin.
- `host_note` — visible: **host + admin only** (Инв. 12 — non-public).
- `decision_metadata` — host + admin only.

### 12.3 Membership request privacy checklist

- [ ] Requester SELECT denied для requests where `user_id <> auth.uid()`;
- [ ] Host SELECT denied для requests where target circle's `host_id <> auth.uid()`;
- [ ] Blocked user INSERT test: blocker is host → Edge Function rejects;
- [ ] Banned user INSERT test: gate blocks at auth layer;
- [ ] Duplicate active request test: second INSERT fails on unique constraint;
- [ ] Rejected user cannot read `meeting_locations` (FLOW-022 / §15);
- [ ] `host_note` test: requester SELECT does not return host_note column;
- [ ] Status updates only via Edge Function (direct UPDATE denied).

---

## 13. Circle Membership Security

### 13.1 Rules

- **Membership record grants circle-level access**;
- **Active member** (`status = 'member'`) может access Circle Chat (RLS predicate);
- **Active member** может access allowed meeting locations (через `meeting_locations` policy);
- **Paused / left / removed** lose future access per policy (open §35 #7);
- **`removed_for_safety` / `banned_from_circle`** cannot access;
- **Host может manage memberships** через validated Edge Functions (`pause_membership`, `leave_circle`, `remove_circle_member`);
- **Member list visibility staged** через `member_circle_details_view`;
- **No public leave / removal / rejection history** (Инв. 11, 12).

### 13.2 Critical

- **Circle membership not public status by default** — `public_profiles_view` does not list other user's memberships (Инв. 13).
- **Users may belong to multiple circles** (Инв. 16) — no exclusivity check.
- **No betrayal mechanics** (Инв. 11) — leaving one circle to join another generates **no signal** to abandoned circle.
- **No public transition history** — `circle_membership_history` (if exists, P1) is admin-only.

### 13.3 Membership privacy checklist

- [ ] `removed` member SELECT denied на `circle_chat_messages` для that circle;
- [ ] `paused` member access per policy (test both — read-only and full block);
- [ ] `left` member: members list refresh excludes; other members do not get notification;
- [ ] `member_circle_details_view` test: returns only safe profiles, no raw trust score;
- [ ] Cross-circle test: member of circle A cannot see member list of circle B unless also member of B;
- [ ] Removal reason categories internal: `removal_reason_category` not visible на public read paths.

---

## 14. Meeting Security

### 14.1 `circle_meetings`

**Policies:**

- **SELECT** — safe meeting summary visible per circle visibility (excludes exact location); host reads own circle meetings full; admin full.
- **INSERT** — via Edge Function `schedule_circle_meeting`; host of circle only.
- **UPDATE** — via Edge Function; host of circle.
- **DELETE / cancel** — via Edge Function `cancel_meeting`; host + admin; RSVPs voided atomically.

### 14.2 `meeting_locations` (CRITICAL — Инв. 1)

**Policies (binding):**

- **SELECT — deny-by-default;**
- **Allow SELECT only when** (`auth.uid()` matches one of):
  - **Host:** `EXISTS (SELECT 1 FROM circle_meetings JOIN circles ON ... WHERE meeting_id = $1 AND host_id = auth.uid())`;
  - **`approved_for_intro_meeting` participant:** `EXISTS (SELECT 1 FROM circle_membership_requests WHERE user_id = auth.uid() AND status = 'approved_for_intro_meeting' AND related_intro_meeting_id = $1)`;
  - **Active `member`:** `EXISTS (SELECT 1 FROM circle_memberships JOIN circle_meetings ON ... WHERE meeting_id = $1 AND user_id = auth.uid() AND circle_memberships.status = 'member' AND circle_meetings.status IN ('scheduled', 'starting_soon', 'in_progress', 'completed' within reveal window))`;
  - **Admin:** server-side через service role only.
- **INSERT** — via Edge Function `schedule_circle_meeting`; host of circle.
- **UPDATE** — via Edge Function; host of circle.
- **DELETE** — cascade with meeting; admin only direct.

### 14.3 `meeting_rsvps`

**Policies:**

- **SELECT** — own RSVP all; host reads RSVPs для own circle meetings; member reads RSVPs of own circle meetings per policy (open §35 — may need to limit member visibility).
- **INSERT / UPDATE** — via Edge Function `update_meeting_rsvp`; allowed participants / members only.
- **DELETE** — soft via Edge Function.

### 14.4 `meeting_attendance`

**Policies:**

- **SELECT** — own; host reads own circle meetings full; admin full;
- **INSERT / UPDATE** — host через Edge Function `update_attendance`; or system auto-mark;
- **`no_show` flag** — internal only; никогда not surfaced to other users (Инв. 3, 12).

---

## 15. Meeting Location Privacy Security

**Критический раздел.** Это materialization Schema v2 §21 и Architecture v2 §11 в RLS-policy intent.

### 15.1 State × Access Matrix

| User / Circle State | Can see circle card | Can see approximate area | Can read `meeting_locations` | Can access circle chat | Notes |
|---|:--:|:--:|:--:|:--:|---|
| `guest` | ❌ | ❌ | ❌ | ❌ | landing only |
| `authenticated_not_onboarded` | ❌ | ❌ | ❌ | ❌ | onboarding required |
| `onboarded_not_requested` | ✅ safe view | ✅ | ❌ | ❌ | aggregated only |
| `requested` | ✅ | ✅ | ❌ | ❌ | non-stigmatizing pending |
| `waitlisted` | ✅ | ✅ | ❌ | ❌ | soft state |
| `rejected` | ✅ | ✅ | ❌ | ❌ | «Не в этот раз» |
| **`approved_for_intro_meeting`** | ✅ | ✅ | **✅ ТОЛЬКО для одной meeting (scoped)** | meeting-context (per policy, open §35 #3) | scoped reveal |
| `intro_attended` | ✅ | ✅ | scoped post-window | per policy | pre-conversion |
| **`member`** | ✅ | ✅ | **✅ upcoming allowed** | ✅ full | belonging mode |
| `paused` | ✅ | ✅ | ❌ | per policy (open §35 #8) | quiet |
| `left` | ✅ if discovery | ✅ | ❌ | ❌ | re-request via new flow |
| `removed` | per policy | per policy | ❌ | ❌ | appeal flow (P1) |
| `removed_for_safety` | safety screen | ❌ | ❌ | ❌ | audit logged |
| `blocked` (by host) | ❌ круги блокировщика | ❌ | ❌ | ❌ | bilateral |
| `restricted` | per policy | per policy | per policy | per policy | bounded actions |
| `banned` | ❌ (auth gate) | ❌ | ❌ | ❌ | force sign-out |
| **`host`** (own circle) | ✅ admin own | ✅ | ✅ all meetings own circle | ✅ | host scope |
| **`admin`** | ✅ через admin app | ✅ | ✅ через admin app server-side | ✅ через admin app | Инв. 12 |

### 15.2 Security test cases (binding — RLS test suite)

- [ ] **requested user не может query `meeting_locations`** (any meeting any circle) → expect 0 rows;
- [ ] **waitlisted user не может query `meeting_locations`** → expect 0 rows;
- [ ] **rejected user не может query `meeting_locations`** → expect 0 rows;
- [ ] **`approved_for_intro_meeting` user может query только approved intro meeting location** → expect 1 row, only that meeting_id;
- [ ] **`approved_for_intro_meeting` user не может query future meeting location** того же circle → expect 0 rows for other meetings;
- [ ] **`member` может query allowed upcoming meeting location** → expect rows for upcoming;
- [ ] **`member` не может query unrelated circle meeting location** → expect 0 rows for other circles;
- [ ] **`removed` member loses future location access** immediately (test transition + SELECT) → expect 0 rows;
- [ ] **notification body не includes exact location** before approved access → push payload validation test;
- [ ] **analytics никогда не includes exact location** → schema validation test.

---

## 16. Composition Visibility Security

### 16.1 Rules

**Before request:**

- Aggregate composition only (size band, comfort label, host snippet);
- **No full member list**;
- **No safe member profiles** (except host).

**After request (pending / waitlisted / rejected):**

- Request status + circle context;
- **Still no full member list.**

**After approval / member:**

- Safe member profiles per policy (через `member_circle_details_view`);
- **No private / internal data**.

### 16.2 Never expose (binding)

- ~~raw `trust_score_internal`~~ (Инв. 3);
- ~~`report_count` / `block_count` / `no_show_count`~~ (Инв. 10, 12);
- ~~removal history~~;
- ~~rejection history~~;
- ~~other circles by default~~ (Инв. 13);
- ~~internal moderation notes~~ (Инв. 4 admin-only).

### 16.3 Security concern

> **Не создавать people marketplace через member list или profile views** (Инв. 13). Любой view, который позволяет browsing users без circle context — **отклоняется** на schema / RLS review.

---

## 17. Circle Chat Security

### 17.1 Rules

- **No open DMs** (Инв. 2);
- **Chat exists only in circle context** — никаких 1:1 channels;
- **Active members** могут read / write;
- **Allowed intro participants** могут access limited chat only **если product decision allows** (open §35 #3);
- **`requested` / `waitlisted` / `rejected`** не могут read / write;
- **`paused` / `left` / `removed`** не могут read / write per policy (open §35 #7, #8);
- **Banned / restricted users** не могут write;
- **Frozen chat blocks normal writes** (`circle_chat_states.is_frozen = true` → RLS denies INSERT);
- **Reported messages → moderation queue** (`moderation_status` flagged);
- **Deleted messages могут remain в moderation context** if policy allows (snapshot retained — Инв. 4).

### 17.2 Chat security test cases (binding)

- [ ] **Non-member не может read chat** → SELECT returns 0 rows;
- [ ] **`requested` user не может read chat** → 0 rows;
- [ ] **`rejected` user не может read chat** → 0 rows;
- [ ] **Member может read own circle chat** → returns rows;
- [ ] **Member не может read unrelated circle chat** → 0 rows for other circles;
- [ ] **`removed` member loses chat access** (test transition) → 0 rows;
- [ ] **Frozen chat blocks writes** → INSERT denied when `circle_chat_states.is_frozen = true`;
- [ ] **Message report creates `reports` entry** → check report row + moderation queue;
- [ ] **Realtime subscription test:** `removed` member channel disconnected within X seconds.

---

## 18. Block Security

### 18.1 Rules

- **User может block another user**;
- **Cannot block self** (check constraint `blocker_id <> blocked_id`);
- **Block does not notify blocked user** (privacy — Инв. 6);
- **Blocked user не может request blocker's hosted circles** (Edge Function check);
- **Blocked user не может directly interact**;
- **Если both users в same circle** — group context handled carefully (open §35 #5);
- **Block inside same circle** may require report / host / admin review.

### 18.2 Edge cases

| Edge case | Expected behavior |
|---|---|
| User blocks host **after** request submitted | Pending request auto-cancelled silently; host queue refreshes; host видит «request withdrawn» |
| Host blocks requester | Pending request auto-cancelled; user sees graceful "circle no longer accepting requests" or generic state |
| Two members в same circle block each other | Bilateral message hiding в chat (UI breadcrumb «сообщение скрыто»); both stay в circle; admin review trigger if reciprocal reports follow |
| Blocked user already `approved_for_intro_meeting` | Approval revoked silently; user notified neutrally; meeting access denied на next refresh |
| Blocked user already `member` | Open question (§35 #5) — likely flag for admin review; не auto-remove |
| Blocked user tries to view blocker's profile | Returns 404-like; profile invisible |
| Blocked user tries to use chat where blocker is member | Messages hidden bilaterally; chat works otherwise |

---

## 19. Report Security

### 19.1 Rules

- **Authenticated / onboarded users могут create reports**;
- Reports can target **user / circle / meeting / message** — at least one target required (DB check);
- **Reporter может see limited own report status** (e.g., "submitted", "resolved");
- **Reported user НЕ может see report details** (privacy — Инв. 6);
- **Admin full access server-side**;
- **Report descriptions sensitive** — никогда не leak'аются;
- **No raw report text в analytics** (privacy boundary);
- **AI can summarize** в `ai_summary` — admin only;
- Report **creates moderation queue item** (default `status = 'new'`).

### 19.2 Report privacy checklist

- [ ] Reporter SELECT returns own reports with limited fields (no admin_resolution_note);
- [ ] Reported user SELECT denied для reports.reported_user_id = self;
- [ ] Reported user не может deduce existence of report via timing / counts;
- [ ] Admin SELECT full access server-side;
- [ ] Report description never в analytics events;
- [ ] AI summary admin-only;
- [ ] At-least-one-target constraint enforced.

---

## 20. Moderation & Audit Security

### 20.1 Rules

- **Normal users не могут read `moderation_actions`** (admin-only);
- **Normal users не могут read `audit_logs`** (admin-only);
- **Admin dashboard reads via server-side**;
- **Serious actions require reason** (DB constraint + Edge Function check);
- **All moderation-sensitive actions create audit log** (Инв. 4);
- **Audit logs append-only-ish** — no UPDATE / DELETE policies;
- **Before / after states redact sensitive values** (e.g., exact_location → `[REDACTED]`, raw trust score never logged);
- **AI не final actor для serious actions** (Инв. 5).

### 20.2 Action security table

| Action | Who can perform | Audit log? | Notification (to user)? | Trust event? |
|---|---|:--:|---|:--:|
| `warn_user` | admin | ✅ | optional warning | ✅ trust_event `moderation_warning` |
| `restrict_user` | admin | ✅ | yes (neutral copy) | ✅ `restriction_applied` |
| `unrestrict_user` | admin | ✅ | yes | ✅ (positive) |
| `ban_user` | admin | ✅ | yes (force sign-out) | ✅ `restriction_applied` |
| `unban_user` | admin | ✅ | yes (на next login) | ✅ |
| `remove_circle` | admin | ✅ | members notified neutrally | host signal |
| `restore_circle` | admin | ✅ | members notified | — |
| `remove_meeting` | admin / host | ✅ | RSVPs voided + neutral notification | none |
| `restore_meeting` | admin | ✅ | members notified | — |
| `hide_message` | admin / system | ✅ | sender может видеть hidden state | — |
| `restore_message` | admin | ✅ | — | — |
| `freeze_chat` | admin | ✅ | members see frozen banner | — |
| `unfreeze_chat` | admin | ✅ | members see unfrozen | — |
| `dismiss_report` | admin | ✅ | reporter sees "resolved" | — |
| `escalate_report` | admin | ✅ | none | — |
| `admin_note` | admin | ✅ | none | none |

---

## 21. Trust Security

### 21.1 Rules

- **`trust_events` internal only** (admin / system) — никогда не exposed normal user;
- **`user_trust_summary` internal only** — `trust_score_internal` **никогда** не returned public / mobile APIs;
- **Public badges derived safely** через computed view (badges based on `trust_tier` enum);
- **No public negative labels** (Инв. 10, 12);
- **No public ratings** (Hard rule 5);
- **No social credit** (Инв. 10);
- **`circle_left` and `circle_paused` neutral by default** (Инв. 11, 12);
- **No public removal / rejection / no-show labels** (Инв. 12).

### 21.2 Allowed public signals

- **Проверен** (verification_level >= email_verified или phone_verified);
- **Надёжный участник** (trust_tier IN ('verified', 'reliable', 'trusted_host'));
- **Уже проводил встречи** (hosted_meetings_count > 0);
- **Участвовал во встречах** (attended_meetings_count > 0).

### 21.3 Forbidden public signals

- ~~Trust score 87~~ (Инв. 3);
- ~~Low trust~~ (Инв. 10);
- ~~Reported~~ (privacy);
- ~~Often blocked~~ (Инв. 10);
- ~~No-show user~~ (Инв. 12);
- ~~Removed from N circles~~ (Инв. 12);
- ~~Rejected by N hosts~~ (Инв. 12).

---

## 22. Beta / Invite Security

### 22.1 Rules

- **Invite validation server-side** через `validate_invite_code` Edge Function;
- **Code cannot be reused beyond `max_uses`** (atomic check + increment);
- **Expired / revoked codes denied**;
- **Waitlist allowed без full app** (minimal email collection);
- **Invite codes не expose assigned_to_email broadly** (admin only);
- **Admin manages server-side**;
- **Rate-limit** на invite attempts (§27 — prevent brute-force enumeration).

---

## 23. Notification Security v2

### 23.1 Rules

- **Minimal notification content** (push payload минимальный);
- **No exact location** для non-approved users (Инв. 1);
- **Approval notification может say** «details available — open app»;
- **Exact location fetched** только из authorized screen через `approved_meeting_details_view` / Edge Function;
- **No report descriptions** в push body;
- **No raw message body** в push (preview limited);
- **No private membership / removal drama** для других users.

### 23.2 Notification privacy table

| Notification Type | Recipient | Exact Location Allowed? | Sensitive Content Allowed? | Notes |
|---|---|:--:|:--:|---|
| `membership_request_approved_for_intro` | requesting user | ❌ (fetch in-app) | ❌ | «Хост подтвердил вас на первой встрече» |
| `membership_request_rejected` | requesting user | ❌ | ❌ (non-stigmatizing only) | «Не в этот раз» |
| `membership_request_waitlisted` | requesting user | ❌ | ❌ | soft waitlist copy |
| `membership_request_received_for_host` | host | ❌ | safe applicant context only | «Новый запрос на место» |
| `meeting_reminder` | members + approved intro | **❌ (Инв. 1)** | ❌ | «Встреча завтра — детали в app» |
| `meeting_update` | members + approved intro | ❌ | host's text **только если AI-moderated** | content moderated |
| `meeting_cancelled` | members + approved intro | ❌ | ❌ | RSVPs voided notification |
| `circle_update` | members | ❌ | host's text moderated | — |
| `circle_chat_update` | members | ❌ | message preview limited (first N chars) | — |
| `report_update` | reporter | ❌ | ❌ | only status change ("resolved") |
| `invite_available` | waitlist email | ❌ | ❌ | minimal CTA |

### 23.3 Rule

> **Любая notification, содержащая `meeting_locations.exact_location_text` / `exact_address` / `exact_lat/lng` в push body — отклоняется на code review.** Payload validation gate в notification dispatcher.

---

## 24. Analytics Security v2

### 24.1 Never send (binding)

- ~~exact_location_text~~;
- ~~exact_address~~;
- ~~exact_lat / exact_lng~~ (Инв. 1);
- ~~arrival_instructions~~;
- ~~raw message body~~ (`circle_chat_messages.body`);
- ~~`intro_note`~~;
- ~~`host_note`~~;
- ~~report description~~ (`reports.description`);
- ~~moderation notes~~ (`reports.admin_resolution_note`, `moderation_actions.reason`);
- ~~`trust_score_internal`~~ (Инв. 3);
- ~~private profile data~~ (`profile_private_details.*`);
- ~~phone / email / DOB~~.

### 24.2 Allowed

- IDs (UUIDs);
- enum values;
- status values;
- category IDs;
- city IDs;
- rhythm;
- `comfort_composition` как enum;
- funnel steps (US-AN-01…17);
- counts / buckets (без personal-tie);
- non-sensitive error types.

### 24.3 Rule

> **Analytics measures behavior и safety health, не sensitive social data.** Schema-level enforcement: analytics event schemas валидируются на отсутствие forbidden columns. Observability alerts fire если sensitive field попадает в payload.

---

## 25. Storage Security

### 25.1 `profile-photos` (P0)

- Owner upload only (auth.uid() = user_id);
- **Moderation required** перед public visibility (`moderation_status = 'approved'`);
- **Signed URLs preferred** (short-lived, не permanent public links);
- Unsafe / rejected hidden;
- Storage cleanup on `profile_photos.deleted_at`.

### 25.2 `circle-media` (P1)

- Host upload только;
- Moderation required;
- Не public если unsafe;
- Access keyed на circle visibility.

### 25.3 `moderation-attachments` (P1)

- **Admin-only access**;
- Report attachments;
- Signed URLs server-side only.

### 25.4 Rules

- **No unrestricted public sensitive buckets**;
- **DB stores `storage_path`** (relative key), не URL;
- **Unsafe media hidden** (UI filters на `moderation_status`);
- **Media cleanup needed** при deletion (background job).

---

## 26. Edge Function Security v2

### 26.1 Sensitive operations

| Edge Function | Auth required | Role checks | Input validation | RLS interaction | Audit log | Rate limit | Notification |
|---|---|---|---|---|:--:|:--:|---|
| `validate_invite_code` | ❌ (guest) | check `invite_codes.status` | code format | bypass via service role | optional | ✅ (brute-force) | none |
| `complete_onboarding` | ✅ user | self only | full profile schema | inserts `profiles` + `profile_private_details` | optional | ✅ | none |
| `create_circle` | ✅ user | onboarded; not restricted | circle fields | inserts `circles` (draft) | ✅ | ✅ | none |
| `publish_circle` | ✅ host | host of circle | status check | updates `circles.status` | ✅ | — | host confirmation |
| `update_circle` | ✅ host | host of circle | field validation | updates `circles` | optional | — | members if mid-life |
| `pause_circle` | ✅ host | host of circle | — | updates status | ✅ | — | members neutral |
| `request_circle_place` | ✅ user | not blocked; not banned; onboarded; verified per policy | intro_note ≤ 500 | inserts `circle_membership_requests` | optional | ✅ | host receives |
| `approve_for_intro_meeting` | ✅ host | host of circle | meeting_id valid | updates request; sets `related_intro_meeting_id` | ✅ | — | user receives invitation |
| `reject_membership_request` | ✅ host | host of circle | reason category | updates request | ✅ | — | user receives soft copy |
| `waitlist_membership_request` | ✅ host | host of circle | — | updates request | ✅ | — | user receives waitlist copy |
| `confirm_circle_membership` | ✅ host or system | host of circle | intro_attended check | transitions to member | ✅ | — | user celebrates |
| `pause_membership` | ✅ user | self | — | updates `circle_memberships.status = 'paused'` | ✅ | — | quiet (no other notif) |
| `leave_circle` | ✅ user | self | — | updates `status = 'left'` | ✅ | — | quiet |
| `remove_circle_member` | ✅ host | host of circle | reason category | updates `status = 'removed'` | ✅ (Инв. 4) | — | user receives private copy |
| `schedule_circle_meeting` | ✅ host | host of circle | meeting fields | inserts `circle_meetings` + `meeting_locations` | ✅ | ✅ | members reminder queued |
| `update_meeting_rsvp` | ✅ user | allowed participant / member | rsvp_status | updates `meeting_rsvps` | optional | — | none |
| **`reveal_meeting_location`** | ✅ user | **complex membership / request status check** | meeting_id | reads `meeting_locations` | optional | — | none |
| `send_circle_chat_message` | ✅ user | active member | body, AI moderation | inserts `circle_chat_messages` | optional (на moderation) | ✅ | none / Realtime |
| `report_content` | ✅ user | not reporting self | target validation | inserts `reports` | ✅ | ✅ | reporter confirmation |
| `block_user` | ✅ user | self ≠ target | — | inserts `user_blocks` (bilateral effects) | optional | — | none |
| `restrict_user` | ✅ admin | admin | reason | updates `profiles.profile_status` | ✅ | — | user notified |
| `ban_user` | ✅ admin | admin | reason | updates `profile_status = 'banned'`; revokes session | ✅ | — | user force-signed-out |
| `remove_circle` (admin) | ✅ admin | admin | reason | updates `circles.status = 'removed_for_safety'` | ✅ | — | members notified |
| `remove_meeting` (admin) | ✅ admin | admin | reason | updates `circle_meetings.status = 'removed_for_safety'` | ✅ | — | members notified |
| `freeze_chat` | ✅ admin | admin | reason | updates `circle_chat_states.is_frozen = true` | ✅ | — | members see frozen |
| `update_attendance` | ✅ host or system | host of circle / system | attendance map | inserts `meeting_attendance` + `trust_events` | ✅ | — | none |
| `create_trust_event` | ✅ system | system / admin | event type | inserts `trust_events` (append-only) | n/a | — | none |

### 26.2 Rules

- **Actor derived из auth context** (`auth.uid()`); never from client-provided user_id;
- **Validate lifecycle transitions** (e.g., нельзя `approve_for_intro_meeting` если request уже `rejected`);
- **Validate block / ban / restriction state** before any write;
- **Service role только в secure server-side context** (Инв. 12);
- **Failed audit write блокирует action** (US-SAFE-14 EC).

---

## 27. Rate Limiting & Abuse Prevention v2

### 27.1 Actions требующие limits

| Action | Suggested limit | Abuse prevented | P0/P1 | Notes |
|---|---|---|:--:|---|
| Auth attempts | 5 / 15 min per IP | brute force | P0 | Supabase Auth built-in |
| Invite code attempts | 10 / hour per IP | code enumeration | P0 | non-enumerable codes |
| Profile edits | 30 / hour per user | abuse / spam | P0 | — |
| Photo uploads | 20 / hour per user | storage abuse | P0 | + AI moderation |
| Circle creation | 3 / day per user | spam circles | P0 | first-time host review (open §35 #6) |
| Membership requests | 10 / hour per user; 50 / day | request spam | P0 | + blocked / banned check |
| Approval / rejection actions | 100 / hour per host | abuse pattern | P0 | suspicious if exceeded |
| Circle chat messages | 30 / minute per user per circle | chat spam | P0 | + AI moderation |
| Reports | 5 / hour per user | report abuse | P0 | + admin triage |
| Blocks | 20 / hour per user | block abuse | P0 | — |
| RSVP updates | 30 / hour per user | RSVP flip-flop | P1 | low priority |
| Admin actions | none formally, but logged | accountability | P0 | + audit |
| Repeated host removals | если >5 / week → suspicious flag | host abuse | P0 | host accountability signal |

### 27.2 Suspicious velocity

- Suspicious velocity создаёт `suspicious_activity_events` entry;
- Soft friction (rate-limit slowdown) может applied автоматически;
- **Serious punishment requires admin review** (Инв. 5).

---

## 28. Cache & Client Security v2

### 28.1 Rules

- **Не cache exact meeting location longer than necessary** (per session, не persistent);
- **Refetch circle / meeting detail после membership status changes** (TanStack Query invalidation);
- **Clear sensitive data on logout** (session storage purge);
- **Invalidate chat / location access после pause / leave / removal / restriction / ban**;
- **Не store service role или admin secrets** в client;
- **Не log sensitive data**;
- **Crash reports не include sensitive fields** (Sentry beforeSend hook redacts);
- **Local state никогда не source of truth для permissions** — всегда server-side check.

### 28.2 Critical cases

| Scenario | Expected client behavior |
|---|---|
| `approved_for_intro_meeting` user removed перед meeting | Realtime push → cache invalidate → location screen shows «доступ закрыт» |
| Member pauses while app open | Status change push → cache invalidate → My Circles refresh; chat read-only |
| Member removed while chat open | Realtime channel auto-disconnect → chat screen graceful close → «вы больше не участник этого круга» |
| Meeting cancelled после location reveal | Realtime push → cache invalidate → meeting detail shows «встреча отменена» |
| User banned while app open | Auth check on next API call → force sign-out → all cache cleared |
| Host changes meeting location | Members get update notification (без exact location в push); cache refetch on open |

---

## 29. Admin Security v2

### 29.1 Rules

- **Admin dashboard separate from mobile** ([apps/admin/](../apps/admin/) — Next.js, Sprint 1 baseline);
- **Admin auth required** (separate from regular user auth);
- **Admin authorization required** (server-side role check);
- **Service role server-side only** (`apps/admin/src/config/serverEnv.ts` имеет `import 'server-only'` guard — Sprint 1);
- **No service role в browser bundle** (CI check);
- **Admin actions require reason** (DB constraint + Edge Function check — US-ADM-17);
- **All admin actions audit logged** (Инв. 4);
- **Production admin access limited** (rotated credentials, audit-monitored).

### 29.2 Admin access table

| Admin Screen | Data Accessed | Sensitive? | Audit Required? | Notes |
|---|---|:--:|:--:|---|
| Moderation Queue (ADM-002) | open reports list | partial | read-only ✅ | AI-assistive priority |
| Report Detail (ADM-003) | full report + AI summary + audit history | **high** | view ✅ | — |
| User Detail (ADM-004) | safe profile + internal signals + reports against | **high** | view ✅ | no leak в normal flows |
| Circle Detail admin view (ADM-005) | full circle + reports + memberships | **high** | view ✅ | — |
| Meeting Detail admin view (ADM-006) | meeting + exact_location + reports | **critical** | view ✅ | exact location admin-only |
| Message Detail (ADM-007) | message body + surrounding context | **high** | view ✅ | — |
| Suspicious Activity (ADM-008) | flagged events queue | high | view ✅ | — |
| Audit Logs (ADM-009) | full audit history | **high** | view ✅ | append-only |
| Admin Action Modal (ADM-010) | action + reason + audit creation | **high** | action ✅ (mandatory) | Инв. 4 |

---

## 30. AI Moderation Security v2

### 30.1 Allowed AI uses

- profile text moderation (sanity);
- photo moderation (NSFW / safety flags);
- circle description moderation;
- meeting description moderation;
- circle chat harassment detection;
- spam / scam detection;
- report summarization;
- priority recommendation для admin queue.

### 30.2 Rules (binding)

- **AI output advisory** (Инв. 5);
- **Serious enforcement requires human / admin review**;
- **AI risk scores не public**;
- **Avoid unnecessary sensitive data** в AI API calls (минимизация PII);
- **AI summaries admin-only**;
- **AI provider isolation** — calls идут через Edge Functions, не из client.

### 30.3 Flow

```
Content created (profile text, photo, circle description, meeting description, chat message)
  → AI check (assistive)
  → result: safe / flagged / needs_review
  → if safe: pass through, log assistive signal
  → if flagged: soft block + retry / queue for admin
  → if needs_review: queue для admin
  → admin decision если serious
  → audit log если action taken (Инв. 4)
```

---

## 31. RLS Policy Blueprints by Table v2

> **Без real SQL.** Natural-language policy intent per table.

### 31.1 `profiles`

- **SELECT** — owner reads own row; other onboarded users read через `public_profiles_view` (safe subset); admins server-side.
- **INSERT** — via Edge Function `complete_onboarding`; auth.uid() = user_id.
- **UPDATE** — owner updates editable fields; system / admin update internal fields.
- **DELETE** — soft via `deleted_at`; admin only.

### 31.2 `profile_private_details`

- **SELECT** — owner limited (verification status only); admin server-side full.
- **INSERT / UPDATE** — via Edge Function only.
- **DELETE** — admin only (data retention policy).
- **Note:** highly sensitive — phone, DOB, legal_name, internal_notes never public.

### 31.3 `profile_photos`

- **SELECT** — owner own; others approved only.
- **INSERT** — owner via upload (+ AI moderation).
- **UPDATE** — owner manages position / is_primary; moderation status — system / admin.
- **DELETE** — owner soft + storage cleanup background.

### 31.4 `circles`

- **SELECT** — onboarded users via `public_circles_view` where `status = 'live'`; host reads own all states; admin full.
- **INSERT / UPDATE / DELETE** — via Edge Function only; host of circle.
- **Note:** `removed_for_safety` hidden.

### 31.5 `circle_membership_requests`

- **SELECT** — requester reads own; host reads for own circle; admin full.
- **INSERT** — via Edge Function `request_circle_place`; blocked / banned check.
- **UPDATE** — status changes via Edge Function only (no direct UPDATE).
- **DELETE** — soft via cancel; admin only hard.

### 31.6 `circle_memberships`

- **SELECT** — own own; host reads own circle; member reads circle members through safe view; admin full.
- **INSERT** — via Edge Function (`approve_for_intro_meeting` → `confirm_circle_membership`).
- **UPDATE** — transitions via Edge Function only (`pause`, `leave`, `remove`).
- **DELETE** — admin only.
- **Note:** no public removal history.

### 31.7 `circle_meetings`

- **SELECT** — safe summary per circle access; host reads own circle; admin full; exact location separate.
- **INSERT / UPDATE / DELETE** — via Edge Function only; host of circle.

### 31.8 `meeting_locations` (CRITICAL)

- **SELECT** — host of circle; `approved_for_intro_meeting` participant scoped to one meeting; active member upcoming; admin server-side. **All other states DENIED.**
- **INSERT / UPDATE** — via Edge Function `schedule_circle_meeting` / `update_circle`; host only.
- **DELETE** — cascade with meeting; admin only direct.
- **Note:** **Инв. 1 — самая sensitive table.**

### 31.9 `meeting_rsvps`

- **SELECT** — own; host reads own circle meetings.
- **INSERT / UPDATE** — via Edge Function `update_meeting_rsvp`; allowed participants / members.
- **DELETE** — soft via cancel.

### 31.10 `meeting_attendance`

- **SELECT** — own; host reads own circle; admin full.
- **INSERT / UPDATE** — host via Edge Function `update_attendance`; or system auto-mark.
- **Note:** `no_show` internal only.

### 31.11 `circle_chat_messages`

- **SELECT** — active members; allowed intro participants per policy; admin moderation view.
- **INSERT** — via Edge Function `send_circle_chat_message`; active member; chat not frozen.
- **UPDATE** — sender soft-edit (P1?); admin via moderation.
- **DELETE** — soft via `deleted_at`; sender or admin.
- **Note:** **no DMs** (Инв. 2).

### 31.12 `user_blocks`

- **SELECT** — blocker reads own; admin full.
- **INSERT** — via Edge Function `block_user`; blocker = auth.uid().
- **UPDATE** — soft delete for unblock (P1).
- **Note:** blocked user does not see reason.

### 31.13 `reports`

- **SELECT** — reporter reads limited own status; admin full server-side.
- **INSERT** — via Edge Function `report_content`; authenticated users.
- **UPDATE** — admin only (resolution).
- **DELETE** — admin only (rare; usually keep).
- **Note:** reported user **никогда** reads.

### 31.14 `trust_events`

- **SELECT** — admin / system only.
- **INSERT** — via Edge Function (system / admin actor).
- **UPDATE / DELETE** — denied (append-only).

### 31.15 `user_trust_summary`

- **SELECT** — admin / system only.
- **INSERT / UPDATE** — system via trust event recompute.
- **Note:** `trust_score_internal` **никогда** public (Инв. 3).

### 31.16 `moderation_actions`

- **SELECT** — admin only.
- **INSERT** — admin via Edge Function (reason required).
- **UPDATE / DELETE** — denied.

### 31.17 `audit_logs`

- **SELECT** — admin only.
- **INSERT** — system / admin via Edge Function.
- **UPDATE / DELETE** — **denied** (append-only).

### 31.18 `invite_codes`

- **SELECT** — admin only (codes never enumerable).
- **INSERT** — admin / system.
- **UPDATE** — via `validate_invite_code` Edge Function (atomic increment).
- **DELETE** — admin soft (set status = 'revoked').

### 31.19 `notifications`

- **SELECT** — recipient reads own.
- **INSERT** — system via Edge Function.
- **UPDATE** — recipient marks own as read (`read_at`).
- **DELETE** — recipient soft.

### 31.20 `push_tokens`

- **SELECT / INSERT / UPDATE / DELETE** — owner own; admin full.

### 31.21 `feature_flags`

- **SELECT** — server-driven; client receives evaluated flags via API.
- **INSERT / UPDATE / DELETE** — admin only.

### 31.22 `feature_flag_exposures`

- **SELECT** — own; admin full.
- **INSERT** — system / Edge Function.

---

## 32. Security Test Plan v2

> Все tests должны pass перед closed beta launch. Test framework — open §35 #14 (pgTAP / Supabase native / custom Jest harness).

### 32.1 Location Privacy Tests

- [ ] **guest cannot read `circles`** → 0 rows;
- [ ] **`authenticated_not_onboarded` cannot read Circle Discovery** → 0 rows from `public_circles_view`;
- [ ] **`onboarded_user` sees approximate only** через `public_circles_view`;
- [ ] **`requested` cannot read `meeting_locations`** → 0 rows;
- [ ] **`waitlisted` cannot read `meeting_locations`** → 0 rows;
- [ ] **`rejected` cannot read `meeting_locations`** → 0 rows;
- [ ] **`approved_for_intro_meeting` reads only intro meeting location** → exactly 1 row for that meeting;
- [ ] **`member` reads allowed upcoming meeting location** → upcoming meetings of own circles;
- [ ] **`member` cannot read unrelated meeting location** → 0 rows for other circles;
- [ ] **`paused` / `left` / `removed` lose future location access** → 0 rows after transition;
- [ ] **host reads own meeting location** → all meetings of own circles;
- [ ] **notification body не leaks exact location** → notification payload validation test;
- [ ] **analytics never includes exact location** → schema validation test on event payloads.

### 32.2 Circle Chat Tests

- [ ] **non-member cannot read chat** → 0 rows;
- [ ] **`requested` cannot read chat** → 0 rows;
- [ ] **`rejected` cannot read chat** → 0 rows;
- [ ] **`approved_for_intro_meeting` access per policy** → policy-driven;
- [ ] **member reads own circle chat** → rows returned;
- [ ] **member cannot read unrelated circle chat** → 0 rows;
- [ ] **`removed` member loses chat access** (test transition + SELECT);
- [ ] **frozen chat blocks writes** → INSERT denied;
- [ ] **banned user cannot write** → INSERT denied;
- [ ] **Realtime channel test:** removed user disconnected within X seconds.

### 32.3 Composition Visibility Tests

- [ ] **Pre-request sees aggregate only** → `public_circles_view` excludes member list;
- [ ] **Full member list не public** → no view returns browsable member list to non-members;
- [ ] **Safe member profiles only after approval** if policy allows → `member_circle_details_view` test;
- [ ] **No raw trust score** → `trust_score_internal` never в any non-admin view;
- [ ] **No other circles exposed** для other users → cross-user circle membership query denied.

### 32.4 Profile Privacy Tests

- [ ] **`public_profiles_view` excludes private details** → no phone / email / DOB / legal_name;
- [ ] **`trust_score_internal` не exposed** → SELECT path test;
- [ ] **Approved photo visible** → photos with `moderation_status = 'approved'` returned;
- [ ] **Rejected photo hidden** → `moderation_status = 'rejected'` filtered out.

### 32.5 Membership Tests

- [ ] **`authenticated_not_onboarded` cannot request** → Edge Function denied;
- [ ] **blocked user cannot request blocker's circle** → Edge Function denies;
- [ ] **banned user cannot request** → auth gate blocks;
- [ ] **one active request per (user, circle)** → second INSERT fails on partial unique;
- [ ] **rejected does not grant location / chat** → `meeting_locations` / `circle_chat_messages` denied;
- [ ] **`approved_for_intro_meeting` grants limited meeting access** → exactly one meeting location;
- [ ] **`member` grants circle access** → full member context;
- [ ] **removal revokes access** → transitions test.

### 32.6 Report / Moderation Tests

- [ ] **user can report user / circle / meeting / message** → INSERT succeeds with proper target;
- [ ] **reported user cannot read report** → SELECT denied;
- [ ] **admin can read report server-side** → admin app SELECT returns full;
- [ ] **action requires reason** → INSERT denied if `reason IS NULL`;
- [ ] **action creates audit log** → `audit_logs` row exists post-action;
- [ ] **AI flag does not ban automatically** → status remains `flagged` until admin action.

### 32.7 Trust Tests

- [ ] **normal user cannot read `trust_events`** → SELECT denied;
- [ ] **normal user cannot read `user_trust_summary`** → SELECT denied;
- [ ] **raw trust score не в public view** → `public_profiles_view` excludes;
- [ ] **no public negative labels** → no view exposes negative counts.

### 32.8 Admin / Service Role Tests

- [ ] **service role не client-side** → CI grep for `SUPABASE_SERVICE_ROLE_KEY` in mobile + admin client bundles → fails build if found;
- [ ] **mobile cannot read admin-only tables** → SELECT denied на `moderation_actions`, `audit_logs`, `trust_events`, `user_trust_summary`;
- [ ] **admin actions logged** → audit log row exists post-action;
- [ ] **banned user cannot interact** → auth gate + RLS denies.

---

## 33. Security Review Checklist Before Beta v2

Перед closed beta launch — **ALL** обязательны:

- [ ] **RLS enabled на всех exposed tables** (no missing tables);
- [ ] **No exact location в `circles`** (column-level audit);
- [ ] **`meeting_locations` protected** (RLS tests pass per §32.1);
- [ ] **`public_circles_view` excludes** exact location / member list;
- [ ] **`public_profiles_view` excludes** private fields / raw trust;
- [ ] **Circle chat approved-only** (Realtime + RLS);
- [ ] **Reports private** (reporter / admin only);
- [ ] **`moderation_actions` private** (admin only);
- [ ] **`audit_logs` private** (admin only);
- [ ] **Service role server-side only** (CI check passes);
- [ ] **Storage protected** (signed URLs, no public buckets для sensitive);
- [ ] **Notifications checked** (no exact location в push body);
- [ ] **Analytics checked** (no sensitive fields в events);
- [ ] **Rate limits defined** (§27);
- [ ] **Blocked / banned gates implemented**;
- [ ] **No public shame labels** (no view exposes removal / rejection / no-show);
- [ ] **No people marketplace** (no view returns browsable user catalog);
- [ ] **All 15 binding RLS tests passing** ([Architecture v2 §28.3](05_ARCHITECTURE.md));
- [ ] **All 32.x test suites green** в CI.

---

## 34. Security Risks v2

| Risk | Impact | Mitigation | Test Needed? |
|---|---|---|:--:|
| **Exact meeting location leak** через `meeting_locations` SELECT | **critical** (Инв. 1) | strict RLS + secure view + Edge Function | ✅ §32.1 |
| **Notification location leak** в push body | **critical** | payload validation gate | ✅ §32.1 |
| **Analytics location leak** в event payload | **critical** | schema validation + observability alert | ✅ §32.1 |
| **Full member list exposed** via misconfigured view | high (Инв. 13) | `public_circles_view` excludes member data | ✅ §32.3 |
| **People marketplace emerges из safe views** | high (Инв. 13) | no view returns browsable user catalog; review gate | ✅ §32.3 |
| **Raw trust score exposed** | **critical** (Инв. 3) | `user_trust_summary` admin-only RLS | ✅ §32.7 |
| **Chat access too broad** | high (Инв. 2) | RLS + Realtime auth; integration test «removed disconnect» | ✅ §32.2 |
| **Stale cache после removal** | high | TanStack Query invalidation + Realtime push | ✅ §32.2 |
| **Service role exposed** в bundle | **critical** (Инв. 12) | `import 'server-only'` guard + CI check | ✅ §32.8 |
| **Report details visible reported user** | high (Инв. 6) | RLS denies; reported user never sees | ✅ §32.6 |
| **Admin action без audit log** | **critical** (Инв. 4) | DB constraint + Edge Function gate (failed audit blocks action) | ✅ §32.6 |
| **AI false positive enforcement** | medium (Инв. 5) | AI advisory only; admin override required; appeal flow (P1) | ✅ §32.6 |
| **Invite code brute force** | medium | rate-limit + non-enumerable codes | ✅ §32.x |
| **Membership request spam** | medium | rate-limit (10/hr per user) + blocked / banned check | ✅ §32.5 |
| **Chat spam** | medium | rate-limit (30/min per user per circle) + AI moderation | ✅ §32.2 |
| **Storage bucket public by accident** | high | bucket configuration audit + signed URLs default | ✅ deployment check |
| **RLS too permissive** | **critical** | binding test suite (§32); deny-by-default | ✅ §32 all |
| **RLS too restrictive** causing UX failure | medium | UX integration tests + smoke tests in staging | ✅ E2E |
| **Public removal / rejection state leak** | high (Инв. 12) | no view exposes; UI copy validated | ✅ §32.3 |

---

## 35. Open Security Questions v2

1. **Phone verification timing** — before request или before approval? (PRD v2 §27 #2, Architecture v2 §33 #14).
2. **Exact meeting location reveal timing** — immediately после intro approval или near start_time (window-based)?
3. **`approved_for_intro_meeting` chat access** — meeting-context only / full read-only / muted? (Stories v2 §11 #14, Flows v2 §14 #4).
4. **When do approved users see full member list** — до intro / после intro / после первой встречи? (PRD v2 §27 #8).
5. **Block work если оба users в same circle** — auto-remove? admin review? bilateral message hide only? (Stories v2 EC-14, Architecture v2 §33 #15).
6. **First-time host manual review** — все ли новые circles через `pending_review`? (Architecture v2 §33 #7).
7. **Can host remove approved member?** — yes per `remove_circle_member`, но какие reason categories требуют admin review? (PRD v2 §27 #9).
8. **Does removed member lose read access** to past chat? — only future / write? или full read revoked?
9. **How long should circle chat remain available** после leaving? — TTL? retention?
10. **Should reported message body be snapshotted** для admin review даже после sender delete? (Stories v2 EC-20).
11. **How long retain reports / audit logs / chat** — GDPR + safety policy.
12. **Can host freeze chat** or **only admin**?
13. **Should all new circles require manual review** during beta? (`pending_review` mandatory).
14. **What rate limits are P0 vs P1?** — finalize §27 table.
15. **Should admin role be table** (`admin_users`) or external allowlist (Supabase Auth claims)?
16. **How to handle appeals** для removed_for_safety / banned users? (P1).
17. **How to handle deletion** when reports / audit logs exist? (data retention exceptions).
18. **How to enforce comfort composition safely** (women-only) — schema-level filter? application-level? (gated на validation — Core v2 §21).

---

## 36. Summary

**Security & RLS v2:**

- **Защищает circles, memberships, meeting locations, circle chat, reports и trust data.**
- **Meeting location access depends на approved intro / member / host / admin status** (Инв. 1).
- **No open DMs, no people marketplace, no raw trust score, no public shame** — core rules (Инв. 2, 3, 12, 13).
- **Service role server-side only** (Инв. 12); admin app boundary.
- **All moderation-sensitive actions create audit log** (Инв. 4); AI assistive only (Инв. 5).
- **Actual RLS policies и SQL не созданы** — это blueprint;
- **Open questions** (§35) explicit'но перечислены — не silently decided.
- **18-item review checklist** (§33) и **8 test suites** (§32) — binding gates перед closed beta.

**Next required document:**

> Update [`/docs/08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md) to **Trust System v2** ([doc 27 §24 Phase C step 9](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)).

Trust System v2 specifies:

- exact `trust_event_type` weights и aggregation logic;
- `user_trust_summary.trust_score_internal` computation;
- `trust_tier` transitions (`new → verified → reliable → trusted_host`);
- public badge derivation rules;
- host accountability signals;
- no-show neutral-default policy (US-INTRO-07, US-TRUST-12);
- AI assistive role в trust signals (Инв. 5).

После Trust v2 → Moderation v2 → Analytics v2 → Backlog v2 → Sprint 2 phase gate (doc 22) → **Sprint 2 product implementation может начаться.**

---

> Reminder: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2) — **first source of truth**. Этот документ ему, Architecture v2, и Schema v2 подчинён. Любая RLS policy / Edge Function / view, нарушающая §15 (location matrix), §20 moderation rules, §21 trust rules, или §31 policy blueprints — **отклоняется на review**. Никаких real SQL policies до §32 test suite design pass.
