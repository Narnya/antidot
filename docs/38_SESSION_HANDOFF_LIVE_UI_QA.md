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

1. **Guest-perspective flows (BLOCKED — needs a 2nd confirmed account).** To verify
   claim / onboarding / foreign-profile **as a non-host guest**, we need a second
   confirmed `auth.users` row. Anon signup on antidot-dev **can't self-confirm**
   (email confirmation is ON; signup returns `email_confirmed_at:null` →
   «Email not confirmed»; `@example.com` is blocklisted; antidot.space hit a 429).
   No admin/DB creds are available in-session (Инв. 12 — service role never client,
   DB password is a secret). **Unblock options:** user provides a confirmed
   email+password, OR someone with admin toggles off email-confirm on dev, OR
   creates the row directly in `auth.users` (bcrypt pw + `email_confirmed_at`, the
   docs/37 §7 method). Once available: `signInWithPassword` for user 2 → inject the
   session into `localStorage` (`sb-<ref>-auth-token`) so dev-login's `if (!s.session)`
   skips → drive the **claim** on an overflow activity the guest doesn't host →
   assert a `slot_claims` row; then `/start` onboarding + foreign-profile view.
2. **Backend/feature gaps** (from docs/37 §7 «Still open»): more pushed notification
   types, native build + on-device test, prod env config.
3. **Housekeeping:** a dangling **unconfirmed** auth user
   `qaguest.antidot2026@gmail.com` exists in `auth.users` from a signup attempt —
   harmless, removable only via admin.

## 8. Gotchas added this session

- **Empty states must be designed, not degraded.** Mockups drawn with data hide
  their empty branches; check every list/feed/chat screen's zero-data path.
- **`router.back()` needs history.** Any directly-openable screen needs `useGoBack`.
- **`git checkout <file>` reverts to HEAD, not to your uncommitted edits** — a temp
  screenshot tweak wiped the (still-uncommitted) mock badges; commit before stashing.
- **Don't fake trust signals.** If there's no data for a badge (`verified`), omit it.
- **Dev-login is a dev convenience, never prod.** Keep it `__DEV__` + flag guarded;
  keep the creds in the untracked `.env`.
