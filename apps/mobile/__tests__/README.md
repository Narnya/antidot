# `apps/mobile/__tests__`

Placeholder for **mobile** tests. Empty for now (INFRA-014).

- **Not** tested by the root Vitest setup (Vitest covers shared packages only).
- Mobile testing will later use **jest-expo** + **React Native Testing Library** (Stage 2).
- **Do not** place test files inside `apps/mobile/app/` — Expo Router treats everything
  there as a route. Tests live here (or in co-located `*.test.tsx` outside `app/`).

See [`/docs/20_TESTING_STRATEGY.md`](../../../docs/20_TESTING_STRATEGY.md).
