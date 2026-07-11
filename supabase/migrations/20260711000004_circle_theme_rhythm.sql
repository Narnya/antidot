-- ACT / T1 — Circle theme + rhythm (for Create Circle / Circle Home).
-- Adds optional `theme` (what the circle is about) and `rhythm` (meeting cadence)
-- to groups. Mirrors the Group domain model (model.ts) and docs/32 §T1.
alter table public.groups
  add column theme text,
  add column rhythm text not null default 'weekly'
    check (rhythm in ('weekly', 'biweekly', 'monthly', 'adhoc'));
