-- ACT — notifications realtime. Broadcast INSERTs so the bell badge updates live
-- (like circle chat). RLS on notifications (recipient-only SELECT) is enforced on the
-- realtime stream too, so a user only ever receives their OWN notifications.

alter publication supabase_realtime add table public.notifications;
