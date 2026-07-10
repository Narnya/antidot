# Trust System v2 — Antidot

> **Status:** v2 (trust blueprint для closed beta, circle-first).
> **Owner:** Product / Safety / Backend
> **Last updated:** 2026-05-31
> **First source of truth:** [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2).
> **Schema source:** [`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) §14 (`trust_events`, `user_trust_summary`).
> **Security source:** [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §21 (Trust Security).
> **Manifesto source:** [`/docs/25_PRODUCT_CORE_MANIFESTO.md`](25_PRODUCT_CORE_MANIFESTO.md) §17 (Trust Principles).
> **Supersedes:** Trust System v1 (event-first, 2026-05-18).
> **Sequenced by:** [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md) §24 Phase C step 9.

> ⚠️ **Это documentation task only.** Никакой формулы scoring'а не написана как код. Никаких database changes. Raw trust score **никогда не exposed**.

---

## 1. Source of Truth

- **Product Core v2** ([`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md)) — first source of truth.
- Trust System v2 следует **HYBRID ACCEPT** ([`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md)).
- **User-facing primitive** — Circle. **Operational primitive** — Meeting.
- **Старая event-first trust-модель superseded.**
- **Raw trust score никогда не shown users** (Инв. 3).
- Trust System — **не социальный credit system** (Инв. 10).
- Trust System **не создаёт public shame** (Инв. 12).
- Trust System **не создаёт betrayal mechanics** (Инв. 11).
- Trust System поддерживает **safety и belonging, не ranking**.

---

## 2. Trust System Goals v2

1. **Increase safety** of recurring offline circle interactions.
2. **Help hosts maintain circle rhythm и comfort**.
3. **Support repeated attendance и reliability**.
4. **Reduce no-shows** without public shame (Инв. 12).
5. **Support approval as fit protection**, не human ranking (Core v2 §19).
6. **Support safe membership decisions** для hosts.
7. **Help moderation prioritize real risk** (Инв. 5 assistive).
8. **Support soft positive public trust cues** only.
9. **Avoid public ranking of people** (Инв. 10).
10. **Avoid social credit mechanics** (Инв. 10).
11. **Avoid dating-style desirability scores** (Hard rule 6).
12. **Support belonging как success state** (Инв. 14).
13. **Keep leaving / pausing neutral by default** (Инв. 11, 12).
14. **Support recovery и trust repair** over time (Manifesto §17).

---

## 3. Trust System Non-Goals

Trust System **должна НЕ**:

- ~~show raw trust score~~ (Инв. 3);
- ~~show public numeric ratings~~ (Hard rule 5);
- ~~show public negative labels~~ (Инв. 10, 12);
- ~~rank people как лучше / хуже~~ (Инв. 10);
- ~~create social credit~~ (Инв. 10);
- ~~create dating compatibility score~~;
- ~~punish users publicly за leaving circles~~ (Инв. 11, 12);
- ~~treat pausing / leaving as betrayal~~ (Инв. 11);
- ~~automatically punish single no-show harshly~~ (US-INTRO-07);
- ~~automatically ban based on AI~~ (Инв. 5);
- ~~automatically punish based on one report~~ (US-SAFE-15);
- ~~let hosts secretly downrank people~~;
- ~~turn circles into status clubs~~;
- ~~expose report / block / no-show counts publicly~~;
- ~~expose removal / rejection history~~.

---

## 4. Core Trust Philosophy v2

**Доверие в этом продукте растёт через повторяющийся общий контекст.**

### 4.1 Trust is NOT

- popularity;
- attractiveness;
- social status;
- host preference;
- ranking;
- exclusivity.

### 4.2 Trust IS

- **contextual** — earned within specific circles;
- **earned gradually** — не instant;
- **tied to repeated presence** — co-presence is the substrate;
- **protected by privacy** — internal, not public number;
- **supported by moderation** — checks safety, не popularity;
- **recoverable from mistakes** — past missteps не permanent labels;
- **visible publicly только как soft positive cues** (badges).

### 4.3 Key principles (binding)

- **Absence of history не guilt** — новый user не подозрителен (Manifesto §17).
- **Leaving a circle не betrayal** (Инв. 11).
- **Pausing participation neutral by default** (Инв. 11, 12; US-TRUST-12).
- **One no-show не identity** (US-INTRO-07).
- **Reports — сигналы, не доказательство** (Инв. 5).
- **Host feedback — контекст, не приговор**.
- **Public trust cues должны быть positive или neutral** (Manifesto §17).
- **Negative / risk signals остаются internal**.

### 4.4 Governing principle

> **Продукт не оценивает людей публично. Он использует internal signals чтобы снижать риск и поддерживать более безопасную повторяющуюся социальную принадлежность.**

---

## 5. Trust Layers v2

### 5.1 Identity Trust

**Signals:**

- email verification;
- phone verification;
- onboarding completion;
- profile completeness;
- photo moderation passed.

### 5.2 Circle Participation Trust

**Signals:**

- requested a place (intent);
- approved for intro meeting;
- attended intro meeting;
- became member (`circle_membership_confirmed`);
- remained active (continuity);
- paused responsibly (neutral);
- left quietly (neutral).

### 5.3 Meeting Reliability Trust

**Signals:**

- RSVP yes;
- attended meeting;
- RSVP no in advance (responsible);
- no-show (risk if pattern);
- repeated attendance (continuity);
- repeated no-shows (risk pattern).

### 5.4 Host Trust

**Signals:**

- created circle;
- hosted recurring meetings;
- low cancellation pattern;
- safe circle history;
- member feedback (если added later);
- low report rate;
- responsible membership decisions (не abusive removals).

### 5.5 Behavior Trust

**Signals:**

- circle chat behavior (moderation flags);
- reports against this user;
- blocks against this user;
- spam / velocity flags;
- suspicious membership request patterns;
- unsafe behavior (admin-confirmed).

### 5.6 Moderation Trust

**Signals (admin-confirmed only):**

- warnings;
- restrictions;
- bans;
- removed circles (if user was host);
- removed meetings;
- hidden messages;
- safety removals.

### 5.7 Public Trust Cues

**Allowed:**

- **Проверен**;
- **Надёжный участник**;
- **Уже проводил встречи**;
- **Участвовал во встречах**;
- **Хорошо держит ритм** (P1, careful wording — open §37).

**Avoid:**

- raw score;
- negative label;
- ranking;
- popularity.

---

## 6. Trust Data Model Reference v2

Based on [`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) §14.

### 6.1 `trust_events`

**Purpose:** append-only internal trust signal events.

**Used for:**

- recording trust signals;
- deriving `user_trust_summary`;
- moderation context;
- auditability (Инв. 4);
- future intelligence layer (P1+, после real data).

**RLS:** admin / system only — никогда normal user (RLS v2 §31.14).

### 6.2 `user_trust_summary`

**Purpose:** internal derived trust state.

**Contains (Schema v2 §14.2):**

- `trust_score_internal` ← **NEVER public** (Инв. 3);
- `trust_tier`;
- `attended_meetings_count`;
- `hosted_circles_count`;
- `hosted_meetings_count`;
- `no_show_count` ← internal (Инв. 3, 12);
- `report_count` ← internal;
- `block_count` ← internal;
- `last_trust_event_at`.

**RLS:** admin / system only (RLS v2 §31.15).

### 6.3 `profiles`

May expose **только safe trust fields**:

- `verification_level`;
- safe `trust_tier` derivation (badge name only, not enum value as ranking);
- `profile_completeness` (band, not raw number).

**Raw trust score никогда не stored в public profile** (Инв. 3).

### 6.4 `circle_memberships`

Может inform internal trust:

- `status = 'member'` (positive continuity);
- `joined_at`;
- `paused_at` (neutral);
- `left_at` (neutral);
- `removed_at` (risk если pattern by user; host-accountability signal если pattern by host).

**Important:**

- **`paused` / `left` neutral by default** (Инв. 11);
- **Removal context internal only** (Инв. 12);
- **No public shame**.

### 6.5 `meeting_attendance`

Source для:

- `meeting_attended` event (positive);
- `meeting_no_show` event (risk если pattern);
- `excused_absence` (neutral).

### 6.6 `reports` / `user_blocks`

**Risk signals, не proof.**

- Один report — signal, не verdict;
- Один block — signal, не proof of guilt;
- Pattern matters more than single signal.

### 6.7 `moderation_actions`

Confirmed moderation decisions могут create trust events:

- `warn_user` → `moderation_warning`;
- `restrict_user` → `restriction_applied`;
- `ban_user` → severe signal (tier override).

---

## 7. Trust Event Types v2

Per Schema v2 §5 `trust_event_type` enum. Для каждого:

### 7.1 `profile_completed`

| Поле | Значение |
|---|---|
| Meaning | пользователь завершил profile completeness threshold |
| Trigger | `complete_onboarding` Edge Function reaches threshold |
| Source | `system_lifecycle` |
| Category | **Positive** |
| Weight direction | small positive |
| Visible to user? | да (как профиль badge / completeness UI) |
| Admin visibility | да |
| Notes | enables `Проверен` candidate если verification также passed |

### 7.2 `phone_verified`

| Поле | Значение |
|---|---|
| Meaning | phone verification успешно завершена |
| Trigger | verification flow success |
| Source | `system_lifecycle` |
| Category | **Positive** |
| Weight direction | medium positive |
| Visible to user? | да (verification_level badge) |
| Admin visibility | да |
| Notes | может gate `request_circle_place` (timing — open §37) |

### 7.3 `meeting_attended`

| Поле | Значение |
|---|---|
| Meaning | подтверждённое посещение встречи |
| Trigger | `update_attendance` Edge Function (host confirms) |
| Source | `host_action` или `system_lifecycle` |
| Category | **Positive** |
| Weight direction | small positive per attendance; cumulative |
| Visible to user? | nuance — да через bands / badges, не raw count к other users |
| Admin visibility | да |
| Notes | основной positive signal для reliability |

### 7.4 `meeting_no_show`

| Поле | Значение |
|---|---|
| Meaning | пользователь не явился на meeting на которую RSVP'нул |
| Trigger | host marks `no_show` после meeting |
| Source | `host_action` |
| Category | **Risk** (НЕ negative автоматически) |
| Weight direction | first: neutral / very small; subsequent: progressive risk |
| Visible to user? | **НЕТ** (internal only — Инв. 3, 12; US-INTRO-07) |
| Admin visibility | да (admin может видеть pattern) |
| Notes | **first no-show neutral** (US-INTRO-07); pattern matters |

### 7.5 `circle_member_confirmed`

| Поле | Значение |
|---|---|
| Meaning | user стал `member` после intro / approval |
| Trigger | `confirm_circle_membership` Edge Function |
| Source | `system_lifecycle` |
| Category | **Positive** |
| Weight direction | small positive (один-time per circle) |
| Visible to user? | да (My Circles UI) |
| Admin visibility | да |
| Notes | enables `Участвовал во встречах` badge после first meeting |

### 7.6 `circle_left`

| Поле | Значение |
|---|---|
| Meaning | пользователь quietly left circle |
| Trigger | `leave_circle` Edge Function |
| Source | `system_lifecycle` |
| Category | **Neutral** (binding — Инв. 11) |
| Weight direction | **none by default** |
| Visible to user? | да — own action only; никогда other users (Инв. 11) |
| Admin visibility | да (для pattern detection) |
| Notes | **Leaving не betrayal.** Никаких public signals to other members |

### 7.7 `circle_paused`

| Поле | Значение |
|---|---|
| Meaning | user paused participation |
| Trigger | `pause_membership` Edge Function |
| Source | `system_lifecycle` |
| Category | **Neutral** (binding — Инв. 11, 12) |
| Weight direction | **none by default** |
| Visible to user? | да — own action only |
| Admin visibility | да |
| Notes | **Pause — healthy low-drama behavior.** Не наказывается. |

### 7.8 `circle_removed_for_safety`

| Поле | Значение |
|---|---|
| Meaning | user или circle removed за safety reasons |
| Trigger | admin action (`remove_circle_member` with safety category, или `remove_circle`) |
| Source | `admin_action` |
| Category | **Severe** |
| Weight direction | large negative (tier potentially overridden) |
| Visible to user? | private notification (non-stigmatizing copy) |
| Admin visibility | да + audit log (Инв. 4) |
| Notes | one of few signals что может tier override |

### 7.9 `host_positive_feedback`

| Поле | Значение |
|---|---|
| Meaning | подтверждённый positive host signal (member оставил positive feedback, или completion статистика) |
| Trigger | host feedback flow (P1) или derived metric |
| Source | `host_action` или `system_lifecycle` |
| Category | **Positive** (carefully weighted) |
| Weight direction | small positive |
| Visible to user? | да через badges |
| Admin visibility | да |
| Notes | careful — avoid popularity bias (§25) |

### 7.10 `host_negative_feedback`

| Поле | Значение |
|---|---|
| Meaning | host feedback signal indicating issues |
| Trigger | host feedback flow (P1) или admin validation |
| Source | `host_action` (with admin validation) |
| Category | **Risk** |
| Weight direction | small risk |
| Visible to user? | **НЕТ** |
| Admin visibility | да |
| Notes | **не proof**; pattern + admin review required (§25 fairness) |

### 7.11 `report_received`

| Поле | Значение |
|---|---|
| Meaning | report submitted против этого user |
| Trigger | `report_content` Edge Function |
| Source | `system_lifecycle` |
| Category | **Risk** (НЕ negative) |
| Weight direction | small risk per report |
| Visible to user? | **НЕТ** (reported user никогда не sees — Инв. 6) |
| Admin visibility | да |
| Notes | **Один report — signal, не guilt.** Pattern matters |

### 7.12 `block_received`

| Поле | Значение |
|---|---|
| Meaning | пользователь был blocked другим пользователем |
| Trigger | `block_user` Edge Function |
| Source | `system_lifecycle` |
| Category | **Risk** |
| Weight direction | small risk per block |
| Visible to user? | **НЕТ** (blocked user not notified — Инв. 6) |
| Admin visibility | да |
| Notes | **Block alone не proof of guilt.** Pattern matters |

### 7.13 `moderation_warning`

| Поле | Значение |
|---|---|
| Meaning | admin-confirmed warning |
| Trigger | admin action `warn_user` |
| Source | `admin_action` |
| Category | **Negative / Risk** |
| Weight direction | medium negative |
| Visible to user? | да — private notification (non-stigmatizing) |
| Admin visibility | да + audit log (Инв. 4) |
| Notes | первая admin-confirmed escalation |

### 7.14 `restriction_applied`

| Поле | Значение |
|---|---|
| Meaning | admin-confirmed restriction |
| Trigger | `restrict_user` admin action |
| Source | `admin_action` |
| Category | **Severe** |
| Weight direction | large negative (tier likely overridden к `restricted`) |
| Visible to user? | да — private notification |
| Admin visibility | да + audit log |
| Notes | gates взаимодействие |

### 7.15 `suspicious_velocity`

| Поле | Значение |
|---|---|
| Meaning | system-generated flag за unusual activity pattern |
| Trigger | velocity threshold exceeded |
| Source | `system_lifecycle` / `ai_assist` |
| Category | **Risk** |
| Weight direction | small risk |
| Visible to user? | **НЕТ** (soft friction может applied silently) |
| Admin visibility | да (Suspicious Activity Queue) |
| Notes | **не enforcement** — review trigger (Инв. 5) |

### 7.16 `circle_hosted_successfully`

| Поле | Значение |
|---|---|
| Meaning | circle / meeting hosted safely и reliably (cumulative threshold) |
| Trigger | derived metric — host completed N safe meetings |
| Source | `system_lifecycle` |
| Category | **Positive** |
| Weight direction | medium positive |
| Visible to user? | да через `Уже проводил встречи` / `Надёжный организатор` (P1) |
| Admin visibility | да |
| Notes | основной positive host signal |

---

## 8. Signal Classification v2

| Signal | Category | Strength | Public? | Admin? | Notes |
|---|---|---|:--:|:--:|---|
| `phone_verified` | Positive | Medium | ✅ (через badge) | ✅ | enables Проверен |
| `profile_completed` | Positive | Small | ✅ (через badge) | ✅ | onboarding milestone |
| `meeting_attended` | Positive | Small (cumulative) | ✅ (через badge bands) | ✅ | reliability building block |
| `circle_member_confirmed` | Positive | Small (per circle) | ✅ (own UI) | ✅ | belonging marker |
| `circle_hosted_successfully` | Positive | Medium | ✅ (через badge) | ✅ | host trust |
| `host_positive_feedback` | Positive | Small | ✅ через badge | ✅ | carefully weighted |
| New user (no signals) | Neutral | n/a | n/a | n/a | **не подозрителен** (§4.3) |
| `circle_left` | **Neutral** | None default | ❌ к other users | ✅ | Инв. 11 |
| `circle_paused` | **Neutral** | None default | ❌ к other users | ✅ | Инв. 11 |
| Cancelled request early | Neutral | None | n/a | ✅ | responsible |
| Low activity | Neutral | None | n/a | ✅ | not negative |
| `meeting_no_show` (single) | Neutral / Risk | Small | ❌ | ✅ | first neutral (US-INTRO-07) |
| Repeated no-shows | Risk | Medium pattern | ❌ | ✅ | soft friction |
| Repeated `report_received` | Risk | Medium pattern | ❌ | ✅ | admin review |
| Repeated `block_received` | Risk | Medium pattern | ❌ | ✅ | admin review |
| `suspicious_velocity` | Risk | Small (one) | ❌ | ✅ | system flag (Инв. 5) |
| AI-flagged content | Risk | Small | ❌ | ✅ | advisory only |
| Frequent host removals (host abuse) | Risk | Medium pattern | ❌ | ✅ | host accountability signal |
| `moderation_warning` (admin-confirmed) | Negative | Medium | ❌ public | ✅ | private to user |
| `host_negative_feedback` (validated) | Negative | Small | ❌ | ✅ | pattern + admin review |
| Message hidden for policy reason | Negative | Small | ❌ public | ✅ | sender sees state |
| `restriction_applied` | Severe | Large | ❌ public | ✅ | tier override |
| `ban_user` (`profile_status = 'banned'`) | Severe | Permanent | ❌ public | ✅ | auth gate |
| Confirmed scam / stalking | Severe | Permanent | ❌ public | ✅ | safety priority |
| `circle_removed_for_safety` (user actor) | Severe | Large | ❌ public | ✅ | audit obligation (Инв. 4) |

> **Important: Risk signals — не proof.** Они inform review, friction и moderation priority (Инв. 5).

---

## 9. Trust Tiers v2

Per Schema v2 `trust_tier` enum.

### 9.1 `new`

| Поле | Значение |
|---|---|
| Meaning | новый user, limited history |
| Default | да — все users start здесь |
| Connotation | **не negative** (§4.3) |
| UX | без special badge или soft "Новый участник" (если useful — open §37) |

### 9.2 `verified`

| Поле | Значение |
|---|---|
| Meaning | user completed required verification + profile steps |
| Conditions | email + phone verified + onboarding complete |
| UX badge | **Проверен** |

### 9.3 `reliable`

| Поле | Значение |
|---|---|
| Meaning | attends meetings reliably; low no-show pattern; no serious moderation issues |
| Conditions | minimum attended meetings (threshold — open §37); low no-show rate; no active restrictions |
| UX badge | **Надёжный участник** |

### 9.4 `trusted_host`

| Поле | Значение |
|---|---|
| Meaning | hosted safe circles / meetings; no serious host safety issues; consistent rhythm |
| Conditions | hosted N successful meetings; low cancellation rate; no serious reports; stable circle history |
| UX badge | **Уже проводил встречи** или **Надёжный организатор** (P1, carefully validated) |

### 9.5 `restricted`

| Поле | Значение |
|---|---|
| Meaning | internal restricted state |
| UX | **никакой public label** |
| Effects | limited actions per restriction policy |

### 9.6 `suspended`

| Поле | Значение |
|---|---|
| Meaning | internal serious limitation |
| UX | **никакой public label** |
| Effects | bounded access; severe limitation pending review |

### 9.7 Tier rules (binding)

- **Trust tier не должен become public hierarchy** (Инв. 10);
- **Public cues contextual и soft** (badges, не tier name as ranking);
- **`restricted` / `suspended` hidden** from other users (Инв. 12);
- **`new` не negative** — нет соблазна для других users "избегать новых";
- **Tier change traceable** через `trust_events` (Инв. 4).

---

## 10. Public Trust Badges v2

### 10.1 Allowed badges

| Badge | Meaning | Source | Visibility | Conditions | Risks |
|---|---|---|---|---|---|
| **Проверен** | user completed required verification | `verification_level >= phone_verified` + onboarding complete | safe public view | email + phone verified | over-promise (handle copy carefully — не imply gov ID) |
| **Надёжный участник** | history attending meetings reliably | derived от `attended_meetings_count` + no-show pattern + restriction state | safe public view | minimum N attended meetings + low no-show rate + no active restrictions | thresholds — open §37 |
| **Уже проводил встречи** | user has hosted circle meetings before | `hosted_meetings_count >= 1` | safe public view | hosted at least 1 completed meeting | thresholds — open §37 |
| **Надёжный организатор** | host with successful safe hosting history | derived от `circle_hosted_successfully` events | safe public view (P1) | hosted N successful meetings + low cancellation rate + no serious safety reports + stable circle history | careful — avoid host popularity ranking |
| **Участвовал во встречах** | real participation history | `attended_meetings_count >= 1` | safe public view | attended at least 1 confirmed meeting | low risk |

### 10.2 Badge rules (binding)

- **Badges positive / neutral only**;
- **No public negative badges** (Инв. 12);
- **No numeric score** (Инв. 3);
- **No no-show / report / block counters** (Инв. 10, 12);
- **No "top" или popularity badges** (Анти-дрейф §17).

### 10.3 Forbidden badges (struck-through — никогда не implement)

- ~~Низкое доверие~~;
- ~~Часто жалуются~~;
- ~~Часто пропускает~~;
- ~~Исключён из кругов~~;
- ~~Рискованный пользователь~~;
- ~~Trust score 74~~;
- ~~Популярный~~;
- ~~Top rated~~;
- ~~High chemistry~~;
- ~~Часто получает приглашения~~;
- ~~Любимец организаторов~~.

---

## 11. Internal Trust Score v2

### 11.1 Important rules (binding — Инв. 3)

- **Internal only**;
- **Никогда returned к normal mobile client**;
- **Не в public profile**;
- **Не в analytics как raw score**;
- **Не shown к host as number**;
- **Не used как sole reason для serious enforcement** (Инв. 5).

### 11.2 Uses

- **moderation prioritization** (queue ordering);
- additional verification friction (extra steps для low-trust);
- velocity limits (tier-based rate-limit adjustments);
- manual review triggers;
- host abuse detection;
- risk pattern detection.

### 11.3 Principles

- **Start neutral** — новый user не подозрителен;
- **Positive signals accumulate slowly** — медленный rise;
- **Risk patterns matter более чем single events** (Инв. 5);
- **Severe moderation overrides score** — tier change может skip scoring;
- **Recent behavior matters more** — recency weighting;
- **Old minor negatives decay** (§26);
- **Leaving / pausing not negative by default** (Инв. 11).

### 11.4 Recommendation

> **Do not build complex scoring перед beta data.** Start with rule-based internal tiers + `trust_events`. Compute score после first cohort gives signal. Math formula — open §37 #4.

---

## 12. Trust Score Guardrails v2

Binding guardrails (1–14):

1. **Never show raw score** (Инв. 3);
2. **Never expose score в public APIs**;
3. **Never send score в analytics** (privacy boundary);
4. **Never use score как sole reason** для serious enforcement (Инв. 5);
5. **Never punish на single unverified report** (Инв. 5);
6. **Never punish leaving / pausing circle by default** (Инв. 11);
7. **Never create public rejection / removal / no-show labels** (Инв. 12);
8. **Allow admin review** для severe consequences (Инв. 5);
9. **Keep scoring explainable** — каждый change traceable к `trust_events`;
10. **Avoid demographic-sensitive signals** (no age / gender / geo biases);
11. **Avoid popularity-based ranking** (Анти-дрейф §17);
12. **Avoid dating-style compatibility scoring** (Hard rule 6);
13. **New users not suspicious by default** (§4.3);
14. **Score changes traceable** к `trust_events` (Инв. 4).

---

## 13. Verification Model v2

### 13.1 Verification levels (Schema v2 `verification_level` enum)

| Level | Meaning |
|---|---|
| `none` | basic account only |
| `email_verified` | email подтверждён |
| `phone_verified` | stronger signal; может unlock request place или approval |
| `identity_reviewed` | P1 — manual / stronger verification (reserved) |

### 13.2 Effects

- может unlock requesting a place;
- может unlock hosting (открыто §37);
- может support `Проверен` badge;
- reduces fake / spam risk;
- gates certain Edge Function calls (e.g., `request_circle_place`).

### 13.3 Open decision

**Phone verification timing** — before request place или before approval? (PRD v2 §27 #2; Architecture v2 §33 #14; RLS v2 §35 #1).

**Recommendation:** для safety-heavy beta, require phone verification **before requesting a place** или **before being approved for intro meeting**. Exact timing remains product decision до validation.

---

## 14. Profile Completeness Model v2

### 14.1 Inputs

- display name;
- city / area;
- interests;
- vibe (primary signal — Core v2 §8);
- preferred rhythm;
- comfort composition preference;
- group size comfort;
- basic bio;
- photo (min 1, AI-moderated);
- safety principles accepted;
- verification status (separate signal).

### 14.2 Use cases

- onboarding gate;
- request place eligibility (open threshold §37);
- host confidence (safe applicant context);
- moderation context (admin investigates incomplete профили со spam patterns).

### 14.3 Rules

- **Profile completeness visible к owner** (own profile);
- safe completeness cue може быть host-visible (band, не raw %);
- **Not public judgment** (Инв. 10);
- **No attractiveness framing** (Hard rule 6; Manifesto §7);
- **No dating profile optimization** language.

### 14.4 Open decision

**Minimum profile completeness** required перед request place (open §37 #3).

---

## 15. Meeting Reliability

### 15.1 Positive inputs

- RSVP yes и attended;
- RSVP no in advance (responsible cancellation);
- repeated attendance;
- consistent participation;
- excused absence (with valid reason).

### 15.2 Risk inputs

- no-show (без excuse);
- repeated no-shows (pattern);
- last-minute cancellation pattern;
- repeated RSVP yes → no-show.

### 15.3 Rules (binding)

- **One no-show не identity** (US-INTRO-07);
- **No-show internal only** (Инв. 3);
- **No public negative label** (Инв. 12);
- **Repeated no-shows могут create soft friction** (rate-limit RSVPs / request cooldown);
- **User should have way to explain / dispute later** (P1, open §37 #11).

### 15.4 Possible public badge derivation

- **Надёжный участник** после enough attended meetings + low no-show pattern + no active restrictions (threshold — open §37 #5).

---

## 16. No-show Logic v2

### 16.1 Sources

- host marks no-show через `update_attendance`;
- user attendance self-confirmation (если product allows — open §37);
- system prompt (timing);
- admin review если disputed (P1).

### 16.2 Risks

- host abuse (host marks no-show unfairly);
- legitimate reasons (illness, emergency);
- meeting cancellation confusion (RSVP'd before cancel);
- unfair punishment.

### 16.3 Lifecycle

```
meeting scheduled
  → user RSVP'ит 'going'
  → meeting completed
  → attendance confirmation prompt (host UI)
  → status: attended / no_show / excused_absence
  → trust_event created (per §7.3, §7.4)
  → user_trust_summary updated (eventually consistent)
```

### 16.4 Rules (binding)

- **No-show internal** (Инв. 3);
- **Repeated no-shows могут limit requests / RSVPs / hosting** (soft friction);
- **Dispute flow P1** — открытый §37 #11;
- **No public label** ever (Инв. 12).

### 16.5 Open decisions

1. Кто может mark no-show — host only? attendee self-confirmation возможна?
2. Attendee self-confirmation timing?
3. Dispute в MVP или P1?
4. No-show decay window — months? quarter?

---

## 17. Circle Membership Trust

### 17.1 Positive

- становится `member` после intro;
- attends recurring meetings (continuity);
- участвует без reports;
- pauses responsibly (signaling, не drama);
- leaves quietly if needed.

### 17.2 Neutral (binding — Инв. 11)

- pauses (`circle_paused`);
- leaves (`circle_left`);
- changes circles;
- belongs to multiple circles (Инв. 16).

### 17.3 Risk

- `removed_for_safety` (user был actor);
- repeated `removed_for_safety` (pattern);
- repeated conflicts;
- repeated host / member reports converging.

### 17.4 Rules (binding)

- **Membership history internal only** (Инв. 11, 12);
- **No public "removed / left / rejected" history** (Инв. 12);
- **No betrayal mechanics** (Инв. 11);
- **Belonging к multiple circles нормально** (Инв. 16);
- **`circle_membership_history` admin-only** (Schema v2 §9.3).

---

## 18. Host Trust Model v2

### 18.1 Positive host signals

- `circle_hosted_successfully` (cumulative);
- recurring meetings completed;
- low cancellation rate;
- members attend repeatedly (circle health);
- no serious reports;
- healthy membership review patterns;
- safe location handling (никаких exact location leaks).

### 18.2 Risk host signals

- repeated removals of members (pattern);
- unsafe circle descriptions (AI-flagged);
- comfort composition complaints (Core v2 §21);
- high report rate against circle;
- misleading circle details;
- frequent last-minute cancellations;
- abusive approval / removal behavior;
- pushing users к external channels (off-platform recruitment).

### 18.3 Host privileges affected

- ability to create circles (rate-limited);
- number of active circles (cap — open §37);
- capacity limits per circle;
- first-time host review (`pending_review` mandatory — open §37 #6);
- `trusted_host` badge;
- ability to host без manual review.

### 18.4 Rules (binding)

- **Host control balanced by moderation** — host не abused autonomous;
- **`trusted_host` earned carefully** (high bar);
- **Host abuse — safety risk** — triggers admin review (Инв. 5);
- Frequent removals → internal host-accountability signal через `suspicious_activity_events`.

---

## 19. Applicant / Requester Trust Context for Hosts

### 19.1 Host-visible safe signals

- **safe public profile** (display name, photo, vibe, bio);
- profile completeness (band only);
- **verification badge**;
- **attended meetings badge** (если earned);
- **reliable participant badge** (если earned);
- **intro note** (`intro_note` text);
- shared circle / meeting history (P1).

### 19.2 NOT visible (binding)

- ~~raw trust score~~ (Инв. 3);
- ~~report count~~ (Инв. 12);
- ~~block count~~ (Инв. 12);
- ~~no-show count~~ (Инв. 12);
- ~~internal risk score~~;
- ~~moderation notes~~;
- ~~private phone / email / DOB~~;
- ~~removal / rejection history~~ (Инв. 12);
- ~~other circles by default~~ (Инв. 13).

### 19.3 Principle

> **Host sees enough для fit protection, не internal enforcement data.** Host решает на основе vibe match + safe context, не на основе raw signals.

---

## 20. Moderation Integration v2

### 20.1 Moderation создаёт trust_events

- `report_received` (per `report_content` Edge Function);
- `moderation_warning` (per admin `warn_user`);
- `restriction_applied` (per admin `restrict_user`);
- `circle_removed_for_safety` (per admin `remove_circle` если user host);
- `suspicious_velocity` (per system flag);
- `host_negative_feedback` (если validated через admin process — P1);
- `meeting_no_show` (per attendance flow).

### 20.2 Trust помогает moderation

- **prioritizing repeated patterns** (queue ordering);
- **identifying host abuse** (pattern detection);
- **highlighting repeated no-show** (soft friction trigger);
- **triggering manual review** (high-risk users);
- **adding soft friction** (rate-limit adjustments per tier).

### 20.3 Rules (binding — Инв. 5)

- **Report alone не guilt**;
- **Block alone не proof**;
- **AI flag alone не proof**;
- **Serious action requires human / admin review** (Инв. 5);
- **Trust supports moderation, не replaces it**.

---

## 21. Suspicious Behavior & Velocity Signals v2

### 21.1 Examples

- too many membership requests quickly;
- repeated rejected / waitlisted requests (different circles);
- repeated chat messages quickly (spam);
- repeated reports from different users (target);
- repeated blocks received (target);
- frequent profile changes (gaming);
- many circle creations quickly (host spam);
- invite abuse (code enumeration attempts);
- many host removals (host abuse);
- repeated no-shows (reliability risk);
- comfort composition violations (Core v2 §21).

### 21.2 Soft restrictions (P0)

- request cooldown (per user per circle / per hour);
- chat cooldown (rate-limit per minute);
- RSVP friction (extra confirmation step после многих flips);
- extra verification step (phone re-check);
- manual review trigger.

### 21.3 Rules (binding — Инв. 5)

- **`suspicious_velocity` — risk signal, не enforcement**;
- **Severe enforcement requires review**;
- **Soft friction may be applied automatically** (rate-limit slowdown);
- **AI false positives recoverable** — admin override.

---

## 22. Trust Effects on Product Access v2

| Trust State / Signal | Possible Product Effect | Publicly Visible? | Requires Admin Review? | Notes |
|---|---|:--:|:--:|---|
| `phone_verified` | can request place / host (per policy) | ✅ через `Проверен` badge | ❌ | gates Edge Function |
| `profile_completed` | can access full discovery | partial (badge / band) | ❌ | onboarding gate |
| `reliable` tier | `Надёжный участник` badge | ✅ badge | ❌ | derived |
| Repeated no-show pattern | request / RSVP cooldown (soft friction) | ❌ | ❌ (review если расширяется) | internal |
| `suspicious_velocity` flag | soft limit; manual review trigger | ❌ | ⚠️ optional review | Инв. 5 |
| `restriction_applied` | chat / request / hosting limited | ❌ public | ✅ admin imposed | private notif to user |
| `banned` | no interaction; force sign-out | ❌ public | ✅ admin imposed | auth gate |
| Host frequent removals | host review / friction; admin trigger | ❌ | ✅ admin review | host accountability |
| `removed_for_safety` (user) | severe internal signal | ❌ public | ✅ admin (Инв. 4 audit) | tier override |
| `circle_left` / `circle_paused` | **no effect by default** | ❌ к other users | ❌ | Инв. 11 (binding) |

### 22.1 Important

- **Severe restrictions reviewable** — appeal flow P1;
- **Affected user получает private explanation** где appropriate;
- **Reasons не exposed other users** (Инв. 12).

---

## 23. Trust UX Guidelines v2

### 23.1 Principles

- positive и contextual;
- **no numeric scoring** (Инв. 3);
- **no shame labels** (Инв. 12);
- **no popularity ranking** (Инв. 10);
- **no dating desirability language** (Hard rule 6);
- explain badges simply;
- trust cues **calm, не paranoid**.

### 23.2 Good examples

- «Проверен»
- «Надёжный участник»
- «Уже проводил встречи»
- «Участвовал во встречах»

### 23.3 Bad examples (struck-through)

- ~~«Trust score: 82»~~;
- ~~«Low trust»~~;
- ~~«Often reported»~~;
- ~~«No-show risk»~~;
- ~~«Top rated»~~;
- ~~«Popular host»~~;
- ~~«High chemistry»~~;
- ~~«Исключался из кругов»~~;
- ~~«Часто пропускает»~~.

### 23.4 Microcopy examples

**Проверен** (badge tap → explainer):

> «Пользователь прошёл базовую проверку.»

**Надёжный участник:**

> «У пользователя есть история посещения встреч, на которые он записывался.»

**Уже проводил встречи:**

> «Этот организатор уже проводил встречи круга.»

**Location / trust connection (на Circle Detail):**

> «Точное место встречи открывается только после подтверждения доступа.»

---

## 24. Trust and Privacy v2

### 24.1 Rules (binding)

- **Raw score internal only** (Инв. 3);
- **`trust_events` internal only** (RLS v2 §21);
- **`user_trust_summary` internal only**;
- **Public badges derived safely** (computed view);
- **Avoid sensitive analytics** (privacy boundary);
- **Avoid raw trust data в notifications**;
- **Host sees safe signals only** (§19);
- **Admin sees context для moderation**;
- **User может see positive own progress**;
- **No hidden risk labels** shown к users;
- **No public membership shame** (Инв. 12).

### 24.2 User-facing own trust может show

- profile completeness band;
- verification status;
- badges earned (own);
- meeting attendance history (own, framed positively).

### 24.3 Risky / not allowed (struck-through)

- ~~raw score (own или other)~~;
- ~~report count~~ (Инв. 12);
- ~~block count~~ (Инв. 12);
- ~~internal moderation score~~;
- ~~no-show count как shame metric~~ (Инв. 12);
- ~~removal history~~.

---

## 25. Fairness & Abuse Prevention v2

### 25.1 Fairness risks

- false reports (target abuse);
- biased host feedback (gender / age / demographic);
- host abuse (host removes too much / too often);
- new users lacking history (cold-start);
- social popularity bias (well-connected users gain trust faster);
- over-penalizing no-shows (life happens);
- AI false positives;
- users gaming badges (attendance just для badge);
- comfort composition misuse (gender weaponization);
- women-only misrepresentation (gender misrep);
- over-exclusivity of circles (gatekeeping pattern).

### 25.2 Mitigations

- **Do not overreact к single signal** (Инв. 5);
- **Use patterns** (not single events);
- **Human review для severe actions** (Инв. 5);
- **Allow recovery over time** (§26 decay);
- **Avoid demographic-sensitive scoring** (no age / gender / city correlations в score);
- **No popularity metrics как trust** (Инв. 10);
- **Keep trust explainable** (changes traceable к `trust_events`);
- **Monitor false positives** (admin dashboards track);
- **Host behavior also evaluated** (host accountability signals).

---

## 26. Recovery & Decay v2

### 26.1 Principles

- **Old minor risk signals decay** after time;
- **Positive repeated attendance rebuilds reliability**;
- **Restrictions могут expire / review**;
- **No-show не permanent scar** (US-INTRO-07);
- **Severe safety incidents persist longer** (но восстановление возможно после admin review);
- **Leaving / pausing neutral** (Инв. 11);
- **Public trust should not punish forever** (Manifesto §17 — "Trust is recoverable from mistakes").

### 26.2 Possible decay model (high-level)

- minor risk signals decay (e.g., 6 months);
- repeated recent issues matter more;
- severe moderation persists (no automatic decay);
- positive attendance improves reliability gradually.

### 26.3 Open decision

**Exact decay windows** — open §37 #15.

---

## 27. Trust Event Creation Rules v2

| Trigger | `trust_event_type` | Created By | Requires Review? | Updates Summary? | Notes |
|---|---|---|:--:|:--:|---|
| `complete_onboarding` reaches threshold | `profile_completed` | Edge Function | ❌ | ✅ | enables Проверен candidate |
| Phone verification success | `phone_verified` | Verification flow | ❌ | ✅ | may gate request_place |
| Meeting attendance confirmed | `meeting_attended` | `update_attendance` Edge Function | ❌ | ✅ | host confirms |
| No-show recorded | `meeting_no_show` | `update_attendance` Edge Function | ❌ для first; ⚠️ для pattern | ✅ | first neutral (US-INTRO-07) |
| Membership confirmed | `circle_member_confirmed` | `confirm_circle_membership` Edge Function | ❌ | ✅ | belonging marker |
| User pauses | `circle_paused` | `pause_membership` Edge Function | ❌ | ✅ (но weight = 0) | **neutral** (binding — Инв. 11) |
| User leaves | `circle_left` | `leave_circle` Edge Function | ❌ | ✅ (но weight = 0) | **neutral** (binding — Инв. 11) |
| Circle / member removed for safety | `circle_removed_for_safety` | Admin action | ✅ (Инв. 4 audit) | ✅ | severe; tier override possible |
| Host feedback positive (P1) | `host_positive_feedback` | Host action | optional | ✅ | carefully weighted |
| User report created | `report_received` | `report_content` Edge Function | ❌ для one; ✅ для pattern | ✅ | risk, не proof |
| User blocked | `block_received` | `block_user` Edge Function | ❌ для one; ✅ для pattern | ✅ | risk, не proof |
| Admin warning | `moderation_warning` | Admin `warn_user` action | ✅ (Инв. 4) | ✅ | private notif |
| Admin restriction | `restriction_applied` | Admin `restrict_user` action | ✅ (Инв. 4) | ✅ | severe |
| Velocity threshold exceeded | `suspicious_velocity` | System flag | ⚠️ optional | ✅ (small weight) | soft friction may apply |
| Circle hosted safely (cumulative) | `circle_hosted_successfully` | Derived metric | ❌ | ✅ | enables host badges |

### 27.1 Important

- **`circle_paused` и `circle_left` neutral by default** (binding — Инв. 11);
- **`trust_events` append-only** — no UPDATE / DELETE (Schema v2 §14.1);
- **Summary derived** from events (eventually consistent через Edge Function recompute или scheduled job).

---

## 28. Trust Summary Update Model v2

### 28.1 Fields (Schema v2 §14.2)

- `trust_score_internal` (numeric — never exposed);
- `trust_tier` (enum — derived);
- `attended_meetings_count` (cumulative);
- `hosted_circles_count` (cumulative);
- `hosted_meetings_count` (cumulative);
- `no_show_count` (cumulative — internal Инв. 3);
- `report_count` (cumulative — internal Инв. 12);
- `block_count` (cumulative — internal Инв. 12);
- `last_trust_event_at` (timestamp).

### 28.2 Update principles

- **Derived from `trust_events`** + related tables;
- Edge Function **`recompute_trust_summary`** (on every trust event) или scheduled job (P1);
- **Manual admin correction only если needed** (audit logged — Инв. 4);
- **Changes traceable** к specific `trust_events`;
- **Severe moderation overrides tier** (e.g., `ban_user` → tier = `suspended` regardless of score);
- **MVP starts rule-based** (см. §28.3).

### 28.3 Example rule-based tiers (MVP)

| Tier | Conditions (illustrative — finalize в Sprint 2) |
|---|---|
| `new` | default; no overriding signals |
| `verified` | `profile_completed` + `phone_verified` events present |
| `reliable` | `attended_meetings_count >= N` (threshold open §37 #5) + `no_show_count / attended_meetings_count <= X%` + no active `restriction_applied` + no recent `circle_removed_for_safety` |
| `trusted_host` | `hosted_meetings_count >= M` (threshold open §37) + low cancellation rate (derived) + no serious safety reports + stable circle history (e.g., >3 months) |
| `restricted` | active `restriction_applied` |
| `suspended` | active severe limitation (e.g., recent `circle_removed_for_safety` + admin escalation) |

### 28.4 Important

> **Do not define final math formula yet.** Formula требует beta data + admin review of edge cases. MVP — rule-based + manual tuning.

---

## 29. Public Badge Eligibility v2

### 29.1 Проверен

**Conditions:**

- email verified;
- phone verified если required (timing — open §37 #1);
- onboarding complete.

### 29.2 Надёжный участник

**Conditions:**

- attended at least **N** meetings (threshold open — likely 3–5);
- low no-show pattern (no-show rate < some %, threshold open);
- no active restrictions;
- no recent serious moderation (e.g., last 6 months).

### 29.3 Участвовал во встречах

**Conditions:**

- attended at least **1** confirmed meeting;
- low bar — encourage participation.

### 29.4 Уже проводил встречи

**Conditions:**

- hosted at least **1** completed circle meeting.

### 29.5 Надёжный организатор (P1, careful)

**Conditions (illustrative):**

- hosted **N** successful meetings (threshold open);
- low cancellation rate (derived);
- no serious safety reports;
- stable circle history (e.g., >3 months active).

### 29.6 Open thresholds

**Exact N / X thresholds** finalized после beta data (§37 #5, #7).

---

## 30. Anti-patterns v2

**Forbid (binding):**

- ~~public numeric trust score~~ (Инв. 3);
- ~~public star ratings of people~~ (Hard rule 5);
- ~~public negative badges~~ (Инв. 12);
- ~~public no-show labels~~ (Инв. 12);
- ~~public removal / rejection labels~~ (Инв. 12);
- ~~«часто покидает круги»~~ (Инв. 11);
- ~~«исключён из кругов»~~ (Инв. 12);
- ~~betrayal mechanics~~ (Инв. 11);
- ~~hotness / attractiveness signals~~ (Hard rule 6);
- ~~dating compatibility score~~ (Hard rule 6);
- ~~trusted leaderboard~~ (Инв. 10);
- ~~popularity ranking~~ (Инв. 10, Анти-дрейф §17);
- ~~"who viewed me"~~ (Анти-дрейф);
- ~~auto-ban from AI-only signal~~ (Инв. 5);
- ~~permanent punishment from one no-show~~ (US-INTRO-07);
- ~~host-only negative feedback causing severe penalty без admin review~~;
- ~~exposing internal trust reasons к other users~~ (Инв. 12);
- ~~trust как social status~~ (Инв. 10).

---

## 31. Trust System Examples v2

### Example 1 — New user becomes verified

Алина (Persona 1 — PRD v2 §3.2) completes onboarding, verifies phone. System creates `profile_completed` + `phone_verified` events. `trust_tier` derived: `verified`. **Проверен** badge surfaces. Алина видит badge на своём профиле.

### Example 2 — Reliable circle member

Марк attends 4 meetings of his slow brunch circle over 2 months. 0 no-shows. No reports. System accumulates `meeting_attended` events. `trust_tier` derives: `reliable`. **Надёжный участник** badge appears. Other members видят badge (через safe profile view).

### Example 3 — User pauses circle

Денис ставит участие на паузу из-за work travel. System creates `circle_paused` event with **weight = 0**. **No trust impact.** No public signal. Other members see at most «состав обновился» (если состав изменился).

### Example 4 — User leaves circle

Лиза quietly leaves круг which не fit. System creates `circle_left` event with **weight = 0**. **No trust impact.** No betrayal mechanic. Other members see at most «состав обновился». Лиза's safe profile **не shows** что она left.

### Example 5 — One no-show

Игорь RSVPs going, но faces emergency. No-show. Host confirms. System creates `meeting_no_show` event with **minimal weight для first occurrence**. Internal only. **No public label** (Инв. 12). Maybe soft reminder / nudge UX на next RSVP. **Not identity** (US-INTRO-07).

### Example 6 — Repeated no-shows

Same user no-shows на 3 of 5 meetings в 2-month window. Pattern recognized. `suspicious_velocity` or escalated `meeting_no_show` events accumulate. **Soft friction may apply** — RSVP requires extra confirmation, request cooldown. **Still internal**. No public label.

### Example 7 — Report received

User submits report against another user. System creates `report_received` event. Risk signal recorded. **No immediate public effect.** Moderation queue triggered. Если report dismissed → no action. Если pattern emerges (multiple reports) → admin review.

### Example 8 — Host with safe recurring circle

Катя hosts circle for 4 months. 6 successful meetings, low cancellation rate, no serious reports. System accumulates `circle_hosted_successfully` (cumulative threshold met). Tier derived: `trusted_host`. **Уже проводил встречи** badge surfaces. Eventually **Надёжный организатор** (P1).

### Example 9 — Host removes many members

Host A removes 5 members in 2 weeks (different circles). System recognizes pattern via `suspicious_activity_events`. `host_negative_feedback` candidate. **Internal flag — not public.** Admin reviews host accountability. Possible actions: warning, restriction, или (если abuse confirmed) `restrict_user` + audit.

### Example 10 — AI false positive

AI flags innocent circle description как potentially problematic. Status → `flagged`. Admin reviews → not actually issue. Admin overrides AI signal. `moderation_action_taken = dismiss_report`. Audit logged. **No automatic severe action** (Инв. 5). Host получает positive signal back if needed (e.g., flagged signal decays).

---

## 32. Trust Metrics v2

### 32.1 Product / internal metrics

- verified user rate (cohort %);
- profile completion rate;
- first meeting attendance rate;
- repeat meeting attendance rate;
- no-show rate (overall и per cohort);
- active circle members (count);
- circle retention (members still active after N weeks);
- host repeat rate (% hosts who host >1 circle);
- member retention (longitudinal);
- reports per 100 users;
- reports per circle (avg);
- blocks per 100 users;
- **moderation-confirmed report rate** (% of reports that resulted in action) — quality signal;
- **AI false positive rate** (admin overrides / total AI flags) — fairness signal;
- reliable participant badge rate;
- trusted host eligibility (% of hosts who qualify);
- pause / leave rate;
- removals by host;
- safety removals (по causes).

### 32.2 Important

> **Metrics improve safety и belonging, не public ranking.** Никакие metrics surface'аются users (Инв. 10). Все internal — для product / safety team.

---

## 33. Trust Analytics Boundary v2

### 33.1 Never send (binding)

- ~~raw `trust_score_internal`~~ (Инв. 3);
- ~~report descriptions~~ (Инв. 6);
- ~~moderation notes~~ (Инв. 4);
- ~~private trust metadata~~;
- ~~block / report counts как user-level public-like property~~ (Инв. 12);
- ~~phone / email / DOB~~ (Инв. 3);
- ~~exact location~~ (Инв. 1);
- ~~removal / rejection history~~ (Инв. 12).

### 33.2 Allowed

- badge earned event;
- verification completed;
- attendance confirmed (aggregate);
- `no_show_recorded` aggregate / internal event (count, no PII);
- trust tier changed (internal aggregate, no per-user в analytics surface);
- `suspicious_velocity_flagged` (count, no per-user details);
- `circle_member_confirmed`;
- `circle_paused` / `circle_left` как neutral operational events (если needed для retention metric).

### 33.3 Analytics events (taxonomy aligned with PRD v2 §22)

- `profile_completed`;
- `phone_verified`;
- `meeting_attendance_confirmed`;
- `no_show_recorded` (count metric — internal);
- `reliable_badge_earned` (when threshold crossed);
- `circle_member_confirmed`;
- `circle_hosted_successfully` (cumulative threshold crossed);
- `trust_tier_updated_internal` (internal only — admin observability);
- `suspicious_velocity_flagged` (count — internal);
- `moderation_warning_created` (count — internal).

---

## 34. Trust Testing Plan v2

### 34.1 Public visibility tests

- [ ] **`trust_score_internal` никогда не appears в public profile** (column-level audit);
- [ ] **`user_trust_summary` не accessible** от normal user (RLS test);
- [ ] **`trust_events` не accessible** от normal user (RLS test);
- [ ] **Host cannot see applicant raw score** (host UI test);
- [ ] **Public profile не shows** report / block / no-show counts (column audit);
- [ ] **No public negative badges** anywhere в UI;
- [ ] **No removal / rejection history** public (anywhere).

### 34.2 Badge tests

- [ ] **Проверен appears only после required verification** (email + phone if gated);
- [ ] **Надёжный участник appears only после eligibility** (attended N + low no-show);
- [ ] **Уже проводил встречи appears only после hosted meeting**;
- [ ] **Badges hidden / removed если active restriction applies**;
- [ ] **Badge derivation deterministic** (same input → same badges).

### 34.3 Trust event tests

- [ ] **Phone verification creates `phone_verified`** (event log check);
- [ ] **Attendance creates `meeting_attended`**;
- [ ] **No-show creates `meeting_no_show`**;
- [ ] **Membership confirmation creates `circle_member_confirmed`**;
- [ ] **Pause creates neutral `circle_paused`** (weight = 0 verified);
- [ ] **Leave creates neutral `circle_left`** (weight = 0 verified);
- [ ] **Report creates `report_received`** без automatic ban;
- [ ] **Admin warning creates `moderation_warning`**;
- [ ] **Restriction creates `restriction_applied`**.

### 34.4 Access effect tests

- [ ] **Restricted user limited** (Edge Function denies actions);
- [ ] **Banned user cannot interact** (auth gate);
- [ ] **New user не unfairly blocked** from onboarding (default `new` tier allowed);
- [ ] **Repeated no-show triggers defined friction only** (rate-limit applies, не ban);
- [ ] **Host repeated removals trigger review** (admin flag generated, не automatic ban).

### 34.5 Moderation integration tests

- [ ] **AI flag не final-ban** (status flagged → admin queue, не auto ban);
- [ ] **Serious action requires admin** (Edge Function blocks без admin actor);
- [ ] **Moderation action creates audit log и trust event** если appropriate (transactional).

---

## 35. Trust Review Checklist Before Beta v2

Binding — все обязательны:

- [ ] **Raw trust score hidden** (Инв. 3 — verified through column-level audit);
- [ ] **`trust_events` internal only** (RLS test passes);
- [ ] **`user_trust_summary` internal only** (RLS test passes);
- [ ] **Public badges positive / neutral** (no negative badges anywhere);
- [ ] **No public negative labels**;
- [ ] **No public ratings**;
- [ ] **No dating scoring**;
- [ ] **No public no-show labels** (no-show count not surfaced);
- [ ] **No public removal / rejection labels**;
- [ ] **No betrayal mechanics** (`circle_left` / `circle_paused` neutral verified);
- [ ] **Host sees safe requester context only** (no raw signals);
- [ ] **Reports не automatically punish** (admin review required);
- [ ] **No-show logic defined** (first neutral; pattern matters);
- [ ] **Verification rules defined** (timing decided — open §37 #1 unresolved blocks);
- [ ] **Reliable participant thresholds defined** или deferred (open §37 #5);
- [ ] **Trusted host thresholds defined** или deferred (open §37 #7);
- [ ] **Pause / leave neutral handling defined**;
- [ ] **Moderation integration defined**;
- [ ] **Analytics boundary checked** (no sensitive trust в analytics);
- [ ] **RLS protects trust tables** (Schema v2 + RLS v2 verified).

---

## 36. Trust Risks v2

| Risk | Impact | Mitigation |
|---|---|---|
| **Raw trust score leaked** | **critical** (Инв. 3) | column-level audit; RLS test; CI grep for `trust_score_internal` в client bundles |
| **Users perceive social credit** | high (Инв. 10) | UX research (Test Plan v2 §15); copy validation; badges positive-only |
| **Hosts over-rely on badges** | medium | host UX education; intro note framing fit-protection; admin review host removals |
| **False reports harm trust** | high | report alone не proof (§4.3); admin review для action; recovery / decay (§26) |
| **Host feedback bias** (gender / age / demographic) | high | host feedback validated через admin (§7.10); avoid demographic-sensitive signals (§12 #10) |
| **No-show unfairly penalized** | medium | first neutral (US-INTRO-07); pattern matters; dispute flow P1 (§16) |
| **New users disadvantaged** | medium | `new` tier не negative (§4.3, §9.1); soft friction только для confirmed risk |
| **AI false positives affect trust** | medium (Инв. 5) | AI assistive only; admin override; appeal flow (§25, §31 Example 10) |
| **Badges become status competition** | high (Инв. 10) | controlled badge set; no public ranking; no leaderboard |
| **Trust logic too complex before data** | medium | MVP rule-based (§28); defer math formula (§37 #4) |
| **Internal score used без review** | high (Инв. 5) | guardrail #4 (§12) — score не sole reason for serious enforcement |
| **Trust metadata leaks через analytics** | high | privacy boundary (§33); schema validation; observability alerts |
| **Leaving / pausing treated as negative** | high (Инв. 11) | binding rules (§7.6, §7.7, §15.4, §17.2); weight = 0 verified |
| **Removal history leaks** | high (Инв. 12) | `circle_membership_history` admin-only (Schema v2 §9.3); no public view exposes |
| **Women-only / comfort composition trust misunderstood** | high | gated на validation (Core v2 §21); copy non-fear-based; legal review |
| **Host removals used abusively** | high | host accountability signal через `suspicious_activity_events`; admin review (§18.4) |

---

## 37. Open Trust Questions v2

1. **Phone verification timing** — before request или before approval? (PRD v2 §27 #2; carries forward).
2. **Minimum profile completeness** для request? (open band threshold).
3. **Reliable participant badge — в first beta или later?** (depends на beta data velocity).
4. **Exact threshold для reliable participant** — `attended_meetings_count >= N`? N = 3? 5? Open until beta data.
5. **Threshold для trusted host** — `hosted_meetings_count >= M`? M = 3? 6? Open.
6. **How exactly to confirm attendance** — host-only? attendee self-confirm? Hybrid?
7. **Who can mark no-show** — host only? attendee self-confirm возможна?
8. **Can user dispute no-show?** — в MVP или P1? Через `meeting_attendance.dispute_status`.
9. **No-show decay window** — months? quarter? Year? Permanent?
10. **Should hosts see `attended_meetings_count` или only badge?** — likely badge only (no raw count) для consistency с no-public-ranking.
11. **Should members see each other's badges?** — likely yes для approved members (через `member_circle_details_view`).
12. **How to handle host feedback bias** (gender / age)? — Likely admin validation required для host_negative_feedback to become trust event (high bar).
13. **Should `profile_completeness` be host-visible?** — Band only? Specific %? Open.
14. **Should restrictions hide public badges?** — Likely yes: `restricted` user's badges hidden until restriction lifted.
15. **Can admin manually adjust trust tier?** — Yes, через audit-logged admin action.
16. **Should trust tier be stored или fully derived?** — Stored для performance; recomputed periodically (eventual consistency).
17. **Should `circle_left` и `circle_paused` be `trust_events` или only operational logs?** — Likely `trust_events` with weight = 0 (для admin auditability) but NOT contribute к score.
18. **How to track host abuse через repeated removals?** — `suspicious_activity_events` + admin review threshold (e.g., >5 removals в 30 days).
19. **How to avoid badges making circles feel elitist?** — UX guideline: badges contextual, не gating; never «only verified can join»; positioning matters.

---

## 38. Summary

**Trust System v2:**

- **Поддерживает recurring circle belonging** через repeated attendance signals.
- **Trust grows через repeated meetings и safe participation** — contextual, не popular.
- **Raw trust score остаётся internal** (Инв. 3).
- **Public trust cues — positive / neutral badges only** (Проверен / Надёжный / Hosted / Attended).
- **Leaving / pausing neutral by default** (Инв. 11, 12) — binding `weight = 0`.
- **No public shame, no social credit, no dating-style scoring** (Инв. 10, 12; Hard rules 5, 6).
- **AI assistive only** для trust signals (Инв. 5).
- **MVP starts rule-based** — final math formula deferred до beta data.

**Next required document:**

> Update [`/docs/09_MODERATION.md`](09_MODERATION.md) to **Moderation v2** ([doc 27 §24 Phase C step 10](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)).

Moderation v2 specifies:

- moderation queue policy / triage logic;
- AI assistive integration (Инв. 5);
- moderation_action_type usage rules;
- host accountability moderation;
- appeal flow (P1) design;
- audit log requirements (Инв. 4);
- safety removal protocol.

После Moderation v2 → Analytics v2 → **Phase D Backlog v2** → Sprint 2 phase gate (doc 22) → **Sprint 2 product implementation может начаться.**

---

> Reminder: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2) — **first source of truth**. Этот документ ему, Schema v2 и RLS v2 подчинён. Любой trust mechanic, нарушающий §12 guardrails, §30 anti-patterns, или Инв. 3 / 10 / 11 / 12 — **отклоняется на review**. Никаких raw scoring formulas в code до §28 implementation gate'ов и beta data.
