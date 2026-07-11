# Activity-First MVP — Screen Inventory & Build Order

> **Status:** ✅ **ACTIVE screen spec for the activity-first build.**
> **Owner:** Product / Eng · **Version:** v1 (2026-07-11)
> **Parents:** [`/docs/30`](30_PRODUCT_DIRECTION_ACTIVITY_FIRST.md) (direction), [`/docs/31`](31_ACTIVITY_FIRST_IMPLEMENTATION_PLAN.md) (implementation plan).
> **Supersedes (for the activity-first build):** the circle-first screen registry in [`/docs/04`](04_FIGMA_PROTOTYPE_PLAN.md) §9 and [`/docs/13`](13_DESIGN_HANDOFF.md) §6 (MOB-001…134 / ADM-001…015). Those ~89 screens are **circle-first**; this document maps them to the activity-first model and defines the real MVP set. MOB-* IDs are referenced here only as a cross-map.

---

## 1. Why this exists

The current build has 4 activity screens (Feed, Activity Detail, Create Activity, My Circles) — the **entry happy-path** only. That is **not** a full MVP. But the circle-first templates over-count: many of their screens are **superseded** by activity-first, and many are P1/P2 even there. This doc separates the activity-first screen set into **Built / MVP-critical / MVP / Post-MVP / Superseded**, and gives a build order.

**Legend:** ✅ built · 🔴 MVP-critical (missing, structural) · ⚠️ MVP (missing) · 🕐 post-MVP · ❌ superseded (do not build)

---

## 2. The two structural gaps (not "just screens")

1. 🔴 **Create Circle** — circles currently exist only via DB seeding; there is no in-app way to make one. Without this, there is no supply.
2. 🔴 **Membership mechanic** (slot-claimer → circle member) — the belonging half of the loop. Currently members exist only via seeding. Without this, "become part of the circle → return" (docs/30 §2) does not happen.

Plus safety: 🔴 **Report / Block** is MVP-mandatory (Inv. 6), not post-MVP — this app puts strangers in the same offline place.

---

## 3. Screen inventory (activity-first)

### Auth & entry
| Screen | Status | Maps to | Note |
|---|---|---|---|
| Welcome / Login / Signup / Restricted | ✅ | MOB-001/002/003 | scaffolding built |
| Invite / Waitlist | ✅ | MOB-004/005 | dev placeholder gate built |
| **Onboarding (real)** — City/Area, Safety Principles, Display name + Photo | ⚠️ | MOB-011/012/013/020 | only a placeholder exists; activity-first needs a *minimal* onboarding (see §4.3) |

### Discovery / Activity (activity-first core)
| Screen | Status | Maps to | Note |
|---|---|---|---|
| Activity Feed (лента / объявления) | ✅ | — (net-new) | open overflow slots city-wide |
| Activity Detail | ✅ | ~MOB-060 | area only, aggregate composition |
| Create Activity | ✅ | — (net-new) | inside a circle |
| ~~Circle Discovery marketplace~~ | ❌ | MOB-030/031/032 | superseded — you discover activities, not circles |

### Circle / Belonging
| Screen | Status | Maps to | Note |
|---|---|---|---|
| My Circles | ✅ | MOB-070 | belonging home |
| **Circle Home / Detail** (members, rhythm, its activities) | ⚠️ | MOB-071/037 | per-circle hub — missing |
| **Create Circle** (host) | 🔴 | MOB-080…086 (compact) | structural gap |
| Pause / Leave | 🕐 | MOB-073/074/075 | post-MVP |

### Membership / Host
| Screen | Status | Maps to | Note |
|---|---|---|---|
| **Attendee → Member** transition | 🔴 | ~MOB-057/090 | structural gap (see §4.1) |
| Host: member management (light) | ⚠️ | MOB-092 | see/curate members |
| ~~Request-a-Place + modal + pending/not-this-time~~ | ❌ | MOB-050…057 | superseded — you claim a slot, not request a circle place |
| ~~Intro-meeting staged lifecycle~~ | ❌ | MOB-036 + intro states | superseded — claim → attend → member |
| ~~Membership-request queue as front door~~ | ❌→⚠️ | MOB-088/089/091 | reshaped into the lighter attendee→member above |

### Meeting reality
| Screen | Status | Maps to | Note |
|---|---|---|---|
| **Exact location reveal** (after claim) | ⚠️ | MOB-061 | today only a notice; needs a model change (see §4.2) — else people can't actually show up |
| **Attendance** (going / attended / no-show) | ⚠️ | MOB-062/065 | needed for attend→member + the pull/trust signal |

### Profile
| Screen | Status | Maps to | Note |
|---|---|---|---|
| My Profile + Edit | ⚠️ | MOB-110/111 | missing |
| Public Safe Profile | ⚠️ | MOB-112 | who you are meeting — safe/aggregate, never a browsable catalog |

### Safety (MVP-mandatory — Inv. 6)
| Screen | Status | Maps to | Note |
|---|---|---|---|
| **Report** (user / activity / circle) | 🔴 | MOB-113/114/115/116 | writes to a `reports` table (needs schema + RLS) |
| **Block** user | 🔴 | MOB-117/118 | blocked users cannot interact |
| Admin moderation (receive reports) | 🕐 | ADM-002/003 | interim: reports queue to a table, reviewed manually; full admin app is post-MVP |

### Settings
| Screen | Status | Maps to | Note |
|---|---|---|---|
| Settings + Manage Blocked + Delete Account | ⚠️ | MOB-130/132/134 | minimal MVP |
| Privacy / Data export | 🕐 | MOB-131/133 | post-MVP |

### Post-MVP (defer)
Circle Chat (MOB-100…104) · women-only / comfort composition (MOB-017/083) · full onboarding substeps — vibe/rhythm/group-size/host-willingness (MOB-015/016/018/019) · trust-badge detail & verification levels · reminders (MOB-063) · guest seats / crossover / seasonal (P2) · full admin app (ADM-*).

---

## 4. Open product decisions (must resolve before building the gap)

1. **Membership transition mechanic** — how does a slot-claimer become a circle member? Options: (a) **auto** after 1 attended meeting; (b) **host confirms** the attendee; (c) explicit **"join circle"** after attendance. *Recommendation: host-confirm for MVP (keeps host curation, matches Inv. 8 approval-as-fit-protection) with a one-tap action.* — **DECIDE.**
2. **Exact-location model** — add `exact_location` to `activities` (or a separate RLS-gated `meeting_locations`), revealed only to users with an active claim (Inv. 1). Currently area-only. — **DECIDE field + reveal window.**
3. **Onboarding minimalism** — activity-first does not need the full circle-discovery onboarding. Minimum: display name + city/area + safety-principles accept + 1 photo. Vibe/rhythm/composition → deferred. — **CONFIRM minimum set.**
4. **Reports sink without a full admin app** — MVP ships the report/block *UI + `reports`/`blocks` tables + RLS*; review is manual (SQL/dashboard) until the admin app. — **CONFIRM interim.**

---

## 5. MVP build order (tranches — complement docs/31 phases 4–5)

| # | Tranche | Delivers | Unblocks |
|---|---|---|---|
| **T1 ✅** | **Create Circle + Circle Home** | host makes a circle in-app (name/area/theme/rhythm); per-circle page (aggregate composition + next activity) | self-serve supply — **built; typecheck green; `theme`/`rhythm` migration applied to live DB** |
| **T2** | **Membership mechanic** | attendee → member (§4.1) + light host member view | the belonging half of the loop |
| **T3** | **Safety** | Report + Block UI + `reports`/`blocks` tables + RLS | Inv. 6 (mandatory) |
| **T4** | **Onboarding (min) + Profile** | real minimal onboarding + my/edit/public-safe profile | knowing who you meet |
| **T5** | **Meeting reality** | exact-location reveal (§4.2) + attendance (going/attended/no-show) | people actually show up + attend→member + pull signal |
| **T6** | **Settings** | settings + blocked list + delete account | account hygiene |

> After T1–T6 (+ docs/31 Phase 5 pull metric), the activity-first MVP loop is **complete and self-serve**: create circle → create activity → outsider claims → shows up (real location) → marked attended → becomes member → returns — with safety and profiles in place.

---

## 6. Not in MVP (explicit)

Circle chat · 1:1 DMs (Inv. 2) · women-only composition (gated on validation) · trusted radius (`group_links` reserved) · full admin/moderation app · trust scoring UI · reminders · guest/crossover/seasonal · payments. Per docs/30 §2 and the non-goals of Product Core.
