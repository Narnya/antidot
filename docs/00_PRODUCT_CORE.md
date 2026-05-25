# 00 — Product Core v0.1

> **Status:** Source of truth (v0.1)
> **Owner:** Product
> **Last updated:** 2026-05-21

> ⚠️ **Этот документ — первая истина продукта (first source of truth).**
> Все будущие product, design, architecture и coding решения должны проверяться против этого документа.
> Если другой документ или реализация противоречит Product Core — приоритет у Product Core.

---

## Название

Финальное название продукта:

**Антидот** (латиницей — **Antidot**).

Домен: **antidot.space**.

Семантика: «противоядие» от свайп-культуры, дейтинг-механик и поверхностных онлайн-знакомств без контекста. Имя поддерживает анти-дейтинг-позиционирование и trust-first нарратив продукта.

**Правила использования имени:**

- В русскоязычных текстах — **Антидот**.
- В латинице, коде, идентификаторах, доменах — **Antidot** (без `-e` на конце, чтобы не путали с грамматическим инструментом Antidote от Druide).
- В коде и БД-сущностях по-прежнему использовать **нейтральные технические термины** (`User`, `Event`, `Application` и т.п.) — не привязывать модель данных к бренду.

**Статус проверок:**

- ✅ Роспатент — конфликтующих товарных знаков по «Антидот» / «Antidot» не найдено (проверено 2026-05-21).

**Открытые задачи до публичного запуска:**

1. Зарегистрировать домен `antidot.space` и защитные варианты (`antidot.social`, `antidot.app`, `antidot.me` — насколько доступно).
2. Проверить занятость имени в App Store / Google Play / RuStore.
3. При планировании международного запуска — отдельно проверить WIPO / USPTO в целевых юрисдикциях (РФ-проверка не покрывает международные знаки).

---

## Суть продукта

Мы строим **mobile-first приложение для безопасных офлайн-встреч**.

Пользователь может:

> найти событие рядом → податься на участие → пройти approval у host → прийти на встречу → после события сохранить социальные связи

Главная ценность продукта:

> **Безопасно познакомиться с новыми людьми через реальные офлайн-события.**

Это **не просто event app**.

Это **trust-based social connection platform**.

Главная продуктовая формулировка:

> **Trust infrastructure for modern social connection.**

---

## Что мы на самом деле строим

Мы строим **не календарь мероприятий**.

Мы строим **безопасный социальный мост между незнакомыми людьми**.

Продукт должен помогать людям:

- находить небольшие офлайн-встречи;
- чувствовать себя безопасно;
- понимать, кто будет на событии;
- иметь контроль над участием;
- избегать dating-app dynamics;
- создавать реальные социальные связи;
- возвращаться в продукт через community loop.

---

## Главный product loop

Основной цикл MVP:

> **Discover → Apply → Approve → Attend → Reconnect**

| Шаг | Что происходит |
|-----|----------------|
| **1. Discover** | Пользователь находит событие. |
| **2. Apply** | Пользователь подаётся на участие. |
| **3. Approve** | Host принимает или отклоняет заявку. |
| **4. Attend** | Пользователь приходит на офлайн-встречу. |
| **5. Reconnect** | После события появляются социальные связи. |

Всё MVP должно обслуживать именно этот loop.

> **Правило приоритизации:** если фича не помогает этому циклу — она не нужна в первой версии.

---

## Целевая аудитория первой версии

Основной пользователь — **городские люди 22–38 лет**, которые:

- живут в городе;
- хотят новых знакомств;
- не хотят классический dating;
- не хотят массовые мероприятия;
- предпочитают маленькие безопасные встречи;
- готовы проходить лёгкую верификацию;
- ценят privacy и контроль;
- хотят больше реальных офлайн-связей.

---

## Типичные сценарии

1. Я переехал в новый город и хочу найти людей.
2. Я хочу пойти на небольшую встречу, но не хочу идти к случайным людям без контекста.
3. Я хочу организовать ужин, прогулку или настольные игры для небольшой группы.
4. Я хочу новые социальные связи, но не хочу dating-app dynamics.
5. Я хочу безопасно встретиться с людьми, у которых похожий vibe или интересы.

---

## Роли пользователей

В MVP есть **4 роли**.

### 1. Guest / Visitor

Пользователь ещё не зарегистрирован.

**Может:**
- видеть basic landing;
- зарегистрироваться;
- войти.

**Не может:**
- видеть события;
- создавать события;
- подаваться;
- писать сообщения;
- видеть профили участников.

### 2. User

Обычный зарегистрированный пользователь.

**Может:**
- пройти onboarding;
- создать профиль;
- смотреть события;
- подаваться на события;
- участвовать в чатах approved events;
- жаловаться;
- блокировать других пользователей;
- редактировать профиль;
- управлять privacy-настройками.

### 3. Host

Пользователь, который создаёт события.

**Может:**
- создать событие;
- редактировать событие;
- отменять событие;
- управлять заявками;
- approve/reject участников;
- видеть attendee list;
- отправлять updates;
- модерировать своё событие;
- оставлять post-event feedback.

### 4. Admin / Moderator

Внутренний пользователь платформы.

**Может:**
- видеть reports;
- модерировать пользователей;
- модерировать события;
- банить пользователей;
- ограничивать пользователей;
- смотреть audit logs;
- проверять suspicious activity;
- удалять unsafe events;
- управлять moderation queue.

---

## MVP scope

### Auth
- email auth;
- Google login;
- Apple login;
- phone verification;
- session management;
- protected routes.

### Onboarding
- welcome screen;
- basic profile;
- city;
- interests;
- vibe tags;
- intent selection;
- photos;
- safety rules acceptance.

### Profiles
- profile view;
- profile edit;
- photo management;
- interests;
- vibe/personality tags;
- privacy settings;
- verification status;
- profile completeness.

### Events
- create event;
- edit event;
- cancel event;
- event categories;
- event discovery;
- event details;
- capacity;
- approval required;
- waitlist;
- safe location reveal.

### Applications
- apply to event;
- application note;
- pending state;
- host approval;
- host rejection;
- waitlist;
- attendee management.

### Messaging
- event chat;
- chat only for approved attendees;
- system messages;
- basic message reporting;
- post-event limited chat.

### Safety
- report user;
- report event;
- report message;
- block user;
- moderation queue;
- admin actions;
- audit logs;
- basic AI moderation.

### Trust
- profile completeness;
- verification states;
- attendance history;
- no-show tracking;
- host feedback;
- internal trust score;
- public trust badges.

### Beta
- invite-only access;
- waitlist;
- feature flags;
- analytics;
- crash monitoring;
- privacy policy;
- terms.

---

## Не входит в MVP

В первой версии **НЕ делать**:

- payments;
- tickets;
- paid events;
- large event marketplace;
- open DMs;
- dating mechanics;
- public followers;
- public user ratings;
- exact public map pins;
- live location;
- advanced AI matching;
- premium hosts;
- communities/circles;
- recurring memberships;
- business networking;
- nightlife/party mechanics;
- monetization.

**Причина:** всё это усложняет trust, safety и product focus.

MVP должен доказать один главный loop:

> **Discover → Apply → Approve → Attend → Reconnect.**

---

## Основные категории событий

Для первой версии — **ограниченный список**:

- Coffee / Casual meetup;
- Dinner / Brunch;
- Walk / City exploring;
- Board games;
- Light sports;
- Creative session;
- Community hangout.

Пока **не добавлять**:

- nightlife;
- parties;
- dating events;
- business networking;
- paid workshops;
- large public events.

---

## Главные safety-инварианты

> Эти правила **нельзя нарушать** при разработке. Любой PR/фича, нарушающие инвариант, должны быть остановлены и эскалированы как product decision.

### Инвариант 1 — Exact location is never visible to non-approved users
Пока пользователь не approved, он не видит точное место события.

### Инвариант 2 — No open DMs before shared context
Открытых личных сообщений между случайными людьми нет. Messaging возможен только в контексте события или после реального shared context.

### Инвариант 3 — Raw trust score is never shown to users
Trust score — только внутренний сигнал. Пользователь видит мягкие бейджи:
- Verified;
- Reliable attendee;
- Hosted before;
- Attended events.

Пользователь **не должен** видеть число вроде `Trust score: 74/100`.

### Инвариант 4 — All moderation-sensitive actions must be logged
Любой ban, restriction, report review, event removal, admin decision должен попадать в audit log.

### Инвариант 5 — AI is assistant, not judge
AI может: флагать, сортировать, суммаризировать, подсвечивать риск, помогать moderation triage.
AI **не** единственное основание для серьёзного enforcement. Финальные серьёзные решения доступны для human/admin review.

### Инвариант 6 — Users can block and report easily
Report/block доступен из: профиля, event detail, event chat, attendee list.

### Инвариант 7 — Safety is part of UX, not hidden admin feature
Пользователь должен понимать: кто увидит его профиль; когда откроется location; кто может писать; что делать при проблеме; как работает approval.

### Инвариант 8 — Approval is a core trust mechanic
Host может approve/reject пользователей. Это не баг и не friction — это часть safety и trust layer.

### Инвариант 9 — No exact user location
Продукт не показывает точную текущую локацию пользователя. Допустимы: город, район, approximate area, distance buckets.

### Инвариант 10 — Trust system must not become social credit
Trust score нужен для safety и moderation. Он не должен превращаться в публичный рейтинг людей.

---

## Основные сущности продукта

- User;
- Profile;
- Interest;
- ProfilePhoto;
- Event;
- EventCategory;
- EventApplication;
- EventAttendee;
- EventChatMessage;
- Report;
- Block;
- TrustEvent;
- ModerationAction;
- AuditLog;
- InviteCode;
- Notification.

---

## Event lifecycle

```
draft
  → pending_review
  → live
  → full
  → starting_soon
  → in_progress
  → completed
  → archived
```

Альтернативные terminal statuses:

- `cancelled_by_host`;
- `cancelled_by_admin`;
- `removed_for_safety`.

---

## Application lifecycle

```
pending
  → approved
  → rejected
  → waitlisted
  → cancelled_by_user
  → attended
  → no_show
```

---

## Location privacy logic

| Состояние пользователя | Что видит по location |
|------------------------|------------------------|
| Не зарегистрирован | Не видит события / только landing |
| Зарегистрирован, не onboarded | Нет доступа к events |
| Onboarded | Город, район или approximate area |
| Подал заявку | Approximate area |
| Approved | Точное место или инструкции от host |
| Rejected | Точное место не видно |
| Blocked | Событие скрыто или недоступно |

> Это нужно заложить в **database**, **UI** и **RLS**.

---

## Главные экраны MVP

**Mobile app:**
Welcome · Auth · Onboarding · Home / Discovery · Event Detail · Create Event · My Events · Applications · Host Review · Event Chat · Profile · Edit Profile · Notifications · Report / Block · Settings.

**Admin dashboard:**
Login · Moderation Queue · Reports · User Detail · Event Detail · Moderation Actions · Audit Logs · Suspicious Activity.

---

## Главные метрики MVP

### Activation
- `signup_completed`
- `onboarding_completed`
- `profile_completed`
- `first_event_viewed`
- `first_application_created`
- `first_application_approved`
- `first_event_attended`

### Engagement
- `events_viewed_per_user`
- `applications_per_user`
- `approval_rate`
- `attendance_rate`
- `repeat_attendance_rate`
- `host_created_events`

### Safety
- `reports_per_100_users`
- `blocks_per_100_users`
- `no_show_rate`
- `moderation_response_time`
- `events_removed_for_safety`
- `users_restricted`
- `users_banned`

---

## North Star Metric

> **Trusted offline interactions**

Практическая формула для MVP:

```
completed events × confirmed attendees × safety quality multiplier
```

---

## MVP success criteria

Закрытая бета успешна, если:

- 40%+ onboarded users подают заявку хотя бы на одно событие;
- 25%+ onboarded users посещают хотя бы одно событие в течение 14 дней;
- 20%+ attendees посещают второе событие;
- hosts создают повторные события;
- safety-инциденты остаются управляемыми;
- пользователи описывают продукт как безопасный и социально полезный.

---

## Продуктовые решения на сейчас

| Решение | Значение |
|---------|----------|
| Mobile-first | Да |
| iOS + Android | Да |
| Web для пользователей | Нет (только admin) |
| Auth обязательный | Да |
| Onboarding обязательный | Да |
| Phone verification | Да, до application или до approval |
| Exact location hidden | Да |
| Open DMs | Нет |
| Public user ratings | Нет |
| AI moderation | Да, но не final judge |
| Invite-only beta | Да |
| Raw trust score visible | Нет |
| Paid events | Нет в MVP |

---

## Технические решения на сейчас

Initial stack:

- **Mobile:** React Native + Expo + TypeScript;
- **Backend:** Supabase + PostgreSQL;
- **Auth:** Supabase Auth;
- **Storage:** Supabase Storage;
- **Realtime:** Supabase Realtime;
- **Admin:** Next.js;
- **Analytics:** PostHog;
- **Crash reporting:** Sentry;
- **AI moderation:** OpenAI / Claude;
- **CI/CD:** GitHub Actions + EAS.

---

## Самая важная продуктовая мысль

Мы не строим просто app.

Мы строим:

> **Trust infrastructure for modern social connection.**

Приоритеты MVP (по порядку):

1. Trust;
2. Safety;
3. Offline social loop;
4. Host control;
5. Lightweight discovery;
6. Messaging only with context;
7. Intelligence only after real usage data.

---

> **Напоминание:** этот документ — first source of truth. Все остальные документы (`/docs/01_PRD.md` … `/docs/11_SPRINT_BACKLOG.md`) ссылаются на него и не могут ему противоречить.
