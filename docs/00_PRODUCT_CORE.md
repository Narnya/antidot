# Product Core v2 — Antidot

> **Status:** ✅ **FIRST SOURCE OF TRUTH (v2).**
> Все будущие product, design, architecture и coding решения должны проверяться против этого документа. При конфликте с любым downstream-документом — приоритет у Product Core.
> **Owner:** Product
> **Version:** v2 (2026-05-29)
> **Supersedes:** Product Core v0.1 (event-first, 2026-05-21).
> **Authorized by:** [`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md) (HYBRID ACCEPT, 2026-05-29).
> **Migration sequenced by:** [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md).
> **Companion artifacts:** [`/docs/22_PRODUCT_CORE_RECORE_PROPOSAL.md`](22_PRODUCT_CORE_RECORE_PROPOSAL.md) (RU v0.3), [`/docs/24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md`](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md) (EN proposal), [`/docs/25_PRODUCT_CORE_MANIFESTO.md`](25_PRODUCT_CORE_MANIFESTO.md) (principles).
> **Phase note:** repository is in Infrastructure Phase ([`CLAUDE.md`](../CLAUDE.md) §6, [`/docs/16_PHASE_GATE_TO_INFRASTRUCTURE.md`](16_PHASE_GATE_TO_INFRASTRUCTURE.md)). Product implementation remains frozen until downstream docs are migrated (see §33).

> 💡 **Что изменилось vs v0.1:** примитив сменился с **«событие»** на **«круг»** (user-facing) + **«встреча круга»** (operational). Loop, lifecycles, MVP scope, главные экраны, метрики и часть инвариантов переписаны. Все 10 safety-инвариантов v0.1 сохранены по смыслу и расширены 6 новыми anti-drift инвариантами (см. §35). Имя продукта, домен и техническое решение по стеку — без изменений.

---

## Название (Naming — carried forward from v0.1, binding)

Финальное название продукта:

**Антидот** (латиницей — **Antidot**).

Домен: **antidot.space**.

Семантика: «противоядие» от свайп-культуры, дейтинг-механик и поверхностных онлайн-знакомств без контекста. Имя поддерживает анти-дейтинг-позиционирование и trust-first нарратив продукта.

**Правила использования имени:**

- В русскоязычных текстах — **Антидот**.
- В латинице, коде, идентификаторах, доменах — **Antidot** (без `-e` на конце, чтобы не путали с грамматическим инструментом Antidote от Druide).
- В коде и БД-сущностях по-прежнему использовать **нейтральные технические термины** (`User`, `Circle`, `CircleMembership` и т.п.) — не привязывать модель данных к бренду.

**Статус проверок:**

- ✅ Роспатент — конфликтующих товарных знаков по «Антидот» / «Antidot» не найдено (проверено 2026-05-21).

**Открытые задачи до публичного запуска (carried forward):**

1. Зарегистрировать домен `antidot.space` и защитные варианты (`antidot.social`, `antidot.app`, `antidot.me` — насколько доступно).
2. Проверить занятость имени в App Store / Google Play / RuStore.
3. При планировании международного запуска — отдельно проверить WIPO / USPTO в целевых юрисдикциях (РФ-проверка не покрывает международные знаки).

---

## 1. Status

This document is the **first source of truth** for the product.

Product Core **v2 supersedes** the previous **event-first** Product Core (v0.1). The previous version remains in git history as the v0.1 reference point. **No part of v0.1's event-first model is binding** going forward, except where explicitly carried forward in this document (the Антидот naming block and the technical stack).

**Accepted decision:** HYBRID ACCEPT ([`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md)).

- **User-facing primitive:** **Circle / Круг.**
- **Operational primitive:** **Meeting / Встреча круга.**

The product is now:

- **Circle-first UX.**
- **Meeting-based operations.**
- **Vibe-based discovery.**
- **Context-first communication.**
- **Trust-first safety model.**

---

## 2. Product Definition

Антидот — mobile-first приложение, где люди безопасно входят в небольшие повторяющиеся социальные круги в своём городе. У каждого круга есть **vibe**, **ритм**, **хост**, **вместимость** и **регулярные офлайн-встречи**. Пользователь **запрашивает место**, входит через **approval**, посещает **первую встречу**, становится **участником** круга и наращивает доверие через **повторяемое офлайн-присутствие**.

**Headline (cumulative — both binding):**

- **Trust infrastructure for modern social connection.**
- **Trust infrastructure for modern social belonging.**

Belonging is the durable form of connection. Connection without belonging decays into transactions; belonging without connection is hollow. The product targets the intersection.

**Что мы НЕ строим:**

- Мы **не** строим generic event-app.
- Мы **не** строим people marketplace.
- Мы **не** строим dating app.

Мы строим **operating system for trusted social circles**.

---

## 3. What We Are Actually Building

We are building **small recurring social contexts** where people can belong, meet repeatedly and build trust over time.

Продукт помогает пользователям:

- найти круг с правильной атмосферой;
- безопасно запросить место;
- войти через approval;
- прийти на первую встречу;
- стать частью повторяющегося ритма;
- общаться **в контексте**;
- наращивать доверенный социальный граф;
- **поставить участие на паузу или выйти** без публичного позора.

---

## 4. Core Thesis

Modern urban people have lost their **stable social circles**, their **third places**, and their **repeated live contact**.

- **One-off events create weak ties.**
- **Recurring circles create trust, rhythm, and belonging.**

The product restores small trusted social circles through:

- **vibe** — atmosphere, pace, social energy, hosting style;
- **rhythm** — meetings recur on a known cadence;
- **safe entry** — approval as fit protection (§19);
- **repeated meetings** — co-presence is the substrate of trust;
- **transparent but staged composition** — aggregated → contextual → personal as relationship deepens (§16);
- **context-first communication** — chat exists only inside circles (§18);
- **moderation and trust infrastructure** — invisible foundation, not surface texture.

---

## 5. Core Loop

> **Find the right vibe → Request a place → Enter safely → Attend first meeting → Become part of the rhythm → Belong → Grow trusted graph.**

| Шаг | Что происходит |
|-----|----------------|
| **1. Find the right vibe** | Пользователь находит круг — не людей. Discovery — feed кругов с vibe, ритмом, районом, вместимостью, comfort composition. |
| **2. Request a place** | Пользователь отправляет запрос хосту на место в круге. Один запрос на круг, не на отдельное событие. |
| **3. Enter safely** | Host рассматривает запрос и approve'ит intro-участие или полноценное членство. Approval — это **fit protection**, не ранжирование человека (§19). |
| **4. Attend first meeting** | Пользователь приходит на реальную офлайн-встречу. Точное место раскрывается **только** на эту встречу (intro) или на upcoming meetings (member). |
| **5. Become part of the rhythm** | После первой встречи — конверсия в `member`. Дальше RSVP на каждую встречу без повторного approval. |
| **6. Belong** | Пользователь перестаёт постоянно искать и **начинает жить внутри контекста круга**. «My Circles» становится основной поверхностью продукта. |
| **7. Grow trusted graph** | Повторяемое присутствие создаёт доверие и социальную непрерывность. Граф — мягкий, контекстный, никогда не публичный. |

> **Правило приоритизации:** если фича не служит этому loop — её нет в первой версии.

---

## 6. Core Primitive: Circle

**Circle** — это small recurring social group.

Круг включает:

- **title** — короткое человекочитаемое название;
- **vibe** — vibe-теги (см. §8);
- **theme** — о чём круг (расширенное описание);
- **city** — только город (Инв. 9);
- **approximate area** — район / approximate area / distance bucket (Инв. 9);
- **rhythm** — каденс встреч (еженедельно / раз в две недели / ежемесячно / ad-hoc);
- **capacity** — небольшая ёмкость (4–12 типично);
- **host** — обязателен; владелец круга;
- **comfort composition** — open mixed / female-friendly / women-only / host-defined (§21);
- **approval requirement** — boolean; по умолчанию `true` (Инв. 8);
- **members** — список участников (видимость по §16);
- **next meeting** — derived; ссылка на ближайшую `CircleMeeting`;
- **lifecycle status** — см. §12;
- **safety rules** — host-defined правила круга, прозрачные для участников.

**Круг — это:**

- основной user-facing объект;
- то, что пользователи находят и в чём состоят.

**Круг — это НЕ:**

- public audience;
- follower graph;
- dating pool;
- marketplace listing of people.

---

## 7. Operational Primitive: Meeting

**Meeting (Встреча круга)** — это **scheduled offline instance** круга.

Встреча включает:

- **circle** — родительский круг (обязателен);
- **starts_at / ends_at** — окно встречи;
- **approximate area** — то же приближение, что и у круга (или более точное, по политике круга);
- **exact protected location** — хранится отдельно, раскрывается по §17;
- **RSVP** — going / can't make it (per member);
- **attendance** — attended / no-show (per member, после встречи);
- **status** — см. §13;
- **no-show tracking** — приватный внутренний сигнал (Инв. 3);
- **meeting-specific updates** — апдейты хоста, прикреплённые к встрече.

**События из старой модели — это теперь встречи круга.** Продукт может всё ещё использовать event-подобные механики внутри, но user-facing язык должен использовать:

- **Круг**
- **Встреча круга**
- **Чат круга**
- **Запросить место**

---

## 8. Vibe Over Interests

**Interests are useful, but not enough.**

Пользователи ищут не только «coffee» или «board games». Они ищут **социальную атмосферу**.

Круг может определяться:

- **calm energy** — спокойствие, медленный темп;
- **ambitious energy** — амбиции, релоканты, рост;
- **slow-life rhythm** — без давления, без срочности;
- **emotional openness** — глубокие разговоры, не small talk;
- **intellectual conversation** — книги, идеи, дебаты;
- **creative atmosphere** — искусство, эксперимент;
- **introvert-friendly format** — маленькие группы, тихие правила;
- **international community** — англоязычные, релоканты, expats;
- **low-pressure social environment** — нет evaluation mode.

**Примеры (Russian, illustrative, curated tag set — не free text):**

- спокойные разговоры за кофе;
- slow brunch круг;
- амбициозные релоканты;
- тихие городские прогулки;
- творческие интроверты;
- открытые разговоры без давления.

**Avoid (hard product rules):**

- elitist labels («exclusive», «high-status»);
- attractiveness framing;
- dating-coded labels («singles», «looking»);
- popularity labels («top circles», leaderboards);
- identity ranking.

---

## 9. Social Temperature

The product must be **safe, but not sterile**.

- Too much control → kills social magic (cold wellness club).
- Too much randomness → chaos (the failure mode of event marketplaces).

The product supports **controlled unpredictability**.

**Allowed later** (only after the core circle loop is validated):

- guest seats (с поручителем);
- crossover circles;
- seasonal gatherings;
- trusted introductions;
- rotating host moments.

**Not allowed (ever):**

- random cold DMs (Инв. 2);
- swipe;
- people marketplace;
- open profile browsing;
- dating mechanics;
- popularity ranking.

«Температура» — **динамический регулятор**, а не фиксированный параметр. На раннем этапе теплица плотнее; по мере накопления доверия — больше serendipity unlocks.

---

## 10. User Roles

### Guest / Visitor

Не аутентифицирован.

**Может:**
- видеть landing / welcome;
- зарегистрироваться;
- встать в waitlist;
- использовать invite code.

**Не может:**
- видеть круги;
- запрашивать место;
- видеть участников;
- писать в чаты.

### User

Аутентифицирован и прошёл onboarding.

**Может:**
- создавать / редактировать профиль;
- discover кругов;
- запрашивать место в круге;
- жаловаться / блокировать;
- управлять privacy.

### Circle Member (new role vs v0.1)

Approved участник круга.

**Может:**
- видеть member-safe контекст круга;
- видеть upcoming meetings;
- RSVP на встречи;
- видеть exact location встречи по политике (§17);
- читать / писать в чат круга;
- ставить участие на паузу или выйти.

### Circle Host

Пользователь, создающий и ведущий круг (continuous role, не per-event).

**Может:**
- создать круг;
- рассматривать membership requests;
- approve / reject / waitlist;
- управлять составом;
- планировать встречи;
- обновлять детали круга;
- модерировать контекст круга в рамках политики платформы.

### Admin / Moderator

Внутренняя роль платформы.

**Может:**
- разбирать reports;
- модерировать пользователей / круги / встречи / сообщения;
- ограничивать / банить;
- удалять unsafe круги (`removed_for_safety`);
- замораживать чат круга;
- видеть audit logs.

### System (named explicitly in v2)

Автоматические jobs, lifecycle transitions (`completed`, `starting_soon`), напоминания, RSVP locks, AI-assist сигналы.

**Не может:**
- быть финальным судьёй для серьёзного enforcement (Инв. 5 / Анти-дрейф; CLAUDE.md §2.11).

---

## 11. Membership Lifecycle

```
none
  → requested
  → approved_for_intro_meeting
  → intro_attended
  → member
  → paused
  → left
  → removed
  → removed_for_safety
  → banned_from_circle
```

### `none`
У пользователя нет отношений с кругом.

### `requested`
Пользователь запросил место. Видит «запрос у хоста». Локация — только area.

### `approved_for_intro_meeting`
Пользователь приглашён на первую встречу — **не полноценный member пока**. Видит **только** exact location этой одной встречи.

### `intro_attended`
Пользователь посетил intro-встречу. System-state перед конверсией.

### `member`
Пользователь — часть круга. Видит upcoming meeting locations, читает / пишет в circle chat.

### `paused`
Временно поставил участие на паузу. Локации не видит. Чат — read-only или muted (определяется политикой круга).

### `left`
Тихо вышел. Доступа нет. **Никакого публичного сигнала** другим участникам.

### `removed`
Host прекратил участие. Non-public copy. Appeal path доступен (§23).

### `removed_for_safety`
Admin прекратил доступ по safety-причине. **Audit log обязателен** (Инв. 4).

### `banned_from_circle`
Пользователь не может взаимодействовать с этим кругом. Admin-only.

**Важно (binding):**

- **No public shame** (Анти-дрейф §35.12).
- **No public rejection / removal labels.**
- **No betrayal mechanics** (Анти-дрейф §35.11).

Другие участники круга видят максимум: **«Состав круга обновился.»**

---

## 12. Circle Lifecycle

```
draft
  → pending_review
  → live
  → paused
  → full
  → archived
  → removed_for_safety
```

### `draft`
Host создаёт круг. Виден только хосту.

### `pending_review`
Круг ждёт ревью (если политика требует). Не в discovery.

### `live`
Круг discoverable, принимает запросы.

### `paused`
Временно неактивен. Существующие участники остаются. Не в discovery.

### `full`
Не принимает новых участников. Видно в discovery как «full», запросы недоступны (опционально waitlist).

### `archived`
Host завершил круг. Доступ только как историческая запись.

### `removed_for_safety`
Admin удалил по safety-причине. **Audit log обязателен** (Инв. 4).

---

## 13. Meeting Lifecycle

```
scheduled
  → starting_soon
  → in_progress
  → completed
  → cancelled
  → removed_for_safety
```

Meetings — recurring или scheduled instances под кругом. **Exact meeting location остаётся защищённой** (Инв. 1) и раскрывается только по §17.

Detailed transition matrix (кто может ставить, что пользователь видит, location/chat access, trust events) — в [`/docs/24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md`](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md) §13. Эта таблица — авторитетная для design pass.

---

## 14. Belonging Mode

> **Если пользователь нашёл свой круг и перестал искать — продукт успешен.**

**Belonging is a success state, not churn.**

Продукт поддерживает пользователей, которые **больше не ищут активно**:

- **My Circles** — главный home surface для users with ≥1 circle;
- next meeting card;
- RSVP;
- circle chat;
- reminders;
- member-safe context;
- pause participation (§20);
- leave quietly (§20);
- occasional guest / crossover opportunities **later**, gated.

**No infinite discovery pressure** (Анти-дрейф §35.14).

---

## 15. No Betrayal Mechanics

Users могут:

- **belong to multiple circles**;
- **leave** circles;
- **pause** participation;
- **join another circle**.

Продукт **никогда** не создаёт:

- «betrayed circle» механики;
- public transition history;
- публичные сигналы «ушёл в другой круг»;
- публичный позор за уход;
- public removal labels.

Другие участники видят максимум: **«Состав круга обновился.»**

Никаких уведомлений «X покинул круг», «X removed», «X переметнулся».

---

## 16. Composition Visibility

### Before request

Пользователь видит:

- circle vibe;
- rhythm;
- approximate area;
- size range (агрегированное);
- comfort composition (open mixed / female-friendly / women-only label);
- host safe profile (display name + verification badge);
- high-level правила круга.

Пользователь **не видит**:

- full member list;
- личные профили участников;
- exact location;
- personal data других пользователей.

### After request (waiting for host)

Пользователь видит:

- request status;
- расширенный circle context, theme, hosting style;
- правила;
- **ещё нет full member list**;
- ещё нет exact location.

### After approval (intro meeting или member)

Пользователь видит:

- safe profiles участников по политике (display name, photo, verification badge, soft attendance badge);
- meeting details;
- circle chat;
- exact location для разрешённой встречи (intro: одна встреча; member: upcoming).

### Never shown to anyone non-admin

- raw trust score (Инв. 3);
- report counts;
- block counts;
- rejection / removal history;
- список других кругов пользователя;
- internal moderation notes.

---

## 17. Location Privacy

**Critical invariant (Инв. 1):** **Exact meeting location is never visible to non-approved users.**

| Состояние пользователя vs круг/встреча | Что видно по location |
|---|---|
| Не зарегистрирован | Нет доступа / только landing |
| Зарегистрирован, не onboarded | Нет доступа к кругам |
| Onboarded, нет отношения к кругу | **Только area** |
| `requested` / `waitlisted` / `rejected` | **Только area** |
| `approved_for_intro_meeting` | **Exact location только этой intro-встречи** |
| `member` | **Exact location upcoming meetings** в окне раскрытия |
| `paused` | **Только area** (без upcoming locations) |
| `left` / `removed` / `removed_for_safety` / `banned_from_circle` | **Нет future exact location** |
| Заблокированный пользователь | Круг скрыт или недоступен |

**No exact live user location** (Инв. 9). Никогда. Допустимо: город, район, approximate area, distance bucket.

---

## 18. Communication Model

**MVP:**

- **circle chat** — групповой чат участников круга;
- **meeting updates** — апдейты хоста, прикреплённые к встрече;
- **system messages** — lifecycle, RSVP locks, reminders;
- **report message** (Инв. 6);
- **block user** (Инв. 6);
- **admin freeze chat** — admin может заморозить чат круга как moderation action (audit log обязателен).

**НЕ в MVP:**

- open 1:1 DMs (Инв. 2);
- cold messages;
- direct messaging from profile;
- «написать участнику» до shared context.

**P1 possible** (только после валидации core circle loop):

**Mutual opt-in 1:1 только после shared context.** Правила для будущего 1:1:

- оба участника **состоят в одном круге**;
- оба участника **посетили хотя бы одну общую встречу**;
- **оба opt in** до создания канала;
- **нет свободного custom first message** до acceptance — получатель видит структурный opt-in prompt;
- report / block всегда доступны;
- нет pressure-signals (no read receipts, no «typing»).

**Hard rule (Инв. 2):** **no cold DMs**. Не подлежит дрейфу.

---

## 19. Approval Philosophy

**Approval is fit protection, not human ranking.**

Approval защищает:

- **circle size** (маленькие группы — это сознательный выбор);
- **circle rhythm**;
- **comfort**;
- **safety**;
- **format**.

Approval **не должен** ощущаться как:

- popularity contest;
- dating rejection;
- elitist gatekeeping;
- «you are not good enough».

**Preferred Russian copy:**

> «Подтверждение нужно, чтобы сохранить формат и комфорт круга — не для оценки людей.»

**Avoid:**

- ~~«Вас отклонили»~~
- ~~«Вы не подошли»~~
- ~~«Вас исключили»~~

**Prefer:**

- **«Не в этот раз»**
- **«Постоянное участие не было подтверждено»**
- **«Участие завершено»**

UX implications:

- avoid harsh rejection language;
- explain that small circles need confirmation **to protect the format**;
- никогда публично не показывать rejection history (Инв. 10; §16).

---

## 20. Pause / Leave / Removal

Rules:

- **pause** должен быть доступен до hard exit, где это применимо;
- **leaving** — приватно;
- **removal** — приватно;
- removed user **не должен** публично позориться;
- **safety removals** создают moderation / audit запись (Инв. 4);
- **host removals** должны иметь категорию причины (internal, для signal + appeal);
- частые host removals могут стать internal safety-сигналом по хосту (никогда не публичным).

UX language (binding для user-facing copy):

- **«Поставить участие на паузу»**
- **«Выйти из круга»**
- **«Участие завершено»**
- **«Состав круга обновился»**

---

## 21. Comfort Composition

Comfort composition помогает пользователям понимать социальную среду круга.

Possible modes:

- **open mixed** — default;
- **female-friendly** — host-curated composition; explicit copy об ожидаемом поведении;
- **women-only** — только пользователи, self-identified как женщины в onboarding;
- **host-defined comfort rules** — нон-discriminatory rules within platform policy.

**Important:** women-only / female-friendly mechanics **require validation with women before implementation** ([`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md) §14).

**Risks (must be addressed):**

- false sense of safety;
- verification expectations;
- moderation burden;
- misrepresentation;
- legal / platform policy considerations;
- over-bureaucratization.

**Language:** prefer **«комфортный состав»**, **avoid fear-based framing**.

---

## 22. Trust System

Trust remains **internal and contextual**.

**Signals (all internal — Инв. 3):**

- profile completeness;
- verification level (none / email / phone / future identity);
- attendance reliability across meetings;
- no-show tracking;
- circle membership history (continuity, breadth);
- host reliability;
- reports / blocks;
- moderation actions.

**Public signals allowed (soft positive badges only):**

- **Проверен**
- **Надёжный участник**
- **Уже проводил встречи**
- **Участвовал во встречах**

**Forbidden (hard product rules):**

- raw trust score (число);
- public numeric ratings;
- public negative labels;
- no-show labels;
- report / block counts;
- popularity rankings;
- social credit mechanics (Инв. 10).

Trust is **recoverable from mistakes** — past missteps must not become permanent public labels.

---

## 23. Safety System

**Safety is part of product UX** (Инв. 7), не скрытая admin-фича.

**P0 safety includes:**

- report user;
- report circle;
- report meeting;
- report message;
- block user;
- hidden exact location (Инв. 1);
- approval (Инв. 8);
- moderation queue;
- audit logs (Инв. 4);
- admin actions;
- AI assistive moderation.

**AI rule (Инв. 5 / CLAUDE.md §2.11):**

AI может **флагать, суммаризировать, сортировать, подсвечивать риск**.
AI **не** является финальным судьёй для серьёзного enforcement. Серьёзные решения требуют human / admin review.

---

## 24. Anti-Creep Mechanics

Hard rules (binding):

- **no open DMs** (Инв. 2);
- **no cold outreach**;
- **no people-first feed**;
- **no swipe**;
- **no public attendee shopping**;
- **no exact location before approval** (Инв. 1);
- **no live location** (Инв. 9);
- **no «who viewed me»**;
- **no public follower graph**;
- **no public ratings** (Core rule from v0.1, preserved);
- **no raw trust score** (Инв. 3);
- **no dating mechanics** (Core rule from v0.1, preserved).

Социальные продукты деградируют **постепенно**: «добавим DM» → «добавим лайки» → «добавим discover people nearby» → внезапно Tinder/Meetup-гибрид. **Эти правила существуют, чтобы этого не случилось.**

---

## 25. MVP Scope v2

### Access

- invite-only beta;
- waitlist;
- email auth;
- Google login;
- Apple login;
- phone verification (timing — open в §32);
- session management;
- protected routes.

### Onboarding

- city / area (area only — Инв. 9);
- interests;
- **vibe** (primary signal — §8);
- preferred **rhythm** (weekly / biweekly / monthly / flexible);
- **comfort composition** (open mixed / female-friendly / women-only — gated by §21);
- **group size comfort**;
- **host willingness** (opt-in, P1);
- photos;
- safety principles acceptance;
- verification (email / phone level).

### Profiles

- editable profile;
- photos;
- interests / vibe;
- verification states;
- soft badges;
- privacy.

### Circles

- create circle;
- edit circle;
- pause circle;
- circle detail;
- rhythm;
- capacity;
- approximate area;
- comfort composition;
- lifecycle (§12).

### Membership

- request place;
- approve / reject / waitlist;
- intro meeting state;
- member state;
- pause / leave / remove.

### Meetings

- next meeting card;
- RSVP;
- exact location reveal **only for approved users** (Инв. 1, §17);
- attendance;
- no-show tracking (internal, Инв. 3).

### Communication

- circle chat;
- system messages;
- report message (Инв. 6);
- **no open DMs in MVP** (Инв. 2).

### Safety

- report / block (Инв. 6);
- moderation queue;
- audit logs (Инв. 4);
- admin actions;
- AI assistive only (Инв. 5).

### Trust

- verification states;
- attendance reliability;
- no-show tracking;
- host reliability;
- internal trust score (never shown — Инв. 3);
- public soft badges (§22).

### Beta

- invite-only access;
- analytics (taxonomy в §29);
- crash monitoring;
- privacy policy;
- terms.

---

## 26. Explicit Non-Goals

В первой версии (MVP) **НЕ делать**:

- standalone event marketplace;
- people marketplace;
- swipe;
- open DMs (Инв. 2);
- dating mechanics;
- romantic matching;
- likes / matches;
- public ratings;
- raw trust score (Инв. 3);
- public followers;
- exact public map pins (Инв. 1);
- live location (Инв. 9);
- payments;
- tickets;
- paid events;
- promoted circles;
- nightlife / party mechanics;
- streams / online broadcast mode;
- complex AI matching;
- B2B monetization.

**Причина:** всё это усложняет trust, safety и product focus. MVP должен доказать один главный loop:

> **Find vibe → Request → Enter → Attend → Belong → Grow trusted graph.**

---

## 27. Core Entities v2

System entities (conceptual; schema blueprint — в [`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) после миграции на v2):

- `User`
- `Profile`
- `ProfilePhoto`
- `Interest`
- `VibeTag`
- `City`
- **`Circle`**
- **`CircleMembershipRequest`**
- **`CircleMembership`**
- **`CircleMeeting`**
- **`MeetingLocation`** (protected, RLS-gated)
- **`MeetingRSVP`**
- **`MeetingAttendance`**
- **`CircleChatMessage`**
- `Report`
- `Block`
- `TrustEvent`
- `UserTrustSummary`
- `ModerationAction`
- `AuditLog`
- `InviteCode`
- `WaitlistEntry`
- `Notification`

**Removed as core (vs v0.1):**

- ~~`Event`~~ → заменено на `Circle` + `CircleMeeting`;
- ~~`EventCategory`~~ → вибы + categories теперь часть `Circle`;
- ~~`EventApplication`~~ → `CircleMembershipRequest`;
- ~~`EventAttendee`~~ → `CircleMembership` + `MeetingAttendance`;
- ~~`EventChatMessage`~~ → `CircleChatMessage`.

**Категории кругов** (carried forward from v0.1, restricted list):

- Coffee / Casual meetup;
- Dinner / Brunch;
- Walk / City exploring;
- Board games;
- Light sports;
- Creative session;
- Community hangout.

**Пока НЕ добавлять:** nightlife · parties · dating events · business networking · paid workshops · large public events.

---

## 28. Main Screens v2

**Mobile:**

- Welcome
- Invite
- Auth
- Onboarding
- Safety Principles
- **Circle Discovery**
- **Circle Detail**
- **Request Place**
- **Membership Pending**
- **Intro Meeting Approved**
- **My Circles**
- **Circle Home** (belonging mode surface)
- **Circle Meeting Detail**
- **Circle Chat**
- **Host Circle Dashboard**
- **Membership Requests**
- **Request Detail**
- **Public Safe Profile**
- **Pause / Leave** modal (non-stigmatizing copy)
- Report
- Block
- Settings

**Admin:**

- Login
- **Moderation Queue**
- Report Detail
- User Detail
- **Circle Detail**
- **Meeting Detail**
- Message Detail
- Audit Logs
- Suspicious Activity

> The screen rebuild itself happens in Figma after [`/docs/04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md) is migrated to v2 ([`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md) §24 step 6).

---

## 29. Metrics v2

**North Star — candidate (final choice during [`/docs/10_ANALYTICS.md`](10_ANALYTICS.md) v2 update):**

- **A:** trusted recurring offline interactions;
- **B:** active trusted circles with confirmed recurring attendance.

### Activation

- `signup_completed`
- `onboarding_completed`
- `profile_completed`
- `first_circle_viewed`
- `first_circle_request_created`
- `first_circle_request_approved`
- `first_meeting_attended`

### Engagement

- `active_circle_members`
- `circle_chat_opened`
- `meeting_rsvp_yes`
- `meeting_attended`
- `repeat_meeting_attendance`
- `circle_retention`

### Safety

- `reports_per_100_users`
- `reports_per_circle`
- `blocks_per_100_users`
- `moderation_response_time`
- `circles_removed_for_safety`
- `users_restricted`
- `users_banned`
- `no_show_rate`

**Forbidden metric directions** (would create wrong incentives):

- «circles per user» as a KPI (creates infinite discovery pressure — §35.14);
- public popularity counters;
- any user-facing trust score.

---

## 30. Success Criteria

Closed beta is successful if:

- users **understand circles** (не путают с событиями или dating-app);
- users **understand approval** (как fit protection, не как human ranking);
- users **understand location privacy** (когда раскрывается, кому);
- users **do not perceive the product as a dating app**;
- users **can find report / block** легко;
- hosts **understand membership review** и используют его осознанно;
- circle members **attend repeated meetings**;
- users **feel safe enough to return**;
- users **describe belonging**, не just attendance;
- at least some circles **become stable over multiple meetings**.

---

## 31. Product Decisions Now Fixed

**Fixed (binding):**

| Decision | Value |
|---|---|
| Primary user-facing primitive | **Circle** |
| Operational primitive | **Meeting** |
| Standalone event marketplace in MVP | **No** |
| Open DMs in MVP | **No** (Инв. 2) |
| People-first feed | **No** |
| Raw trust score visible | **No** (Инв. 3) |
| Public user ratings | **No** |
| Exact meeting location before approval | **No** (Инв. 1) |
| User may belong to multiple circles | **Yes** |
| Leaving / removal public | **No** (§15, §20) |
| Betrayal mechanics | **No** |
| Belonging is success state | **Yes** |
| Mobile-first | **Yes** |
| iOS + Android | **Yes** |
| Web for users | **No** (only admin) |
| Auth required | **Yes** |
| Onboarding required | **Yes** |
| Phone verification | **Yes** (timing — see §32) |
| AI moderation | **Yes, but not final judge** (Инв. 5) |
| Invite-only beta | **Yes** |
| Paid events | **No** in MVP |

---

## 32. Open Product Decisions

To be resolved during downstream migration ([`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)) or via separate Product decisions:

- first beta city / community;
- exact **phone verification timing** (before request? before approval? before meeting?);
- exact **comfort composition modes** wording in RU/EN;
- **whether women-only is P0 or P1** (gated on validation — §21);
- **how to validate** women-only / female-friendly (sample, copy variants);
- **intro meeting vs immediate membership** as default circle policy;
- **how many meetings before full membership** (1? 2? host-defined?);
- whether **approved members see full member list before first meeting** (privacy trade-off);
- exact **host removal permissions** (which categories, which require admin review);
- **pause / return rules** (can paused user RSVP? does pause expire?);
- **post-meeting membership confirmation** (auto-convert or host-confirm?);
- **no-show dispute** flow;
- **first-time host manual review** (do all new circles go through `pending_review`?);
- exact event / circle / встреча **language in Russian UI** (final copy decisions);
- **first Figma v2 prototype scope** (which screens land first).

> Эти вопросы открыты сознательно. Их закрытие — задача downstream миграции и кастдева, а не молчаливое «додумывание» (CLAUDE.md §3).

---

## 33. Implementation Freeze Note

Product implementation remains **paused** until the dependent docs are updated per [`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md):

1. **PRD v2** ([`/docs/01_PRD.md`](01_PRD.md));
2. **User Stories v2** ([`/docs/02_USER_STORIES.md`](02_USER_STORIES.md));
3. **User Flows v2** ([`/docs/03_USER_FLOWS.md`](03_USER_FLOWS.md));
4. **Database Schema v2** ([`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md));
5. **Security / RLS v2** ([`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md));
6. **Sprint Backlog v2** ([`/docs/11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md));
7. **CLAUDE.md** updated to reference Core v2.

**Infrastructure remains valid** — Sprint 1 PASS ([`/docs/21_SPRINT_1_INFRASTRUCTURE_REVIEW.md`](21_SPRINT_1_INFRASTRUCTURE_REVIEW.md)), [`/docs/17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md), env / config / testing strategy.

**Generic auth planning** may continue **only if** it does not depend on onboarding / product fields (sessions, protected routes, banned gate, invite gate, waitlist are primitive-agnostic).

---

## 34. Summary

Product Core v2 defines a **circle-first product**.

> We are building **trusted recurring social circles**, not a generic event marketplace or dating app.

The core of the product is **belonging through repeated safe offline context**.

**Приоритеты MVP (по порядку):**

1. **Trust** (safety foundation, invariants 1–10 + anti-drift 11–16);
2. **Safety** (visible, but not bureaucratic);
3. **Offline circle loop** (Find vibe → Request → Enter → Attend → Belong);
4. **Host control** (approval as fit protection);
5. **Lightweight discovery** (circles, not people);
6. **Communication only with context** (circle chat only in MVP);
7. **Intelligence only after real usage data** (no premature matching / graph mechanics).

---

## 35. Главные safety-инварианты (Safety Invariants)

> Эти правила **нельзя нарушать** при разработке. Любой PR/фича, нарушающие инвариант, должны быть остановлены и эскалированы как product decision ([`CLAUDE.md`](../CLAUDE.md) §2, §3).

### Инварианты 1–10 — carried forward from v0.1 (rephrased for circle/meeting scope)

#### Инвариант 1 — Exact location is never visible to non-approved users

Пока пользователь не имеет approved-доступа к встрече (`approved_for_intro_meeting` для одной встречи или `member` для upcoming meetings), он не видит точное место встречи. См. §17.

#### Инвариант 2 — No open DMs before shared context

Открытых личных сообщений между случайными людьми нет. Messaging возможен только в чате круга. P1 — mutual opt-in 1:1 только после shared context (§18).

#### Инвариант 3 — Raw trust score is never shown to users

Trust score — только внутренний сигнал. Пользователь видит мягкие бейджи: Проверен · Надёжный участник · Уже проводил встречи · Участвовал во встречах. Никаких чисел.

#### Инвариант 4 — All moderation-sensitive actions must be logged

Любой ban, restriction, report review, circle / meeting removal, membership removal (host или admin), admin decision, freeze chat — попадает в audit log.

#### Инвариант 5 — AI is assistant, not judge

AI может: флагать, сортировать, суммаризировать, подсвечивать риск, помогать moderation triage. AI **не** единственное основание для серьёзного enforcement. Финальные серьёзные решения доступны для human / admin review.

#### Инвариант 6 — Users can block and report easily

Report / block доступен из: профиля, circle detail, meeting detail, circle chat, attendee list, any message.

#### Инвариант 7 — Safety is part of UX, not hidden admin feature

Пользователь должен понимать: кто увидит его профиль; когда откроется location; кто может писать; что делать при проблеме; как работает approval (как fit protection — §19).

#### Инвариант 8 — Approval is a core trust mechanic

Host может approve / reject пользователей. Это не баг и не friction — это часть safety и trust layer. Approval framed как **fit protection**, не human ranking (§19).

#### Инвариант 9 — No exact user location

Продукт не показывает точную текущую локацию пользователя. Допустимы: город, район, approximate area, distance buckets. **No live location** ever.

#### Инвариант 10 — Trust system must not become social credit

Trust нужен для safety и moderation. Он не должен превращаться в публичный рейтинг людей или экспонироваться другим пользователям как ranking.

### Инварианты 11–16 — new in v2 (circle-specific anti-drift)

Promoted from [`/docs/22_PRODUCT_CORE_RECORE_PROPOSAL.md`](22_PRODUCT_CORE_RECORE_PROPOSAL.md) §12, [`/docs/24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md`](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md) §11/§26, [`/docs/25_PRODUCT_CORE_MANIFESTO.md`](25_PRODUCT_CORE_MANIFESTO.md) §28; adopted by [`/docs/26_PRODUCT_CORE_V2_DECISION.md`](26_PRODUCT_CORE_V2_DECISION.md) §16.

#### Инвариант 11 — No betrayal mechanics

Система **никогда** не показывает «пользователь ушёл в другой круг» или эквивалент. Никаких уведомлений о transition между кругами. См. §15.

#### Инвариант 12 — No public leave / removal / rejection labels

Список участников просто перестаёт показывать пользователя. **Никаких** меток «removed», «rejected», «оставил круг». Максимум для других — «Состав круга обновился». См. §11, §15, §20.

#### Инвариант 13 — No people marketplace

Пользователи находят **круги**, не browsable-каталог людей. Никакого people-first discovery. Никакого «who viewed me». Никакого профиль-shopping вне контекста.

#### Инвариант 14 — No infinite discovery pressure

Belonging mode — **first-class success state**, не retention failure. Продукт не должен подталкивать пользователей вступать в больше кругов, gamify circle count, или nag о новых кругах. См. §14.

#### Инвариант 15 — Circle membership is not ownership

Круги не владеют людьми. Хосты курируют круги, не людей. Pause / leave — нормальное состояние.

#### Инвариант 16 — A user may belong to multiple circles

Нет exclusivity, нет «primary circle» badge, нет betrayal на уход в другой круг. См. §15.

---

## 36. Технические решения (preserved from v0.1)

Initial stack (без изменений по сравнению с v0.1):

- **Mobile:** React Native + Expo + TypeScript;
- **Backend:** Supabase + PostgreSQL;
- **Auth:** Supabase Auth;
- **Storage:** Supabase Storage;
- **Realtime:** Supabase Realtime;
- **Admin:** Next.js;
- **Analytics:** PostHog (not yet connected);
- **Crash reporting:** Sentry (not yet connected);
- **AI moderation:** OpenAI / Claude (not yet connected);
- **CI/CD:** GitHub Actions + EAS.

**Architecture:** **Modular Monolith** ([`/docs/17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md)) — без изменений. Primitive change — продуктовое решение, не архитектурное.

**Sprint 1 infrastructure** — PASS ([`/docs/21_SPRINT_1_INFRASTRUCTURE_REVIEW.md`](21_SPRINT_1_INFRASTRUCTURE_REVIEW.md)) — не затронут этим обновлением.

---

> **Напоминание:** этот документ — **first source of truth (v2)**. Все downstream-документы ([`01_PRD.md`](01_PRD.md), [`02_USER_STORIES.md`](02_USER_STORIES.md), [`03_USER_FLOWS.md`](03_USER_FLOWS.md), [`04_FIGMA_PROTOTYPE_PLAN.md`](04_FIGMA_PROTOTYPE_PLAN.md), [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md), [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md), [`08_TRUST_SYSTEM.md`](08_TRUST_SYSTEM.md), [`09_MODERATION.md`](09_MODERATION.md), [`10_ANALYTICS.md`](10_ANALYTICS.md), [`11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md), [`13_DESIGN_HANDOFF.md`](13_DESIGN_HANDOFF.md)) на момент написания этого файла **ещё содержат event-first формулировки** v0.1. Это известное состояние миграции ([`/docs/27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md`](27_PRODUCT_CORE_V2_DOCS_UPDATE_PLAN.md)). При конфликте — приоритет у этого документа (Product Core v2). Downstream-документы будут приведены в соответствие в ходе миграции; до тех пор любая фича / реализация должны проверяться напрямую против Product Core v2.
