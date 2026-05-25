import { getAppEnv } from './appEnv';
import type { PublicRuntimeConfig } from './types';

// Raw inputs that an app reader extracts from its own *_PUBLIC_* env vars.
export type PublicConfigInput = {
  appEnv: string | undefined;
  supabaseUrl: string | undefined;
  supabaseAnonKey: string | undefined;
  posthogKey: string | undefined;
  posthogHost: string | undefined;
  sentryDsn: string | undefined;
};

// Pure builder. App readers (mobile/admin) extract their own public env vars and pass the
// raw strings here. No process.env access in the shared package. Empty values are allowed
// at skeleton stage (placeholders), so this does not hard-fail.
export function buildPublicConfig(input: PublicConfigInput): PublicRuntimeConfig {
  return {
    appEnv: getAppEnv(input.appEnv),
    supabaseUrl: input.supabaseUrl ?? '',
    supabaseAnonKey: input.supabaseAnonKey ?? '',
    posthogKey: input.posthogKey ?? '',
    posthogHost: input.posthogHost ?? '',
    sentryDsn: input.sentryDsn ?? '',
  };
}
