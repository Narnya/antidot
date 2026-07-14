# Session Handoff — Design Templates (Welcome first) — continue here

> **Date:** 2026-07-14 · **Branch:** `feat/activity-first-mvp` · **Purpose:** continue the **template-first visual redesign** in a fresh chat (the previous chat's context overflowed). Read this + [`/docs/35`](35_DESIGN_SYSTEM_V2_WARM_GREEN.md) first.

---

## 0. Where things stand (two layers)

1. **App code** — the activity-first MVP (T1–T6) is built on live Supabase, and **Design System v2 (Warm-Green)** is already applied in code and committed: palette, Playfair headlines, outline icons, 5-tab nav (+ Ритм/Уведомления), Welcome poster, feed photo-cards. See [`/docs/33`](33_SESSION_HANDOFF.md) (MVP) + [`/docs/35`](35_DESIGN_SYSTEM_V2_WARM_GREEN.md) (DS canon). Those commits: `c6bacf3 072881c 85a9667 8061219 08809b0 f1d0ddc c616c35`.
2. **Design templates (CURRENT work)** — the founder wants **page templates built & approved OUTSIDE the app first, then applied to code.** We build each screen as a **standalone HTML mockup in `mockups/`**, render it, compare pixel-by-pixel to the founder's reference, iterate to approval, and only then port to RN. **Do NOT edit app verstka until a template is approved.**

## 1. The workflow rules (BINDING — the founder was emphatic)

- **Templates live in `mockups/*.html`** (standalone, real Google Fonts). Approve BEFORE touching app code.
- **MEASURE, don't eyeball.** When matching a reference, compare **proportions, font sizes, distances, paddings, line-height, letter-spacing, font weight** — not just the words. Eyeballing caused repeated proportion errors. (Saved as memory `design-mockup-analysis`.)
- **Wordmark brand rule:** `ANTIDOT` — Inter, uppercase, **wide tracking**, `#18392D`; a coral `#F05A3A` **dot ALWAYS centered above the letter «I»** (the middle of the word), never drifting sideways. (In `welcome.html` this is done with flex-letter spans so it's perfectly centered; the dot is inside the `.i` span.) Recorded in docs/35 §Typography.
- Playfair Display = **only** emotional brand moments (Welcome headline/accent). App UI = Inter everywhere.

## 2. Current task: Welcome template — nail it pixel-perfect

- **Template:** [`mockups/welcome.html`](../mockups/welcome.html) — v2.0, already close.
- **Reference (founder's target, ON DISK):** `mockups/ref-welcome.png` (853×1844). This is the source of truth for Welcome.
- **Immediate next step (was about to start):** measure the reference vs the template and match. Practical method: render `welcome.html` at 393×852, then **overlay** it on `ref-welcome.png` (scaled to the same size) OR use `mockups/compare.html` side-by-side; adjust `welcome.html` and re-measure until the render overlays the reference. Use `mockups/tools/measure.mjs` for the render's element boxes/type.
- **Current welcome.html state (measured @393):** ANTIDOT 178px/45%, 22px, weight 500; headline «Найди / свой круг» 51px (clamp 40→51), green `#18392D`, 2 lines; accent «без дейтинга» 33px (~53% — now narrower than the headline, as in the ref); subtitle 19/28 `#545049`; CTA green `#18392D` h54 r18 17px **with → arrow**; login light `#f4efe6`, «Войти» coral. Background = **ivory that smoothly fades into the photo** (long gradient, no hard edge). No vertical divider (founder removed it — but the ref shows one; confirm).
- **Decided:** centered layout; green headline (per ref, overrides the earlier text spec that said `#15130F`); dot над «I»; CTA has arrow (ref shows it, though founder once said "лучше без стрелки" — reconfirm); smooth ivory→photo bg; adaptive (`100dvh` + `env(safe-area-inset-*)` + `clamp()`); the background photo is `mockups/welcome-bg.png` (the founder's portrait shoreline; a wide 16:9 `welcome-bg-wide.png` is reserved for desktop).
- **STILL OPEN on Welcome:** (a) **ANTIDOT font weight** — 400 / 500 / 600? (currently 500, founder said it "differs" — needs a decision, best judged by overlaying the ref); (b) exact proportions/paddings vs the ref (the measure/overlay pass); (c) whether the vertical divider stays out; (d) final approve.
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
```
Then `Read` the png to view it. Render at 375×667 / 393×852 / 430×932 to check adaptivity.

**Preview server (for the founder in a browser):**
```bash
cd "mockups" && python3 -m http.server 8091 --bind 127.0.0.1
```
→ http://localhost:8091/ (index), `/welcome.html`, `/compare.html` (needs `ref-welcome.png`).

## 4. Remaining screens to template (after Welcome approved)

By the founder's final mockup set: **Для тебя (feed)** · **Детали активности** · **Занять место** (a join sheet we don't have yet) · **Мои круги** · **Мой ритм** · **Уведомления** · **Профиль** · **Настройки**. Same process each: build `mockups/<screen>.html` → measure vs the founder's reference → approve → then port to app RN.

**Safety drop-list still binding** when porting (docs/35 §8): feed avatars are DECORATIVE/anonymous (real ones would expose who's going to strangers — Инв. 1/13 + RLS); no profile counters/achievements/streaks; no people search/invite; heart = local visual only.

## 5. Discipline

Never trust RLS by eyeballing (live positive+negative). Typecheck green on any app-code increment. Secrets never committed (`.env` gitignored; DB password is in the founder's password manager — a new session must ask for it; see [`/docs/33 §4`](33_SESSION_HANDOFF.md)). Commit `mockups/` + tools + docs so the next chat has the reference + templates + rules.
