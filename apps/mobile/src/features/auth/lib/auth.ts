// AUTH-002 — auth helpers: safe Russian-facing error mapping + basic client-side validation.
//
// Russian copy follows /docs/29_AUTH_BETA_ONBOARDING_IMPLEMENTATION_PLAN.md §21 and the
// non-stigmatizing tone of /docs/09_MODERATION.md §32. Raw Supabase error details are
// NEVER returned to the user — only safe categorized messages.
import type { AuthError } from '@supabase/supabase-js';

export type AuthErrorReason =
  | 'invalid_credentials'
  | 'user_already_exists'
  | 'email_not_confirmed'
  | 'rate_limited'
  | 'network'
  | 'unknown';

export type FriendlyAuthError = {
  reason: AuthErrorReason;
  message: string;
};

// Russian-facing copy. Generic; never leaks the underlying Supabase message.
const COPY: Record<AuthErrorReason, string> = {
  invalid_credentials: 'Не удалось войти. Проверьте email и пароль.',
  user_already_exists: 'Аккаунт с этим email уже существует. Попробуйте войти.',
  email_not_confirmed: 'Проверьте почту, чтобы подтвердить аккаунт.',
  rate_limited: 'Слишком много попыток. Попробуйте позже.',
  network: 'Проблема с соединением. Попробуйте позже.',
  unknown: 'Что-то пошло не так. Попробуйте ещё раз.',
};

export function mapAuthError(error: AuthError | Error | null | undefined): FriendlyAuthError {
  if (!error) {
    return { reason: 'unknown', message: COPY.unknown };
  }

  // Supabase AuthError exposes `status` and `message`. We branch on those defensively
  // without trusting the raw text in user-facing copy.
  const status = (error as AuthError).status;
  const rawMessage = (error.message ?? '').toLowerCase();

  if (status === 400 && rawMessage.includes('invalid login')) {
    return { reason: 'invalid_credentials', message: COPY.invalid_credentials };
  }
  if (rawMessage.includes('already registered') || rawMessage.includes('already exists')) {
    return { reason: 'user_already_exists', message: COPY.user_already_exists };
  }
  if (rawMessage.includes('email not confirmed') || rawMessage.includes('confirm your email')) {
    return { reason: 'email_not_confirmed', message: COPY.email_not_confirmed };
  }
  if (status === 429 || rawMessage.includes('rate')) {
    return { reason: 'rate_limited', message: COPY.rate_limited };
  }
  if (rawMessage.includes('network') || rawMessage.includes('fetch')) {
    return { reason: 'network', message: COPY.network };
  }
  return { reason: 'unknown', message: COPY.unknown };
}

// Basic client-side validation. Supabase remains the source of truth for the actual
// policy (format, password strength, deliverability); these checks only catch obvious
// empty / malformed input before a round-trip.
export function isValidEmail(value: string): boolean {
  // Permissive: trims and checks for "x@y.z" shape. RFC-strict is left to Supabase.
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 320) return false;
  return /^\S+@\S+\.\S+$/.test(trimmed);
}

export function isNonEmptyPassword(value: string): boolean {
  // Length policy lives server-side (Supabase project settings). We only block empty.
  return value.length > 0;
}
