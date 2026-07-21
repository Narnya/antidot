// AUTH — passwordless email OTP + social sign-in wrappers (design-v2 auth model:
// «без паролей»). Thin wrappers over the PUBLIC Supabase client only — no admin
// APIs, service role, or app tables. In mock/preview mode (no Supabase configured)
// they no-op successfully so the OTP UI can be walked through offline.
import { isSupabaseConfigured, supabase } from '../../../lib/supabase/client';
import { mapAuthError, type FriendlyAuthError } from '../lib/auth';

export type OtpResult = { ok: true } | { ok: false; error: FriendlyAuthError };

/** Send a one-time login code to the email (Supabase emails an OTP + magic link). */
export async function sendEmailCode(email: string): Promise<OtpResult> {
  if (!isSupabaseConfigured) return { ok: true };
  const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
  return error ? { ok: false, error: mapAuthError(error) } : { ok: true };
}

/** Verify the code the user typed; on success the session is set by the SDK. */
export async function verifyEmailCode(email: string, token: string): Promise<OtpResult> {
  if (!isSupabaseConfigured) return { ok: true };
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: token.trim(),
    type: 'email',
  });
  return error ? { ok: false, error: mapAuthError(error) } : { ok: true };
}

/** Continue with a social provider (opens the provider flow / redirect). */
export async function signInWithProvider(provider: 'apple' | 'google'): Promise<OtpResult> {
  if (!isSupabaseConfigured) return { ok: true };
  const { error } = await supabase.auth.signInWithOAuth({ provider });
  return error ? { ok: false, error: mapAuthError(error) } : { ok: true };
}
