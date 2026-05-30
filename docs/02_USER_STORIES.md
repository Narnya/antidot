# User Stories v2 — Antidot

> **Status:** v2 (P0 set для closed beta, circle-first).
> **Owner:** Product
> **Last updated:** 2026-05-30
> **First source of truth:** [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2).
> **Requirements source:** [`/docs/01_PRD.md`](01_PRD.md) (PRD v2).
> **Supersedes:** User Stories v1 (event-first, 2026-05-18).
> **Sequenced by:** [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md) §24 step 4.

---

## 1. Source of Truth

- Этот документ основан на [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (**first source of truth** — Product Core v2) и [`/docs/01_PRD.md`](01_PRD.md) (PRD v2 — требования).
- При конфликте PRD ↔ Product Core приоритет имеет **Product Core v2**.
- Ни одна user story **не может нарушать** safety-инварианты Product Core (§35 инварианты 1–16).
- Будущие implementation tasks, [`/docs/03_USER_FLOWS.md`](03_USER_FLOWS.md), [`/docs/04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) и Figma-артефакты должны ссылаться на **Story ID** из этого документа.
- Нерешённые вопросы — в [§11 Open Questions](#11-open-questions), а не «додуманы» молча ([`CLAUDE.md`](../CLAUDE.md) §3).

**Продукт — circle-first, не event-first.**

- **User-facing primitive:** Circle / Круг.
- **Operational primitive:** Meeting / Встреча круга.

**Downstream-документы** ([`03_USER_FLOWS.md`](03_USER_FLOWS.md), [`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md), [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md), [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md), [`11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md)) на момент написания ещё содержат event-first формулировки v0.1 — известное состояние миграции ([`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)). Этот документ им авторитетнее до их миграции.

---

## 2. Story Format

```
As a [role],
I want to [action],
so that [benefit].
```

**Поля каждой story** (в таблицах ниже представлены компактно):

- **ID** — стабильный идентификатор (например, `US-ONB-05`).
- **Priority** — P0 / P1 / P2 (по разделу §4).
- **Role** — Guest / User / Circle Member / Circle Host / Admin / System.
- **Module** — §5.x подраздел.
- **User Story** — формат `As a … I want to … so that …`.
- **Acceptance Criteria (AC)** — измеримые критерии готовности.
- **Edge Cases (EC)** — что должно произойти в граничных случаях.
- **Safety / Trust Notes (S/T)** — инварианты и принципы, которые story защищает.
- **PRD Ref** — секция PRD v2 ([`/docs/01_PRD.md`](01_PRD.md)).
- **Core Principle (CP)** — секция / инвариант Product Core v2 ([`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md)).

---

## 3. User Roles Covered

| Role | Тип stories | Описание |
|---|---|---|
| **Guest / Visitor** | auth-gates, beta access, waitlist | не аутентифицирован |
| **User** | discovery, request, profile, report/block | аутентифицирован, прошёл онбординг |
| **Circle Member** | RSVP, chat, intro→member, pause/leave | approved участник круга |
| **Circle Host** | create circle, review requests, schedule meetings, moderate context | создатель / ведущий круга |
| **Admin / Moderator** | moderation queue, bans, safety removals, audit | внутренняя роль платформы |
| **System** | lifecycle transitions, RSVP locks, reminders, AI-assist signals, analytics | не является финальным судьёй для серьёзного enforcement (Инв. 5) |

---

## 4. Priority Definitions

### P0

Required для closed beta. Без этой story бету нельзя выпустить.

### P1

Important после closed beta или extended beta — реализуется после доказательства core circle loop'а. Любая P1 story **не должна нарушать** Product Core v2 (нет open DMs, нет people marketplace, нет dating mechanics).

### P2

**Explicitly deferred.** Должны **НЕ реализовываться** без отдельного product decision и (если нужно) обновления Product Core.

---

## 5. P0 User Stories

### 5.1 Auth Stories

| ID | User Story | AC | EC | S/T | PRD Ref | CP |
|---|---|---|---|---|---|---|
| US-AUTH-01 | As a Guest, I want to register with email, so that I can start using Антидот. | Email-only signup; password requirements; email-verification trigger; rate-limited; не показываем «сколько уже зарегистрировано». | Email уже занят → soft error. Невалидный email → inline ошибка. | Service role не в client (Инв. 12). | §7.1 | §10 Roles |
| US-AUTH-02 | As a Guest, I want to log in with email, so that I can return to my account. | Стандартный login; ошибки общего вида (no user-enumeration); rate-limited. | Wrong password → generic error. | No PII в логах. | §7.1 | §10 |
| US-AUTH-03 | As a Guest, I want to log in with Google, so that I don't need a separate password. | OAuth-flow; minimal scopes; consistent имя пользователя. | OAuth fail → возврат к welcome. | OAuth токены server-side only. | §7.1 | §10 |
| US-AUTH-04 | As a Guest, I want to log in with Apple, so that I have privacy-preserving login. | OAuth-flow; hide-email respected. | Hide-email → product работает через relay. | Не сохраняем raw Apple token client-side. | §7.1 | §10 |
| US-AUTH-05 | As a User, I want my session to persist, so that I don't log in every time. | Secure session storage; refresh; expiry. | Истёкшая сессия → graceful re-auth. | Tokens в secure storage. | §7.1 | §10 |
| US-AUTH-06 | As a User, I want to log out, so that my account is safe on shared device. | Logout invalidates session client + server. | Logout offline → следующая попытка online завершает logout. | Audit отметка по выходу нет (privacy). | §7.1 | §10 |
| US-AUTH-07 | As a User, I want protected screens to redirect me to login, so that I'm not confused. | Все защищённые маршруты редиректят на auth; deep-link preserved. | Deep-link to circle → login → original target. | Не leak'ать contents до auth. | §7.1 | §10 |
| US-AUTH-08 | As a System, I want to enforce a banned-user gate, so that banned users cannot interact. | На любом auth-check banned status → forced sign-out + блокирующий экран. | Banned mid-session → next API call → принудительный logout. | Audit log на ban event (Инв. 4). | §7.1 | §35 (Инв.) |
| US-AUTH-09 | As an authenticated_not_onboarded User, I want to be redirected to onboarding, so that I cannot use circles before completing it. | Любая попытка попасть в main app → onboarding flow. | User закрыл app в середине → resume (US-ONB-15). | Никакой доступ к circles без onboarding. | §7.1, §7.2 | §10 |

### 5.2 Beta / Invite Stories

| ID | User Story | AC | EC | S/T | PRD Ref | CP |
|---|---|---|---|---|---|---|
| US-BETA-01 | As a Guest, I want to enter an invite code, so that I can access closed beta. | Поле для invite code; валидация; success → continue. | Невалидный код → soft error; brute-force защита (rate-limit). | Не enumerable. | §7.1, §7.12 | §10 |
| US-BETA-02 | As a Guest without invite, I want to join a waitlist, so that I can get access later. | Email collection; confirmation message; privacy-policy reference. | Дубликат → soft confirmation. | Минимальный PII (email only). | §7.12 | §10 |
| US-BETA-03 | As a System, I want to track invite code usage, so that we control beta size. | Single-use или limited-use codes; usage count internal. | Race condition при одновременном использовании → first-write-wins. | Не показываем «кто использовал». | §7.12 | §10 |
| US-BETA-04 | As a Guest with denied access, I want to see a clear waitlist CTA, so that I'm not stuck. | Denied state UX → waitlist; объяснение что invites временно ограничены. | — | Non-stigmatizing copy. | §7.12 | §10 |
| US-BETA-05 | As a Product, I want feature flags, so that we can roll out gradually. | Server-driven flags; safe defaults off; per-user overrides. | Flag unavailable → safe default. | Не leak'ать flag content. | §7.12 | §10 |
| US-BETA-06 | As a Beta Admin, I want to invalidate an invite code, so that compromised codes don't spread. | Admin action; audit log. | Code уже использован → нечего инвалидировать. | Audit (Инв. 4). | §7.12 | §35 |
| US-BETA-07 | As a Waitlist user, I want to receive an invite when ready, so that I can start. | Email when granted; one-tap continue в app. | Invalid email → bounce handling. | No location в email. | §7.12 | §10 |

### 5.3 Onboarding Stories

| ID | User Story | AC | EC | S/T | PRD Ref | CP |
|---|---|---|---|---|---|---|
| US-ONB-01 | As a User, I want a welcome screen explaining circles, so that I understand the product. | Короткое описание: круги, ритм, approval как fit-protection, location privacy, no open DMs. | User skip'нул → возможность вернуться в Settings. | Set expectations о no-dating, no-DM. | §7.2 | §2, §10 Manifesto |
| US-ONB-02 | As a User, I want to read and accept safety principles, so that I commit to circle culture. | Required gate; список принципов; «принять и продолжить». | Не принял → не продолжается. | Без acceptance — нет доступа. | §7.2 | §7, §23 |
| US-ONB-03 | As a User, I want to select city / area, so that I see relevant circles. | City picker; area buckets; **area only**, не точная локация. | Город не в списке → "пока недоступно". | Инв. 9 — no exact user location. | §7.2 | §17 Core v2 |
| US-ONB-04 | As a User, I want to pick interests, so that circles match my activities. | Чекбокс / chip select; ограниченный list согласно §10 PRD. | Не выбрал ни одного → soft warning, можно продолжить. | No attractiveness framing. | §7.2 | §8 Manifesto |
| US-ONB-05 | As a User, I want to pick vibe tags, so that circles match my comfort. | Curated tag set (см. §10 PRD); primary signal. | Не выбрал → required для P0. | No dating-coded labels. | §7.2 | §8 |
| US-ONB-06 | As a User, I want to indicate preferred rhythm, so that I find circles that fit my schedule. | weekly / biweekly / monthly / flexible. | — | — | §7.2 | §6 |
| US-ONB-07 | As a User, I want to indicate comfort composition preference, so that I find safe circles. | open mixed / female-friendly / women-only / no preference. Copy non-fear-based. | Self-id'd как man → women-only invisible. | Инв. anti-drift; не over-promise safety. | §7.2 | §21 Core v2 |
| US-ONB-08 | As a User, I want to indicate group size comfort, so that I'm not in too-large circles. | 4–6 / 6–10 / 10+ buckets. | — | — | §7.2 | §6 |
| US-ONB-09 | As a User, I want to opt in to "would consider hosting", so that hosts can find me later. | Opt-in checkbox, не required. | Не opt-in → invisible to host-recruitment. | — | §7.2 | §10 |
| US-ONB-10 | As a User, I want to upload at least one photo, so that hosts know who's coming. | Min 1 photo; format / size validation; AI moderation flag (assistive, Инв. 5). | NSFW → block + retry. | AI assistive only. | §7.2 | §21 PRD, Инв. 5 |
| US-ONB-11 | As a User, I want a verification step (email / phone), so that I'm trusted. | Verification level отображается; phone timing — open в §11. | Не верифицирован → bounded actions per circle policy. | Инв. 3 — verification level shown, raw score hidden. | §7.2 | §22 PRD |
| US-ONB-12 | As a User, I want a profile preview before submit, so that I see what hosts see. | Preview screen; safe-profile view. | Want to edit → возврат на step. | Mirror staged-reveal logic. | §7.2 | §15 |
| US-ONB-13 | As a User, I want to resume onboarding, so that I don't lose progress. | Step persistence; per-step state. | App killed mid-step → resume at last step. | — | §7.2 | §10 |
| US-ONB-14 | As a System, I want to track profile completeness, so that we can guide users. | Internal completeness signal; not shown as number. | — | Инв. 3 — internal only. | §7.2 | §22 Core v2 |
| US-ONB-15 | As a User, I want to understand what is "approval as fit protection", so that approval doesn't feel like ranking. | Onboarding includes copy «Подтверждение нужно, чтобы сохранить формат и комфорт круга — не для оценки людей.» | — | Anti dating-app anxiety. | §7.2 | §19 Core v2 |

### 5.4 Profile Stories

| ID | User Story | AC | EC | S/T | PRD Ref | CP |
|---|---|---|---|---|---|---|
| US-PROF-01 | As a User, I want to view my own profile, so that I see what I look like. | Own-profile view; complete data. | — | — | §7.3 | §10 |
| US-PROF-02 | As a User, I want to edit my profile, so that I can change details. | Edit flow; validation; safe profile updated. | Concurrent edit → last-write-wins (single device assumption). | — | §7.3 | §10 |
| US-PROF-03 | As a User, I want to manage photos, so that I keep them current. | Add / remove / reorder photos. | Photo upload fail → retry. | AI moderation gate (assistive). | §7.3 | §21 PRD |
| US-PROF-04 | As a User, I want to manage vibe / interests, so that discovery stays relevant. | Edit tag selection. | — | — | §7.3 | §8 |
| US-PROF-05 | As a User, I want to manage privacy settings, so that I control what others see. | Privacy toggles; default-private for sensitive fields. | — | Privacy by design. | §7.3 | §24 PRD |
| US-PROF-06 | As a User, I want to see my verification status, so that I know what I've verified. | Badge surfacing (no raw score). | — | Инв. 3. | §7.3 | §22 |
| US-PROF-07 | As a User, I want to see soft positive badges on my profile, so that I see my standing without numbers. | Verified / Reliable / Hosted / Attended badges. | — | Инв. 3 — soft only. | §7.3 | §22 |
| US-PROF-08 | As a User, I want to view another user's safe public profile, so that I know who I'm meeting. | Safe profile (name, photo, badges); **no raw trust score**; **no other circles**; **no report counts**. | Blocked user → invisible. | Инв. 3, 10, 13. | §7.3 | §15 |
| US-PROF-09 | As a User, I want to report a profile, so that I can flag inappropriate behavior. | Report from profile; reason categories; private to admin. | Self-report → not allowed. | Инв. 6. | §7.10 | §23 |
| US-PROF-10 | As a User, I want to block another user, so that I never see or interact with them. | Block from profile; bilateral effects (chat, requests). | Block circle's host → cannot request that circle. | Инв. 6, 11. | §7.10 | §13 |
| US-PROF-11 | As a User, I want my safe profile to never expose my other circles, so that others can't follow my social graph. | Other-circle list hidden. | Same circle → member list visible per stage. | Инв. 13 — no people marketplace. | §7.3 | §15 |

### 5.5 Circle Discovery Stories

| ID | User Story | AC | EC | S/T | PRD Ref | CP |
|---|---|---|---|---|---|---|
| US-DISC-01 | As a User, I want to see a feed of circles, so that I can find one that fits. | Feed of `live` circles in my city; no people feed. | Empty feed → empty state with explanation. | Инв. 13. | §7.4 | §17 Manifesto |
| US-DISC-02 | As a User, I want to filter by vibe, so that I match atmosphere, not just activity. | Multi-select vibe filter. | No matches → empty state. | — | §7.4 | §8 Core v2 |
| US-DISC-03 | As a User, I want to filter by category / activity, so that I match what I want to do. | Category filter (restricted list). | — | — | §7.4 | §10 Core v2 |
| US-DISC-04 | As a User, I want to filter by rhythm, so that I find circles that fit my schedule. | Rhythm filter. | — | — | §7.4 | §6 |
| US-DISC-05 | As a User, I want to filter by area within my city, so that I don't waste time. | Area filter. | Empty area → suggest broader. | Area-only — Инв. 9. | §7.4 | §17 Core v2 |
| US-DISC-06 | As a User, I want to see comfort composition on the circle card, so that I quickly assess safety. | Composition badge on card. | — | §21 framing. | §7.4 | §21 |
| US-DISC-07 | As a User, I want to see size / capacity band, so that I avoid too-large groups. | Size band on card. | — | — | §7.4 | §6 |
| US-DISC-08 | As a User, I want to see host safe profile snippet, so that I know who runs the circle. | Display name + verification badge only. | — | No raw trust. | §7.4 | §22 |
| US-DISC-09 | As a User, I want to see an empty state when nothing matches, so that I'm not confused. | Empty state copy; suggest broaden filters; "Подбери мне круг" CTA later (P1). | — | Non-stigmatizing. | §7.4 | §10 Manifesto |
| US-DISC-10 | As a System, I want to hide unsafe / removed circles, so that users don't see them. | `removed_for_safety` / `paused` excluded from discovery; `full` shown as «full». | — | Инв. 4 + safety surface. | §7.4 | §12 |
| US-DISC-11 | As a User, I want discovery to never show individual people as a primary feed item, so that the product isn't a people catalog. | Feed = circles only; hosts visible only inside circle cards. | — | Инв. 13. | §7.4 | §28 Manifesto |

### 5.6 Circle Detail Stories

| ID | User Story | AC | EC | S/T | PRD Ref | CP |
|---|---|---|---|---|---|---|
| US-CIRC-01 | As a User, I want to open a Circle Detail screen, so that I can decide whether to request a place. | Open from discovery; safe view. | Removed_for_safety → 404-style screen. | — | §7.5 | §6 |
| US-CIRC-02 | As a User, I want to read circle vibe and theme, so that I understand atmosphere. | Vibe tags + theme block. | — | — | §7.5 | §8 |
| US-CIRC-03 | As a User, I want to see circle rhythm, so that I know cadence. | Rhythm indicator. | — | — | §7.5 | §6 |
| US-CIRC-04 | As a User, I want to see approximate area only, so that I understand where without compromising safety. | Area only; **no exact location**. | — | Инв. 1, 9. | §7.5 | §17 Core v2 |
| US-CIRC-05 | As a User, I want to see capacity / current size, so that I know the format. | Size band. | — | — | §7.5 | §6 |
| US-CIRC-06 | As a User, I want to see comfort composition, so that I assess safety. | Composition label visible. | — | §21. | §7.5 | §21 |
| US-CIRC-07 | As a User, I want to see host safe profile, so that I know who runs the circle. | Name + verification badge + brief hosting note. | — | Инв. 3. | §7.5 | §22 |
| US-CIRC-08 | As a User, I want to see next meeting summary (date / area), so that I know the upcoming rhythm. | Date + area only; **no exact location**. | No next meeting → "follow circle" later. | Инв. 1. | §7.5 | §17 |
| US-CIRC-09 | As a User, I want to read an approval explanation, so that I understand it's fit protection. | Explanation block: «Подтверждение нужно, чтобы сохранить формат и комфорт круга — не для оценки людей.» | — | Anti-anxiety. | §7.5 | §19 |
| US-CIRC-10 | As a User, I want to see a location privacy notice, so that I know when exact location appears. | Notice: «Точное место встречи раскрывается только после approval, на конкретную встречу.» | — | Инв. 1. | §7.5 | §17 |
| US-CIRC-11 | As a User, I want to report a circle, so that I can flag unsafe content. | Report CTA visible; reason categories. | — | Инв. 6. | §7.10 | §23 |
| US-CIRC-12 | As a User, I want to tap "Request a place", so that I can begin joining. | CTA visible if `live` & not blocked; opens Request modal. | Banned / blocked / `full` → CTA disabled с copy. | — | §7.7 | §18 PRD |
| US-CIRC-13 | As a User, I want the circle detail to **never** show a full member list before approval, so that privacy is preserved. | Aggregated composition only. | — | §15 staged reveal. | §7.5 | §15 |

### 5.7 Circle Creation / Host Stories

| ID | User Story | AC | EC | S/T | PRD Ref | CP |
|---|---|---|---|---|---|---|
| US-HOST-01 | As a Circle Host, I want to create a circle draft, so that I can prepare without publishing. | Draft state; not visible in discovery. | — | Lifecycle — `draft`. | §7.6 | §12 |
| US-HOST-02 | As a Host, I want to set title / vibe / theme, so that the circle's character is clear. | Required fields; vibe from curated tags. | — | No dating-coded language. | §7.6 | §8 |
| US-HOST-03 | As a Host, I want to set rhythm, so that members know the cadence. | Required: weekly / biweekly / monthly / flexible. | — | — | §7.6 | §6 |
| US-HOST-04 | As a Host, I want to set capacity, so that the circle stays small. | Default small (4–12); hard cap. | — | — | §7.6 | §6 |
| US-HOST-05 | As a Host, I want to set approximate area, so that members know the district. | Area picker; **not exact location**. | — | Инв. 1, 9. | §7.6 | §17 |
| US-HOST-06 | As a Host, I want to set comfort composition, so that members know who's welcome. | Choose from open mixed / female-friendly / women-only / host-defined. women-only / female-friendly gated на §21 PRD validation. | — | §21. | §7.6 | §21 |
| US-HOST-07 | As a Host, I want to set circle rules, so that members know expectations. | Free-text rules block; AI moderation (assistive). | NSFW → soft block + revise. | AI assistive only. | §7.6 | §21 PRD |
| US-HOST-08 | As a Host, I want to schedule a first meeting, so that the circle has a starting point. | Meeting creation flow; date / time / approximate area / **exact location protected**. | — | Инв. 1. | §7.6 | §7 |
| US-HOST-09 | As a Host, I want to preview the circle, so that I see what users will see. | Preview = safe view. | — | — | §7.6 | §15 |
| US-HOST-10 | As a Host, I want to publish the circle, so that it appears in discovery. | Transition `draft` → `pending_review` (опц.) → `live`. | First-time host policy — §27 PRD open. | Lifecycle. | §7.6 | §12 |
| US-HOST-11 | As a Host, I want to edit my circle, so that I can refine it. | Edit flow; safe surface to members. | Edit composition mid-life → members notified neutrally. | — | §7.6 | §12 |
| US-HOST-12 | As a Host, I want to pause my circle, so that I take a break without archiving. | Pause → not in discovery; existing members retained. | — | Lifecycle `paused`. | §7.6 | §12 |
| US-HOST-13 | As a Host, I want to archive my circle, so that it ends gracefully. | Archive → `archived` terminal; members notified neutrally. | — | — | §7.6 | §12 |
| US-HOST-14 | As a Host, I want my circle to be blocked from dating / nightlife / party mechanics, so that the platform stays safe. | Form-level rules; AI assistive check. | Misuse detected → admin review. | Инв. 6; категории §10. | §7.6 | §10 |

### 5.8 Membership Request Stories

| ID | User Story | AC | EC | S/T | PRD Ref | CP |
|---|---|---|---|---|---|---|
| US-REQ-01 | As a User, I want to request a place in a circle, so that I can begin joining. | One request per (user, circle); optional intro-note. | Already requested → state shown. | Rate-limited. | §7.7 | §18 PRD |
| US-REQ-02 | As a User, I want to write a short intro note, so that the host knows me. | Optional, short (≤ ~500 chars). | Empty → submit allowed. | Не «вступительное эссе». | §7.7 | §5.2 |
| US-REQ-03 | As a User, I want to see "requested / pending" state, so that I know my request is with the host. | Non-stigmatizing copy «запрос у хоста». | — | Non-anxiety copy. | §7.7 | §5.3 |
| US-REQ-04 | As a User, I want to cancel my request, so that I can change my mind. | Cancel allowed before host action. | Already actioned → cannot cancel. | — | §7.7 | §10 |
| US-REQ-05 | As a Host, I want to review requests, so that I can curate composition. | Host queue; safe applicant context. | Empty queue → empty state. | Safe context, no raw trust. | §7.7 | §10 |
| US-REQ-06 | As a Host, I want to approve a request for an intro meeting, so that the user can attend once. | Approval → `approved_for_intro_meeting`; user receives invitation. | Already member → reject duplicate. | Lifecycle. | §7.7 | §13 |
| US-REQ-07 | As a Host, I want to approve a request directly as member, so that experienced circles can skip intro. | Per-circle policy. | Default = false (intro required) per §27. | Lifecycle. | §7.7 | §13 |
| US-REQ-08 | As a Host, I want to softly reject a request with «Не в этот раз», so that I don't shame the user. | Soft-reject copy; non-public. | — | Anti-shame. | §7.7 | §19, §11 anti-drift |
| US-REQ-09 | As a Host, I want to waitlist a request, so that I can hold it for later. | Waitlist state; user sees waitlist copy. | Capacity opens → optional notify (no auto-approve). | — | §7.7 | §13 |
| US-REQ-10 | As a User, I want to see "approved for intro meeting" state, so that I know what's next. | State shown; intro meeting card visible. | — | Limited location access — §14 PRD. | §7.7 | §13 |
| US-REQ-11 | As a User, I want to see waitlist state non-stigmatizing, so that I don't feel rejected. | Soft copy. | — | — | §7.7 | §11 |
| US-REQ-12 | As a User, I want to see rejected state non-stigmatizing, so that I don't feel publicly shamed. | «Не в этот раз»; **no public visibility**. | — | Инв. 12. | §7.7 | §11 |
| US-REQ-13 | As a System, I want to prevent blocked users from requesting blocker's circle, so that block is honored. | Validation at submit. | Blocker is host → request hidden as if "no longer accepting". | Инв. 6. | §7.7 | §23 |
| US-REQ-14 | As a System, I want to prevent banned / restricted users from requesting, so that platform stays safe. | Validation at submit. | — | Инв. 6. | §7.7 | §23 |

### 5.9 Intro Meeting / Membership Stories

| ID | User Story | AC | EC | S/T | PRD Ref | CP |
|---|---|---|---|---|---|---|
| US-INTRO-01 | As an approved User, I want to see the intro meeting invitation, so that I know I'm welcome to attend once. | Invitation card; meeting details (date / area); **exact location** revealed per §14 PRD. | — | Инв. 1. | §7.7, §7.8 | §13 |
| US-INTRO-02 | As an approved User, I want to RSVP to the intro meeting, so that the host can plan. | RSVP Going / Can't make it. | Cancel → state updated. | — | §7.8 | §5.4 |
| US-INTRO-03 | As an approved User, I want to attend the intro meeting offline, so that I can decide if this is for me. | System records attendance post-meeting (host-confirmed or system-confirmed per policy). | No-show → US-INTRO-07. | Инв. 3 — no-show internal. | §7.8 | §13 |
| US-INTRO-04 | As a Host, I want to confirm intro attendance, so that I know who came. | Post-meeting attendance UI. | Default state pending until host marks. | — | §7.8 | §13 |
| US-INTRO-05 | As a User, I want to become a member after the intro, so that I belong. | Transition `intro_attended` → `member`; auto-convert или host-confirm per circle policy (§27). | — | Lifecycle. | §7.5 (intro), §7.7 | §13 |
| US-INTRO-06 | As a User, I want to see "Постоянное участие не было подтверждено" state non-stigmatizing, so that not-converting doesn't feel like personal rejection. | Soft administrative copy; **no public visibility**. | — | Инв. 12. | §7.5 (intro) | §11 |
| US-INTRO-07 | As a User, I want my no-show on intro to be treated neutrally first time, so that one mistake doesn't punish me. | First no-show — no automatic negative trust penalty; second+ — internal signal. | — | Инв. 3. | §7.11 | §22 |
| US-INTRO-08 | As a member, I want to see My Circle home, so that I have a primary surface. | My Circles list; this circle card; next meeting. | — | — | §7.12 | §14 |
| US-INTRO-09 | As a member, I want to pause my participation, so that I take a break. | Pause flow; copy «Поставить участие на паузу». | — | Non-stigmatizing. | §7.12 | §11 |
| US-INTRO-10 | As a member, I want to leave quietly, so that I'm not publicly shamed. | Leave flow; «Выйти из круга»; other members see at most «Состав круга обновился». | — | Инв. 11, 12. | §7.12 | §15 |
| US-INTRO-11 | As a Host, I want to end someone's participation with a reason category, so that I curate the circle. | Removal flow; non-public copy; internal reason category. | Frequent removals → internal host-accountability signal. | Audit (Инв. 4). | §7.10 | §13 |
| US-INTRO-12 | As a removed User, I want to lose future access without public shame, so that drama is minimized. | Future meeting locations / chat hidden; **no public label**. | — | Инв. 12. | §7.7, §7.10 | §13 |

### 5.10 Circle Meetings / RSVP Stories

| ID | User Story | AC | EC | S/T | PRD Ref | CP |
|---|---|---|---|---|---|---|
| US-MEET-01 | As a member, I want to see the next meeting, so that I know when to come. | Next meeting card on Circle Home; date / time / area; exact location per access policy. | — | Инв. 1. | §7.8 | §13 |
| US-MEET-02 | As a member, I want to open meeting detail, so that I see RSVPs and updates. | Meeting detail; RSVP block; updates block. | — | — | §7.8 | §13 |
| US-MEET-03 | As a member, I want to RSVP "Буду", so that the host can plan. | RSVP yes; record. | — | — | §7.8 | §5.4 |
| US-MEET-04 | As a member, I want to RSVP "Не смогу", so that the host can adjust. | RSVP no; record. | Change later → allowed until lock. | — | §7.8 | §5.4 |
| US-MEET-05 | As a member, I want a meeting reminder, so that I don't forget. | Push reminder; **no exact location** в notification copy. | — | Инв. 1 — no leak в push. | §7.8 | §17 Core v2 |
| US-MEET-06 | As a member, I want to see the exact location only after the reveal window opens, so that privacy is preserved. | Reveal window per circle policy; member sees exact for upcoming meetings. | — | Инв. 1. | §7.8 | §17 |
| US-MEET-07 | As an approved_for_intro participant, I want to see exact location only for the one intro meeting, so that future meetings stay protected. | Scoped exact location. | — | Инв. 1. | §7.8 | §14 PRD |
| US-MEET-08 | As a member, I want to see "meeting cancelled" state clearly, so that I don't show up. | Cancel copy; RSVPs voided; no trust penalty. | — | — | §7.8 | §12 |
| US-MEET-09 | As a System, I want to mark the meeting "completed" automatically, so that lifecycle moves forward. | Auto-transition after end time + window. | — | Lifecycle. | §7.8 | §13 |
| US-MEET-10 | As a Host, I want to confirm attendance after meeting, so that no-show tracking is accurate. | Post-meeting host action; bulk mark. | — | Инв. 3. | §7.8 | §13 |
| US-MEET-11 | As a System, I want to record no-show internally, so that reliability signal accrues. | Internal signal; **never public**. | First no-show neutral. | Инв. 3, 10. | §7.8 | §22 Core v2 |
| US-MEET-12 | As a member, I want to see prior meetings I attended (history), so that I have continuity. | Personal history list; private. | — | — | §7.8 | §13 |

### 5.11 Circle Chat Stories

| ID | User Story | AC | EC | S/T | PRD Ref | CP |
|---|---|---|---|---|---|---|
| US-CHAT-01 | As a member, I want to open circle chat, so that I can stay in context. | Open from Circle Home; messages load. | Removed → no access (403). | — | §7.9 | §18 PRD |
| US-CHAT-02 | As a member, I want to send a message, so that I can communicate with the group. | Send; deliver; show in chat. | Frozen chat → блокировано. | — | §7.9 | §18 |
| US-CHAT-03 | As a System, I want to post system messages (lifecycle, RSVP locks, meeting reminders), so that members see context. | System message style; non-shaming. | — | — | §7.9 | §18 |
| US-CHAT-04 | As a Host, I want to post a meeting update tagged to that meeting, so that members get context. | Update with meeting tag; visible inside circle chat. | — | — | §7.9 | §18 |
| US-CHAT-05 | As a member, I want to report a message, so that I flag inappropriate content. | Per-message report; reason categories. | — | Инв. 6. | §7.10 | §23 |
| US-CHAT-06 | As a member, I want my blocks to propagate to chat, so that I don't see blocked users' messages. | Blocked user's messages hidden (UI), with breadcrumb «сообщение скрыто». | — | Инв. 6, 11. | §7.9 | §23 |
| US-CHAT-07 | As an admin, I want to freeze a circle chat, so that escalation is contained. | Admin action; audit logged; non-shaming copy for members. | — | Инв. 4. | §7.10 | §23 |
| US-CHAT-08 | As a removed member, I want to lose chat access immediately, so that policy is honored. | Read + write disabled on transition. | Open chat tab during transition → graceful close. | — | §7.9 | §13 |
| US-CHAT-09 | As a paused member, I want chat access per policy (read-only / muted), so that pause is meaningful but not punitive. | Per-policy; default — read-only. | Default TBD §27. | — | §7.9 | §11 (Belonging) |
| US-CHAT-10 | As a User, I want **no direct messaging** from another user's profile, so that cold DMs are impossible. | Profile screens never show "message user" CTA. | — | Инв. 2. | §7.9 | §18 |
| US-CHAT-11 | As a System, I want **no 1:1 channels** in MVP, so that cold-contact pathway doesn't exist. | No DM schema, no DM screens. | — | Инв. 2. | §7.9 | §18 |

### 5.12 Belonging Mode / My Circles Stories

| ID | User Story | AC | EC | S/T | PRD Ref | CP |
|---|---|---|---|---|---|---|
| US-BELONG-01 | As a User with ≥1 circle, I want My Circles as my home, so that I'm not pushed into discovery. | Home defaults to My Circles; discovery one tap away. | First-time user (0 circles) → discovery default. | Инв. 14 — no infinite discovery pressure. | §7.12 | §14 |
| US-BELONG-02 | As a member, I want to see the next meeting prominently, so that participation is effortless. | Next meeting card on top. | — | — | §7.8, §7.12 | §14 |
| US-BELONG-03 | As a member, I want to see my RSVP status, so that I know what I committed to. | RSVP state on next meeting card. | — | — | §7.8 | §14 |
| US-BELONG-04 | As a member, I want to see unread circle chat indicators, so that I stay in touch. | Unread badge per circle. | — | — | §7.9 | §14 |
| US-BELONG-05 | As a member, I want to pause from My Circles, so that pause is easy. | Pause action; copy. | — | — | §7.12 | §11 |
| US-BELONG-06 | As a member, I want to manage notification preferences, so that I'm not over-pinged. | Per-circle notification toggles. | — | — | §7.12 | §10 |
| US-BELONG-07 | As a User, I want a "not looking for new circles" toggle (P1), so that discovery is quieted. | Toggle (P1) — see US-P1-09. | — | Инв. 14. | §7.12 | §16 PRD |
| US-BELONG-08 | As a System, I want to **avoid push-loops urging users to join more circles**, so that belonging is respected. | No nag push; no gamification of circle count. | — | Инв. 14. | §7.12 | §16 |
| US-BELONG-09 | As a User, I want to see guest seat / crossover placeholders (P1), so that I see future expansion options without pressure. | Placeholder copy only; no active mechanic. | — | Controlled growth — §19 Core v2. | §7.12 | §9 |

### 5.13 Safety Stories

| ID | User Story | AC | EC | S/T | PRD Ref | CP |
|---|---|---|---|---|---|---|
| US-SAFE-01 | As a User, I want to report another user, so that I can flag harmful behavior. | Report from profile / member list; reasons; private. | Self-report → not allowed. | Инв. 6. | §7.10 | §23 |
| US-SAFE-02 | As a User, I want to report a circle, so that I flag unsafe circles. | Report from circle detail; reasons. | — | Инв. 6. | §7.10 | §23 |
| US-SAFE-03 | As a User, I want to report a meeting, so that I flag unsafe meetings. | Report from meeting detail. | — | Инв. 6. | §7.10 | §23 |
| US-SAFE-04 | As a User, I want to report a message, so that I flag chat content. | Per-message report. | — | Инв. 6. | §7.10 | §23 |
| US-SAFE-05 | As a User, I want to block another user, so that I never interact with them. | Block action; bilateral. | — | Инв. 6, 11. | §7.10 | §23 |
| US-SAFE-06 | As a reporter, I want a confirmation, so that I know my report was received. | Confirmation toast; no admin queue exposure. | — | Privacy. | §7.10 | §10 |
| US-SAFE-07 | As a reported user, I want to **not** see that I was reported, so that retaliation is impossible. | Reported user gets no signal. | — | Privacy. | §7.10 | §23 |
| US-SAFE-08 | As an Admin, I want to review reports in a queue, so that moderation is structured. | Admin queue with prioritization (AI-assistive). | — | Инв. 4, 5. | §7.10 | §23 |
| US-SAFE-09 | As an Admin, I want to restrict a user, so that they have limited interactions. | Restrict action; audit logged. | — | Инв. 4. | §7.10 | §35 |
| US-SAFE-10 | As an Admin, I want to ban a user, so that they cannot interact. | Ban; force sign-out; audit logged. | Banned mid-session — US-AUTH-08. | Инв. 4. | §7.10 | §35 |
| US-SAFE-11 | As an Admin, I want to remove an unsafe circle, so that members are protected. | `removed_for_safety`; members notified neutrally; audit logged. | — | Инв. 4, 12. | §7.10 | §12 |
| US-SAFE-12 | As an Admin, I want to remove an unsafe meeting, so that safety is preserved. | Meeting `removed_for_safety`; RSVPs voided; audit logged. | — | Инв. 4. | §7.10 | §13 |
| US-SAFE-13 | As an Admin, I want to freeze a chat, so that escalation is contained. | Freeze action; audit logged; member-visible state. | — | Инв. 4. | §7.10 | §23 |
| US-SAFE-14 | As a System, I want to create audit log entries for every moderation-sensitive action, so that traceability is preserved. | Audit log on every action; private. | Failed audit write → action blocked. | Инв. 4. | §7.10 | §23 |
| US-SAFE-15 | As a System, I want AI-assistive triage signals, so that admins can prioritize. | Internal signals; never final judge. | False positive → admin overrides. | Инв. 5. | §7.10 | §21 |
| US-SAFE-16 | As a System, I want velocity / rate-limits, so that spam is throttled. | Per-user per-circle limits. | Burst → throttled with retry copy. | — | §7.10 | §10 |
| US-SAFE-17 | As a member, I want **no public labels** on removed / left / rejected users, so that the product has no public shame. | UI never shows such labels. | — | Инв. 12. | §7.10 | §11 |

### 5.14 Trust Stories

| ID | User Story | AC | EC | S/T | PRD Ref | CP |
|---|---|---|---|---|---|---|
| US-TRUST-01 | As a User, I want to see verification badges on my profile, so that I show trust to others. | Verified badge surface. | — | Инв. 3 — badge only. | §7.11 | §22 |
| US-TRUST-02 | As a System, I want to track profile completeness, so that we have an internal signal. | Internal completeness; not shown as number. | — | Инв. 3. | §7.11 | §22 |
| US-TRUST-03 | As a System, I want to track attendance reliability across meetings, so that trust accrues. | Per-user signal; internal. | — | Инв. 3, 10. | §7.11 | §22 |
| US-TRUST-04 | As a System, I want to track no-show events internally, so that reliability signal is accurate. | No-show count; never public. | First neutral. | Инв. 3. | §7.11 | §22 |
| US-TRUST-05 | As a System, I want to track host reliability, so that hosts who run well are surfaced (badges only). | Host signal track. | — | Инв. 3. | §7.11 | §22 |
| US-TRUST-06 | As a System, I want to record circle participation history internally, so that signals are sourced. | Internal history. | — | Инв. 3. | §7.11 | §22 |
| US-TRUST-07 | As a User, I want soft public badges (Проверен / Надёжный / Hosted / Attended), so that others have soft trust cues. | Badge UI; positive-only. | — | Инв. 3, 10. | §7.11 | §22 |
| US-TRUST-08 | As a User, I want **never** to see a raw trust score, so that the product isn't a ranking system. | UI never shows number. | Admin tools server-side only. | Инв. 3. | §7.11 | §35 |
| US-TRUST-09 | As a System, I want to create trust events for relevant actions, so that signals are auditable. | Append-only trust event log; internal. | — | Инв. 4. | §7.11 | §22 |
| US-TRUST-10 | As a System, I want to detect suspicious trust signals, so that safety can be triaged. | Anomaly signals; AI-assistive; admin review for serious. | False positive → admin override. | Инв. 5. | §7.10 | §21 |
| US-TRUST-11 | As a System, I want trust tier to affect internal safety friction, so that risky behavior is throttled. | Tiered rate-limits internal. | — | Инв. 10. | §7.10, §7.11 | §22 |
| US-TRUST-12 | As a User, I want pausing or leaving a circle to be neutral, so that life flexibility isn't punished. | Pause / leave — no negative trust event by default. | — | Инв. 11, anti-shame. | §7.12 | §11 |
| US-TRUST-13 | As a User, I want **no public negative labels** on my profile, so that I'm not branded. | UI prohibits negative labels. | — | Инв. 10, 12. | §7.11 | §35 |

### 5.15 Admin / Moderation Dashboard Stories

| ID | User Story | AC | EC | S/T | PRD Ref | CP |
|---|---|---|---|---|---|---|
| US-ADM-01 | As an Admin, I want to log into admin app, so that I can moderate. | Admin auth; separate from mobile; server-side service role. | — | Инв. 12. | §7.10 | §10 |
| US-ADM-02 | As an Admin, I want to see a moderation queue, so that I see open reports. | Queue list; filters. | Empty queue → empty state. | — | §7.10 | §10 |
| US-ADM-03 | As an Admin, I want to see report detail, so that I can decide. | Report detail; original content; AI summary (assistive). | — | Инв. 5. | §7.10 | §21 |
| US-ADM-04 | As an Admin, I want to filter the queue by priority, so that I work on critical first. | Priority filter; AI-assistive signal. | — | Инв. 5. | §7.10 | §21 |
| US-ADM-05 | As an Admin, I want to open user detail, so that I see context. | User detail with safe context + internal signals; no leak to other users. | — | — | §7.10 | §10 |
| US-ADM-06 | As an Admin, I want to open circle detail, so that I see circle context. | Circle detail (admin view) + recent reports. | — | — | §7.10 | §10 |
| US-ADM-07 | As an Admin, I want to open meeting detail, so that I see meeting context. | Meeting detail (admin view). | — | — | §7.10 | §10 |
| US-ADM-08 | As an Admin, I want to open message detail, so that I see chat context. | Message detail with surrounding messages. | — | Privacy boundary. | §7.10 | §10 |
| US-ADM-09 | As an Admin, I want to review membership removal events, so that host accountability is preserved. | Removal events; reason categories; host pattern view. | — | Инв. 4. | §7.10 | §23 |
| US-ADM-10 | As an Admin, I want to take a moderation action, so that the report is resolved. | Action types: dismiss / warn / restrict / ban / remove circle / remove meeting / freeze chat. | — | Инв. 4. | §7.10 | §23 |
| US-ADM-11 | As an Admin, I want to add a private admin note, so that other admins have context. | Internal note field; never public. | — | Privacy. | §7.10 | §10 |
| US-ADM-12 | As an Admin, I want to view audit logs, so that I can investigate. | Audit log view; filterable. | — | Инв. 4. | §7.10 | §35 |
| US-ADM-13 | As an Admin, I want to restrict a user, so that they have limited actions. | Restrict action + reason + audit. | — | Инв. 4. | §7.10 | §35 |
| US-ADM-14 | As an Admin, I want to ban a user, so that they can no longer interact. | Ban + reason + audit + force sign-out. | — | Инв. 4. | §7.10 | §35 |
| US-ADM-15 | As an Admin, I want to remove a circle, so that members are protected. | `removed_for_safety` + reason + audit + member-visible neutral copy. | — | Инв. 4, 12. | §7.10 | §35 |
| US-ADM-16 | As an Admin, I want to freeze a circle chat, so that escalation is contained. | Freeze + reason + audit. | — | Инв. 4. | §7.10 | §35 |
| US-ADM-17 | As an Admin, I want serious actions to require a reason, so that decisions are traceable. | Reason required for ban / restrict / remove. | Missing reason → cannot save. | Инв. 4. | §7.10 | §35 |
| US-ADM-18 | As a System, I want to **never** expose service role to client, so that compromise is contained. | Server-only; checked in CI. | — | Инв. 12. | §7.10 | §35 |

### 5.16 Analytics Stories

| ID | User Story | AC | EC | S/T | PRD Ref | CP |
|---|---|---|---|---|---|---|
| US-AN-01 | As a Product, I want to track `signup_completed`, so that activation is measurable. | Event fires once per user; no PII. | — | Privacy boundary. | §22 PRD | §29 Core v2 |
| US-AN-02 | As a Product, I want to track `onboarding_completed`, so that activation funnel is visible. | Event fires once. | — | No PII. | §22 PRD | §29 |
| US-AN-03 | As a Product, I want to track `profile_completed`, so that completion is measured. | Event fires once. | — | — | §22 | §29 |
| US-AN-04 | As a Product, I want to track `first_circle_viewed`, so that discovery engagement is measured. | Event fires once per user. | — | — | §22 | §29 |
| US-AN-05 | As a Product, I want to track `first_circle_request_created`, so that I see request funnel. | Event fires once per user. | — | — | §22 | §29 |
| US-AN-06 | As a Product, I want to track `first_circle_request_approved`, so that approval flow is measured. | Event fires once per user. | — | — | §22 | §29 |
| US-AN-07 | As a Product, I want to track `intro_meeting_attended`, so that first-meeting conversion is measurable. | Event fires per attendance. | — | — | §22 | §29 |
| US-AN-08 | As a Product, I want to track `meeting_rsvp_yes`, so that engagement is visible. | Per meeting. | — | — | §22 | §29 |
| US-AN-09 | As a Product, I want to track `circle_meeting_attended`, so that attendance is visible. | Per meeting per user. | — | — | §22 | §29 |
| US-AN-10 | As a Product, I want to track `repeat_meeting_attendance`, so that belonging is measured. | Count per (user, circle). | — | — | §22 | §29 |
| US-AN-11 | As a Product, I want to track `circle_chat_opened`, so that chat engagement is visible. | Per session per circle. | — | No message body. | §22 | §29 |
| US-AN-12 | As a Product, I want to track `report_created`, so that safety pulse is visible. | Event fires; reason category only; **no description**. | — | Инв. 4, privacy. | §22 | §29 |
| US-AN-13 | As a Product, I want to track `block_created`, so that block volume is visible. | Event fires; no PII of blocked user. | — | Privacy. | §22 | §29 |
| US-AN-14 | As a Product, I want to track `moderation_action_taken`, so that moderation health is visible. | Action type + admin (internal); no public exposure. | — | Инв. 4. | §22 | §29 |
| US-AN-15 | As a Product, I want to track `no_show_recorded`, so that reliability signal is visible internally. | Internal; not shown to user. | — | Инв. 3. | §22 | §29 |
| US-AN-16 | As a Product, I want **no exact location** in analytics, so that privacy is preserved. | Schema-level prohibition. | — | Инв. 1, 9. | §22 | §35 |
| US-AN-17 | As a Product, I want **no raw message body** in analytics, so that messaging stays private. | Schema-level prohibition. | — | Privacy. | §22 | §35 |

---

## 6. P1 User Stories

| ID | Module | User Story | Notes / AC |
|---|---|---|---|
| US-P1-01 | Comms | As two members of the same circle who attended a common meeting, we want mutual opt-in 1:1, so that we can stay in touch in context. | Both opt in; no free first message; no pressure signals; report/block always available. Не должно превращаться в low-friction DM. |
| US-P1-02 | Growth | As a member, I want to bring a vouched guest seat, so that trust transfers through me. | Guest inherits accountability; one seat per cycle; host approval. |
| US-P1-03 | Growth | As a System, I want crossover circles surface, so that adjacent vibes mix in group context (never 1:1 marketplace). | Group-context only. |
| US-P1-04 | Growth | As a Host, I want seasonal gatherings, so that multiple circles overlap. | Group-context only; safety planning. |
| US-P1-05 | Comms | As a member, I want a trusted introduction surface (in-context), so that I can connect post-meetings without cold DM. | Opt-in; in-context only; never marketplace. |
| US-P1-06 | Discovery | As a User, I want vibe-based recommendations, so that suggestions feel right. | Internal model; no people surface. |
| US-P1-07 | Host | As a Host, I want host analytics, so that I run my circle well. | Internal metrics; no public exposure. |
| US-P1-08 | Host | As a Host, I want to add a co-host, so that load can be shared. | Co-host role with limited permissions. |
| US-P1-09 | Belonging | As a User, I want a "not looking for new circles" toggle, so that discovery is quieted. | Discovery deprioritized; never disabled. |
| US-P1-10 | Trust | As a User, I want stronger identity verification (optional), so that I can earn extra trust badge. | Identity badge (no raw score). |
| US-P1-11 | Admin | As an Admin, I want an advanced moderation dashboard, so that triage is faster. | Filters, saved views, AI-assist signals. |
| US-P1-12 | Safety | As a removed user, I want an appeal / review flow, so that mistakes can be corrected. | Async appeal; admin review; no public visibility. |
| US-P1-13 | Privacy | As a User, I want to export and delete my data, so that I control my data lifecycle. | GDPR-style export + delete; audit logged. |
| US-P1-14 | Localization | As a User, I want to choose UI language (RU/EN), so that I'm comfortable. | i18n; default RU. |
| US-P1-15 | Notifications | As a User, I want fine-grained notification preferences, so that I'm not pinged for everything. | Per-circle, per-type toggles. |
| US-P1-16 | AI | As a User, I want vibe-based match suggestions, so that fit improves. | Internal model; no people marketplace. |
| US-P1-17 | Host | As a Host, I want to schedule recurring meetings in bulk, so that the rhythm is set. | Bulk-create with sane defaults. |
| US-P1-18 | Discovery | As a User, I want "Подбери мне круг" concierge, so that I can ask for help. | Manual / curated initially. |
| US-P1-19 | Host | As a Host, I want to mark a member as "co-host moment" rotation, so that responsibility rotates. | Soft mechanic; non-permanent. |

> **Hard guardrail:** ни одна P1 story не должна добавлять open DMs (Инв. 2), people marketplace (Инв. 13), dating mechanics (Hard rule 6), public ratings (Hard rule 5) или raw trust score (Инв. 3).

---

## 7. P2 / Explicitly Deferred Stories

| ID | Topic | Why deferred / forbidden | Risk | Product decision required before implementation |
|---|---|---|---|---|
| US-P2-01 | open DMs (1:1 без shared context) | Инв. 2 — cold контакт несовместим с context-first | Создаёт DM-based abuse surface, эрозия belonging | Полный Product Core update + safety re-validation |
| US-P2-02 | swipe-механика | Анти-дрейф — dating-coded | Превращает продукт в Tinder-гибрид | Product Core update + кастдев |
| US-P2-03 | people-first discovery (browse users) | Инв. 13 — no people marketplace | Креепи + comparison + dating dynamics | Полный пересмотр продукта |
| US-P2-04 | public followers | Инв. 17 / Анти-дрейф | Vanity + follower economy | Product Core update |
| US-P2-05 | public ratings | Hard rule 5 | Public shaming + social credit risk | Product Core update |
| US-P2-06 | dating mechanics (interested-in, like, match) | Hard rule 6 | Превращает в dating app | Полный пересмотр позиционирования |
| US-P2-07 | romantic matching | Hard rule 6 | то же | то же |
| US-P2-08 | chemistry score | Hard rule 6 | то же | то же |
| US-P2-09 | exact public map pins | Инв. 1 | Safety risk | Не должно реализоваться |
| US-P2-10 | live location | Инв. 9 | Safety risk | Не должно реализоваться |
| US-P2-11 | payments | Core rule 7 | Корраптит trust loop в MVP | Только после доказанного loop'а + Product Core update |
| US-P2-12 | tickets | Core rule 7 | то же | то же |
| US-P2-13 | paid events | Core rule 7 | то же | то же |
| US-P2-14 | promoted circles | Pay-to-be-seen | Корраптит host accountability | Не в MVP |
| US-P2-15 | nightlife / party mechanics | Не входит в категории; safety risk | Не входит в trust-first позиционирование | Product Core update |
| US-P2-16 | streams / online broadcast | Не относится к офлайн-loop'у | Distraction от core | Отдельный продукт |
| US-P2-17 | complex auto-matching | Преждевременно | Intelligence нужно после реальных данных | P1 после данных |
| US-P2-18 | B2B monetization | После proof of loop | Корраптит retention механики | Product decision + Core update |

---

## 8. Critical Safety Edge Cases

| ID | Сценарий | Ожидаемое поведение |
|---|---|---|
| EC-01 | `requested` user пытается получить exact meeting location | 403 / hidden; видит только area (Инв. 1). |
| EC-02 | `waitlisted` user пытается читать circle chat | 403 / hidden; нет доступа. |
| EC-03 | `rejected` user пытается видеть member list | Скрыт; видит aggregated только. |
| EC-04 | `approved_for_intro_meeting` пытается видеть future meetings beyond intro | Скрыто; видит только эту intro-встречу. |
| EC-05 | `removed` member пытается войти в chat | 403; chat закрыт; non-shaming copy. |
| EC-06 | `paused` member пытается RSVP | Per policy — обычно нельзя; copy «возобновите участие». |
| EC-07 | Blocked user пытается request membership в круг блокирующего | UI: «круг недоступен»; не пройдёт validation на submit. |
| EC-08 | Banned user пытается логиниться / взаимодействовать | Force sign-out; auth gate; уведомление о бане без deep stigma (Инв. 12). |
| EC-09 | User leaves circle A и joins circle B; circle A не должен видеть transition | Circle A видит «состав обновился»; nothing else (Инв. 11). |
| EC-10 | Host removes member after a meeting | Member видит non-stigmatizing copy; чат / future meetings скрыты; **никаких уведомлений** другим членам. |
| EC-11 | User чувствует, что был "отвергнут" после intro | Copy «Постоянное участие не было подтверждено»; soft + administrative tone (§19). |
| EC-12 | Member reports the host | Запись в queue; host не видит, что был flagged; admin review с приоритетом. |
| EC-13 | Host repeatedly removes members | Internal host-accountability signal; admin review trigger; **не публикуется**. |
| EC-14 | Member blocks another member in the same circle | Сообщения скрываются обеим сторонам; circle chat остаётся доступен; нет публичного «X заблокировал Y». |
| EC-15 | User reports circle for unsafe composition | Report → moderation queue; circle не disclosed что был flagged. |
| EC-16 | Women-only circle получает подозрительный request | Host видит safe applicant context; может soft-reject; system flag если signals suspicious. |
| EC-17 | Exact location появляется в public circle description (host пытается обойти) | Form-level validation + AI assistive check блокируют публикацию; admin review при подозрении (Инв. 1). |
| EC-18 | Push notification содержит exact meeting location | **Запрещено** schema-level; notification copy всегда без exact location. |
| EC-19 | Analytics event случайно содержит exact location | Schema validation отклоняет event; alert в observability. |
| EC-20 | Reported message удалён отправителем до admin review | Snapshot сохраняется при report; admin видит original (Инв. 4). |
| EC-21 | AI false positive flagging круга | Admin override; appeal flow (P1); audit logged. |
| EC-22 | User no-shows repeatedly | Internal signal accrues; first n no-show'ов — neutral; tier change возможна без public exposure (Инв. 3). |
| EC-23 | Circle становится `full` пока user fills request | UI обновляется; user видит copy «круг сейчас полон, добавлен в waitlist» (если waitlist). |
| EC-24 | User deletes profile while membership pending | Pending request silently cancelled; host не видит deleted user в queue; audit logged для completeness. |
| EC-25 | Circle removed for safety до запланированной встречи | RSVPs voided; members notified neutrally; locations отозваны; audit logged (Инв. 4). |
| EC-26 | Host attempts to add dating-coded language to circle description | AI assistive flag → soft block + revise; admin review при повторе (Анти-дрейф). |
| EC-27 | Member attempts to DM another member via profile (UI пробуют добавить) | UI не имеет такого CTA; API не имеет endpoint'а (Инв. 2; CLAUDE.md §10). |

---

## 9. Traceability Matrix

| Product Area | PRD Section | Story IDs | Product Core Principle / Invariant |
|---|---|---|---|
| Auth | §7.1 | US-AUTH-01…09 | §10 Roles; Инв. 12 (service role) |
| Beta | §7.12 | US-BETA-01…07 | §10 Roles |
| Onboarding | §7.2 | US-ONB-01…15 | §6, §8, §17, §21; Инв. 9 |
| Profiles | §7.3 | US-PROF-01…11 | §15, §22; Инв. 3, 10, 13 |
| Circle Discovery | §7.4 | US-DISC-01…11 | §8, §17 Manifesto; Инв. 13 |
| Circle Detail | §7.5 | US-CIRC-01…13 | §15, §17, §19; Инв. 1 |
| Circle Creation / Host | §7.6 | US-HOST-01…14 | §6, §12; Анти-дрейф |
| Membership Requests | §7.7 | US-REQ-01…14 | §19 (fit protection); Инв. 6, 8 |
| Intro Meeting / Membership | §7.5, §7.7, §7.12 | US-INTRO-01…12 | §13, §11; Инв. 11, 12 |
| Meetings / RSVP | §7.8 | US-MEET-01…12 | §14, §17; Инв. 1, 9 |
| Circle Chat | §7.9 | US-CHAT-01…11 | §18; Инв. 2 |
| Belonging Mode | §7.12 | US-BELONG-01…09 | §14 Core v2; Инв. 14 |
| Safety | §7.10 | US-SAFE-01…17 | §23; Инв. 4, 5, 6, 12 |
| Trust | §7.11 | US-TRUST-01…13 | §22; Инв. 3, 10 |
| Admin Moderation | §7.10 | US-ADM-01…18 | §25 PRD; Инв. 4, 5, 12 |
| Analytics | §22 PRD | US-AN-01…17 | §29 Core v2; Инв. 1, 3, 9 |

---

## 10. MVP Coverage Checklist

| Area | Covered? | Story refs |
|---|:--:|---|
| Auth | ✅ | US-AUTH-01…09 |
| Beta invite / waitlist | ✅ | US-BETA-01…07 |
| Onboarding | ✅ | US-ONB-01…15 |
| Profiles | ✅ | US-PROF-01…11 |
| Circle discovery | ✅ | US-DISC-01…11 |
| Circle detail | ✅ | US-CIRC-01…13 |
| Circle creation | ✅ | US-HOST-01…14 |
| Membership requests | ✅ | US-REQ-01…14 |
| Intro meeting | ✅ | US-INTRO-01…12 |
| Meetings / RSVP | ✅ | US-MEET-01…12 |
| Circle chat | ✅ | US-CHAT-01…11 |
| Belonging mode | ✅ | US-BELONG-01…09 |
| Location privacy | ✅ | US-MEET-05…07, US-CIRC-04/10, US-DISC-05, EC-01/02/04/18 |
| Composition visibility | ✅ | US-DISC-06, US-CIRC-13, US-PROF-08/11 |
| Pause / leave / removal | ✅ | US-INTRO-09…12, US-CHAT-08/09 |
| Report / block | ✅ | US-SAFE-01…07, US-PROF-09/10, US-CHAT-05 |
| Admin moderation | ✅ | US-ADM-01…18 |
| Trust | ✅ | US-TRUST-01…13 |
| Analytics | ✅ | US-AN-01…17 |
| **No open DMs** | ✅ | US-CHAT-10/11, EC-27 |
| **No people marketplace** | ✅ | US-DISC-11, US-PROF-08/11 |
| **No public ratings** | ✅ | US-TRUST-08/13, US-DISC-01 |
| **No raw trust score** | ✅ | US-TRUST-08, US-PROF-06/07 |
| **No dating mechanics** | ✅ | US-ONB-04/05/15, US-HOST-14 |
| **No public shame** | ✅ | US-INTRO-10/11/12, US-SAFE-17, US-REQ-08/12, EC-09/10 |
| **No exact public location** | ✅ | US-CIRC-04/10, US-MEET-06/07, EC-17/18/19 |
| **No payments / tickets** | ✅ | US-P2-11/12/13/14 (deferred) |

---

## 11. Open Questions

1. **First beta city / community** — выбор стартового рынка (Москва? СПб? Тбилиси? Lisbon?).
2. **Phone verification timing** — до request? до approval? до первой встречи?
3. **Exact comfort composition modes** — формулировки RU/EN.
4. **Women-only P0 или P1** — gated на §21 PRD validation.
5. **Как валидировать women-only / female-friendly** — методика 5–7 интервью с женщинами; copy variants.
6. **Intro meeting vs immediate membership** — default policy для новых кругов?
7. **Сколько встреч до full membership** — 1? 2? host-defined?
8. **Approved member visibility of full member list** — до intro? после intro? только после первой встречи?
9. **Host removal permissions** — какие категории требуют admin review?
10. **Pause / return rules** — paused user может RSVP? pause имеет TTL?
11. **Post-meeting membership confirmation** — auto-convert или host-confirm?
12. **No-show dispute flow** — есть ли? как?
13. **First-time host manual review** — все ли новые круги через `pending_review`?
14. **`approved_for_intro` chat access** — limited / full / muted? US-CHAT-09 ссылается на эту неопределённость.
15. **Block при двух members в одном круге** — какие именно visibility-эффекты? EC-14 описывает базовое поведение.
16. **«Не ищу новые круги» — P0 или P1?** — US-P1-09 предполагает P1, но кастдев может сдвинуть.
17. **Figma v2 prototype scope** — какие screens первыми?
18. **Recurring meeting series** — bulk-schedule в P0 или P1?
19. **Co-host** — P1 (US-P1-08); возможен ли минимальный delegation в P0?

---

## 12. Summary

- **User Stories v2** переводят Product Core v2 и PRD v2 в implementation-ready stories.
- **MVP — circle-first.** Events заменены на meetings внутри circles.
- **Все 16 safety-инвариантов** (Core v2 §35) остаются binding — каждая story либо защищает инвариант, либо явно ссылается на него.
- **No open DMs**, **no people marketplace**, **no dating mechanics**, **no raw trust score**, **no public shame**, **no exact public location** — все checks в §10 MVP Coverage.
- **Implementation freeze** в силе до завершения migration ([`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)).

**Next document:** [`/docs/03_USER_FLOWS.md`](03_USER_FLOWS.md) должен быть обновлён до **User Flows v2** ([doc 27 §24 step 5](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)).

---

> Reminder: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2) — **first source of truth**. Этот документ ему и PRD v2 подчинён. Любая future story / flow / Figma artifact / implementation task должен ссылаться на Story ID из этого документа.
