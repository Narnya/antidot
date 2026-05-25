# User Stories v1 — Social Events App

> **Status:** v1 (P0 set for closed beta)
> **Owner:** Product
> **Last updated:** 2026-05-18
> **First source of truth:** [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md)
> **Requirements source:** [`/docs/01_PRD.md`](01_PRD.md)

---

## 1. Source of Truth

- Этот документ основан на [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (first source of truth) и [`/docs/01_PRD.md`](01_PRD.md) (требования).
- При конфликте PRD ↔ Product Core приоритет имеет **Product Core**.
- Ни одна user story не может нарушать safety-инварианты Product Core (Инварианты 1–10).
- Все будущие implementation tasks и flow/Figma-документы должны ссылаться на **Story ID** из этого документа.
- Нерешённые вопросы вынесены в [§11 Open Questions](#11-open-questions), а не «додуманы» молча (per CLAUDE.md §3).

---

## 2. Story Format

```
As a [role],
I want to [action],
so that [benefit].
```

Поля каждой story:

| Поле | Описание |
|------|----------|
| Story ID | `US-<MODULE>-NN` (стабильный, на него ссылаются flows/backlog) |
| Priority | P0 / P1 / P2 |
| Role | Guest / User / Host / Admin / System |
| Module | Auth, Onboarding, Profiles, Discovery, Events, Applications, Chat, Notifications, Safety, Trust, Admin, Beta, Analytics |
| User Story | As a … I want … so that … |
| Acceptance Criteria | Проверяемые условия готовности |
| Edge Cases | Нестандартные ситуации |
| Safety / Trust Notes | Какие инварианты затронуты |
| Related PRD Section | Ссылка на раздел/FR PRD + принцип Product Core |

Module-префиксы Story ID: `AUTH, ONB, PROF, DISC, EVT, APP, CHAT, NOTIF, SAFE, TRUST, ADMIN, BETA, ANL`.

---

## 3. User Roles Covered

| Роль | Типы stories |
|------|--------------|
| **Guest / Visitor** | Регистрация, вход, invite/waitlist, ограничения доступа. |
| **User** | Onboarding, профиль, discovery, заявки, чат, отчёты/блок, privacy. |
| **Host** | Создание/управление событиями, review заявок, модерация своего события. |
| **Admin / Moderator** | Moderation queue, reports, restrict/ban, удаление событий, audit logs. |
| **System** | Lifecycle-переходы, velocity limits, trust events, analytics, нотификации. |

---

## 4. Priority Definitions

### P0
Обязательно для закрытой беты. Без этого loop **Discover → Apply → Approve → Attend → Reconnect** или safety-baseline не работает.

### P1
Важно после закрытой беты / в расширенной бете. Не блокирует запуск.

### P2
Не делать сейчас. Документируется для контекста. **Реализация запрещена без отдельного product decision и обновления Product Core.**

> P2 stories можно описывать, но нельзя реализовывать в MVP. Многие из них прямо нарушили бы safety-инварианты, если внедрить наивно.

---

# 5. P0 User Stories

## 5.1 Auth Stories

**US-AUTH-01** · P0 · Guest · Auth
> As a guest, I want to register with email, so that I can create an account and enter the product.
- **AC:** валидация email/пароля; письмо/код подтверждения; при успехе создаётся `User`; редирект в onboarding.
- **Edge:** email уже зарегистрирован → предложить вход; невалидный email → inline-ошибка.
- **Safety:** аккаунт без onboarding не имеет доступа к событиям.
- **Refs:** PRD §6.1 (FR-001); Core: Auth, «Auth обязательный».

**US-AUTH-02** · P0 · Guest · Auth
> As a guest, I want to log in with email, so that I can return to my account.
- **AC:** корректные креды → сессия; неверные креды → понятная ошибка без утечки, существует ли аккаунт.
- **Edge:** забытый пароль → reset flow; слишком много попыток → rate limit.
- **Safety:** не раскрывать существование аккаунта при ошибке (anti-enumeration).
- **Refs:** PRD §6.1 (FR-001).

**US-AUTH-03** · P0 · Guest · Auth
> As a guest, I want to log in with Google, so that I can sign in quickly.
- **AC:** OAuth-поток; при первом входе создаётся `User`; маршрут в onboarding или app.
- **Edge:** отказ в OAuth → возврат на Welcome; email Google совпал с существующим email-аккаунтом → политика связывания (Open Question).
- **Safety:** только аутентификация, доступ к loop по-прежнему гейтится onboarding.
- **Refs:** PRD §6.1 (FR-002).

**US-AUTH-04** · P0 · Guest · Auth
> As a guest, I want to log in with Apple, so that I can sign in on iOS without sharing email.
- **AC:** Apple Sign-In; поддержка private relay email; создание `User`.
- **Edge:** hide-my-email → профиль всё равно требует контактных данных по политике (Open Question).
- **Safety:** обязательно для iOS-стора; не ослабляет verification-требования.
- **Refs:** PRD §6.1 (FR-003).

**US-AUTH-05** · P0 · User · Auth
> As a user, I want to verify my phone number, so that I gain trust to participate.
- **AC:** ввод номера → SMS-код → подтверждение; `phone_verified` сохраняется в профиле/trust.
- **Edge:** код не пришёл → resend с cooldown; неверный код → лимит попыток.
- **Safety:** verification-статус — внутренний trust-сигнал; точка обязательности (apply vs approval) — Open Question OD-1.
- **Refs:** PRD §6.1 (FR-004); Core: Инвариант 8 (trust mechanic).

**US-AUTH-06** · P0 · User · Auth
> As a user, I want my session to persist across app restarts, so that I don't log in every time.
- **AC:** сессия восстанавливается после рестарта; refresh-токен; истечение по политике.
- **Edge:** отозванная сессия (ban/restrict) → принудительный logout; смена устройства.
- **Safety:** забаненный пользователь не может восстановить сессию.
- **Refs:** PRD §6.1 (FR-005).

**US-AUTH-07** · P0 · User · Auth
> As a user, I want to log out, so that I can secure my account on shared devices.
- **AC:** logout очищает сессию локально и инвалидирует токен; возврат на Welcome.
- **Edge:** logout при офлайне → локальная очистка, серверная при коннекте.
- **Safety:** после logout нет доступа к protected-экранам.
- **Refs:** PRD §6.1 (FR-005).

**US-AUTH-08** · P0 · System · Auth
> As the system, I want to protect all routes except landing/auth, so that unauthenticated users can't reach the loop.
- **AC:** любой protected-экран без сессии → редирект на Auth; deep link сохраняется и открывается после входа.
- **Edge:** истёкшая сессия в середине действия → graceful re-auth.
- **Safety:** реализует «Auth обязательный»; защищает весь loop.
- **Refs:** PRD §6.1 (FR-006), §18 (secure by default).

**US-AUTH-09** · P0 · System · Auth
> As the system, I want to block event access until onboarding is complete, so that users have context before reaching people.
- **AC:** `authenticated_not_onboarded` имеет доступ только к onboarding-стеку; попытка перейти к discovery → редирект в onboarding.
- **Edge:** частично завершённый onboarding → resume на нужном шаге.
- **Safety:** реализует «Onboarding обязательный»; нет доступа к людям без контекста.
- **Refs:** PRD §6.2 (FR-014); Core: Инвариант 7.

---

## 5.2 Onboarding Stories

**US-ONB-01** · P0 · User · Onboarding
> As a new user, I want to see a welcome screen, so that I understand what the product is and isn't.
- **AC:** экран объясняет: маленькие безопасные офлайн-встречи; **не dating**; approval-модель.
- **Edge:** повторный вход уже onboarded → пропуск welcome.
- **Safety:** позиционирование «не dating» с первого экрана (anti-dating perception).
- **Refs:** PRD §6.2 (FR-007); Core: «не dating app».

**US-ONB-02** · P0 · User · Onboarding
> As a new user, I want to read and accept safety principles, so that I understand how safety works.
- **AC:** показаны: location скрыт до approval; нет open DMs; report/block; approval; acceptance фиксируется (timestamp/version).
- **Edge:** отказ принять → нельзя продолжить onboarding.
- **Safety:** Инвариант 7 (safety как часть UX); фиксируемое согласие.
- **Refs:** PRD §6.2 (FR-007); Core: Инвариант 7.

**US-ONB-03** · P0 · User · Onboarding
> As a new user, I want to enter basic profile info, so that others have minimal context about me.
- **AC:** имя; возраст/age range (OD-2); сохраняется в `Profile`.
- **Edge:** недопустимый возраст (<18) → блок; пустые обязательные поля → валидация.
- **Safety:** минимизация данных (privacy by design).
- **Refs:** PRD §6.2 (FR-008).

**US-ONB-04** · P0 · User · Onboarding
> As a new user, I want to select my city, so that I see relevant local events.
- **AC:** выбор из beta-списка городов; сохраняется; влияет на discovery.
- **Edge:** город не в списке → waitlist/уведомление «скоро».
- **Safety:** город, не точная локация (Инвариант 9).
- **Refs:** PRD §6.2 (FR-009).

**US-ONB-05** · P0 · User · Onboarding
> As a new user, I want to select interests, so that I find people with similar context.
- **AC:** мультивыбор из фикс. списка; ≥ N интересов (OD-5).
- **Edge:** ничего не выбрано → подсказка/минимум.
- **Safety:** интересы социальные, не романтический мэтчинг.
- **Refs:** PRD §6.2 (FR-010).

**US-ONB-06** · P0 · User · Onboarding
> As a new user, I want to select vibe tags, so that my social style is clear.
- **AC:** выбор vibe-тегов из набора; сохраняется в профиль.
- **Edge:** слишком много тегов → лимит.
- **Safety:** нет «attractiveness»-полей (anti-dating).
- **Refs:** PRD §6.2 (FR-011).

**US-ONB-07** · P0 · User · Onboarding
> As a new user, I want to select my social intent, so that the product matches the right context.
- **AC:** intent = social/friendship опции (не romantic); сохраняется.
- **Edge:** отсутствует выбор → дефолт «social».
- **Safety:** intent явно non-dating.
- **Refs:** PRD §6.2 (FR-012); Core: «не dating app».

**US-ONB-08** · P0 · User · Onboarding
> As a new user, I want to upload photos, so that I appear as a real person.
- **AC:** ≥1 фото; загрузка триггерит moderation; статус `pending`/`approved`/`rejected`.
- **Edge:** неподходящее фото → reject + просьба заменить; загрузка прервана → retry.
- **Safety:** AI photo moderation (assistant, не judge — Инвариант 5).
- **Refs:** PRD §6.2 (FR-013), §15.

**US-ONB-09** · P0 · User · Onboarding
> As a new user, I want a phone verification step, so that I can be trusted to participate.
- **AC:** шаг verification присутствует в onboarding flow; обязательность точки — OD-1.
- **Edge:** пропуск (если разрешён до approval) → пометка `phone_unverified`.
- **Safety:** trust-сигнал; не показывается как число.
- **Refs:** PRD §6.1 (FR-004); Core: Инвариант 3/8.

**US-ONB-10** · P0 · System · Onboarding
> As the system, I want to calculate profile completeness, so that trust and gating can use it.
- **AC:** completeness вычисляется из заполненных полей/фото/verification; хранится внутренне.
- **Edge:** частичный профиль → completeness < порога apply (OD-6).
- **Safety:** completeness — внутренний сигнал, не публичное число (Инвариант 3).
- **Refs:** PRD §6.2 (FR-015), §14.

**US-ONB-11** · P0 · User · Onboarding
> As a returning user, I want to resume incomplete onboarding, so that I don't restart from scratch.
- **AC:** возврат на первый незавершённый шаг; сохранённые данные не теряются.
- **Edge:** moderation фото `pending` → onboarding можно завершить, доступ к apply гейтится отдельно.
- **Safety:** нет доступа к событиям, пока onboarding не завершён.
- **Refs:** PRD §6.2 (FR-014).

---

## 5.3 Profile Stories

**US-PROF-01** · P0 · User · Profiles
> As a user, I want to view my own profile, so that I see how I'm represented.
- **AC:** показаны имя, фото, интересы, vibe, verification-статус, soft-бейджи, completeness-подсказка.
- **Edge:** фото на модерации → плейсхолдер/статус.
- **Safety:** raw trust score **не** показывается (Инвариант 3).
- **Refs:** PRD §6.3 (FR-016, FR-022).

**US-PROF-02** · P0 · User · Profiles
> As a user, I want to edit my profile, so that I keep it accurate.
- **AC:** редактирование bio/интересов/vibe; сохранение; изменения текста могут триггерить moderation.
- **Edge:** недопустимый контент → флаг/блок сохранения.
- **Safety:** moderation текста (AI assistant).
- **Refs:** PRD §6.3 (FR-017).

**US-PROF-03** · P0 · User · Profiles
> As a user, I want to manage my photos, so that I control my representation.
- **AC:** добавить/удалить/переупорядочить; новое фото → re-moderation.
- **Edge:** удаление единственного фото → предупреждение (минимум 1).
- **Safety:** каждое новое фото проходит moderation.
- **Refs:** PRD §6.3 (FR-018).

**US-PROF-04** · P0 · User · Profiles
> As a user, I want to manage interests, so that my context stays relevant.
- **AC:** изменение списка интересов; сохраняется; влияет на профиль.
- **Edge:** все интересы удалены → требовать минимум.
- **Safety:** социальный контекст, не мэтчинг.
- **Refs:** PRD §6.3 (FR-017).

**US-PROF-05** · P0 · User · Profiles
> As a user, I want to manage vibe tags, so that my social style stays accurate.
- **AC:** изменение vibe-тегов; лимит сохраняется.
- **Edge:** превышение лимита → ошибка.
- **Safety:** нет dating-атрибутов.
- **Refs:** PRD §6.3 (FR-017).

**US-PROF-06** · P0 · User · Profiles
> As a user, I want privacy settings, so that I control who sees what.
- **AC:** настройки видимости полей в safe-профиле; объяснение, кто что видит.
- **Edge:** конфликт с обязательным safe-минимумом → минимум всегда виден host approved-контекста.
- **Safety:** Инвариант 7 (понятная privacy).
- **Refs:** PRD §6.3 (FR-019).

**US-PROF-07** · P0 · User/Host · Profiles
> As a user or host, I want to view another user's safe public profile, so that I have context before interaction.
- **AC:** видны только safe-поля + soft-бейджи; нет чувствительных/внутренних полей.
- **Edge:** профиль заблокирован/забанен → ограниченный/скрытый вид.
- **Safety:** нет raw trust score; нет «who viewed»; объём safe-полей — OD-3.
- **Refs:** PRD §6.3 (FR-021), §13.2.

**US-PROF-08** · P0 · User · Profiles
> As a user, I want to see public trust badges on a profile, so that I can gauge reliability softly.
- **AC:** показаны нечисловые бейджи (Verified / Reliable attendee / Hosted before / Attended events).
- **Edge:** нет бейджей → нейтральный вид без негативных ярлыков.
- **Safety:** Инвариант 3/10 — мягкие сигналы, не рейтинг.
- **Refs:** PRD §14.2; Core: Инвариант 3, 10.

**US-PROF-09** · P0 · User · Profiles
> As a user, I want to report a profile, so that unsafe users are reviewed.
- **AC:** report доступен из safe-профиля; выбор причины; создаётся `Report`; уходит в moderation queue.
- **Edge:** повторный report того же → дедуп/throttle.
- **Safety:** Инвариант 6; audit при review.
- **Refs:** PRD §6.7 (FR-049).

**US-PROF-10** · P0 · User · Profiles
> As a user, I want to block another user, so that they can no longer interact with me.
- **AC:** block из профиля/attendee/чата; создаётся `Block`; взаимодействие прекращается.
- **Edge:** блок участника общего события → правила видимости (см. §8).
- **Safety:** заблокированные не взаимодействуют; обратимость — OD/Open Question.
- **Refs:** PRD §6.7 (FR-050), §13.2.

**US-PROF-11** · P0 · System · Profiles
> As the system, I want to never expose raw trust score in any profile view, so that the trust system isn't social credit.
- **AC:** ни один клиентский endpoint/экран не возвращает числовой trust score.
- **Edge:** debug/admin контексты — отдельный admin-only путь, не клиент.
- **Safety:** Инвариант 3 и 10 (жёсткое правило).
- **Refs:** PRD §6.3 (FR-022), §14.3.

---

## 5.4 Event Discovery Stories

**US-DISC-01** · P0 · User · Discovery
> As an onboarded user, I want to see available events near me, so that I can find something to attend.
- **AC:** лента событий по городу пользователя; только `live`/`full` (с пометкой); approximate area.
- **Edge:** нет событий → empty state с подсказкой.
- **Safety:** Инвариант 1/9 — без точной локации/pin.
- **Refs:** PRD §6.4 (FR-029), §12.

**US-DISC-02** · P0 · User · Discovery
> As a user, I want to filter events by category, so that I find relevant formats.
- **AC:** фильтр по фикс. категориям MVP; результат обновляется.
- **Edge:** комбинация фильтров без результатов → empty state.
- **Safety:** только разрешённые категории (нет nightlife/dating).
- **Refs:** PRD §6.4 (FR-029), §9.

**US-DISC-03** · P0 · User · Discovery
> As a user, I want to filter events by date, so that I find events that fit my schedule.
- **AC:** фильтр по дате/периоду; прошедшие скрыты.
- **Edge:** фильтр на прошлое → пусто.
- **Safety:** —.
- **Refs:** PRD §6.4 (FR-029).

**US-DISC-04** · P0 · User · Discovery
> As a user, I want to see only approximate location in discovery, so that exact places stay private.
- **AC:** в карточке/деталях до approval — city/area/distance bucket; нет точечного pin.
- **Edge:** попытка получить точные координаты через API → запрещено RLS.
- **Safety:** Инвариант 1/9 (критично).
- **Refs:** PRD §12; Core: Инвариант 1, 9.

**US-DISC-05** · P0 · User · Discovery
> As a user, I want to open event details from discovery, so that I can decide whether to apply.
- **AC:** тап по карточке → Event Detail (вариант по статусу заявки).
- **Edge:** событие отменено/удалено между списком и открытием → состояние «недоступно».
- **Safety:** контент-вариант зависит от состояния пользователя.
- **Refs:** PRD §6.4 (FR-030).

**US-DISC-06** · P0 · User · Discovery
> As a user, I want to see event capacity, so that I know if there's room.
- **AC:** показано занято/всего; `full` помечено.
- **Edge:** capacity заполнилась во время просмотра → актуализация при apply.
- **Safety:** —.
- **Refs:** PRD §6.4 (FR-027).

**US-DISC-07** · P0 · User · Discovery
> As a user, I want to see that an event requires approval, so that I set expectations.
- **AC:** явная пометка «требует одобрения host».
- **Edge:** —.
- **Safety:** Инвариант 8 (approval как фича, явно в UI).
- **Refs:** PRD §6.4 (FR-028).

**US-DISC-08** · P0 · User · Discovery
> As a user, I want to see the host's safe profile from an event, so that I have context about who's organizing.
- **AC:** ссылка на safe-профиль host + soft-бейджи.
- **Edge:** host restricted → событие может быть скрыто/помечено.
- **Safety:** safe-профиль, без raw trust.
- **Refs:** PRD §6.4 (FR-030), §14.2.

**US-DISC-09** · P0 · System · Discovery
> As the system, I want to hide events involving blocked/banned users, so that unsafe interactions are prevented.
- **AC:** события host'а, которого юзер заблокировал (и наоборот), не показываются; забаненные host'ы — событий нет.
- **Edge:** взаимная блокировка после apply → правила §8.
- **Safety:** заблокированные/забаненные не взаимодействуют.
- **Refs:** PRD §13.2; Core: Инвариант 6.

**US-DISC-10** · P0 · User · Discovery
> As a user, I want a clear empty state when no events exist, so that I'm not confused.
- **AC:** дружелюбный empty state; CTA «создать событие»/«ждите новых».
- **Edge:** все события отфильтрованы → empty state фильтра отдельно.
- **Safety:** calm UX, без тёмных паттернов.
- **Refs:** PRD §6.4; Core: «calm UX».

---

## 5.5 Event Creation Stories

**US-EVT-01** · P0 · Host · Events
> As a host, I want to create an event draft, so that I can prepare before publishing.
- **AC:** создаётся `Event` в статусе `draft`; редактируемо; не видно другим.
- **Edge:** выход без сохранения → автосохранение draft или подтверждение.
- **Safety:** draft не виден в discovery.
- **Refs:** PRD §6.4 (FR-023), §10.

**US-EVT-02** · P0 · Host · Events
> As a host, I want to choose a category, so that the event is discoverable correctly.
- **AC:** выбор из фикс. MVP-категорий; обязательно.
- **Edge:** попытка несуществующей категории → отклонено.
- **Safety:** нет nightlife/party/dating категорий (§9).
- **Refs:** PRD §6.4 (FR-026), §9.

**US-EVT-03** · P0 · Host · Events
> As a host, I want to add a title and description, so that people understand the event.
- **AC:** обязательные поля; лимиты длины; контент проходит moderation.
- **Edge:** unsafe-текст → флаг/`pending_review`.
- **Safety:** AI text moderation (assistant).
- **Refs:** PRD §6.4 (FR-023), §15.

**US-EVT-04** · P0 · Host · Events
> As a host, I want to set date and time, so that attendees know when to come.
- **AC:** дата/время в будущем; таймзона города.
- **Edge:** время в прошлом → валидация; слишком близко к старту → предупреждение.
- **Safety:** —.
- **Refs:** PRD §6.4 (FR-023).

**US-EVT-05** · P0 · Host · Events
> As a host, I want to set capacity, so that the event stays small and safe.
- **AC:** числовой лимит; влияет на `full`/waitlist.
- **Edge:** capacity = 0 или огромное → валидация/максимум (small events first).
- **Safety:** «small events first» (принцип Core).
- **Refs:** PRD §6.4 (FR-027); Core: «small events».

**US-EVT-06** · P0 · Host · Events
> As a host, I want approval-required participation enabled, so that I control who attends.
- **AC:** approval включён по умолчанию для MVP; заявки идут в review.
- **Edge:** попытка отключить approval → не разрешено в MVP (Инвариант 8).
- **Safety:** Инвариант 8 (approval — core mechanic).
- **Refs:** PRD §6.4 (FR-028); Core: Инвариант 8.

**US-EVT-07** · P0 · Host · Events
> As a host, I want a waitlist, so that I can fill spots if approved users drop.
- **AC:** при `full` новые заявки → `waitlisted`; host может поднять из waitlist.
- **Edge:** освободилось место → host решает (auto/manual — Open Question).
- **Safety:** waitlisted не получает точную локацию.
- **Refs:** PRD §6.4 (FR-027), §11.

**US-EVT-08** · P0 · Host · Events
> As a host, I want to set an approximate location, so that non-approved users see only the area.
- **AC:** approximate area обязательна; показывается non-approved.
- **Edge:** попытка вписать точный адрес в area-поле → предупреждение/разделение полей.
- **Safety:** Инвариант 1/9.
- **Refs:** PRD §12; Core: Инвариант 1, 9.

**US-EVT-09** · P0 · Host · Events
> As a host, I want to add exact location/instructions, so that approved attendees can find the event.
- **AC:** exact location/instructions хранятся; видны **только** approved/host/admin.
- **Edge:** изменение exact location после approvals → уведомление approved + audit при необходимости.
- **Safety:** Инвариант 1 — exact только approved (enforced RLS).
- **Refs:** PRD §12 (FR-030); Core: Инвариант 1.

**US-EVT-10** · P0 · Host · Events
> As a host, I want to preview my event, so that I see what attendees will see.
- **AC:** preview показывает non-approved-вид (без exact location).
- **Edge:** preview не должен «утекать» exact location в non-approved-режиме.
- **Safety:** preview соблюдает location privacy.
- **Refs:** PRD §12.

**US-EVT-11** · P0 · Host · Events
> As a host, I want to publish my event, so that users can discover and apply.
- **AC:** publish → `pending_review` или `live` (зависит от OD-13); появляется в discovery когда `live`.
- **Edge:** unsafe-контент → остаётся в `pending_review` до решения.
- **Safety:** AI/admin review допустим; AI не final judge (Инвариант 5).
- **Refs:** PRD §6.4 (FR-031, FR-034), §10.

**US-EVT-12** · P0 · Host · Events
> As a host, I want to edit my event, so that I can correct details.
- **AC:** редактирование полей; значимые изменения уведомляют участников.
- **Edge:** изменение времени/места после approvals → уведомление + повторная безопасность.
- **Safety:** изменение exact location соблюдает Инвариант 1.
- **Refs:** PRD §6.4 (FR-024).

**US-EVT-13** · P0 · Host · Events
> As a host, I want to cancel my event, so that I can stop it if needed.
- **AC:** `cancelled_by_host`; причина; все pending/approved/waitlisted уведомлены; чат → read-only/frozen.
- **Edge:** отмена близко к старту → особое уведомление; повторные отмены → trust-сигнал.
- **Safety:** после отмены exact location не раскрывается далее.
- **Refs:** PRD §6.4 (FR-025), §10, §14.

---

## 5.6 Event Application Stories

**US-APP-01** · P0 · User · Applications
> As a user, I want to apply to an event, so that I can attend.
- **AC:** проверка onboarding/completeness/verification (по OD-1/OD-6); создаётся `EventApplication=pending`.
- **Edge:** не onboarded → блок; профиль неполный → требование дозаполнить.
- **Safety:** только onboarded; velocity limit на заявки.
- **Refs:** PRD §6.5 (FR-035), §13.1.

**US-APP-02** · P0 · User · Applications
> As a user, I want to write an application note, so that the host has context.
- **AC:** опциональная заметка; лимит длины; контент moderation.
- **Edge:** unsafe-текст → флаг.
- **Safety:** AI moderation; note виден только host.
- **Refs:** PRD §6.5 (FR-035), §15.

**US-APP-03** · P0 · User · Applications
> As a user, I want to see my pending status, so that I know I'm waiting.
- **AC:** статус `pending` явно отображается; ожидание объяснено.
- **Edge:** host долго не отвечает → подсказка/возможность отменить.
- **Safety:** pending → approximate area, нет чата.
- **Refs:** PRD §6.5 (FR-036), §11.

**US-APP-04** · P0 · User · Applications
> As a user, I want to cancel my application, so that I can change my mind.
- **AC:** `cancelled_by_user`; host видит отмену.
- **Edge:** отмена после approval → освобождает место; правила location-доступа сбрасываются.
- **Safety:** после отмены доступ к exact/чату прекращается.
- **Refs:** PRD §6.5 (FR-041), §11.

**US-APP-05** · P0 · Host · Applications
> As a host, I want to review applications, so that I can decide who attends.
- **AC:** список pending с safe-профилем + note + soft-бейджи.
- **Edge:** много заявок → сортировка/приоритет (P1 улучшения).
- **Safety:** host видит safe-профиль (объём — OD-3), не чувствительные поля.
- **Refs:** PRD §6.5 (FR-037), §13.2.

**US-APP-06** · P0 · Host · Applications
> As a host, I want to approve an applicant, so that they can attend.
- **AC:** `approved`; уважается capacity; пользователь получает доступ к exact location + чату.
- **Edge:** approve сверх capacity → блок/перевод в waitlist.
- **Safety:** approval открывает exact location (Инвариант 1) корректно.
- **Refs:** PRD §6.5 (FR-037, FR-040), §11.

**US-APP-07** · P0 · Host · Applications
> As a host, I want to reject an applicant, so that I keep the event safe.
- **AC:** `rejected`; пользователь уведомлён мягко; exact location недоступна.
- **Edge:** ошибочный reject → повторная заявка по политике (Open Question).
- **Safety:** rejected **никогда** не видит exact location (Инвариант 1).
- **Refs:** PRD §6.5 (FR-039), §11.

**US-APP-08** · P0 · Host · Applications
> As a host, I want to waitlist an applicant, so that I can fill spots later.
- **AC:** `waitlisted`; пользователь уведомлён; approximate area, нет чата.
- **Edge:** поднятие из waitlist при свободном месте.
- **Safety:** waitlisted не получает exact location/чат.
- **Refs:** PRD §6.5 (FR-038), §11.

**US-APP-09** · P0 · User · Applications
> As a user, I want to see my approved status, so that I know I can attend.
- **AC:** статус `approved`; exact location/инструкции и чат становятся доступны.
- **Edge:** approval отозван (отмена события/removal) → доступ закрыт.
- **Safety:** доступ к exact только в approved Event Detail.
- **Refs:** PRD §6.5 (FR-040), §11, §12.

**US-APP-10** · P0 · User · Applications
> As a user, I want to see my rejected status clearly but kindly, so that I'm not discouraged harshly.
- **AC:** статус `rejected` подаётся мягко (без harsh-формулировок, без причины по умолчанию).
- **Edge:** copy не должно ощущаться как dating-rejection (Open Question по тону).
- **Safety:** нет публичных негативных ярлыков (Инвариант 10).
- **Refs:** PRD §11; Core: Инвариант 10.

**US-APP-11** · P0 · Host · Applications
> As a host, I want to manage my attendee list, so that I keep the group correct.
- **AC:** список approved; возможность убрать участника (с уведомлением + причиной).
- **Edge:** удаление участника → доступ к exact/чату немедленно снят.
- **Safety:** удаление = revoke location/chat; serious removal может логироваться.
- **Refs:** PRD §6.5 (FR-037), §12.

**US-APP-12** · P0 · System · Applications
> As the system, I want to record attendance/no-show, so that trust signals reflect reliability.
- **AC:** после `completed` фиксируется `attended`/`no_show`; метод — OD-8.
- **Edge:** спор по no-show → dispute path (Open Question).
- **Safety:** no-show влияет только на внутренний trust (Инвариант 3/10).
- **Refs:** PRD §6.5 (FR-042), §14.

---

## 5.7 Event Chat Stories

**US-CHAT-01** · P0 · User · Chat
> As an approved attendee, I want to open the event chat, so that I can coordinate.
- **AC:** доступ к чату только при `approved`; история сообщений видна.
- **Edge:** approval отозван → доступ закрыт.
- **Safety:** Инвариант 2 — чат только в контексте события.
- **Refs:** PRD §6.6 (FR-043), §12.

**US-CHAT-02** · P0 · User · Chat
> As an approved attendee, I want to send messages, so that I can talk to other attendees.
- **AC:** отправка текста; velocity limit; контент moderation (P1 AI harassment).
- **Edge:** spam → throttle; unsafe → флаг.
- **Safety:** нет open DMs; только event chat.
- **Refs:** PRD §6.6 (FR-043, FR-048).

**US-CHAT-03** · P0 · Host · Chat
> As a host, I want to send a system/update message, so that attendees stay informed.
- **AC:** host-апдейт помечается как official/system; виден всем approved.
- **Edge:** апдейт с изменением места → не «утекает» вне approved.
- **Safety:** апдейты соблюдают location privacy.
- **Refs:** PRD §6.6 (FR-044).

**US-CHAT-04** · P0 · User · Chat
> As an attendee, I want to report a message, so that unsafe content is reviewed.
- **AC:** report из действий сообщения; `Report` + контекст → moderation queue; сообщение может быть скрыто pending review.
- **Edge:** автор удалил сообщение после report → снапшот/контекст сохраняется по политике.
- **Safety:** Инвариант 6; audit при review.
- **Refs:** PRD §6.6 (FR-045), §13.1.

**US-CHAT-05** · P0 · System · Chat
> As the system, I want blocked users not to interact in chat, so that harassment is prevented.
- **AC:** взаимно заблокированные не видят/не получают сообщения друг друга по политике.
- **Edge:** блок во время активного чата → немедленный эффект.
- **Safety:** заблокированные не взаимодействуют.
- **Refs:** PRD §13.2.

**US-CHAT-06** · P0 · System · Chat
> As the system, I want to deny chat access to rejected/waitlisted users, so that context stays gated.
- **AC:** `rejected`/`waitlisted`/`pending` не имеют доступа к чату.
- **Edge:** статус изменился → доступ синхронизируется.
- **Safety:** Инвариант 2 (контекст до общения).
- **Refs:** PRD §11, §12.

**US-CHAT-07** · P0 · System · Chat
> As the system, I want chat to open only after approval, so that there are no open DMs.
- **AC:** нет механизма личных сообщений вне event chat.
- **Edge:** попытка инициировать DM через профиль → недоступно.
- **Safety:** Инвариант 2 (жёстко).
- **Refs:** PRD §6.6 (FR-048); Core: Инвариант 2.

**US-CHAT-08** · P0 · User · Chat
> As an attendee, I want post-event limited chat, so that I can reconnect within a window.
- **AC:** после `completed` чат доступен ограниченное время (окно — OD-4); затем read-only/закрыт.
- **Edge:** окно истекло → нельзя писать; видно «истекло».
- **Safety:** reconnect только при shared context; не превращается в open DM.
- **Refs:** PRD §6.6 (FR-047), §5.5.

**US-CHAT-09** · P0 · Admin · Chat
> As an admin, I want to freeze a chat, so that I can stop ongoing harm.
- **AC:** admin freeze → чат read-only; действие логируется в audit log.
- **Edge:** freeze во время инцидента → мгновенно.
- **Safety:** Инвариант 4 (audit log).
- **Refs:** PRD §13.1 (FR-052, FR-053).

**US-CHAT-10** · P0 · System · Chat
> As the system, I want to post system messages for key event changes, so that attendees are informed safely.
- **AC:** авто-сообщения для cancel/время/место (без утечки exact non-approved — но в approved-чате допустимо).
- **Edge:** массовые изменения → дедуп.
- **Safety:** system-сообщения соблюдают приватность вне approved-контекста.
- **Refs:** PRD §6.6 (FR-044), §12.

**US-CHAT-11** · P0 · System · Chat
> As the system, I want reported/unsafe messages to be hideable pending moderation, so that harm is contained.
- **AC:** сообщение можно скрыть до решения модератора; решение логируется.
- **Edge:** false positive → восстановление после review.
- **Safety:** AI не final judge (Инвариант 5); audit (Инвариант 4).
- **Refs:** PRD §15, §13.1.

---

## 5.8 Notifications Stories

**US-NOTIF-01** · P0 · User · Notifications
> As a user, I want an approval notification, so that I know I can attend.
- **AC:** push/in-app при `approved`; ведёт в approved Event Detail.
- **Edge:** офлайн → доставка при коннекте.
- **Safety:** payload **не** содержит exact location (раскрытие только в approved Event Detail).
- **Refs:** PRD §6.5 (FR-070), §12.

**US-NOTIF-02** · P0 · User · Notifications
> As a user, I want a rejection/waitlist notification, so that I'm informed.
- **AC:** уведомление о `rejected`/`waitlisted`, мягкая формулировка.
- **Edge:** —.
- **Safety:** нет exact location; без harsh-тона.
- **Refs:** PRD §11.

**US-NOTIF-03** · P0 · User · Notifications
> As an approved user, I want an event reminder, so that I don't forget to attend.
- **AC:** напоминание перед стартом; безопасная формулировка.
- **Edge:** событие отменено до напоминания → reminder не шлётся / шлётся cancel.
- **Safety:** напоминание не раскрывает exact location в payload.
- **Refs:** PRD §6.5 (FR-070), §12.

**US-NOTIF-04** · P0 · User · Notifications
> As an attendee, I want event update notifications, so that I stay informed of changes.
- **AC:** уведомление об изменениях времени/деталей.
- **Edge:** частые изменения → батчинг.
- **Safety:** детали места — внутри approved Event Detail, не в payload.
- **Refs:** PRD §6.4 (FR-024).

**US-NOTIF-05** · P0 · User · Notifications
> As an attendee, I want a cancellation notification, so that I don't show up to nothing.
- **AC:** все pending/approved/waitlisted уведомлены при cancel.
- **Edge:** отмена близко к старту → приоритетная доставка.
- **Safety:** после cancel exact location не раскрывается.
- **Refs:** PRD §6.4 (FR-025).

**US-NOTIF-06** · P0 · Host · Notifications
> As a host, I want a notification on new applications, so that I review promptly.
- **AC:** уведомление при новой заявке; ведёт в Host Review.
- **Edge:** всплеск заявок → батч-уведомление.
- **Safety:** payload — без чувствительных данных applicant.
- **Refs:** PRD §6.5 (FR-070).

**US-NOTIF-07** · P0 · User · Notifications
> As a user, I want a moderation/action notification when relevant, so that I understand enforcement against me.
- **AC:** уведомление о restrict/ban/removed (по политике) с нейтральной формулировкой.
- **Edge:** ban → информирование о потере доступа.
- **Safety:** связано с audit log; без публичных ярлыков.
- **Refs:** PRD §13.1 (FR-052, FR-053).

**US-NOTIF-08** · P0 · Guest/User · Notifications
> As an invited person, I want an invite notification, so that I can join the beta.
- **AC:** доставка invite (email/push) с кодом/ссылкой.
- **Edge:** код истёк/использован → ошибка при вводе.
- **Safety:** invite-only контролируется.
- **Refs:** PRD §6.9 (FR-064).

**US-NOTIF-09** · P0 · System · Notifications
> As the system, I want all notification payloads to exclude sensitive exact location, so that privacy isn't leaked.
- **AC:** ни одно уведомление не содержит точный адрес/координаты.
- **Edge:** rich push с местом → запрещено.
- **Safety:** Инвариант 1/9 (жёстко).
- **Refs:** PRD §12; Core: Инвариант 1, 9.

---

## 5.9 Safety Stories

**US-SAFE-01** · P0 · User · Safety
> As a user, I want to report a user, so that unsafe behavior is reviewed.
- **AC:** report из профиля/attendee/чата; причина; `Report` → queue.
- **Edge:** массовые ложные reports → velocity/throttle.
- **Safety:** Инвариант 6; review логируется (Инвариант 4).
- **Refs:** PRD §13.1 (FR-049).

**US-SAFE-02** · P0 · User · Safety
> As a user, I want to report an event, so that unsafe events are reviewed.
- **AC:** report из Event Detail; причина; `Report` → queue.
- **Edge:** report на отменённое событие → всё равно фиксируется.
- **Safety:** unsafe event может быть `removed_for_safety` + audit.
- **Refs:** PRD §13.1 (FR-032, FR-033).

**US-SAFE-03** · P0 · User · Safety
> As a user, I want to report a message, so that harassment is addressed.
- **AC:** report из действий сообщения; контекст сохраняется; → queue.
- **Edge:** автор удалил сообщение → снапшот по политике.
- **Safety:** Инвариант 6; AI assist, human решает (Инвариант 5).
- **Refs:** PRD §13.1 (FR-045).

**US-SAFE-04** · P0 · User · Safety
> As a user, I want to block a user, so that they can't interact with me.
- **AC:** block из релевантных мест; `Block`; взаимодействие прекращается.
- **Edge:** блок host'а, на чьё событие подана заявка → §8 правила.
- **Safety:** заблокированные не взаимодействуют; обратимость — Open Question.
- **Refs:** PRD §13.1 (FR-050), §13.2.

**US-SAFE-05** · P0 · Admin · Safety
> As an admin, I want to review a report, so that I can take appropriate action.
- **AC:** report-детали + контекст + AI-сводка (assistive); решение фиксируется в audit log.
- **Edge:** недостаточно контекста → запрос доп. данных/эскалация.
- **Safety:** Инвариант 4 (audit), Инвариант 5 (AI не judge).
- **Refs:** PRD §13.1 (FR-051, FR-055), §15.

**US-SAFE-06** · P0 · Admin · Safety
> As an admin, I want to restrict a user, so that risky behavior is contained.
- **AC:** restrict с обязательной причиной; ограничивает действия; audit log.
- **Edge:** временный vs постоянный restrict; снятие restrict.
- **Safety:** serious action → human review + audit.
- **Refs:** PRD §13.1 (FR-052, FR-053).

**US-SAFE-07** · P0 · Admin · Safety
> As an admin, I want to ban a user, so that dangerous users are removed.
- **AC:** ban с причиной; доступ снят; сессии инвалидированы; audit log.
- **Edge:** ban-evasion (новый аккаунт) → suspicious detection.
- **Safety:** permanent ban требует human review (Инвариант 5); audit (Инвариант 4).
- **Refs:** PRD §13.1 (FR-052, FR-055).

**US-SAFE-08** · P0 · Admin · Safety
> As an admin, I want to remove an unsafe event, so that users aren't exposed to harm.
- **AC:** `removed_for_safety`; участники уведомлены безопасно; audit log.
- **Edge:** удаление прямо перед стартом → приоритетные уведомления.
- **Safety:** Инвариант 4 (обязательный audit).
- **Refs:** PRD §6.4 (FR-033), §10.

**US-SAFE-09** · P0 · System · Safety
> As the system, I want to create an audit log for every moderation-sensitive action, so that enforcement is accountable.
- **AC:** ban/restrict/report-review/event-removal/chat-freeze/admin-decision → `AuditLog` (кто, что, когда, причина).
- **Edge:** сбой записи лога → действие не считается завершённым/повтор.
- **Safety:** Инвариант 4 (жёстко).
- **Refs:** PRD §13.1 (FR-053); Core: Инвариант 4.

**US-SAFE-10** · P0 · System · Safety
> As the system, I want to flag suspicious behavior, so that admins can review proactively.
- **AC:** правила (см. §5.9-velocity) создают элемент в Suspicious Activity; не финальный enforcement.
- **Edge:** false positive → review без наказания.
- **Safety:** AI/правила не final judge (Инвариант 5).
- **Refs:** PRD §13.1 (FR-056), §15.

**US-SAFE-11** · P0 · System · Safety
> As the system, I want to enforce velocity limits, so that spam/abuse is mitigated.
- **AC:** лимиты на apply/message/event-create/report; превышение → soft-block/flag.
- **Edge:** легитимный всплеск → мягкая деградация, не бан.
- **Safety:** soft-restriction, серьёзное — через review.
- **Refs:** PRD §13.1 (FR-054).

**US-SAFE-12** · P0 · System · Safety
> As the system, I want banned users to be unable to interact, so that removed threats stay removed.
- **AC:** забаненный не логинится/не действует; контент скрыт по политике.
- **Edge:** активная сессия в момент бана → принудительный logout.
- **Safety:** заблокированные/забаненные не взаимодействуют.
- **Refs:** PRD §6.1 (FR-006), §13.

---

## 5.10 Trust Stories

**US-TRUST-01** · P0 · User · Trust
> As a user, I want a "Verified" badge after phone verification, so that others see I'm a real person.
- **AC:** при `phone_verified` — бейдж Verified в safe-профиле.
- **Edge:** верификация отозвана → бейдж снимается.
- **Safety:** бейдж бинарный, без числа (Инвариант 3).
- **Refs:** PRD §14.2.

**US-TRUST-02** · P0 · System · Trust
> As the system, I want profile completeness to feed internal trust, so that quality signals improve safety.
- **AC:** completeness → внутренний сигнал; не публикуется как число.
- **Edge:** падение completeness (удалил данные) → пересчёт.
- **Safety:** Инвариант 3/10.
- **Refs:** PRD §14.1.

**US-TRUST-03** · P0 · System · Trust
> As the system, I want attendance to build a "Reliable attendee" signal, so that reliable users are softly recognized.
- **AC:** N completed `attended` → бейдж Reliable attendee.
- **Edge:** баланс attended/no-show учитывается.
- **Safety:** мягкий, не числовой.
- **Refs:** PRD §14.2.

**US-TRUST-04** · P0 · System · Trust
> As the system, I want to record no-shows, so that reliability is tracked internally.
- **AC:** `no_show` создаёт `TrustEvent`; влияет только на внутренний trust.
- **Edge:** спорный no-show → dispute (OD).
- **Safety:** нет публичного негативного ярлыка (Инвариант 10).
- **Refs:** PRD §14.1, §6.5 (FR-059).

**US-TRUST-05** · P0 · Host · Trust
> As a host, I want to give post-event feedback, so that the system learns reliability signals.
- **AC:** host-feedback по событию → внутренний `TrustEvent` (P0 запись, влияние — P1 уточнение).
- **Edge:** abuse feedback → сглаживание/review.
- **Safety:** не публичный рейтинг (Инвариант 10).
- **Refs:** PRD §14.1, §6.8 (FR-060).

**US-TRUST-06** · P0 · System · Trust
> As the system, I want to create internal trust events, so that the trust state is auditable.
- **AC:** verification/attendance/no-show/reports/blocks → `TrustEvent` записи.
- **Edge:** конфликтующие сигналы → агрегируются серверно.
- **Safety:** trust events ревьюабельны (audit).
- **Refs:** PRD §14.1.

**US-TRUST-07** · P0 · User · Trust
> As a user, I want public trust badges to be non-numeric, so that the system isn't social credit.
- **AC:** только Verified / Reliable attendee / Hosted before / Attended events; никаких чисел.
- **Edge:** нет данных → нейтрально, без негатива.
- **Safety:** Инвариант 3, 10 (жёстко).
- **Refs:** PRD §14.2, §14.3.

**US-TRUST-08** · P0 · System · Trust
> As the system, I want raw trust score to be server-only, so that it's never exposed to clients.
- **AC:** числовой trust никогда не в клиентском ответе/экране.
- **Edge:** admin-доступ — отдельный admin-only путь, не клиент.
- **Safety:** Инвариант 3 (жёстко).
- **Refs:** PRD §6.8 (FR-057), §14.3.

**US-TRUST-09** · P0 · System · Trust
> As the system, I want trust tier to influence safety checks, so that risky accounts get more scrutiny.
- **AC:** низкий внутренний tier → строже velocity/обязательная verification (по политике).
- **Edge:** не должно блокировать легитимных без review для serious actions.
- **Safety:** AI/score не final judge (Инвариант 5).
- **Refs:** PRD §14.1, §13.1.

**US-TRUST-10** · P0 · System · Trust
> As the system, I want suspicious trust signals to trigger review, not auto-punishment, so that fairness is preserved.
- **AC:** аномалии → Suspicious Activity, не авто-бан.
- **Edge:** явный fraud → быстрая, но логируемая реакция + review.
- **Safety:** Инвариант 5 (human для serious), Инвариант 4 (audit).
- **Refs:** PRD §13.1, §15.

---

## 5.11 Admin / Moderation Dashboard Stories

**US-ADMIN-01** · P0 · Admin · Admin
> As an admin, I want to log into the admin dashboard, so that I can moderate.
- **AC:** защищённый web-логин; только admin/moderator роли.
- **Edge:** не-admin → доступ запрещён.
- **Safety:** web только для admin (Core).
- **Refs:** PRD §8.4, §6.9.

**US-ADMIN-02** · P0 · Admin · Admin
> As an admin, I want to view the moderation queue, so that I can process issues.
- **AC:** очередь reports/флагов с приоритетом; статусы обработки.
- **Edge:** пустая очередь → empty state.
- **Safety:** очередь готова до запуска беты.
- **Refs:** PRD §6.7 (FR-051), §19.

**US-ADMIN-03** · P0 · Admin · Admin
> As an admin, I want to view reports, so that I understand incidents.
- **AC:** список reports с типом/контекстом/репортером (по политике приватности).
- **Edge:** дубли reports на один объект → группировка.
- **Safety:** reporter-safety (no retaliation).
- **Refs:** PRD §13.1.

**US-ADMIN-04** · P0 · Admin · Admin
> As an admin, I want to filter reports by priority, so that I handle urgent cases first.
- **AC:** фильтр/сортировка по priority/type; AI risk-prioritization (assistive).
- **Edge:** misclassified priority → ручная переоценка.
- **Safety:** AI assist, не judge (Инвариант 5).
- **Refs:** PRD §15 (FR-063).

**US-ADMIN-05** · P0 · Admin · Admin
> As an admin, I want to open a user detail, so that I can assess them.
- **AC:** профиль, история, reports/blocks, trust events, suspicious flags.
- **Edge:** удалённый пользователь → ограниченные данные по retention.
- **Safety:** доступ логируется по политике; trust виден admin-only.
- **Refs:** PRD §8.4, §14.1.

**US-ADMIN-06** · P0 · Admin · Admin
> As an admin, I want to open an event detail, so that I can assess event safety.
- **AC:** полный event (включая exact location) для admin; reports на событие.
- **Edge:** уже отменённое/удалённое → исторический вид.
- **Safety:** admin-доступ к exact логируется по политике.
- **Refs:** PRD §8.4, §12.

**US-ADMIN-07** · P0 · Admin · Admin
> As an admin, I want to review a reported message, so that I can judge harassment.
- **AC:** сообщение + контекст треда + снапшот при удалении.
- **Edge:** удалено автором → используется сохранённый контекст.
- **Safety:** AI-сводка assistive; решение — человек.
- **Refs:** PRD §13.1 (FR-045), §15.

**US-ADMIN-08** · P0 · Admin · Admin
> As an admin, I want to take a moderation action, so that I resolve the issue.
- **AC:** действия: no action / warn / restrict / ban / remove event / hide content / freeze chat / escalate; serious → причина обязательна.
- **Edge:** ошибочное действие → откат по политике + лог.
- **Safety:** Инвариант 4 (audit), Инвариант 5 (serious — human).
- **Refs:** PRD §13.1 (FR-052), §15.

**US-ADMIN-09** · P0 · Admin · Admin
> As an admin, I want to add an admin note, so that context is preserved for the team.
- **AC:** заметка привязана к user/event/report; видна admin; входит в audit-контекст.
- **Edge:** —.
- **Safety:** заметки не публичны.
- **Refs:** PRD §13.1.

**US-ADMIN-10** · P0 · Admin · Admin
> As an admin, I want to see audit logs, so that decisions are accountable.
- **AC:** хронология moderation-действий (кто/что/когда/причина); фильтры.
- **Edge:** большой объём → пагинация/поиск.
- **Safety:** Инвариант 4; retention — OD-9.
- **Refs:** PRD §13.1 (FR-053).

**US-ADMIN-11** · P0 · Admin · Admin
> As an admin, I want to restrict a user from the dashboard, so that I can contain risk quickly.
- **AC:** restrict с причиной; немедленный эффект; audit log.
- **Edge:** restrict при активной сессии → ограничения применяются сразу.
- **Safety:** serious → human review.
- **Refs:** PRD §13.1 (FR-052).

**US-ADMIN-12** · P0 · Admin · Admin
> As an admin, I want to ban a user from the dashboard, so that dangerous users are removed.
- **AC:** ban с причиной; доступ снят; audit log; уведомление по политике.
- **Edge:** ban-evasion → suspicious detection.
- **Safety:** permanent ban — human (Инвариант 5).
- **Refs:** PRD §13.1 (FR-052, FR-055).

**US-ADMIN-13** · P0 · Admin · Admin
> As an admin, I want AI moderation summaries to be assistive only, so that humans make serious calls.
- **AC:** AI-сводка/риск показаны как рекомендация + объяснение; не авто-применяются для serious.
- **Edge:** AI ошибается → human override без штрафа пользователю.
- **Safety:** Инвариант 5 (жёстко).
- **Refs:** PRD §15.2; Core: Инвариант 5.

---

## 5.12 Beta / Invite Stories

**US-BETA-01** · P0 · Guest · Beta
> As an invited guest, I want to sign up with an invite code, so that I can access the closed beta.
- **AC:** ввод кода при регистрации; валидный → доступ; создаётся связь invite→user.
- **Edge:** код невалиден/истёк → ошибка + waitlist CTA.
- **Safety:** invite-only контролируется.
- **Refs:** PRD §6.9 (FR-064).

**US-BETA-02** · P0 · System · Beta
> As the system, I want to validate invite codes, so that only invited users enter.
- **AC:** проверка существования/срока/лимита использования.
- **Edge:** код уже использован (если single-use) → ошибка.
- **Safety:** контроль доступа к бете.
- **Refs:** PRD §6.9 (FR-064).

**US-BETA-03** · P0 · Guest · Beta
> As a non-invited guest, I want to join a waitlist, so that I can get access later.
- **AC:** форма waitlist; подтверждение; `waitlist_joined`.
- **Edge:** повторная заявка тем же email → дедуп.
- **Safety:** минимизация данных.
- **Refs:** PRD §6.9 (FR-065).

**US-BETA-04** · P0 · System · Beta
> As the system, I want to track invite code usage, so that beta growth is controlled.
- **AC:** использование кода фиксируется (кто/когда); лимиты соблюдаются.
- **Edge:** конкурентное использование одного кода → атомарность.
- **Safety:** —.
- **Refs:** PRD §16.4.

**US-BETA-05** · P0 · System · Beta
> As the system, I want feature flags, so that beta features can be controlled.
- **AC:** флаги включают/выключают функции без релиза; экспозиция трекается.
- **Edge:** флаг недоступен → безопасный дефолт (выкл).
- **Safety:** safety-функции нельзя выключать флагом без product decision.
- **Refs:** PRD §6.9 (FR-066), §16.4.

**US-BETA-06** · P0 · System · Beta
> As the system, I want to restrict full app access without beta access, so that closed beta stays closed.
- **AC:** без invite/доступа — только waitlist/landing; нет loop.
- **Edge:** доступ отозван → откат к waitlist-состоянию.
- **Safety:** контроль доступа.
- **Refs:** PRD §6.9.

**US-BETA-07** · P0 · Admin · Beta
> As an admin, I want to create invite codes, so that I can onboard beta users deliberately.
- **AC:** генерация кодов (single/multi-use, срок); список созданных.
- **Edge:** массовая генерация → лимиты/аудит.
- **Safety:** создание кодов — admin-only.
- **Refs:** PRD §16.4 (FR-064).

**US-BETA-08** · P0 · System · Beta
> As the system, I want the safety dashboard to work before external users enter, so that moderation is ready at launch.
- **AC:** moderation queue + admin actions + audit logs функционируют до открытия беты.
- **Edge:** —.
- **Safety:** «moderation readiness» (PRD §18, §19).
- **Refs:** PRD §19.

---

## 5.13 Analytics Stories

> Общий safety-note для всех: события **не** содержат точную локацию и минимизируют PII (privacy by design, PRD §16/§18).

**US-ANL-01** · P0 · System · Analytics
> As product, I want to track `signup_started`, so that I can measure top of funnel.
- **AC:** событие при старте регистрации; свойства — метод входа.
- **Refs:** PRD §16.1.

**US-ANL-02** · P0 · System · Analytics
> As product, I want to track `signup_completed`, so that I measure successful account creation.
- **AC:** при создании `User`.
- **Refs:** PRD §16.1.

**US-ANL-03** · P0 · System · Analytics
> As product, I want to track `onboarding_completed`, so that I measure activation.
- **AC:** при завершении обязательного onboarding.
- **Refs:** PRD §16.1.

**US-ANL-04** · P0 · System · Analytics
> As product, I want to track `first_event_viewed`, so that I measure discovery activation.
- **AC:** первый просмотр Event Detail пользователем.
- **Refs:** PRD §16.1.

**US-ANL-05** · P0 · System · Analytics
> As product, I want to track `application_created`, so that I measure apply conversion.
- **AC:** при создании `EventApplication`.
- **Refs:** PRD §16.2.

**US-ANL-06** · P0 · System · Analytics
> As product, I want to track `application_approved`, so that I measure approval funnel.
- **AC:** при переходе заявки в `approved`.
- **Refs:** PRD §16.2.

**US-ANL-07** · P0 · System · Analytics
> As product, I want to track `first_event_attended`, so that I measure the core loop completion.
- **AC:** первое `attended` пользователя.
- **Refs:** PRD §16.1, NSM.

**US-ANL-08** · P0 · System · Analytics
> As product, I want to track `report_created`, so that I monitor safety.
- **AC:** при создании `Report`; свойства — тип (user/event/message), без содержимого PII.
- **Safety:** safety-метрика обязательна.
- **Refs:** PRD §16.3.

**US-ANL-09** · P0 · System · Analytics
> As product, I want to track `block_created`, so that I monitor safety friction.
- **AC:** при создании `Block`.
- **Safety:** safety-метрика.
- **Refs:** PRD §16.3.

**US-ANL-10** · P0 · System · Analytics
> As product, I want to track `moderation_action_taken`, so that I monitor enforcement.
- **AC:** при admin-действии; тип действия в свойствах; связь с audit log.
- **Safety:** не дублирует, а дополняет audit log.
- **Refs:** PRD §16.3.

**US-ANL-11** · P0 · System · Analytics
> As product, I want to track `invite_code_used`, so that I measure beta funnel.
- **AC:** при успешном применении invite.
- **Refs:** PRD §16.4.

**US-ANL-12** · P0 · System · Analytics
> As product, I want to track `no_show_recorded`, so that I monitor reliability.
- **AC:** при фиксации `no_show`.
- **Safety:** только агрегат, без публичных ярлыков.
- **Refs:** PRD §16.3, §14.

---

# 6. P1 User Stories

> P1 не должен нарушать Product Core. Даже в P1 **нет open DMs** без явного product decision.

| Story ID | Priority | Module | User Story | Safety/Trust Note |
|----------|----------|--------|------------|-------------------|
| US-P1-01 | P1 | Reconnect | As a user, I want smart post-event intros within shared-context, so that I can keep good connections. | Только при реальном shared context; не open DM. |
| US-P1-02 | P1 | Discovery | As a user, I want better event recommendations, so that discovery is more relevant. | Не advanced AI matching dating-style; intelligence after data. |
| US-P1-03 | P1 | Discovery | As a user, I want soft compatibility hints (interests/vibe), so that I pick better events. | Нечисловые, не «attractiveness», anti-dating. |
| US-P1-04 | P1 | Events | As a host, I want recurring events, so that I can build a regular group. | Не recurring memberships/монетизация. |
| US-P1-05 | P1 | Events | As a host, I want a co-host, so that I can share event management. | OD-7; co-host наследует host-ограничения. |
| US-P1-06 | P1 | Events | As a host, I want richer host tools (templates, bulk messages), so that hosting is easier. | System-сообщения соблюдают privacy. |
| US-P1-07 | P1 | Trust | As the system, I want improved trust signals (weighted history), so that safety scoring is better. | Остаётся внутренним (Инвариант 3/10). |
| US-P1-08 | P1 | Admin | As an admin, I want a risk dashboard, so that I can see safety trends. | AI assistive only. |
| US-P1-09 | P1 | Host | As a host, I want host analytics (views, approval rate), so that I improve events. | Без PII участников. |
| US-P1-10 | P1 | Safety | As the system, I want AI harassment/spam detection in chat, so that harm is caught early. | AI флагает, human решает serious (Инвариант 5). |
| US-P1-11 | P1 | Safety | As the system, I want report summarization for moderators, so that triage is faster. | Assistive only. |
| US-P1-12 | P1 | Profiles | As a user, I want richer (still safe) profile fields, so that context improves. | Без чувствительных/dating-полей. |
| US-P1-13 | P1 | Notifications | As a user, I want smarter notification batching/preferences, so that I'm not overwhelmed. | Calm UX; без location в payload. |
| US-P1-14 | P1 | Reconnect | As a user, I want a lightweight post-event "keep in touch" within shared context, so that connections persist. | Не open DM; только shared-context. |
| US-P1-15 | P1 | Discovery | As a user, I want saved/followed event categories, so that I find events faster. | Не public followers. |
| US-P1-16 | P1 | Trust | As a host, I want post-event feedback to meaningfully shape internal trust, so that reliability improves. | Внутреннее, не публичный рейтинг (Инвариант 10). |

---

# 7. P2 / Explicitly Deferred Stories

> Документируется для контекста. **Запрещено реализовывать в MVP.** Многое прямо нарушает safety-инварианты при наивной реализации.

| Story | Почему отложено | Риск | Требуемое product decision |
|-------|-----------------|------|----------------------------|
| Payments | Вне core loop; усложняет trust/fraud | Fraud, регуляторика, отвлечение фокуса | Явное решение + обновление Product Core + compliance |
| Tickets | Логистика возвратов вне loop | Споры/возвраты, support-нагрузка | Product + ops решение |
| Paid events | Меняет мотивацию участия | Fraud, неравенство доступа | Product Core update |
| Premium hosts | Монетизация привилегий | Качество/доверие искажаются | Монетизационная стратегия |
| Public followers | Статус-гонка | Creepiness, давление | Product Core update |
| Public ratings | Прямое нарушение Инварианта 10 | Social credit, травля | **Запрещено** без пересмотра Core |
| Dating mechanics | Противоречит позиционированию | Repositioning, safety-сдвиг | Полный repositioning Core |
| Nightlife/party mechanics | Другой риск-профиль | Безопасность, модерация | Safety re-assessment + Core |
| Exact public map pins | Нарушение Инварианта 1/9 | Сталкинг, физический риск | **Запрещено** без пересмотра Core |
| Live location | Нарушение Инварианта 9 | Сталкинг | **Запрещено** без пересмотра Core |
| Large event marketplace | Противоречит «small events first» | Потеря intimacy/safety | Product Core update |
| Business networking | Вне ICP | Размытие аудитории | Product Core update |
| Monetization (general) | Не нужно для проверки гипотезы | Отвлечение, искажение метрик | Бизнес-решение + Core update |

---

# 8. Critical Safety Edge Cases

| # | Edge Case | Expected Behavior |
|---|-----------|-------------------|
| 1 | Rejected user пытается получить exact location (через UI/API) | Запрещено RLS; возвращается approximate/ошибка доступа; событие лог. при попытках |
| 2 | Waitlisted user пытается зайти в chat | Доступ запрещён; видит «chat доступен после approval» |
| 3 | Blocked user пытается подать заявку на событие блокирующего | Заявка не создаётся; событие может быть скрыто |
| 4 | Banned user пытается войти | Логин отклонён; сессии инвалидированы; нет доступа к loop |
| 5 | User репортит host после события | Report принимается даже для `completed`; уходит в queue |
| 6 | Host отменяет событие после approvals | Все уведомлены; exact location больше не раскрывается; чат → read-only |
| 7 | Событие становится full во время подачи заявки | Заявка → `waitlisted` (если waitlist) или ошибка «мест нет» |
| 8 | User удаляет профиль при pending заявке | Заявка аннулируется; safety/audit-данные сохраняются по retention (OD-9) |
| 9 | User повторно no-show | Внутренний trust снижается; review-флаг; нет публичного ярлыка |
| 10 | Admin удаляет событие прямо перед стартом | `removed_for_safety`; приоритетные уведомления; audit log |
| 11 | Unsafe описание события прошло создание | Post-publish report/AI flag → `pending_review`/removal; audit |
| 12 | User загружает неподходящее фото | Moderation reject; фото скрыто; просьба заменить; повтор → review |
| 13 | Harassment в event chat | Report → hide pending; admin review; possible restrict/ban + audit |
| 14 | Host меняет exact location после approvals | Approved уведомлены в approved-контексте; non-approved не видят; изменение фиксируется |
| 15 | Host пытается approve сверх capacity | Блокируется; предлагается waitlist |
| 16 | User пытается создать/подать без verification (если требуется) | Блок с предложением пройти phone verification (точка — OD-1) |
| 17 | User пытается увидеть attendee list до approval | Запрещено; attendee visibility только approved/host/admin (OD-12) |
| 18 | Notification случайно содержит exact location | Запрещено политикой payload; exact только в approved Event Detail |
| 19 | Reported message удалён автором | Снапшот/контекст сохраняется для модерации по политике |
| 20 | AI выдаёт false positive (профиль/сообщение/событие) | Не авто-наказание для serious; human review; восстановление без штрафа |
| 21 | Ban-evasion через новый аккаунт | Suspicious detection; флаг на review; не авто-перманентные действия без review |
| 22 | Взаимный блок между host и approved attendee активного события | Доступ/видимость пересчитываются; взаимодействие прекращается; host-операции с участником — по политике безопасности |

---

# 9. Traceability Matrix

| Product Area | PRD Section | Story IDs | Product Core Principle / Invariant |
|--------------|-------------|-----------|------------------------------------|
| Auth | §6.1 (FR-001..006) | US-AUTH-01..09 | Auth обязательный; Инвариант 7 |
| Onboarding | §6.2 (FR-007..015) | US-ONB-01..11 | Onboarding обязательный; Инвариант 7; «не dating» |
| Profiles | §6.3 (FR-016..022), §13.2 | US-PROF-01..11 | Инвариант 3, 6, 7, 10 |
| Discovery | §6.4 (FR-029..030), §12 | US-DISC-01..10 | Инвариант 1, 9; «small events» |
| Events | §6.4 (FR-023..028, 031..034), §10 | US-EVT-01..13 | Инвариант 1, 8, 9; «small events» |
| Applications | §6.5 (FR-035..042), §11 | US-APP-01..12 | Инвариант 1, 8, 10 |
| Messaging | §6.6 (FR-043..048), §12 | US-CHAT-01..11 | Инвариант 2, 4, 6 |
| Notifications | §6.5 (FR-070), §12 | US-NOTIF-01..09 | Инвариант 1, 9 |
| Safety | §13 (FR-049..056) | US-SAFE-01..12 | Инвариант 4, 5, 6 |
| Trust | §14 (FR-057..060) | US-TRUST-01..10 | Инвариант 3, 8, 10 |
| Admin | §8.4, §13, §15 | US-ADMIN-01..13 | Инвариант 4, 5 |
| Beta | §6.9 (FR-064..069), §19 | US-BETA-01..08 | Invite-only; moderation readiness |
| Analytics | §16 (FR-067) | US-ANL-01..12 | Privacy by design; safety measurable |

---

# 10. MVP Coverage Checklist

- [x] Auth covered (US-AUTH-01..09)
- [x] Onboarding covered (US-ONB-01..11)
- [x] Profiles covered (US-PROF-01..11)
- [x] Event discovery covered (US-DISC-01..10)
- [x] Event creation covered (US-EVT-01..13)
- [x] Applications covered (US-APP-01..12)
- [x] Event chat covered (US-CHAT-01..11)
- [x] Location privacy covered (US-DISC-04, US-EVT-08/09, US-APP-07/09, US-NOTIF-09, §8)
- [x] Reports covered (US-SAFE-01..03, US-PROF-09, US-CHAT-04)
- [x] Blocks covered (US-SAFE-04, US-PROF-10, US-CHAT-05)
- [x] Admin moderation covered (US-ADMIN-01..13)
- [x] Trust system covered (US-TRUST-01..10)
- [x] Invite-only beta covered (US-BETA-01..08)
- [x] Analytics covered (US-ANL-01..12)
- [x] No open DMs (US-CHAT-07; Инвариант 2)
- [x] No public ratings (US-TRUST-07; §7; Инвариант 10)
- [x] No raw trust score (US-PROF-11, US-TRUST-08; Инвариант 3)
- [x] No exact public location (US-DISC-04, US-NOTIF-09; Инвариант 1, 9)
- [x] No dating mechanics (US-ONB-01/07; §7)
- [x] No payments (§7; Core non-goals)

---

# 11. Open Questions

| # | Вопрос | Зависимые stories | Связь с PRD |
|---|--------|-------------------|-------------|
| OD-1 | Phone verification обязательна до **apply** или **approval**? | US-AUTH-05, US-ONB-09, US-APP-01 | PRD OD-1 |
| OD-2 | Age range вместо точного возраста? | US-ONB-03 | PRD OD-2 |
| OD-5 | Какие onboarding-поля обязательны? | US-ONB-03..08 | PRD OD-5 |
| OD-6 | Минимальный profile completeness для apply? | US-ONB-10, US-APP-01 | PRD OD-6 |
| OD-3 | Какие safe-поля видит host (включая фото/age range)? | US-PROF-07, US-APP-05 | PRD OD-3 |
| OD-12 | Видит ли approved attendee список всех approved до события? | US-APP-11, §8(#17) | PRD OD-12 |
| OD-4 | Сколько времени открыт post-event chat? | US-CHAT-08 | PRD OD-4 |
| OD-8 | Как именно считать/подтверждать no-show? | US-APP-12, US-TRUST-04 | PRD OD-8 |
| OD-7 | Нужен ли co-host в MVP? (гипотеза: нет, P1) | US-P1-05 | PRD OD-7 |
| OD-13 | Нужен ли обязательный manual review всех новых events в beta? | US-EVT-11 | PRD OD-13 |
| OD-10 | Какая первая beta city? | US-ONB-04, US-DISC-01 | PRD OD-10 |
| Q-RJ | Когда показывать exact location: сразу после approval или ближе к старту? | US-APP-09, US-NOTIF-03 | PRD §12 |
| Q-RJ2 | Можно ли user отменить approved participation и каковы последствия? | US-APP-04 | PRD §11 |
| Q-DIS | Как подавать rejected-состояние без ощущения harsh rejection (copy/tone)? | US-APP-10 | PRD §20.2 |
| Q-BLK | Обратим ли block (unblock) в MVP? | US-SAFE-04, US-PROF-10 | PRD §13.2 |
| Q-PRV | Может ли host создавать private/unlisted events в MVP? | US-EVT-01/11 | PRD §6.4 |

---

# 12. Summary

- Документ превращает PRD v1 в конкретные, проверяемые **user stories** со стабильными Story ID.
- **P0** покрывает весь MVP по модулям (Auth, Onboarding, Profiles, Discovery, Events, Applications, Chat, Notifications, Safety, Trust, Admin, Beta, Analytics) и обслуживает loop **Discover → Apply → Approve → Attend → Reconnect**.
- **P1** (после беты) и **P2** (запрещено без product decision) явно отделены; P2 включает то, что нарушило бы safety-инварианты.
- Зафиксированы **22 critical safety edge cases**, traceability matrix и MVP coverage checklist.
- Открытые вопросы вынесены в §11, а не решены молча.
- **Следующий документ:** [`/docs/03_USER_FLOWS.md`](03_USER_FLOWS.md) — перевод этих stories в UX-флоу.

> Напоминание: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth; этот документ и PRD ему подчинены.
