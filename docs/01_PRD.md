# PRD v1 — Social Events App

> **Status:** v1 (draft for closed beta)
> **Owner:** Product
> **Last updated:** 2026-05-18
> **First source of truth:** [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md)

> ⚠️ Этот PRD подчинён Product Core. При любом конфликте между этим документом и
> [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) приоритет имеет Product Core.
> Нерешённые вопросы вынесены в раздел [21. Open Product Decisions](#21-open-product-decisions), а не «додуманы» молча.

---

## 1. Product Summary

Мы строим **mobile-first приложение для безопасных офлайн-встреч** между незнакомыми людьми.

Ключевые свойства продукта:

- **Mobile-first** — iOS + Android (web только для admin).
- **Безопасные офлайн-встречи** — небольшие реальные встречи в городе, а не онлайн-нетворкинг.
- **Небольшой social event loop** — продукт обслуживает один цикл: Discover → Apply → Approve → Attend → Reconnect.
- **Approval-based participation** — host явно подтверждает участников; approval это фича, а не баг.
- **Trust & safety как core product layer** — privacy, верификация, модерация и trust-сигналы встроены в продукт, а не «прикручены сбоку».

Это **не event-календарь** и **не dating app**. Это:

> **Trust infrastructure for modern social connection.**

MVP должен доказать **одну вещь**: что люди готовы безопасно знакомиться через маленькие офлайн-события и возвращаться за этим повторно.

---

## 2. Problem Statement

Современным городским людям сложно создавать новые **офлайн-социальные связи**.

Причины:

- **Dating apps не подходят** для дружеских/social связей: вся динамика заточена под романтический мэтчинг и «оценку» людей.
- **Большие мероприятия не дают intimacy и safety**: толпа, анонимность, нет контекста, кто рядом.
- **Знакомство с незнакомыми людьми кажется рискованным**: непонятно, кто придёт, безопасно ли это, особенно для тех, кто осторожен.
- **Мало trusted context**: нет лёгкого способа понять, кто организатор и кто остальные участники.
- **После переезда или смены окружения трудно находить «своих»**: старые соц-связи не масштабируются на новый город.
- **Open social networks вызывают fatigue, spam и creepiness**: открытые DM, холодные сообщения, навязчивость, отсутствие границ.

**Вывод:** нужен продукт, где знакомство происходит через **маленькое реальное событие с контекстом и контролем**, а безопасность — часть пользовательского опыта, а не настройка в глубине меню.

---

## 3. Target Audience

### 3.1 Основной ICP

Городские люди **22–38 лет**, которые:

- хотят новых офлайн-знакомств;
- не хотят dating-app dynamics;
- предпочитают маленькие встречи большим;
- ценят safety и privacy;
- готовы пройти onboarding и лёгкую верификацию;
- хотят social context **до** встречи (кто host, кто идёт, что за формат).

### 3.2 User Personas

#### Persona 1 — New-in-city (Алина, 27)

| Поле | Описание |
|------|----------|
| Контекст | Переехала в новый город по работе 2 месяца назад, почти нет знакомых. |
| Мотивация | Найти круг общения, не связанный с работой; «начать жизнь заново». |
| Страхи / барьеры | Идти к незнакомым людям страшно; не хочет, чтобы это выглядело как dating; боится навязчивых сообщений. |
| Success | Сходила на 2–3 встречи за месяц, появились 1–2 человека, с которыми хочется встретиться снова. |

#### Persona 2 — Tired of dating apps (Марк, 31)

| Поле | Описание |
|------|----------|
| Контекст | Активно общается, но выгорел от dating-приложений и свайпов. |
| Мотивация | Социальные, не романтические связи; общие интересы (настолки, прогулки, кофе). |
| Страхи / барьеры | Боится, что это «очередной Tinder»; не хочет, чтобы его профиль оценивали по фото. |
| Success | Продукт ощущается как social, а не dating; находит людей по vibe/интересам. |

#### Persona 3 — Casual host (Дина, 29)

| Поле | Описание |
|------|----------|
| Контекст | Любит собирать небольшие компании: ужин, бранч, настолки. |
| Мотивация | Организовывать встречи без хаоса; контролировать, кто придёт. |
| Страхи / барьеры | Не хочет случайных или небезопасных людей; боится no-show; не хочет много мороки. |
| Success | Легко создаёт событие, спокойно отбирает участников, встреча проходит хорошо, делает её повторно. |

#### Persona 4 — Safety-conscious attendee (Ника, 24)

| Поле | Описание |
|------|----------|
| Контекст | Хочет знакомиться, но крайне осторожна по части безопасности. |
| Мотивация | Реальные связи с минимальным риском. |
| Страхи / барьеры | Раскрытие точного адреса/локации; навязчивые личные сообщения; непонятно, кто организатор. |
| Success | Видит, что location скрыт до approval, есть верификация, можно быстро report/block; чувствует контроль. |

#### Persona 5 — Community builder (Тимур, 35)

| Поле | Описание |
|------|----------|
| Контекст | Регулярно собирает людей вокруг интересов, неформальный «соединитель». |
| Мотивация | Растить здоровое локальное комьюнити через повторяющиеся встречи. |
| Страхи / барьеры | Низкое качество участников; токсичность; нет инструментов модерации события. |
| Success | Есть инструменты host-контроля и модерации; участники возвращаются; формируется ядро комьюнити. |

---

## 4. Product Principles

1. **Trust before scale.** Сначала доверие и безопасность, потом рост. Не жертвуем trust ради метрик роста.
2. **Safety is part of UX.** Безопасность видна и понятна пользователю, а не спрятана в admin-инструментах.
3. **Context before messaging.** Сообщения возможны только при общем контексте (событие / shared context), не «холодные» DM.
4. **Approval is a feature, not friction.** Host-контроль над участием — ключевая trust-механика, а не препятствие.
5. **Exact location is private until approval.** Точное место раскрывается только approved-участникам.
6. **No raw social scoring.** Никаких публичных числовых рейтингов людей; trust score — внутренний.
7. **AI assists moderation but does not replace human judgment.** AI флагает и приоритизирует; серьёзный enforcement — за человеком.
8. **Small events first.** Маленькие встречи дают intimacy и безопасность; никакого массового event-маркетплейса в MVP.
9. **Real-world connection over engagement addiction.** Цель — офлайн-связи, а не максимизация времени в приложении.
10. **MVP proves one loop, not every use case.** Делаем один цикл хорошо, не пытаемся покрыть всё.

---

## 5. Core Product Loop

> **Discover → Apply → Approve → Attend → Reconnect**

### 5.1 Discover

| Аспект | Описание |
|--------|----------|
| Цель пользователя | Найти подходящее небольшое событие рядом. |
| Системное поведение | Лента/список событий, фильтр по городу/категории; показывается только approximate area, не точный адрес. |
| Ключевые экраны | Home / Discovery, Event Detail (ограниченный вид). |
| Ключевые риски | Утечка точной локации; показ событий не-onboarded или banned пользователям; «creepy» события. |
| Safety / trust | Location privacy logic; видны soft trust-бейджи host; report/block доступны. |

### 5.2 Apply

| Аспект | Описание |
|--------|----------|
| Цель пользователя | Подать заявку с коротким контекстом о себе. |
| Системное поведение | Создаётся `EventApplication` в статусе `pending`; опциональная application note; проверка onboarding и (при необходимости) phone verification. |
| Ключевые экраны | Event Detail, Apply (note), Applications. |
| Ключевые риски | Заявки от неверифицированных/подозрительных пользователей; spam-заявки (velocity). |
| Safety / trust | Гейт по onboarding/verification; velocity limits; AI-флаг текста заявки. |

### 5.3 Approve

| Аспект | Описание |
|--------|----------|
| Цель пользователя (host) | Отобрать подходящих участников, чувствовать контроль и безопасность. |
| Системное поведение | Host видит safe-профиль applicant и note; переводит заявку в `approved` / `rejected` / `waitlisted`. |
| Ключевые экраны | Host Review, Applications. |
| Ключевые риски | Раскрытие чувствительных полей профиля; дискриминационное поведение; ошибочный approve опасного юзера. |
| Safety / trust | Только safe-профиль (см. Open Decision); approval открывает location и chat; soft trust-бейджи помогают решению. |

### 5.4 Attend

| Аспект | Описание |
|--------|----------|
| Цель пользователя | Прийти на встречу и почувствовать себя безопасно. |
| Системное поведение | Approved-участники видят точное место/инструкции; event chat активен; статусы переходят `live → starting_soon → in_progress → completed`. |
| Ключевые экраны | Event Detail (full), Event Chat, My Events, Notifications. |
| Ключевые риски | No-show; небезопасное поведение на месте; harassment в чате. |
| Safety / trust | Report/block из чата и attendee list; no-show tracking; AI harassment detection. |

### 5.5 Reconnect

| Аспект | Описание |
|--------|----------|
| Цель пользователя | Сохранить связь с теми, с кем была реальная встреча. |
| Системное поведение | Post-event limited chat в течение ограниченного окна (см. Open Decision); host post-event feedback; запись attendance в trust. |
| Ключевые экраны | Event Chat (post-event), My Events. |
| Ключевые риски | Превращение в open DM; навязчивость после события; «who viewed me» паттерны. |
| Safety / trust | Reconnect только при shared context (реальное совместное участие); никаких open DMs; блок прекращает любую связь. |

---

## 6. MVP Scope

Приоритеты модулей наследуются из Product Core: **Trust → Safety → Offline loop → Host control → Discovery → Contextual messaging → Intelligence later.**

### 6.1 Auth

**Функции:** email auth; Google login; Apple login; phone verification; session management; protected routes.

**Зачем:** идентичность — фундамент trust; верификация снижает creep/spam; protected routes защищают весь loop.

**Acceptance criteria:**
- Пользователь может зарегистрироваться/войти через email, Google, Apple.
- Сессии управляются безопасно (refresh, logout, истечение).
- Все экраны, кроме landing/auth, закрыты для неаутентифицированных.
- Phone verification доступна и требуется до apply или до approval (точная точка — Open Decision).

### 6.2 Onboarding

**Функции:** welcome; basic profile; city; interests; vibe tags; intent; photos; safety rules acceptance.

**Зачем:** создаёт контекст и safety-понимание до доступа к людям и событиям.

**Acceptance criteria:**
- Пользователь **не может** получить доступ к событиям до завершения обязательного onboarding.
- Загрузка фото инициирует moderation.
- Пользователь принимает safety rules (явный acceptance, фиксируется).
- Profile completeness рассчитывается и сохраняется.

### 6.3 Profiles

**Функции:** profile view; edit profile; photos; interests; vibe tags; privacy settings; verification status; profile completeness.

**Зачем:** профиль = социальный контекст без dating-механик.

**Acceptance criteria:**
- Пользователь может редактировать профиль и управлять privacy-настройками.
- Публичный/safe-профиль не раскрывает чувствительные поля.
- Raw trust score **никогда** не показывается; только soft-бейджи.
- Профиль можно report/block из profile view.

### 6.4 Events

**Функции:** create / edit / cancel event; categories; capacity; approval required; waitlist; discovery; event detail; safe location reveal.

**Зачем:** событие — единица social loop и контейнер safety/контекста.

**Acceptance criteria:**
- Non-approved пользователи **никогда** не видят точную локацию.
- Host управляет заявками (approve/reject/waitlist).
- Событие имеет lifecycle-статус (см. §10).
- Событие можно report; admin может удалить unsafe-событие (`removed_for_safety`) с audit log.

### 6.5 Applications

**Функции:** apply to event; application note; pending state; approve/reject; waitlist; attendee management.

**Зачем:** approval-based participation — ключевая trust-механика.

**Acceptance criteria:**
- Подать заявку может только onboarded пользователь (и прошедший verification к нужной точке).
- Host может approve/reject/waitlist.
- Rejected пользователь **никогда** не видит точную локацию.
- Approved пользователь получает доступ к event chat.
- Статус заявки явно понятен и user, и host.

### 6.6 Messaging

**Функции:** event chat; только approved attendees; system messages; message reporting; post-event limited chat.

**Зачем:** коммуникация только в контексте, без open DMs.

**Acceptance criteria:**
- **Нет open DMs** ни в каком виде.
- Только approved-участники читают/пишут в event chat.
- Заблокированные пользователи не могут взаимодействовать друг с другом.
- Зарепорченные сообщения попадают в moderation queue.
- Post-event chat ограничен по времени (окно — Open Decision).

### 6.7 Safety

**Функции:** report user; report event; report message; block user; moderation queue; admin actions; audit logs; basic AI moderation.

**Зачем:** safety baseline для всего продукта.

**Acceptance criteria:**
- Report/block доступны из profile, event detail, event chat, attendee list.
- Все moderation-sensitive действия пишут audit log.
- Серьёзный enforcement доступен для human/admin review.
- Небезопасные пользователи могут быть restricted или banned.

### 6.8 Trust

**Функции:** verification states; profile completeness; attendance reliability; no-show tracking; host feedback; internal trust score; public trust badges.

**Зачем:** trust-слой питает safety и качество loop.

**Acceptance criteria:**
- Raw trust score — только внутренний.
- Публичные сигналы — мягкие и нечисловые (Verified, Reliable attendee, Hosted before, Attended events).
- Trust помогает safety, **не** становится публичным рейтингом / social credit.

### 6.9 Beta

**Функции:** invite-only access; waitlist; feature flags; analytics; crash monitoring; privacy policy; terms.

**Зачем:** контролируемый запуск с безопасностью и измеримостью.

**Acceptance criteria:**
- Доступ ограничивается инвайтами; есть waitlist.
- Feature flags позволяют управлять бетой.
- Analytics установлены и работают **до** запуска.
- Safety dashboard / moderation queue работают **до** входа внешних пользователей.
- Privacy policy и Terms существуют и доступны.

---

## 7. Explicit Non-Goals (MVP)

| Не делаем в MVP | Почему |
|-----------------|--------|
| Payments | Усложняет trust/safety и фокус; не нужно для доказательства loop. |
| Tickets | Логистика платежей/возвратов вне core loop. |
| Paid events | Меняет мотивацию и вносит fraud-риски. |
| Open DMs | Прямое нарушение Инварианта 2 (no open DMs). |
| Dating mechanics | Продукт не dating app; ломает позиционирование. |
| Public followers | Создаёт статус-гонку и creepiness. |
| Public user ratings | Нарушает «no raw social scoring» (Инвариант 10). |
| Exact public map pins | Нарушает location privacy (Инвариант 1/9). |
| Live location | Нарушает «no exact user location» (Инвариант 9). |
| Advanced AI matching | Intelligence только после реальных данных использования. |
| Premium hosts | Монетизация и привилегии вне MVP-фокуса. |
| Monetization | Не нужна для проверки гипотезы; усложняет всё. |
| Business networking | Другая аудитория и динамика; вне ICP. |
| Nightlife / party mechanics | Другой риск-профиль безопасности. |
| Large public event marketplace | Противоречит «small events first». |
| Communities/circles, recurring memberships | За пределами одного MVP-loop. |

Любое из этого можно добавить **только** через явный product decision и обновление Product Core.

---

## 8. User Roles

### 8.1 Guest / Visitor

- **Может:** видеть landing; зарегистрироваться; войти.
- **Не может:** видеть события; создавать события; подаваться; писать сообщения; видеть профили участников.
- **Экраны:** Welcome, Auth.
- **Ограничения:** нет доступа к loop до регистрации + onboarding.

### 8.2 User

- **Может:** пройти onboarding; создать/редактировать профиль; смотреть события; подаваться; участвовать в чатах approved-событий; report/block; управлять privacy.
- **Не может:** видеть точную локацию до approval; писать open DMs; видеть raw trust score; видеть admin-инструменты.
- **Экраны:** Onboarding, Home/Discovery, Event Detail, My Events, Applications, Event Chat, Profile, Edit Profile, Notifications, Report/Block, Settings.
- **Ограничения:** location/chat-доступ зависит от application status.

### 8.3 Host

- **Может:** всё, что User, плюс создавать/редактировать/отменять события; управлять заявками (approve/reject/waitlist); видеть attendee list; отправлять updates; модерировать своё событие; оставлять post-event feedback.
- **Не может:** банить пользователей платформенно; видеть raw trust score; видеть глобальные audit logs/admin tools; раскрывать чужую точную локацию вне правил.
- **Экраны:** всё из User + Create Event, Host Review, Event management.
- **Ограничения:** host-полномочия ограничены своим событием.

### 8.4 Admin / Moderator

- **Может:** видеть reports; модерировать пользователей и события; банить/ограничивать; смотреть audit logs; проверять suspicious activity; удалять unsafe-события; управлять moderation queue.
- **Не может:** действовать без записи в audit log; делать AI единственным основанием для серьёзного enforcement.
- **Экраны (admin dashboard, web):** Login, Moderation Queue, Reports, User Detail, Event Detail, Moderation Actions, Audit Logs, Suspicious Activity.
- **Ограничения:** все серьёзные действия логируются и обратимо/прозрачно ревьюабельны.

---

## 9. Event Categories

**Поддерживаются в MVP:**

- Coffee / Casual meetup
- Dinner / Brunch
- Walk / City exploring
- Board games
- Light sports
- Creative session
- Community hangout

**Не поддерживаются в MVP (явно):**

- Nightlife
- Parties
- Dating events
- Business networking
- Paid workshops
- Large public events

Категории — фиксированный enum в MVP; расширение требует product decision.

---

## 10. Event Lifecycle

```
draft → pending_review → live → full → starting_soon → in_progress → completed → archived
```

Terminal: `cancelled_by_host`, `cancelled_by_admin`, `removed_for_safety`.

| Статус | Значение | Кто переводит | Доступные действия | Safety implications |
|--------|----------|---------------|--------------------|---------------------|
| `draft` | Создаётся, не опубликовано | Host | Редактирование; submit на review | Не видно никому, кроме host |
| `pending_review` | Ждёт авто/ручной проверки | System / AI / Admin | Approve→live, или block | AI-флаг текста; admin может отклонить |
| `live` | Опубликовано, принимает заявки | System (после review) | Apply; host approve/reject | Discovery показывает только approximate area |
| `full` | Достигнута capacity | System | Waitlist; host управляет заявками | Новые заявки → waitlist |
| `starting_soon` | Скоро старт | System (по времени) | Финальные апдейты; chat активен | Approved видят точное место |
| `in_progress` | Идёт встреча | System (по времени) | Chat; report/block | Повышенное внимание модерации |
| `completed` | Завершилось | System | Post-event chat (окно); feedback | Attendance/no-show фиксируются |
| `archived` | Архив | System | Read-only | Данные хранятся по retention-политике |
| `cancelled_by_host` | Отменено host | Host | Уведомление участникам | Location больше не раскрывается |
| `cancelled_by_admin` | Отменено admin | Admin | Уведомление; audit log | Логируется как moderation action |
| `removed_for_safety` | Удалено по безопасности | Admin | Скрыто; audit log | Обязательный audit log; участники уведомлены безопасно |

---

## 11. Application Lifecycle

```
pending → approved | rejected | waitlisted | cancelled_by_user → attended | no_show
```

| Статус | Значение | Кто меняет | Видит user | Видит host | Location access | Chat access |
|--------|----------|------------|------------|------------|-----------------|-------------|
| `pending` | Заявка подана, ждёт решения | User (создал) | «На рассмотрении» | Safe-профиль + note | Approximate area | Нет |
| `approved` | Host принял | Host | «Принят» + детали | В attendee list | **Точное место/инструкции** | **Да (event chat)** |
| `rejected` | Host отклонил | Host | «Отклонён» (мягко) | Решение зафиксировано | **Никогда точное** | Нет |
| `waitlisted` | В листе ожидания | Host / System | «В листе ожидания» | В waitlist | Approximate area | Нет |
| `cancelled_by_user` | Юзер отозвал заявку | User | «Отменено вами» | Виден как отменённый | Approximate area | Нет |
| `attended` | Подтверждено присутствие | Host / System | «Вы посетили» | Отмечен attended | Точное (исторически) | Post-event (окно) |
| `no_show` | Не пришёл, хотя approved | Host / System | «Отмечен no-show» | Отмечен no-show | — | Нет |

Метод подтверждения attended/no_show — см. Open Decision.

---

## 12. Location Privacy Requirements

> Критический раздел. Прямо реализует Инварианты 1 и 9. Должен быть заложен в **DB, UI и RLS**.

Правила:

- Точная локация **никогда** не видна non-approved пользователям.
- Пользователи **никогда** не раскрывают live/current location.
- Discovery использует только approximate area.
- Event detail для non-approved показывает только city / area / distance bucket.
- Точные инструкции/адрес видны **только после approval**.
- Rejected / blocked / banned **никогда** не видят точную локацию.

### 12.1 Матрица доступа

| User state | Location visibility | Chat access | Attendee visibility |
|------------|---------------------|-------------|---------------------|
| Guest | Нет (только landing) | Нет | Нет |
| Registered, not onboarded | Нет доступа к событиям | Нет | Нет |
| Onboarded | City / area / distance bucket | Нет | Нет (или агрегат, см. §13) |
| Applied (pending) | Approximate area | Нет | Нет |
| Waitlisted | Approximate area | Нет | Нет |
| Approved | **Точное место / инструкции** | **Да (event chat)** | Да (attendee list события) |
| Rejected | Никогда точное | Нет | Нет |
| Blocked | Событие скрыто/недоступно | Нет | Нет |
| Banned | Нет доступа к продукту | Нет | Нет |

«Approximate area» = укрупнённый район/зона + distance bucket, не координаты и не точечный pin.

---

## 13. Safety Requirements

### 13.1 Safety baseline

- **Report user / event / message** — доступно из profile, event detail, event chat, attendee list.
- **Block user** — взаимная блокировка взаимодействия.
- **Moderation queue** — все reports/флаги попадают в очередь.
- **Admin actions** — restrict / ban / remove event / dismiss report.
- **Audit logs** — каждое moderation-sensitive действие логируется (Инвариант 4).
- **Velocity limits** — лимиты на частоту заявок, сообщений, создания событий, reports (anti-spam/abuse).
- **Suspicious behavior detection** — паттерны (массовые заявки, повторные reports на одного, быстрый ban-evasion).
- **AI-assisted moderation** — флаг/приоритизация/суммаризация.
- **Human review for serious actions** — permanent ban, серьёзный restrict, спорное удаление события.

### 13.2 Anti-creep mechanics

- **No open DMs** — общение только в контексте события.
- **No exact public location** — ни события, ни пользователя.
- **No public attendee list for everyone** — список участников виден только в рамках события и approved-контекста (полнота — Open Decision).
- **No raw trust score** — только soft-бейджи.
- **No public ratings** — людей не оценивают числом/звёздами.
- **No "who viewed my profile"** — никаких сталкер-паттернов.
- **Post-event connection only after shared context** — реконнект только при реальном совместном участии.

---

## 14. Trust Requirements (Trust System v1)

### 14.1 Internal signals (не показываются как число)

- verification (email/phone/доп. уровни);
- profile completeness;
- attendance (completed events);
- no-show (negative signal);
- reports (against user);
- blocks (against user);
- host feedback (post-event);
- suspicious behavior signals.

Эти сигналы агрегируются во **внутренний trust score** — используется для safety/moderation/приоритизации, **только серверно**, недоступен клиенту.

### 14.2 Public signals (мягкие, нечисловые)

- **Verified**
- **Reliable attendee**
- **Hosted before**
- **Attended events**

Бейджи бинарные/качественные, без чисел и без негативных публичных ярлыков.

### 14.3 Запрещено

- raw trust score (число) в любом клиентском контексте;
- публичные числовые рейтинги/звёзды;
- social credit механики;
- публичные негативные ярлыки («unreliable», «reported» и т.п.).

---

## 15. AI Moderation Requirements

### 15.1 Где AI допустим

- moderation текста профиля;
- moderation фото (профиль, событие);
- moderation заголовка/описания события;
- детекция harassment в чате;
- детекция spam/scam;
- суммаризация reports для модератора;
- приоритизация риска в moderation queue.

### 15.2 Где AI НЕ может быть final judge (нужен human/admin review)

- permanent ban;
- серьёзный restriction;
- удаление события в неоднозначных случаях;
- «наказание» trust score без review.

AI выдаёт сигнал/рекомендацию + объяснение; решение по серьёзным действиям фиксирует человек (с audit log).

---

## 16. Analytics Requirements

> Реализуется в PostHog. Все события — с учётом privacy by design (без точной локации в свойствах).

### 16.1 Activation

`signup_started`, `signup_completed`, `onboarding_started`, `onboarding_completed`, `profile_completed`, `first_event_viewed`, `first_application_created`, `first_application_approved`, `first_event_attended`

### 16.2 Engagement

`event_viewed`, `event_created`, `application_created`, `application_approved`, `chat_message_sent`, `event_completed`, `repeat_attendance`

### 16.3 Safety

`report_created`, `block_created`, `moderation_action_taken`, `event_removed_for_safety`, `user_restricted`, `user_banned`, `no_show_recorded`

### 16.4 Beta

`invite_code_created`, `invite_code_used`, `waitlist_joined`, `feature_flag_exposed`

### 16.5 North Star Metric

> **Trusted offline interactions**

```
completed events × confirmed attendees × safety quality multiplier
```

`safety quality multiplier` — производная от уровня инцидентов (низкие reports/blocks/removed → ближе к 1; рост инцидентов → снижает NSM). Точная формула — Open Decision (см. §21).

---

## 17. Functional Requirements

Приоритеты: **P0** = обязательно для закрытой беты; **P1** = после закрытой беты; **P2** = не сейчас.

| ID | Module | Requirement | Priority | Notes |
|----|--------|-------------|----------|-------|
| FR-001 | Auth | Email signup/login | P0 | Supabase Auth |
| FR-002 | Auth | Google login | P0 | OAuth |
| FR-003 | Auth | Apple login | P0 | Требуется для iOS-стора |
| FR-004 | Auth | Phone verification | P0 | До apply или approval (Open Decision) |
| FR-005 | Auth | Session management (refresh/logout/expiry) | P0 | Безопасные сессии |
| FR-006 | Auth | Protected routes (всё, кроме landing/auth) | P0 | Гейт всего loop |
| FR-007 | Onboarding | Welcome + safety rules acceptance (фиксируется) | P0 | Инвариант 7 |
| FR-008 | Onboarding | Basic profile (имя, возраст/age range — Open Decision) | P0 | |
| FR-009 | Onboarding | City selection | P0 | Город из beta-списка |
| FR-010 | Onboarding | Interests selection | P0 | Контекст без dating |
| FR-011 | Onboarding | Vibe tags | P0 | |
| FR-012 | Onboarding | Intent selection | P0 | Social, не dating |
| FR-013 | Onboarding | Photo upload + moderation trigger | P0 | AI photo moderation |
| FR-014 | Onboarding | Gate: нет доступа к событиям без завершённого onboarding | P0 | |
| FR-015 | Onboarding | Profile completeness расчёт | P0 | Внутренний сигнал |
| FR-016 | Profiles | Profile view (self) | P0 | |
| FR-017 | Profiles | Edit profile | P0 | |
| FR-018 | Profiles | Photo management | P0 | Re-moderation при изменении |
| FR-019 | Profiles | Privacy settings | P0 | Инвариант 7 |
| FR-020 | Profiles | Verification status (visible state) | P0 | Soft, без числа |
| FR-021 | Profiles | Safe public profile (без чувствительных полей) | P0 | Объём — Open Decision |
| FR-022 | Profiles | Raw trust score никогда не отображается | P0 | Инвариант 3 |
| FR-023 | Events | Create event (категория, capacity, время, approximate area) | P0 | |
| FR-024 | Events | Edit event | P0 | |
| FR-025 | Events | Cancel event (`cancelled_by_host`) | P0 | Уведомления |
| FR-026 | Events | Fixed category enum (MVP список) | P0 | §9 |
| FR-027 | Events | Capacity + waitlist при `full` | P0 | |
| FR-028 | Events | Approval-required participation | P0 | Инвариант 8 |
| FR-029 | Events | Discovery (city/category, approximate area only) | P0 | Инвариант 1/9 |
| FR-030 | Events | Event detail с location gating по статусу | P0 | §12 |
| FR-031 | Events | Event lifecycle статусы | P0 | §10 |
| FR-032 | Events | Report event | P0 | |
| FR-033 | Events | Admin remove unsafe event (`removed_for_safety` + audit log) | P0 | Инвариант 4 |
| FR-034 | Events | `pending_review` + AI/admin pre-publish check | P1 | MVP может стартовать с lightweight review |
| FR-035 | Applications | Apply to event (+ optional note) | P0 | Только onboarded |
| FR-036 | Applications | Pending state visible to user & host | P0 | |
| FR-037 | Applications | Host approve/reject | P0 | |
| FR-038 | Applications | Waitlist handling | P0 | |
| FR-039 | Applications | Rejected user не видит точную локацию | P0 | Инвариант 1 |
| FR-040 | Applications | Approved user получает chat access | P0 | |
| FR-041 | Applications | Cancel application by user | P0 | |
| FR-042 | Applications | Attendance / no-show запись | P0 | Метод — Open Decision |
| FR-043 | Messaging | Event chat (только approved attendees) | P0 | Инвариант 2 |
| FR-044 | Messaging | System messages (статусы, апдейты) | P0 | |
| FR-045 | Messaging | Message reporting → moderation queue | P0 | |
| FR-046 | Messaging | Blocked users не взаимодействуют | P0 | |
| FR-047 | Messaging | Post-event limited chat (ограниченное окно) | P0 | Окно — Open Decision |
| FR-048 | Messaging | Никаких open DMs | P0 | Инвариант 2 |
| FR-049 | Safety | Report user/event/message из релевантных мест | P0 | Инвариант 6 |
| FR-050 | Safety | Block user | P0 | |
| FR-051 | Safety | Moderation queue | P0 | До запуска беты |
| FR-052 | Safety | Admin actions: restrict/ban/remove/dismiss | P0 | |
| FR-053 | Safety | Audit log на каждое moderation-sensitive действие | P0 | Инвариант 4 |
| FR-054 | Safety | Velocity limits (apply/message/create/report) | P0 | Anti-abuse |
| FR-055 | Safety | Human review для serious enforcement | P0 | Инвариант 5 |
| FR-056 | Safety | Suspicious behavior detection | P1 | Базовые правила в MVP, развитие позже |
| FR-057 | Trust | Internal trust score (server-only) | P0 | Инвариант 3/10 |
| FR-058 | Trust | Public soft badges (Verified/Reliable/Hosted/Attended) | P0 | Нечисловые |
| FR-059 | Trust | No-show tracking влияет на internal trust | P0 | |
| FR-060 | Trust | Host post-event feedback | P1 | Влияет на internal signal |
| FR-061 | AI | Profile/photo/event text moderation | P0 | Assistant role |
| FR-062 | AI | Chat harassment + spam/scam detection | P1 | После базового loop |
| FR-063 | AI | Report summarization + risk prioritization | P1 | Помощь модератору |
| FR-064 | Beta | Invite-only access + invite codes | P0 | |
| FR-065 | Beta | Waitlist join | P0 | |
| FR-066 | Beta | Feature flags | P0 | Управление бетой |
| FR-067 | Beta | Analytics events установлены | P0 | До запуска |
| FR-068 | Beta | Crash monitoring (Sentry) | P0 | До запуска |
| FR-069 | Beta | Privacy policy + Terms | P0 | До запуска |
| FR-070 | Notifications | Push/in-app: application status, event updates, chat | P0 | Без раскрытия точной локации в payload |
| FR-071 | Events | Co-host support | P2 | Open Decision; не в MVP |
| FR-072 | Discovery | Advanced AI matching/recommendations | P2 | Non-goal в MVP |
| FR-073 | Profiles | "Who viewed my profile" | P2 | Запрещено (anti-creep) — фиксируем как не делать |
| FR-074 | Monetization | Payments/tickets/paid events | P2 | Non-goal в MVP |

---

## 18. Non-Functional Requirements

| Категория | Требование |
|-----------|------------|
| Mobile-first | Основной опыт — мобильный (iOS + Android); web только для admin. |
| Cross-platform | iOS + Android паритет ключевого loop. |
| Privacy by design | Минимизация данных; нет точной локации в аналитике/логах/уведомлениях. |
| Secure by default | Безопасные дефолты; принцип наименьших привилегий. |
| RLS-first backend | Доступ к данным enforced через Row Level Security, а не только на клиенте. |
| Auditability | Все moderation-sensitive действия логируются и ревьюабельны. |
| Moderation readiness | Moderation queue + admin tools работают до входа внешних юзеров. |
| Basic scalability | Выдержать масштаб закрытой беты (один город) без деградации. |
| Accessibility | Базовая доступность (контраст, размеры, screen reader для ключевых экранов). |
| Performance | Discovery/feed и event detail отзывчивы на mid-tier устройствах. |
| Observability | Логи/метрики ключевых flow и safety-событий. |
| Crash monitoring | Sentry на mobile и admin. |

---

## 19. Release Criteria for Closed Beta

Закрытая бета может стартовать только когда **всё** выполнено:

- [ ] Auth работает (email/Google/Apple, sessions, protected routes).
- [ ] Onboarding работает и гейтит доступ к событиям.
- [ ] Profiles работают (view/edit/privacy, без raw trust score).
- [ ] Пользователи могут создавать события.
- [ ] Пользователи могут подавать заявки.
- [ ] Hosts могут approve/reject (и waitlist).
- [ ] Approved-пользователи видят точную локацию/инструкции.
- [ ] Non-approved пользователи **не** видят точную локацию.
- [ ] Event chat работает (только approved attendees).
- [ ] Reports/blocks работают из релевантных мест.
- [ ] Moderation queue работает.
- [ ] Admin может ban/restrict с audit log.
- [ ] Analytics установлены и пишут события.
- [ ] Crash monitoring работает.
- [ ] Invite-only доступ работает.
- [ ] Privacy policy и Terms существуют и доступны.

---

## 20. MVP Success Metrics

### 20.1 Quantitative

- 40%+ onboarded users подают заявку хотя бы на одно событие.
- 25%+ onboarded users посещают хотя бы одно событие в течение 14 дней.
- 20%+ attendees посещают второе событие.
- Hosts создают повторные события.
- Safety-инциденты остаются управляемыми (reports/blocks/removed в приемлемом коридоре).
- North Star (trusted offline interactions) растёт неделя к неделе.

### 20.2 Qualitative

- Пользователи говорят, что чувствовали себя в безопасности.
- Hosts понимают approval flow без объяснений.
- Пользователи понимают, **почему** локация скрыта.
- Пользователи **не** воспринимают приложение как dating app.
- Пользователи хотят прийти на следующее событие.

---

## 21. Open Product Decisions

> Не решаем молча. Каждое требует явного product decision; до решения — помечено как открытое.

| # | Вопрос | Влияет на |
|---|--------|-----------|
| OD-1 | Phone verification обязательна до **apply** или до **approval**? | Auth, Applications, friction vs safety |
| OD-2 | Используем **age range** вместо точного возраста? | Onboarding, Profiles, privacy |
| OD-3 | Host видит **полный** профиль applicant или только **safe** профиль? | Profiles, Approve, privacy |
| OD-4 | Длительность **post-event chat** окна (например 24/48/72ч)? | Messaging, Reconnect |
| OD-5 | Какие поля **обязательны** в onboarding? | Onboarding, completeness |
| OD-6 | Минимальный **profile completeness** для apply? | Applications, trust |
| OD-7 | Нужен ли **co-host** в MVP? (текущая гипотеза: нет, P2) | Events, Roles |
| OD-8 | Как именно фиксировать **no-show** (host-mark / check-in / взаимное подтверждение)? | Applications, Trust, метрики |
| OD-9 | Сколько хранить **reports / moderation logs / audit logs** (retention)? | Safety, privacy, compliance |
| OD-10 | Какая **первая beta city**? | Beta, discovery, supply |
| OD-11 | Точная формула **safety quality multiplier** в North Star? | Analytics |
| OD-12 | Полнота **attendee visibility** для approved (полный список vs частичный)? | Safety, privacy, §13 |
| OD-13 | Нужен ли `pending_review` как блокирующий gate в MVP или lightweight? | Events lifecycle, FR-034 |

---

## 22. PRD Summary

- **Что строим:** mobile-first приложение для безопасных офлайн-встреч — *trust infrastructure for modern social connection*.
- **Что доказывает MVP:** что люди готовы безопасно знакомиться через маленькие офлайн-события и возвращаться повторно.
- **Главный loop:** Discover → Apply → Approve → Attend → Reconnect — всё в MVP служит ему.
- **Почему trust/safety важнее scale:** без доверия и безопасности продукт мёртв или опасен; рост без trust разрушает ценность. Поэтому safety — часть UX, approval — фича, локация приватна, trust score внутренний, AI не судья.
- **Следующий документ:** [`/docs/02_USER_STORIES.md`](02_USER_STORIES.md) — user stories по ролям и этапам loop, выведенные из этого PRD и Product Core.

> Напоминание: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth. Этот PRD ему подчинён.
