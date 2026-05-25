// Shared config types. No runtime, no secrets, no process.env access.

export type AppEnv = 'local' | 'staging' | 'production';

// Public, client-safe runtime config — same logical shape for mobile and admin.
// Contains only values that are safe to ship in a client bundle.
export type PublicRuntimeConfig = {
  appEnv: AppEnv;
  supabaseUrl: string;
  supabaseAnonKey: string;
  posthogKey: string;
  posthogHost: string;
  sentryDsn: string;
};

// Admin SERVER-ONLY config shape. Never sent to a client bundle.
export type AdminServerConfig = {
  supabaseServiceRoleKey: string;
  adminAllowedEmails: string[];
  openaiApiKey: string;
  anthropicApiKey: string;
};
