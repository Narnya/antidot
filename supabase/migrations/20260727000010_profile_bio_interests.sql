-- ACT / T4 — profile safe fields: «О себе» (bio) + interest chips (interests).
-- Source of truth: /docs/32 frames 11 (self) / 03 (onboarding). These are DISPLAY
-- fields on the own / Public Safe Profile — NOT a searchable/filterable index of
-- people (no people marketplace — Инв. 13). RLS is unchanged: profiles stay readable
-- by any authenticated user (safe fields only) and writable only by their owner.

alter table public.profiles
  add column bio text check (bio is null or char_length(bio) <= 400),
  add column interests text[] not null default '{}';

-- No index on interests: they are shown, never queried to discover people (Инв. 13).
