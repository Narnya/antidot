# supabase/tests

RLS / integration tests for the database. **Created in a later phase, not now.**
See [`/docs/07_SECURITY_RLS.md`](../../docs/07_SECURITY_RLS.md) §30 and [`/docs/11_SPRINT_BACKLOG.md`](../../docs/11_SPRINT_BACKLOG.md) §23.

## Status

Empty placeholder folder (INFRA-001). **No tests.**

## Purpose (when implemented later)

Prove the security-critical invariants, e.g.: non-approved / pending / waitlisted / rejected users cannot read `event_locations`; only approved attendees read their event chat; raw trust score is never exposed; reports/moderation/audit are private/append-only; service role is never client-side. These must pass before any product release ([`/docs/12_IMPLEMENTATION_READINESS_REVIEW.md`](../../docs/12_IMPLEMENTATION_READINESS_REVIEW.md) §5).
