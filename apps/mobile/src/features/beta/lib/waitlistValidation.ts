// BETA-002 — Pure validator for the waitlist form.
//
// Email validation is intentionally permissive (trim + "x@y.z" shape). The
// server / Edge Function that will eventually own this (Sprint 4+) is the
// authoritative source for format and deliverability checks.
//
// Optional `name` and `city` are trimmed; empty values are dropped from the
// validated payload so the placeholder submit handler does not receive empty
// strings (which would be a poor input shape for the future real handler).
//
// Privacy boundary (binding):
//   - `city` is a single-line free-text field for "город или район". It is NOT
//     an address, NOT a geolocation, NOT a coordinate. Mobile must never
//     collect exact user location (Inv. 9 / /docs/00 §35).
//   - This validator returns sanitized strings only — it does not log, persist,
//     or transmit them anywhere.

export type WaitlistFormValues = {
  email: string;
  name: string;
  city: string;
};

export type WaitlistInput = {
  email: string;
  name?: string;
  city?: string;
};

export type WaitlistValidationResult =
  | { kind: 'valid'; values: WaitlistInput }
  | { kind: 'empty_email' }
  | { kind: 'invalid_email' };

export function validateWaitlistInput(form: WaitlistFormValues): WaitlistValidationResult {
  const email = form.email.trim();
  if (email.length === 0) {
    return { kind: 'empty_email' };
  }
  // Permissive shape check — Supabase / real waitlist endpoint will own the
  // real validation later. RFC-strict checks are explicitly NOT a goal here.
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 320) {
    return { kind: 'invalid_email' };
  }

  const trimmedName = form.name.trim();
  const trimmedCity = form.city.trim();

  const values: WaitlistInput = { email };
  if (trimmedName.length > 0) {
    values.name = trimmedName;
  }
  if (trimmedCity.length > 0) {
    values.city = trimmedCity;
  }
  return { kind: 'valid', values };
}
