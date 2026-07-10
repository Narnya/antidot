// BETA-002 — TEMPORARY DEV PLACEHOLDER for the waitlist submission handler.
//
// What this does:
//   - Accepts the sanitized waitlist payload.
//   - Waits a brief tick to make the UX feel real.
//   - Returns `{ ok: true }` unconditionally.
//
// What this does NOT do (binding — read before touching):
//   - No network call.
//   - No Supabase write (the `waitlist_entries` table does not exist yet).
//   - No AsyncStorage / SecureStore persistence of email/name/city.
//   - No email send / SMTP / marketing automation.
//   - No logging of the payload contents — privacy boundary.
//
// Replacement plan (when DBV2 / RLSV2 land in Sprint 4+):
//   - Replace with a thin client over a server-side Edge Function (e.g.,
//     `submit_waitlist_entry`) that inserts a row into the `waitlist_entries`
//     table (Schema v2 §15.2) behind RLS (RLS v2 §22). The server is the
//     authoritative source for:
//       * rate limiting (anti-spam);
//       * duplicate-email handling;
//       * city/community normalization;
//       * source tracking;
//       * audit logging;
//       * eventual admin export / review;
//       * invite-conversion workflow when access opens up.
//   - See /docs/29 §11 for the design plan and /docs/06 §15.2 for the table.
import type { WaitlistInput } from './waitlistValidation';

export type WaitlistSubmissionResult = { ok: true } | { ok: false; message: string };

export async function submitWaitlistPlaceholder(
  input: WaitlistInput,
): Promise<WaitlistSubmissionResult> {
  // `input` is intentionally unused in this placeholder; the real handler
  // (Edge Function over `waitlist_entries`) will consume it in Sprint 4+.
  // Reference it explicitly so lint / typecheck stay quiet without weakening
  // the no-unused-vars rule for the rest of the codebase.
  void input;
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 100);
  });
  return { ok: true };
}
