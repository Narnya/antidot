# 37 — Session Handoff: Design→Code Port (mockups → mobile app)

> **Purpose:** let a fresh chat continue the design port with zero context loss.
> **Branch:** `feat/activity-first-mvp` · working tree clean at handoff.
> **Last commit:** `3ec44a0` (Rhythm) — **core-loop screen port COMPLETE (19/19).**
>
> **Session 2 update (2026-07-22):** the four remaining screens are ported +
> verified — **Profile** (11/D), **Notifications** (10), **Onboarding** (A1–A3+03),
> **Rhythm** (09). See §5 for the two product decisions taken. New DS: outline
> **Glyphs** (`src/components/Glyphs.tsx`) matched 1:1 to the mockup SVG sprite
> (shield/check/users/gear/flag/lock/pin/clock/chat). New repo methods:
> `listNotifications`, `getRhythm`; `Profile` gained optional safe fields
> (bio/interests/stats/sharedContext); `UpsertProfileInput` gained `interests`.

---

## 1. What this work is

We are porting the **approved HTML mockups → the real React Native (Expo) app**,
screen by screen, matching each screen pixel-close and verifying live.

- **Design source of truth (mockups):** `mockups/welcome.html`, `mockups/feed.html`
  (pixel-approved), and **`mockups/all-screens.html`** — a single sheet of **29
  phone frames** (the full core loop). Each frame has a `<div class="caption">` with
  a name/number; the top `<style>` block holds the CSS classes.
- **Design system:** warm-green DS v2 (`docs/35`). Tokens live in
  `packages/ui/src/tokens/` (colors, typography, spacing, radius, shadows).

## 2. How to run + verify (IMPORTANT — the workflow)

Three local servers (all were up at handoff; restart if needed):

| Port | What | Command |
|---|---|---|
| **8082** | **Preview** (mock data + DEV shim) — reach ANY screen | see below |
| 8081 | Real gated app (welcome→login) | `pnpm --filter @social-events/mobile start` → web |
| 8091 | Static **mockups** (design reference) | `python3 -m http.server 8091` in `mockups/` |

**Preview server (8082) — this is how authed screens are verified:**
```
cd apps/mobile
EXPO_PUBLIC_PREVIEW=1 EXPO_PUBLIC_SUPABASE_URL= EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY= \
  EXPO_PUBLIC_SUPABASE_ANON_KEY= npx expo start --web --port 8082 --clear
```
- `EXPO_PUBLIC_PREVIEW=1` + empty Supabase env → **mock repo** + a **DEV-only route
  shim** (`src/features/auth/lib/routeGate.ts`, `PREVIEW_UNLOCK`, double-guarded by
  `__DEV__` + the flag) that bypasses the auth/beta/onboarding gate. **Inert in prod.**
- After adding a dependency, restart with `--clear` (bundle takes ~30s first time).

**Verify a screen (headless Chrome, matches the web phone-frame):**
```
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
P=$(mktemp -d)
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
  --window-size=560,1000 --user-data-dir="$P" --screenshot=/tmp/x.png \
  "http://localhost:8082/<route>" >/dev/null 2>&1 & CP=$!; sleep 14; kill $CP 2>/dev/null
pkill -f "Google Chrome.*headless"; rm -rf "$P"
```
Then `Read /tmp/x.png`. Window **560×1000** → the app renders a **480px phone
column centered** (matches the mockups' `max-width:480`). **Gotcha:** the FIRST
screenshot after a cold `--clear` fires before the bundle finishes — take a second
one. `sharp` (at repo `node_modules/sharp`) is available for cropping/measuring
A/B images; there is NO playwright.

**Mock ids for routed screens:** circles are `g1`..`g4`; e.g. `/circle/g1`,
`/activity/<id>`, `/report?type=user&id=u1`,
`/circle-membership?id=g1&name=<urlenc>`.

## 3. The shared DS kit — `apps/mobile/src/components/` (compose screens from these)

Barrel: `import { ... } from '../../../components'` (path depth varies by screen).

- **`ScreenHeader`** — round back button (arrow-in-circle) + inline Playfair-24
  title (+ optional `right`, `subtitle`). **Replaces the old «‹ Назад» text link
  everywhere** (the user explicitly wants the arrow-in-circle).
- **`IconButton`** — round 38×38 surface button (header right-actions, «+»).
- **`Field` / `FieldLabel`** — warm `surface.field` (#FBF8F1) input, radius 15,
  optional `leftIcon`; label with optional lighter «(необязательно)».
- **`CtaBar`** — fixed bottom **frosted** bar (expo-blur), safe-area aware; wrap a `Button`.
- **`SectionLabel`** — uppercase Inter-13 «.divider-lbl» (`first` prop trims top margin).
- **`IconTile`** — 42×42 tile; **`round` prop** = full circle (mockup `.av-lg`) vs
  default rounded-square (mockup `.ic-tile`). **Watch this distinction — the user
  caught a square-vs-round miss.**
- **`BrandMini`** — small ANTIDOT wordmark (coral dot over the «I»).
- **`HeroTitle`** — green Playfair-30 headline (auth/gate screens).
- **`Button`** — 56px pill, `variant` = primary / ghost / coral, radius 18, `icon`.
- **`NavIcons`** — custom react-native-svg tab icons (compass/two-circles/waveform/
  bell/person) + `IconChevronDown`. Used by the tab bar.

New token: **`colors.surface.field` = #FBF8F1**. Type system (`packages/ui/tokens/
typography.ts`): headlines = Playfair 600, body/UI = Inter (families carry the
weight; don't add `fontWeight`). Fonts loaded in `apps/mobile/app/_layout.tsx`
(Inter 400/500/600 + Playfair 500/600/700). `_layout.tsx` also has a **web-only
PhoneFrame** (480 column + simulated safe-area insets `{top:47,bottom:0}`) — no-op
on native.

## 4. Screens DONE (ported + verified, 15) — with their frame + route

| Screen | Mockup | Route | Notes |
|---|---|---|---|
| Welcome | welcome.html | /welcome | pixel-matched (fonts, dot, feet-on-CTA) |
| Feed «Для тебя» | feed.html | /feed | card + custom nav icons + frosted-ish header |
| Activity Detail | frame 05 | /activity/[id] | full-bleed hero, lock card, fixed CTA |
| My Circles | frame 07 | /circles | round `av-lg` tiles + bordered next-meeting strip |
| Circle Home | frame 08 | /circle/[id] | hero + ivory content SHEET (see caveat §6) |
| Участие в круге | frame F | /circle-membership | transparent-modal pause/leave sheet |
| Пожаловаться | frame E / O | /report | radios + «Также заблокировать» + coral CtaBar |
| Новый круг | frame J | /circle/create | warm fields + rhythm chips + CtaBar |
| Новая активность | frame 06 | /create | emoji chips, Когда\|Слотов row, overflow rowcard |
| Настройки | frame 12 | /settings | Blocked-first, icon-tile rows, privacy notice |
| Вход | frame 02 | /login | **passwordless OTP** (new auth model) |
| Регистрация | frame B | /signup | **social buttons** (Apple/Google-colored/mail) |
| Лист ожидания | frame G | /waitlist | |
| Инвайт-код | frame H | /invite | big centered code field |
| Доступ ограничен | frame I | /restricted | centered lock gate |

**Data/auth changes made:** `listMyCircles` (repo: mock+supabase) returns
`{group, memberCount}`; `pauseMembership`/`leaveCircle` added; new
`src/features/auth/actions/otpAuth.ts` (`sendEmailCode`/`verifyEmailCode`/
`signInWithProvider`) — Login is now OTP, Signup is social (no-op in mock/preview,
real on configured Supabase). Deps added this session: `react-native-svg`,
`expo-blur`, `@expo-google-fonts/inter`.

## 5. Screens DONE this session (4) — port complete

All four are ported + verified on 8082. **Product decisions taken (2026-07-22):**

- **Онбординг:** follow the mockup **exactly** — the old safety-rules card + mandatory
  accept checkbox are **dropped** (the анти-дейтинг value slides carry the safety
  framing). A subtle «Выйти» escape is kept (post-auth screen).
- **Ритм:** port the frame-09 **streak** model but with a **soft tone** — private/
  self-only, no public counter/ranking, no discovery-nag, belonging as a success
  state not a goal (Инв. 10/14). Hero says «N недель · в ритме круга» (softened from
  the mockup's «подряд»); empty state degrades to «Всё впереди».

| Screen | Mockup | Route | Notes |
|---|---|---|---|
| Профиль (self) | frame 11 | /profile (TAB) | prof-top, 3 icon-badges, stat row, «О себе» + chips, gear→/settings |
| Профиль (foreign) | frame D | /profile/[id] | back + flag(report), «Общий контекст», locked «Написать» (Инв. 2) |
| Уведомления | frame 10 | /notifications (TAB) | 5 ic-tile row types; users-row = only leave signal (Инв. 11–12) |
| Онбординг | A1–A3 + 03 | /start | 3 value slides → profile form; progress bar + CtaBar |
| Ритм | frame 09 | /rhythm (TAB) | soft streak hero + week grid + «Недавно» |

**Data/DS changes made:** new `src/components/Glyphs.tsx` (outline icons matched
1:1 to the sprite; exported from the barrel). New repo methods `listNotifications`
+ `getRhythm` (mock = illustrative frame data; supabase = graceful/derived).
`Profile` gained optional safe fields `bio`/`interests`/`stats`/`sharedContext`;
`UpsertProfileInput` gained `interests` (mock persists; live schema keeps имя+район
until the columns exist). The old `getPullMetrics` infra stays but is no longer used
by any screen.

**Verification note:** to preview `/start` you must bypass the returning-user
auto-advance (mock `me` already has a profile) — set the `step` initial state and
short-circuit the effect temporarily, screenshot, then revert (done + reverted this
session; typecheck green).

## 6. Gotchas / lessons (read before porting)

- **Back button:** every stack screen must use `ScreenHeader` (arrow-in-circle),
  NOT «‹ Назад» text. User is strict on this.
- **`.av-lg` (round) vs `.ic-tile` (rounded-square):** use `IconTile round` for the
  circle-avatar tiles, default for icon tiles. Check inner-card **borders** too
  (mockup `.rowcard` has `1px solid --border`).
- **expo-linear-gradient `locations` doesn't work on react-native-web** — a hero
  image won't fade to ivory in the web preview. Circle Home uses a **rounded ivory
  content sheet** over the hero as a robust workaround (native gradient would work on
  device). Same pattern if another screen needs an image→ivory fade.
- **`Image` with `StyleSheet.absoluteFill` inside a fixed-height View broke on web**
  (card body vanished). Use an explicit-height `<Image>` + absolute scrim, like
  `ActivityCard`.
- **RU plurals:** helpers inline in ActivityCard/MyCircles (место/участник). Reuse the pattern.
- **Filter/rhythm chips:** set `chipText lineHeight` (RN default is too tall → chips look puffy).
- **Verify at 560×1000** and take a SECOND screenshot after `--clear`.

## 7. What's next (the core-loop port is done)

The 19 core-loop frames are ported. Remaining mockup frames are secondary / P1 and
were **not** ported yet:

- **K · Пусто · лента** (empty feed state) — the feed currently has no dedicated
  empty state matched to the mockup.
- **L · Чат круга** (P1, member-only) — blocked until the chat product decision
  (CLAUDE.md §10); do not add DM/chat tables or routes without it.
- **C · Занять место** (pull success), **M · Приём в круг (host-confirm)**,
  **N · Место за тобой** (reveal success), **O · Жалоба отправлена** — success/
  confirmation states; some logic exists (claim/host-confirm/report) but the
  polished success screens aren't matched to these frames.

Beyond the port: wire the new surfaces to **real data** on the live path
(`listNotifications` richer events; `getRhythm` streak/attended once **attendance
(T5)** is aggregated; persist `profiles.bio/interests` once the columns exist).

**Workflow (unchanged):** commit each screen separately, typecheck green
(`pnpm --filter @social-events/mobile typecheck`), verify on 8082, show an A/B /
screenshot — the user reviews closely and catches subtle misses (tile shape,
borders, spacing, round-vs-square).
