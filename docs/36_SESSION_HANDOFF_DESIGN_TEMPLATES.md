# Session Handoff — Design Templates — continue here

> **Date:** 2026-07-15 · **Branch:** `feat/activity-first-mvp` · **Purpose:** continue the **template-first visual redesign** in a fresh chat. Read this + [`/docs/35`](35_DESIGN_SYSTEM_V2_WARM_GREEN.md) first.
> **Progress:** Welcome ✅ approved (pixel-matched — §2). «Для тебя» feed 🟡 nav + header agreed, card body pending approval (§2b). Full queue in §4.

---

## 0. Where things stand (two layers)

1. **App code** — the activity-first MVP (T1–T6) is built on live Supabase, and **Design System v2 (Warm-Green)** is already applied in code and committed: palette, Playfair headlines, outline icons, 5-tab nav (+ Ритм/Уведомления), Welcome poster, feed photo-cards. See [`/docs/33`](33_SESSION_HANDOFF.md) (MVP) + [`/docs/35`](35_DESIGN_SYSTEM_V2_WARM_GREEN.md) (DS canon). Those commits: `c6bacf3 072881c 85a9667 8061219 08809b0 f1d0ddc c616c35`.
2. **Design templates (CURRENT work)** — the founder wants **page templates built & approved OUTSIDE the app first, then applied to code.** We build each screen as a **standalone HTML mockup in `mockups/`**, render it, compare pixel-by-pixel to the founder's reference, iterate to approval, and only then port to RN. **Do NOT edit app verstka until a template is approved.**

## 1. The workflow rules (BINDING — the founder was emphatic)

- **Templates live in `mockups/*.html`** (standalone, real Google Fonts). Approve BEFORE touching app code.
- **MEASURE, don't eyeball.** When matching a reference, compare **proportions, font sizes, distances, paddings, line-height, letter-spacing, font weight** — not just the words. Eyeballing caused repeated proportion errors. (Saved as memory `design-mockup-analysis`.)
- **Wordmark brand rule:** `ANTIDOT` — Inter, uppercase, **wide tracking**, `#18392D`; a coral `#F05A3A` **dot ALWAYS centered above the letter «I»** (the middle of the word), never drifting sideways. (In `welcome.html` this is done with flex-letter spans so it's perfectly centered; the dot is inside the `.i` span.) Recorded in docs/35 §Typography.
- Playfair Display = **only** emotional brand moments (Welcome headline/accent). App UI = Inter everywhere.

## 2. Welcome template — ✅ APPROVED (2026-07-15)

- **Template:** [`mockups/welcome.html`](../mockups/welcome.html) — v2.1, pixel-matched to the reference and **approved by the founder**.
- **Reference (source of truth, ON DISK):** `mockups/ref-welcome.png` (853×1844).
- **Method used (repeat for every screen):** pixel-scan the reference with `tools/measure-ref.mjs` (text bands / colors / divider / CTA geometry), render the template with `tools/render.mjs`, `tools/measure.mjs` the render, overlay ref-under-render at 50 % to check alignment, `tools/crop3.mjs` to compare weights/regions at zoom. **Measured, not eyeballed** — every value below came from the scan, and each render landed within ~4 px of the reference target.
- **Final measured spec (@393×852):** ANTIDOT Inter **500**, 20px, letter-gap 11 → ink width ≈40 %W, cy ≈11.7 %H, coral dot centered над «I»; headline «Найди / свой круг» Playfair **600** (700 was too heavy on the crop-compare), 42px, lh 1.24, green `#18392D`, cy 20 %/26 %, width ≈49 %W; accent «без дейтинга» Playfair 500 **upright** (not italic), 22px, coral `#F05A3A`, ≈35 %W; **vertical divider** 1px hairline `#45564c`@55 % opacity, ≈32px tall, centered, cy ≈37 % (the ref DOES show it → re-added); subtitle Inter 13.5/22 **dark green-charcoal `#33423b`** (NOT light grey), ≈41 %W; CTA green `#18392D`, h60, r20, 16px, side-margins ≈35px (82 %W), **no arrow** (removed per founder); login `#f0ebe1`, «Войти» coral. BG = ivory that fades into `welcome-bg.png` (scrim-top 50 %, opaque→65 %).
- **Decisions locked:** ANTIDOT **500**; headline **600**; divider **stays IN**; CTA **without arrow**; accent **upright**; subtitle **dark green** (not grey); centered; adaptive (`100dvh` + `env(safe-area-inset-*)`).
- **One known residual (not layout):** the reference hero photo reads dimmer / more golden; ours is the raw brighter `welcome-bg.png` (same composition — man, shoreline, rocks). Grade the asset later if desired; layout/type/colors/divider/CTA are matched. A wide 16:9 `welcome-bg-wide.png` is reserved for desktop.

## 2b. Для тебя (feed) — nav + header agreed (2026-07-15); card body on approval

- **Template:** [`mockups/feed.html`](../mockups/feed.html) — built from the **DS-canon** ([`/docs/35`](35_DESIGN_SYSTEM_V2_WARM_GREEN.md)), **no pixel reference** (founder chose "design from canon", not a PNG target).
- **Faithful to product & invariants:** lists **activities, not people**; photo "invitation" cards grouped by day; **area only** + aggregate slot count; the avatar row is **decorative / anonymous** warm tints (Инв. 1/13 — real identities to strangers would break the promise + RLS); **bookmark** for save (not heart); outline icons 1.5px, **no emoji / no ✓-glyph**; soft green **«Проверен»** badge (no number — Инв. 3). Structure mirrors the shipped `FeedScreen.tsx` + `ActivityCard.tsx`.
- **Conscious DS elevations vs the shipped code:** card radius **20** (was 16; DS §5 says 20–24); slot-chip «N мест» in **green** (availability accent); day dividers **CAPS + tracking**; card `meta` = **area only** (the day is already the group header).
- **Bottom nav — founder-decided:** **fixed** at the bottom (not floating), frosted bg + top hairline; icons kept; labels **minimal (10px)**; **active fills green — icon AND label** (`#18392D`), inactive muted `#9a938a`. No floating capsule, no top-indicator. This is the **shared lead-nav** to reuse on all five tab screens (Для тебя · Мои круги · Ритм · Уведомления · Профиль).
- **Top bar — founder-decided:** the big serif screen-title **was removed** (it duplicated the nav label); the header is led by the **city context** «Санкт-Петербург · Приморский ▾» (pin + chevron = change area; sticky translucent + blur), then the filter chips (Все / Спорт / Настолки / Прогулки / Кофе).
- **Explored & rejected (history):** two floating-capsule navs — A (expanding active green pill, icons-only inactive) and B (tinted icon+label) — were rendered and compared; the founder chose the fixed bar.
- **STILL OPEN on feed:** (a) active-green shade — solid vs a softer tint-glow under the icon; (b) label size 10 vs 11; (c) whether to add a small serif greeting at the top; (d) card-body approve; (e) then port to RN.
- **Self-contained assets:** activity hero jpgs copied into `mockups/` (`activity-football/boardgames/run/walk/coffee.jpg`) so the template renders standalone and on the preview server.
- **Tokens (Warm-Green):** bg `#F7F5EF` · cards `#FFFDF9` · primary text `#15130F` · secondary `#6B645C` · product green `#18392D` · brand coral `#F05A3A`. Type: Inter (UI) + Playfair Display (brand headline).

## 3. Tools & how to render/measure

Scripts committed at `mockups/tools/` (they drive **system Chrome** headless via `playwright-core`). Setup + run:
```bash
# one-time: install the driver somewhere (repo lockfile untouched)
mkdir -p /tmp/wf && (cd /tmp/wf && npm i playwright-core@1.48.0)
export NODE_PATH=/tmp/wf/node_modules
# render a template to a png at a mobile size:
node "mockups/tools/render.mjs" "$PWD/mockups/welcome.html" /tmp/w.png 393 852
# measure element boxes + type of the template:
node "mockups/tools/measure.mjs" "$PWD/mockups/welcome.html" 393 852
# pixel-scan a REFERENCE png (text bands / colors / divider / CTA geometry):
node "mockups/tools/measure-ref.mjs" "$PWD/mockups/ref-welcome.png"
# zoom-compare the same fractional region across N renders (weights, navs, …):
node "mockups/tools/crop3.mjs" /tmp/ref.png /tmp/mine.png <fx> <fy> <fw> <fh>   # → /tmp/crop3.png
```
Then `Read` the png to view it. Render at 375×667 / 393×852 / 430×932 to check adaptivity.

> **Node 25 note:** ESM ignores `NODE_PATH`, so `export NODE_PATH=…` no longer makes the tools resolve `playwright-core`. Run them from a dir where `node_modules` resolves, e.g. `cp mockups/tools/*.mjs /tmp/wf/ && node /tmp/wf/render.mjs "$PWD/mockups/welcome.html" /tmp/w.png 393 852` (absolute html path; the template's relative image srcs still resolve via the file URL).

**Preview server (for the founder in a browser):**
```bash
cd "mockups" && python3 -m http.server 8091 --bind 127.0.0.1
```
→ http://localhost:8091/ (index), `/welcome.html`, `/compare.html` (needs `ref-welcome.png`).

## 4. Screen queue

| # | Screen | Status |
|---|---|---|
| 1 | Welcome | ✅ **approved** (§2) |
| 2 | Для тебя (feed) | 🟡 nav + header agreed; card body on approval (§2b) |
| 3 | Детали активности | ⬜ next |
| 4 | Занять место (join sheet — new, not in code yet) | ⬜ |
| 5 | Мои круги | ⬜ |
| 6 | Мой ритм | ⬜ |
| 7 | Уведомления | ⬜ |
| 8 | Профиль | ⬜ |
| 9 | Настройки | ⬜ |

Same process each: build `mockups/<screen>.html` → (measure vs a founder reference **or** design from the DS-canon, per the founder's call for that screen) → approve → then port to app RN. **Reuse the fixed lead-nav from `feed.html` on every tab screen** (2/5/6/7/8).

**Safety drop-list still binding** when porting (docs/35 §8): feed avatars are DECORATIVE/anonymous (real ones would expose who's going to strangers — Инв. 1/13 + RLS); no profile counters/achievements/streaks; no people search/invite; heart = local visual only.

## 5. Discipline

Never trust RLS by eyeballing (live positive+negative). Typecheck green on any app-code increment. Secrets never committed (`.env` gitignored; DB password is in the founder's password manager — a new session must ask for it; see [`/docs/33 §4`](33_SESSION_HANDOFF.md)). Commit `mockups/` + tools + docs so the next chat has the reference + templates + rules.
