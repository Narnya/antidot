# Auth, Beta Access & Onboarding Implementation Plan v1 — Antidot

> **Ticket:** **AUTH-000** — Supabase Auth Implementation Plan.
> **Status:** v1 (planning document — implementation **not authorized**).
>
> **Implementation status (live):**
>
> - ✅ **AUTH-001** — Install Supabase client + create public anon wrapper (`apps/mobile/src/lib/supabase/client.ts`). Completed 2026-05-31. Format / typecheck / lint / test pass. Dependencies: `@supabase/supabase-js@^2.106.2`, `@react-native-async-storage/async-storage@1.23.1`, `react-native-url-polyfill@^3.0.0`. Env naming: `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (preferred) + `EXPO_PUBLIC_SUPABASE_ANON_KEY` (transitional alias accepted). Runtime auth requires real Supabase project env values — currently placeholders.
> - 🟡 **AUTH-002…008, BETA-001…003, ONB-001…014, PROF-001…003** — pending; каждый ticket требует отдельный explicit prompt.
> **Owner:** Technical Founder + Founder/Product (review).
> **Last updated:** 2026-05-31.
> **First source of truth:** [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) (Product Core v2).
> **Phase gate authority:** [`/docs/28_PHASE_GATE_TO_SPRINT_2_CIRCLE_AUTH_ONBOARDING.md`](28_PHASE_GATE_TO_SPRINT_2_CIRCLE_AUTH_ONBOARDING.md) §10 (Second Task After RU Pass).
> **Sprint Backlog reference:** [`/docs/11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md) §13 (Sprint 2 tickets).
> **Env strategy (binding):** [`/docs/19_ENV_CONFIG_STRATEGY.md`](19_ENV_CONFIG_STRATEGY.md).
> **Security source:** [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §6 (Auth & Role Model v2), §7 (Global Access Gates v2).

> ⚠️ **Это planning / documentation task only.** Никаких dependencies не installed, никакой Supabase connection не создаётся, никаких `package.json` правок, никаких files в `apps/mobile` / `apps/admin`. План описывает **what AUTH-001 и далее tickets will do**, не **запускает их**.

---

## 1. Source of Truth

- **Product Core v2** ([`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md)) — first source of truth.
- Этот план следует **Sprint Backlog v2** ([`/docs/11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md) §13) и **Phase Gate 28** ([`/docs/28_PHASE_GATE_TO_SPRINT_2_CIRCLE_AUTH_ONBOARDING.md`](28_PHASE_GATE_TO_SPRINT_2_CIRCLE_AUTH_ONBOARDING.md)).
- **Этот документ сам по себе не authorize implementation.** Сам по себе он — **markdown план**, а не trigger.
- **Каждый implementation ticket** (AUTH-001, AUTH-002, ..., BETA-001, ..., ONB-001, ..., PROF-001, ...) **требует отдельный explicit prompt** с pre-task checklist (CLAUDE.md §1).
- **Supabase должен быть connected только через explicit AUTH-001** или более поздний task. AUTH-000 — **только план**.
- **Все 23 hard rules** (CLAUDE.md §2) остаются binding.

---

## 2. Scope

### In scope (для планирования в этом документе)

- **Supabase Auth** как identity provider;
- **email signup / login** (AUTH-002);
- **Google login** (AUTH-003);
- **Apple login** (AUTH-004);
- **session persistence** (AUTH-005);
- **logout** (AUTH-006);
- **protected route gates** (AUTH-007);
- **restricted / banned placeholder gate** (AUTH-008);
- **invite-only beta gate** (BETA-001, BETA-003);
- **waitlist flow** (BETA-002);
- **onboarding gate** (ONB-014);
- **basic auth state model** (guest / authenticated_not_onboarded / onboarded_user / restricted_user / banned_user);
- **public anon client boundary** (Mobile использует **только** `EXPO_PUBLIC_*` env vars — [`/docs/19_ENV_CONFIG_STRATEGY.md`](19_ENV_CONFIG_STRATEGY.md) §4);
- **env variable requirements**.

### Out of scope (для AUTH-000 и Sprint 2 в целом)

- ❌ Circle Discovery (Sprint 3+);
- ❌ Circle Detail (Sprint 3+);
- ❌ Request Place (Sprint 4);
- ❌ Membership Requests (Sprint 4);
- ❌ Meetings (Sprint 5);
- ❌ Meeting Location Reveal (Sprint 5; Инв. 1);
- ❌ Circle Chat (Sprint 6);
- ❌ My Circles / Belonging (Sprint 5–6);
- ❌ database migrations (DBV2-001 и далее, Sprint 4+);
- ❌ SQL of any kind;
- ❌ RLS policies (RLSV2-001 и далее, Sprint 4+);
- ❌ admin service role client (admin app server-side only);
- ❌ trust scoring (Sprint 6 — TRUST-001…006);
- ❌ analytics SDK (Sprint 8 — ANA-001);
- ❌ Sentry (Sprint 8 — SENTRY-001);
- ❌ AI moderation (Sprint 7 placeholder, real подключение позже).

---

## 3. Auth Goals

1. **Allow beta users** to sign up / sign in safely.
2. **Keep invite-only beta access enforced** (нет beta access → нет app).
3. **Keep unauthenticated users out of app** (только public routes).
4. **Keep `authenticated_not_onboarded` users inside onboarding only** (no Circle Discovery до onboarding completion).
5. **Prepare session persistence** safely (token refresh, storage strategy).
6. **Prepare Google / Apple OAuth flow** safely (redirect URIs, deep links).
7. **Keep service role out of mobile / browser** (Инв. 12; [`/docs/19_ENV_CONFIG_STRATEGY.md`](19_ENV_CONFIG_STRATEGY.md) §6).
8. **Keep exact meeting location** completely out of scope (Инв. 1 — meeting locations не существуют в Sprint 2).
9. **Avoid leaking secrets** или private env vars (no service role, no AI keys в mobile).
10. **Keep future RLS compatibility** — auth UID должен быть consistent с future `auth.users.id` references в Schema v2.

---

## 4. Auth Non-Goals

**Не строим сейчас:**

- ❌ custom user management backend (Supabase Auth — единственный identity provider);
- ❌ service role client в mobile;
- ❌ admin auth (admin app — отдельный track, позже);
- ❌ database schema migrations (DBV2 tickets, Sprint 4+);
- ❌ RLS (RLSV2 tickets, Sprint 4+);
- ❌ profile tables (зависит от DBV2-004, Sprint 4);
- ❌ circle data (Sprint 3+);
- ❌ chat (Sprint 6);
- ❌ payments (Core v2 §26 — forbidden в MVP);
- ❌ open DMs (Инв. 2 — forbidden);
- ❌ production secrets (только placeholder / staging credentials в Sprint 2);
- ❌ advanced MFA (P1+);
- ❌ passkeys (P1+);
- ❌ enterprise SSO (P2+).

---

## 5. Current Infrastructure Assumptions

> Verified by [`/docs/21_SPRINT_1_INFRASTRUCTURE_REVIEW.md`](21_SPRINT_1_INFRASTRUCTURE_REVIEW.md) — Sprint 1 PASS (updated 2026-05-28 после FIX-INFRA-001).

- ✅ **monorepo** существует (pnpm workspaces);
- ✅ **`/apps/mobile`** Expo app skeleton существует (Expo SDK 52, React 18 / RN 0.76.9);
- ✅ **`/apps/admin`** Next.js 15 / React 18 admin skeleton существует;
- ✅ **`/packages/config`** workspace package существует (env types / readers per [`/docs/19_ENV_CONFIG_STRATEGY.md`](19_ENV_CONFIG_STRATEGY.md) §3);
- ✅ **env examples** существуют (`.env.example` per INFRA-006);
- ✅ **TypeScript / lint / test / format checks pass** (Sprint 1 PASS, FIX-INFRA-001);
- ✅ **Supabase placeholders** существуют (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` — пустые placeholder values);
- ❌ **no real Supabase connection yet** (никакого Supabase project не создано / не подключено);
- ❌ **no migrations yet** (`supabase/migrations/` пустой);
- ❌ **no RLS yet** (никаких policies).

---

## 6. Supabase Auth Approach

### Recommended approach

- **Use Supabase Auth** как identity provider (GoTrue под капотом).
- **Use public / publishable / anon-safe key** в mobile (`EXPO_PUBLIC_SUPABASE_ANON_KEY` — [`/docs/19_ENV_CONFIG_STRATEGY.md`](19_ENV_CONFIG_STRATEGY.md) §4).
- **Never use service role** в mobile (Инв. 12 — service role существует **только** в `apps/admin/src/config/serverEnv.ts` с `import 'server-only'` guard).
- **Store session safely** on device (см. §15 — open decision AsyncStorage vs SecureStore).
- **Use Supabase auth state listener** (`supabase.auth.onAuthStateChange`) для реактивных state updates.
- **Use protected route gates** в Expo Router (см. §9 — route group strategy).
- **Keep app state derived** from session + local profile / onboarding state (без profiles table в Sprint 2 — placeholder strategy в §16).

### Dependencies to be installed later (NOT now)

#### Potential mobile dependencies (AUTH-001+)

- `@supabase/supabase-js` — Supabase JS client;
- `@react-native-async-storage/async-storage` — fallback session storage (если выбран AsyncStorage);
- `react-native-url-polyfill` — required для Supabase в React Native;
- `expo-secure-store` — если выбран SecureStore для session storage (см. §15 open decision);
- `expo-auth-session` — OAuth helper (AUTH-003 / AUTH-004);
- `expo-linking` — deep link handling (OAuth redirect);
- `expo-web-browser` — OAuth browser flow.

### Decisions needed (см. также §25 Open decisions)

- **AsyncStorage vs SecureStore** для mobile auth session storage;
- **Expo Router deep link scheme** (e.g., `antidot://` или Universal Links);
- **OAuth redirect URI strategy** (custom scheme vs https universal link).

### Important

> **AUTH-000 не устанавливает зависимости.** Никаких `pnpm add` команд, никаких изменений `package.json`. Список выше — **прогноз для AUTH-001 reviewer'а**, чтобы они знали, какой scope добавлений согласовать.

---

## 7. Environment Variables

> Binding: [`/docs/19_ENV_CONFIG_STRATEGY.md`](19_ENV_CONFIG_STRATEGY.md) — конвенция уже зафиксирована в Sprint 1.

### 7.1 Mobile public env (`apps/mobile/src/config/env.ts`)

**Allowed (per [`/docs/19_ENV_CONFIG_STRATEGY.md`](19_ENV_CONFIG_STRATEGY.md) §4):**

- `EXPO_PUBLIC_APP_ENV` (`local` / `staging` / `production`);
- `EXPO_PUBLIC_SUPABASE_URL`;
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` (или `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — см. §25 open decision о naming).

**Future optional (Sprint 8 — не Sprint 2):**

- `EXPO_PUBLIC_POSTHOG_KEY`;
- `EXPO_PUBLIC_POSTHOG_HOST`;
- `EXPO_PUBLIC_SENTRY_DSN`.

**Rules (binding — Инв. 12, 13):**

- 🚫 **no service role** в mobile (никогда);
- 🚫 no AI keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY` — server-only);
- 🚫 no private API keys;
- 🚫 no production secrets committed (только placeholder / staging в Sprint 2).

### 7.2 Admin public env (`apps/admin/src/config/publicEnv.ts`)

**Allowed (per [`/docs/19_ENV_CONFIG_STRATEGY.md`](19_ENV_CONFIG_STRATEGY.md) §5; not used directly в Sprint 2 mobile auth, но reference):**

- `NEXT_PUBLIC_APP_ENV`;
- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (или `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).

### 7.3 Admin / server-only env (`apps/admin/src/config/serverEnv.ts`)

**Not used в mobile auth task.** Перечислен только для reference (per [`/docs/19_ENV_CONFIG_STRATEGY.md`](19_ENV_CONFIG_STRATEGY.md) §6):

- `SUPABASE_SERVICE_ROLE_KEY` — **server-only**, guarded `import 'server-only'`;
- `ADMIN_ALLOWED_EMAILS` (comma-separated);
- `OPENAI_API_KEY` — AI placeholder;
- `ANTHROPIC_API_KEY` — AI placeholder.

**Rules (binding — Инв. 12):**

- 🚫 **never import server-only env into client components** (build-time enforced через `'server-only'` package);
- 🚫 **no service role usage** в Sprint 2 mobile auth (вообще нигде в mobile);
- 🚫 **no service role в admin client components** (только server actions / route handlers / RSC).

### 7.4 Open decision (§25 #3)

- **Naming consistency:** Supabase в новых ключах использует терминологию `publishable_key` (рекомендация Supabase 2025+). Решить: оставить `_ANON_KEY` (соответствует существующим `.env.example` из INFRA-006) или мигрировать на `_PUBLISHABLE_KEY` в Sprint 2. Recommendation: **оставить `_ANON_KEY`** до отдельного rename-задачи — INFRA-stable.

---

## 8. Auth State Model

State machine для Sprint 2. Aligned с [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §6 (Auth & Role Model v2).

### 8.1 `guest`

**Условие:** нет session.

**Allowed routes:**

- Welcome (MOB-001);
- Invite Code (MOB-004);
- Login;
- Signup;
- Waitlist.

**Blocked:**

- onboarding stack;
- Circle Discovery;
- My Circles;
- Circle Chat;
- любые protected routes.

### 8.2 `beta_access_pending`

**Условие:** имеет auth session или pre-auth state, но valid invite / beta access отсутствует.

**Allowed:**

- Invite Code (MOB-004);
- Waitlist.

**Blocked:** всё остальное.

### 8.3 `authenticated_not_onboarded`

**Условие:** authenticated, но onboarding не завершён (`onboarding_completed_at` null или onboarding flag отсутствует — см. §16 source-of-truth options).

**Allowed:**

- onboarding stack (ONB-001…013);
- logout;
- profile draft (если применимо).

**Blocked:**

- Circle Discovery;
- My Circles;
- Circle Chat;
- Request Place.

### 8.4 `onboarded_user`

**Условие:** authenticated и onboarding complete.

**Allowed (Sprint 2 territory):**

- профиль (own — PROF-004 позже);
- logout.

**Allowed позже (Sprint 3+):**

- Circle Discovery;
- My Circles (если memberships exist).

### 8.5 `restricted_user`

**Условие:** authenticated, но scope-restricted (admin action — Moderation v2 §14.2).

**Sprint 2 behavior:** **placeholder gate** — route concept defined, **не имплементировать enforcement** до тех пор, пока schema (`profile_status` enum) не существует. См. §17.

### 8.6 `banned_user`

**Условие:** authenticated, но banned (admin action — Moderation v2 §14.4).

**Sprint 2 behavior:** **placeholder gate** — route concept defined, **не имплементировать enforcement** до schema. См. §17.

### 8.7 `admin`

**Не mobile role.** Admin web only (admin app в `apps/admin`, отдельный track — не в этом плане).

---

## 9. Route Gate Model

### Recommended Expo Router structure

Используем **route groups** Expo Router (per Expo Router conventions):

- `(public)` — гостевые маршруты;
- `(onboarding)` — onboarding stack;
- `(app)` — main app shell после onboarding;
- `(modals)` — modal screens (parent-context-dependent).

### Gate logic

#### `(public)` routes

- ✅ allowed для `guest`;
- ✅ allowed для всех (Welcome / Login / Signup доступны даже authenticated users если они хотят switch account).

#### `(onboarding)` routes

- ✅ require session;
- ✅ require **not onboarded** (`authenticated_not_onboarded` state);
- ❌ если user уже `onboarded_user` — redirect в `(app)`.

#### `(app)` routes

- ✅ require session;
- ✅ require beta access (BETA-003 gate);
- ✅ require onboarding complete (ONB-014 gate);
- ✅ require **not banned** / **not restricted** (placeholder в Sprint 2 — §17).

#### `(modals)` routes

- access depends on parent context (e.g., Request Place modal требует Circle Detail context — Sprint 4+ territory).

### Important

> **Не имплементировать gates в AUTH-000.** Это **planning shape** — реализация в AUTH-007 после explicit prompt'а.

---

## 10. Invite-only Beta Gate

### Option A — Pre-auth invite gate

User вводит invite **до** signup.

**Pros:**

- prevents unauthenticated signups (нет «orphan accounts» без access);
- cleaner closed beta narrative.

**Cons:**

- более friction;
- invite code handling до того, как user существует (где трекать «entered but didn't signup»?);
- waitlist storage без user ID более сложен.

### Option B — Post-auth invite gate

User signs up / logs in, **затем** invite gate unlocks app.

**Pros:**

- проще с Supabase Auth (user identity уже существует для invite tracking);
- waitlist storage привязан к auth.users.id;
- лучшая observability funnel.

**Cons:**

- больше accounts без actual access;
- риск, что users «застряли» в beta_access_pending state без conversion.

### Recommended MVP

> **Option B (Post-auth invite gate)** — для simpler implementation в Sprint 2.

**Flow:**

```
Signup / Login
  → Check beta access
  → If no access: Invite Code screen / Waitlist screen
  → If access granted: Onboarding
  → If onboarding complete: App
```

**Open decision (§25 #11):** требовать ли invite code **до** account creation? Recommend: **нет** (Option B); финальное product decision — founder.

---

## 11. Waitlist Flow Plan

### Flow

```
User не имеет invite
  → Waitlist Signup screen
  → email / city / context (минимум) captured
  → confirmation message
  → no app access до тех пор, пока invite / access granted
```

### Data boundary

- ✅ email (для notification когда invite доступен);
- ✅ city (для beta cohort planning);
- ✅ name (опционально);
- ✅ source (откуда узнал — UTM-like, опционально);
- ❌ **no sensitive data** за пределами email / city / name / source;
- ❌ no production secrets;
- ❌ no marketing automation в P0 (если явно не решено founder'ом).

### Implementation note (binding)

> **Waitlist может требовать `waitlist_entries` table / migration** (см. [`/docs/06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) §15.2).
>
> **Не имплементировать table / migration до DBV2 schema task** (Sprint 4+).
>
> **Для ранней Sprint 2:** waitlist может быть **UI placeholder** (mock submit без real storage) или **local-only planning** depending на ticket — конкретное решение — в BETA-002 ticket prompt.

---

## 12. Email Auth Plan

### Plan

Реализация (AUTH-002 после AUTH-001):

- signup с email / password;
- login с email / password;
- email confirmation behavior (см. §25 open decision);
- error states (см. §21);
- password reset (P1, не Sprint 2);
- session creation на successful signup / login.

### Screens

- Signup (MOB-???);
- Login (MOB-???);
- Auth Error (inline error state, не отдельный screen);
- Email Confirmation Pending (если confirmation required);
- Logout confirmation (опционально, или silent logout).

> Screen IDs будут assigned дизайнером в Figma v2 / Design Handoff v2 update; placeholder здесь.

### Acceptance criteria (для AUTH-002 ticket позже)

- ✅ user может sign up с valid email / password;
- ✅ user может log in с existing credentials;
- ✅ errors user-friendly (Russian copy);
- ✅ session persists через app restart (AUTH-005 territory);
- ✅ logout clears session и sensitive cache (AUTH-006).

### Open decisions (§25)

- **#5 email/password vs magic link** — recommend email/password для familiarity; magic link — P1;
- **#6 email confirmation required during beta?** — recommend **да** для verified user list;
- **#7 password reset P0 or P1?** — recommend **P1** (manual founder reset в beta).

---

## 13. Google Auth Plan

### Plan (AUTH-003)

- **Configure Google provider** в Supabase Dashboard (production / staging projects) — later;
- **Configure OAuth client** в Google Cloud Console (web + iOS + Android) — later;
- **Configure redirect URLs / deep links** (custom scheme `antidot://` или Universal Links / Android App Links);
- **Implement** `supabase.auth.signInWithOAuth({ provider: 'google' })` — later;
- **Handle redirect / deep link** через `expo-linking` + `expo-web-browser`.

### Out of scope сейчас

- ❌ provider credentials (Google Cloud project);
- ❌ Google Cloud setup;
- ❌ real OAuth implementation.

### Open decisions (§25)

- **#8 Google login P0 или after email auth stable?** — recommend **after email auth stable** (минимизирует риск отладки OAuth до того, как basic auth работает);
- **#10 app scheme / redirect URI** — recommend `antidot://` custom scheme для simplicity, рассмотреть Universal Links для production;
- **local dev redirect strategy** — Expo dev client с `expo-linking.createURL('/')`.

---

## 14. Apple Auth Plan

### Plan (AUTH-004)

- **Required для iOS** если предлагаем другие social logins в production / App Store context (Apple guideline 4.8);
- **Configure Apple provider** в Supabase Dashboard — later;
- **Configure app identifiers / capabilities** в Apple Developer Portal — later;
- **Implement** `signInWithOAuth({ provider: 'apple' })` или `expo-apple-authentication` native flow — later;
- **Handle redirect / session exchange** в native flow или через Supabase.

### Out of scope сейчас

- ❌ Apple Developer credentials;
- ❌ production app identifiers;
- ❌ real Apple login implementation.

### Open decisions (§25)

- **#9 Apple login P0 before beta или before App Store review?** — recommend: **App Store review** (TestFlight beta может работать без Apple login если только email / Google enabled; продакшен submission потребует Apple login если есть Google).
- **TestFlight beta requirement timing** — обсудить с founder при готовности к public beta.

---

## 15. Session Persistence Plan

### Plan (AUTH-005)

- **Session persists** через app restart;
- **Session refreshes** safely (token rotation Supabase auto-handles при правильной storage adapter setup);
- **Logout clears** session **и** sensitive cached data;
- **Auth state listener** (`supabase.auth.onAuthStateChange`) updates app gate state реактивно;
- **App foreground / background refresh** strategy follows Supabase + React Native guidance (`AppState` listener для refresh on resume);
- **Clear sensitive cached data on logout** (любые `circle_*`, `meeting_*` локальные caches — если они появятся позже).

### Open decisions (§25)

- **#4 AsyncStorage vs SecureStore?**
  - **AsyncStorage:** проще, supported Supabase docs, но не encrypted на устройстве;
  - **SecureStore (`expo-secure-store`):** encrypted (iOS Keychain / Android EncryptedSharedPreferences), но size limit ~2KB на iOS (session tokens обычно влезают, но nuance).
  - **Recommend:** **SecureStore** для access / refresh tokens (encrypted), AsyncStorage если не справляется по size. Founder review.
- **#15 platform-specific storage adapters?** — Supabase v2 supports custom storage adapter — можно сделать unified wrapper.
- **#14 web support в Expo app?** — recommend **no** для Sprint 2 (mobile-first per Core v2 §31; admin — отдельный Next.js app).

### Important (binding — Инв. 1)

> **Не кэшировать exact meeting location в auth layer.** Meeting location не в scope Sprint 2. Когда дойдём до Sprint 5 (MEET-002), exact location будет fetched **только** in-app через authorized server-side path, **никогда не cached** в session / AsyncStorage / SecureStore.

---

## 16. Onboarding Gate Plan

Onboarding completion tracking — открытый вопрос, поскольку source of truth (`profiles` table) ещё не существует.

### Option A — Supabase Auth user metadata

Хранить `onboarding_completed_at` в `auth.users.raw_user_meta_data`.

**Pros:**

- available immediately после auth;
- нет schema dependency.

**Cons:**

- **не идеальный** long-term source of truth (Supabase recommend application tables для business logic);
- harder to query / secure через RLS;
- migration к profiles table позже потребует backfill.

### Option B — `profiles` table

Хранить `profile_completeness` / `onboarding_completed_at` в `profiles` table (Schema v2 §7.1).

**Pros:**

- proper application data model;
- RLS-friendly (existing RLS v2 §10 plan);
- future-ready (consistent с DBV2 design).

**Cons:**

- **требует migrations** (DBV2-004 — Sprint 4).

### Recommended

> **Use `profiles` table как source of truth** **после того, как** Database Schema v2 migration существует (DBV2-004 — Sprint 4 ticket).
>
> **Before schema exists** (Sprint 2 — auth / onboarding implementation):
>
> - route gate может использовать **local placeholder / mock** во время UI build;
> - **не имплементировать permanent onboarding gate** через `auth.users.raw_user_meta_data` без explicit product decision;
> - **не создавать `profiles` migration** в AUTH-000 / AUTH-001 / ONB-014 — это **out of scope** Sprint 2 (это DBV2 territory).

### Open decision (§25 #13)

> **Should AUTH Sprint 2 create minimal `profiles` migration** или подождать DBV2 task?
>
> **Recommendation:** **подождать DBV2** (Sprint 4). В Sprint 2 — onboarding UI с mock state, gate logic как **placeholder** до DBV2-004 + RLSV2-001 ready. Это сохраняет CLAUDE.md §6 boundary («блок миграций до v2 docs ready» — теперь partially relaxed для DBV2 в Sprint 4, но не Sprint 2).

### Recommendation (binding для AUTH-000)

> **Не создавать migrations в AUTH-000 / AUTH-001 / любой Sprint 2 ticket.** План gate **shape** only. Реальный gate — в Sprint 4–5 после `profiles` table existit и DBV2-004 + RLSV2-001 approved.

---

## 17. Restricted / Banned Placeholder Gate

### Future behavior (Sprint 7+ when profile_status enum exists)

- `banned_user` cannot access app content (auth gate blocks all routes кроме logout);
- `restricted_user` имеет limited actions (per Moderation v2 §14.2 — chat / request / hosting limited);
- gate dependence на `profiles.profile_status` (enum — Schema v2 §5: `incomplete` / `active` / `restricted` / `suspended` / `banned` / `deleted`) + trust / admin state.

### Sprint 2 placeholder

- **Route concept defined** (auth state model §8.5, §8.6);
- **No real banned / restricted backend** unless schema exists (Sprint 7 — MOD-005 / MOD-006);
- **No fake enforcement** that дает false sense of safety (если placeholder показывает «вы banned» без реального backend check — это безопаснее **не показывать вообще**).

### AUTH-008 ticket scope

> **Placeholder gate** — добавить state в auth state machine, но **не enforcement logic**. Реальный enforcement — Sprint 7.

---

## 18. File / Module Plan

> **Do not create files в AUTH-000.** Список ниже — **прогноз future structure** для AUTH-001 reviewer / architect.

### Mobile future files (под review при AUTH-001 / AUTH-002)

- `/apps/mobile/src/lib/supabase/client.ts` — Supabase client wrapper (anon key only);
- `/apps/mobile/src/features/auth/` — auth feature module;
- `/apps/mobile/src/features/auth/screens/LoginScreen.tsx`;
- `/apps/mobile/src/features/auth/screens/SignupScreen.tsx`;
- `/apps/mobile/src/features/auth/screens/InviteCodeScreen.tsx`;
- `/apps/mobile/src/features/auth/screens/WaitlistScreen.tsx`;
- `/apps/mobile/src/features/auth/hooks/useAuthSession.ts`;
- `/apps/mobile/src/features/auth/state/authStore.ts` (если Zustand или similar state lib — open decision);
- `/apps/mobile/src/features/beta/` — invite / waitlist logic;
- `/apps/mobile/src/features/onboarding/` — onboarding stack (ONB-001…014);
- `/apps/mobile/app/(public)/` — Expo Router public group;
- `/apps/mobile/app/(onboarding)/` — Expo Router onboarding group;
- `/apps/mobile/app/(app)/` — Expo Router app group;
- `/apps/mobile/app/_layout.tsx` — root layout с auth state provider.

### Shared packages (под review при необходимости)

- `/packages/config/` — env types / config primitives (уже существует — INFRA-006 + [`/docs/19_ENV_CONFIG_STRATEGY.md`](19_ENV_CONFIG_STRATEGY.md));
- `/packages/types/` — auth / app state types (новый, если нужен — открыт под review при AUTH-001);
- `/packages/validators/` — auth / onboarding validation (новый, если нужен — открыт под review при ONB-001…014).

### Important

> **Do not create any files в этом task (AUTH-000).** Список — для AUTH-001 / последующих tickets.

---

## 19. Dependencies Plan

> **Не add dependencies в AUTH-000.** Список ниже — **прогноз по ticket'у** для founder / architect review.

### AUTH-001 (Install Supabase client)

Potentially add:

- `@supabase/supabase-js`;
- `@react-native-async-storage/async-storage`;
- `react-native-url-polyfill`;
- `expo-secure-store` (если SecureStore выбран per §15).

### AUTH-003 / AUTH-004 (OAuth)

Potentially add / use (некоторые могут быть transitively уже available через Expo SDK 52):

- `expo-auth-session`;
- `expo-linking`;
- `expo-web-browser`;
- `expo-apple-authentication` (Apple specific, AUTH-004).

> **Check Expo / Supabase current docs** перед implementation — версии должны быть compatible с Expo SDK 52.

### Do NOT add (binding для Sprint 2)

- ❌ analytics SDK (PostHog — Sprint 8 ANA-001);
- ❌ Sentry (Sprint 8 — SENTRY-001);
- ❌ AI SDK (OpenAI / Anthropic — Sprint 7+ placeholder, real подключение позже);
- ❌ UI library (если не absolutely needed — лучше build на raw React Native primitives + design tokens из `/packages/design-tokens`);
- ❌ backend framework (нет — серверная логика через Supabase Edge Functions, Sprint 4+);
- ❌ service-role package в mobile;
- ❌ database clients за пределами Supabase public client.

---

## 20. Security Boundaries

Binding для каждого Sprint 2 ticket:

- ✅ **mobile client uses public / publishable / anon-safe key only** ([`/docs/19_ENV_CONFIG_STRATEGY.md`](19_ENV_CONFIG_STRATEGY.md) §4);
- ✅ **no service role в mobile** (Инв. 12);
- ✅ **no server-only env в mobile** (build-time enforced через Expo's `EXPO_PUBLIC_*` convention);
- ✅ **no Supabase admin API в mobile**;
- ✅ **no auth secrets committed** (`.env` файлы в `.gitignore`, только `.env.example`);
- ✅ **no production secrets в repo** (Sprint 2 — placeholders / staging only);
- ✅ **no exact meeting location в auth layer** (Инв. 1 — meeting locations не существуют в Sprint 2);
- ✅ **no circle data до onboarding gate** (Инв. 14 — circle access — Sprint 3+ только после onboarding complete);
- ⚠️ **protected route gates — UX layer**; RLS позже — **source of truth** для data access (RLSV2-001…003 — Sprint 4+).

---

## 21. Error States

Plan для error states (Russian copy — будет finalized в дизайне):

### Auth errors

- invalid email / password — «Неверный email или пароль»;
- account already exists — «Аккаунт с этим email уже существует. Попробуйте войти.»;
- email confirmation required — «Подтвердите email — мы отправили письмо.»;
- network error — «Нет связи. Попробуйте ещё раз.»;
- session expired — «Сессия истекла. Войдите снова.»;
- OAuth cancelled — «Вход отменён.»;
- OAuth failed — «Не удалось войти через {Google / Apple}. Попробуйте ещё раз.»;
- deep link failed — «Не удалось завершить вход. Откройте приложение и попробуйте снова.».

### Beta errors

- invalid invite code — «Код приглашения не подходит.»;
- invite code used — «Этот код уже использован.»;
- invite code expired — «Срок действия кода истёк.»;
- beta access denied — «Доступ к бете пока недоступен. Вы можете встать в waitlist.»;
- waitlist already joined — «Вы уже в списке. Мы напишем, когда откроется доступ.».

### Gate errors

- onboarding incomplete — soft redirect, не error («Завершите onboarding, чтобы продолжить.»);
- restricted access — non-stigmatizing copy («Доступ к некоторым функциям ограничен. Если это ошибка — напишите нам.») — Moderation v2 §32 style;
- banned access — minimal non-stigmatizing copy («Ваш аккаунт временно недоступен. Если это ошибка — напишите нам.») — Moderation v2 §32 style.

### Each error must be (binding — Moderation v2 §32, Core v2 §19, §20)

- ✅ clear;
- ✅ non-technical;
- ✅ non-shaming (no «вас отклонили», no «вы не подошли»);
- ✅ not leaking sensitive data (нет «email leaked», нет «password too weak: must contain X»);
- ✅ Russian-first (per RU-DOCS-001).

---

## 22. QA / Test Plan

### Auth tests (future — для AUTH-001…007 implementation)

- ✅ guest sees public route;
- ✅ guest cannot access app route (redirected to public);
- ✅ signup works (email / password creates session);
- ✅ login works (existing credentials create session);
- ✅ session persists across app restart;
- ✅ logout clears session;
- ✅ invalid credentials show error;
- ✅ OAuth cancel / error gracefully handled.

### Beta gate tests

- ✅ no beta access redirects к invite / waitlist;
- ✅ valid invite unlocks onboarding;
- ✅ invalid invite shows safe error;
- ✅ waitlist confirmation works;
- ✅ used invite cannot be re-used (server-side check).

### Onboarding gate tests

- ✅ `authenticated_not_onboarded` sees onboarding only;
- ✅ onboarded user enters app shell;
- ✅ logout from onboarding works;
- ✅ onboarding can resume after app restart (если incomplete).

### Security tests (binding — Sprint 2 exit criteria, [`/docs/28_PHASE_GATE_TO_SPRINT_2_CIRCLE_AUTH_ONBOARDING.md`](28_PHASE_GATE_TO_SPRINT_2_CIRCLE_AUTH_ONBOARDING.md) §13)

- ✅ **no service role в mobile bundle** (grep `SUPABASE_SERVICE_ROLE_KEY` в built mobile bundle = 0 matches);
- ✅ env vars **public-only в mobile** (no `process.env.SUPABASE_SERVICE_ROLE_KEY` reachable);
- ✅ no production secrets committed;
- ✅ no restricted / banned access placeholder leak (placeholder не показывает «вы banned» без real check).

### Regression checks (per Sprint 1 baseline)

- ✅ `pnpm typecheck`;
- ✅ `pnpm lint`;
- ✅ `pnpm test`;
- ✅ `pnpm format:check`.

> Эти 4 команды должны pass в каждом Sprint 2 PR.

---

## 23. Analytics Plan Placeholder

> **No analytics SDK сейчас.** PostHog connection — Sprint 8 (ANA-001).

### Future auth / beta events (per Analytics v2 §12 + §25)

- `signup_started`;
- `signup_completed`;
- `login_completed`;
- `logout_completed`;
- `invite_code_required`;
- `invite_code_entered`;
- `invite_code_used`;
- `invite_code_failed`;
- `waitlist_joined`;
- `beta_access_granted`;
- `beta_access_denied`;
- `onboarding_started`;
- `onboarding_completed`.

### Privacy (binding — Analytics v2 §33)

- ❌ no raw email unless hashed / explicitly allowed;
- ❌ no phone;
- ❌ no sensitive auth errors (e.g., password contents);
- ❌ no exact location;
- ❌ no PII в analytics payloads.

> **AUTH Sprint 2 tickets не отправляют analytics events.** Events будут wired в ANA-001 (Sprint 8). До тех пор — никаких `posthog.capture()` calls.

---

## 24. Implementation Sequence

> **Каждый ticket — отдельный explicit prompt.** AUTH-000 завершён, но AUTH-001 требует human review этого плана + новый prompt.

Recommended sequence после approval этого плана:

1. **AUTH-001** — Install Supabase client и create public anon client wrapper.
2. **AUTH-002** — Email signup / login.
3. **AUTH-005** — Session persistence (early, чтобы AUTH-002 был testable).
4. **AUTH-006** — Logout.
5. **AUTH-007** — Protected route gates (Expo Router groups).
6. **AUTH-008** — Restricted / banned placeholder gate.
7. **BETA-001** — Invite code validation flow (UI placeholder если schema не готова).
8. **BETA-002** — Waitlist signup flow (UI placeholder если schema не готова).
9. **BETA-003** — Beta access gate.
10. **ONB-001** — Onboarding Welcome.
11. **ONB-002** — Safety Principles (Russian copy, объясняющая circles + approval + location privacy + no open DMs).
12. **ONB-003 … ONB-013** — Continue onboarding fields **после** Figma v2 readiness (FIGV2-007 PASS).
13. **ONB-014** — Onboarding Completion Gate.
14. **PROF-001 … PROF-003** — Profile foundation + completeness + safe public profile boundary.

### Important

- **Do not start OAuth (AUTH-003 / AUTH-004)** перед тем, как email / session basics стабильны (AUTH-002 + AUTH-005 + AUTH-006 PASS), **unless** product decision требует иначе.
- **Do not start ONB-003 …** перед тем, как Figma v2 prototype validated (FIGV2-007 — 5/7 understand circle concept).

---

## 25. Open Auth Decisions

| # | Question | Recommendation | Decision needed by |
|---|---|---|---|
| 1 | Supabase project created или not? | — (founder action) | Before AUTH-001 |
| 2 | Local vs staging Supabase project timing? | Local-only для AUTH-002 dev; staging — после AUTH-007 | AUTH-001 |
| 3 | Use `ANON_KEY` naming или `PUBLISHABLE_KEY`? | **Keep `ANON_KEY`** (consistent с INFRA-006 `.env.example`) | AUTH-001 |
| 4 | AsyncStorage vs SecureStore? | **SecureStore** для tokens (encrypted) | AUTH-001 / AUTH-005 |
| 5 | Email / password vs magic link? | **Email / password** для familiarity; magic link — P1 | AUTH-002 |
| 6 | Email confirmation required? | **Yes** для verified user list | AUTH-002 |
| 7 | Phone verification timing (before request / before approval)? | Open — Core v2 §32 open question | Before BETA-001 / Sprint 4 |
| 8 | Google login P0 или later? | **After email auth stable** | AUTH-003 |
| 9 | Apple login P0 или before App Store? | **Before App Store review** (not blocking TestFlight) | AUTH-004 |
| 10 | App deep link scheme? | **`antidot://`** custom scheme + Universal Links в production | AUTH-003 |
| 11 | Invite before auth или after auth? | **After auth** (Option B — §10) | BETA-001 |
| 12 | Waitlist storage before schema migration? | **UI placeholder** в Sprint 2; real `waitlist_entries` table — Sprint 4 (DBV2) | BETA-002 |
| 13 | Onboarding source of truth before `profiles` table? | **Local placeholder** в Sprint 2; `profiles` table — Sprint 4 (DBV2-004) | ONB-014 |
| 14 | Can auth implementation proceed before profile schema? | **Yes** (Sprint 2 auth — independent от DBV2) | AUTH-001 |
| 15 | Admin auth separate или later? | **Later** (admin app — отдельный track, не Sprint 2) | Sprint 7 |
| 16 | How to handle restricted / banned placeholder before schema? | **Route concept only, no enforcement** (§17) | AUTH-008 |
| 17 | Need CAPTCHA / rate limiting для auth в closed beta? | **No** (closed beta + invite gate — достаточно anti-spam в P0); CAPTCHA — P1 | AUTH-002 |
| 18 | Web support в Expo app? | **No** (mobile-first per Core v2 §31) | AUTH-001 |
| 19 | Onboarding can resume after app close? | **Yes** (UX requirement — ONB-014) | ONB-001 / ONB-014 |
| 20 | Where does invite code live (URL param / manual entry / both)? | **Manual entry в Sprint 2**; URL param (universal link) — P1 | BETA-001 |

---

## 26. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Service role accidentally exposed** в mobile | критич. (Инв. 12) | `EXPO_PUBLIC_*` only enforcement; CI grep `SUPABASE_SERVICE_ROLE_KEY` в mobile bundle; code review |
| **Production secrets committed** | критич. | `.env` в `.gitignore`; pre-commit hook scanning; placeholders only в Sprint 2 |
| **Auth implemented before env strategy clear** | средний | [`/docs/19_ENV_CONFIG_STRATEGY.md`](19_ENV_CONFIG_STRATEGY.md) — binding, доступен с Sprint 1 |
| **Onboarding gate depends on missing schema** | средний | §16 — placeholder strategy, не блокировать AUTH-007 на DBV2 |
| **Invite gate bypassed** (user gets app access без invite) | высокий | Server-side validation в BETA-003 (Edge Function), не client-only check |
| **OAuth redirect misconfigured** (auth fails silently) | средний | Deep link tests; `expo-linking.createURL()` для dev; documented redirect URIs |
| **Session persistence insecure** (tokens leaked) | высокий | SecureStore preferred (§15); logout clears tokens; no tokens в analytics / logs |
| **Logout leaves cached sensitive data** | средний | Explicit cache clear в AUTH-006; future Sprint cache clears также chain |
| **Old event-first route names leak in** | средний | Code review; circle-first vocabulary в route names (`(app)/discover/circles`, не `events`) |
| **Implementation adds product screens too early** | высокий | Phase Gate 28 §6 binding; tickets only по одному; ONB-003+ требует Figma readiness |
| **Supabase connection added без tests** | средний | AUTH-001 DoD требует typecheck / lint / test passes; auth state listener tested через mock |
| **Dependency mismatch в Expo** (SDK 52 / RN 0.76.9 incompatibility) | средний | INFRA-REV-002 follow-up (`npx expo install --fix`) cleared перед AUTH-001 |
| **Auth state becomes source of security** instead of RLS | критич. | Route gates — UX layer (§20); RLS (Sprint 4+) — single source of truth для data access; никакой data access logic в auth layer |
| **Auth-only enforcement** of restricted / banned без backend (false safety) | высокий | §17 — no fake enforcement; placeholder UX only |

---

## 27. Definition of Ready for AUTH-001

AUTH-001 может начаться **только если все** PASS:

- ✅ этот план (AUTH-000) accepted founder + technical founder;
- ✅ env variable naming decided enough для first pass (§25 #3 — recommend `ANON_KEY`);
- ✅ **Supabase project URL / public key** available для local / staging, **или** placeholders / mocks accepted explicitly;
- ✅ **storage approach decided** (§25 #4 — recommend SecureStore);
- ✅ **no service role в mobile confirmed** (binding — Инв. 12);
- ✅ **package additions approved** (founder reviews §6 + §19 dependencies list);
- ✅ **CLAUDE.md §6 allows AUTH-001** (currently allowed — "auth implementation only after AUTH-000");
- ✅ **checks currently green** (`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm format:check` все pass на текущем main).

### What AUTH-001 will explicitly do

- create `apps/mobile/src/lib/supabase/client.ts` — Supabase client wrapper using `EXPO_PUBLIC_SUPABASE_*` only;
- add 3–4 mobile dependencies (per §19 AUTH-001 list);
- type-check / lint / test / format pass.

### What AUTH-001 will explicitly NOT do

- ❌ create Supabase project (founder action);
- ❌ create migrations / SQL / RLS;
- ❌ implement screens (AUTH-002 territory);
- ❌ touch admin app;
- ❌ commit real secrets.

---

## 28. Summary

**AUTH-000:**

- определяет **safe auth / beta / onboarding plan** для Sprint 2 в соответствии с Product Core v2, RLS v2 §6 role model, Env Strategy v1.
- **никакая implementation не создана** в рамках AUTH-000 (это markdown план).
- **next implementation task — AUTH-001** только после того, как этот план accepted founder + technical founder.
- **Product Core v2 остаётся first source of truth**.
- **Circle product features остаются blocked** (Circle Discovery / Detail / Request Place / Membership / Meetings / Location Reveal / Chat / My Circles) — Sprint 3–6 territory.
- **Все 23 hard rules** (CLAUDE.md §2) остаются binding для каждого Sprint 2 ticket.

### Key constraints recap

- **Mobile uses `EXPO_PUBLIC_*` only** ([`/docs/19_ENV_CONFIG_STRATEGY.md`](19_ENV_CONFIG_STRATEGY.md) §4);
- **Service role server-only**, guarded `import 'server-only'` в admin (§7.3);
- **No `profiles` migration в Sprint 2** — onboarding gate placeholder только (§16);
- **No real waitlist storage в Sprint 2** — UI placeholder только (§11);
- **No exact meeting location в auth layer** (Инв. 1);
- **Implementation ticket-by-ticket** — каждый AUTH-001…008 / BETA-001…003 / ONB-001…014 / PROF-001…003 требует отдельный explicit prompt.

---

> **Reminder:** [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth. Этот план ему, [`/docs/07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §6 (role model), [`/docs/19_ENV_CONFIG_STRATEGY.md`](19_ENV_CONFIG_STRATEGY.md), [`/docs/28_PHASE_GATE_TO_SPRINT_2_CIRCLE_AUTH_ONBOARDING.md`](28_PHASE_GATE_TO_SPRINT_2_CIRCLE_AUTH_ONBOARDING.md) подчинён. Любая deviation в AUTH-001 / последующих tickets (e.g., service role в mobile, exact location в session storage, профайл migration без DBV2 approval, open DM-подобная архитектура) — **отклоняется на review**. AUTH-001 **не начинается** без отдельного explicit prompt после approval этого плана.
