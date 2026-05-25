# Sprint Backlog v1 — Social Events App

> **Status:** v1 (delivery plan for closed beta)
> **Owner:** Founder / Technical Founder / Product
> **Last updated:** 2026-05-18

---

## 1. Source of Truth

- Документ основан на [`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) … [`10_ANALYTICS.md`](10_ANALYTICS.md) + [`CLAUDE.md`](../CLAUDE.md).
- **[`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth.** При конфликте приоритет у Product Core.
- Backlog **не нарушает** safety-инварианты.
- Все implementation tasks ссылаются на этот backlog + соответствующий документ + Story ID (документ 02).
- **Claude Code сверяется с Product Core перед реализацией каждой фичи** (CLAUDE.md §1).
- Нерешённые развилки — в [§31 Open Delivery Questions](#31-open-delivery-questions).

---

## 2. MVP Delivery Goal

Invite-only mobile-first приложение для безопасных офлайн-встреч.

**User:** signup → onboarding → discover → apply → get approved → see exact location → event chat → attend → reconnect.
**Host:** create event → review applications → approve/reject → manage attendees.
**Admin:** review reports → take moderation action → audit.

> MVP доказывает loop: **Discover → Apply → Approve → Attend → Reconnect.**

---

## 3. Delivery Assumptions

2-week sprints · mobile-first · iOS+Android (RN+Expo) · backend Supabase/PostgreSQL/RLS · admin Next.js · analytics PostHog · crash Sentry · AI moderation OpenAI/Claude-assisted · **Claude Code — engineering multiplier** · **human/founder review обязателен** для architecture/security/UX/moderation/trust решений.

---

## 4. MVP Timeline

| Sprint | Название | Focus |
|--------|----------|-------|
| **0** | Product / Design / Planning | Документация (✅ завершена) + P0 Figma прототип (требуется до кода) |
| **1** | Foundation & Infrastructure | repo, mobile/admin skeleton, Supabase, environments, base auth, design tokens, CI |
| **2** | Auth, Beta Access & Onboarding | auth, invite gate, waitlist, onboarding, profiles, photos, phone verification |
| **3** | Events Core | event creation/discovery/detail, **location privacy**, event lifecycle |
| **4** | Applications, Host Review & Location Reveal | host dashboard, approve/reject/waitlist, attendees, **exact location reveal**, notifications |
| **5** | Chat, Safety & Trust Foundations | event chat (no open DMs), report/block, trust events, attendance basics |
| **6** | Admin Moderation & Hardening | admin dashboard, moderation queue, audit logs, restrict/ban, AI assist, **RLS/security tests** |
| **7** | Polish, Analytics & Closed Beta Prep | analytics dashboards, Sentry, QA, UX polish, performance, beta launch, store prep, legal |

> **Expected closed beta readiness:** после Sprint 7, при прохождении [§29 Release Criteria](#29-closed-beta-release-criteria).

---

## 5. Priority System

- **P0** — обязательно для закрытой беты.
- **P1** — важно после беты / в расширенной бете.
- **P2** — не делать сейчас.

> P2 tasks нельзя реализовывать без явного product decision, переопределяющего MVP scope (CLAUDE.md §2/§5).

---

## 6. Ticket Format

Каждый ticket: **Ticket ID · Epic · Sprint · Priority · Type · Owner · Dependencies · Related docs · Description · Acceptance Criteria · Safety/Security Notes · Analytics Notes · Definition of Done.**

**Types:** Product · Design · Frontend · Backend · Mobile · Admin · Security · RLS · Analytics · QA · AI/Moderation · DevOps.
**Owners:** Founder/Product · Technical Founder · Claude Code · Designer · Admin/Safety Reviewer.

> Полные карточки разворачиваются при старте каждого спринта. Ниже — backlog-уровень (ID + цель + AC + safety + deps).

---

## 7. Global Definition of Done

Feature matches Product Core · safety invariant не нарушён · exact location не доступен non-approved · нет open DMs · raw trust score не exposed · нет публичных негативных ярлыков · RLS/security review (если backend) · analytics добавлена (если P0 flow) · sensitive не в analytics · error states · empty states · mobile UX review · тесты где relevant · service role не client-side · moderation-sensitive → audit log · документация обновлена при изменении product behavior.

---

## 8. Global Safety Invariants

1. Exact location не виден non-approved. 2. No open DMs. 3. Raw trust score не показывается. 4. Публичные негативные ярлыки запрещены. 5. Public user ratings запрещены. 6. Dating-механики запрещены в MVP. 7. Payments/tickets запрещены в MVP. 8. Moderation-sensitive действия логируются. 9. AI ассистирует, не делает финальные serious enforcement решения. 10. Blocked не взаимодействуют. 11. Banned не взаимодействуют. 12. Service role не на клиенте. 13. Notifications/analytics не утекают sensitive.

---

## 9. Sprint 0 — Product, Documentation & Figma

**Goal:** завершить product/design foundation до кода.

**Documentation status:** Product Core ✅ · PRD ✅ · User Stories ✅ · User Flows ✅ · Figma Prototype Plan ✅ · Architecture ✅ · Database Schema ✅ · Security/RLS ✅ · Trust System ✅ · Moderation ✅ · Analytics ✅ · Sprint Backlog ✅ (этот документ).

| Ticket | Описание | Priority | Status |
|--------|----------|----------|--------|
| DOC-001 | Product Core | P0 | ✅ completed (`00_PRODUCT_CORE.md`) |
| DOC-002 | PRD | P0 | ✅ completed (`01_PRD.md`) |
| DOC-003 | User Stories | P0 | ✅ completed (`02_USER_STORIES.md`) |
| DOC-004 | User Flows | P0 | ✅ completed (`03_USER_FLOWS.md`) |
| DOC-005 | Figma Prototype Plan | P0 | ✅ completed (`04_FIGMA_PROTOTYPE_PLAN.md`) |
| DOC-006 | Architecture | P0 | ✅ completed (`05_ARCHITECTURE.md`) |
| DOC-007 | Database Schema | P0 | ✅ completed (`06_DATABASE_SCHEMA.md`) |
| DOC-008 | Security & RLS | P0 | ✅ completed (`07_SECURITY_RLS.md`) |
| DOC-009 | Trust System | P0 | ✅ completed (`08_TRUST_SYSTEM.md`) |
| DOC-010 | Moderation | P0 | ✅ completed (`09_MODERATION.md`) |
| DOC-011 | Analytics | P0 | ✅ completed (`10_ANALYTICS.md`) |

**FIG-001 — P0 Figma clickable prototype** · P0 · Design · Designer/Founder
Scope: onboarding · home/discovery · event detail states · apply/pending/approved · host application review · event chat · report/block · moderation queue.
**AC:** прототип показывает core loop; exact location скрыт до approval; report/block видимы; нет dating-механик; нет raw trust score; нет open DMs. *Deps: DOC-001..011. Docs: `04_FIGMA_PROTOTYPE_PLAN.md`.*

**FIG-002 — Prototype testing с 5–7 людьми** · P0 · Product
**AC:** users понимают approval; понимают location privacy; не воспринимают как dating app; report/block discoverable; ключевые UX-проблемы задокументированы. *Deps: FIG-001. Docs: `04` §19.*

---

## 10. Sprint 1 — Foundation & Infrastructure

**Goal:** production-ready foundation. **Epics:** Repo · Mobile skeleton · Admin skeleton · Supabase setup · Environments · Base DB · Auth foundation · Design system · CI/CD.

| Ticket | Описание | Pri | Type | Deps | AC / Safety notes |
|--------|----------|-----|------|------|-------------------|
| INFRA-001 | Monorepo structure (`/apps`, `/packages`, `/supabase`, `/docs`) | P0 | DevOps | — | Структура = Architecture §6; код не вне ожидаемых папок; docs в `/docs` |
| INFRA-002 | TypeScript workspace | P0 | DevOps | 001 | Shared tsconfig; strict mode |
| INFRA-003 | Expo mobile app skeleton | P0 | Mobile | 001 | Запускается iOS/Android; пустой navigation |
| INFRA-004 | Next.js admin app skeleton | P0 | Admin | 001 | Запускается; **service role только server-side** |
| INFRA-005 | Shared packages (ui/types/validators/config/analytics) | P0 | DevOps | 001 | Импортируются из обоих apps |
| INFRA-006 | Supabase project environments (local/staging/prod) | P0 | DevOps | 001 | Изолированы; нет prod-секретов в local |
| INFRA-007 | Environment variable strategy | P0 | Security | 006 | Секреты не в репо; **service role не в client bundle** |
| INFRA-008 | GitHub Actions basic checks (TS/lint/test) | P0 | DevOps | 002 | PR-checks зелёные |
| INFRA-009 | EAS Build configuration | P0 | DevOps | 003 | Preview build собирается; signing безопасно |
| INFRA-010 | Base design tokens (color roles/spacing/typography) | P0 | Design | 005 | = Figma §5; spacing 4..32 |
| INFRA-011 | App navigation skeleton (guest/onboarding/tabs) | P0 | Mobile | 003 | = User Flows §3; гейты-заглушки |
| INFRA-012 | Supabase client wrapper (anon/auth, RLS-aware) | P0 | Backend | 006 | Никогда service role на клиенте |
| INFRA-013 | Sentry config plan (placeholder) | P0 | DevOps | 003,004 | Только конфиг-план, без sensitive |
| INFRA-014 | PostHog config plan (placeholder) | P0 | Analytics | 005 | Env-разделение; privacy boundary |
| INFRA-015 | Documentation-to-code review process | P0 | Product | — | Pre-task checklist (CLAUDE.md §1) внедрён |

---

## 11. Sprint 2 — Auth, Beta Access & Onboarding

**Goal:** identity layer + controlled beta access. **Epics:** Auth · Invite gate · Waitlist · Onboarding · Basic profile · Photo upload · Phone verification · Profile completeness.

| Ticket | Описание | Pri | Deps | AC / Safety |
|--------|----------|-----|------|-------------|
| AUTH-001 | Supabase Auth email signup/login | P0 | INFRA-012 | Anti-enumeration ошибок; US-AUTH-01/02 |
| AUTH-002 | Google login | P0 | 001 | US-AUTH-03 |
| AUTH-003 | Apple login | P0 | 001 | US-AUTH-04; iOS-store requirement |
| AUTH-004 | Session persistence | P0 | 001 | Refresh/expiry; US-AUTH-06 |
| AUTH-005 | Logout | P0 | 004 | Очистка sensitive; US-AUTH-07 |
| AUTH-006 | Protected routes | P0 | 001 | Всё кроме landing/auth закрыто; US-AUTH-08 |
| AUTH-007 | Banned/restricted user gate | P0 | 006 | Banned не входит; sessions invalidated; US-SAFE-12 |
| BETA-001 | Invite code validation flow (Edge Function, atomic) | P0 | AUTH-001 | Single/multi-use; expired/revoked deny; US-BETA-01/02 |
| BETA-002 | Waitlist signup flow | P0 | INFRA-003 | Min PII; US-BETA-03 |
| BETA-003 | Track invite code usage | P0 | 001 | Atomic use_count; US-BETA-04 |
| ONB-001..010 | Onboarding screens: welcome, safety principles, basic profile, city, interests, vibe, intent, photo upload, phone verification, profile preview | P0 | AUTH-006 | Safety acceptance фиксируется; photo→moderation; **нет доступа к событиям до завершения**; US-ONB-01..10 |
| ONB-011 | Complete onboarding + lock/unlock app access | P0 | ONB-001..010 | Гейт работает; resume; US-ONB-11 |
| PROF-001 | profiles schema/migration | P0 | INFRA-006 | Raw trust/exact НЕ здесь; Schema §7.1 |
| PROF-002 | profile_photos schema/storage | P0 | PROF-001 | Moderation gate; signed URLs; Schema §7.3 |
| PROF-003 | profile_completeness calculation | P0 | PROF-001 | Internal; bucket; US-ONB-10 |
| PROF-004 | public_profiles_view (safe fields only) | P0 | PROF-001 | Без phone/email/DOB/raw trust; Schema §17.1 |

**Sprint AC:** guest не видит события; `authenticated_not_onboarded` видит только onboarding; onboarding resume; photo moderation статус есть; completeness трекается; private fields не exposed; analytics-события включены (privacy boundary).

---

## 12. Sprint 3 — Events Core

**Goal:** сердце продукта: discovery + creation + detail + **safe location model**. **Epics:** Categories · Events schema · Event locations · Creation · Discovery · Detail states · Location privacy · Lifecycle.

| Ticket | Описание | Pri | Deps | AC / Safety |
|--------|----------|-----|------|-------------|
| EVT-001 | event_categories schema + seed | P0 | INFRA-006 | Только MVP-категории; нет nightlife/dating |
| EVT-002 | events schema (без exact) | P0 | EVT-001,PROF-001 | Approximate only; Schema §8.2 |
| EVT-003 | **protected event_locations schema** | P0 | EVT-002 | 1:1; strict RLS; **deny-by-default**; Schema §8.3 |
| EVT-004 | public_events_view (safe) | P0 | EVT-002 | Без exact_*; Schema §17.2 |
| EVT-005 | Home/Discover screen | P0 | EVT-004,ONB-011 | Approx area; нет map pin; FLOW-006 |
| EVT-006 | Event Card component | P0 | EVT-005 | Никогда exact; Figma §11.4 |
| EVT-007 | Filters (category/date) | P0 | EVT-005 | Только MVP-категории |
| EVT-008 | Event Detail — Not Applied | P0 | EVT-004 | Location privacy notice; FLOW-007 |
| EVT-009 | Event Detail state variants (9) | P0 | EVT-008 | not_applied/pending/waitlisted/approved/rejected/full/cancelled/removed/host; §8 Flows |
| EVT-010 | Create Event flow (split approx/exact) | P0 | EVT-002,EVT-003 | Approval нельзя выключить; FLOW-008 |
| EVT-011 | Event Preview (non-approved view) | P0 | EVT-010 | Не утекает exact |
| EVT-012 | Publish event flow | P0 | EVT-010 | pending_review/live (OD-13) |
| EVT-013 | Event lifecycle transitions (basic) | P0 | EVT-002 | Arch §12 |
| EVT-014 | Safe location display | P0 | EVT-003 | Approx до approval |
| EVT-015 | **Ensure exact location never appears before approval** | P0 | EVT-003,EVT-004 | RLS-enforced; security-critical |
| EVT-016 | Event analytics | P0 | EVT-005 | Без exact location; Analytics §15/§16 |

**Sprint AC:** события видны только после onboarding; card/detail до approval без exact; host может создать; exact хранится отдельно; unsafe → pending_review; lifecycle статусы.

---

## 13. Sprint 4 — Applications, Host Review & Location Reveal

**Goal:** approval-based participation loop. **Epics:** Applications · Host review · Approve/reject/waitlist · Attendee mgmt · Location reveal · Notifications.

| Ticket | Описание | Pri | Deps | AC / Safety |
|--------|----------|-----|------|-------------|
| APP-001 | event_applications schema | P0 | EVT-002 | unique(event,user); Schema §9.1 |
| APP-002 | event_attendees schema | P0 | APP-001 | Schema §9.2 |
| APP-003 | Apply Modal | P0 | EVT-008 | Гейты onboarding/verif; FLOW-009 |
| APP-004 | Application note step | P0 | APP-003 | Note → moderation, host-only |
| APP-005 | Submit application (Edge Function) | P0 | APP-001 | Velocity; block/ban/restrict checks |
| APP-006 | Pending state | P0 | APP-005 | Approx area; нет chat |
| APP-007 | Cancel application | P0 | APP-005 | Revoke access |
| APP-008 | Hosted Event Dashboard | P0 | APP-001 | Host scope only |
| APP-009 | Applications List | P0 | APP-008 | Safe profile only |
| APP-010 | Applicant Detail | P0 | APP-009 | **Нет raw trust/sensitive**; OD-3 |
| APP-011 | Approve application (Edge Function) | P0 | APP-002 | Capacity-safe; opens exact+chat |
| APP-012 | Reject application | P0 | APP-001 | **Rejected ≠ exact** |
| APP-013 | Waitlist application | P0 | APP-001 | Waitlisted ≠ exact/chat |
| APP-014 | Enforce capacity during approval | P0 | APP-011 | Transaction/lock (race) |
| APP-015 | Create attendee record after approval | P0 | APP-011 | Только при approve |
| APP-016 | **Reveal exact location after approval** | P0 | APP-011,EVT-003 | Только approved; FLOW-011; security-critical |
| APP-017 | Revoke location access when attendee removed | P0 | APP-016 | Немедленно |
| APP-018 | Approval/rejection/waitlist notifications | P0 | APP-011 | **Payload без exact**; FLOW-013 |
| APP-019 | Application funnel analytics | P0 | APP-005 | Без intro_note |

**Sprint AC:** только onboarded apply; blocked/banned/restricted не apply; rejected/waitlisted не видят exact; approved видит exact; chat access позже; host видит только safe context; transitions validated.

---

## 14. Sprint 5 — Chat, Safety & Trust Foundations

**Goal:** social layer без open DMs + базовая safety/trust. **Epics:** Event chat · Chat access · Report/block · Trust events · Attendance/no-show basics · Notifications.

| Ticket | Описание | Pri | Deps | AC / Safety |
|--------|----------|-----|------|-------------|
| CHAT-001 | event_chat_messages schema | P0 | EVT-002 | Schema §10.1; no open DM |
| CHAT-002 | event_chat_states schema | P0 | CHAT-001 | freeze/expiry |
| CHAT-003 | Event Chat screen | P0 | APP-016 | FLOW-012 |
| CHAT-004 | **Enforce approved-attendee-only chat access** | P0 | CHAT-001,APP-002 | RLS-enforced; security-critical |
| CHAT-005 | Send chat message | P0 | CHAT-004 | Velocity; banned/restricted не пишут |
| CHAT-006 | System messages | P0 | CHAT-003 | Не утекает вне approved |
| CHAT-007 | Message actions | P0 | CHAT-003 | Report доступен |
| CHAT-008 | Report message | P0 | SAFE-004 | Контекст-снапшот (Q-MSG-SNAP) |
| CHAT-009 | Chat frozen state | P0 | CHAT-002 | Блок writes |
| CHAT-010 | Post-event chat expiry (placeholder) | P0 | CHAT-002 | Окно OD-4 |
| SAFE-001 | user_blocks schema | P0 | PROF-001 | self-block запрещён |
| SAFE-002 | Block User flow | P0 | SAFE-001 | Не уведомляет blocked; FLOW-019 |
| SAFE-003 | Enforce block restrictions | P0 | SAFE-002 | Blocked не apply/interact |
| SAFE-004 | reports schema | P0 | PROF-001 | target≥1; не публичны |
| SAFE-005/006/007 | Report User / Event / Message flows | P0 | SAFE-004 | Доступно из profile/event/chat; Инвариант 6 |
| TRUST-001 | trust_events schema (append-only) | P0 | PROF-001 | Internal only; Schema §13.1 |
| TRUST-002 | user_trust_summary schema | P0 | TRUST-001 | **Admin/system-only** |
| TRUST-003/004/005 | trust events: profile_completed / phone_verified / event_attended (placeholder) | P0 | TRUST-001 | Internal signals |
| TRUST-006 | **Hide raw trust score from all public views** | P0 | TRUST-002,PROF-004 | Инвариант 3; security-critical |
| ATT-001/002 | Attendance confirmation / no-show (placeholder) | P0 | APP-002 | Метод OD-8; internal trust |

**Sprint AC:** no open DMs; только approved chat; report/block из profile/event/chat; blocked не взаимодействуют; trust score internal-only; нет публичных негативных ярлыков; reported messages → moderation queue; analytics privacy boundary.

---

## 15. Sprint 6 — Admin Moderation & Security Hardening

**Goal:** beta-safe platform foundation. **Epics:** Admin dashboard · Moderation queue · Reports · Actions · Audit logs · Restrictions/bans · AI assist · RLS/security tests.

| Ticket | Описание | Pri | Deps | AC / Safety |
|--------|----------|-----|------|-------------|
| ADMIN-001 | Admin auth + authorization | P0 | INFRA-004 | Web only; service role server-side |
| ADMIN-002..008 | Admin screens: Moderation Queue, Report Detail, User Detail, Event Detail, Message Detail, Suspicious Activity, Audit Logs | P0 | ADMIN-001 | exact-доступ logged; AI assistive label |
| MOD-001 | moderation_actions schema | P0 | SAFE-004 | reason обязателен |
| MOD-002 | audit_logs schema (append-only) | P0 | MOD-001 | immutable |
| MOD-003..009 | Actions: dismiss / warn / restrict / ban / remove_event / hide_message / freeze_chat | P0 | MOD-001 | Serious → human + reason; FLOW-020/021 |
| MOD-010 | **Every moderation action creates audit log** | P0 | MOD-002 | Инвариант 4; security-critical |
| AI-001 | AI moderation interface (placeholder) | P0 | — | Advisory only |
| AI-002/003 | Profile text / event description moderation assist | P0 | AI-001 | AI не judge (Инвариант 5) |
| AI-004 | Chat/report summarization (placeholder) | P1 | AI-001 | Admin-only summaries |
| SEC-001 | RLS tests — location privacy | P0 | EVT-003,APP-016 | non-approved/rejected/waitlisted ≠ exact |
| SEC-002 | RLS tests — chat access | P0 | CHAT-004 | только approved |
| SEC-003 | RLS tests — profile privacy | P0 | PROF-004 | safe view без sensitive |
| SEC-004 | RLS tests — trust data | P0 | TRUST-006 | raw score не exposed |
| SEC-005 | RLS tests — reports/moderation | P0 | SAFE-004,MOD-002 | не публичны; append-only |
| SEC-006 | Verify service role not exposed | P0 | INFRA-007 | CI secret-check |

**Sprint AC:** admin review end-to-end; actions требуют reason; serious → audit log; banned не взаимодействует; restricted limits enforced; location/chat/trust RLS tests pass; AI advisory only.

---

## 16. Sprint 7 — Polish, Analytics & Closed Beta Prep

**Goal:** подготовить closed beta. **Epics:** Analytics · Crash · Notifications polish · UX polish · Performance · QA · Beta launch · Store prep · Privacy/terms.

| Ticket | Описание | Pri | Deps | AC / Safety |
|--------|----------|-----|------|-------------|
| ANA-001 | PostHog mobile tracking | P0 | INFRA-014 | Privacy boundary §33 |
| ANA-002 | Server-side critical event tracking | P0 | ANA-001 | approve/publish/report/moderation/attendance |
| ANA-003 | Admin analytics events | P0 | ANA-001 | Без sensitive report деталей |
| ANA-004/005/006 | Dashboards: activation / safety / beta-invite | P0 | ANA-002 | Analytics §29 |
| ANA-007 | Verify analytics privacy boundary | P0 | ANA-001 | Нет exact loc/raw body/trust score |
| SENTRY-001/002 | Sentry mobile / admin | P0 | INFRA-013 | Без raw sensitive в crash |
| QA-001..006 | QA: core loop · location privacy · report/block · admin moderation · mobile perf · accessibility | P0 | all | Регрессии safety |
| UX-001..005 | Polish: onboarding · empty states · loading · event detail states · safety microcopy | P0 | Sprint 3–5 | Calm UX; не dating-копи |
| BETA-004 | Beta launch checklist | P0 | all | §29 release criteria |
| BETA-005 | Seed events для первого beta city | P0 | EVT-002 | OD-10; no real PII |
| BETA-006 | Invite batch | P0 | BETA-001 | Курируемые hosts |
| LEGAL-001/002 | Privacy policy / Terms draft | P0 | — | Доступны в app |
| STORE-001..003 | App Store / Google Play metadata + screenshots | P0 | UX polish | Не dating-позиционирование |

**Sprint AC:** invite-only launch возможен; dashboards live; crash monitoring active; нет exact location leaks; reports/admin queue работают; P0 UX states polished; privacy/terms существуют; дистрибуция бета-юзерам возможна.

---

## 17. Epic Backlog

| Epic | Purpose | Tickets | Sprint | Pri | Key deps |
|------|---------|---------|--------|-----|----------|
| EPIC-DOC | Документация | DOC-001..011 | 0 | P0 | — |
| EPIC-FIG | Figma прототип | FIG-001/002 | 0 | P0 | EPIC-DOC |
| EPIC-INFRA | Инфраструктура | INFRA-001..015 | 1 | P0 | EPIC-FIG |
| EPIC-AUTH | Auth | AUTH-001..007 | 2 | P0 | EPIC-INFRA |
| EPIC-BETA | Invite/Waitlist | BETA-001..006 | 2,7 | P0 | EPIC-AUTH |
| EPIC-ONB | Onboarding | ONB-001..011 | 2 | P0 | EPIC-AUTH |
| EPIC-PROF | Profiles | PROF-001..004 | 2 | P0 | EPIC-ONB |
| EPIC-EVT | Events | EVT-001..016 | 3 | P0 | EPIC-PROF |
| EPIC-APP | Applications | APP-001..019 | 4 | P0 | EPIC-EVT |
| EPIC-LOC | Location Privacy | EVT-003/015, APP-016/017, SEC-001 | 3,4,6 | P0 | EPIC-EVT,EPIC-APP |
| EPIC-CHAT | Event Chat | CHAT-001..010 | 5 | P0 | EPIC-APP |
| EPIC-SAFE | Reports/Blocks | SAFE-001..007 | 5 | P0 | EPIC-PROF |
| EPIC-TRUST | Trust System | TRUST-001..006, ATT-001/002 | 5 | P0 | EPIC-APP |
| EPIC-MOD | Moderation | MOD-001..010, AI-001..004 | 6 | P0 | EPIC-SAFE |
| EPIC-ADMIN | Admin Dashboard | ADMIN-001..008 | 6 | P0 | EPIC-MOD |
| EPIC-ANA | Analytics | ANA-001..007 | 7 | P0 | core flows |
| EPIC-QA | Testing | QA-001..006, SEC-001..006 | 6,7 | P0 | all |
| EPIC-LEGAL | Privacy/Terms | LEGAL-001/002 | 7 | P0 | — |
| EPIC-STORE | App Store Prep | STORE-001..003 | 7 | P0 | UX |

---

## 18. P0 Ticket List

| Ticket | Sprint | Epic | Описание | Dependency | DoD summary |
|--------|--------|------|----------|------------|-------------|
| DOC-001..011 | 0 | DOC | Foundational docs | — | Файлы существуют ✅ |
| FIG-001/002 | 0 | FIG | P0 прототип + тест | DOC | Loop ясен; safety cues |
| INFRA-001..015 | 1 | INFRA | Foundation | FIG | Structure=Arch; CI; no service role client |
| AUTH-001..007 | 2 | AUTH | Auth + gates | INFRA | Protected; banned gate |
| BETA-001..003 | 2 | BETA | Invite/waitlist | AUTH | Atomic invite; usage tracked |
| ONB-001..011 | 2 | ONB | Onboarding | AUTH | Гейт событий; safety acceptance |
| PROF-001..004 | 2 | PROF | Profiles + safe view | ONB | Нет raw trust/PII в view |
| EVT-001..016 | 3 | EVT/LOC | Events + location split | PROF | Exact отделён; не до approval |
| APP-001..019 | 4 | APP/LOC | Applications + reveal | EVT | Approved-only exact; capacity-safe |
| CHAT-001..010 | 5 | CHAT | Event chat | APP | No open DM; approved-only |
| SAFE-001..007 | 5 | SAFE | Report/block | PROF | Из profile/event/chat |
| TRUST-001..006, ATT-001/002 | 5 | TRUST | Trust foundations | APP | Internal-only score |
| ADMIN-001..008 | 6 | ADMIN | Admin dashboard | MOD | Web only; logged |
| MOD-001..010 | 6 | MOD | Moderation + audit | SAFE | Reason + audit log |
| AI-001..003 | 6 | MOD | AI assist | AI-001 | Advisory only |
| SEC-001..006 | 6 | QA | RLS/security tests | core | Все pass |
| ANA-001..007 | 7 | ANA | Analytics + dashboards | core | Privacy boundary |
| SENTRY-001/002 | 7 | ANA | Crash monitoring | INFRA-013 | Active |
| QA-001..006 | 7 | QA | Full QA | all | Safety регрессии нет |
| UX-001..005 | 7 | — | UX polish | Sprint 3–5 | P0 states polished |
| BETA-004..006 | 7 | BETA | Launch prep | all | Checklist passed |
| LEGAL-001/002 | 7 | LEGAL | Privacy/Terms | — | Доступны |
| STORE-001..003 | 7 | STORE | Store metadata | UX | Не dating-позиционирование |

---

## 19. P1 Backlog (после закрытой беты)

| Item | Why P1 | Dependency | Risk | Product decision needed |
|------|--------|------------|------|-------------------------|
| Smart post-event intros | Reconnect усиление | event chat, trust | стать open DM | да — shared-context only |
| Better recommendations | После данных | analytics, events | dating-bias | да — не desirability |
| Recurring events | Host retention | events | recurring memberships | да — не монетизация |
| Co-hosts | Host scaling | events, roles | права/ответственность | OD-7 |
| Richer host tools | Hosting проще | host dashboard | privacy | — |
| Host analytics | Улучшение событий | analytics | PII | без PII участников |
| Advanced trust signals | Лучше safety | trust system | сложность | оставаться internal |
| Community circles | Расширение loop | events, trust | scope creep | да — Core update |
| Improved admin risk dashboard | Safety scale | moderation | over-reliance | AI advisory |
| Appeals flow | Fairness | moderation | нагрузка | Q-APPEAL |
| Privacy export/delete automation | GDPR | privacy | retention | OD-9 |
| Stronger identity verification | Trust | verification | friction | identity_reviewed решение |
| Event media | Богаче события | storage | moderation нагрузка | Q-IMG |
| Notification preferences | Calm UX | notifications | — | — |
| Advanced AI moderation | Scale safety | AI infra | false positives | human review остаётся |

---

## 20. P2 / Explicitly Deferred Backlog

| Item | Why deferred | Risk | Required product decision |
|------|--------------|------|---------------------------|
| Payments | Вне loop | fraud/regulation | Core update + compliance |
| Tickets | Логистика | споры | Product+ops |
| Paid events | Меняет мотивацию | fraud | Core update |
| Premium hosts | Монетизация привилегий | искажение trust | монетизация strategy |
| Public followers | Статус-гонка | creepiness | Core update |
| Public ratings | Инвариант 10 | social credit | **запрещено** без пересмотра Core |
| Dating mechanics | Позиционирование | repositioning | полный Core repositioning |
| Open DMs | Инвариант 2 | creep/abuse | **запрещено** без пересмотра Core |
| Nightlife/party | Risk profile | safety | safety re-assessment |
| Exact public map pins | Инвариант 1/9 | сталкинг | **запрещено** без пересмотра Core |
| Live location | Инвариант 9 | сталкинг | **запрещено** без пересмотра Core |
| Large marketplace | «small events first» | потеря intimacy | Core update |
| Business networking | Вне ICP | размытие | Core update |
| Monetization | Не нужно для гипотезы | искажение метрик | бизнес-решение + Core |
| Enterprise admin | Вне MVP | сложность | отдельный продукт-трек |

---

## 21. Dependencies Map

| Feature | Depends On | Blocks | Risk if Missing |
|---------|------------|--------|-----------------|
| Event discovery | profiles, cities, categories, events, public_events_view | applications | нет ценности |
| Application submission | onboarding, profiles, events, event_applications | approval, chat | нет loop |
| Location reveal | event_locations, application approval, RLS | attend, chat | **privacy breach** |
| Event chat | approved attendee status, chat schema | reconnect | нет social layer |
| Moderation | reports, admin dashboard, audit logs | safe beta | unsafe beta |
| Trust | trust_events, moderation/attendance | host confidence | слабая safety |
| Analytics | core events implemented | product decisions | слепой запуск |
| Beta launch | invite-only, moderation, analytics, QA | внешние юзеры | хаотичный/опасный запуск |
| Admin dashboard | admin auth, moderation schema | enforcement | нет safety operations |

---

## 22. Security-Critical Tickets

| Ticket | Associated risk | Required tests | Related docs |
|--------|-----------------|----------------|--------------|
| EVT-003 exact location separation | privacy breach | SEC-001 | Schema §8.3, Security §12 |
| EVT-015 no exact before approval | location leak | SEC-001 | Security §12 |
| EVT-004 public_events_view safe | sensitive leak | SEC-003 | Schema §17.2 |
| PROF-004 public_profiles_view safe | PII leak | SEC-003 | Security §10 |
| CHAT-004 approved-only chat | broad chat access | SEC-002 | Security §15 |
| SAFE-004 report privacy | report data leak | SEC-005 | Security §17 |
| TRUST-006 trust score protection | raw score exposed | SEC-004 | Trust §11/§12 |
| MOD-010 audit log creation | unaccountable enforcement | SEC-005 | Moderation §27 |
| INFRA-007 service role boundary | service role exposure | SEC-006 | Security §22 |
| ANA-007 analytics privacy boundary | sensitive in analytics | QA-002 | Analytics §33 |
| APP-018 notification privacy | location leak via push | QA-002 | Security §21 |
| SAFE-003 block enforcement | blocked interaction | QA-003 | Security §16 |
| AUTH-007 banned user gate | banned interaction | SEC-006 | Security §6/§7 |

---

## 23. RLS Test Backlog

- non-approved user **не** читает exact location;
- pending user **не** читает exact location;
- waitlisted user **не** читает exact location;
- rejected user **не** читает exact location;
- approved user читает exact location **только для своего approved события**;
- removed attendee теряет location access;
- non-approved user **не** читает chat;
- approved user читает **только** свой event chat;
- frozen chat блокирует writes;
- public profile исключает private details;
- public profile исключает raw trust score;
- normal user **не** читает `trust_events`;
- normal user **не** читает `user_trust_summary`;
- reported user **не** читает report;
- normal user **не** читает `moderation_actions`;
- normal user **не** читает `audit_logs`;
- service role **не** exposed client-side.

---

## 24. Analytics Implementation Backlog

> Forbidden props для всех — Analytics §33 (exact location, raw body/description, raw trust, PII). Owner по умолчанию: Claude Code (instrumentation) + Founder (dashboards).

| Раздел | Events | Trigger | Properties |
|--------|--------|---------|------------|
| Activation | signup_started, signup_completed, onboarding_completed, profile_completed, first_event_viewed, first_application_created, first_event_attended | соответствующее действие | method, step_name, city_id |
| Events | event_viewed, event_created, event_published, event_cancelled | lifecycle | event_id, category_id, event_status |
| Applications | application_created, application_approved, application_rejected, application_waitlisted | status change | event_id, application_status |
| Chat | event_chat_opened, chat_message_sent, message_reported | chat | event_id, message_type |
| Safety | report_created, block_created, moderation_action_taken | safety action | report_category, action_type |
| Trust | phone_verified, attendance_confirmed, no_show_recorded, reliable_badge_earned | trust signal | trust_event_type, badge_type |
| Beta | invite_code_used, waitlist_joined, beta_access_granted | beta funnel | invite_status, city_id |

---

## 25. QA Plan by Sprint

| Sprint | Что тестировать | Critical flows | Safety checks | Регрессии |
|--------|-----------------|----------------|---------------|-----------|
| 1 | Skeleton, navigation, env | app boot | service role не client | — |
| 2 | Auth, invite, onboarding | signup→onboarding | banned gate; onboarding-гейт событий | auth |
| 3 | **Discovery/creation/detail** | event view | **exact location не утекает** (card/detail/preview/API) | location privacy |
| 4 | Applications/approval | apply→approve→reveal | **approval контролирует location access**; rejected/waitlisted ≠ exact | location, capacity race |
| 5 | Chat/safety/trust | chat, report, block | **no open DMs**; approved-only chat; trust score не exposed | chat access |
| 6 | Admin/moderation | report→action→audit | **moderation actions audit logged**; AI advisory | RLS tests |
| 7 | **Full closed beta QA** | весь loop end-to-end | все safety-инварианты; analytics privacy | полная регрессия |

---

## 26. Human Review Gates

Обязательный human/founder review: Product Core changes · PRD changes · UX flows · Figma prototype · database schema · RLS policies · location privacy implementation · trust score logic · moderation actions · AI moderation behavior · beta launch · privacy policy · app store metadata.

> **Claude Code может генерировать реализацию, но человек обязан ревьюить safety/security/product решения** (CLAUDE.md §3; Architecture §32).

---

## 27. Claude Code Usage Plan

**Хорошие задачи для Claude Code:** boilerplate · migrations из schema · CRUD-экраны · формы · validators (Zod) · тесты · RLS-тесты · seed data · analytics events · admin dashboard pages · рефактор повторяющегося UI.
**Требуют human review:** architecture changes · RLS policies · trust scoring · moderation rules · location privacy · UX-копи вокруг safety · AI enforcement behavior · beta launch decisions.

**Перед каждой coding task Claude отвечает (CLAUDE.md §1):**
1. Какая фича реализуется. 2. Какие docs применимы. 3. Какие safety-инварианты важны. 4. Какие файлы будут изменены. 5. Какие тесты нужны.

---

## 28. Implementation Readiness Checklist

- [x] Product Core complete
- [x] PRD complete
- [x] User Stories complete
- [x] User Flows complete
- [x] Figma Prototype Plan complete
- [x] Architecture complete
- [x] Database Schema complete
- [x] Security/RLS complete
- [x] Trust System complete
- [x] Moderation complete
- [x] Analytics complete
- [x] Sprint Backlog complete (этот документ)
- [ ] P0 Figma prototype drafted (FIG-001)
- [ ] Key open decisions listed/resolved (см. §31; критично: OD-1, OD-3, OD-4, OD-6, OD-9, OD-10, OD-13)
- [ ] Location privacy design reviewed (human gate)
- [ ] First beta city/context decided (OD-10)
- [ ] Repo setup plan approved (INFRA-001)

> Код не начинается, пока незакрытые строки выше не сделаны/задокументированы.

---

## 29. Closed Beta Release Criteria

Бета стартует только если: invite-only работает · auth работает · onboarding работает · profile completion работает · event discovery работает · event creation работает · application flow работает · host approval работает · **exact location reveal только для approved** · **event chat только для approved attendees** · report/block работают · moderation queue работает · admin может restrict/ban/remove event · audit logs работают · core analytics events работают · crash monitoring работает · **нет проваленных critical RLS-тестов** · privacy policy и terms существуют · beta safety operations определены.

---

## 30. Beta Success Metrics

60%+ signup завершают onboarding · 40%+ onboarded смотрят ≥1 событие · 40%+ onboarded подают ≥1 заявку · 25%+ onboarded посещают ≥1 событие за 14 дней · 20%+ attendees посещают второе · hosts создают повторные события · high/critical reports reviewed быстро · users понимают location privacy · users **не** воспринимают как dating app · users чувствуют себя в безопасности.

---

## 31. Open Delivery Questions

| # | Вопрос | Влияет на |
|---|--------|-----------|
| Q-FIG | Завершён ли P0 Figma прототип до кода? | Sprint 0→1 gate |
| OD-10 | Первый beta city? | BETA-005, seed |
| OD-1 | Phone verification до apply или approval? | AUTH/ONB/APP |
| OD-13 | Все first-time host события — manual review? | EVT-012, Sprint 3/6 |
| Q-RJ | Exact location сразу после approval или ближе к старту? | APP-016 |
| Q-RM | Может ли host удалить approved attendee? | APP-017 |
| Q-FREEZE | Host может freeze чат или только admin? | CHAT-009, MOD-009 |
| OD-4 | Сколько открыт post-event chat? | CHAT-010 |
| OD-6 | Минимальный profile completeness для apply? | APP-003/005 |
| OD-12 | Approved видят attendee list до события? | APP-010, EVT-009 |
| AQ-RATE | P0 rate-limit значения? | APP-005, CHAT-005, SAFE-005 |
| AQ-MODCAT | Первый AI moderation provider/setup и категории? | AI-001..003 |
| AQ-ADMIN | Admin dashboard до входа внешних юзеров? | Sprint 6 vs 7 |
| Q-BRAND | Какое имя/брендинг для беты? | STORE-001..003 |
| Q-LEGAL | Какие legal/privacy шаблоны? | LEGAL-001/002 |
| OD-9 | Retention reports/audit/analytics? | MOD-002, ANA |

---

## 32. Sprint Backlog Summary

- Sprint Backlog переводит всю документацию в пошаговый implementation plan.
- MVP-доставка организована в **Sprint 0–7**; P0 фокусируется на trusted offline social loop.
- Safety/security/location privacy встроены в **каждый** спринт (security-critical tickets + RLS test backlog + QA по спринтам + human review gates).
- Определены: ticket format, global DoD, safety invariants, epics, P0/P1/P2 backlogs, dependencies, Claude Code usage plan, readiness checklist, release criteria.
- **Документационная фаза завершена** (DOC-001..011 ✅).
- **Следующий шаг:** Implementation Readiness Review → закрытие критичных open decisions (OD-1/3/4/6/9/10/13) + FIG-001 P0 прототип → затем фактический project setup (Sprint 1, INFRA-001).

> Напоминание: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth; весь backlog ему подчинён. Код/SQL/migrations/SDK не создавались.
