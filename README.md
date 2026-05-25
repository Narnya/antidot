# Social Events App — Monorepo

Trust-first, mobile-first product for safe offline meetups.
**[`/docs/00_PRODUCT_CORE.md`](docs/00_PRODUCT_CORE.md) is the first source of truth.** Operating rules: [`CLAUDE.md`](CLAUDE.md).

## Architecture

**Modular Monolith** — one system, one database, clear domain boundaries. Not microservices.
See [`/docs/05_ARCHITECTURE.md`](docs/05_ARCHITECTURE.md) and [`/docs/17_ADR_MODULAR_MONOLITH.md`](docs/17_ADR_MODULAR_MONOLITH.md).

## Layout

```
/apps
  /mobile      React Native + Expo (users)            — placeholder (INFRA-003)
  /admin       Next.js admin dashboard (web only)     — placeholder (INFRA-004)
/packages
  /ui          @social-events/ui          shared UI primitives / design system
  /types       @social-events/types       shared types (entities, enums, lifecycle)
  /validators  @social-events/validators  shared Zod schemas (client + server)
  /config      @social-events/config      shared config, env schemas, flag keys
  /analytics   @social-events/analytics   analytics taxonomy / wrapper
/supabase      migrations · functions · seed · tests  — placeholders (not packages)
/docs          product & engineering documentation
```

## Tooling

- **Package manager:** pnpm (workspace). Node `>=20`.
- **Language:** TypeScript (strict).
- **Quality:** ESLint + Prettier.

## Common scripts

```bash
pnpm install        # install workspace deps
pnpm typecheck      # tsc --noEmit across packages
pnpm lint           # eslint
pnpm format         # prettier --write (docs/ and CLAUDE.md are excluded)
pnpm format:check   # prettier --check
```

## Current phase

Infrastructure / Sprint 1 Foundation — scaffolding only. Product logic, schema, RLS, auth,
and SDKs are gated by separate tasks ([`/docs/16_PHASE_GATE_TO_INFRASTRUCTURE.md`](docs/16_PHASE_GATE_TO_INFRASTRUCTURE.md)).
