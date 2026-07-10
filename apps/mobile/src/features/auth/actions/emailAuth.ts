// AUTH-002 — thin wrappers around Supabase Auth email/password methods.
//
// Boundary (binding):
//   - Uses ONLY the public Supabase client from AUTH-001 (anon/publishable key).
//   - Does NOT touch admin APIs, service role, profiles, RLS, migrations, or any
//     other application table.
//   - Returns a small, typed result; never throws to the UI.
import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '../../../lib/supabase/client';
import { mapAuthError, type FriendlyAuthError } from '../lib/auth';

export type EmailAuthInput = {
  email: string;
  password: string;
};

export type SignUpResult =
  | {
      ok: true;
      // Supabase returns a session when email confirmation is disabled; otherwise the
      // session is null and the user must confirm via email link first.
      session: Session | null;
      user: User | null;
      needsEmailConfirmation: boolean;
    }
  | { ok: false; error: FriendlyAuthError };

export type SignInResult =
  | { ok: true; session: Session; user: User }
  | { ok: false; error: FriendlyAuthError };

export async function signUpWithEmail(input: EmailAuthInput): Promise<SignUpResult> {
  const { email, password } = input;
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  });

  if (error) {
    return { ok: false, error: mapAuthError(error) };
  }

  return {
    ok: true,
    session: data.session,
    user: data.user,
    needsEmailConfirmation: data.session === null && data.user !== null,
  };
}

export async function signInWithEmail(input: EmailAuthInput): Promise<SignInResult> {
  const { email, password } = input;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.session || !data.user) {
    return { ok: false, error: mapAuthError(error) };
  }

  return { ok: true, session: data.session, user: data.user };
}
