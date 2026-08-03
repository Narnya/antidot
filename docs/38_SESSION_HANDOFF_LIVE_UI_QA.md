# 38 — Session Handoff: Live-UI QA & Polish (real app on live Supabase)

> **Purpose:** let a fresh chat continue the QA/polish pass with zero context loss.
> **Branch:** `feat/activity-first-mvp` · working tree clean at handoff.
> **Last commit:** `cf66f3e` — Circle Home «no next meeting» card.
>
> **What changed vs docs/37:** docs/37 closed with *«Still open: run the actual app
> UI against live (blocked by OTP login)».* **That block is now lifted** — an opt-in
> **dev auto-login** lets us drive the *real* app against **antidot-dev**, so this
> session was the first pass of walking the live UI screen-by-screen and fixing what
> looked unfinished. All fixes are design/polish + one nav bug; no schema changes.

---

## 1. What this work is

We walked the **real mobile app running on live Supabase** (not the mock preview),
screen by screen, and fixed everything that read as **«недоделано»** — bare gray
empty states, a dead back arrow, and trust badges that were shown to everyone
instead of being earned. The bar: **every screen must look finished** (a designed
empty state, not a lone gray line) and **honest** (badges reflect reality, Инв. 3).

This is a QA/polish layer **on top of** the completed design port (docs/37). The
mockups were drawn **with data**, so their empty states silently degraded to bare
text once real (empty) data flowed in — that gap is what this session closed.

## 2. How to run the REAL app against live (the new capability)

docs/37's three servers still apply (8082 preview/mock, 8081 gated, 8091 mockups).
**New this session: server on 8083 = the real app + dev auto-login on live.**

**Dev auto-login (opt-in, DEV-only, double-guarded):**
- `apps/mobile/src/features/auth/providers/AuthProvider.tsx` — when
  `__DEV__ && EXPO_PUBLIC_DEV_LOGIN=1` and there's no session, it
  `signInWithPassword` using `EXPO_PUBLIC_DEV_EMAIL` / `EXPO_PUBLIC_DEV_PASSWORD`.
  Guarded by `if (!s.session)` so an injected session is never overwritten.
- `apps/mobile/src/features/auth/lib/routeGate.ts` — a `DEV_LOGIN` override lets the
  dev user through the beta/onboarding gate (parallel to `PREVIEW_UNLOCK`).
- **Both are inert in prod** (`__DEV__` + the flag). Do NOT ship the flag.

**Start it:**
```
cd apps/mobile
EXPO_PUBLIC_DEV_LOGIN=1 \
  EXPO_PUBLIC_SUPABASE_URL=<antidot-dev url> \
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon> \
  EXPO_PUBLIC_DEV_EMAIL=<dev user email> EXPO_PUBLIC_DEV_PASSWORD=<pw> \
  npx expo start --web --port 8083 --clear
```
Dev user is **Рафаэль** (`uid 69524e53-82cf-49f1-9260-18783617c4c4`), owns 2 circles,
0 attended claims. Secrets come from the untracked `.env` — **never commit them.**

**Driving the live UI headlessly (CDP):** the verify-by-screenshot workflow from
docs/37 §2 works, but to *act* (fill forms, click) we drive Chrome via CDP:
- launch headless with `--remote-debugging-port` + `"--remote-allow-origins=*"`
  (quote the `*` — zsh globs it) and a **persistent** `--user-data-dir`
  (`/tmp/antidot-live-prof`) so the Supabase session survives between calls;
- dev-login needs **~40s** warmup on a cold profile before a session exists;
- Python `websocket` client, `header=["Origin: http://localhost"]`, Python 3.14
  needs `ssl.CERT_NONE` on the ctx;
- **React-controlled inputs** must be driven via the native value setter +
  `dispatchEvent(new Event('input', {bubbles:true}))`, else React ignores the value;
- **click the actual `<button>`, not a wrapping `<div>`** whose `textContent` also
  matches (this silently no-ops) — select by `el.tagName==='BUTTON'`.

## 3. Fixes this session (all committed, typecheck green)

| Commit | Screen | Fix |
|---|---|---|
| `1c523f0` | — | opt-in **dev auto-login** to drive the real app on live (§2) |
| `59b1a8b` | **/manage** | designed empty state (was bare gray text) — IconUsers tile + Playfair «Гостей пока нет» + overflow/group-only sub + ghost «Позвать своих в чат»; `load()` wrapped in try/finally |
| `77fa051` | **/settings** | designed empty «Заблокированные» card (IconShield tile + «Список пуст») + version footer «Antidot · версия N» pinned to bottom |
| `f877bd9` | **chat** | designed empty state (IconChat tile + Playfair «Пока тихо» + member-only sub) instead of a lone gray line |
| `f74cfc0` | **all 15 stack screens** | **back-arrow bug fix** — `useGoBack` (§4) |
| `26b23c5` | **profile** | **earned-only trust badges** (§5) + soft self empty hint «Профиль наполняется сам» |
| `cf66f3e` | **Circle Home** | designed «no next meeting» card (IconTile calendar + isOwner-conditional hint) instead of a bare gray line |
| `16b7a35` | **8 data screens** | **infinite-spinner fix** — `try/catch/finally` + shared `LoadError` (§9); MyCircles gained a real zero-circles empty state |

**Empty-state pattern (now house style):** center-stack of a **78×78 tile**
(`radius.xl`, bg `trust.verifiedBg`) + **Playfair title** (`action.primary`) +
**Inter sub** (`text.secondary`), optionally a ghost CTA. Wrap containers get
`flexGrow: 1` so the state centers. Saved to memory as `empty-states-pattern`.

## 4. The back-arrow bug (`useGoBack`) — why it mattered

Opening any screen **by direct URL** (or after a hard refresh) gives an **empty
navigation history**, so `router.back()` is a **no-op** — the arrow looked dead.

`apps/mobile/src/lib/useGoBack.ts` (new): `router.canGoBack() ? router.back() :
router.replace(fallback)`. Applied to **all 15 stack screens** — fallback `/feed`
for app screens, `/welcome` for auth/beta (Login, Signup, Waitlist, Invite).
Removed now-unused `router` locals (repo has `noUnusedLocals: true`). Verified via
CDP click-tests: settings/manage/chat → `/feed`, login/invite → `/welcome`, all PASS.

## 5. Earned-only trust badges (honesty — Инв. 3)

Profile previously rendered a **hardcoded** 3-badge array for everyone — a trust
claim with no backing. Now badges are **data-driven and earned-only**:
- `repository.ts`: `TrustBadgeKey = 'verified' | 'reliable' | 'hosted'`; `Profile`
  gained `badges?: TrustBadgeKey[] | null`.
- `supabaseRepository.getProfile` derives them live: **`hosted`** if the user owns
  ≥1 group (count on `groups.owner_id`), **`reliable`** if ≥2 attended `slot_claims`;
  **`verified`** is omitted (no signal exists yet — do **not** fake it).
- `ProfileScreen` renders only earned badges via `BADGE_META` (label+Icon per key);
  none earned → **no badge row** (replaced by the soft «Профиль наполняется сам»
  hint for self). **Never a number, never a negative label** (Инв. 3, 5).
- Verified live: dev user (owns 2 circles, 0 attended) shows **only «Проводил
  встречи»** — exactly one earned badge, as expected.

Mock parity: `mockRepository` profiles carry illustrative badges
(me=all three, u3=verified+hosted, guest1=none) so the preview still demos the row.

## 6. Live UI verification done this session

Driving the **real app UI** on 8083 as the dev user (CDP), end-to-end through the
rendered screens (not repo calls):
- **Create circle** — filled «Новый круг», submitted, row written to `groups`
  (owner-visible via the `…014` SELECT-policy fix; would have been the RLS trap).
- **Create activity** — filled «Новая активность», submitted, row written to
  `activities`, appears in the feed.
- **Owner-delete cleanup** — test rows removed via the app; owner-delete RLS confirmed.
- Back-arrow + badge checks above were also verified on live UI, not just preview.

This is the first time the loop's **create** half was exercised through the **real
rendered UI on live** (docs/37's 11/11 E2E drove the *repo/SQL*, not the UI).

## 7. Open / next (in priority order)

1. **Guest-perspective flows — MOSTLY DONE live (only fresh-onboarding left).**
   Key realization: the dev user (Рафаэль, `6952…`) is **not the host** of the seed
   activities (owner `1111…`), so two of the three guest sub-flows needed **no**
   second account and are now verified through the **real UI on live** (§10):
   - ✅ **Guest-overflow claim** — released his claim on the 2/10 football
     (`bbbb…001`, non-host), then re-claimed it via the UI (`/claim` → «Подтвердить»
     → `/claimed`): a `slot_claims` row was written with **`source=overflow`** (the
     pull signal) and the reveal showed the exact place «Стадион Волна…» (Инв. 1).
     Own-claim `DELETE` under RLS returns 204 — the release is a clean reset.
   - ✅ **Foreign-profile view** — `/profile/2222…` («Аня») rendered guest mode:
     back+flag header, **locked «Написать»** («Будет доступно после общей встречи»,
     Инв. 2 — a non-interactive row, not a DM button), no unearned badges.
   - ✅ **Fresh onboarding `/start`** — done live **without** a second account, via
     two reversible tricks (§11): the `/start` skip-check is `displayName.trim()
     .length > 0`, so setting the dev profile's `display_name` to a **single space**
     (passes the DB non-empty CHECK, reads as empty to the screen) makes the user
     look fresh; and because the 8083 `DEV_LOGIN` gate override forces
     `isOnboardedPlaceholder:true` (routeGate.ts:76), `/start` is unreachable there —
     so onboarding was driven on a **second plain server (8084, live Supabase, no
     DEV_LOGIN)** with the session **and** the beta placeholder
     (`@antidot/dev_beta_access_granted_v1='true'`) injected. Drove slides → form →
     «Далее»: `upsertProfile` wrote name/area/interests and redirected to `/feed`.
     The submit **restored the profile to its exact backup** (display_name/area/
     interests; bio never touched) — net-zero. A genuinely fresh `auth.users` row is
     still nice-to-have for a from-scratch pass, but the flow itself is verified.
   **All three guest sub-flows are now verified live through the real UI.** Also
   **definitively resolved:** the feed is **not** broken on live — a fresh
   password-grant session returns 3 feed rows in ~0.7s; the earlier headless spinner
   was the stale-session artifact the §8 fix targets.
2. **Backend/feature gaps** (from docs/37 §7 «Still open»): more pushed notification
   types, native build + on-device test, prod env config.
3. **Housekeeping:** a dangling **unconfirmed** auth user
   `qaguest.antidot2026@gmail.com` exists in `auth.users` from a signup attempt —
   harmless, removable only via admin.

## 8. Infinite-spinner class of bug (`16b7a35`)

Walking the live feed, the list spun forever. Root cause was a **pattern**, not
one screen: `const load = async () => { setX(await repo.foo()); setLoading(false) }`
clears `loading` only on the success line — so if `repo.foo()` **throws**
(expired session, dropped network, an RLS error) the screen spins forever with no
recovery. A grep found **8 screens** with this shape (Feed, MyCircles,
Notifications, Profile, Rhythm, CircleHome, ClaimSuccess, Login).

Fix, applied uniformly: `setLoading(true); setError(false); try { … } catch {
setError(true) } finally { setLoading(false) }` + a new shared
`src/components/LoadError.tsx` (78×78 tile + Playfair «Не удалось загрузить» +
«Повторить» → re-runs `load`). Use `inline` variant inside a scroll/list slot.
MyCircles also got a proper zero-circles empty state (it had been showing the
«нашёл свои круги» *success* notice to a user with none).

**Follow-up (`69c38d3`) — the first grep lied.** Classifying screens by
«does the file contain `finally`?» false-marked as *guarded* four screens whose
**action handlers** (save/claim/send/unblock) had `try/finally` but whose
**initial `load()` did not**: ActivityDetail, ClaimSlot, CircleChat, Settings —
all fixed the same way (Settings degrades only its blocked-list section so
sign-out/delete stay usable; CreateActivity's picker fetch made non-throwing).
**Lesson: audit the load function's own scope, not the file.** Net: every
data-loading screen is now guarded (Manage was already; Report has no load).

**What was NOT the bug:** the feed RPC (`feed_open_activities`) returns data in
~0.8s live, and the gate providers (`AuthProvider`, `BetaAccessProvider`) already
clear their loading in a `finally` — verified. The perpetual «Проверяем сессию…»
seen in **headless** is just the dev-login `signInWithPassword` round-trip being
slow to warm up in a cold Chrome profile; on a real browser/device the gate
resolves in ~1s. Don't chase it as a product bug.

**Verify-harness note:** driving the *live* app headlessly is flaky because
dev-login needs a long warmup and a persisted session; the fast, deterministic
check is still the **mock preview (8082)** — Feed/MyCircles/Profile re-verified
there for no-regression after this change.

## 9. Gotchas added this session

- **Empty states must be designed, not degraded.** Mockups drawn with data hide
  their empty branches; check every list/feed/chat screen's zero-data path.
- **`router.back()` needs history.** Any directly-openable screen needs `useGoBack`.
- **`git checkout <file>` reverts to HEAD, not to your uncommitted edits** — a temp
  screenshot tweak wiped the (still-uncommitted) mock badges; commit before stashing.
- **Don't fake trust signals.** If there's no data for a badge (`verified`), omit it.
- **Dev-login is a dev convenience, never prod.** Keep it `__DEV__` + flag guarded;
  keep the creds in the untracked `.env`.

## 10. Session-injection — driving the live UI deterministically (the unlock)

Headless dev-login is flaky (40–70s warmup, inconsistent). The reliable way to
drive the **live** app as any user is to **mint a session and inject it**, so the
app boots already-authed with no dev-login wait:

1. **Mint** — REST password grant (no UI, no OTP):
   `POST {SUPABASE_URL}/auth/v1/token?grant_type=password` with header `apikey:
   {anon}` and body `{email,password}` → returns the full session
   (`access_token`/`refresh_token`/`expires_at`/`user`). The dev creds live in the
   **running 8083 server's env** — read them with `ps eww -p <pid>` (grep
   `EXPO_PUBLIC_DEV_EMAIL/PASSWORD`); never print token/password values, write the
   session to a temp file and delete it after.
2. **Inject** — launch Chrome with `--remote-debugging-port` + quoted
   `"--remote-allow-origins=*"`; over CDP (`ws://…`, header `Origin: http://localhost`)
   `Runtime.evaluate` → `localStorage.setItem("sb-omxvgcafqwwjlwnhrloc-auth-token",
   <session json>)` (ref = the Supabase subdomain), then `Page.navigate` to the
   target route. `AuthProvider.getSession()` reads the injected session →
   dev-login's `if(!s.session)` **skips** → authed instantly as that user.
3. **Drive** — click the actual `<button>` whose `textContent` matches (not a
   wrapping div); `Page.captureScreenshot` to verify; assert side-effects via REST.

This is exactly how the §7 guest claim + foreign-profile were verified. Python
needs `websocket-client` (present) and, for the HTTPS curl on Python 3.14, an
`ssl.CERT_NONE` context. Reset live state after mutating (the claim test did
own-claim `DELETE` → re-claim, net-zero).

## 11. Testing onboarding without a fresh user (the two blockers + tricks)

Two things stop the dev user from seeing `/start`, each with a reversible workaround:

1. **The screen skips users whose profile has a name.** `start.tsx` markes-onboarded
   when `getProfile(userId).displayName.trim().length > 0`. The `profiles.display_name`
   column has a **non-empty CHECK** (can't PATCH to `''`), but a **single space**
   `" "` passes the constraint (length 1) yet `.trim()` is empty → the screen shows
   the slides. Back up the row first; the onboarding submit rewrites display_name, so
   entering the original values restores it exactly (verify against the backup).
2. **The 8083 `DEV_LOGIN` gate override forces onboarded=true.** `routeGate.ts:76-78`
   sets `hasBetaAccess:true, isOnboardedPlaceholder:true` whenever
   `EXPO_PUBLIC_DEV_LOGIN==='1'`, so the onboarding group always redirects to `/feed`
   there. Run a **second plain server** (`npx expo start --web --port 8084` with the
   `.env` = live Supabase, **no** DEV_LOGIN) and drive that. Grant beta by injecting
   the placeholder key `@antidot/dev_beta_access_granted_v1='true'` (AsyncStorage→
   localStorage on web) alongside the session; the onboarding placeholder is
   React-state-only (defaults false), so the gate then allows `/start`.

Net effect: authed ✓ + beta ✓ + not-onboarded → `/start` allowed; the screen sees an
empty-trim name → slides → form → submit writes the profile and redirects to `/feed`.
