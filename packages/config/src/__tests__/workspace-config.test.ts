import { describe, expect, it } from 'vitest';

import { buildPublicConfig, getAppEnv, workspaceConfigCheck } from '../index';

// Infrastructure smoke test only (INFRA-014) — exercises pure config helpers.
// NOT a product test. No env, no secrets, no SDKs, no product behavior.
describe('config layer (infrastructure smoke)', () => {
  it('exposes the workspace smoke marker', () => {
    expect(workspaceConfigCheck).toBe('workspace-ok');
  });

  it('getAppEnv falls back to "local" for unknown/empty values', () => {
    expect(getAppEnv(undefined)).toBe('local');
    expect(getAppEnv('nope')).toBe('local');
    expect(getAppEnv('staging')).toBe('staging');
    expect(getAppEnv('production')).toBe('production');
  });

  it('buildPublicConfig normalizes appEnv and fills empty strings for missing vars', () => {
    const cfg = buildPublicConfig({
      appEnv: 'production',
      supabaseUrl: undefined,
      supabaseAnonKey: undefined,
      posthogKey: undefined,
      posthogHost: undefined,
      sentryDsn: undefined,
    });

    expect(cfg.appEnv).toBe('production');
    expect(cfg.supabaseUrl).toBe('');
    expect(cfg.supabaseAnonKey).toBe('');
    expect(cfg.sentryDsn).toBe('');
  });
});
