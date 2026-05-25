# ADR — Modular Monolith for MVP

> **Status:** Accepted for MVP
> **Owner:** Technical / Architecture
> **Last updated:** 2026-05-23

---

## 1. Source of Truth

- Документ основан на [`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md), [`05_ARCHITECTURE.md`](05_ARCHITECTURE.md), [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md), [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md), [`11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md), [`14_PHASE_GATE_AND_PRODUCT_DECISIONS.md`](14_PHASE_GATE_AND_PRODUCT_DECISIONS.md).
- **[`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth.** При конфликте приоритет у Product Core.
- This ADR **does not** introduce any new product capability and **does not** violate safety invariants 1–10.
- This ADR formalizes a decision already implicit in [`05_ARCHITECTURE.md`](05_ARCHITECTURE.md) §4–§6 and §29 (single Supabase/PostgreSQL backend + monorepo, no microservices).
- This is a **documentation-phase** artifact only. No code, `package.json`, scaffolding, SQL, or migrations are created by this decision (CLAUDE.md §6; [`14_PHASE_GATE_AND_PRODUCT_DECISIONS.md`](14_PHASE_GATE_AND_PRODUCT_DECISIONS.md) §1).

---

## Status

Accepted for MVP.

---

## Context

We are building an early-stage mobile-first social events product with strong trust, safety, moderation and location privacy requirements.

The system domains are tightly connected:

- profiles
- events
- applications
- event_locations
- event_chat
- reports
- blocks
- moderation
- trust
- audit logs
- notifications
- analytics

The MVP needs fast iteration, strong RLS/security and low operational complexity.

These domains are not independent: a single user action (e.g. `approve_application`) atomically touches applications, attendees, event_locations access, chat access, trust signals, notifications and audit logs. Splitting such flows across services would turn one transactional decision into a distributed coordination problem — directly at odds with the safety invariants that depend on these operations being consistent and auditable.

---

## Decision

Use **Modular Monolith** architecture for MVP.

Use:

- React Native + Expo for mobile
- Next.js for admin
- Supabase Auth
- PostgreSQL
- Row Level Security (RLS)
- Supabase Storage
- Supabase Edge Functions for sensitive operations
- Monorepo structure

Do **not** use microservices for MVP.

> This is consistent with the stack already declared in [`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) ("Технические решения на сейчас") and [`05_ARCHITECTURE.md`](05_ARCHITECTURE.md) §4–§5.

---

## What Modular Monolith Means

One system and one database, organized into clear domains:

- Identity / Profiles
- Events
- Applications
- Location Privacy
- Chat
- Safety
- Moderation
- Trust
- Notifications
- Analytics
- Beta / Invites

Each domain should have clear:

- tables
- validators
- types
- functions
- tests
- UI modules
- security rules

> Domain boundaries here map onto existing structures: feature modules in [`05_ARCHITECTURE.md`](05_ARCHITECTURE.md) §7.2 / §9, schema domains in [`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) §6, and the epic structure in [`11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md) §17. Shared types/validators live in `/packages/types` and `/packages/validators` ([`05_ARCHITECTURE.md`](05_ARCHITECTURE.md) §6).

---

## Why Not Microservices Now

Microservices are deferred because they would add:

- DevOps overhead
- cross-service authorization complexity
- harder RLS enforcement
- harder transaction consistency
- harder debugging
- slower iteration
- unnecessary infrastructure cost

For an invite-only closed beta with a single beta city, none of these costs buy us anything the product loop needs. Independent scaling is not a beta requirement; correctness, safety and iteration speed are.

---

## Safety Rationale

A modular monolith makes it easier to enforce the Product Core safety invariants:

- **exact location is visible only to approved users** (Инвариант 1) — `event_locations` is one protected table behind RLS in one database, not a service boundary that must re-authorize on every hop ([`06_DATABASE_SCHEMA.md`](06_DATABASE_SCHEMA.md) §8.3, [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §12).
- **no open DMs** (Инвариант 2) — chat access is gated by RLS predicates tied to `event_attendees`/`event_applications` in the same DB ([`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §15).
- **raw trust score is internal only** (Инвариант 3/10) — `trust_events` / `user_trust_summary` are server/system-only tables; no public endpoint or view returns the number ([`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §19).
- **moderation actions create audit logs** (Инвариант 4) — `moderation_actions` and `audit_logs` writes happen in the same transactional context as the action ([`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §18).
- **blocked/banned users cannot interact** (Инвариант 6/7) — block/ban checks are enforced in shared Edge Functions and RLS, not duplicated across services.
- **service role is never exposed to client** (CLAUDE.md §2; [`07_SECURITY_RLS.md`](07_SECURITY_RLS.md) §8) — sensitive operations run in Edge Functions / admin server-side only.

One database + RLS + Edge Functions means the security model is **one consistent surface to reason about and test** (see RLS test backlog, [`11_SPRINT_BACKLOG.md`](11_SPRINT_BACKLOG.md) §23) — not N services each re-implementing authorization.

---

## Future Extraction Candidates

Potential future services **after MVP**:

- AI recommendations
- search / discovery ranking
- notifications
- media moderation
- payments
- analytics pipeline

These should only be extracted when product scale or complexity justifies it. Several of them (payments, advanced AI matching) are also on the "Не входит в MVP" list in [`00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) and require a product decision before they exist at all — extraction is a *post-MVP* concern, not a near-term one.

---

## Claude Code Rules

Claude Code **must not**:

- create microservices
- create multiple databases
- create separate backend services
- introduce service-to-service architecture
- bypass the Supabase / RLS security model
- split domains prematurely

Claude Code **should**:

- keep domain boundaries clear
- use modular folders
- keep shared types / validators centralized
- use Edge Functions for sensitive operations
- write tests for security-critical flows

> If a future request implies any of the "must not" items, stop and surface it as a product/architecture decision rather than implementing silently (CLAUDE.md §3).

---

## Consequences

**Benefits:**

- faster MVP development
- simpler security model
- easier RLS enforcement
- easier debugging
- easier beta operations

**Tradeoffs:**

- less independent scaling
- more discipline needed to maintain module boundaries
- future extraction may be needed after scale

---

## Summary

The MVP will be implemented as a **Modular Monolith** with clear domain boundaries.
Microservices are explicitly deferred until product scale or complexity justifies extraction.

This decision reinforces — and does not change — the architecture in [`05_ARCHITECTURE.md`](05_ARCHITECTURE.md); it makes the "no microservices in MVP" stance explicit and binding.

> Напоминание: [`/docs/00_PRODUCT_CORE.md`](00_PRODUCT_CORE.md) — first source of truth; этот ADR ему подчинён. Код приложения, `package.json`, SQL, миграции не создавались; другие документы не изменялись.
