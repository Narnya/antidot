// BETA-001 — Pure, framework-agnostic invite-code validator.
//
// THIS IS A TEMPORARY DEV PLACEHOLDER. It is NOT real security.
//
// Why it exists:
//   - Sprint 2 cannot reach a real `invite_codes` table (DBV2 / RLSV2 land in
//     Sprint 4). To exercise the beta route gate end-to-end, we accept a small
//     set of clearly-fake codes in non-production environments only.
//
// Production safety:
//   - When `appEnv === 'production'`, EVERY code (including the placeholder
//     codes below) is rejected with `kind: 'production_disabled'`. Shipping
//     this validator to production therefore cannot grant access.
//
// Replacement plan (when DBV2/RLSV2 land):
//   - Delete this file (or turn it into a thin client that calls a server-side
//     Edge Function, e.g. `validate_invite_code`, which checks the
//     `invite_codes` table for: existence, max_uses, expires_at, revoked_at,
//     used_by, and writes audit log entries). See /docs/06 §15.1,
//     /docs/07 §22, /docs/29 §10 for the design.
import type { AppEnv } from '@social-events/config';

export type InviteValidationResult =
  | { kind: 'valid' }
  | { kind: 'empty' }
  | { kind: 'invalid' }
  | { kind: 'production_disabled' };

// DEV-ONLY placeholder codes. They are not secrets — they are intentionally
// generic, recognizable strings that cannot be confused for real invites and
// that the production branch above blocks regardless.
const DEV_PLACEHOLDER_CODES: ReadonlySet<string> = new Set(['LOCAL-BETA', 'DEV-CIRCLE']);

export function validateInviteCode(code: string, appEnv: AppEnv): InviteValidationResult {
  const trimmed = code.trim();
  if (trimmed.length === 0) {
    return { kind: 'empty' };
  }
  // Fail-safe: real validation does not exist yet, so production must never
  // accept any code via this client-side path.
  if (appEnv === 'production') {
    return { kind: 'production_disabled' };
  }
  if (DEV_PLACEHOLDER_CODES.has(trimmed.toUpperCase())) {
    return { kind: 'valid' };
  }
  return { kind: 'invalid' };
}
