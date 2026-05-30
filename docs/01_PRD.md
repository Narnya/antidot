# PRD v2 — Antidot

> **Status:** v2 (draft for closed beta, circle-first).
> **Owner:** Product
> **Last updated:** 2026-05-30
> **First source of truth:** [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2).
> **Supersedes:** PRD v1 (event-first, 2026-05-18).
> **Authorized by:** [`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md) (HYBRID ACCEPT).
> **Sequenced by:** [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md) §24 step 3.

> ⚠️ Этот PRD подчинён **Product Core v2**. При любом конфликте между этим документом и [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — приоритет имеет Product Core.
> Нерешённые вопросы вынесены в [§27 Open Product Decisions](#27-open-product-decisions), а не «додуманы» молча ([`CLAUDE.md`](../CLAUDE.md) §3).
> Downstream-документы ([`02_USER_STORIES.md`](02_USER_STORIES.md), [`03_USER_FLOWS.md`](03_USER_FLOWS.md), [`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md), [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md), [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md), [`11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md)) на момент написания этого PRD **ещё содержат event-first формулировки v0.1** — это известное состояние миграции. До их обновления — этот PRD и Core v2 авторитетнее.

---

## 1. Product Summary

**Антидот** — mobile-first приложение, где люди безопасно входят в **небольшие повторяющиеся социальные круги** в своём городе. У каждого круга есть **vibe**, **ритм**, **хост**, **вместимость**, **comfort composition** и **регулярные офлайн-встречи**. Пользователь **запрашивает место**, входит через **approval**, посещает **первую (intro) встречу**, становится **участником** круга и наращивает доверие через **повторяемое офлайн-присутствие**.

Ключевые свойства продукта:

- **Circle-first UX** — основной user-facing объект — круг, а не разовое событие.
- **Meeting-based operations** — встречи существуют под кругом как scheduled instances.
- **Vibe-based discovery** — discovery идёт по vibe / ритму / составу, а не по людям.
- **Context-first communication** — общение только в контексте круга; никаких open DM в MVP.
- **Trust-first safety model** — safety и trust встроены в продукт, а не настройка в глубине меню.

**Headline (binding, both):**

- **Trust infrastructure for modern social connection.**
- **Trust infrastructure for modern social belonging.**

**Что мы НЕ строим:**

- Мы **не** строим generic event-app или event-marketplace.
- Мы **не** строим people-marketplace.
- Мы **не** строим dating app.

Мы строим **operating system for trusted social circles**.

MVP должен доказать **одно**: что люди готовы безопасно входить в маленькие повторяющиеся социальные круги и возвращаться в них снова и снова, формируя **принадлежность** (belonging), а не серию транзакционных посещений.

---

## 2. Problem Statement

Современные городские люди **потеряли стабильные социальные круги**, **третьи места**, **community continuity** и **повторяемый живой контакт**.

Существующие решения **не закрывают эту потребность**, а часто усугубляют её:

- **Dating apps** создают романтическое / dating-давление: динамика заточена под мэтчинг и «оценку» людей.
- **Event-apps часто one-off и транзакционны**: ты пришёл — поел — ушёл, связи не накапливаются.
- **Социальные сети** оптимизированы под browsing, status и attention, не под belonging.
- **People-marketplaces** создают creepiness и постоянное сравнение себя с другими.
- **Большие события не дают intimacy и trust** — толпа, анонимность, нет контекста, кто рядом.
- **Переезд / смена окружения** — старые соц-связи не масштабируются на новый город, нужен лёгкий способ войти в стабильную группу.
- **Люди хотят повторяемый контекст**, а не infinite discovery: «нашёл своих — перестал искать».
- **Safety-опасения** делают вход в незнакомые группы тяжёлым — особенно для женщин и осторожных пользователей.

**Вывод:** нужен продукт, где **знакомство и belonging происходят через маленький повторяющийся круг** с контекстом, фит-защитой и transparent staged-access. Безопасность — часть UX, а не bureaucracy.

---

## 3. Target Audience

### 3.1 Основной ICP

Городские люди **22–38 лет**, которые:

- хотят **новых офлайн-связей**, но не dating-app dynamics;
- предпочитают **маленькие повторяющиеся группы** одноразовым событиям;
- ценят **safety и privacy** (район, не точную локацию; контекст до встречи);
- хотят **vibe-комфорт**, а не только shared interests;
- готовы пройти **лёгкую верификацию**;
- ценят **ритм и принадлежность** больше, чем максимум знакомств;
- могут быть **новыми в городе** или **socially rebuilding** (после переезда, после кризиса, после смены ритма).

### 3.2 User Personas

#### Persona 1 — New-in-city (Алина, 27)

| Поле | Описание |
|------|----------|
| Контекст | Переехала в новый город по работе 2 месяца назад. Друзей мало, коллеги — не круг общения. |
| Мотивация | Найти **стабильный круг**, в который можно ходить регулярно — не «потусить разово», а войти в среду. |
| Страхи / барьеры | Идти к незнакомым людям страшно; не хочет, чтобы это выглядело как dating; боится, что «не подойдёт». |
| Что важно при approval | Чтобы отказ не ощущался как dating-rejection; чтобы был intro-meeting, а не сразу «полное членство». |
| Success | За месяц стала участницей одного круга, ходит на встречи каждые 2 недели, появилось 2–3 человека, с которыми хочется встречаться. Перестала ежедневно открывать discovery. |

#### Persona 2 — Tired of dating apps (Марк, 31)

| Поле | Описание |
|------|----------|
| Контекст | Активно общается, но выгорел от dating-приложений и свайпов. |
| Мотивация | Социальные, не романтические связи; общие интересы (настолки, прогулки, кофе) + интересная компания. |
| Страхи / барьеры | Не хочет dating-coded UX; не хочет «выбирать людей»; устал от cold-сообщений. |
| Что важно при approval | Прозрачные правила круга; vibe честный; никаких like/match. |
| Success | Состоит в 1–2 кругах с разным vibe; не открывает discovery каждый день; общение идёт в чате круга, не в DM. |

#### Persona 3 — Safety-conscious woman (Катя, 25)

| Поле | Описание |
|------|----------|
| Контекст | Активная городская жительница; ходит на встречи только если есть контекст безопасности. |
| Мотивация | Найти круг, где **состав уважает её безопасность** (female-friendly или women-only); понятен хост; нет cold-сообщений. |
| Страхи / барьеры | Скрытая агрессия / харассмент; «ходят случайные люди»; неконтролируемое общение; ощущение, что её «оценивают». |
| Что важно при approval | Видимый comfort composition; approval как fit-protection, а не как ranking; report/block доступен везде. |
| Success | Состоит в женском или female-friendly круге; никогда не получала cold DM; чувствует, что атмосфера соответствует обещанному vibe. |

#### Persona 4 — Casual circle host (Игорь, 33)

| Поле | Описание |
|------|----------|
| Контекст | Раньше собирал небольшие компании на настолки / кино — но в Telegram-чатах это требовало слишком много координации и не масштабировалось. |
| Мотивация | Иметь **простой инструмент** для регулярных встреч маленькой группы; видеть, кто придёт; не отвечать в личке каждому. |
| Страхи / барьеры | Не хочет модерировать большой чат; не хочет ответственности «открытого мероприятия»; боится, что придут «не те». |
| Что важно при approval | Возможность отказать без drama; intro-meeting; короткие requests, не «заявки на 10 строк». |
| Success | Ведёт стабильный круг, который встречается раз в 2 недели; уровень no-show низкий; не тратит время на координацию. |

#### Persona 5 — Urban professional seeking stable rhythm (Денис, 35)

| Поле | Описание |
|------|----------|
| Контекст | Работа поглощает, друзья переехали или разъехались, не хочет нагружать себя «менеджментом тусовок». |
| Мотивация | Иметь **один-два стабильных круга** с предсказуемым ритмом, куда можно встроиться без подготовки. |
| Страхи / барьеры | Не хочет engagement-trap; не хочет infinite discovery; не хочет, чтобы продукт его «тянул» на новые круги. |
| Что важно при approval | Прозрачный ритм; легко поставить на паузу; «My Circles» как home, а не feed. |
| Success | Активен в 1 круге, открывает приложение только когда нужно — RSVP, апдейт, встретиться. Воспринимает продукт как полезный, не назойливый. |

#### Persona 6 — Creative / introvert (Лиза, 29)

| Поле | Описание |
|------|----------|
| Контекст | Социально аккуратна, интроверт, предпочитает маленькие тихие группы; ходит на творческие сессии, медленные брунчи. |
| Мотивация | Найти **low-pressure круг** с открытыми разговорами без давления; уважительный хост; небольшой размер. |
| Страхи / барьеры | Большие группы; громкие vibe; «обязаловка» приходить регулярно; ощущение, что её «оценят». |
| Что важно при approval | Vibe должен честно отражать пейс; pause-опция; нет публичных меток. |
| Success | Состоит в маленьком круге 4–6 человек, ходит на встречи по настроению; общение тёплое, без давления. |

---

## 4. Product Principles

20 принципов, наследуемых из [`/docs/25_PRODUCT_CORE_MANIFESTO.md`](25_PRODUCT_CORE_MANIFESTO.md) §28 и [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md):

1. **Circles over events.**
2. **Vibe over interests.**
3. **Context over cold outreach.**
4. **Belonging over browsing.**
5. **Rhythm over randomness.**
6. **Fit protection over human ranking.**
7. **Trust over scale.**
8. **Group-first, not people-marketplace.**
9. **Safety without bureaucracy.**
10. **Controlled unpredictability, not chaos.**
11. **No public shame.**
12. **No infinite discovery pressure.**
13. **No open DMs.**
14. **No vanity metrics.**
15. **No follower economy.**
16. **No public ratings.**
17. **No raw trust score.**
18. **No swipe mechanics.**
19. **No dating mechanics.**
20. **AI assists, but does not judge.**

---

## 5. Core Product Loop

> **Find the right vibe → Request a place → Enter safely → Attend first meeting → Become part of the rhythm → Belong → Grow trusted graph.**

Старый event-first loop (Discover Event → Apply → Approve → Attend → Reconnect) **superseded**.

### 5.1 Find the right vibe

| Поле | Значение |
|---|---|
| User goal | «Где мне будет комфортно быть?» |
| System behavior | Показывает feed кругов с vibe / ритмом / районом / capacity / comfort composition. **Никаких людей в feed.** |
| Key screens | Circle Discovery; Filters. |
| Safety / trust mechanics | Aggregated composition only (§15); area only (Инв. 9); report / block на host и круг доступны прямо с карточки. |
| Analytics | `circle_viewed`, `discovery_filter_used`. |
| Risks | Пустой feed на старте (cold-start liquidity); неудачное vibe-tag taxonomy; перегруз фильтрами. |

### 5.2 Request a place

| Поле | Значение |
|---|---|
| User goal | «Я хочу принадлежать здесь.» |
| System behavior | Создаёт `CircleMembershipRequest` (один запрос на круг). Опциональный intro-note. |
| Key screens | Circle Detail; Request Modal; My Requests. |
| Safety / trust mechanics | Rate-limited; blocked users не могут запрашивать (§19); copy non-stigmatizing. |
| Analytics | `circle_join_requested`. |
| Risks | Запрос ощущается «слишком серьёзно»; intro-note воспринимается как «вступительное эссе». |

### 5.3 Enter safely

| Поле | Значение |
|---|---|
| User goal | «Я хочу понять, во что иду, прежде чем тратить вечер.» |
| System behavior | Host рассматривает запрос; approve as intro / approve as member / waitlist / soft-reject. |
| Key screens | Host Review; Membership Pending; Intro Invitation. |
| Safety / trust mechanics | Approval — **fit protection**, не ranking (§19); host accountability; appeal path; soft-rejection copy («Не в этот раз»). |
| Analytics | `circle_membership_approved`, `circle_membership_rejected`, `circle_intro_invitation_sent`. |
| Risks | Долгое approval; ощущение «меня оценивают»; rejection-anxiety. |

### 5.4 Attend first meeting

| Поле | Значение |
|---|---|
| User goal | «Прийти один раз и посмотреть, моё это или нет.» |
| System behavior | Exact location раскрывается только на эту intro-встречу; RSVP записывается; attendance отмечается после. |
| Key screens | Intro Meeting Detail; RSVP; Post-meeting confirmation (host-confirmed). |
| Safety / trust mechanics | Инв. 1 (location); Инв. 9 (no live location); Инв. 4 (audit); no-show tracking internal only. |
| Analytics | `meeting_rsvp_yes`, `meeting_attended`, `intro_meeting_completed`. |
| Risks | Intro feels like «тест»; high-stakes first meeting → активация падает. |

### 5.5 Become part of the rhythm

| Поле | Значение |
|---|---|
| User goal | «Я хочу быть частью группы, а не гостем.» |
| System behavior | После intro и (опц.) host-confirmation: `intro_attended` → `member`. RSVP на upcoming meetings без повторного approval. |
| Key screens | Membership Status; You Are In The Circle; Circle Home. |
| Safety / trust mechanics | Host может не конвертировать с non-stigmatizing copy; user может уйти так же легко; trust events записываются internal. |
| Analytics | `member_converted`, `repeat_meeting_attendance`. |
| Risks | «Не конвертировался» воспринимается как rejection; ритм не подходит — отток. |

### 5.6 Belong

| Поле | Значение |
|---|---|
| User goal | «У меня есть круг, я не ищу.» |
| System behavior | Home переключается на **My Circles**; quiets discovery prompts; «не ищу новые круги» — toggle в Settings. |
| Key screens | My Circles; Circle Home; Settings (belonging mode). |
| Safety / trust mechanics | Без давления; никаких nag-уведомлений (Инв. 14 — no infinite discovery pressure). |
| Analytics | `belonging_mode_active`, `circle_retention`. |
| Risks | Команда подсознательно превратит «belonging» в churn-метрику. |

### 5.7 Grow trusted graph

| Поле | Значение |
|---|---|
| User goal | «У меня есть повторный контекст с этими людьми, reconnect — естественен.» |
| System behavior | Накапливаются soft co-presence edges (P1, gated). |
| Key screens | Circle members list; Reconnect (P1, после валидации). |
| Safety / trust mechanics | Инв. 2 (no open DMs); Инв. 10 (no social credit); cold outreach запрещён. |
| Analytics | `co_presence_edge_created` (internal). |
| Risks | Соблазн вырастить это в people-graph product — запрещено. |

---

## 6. Core Concepts

### 6.1 Circle

**Круг** — небольшая повторяющаяся социальная группа с vibe, ритмом, хостом, capacity, comfort composition и регулярными встречами. **Primary user-facing объект.**

Полное определение полей — [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) §6.

### 6.2 Meeting

**Встреча круга** — scheduled offline instance круга. Это **операционный** объект — там, где офлайн-связь физически происходит. **Заменяет event-as-MVP-primitive** из v0.1.

Полное определение полей — [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) §7.

### 6.3 Membership Request

Запрос пользователя на вход в круг. **Один запрос на круг**, не на каждую встречу. **Заменяет `EventApplication`** из v0.1.

### 6.4 Membership

Approved relationship между пользователем и кругом. Существует пока пользователь — `member` (или `paused`); переход в terminal states (`left`, `removed`, ...) — см. §13.

### 6.5 Intro Meeting

**Первая approved-встреча перед полным membership.** Цель:

- снизить social pressure (низкоставочный вход);
- избежать harsh rejection (не подошёл круг — administrative, не personal);
- позволить **fit protection** для обеих сторон;
- сохранить safety круга.

### 6.6 Belonging Mode

Состояние, в котором пользователь нашёл один или несколько кругов и **больше не нуждается в постоянном discovery**.

> **Belonging is success, not churn.**

---

## 7. MVP Scope v2

### 7.1 Access / Auth

**Функции:**

- invite-only beta;
- waitlist;
- email auth;
- Google login;
- Apple login;
- phone verification (timing — см. §27);
- session persistence;
- logout;
- protected routes;
- banned-user gate.

**Acceptance criteria:**

- guest не может попасть в Circle Discovery;
- invite-gate контролирует доступ к бете;
- session переживает рестарт приложения;
- user может выйти; сессия инвалидируется;
- service role **никогда** не попадает в client bundle (Инв. 12).

### 7.2 Onboarding

**Функции:**

- welcome screen;
- safety principles acceptance;
- city / area (area only);
- interests;
- **vibe** (primary);
- preferred **rhythm**;
- **comfort composition**;
- **group size comfort**;
- **host willingness** (opt-in);
- basic profile;
- photos;
- verification step (email / phone level);
- profile preview;
- resume support.

**Acceptance criteria:**

- user не получает доступа к Circle Discovery до завершения required-онбординга;
- онбординг можно прервать и возобновить;
- user понимает approval, circle-модель и location privacy после онбординга;
- profile completeness трекается;
- exact location **не** собирается; только city + area.

### 7.3 Profiles

**Функции:**

- own profile view / edit;
- photos;
- vibe / interests;
- verification status;
- soft positive badges;
- privacy settings;
- safe public profile (то, что видят другие).

**Acceptance criteria:**

- raw trust score **никогда** не показывается (Инв. 3);
- private data не экспонирована;
- safe profile показывается только в public / member контекстах;
- report / block доступен прямо из профиля.

### 7.4 Circle Discovery

**Функции:**

- feed кругов;
- vibe filters;
- rhythm filters;
- area / city filtering;
- comfort composition indication на карточке;
- circle cards (компактные);
- empty / no-results states.

**Acceptance criteria:**

- users **discover circles**, не людей (Инв. 13);
- **no swipe**;
- **no people marketplace**;
- exact location скрыта;
- full member list скрыт до approval;
- **no public ratings**.

### 7.5 Circle Detail

**Функции:**

- circle title;
- vibe tags;
- theme description;
- rhythm;
- capacity / size band;
- approximate area;
- comfort composition;
- host safe profile (display name, verification badge);
- next meeting summary (date / time / area, **without exact location**);
- approval explanation copy;
- **request place** CTA;
- report circle action.

**Acceptance criteria:**

- exact meeting location **скрыта**;
- full member list **скрыт** до approval;
- approval объяснён как **fit protection** (§19), не ranking;
- report action видим и доступен.

### 7.6 Circle Creation / Host

**Функции:**

- create circle (vibe, theme, rhythm, capacity, area, comfort composition, rules);
- set first / next meeting;
- edit circle;
- pause circle;
- host dashboard;
- schedule meetings.

**Acceptance criteria:**

- circle имеет lifecycle status (см. §11);
- first-time host может проходить через `pending_review` (опц., §27);
- exact location сохраняется **только для встреч** и защищена RLS;
- unsafe-круги могут быть переведены в `removed_for_safety` admin'ом.

### 7.7 Membership Requests

**Функции:**

- request a place (опц. intro-note);
- pending state;
- host review queue;
- approve for intro meeting;
- approve as member;
- soft-reject («Не в этот раз»);
- waitlist;
- transition в `member`.

**Acceptance criteria:**

- только onboarded users могут запрашивать;
- blocked / banned / restricted users **не могут** запрашивать;
- host видит **safe applicant context**, не raw trust signals;
- rejected / waitlisted users **не видят** exact location встречи;
- approval **не должен** ощущаться как human-ranking;
- copy на rejection — non-stigmatizing.

### 7.8 Meetings

**Функции:**

- next meeting card;
- meeting detail;
- RSVP (going / can't make it);
- exact location reveal **только** для approved access;
- attendance confirmation (post-meeting);
- no-show tracking (internal).

**Acceptance criteria:**

- exact meeting location видима **только** `approved_for_intro_meeting` (на ту встречу) или `member` (upcoming);
- non-approved users видят **только** approximate area;
- `paused` / `left` / `removed` users **теряют** future access;
- **no live user location** (Инв. 9);
- no-show отметка — internal only (Инв. 3).

### 7.9 Circle Chat

**Функции:**

- circle chat (group);
- system messages;
- meeting updates (host-posted);
- report message;
- block user (propagated);
- chat frozen state (admin).

**Acceptance criteria:**

- read / write — только для `member` (Инв. 2);
- **no open DMs**;
- **no 1:1 в MVP**;
- reported messages — в moderation queue;
- admin может заморозить чат (audit log обязателен).

### 7.10 Safety

**Функции:**

- report user;
- report circle;
- report meeting;
- report message;
- block user;
- moderation queue;
- audit logs;
- admin actions;
- AI assistive moderation;
- velocity / rate-limits.

**Acceptance criteria:**

- report / block доступны во всех релевантных контекстах (Инв. 6);
- все moderation-sensitive actions логируются (Инв. 4);
- AI — assistant, не judge (Инв. 5);
- **no public shame labels** (Инв. 12).

### 7.11 Trust

**Функции:**

- verification states (email / phone / future identity);
- profile completeness;
- attendance reliability across meetings;
- no-show tracking;
- host reliability;
- internal trust score (никогда не показывается);
- public soft badges (Проверен / Надёжный участник / Уже проводил встречи / Участвовал во встречах).

**Acceptance criteria:**

- raw trust score **internal only** (Инв. 3);
- public сигналы — positive / neutral only;
- **никаких** public negative labels;
- trust поддерживает safety, не ranking (Инв. 10).

### 7.12 Beta

**Функции:**

- invite-only access;
- waitlist;
- feature flags;
- basic analytics (taxonomy в §22);
- crash monitoring;
- privacy policy;
- terms.

**Acceptance criteria:**

- доступ контролируется invite-кодом;
- analytics-граница соблюдена (§22);
- safety ops готовы до внешних users.

---

## 8. Explicit Non-Goals

В MVP **НЕ строим**. Для каждой категории — короткое объяснение, почему отложено / запрещено.

| Категория | Почему НЕ в MVP |
|---|---|
| standalone event marketplace | suspend'нут как продуктовый primitive решением [`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md); круги заменяют этот примитив. |
| people marketplace | Инв. 13: продукт не каталогизирует людей. |
| people-first discovery | Discovery — это feed кругов, не людей. Подрывает trust-first позиционирование. |
| swipe | Инв. (anti-drift) — dating-механика, эрозирует «participation, not evaluation». |
| open DMs | Инв. 2: cold-контакт несовместим с context-first моделью. |
| cold 1:1 | то же. |
| dating mechanics | Hard rule 6 / Анти-дрейф — продукт не позиционируется как dating. |
| romantic matching | то же. |
| likes / matches | то же; vanity metric + dating-coded. |
| public ratings | Hard rule 5 — публичный рейтинг людей запрещён. |
| raw trust score | Инв. 3 — внутренний сигнал, не публичный. |
| public follower graph | Инв. 17 / Анти-дрейф — нет audience-механик. |
| exact public map pins | Инв. 1 — location protected. |
| live location | Инв. 9 — точная live-локация запрещена. |
| payments / tickets / paid events | Core rule 7 — нет монетизации для пользователей в MVP. |
| promoted circles | Pay-to-be-seen корраптит trust (см. doc 22 §0). |
| nightlife / party mechanics | Не входит в категории кругов; высокий safety risk. |
| streams / online broadcast | Не относится к офлайн-loop'у — отдельная категория. |
| complex AI matching | Преждевременно; intelligence — после реальных данных. |
| B2B monetization | После доказанного loop'а — потенциально позже. |
| creator economy | Не вписывается в trust-first / belonging-фокус. |

---

## 9. User Roles

| Роль | Что может | Что не может | Основные экраны | Ограничения доступа |
|------|-----------|--------------|------------------|---------------------|
| **Guest / Visitor** | landing, sign-up, waitlist, invite-code | видеть круги, запрашивать место, видеть участников, писать | Welcome, Invite, Auth | Auth gate |
| **User** | create / edit profile, discover, request a place, report / block, manage privacy | автоматически попадать в circle chat; видеть exact location | Onboarding, Discovery, Profile | Membership gate per circle |
| **Circle Member** | видеть circle home, member-safe context, upcoming meetings, RSVP, exact location upcoming, читать / писать circle chat, pause / leave | видеть other circles members'ов; писать DM; видеть raw trust signals | My Circles, Circle Home, Meeting Detail, Circle Chat | RLS по `membership_status` |
| **Circle Host** | create / edit / pause circle, review requests, approve / reject / waitlist, schedule meetings, moderate circle context, host dashboard | банить пользователей платформы; видеть raw trust score; обходить admin moderation | Host Dashboard, Membership Requests, Create Circle | scope = свои круги |
| **Admin / Moderator** | review reports, moderate users / circles / meetings / messages, restrict / ban, remove unsafe circles, freeze chat, view audit logs | использовать service role с client-side | Admin app (Next.js) | server-side only; Инв. 12 |
| **System** | lifecycle transitions, RSVP locks, reminders, AI assist signals | быть final judge для serious enforcement | n/a | Инв. 5 |

---

## 10. Circle Types / Categories

### 10.1 Activity categories (initial, restricted)

- Coffee / Calm conversation;
- Walk / City exploring;
- Brunch / Slow social;
- Board games;
- Light sports;
- Creative sessions;
- Reading / intellectual discussion;
- Community hangout.

### 10.2 Vibe descriptors (curated, не free-text)

- calm;
- open;
- low-pressure;
- ambitious;
- creative;
- international;
- introvert-friendly;
- emotionally open;
- slow-life.

> **Категории — surface layer. Vibe — глубже.** Пользователь выбирает не «coffee», а «slow brunch круг для emotionally open conversations». Категория сужает активность; vibe — атмосферу.

### 10.3 Avoid (carried forward from Core v0.1 / Core v2 §27)

- nightlife;
- parties;
- dating events;
- business networking;
- paid workshops;
- large public events.

---

## 11. Circle Lifecycle

```
draft → pending_review → live → paused → full → archived → removed_for_safety
```

| Status | Meaning | Who can set | User visibility | Actions available | Safety implications |
|---|---|---|---|---|---|
| `draft` | Host создаёт круг | host | только хост | edit, publish, delete | none |
| `pending_review` | Круг ждёт ревью (если требует политика) | host → admin | не в discovery | admin: approve / reject | admin review host accountability + composition |
| `live` | Круг discoverable, принимает запросы | admin / host | в discovery | request, RSVP, chat (members) | normal moderation surface |
| `paused` | Не принимает новых; существующие members остаются | host | не в discovery; members видят «paused» | unpause, archive | снижает moderation surface |
| `full` | Capacity достигнута | system | в discovery как «full» | waitlist (опц.) | none additional |
| `archived` | Host завершил круг | host | members видят «archived» | none (history) | trust events frozen |
| `removed_for_safety` | Safety action | admin only | members видят safety-removal copy | none | audit log обязателен; appeal path |

---

## 12. Meeting Lifecycle

```
scheduled → starting_soon → in_progress → completed → cancelled → removed_for_safety
```

| Status | Meaning | RSVP access | Location access | Notifications | Trust / attendance implications |
|---|---|---|---|---|---|
| `scheduled` | будущая встреча | members RSVP'ят | exact для members per §14 | reminders queued | none yet |
| `starting_soon` | в окне раскрытия | RSVP меняется | exact доступен approved | «starts soon» system message | none yet |
| `in_progress` | идёт встреча | RSVP locked | exact доступен approved | optional system messages | none yet |
| `completed` | окончена | RSVP locked | exact перестаёт surface'иться после окна | «completed» system message | attendance / no-show записаны (internal) |
| `cancelled` | host отменил | RSVPs voided | exact отозван | «cancelled» | **нет** негативных trust events |
| `removed_for_safety` | admin удалил | RSVPs voided | exact отозван | safety-removal copy | audit log обязателен |

---

## 13. Membership Lifecycle

```
none → requested → approved_for_intro_meeting → intro_attended → member
     → paused → left → removed → removed_for_safety → banned_from_circle
```

| Status | Who can set | What user sees | Location access | Chat access | Member list visibility | Notification behavior | Trust / moderation impact |
|---|---|---|---|---|---|---|---|
| `none` | default | discovery only | area only | none | aggregated | none | none |
| `requested` | user | «запрос у хоста» | area only | none | none | acknowledge sent | rate-limited |
| `approved_for_intro_meeting` | host | «приглашены на intro» | exact только для этой встречи | meeting-context only | partial (relevant subset) | invitation issued | positive intro signal |
| `intro_attended` | system (post-meeting) | «вы посетили intro» | post-window: scoped к той встрече | scoped | partial | none | attendance signal |
| `member` | host или system | «вы в круге» | exact для upcoming | full circle chat | full safe profiles | meeting reminders | positive continuity signal |
| `paused` | user | «участие на паузе» | none | per policy | full | quiet | neutral |
| `left` | user | «участие завершено» | none | none | hidden (для других — «состав обновился») | quiet | neutral |
| `removed` | host | non-public copy | none | none | hidden | quiet; appeal path | internal host-accountability signal |
| `removed_for_safety` | admin | safety copy | none | none | hidden | quiet | audit log; safety signal |
| `banned_from_circle` | admin | banned copy | none | none | hidden | quiet | audit log; permanent for that circle |

**Hard rules (carried from CLAUDE.md §11):**

- **No betrayal mechanics.**
- **No public leave / removal / rejection labels.**
- **No transition notifications** other members.

---

## 14. Location Privacy Requirements

**Критический раздел.** Любая фича, нарушающая эти правила, отклоняется (CLAUDE.md §2 rule 1, Инв. 1, 9).

### 14.1 Правила

- **Exact meeting location никогда не видна** non-approved users.
- `non-member` видит **approximate area only**.
- `requested` / `waitlisted` / `rejected` видят **approximate area only**.
- `approved_for_intro_meeting` видит **exact location только для этой intro-встречи**.
- `member` видит **exact location для upcoming meetings** в окне раскрытия.
- `paused` / `left` / `removed` теряют future location access.
- Admin access — **server-side only**.
- **Notifications не leak'ают exact location** в push-уведомлениях.
- **Analytics не содержат exact location**.
- **No live user location** (Инв. 9).

### 14.2 Access matrix

| User state | Circle visibility | Approx area | Exact meeting location | Circle chat | Member visibility |
|---|---|---|---|---|---|
| `guest` | ❌ (landing only) | ❌ | ❌ | ❌ | ❌ |
| `authenticated_not_onboarded` | ❌ | ❌ | ❌ | ❌ | ❌ |
| `onboarded_user` (no relationship) | ✅ safe view | ✅ area | ❌ | ❌ | aggregated |
| `requested` | ✅ | ✅ | ❌ | ❌ | aggregated |
| `waitlisted` | ✅ | ✅ | ❌ | ❌ | aggregated |
| `rejected` | ✅ | ✅ | ❌ | ❌ | aggregated |
| `approved_for_intro_meeting` | ✅ | ✅ | ✅ **только эта встреча** | meeting-context | partial (host + intro participants subset per policy) |
| `member` | ✅ | ✅ | ✅ upcoming meetings | read+write | full safe profiles |
| `paused` | ✅ | ✅ | ❌ | per policy (read-only / muted) | full |
| `left` | ✅ если discovery | ✅ | ❌ | ❌ | ❌ |
| `removed` | per policy | per policy | ❌ | ❌ | ❌ |
| `blocked` | ❌ круги блокирующего | ❌ | ❌ | ❌ | ❌ |
| `banned` | ❌ (auth gate) | ❌ | ❌ | ❌ | ❌ |
| `host` (своего круга) | ✅ полный admin своего круга | ✅ | ✅ всех meetings своего круга | ✅ | ✅ |
| `admin` | ✅ через admin app | ✅ | ✅ через admin app (server-side) | ✅ через admin app | ✅ через admin app |

---

## 15. Composition Visibility Requirements

### 15.1 Before request

**Show:**

- circle size (size band, не точное число);
- rhythm;
- vibe tags;
- approximate area;
- comfort composition (open mixed / female-friendly / women-only / host-defined);
- host safe profile (display name + verification badge).

**Hide:**

- full member list;
- private profiles участников;
- exact location;
- internal trust data.

### 15.2 After request (waiting for host)

**Show:**

- request status;
- расширенный circle context, theme, hosting style;
- rules;
- **ещё нет** full member list.

### 15.3 After approval / member

**Show:**

- safe member profiles per policy (display name, photo, verification badge, soft attendance badge);
- meeting details;
- circle chat (members);
- exact location для разрешённой встречи (§14).

### 15.4 Never show (to non-admin)

- raw trust score (Инв. 3);
- report counts;
- block counts;
- removal history;
- rejection history;
- other circles участника;
- internal moderation notes.

---

## 16. Belonging / No Infinite Discovery

> Если пользователь нашёл свой круг и **перестал искать** — продукт **успешен**.

**Requirements:**

- **My Circles** — primary home surface для users with ≥1 circle;
- next meeting card;
- RSVP;
- circle chat;
- reminders;
- **pause** / **leave** доступны в один тап;
- **«не ищу новые круги»** — Settings toggle (P1);
- **no infinite discovery pressure** (Инв. 14).

**Metrics treat belonging как success** (см. §22): **никаких KPI** типа «circles per user» или «sessions per day» как retention-целей.

---

## 17. Pause / Leave / Removal Requirements

### 17.1 Поведение

- **Pause** participation — доступно before hard exit, where applicable.
- **Leave** — приватно; один тап; reason optional.
- **Host removal** — с категорией причины (internal); appeal path.
- **Admin safety removal** — audit log обязателен.
- **No public shame** на любом transition.

### 17.2 Required UX language

**Use:**

- **«Поставить участие на паузу»**
- **«Выйти из круга»**
- **«Участие завершено»**
- **«Не в этот раз»**
- **«Состав круга обновился»**

**Forbidden:**

- ~~«Вас исключили»~~
- ~~«Вас отклонили»~~
- ~~«Предал круг»~~
- ~~«Ушёл в другой круг»~~

---

## 18. Communication Requirements

### 18.1 MVP

- circle chat (group);
- meeting updates;
- system messages;
- report message;
- block user.

### 18.2 Не в MVP

- open DMs (Инв. 2);
- cold 1:1;
- «написать участнику» из профиля;
- people-first communication.

### 18.3 P1 possible

**Mutual opt-in 1:1 только после shared context.** Условия:

- оба — `member` одного круга;
- оба посетили хотя бы одну общую встречу;
- оба opt-in до создания канала;
- **никакого** свободного first message до acceptance;
- report / block всегда доступны;
- никаких pressure-signals (no read receipts, no «typing»).

> **Hard guardrail (CLAUDE.md §10):** не добавлять DM-таблицы / DM-экраны / «message user» CTA, пока P1 не разблокирован отдельным product decision.

---

## 19. Safety Requirements

### 19.1 Включает

- report user;
- report circle;
- report meeting;
- report message;
- block user;
- moderation queue;
- admin actions (restrict / ban / remove);
- audit logs (Инв. 4);
- velocity / rate-limits;
- suspicious behavior detection;
- host abuse detection (internal signal);
- comfort composition violations;
- AI-assisted moderation (Инв. 5);
- human review для serious actions.

### 19.2 Anti-creep mechanics

- no open DMs;
- no people marketplace;
- no full member list before approval;
- no exact location before approval;
- no raw trust score;
- no public ratings;
- no public shame;
- no «who viewed me».

---

## 20. Trust Requirements

### 20.1 Internal signals

- verification level;
- profile completeness;
- attendance reliability;
- no-show;
- membership history (duration, breadth);
- host reliability;
- reports / blocks;
- moderation actions;
- suspicious velocity.

### 20.2 Public signals (soft positive badges only)

- **Проверен**;
- **Надёжный участник**;
- **Уже проводил встречи**;
- **Участвовал во встречах**.

### 20.3 Forbidden

- raw trust score (Инв. 3);
- public numeric ratings;
- public negative labels;
- social credit mechanics (Инв. 10);
- popularity ranking.

---

## 21. AI Moderation Requirements

### 21.1 AI **может** ассистировать

- profile text moderation (sanity check, не финальный судья);
- photo moderation (NSFW / safety flags);
- circle description moderation;
- meeting description moderation;
- chat harassment detection;
- spam / scam detection;
- report summarization;
- risk prioritization для queue.

### 21.2 AI **НЕ может** быть финальным судьёй

- permanent ban;
- serious restrictions;
- circle removal в ambiguous-кейсах;
- trust penalties без human review.

**Инв. 5 / CLAUDE.md §2 rule 9** — связующий.

---

## 22. Analytics Requirements

### 22.1 Activation

- `signup_started`;
- `signup_completed`;
- `onboarding_started`;
- `onboarding_completed`;
- `profile_completed`;
- `first_circle_viewed`;
- `first_circle_request_created`;
- `first_circle_request_approved`;
- `first_meeting_attended`.

### 22.2 Engagement

- `circle_viewed`;
- `circle_created`;
- `circle_join_requested`;
- `circle_membership_approved`;
- `meeting_rsvp_yes`;
- `circle_chat_opened`;
- `circle_meeting_attended`;
- `repeat_meeting_attendance`;
- `belonging_mode_active`;
- `circle_retention`.

### 22.3 Safety

- `report_created`;
- `block_created`;
- `moderation_action_taken`;
- `circle_removed_for_safety`;
- `user_restricted`;
- `user_banned`;
- `no_show_recorded`;
- `reports_per_circle`;
- `moderation_response_time`.

### 22.4 North Star candidate

- **A:** trusted recurring offline interactions;
- **B:** active trusted circles with confirmed recurring attendance.

### 22.5 Privacy boundary

**Не трекать**:

- exact location;
- raw message body;
- report descriptions (текст);
- raw trust score;
- private profile data;
- кросс-circle membership детали для других пользователей.

### 22.6 Forbidden metric directions

- **«circles per user»** как retention KPI (создаёт infinite discovery pressure — Инв. 14);
- public popularity counters;
- любой user-facing trust score.

---

## 23. Functional Requirements

50+ требований; приоритет — P0 (MVP-блокирующий), P1 (после MVP/после валидации), P2 (позже).

| ID | Module | Requirement | Priority | Notes |
|---|---|---|:--:|---|
| FR-AUTH-01 | Auth | Email sign-up + login | P0 | стандартный Supabase Auth |
| FR-AUTH-02 | Auth | Google login | P0 | OAuth |
| FR-AUTH-03 | Auth | Apple login | P0 | OAuth |
| FR-AUTH-04 | Auth | Phone verification | P0 | timing — open в §27 |
| FR-AUTH-05 | Auth | Session persistence | P0 | secure storage |
| FR-AUTH-06 | Auth | Logout invalidates session | P0 | — |
| FR-AUTH-07 | Auth | Protected routes для unauthenticated | P0 | — |
| FR-AUTH-08 | Auth | Banned-user gate (terminate session) | P0 | — |
| FR-BETA-01 | Beta | Invite-code gate | P0 | пользователь без кода → waitlist |
| FR-BETA-02 | Beta | Waitlist signup без auth | P0 | email collection |
| FR-BETA-03 | Beta | Feature flags для постепенного roll-out | P0 | — |
| FR-ONB-01 | Onboarding | Welcome screen | P0 | — |
| FR-ONB-02 | Onboarding | Safety principles acceptance gate | P0 | required перед профилем |
| FR-ONB-03 | Onboarding | City + area input (area only) | P0 | Инв. 9 |
| FR-ONB-04 | Onboarding | Interests selection | P0 | secondary signal |
| FR-ONB-05 | Onboarding | Vibe tags selection (curated) | P0 | primary signal §8 Core v2 |
| FR-ONB-06 | Onboarding | Preferred rhythm | P0 | weekly / biweekly / monthly / flexible |
| FR-ONB-07 | Onboarding | Comfort composition preference | P0 | open mixed / female-friendly / women-only / no preference |
| FR-ONB-08 | Onboarding | Group size comfort | P0 | bands |
| FR-ONB-09 | Onboarding | Host willingness opt-in | P1 | low-friction |
| FR-ONB-10 | Onboarding | Photo upload | P0 | min 1 photo |
| FR-ONB-11 | Onboarding | Profile preview before submit | P0 | UX safety |
| FR-ONB-12 | Onboarding | Resume from last step | P0 | — |
| FR-PROF-01 | Profiles | View own profile | P0 | — |
| FR-PROF-02 | Profiles | Edit own profile | P0 | — |
| FR-PROF-03 | Profiles | Manage photos | P0 | — |
| FR-PROF-04 | Profiles | Manage vibe / interests | P0 | — |
| FR-PROF-05 | Profiles | Show soft positive badges | P0 | §20 |
| FR-PROF-06 | Profiles | Privacy settings (что видит другой member) | P0 | — |
| FR-PROF-07 | Profiles | Public safe profile view | P0 | без raw trust |
| FR-DISC-01 | Discovery | Circles feed | P0 | no people feed |
| FR-DISC-02 | Discovery | Filter by vibe | P0 | — |
| FR-DISC-03 | Discovery | Filter by rhythm | P0 | — |
| FR-DISC-04 | Discovery | Filter by area (within user's city) | P0 | — |
| FR-DISC-05 | Discovery | Filter by comfort composition | P0 | — |
| FR-DISC-06 | Discovery | Filter by group size band | P0 | — |
| FR-DISC-07 | Discovery | Show next meeting if `live` & scheduled | P0 | без exact location |
| FR-DISC-08 | Discovery | Empty / no-results states | P0 | — |
| FR-CIRC-01 | Circle Detail | Show circle title, vibe, theme, rhythm, capacity, area | P0 | — |
| FR-CIRC-02 | Circle Detail | Show comfort composition label | P0 | — |
| FR-CIRC-03 | Circle Detail | Show host safe profile | P0 | display name + verification |
| FR-CIRC-04 | Circle Detail | Show next meeting summary (no exact location) | P0 | — |
| FR-CIRC-05 | Circle Detail | Approval explanation copy | P0 | fit-protection framing §19 |
| FR-CIRC-06 | Circle Detail | Request place CTA | P0 | — |
| FR-CIRC-07 | Circle Detail | Report circle action | P0 | Инв. 6 |
| FR-HOST-01 | Host | Create circle (vibe, theme, rhythm, capacity, area, composition, rules) | P0 | — |
| FR-HOST-02 | Host | Edit circle | P0 | — |
| FR-HOST-03 | Host | Pause / unpause circle | P0 | — |
| FR-HOST-04 | Host | Archive circle | P0 | — |
| FR-HOST-05 | Host | Schedule meeting | P0 | — |
| FR-HOST-06 | Host | Edit meeting | P0 | — |
| FR-HOST-07 | Host | Cancel meeting | P0 | RSVPs voided, audit logged |
| FR-HOST-08 | Host | Host dashboard with circle list + next meeting | P0 | — |
| FR-HOST-09 | Host | First-time host pending_review (опц.) | P1 | §27 open |
| FR-REQ-01 | Membership Requests | Submit request (with optional note) | P0 | — |
| FR-REQ-02 | Membership Requests | Pending state visible to user | P0 | non-stigmatizing copy |
| FR-REQ-03 | Membership Requests | Host review queue | P0 | — |
| FR-REQ-04 | Membership Requests | Approve as intro meeting invitation | P0 | — |
| FR-REQ-05 | Membership Requests | Approve directly as member | P0 | per circle policy |
| FR-REQ-06 | Membership Requests | Soft-reject «Не в этот раз» | P0 | — |
| FR-REQ-07 | Membership Requests | Waitlist (when full or composition deferred) | P1 | — |
| FR-REQ-08 | Membership Requests | Blocked users cannot request | P0 | Инв. 6 propagation |
| FR-REQ-09 | Membership Requests | Rate-limit per user per circle | P0 | spam control |
| FR-MEET-01 | Meetings | Next meeting card on Circle Home | P0 | — |
| FR-MEET-02 | Meetings | Meeting detail view | P0 | — |
| FR-MEET-03 | Meetings | RSVP (going / can't make it) | P0 | — |
| FR-MEET-04 | Meetings | Exact location reveal only for approved access | P0 | §14 |
| FR-MEET-05 | Meetings | Attendance confirmation post-meeting | P0 | — |
| FR-MEET-06 | Meetings | No-show tracking (internal) | P0 | Инв. 3 |
| FR-MEET-07 | Meetings | Meeting reminders (push) | P0 | без exact location в push |
| FR-CHAT-01 | Chat | Circle chat for members | P0 | Инв. 2 — group only |
| FR-CHAT-02 | Chat | System messages (lifecycle, reminders) | P0 | — |
| FR-CHAT-03 | Chat | Meeting updates by host | P0 | — |
| FR-CHAT-04 | Chat | Report message | P0 | Инв. 6 |
| FR-CHAT-05 | Chat | Block user (propagates to chat) | P0 | — |
| FR-CHAT-06 | Chat | Admin freeze chat | P1 | audit logged |
| FR-CHAT-07 | Chat | **No open DMs** | P0 | Инв. 2 hard rule |
| FR-SAFE-01 | Safety | Report user | P0 | Инв. 6 |
| FR-SAFE-02 | Safety | Report circle | P0 | — |
| FR-SAFE-03 | Safety | Report meeting | P0 | — |
| FR-SAFE-04 | Safety | Block user | P0 | — |
| FR-SAFE-05 | Safety | Moderation queue (admin) | P0 | — |
| FR-SAFE-06 | Safety | Audit log entries for every moderation-sensitive action | P0 | Инв. 4 |
| FR-SAFE-07 | Safety | Admin restrict / ban user | P0 | — |
| FR-SAFE-08 | Safety | Admin remove circle / meeting | P0 | safety removal |
| FR-SAFE-09 | Safety | AI-assisted triage (signals only) | P1 | Инв. 5 |
| FR-SAFE-10 | Safety | Velocity / rate-limits | P0 | — |
| FR-TRUST-01 | Trust | Verification level tracking (email / phone) | P0 | — |
| FR-TRUST-02 | Trust | Profile completeness signal | P0 | — |
| FR-TRUST-03 | Trust | Attendance reliability tracking | P0 | internal |
| FR-TRUST-04 | Trust | Host reliability tracking | P0 | internal |
| FR-TRUST-05 | Trust | Soft public badges | P0 | §20 |
| FR-TRUST-06 | Trust | **No raw trust score in UI** | P0 | Инв. 3 hard rule |
| FR-BELONG-01 | Belonging | My Circles home | P0 | §16 |
| FR-BELONG-02 | Belonging | Pause participation | P0 | §17 |
| FR-BELONG-03 | Belonging | Leave circle | P0 | §17 |
| FR-BELONG-04 | Belonging | «Not looking for new circles» toggle | P1 | §16 |
| FR-NOTIF-01 | Notifications | Push reminders без exact location | P0 | privacy |
| FR-NOTIF-02 | Notifications | Membership-status notifications | P0 | non-stigmatizing |
| FR-NOTIF-03 | Notifications | **No notifications on other users' transitions** | P0 | Инв. 11 |
| FR-AN-01 | Analytics | Activation taxonomy | P0 | §22 |
| FR-AN-02 | Analytics | Engagement taxonomy | P0 | — |
| FR-AN-03 | Analytics | Safety taxonomy | P0 | — |
| FR-AN-04 | Analytics | No PII in events | P0 | privacy boundary |

---

## 24. Non-Functional Requirements

| Категория | Требование |
|---|---|
| **Mobile-first** | iOS + Android через Expo / React Native; web — только admin (Next.js). |
| **Privacy by design** | area-only, no live location, no exact location в notifications / analytics. |
| **Secure by default** | RLS обязательна для exposed-таблиц; service role только server-side; no real secrets in client bundle. |
| **RLS-first backend** | Все sensitive-доступы через RLS, не через application code. Critical RLS tests обязательны до beta launch. |
| **Auditability** | Все moderation-sensitive actions создают audit-log записи (Инв. 4). |
| **Moderation readiness** | Admin app + moderation queue + ban / restrict / remove flows готовы до открытия беты. |
| **Accessibility** | WCAG 2.1 AA target; contrast, focus states, screen-reader labels. |
| **Performance** | First meaningful screen <2s на 4G; cold start <3s. |
| **Observability** | Crash monitoring (Sentry, после Sprint 1); structured logs server-side. |
| **Crash monitoring** | Sentry для mobile + admin; PII не в crash payloads. |
| **Localization-ready** | i18n infrastructure; первичный язык — RU; EN — позже. |
| **No service role exposure** | `import 'server-only'` гард в admin (уже реализован в Sprint 1). |
| **No sensitive analytics** | Privacy boundary §22.5. |
| **Idempotency** | RSVP, request submission, report submission — идемпотентны. |
| **Backward-compatible migrations** | Schema migrations не должны ломать активных beta-users (после старта). |

---

## 25. Release Criteria для Closed Beta

Closed beta может стартовать когда:

- [ ] invite-only access работает;
- [ ] auth работает (email / Google / Apple / phone);
- [ ] onboarding работает (включая vibe / rhythm / comfort composition);
- [ ] profile completion работает;
- [ ] Circle Discovery работает (feed кругов, не людей);
- [ ] Circle Creation работает (хост создаёт круг + schedule meeting);
- [ ] Membership Request flow работает;
- [ ] Host approval / soft-reject / waitlist работают;
- [ ] approved users могут видеть exact meeting location (per §14);
- [ ] non-approved users **не могут** видеть exact location;
- [ ] Circle Chat работает только для approved members;
- [ ] report / block работает во всех контекстах (Инв. 6);
- [ ] moderation queue в admin app работает;
- [ ] admin может restrict / ban / remove unsafe circle;
- [ ] audit logs работают для всех moderation-sensitive actions (Инв. 4);
- [ ] core analytics taxonomy работает (без PII);
- [ ] crash monitoring подключён (Sentry);
- [ ] **критические RLS тесты не падают**;
- [ ] privacy policy и terms существуют и доступны;
- [ ] **никаких user-facing raw trust scores** (Инв. 3);
- [ ] **никаких open DMs** (Инв. 2);
- [ ] **никакого people-feed / swipe / dating UI** (Анти-дрейф).

---

## 26. MVP Success Metrics

### 26.1 Quantitative (для closed beta cohort'а)

- **60%+** signup users **complete onboarding**;
- **40%+** onboarded users **view at least one circle**;
- **30–40%+** onboarded users **request a place** в круге;
- **25%+** approved users **attend first meeting**;
- **20%+** intro-attended users **attend a second meeting**;
- **stable circles form** over multiple meetings (≥1 круг с ≥4 meetings в один cohort);
- **safety incidents** остаются manageable (точные threshold'ы — в [`/docs/09_MODERATION.md`](09_MODERATION.md) v2).

### 26.2 Qualitative (interviews / surveys)

- users **understand circles** (не путают с событиями / dating-app);
- users **understand approval** как fit protection, не human ranking;
- users **understand location privacy**;
- users **do not perceive product as dating app**;
- users feel safe;
- hosts understand fit protection;
- members describe **belonging**, not just attendance.

---

## 27. Open Product Decisions

Открытые вопросы, требующие закрытия до или в ходе downstream-миграции. Не «додумываются» молча (CLAUDE.md §3).

1. **First beta city / community** — Москва? СПб? Тбилиси? Lisbon?
2. **Phone verification timing** — до request? до approval? до первой встречи?
3. **Comfort composition modes** — точные RU/EN формулировки.
4. **Women-only — P0 или P1?** Gated на валидацию ([doc 26 §14](26_PRODUCT_CORE_V2_DECISION.md)).
5. **How to validate women-only / female-friendly** — sample, copy variants, метод.
6. **Intro meeting vs immediate membership** — default policy для нового круга?
7. **How many meetings before full membership** — 1? 2? host-defined?
8. **Approved member visibility of full member list** — до intro? после intro? только после first meeting?
9. **Host removal permissions** — какие категории требуют admin review?
10. **Pause / return rules** — paused user может RSVP? pause имеет TTL?
11. **Post-meeting membership confirmation** — auto-convert или host-confirm?
12. **No-show dispute flow** — есть ли? как?
13. **First-time host manual review** — все ли новые круги проходят `pending_review`?
14. **Circle / city launch wedge** — какая ниша / какой vibe запускается первым?
15. **Figma v2 prototype scope** — какие screens первыми?

---

## 28. PRD Summary

- Продукт — **circle-first**: основной user-facing объект — круг, не событие.
- **Meetings — операционные instances** под кругами; они унаследовали event-механики, но не центральное место в UX.
- **MVP должен доказать** один loop: Find vibe → Request → Enter safely → Attend → Become → Belong → Grow.
- **Trust / safety / belonging** — приоритеты выше scale / discovery / messaging.
- **Все 16 safety invariants** (Core v2 §35) — binding.
- **Implementation freeze** в силе до завершения migration ([`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)).

**Next document:** [`/docs/02_USER_STORIES.md`](02_USER_STORIES.md) должен быть обновлён до **User Stories v2** ([doc 27 §24 step 4](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)).

---

> Reminder: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2) — **first source of truth**. Этот PRD ему подчинён. Downstream-документы будут обновлены в порядке миграции; до тех пор любая фича сверяется напрямую с Core v2 и этим PRD.
