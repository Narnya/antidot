# Figma Prototype Plan v1 — Social Events App

> **Status:** v1 (prototype plan for closed beta)
> **Owner:** Product / Design
> **Last updated:** 2026-05-18

---

## 1. Source of Truth

- Документ основан на [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md), [`/docs/01_PRD.md`](01_PRD.md), [`/docs/02_USER_STORIES.md`](02_USER_STORIES.md), [`/docs/03_USER_FLOWS.md`](03_USER_FLOWS.md).
- **[`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth.** При конфликте приоритет у Product Core.
- Figma-прототип **не должен нарушать safety-инварианты** (Инварианты 1–10).
- Все экраны поддерживают позиционирование **trust-based social connection platform**.
- Прототип **не должен** превращать продукт в dating app или generic event marketplace.
- Нерешённые развилки — в [§22 Open Design Questions](#22-open-design-questions), не «додуманы» молча (CLAUDE.md §3).

---

## 2. Prototype Goal

Первый Figma-прототип доказывает **product logic, не красоту UI**. Главная проверка — основной loop:

**Discover → Apply → Approve → Attend → Reconnect.**

User path:
```
signup → onboarding → discover event → view event → apply
→ wait for approval → get approved → see exact location
→ enter event chat → attend → reconnect
```

Host path:
```
create event → receive applications → review applicant → approve/reject → manage attendees
```

Safety path:
```
report → block → moderation queue → admin action
```

Прототип успешен, если тестировщик: (а) понимает, что это **не dating app**; (б) понимает approval; (в) понимает, почему location скрыта; (г) находит report/block без подсказки.

---

## 3. Prototype Principles

1. Mobile-first.
2. Safety is visible.
3. Trust before scale.
4. Calm social UX, not addictive UX.
5. No dating-app visual language.
6. No exact location before approval.
7. No open DMs.
8. Approval shown as trust feature, not friction.
9. Statuses must be clear.
10. Empty states guide action.
11. Sensitive actions need confirmation.
12. Admin/safety flows exist even in early prototype.

---

## 4. Figma File Structure

| Страница | Содержит |
|----------|----------|
| **00 — Cover / Product Context** | Product one-liner; product loop; key safety rules; prototype scope. |
| **01 — Foundations** | Typography draft; color roles; spacing scale; icon usage; accessibility notes; tone of voice. |
| **02 — Components** | Buttons; inputs; cards; event/profile cards; trust/status badges; modals; empty states; bottom nav; headers; notification items; report reason selector; chat bubbles. |
| **03 — Guest + Onboarding** | Welcome; Signup/Login; Invite Code; Waitlist; Onboarding steps; Profile Preview. |
| **04 — User Core Loop** | Home/Discover; Filters; Event Detail (states); Apply; Pending; Approved; Event Chat; Post-event. |
| **05 — Host Flow** | Create Event; Event Preview; Hosted Dashboard; Applications List; Applicant Detail; Approve/Reject; Attendee Management. |
| **06 — Safety** | Public Profile; Report User/Event/Message; Block User; safety confirmation states. |
| **07 — Settings + Privacy** | Settings; Privacy; Manage blocked users; Data export; Delete account. |
| **08 — Admin Dashboard** | Admin Login; Moderation Queue; Report/User/Event/Message Detail; Audit Logs; Action Modal. |
| **09 — Prototype Links** | Clickable prototype maps; main flow links; notes for testing. |

---

## 5. Design System Direction

> Не финальный brand, а practical MVP direction.

### Visual Tone
Calm · trustworthy · warm · social but **not romantic** · modern but not flashy · safety-forward без ощущения паранойи.

### Typography
Чёткий sans-serif; сильная иерархия (H1/H2/H3/body/caption); читаемый body (≥16pt); доступные размеры; статус-лейблы выделены весом, не только цветом.

### Color Roles
| Роль | Назначение |
|------|------------|
| Background | Базовый фон экрана |
| Surface | Карточки/модалки |
| Primary action | Главный CTA (Apply, Approve) |
| Secondary action | Второстепенные действия |
| Success | Approved, подтверждения |
| Warning | Waitlist, pending, осторожность |
| Danger | Report/Block/Ban/destructive |
| Info | Подсказки, нейтральные баннеры |
| Muted text | Вторичный текст |
| Trust badge | Verified/Reliable/Hosted/Attended |
| Safety cue | Location privacy notice, safety banner |

> Конкретные hex не задаём (Open Design Question — визуальный стиль).

### Spacing
Scale: `4 · 8 · 12 · 16 · 24 · 32`.

### Accessibility
Tap targets ≥ 44pt; контраст AA; чёткие лейблы; **не полагаться только на цвет** (статусы — текст + иконка + цвет); безопасные error states; читаемые status badges; screen-reader подписи на ключевых экранах.

---

## 6. Core Components Inventory

| Компонент | Purpose | Variants | Where used | Safety/Trust |
|-----------|---------|----------|------------|--------------|
| **Bottom Tab Navigation** | Основная навигация | Home/MyEvents/Create/Notifications/Profile; active/inactive | Onboarded app | Скрыта до onboarding |
| **Screen Header** | Заголовок | with/without back, with action | Все экраны | — |
| **Back Button** | Назад | default/disabled | Стек-экраны | — |
| **Action Header** | Действия экрана | report/share/manage | Event Detail, Profile | Report доступен |
| **Admin Sidebar** | Навигация админки | queue/reports/users/events/audit/suspicious | Admin web | Web only admin |
| **Primary Button** | Главный CTA | default/pressed/loading/disabled | Везде | — |
| **Secondary Button** | Второстепенное | default/pressed/disabled | Везде | — |
| **Ghost Button** | Тихое действие | default/pressed | Cancel/Skip | — |
| **Destructive Button** | Опасное действие | default/loading/disabled | Block/Ban/Delete/Cancel event | Требует confirmation |
| **Disabled / Loading Button** | Заблокировано/загрузка | — | Гейты (verification) | Объясняет почему disabled |
| **Text Input / Text Area** | Ввод текста | default/focus/error/disabled | Forms, note | Контент → moderation |
| **Select / Multi-select Chips** | Выбор | default/selected/error | Interests, vibe, category | Только MVP-категории |
| **Date/Time Picker (placeholder)** | Дата/время | default/error | Create Event | Валидация будущего |
| **Location Input** | Локация | approximate / exact (host) | Create Event | Разделение approx/exact |
| **Phone Input** | Телефон | default/error/verified | Onboarding | Verification trust-сигнал |
| **Search Input** | Поиск | default/active/empty | Discover | — |
| **Event Card** | Карточка события | available/full/approval required/pending/approved/cancelled | Discover, My Events | **Нет exact location** |
| **Event Detail Header** | Шапка события | by state | Event Detail | Location gating |
| **Profile Card / Applicant Card** | Профиль/заявитель | safe / own | Review, attendee | Safe-поля only, нет raw trust |
| **Notification Card** | Уведомление | approval/reject/reminder/update/cancel | Notifications | Без exact в payload |
| **Report Card / Admin Queue Item** | Элемент очереди | new/in review/action/dismissed/escalated | Admin | Audit |
| **Trust Badge** | Доверие | Verified/Reliable/Hosted/Attended | Profile, host info | Нечисловой, без негатива |
| **Verification Badge** | Верификация | verified/unverified | Profile | Бинарный |
| **Approval Required Badge** | Требуется approval | on | Event Card/Detail | Инвариант 8 (как ценность) |
| **Capacity Badge / Indicator** | Вместимость | open/almost full/full | Event Card/Detail | — |
| **Location Privacy Notice** | Приватность места | pre-approval/approved | Event Detail | Инвариант 1 microcopy |
| **Safety Notice** | Безопасность | onboarding/event | Safety Principles, Event | Инвариант 7 |
| **Report CTA / Block CTA** | Жалоба/блок | default | Profile, Event, Chat, Attendee | Инвариант 6 (везде) |
| **Moderation Status Badge** | Статус модерации | pending/approved/rejected | Photos, content | AI assist |
| **Event Category Chip** | Категория | one per MVP category | Card/Detail/Filters | Нет nightlife/dating |
| **Application Status Banner** | Статус заявки | pending/approved/rejected/waitlisted/cancelled | Event Detail | Явный статус |
| **Waitlist Banner** | Лист ожидания | waitlisted | Event Detail | Нет exact/chat |
| **Location Reveal Section** | Раскрытие места | hidden / revealed | Approved Event Detail | Только approved |
| **Host Info Block** | О host | safe profile + badges | Event Detail | Нет raw trust |
| **Attendee Preview** | Участники | hidden/aggregate/list (OD-12) | Event Detail (approved) | По политике visibility |
| **Event Lifecycle Badge** | Статус события | live/full/starting soon/in progress/completed/cancelled/removed | Card/Detail | — |
| **Chat Message / System Message** | Сообщения | own/other/system | Event Chat | Only approved |
| **Message Action Sheet** | Действия сообщения | report/copy | Event Chat | Report доступен |
| **Report Message Modal** | Жалоба на сообщение | default/submitted | Event Chat | Снапшот контекста |
| **Chat Frozen Banner** | Чат заморожен | frozen | Event Chat | Audit при freeze |
| **Post-event Chat Expiry Banner** | Истечение чата | active/expiring/expired | Event Chat | Окно OD-4 |
| **Modals** | Подтверждения | Apply/Approve/Reject/Cancel Event/Report/Block/Delete/Admin Action | По flows | Sensitive → confirm |
| **Empty States** | Пусто | No Events/Applications/Notifications/Chat Access/Cancelled/Removed/Access Denied/Moderation Pending | Везде | Guide action |

---

## 7. Mobile Screen List

> Формат: `ID · Name · Flow · Role · Purpose · Key content · Primary / Secondary actions · States · Safety notes`

### Guest / Auth
| ID | Name | Flow | Role | Purpose | Key content | Primary / Secondary | States | Safety |
|----|------|------|------|---------|-------------|---------------------|--------|--------|
| MOB-001 | Welcome | FLOW-001 | Guest | Точка входа, позиционирование | One-liner, CTA | Signup / Login | default | Нет protected данных |
| MOB-002 | Signup | FLOW-001/002 | Guest | Регистрация | email/Google/Apple, invite gate | Создать / Login | default/error | Invite-only |
| MOB-003 | Login | FLOW-001 | Guest | Вход | email/OAuth | Войти / Forgot | default/error | Anti-enumeration |
| MOB-004 | Invite Code | FLOW-002 | Guest | Доступ к бете | code field | Validate / Waitlist | default/invalid | Контроль доступа |
| MOB-005 | Waitlist Signup | FLOW-002 | Guest | Лист ожидания | contact, city | Join / Back | default/confirmed | Минимум PII |
| MOB-006 | Auth Error | FLOW-001 | Guest | Ошибка/блок | нейтральное сообщение | Retry / Support | invalid/banned | Без деталей при ban |

### Onboarding (MOB-010…020) — FLOW-003, Role: User
| ID | Name | Purpose | Key content | Primary | Safety |
|----|------|---------|-------------|---------|--------|
| MOB-010 | Onboarding Welcome | Объяснить продукт | «маленькие безопасные встречи, не dating» | Далее | Anti-dating |
| MOB-011 | Safety Principles | Правила безопасности | location/DM/approval/report | Принять | Инвариант 7, acceptance фикс. |
| MOB-012 | Basic Profile | Имя/возраст | name, age/age range | Далее | <18 блок (OD-2) |
| MOB-013 | City Selection | Город | beta cities | Далее | Город, не точка |
| MOB-014 | Interests | Интересы | chips | Далее | Соц. контекст |
| MOB-015 | Vibe Tags | Vibe | chips | Далее | Нет attractiveness |
| MOB-016 | Intent Selection | Намерение | social options | Далее | Non-romantic |
| MOB-017 | Photo Upload | Фото | upload + moderation | Далее | AI moderation |
| MOB-018 | Phone Verification | Верификация | phone, code | Verify / Later(OD-1) | Trust-сигнал |
| MOB-019 | Profile Preview | Превью | non-approved view | Завершить | Completeness внутр. |
| MOB-020 | Onboarding Complete | Завершение | success | В app | Гейт снят |

### Discovery / Events (MOB-030…040)
| ID | Name | Flow | Purpose | Safety |
|----|------|------|---------|--------|
| MOB-030 | Home / Discover | FLOW-006 | Лента событий | Approx area, нет map pin |
| MOB-031 | Filters | FLOW-006 | Фильтры | Только MVP-категории |
| MOB-032 | Event Card State Examples | FLOW-006 | Витрина состояний карточки | Нет exact location |
| MOB-033 | Event Detail — Not Applied | FLOW-007 | Просмотр + Apply | Инвариант 1 |
| MOB-034 | Event Detail — Pending | FLOW-007 | Статус ожидания | Нет exact/chat |
| MOB-035 | Event Detail — Waitlisted | FLOW-007 | Лист ожидания | Нет exact/chat |
| MOB-036 | Event Detail — Approved | FLOW-007/011 | Полные детали | Exact только здесь |
| MOB-037 | Event Detail — Rejected | FLOW-007 | Мягкий отказ | Нет exact/chat |
| MOB-038 | Event Detail — Full | FLOW-007 | Мест нет | Waitlist offer |
| MOB-039 | Event Detail — Cancelled | FLOW-014 | Отменено | Location не раскрыта |
| MOB-040 | Event Detail — Removed for Safety | FLOW-014 | Удалено | Generic safe message |

### Application (MOB-050…055) — FLOW-009, Role: User
| ID | Name | Purpose | Safety |
|----|------|---------|--------|
| MOB-050 | Apply Modal | Подача заявки | Гейты onboarding/verif |
| MOB-051 | Application Note | Контекст для host | Note → moderation, виден только host |
| MOB-052 | Application Pending | Статус pending | Approx area, нет chat |
| MOB-053 | Verification Required | Гейт verification | OD-1 |
| MOB-054 | Profile Completion Required | Гейт completeness | OD-6 |
| MOB-055 | Waitlist Offer | Предложение waitlist | Нет exact |

### Host (MOB-060…076) — FLOW-008/010/014, Role: Host
| ID | Name | Purpose | Safety |
|----|------|---------|--------|
| MOB-060 | Create Event Start | Старт | Draft не виден |
| MOB-061 | Category Selection | Категория | Нет nightlife/dating |
| MOB-062 | Event Details Form | Title/desc | Контент → moderation |
| MOB-063 | Date / Time | Когда | Валидация будущего |
| MOB-064 | Capacity Settings | Вместимость | Small events |
| MOB-065 | Approval Settings | Approval/waitlist | Инвариант 8 (нельзя выкл) |
| MOB-066 | Location Setup | Approximate area | Инвариант 1/9 |
| MOB-067 | Exact Instructions | Точное место | Только approved/host/admin |
| MOB-068 | Event Preview | Превью non-approved | Не утекает exact |
| MOB-069 | Publish Confirmation | Публикация | pending_review/live (OD-13) |
| MOB-070 | Hosted Event Dashboard | Управление | Ограничено своим событием |
| MOB-071 | Applications List | Список заявок | Safe profile only |
| MOB-072 | Applicant Detail | Заявитель | Нет raw trust/sensitive |
| MOB-073 | Approve Confirmation | Подтвердить approve | Уважает capacity |
| MOB-074 | Reject Confirmation | Подтвердить reject | Rejected ≠ exact |
| MOB-075 | Attendee Management | Управление attendees | Remove → revoke access |
| MOB-076 | Cancel Event | Отмена события | Уведомление + (admin→audit) |

### Chat (MOB-080…085) — FLOW-012
| ID | Name | Purpose | Safety |
|----|------|---------|--------|
| MOB-080 | Event Chat | Чат события | Only approved, no open DM |
| MOB-081 | Message Actions | Действия | Report доступен |
| MOB-082 | Report Message | Жалоба | Снапшот контекста |
| MOB-083 | Chat Frozen | Заморожен | Audit при freeze |
| MOB-084 | Post-event Chat Expiring | Истечение | Окно OD-4 |
| MOB-085 | No Chat Access | Нет доступа | rejected/waitlisted/pending |

### Profile / Settings (MOB-090…099)
| ID | Name | Flow | Purpose | Safety |
|----|------|------|---------|--------|
| MOB-090 | My Profile | FLOW-004 | Свой профиль | Нет raw trust score |
| MOB-091 | Edit Profile | FLOW-004 | Редактирование | Контент → moderation |
| MOB-092 | Edit Interests | FLOW-004 | Интересы | — |
| MOB-093 | Edit Photos | FLOW-004 | Фото | Re-moderation |
| MOB-094 | Privacy Settings | FLOW-004 | Приватность | Инвариант 7 |
| MOB-095 | Public Safe Profile | FLOW-005 | Чужой safe-профиль | Нет sensitive/raw trust |
| MOB-096 | Manage Blocked Users | FLOW-019 | Управление блоками | Обратимость OD (Q-BLK) |
| MOB-097 | Settings | FLOW-024 | Настройки | — |
| MOB-098 | Data Export | FLOW-024 | Экспорт данных | Privacy by design |
| MOB-099 | Delete Account | FLOW-024 | Удаление | Safety-retention (OD-9) |

### Safety (MOB-110…115)
| ID | Name | Flow | Purpose | Safety |
|----|------|------|---------|--------|
| MOB-110 | Report User | FLOW-016 | Жалоба на юзера | Инвариант 6, no retaliation |
| MOB-111 | Report Event | FLOW-017 | Жалоба на событие | Инвариант 6 |
| MOB-112 | Report Details | FLOW-016/017/018 | Причина/детали | — |
| MOB-113 | Report Submitted | FLOW-016/017/018 | Подтверждение | Reassurance |
| MOB-114 | Block User Confirmation | FLOW-019 | Подтвердить блок | Прекращает взаимодействие |
| MOB-115 | Blocked State | FLOW-019 | Состояние «заблокирован» | Нет взаимодействия |

### Notifications (MOB-120…123) — FLOW-013
| ID | Name | Purpose | Safety |
|----|------|---------|--------|
| MOB-120 | Notifications List | Список | Без exact в payload |
| MOB-121 | Approval Notification Detail | Approve | Exact только в approved detail |
| MOB-122 | Event Update Notification | Обновление | Без exact |
| MOB-123 | Cancellation Notification | Отмена | Без exact |

---

## 8. Admin Dashboard Screen List

> Web, role: Admin/Moderator. FLOW-020/021/022.

| ID | Name | Purpose | Key data | Primary actions | Safety/Audit |
|----|------|---------|----------|-----------------|--------------|
| ADM-001 | Admin Login | Вход в админку | admin session | Login | Web only admin |
| ADM-002 | Moderation Queue | Очередь reports/флагов | reports + priority + AI summary | Filter, Open | AI assistive only |
| ADM-003 | Report Detail | Детали жалобы | report + context | Take action, Escalate | Серьёзное → причина |
| ADM-004 | User Detail | Профиль пользователя | history, trust events, flags | Restrict, Ban, Note | Trust admin-only |
| ADM-005 | Event Detail | Событие (admin) | full event incl. exact | Remove, Cancel | Доступ к exact логируется |
| ADM-006 | Message Detail | Сообщение | snapshot + thread | Hide, Action | Контекст при удалении |
| ADM-007 | Suspicious Activity Queue | Подозр. активность | velocity/pattern flags | Review | Не финальный enforcement |
| ADM-008 | Audit Logs | Аудит решений | log entries (кто/что/когда/почему) | View, Filter | Инвариант 4; retention OD-9 |
| ADM-009 | Admin Action Modal | Применить действие | action + reason | Confirm | Serious → human + log |
| ADM-010 | Restrict User | Ограничение | scope, duration, reason | Apply | Audit log |
| ADM-011 | Ban User | Бан | reason | Apply | Permanent → human (Инв.5) |
| ADM-012 | Remove Event | Удаление события | reason | Apply | `removed_for_safety` + audit |
| ADM-013 | Freeze Chat | Заморозка чата | event id, reason | Apply | Audit log |

---

## 9. Clickable Prototype Scope

### Prototype A — New User Core Loop
`Welcome → Invite Code → Signup → Onboarding → Home/Discover → Event Detail → Apply → Pending → Approved Notification → Event Detail Approved → Event Chat → Post-event Reconnect`
**Purpose:** понятен ли пользователю главный путь.

### Prototype B — Host Flow
`My Events/Create → Create Event → Preview → Publish → Hosted Event Dashboard → Applications List → Applicant Detail → Approve → Attendee Management`
**Purpose:** понятен ли host control и approval.

### Prototype C — Safety Flow
`Public Profile → Report User → Report Details → Report Submitted → Block User → Blocked State`
**Purpose:** safety actions доступны и не спрятаны.

### Prototype D — Admin Moderation Flow
`Admin Login → Moderation Queue → Report Detail → User/Event/Message Detail → Action Modal → Audit Log`
**Purpose:** moderation loop работает end-to-end.

### Prototype E — Location Privacy Flow
`Event Detail Not Applied → Apply → Pending → Waitlisted/Rejected examples → Approved → Exact Location Reveal`
**Purpose:** exact location открывается только approved users.

---

## 10. Priority of Screens

### P0 (обязательно для первого clickable prototype)
Welcome · Invite Code · Signup/Login · Onboarding (Welcome, Safety Principles, Basic Profile, Photo, Preview, Complete) · Home/Discover · Event Detail Not Applied · Apply Modal · Pending State · Approved State · Event Chat · Create Event · Applications List · Applicant Detail · Report User · Block User · Moderation Queue · Report Detail.

### P1 (после основного loop)
Full profile editing · Notifications detail · Waitlist · Event cancellation · Attendance confirmation · Post-event reconnect · Privacy settings · Admin user detail · Audit logs.

### P2 (не рисовать сейчас / только placeholder)
Payments · Tickets · Premium hosts · Public followers · Dating mechanics · Advanced AI matching · Large event marketplace · Communities/circles.
> Per Product Core §«Не входит в MVP» и CLAUDE.md §2: эти экраны нельзя проектировать как рабочие без отдельного product decision.

---

## 11. Screen Detail Specifications (key P0)

> Формат: layout sections · content · primary CTA · secondary CTA · empty/error · safety cues · prototype links.

### 11.1 Welcome (MOB-001)
- **Layout:** logo/wordmark · one-liner · short value props (3) · CTA stack.
- **Content:** «Find small, safe social events near you.» · «Not a dating app.»
- **Primary CTA:** Sign up. **Secondary:** Log in.
- **Empty/Error:** —.
- **Safety cues:** explicit «not a dating app» строка.
- **Links:** → Invite Code / Signup / Login.

### 11.2 Safety Principles (MOB-011)
- **Layout:** header · 4 принципа (location hidden / no open DMs / report&block / approval) · acceptance checkbox · CTA.
- **Content:** короткие иконка+строка на каждый принцип.
- **Primary CTA:** Accept & continue (disabled до checkbox). **Secondary:** Back.
- **Empty/Error:** отказ → нельзя продолжить.
- **Safety cues:** весь экран = Инвариант 7; acceptance фиксируется.
- **Links:** → Basic Profile.

### 11.3 Home / Discover (MOB-030)
- **Layout:** header + search · filter row · event card list · empty state · bottom nav.
- **Content:** Event Cards (title, category chip, host badge, date, **approximate area**, capacity, approval-required badge).
- **Primary CTA:** Open event. **Secondary:** Filters.
- **Empty/Error:** No events nearby (CTA: создать событие / расширить фильтр).
- **Safety cues:** «approximate area», нет карты с точкой; blocked/banned скрыты.
- **Links:** → Event Detail · Filters.

### 11.4 Event Card (component, MOB-032)
- **Layout:** thumbnail/category color · title · category chip · date/time · approximate area · capacity badge · approval badge · host mini-badge.
- **Variants:** available / full / approval required / pending / approved / cancelled.
- **Safety cues:** **никогда** exact location; статус явный; нет «attractiveness».
- **Links:** → Event Detail (по состоянию).

### 11.5 Event Detail — Not Applied (MOB-033)
- **Layout:** header image/category · title · host info block (safe + badges) · meta (date, **approximate area**, capacity, approval-required) · description · Location Privacy Notice · Apply CTA · Action header (Report).
- **Primary CTA:** Apply. **Secondary:** Report event · Back.
- **Empty/Error:** event cancelled/removed mid-view → state switch.
- **Safety cues:** «Exact location is shared only after host approval.»; нет exact; нет полного attendee list (OD-12).
- **Links:** → Apply Modal · Report Event · Public Safe Profile (host).

### 11.6 Apply Modal (MOB-050/051)
- **Layout:** sheet · event mini-summary · note textarea · char limit · submit.
- **Primary CTA:** Submit application. **Secondary:** Cancel.
- **Empty/Error:** not onboarded / verification required (OD-1) / completeness required (OD-6) / event full → Waitlist Offer / blocked → cannot apply.
- **Safety cues:** note → moderation, виден только host; velocity limit.
- **Links:** → Application Pending / Verification Required / Profile Completion Required / Waitlist Offer.

### 11.7 Event Detail — Pending (MOB-034/052)
- **Layout:** Application Status Banner (pending) · approximate area · «как работает approval» explainer · cancel application.
- **Primary CTA:** — (waiting). **Secondary:** Cancel application · Report event.
- **Safety cues:** нет exact location, нет chat; объяснение approval как ценности (Инвариант 8).
- **Links:** → Cancel confirmation · back to Discover.

### 11.8 Event Detail — Approved (MOB-036)
- **Layout:** Approved banner · **Location Reveal Section** (exact address/instructions) · event chat entry · reminder · attendee preview (per OD-12) · Action header (Report/Block).
- **Primary CTA:** Open Event Chat. **Secondary:** Report · Get directions (approx-safe).
- **Safety cues:** «You're approved — exact details are now available.»; exact только здесь; revoke при отмене approval.
- **Links:** → Event Chat · Public Safe Profile · Report.

### 11.9 Event Chat (MOB-080)
- **Layout:** header (event title, frozen/expiry banners) · message list (own/other/system) · input · message actions.
- **Primary CTA:** Send. **Secondary:** Message actions (Report).
- **Empty/Error:** no messages (prompt to greet) · No Chat Access (rejected/waitlisted) · Frozen · Post-event expiring.
- **Safety cues:** only approved; **no open DM**; report из message actions; blocked не взаимодействуют.
- **Links:** → Report Message · Public Safe Profile.

### 11.10 Create Event (MOB-060…069)
- **Layout:** step flow: category → details → date/time → capacity → approval/waitlist → **approximate location** → **exact instructions** → preview → publish.
- **Primary CTA:** Continue / Publish. **Secondary:** Save draft · Back.
- **Empty/Error:** validation (past time, capacity range, unsafe content → pending_review).
- **Safety cues:** **разделённые поля** approximate vs exact; preview = non-approved view; approval нельзя выключить.
- **Links:** → Event Preview → Publish Confirmation / Pending Review → Hosted Dashboard.

### 11.11 Applicant Detail (MOB-072)
- **Layout:** safe profile (photo, name/age range per OD-3, interests, vibe) · soft trust badges · application note · decision buttons.
- **Primary CTA:** Approve. **Secondary:** Reject · Waitlist · Report.
- **Empty/Error:** applicant withdrew · capacity reached → block approve.
- **Safety cues:** **нет raw trust score**, нет sensitive/internal полей; approve уважает capacity.
- **Links:** → Approve/Reject Confirmation · Waitlist State.

### 11.12 Public Safe Profile (MOB-095)
- **Layout:** photo · name/age range · interests · vibe · soft trust badges · Action header (Report/Block).
- **Primary CTA:** — (просмотр). **Secondary:** Report · Block.
- **Safety cues:** только safe-поля; **нет raw trust score**, нет «who viewed», нет dating-сигналов.
- **Links:** → Report User · Block User Confirmation.

### 11.13 Report User (MOB-110/112/113)
- **Layout:** target mini-card · reason selector · optional details textarea · submit · confirmation.
- **Primary CTA:** Submit report. **Secondary:** Cancel.
- **Empty/Error:** submission failed → retry; duplicate → dedup notice.
- **Safety cues:** reporter safety, no retaliation; review → audit log; «Help us keep the community safe.»
- **Links:** → Report Submitted · (optional) Block User.

### 11.14 Block User (MOB-114/115)
- **Layout:** confirmation sheet · explanation of effects · confirm/cancel · blocked state.
- **Primary CTA:** Block. **Secondary:** Cancel.
- **Safety cues:** «They won't be able to interact with you.»; blocked не может apply/писать; visibility пересчитывается.
- **Links:** → Blocked State · Manage Blocked Users.

### 11.15 Moderation Queue (ADM-002)
- **Layout:** sidebar · filter bar (type/priority) · queue list (Report Card with AI summary label) · pagination.
- **Primary CTA:** Open report. **Secondary:** Filter · Escalate.
- **Empty/Error:** No reports in queue (positive empty state).
- **Safety cues:** AI summary помечен «assistive»; не авто-действие.
- **Links:** → Report Detail.

### 11.16 Report Detail (ADM-003)
- **Layout:** report context · linked user/event/message detail · AI summary (assistive) · action panel · audit preview.
- **Primary CTA:** Take action (→ Action Modal). **Secondary:** Escalate · Dismiss (with reason).
- **Safety cues:** serious action → обязательная причина; всё → **audit log (Инвариант 4)**; AI не final judge (Инвариант 5).
- **Links:** → User/Event/Message Detail · Action Modal · Audit Log.

---

## 12. Event Detail State Design

| State | Показывать | НЕ показывать |
|-------|------------|---------------|
| **Not Applied** | title, category, host safe profile, date/time, approximate area, capacity, approval requirement, Apply CTA, report option | exact location, exact instructions, full attendee list (если не разрешено) |
| **Pending** | application pending banner, approximate area, approval explanation, cancel application | exact location, event chat |
| **Waitlisted** | waitlist status, approximate area, explanation | exact location, event chat |
| **Approved** | approved banner, exact location/instructions, chat entry, reminder, attendee visibility per policy | — (exact раскрыт корректно) |
| **Rejected** | respectful rejected state, suggested other events | exact location, chat |
| **Cancelled** | cancellation reason (если безопасно), suggested next steps | exact location; chat read-only/закрыт |
| **Removed for Safety** | generic safe message, report/support link | любые sensitive details, причина-детали |

---

## 13. Location Privacy Design Requirements

- Exact location **никогда** не видна на Event Card.
- Exact location **никогда** не видна на Event Detail до approval.
- Уведомления non-approved пользователям **никогда** не содержат exact location.
- Карты (если используются) — только approximate area, без точечного pin.
- Использовать wording «Exact location shared after approval».
- Approved-состояние явно объясняет, **почему** location теперь видна.
- Rejected/waitlisted состояния не раскрывают location.
- Admin-вью может видеть exact location для модерации (доступ логируется).

**Sample microcopy:**
- «Exact location is shared only after host approval.»
- «You'll see the exact meeting spot once you're approved.»
- «For safety, this event shows an approximate area until approval.»
- «You're approved — exact details are now available.»

---

## 14. Trust / Safety UX Cues

**Показывать:** Verified badge · Reliable attendee badge · Hosted before badge · Approval required badge · Location privacy notice · Report CTA · Block CTA · Safety Principles screen · Moderation pending state · (если нужно) Admin-reviewed indicator · Profile completeness indicator (мягко, без давления).

**Запрещено (CLAUDE.md §2 / Инварианты 3, 10):**
- raw trust score / числовой trust;
- public numeric ratings;
- public negative labels;
- dating-style attractiveness signals;
- «who viewed me» механики.

---

## 15. Copy / Microcopy Guidelines

**Tone:** calm · clear · respectful · safety-forward · non-romantic · non-judgmental.

**Avoid:** dating-app language; «match» (если читается как dating); attractiveness framing; popularity ranking; fear-based safety language.

**Preferred words:** event · host · attendee · apply · approval · community · shared context · exact location · safety · trusted.

**Sample copy:**
| Контекст | Текст |
|----------|-------|
| Welcome | «Find small, safe social events near you.» |
| Apply | «Tell the host why you'd like to join.» |
| Pending | «Your request is waiting for host approval.» |
| Approved | «You're approved. Exact event details are now available.» |
| Rejected | «This event wasn't the right fit this time. You can explore other events.» |
| Location | «Exact location is shared only after approval.» |
| Report | «Help us keep the community safe.» |
| Block | «They won't be able to interact with you.» |

---

## 16. Empty States

| Empty state | Message | CTA | Safety/Trust note |
|-------------|---------|-----|-------------------|
| No events nearby | «No events near you yet.» | Создать событие / расширить фильтр | Без давления |
| No applications yet | «No applications yet.» | Поделиться событием | — |
| No hosted events | «You haven't hosted yet.» | Создать событие | Approval как ценность |
| No notifications | «You're all caught up.» | — | Calm UX |
| No chat messages | «Say hi to break the ice.» | — | Only approved |
| No reports in queue | «Queue is clear.» | — | Положительный сигнал безопасности |
| Waitlist joined | «You're on the waitlist.» | Explore other events | Нет exact location |
| Profile incomplete | «Complete your profile to apply.» | Дозаполнить | Completeness внутр. (OD-6) |
| No access to chat | «Chat opens after approval.» | Back to event | Инвариант 2 |
| Event removed | «This event is no longer available.» | Explore events | Generic safe message |

---

## 17. Error States

| Error | User-facing message | Recovery | Safety note |
|-------|---------------------|----------|-------------|
| Invalid invite code | «This invite code isn't valid.» | Re-enter / Join waitlist | Контроль доступа |
| Auth error | «Couldn't sign you in.» | Retry / Reset | Anti-enumeration |
| Upload failed | «Photo upload failed.» | Retry | — |
| Photo moderation failed | «This photo can't be used.» | Replace photo | AI assist (не judge) |
| Profile incomplete | «Finish your profile to continue.» | Go to profile | Гейт apply (OD-6) |
| Phone verification failed | «Verification code incorrect.» | Resend / Re-enter | Trust-сигнал |
| Event full | «This event is full.» | Join waitlist | Waitlist offer |
| Event cancelled while applying | «This event was cancelled.» | Explore events | Location не раскрыта |
| Application already submitted | «You've already applied.» | View status | Идемпотентно |
| User restricted | «Some actions are limited.» | Learn more | Без публичного ярлыка |
| Banned access denied | «Access is not available.» | Support | Без деталей (Инв.5/audit) |
| Cannot access exact location | «Location is shared after approval.» | — | Инвариант 1 (жёстко) |
| Cannot access chat | «Chat opens after approval.» | Back | Инвариант 2 |
| Report submission failed | «Couldn't submit your report.» | Retry | Не терять report-контекст |

---

## 18. State Variants to Design

- **Buttons:** default · pressed · loading · disabled · destructive.
- **Event Card:** available · full · approval required · pending · approved · cancelled.
- **Event Detail:** not applied · pending · waitlisted · approved · rejected · full · cancelled · removed.
- **Application Status:** none · pending · approved · rejected · waitlisted · cancelled.
- **Chat:** active · frozen · post-event expiring · no access.
- **Profile:** own · public safe · blocked · restricted · moderation pending.
- **Admin Report:** new · in review · action taken · dismissed · escalated.

---

## 19. Prototype Testing Script

**Цель:** понять, считывают ли пользователи: что это не dating app; как работает approval; почему location скрыта; как податься; как host approves; где report/block; что после approval.

**Участники:** 5–7 человек из ICP (городские 22–38, не из команды).

**Задания:**
1. Зарегистрируйтесь и завершите onboarding.
2. Найдите интересное событие.
3. Подайтесь на событие.
4. Объясните, когда вы увидите точную локацию.
5. (Роль host) Одобрите заявку.
6. Откройте event chat.
7. Пожалуйтесь на пользователя или заблокируйте его.
8. (Роль admin) Обработайте report.

**Вопросы после:**
- Что это за продукт, по-вашему?
- Похоже ли на dating app?
- Чувствуете ли себя в безопасности?
- Понятно ли, почему location скрыта?
- Понятно ли, что значит approval?
- Что вызывает недоверие?
- Что хочется изменить?

**Метрика успеха:** ≥5/7 описывают продукт как «безопасные офлайн-встречи / не dating»; ≥5/7 верно объясняют момент раскрытия location; 7/7 находят report/block без подсказки.

---

## 20. Figma Build Order

1. Cover / Product Context
2. Basic design foundations
3. Core components
4. Welcome + Auth
5. Onboarding
6. Home / Discover
7. Event Detail states
8. Apply / Approval
9. Event Chat
10. Host Create Event
11. Host Application Review
12. Report / Block
13. Admin Moderation
14. Prototype links
15. Testing notes

---

## 21. Handoff Notes for Engineering

- **P0 экраны:** см. §10 P0 — это минимальный набор для clickable prototype и первой реализации.
- **Обязательные states:** все Event Detail states (§12), Application Status (§18), Chat states, Profile states — нельзя реализовывать только happy path.
- **Safety states (не забыть):** No Chat Access, location-hidden notice, rejected/removed/cancelled, moderation pending, restricted/banned, frozen chat, audit log создаётся на admin-действиях.
- **Переиспользуемые компоненты:** Event Card, Application Status Banner, Trust Badge, Location Privacy Notice, Report/Block CTA, Modals, Empty/Error states (§6).
- **Важные copy strings:** §13 и §15 (location microcopy, rejected, approved, report, block).
- **Analytics ↔ экраны:** Welcome/Signup→`signup_*`; Onboarding→`onboarding_*`,`profile_completed`; Discover→`event_discovery_viewed`,`event_viewed`; Apply→`application_started/created`; Approve→`application_approved`; Chat→`event_chat_opened`,`chat_message_sent`; Report/Block→`report_created`,`block_created`; Admin→`moderation_action_taken`; Post-event→`event_completed`,`attendance_confirmed`,`no_show_recorded` (см. [`03_USER_FLOWS.md`](03_USER_FLOWS.md) §11).
- **Данные на экран:** см. §7/§8 Key content и [`03_USER_FLOWS.md`](03_USER_FLOWS.md) «Data required» по шагам.

**Жёсткие предупреждения (CLAUDE.md §2):**
- Figma design **must not** imply exact location before approval.
- Figma design **must not** show raw trust score.
- Figma design **must not** include open DMs.
- Figma design **must not** include public ratings.
- Figma design **must not** include dating-style matching.

---

## 22. Open Design Questions

| # | Вопрос | Связь |
|---|--------|-------|
| Q-STYLE | Визуальный стиль: warm minimal vs community editorial? | §5 |
| Q-COMPLETE | Как показывать profile completeness без давления? | §14, OD-6 |
| Q-RJ (OD) | Exact location: сразу после approval или ближе к событию? | §12/§13, PRD §12 |
| OD-12 | Показывать ли approved attendee list до события? | §11.8/§12 |
| Q-REJ-TONE | Как объяснять rejection мягко? | §11.7, §15 |
| Q-ELITE | Как сделать approval не похожим на элитарность? | §11.5/§14 |
| Q-VERB | Какой глагол: apply / request / join? | §15 |
| Q-HOST-REL | Показывать ли host reliability (и как, без числа)? | §14 |
| Q-SAFE-LOAD | Как показать safety rules без перегруза? | §11.2 |
| Q-VIBE | Как отличить social vibe от dating vibe визуально? | §5/§15 |
| Q-WAITLIST | Как показывать waitlist? | §12 |
| Q-REPORT-VIS | Report/block заметны, но не пугающие — как? | §14 |
| Q-MAP | Нужна ли карта в MVP или достаточно area text? | §13 |
| Q-CITY | Какой first city/context в mock data? | PRD OD-10 |

---

## 23. Summary

- Документ готовит **Figma-ready план прототипа**: file structure, design direction, components, mobile/admin screen lists, clickable scope, P0/P1/P2 приоритеты, detailed specs 16 ключевых P0 экранов, location privacy/trust UX cues, copy, empty/error states, testing script, build order, engineering handoff.
- Прототип должен доказать основной loop **Discover → Apply → Approve → Attend → Reconnect** и host/safety/admin пути.
- Safety / location / privacy **видимы в UI**; запрещены raw trust score, open DMs, public ratings, dating-механики.
- P0 screens определены; нерешённые развилки — в §22.
- **Следующий документ:** [`/docs/05_ARCHITECTURE.md`](05_ARCHITECTURE.md).

> Напоминание: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth; PRD/User Stories/User Flows ему подчинены, этот план — им.
