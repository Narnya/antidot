import 'server-only';

import { getAppEnv, type AdminServerConfig, type AppEnv } from '@social-events/config';

// ⚠️ SERVER-ONLY. Do NOT import this file from a client component.
// `import 'server-only'` makes the build FAIL if this module is pulled into a client bundle.
//
// SUPABASE_SERVICE_ROLE_KEY bypasses RLS and is server-side only (Invariant: service role
// not on client). No service-role Supabase client is created here (INFRA-013) and no
// external API is called. Values may be empty at skeleton stage.
export const adminServerConfig: AdminServerConfig = {
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  adminAllowedEmails: (process.env.ADMIN_ALLOWED_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean),
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
};

export const adminServerEnv: AppEnv = getAppEnv(process.env.APP_ENV);
