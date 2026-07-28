-- ACT / P1 — circle chat read receipts. Track each member's last-read moment on
-- their membership row (no new table → reuses group_memberships RLS: a member may
-- UPDATE their own row and SELECT co-members' rows). A sender's own message shows
-- «прочитано» once any OTHER active member has read past it. Benign group signal —
-- no «read at HH:MM by name», no membership-transition leak (Инв. 11–12).

alter table public.group_memberships
  add column chat_last_read_at timestamptz;
