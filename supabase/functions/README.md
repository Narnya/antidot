# supabase/functions

Supabase Edge Functions — server-authoritative handlers for **sensitive** operations (apply, approve/reject, report, block, moderation, trust updates, invite validation). **Created in a later phase, not now.**
See [`/docs/05_ARCHITECTURE.md`](../../docs/05_ARCHITECTURE.md) §8.3 and [`/docs/07_SECURITY_RLS.md`](../../docs/07_SECURITY_RLS.md) §24.

## Status

Empty placeholder folder (INFRA-001). **No functions.**

## Gate

Business logic / enforcement is **Still NOT allowed** in the current phase ([`/docs/16_PHASE_GATE_TO_INFRASTRUCTURE.md`](../../docs/16_PHASE_GATE_TO_INFRASTRUCTURE.md) §4).

When implemented (later): actor identity comes from the auth context (never client-provided), every moderation-sensitive action writes an audit log (Invariant 4), and AI is assistive only — never the final judge (Invariant 5). No separate backend services — Edge Functions live inside this monolith.
