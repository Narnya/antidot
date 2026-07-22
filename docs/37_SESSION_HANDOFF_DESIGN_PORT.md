# 37 — Session Handoff: Design→Code Port (mockups → mobile app)

> **Purpose:** let a fresh chat continue the design port with zero context loss.
> **Branch:** `feat/activity-first-mvp` · working tree clean at handoff.
> **Last commit:** `bd92bc9` (Waitlist/Invite/Restricted).

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

## 5. Screens REMAINING (4) — next up

Audit findings are in the workflow output; per-screen mockup frames:

1. **Профиль** (frame 11, route `/profile`; foreign profile frame D `/profile/[id]`)
   — self mode is a TAB screen (keep tab bar). Needs: centered `prof-top` (92px round
   avatar + name Playfair-26 + «город · район»), 3 soft badges WITH leading icons
   (shield «Проверен» / check «Надёжный участник» / users «Проводил встречи» — never
   a number, Inv. 3), a 3-card stat row (круга/встреч/недель), «О себе» card + interest
   chips, gear IconButton top-right → /settings. Foreign (D): flag in header, «общий
   контекст» card, disabled «Написать» row («после общей встречи»).
2. **Уведомления** (frame 10, route `/notifications`, TAB) — currently one row type.
   Mockup: 5 distinct rows, each an `IconTile` (rounded-square) + t1/t2:
   check «Тебя приняли в круг», pin «Место встречи открыто», coral-clock «Напоминание»,
   chat «Новое в чате круга», muted-users «Состав круга обновился». Title
   `stack-title.big` (Playfair 24).
3. **Онбординг** (frames A1–A3 value slides + frame 03 profile, route `/start`) —
   currently a single form. Mockup: consider the 3 value slides (анти-дейтинг copy)
   THEN the profile form (name / city+pin / interest chips) with a progress bar +
   fixed CtaBar «Далее». Current screen also has a safety-rules card + accept checkbox
   the mockup lacks — decide with product.
4. **Ритм** (frame 09, route `/rhythm`, TAB) — **most divergent.** Mockup = streak
   model («6 недель» hero card, «Эта неделя» 7-cell week grid with default/soft/on
   states, «Недавно» PAST attended rows). App currently = upcoming activities + a
   «Pull · закрытый тест» card. **This needs a product/data decision** (streak data
   doesn't exist yet) — likely do LAST or confirm scope first.

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

## 7. Suggested next order

Profile → Notifications → Onboarding → (confirm scope) Rhythm. Commit each screen
separately (`feat(design): port <Screen> to mockup (frame N)`), typecheck green
(`pnpm --filter @social-events/mobile typecheck`), verify on 8082 before moving on.
Show the user an A/B / screenshot per screen — they review closely and catch subtle
misses (tile shape, borders, spacing).
