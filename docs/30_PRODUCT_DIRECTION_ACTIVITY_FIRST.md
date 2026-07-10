# Product Direction — Activity-First (Decision Record)

> **Status:** ✅ **ACCEPTED direction (prototype phase).** This is the document the current build follows.
> **Owner:** Product
> **Version:** v1 (2026-07-07)
> **Supersedes (in part):** Product Core v2 ([`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md)) — the circle-first, event-superseding model. Core v2's **circle-as-front-door** mechanics are superseded here; its **safety spine** is carried forward.
> **Relation to prior records:** continues the re-core lineage ([`22`](22_PRODUCT_CORE_RECORE_PROPOSAL.md), [`24`](24_PRODUCT_CORE_V2_CIRCLES_PROPOSAL.md), [`26`](26_PRODUCT_CORE_V2_DECISION.md)) with a further primitive shift.
> **Follow-up required:** Core v2 (doc 00) must be rewritten (or forked to v3) to match this record; until then, **on conflict this document wins** for the activity-first build.

---

## 0. Why this document exists

The circle-first Core v2 was, in practice, **at war with the founder's actual goal.** The original intent was always **знакомства через активность** — meeting people (friends **and** romance) that starts not with long messaging but with a shared real-world activity. Core v2's hard rule *«no dating mechanics»* forbade exactly that, and the circle-first re-core was partly a fear-driven flight from being a shadow of InParty. That mismatch — an anti-dating manifest built on top of a meeting-people goal — is the real source of the viability doubt.

This record realigns the product with its actual goal, **without** reopening the door to InParty/Tinder mechanics.

**Evidence base (founder's own behaviour, n=1 — first real signal, not yet validated at scale):** runs 4 real groups in Telegram/WhatsApp; only football has a true recurring rhythm; when short on players, recruited a stranger from an **adjacent group** who integrated («приняли за своего») with no harmful drift. This points to the primitive below and is the reason to proceed to a prototype — **not** proof of demand (see §7).

---

## 1. The decision

The product is **activity-first**, with two centres on two different axes:

| Centre | Primitive | Role |
|---|---|---|
| **Вход / рост** | **Activity (Активность)** | how you enter and act; the feed / объявления; overflow to strangers |
| **Возврат / принадлежность** | **Circle (Круг / `Group`)** | why you stay; the "Мои круги" home; recurring rhythm → retention |

> **Активность — как ты входишь; круг — почему остаёшься.**

An activity is **never an orphan** — it always belongs to a circle. This is what separates it from the failed event-first model (events were atomised, each starting from zero).

---

## 2. Core loop

> **Создай активность в круге → свои заполняют места → не хватает → открой соседним (пока — городу) → чужой сам занимает слот → пришёл, сыграл → стал частью круга → возвращается.**

The hard hypothesis inside this loop is **pull**: that people claim open slots **themselves**, without being personally recruited. See §7.

---

## 3. Positioning

Meeting new people **and** romance — but romance is a **background, emergent outcome of repeated co-presence, never a product mechanic**. Activity and circle stay in the foreground.

- ✅ You join an **activity**; connection (friendship or romance) may emerge.
- ❌ You do **not** browse people, swipe, or message before shared context.

The dial: the more romance is **foregrounded** (ads as "a place to meet", intent signals, matching), the faster it collapses into Tinder/InParty and the harder the gender-balance and safety problems bite. Direction: **keep romance in the background.**

---

## 4. Recalibrated hard rule — "no dating mechanics"

The Core v2 / CLAUDE.md §2 hard rule *«no dating mechanics»* is **recalibrated, not deleted**:

- **Old (Core v2):** no romance, period.
- **New (this record):** no **swipe**, no **browsing/listing people**, no **cold 1:1 messaging before shared activity**, no **activity-as-pretext** for dating. Romance is permitted **only as an emergent outcome**, never a mechanic or an advertised promise.

The two fences that keep this out of InParty **and** out of Meetup-marketplace:

1. **You claim a SLOT, not a person** — the feed lists activities, never a catalogue of people. (Carries Core v2 Invariant 13 — no people marketplace.)
2. **You don't browse the whole city forever** — discovery is bounded and low-scroll by intent. (Currently relaxed — see §6.)

---

## 5. What is superseded from Core v2

- **Circle Discovery as a marketplace** (browsing circles of strangers as the front door) → replaced by the **activity feed**.
- **«Запросить место в круге»** as the entry mechanic → replaced by **«занять слот»** on an activity.
- **Heavy membership lifecycle as the front door** (`approved_for_intro_meeting` → `intro_attended` → staged access) → deferred. MVP uses a light `Group` + membership; overflow claims are not full membership.

**Carried forward from Core v2 (still binding):** exact location hidden until claim (Inv. 1); no open/cold DMs (Inv. 2); no raw trust score (Inv. 3); audit logs (Inv. 4); AI assists, never judges (Inv. 5); easy report/block (Inv. 6); safety is UX (Inv. 7); no exact/live user location (Inv. 9); trust ≠ social credit (Inv. 10); no betrayal mechanics (Inv. 11); no public shame labels (Inv. 12); **no people marketplace (Inv. 13)**; no infinite discovery pressure (Inv. 14); membership ≠ ownership (Inv. 15); multiple circles allowed (Inv. 16).

---

## 6. Open / unvalidated decisions

- **Pull hypothesis (the make-or-break):** do people claim slots self-serve? Only real-world use answers this. The one data point so far was **push** (manual recruiting), not pull.
- **City-wide vs trusted radius:** MVP currently shows overflow **city-wide** (product decision 2026-07, chosen for simpler cold-start). This weakens the "vouched-by-adjacent-group" trust property and is the Meetup-marketplace risk. `GroupLink` (trusted radius) is modelled but **not wired** — reserved as the lever to tighten discovery back later. Treat city-wide as **temporary**.
- **Safety at higher stakes:** once meeting/romance is in scope, predator-under-pretext risk (esp. for women) rises. Group-anchoring + trust/attendance gating are the primary defences; comfort-composition / women-only remain gated on validation (Core v2 §21).
- **Business model:** unresolved; deferred until the loop is proven.

---

## 7. Status & phase

- **Build maturity:** clickable **prototype on mock data** (`apps/mobile/src/features/activities`, `ACT-001…004`). **Not** production — no backend, no real auth, no persistence.
- **Purpose of the prototype:** make the concept tangible and align on design — **not** to prove demand.
- **Validation of the core hypothesis (pull) is separate and still pending** — a no-code real-world test (post open slots to adjacent groups, measure self-serve fills). This is what moves the product from *concept* to *validated*.

---

## 8. Follow-ups

1. Rewrite [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) to activity-first (or fork to Core v3), then re-point downstream docs.
2. Update [`CLAUDE.md`](../CLAUDE.md) §2 hard rule 6 to the recalibrated wording in §4.
3. Run the real-world **pull** test (§7) in parallel with prototyping.
4. Decide city-wide → trusted-radius transition criteria (§6).

> **Until follow-up 1 lands, this document is the source of truth for the activity-first build.**
