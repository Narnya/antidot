# Design System v2 (Warm-Green) — Antidot · Design Sprint 2

> **Status:** ✅ **ACTIVE visual canon** for the activity-first build.
> **Owner:** Product / Design · **Version:** v2 (2026-07-14)
> **Scope:** a **visual-only** elevation of the existing activity-first MVP to production quality. **Does NOT change** Product Core v3, UX, flows, mechanics, navigation logic, backend, or safety invariants ([`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) wins on any conflict).
> **Origin:** founder's "Design Sprint 2" brief (ChatGPT-assisted concept), reconciled here against Core v3 + the 16 safety invariants. The concept boards are **reference**, not canonical (CLAUDE.md §13); this doc is the canon.
> **Supersedes:** the "Urban Air" palette (black primary) currently in `packages/ui` tokens.

---

## 1. Design goal

Make the product feel **calm · premium · editorial · warm · trustworthy · timeless** — "Apple hires Airbnb's design team." Never trendy, startup-y, playful, or gamified. The **activity is always the hero**; people are secondary; profiles tertiary. Whitespace is part of the design (if a screen can drop 30% of its elements, drop them).

Core promise stays: **activity helps people meet; circle helps people stay.**

---

## 2. Palette (maps to `packages/ui` semantic tokens)

Green = **product** (actions, trust, CTA, membership, confirmed). Coral = **brand only** (ANTIDOT wordmark, "без дейтинга", tiny labels/accents). **Never use coral as the main application color.**

| Semantic token | Hex | Role |
|---|---|---|
| `background.default` | `#F7F5EF` | warm ivory app background |
| `surface.default` | `#FFFDF9` | cards |
| `text.primary` | `#15130F` | primary text |
| `text.secondary` | `#68645C` | secondary text |
| `text.muted` | `#9A938A` | muted / meta |
| `text.inverse` | `#FFFDF9` | text on green |
| `border.default` | `#E8DDCF` | warm hairline |
| `action.primary` | `#18392D` | **green** primary button / product |
| `action.primaryText` | `#FFFDF9` | text on green |
| `action.secondary` | `#EFE9DE` | warm secondary button bg |
| `status.success` / `safety.notice*` | bg `#DCEAD8`, text `#18392D` | success / "точное место скрыто" notice |
| `trust.verified*` | bg `#DCEAD8`, text `#18392D` | soft "Проверен" badge (green = trust; never a number — Инв. 3) |
| `status.danger` / `action.destructive` | `#C0402E` | destructive (delete) |
| `accent.coral` | `#F05A3A` | brand accent only |

---

## 3. Typography

- **Headlines / accents:** **Playfair Display** (editorial serif). H1 36/44 · H2 28/36 · H3 22/28.
- **Body / interface:** **Inter**. Body 16/24 · Small 14/20 · Caption 12/16.
- Very large hierarchy, lots of whitespace, minimal copy.

---

## 4. Icons

- **Outline, 1.5px stroke, rounded.** No emoji anywhere in product UI (replaces `⚽ 🚶 🎲 ☕ 🏃 ✨`, `📍`, `✓`).
- **No hearts, no flames** (dating-coded). "Save" uses a **bookmark**, not a heart.
- Activity kinds map to neutral outline glyphs (football/walk/boardgames/coffee/run/other).

---

## 5. Components

- **Radius 20–24** (cards), soft/subtle shadow, warm tones, generous padding.
- **Buttons:** Primary (green, filled) · Secondary (warm, bordered) · Text (coral, for destructive/tertiary). Large, premium, minimal borders.
- **Activity card** (the most important component) communicates at a glance: what · where (area only) · when · how many slots · atmosphere · circle · CTA «Занять место». Hero image per activity. **No people browsing.**
- **Motion:** slow, calm. No bouncy onboarding.

---

## 6. Photography

Activities are the hero. **Use:** football, walking, climbing, board games, city, shared tables, hands, movement — people only **inside** activities. **Avoid:** faces smiling to camera, stock business/networking, romantic couples, nightlife, generic coffee-lifestyle. (No identifiable-user privacy issues in marketing/UI — Инв. 9.)

---

## 7. Accepted new surfaces (scope addition — founder-approved)

These are **net-new** vs the coded MVP (which has no tab bar and no such screens). Approved as scope; content is constrained to stay invariant-safe:

- **5-tab bottom nav:** Для тебя · Мои круги · Ритм · Уведомления · Профиль.
- **Мой ритм** — a personal calendar: upcoming + past activities. **No streak, no gamification** (Инв. 14). Derived from the user's own activities.
- **Уведомления** — activity-scoped events only: "X заняла место в «…»", reminders, "host подтвердил ваше участие", "встреча завершена". **Never** surfaces another user's membership transitions ("X ушёл / removed") — Инв. 11/12.

---

## 8. Safety drop-list (BINDING — do not implement, even if a concept board shows it)

The concept boards contained items that violate Core v3 / the prompt's own principles. These are **forbidden**:

- ❌ Profile **counters / achievements / streaks** (встреч / кругов / посещений, «Достижения») — Инв. 3 (no numbers), Инв. 14 (no gamifying circle count). Profile stays: bio + favourite-activity chips + links (Мои круги / Безопасность / Приватность).
- ❌ **People search / invite** ("Скрыть меня из поиска", "Кто может приглашать меня") — Инв. 13 (no people marketplace). Settings = Аккаунт · Уведомления · Поддержка.
- ❌ **Hearts / like / match** — dating-coded (use bookmark for save).
- ❌ Full member lists as a browsable catalog — aggregate composition only; member avatars only within circles you belong to.
- ❌ Exact location before an active claim (Инв. 1); DMs before shared activity (Инв. 2); raw trust score (Инв. 3).

---

## 9. Decisions recorded

- **Palette:** Warm-Green **replaces** Urban-Air (black primary) as the canonical DS.
- **Brand voice:** "без дейтинга" is **kept** as the Welcome emotional hero (Welcome sells emotion; the app sells activities). Entry mechanism stays activity-first (CTA «Посмотреть активности»). Mild ongoing tension with docs/30 §4 is accepted consciously.
- **Verb:** **«Занять место»** is the canonical claim CTA (not «Подтвердить участие»).

---

## 10. Implementation sequence (code)

1. **Tokens** — retokenize `packages/ui` colors to Warm-Green (cascades to every screen). ← first
2. **Typography** — add Playfair Display (expo-google-fonts) + a headline text style; wire font loading in the root layout.
3. **Icons** — outline icon set; replace `kindEmoji` and inline `📍/✓`; bookmark for save.
4. **Navigation** — 5-tab bar; build Мой ритм + Уведомления (§7).
5. **Cards** — hero image per activity (curated per kind); verb consistency (§9).

> Figma is kept as a visual reference; the running app is the deliverable. Each step ships as a verifiable increment (typecheck green; re-screenshot on web).
