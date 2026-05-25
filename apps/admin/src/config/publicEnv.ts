import { buildPublicConfig, type AppEnv, type PublicRuntimeConfig } from '@social-events/config';

// Browser-safe config. NEXT_PUBLIC_* only — the vars Next inlines into the client build.
// Safe to import from client or server components. No secrets here.
export const adminPublicConfig: PublicRuntimeConfig = buildPublicConfig({
  appEnv: process.env.NEXT_PUBLIC_APP_ENV,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
});

export const adminEnv: AppEnv = adminPublicConfig.appEnv;
