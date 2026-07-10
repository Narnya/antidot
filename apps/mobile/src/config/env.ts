import { buildPublicConfig, type AppEnv, type PublicRuntimeConfig } from '@social-events/config';

// Mobile reads ONLY EXPO_PUBLIC_* vars — the only env Expo inlines into the client bundle.
// NO service role, NO AI keys, NO server-only vars here (Invariant: service role not on client).
// Values may be empty at skeleton stage; the config layer does not hard-fail on empties.
//
// Supabase public key naming (AUTH-001):
//   Preferred  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY  (Supabase 2024+ naming).
//   Fallback   EXPO_PUBLIC_SUPABASE_ANON_KEY         (transitional alias).
// PUBLISHABLE_KEY wins if both are set. Expo bundler requires static dot-notation
// access (`process.env.EXPO_PUBLIC_*`) — do not destructure or dynamically look up.
export const mobilePublicConfig: PublicRuntimeConfig = buildPublicConfig({
  appEnv: process.env.EXPO_PUBLIC_APP_ENV,
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey:
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  posthogKey: process.env.EXPO_PUBLIC_POSTHOG_KEY,
  posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST,
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
});

export const mobileEnv: AppEnv = mobilePublicConfig.appEnv;
