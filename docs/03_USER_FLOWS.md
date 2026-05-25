# User Flows v1 — Social Events App

> **Status:** v1 (flows for closed beta)
> **Owner:** Product / Design
> **Last updated:** 2026-05-18

---

## 1. Source of Truth

- Документ основан на [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md), [`/docs/01_PRD.md`](01_PRD.md) и [`/docs/02_USER_STORIES.md`](02_USER_STORIES.md).
- **[`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth.** При конфликте User Stories/PRD ↔ Product Core приоритет у Product Core.
- Ни один flow не может нарушать safety-инварианты Product Core (Инварианты 1–10).
- Любые будущие Figma-экраны и реализация должны быть совместимы с этими flows и ссылаться на Story ID из документа 02.
- Нерешённые UX-развилки вынесены в [§13 Open UX Questions](#13-open-ux-questions), а не «додуманы» молча (per CLAUDE.md §3).

---

## 2. Global UX Principles

1. **Mobile-first.** Основной опыт — телефон; admin — web.
2. **Safety is visible.** Пользователь видит и понимает правила безопасности, а не «прячет их в админке».
3. **Trust before scale.** Доверие важнее роста; friction ради безопасности допустим.
4. **Context before interaction.** Никакого взаимодействия без общего контекста.
5. **Exact location hidden until approval.** Точное место — только approved/host/admin.
6. **No open DMs.** Сообщения только в контексте события.
7. **Approval is a feature, not friction.** Approval подаётся как ценность, а не препятствие.
8. **Calm UX, no engagement addiction.** Нет тёмных паттернов, бесконечных лент, навязчивых уведомлений.
9. **Clear states and status labels.** Каждое состояние (pending/approved/rejected/...) явно подписано.
10. **Every sensitive action has recovery/report/block path.** Из любого чувствительного контекста доступны report/block и понятный выход.

---

## 3. Navigation Model

### Guest Navigation
- Welcome
- Login
- Signup
- Waitlist / Invite

Нет доступа к discovery, событиям, профилям, чату.

### Authenticated but not onboarded
- Только Onboarding stack
- ❌ Discovery · ❌ Applications · ❌ Chat · ❌ Public profiles

### Onboarded User (tab bar)
- Home / Discover
- My Events
- Create (вход в host-функции)
- Notifications
- Profile

### Host
Host-функции встроены, отдельного «режима» нет:
- Create Event (из tab Create)
- My Hosted Events (в My Events → Hosted)
- Applications Review (из hosted event)
- Event Management (из hosted event)

### Admin (web dashboard, отдельное приложение)
- Moderation Queue
- Reports
- Users
- Events
- Audit Logs
- Suspicious Activity

```
Guest ──► Auth ──► (invite check) ──► Onboarding ──► Onboarded App (tabs)
                                                         ├─ Discover ─► Event Detail ─► Apply
                                                         ├─ My Events (Attending / Hosted)
                                                         ├─ Create ─► Event Creation
                                                         ├─ Notifications
                                                         └─ Profile ─► Edit / Settings / Privacy
Admin (web) ──► Admin Login ──► Moderation Queue / Reports / Users / Events / Audit / Suspicious
```

---

## 4. Global State Model

### User states
| State | Значение | Доступ |
|-------|----------|--------|
| `guest` | Не аутентифицирован | Welcome/Auth/Waitlist only |
| `authenticated_not_onboarded` | Вошёл, onboarding не завершён | Только onboarding stack |
| `onboarded` | Onboarding завершён | Полный loop (с учётом verification) |
| `phone_unverified` | Телефон не подтверждён | Гейт на apply/approval (OD-1) |
| `phone_verified` | Телефон подтверждён | Verified-бейдж; снят гейт verification |
| `restricted` | Ограничен модерацией | Часть действий заблокирована; видит причину/состояние |
| `banned` | Забанен | Нет доступа к продукту; сессии инвалидированы |
| `admin` | Admin/Moderator | Web admin dashboard |

### Event states
`draft → pending_review → live → full → starting_soon → in_progress → completed → archived`
Terminal: `cancelled_by_host`, `cancelled_by_admin`, `removed_for_safety`.

### Application states
`none → pending → (approved | rejected | waitlisted | cancelled_by_user) → (attended | no_show)`

---

# 5. Core Product Loop Flow

```
Guest/User
→ Onboarding
→ Discover Events
→ View Event
→ Apply
→ Pending
→ Approved
→ Event Chat
→ Attend
→ Post-event reconnect
```

| Этап | User делает | System делает | Экран | Safety constraints | Analytics |
|------|-------------|---------------|-------|--------------------|-----------|
| **Discover** | Ищет/фильтрует события | Отдаёт события по городу, approximate area | Home / Discover | Инвариант 1/9: нет exact location/pin; скрытие blocked/banned | `event_discovery_viewed`, `event_viewed` |
| **Apply** | Подаёт заявку + note | Проверяет onboarding/verification, создаёт `pending` | Event Detail → Apply Modal | Только onboarded; velocity limit | `application_started`, `application_created` |
| **Approve** | (Host) approve/reject/waitlist | Меняет статус, открывает/закрывает доступ | Host Review | Инвариант 8; rejected≠exact location | `application_approved/rejected/waitlisted` |
| **Attend** | Приходит на встречу | Открывает exact location/chat approved; lifecycle переходы | Approved Event Detail, Event Chat | Инвариант 1/2; report/block доступны | `event_chat_opened`, `event_completed` |
| **Reconnect** | Поддерживает контакт после события | Ограниченный post-event chat; trust events | Post-event Chat / Reconnect | Только shared context; no open DM; no raw trust score | `attendance_confirmed`, `post_event_reconnect_viewed` |

---

# 6. Detailed User Flows

---

## FLOW-001 — Guest Signup / Login Flow

### Purpose
Дать guest безопасно войти/зарегистрироваться и направить в onboarding или app.

### Primary Role
Guest → User

### Related Stories
US-AUTH-01, US-AUTH-02, US-AUTH-03, US-AUTH-04, US-AUTH-06, US-AUTH-08, US-AUTH-09, US-BETA-01, US-BETA-06, US-ANL-01, US-ANL-02

### Entry Points
Открытие приложения; deep link на protected route (после auth — возврат); logout.

### Preconditions
Приложение установлено; есть сеть (для OAuth/верификации).

### Main Flow
1. **Open app**
   - User action: запускает приложение.
   - System behavior: проверяет сессию; нет сессии → Welcome.
   - Screen/state: Welcome.
   - Data required: session token (если есть).
   - Safety/trust note: protected routes недоступны без сессии (US-AUTH-08).
2. **Choose Signup or Login**
   - User action: выбирает Signup или Login.
   - System behavior: открывает соответствующий экран.
   - Screen/state: Signup / Login.
   - Data required: —.
   - Safety/trust note: ошибки логина не раскрывают существование аккаунта.
3. **Provide credentials (email / Google / Apple)**
   - User action: вводит email+пароль или OAuth.
   - System behavior: аутентифицирует; при signup — invite-проверка (FLOW-002).
   - Screen/state: Login / Signup / Invite Code.
   - Data required: email, auth provider token, invite code (при signup).
   - Safety/trust note: invite-only beta enforced (US-BETA-06).
4. **Route by state**
   - User action: —.
   - System behavior: onboarded → App; not onboarded → Onboarding; banned → блок.
   - Screen/state: App / Onboarding / Auth Error.
   - Data required: user state, onboarding_completed.
   - Safety/trust note: banned не получает доступ (US-SAFE-12).

### Decision Points
- Сессия валидна? → App/Onboarding vs Welcome.
- Signup или Login?
- Onboarding завершён? → App vs Onboarding.
- Аккаунт banned/restricted? → блок/ограничение.

### Alternate Flows
- OAuth-аккаунт совпал с email-аккаунтом → политика связывания (Open Question).
- Forgot password → reset flow.

### Error / Edge Cases
- Invalid credentials → нейтральная ошибка (anti-enumeration).
- Existing account при signup → предложить login.
- Banned user входит → Auth Error «доступ ограничен», без деталей.
- Нет invite (закрытая бета) → Waitlist.
- Сеть недоступна для OAuth → retry.

### Exit States
В Onboarding · В App (onboarded) · Waitlist · Auth Error · Остался на Welcome.

### Analytics Events
`signup_started`, `signup_completed`, `login_completed`, `invite_code_required`, `invite_code_used`.

### Safety / Trust Constraints
Инвариант 7 (auth обязателен), US-SAFE-12 (banned не входит), invite-only (US-BETA-06). Никаких protected данных до auth.

### Screens Needed
Welcome, Login, Signup, Invite Code, Waitlist, Auth Error.

---

## FLOW-002 — Invite-only Beta Access Flow

### Purpose
Контролировать доступ к закрытой бете через invite codes; не-приглашённых направлять в waitlist.

### Primary Role
Guest, System, Admin

### Related Stories
US-BETA-01, US-BETA-02, US-BETA-03, US-BETA-04, US-BETA-06, US-BETA-07, US-ANL-11

### Entry Points
Шаг signup; ссылка-приглашение; экран Waitlist.

### Preconditions
Закрытая бета активна; есть механизм invite codes.

### Main Flow
1. **Enter invite code**
   - User action: вводит код (или открывает invite-ссылку).
   - System behavior: валидирует код (существование/срок/лимит).
   - Screen/state: Invite Code Entry.
   - Data required: invite code.
   - Safety/trust note: контроль доступа (US-BETA-02).
2. **Validate**
   - User action: подтверждает.
   - System behavior: valid → разрешает signup и привязывает invite→user; invalid → ошибка.
   - Screen/state: Invite Error / переход в Signup.
   - Data required: invite record, usage count.
   - Safety/trust note: атомарность использования (конкурентный ввод).
3. **No invite → Waitlist**
   - User action: выбирает «встать в лист ожидания».
   - System behavior: создаёт waitlist-запись (минимум данных).
   - Screen/state: Waitlist Signup → Waitlist Confirmation.
   - Data required: email/контакт.
   - Safety/trust note: минимизация PII.

### Decision Points
Код валиден? · Код использован/истёк? · Бета закрыта полностью?

### Alternate Flows
Admin создаёт коды (US-BETA-07, web). Multi-use vs single-use код.

### Error / Edge Cases
Код уже использован (single-use) → Invite Error. Код истёк → Invite Error + Waitlist CTA. Дубликат waitlist email → дедуп.

### Exit States
Доступ к signup разрешён · Waitlist confirmed · Invite Error.

### Analytics Events
`invite_code_created`, `invite_code_used`, `waitlist_joined`, `beta_access_denied`.

### Safety / Trust Constraints
Закрытая бета контролируема; без доступа — нет loop. Создание кодов — admin-only.

### Screens Needed
Invite Code Entry, Waitlist Signup, Waitlist Confirmation, Invite Error.

---

## FLOW-003 — Onboarding Flow

### Purpose
Дать контекст и safety-понимание до доступа к людям/событиям; собрать минимальный профиль.

### Primary Role
User, System

### Related Stories
US-ONB-01..11, US-AUTH-05, US-AUTH-09, US-ANL-03, profile_completed

### Entry Points
После первого signup; повторный вход с незавершённым onboarding (resume).

### Preconditions
Аутентифицирован; beta access есть.

### Main Flow
1. **Onboarding Welcome** — User: читает; System: объясняет «маленькие безопасные встречи, не dating, approval»; Screen: Onboarding Welcome; Data: —; Safety: anti-dating позиционирование (US-ONB-01).
2. **Safety Principles** — User: читает и принимает; System: фиксирует acceptance (version, timestamp); Screen: Safety Principles; Data: acceptance record; Safety: Инвариант 7 (US-ONB-02), отказ → нельзя продолжить.
3. **Basic Profile** — User: имя, возраст/age range; System: валидирует (<18 блок); Screen: Basic Profile; Data: name, age/age_range; Safety: privacy by design (US-ONB-03, OD-2).
4. **City Selection** — User: выбирает город; System: ограничивает beta-списком; Screen: City Selection; Data: city; Safety: город, не точная локация (US-ONB-04).
5. **Interests** — User: выбирает; System: требует минимум; Screen: Interests; Data: interests[]; Safety: соц. контекст, не мэтчинг (US-ONB-05).
6. **Vibe Tags** — User: выбирает; System: лимит; Screen: Vibe Tags; Data: vibe[]; Safety: нет attractiveness-полей (US-ONB-06).
7. **Intent Selection** — User: выбирает social intent; System: только non-romantic опции; Screen: Intent Selection; Data: intent; Safety: anti-dating (US-ONB-07).
8. **Photo Upload** — User: загружает ≥1 фото; System: триггерит moderation; Screen: Photo Upload + Moderation Pending; Data: photo; Safety: AI photo moderation, не judge (US-ONB-08).
9. **Phone Verification (decision point)** — User: проходит верификацию (или откладывает, если разрешено); System: ставит `phone_verified`/`phone_unverified`; Screen: Phone Verification; Data: phone; Safety: trust-сигнал; точка обязательности — OD-1.
10. **Profile Preview** — User: проверяет non-approved-вид; System: рассчитывает completeness; Screen: Profile Preview; Data: профиль; Safety: completeness внутренний (US-ONB-10).
11. **Onboarding Complete** — User: завершает; System: `onboarded`, открывает App; Screen: Onboarding Complete; Data: onboarding_completed; Safety: до этого нет доступа к событиям (US-AUTH-09).

### Decision Points
- **Phone verification: before apply or before approval** → **Open Product Decision (OD-1)** — flow поддерживает оба, точка не зафиксирована.
- **Minimum profile completeness for event access / apply** → **Open Product Decision (OD-6)**.
- Какие поля обязательны (OD-5).

### Alternate Flows
Resume incomplete onboarding → вход на первый незавершённый шаг, данные сохранены (US-ONB-11). Фото `pending` → onboarding завершаем, apply гейтится отдельно.

### Error / Edge Cases
Возраст <18 → блок. Пустые обязательные поля → валидация. Фото reject → замена. Прервана загрузка → retry.

### Exit States
Onboarding complete → App · Resume позже · Заблокирован (возраст) · Photo moderation pending.

### Analytics Events
`onboarding_started`, `onboarding_step_completed`, `onboarding_completed`, `profile_completed`.

### Safety / Trust Constraints
Инвариант 7 (safety как UX), Инвариант 3 (completeness не как число), Инвариант 5 (photo AI assist), нет доступа к событиям до завершения.

### Screens Needed
Onboarding Welcome, Safety Principles, Basic Profile, City Selection, Interests, Vibe Tags, Intent Selection, Photo Upload, Phone Verification, Profile Preview, Onboarding Complete, Moderation Pending State.

---

## FLOW-004 — Profile View / Edit Flow

### Purpose
Дать пользователю управлять своим представлением и privacy без раскрытия внутренних сигналов.

### Primary Role
User

### Related Stories
US-PROF-01..06, US-PROF-11, US-TRUST-08, US-ANL (profile_updated)

### Entry Points
Tab Profile; после onboarding; deep link.

### Preconditions
`onboarded`.

### Main Flow
1. **View own profile** — User: открывает Profile; System: показывает поля, soft-бейджи, completeness-подсказку; Screen: My Profile; Data: profile, badges; Safety: raw trust score не показывается (US-PROF-01/11, Инвариант 3).
2. **Start edit** — User: жмёт Edit; System: открывает форму; Screen: Edit Profile; Data: editable fields.
3. **Edit fields/photos/privacy** — User: меняет bio/interests/vibe/photos/privacy; System: валидирует, текст/фото → moderation; Screen: Edit Interests / Edit Photos / Privacy Settings; Data: updated fields; Safety: новый контент проходит moderation (US-PROF-02/03).
4. **Save** — User: сохраняет; System: применяет, ставит `pending` для модерируемого контента; Screen: Moderation Pending State (для фото/текста); Data: persisted profile; Safety: Инвариант 5 (AI assist).

### Decision Points
Контент проходит moderation? · Privacy-настройка конфликтует с обязательным safe-минимумом? (минимум всегда виден host в approved-контексте).

### Alternate Flows
Удаление единственного фото → предупреждение (минимум 1).

### Error / Edge Cases
Невалидный контент → блок сохранения/флаг. Фото на модерации → плейсхолдер/статус. Ошибка валидации полей → inline.

### Exit States
Профиль сохранён · Сохранён, контент на модерации · Отменено без изменений.

### Analytics Events
`profile_viewed`, `profile_edit_started`, `profile_updated`, `profile_photo_uploaded`.

### Safety / Trust Constraints
Инвариант 3 (no raw trust score), Инвариант 5 (AI moderation assist), Инвариант 7 (понятная privacy). Никаких dating-атрибутов.

### Screens Needed
My Profile, Edit Profile, Edit Interests, Edit Photos, Privacy Settings, Moderation Pending State.

---

## FLOW-005 — Safe Public Profile Flow

### Purpose
Показать другому пользователю/host безопасный профиль с контекстом, без чувствительных/внутренних данных.

### Primary Role
User, Host

### Related Stories
US-PROF-07, US-PROF-08, US-PROF-09, US-PROF-10, US-SAFE-01, US-SAFE-04

### Entry Points
Из attendee list, host-карточки события, application review, чата.

### Preconditions
`onboarded`; цель не забанена (иначе ограниченный вид).

### Main Flow
1. **Open safe profile** — User: тапает на пользователя; System: отдаёт только safe-поля + soft-бейджи; Screen: Public Profile; Data: safe profile, badges; Safety: нет raw trust score, нет чувствительных/внутренних полей, нет «who viewed» (US-PROF-07/08).
2. **Optionally report** — User: Report; System: создаёт `Report` → queue; Screen: Report User; Data: reason; Safety: Инвариант 6.
3. **Optionally block** — User: Block; System: создаёт `Block`, прекращает взаимодействие; Screen: Block User Confirmation; Data: block record; Safety: заблокированные не взаимодействуют.

### Decision Points
Объём safe-полей (фото/age range) → **Open Product Decision (OD-3)**.

### Alternate Flows
Профиль restricted/banned → ограниченный/скрытый вид.

### Error / Edge Cases
Профиль удалён → «недоступно». Уже заблокирован → состояние Blocked.

### Exit States
Просмотрел · Зарепортил · Заблокировал.

### Analytics Events
`report_created` (если report), `block_created` (если block).

### Safety / Trust Constraints
Инвариант 3 (no raw trust score), Инвариант 6 (report/block доступны), Инвариант 10 (нет негативных публичных ярлыков).

### Screens Needed
Public Profile, Report User, Block User Confirmation.

---

## FLOW-006 — Event Discovery Flow

### Purpose
Дать onboarded-пользователю находить релевантные маленькие события без раскрытия точной локации.

### Primary Role
User, System

### Related Stories
US-DISC-01..10, US-ANL (event_discovery_viewed, event_viewed)

### Entry Points
Tab Home/Discover; после onboarding complete; push.

### Preconditions
`onboarded`.

### Main Flow
1. **Open Discover** — User: открывает Home; System: грузит `live`/`full` события по городу; Screen: Home / Discover; Data: events (approx area); Safety: Инвариант 1/9 (US-DISC-01/04).
2. **Filter** — User: фильтрует по категории/дате; System: применяет; Screen: Filters; Data: filters; Safety: только разрешённые категории (US-DISC-02/03).
3. **Browse cards** — User: листает; System: скрывает события blocked/banned; Screen: Event Card; Data: card data; Safety: US-DISC-09.
4. **Open event** — User: тап; System: открывает Event Detail по статусу заявки; Screen: Event Detail; Data: event; Safety: вариант экрана по состоянию.

### Decision Points
Есть события? · Применены фильтры без результата? · Связаны с blocked/banned?

### Alternate Flows
Город не в beta-списке → подсказка «скоро».

### Error / Edge Cases
Пустой список → Empty State. Событие исчезло между списком и открытием → «недоступно». Сеть → retry/cached.

### Exit States
Открыл Event Detail · Empty State · Применил фильтр.

### Analytics Events
`home_opened`, `event_discovery_viewed`, `event_filter_applied`, `event_viewed`.

### Safety / Trust Constraints
Инвариант 1/9 (нет exact location/pin), Инвариант 6 (скрытие blocked), calm UX (без бесконечной ленты-зависимости).

### Screens Needed
Home / Discover, Event Card, Filters, Empty State, Event Detail.

---

## FLOW-007 — Event Detail Flow

### Purpose
Показать событие с контекстом и нужным уровнем приватности в зависимости от состояния пользователя.

### Primary Role
User, Host (свой вид)

### Related Stories
US-DISC-05..08, US-EVT-10, US-APP-01/03/09/10, US-SAFE-02, US-PROF-07

### Entry Points
Из Discovery; из My Events; из notification; deep link.

### Preconditions
`onboarded`.

### Main Flow
1. **Open detail** — User: открывает событие; System: определяет состояние заявки/события и рендерит вариант; Screen: Event Detail (вариант); Data: event, application status; Safety: location gating по §9-матрице.
2. **Read context** — User: смотрит title/category/host safe profile/capacity/time/approximate area/approval requirement; System: отдаёт безопасные поля; Screen: Event Detail Public; Data: safe event; Safety: Инвариант 1 (нет exact до approval), Инвариант 8 (approval явно показан).
3. **Primary CTA** — User: Apply (или видит свой статус); System: открывает Apply flow или показывает статус; Screen: Apply Modal / status state; Data: —; Safety: гейт onboarding/verification (FLOW-009).
4. **Report option** — User: Report event; System: → FLOW-017; Screen: Report Event; Safety: Инвариант 6.

### Decision Points
Состояние пользователя/события: not onboarded · already applied (pending) · approved · rejected · waitlisted · event full · cancelled · removed_for_safety · host view. Каждое → свой вариант экрана (см. §8).

### Alternate Flows
Host открывает своё событие → host-вид с управлением заявками. Approved → Approved Event Detail с exact location (FLOW-011).

### Error / Edge Cases
Событие отменено/removed во время просмотра → Cancelled/Removed state. Capacity заполнилась → Full state с waitlist offer.

### Exit States
Перешёл в Apply · Видит свой статус · Зарепортил событие · Событие недоступно.

### Analytics Events
`event_viewed`, переходы в `application_started` / `report_created`.

### Safety / Trust Constraints
Инвариант 1 (exact только approved), Инвариант 8 (approval как фича), Инвариант 6 (report доступен).

### Screens Needed
Event Detail Public, Event Detail Applied, Event Detail Approved, Event Detail Rejected, Event Full State, Event Cancelled State, Report Event.

---

## FLOW-008 — Event Creation Flow

### Purpose
Дать host создать безопасное небольшое событие с правильным разделением approximate vs exact location.

### Primary Role
Host

### Related Stories
US-EVT-01..13, US-ANL (event_create_started, event_published)

### Entry Points
Tab Create; «создать событие» из empty state discovery.

### Preconditions
`onboarded`; eligible to host (verification по политике/OD-1).

### Main Flow
1. **Start / draft** — User: начинает; System: создаёт `Event=draft`; Screen: Create Event Start; Data: draft id; Safety: draft не виден в discovery (US-EVT-01).
2. **Category** — User: выбирает; System: только MVP-категории; Screen: Category Selection; Data: category; Safety: нет nightlife/dating (US-EVT-02, §9 Core).
3. **Details** — User: title/description; System: лимиты, контент → moderation; Screen: Event Details Form; Data: title, description; Safety: AI text moderation (US-EVT-03).
4. **Date/Time** — User: задаёт; System: валидирует будущее/таймзону; Screen: Date/Time; Data: datetime; Safety: —.
5. **Capacity** — User: задаёт лимит; System: ограничивает (small events); Screen: Capacity; Data: capacity; Safety: «small events first».
6. **Approval/Waitlist** — User: подтверждает approval-required, waitlist; System: approval обязателен в MVP; Screen: Approval Settings; Data: flags; Safety: Инвариант 8 (нельзя отключить approval).
7. **Approximate location** — User: задаёт area; System: сохраняет как публичную area; Screen: Location Setup; Data: approx area; Safety: Инвариант 1/9 (US-EVT-08).
8. **Exact location/instructions** — User: задаёт точное место/инструкции; System: хранит, доступно только approved/host/admin; Screen: Exact Instructions; Data: exact location; Safety: Инвариант 1 (US-EVT-09) — enforced RLS.
9. **Preview** — User: смотрит non-approved-вид; System: рендерит без exact; Screen: Preview; Data: —; Safety: preview не утекает exact (US-EVT-10).
10. **Publish** — User: публикует; System: `pending_review` или `live` (OD-13); Screen: Publish Confirmation / Pending Review; Data: status; Safety: AI/admin review допустим, AI не final judge (US-EVT-11, Инвариант 5).

### Decision Points
Manual review всех событий в beta? → **Open Product Decision (OD-13)**. Host eligibility/verification → OD-1.

### Alternate Flows
Сохранить draft и выйти. Edit event позже (US-EVT-12). Cancel event (FLOW-014).

### Error / Edge Cases
Время в прошлом → валидация. Capacity вне диапазона → ограничение. Unsafe-контент → `pending_review`. Потеря сети → автосейв draft.

### Exit States
Опубликовано (`live`) · На ревью (`pending_review`) · Сохранено как draft.

### Analytics Events
`event_create_started`, `event_draft_saved`, `event_published`, `event_pending_review`.

### Safety / Trust Constraints
Инвариант 1/9 (location split), Инвариант 8 (approval), Инвариант 5 (AI review assist), small events first.

### Screens Needed
Create Event Start, Category Selection, Event Details Form, Date/Time, Capacity, Approval Settings, Location Setup, Exact Instructions, Preview, Publish Confirmation, Pending Review.

---

## FLOW-009 — Event Application Flow

### Purpose
Дать пользователю безопасно подать заявку с контекстом и понятным статусом.

### Primary Role
User, System

### Related Stories
US-APP-01..04, US-AUTH-05, US-ONB-10, US-SAFE-11, US-ANL-05

### Entry Points
Event Detail → Apply CTA.

### Preconditions
`onboarded`; событие `live`; пользователь не заблокирован host'ом.

### Main Flow
1. **Tap Apply** — User: жмёт Apply; System: проверяет onboarding/completeness/verification; Screen: Event Detail; Data: user state; Safety: гейты US-APP-01.
2. **Eligibility checks** — System: если не выполнено → соответствующий экран (Verification Required / Profile Completion Required); Screen: те экраны; Data: requirements; Safety: точка verification — OD-1, completeness — OD-6.
3. **Write note** — User: пишет опц. note; System: лимит + moderation; Screen: Application Note; Data: note; Safety: note виден только host, AI moderation (US-APP-02).
4. **Submit** — User: отправляет; System: создаёт `EventApplication=pending`; velocity check; Screen: Application Pending; Data: application; Safety: velocity limit (US-SAFE-11).
5. **See pending** — User: видит статус; System: показывает ожидание + approximate area; Screen: Application Pending; Data: status; Safety: pending → нет exact/чата (US-APP-03).

### Decision Points
Not onboarded · Phone not verified (OD-1) · Profile incomplete (OD-6) · Event full → Waitlist offer · Blocked by host · Already applied · Event cancelled/removed.

### Alternate Flows
Event full + waitlist → Waitlist Offer → `waitlisted`. Cancel application позже (US-APP-04).

### Error / Edge Cases
Событие стало full во время подачи → Waitlist offer / «мест нет». Blocked by host → заявка не создаётся. Уже подана → показываем статус. Событие removed → «недоступно».

### Exit States
`pending` создана · `waitlisted` · Требуется verification/completeness · Заявка не создана (blocked/full/removed).

### Analytics Events
`application_started`, `application_created`, `application_cancelled`.

### Safety / Trust Constraints
Только onboarded; Инвариант 1 (pending → approx area); velocity limit; note под moderation.

### Screens Needed
Apply Modal, Application Note, Application Pending, Verification Required, Profile Completion Required, Waitlist Offer.

---

## FLOW-010 — Host Application Review Flow

### Purpose
Дать host безопасно принять решение по заявкам с достаточным, но не чувствительным контекстом.

### Primary Role
Host, System

### Related Stories
US-APP-05..11, US-PROF-07, US-NOTIF-01/02, US-ANL-06

### Entry Points
Notification о новой заявке; My Events → Hosted → событие.

### Preconditions
Host владеет событием; есть заявки `pending`.

### Main Flow
1. **Open hosted event** — User: открывает; System: показывает дашборд события; Screen: Hosted Event Dashboard; Data: event, counts; Safety: host-операции ограничены своим событием.
2. **View applications** — User: смотрит список pending; System: отдаёт safe-профиль + note + soft-бейджи; Screen: Applications List; Data: applications; Safety: только safe-поля (US-APP-05, OD-3).
3. **Open applicant** — User: открывает заявку; System: Applicant Detail (safe); Screen: Applicant Detail; Data: safe profile, note, badges; Safety: нет чувствительных/внутренних полей, нет raw trust.
4. **Decide** — User: Approve/Reject/Waitlist; System: меняет статус, уважает capacity, шлёт notification; Screen: Approve/Reject Confirmation / Waitlist State; Data: decision; Safety: rejected≠exact location (US-APP-07), approved→location/chat (US-APP-06), waitlisted≠exact (US-APP-08).

### Decision Points
Approve over capacity → блок/предложить waitlist. Достаточно ли контекста (OD-3).

### Alternate Flows
Bulk-обзор (P1). Remove approved attendee позже (US-APP-11) → revoke location/chat.

### Error / Edge Cases
Approve когда место занялось → блок. Applicant отозвал заявку до решения → статус `cancelled_by_user`. Host заблокировал applicant → заявка недоступна.

### Exit States
`approved` · `rejected` · `waitlisted` · Без изменений.

### Analytics Events
`application_reviewed`, `application_approved`, `application_rejected`, `application_waitlisted`.

### Safety / Trust Constraints
Инвариант 8 (approval core), Инвариант 1 (rejected/waitlisted ≠ exact), Инвариант 3 (safe profile, no raw trust), Инвариант 10 (нет негативных ярлыков).

### Screens Needed
Hosted Event Dashboard, Applications List, Applicant Detail, Approve Confirmation, Reject Confirmation, Waitlist State.

---

## FLOW-011 — Approval / Location Reveal Flow

### Purpose
**Критический flow.** Корректно открыть exact location/chat только approved-пользователю и держать его скрытым от остальных.

### Primary Role
System, User

### Related Stories
US-APP-06/09, US-CHAT-01, US-NOTIF-01/09, US-EVT-09

### Entry Points
Host approve (FLOW-010); системное изменение статуса заявки.

### Preconditions
Заявка переведена в `approved`; событие активно (не cancelled/removed).

### Main Flow
1. **Approval applied** — System: статус `approved`, грантит event access; Screen: — (фон); Data: application=approved; Safety: доступ к exact только теперь.
2. **Approval notification** — System: шлёт push/in-app без exact location в payload; User: получает; Screen: Approval Notification; Data: event id, safe wording; Safety: Инвариант 1/9 (US-NOTIF-09) — payload без адреса.
3. **Open approved detail** — User: открывает событие; System: рендерит Approved Event Detail с Exact Location Section + Instructions; Screen: Approved Event Detail; Data: exact location; Safety: exact только внутри approved detail (US-APP-09).
4. **Chat opens** — System: открывает доступ к event chat; User: входит; Screen: Event Chat Entry; Data: chat access; Safety: Инвариант 2 (контекст до общения).
5. **Revoke on change** — System: при отмене approval/удалении участника/cancel события — доступ к exact/chat немедленно снят; Screen: статус-state; Data: revoked access; Safety: US-APP-11, FLOW-014.

### Decision Points
Когда показывать exact: сразу после approval или ближе к старту → **Open Product Decision (Q-RJ / PRD §12)**.

### Alternate Flows
Approval отозван host/admin → доступ закрыт, уведомление. Событие отменено → exact больше не раскрывается.

### Error / Edge Cases
Notification доставлен, но approval отозван до открытия → при открытии видит актуальный (закрытый) статус. Попытка rejected/waitlisted получить exact через API → запрещено RLS, лог попытки.

### Exit States
Доступ к exact+chat открыт · Доступ отозван (изменение) · Ожидание времени показа (если отложенный reveal).

### Analytics Events
`application_approved`, `event_chat_opened`.

### Safety / Trust Constraints
**Инвариант 1 (жёстко): exact только approved/host/admin.** Инвариант 9 (payload без точной локации). Инвариант 2 (chat после approval).

### Screens Needed
Approval Notification, Approved Event Detail, Exact Location Section, Event Instructions, Event Chat Entry.

---

## FLOW-012 — Event Chat Flow

### Purpose
Дать approved-участникам общаться в контексте события без open DMs, с модерацией.

### Primary Role
User, Host, Admin, System

### Related Stories
US-CHAT-01..11, US-SAFE-03, US-ADMIN-08

### Entry Points
Approved Event Detail → Chat; notification о новом сообщении/апдейте.

### Preconditions
Пользователь `approved` на событии; чат не frozen (или read-only).

### Main Flow
1. **Open chat** — User: открывает; System: проверяет approved-доступ, грузит историю; Screen: Event Chat; Data: messages; Safety: Инвариант 2 (US-CHAT-01).
2. **Read/Send** — User: читает/пишет; System: velocity limit, контент-проверка; Screen: Event Chat; Data: message; Safety: нет open DM (US-CHAT-02/07).
3. **Host update** — Host: шлёт system/update; System: помечает official; Screen: Event Chat (system message); Data: update; Safety: апдейты не утекают вне approved (US-CHAT-03/10).
4. **Report message** — User: Message Actions → Report; System: `Report`+context → queue, может скрыть pending; Screen: Report Message; Data: reason, snapshot; Safety: Инвариант 6, US-CHAT-04/11.
5. **Admin freeze (if needed)** — Admin: freeze; System: read-only + audit log; Screen: Chat Frozen State; Data: freeze record; Safety: Инвариант 4 (US-CHAT-09).
6. **Post-event window** — System: после `completed` чат ограничен по времени (OD-4), затем read-only/закрыт; Screen: Post-event Chat Expiring State; Data: window; Safety: только shared context, не open DM (US-CHAT-08).

### Decision Points
Длительность post-event chat → **Open Product Decision (OD-4)**.

### Alternate Flows
Blocked users в одном чате → не видят сообщения друг друга (US-CHAT-05). Approval отозван → доступ к чату закрыт (US-CHAT-06).

### Error / Edge Cases
Rejected/waitlisted пытается войти → запрещено. Автор удалил зарепорченное сообщение → снапшот сохранён. Spam → throttle.

### Exit States
Сообщение отправлено · Сообщение зарепорчено · Чат frozen · Post-event окно истекло.

### Analytics Events
`event_chat_opened`, `chat_message_sent`, `message_reported`, `chat_frozen`.

### Safety / Trust Constraints
Инвариант 2 (no open DMs, только approved), Инвариант 4 (freeze в audit log), Инвариант 5 (unsafe hide pending review, AI не judge), Инвариант 6 (report доступен).

### Screens Needed
Event Chat, Message Actions, Report Message, Chat Frozen State, Post-event Chat Expiring State.

---

## FLOW-013 — Event Reminder / Notification Flow

### Purpose
Информировать пользователей о ключевых событиях без утечки чувствительной локации.

### Primary Role
System, User, Host

### Related Stories
US-NOTIF-01..09

### Entry Points
Системные триггеры: approve/reject/waitlist, reminder по времени, event update, cancellation, new application, moderation action, invite.

### Preconditions
У пользователя есть аккаунт; настройки уведомлений (P1 — preferences).

### Main Flow
1. **Trigger** — System: фиксирует событие-триггер; Data: event/notification type.
2. **Compose safe payload** — System: формирует текст БЕЗ exact location; Screen: Push Notification Variants; Data: safe wording; Safety: Инвариант 1/9 (US-NOTIF-09).
3. **Deliver** — System: push/in-app; офлайн → доставка позже; Screen: Notifications List.
4. **Open** — User: открывает; System: ведёт в нужный экран (approved detail для деталей места); Screen: Notification Detail / target screen; Safety: exact только внутри approved detail.

### Decision Points
Тип уведомления → разный текст/таргет. Approved vs non-approved → разный уровень деталей (никогда exact в payload).

### Alternate Flows
Cancelled event → уведомление всем pending/approved/waitlisted (FLOW-014). Moderation action → нейтральная формулировка.

### Error / Edge Cases
Событие отменено до reminder → reminder не шлётся / шлётся cancel. Всплеск изменений → батчинг.

### Exit States
Доставлено · Открыто → target screen · Не доставлено (нет токена) — fallback in-app.

### Analytics Events
Связанные: `application_approved/rejected`, `event_completed`, и др. (см. §11).

### Safety / Trust Constraints
**Инвариант 1/9: ни одно уведомление не содержит точный адрес/координаты.** Calm UX (без спама).

### Screens Needed
Notifications List, Notification Detail, Push Notification Variants.

---

## FLOW-014 — Event Cancellation Flow

### Purpose
Безопасно отменить событие (host или admin), уведомить участников, корректно закрыть доступ.

### Primary Role
Host, Admin, System

### Related Stories
US-EVT-13, US-SAFE-08, US-NOTIF-05, US-ADMIN-08

### Entry Points
Host: Hosted Event → Cancel. Admin: moderation action.

### Preconditions
Событие в активном статусе (`live`/`full`/`starting_soon`).

### Main Flow
1. **Initiate cancel** — User(Host/Admin): жмёт Cancel; System: запрашивает причину; Screen: Cancel Event Confirmation; Data: event id; Safety: —.
2. **Provide reason** — User: указывает причину; System: фиксирует; Screen: Cancellation Reason; Data: reason; Safety: admin-cancel → audit log (Инвариант 4).
3. **Apply status** — System: `cancelled_by_host` / `cancelled_by_admin` / `removed_for_safety`; Screen: Event Cancelled State; Data: status; Safety: exact location больше не раскрывается.
4. **Notify** — System: уведомляет всех pending/approved/waitlisted; Screen: Cancellation Notification; Data: recipients; Safety: payload без exact (US-NOTIF-09).
5. **Chat handling** — System: чат → frozen/read-only; Screen: Chat Frozen State; Data: chat state; Safety: harm containment.

### Decision Points
Cancel before approvals · after approvals · близко к старту (приоритетное уведомление) · admin cancel for safety (`removed_for_safety` + обязательный audit).

### Alternate Flows
Admin removal for safety (FLOW-020/021) — всегда audit log.

### Error / Edge Cases
Cancel в момент `in_progress` → допускается с особым уведомлением. Повторные отмены host → trust-сигнал (внутренний).

### Exit States
`cancelled_by_host` · `cancelled_by_admin` · `removed_for_safety` (+ audit).

### Analytics Events
`event_cancelled` (host), `event_removed_for_safety`, `moderation_action_taken` (admin).

### Safety / Trust Constraints
Инвариант 4 (admin/safety cancel → audit log), Инвариант 1 (после cancel exact не раскрывается), Инвариант 9 (notification без локации).

### Screens Needed
Cancel Event Confirmation, Cancellation Reason, Event Cancelled State, Cancellation Notification.

---

## FLOW-015 — Attendance / Post-event Flow

### Purpose
Зафиксировать посещение/no-show, обновить внутренний trust, дать ограниченный reconnect.

### Primary Role
System, Host, User

### Related Stories
US-APP-12, US-TRUST-03/04/05/06, US-CHAT-08, US-ANL (event_completed, no_show_recorded)

### Entry Points
Событие достигло `completed` (по времени/host).

### Main Flow
1. **Event completed** — System: переводит в `completed`; Screen: Event Completed; Data: event; Safety: —.
2. **Confirm attendance** — Host подтверждает / System промптит attendees; User подтверждает; Screen: Attendance Confirmation; Data: attended/no_show; Safety: метод — OD-8.
3. **Record no-show** — System: фиксирует `no_show`, создаёт `TrustEvent`; Screen: — (внутренне); Data: trust event; Safety: только внутренний trust, нет публичного ярлыка (US-TRUST-04, Инвариант 10).
4. **Host feedback** — Host: оставляет post-event feedback; System: внутренний `TrustEvent`; Screen: Host Feedback; Data: feedback; Safety: не публичный рейтинг (US-TRUST-05).
5. **Reconnect** — User: видит ограниченные reconnect-опции в shared context; System: post-event chat (OD-4); Screen: Post-event Reconnect / Post-event Chat; Data: window; Safety: только shared context, no open DM (US-CHAT-08).

### Decision Points
Как фиксировать/подтверждать no-show → **Open Product Decision (OD-8)**. Длительность post-event chat → **OD-4**. Может ли user оспорить no-show → **Open Question (Q-RJ2/dispute)**.

### Alternate Flows
Спор по no-show → dispute path (Open Question). Никто не подтвердил → политика дефолта (Open Question).

### Error / Edge Cases
Host не отмечает attendance → fallback (system prompt/таймаут). Abuse host-feedback → сглаживание/review.

### Exit States
`attended` зафиксирован · `no_show` зафиксирован · Reconnect доступен (окно) · Окно истекло.

### Analytics Events
`event_completed`, `attendance_confirmed`, `no_show_recorded`, `post_event_reconnect_viewed`.

### Safety / Trust Constraints
Инвариант 3 (no raw trust score), Инвариант 10 (нет негативных публичных ярлыков / social credit), no open DM (reconnect только shared context).

### Screens Needed
Event Completed, Attendance Confirmation, Host Feedback, Post-event Reconnect, Post-event Chat.

---

## FLOW-016 — Report User Flow

### Purpose
Дать безопасно пожаловаться на пользователя из любого релевантного контекста.

### Primary Role
User, System

### Related Stories
US-SAFE-01, US-PROF-09, US-ADMIN-05

### Entry Points
Public Profile · Attendee list · Event Chat · Applicant context.

### Preconditions
`onboarded`.

### Main Flow
1. **Choose Report User** — User: выбирает Report; System: открывает форму; Screen: Report User; Data: target user; Safety: Инвариант 6 (доступно отовсюду).
2. **Select reason** — User: выбирает причину; System: список причин; Screen: Report Reason; Data: reason.
3. **Add details** — User: опц. детали; System: лимит; Screen: Report Details; Data: details.
4. **Submit** — User: отправляет; System: `Report` → moderation queue; Screen: Report Submitted; Data: report; Safety: reporter safety, no retaliation; review логируется (Инвариант 4).

### Decision Points
Источник report (профиль/чат/attendee) → контекст в report.

### Alternate Flows
Параллельный block (FLOW-019).

### Error / Edge Cases
Повторный report того же объекта → дедуп/throttle. Объект удалён → report всё равно фиксируется.

### Exit States
Report отправлен · Отменён.

### Analytics Events
`report_created`.

### Safety / Trust Constraints
Инвариант 6 (report доступен из profile/event/chat), Инвариант 4 (review → audit log), no retaliation.

### Screens Needed
Report User, Report Reason, Report Details, Report Submitted.

---

## FLOW-017 — Report Event Flow

### Purpose
Дать пожаловаться на небезопасное событие.

### Primary Role
User, System

### Related Stories
US-SAFE-02, US-SAFE-08, US-ADMIN-06

### Entry Points
Event Detail → Report Event.

### Preconditions
`onboarded`.

### Main Flow
1. **Choose Report Event** — User: Report; System: форма; Screen: Report Event; Data: event id; Safety: Инвариант 6.
2. **Select reason + details** — User: причина/детали; System: лимит; Screen: Report Details; Data: reason.
3. **Submit** — User: отправляет; System: `Report` → queue; unsafe → review/`removed_for_safety`; Screen: Report Submitted; Data: report; Safety: removal → audit log (Инвариант 4).

### Decision Points
Серьёзность → приоритет в очереди (AI assist, не judge).

### Alternate Flows
Параллельный report host (FLOW-016).

### Error / Edge Cases
Событие отменено → report фиксируется. Дубликаты → группировка.

### Exit States
Report отправлен.

### Analytics Events
`report_created` (type=event).

### Safety / Trust Constraints
Инвариант 6, Инвариант 4 (removal logged), Инвариант 5 (AI assist).

### Screens Needed
Report Event, Report Details, Report Submitted.

---

## FLOW-018 — Report Message Flow

### Purpose
Дать пожаловаться на сообщение в event chat с сохранением контекста.

### Primary Role
User, System

### Related Stories
US-CHAT-04, US-CHAT-11, US-SAFE-03, US-ADMIN-07

### Entry Points
Event Chat → long-press / Message Actions.

### Preconditions
`approved` на событии (есть доступ к чату).

### Main Flow
1. **Open message actions** — User: long-press; System: меню действий; Screen: Message Actions; Data: message id.
2. **Report** — User: выбирает Report + reason; System: сохраняет сообщение + контекст треда (snapshot по политике); Screen: Report Message; Data: snapshot, reason; Safety: контекст сохраняется даже если автор удалит (US-CHAT-11).
3. **Submit** — User: отправляет; System: → moderation queue; может скрыть pending; Screen: Report Submitted; Data: report; Safety: AI assist, human решает serious (Инвариант 5).

### Decision Points
Скрывать ли сообщение немедленно pending review (по серьёзности/политике).

### Alternate Flows
Параллельно report/block автора.

### Error / Edge Cases
Автор удалил сообщение после report → используется снапшот. False positive → восстановление после review.

### Exit States
Report отправлен · Сообщение скрыто pending review.

### Analytics Events
`message_reported`, `report_created` (type=message).

### Safety / Trust Constraints
Инвариант 6, Инвариант 5 (AI не final judge), Инвариант 4 (review logged), сохранение контекста для модерации.

### Screens Needed
Message Actions, Report Message, Report Submitted.

---

## FLOW-019 — Block User Flow

### Purpose
Дать пользователю прекратить любое взаимодействие с другим пользователем.

### Primary Role
User, System

### Related Stories
US-SAFE-04, US-PROF-10, US-DISC-09, US-CHAT-05

### Entry Points
Public Profile · Attendee context · Event Chat.

### Preconditions
`onboarded`.

### Main Flow
1. **Tap Block** — User: Block; System: подтверждение; Screen: Block Confirmation; Data: target; Safety: Инвариант 6.
2. **Confirm** — User: подтверждает; System: создаёт `Block`; Screen: Blocked State; Data: block record; Safety: взаимодействие прекращается.
3. **Apply effects** — System: blocked не может apply на события блокирующего, не может писать ему; события могут скрываться; Screen: — (фон); Data: visibility rules; Safety: US-DISC-09, US-CHAT-05.
4. **Manage** — User: видит/снимает блок (если разрешено); Screen: Manage Blocked Users; Data: block list; Safety: обратимость — Open Question (Q-BLK).

### Decision Points
Обратим ли block (unblock) в MVP → **Open Question (Q-BLK)**. Поведение при общем активном событии (см. §8 edge #22).

### Alternate Flows
Block + Report одновременно.

### Error / Edge Cases
Блок участника общего активного события → пересчёт видимости/взаимодействия. Уже заблокирован → idempotent.

### Exit States
Заблокирован · Разблокирован (если разрешено).

### Analytics Events
`block_created`.

### Safety / Trust Constraints
Заблокированные не взаимодействуют (apply/chat/visibility), Инвариант 6.

### Screens Needed
Block Confirmation, Blocked State, Manage Blocked Users.

---

## FLOW-020 — Admin Moderation Queue Flow

### Purpose
Дать admin обрабатывать reports/флаги с контекстом и обязательным audit log.

### Primary Role
Admin

### Related Stories
US-ADMIN-01..10, US-ADMIN-13, US-SAFE-05/09

### Entry Points
Admin web login → Moderation Queue.

### Preconditions
Роль admin/moderator; safety dashboard работает (US-BETA-08).

### Main Flow
1. **Login** — Admin: входит; System: проверяет роль; Screen: Admin Login; Data: admin session; Safety: web только admin.
2. **Open queue** — Admin: открывает; System: список с приоритетом + AI risk-сводки (assistive); Screen: Moderation Queue; Data: reports; Safety: Инвариант 5 (AI assist).
3. **Filter** — Admin: по type/priority; System: применяет; Screen: Moderation Queue; Data: filters.
4. **Open report detail** — Admin: открывает; System: контекст (user/event/message), AI summary; Screen: Report Detail / User Detail / Event Detail / Message Detail; Data: full context; Safety: admin-доступ к exact логируется.
5. **Take action** — Admin: no action/warn/restrict/ban/remove event/hide content/freeze chat/escalate; System: применяет, требует причину для serious; Screen: Action Modal; Data: action, reason; Safety: Инвариант 5 (serious → human), Инвариант 4.
6. **Audit log** — System: создаёт `AuditLog` (кто/что/когда/причина); Screen: Audit Log; Data: log entry; Safety: **Инвариант 4 (обязательно)**.

### Decision Points
Серьёзность действия → требование причины + human review. AI-сводка только рекомендация.

### Alternate Flows
Escalate на старшего модератора. Перейти в FLOW-021 (restrict/ban).

### Error / Edge Cases
Недостаточно контекста → запрос данных/escalate. Сбой записи audit log → действие не считается завершённым.

### Exit States
Действие применено + залогировано · Эскалировано · No action.

### Analytics Events
`moderation_action_taken` (+ связанные `event_removed_for_safety`, `user_restricted`, `user_banned`).

### Safety / Trust Constraints
**Инвариант 4 (audit log на всё moderation-sensitive), Инвариант 5 (AI assistive, serious → human).**

### Screens Needed
Admin Login, Moderation Queue, Report Detail, User Detail, Event Detail, Message Detail, Action Modal, Audit Log.

---

## FLOW-021 — Admin User Restriction / Ban Flow

### Purpose
Дать admin ограничить/забанить пользователя с обоснованием и audit log.

### Primary Role
Admin, System

### Related Stories
US-SAFE-06, US-SAFE-07, US-ADMIN-11, US-ADMIN-12, US-SAFE-09

### Entry Points
Из Moderation Queue / User Detail / Suspicious Activity.

### Preconditions
Роль admin; есть основания (reports/trust events/history).

### Main Flow
1. **Open user** — Admin: открывает; System: профиль, reports/blocks, trust events, suspicious flags; Screen: Admin User Detail; Data: user history; Safety: trust виден admin-only.
2. **Choose restrict/ban** — Admin: выбирает; System: форма с обязательной причиной; Screen: Restrict User / Ban User; Data: action type; Safety: serious → human review (Инвариант 5).
3. **Apply** — System: применяет ограничение/бан, инвалидирует сессии (ban), меняет доступ; Screen: — ; Data: enforcement; Safety: banned не взаимодействует (US-SAFE-12).
4. **Audit log** — System: `AuditLog` с причиной; Screen: Audit Log Entry; Data: log; Safety: **Инвариант 4**.

### Decision Points
Temporary restriction vs permanent ban. **Appeal flow → Open Question (не определён).**

### Alternate Flows
Снятие restriction позже. Ban-evasion → suspicious detection (FLOW-022).

### Error / Edge Cases
Активная сессия при ban → принудительный logout. Ошибочный ban → откат по политике + лог.

### Exit States
Restricted (+ audit) · Banned (+ audit) · Отменено.

### Analytics Events
`user_restricted`, `user_banned`, `moderation_action_taken`.

### Safety / Trust Constraints
Инвариант 4 (audit), Инвариант 5 (permanent ban — human), US-SAFE-12 (banned blocked).

### Screens Needed
Admin User Detail, Restrict User, Ban User, Audit Log Entry.

---

## FLOW-022 — Suspicious Behavior / Velocity Limit Flow

### Purpose
Автоматически выявлять подозрительную активность и отдавать её на human review, не наказывая серьёзно автоматически.

### Primary Role
System, Admin

### Related Stories
US-SAFE-10, US-SAFE-11, US-TRUST-09/10, US-ADMIN-13

### Entry Points
Системные сигналы: всплеск заявок/сообщений, повторные reports, повторные no-show, подозрительные изменения профиля.

### Preconditions
Правила/детекторы velocity активны.

### Main Flow
1. **Detect** — System: фиксирует превышение порога/паттерн; Data: signal; Safety: не финальный enforcement.
2. **Soft response** — System: soft-restriction/throttle ИЛИ флаг на review; Screen: Restriction State (если soft); Data: flag; Safety: легитимный всплеск → мягкая деградация, не бан (US-SAFE-11).
3. **Queue for admin** — System: добавляет в Suspicious Activity Queue; Screen: Suspicious Activity Queue; Data: item; Safety: Инвариант 5.
4. **Admin review** — Admin: открывает, решает (no action/restrict/ban/escalate); System: применяет + audit log; Screen: Admin Review Detail; Data: decision; Safety: serious → human + audit (Инвариант 4/5).

### Decision Points
Soft auto-restriction vs только флаг (по типу/серьёзности). Порог false positive.

### Alternate Flows
Явный fraud → быстрая, но логируемая реакция + последующий review.

### Error / Edge Cases
False positive → review без наказания; восстановление. Ban-evasion → связывание сигналов.

### Exit States
Soft-restricted (review pending) · Флаг в очереди · Admin решение применено.

### Analytics Events
`suspicious_activity_flagged`, при действии — `moderation_action_taken`/`user_restricted`.

### Safety / Trust Constraints
Инвариант 5 (AI/system не final judge для serious), Инвариант 4 (решения → audit), Инвариант 10 (trust не social credit / не авто-наказание).

### Screens Needed
Suspicious Activity Queue, Admin Review Detail, Restriction State.

---

## FLOW-023 — Trust Signal Update Flow

### Purpose
Обновлять внутренние trust-сигналы и мягкие публичные бейджи без раскрытия числа.

### Primary Role
System

### Related Stories
US-TRUST-01..10, US-PROF-08/11, US-ADMIN-05

### Entry Points
Событие-сигнал: phone verified, profile completed, attended, host feedback, no-show, report/block получен.

### Preconditions
Trust-движок активен.

### Main Flow
1. **Signal occurs** — System: фиксирует сигнал; Data: signal type; Safety: —.
2. **Create trust event** — System: создаёт `TrustEvent` (ревьюабельно); Screen: Admin Trust Events / Internal Trust Detail (admin-only); Data: trust event; Safety: audit-friendly.
3. **Recompute internal tier** — System: пересчитывает внутренний trust серверно; Screen: — (не клиент); Data: internal score; Safety: **Инвариант 3 (никогда не клиенту)**.
4. **Update public badges** — System: обновляет нечисловые бейджи (Verified / Reliable attendee / Hosted before / Attended events); Screen: Profile Trust Badge Area; Data: badges; Safety: Инвариант 3/10, нет негативных публичных ярлыков.

### Decision Points
Где именно показывать badges (профиль/карточка события/applicant) → **Open Question**.

### Alternate Flows
Сигнал отозван (верификация снята) → бейдж снимается.

### Error / Edge Cases
Конфликтующие сигналы → агрегируются серверно. Abuse-feedback → сглаживание/review.

### Exit States
Trust event записан · Tier обновлён (внутренне) · Badges обновлены.

### Analytics Events
Внутренние (без PII): связанные с `no_show_recorded`, `attendance_confirmed`.

### Safety / Trust Constraints
**Инвариант 3 (raw score только сервер), Инвариант 10 (не social credit, нет негативных публичных ярлыков).**

### Screens Needed
Profile Trust Badge Area, Admin Trust Events, Internal Trust Detail.

---

## FLOW-024 — User Delete / Privacy Request Flow

### Purpose
Дать пользователю запросить экспорт/удаление данных с учётом safety-retention.

### Primary Role
User, System

### Related Stories
US-PROF-06, US-SAFE-09 (audit retention), privacy by design (PRD §18)

### Entry Points
Profile → Settings → Privacy.

### Preconditions
`onboarded`/аутентифицирован.

### Main Flow
1. **Open privacy** — User: Settings → Privacy; System: опции export/delete; Screen: Settings → Privacy; Data: account; Safety: понятная privacy (Инвариант 7).
2. **Request export/delete** — User: выбирает; System: подтверждение + объяснение retention; Screen: Data Export / Delete Account; Data: request; Safety: safety/audit-записи могут иметь иную retention.
3. **Confirm** — User: подтверждает; System: запускает процесс; Screen: Confirmation; Data: job; Safety: reports/audit logs хранятся по политике (OD-9).
4. **Complete** — System: экспорт готов / аккаунт удалён (с сохранением необходимых safety-записей); Screen: Confirmation; Data: result; Safety: pending-заявки аннулируются (§8 edge #8).

### Decision Points
Retention reports/audit/safety records → **Open Product Decision (OD-9)**. Что именно сохраняется при удалении (safety-минимум) → связано с OD-9.

### Alternate Flows
Отмена запроса до завершения (по политике).

### Error / Edge Cases
Удаление при pending заявке → заявка аннулируется, safety-данные сохраняются по retention. Активные обязательства host (предстоящее событие) → политика (Open Question).

### Exit States
Export доставлен · Аккаунт удалён (safety-записи по retention) · Запрос отменён.

### Analytics Events
`privacy_request_created`, `account_deleted` (без PII в свойствах).

### Safety / Trust Constraints
Инвариант 4 (audit/safety retention сохраняется), Инвариант 7 (privacy понятна), privacy by design.

### Screens Needed
Settings, Privacy, Data Export, Delete Account, Confirmation.

---

# 7. Screen Inventory

## Mobile Screens

| Screen | Purpose | Primary Role | Key Data | Primary Actions | Safety Notes |
|--------|---------|--------------|----------|-----------------|--------------|
| Welcome | Точка входа | Guest | Бренд, CTA | Signup/Login | Нет protected данных |
| Login | Вход | Guest | — | Авторизация | Anti-enumeration ошибок |
| Signup | Регистрация | Guest | email/provider | Создать аккаунт | Invite-only enforced |
| Invite Code | Ввод кода беты | Guest | invite code | Валидировать | Контроль доступа |
| Waitlist | Лист ожидания | Guest | контакт | Записаться | Минимум PII |
| Onboarding Welcome | Объяснить продукт | User | позиционирование | Далее | Anti-dating |
| Safety Principles | Правила безопасности | User | safety rules | Принять | Инвариант 7, acceptance фиксируется |
| Basic Profile | Базовый профиль | User | имя, возраст/age range | Сохранить | Privacy by design, <18 блок |
| City Selection | Город | User | beta cities | Выбрать | Город, не точная локация |
| Interests | Интересы | User | interests | Выбрать | Соц. контекст |
| Vibe Tags | Vibe | User | tags | Выбрать | Нет attractiveness |
| Intent Selection | Соц. намерение | User | intent | Выбрать | Non-romantic |
| Photo Upload | Фото | User | photo | Загрузить | AI moderation |
| Phone Verification | Верификация | User | phone | Подтвердить | Trust-сигнал (OD-1) |
| Profile Preview | Превью профиля | User | non-approved view | Завершить | Completeness внутр. |
| Onboarding Complete | Завершение | User | — | В app | Гейт снят |
| Home / Discover | Лента событий | User | events (approx) | Фильтр/открыть | Инвариант 1/9 |
| Filters | Фильтры | User | category/date | Применить | Только MVP-категории |
| Event Detail | Детали события | User/Host | event (по статусу) | Apply/Report | Location gating §9 |
| Apply Modal | Подача заявки | User | note | Отправить | Гейты onboarding/verif |
| Application Pending | Статус заявки | User | status | Cancel | Pending → approx area |
| Event Detail Approved | Approved-вид | User | exact location | Чат/инструкции | Инвариант 1 (только здесь) |
| Create Event | Создание | Host | event draft | Заполнить | Location split |
| Event Preview | Превью события | Host | non-approved view | Publish | Не утекает exact |
| Hosted Event Dashboard | Управление | Host | заявки/статус | Review/Cancel | Ограничено своим событием |
| Applications List | Список заявок | Host | applications | Открыть | Safe profile only |
| Applicant Detail | Заявка | Host | safe profile+note | Approve/Reject/WL | Нет raw trust/sensitive |
| Event Chat | Чат события | User/Host | messages | Send/Report | Инвариант 2, only approved |
| Notifications | Уведомления | User/Host | notifications | Открыть | Без exact в payload |
| My Events | Мои события | User/Host | attending/hosted | Открыть | Статусы явные |
| My Profile | Свой профиль | User | profile/badges | Edit | Нет raw trust score |
| Edit Profile | Редактирование | User | editable fields | Save | Контент → moderation |
| Public Profile | Safe-профиль | User/Host | safe fields/badges | Report/Block | Нет sensitive/raw trust |
| Report User | Жалоба на юзера | User | reason | Submit | Инвариант 6, no retaliation |
| Report Event | Жалоба на событие | User | reason | Submit | Инвариант 6 |
| Report Message | Жалоба на сообщение | User | snapshot | Submit | Контекст сохраняется |
| Block User | Блокировка | User | target | Confirm | Прекращает взаимодействие |
| Settings | Настройки | User | account | Privacy/Logout | — |
| Privacy | Приватность | User | data options | Export/Delete | Retention (OD-9) |
| Delete Account | Удаление | User | confirm | Delete | Safety-retention |

## Admin Screens

| Screen | Purpose | Role | Key Data | Primary Actions | Safety Notes |
|--------|---------|------|----------|-----------------|--------------|
| Admin Login | Вход в админку | Admin | admin session | Login | Web только admin |
| Moderation Queue | Очередь модерации | Admin | reports+priority | Filter/Open | AI assistive |
| Report Detail | Детали жалобы | Admin | report context | Take action | Серьёзное → причина |
| User Detail | Пользователь | Admin | history/trust/flags | Restrict/Ban | Trust admin-only |
| Event Detail (admin) | Событие | Admin | full event+exact | Remove/Cancel | Доступ к exact логируется |
| Message Detail | Сообщение | Admin | snapshot+thread | Hide/Action | Контекст при удалении |
| Suspicious Activity | Подозр. активность | Admin | flags | Review | Не финальный enforcement |
| Audit Logs | Аудит | Admin | log entries | View/Filter | Инвариант 4, retention OD-9 |
| Action Modal | Применить действие | Admin | action+reason | Confirm | Serious → human + log |

---

# 8. State-specific Screen Variants

### Event Detail Variants
| Variant | Что видно | Location | Chat |
|---------|-----------|----------|------|
| not applied | safe event, Apply CTA | approx area | нет |
| pending | статус «на рассмотрении» | approx area | нет |
| waitlisted | статус «в листе ожидания» | approx area | нет |
| approved | полные детали + инструкции | **exact** | да |
| rejected | мягкий статус «отклонён» | никогда exact | нет |
| full | «мест нет» + waitlist offer | approx area | нет |
| cancelled | «событие отменено» | не раскрывается | frozen/read-only |
| removed for safety | «событие недоступно» | не раскрывается | frozen |
| host view | управление + exact | exact (owner) | да (host) |

### Profile Variants
| Variant | Что видно |
|---------|-----------|
| own profile | свои поля, soft-бейджи, completeness-подсказка, **без raw score** |
| public safe profile | safe-поля + бейджи, без sensitive/internal |
| blocked user | ограниченный/скрытый вид, взаимодействие отключено |
| restricted user | помечен (admin-context); публично без негативных ярлыков |
| moderation pending | контент/фото на модерации (плейсхолдер/статус) |

### Chat Variants
| Variant | Поведение |
|---------|-----------|
| active | чтение/запись для approved |
| frozen | read-only, баннер «заморожен» |
| post-event expiring | ограниченное окно (OD-4), таймер/баннер |
| no access | rejected/waitlisted/pending → нет доступа |
| removed user | удалённый участник теряет доступ к чату/истории по политике |

### Onboarding Variants
| Variant | Поведение |
|---------|-----------|
| first time | полный flow с начала |
| resumed | вход на первый незавершённый шаг, данные сохранены |
| missing required fields | подсветка обязательных (OD-5) |
| moderation pending | фото/текст на модерации, onboarding можно завершить, apply гейтится |
| phone verification required | гейт на apply/approval (OD-1) |

---

# 9. Location Privacy Matrix

| User State | Event Visibility | Location Visibility | Chat Access | Attendee Visibility | Actions Available |
|------------|------------------|---------------------|-------------|---------------------|-------------------|
| guest | ❌ нет | ❌ нет | ❌ | ❌ | Signup/Login/Waitlist |
| authenticated_not_onboarded | ❌ нет | ❌ нет | ❌ | ❌ | Только onboarding |
| onboarded | ✅ list | approx area | ❌ | ❌ (или агрегат, OD-12) | Discover/Apply/Report/Block |
| applied_pending | ✅ detail | approx area | ❌ | ❌ | Cancel application/Report/Block |
| waitlisted | ✅ detail | approx area | ❌ | ❌ | Wait/Cancel/Report/Block |
| approved | ✅ full | ✅ **exact**/instructions | ✅ | ✅ (event scope, OD-12) | Chat/Attend/Report/Block |
| rejected | ✅ limited | ❌ никогда exact | ❌ | ❌ | Report/Block |
| blocked | ❌ скрыто/недоступно | ❌ | ❌ | ❌ | — |
| restricted | ограничено по политике | по статусу заявки | ограничено | ограничено | ограниченный набор |
| banned | ❌ нет доступа | ❌ | ❌ | ❌ | ❌ (нет взаимодействия) |
| host | ✅ свои события | ✅ exact (свои) | ✅ (свои) | ✅ (свои attendees) | Manage/Approve/Cancel |
| admin | ✅ все | ✅ exact (logged) | ✅ (модерация) | ✅ | Moderate (audit log) |

**Гарантии:** exact location — только `approved`/`host`/`admin`; `rejected`/`waitlisted`/`pending` никогда не видят exact; `guest`/`not_onboarded` не видят события; `banned` не взаимодействует. Никогда не показывается точная live-локация пользователя (Инвариант 9).

---

# 10. Safety-critical Flow Checks

- [x] No open DMs in any flow (только event chat — FLOW-012; нет DM-механизма) — Инвариант 2
- [x] No exact location before approval (FLOW-007/009/011; §9) — Инвариант 1
- [x] No raw trust score visible (FLOW-004/005/023) — Инвариант 3
- [x] No public negative labels (FLOW-015/023; §8 variants) — Инвариант 10
- [x] No public ratings (нет такого экрана/действия; §7) — Инвариант 10
- [x] Report/block accessible from profile/event/chat (FLOW-005/012/016/017/018/019) — Инвариант 6
- [x] Moderation actions logged (FLOW-014/020/021/022) — Инвариант 4
- [x] AI not final judge for serious actions (FLOW-020/021/022) — Инвариант 5
- [x] Unsafe content can be flagged (FLOW-003/004/008/012/017/018)
- [x] Blocked users cannot interact (FLOW-019; §9)
- [x] Banned users cannot interact (FLOW-001; §9; US-SAFE-12)
- [x] Notifications do not leak sensitive location (FLOW-011/013/014) — Инвариант 1/9
- [x] Attendee visibility respects state (§8/§9; OD-12)
- [x] Exact user live location is never shown (§9) — Инвариант 9

---

# 11. Analytics Event Map

| Flow ID | Step | Analytics Event | Trigger | Properties | Privacy Notes |
|---------|------|-----------------|---------|------------|---------------|
| FLOW-001 | Start signup | `signup_started` | Открыт signup | method | Без PII |
| FLOW-001 | Account created | `signup_completed` | User создан | method | — |
| FLOW-001 | Login | `login_completed` | Успешный вход | method | — |
| FLOW-002 | Invite used | `invite_code_used` | Код применён | code_id | Без раскрытия владельца |
| FLOW-002 | Waitlist | `waitlist_joined` | Запись в waitlist | city | Минимум PII |
| FLOW-003 | Start | `onboarding_started` | Открыт onboarding | — | — |
| FLOW-003 | Complete | `onboarding_completed` | Onboarding завершён | — | — |
| FLOW-003 | Profile done | `profile_completed` | Completeness достигнута | completeness_bucket | Не число публично |
| FLOW-004 | Save | `profile_updated` | Профиль сохранён | fields_changed | Без значений PII |
| FLOW-006 | Discover open | `event_discovery_viewed` | Открыт Discover | city, filters | Без exact location |
| FLOW-006 | Filter | `event_filter_applied` | Применён фильтр | category, date | — |
| FLOW-006/007 | View event | `event_viewed` | Открыт Event Detail | event_id, state | Без exact location |
| FLOW-008 | Create start | `event_create_started` | Начато создание | — | — |
| FLOW-008 | Publish | `event_published` | Событие опубликовано | event_id, category | Без exact location |
| FLOW-009 | Apply start | `application_started` | Нажат Apply | event_id | — |
| FLOW-009 | Apply submit | `application_created` | Заявка создана | event_id | Без note-содержимого |
| FLOW-010 | Approve | `application_approved` | Host approve | event_id | — |
| FLOW-010 | Reject | `application_rejected` | Host reject | event_id | Без причины-текста |
| FLOW-012 | Chat open | `event_chat_opened` | Открыт чат | event_id | — |
| FLOW-012 | Message | `chat_message_sent` | Сообщение отправлено | event_id | Без содержимого |
| FLOW-016/17/18 | Report | `report_created` | Жалоба отправлена | type | Без содержимого PII |
| FLOW-019 | Block | `block_created` | Блок создан | — | Без раскрытия цели публично |
| FLOW-020/21 | Mod action | `moderation_action_taken` | Admin действие | action_type | Связь с audit log |
| FLOW-015 | Completed | `event_completed` | Событие завершено | event_id | — |
| FLOW-015 | Attendance | `attendance_confirmed` | Подтверждено посещение | event_id | — |
| FLOW-015 | No-show | `no_show_recorded` | Зафиксирован no-show | event_id | Только агрегат, без ярлыка |

> Общий принцип: события **не** содержат точную локацию, содержимое сообщений/note и числовой trust score (privacy by design, PRD §16/§18; Инвариант 3/9).

---

# 12. Figma Preparation Notes

| Приоритет | Flow(s) | Прототипировать first | Обязательные состояния | Safety cues | Clickable в Figma |
|-----------|---------|-----------------------|------------------------|-------------|-------------------|
| 1 | Onboarding (FLOW-003) | Welcome → Safety Principles → Basic Profile → Photo → Preview → Complete | first time, resumed, moderation pending, phone verification required | Safety Principles экран, «не dating», acceptance | Да (полный happy path + resume) |
| 2 | Event Discovery (FLOW-006) | Home/Discover, Event Card, Filters, Empty State | список, empty, filtered-empty | «approximate area», без map pin | Да |
| 3 | Event Detail (FLOW-007) | Event Detail Public, Approved, Rejected, Full, Cancelled | not applied, pending, approved, rejected, full, cancelled, host | location gating, approval-требование | Да (переключение вариантов) |
| 4 | Apply / Approval (FLOW-009/011) | Apply Modal, Application Pending, Approval Notification, Approved Detail | pending, verification required, approved, exact reveal | exact только в approved detail, payload без локации | Да |
| 5 | Host Application Review (FLOW-010) | Hosted Dashboard, Applications List, Applicant Detail, Approve/Reject | pending list, approve, reject, waitlist | safe profile only, no raw trust | Да |
| 6 | Event Creation (FLOW-008) | Create Start → Category → Details → Location Setup → Exact → Preview → Publish | draft, pending_review, live | approximate vs exact split, preview без exact | Да |
| 7 | Event Chat (FLOW-012) | Event Chat, Message Actions, Report Message, Frozen, Post-event | active, frozen, post-event expiring, no access | only approved, report доступен | Да |
| 8 | Report / Block (FLOW-016..019) | Report User/Event/Message, Block Confirmation | reason, submitted, blocked | доступность из profile/event/chat | Да |
| 9 | Admin Moderation (FLOW-020..022) | Admin Login, Moderation Queue, Report Detail, Action Modal, Audit Log | queue, detail, action, logged | AI assistive label, reason required, audit | Да (web prototype) |

Общие Figma-заметки: показывать статус-лейблы явно; safety-баннеры (location hidden / chat after approval); calm UX без агрессивных CTA; copy не должен звучать как dating.

---

# 13. Open UX Questions

| # | Вопрос | Затронутые flows | Связь |
|---|--------|------------------|-------|
| OD-1 | В какой момент обязательна phone verification (apply vs approval)? | FLOW-003, 009 | PRD OD-1 / US-AUTH-05 |
| OD-6 | Минимальный profile completeness для apply? | FLOW-003, 009 | PRD OD-6 |
| OD-3 | Видит ли host все фото/age range applicant? | FLOW-010, 005 | PRD OD-3 |
| OD-12 | Видит ли approved attendee список всех approved до события? | FLOW-007, §8/§9 | PRD OD-12 |
| Q-RJ | Когда показывать exact location: сразу после approval или ближе к старту? | FLOW-011 | PRD §12 |
| OD-4 | Сколько времени открыт post-event chat? | FLOW-012, 015 | PRD OD-4 |
| Q-RJ2 | Можно ли user отменить approved participation и последствия? | FLOW-009, 015 | PRD §11 |
| OD-8 | Как host отмечает attendance? | FLOW-015 | PRD OD-8 |
| Q-DISP | Как user оспаривает no-show (dispute/appeal)? | FLOW-015, 021 | PRD §11 / Open |
| OD-13 | Нужно ли manual review всех событий в beta? | FLOW-008 | PRD OD-13 |
| Q-REJ-TONE | Как показать rejected state без ощущения harsh rejection? | FLOW-007, 010 | PRD §20.2 |
| Q-SAFE-COPY | Как объяснить safety rules без friction? | FLOW-003 | PRD §6.2 |
| Q-BADGE | Где именно показывать trust badges? | FLOW-005, 023 | PRD §14.2 |
| Q-DATING-COPY | Как избежать dating perception в UI copy? | FLOW-003, 005, 006 | Core «не dating» |
| Q-BLK | Обратим ли block (unblock) в MVP? | FLOW-019 | PRD §13.2 |
| Q-APPEAL | Есть ли appeal flow для restrict/ban? | FLOW-021 | Open |

---

# 14. Summary

- Документ переводит user stories (документ 02) в практические **UX-флоу** (FLOW-001…024) с decision points, edge cases, exit states, analytics и safety constraints.
- Ключевой loop: **Discover → Apply → Approve → Attend → Reconnect**, обслуживается всеми flows.
- Safety-инварианты встроены в каждый flow (no open DMs, no raw trust score, no public ratings/labels, report/block везде, audit log, AI не judge).
- **Location privacy — critical system rule**: §9-матрица фиксирует, что exact location доступна только `approved`/`host`/`admin`.
- Есть Screen Inventory, State-specific Variants, Location Privacy Matrix, Analytics Event Map, Figma Preparation Notes; нерешённые развилки — в §13.
- **Следующий документ:** [`/docs/04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md).

> Напоминание: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth; PRD и User Stories ему подчинены, эти flows — им.
