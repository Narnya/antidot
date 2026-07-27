-- ACT / pull — slot claim extras: «+1» (bring a friend) and a short word to the
-- organizer, collected on «Занять место» (frame C) and shown to the host on «Приём в
-- круг» (frame M). Both are per-claim context, not a messaging channel — no cold DM
-- (Инв. 2). RLS is unchanged (slot_claims: self-write, member/claimant read).

alter table public.slot_claims
  add column plus_one boolean not null default false,
  add column note text check (note is null or char_length(note) <= 300);
