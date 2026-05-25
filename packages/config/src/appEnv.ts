import type { AppEnv } from './types';

export const APP_ENVS = ['local', 'staging', 'production'] as const;

export function isAppEnv(value: unknown): value is AppEnv {
  return typeof value === 'string' && (APP_ENVS as readonly string[]).includes(value);
}

// Pure helper. Callers pass their own raw env value — there is NO process.env access in
// this shared package (avoids mixing mobile / admin / server contexts). Falls back to 'local'.
export function getAppEnv(raw: string | undefined): AppEnv {
  return isAppEnv(raw) ? raw : 'local';
}
