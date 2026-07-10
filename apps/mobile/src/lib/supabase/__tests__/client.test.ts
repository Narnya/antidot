// AUTH-001 smoke test for the Supabase mobile client wrapper.
// Runs under Vitest (Node environment, not React Native). The wrapper depends on
// React Native runtime APIs (`AppState`, `Platform`), so we mock them along with
// the SDK to ensure module import succeeds and `isSupabaseConfigured` is false at
// the current skeleton stage (empty env).
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native-url-polyfill/auto', () => ({}));
vi.mock('@react-native-async-storage/async-storage', () => ({ default: {} }));
vi.mock('react-native', () => ({
  AppState: { addEventListener: vi.fn() },
  Platform: { OS: 'ios' },
}));
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: { startAutoRefresh: vi.fn(), stopAutoRefresh: vi.fn() },
  })),
  processLock: vi.fn(),
}));

// __DEV__ global is provided at runtime by React Native; declare for Node test env.
(globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;

// Static import — vi.mock above is hoisted by Vitest before this import resolves.
// NOTE: this file is currently NOT executed by `pnpm test` because vitest.config.ts
// scopes runs to packages/** only. Mobile tests will be picked up once jest-expo
// is wired (see /docs/20_TESTING_STRATEGY.md). The test stays for typecheck
// coverage and as intent documentation for the future runner.
import * as supabaseModule from '../client';

describe('supabase mobile client (AUTH-001)', () => {
  it('imports without throwing when env is empty (skeleton stage)', () => {
    expect(supabaseModule).toBeDefined();
  });

  it('exposes isSupabaseConfigured === false when env is empty', () => {
    expect(supabaseModule.isSupabaseConfigured).toBe(false);
  });

  it('exposes a supabase client object', () => {
    expect(supabaseModule.supabase).toBeDefined();
  });
});
