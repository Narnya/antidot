# User Flows v2 — Antidot

> **Status:** v2 (flows for closed beta, circle-first).
> **Owner:** Product / Design
> **Last updated:** 2026-05-30
> **First source of truth:** [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2).
> **Requirements source:** [`/docs/01_PRD.md`](01_PRD.md) (PRD v2).
> **Stories source:** [`/docs/02_USER_STORIES.md`](02_USER_STORIES.md) (User Stories v2).
> **Supersedes:** User Flows v1 (event-first, 2026-05-18).
> **Sequenced by:** [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md) §24 step 5.

---

## 1. Source of Truth

- Этот документ основан на [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2), [`/docs/01_PRD.md`](01_PRD.md) (PRD v2) и [`/docs/02_USER_STORIES.md`](02_USER_STORIES.md) (User Stories v2).
- **Product Core v2 — first source of truth.** При конфликте приоритет у Core.
- PRD v2 — second source of requirements; User Stories v2 определяют пользовательские задачи и ID, на которые ссылаются flows.
- Ни один flow **не может нарушать** safety-инварианты Product Core (§35 инварианты 1–16).
- Открытые вопросы — в [§14 Open UX Questions](#14-open-ux-questions), а не «додуманы» молча.

**Продукт — circle-first, не event-first.**

- **User-facing primitive:** Circle / Круг.
- **Operational primitive:** Meeting / Встреча круга.

Downstream-документы ([`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md), [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md), [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md), [`11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md)) на момент написания ещё в v0.1 (event-first) — известное состояние миграции. До их обновления авторитетны Core v2 + PRD v2 + Stories v2 + этот документ.

---

## 2. Global UX Principles

1. **Circle-first**, не event-first.
2. Users **discover circles, not people**.
3. **Vibe over interests.**
4. **Context before communication** (нет коммуникации без shared circle).
5. **Belonging over browsing.**
6. **Fit protection over human ranking.**
7. **No people marketplace** (Инв. 13).
8. **No open DMs** (Инв. 2).
9. **No public shame** (Инв. 12).
10. **No betrayal mechanics** (Инв. 11).
11. **Exact meeting location hidden** until approved access (Инв. 1).
12. **Safety visible, но не bureaucratic.**
13. **Circle membership is not ownership** (Инв. 15).
14. **Users may belong to multiple circles** (Инв. 16).
15. **Belonging is success**, не churn (Инв. 14).

---

## 3. Navigation Model v2

### 3.1 Guest Navigation

- Welcome
- Invite Code
- Waitlist
- Login
- Signup

### 3.2 Authenticated but not onboarded

- Onboarding stack only
- **Нет** Circle Discovery
- **Нет** My Circles
- **Нет** Circle Chat
- **Нет** Meeting Location

### 3.3 Onboarded User

Main tabs (mobile bottom nav):

- **My Circles** (если ≥1 active circle — это primary home)
- **Discover** (если 0 circles — primary; иначе secondary)
- **Create**
- **Notifications**
- **Profile**

> Логика home-приоритета — US-BELONG-01: при ≥1 active membership home defaults к My Circles; иначе к Discover.

### 3.4 Circle Member

В контексте конкретного круга:

- My Circles → Circle Home
- Next Meeting → Meeting Detail → RSVP
- Circle Chat
- Members / Safe Member Context
- Pause / Leave

### 3.5 Circle Host

Интегрирован в стандартную навигацию + специальные ветки:

- Create Circle
- My Hosted Circles
- Membership Requests
- Circle Management (edit / pause / archive)
- Meeting Management (schedule / edit / cancel)

### 3.6 Admin Navigation (web admin dashboard)

- Moderation Queue
- Reports
- Users
- Circles
- Meetings
- Messages
- Audit Logs
- Suspicious Activity

---

## 4. Global State Model v2

### 4.1 User states

- `guest`
- `authenticated_not_onboarded`
- `onboarded_user`
- `phone_unverified`
- `phone_verified`
- `restricted`
- `banned`
- `admin`

### 4.2 Circle relationship states (membership lifecycle — Core v2 §11)

```
none → requested → approved_for_intro_meeting → intro_attended → member
     → paused → left → removed → removed_for_safety → banned_from_circle
```

### 4.3 Circle states (lifecycle — Core v2 §12)

```
draft → pending_review → live → paused → full → archived → removed_for_safety
```

### 4.4 Meeting states (lifecycle — Core v2 §13)

```
scheduled → starting_soon → in_progress → completed → cancelled → removed_for_safety
```

### 4.5 RSVP states

- `not_responded`
- `going`
- `not_going`
- `maybe_later` (если политика круга разрешает; default — нет в P0)
- `checked_in` / `attended`
- `no_show`
- `excused_absence` (P1 — opt-in)

---

## 5. Core Product Loop Flow

### 5.1 Высокоуровневая последовательность

> **Find the right vibe → Request a place → Enter safely → Attend first meeting → Become part of the rhythm → Belong → Grow trusted graph.**

| # | Шаг | User action | System behavior | Screen / state | Safety / trust | Analytics |
|---|---|---|---|---|---|---|
| 1 | Find vibe | смотрит feed кругов | filter by vibe/rhythm/area; area-only | Circle Discovery | Инв. 9, 13 | `circle_discovery_viewed`, `circle_viewed` |
| 2 | Request place | tap «Запросить место» | create `CircleMembershipRequest`; rate-limit | Circle Detail → Request Modal | Инв. 6, Анти-дрейф 16 | `circle_join_requested` |
| 3 | Enter safely | host approves | transition state | Membership Pending → Intro Invitation | Инв. 8 (fit protection) | `circle_request_approved_for_intro` |
| 4 | Attend first meeting | RSVP, приходит | reveal exact location для intro | Intro Meeting Detail | Инв. 1, 9 | `meeting_location_revealed`, `intro_meeting_attended` |
| 5 | Become member | conversion после intro | `intro_attended` → `member` | Become Member Confirmation / Not This Time | Инв. 12 | `member_confirmed` |
| 6 | Belong | посещает регулярно | My Circles becomes home | My Circles → Circle Home | Инв. 14 | `my_circles_opened`, `repeat_meeting_attendance` |
| 7 | Grow trusted graph | повторяемое присутствие | accrue soft co-presence edges (internal) | none direct UI в MVP | Инв. 2, 10 | internal |

### 5.2 Textual diagram

```
Guest / User
  → Welcome / Invite / Login / Signup     [FLOW-001, FLOW-002]
  → Onboarding                            [FLOW-003]
  → Circle Discovery                      [FLOW-006]
  → Circle Detail                         [FLOW-007]
  → Request a Place                       [FLOW-008]
  → Membership Pending
  → Host Review                           [FLOW-009]
  → Intro Meeting Approved + Location Reveal  [FLOW-010]
  → Meeting RSVP                          [FLOW-011]
  → Attend Meeting
  → Become Member (or Not This Time)      [FLOW-012]
  → My Circles / Belonging Mode           [FLOW-013]
  → Circle Chat                           [FLOW-014]
  → Pause / Leave / Removal (when needed) [FLOW-015..017]
  → Report / Block / Admin Moderation     [FLOW-018..023]
```

---

## 6. Detailed User Flows

> Формат каждого flow ниже:
>
> - **Purpose**, **Primary Role**, **Related Stories**, **Entry Points**, **Preconditions**, **Main Flow** (нумерованные шаги), **Decision Points**, **Alternate Flows**, **Error / Edge Cases**, **Exit States**, **Analytics Events**, **Safety / Trust Constraints**, **Screens Needed**.

---

### FLOW-001 — Guest Signup / Login Flow

**Purpose.** Пустить нового пользователя в продукт через email / Google / Apple, с beta-гейтом.
**Primary Role.** Guest → User.
**Related Stories.** US-AUTH-01…09, US-BETA-01…07.
**Entry Points.** Welcome screen; deep-link to `/login`, `/signup`, `/invite`.
**Preconditions.** Доступ к app; нет активной сессии.

**Main Flow:**

1. **Welcome.** User видит landing с CTA: «Я в бете (есть код)» / «Встать в waitlist» / «Войти».
2. **Invite code (если новый).** User вводит invite code → validate → success → продолжить к Signup.
3. **Signup.** Email + password ИЛИ Google / Apple OAuth.
4. **Email verification.** При email — отправляется ссылка; user подтверждает.
5. **Session establish.** Token в secure storage; redirect к Onboarding (FLOW-003) если `authenticated_not_onboarded`.

**Decision Points.**

- Есть invite code? → Signup. Нет? → Waitlist (FLOW-002).
- Существующий аккаунт? → Login. Новый? → Signup.
- `banned` state на login? → принудительный sign-out + блокирующий экран (US-AUTH-08).

**Alternate Flows.**

- Login → returning user redirect: onboarded → main app; not onboarded → Onboarding resume.

**Error / Edge Cases.**

- Невалидный email → inline error.
- Wrong password → generic error (no enumeration).
- Email уже зарегистрирован → soft error «попробуйте войти».
- Banned mid-session → next API call → принудительный logout.

**Exit States.** `authenticated_not_onboarded` → Onboarding. `onboarded_user` → main app.

**Analytics Events.** `signup_started`, `signup_completed`, `login_completed`, `invite_code_required`, `invite_code_used`, `waitlist_joined`.

**Safety / Trust Constraints.**

- Service role не в client (Инв. 12).
- No user-enumeration в ошибках.
- Token в secure storage.

**Screens Needed.** Welcome · Invite Code · Waitlist (CTA) · Login · Signup · Email Verification · Auth Error.

---

### FLOW-002 — Invite-only Beta Access Flow

**Purpose.** Гейтить доступ к продукту через invite-коды.
**Primary Role.** Guest.
**Related Stories.** US-BETA-01…07.
**Entry Points.** Welcome → «Я в бете».
**Preconditions.** Guest.

**Main Flow:**

1. User вводит invite code.
2. System валидирует (single/limited use; rate-limit).
3. Valid → user продолжает к Signup (FLOW-001).
4. Invalid / used / revoked → soft error + CTA «встать в waitlist».
5. Waitlist signup → email collection → confirmation message.

**Decision Points.**

- Code valid и не использован → grant access.
- Code expired / revoked → suggest waitlist.

**Error / Edge Cases.**

- Brute-force попытка → rate-limit (опц. CAPTCHA P1).
- Race condition (двое одновременно используют one-use code) → first-write-wins.

**Exit States.** Valid code → к Signup. Invalid → Waitlist Signup.

**Analytics Events.** `invite_code_required`, `invite_code_used`, `waitlist_joined`.

**Safety / Trust Constraints.**

- Invite не enumerable.
- Waitlist не требует auth; PII минимальный (email only).
- No full app access без beta gate.

**Screens Needed.** Invite Code Entry · Invite Error · Waitlist Signup · Waitlist Confirmation.

---

### FLOW-003 — Onboarding for Circle Fit

**Purpose.** Получить от пользователя данные для circle fit (vibe / rhythm / comfort / size); установить ожидания о approval, location privacy, no DMs.
**Primary Role.** authenticated_not_onboarded User.
**Related Stories.** US-ONB-01…15.
**Entry Points.** После signup / login если onboarding не завершён.
**Preconditions.** Аутентифицирован.

**Main Flow (последовательность шагов):**

1. **Onboarding Welcome.** Короткий explainer: круги, ритм, approval как fit-protection, location privacy, no open DMs.
2. **Safety Principles.** Required gate; список принципов; «Принять и продолжить» (US-ONB-02).
3. **Basic Profile.** Display name; pronouns optional; birth year (age band internal).
4. **City / Area.** City picker → area bucket. **Area only**, не точная локация (Инв. 9).
5. **Interests.** Curated list (Core v2 §10).
6. **Vibe.** **Primary signal.** Curated vibe tags.
7. **Activity types** (внутри Interests или отдельным шагом — TBD §14 #14).
8. **Preferred rhythm.** weekly / biweekly / monthly / flexible.
9. **Comfort composition.** open mixed / female-friendly / women-only / no preference. **Copy non-fear-based** («комфортный состав»).
10. **Group size comfort.** 4–6 / 6–10 / 10+ buckets.
11. **Host willingness.** Opt-in.
12. **Photo.** Min 1 photo; AI moderation assistive.
13. **Verification placeholder.** Email (verified at signup); phone — timing per §14 #2.
14. **Profile preview.** User видит safe profile (mirror of staged-reveal).
15. **Completion.** Transition `authenticated_not_onboarded` → `onboarded_user`; redirect к main app (default home — Discover, пока 0 circles).

**Decision Points.**

- Phone verification timing: до request / до approval / до первой встречи (open §14 #2).
- Required profile completeness threshold (open §14 #3).
- Comfort composition P0 / P1 boundary (open §14 #5).

**Alternate Flows.**

- Resume after kill: step persistence; back to last step (US-ONB-13).
- Skip optional steps (host willingness, photo > 1) — allowed.

**Error / Edge Cases.**

- City не в supported list → «пока недоступно» + add-to-interest CTA.
- NSFW photo → soft block + retry.
- Не принял safety principles → нельзя продолжить.

**Exit States.** `onboarded_user`, home = Discover (если 0 circles), profile completeness tracked internally.

**Analytics Events.** `onboarding_started`, `onboarding_step_completed` (per step name), `safety_principles_accepted`, `onboarding_completed`, `profile_completed`.

**Safety / Trust Constraints.**

- **No exact user location** (Инв. 9).
- **No dating-style profile framing** (no attractiveness questions).
- **Comfort composition copy non-fear-based.**
- **Onboarding не должен ощущаться как dating profile creation.**
- Verification level — UI badge только (raw score hidden — Инв. 3).
- AI moderation на photo / profile text — assistive only (Инв. 5).

**Screens Needed.** Onboarding Welcome · Safety Principles · Basic Profile · City/Area · Interests · Vibe · Rhythm · Comfort Composition · Group Size · Host Willingness · Photo · Verification Placeholder · Profile Preview · Complete.

---

### FLOW-004 — Profile View / Edit Flow

**Purpose.** Просмотр и редактирование собственного профиля.
**Primary Role.** User.
**Related Stories.** US-PROF-01…07.
**Entry Points.** Profile tab; deep-link.
**Preconditions.** `onboarded_user`.

**Main Flow:**

1. User открывает My Profile.
2. Видит safe-profile view + edit affordances.
3. Tap Edit → field edit screens.
4. Manages photos (add / remove / reorder); каждое изменение → AI moderation assistive gate.
5. Manages vibe / interests / privacy.
6. Сохраняет изменения.

**Decision Points.**

- Unsafe photo flagged → Moderation Pending state до admin review.

**Error / Edge Cases.**

- Concurrent edit (multi-device) → last-write-wins (single-device assumption).
- Photo upload fail → retry.

**Exit States.** Профиль обновлён; safe profile синхронизирован.

**Analytics Events.** `profile_completed` (если threshold crossed), `profile_photo_added`, `profile_edited`.

**Safety / Trust Constraints.**

- **Raw trust score never visible** (Инв. 3).
- **No public ratings.**
- **No follower mechanics.**
- Unsafe content → moderation pending.

**Screens Needed.** My Profile · Edit Profile · Edit Photos · Edit Vibe/Interests · Privacy Settings · Moderation Pending.

---

### FLOW-005 — Safe Public Profile Flow

**Purpose.** Просмотр **чужого** safe profile (например, host'а или member'а одного с тобой круга).
**Primary Role.** User / Member / Host (просмотр другого).
**Related Stories.** US-PROF-08, US-PROF-09, US-PROF-10, US-PROF-11.
**Entry Points.** Из Circle Detail (host snippet), member list (approved/member), chat.
**Preconditions.** Контекст доступа есть (host публичен в circle detail; member list только после approval).

**Main Flow:**

1. User tap'ает на чужой профиль.
2. Видит **safe** fields: display name, photo, soft badges (Verified / Reliable / Hosted / Attended), pronouns если public, short bio.
3. **НЕ видит**: raw trust score, report/block counts, removal history, other circles, internal moderation notes.
4. Доступны actions: Report User, Block User.

**Decision Points.**

- Если user заблокирован → профиль invisible (как будто не существует в этом контексте).
- Если user banned → invisible.

**Error / Edge Cases.**

- Profile deleted между shows → graceful «профиль недоступен».

**Exit States.** Return to caller screen; или Report/Block flow (FLOW-018, FLOW-019).

**Analytics Events.** `safe_profile_viewed` (internal, low-detail).

**Safety / Trust Constraints.**

- **No private fields.**
- **No raw trust score** (Инв. 3).
- **No public negative labels** (Инв. 12).
- **No «other circles»** до P1+ product decision (Инв. 13).
- **No «message user» CTA** (Инв. 2; CLAUDE.md §10).

**Screens Needed.** Public Safe Profile · Report User · Block User.

---

### FLOW-006 — Circle Discovery Flow

**Purpose.** Помочь пользователю найти круг с правильным vibe.
**Primary Role.** User.
**Related Stories.** US-DISC-01…11.
**Entry Points.** Discover tab; main home для users с 0 circles.
**Preconditions.** `onboarded_user`.

**Main Flow:**

1. User открывает Discover.
2. System fetch'ит feed of `live` circles в его городе.
3. User видит cards с vibe / rhythm / area / size / comfort composition / host snippet / next-meeting summary (area only).
4. User может применить filters (vibe / category / rhythm / area / composition / group size).
5. Tap на card → Circle Detail (FLOW-007).

**Decision Points.**

- Empty feed → empty state + suggest «расширить фильтры» + опц. concierge CTA P1.
- 0 circles в локации → CTA «join waitlist для города» (P1).

**Error / Edge Cases.**

- Network error → cached state if any; «потяни вниз» refresh.
- Все circles `removed_for_safety` → empty state (US-DISC-10).

**Exit States.** Circle Detail (FLOW-007) или back to home.

**Analytics Events.** `circle_discovery_viewed`, `circle_filter_applied`, `circle_card_tapped`, `circle_viewed`.

**Safety / Trust Constraints.**

- **Users discover circles, not people** (Инв. 13).
- **No swipe** (анти-дрейф).
- **No exact location** (Инв. 1, 9).
- **No full member list** до approval (§15 PRD).
- **No public ratings.**

**Screens Needed.** Circle Discovery · Circle Card · Filters · Empty State · Circle Detail.

---

### FLOW-007 — Circle Detail Flow

**Purpose.** Дать пользователю достаточно контекста для решения «запросить место».
**Primary Role.** User (variants: not-requested / requested / approved / member / paused / removed / host).
**Related Stories.** US-CIRC-01…13.
**Entry Points.** Circle Discovery; deep-link; My Circles (для member).
**Preconditions.** Circle visible (`live` / `full` / `paused`).

**Main Flow:**

1. User открывает Circle Detail.
2. System определяет user-membership-state для этого круга.
3. **UI variant** показывается в зависимости от state (см. ниже).
4. Always visible: title, vibe, theme, rhythm, area only, size band, comfort composition, host safe profile, approval/fit-protection explanation, location privacy notice.
5. Report CTA visible always.

**UI variants (state-driven):**

| State | CTA / status block |
|---|---|
| not requested | «Запросить место» CTA |
| requested | «Запрос у хоста» status |
| waitlisted | «В waitlist» status |
| rejected | «Не в этот раз» (private) |
| approved_for_intro_meeting | Intro Invitation card; meeting CTA |
| member | Circle Home affordances (next meeting, chat) |
| paused | paused state copy |
| circle full | «Круг сейчас полон» + waitlist CTA если разрешено |
| circle paused | «Круг на паузе» |
| circle removed_for_safety | 404-like screen |
| host (own circle) | redirect к Host Dashboard |

**Decision Points.**

- Request CTA enabled: user `onboarded`, not banned/blocked, не уже requested/member, circle `live`.

**Error / Edge Cases.**

- Circle становится `full` пока пользователь читает → CTA disabled с copy.
- Circle переходит в `removed_for_safety` → 404-like.
- User banned mid-session → access denied.

**Exit States.** Request Place Modal (FLOW-008); Report Circle (FLOW-020); Circle Home (если member); back.

**Analytics Events.** `circle_viewed`, `circle_detail_section_viewed` (per section).

**Safety / Trust Constraints.**

- **No exact meeting location** до approval (Инв. 1).
- **No circle chat preview** до member access (Инв. 2).
- **No full member list** до approval (§15 PRD).
- **Approval framed as fit protection** (US-CIRC-09).

**Screens Needed.** Circle Detail — Not Requested · Requested · Waitlisted · Intro Approved · Member · Circle Full · Circle Paused · Circle Removed · Report Circle.

---

### FLOW-008 — Request a Place Flow

**Purpose.** Пользователь подаёт запрос на вход в круг.
**Primary Role.** User.
**Related Stories.** US-REQ-01…04, US-REQ-13, US-REQ-14.
**Entry Points.** Circle Detail → «Запросить место».
**Preconditions.** User `onboarded`, not banned/restricted, не заблокирован host'ом, не уже member/requested, circle `live`, верификация по политике.

**Main Flow:**

1. Tap «Запросить место».
2. System выполняет precondition-проверки.
3. Открывается Request Modal с (опц.) intro-note полем (≤500 chars).
4. User submit'ит.
5. System создаёт `CircleMembershipRequest`; rate-limit.
6. Состояние `requested`; user видит Membership Pending screen с copy «запрос у хоста».
7. Host получает notification (FLOW-009).

**Decision Points.**

- Not onboarded → redirect к Onboarding completion (US-AUTH-09).
- Phone not verified (если требуется) → Verification Required screen.
- Profile incomplete → Profile Completion Required screen.
- Circle full → Waitlist Offer (если разрешено) или disabled CTA.
- Blocked / banned / restricted → CTA hidden / disabled.
- Уже requested / member → Pending / Member screen.
- Circle `paused` / `removed_for_safety` → CTA hidden.

**Alternate Flows.**

- User отменяет запрос до host action (US-REQ-04).

**Error / Edge Cases.**

- Rate-limit hit → soft error «попробуйте позже».
- Race: circle стал `full` между UI и submit → server-side reject → state «full» shown.

**Exit States.** `requested`; or aborted; or Waitlist Offer flow.

**Analytics Events.** `circle_join_started`, `circle_join_requested`, `circle_join_cancelled`, `circle_join_blocked_by_requirement` (с reason category).

**Safety / Trust Constraints.**

- **Blocked users cannot request** блокирующего (US-REQ-13).
- **Banned / restricted cannot request** (US-REQ-14).
- **Intro-note** не «вступительное эссе».
- **Non-stigmatizing pending copy**.

**Screens Needed.** Request Place Modal · Intro Note · Membership Pending · Verification Required · Profile Completion Required · Waitlist Offer.

---

### FLOW-009 — Host Membership Review Flow

**Purpose.** Host рассматривает membership requests и решает: intro / member / soft-reject / waitlist.
**Primary Role.** Circle Host.
**Related Stories.** US-REQ-05…09, US-REQ-11/12, US-HOST-08 (для intro meeting), US-INTRO-04 (для intro confirm).
**Entry Points.** Host Dashboard → Membership Requests; push notification на new request.
**Preconditions.** Host владеет circle; circle `live`.

**Main Flow:**

1. Host открывает Membership Requests (per circle).
2. Видит queue с safe applicant context (display name, photo, vibe overlap, verification badge, intro-note).
3. Открывает Request Detail.
4. Решает:
   - **Approve for intro meeting** → `approved_for_intro_meeting`; user получает intro invitation (FLOW-010).
   - **Approve as member** (если circle policy = no-intro) → `member` directly.
   - **Soft reject «Не в этот раз»** → `rejected` (private); user видит non-stigmatizing copy.
   - **Waitlist** → `waitlisted`; user видит soft waitlist copy.
5. System отправляет user уведомление в соответствии с состоянием.

**Decision Points.**

- Circle policy: intro_meeting_required = true (default) / false (§27 PRD open).
- Composition rules: women-only circle получает male-id'd request → soft-reject или auto-not-eligible? (open §14 #5).

**Alternate Flows.**

- Host откладывает решение → request остаётся в queue.
- Host bulk-actions (P1).

**Error / Edge Cases.**

- Request уже cancelled пользователем → state shown «cancelled», action disabled.
- Suspicious request (US-SAFE-15 flag) → host видит assist badge; всё равно решает сам.

**Exit States.** `approved_for_intro_meeting` / `member` / `rejected` / `waitlisted`.

**Analytics Events.** `circle_request_reviewed`, `circle_request_approved_for_intro`, `circle_request_approved_as_member`, `circle_request_rejected`, `circle_request_waitlisted`.

**Safety / Trust Constraints.**

- **Host sees safe applicant context only** (no raw trust, no report/block counts).
- **Approve does not grant indefinite full membership unless policy says so.**
- **Rejected / waitlisted users do not see exact location** (FLOW-010 контролирует).
- **Rejection private; non-stigmatizing copy.**
- **Frequent removals по hosts → internal host-accountability signal** (Инв. 3).

**Screens Needed.** Host Circle Dashboard · Membership Requests · Request Detail · Approve for Intro · Approve as Member · Not This Time · Waitlist State.

---

### FLOW-010 — Intro Meeting Approval / Location Reveal Flow

**Purpose.** Approved user получает intro invitation; раскрывается exact location для одной встречи.
**Primary Role.** User (state `approved_for_intro_meeting`).
**Related Stories.** US-INTRO-01, US-INTRO-02, US-MEET-05, US-MEET-07, US-REQ-10.
**Entry Points.** Notification «вас одобрили на intro»; My Circles → pending intro card.
**Preconditions.** User `approved_for_intro_meeting`; meeting scheduled и не `removed_for_safety`.

**Main Flow:**

1. User получает push notification: «Хост подтвердил вас на первой встрече» (**без exact location** в push copy).
2. User открывает app → Intro Meeting Detail screen.
3. Видит meeting card: date, time, area, **exact location** (раскрыт scoped именно к этой встрече).
4. RSVP («Буду» / «Не смогу»).
5. (Опц.) Доступ к Circle Chat — per policy (open §14 #4):
   - **default proposal:** meeting-context only до conversion в member;
   - **alternative:** full chat read-only.
6. User attends meeting (FLOW-011).

**Decision Points.**

- Если approval отозвано до встречи → revoke location access.
- Meeting cancelled / removed_for_safety → access withdrawn; soft copy.
- Meeting timing — reveal window per circle policy (default — вся доступность с момента approval, но можно ограничивать).

**Alternate Flows.**

- User RSVP «Не смогу» → не attend; intro invitation can stay valid для следующей встречи (open: re-issue или auto-expire — §14).

**Error / Edge Cases.**

- Notification не получил → user видит state в Membership Pending → upgrade.
- Approval отозвано пока user смотрит → screen graceful update «доступ закрыт».
- User banned mid-window → access closed.

**Exit States.** RSVP set; ready для FLOW-011 (Circle Meeting / RSVP).

**Analytics Events.** `intro_meeting_viewed`, `meeting_location_revealed`, `meeting_rsvp_yes`, `meeting_rsvp_no`.

**Safety / Trust Constraints.**

- **Notification не leak'ает exact location** (Инв. 1; push copy всегда без точки).
- **Location revealed только внутри authorized screen.**
- **Access revoked при approval removal / safety removal.**
- **Future meetings не visible** до conversion в `member`.

**Screens Needed.** Approval Notification · Intro Meeting Detail · Meeting Location Reveal · RSVP · (опц.) Circle Chat entry per policy.

---

### FLOW-011 — Circle Meeting / RSVP Flow

**Purpose.** Member RSVP'ит на встречу, получает напоминание, посещает; attendance / no-show записываются.
**Primary Role.** Circle Member (или `approved_for_intro_meeting` для intro).
**Related Stories.** US-MEET-01…12.
**Entry Points.** My Circles → Circle Home → Next Meeting; deep-link.
**Preconditions.** Имеет approved access к встрече.

**Main Flow:**

1. Member открывает Circle Home → next meeting card видим.
2. Открывает Meeting Detail.
3. RSVP «Буду» / «Не смогу».
4. До reveal window — sees area + soft date; во window — sees exact location.
5. Получает reminder push (без exact location в copy).
6. Приходит на meeting.
7. После meeting host bulk-confirm'ит attendance (US-MEET-10).
8. System записывает `attended` / `no_show` (internal — Инв. 3).

**Decision Points.**

- Meeting `cancelled` → RSVPs voided; soft copy; no trust penalty.
- Meeting `removed_for_safety` → access revoked; audit logged.

**Alternate Flows.**

- Change RSVP до lock — allowed.
- `paused` member не может RSVP (per policy — открыто §14 #11).
- No-show — first time neutral; повторяющиеся — internal signal (US-INTRO-07).

**Error / Edge Cases.**

- RSVP race condition → last-write-wins.
- Host не confirm'ит attendance → state остаётся pending until manual override.

**Exit States.** RSVP recorded; post-meeting attendance / no-show recorded.

**Analytics Events.** `circle_meeting_viewed`, `meeting_rsvp_yes`, `meeting_rsvp_no`, `meeting_reminder_sent`, `circle_meeting_attended`, `no_show_recorded`, `repeat_meeting_attendance`.

**Safety / Trust Constraints.**

- **Exact location** только allowed users (Инв. 1).
- **No live user location** (Инв. 9).
- **RSVP** видим только allowed users.
- **No-show internal only** (Инв. 3).
- **No public negative labels** (Инв. 12).
- **Push без exact location** (Инв. 1).

**Screens Needed.** My Circles · Circle Home · Meeting Detail · RSVP State · Reminder · Meeting Completed · Attendance Confirmation.

---

### FLOW-012 — Become Member / Belonging Flow

**Purpose.** После intro meeting — конверсия в `member` (либо честная «не подтверждено»).
**Primary Role.** User → Member; Host (confirmation).
**Related Stories.** US-INTRO-04, US-INTRO-05, US-INTRO-06.
**Entry Points.** Post-meeting host action; system auto-convert per policy.
**Preconditions.** `intro_attended` state.

**Main Flow:**

1. После intro meeting (state `completed`):
   - Host видит attendance UI (FLOW-011 step 7).
   - Host confirms продолжение → user transitions `intro_attended` → `member`.
   - Host не confirms (или конкретно «не подтверждено») → user остаётся `intro_attended` без перехода → soft state «Постоянное участие не было подтверждено».
2. User видит:
   - **Member confirmation** screen → Welcome в My Circles → Circle Home.
   - ИЛИ **Not This Time / Не подтверждено** screen → private; non-stigmatizing.
3. Member получает full доступ: Circle Chat, future meetings, location per policy.

**Decision Points.**

- Auto-convert vs host-confirm (open §27 PRD; §14 #6 здесь).
- Сколько встреч до full member — 1 / 2 / host-defined (§14 #7).

**Alternate Flows.**

- User сам не хочет продолжать → может leave (FLOW-016).
- Host не нажал ничего за TTL → policy decides: auto-convert / auto-not-confirmed / pending (open §14 #11).

**Error / Edge Cases.**

- User deleted profile до confirm → host видит как deleted; audit logged.
- Edge: host попытается confirm после circle archived → action disabled.

**Exit States.** `member` (success path) или `intro_attended` без conversion (administrative path).

**Analytics Events.** `member_confirmed`, `intro_not_confirmed` (internal).

**Safety / Trust Constraints.**

- **Not-confirmed state private** (no public visibility).
- **No public shame** (Инв. 12).
- **No «you were rejected» language** (§19 Core v2).
- **No effect on public profile** (Инв. 12).
- **No betrayal mechanics** (Инв. 11).

**Screens Needed.** Intro Attended · Become Member Confirmation · Not This Time · My Circles · Circle Home.

---

### FLOW-013 — My Circles / Belonging Mode Flow

**Purpose.** Для users с ≥1 circle — home becomes My Circles; discovery deprioritized.
**Primary Role.** Member (active в ≥1 circle).
**Related Stories.** US-BELONG-01…09.
**Entry Points.** Default home при ≥1 active circle; deep-link.
**Preconditions.** `onboarded_user` с ≥1 active `member`/`approved_for_intro_meeting`.

**Main Flow:**

1. User opens app → home = My Circles (US-BELONG-01).
2. Sees list of circles с card-per-circle: next meeting, RSVP state, unread chat indicator.
3. Tap на circle → Circle Home.
4. Circle Home показывает: next meeting card on top, recent chat preview, members list (safe).
5. Доступны actions: RSVP, open chat, pause, leave, manage notifications.
6. Discovery остаётся one tap away (но не default).

**Decision Points.**

- 0 active circles → home = Discovery.
- «Не ищу новые круги» toggle (P1, US-P1-09) → discovery deprioritized дополнительно.

**Alternate Flows.**

- Member pauses → see Pause Flow (FLOW-015).
- Member leaves → see Leave Flow (FLOW-016).

**Error / Edge Cases.**

- Один из circles `removed_for_safety` → soft removal copy в list, no shame.
- Network → cached My Circles render.

**Exit States.** Continue in any circle context; or pause/leave; or Discovery.

**Analytics Events.** `my_circles_opened`, `circle_home_opened`, `next_meeting_viewed`, `circle_chat_opened`.

**Safety / Trust Constraints.**

- **Belonging is success state** (Инв. 14).
- **No infinite discovery pressure**: no nag push, no gamification («у тебя 1 круг, добавь ещё»), no banner «выбирай больше» (US-BELONG-08).
- **No guilt for not joining more circles.**

**Screens Needed.** My Circles · Circle Home · Next Meeting · Chat Preview · Notification Settings.

---

### FLOW-014 — Circle Chat Flow

**Purpose.** Группой чат участников круга; контекст-first communication.
**Primary Role.** Member; Host (как member своего круга); Admin (через admin app — FLOW-022).
**Related Stories.** US-CHAT-01…11.
**Entry Points.** Circle Home → Chat; My Circles → unread indicator; meeting card → chat tap.
**Preconditions.** State `member` (или `approved_for_intro_meeting` если policy разрешает meeting-context chat).

**Main Flow:**

1. Member opens Circle Chat.
2. Loads messages (paginated).
3. Sees system messages (lifecycle / reminders), host meeting updates, member messages.
4. Sends message → deliver → show.
5. Long-press на message → Message Actions: Report / Block sender / Copy.
6. (Host) Posts meeting update with meeting tag.
7. (Admin) Может заморозить chat — see FLOW-022.

**Decision Points.**

- `paused` member chat access — read-only / muted / none (open §14 #11).
- `intro` participant chat access — meeting-context only / full read-only (open §14 #4).
- Frozen chat → write disabled; read allowed; non-shaming notice.

**Alternate Flows.**

- Removed member открывает chat → 403 / graceful close (US-CHAT-08).
- Blocked user's messages скрыты с breadcrumb «сообщение скрыто» (US-CHAT-06).

**Error / Edge Cases.**

- Message send fail → retry; not-delivered indicator.
- Block / unblock mid-session → chat refresh.

**Exit States.** Continue chat; report flow (FLOW-021); back.

**Analytics Events.** `circle_chat_opened`, `circle_chat_message_sent`, `circle_message_reported`, `circle_chat_frozen`.

**Safety / Trust Constraints.**

- **No open 1:1** (Инв. 2).
- **No «message user» CTA** anywhere (CLAUDE.md §10).
- **Non-members cannot read/write.**
- **Reported messages → moderation queue** (FLOW-021).
- **Blocked user interaction** через UI hide + chat-level honor.
- **No raw message body в analytics.**

**Screens Needed.** Circle Chat · Message Actions · Report Message · Chat Frozen · No Access.

---

### FLOW-015 — Pause Participation Flow

**Purpose.** Member ставит участие на паузу — low-drama, easy.
**Primary Role.** Member.
**Related Stories.** US-INTRO-09, US-BELONG-05, US-TRUST-12.
**Entry Points.** Circle Home → Pause; My Circles → Pause; Settings.
**Preconditions.** State `member`.

**Main Flow:**

1. Member tap'ает «Поставить участие на паузу».
2. Видит short explanation: «Мы не уведомляем других. Можно вернуться позже.»
3. Confirm.
4. State `member` → `paused`.
5. Future meeting locations скрыты; notifications quieted per policy; chat access per policy (read-only / muted).
6. Other members получают **никакого уведомления**; circle UI может показать «состав обновился» если изменился размер.

**Decision Points.**

- Pause TTL? — open §14 #11.
- Chat access during pause — open §14 #4.
- Может paused member RSVP? — открыто.

**Alternate Flows.**

- Return from pause: simple resume flow (P1 might add request-return-to-host).

**Error / Edge Cases.**

- Pause во время starting_soon meeting → RSVP stays as last set; member может прийти.
- Pause + блокировка host'ом → состояние перепрыгивает в `removed`.

**Exit States.** `paused`.

**Analytics Events.** `circle_membership_paused`.

**Safety / Trust Constraints.**

- **Pause is low-drama.**
- **No public shame** (Инв. 12).
- **No «Ivan abandoned circle» notification.**
- **Other members see at most** «Состав круга обновился» если нужно.
- **Trust event neutral** (US-TRUST-12).

**Screens Needed.** Pause Participation · Pause Confirmation · Paused State · Return Request Placeholder.

---

### FLOW-016 — Leave Circle Flow

**Purpose.** Member тихо уходит — приватно, без drama.
**Primary Role.** Member.
**Related Stories.** US-INTRO-10, US-TRUST-12.
**Entry Points.** Circle Home → Leave; My Circles → Leave; Settings.
**Preconditions.** State `member` / `paused` / `approved_for_intro_meeting` / `intro_attended`.

**Main Flow:**

1. Member tap'ает «Выйти из круга».
2. Видит short confirmation: «Участие завершено. Без объявлений.»
3. (Optional, optional!) reason field — not required.
4. Confirm.
5. State → `left`; future meeting/chat access прерывается.
6. Member list other members обновляется молча (max сообщение «состав обновился»).

**Decision Points.**

- Reason field — optional only.

**Alternate Flows.**

- Может вернуться позже через новый request (стандартный FLOW-008).

**Error / Edge Cases.**

- Leave во время starting_soon meeting → RSVP voided; member не виден в attendance.
- Leave + circle archived одновременно → idempotent.

**Exit States.** `left`.

**Analytics Events.** `circle_membership_left`.

**Safety / Trust Constraints.**

- **No betrayal mechanics** (Инв. 11).
- **Private action.**
- **No public profile label** (Инв. 12).
- **No «left for another circle»** notification (Инв. 11).
- **No transition history visible** другим (Инв. 12).

**Screens Needed.** Leave Circle Confirmation · Left State · My Circles Updated.

---

### FLOW-017 — Host Ends Participation Flow

**Purpose.** Host прекращает участие member'а — с категорией причины, приватно.
**Primary Role.** Circle Host.
**Related Stories.** US-INTRO-11, US-INTRO-12.
**Entry Points.** Host Dashboard → Member Management → конкретный member.
**Preconditions.** Host владеет circle; target — `member`/`paused`.

**Main Flow:**

1. Host opens Member Management.
2. Selects member → End Participation modal.
3. Selects **reason category**:
   - inactive;
   - format mismatch;
   - circle full / rebalancing;
   - rule violation;
   - safety concern (этот категория → автоматический audit + admin signal);
   - other.
4. Optional internal note.
5. Confirm.
6. Member state → `removed` (или `removed_for_safety` если safety reason → triggers admin review).
7. Removed user получает private neutral notification (non-stigmatizing copy).
8. Other members видят максимум «состав обновился»; **никаких уведомлений** о removal.

**Decision Points.**

- Safety reason → автоматически создаётся audit + admin signal (Инв. 4).
- Rule violation → может потребовать admin review (open §14 #9).
- Frequent removals one host → host-accountability internal signal (US-INTRO-11 EC).

**Alternate Flows.**

- Admin override / appeal flow (P1 — US-P1-12).

**Error / Edge Cases.**

- Host пытается remove banned user → action redundant; show banned state.
- Race: member leaves в момент removal → idempotent.

**Exit States.** `removed` / `removed_for_safety`.

**Analytics Events.** `circle_membership_removed_by_host` (с reason category — no description).

**Safety / Trust Constraints.**

- **No public shame** (Инв. 12).
- **Safety removals logged** (Инв. 4).
- **Host abuse monitoring** internal (US-INTRO-11 EC).
- **Removed user loses future location/chat access** immediately.
- **Audit log обязателен** для safety reason (Инв. 4).

**Screens Needed.** Member Management · End Participation Modal · Reason Category · Private User Notification · Generic Composition Updated State.

---

### FLOW-018 — Block User Flow

**Purpose.** Пользователь блокирует другого; bilateral effects.
**Primary Role.** User / Member.
**Related Stories.** US-PROF-10, US-SAFE-05, US-CHAT-06.
**Entry Points.** Public Safe Profile → Block; Chat message actions → Block sender; Member list → Block.
**Preconditions.** Target ≠ self; не уже заблокирован.

**Main Flow:**

1. User tap'ает Block.
2. Confirmation modal: «Вы больше не увидите этого пользователя».
3. Confirm.
4. System создаёт block edge; propagates:
   - blocked user **не может request** круги, где blocker — host (US-REQ-13);
   - blocked user **не может видеть** профиль blocker'а;
   - сообщения blocked user **скрываются** в shared chats (с breadcrumb).
5. Blocked user **никогда** не получает уведомления о блокировке.

**Decision Points.**

- Если оба в одном active circle: их chat messages mutually hidden; group meeting itself остаётся (host/admin может вмешаться) (open §14 #15).

**Alternate Flows.**

- Unblock (P1) — explicit action; non-stigmatizing.

**Error / Edge Cases.**

- Self-block → not allowed.
- Block уже активен → no-op + soft confirmation.

**Exit States.** Bilateral block edge created.

**Analytics Events.** `block_created` (no PII of blocked user).

**Safety / Trust Constraints.**

- **Block does not notify blocked user.**
- **Block внутри same circle** не «эрейзит» group presence полностью — может потребоваться report/admin/host review.
- **No hidden safety assumption** что block решит всё.

**Screens Needed.** Block User Confirmation · Blocked State · Manage Blocked Users.

---

### FLOW-019 — Report User Flow

**Purpose.** Пользователь жалуется на другого; report идёт в moderation queue.
**Primary Role.** User / Member.
**Related Stories.** US-SAFE-01, US-SAFE-06, US-SAFE-07, US-PROF-09.
**Entry Points.** Public Safe Profile → Report; Chat message → Report sender (через Block tangent); Member list → Report.
**Preconditions.** Target ≠ self.

**Main Flow:**

1. User tap'ает Report.
2. Selects reason category (harassment / impersonation / unsafe behavior / spam / other).
3. Optional details (free text — не появится в analytics).
4. Submit.
5. Report → moderation queue (FLOW-022).
6. User видит confirmation toast «Жалоба отправлена».

**Decision Points.**

- Может комбинироваться с Block (offer Block в success state).

**Alternate Flows.**

- Self-report → not allowed.

**Error / Edge Cases.**

- Дубликат report → soft confirmation.

**Exit States.** Report submitted.

**Analytics Events.** `report_created` (reason category only — **no description text**).

**Safety / Trust Constraints.**

- **Reporter protected** — reported user не видит ни факт, ни детали (Инв. 6, privacy).
- **Report description not in analytics** (privacy boundary).
- **Reporter может combined с Block** (US-SAFE-05).

**Screens Needed.** Report User · Report Reason · Report Details · Report Submitted.

---

### FLOW-020 — Report Circle / Meeting Flow

**Purpose.** Report unsafe circle или meeting.
**Primary Role.** User / Member.
**Related Stories.** US-SAFE-02, US-SAFE-03, US-CIRC-11.
**Entry Points.** Circle Detail → Report; Meeting Detail → Report.
**Preconditions.** Circle / meeting accessible.

**Main Flow:**

1. User tap'ает Report.
2. Selects reason (unsafe composition / unsafe rules / dating-coded content / off-platform recruitment / other).
3. Optional details.
4. Submit.
5. Admin queue receives context.
6. Если meeting starting_soon → high-priority signal.

**Decision Points.**

- Unsafe circle pattern → admin может ускорить removal (FLOW-022).

**Error / Edge Cases.**

- Reported circle уже `removed_for_safety` → soft confirmation.

**Exit States.** Report submitted.

**Analytics Events.** `report_created` (with target_type = circle / meeting).

**Safety / Trust Constraints.**

- **Exact location не leak'ается** в report notifications.
- **Meeting safety priority** если starting_soon.
- **Circle не disclosed** что был flagged (privacy).

**Screens Needed.** Report Circle · Report Meeting · Report Submitted.

---

### FLOW-021 — Report Message Flow

**Purpose.** Report inappropriate message в circle chat.
**Primary Role.** Member.
**Related Stories.** US-CHAT-05, US-SAFE-04.
**Entry Points.** Long-press на message → Message Actions → Report.
**Preconditions.** Member of circle.

**Main Flow:**

1. Long-press на message → Message Actions.
2. Tap Report.
3. Select reason (harassment / spam / dating-coded / unsafe / other).
4. Submit.
5. System создаёт snapshot сообщения (US-CHAT-05 EC; FLOW-022 contextualizes).
6. Admin queue receives.
7. (Опц.) Message может быть hidden от reporter (UI-only) до admin review.

**Decision Points.**

- Snapshot policy для удалённых сообщений — open §14 (см. EC-20 из Stories).

**Alternate Flows.**

- Sender удаляет message до admin review → snapshot сохраняется (Инв. 4).

**Error / Edge Cases.**

- Дубликат report того же message → soft confirmation.

**Exit States.** Report submitted.

**Analytics Events.** `report_created` (target_type = message; **no body text**).

**Safety / Trust Constraints.**

- **Snapshot сохраняется** для moderation context (Инв. 4).
- **Deleted message may remain in moderation context.**
- **No report details visible to offender** (privacy).

**Screens Needed.** Message Actions · Report Message · Report Submitted.

---

### FLOW-022 — Admin Moderation Queue Flow

**Purpose.** Admin триаж жалоб + действия + audit.
**Primary Role.** Admin.
**Related Stories.** US-ADM-01…18, US-SAFE-08…14.
**Entry Points.** Admin app login → Moderation Queue; deep-link на specific report.
**Preconditions.** Admin auth (server-side service role).

**Main Flow:**

1. Admin logs in (FLOW-001 для admin, but via admin app).
2. Открывает Moderation Queue.
3. Применяет filters (priority — AI-assistive — / type / age).
4. Открывает Report Detail.
5. Reviews:
   - Report content / reasons.
   - Target context (User Detail / Circle Detail / Meeting Detail / Message Detail).
   - AI summary (assistive — Инв. 5).
   - Audit log history target'а.
6. Takes action:
   - **dismiss**, **warn**, **restrict**, **ban**, **remove circle**, **remove meeting**, **hide message**, **freeze chat**, **add private note**, **escalate**.
7. Action triggers audit log entry (Инв. 4).
8. Target user / circle / meeting state updated.
9. (Если applicable) — affected пользователи получают neutral notification.

**Decision Points.**

- Serious actions (ban / restrict / remove) require reason (US-ADM-17).
- AI false positive → admin overrides (Инв. 5; EC-21).

**Alternate Flows.**

- Multi-report grouping per target (P1).

**Error / Edge Cases.**

- Audit log write fails → action blocked (US-SAFE-14 EC).
- Target deleted before action → action handled gracefully; log retained.

**Exit States.** Report resolved; audit logged.

**Analytics Events.** `moderation_action_taken` (action type + admin id internal — no public exposure).

**Safety / Trust Constraints.**

- **AI summary assistive only** (Инв. 5).
- **Serious actions require reason** (US-ADM-17).
- **All moderation-sensitive actions logged** (Инв. 4).
- **Service role server-side only** (Инв. 12; US-ADM-18).

**Screens Needed.** Admin Login · Moderation Queue · Report Detail · User Detail · Circle Detail · Meeting Detail · Message Detail · Action Modal · Audit Logs.

---

### FLOW-023 — Suspicious Behavior / Velocity Flow

**Purpose.** System-detected risk → triage без автоматического enforcement.
**Primary Role.** System → Admin.
**Related Stories.** US-SAFE-15, US-SAFE-16, US-TRUST-10, US-TRUST-11.
**Entry Points.** System events (velocity threshold, anomaly signals).
**Preconditions.** Internal signals accrued.

**Main Flow:**

1. System detects pattern:
   - too many requests / messages / reports;
   - repeated no-shows;
   - repeated host removals;
   - comfort composition violations;
   - host abuse patterns;
   - на основе AI-assistive signals.
2. System creates **flag** (not enforcement).
3. Target appears в Suspicious Activity Queue (admin).
4. Admin reviews (FLOW-022 sub-flow).
5. Admin takes action (warn / restrict / ban / dismiss).

**Decision Points.**

- Soft friction may be applied automatically (rate-limit slowdown) — но не block (Инв. 5).
- Serious enforcement — admin only.

**Alternate Flows.**

- False positive → admin dismiss; signal logged для improvement.

**Error / Edge Cases.**

- Cascade: target genuinely abusive + AI flag + multiple reports → admin sees combined view.

**Exit States.** Flag → action OR dismiss.

**Analytics Events.** `suspicious_activity_flagged` (internal).

**Safety / Trust Constraints.**

- **System flag is not final enforcement** (Инв. 5).
- **Admin review для serious actions** (Инв. 5).
- **Soft friction allowed** (rate-limit), но не silent ban.

**Screens Needed.** Suspicious Activity Queue · Admin Review Detail · Restricted State.

---

### FLOW-024 — Trust Signal Update Flow

**Purpose.** Internal trust signals обновляются на основе actions; soft badges возможно меняются.
**Primary Role.** System; User (видит только badges).
**Related Stories.** US-TRUST-01…13.
**Entry Points.** System events (verification done; meeting attended; report processed; etc.).
**Preconditions.** Авторизованный user; system event.

**Main Flow:**

1. Event triggers trust update:
   - phone verified → verification_level↑;
   - profile completed → completeness↑;
   - meeting attended → attendance_reliability↑;
   - no_show recorded → reliability ↓ (с первым neutral — US-INTRO-07);
   - host meeting completed → host_reliability↑;
   - report / block confirmed → internal risk signal;
2. System appends `TrustEvent` (append-only — US-TRUST-09).
3. System recomputes `UserTrustSummary` (internal — Инв. 3).
4. Soft public badge surface может измениться (Проверен / Reliable / Hosted / Attended).

**Decision Points.**

- Tier change triggers internal safety friction adjustment (US-TRUST-11).

**Error / Edge Cases.**

- Event write fails → idempotent retry.

**Exit States.** Trust signals updated.

**Analytics Events.** Internal only (no user-facing analytics about trust).

**Safety / Trust Constraints.**

- **Raw trust score hidden** (Инв. 3).
- **No public negative labels** (Инв. 12).
- **Leaving / pausing not negative by default** (US-TRUST-12).
- **Trust supports safety, not ranking** (Инв. 10).

**Screens Needed.** Profile Badge Area (user-facing visible badges) · Admin Trust Context (admin view) · Internal Trust Detail (admin / system view).

---

### FLOW-025 — Privacy / Delete Account Flow

**Purpose.** User export или delete его data.
**Primary Role.** User.
**Related Stories.** US-P1-13 (P1 — full GDPR-style); P0 baseline — basic delete.
**Entry Points.** Settings → Privacy.
**Preconditions.** Авторизованный user.

**Main Flow:**

1. Settings → Privacy.
2. **Data Export** (P1 baseline): request → email export when ready.
3. **Delete Account**:
   - User tap Delete Account.
   - Sees confirmation: «Это действие необратимо. Активные membership'ы будут завершены тихо.»
   - Confirm (требует password / 2FA).
4. System:
   - Active memberships → `left` (FLOW-016 logic applied silently per circle);
   - Reports / audit logs retained per policy (open §14 #14, see EC-24);
   - Profile удалён или anonymized.
5. User signed out.

**Decision Points.**

- Retention exceptions: reports / audit logs могут сохраняться для safety policy (open §14 #14).
- Sensitive content (host of active circles) — host responsibility transfer? (open §14 #11).

**Alternate Flows.**

- Soft delete с TTL — opt-in (P1).

**Error / Edge Cases.**

- User is sole host of active circles → требуется handover / archive flow before delete (open).
- Pending membership requests → silently cancelled (EC-24).

**Exit States.** Account deleted.

**Analytics Events.** `account_deleted` (no PII).

**Safety / Trust Constraints.**

- **Memberships завершены тихо** (Инв. 11, 12).
- **No public shame on deleted user.**
- **Audit logs retained per policy** (Инв. 4).
- **Reports / blocks retained for safety integrity.**

**Screens Needed.** Settings · Privacy · Data Export · Delete Account · Delete Confirmation.

---

## 7. Screen Inventory v2

### 7.1 Mobile Screens

| Screen | Purpose | Primary Role | Key Data | Primary Actions | Safety Notes |
|---|---|---|---|---|---|
| Welcome | landing | Guest | brand, CTAs | Sign up, Login, Invite, Waitlist | non-stigmatizing |
| Invite Code | enter code | Guest | code field | submit | rate-limited |
| Waitlist | join waitlist | Guest | email | submit | minimal PII |
| Login | authenticate | Guest | credentials | login, recover | no enumeration |
| Signup | create account | Guest | credentials | signup, OAuth | service-role hidden |
| Onboarding Welcome | explain product | User | copy | continue | sets expectations |
| Safety Principles | accept rules | User | principles | accept | required gate |
| Basic Profile | set name/age | User | name, age band | next | no exact PII |
| City/Area | location | User | city + area | next | area only |
| Interests | select interests | User | list | next | curated |
| Vibe | select vibe | User | curated tags | next | no dating-coded |
| Rhythm | preferred rhythm | User | radio | next | — |
| Comfort Composition | select preference | User | options | next | non-fear-based |
| Group Size | size band | User | options | next | — |
| Host Willingness | opt-in | User | toggle | next | optional |
| Photo | upload photo | User | photo | next | AI assistive |
| Verification Placeholder | email/phone | User | status | next | level only |
| Profile Preview | review | User | safe profile | submit | mirror safe view |
| Circle Discovery | feed of circles | User | cards | filter, open | no people |
| Filters | refine discovery | User | filter fields | apply | — |
| Circle Card | one circle preview | User | vibe, area, host | tap | aggregated only |
| Circle Detail — Not Requested | inspect circle | User | full safe view | request, report | exact location hidden |
| Circle Detail — Requested | pending | User | status | cancel | — |
| Circle Detail — Waitlisted | wait state | User | status | — | non-stigmatizing |
| Circle Detail — Intro Approved | intro invite | User | intro card | RSVP | location only intro |
| Circle Detail — Member | member view | Member | full member view | open chat, RSVP | full access |
| Request Place Modal | submit request | User | intro-note | submit | rate-limit |
| Membership Pending | pending state | User | status | cancel | non-stigmatizing |
| Intro Meeting Detail | one meeting | User | meeting + location | RSVP | scoped reveal |
| Meeting Location Reveal | exact location | User | location | — | no live location |
| My Circles | home for members | Member | list of circles | open | belonging mode |
| Circle Home | circle hub | Member | next meeting, chat preview | RSVP, open | full member access |
| Meeting Detail | meeting info | Member | RSVPs, updates | RSVP | — |
| RSVP | choose response | Member | choice | submit | — |
| Circle Chat | group chat | Member | messages | send, react, report | no DMs |
| Message Actions | per-message | Member | actions | report, block sender | — |
| Report Message | submit report | Member | reason | submit | privacy |
| Public Safe Profile | someone's profile | User | safe fields | report, block | no raw score |
| Report User | submit report | User | reason | submit | privacy |
| Report Circle | submit report | User | reason | submit | privacy |
| Report Meeting | submit report | User | reason | submit | privacy |
| Block User | block flow | User | confirm | confirm | no notify |
| Create Circle | host creates | Host | fields | save draft, publish | lifecycle |
| Circle Preview | host preview | Host | safe view | publish | mirror safe |
| Host Circle Dashboard | host management | Host | hosted circles | open | host-only |
| Membership Requests | request queue | Host | requests | open detail | safe context |
| Request Detail | review request | Host | safe applicant | approve / soft-reject / waitlist | non-shaming |
| Member Management | manage members | Host | members | pause / end | reason categories |
| Pause Participation | pause flow | Member | confirm | confirm | low-drama |
| Leave Circle | leave flow | Member | confirm | confirm | private |
| Settings | settings hub | User | toggles | — | — |
| Privacy | privacy settings | User | toggles | — | — |
| Delete Account | account deletion | User | confirm | confirm | retention policy |

### 7.2 Admin Screens

| Screen | Purpose | Primary Role | Key Data | Primary Actions | Safety Notes |
|---|---|---|---|---|---|
| Admin Login | admin auth | Admin | credentials | login | server-side service role |
| Moderation Queue | report list | Admin | reports | filter, open | AI assistive |
| Report Detail | report context | Admin | full context | take action | Инв. 4 |
| User Detail | user context | Admin | safe + internal | restrict / ban / note | no leak to others |
| Circle Detail (admin) | circle context | Admin | full + reports | remove / archive / freeze | Инв. 4 |
| Meeting Detail (admin) | meeting context | Admin | full + reports | remove | Инв. 4 |
| Message Detail | chat context | Admin | message + surrounding | hide / escalate | Инв. 4 |
| Suspicious Activity | flagged patterns | Admin | flags | review | not auto-enforcement |
| Audit Logs | history | Admin | logs | filter, export | privacy |
| Action Modal | take action | Admin | action + reason | submit | reason required |

---

## 8. State-specific Screen Variants

### 8.1 Circle Detail Variants

- not requested → CTA «Запросить место»
- requested → status «Запрос у хоста»
- waitlisted → status «В waitlist»
- rejected → «Не в этот раз» (private)
- approved_for_intro_meeting → Intro Invitation card
- member → Circle Home affordances
- paused → paused state copy
- full → «Круг сейчас полон»
- circle paused → «Круг на паузе»
- removed_for_safety → 404-like screen
- host view → redirect to Host Dashboard

### 8.2 Membership Variants

- none → discovery view
- requested → pending copy
- intro approved → intro UI
- member → full UI
- paused → paused affordances
- left → re-discoverable
- removed → non-stigmatizing notice
- removed_for_safety → safety copy + appeal placeholder (P1)

### 8.3 Meeting Detail Variants

- not allowed → 403 / hidden
- intro approved → scoped to that meeting
- member → full view
- RSVP going → going state
- RSVP not going → not-going state
- cancelled → cancelled copy
- completed → post-meeting view
- removed_for_safety → safety removal copy

### 8.4 Chat Variants

- active → normal chat
- frozen → write disabled + non-shaming notice
- no access → 403 / hidden
- removed user → 403
- paused user → read-only / muted per policy
- read-only → per policy

### 8.5 Profile Variants

- own → full edit
- safe public → safe fields only
- member safe profile → safe + soft badges
- blocked → invisible (как будто не существует)
- moderation pending → restricted state

---

## 9. Location Privacy Matrix v2

| User / Circle State | Circle Visibility | Approx Area | Exact Meeting Location | Circle Chat | Member Visibility | Actions |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| `guest` | ❌ landing only | ❌ | ❌ | ❌ | ❌ | sign-up / waitlist |
| `authenticated_not_onboarded` | ❌ | ❌ | ❌ | ❌ | ❌ | onboarding |
| `onboarded_not_requested` | ✅ safe view | ✅ | ❌ | ❌ | aggregated | request, report |
| `requested` | ✅ | ✅ | ❌ | ❌ | aggregated | cancel |
| `waitlisted` | ✅ | ✅ | ❌ | ❌ | aggregated | — |
| `rejected` | ✅ | ✅ | ❌ | ❌ | aggregated | — |
| `approved_for_intro_meeting` | ✅ | ✅ | ✅ **only that one** | meeting-context (per policy) | partial subset (per policy) | RSVP, report |
| `intro_attended` | ✅ | ✅ | scoped post-window | per policy | partial | next steps |
| `member` | ✅ | ✅ | ✅ upcoming | read+write | full safe | RSVP, chat, pause, leave |
| `paused` | ✅ | ✅ | ❌ | per policy (read-only / muted) | full | resume |
| `left` | ✅ если discovery | ✅ | ❌ | ❌ | ❌ | re-request via new flow |
| `removed` | per policy | per policy | ❌ | ❌ | ❌ | appeal (P1) |
| `removed_for_safety` | safety screen | ❌ | ❌ | ❌ | ❌ | appeal (P1) |
| `blocked` (by host) | ❌ круги блокировщика | ❌ | ❌ | ❌ | ❌ | — |
| `restricted` | per policy | per policy | per policy | per policy | per policy | limited actions |
| `banned` | ❌ (auth gate) | ❌ | ❌ | ❌ | ❌ | — |
| `host` (своего круга) | ✅ admin своего круга | ✅ | ✅ всех meetings | ✅ | ✅ | full host actions |
| `admin` | ✅ через admin app | ✅ | ✅ через admin app | ✅ через admin app | ✅ через admin app | full admin actions |

Гарантии:

- Exact meeting location видна **только** approved intro participant (scoped к одной встрече), member (upcoming), host (своего круга), admin (через admin app server-side).
- **No chat** для non-members; **`approved_for_intro_meeting`** — meeting-context only per policy (open §14 #4).
- **No full member list** до approval.
- **Removed / left** теряют future access.

---

## 10. Composition Visibility Matrix

| State | Host visible? | Aggregate composition | Safe member profiles | Full member list | Private / internal data |
|---|:--:|:--:|:--:|:--:|:--:|
| before request | ✅ | ✅ | ❌ | ❌ | ❌ |
| after request (pending) | ✅ | ✅ | ❌ | ❌ | ❌ |
| approved for intro | ✅ | ✅ | partial subset (per policy) | ❌ | ❌ |
| member | ✅ | ✅ | ✅ | ✅ (per policy timing — open §14 #8) | ❌ |
| paused | ✅ | ✅ | ✅ | ✅ | ❌ |
| removed | ❌ | ❌ | ❌ | ❌ | ❌ |
| admin | ✅ | ✅ | ✅ | ✅ | ✅ (admin app only) |

**Никогда не показываем** (ни одной non-admin роли):

- raw trust score (Инв. 3);
- report counts;
- block counts;
- removal history;
- other circles конкретного пользователя (Инв. 13);
- internal moderation notes.

---

## 11. Safety-critical Flow Checks

Чек-лист, который должен пройти каждый flow:

- [ ] **No open DMs** (Инв. 2)
- [ ] **No people marketplace** (Инв. 13)
- [ ] **No exact location before approved access** (Инв. 1)
- [ ] **No raw trust score** (Инв. 3)
- [ ] **No public ratings** (Hard rule 5)
- [ ] **No public negative labels** (Инв. 10, 12)
- [ ] **No betrayal mechanics** (Инв. 11)
- [ ] **No public leave / removal / rejection labels** (Инв. 12)
- [ ] **No infinite discovery pressure** (Инв. 14)
- [ ] **Report / block accessible** in every relevant context (Инв. 6)
- [ ] **Moderation actions logged** (Инв. 4)
- [ ] **AI not final judge** (Инв. 5)
- [ ] **Blocked users cannot request membership** (US-REQ-13)
- [ ] **Removed users lose future access** immediately
- [ ] **Notifications do not leak exact location** (Инв. 1)
- [ ] **Analytics do not leak sensitive data** (Privacy boundary §22 PRD)

> Любой flow / design / implementation, проваливающий ≥1 пункт — **escalated as product decision** (CLAUDE.md §3), не silently реализуется.

---

## 12. Analytics Event Map v2

| Flow ID | Step | Event | Trigger | Properties | Privacy Notes |
|---|---|---|---|---|---|
| FLOW-001 | signup start | `signup_started` | user begins signup | provider (email/google/apple) | no PII |
| FLOW-001 | signup complete | `signup_completed` | account created | provider | no PII |
| FLOW-001 | login complete | `login_completed` | session established | provider | no PII |
| FLOW-002 | invite required | `invite_code_required` | guest hits invite gate | — | — |
| FLOW-002 | invite used | `invite_code_used` | valid invite consumed | — | — |
| FLOW-002 | waitlist joined | `waitlist_joined` | email submitted | — | minimal PII |
| FLOW-003 | onboarding start | `onboarding_started` | first onboarding step | — | — |
| FLOW-003 | onboarding step | `onboarding_step_completed` | each step | step name | — |
| FLOW-003 | safety accepted | `safety_principles_accepted` | accept | — | — |
| FLOW-003 | onboarding complete | `onboarding_completed` | finished | — | — |
| FLOW-003 | profile complete | `profile_completed` | threshold crossed | completeness band | no PII |
| FLOW-006 | discovery view | `circle_discovery_viewed` | Discovery opened | — | — |
| FLOW-006 | filter applied | `circle_filter_applied` | filters change | filter types | — |
| FLOW-006/007 | circle view | `circle_viewed` | Circle Detail opened | circle_id | — |
| FLOW-008 | request start | `circle_join_started` | Request modal opened | circle_id | — |
| FLOW-008 | request submitted | `circle_join_requested` | submit success | circle_id | — |
| FLOW-009 | request approved (intro) | `circle_request_approved_for_intro` | host approves intro | circle_id | — |
| FLOW-009 | request rejected | `circle_request_rejected` | host soft-rejects | circle_id, reason category | no description |
| FLOW-009 | request waitlisted | `circle_request_waitlisted` | host waitlists | circle_id | — |
| FLOW-010 | intro view | `intro_meeting_viewed` | intro detail opened | meeting_id | — |
| FLOW-010 | location reveal | `meeting_location_revealed` | exact location shown | meeting_id | no location data in event |
| FLOW-011 | RSVP yes | `meeting_rsvp_yes` | RSVP=going | meeting_id | — |
| FLOW-011 | RSVP no | `meeting_rsvp_no` | RSVP=not_going | meeting_id | — |
| FLOW-011 | attended | `circle_meeting_attended` | host-confirmed attendance | meeting_id | — |
| FLOW-011 | repeat attendance | `repeat_meeting_attendance` | nth attendance | n, circle_id | — |
| FLOW-011 | no-show | `no_show_recorded` | host marks no-show | meeting_id (internal) | not user-facing |
| FLOW-012 | member confirmed | `member_confirmed` | intro_attended → member | circle_id | — |
| FLOW-013 | my circles | `my_circles_opened` | home opens | — | — |
| FLOW-013 | circle home | `circle_home_opened` | open circle | circle_id | — |
| FLOW-014 | chat open | `circle_chat_opened` | chat opens | circle_id | — |
| FLOW-014 | chat send | `circle_chat_message_sent` | message sent | circle_id, length band | no body |
| FLOW-019/020/021 | report | `report_created` | report submitted | target_type, reason category | **no description** |
| FLOW-018 | block | `block_created` | block submitted | — | no PII of blocked |
| FLOW-022 | moderation action | `moderation_action_taken` | admin action | action_type, target_type | admin id internal |
| FLOW-022 | safety removal | `circle_removed_for_safety` | admin removes | circle_id (admin scope) | audit logged |
| FLOW-015 | pause | `circle_membership_paused` | member pauses | circle_id | — |
| FLOW-016 | leave | `circle_membership_left` | member leaves | circle_id | — |
| FLOW-017 | host removes | `circle_membership_removed_by_host` | host action | circle_id, reason category | no description |
| FLOW-023 | suspicious flag | `suspicious_activity_flagged` | system flag | flag_type | internal |

**Privacy:**

- **No exact location** в любом event'е (Инв. 1).
- **No raw message body** (privacy).
- **No report description** (privacy).
- **No raw trust score** (Инв. 3).
- **No PII** где можно избежать.

---

## 13. Figma Preparation Notes v2

> Эти заметки готовят следующий шаг — обновление [`/docs/04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) до v2 ([doc 27 §24 step 6](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)).

### 13.1 Priority clickable flows (для v2 прототипа)

1. **Circle Discovery** (FLOW-006).
2. **Circle Detail** (FLOW-007) — variants.
3. **Request a Place** (FLOW-008).
4. **Membership Pending** (часть FLOW-008).
5. **Intro Meeting Approved + Location Reveal** (FLOW-010).
6. **Meeting Location Reveal** (часть FLOW-010).
7. **Circle Chat** (FLOW-014).
8. **My Circles / Belonging Mode** (FLOW-013).
9. **Host Membership Review** (FLOW-009).
10. **Report / Block** (FLOW-018, FLOW-019).
11. **Admin Moderation** (FLOW-022).

### 13.2 Screens, которые должны быть **переделаны** из event-first прототипа

- Discover → **Circle Discovery**
- Event Detail → **Circle Detail** (+ variants)
- Apply Modal → **Request Place Modal**
- Pending → **Membership Pending**
- Approved → **Intro Meeting Approved / Member State**
- Event Chat → **Circle Chat**
- Create Event → **Create Circle** (+ Schedule a Meeting)
- Applications List → **Membership Requests**
- Applicant Detail → **Request Detail**
- My Events → **My Circles**

### 13.3 Новые screens, которые v1 прототип не содержал

- **My Circles** (belonging mode home).
- **Circle Home** (per-circle hub).
- **Pause Participation** (modal + paused state).
- **Leave Circle** (modal + left state).
- **Meeting RSVP** (per meeting card).
- **Member Management** (host scope).
- **Composition Settings** (host scope, circle creation).
- **Intro Invitation** (scoped meeting card).
- **Not This Time / Не подтверждено** state.
- **Suspicious Activity Queue** (admin).

### 13.4 Design principles (binding для rebuild)

- no people marketplace;
- no dating UI (hearts, flirty imagery, people grids);
- no cold DM entry;
- no public shame states (no "rejected" / "removed" labels);
- staged composition visibility;
- clear circle rhythm;
- clear comfort composition;
- clear location privacy state per membership.

---

## 14. Open UX Questions

1. **Intro meeting vs immediate membership default** — circle policy default? (PRD §27, Stories §11 #6)
2. **Phone verification timing** — до request / approval / first meeting?
3. **Required profile completeness threshold** для request.
4. **`approved_for_intro` chat access** — meeting-context only / full read-only / muted?
5. **Comfort composition modes P0/P1** boundary и точные формулировки RU/EN.
6. **Women-only validation** — методика; sample; copy variants (gated на §21 PRD validation).
7. **Сколько встреч до full membership** — 1 / 2 / host-defined?
8. **Approved member visibility of full member list** — до intro / после intro / после первой встречи?
9. **Host removal permissions** — какие категории требуют admin review?
10. **Pause / return rules** — TTL? Может ли paused RSVP?
11. **Sole-host account deletion** — handover / archive flow?
12. **No-show dispute flow** — есть ли? как?
13. **First-time host manual review** — все ли через `pending_review`?
14. **Retention policy для audit logs / reports** при delete account.
15. **Block внутри same circle** — visibility-эффекты на group meeting attendance?
16. **«Не ищу новые круги» — P0 или P1?**
17. **Approval как fit protection** — точная RU копirайтинг (US-ONB-15, US-REQ-08, US-INTRO-06).
18. **«Не в этот раз» после intro** — точная UX механика (auto-not-confirmed vs explicit host action).
19. **Belonging mode home** — заменяет ли My Circles Discovery полностью, или Discovery остаётся 1 tap away?
20. **Recurring meeting bulk-schedule** — P0 или P1?
21. **Co-host minimal delegation** — P0 fragment или P1 полностью?
22. **Не делать circles ощущающимися exclusive** — UX rules?
23. **Социальная температура** — как держать живой без chaos?
24. **Figma v2 prototype scope** — какие screens приоритетны? (§13)

---

## 15. Summary

- **User Flows v2** конвертируют продукт в circle-first.
- Events заменены на **meetings внутри circles**.
- **Core loop:** Find vibe → Request place → Intro meeting → Belong → Grow.
- **Safety, location privacy, no-DM, no-shame** остаются центральными во всех flow'ах.
- Все 16 safety-инвариантов (Core v2 §35) → §11 checklist; каждый flow ссылается на applicable инварианты.
- **Implementation freeze** в силе до завершения migration ([`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)).

**Next document:** [`/docs/04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) должен быть обновлён до **Figma Prototype Plan v2** ([doc 27 §24 step 6](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)).

---

> Reminder: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2) — **first source of truth**. Этот документ ему, PRD v2 и User Stories v2 подчинён. Любой future flow / Figma artifact / implementation task должен ссылаться на FLOW-ID и Story IDs из этих документов.
