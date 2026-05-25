# CLAUDE.md — Operating Instructions for Claude Code

> This file governs how Claude Code works in this repository.
> It is binding. If anything below conflicts with implementation convenience, **this file and Product Core win.**

---

## 0. First source of truth

**[`/docs/00_PRODUCT_CORE.md`](docs/00_PRODUCT_CORE.md) is the first source of truth.**

Before implementing any new feature, Claude **must** re-read and check against Product Core.
All other documents (`/docs/01_PRD.md` … `/docs/11_SPRINT_BACKLOG.md`) are downstream of Product Core and must reference it.

---

## 1. Mandatory pre-task checklist

At the start of **every coding task**, Claude must first answer briefly, before writing any code:

1. **Feature:** which feature is being implemented;
2. **Product Core sections:** which sections of `/docs/00_PRODUCT_CORE.md` apply;
3. **Safety invariants:** which safety invariants must not be violated by this work.

Only after this short answer may implementation begin.

---

## 2. Hard rules (never violate)

These map directly to the Product Core safety invariants. None of them may be broken for convenience.

1. **No feature may contradict the Product Core safety invariants** (Invariants 1–10 in `/docs/00_PRODUCT_CORE.md`).
2. **No open DMs.** Messaging exists only in event context or after real shared context.
3. **No exact location for non-approved users.** Exact event location is revealed only to approved attendees.
4. **No raw trust score shown to users.** Only soft badges (Verified, Reliable attendee, Hosted before, Attended events). Never a number.
5. **No public user ratings.**
6. **Do not turn the product into a dating app.** No dating mechanics, no swipe/match dynamics.
7. **No payments, tickets, or monetization in the MVP.**
8. **No exact user location.** City / district / approximate area / distance buckets only.
9. **Trust system must never become social credit** — it is a safety/moderation signal, not a public ranking.
10. **Every moderation-sensitive action must create an audit log** (ban, restriction, report review, event removal, admin decision).
11. **AI moderation is never the final judge** for serious enforcement. AI may flag, sort, summarize, triage. Serious enforcement requires human/admin review.

---

## 3. Conflict resolution

- If implementation convenience conflicts with Product Core → **Product Core has priority.**
- If a requested feature conflicts with a safety invariant → **do not implement it silently.** Stop, state the conflict, and propose a product decision.
- When something is ambiguous → **propose a product decision and ask**, rather than silently making a technical decision that shapes the product.

---

## 4. Documentation discipline

- All future documents must reference Product Core as the first source of truth.
- If reality forces a change to product direction, update `/docs/00_PRODUCT_CORE.md` **explicitly and deliberately** — do not let drift happen through code.
- Keep downstream docs consistent with Product Core; flag inconsistencies when found.

---

## 5. Scope discipline

- Build only what serves the core loop: **Discover → Apply → Approve → Attend → Reconnect.**
- If a feature does not serve this loop, it does not belong in the MVP — say so instead of building it.
- The "Не входит в MVP" list in Product Core is authoritative; do not implement anything on it without an explicit product decision.

---

## 6. Current phase

**Infrastructure Phase / Sprint 1 Foundation.**

The phase gate "Move from Pre-code Design Phase to Infrastructure Phase" is **APPROVED FOR INFRASTRUCTURE ONLY** — see [`/docs/16_PHASE_GATE_TO_INFRASTRUCTURE.md`](docs/16_PHASE_GATE_TO_INFRASTRUCTURE.md). This unlocks Sprint 1 scaffolding/foundation only — **not** product logic. First task: **INFRA-001 — Initialize monorepo structure.**

### Allowed now (scaffolding / foundation only)

- create monorepo structure;
- create `package.json` if required for workspace setup;
- set up TypeScript workspace;
- set up Expo mobile skeleton;
- set up Next.js admin skeleton (service role server-side only — never in client bundle);
- set up shared packages;
- set up basic lint/format tooling;
- set up placeholder Supabase folder structure (empty folders, no SQL);
- set up basic README files;
- set up environment variable templates (no real/production secrets);
- set up non-product design token structure.

### Still NOT allowed without a separate task

- product screens;
- business logic;
- Supabase migrations;
- SQL policies;
- RLS implementation;
- auth implementation;
- event logic;
- exact location reveal logic;
- trust scoring;
- moderation enforcement;
- analytics SDK implementation;
- AI integrations;
- production secrets;
- open DMs;
- payments/tickets;
- dating mechanics.

> Architecture is **Modular Monolith**, not microservices — see [`/docs/17_ADR_MODULAR_MONOLITH.md`](docs/17_ADR_MODULAR_MONOLITH.md).
> **Product Core remains the first source of truth.** Safety invariants 1–10 (§2) stay binding through this phase. Anything in the "Still NOT allowed" list, or any item on the "Не входит в MVP" list (open DMs, payments/tickets, dating mechanics, public ratings, exact public map pins, live location), requires a separate task and, where applicable, a Product Core update — do not implement silently (§3).

---

> Summary: think product-first, safety-first. Product Core is the contract. When in doubt, surface the decision — don't drift.
