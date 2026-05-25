# Phase Gate to Infrastructure v1 — Social Events App

> **Status:** APPROVED FOR INFRASTRUCTURE ONLY
> **Owner:** Founder / Product / Technical Founder
> **Last updated:** 2026-05-24

---

## 0. Source of Truth

- [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — **first source of truth**. При конфликте приоритет у Product Core.
- This document is the explicit product decision that supersedes the "Pre-code Design Phase" gate in [`14_PHASE_GATE_AND_PRODUCT_DECISIONS.md`](14_PHASE_GATE_AND_PRODUCT_DECISIONS.md) §1–§3/§10 and unblocks the Infrastructure Phase.
- Basis docs: [`12_IMPLEMENTATION_READINESS_REVIEW.md`](12_IMPLEMENTATION_READINESS_REVIEW.md) (CONDITIONAL GO, safe-to-start §17), [`13_DESIGN_HANDOFF.md`](13_DESIGN_HANDOFF.md), [`15_FIGMA_TEST_PLAN_AND_RESULTS.md`](15_FIGMA_TEST_PLAN_AND_RESULTS.md) (§18 PASS path), [`17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md).
- This decision **does not** authorize product logic, schema, RLS, auth, or any sensitive behavior. It authorizes **scaffolding/foundation only**.
- [`/CLAUDE.md`](../CLAUDE.md) §6 is updated in lockstep with this document (Infrastructure Phase / Sprint 1 Foundation).

---

## 1. Decision

We are moving from **Pre-code Design Phase** to **Infrastructure Phase**.

**Status: APPROVED FOR INFRASTRUCTURE ONLY.**

This unlocks Sprint 1 foundation tasks, starting with **INFRA-001 — Initialize monorepo structure**.

> This is **not** permission to implement product logic. It is permission to start infrastructure scaffolding only. Product/security/trust/moderation logic remains gated behind separate tasks and human review (see §4 and [`11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md) §26).

---

## 2. Basis for Decision

- Foundational documentation completed (`00`–`15` + `CLAUDE.md`; readiness confirmed in [`12_IMPLEMENTATION_READINESS_REVIEW.md`](12_IMPLEMENTATION_READINESS_REVIEW.md) — CONDITIONAL GO).
- Design Handoff completed ([`13_DESIGN_HANDOFF.md`](13_DESIGN_HANDOFF.md)).
- ADR Modular Monolith accepted ([`17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md)).
- P0 Figma prototype built.
- Prototype localized to Russian.
- Prototype wired across **Flow A / B / C / D** (User Core Loop · Host Flow · Safety Flow · Admin Moderation; [`15_FIGMA_TEST_PLAN_AND_RESULTS.md`](15_FIGMA_TEST_PLAN_AND_RESULTS.md) §1).
- Core flow **provisionally validated**.
- Remaining design refinements are **non-blocking for infrastructure** — minor design/copy issues are handled later as fixes (PASS WITH FIXES disposition, [`15_FIGMA_TEST_PLAN_AND_RESULTS.md`](15_FIGMA_TEST_PLAN_AND_RESULTS.md) §18).

> Any High/Medium/Low design or copy issues found later are tracked as fixes and must be resolved before the **product UI** sprints (Sprint 3+), not before infrastructure scaffolding.

---

## 3. What Is Now Allowed

- monorepo structure;
- `package.json` / workspace setup;
- TypeScript workspace;
- Expo mobile skeleton;
- Next.js admin skeleton (service role server-side only — none in client bundle);
- shared package placeholders (`ui` / `types` / `validators` / `config` / `analytics`);
- Supabase folder placeholders (`migrations` / `functions` / `seed` / `tests` — empty, no SQL);
- lint/format config;
- basic CI placeholder if requested;
- README files;
- environment variable templates (`.env.example`, no real secrets).

> Maps to safe-to-start list in [`12_IMPLEMENTATION_READINESS_REVIEW.md`](12_IMPLEMENTATION_READINESS_REVIEW.md) §17 and INFRA-001..015 in [`11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md) §10.

---

## 4. What Is Still Not Allowed

- product screens;
- backend business logic;
- database migrations;
- SQL;
- RLS policies;
- Supabase schema implementation;
- auth implementation;
- event / application / chat logic;
- location reveal logic;
- trust scoring;
- moderation automation;
- real analytics SDK;
- AI moderation integration;
- production credentials;
- P1 / P2 features.

> These require **separate tasks** and, where security-sensitive, **human review gates** ([`11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md) §26; [`12_IMPLEMENTATION_READINESS_REVIEW.md`](12_IMPLEMENTATION_READINESS_REVIEW.md) §18). Several P2 items (open DMs, payments/tickets, dating mechanics, public ratings, exact public map pins, live location) are **forbidden** without a Product Core update (CLAUDE.md §2/§5).

---

## 5. Architecture Direction

MVP architecture is **Modular Monolith, not microservices.**

Reference: [`/docs/17_ADR_MODULAR_MONOLITH.md`](17_ADR_MODULAR_MONOLITH.md).

Rules:

- do not create microservices;
- do not create multiple databases;
- do not create separate backend services;
- keep domain boundaries clear inside the monorepo.

---

## 6. Safety Invariants Still Binding

Even in scaffolding, these remain binding (Product Core "Главные safety-инварианты" 1–10; CLAUDE.md §2):

- exact location is never visible to non-approved users;
- no open DMs;
- raw trust score is never shown;
- no public ratings;
- no dating mechanics;
- no payments/tickets in MVP;
- moderation-sensitive actions must be logged;
- AI assists but does not judge serious enforcement;
- service role is never exposed to client.

---

## 7. First Allowed Coding Task

**INFRA-001 — Initialize monorepo structure.**

Scope:

- folders only;
- README / `.gitkeep` placeholders;
- no product code;
- no backend logic;
- no migrations.

> Folder targets per [`05_ARCHITECTURE.md`](05_ARCHITECTURE.md) §6 / [`12_IMPLEMENTATION_READINESS_REVIEW.md`](12_IMPLEMENTATION_READINESS_REVIEW.md) §19: `/apps/{mobile,admin}`, `/packages/{ui,types,validators,config,analytics}`, `/supabase/{migrations,functions,seed,tests}`, preserving `/docs`.

---

## 8. Required Claude Code Behavior

Before every coding task Claude must state:

1. Which task is being implemented.
2. Which docs apply.
3. Which safety invariants apply.
4. Which files will be changed.
5. What is out of scope.
6. Whether `package.json` or code is being created.
7. Whether the task touches sensitive/product logic.

> Extends the mandatory pre-task checklist in CLAUDE.md §1. If a task implies product logic, schema, RLS, auth, or any "Still Not Allowed" item (§4), stop and surface it as a separate task/decision rather than proceeding (CLAUDE.md §3).

---

## 9. Summary

Infrastructure Phase is unlocked for **foundation / scaffolding only**. Product implementation remains gated by separate tasks and reviews.

**After completion of any task in this phase:**

1. Show changed files.
2. Confirm that no app code, `package.json`, SQL, migrations, or SDK setup were created during this phase-gate task — unless only `CLAUDE.md` / docs were changed.
3. State next recommended task: **INFRA-001 — Initialize monorepo structure.**

> Напоминание: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth; этот документ ему подчинён. В рамках самого этого phase-gate задания код приложения, `package.json`, SQL, миграции и SDK **не создавались** — изменены только `CLAUDE.md` и этот документ.
