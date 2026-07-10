// ACT-008 — gives screens the right repository and the effective user id.
// Repo: live Supabase when configured, else the in-memory mock (selector).
// User: the authenticated session user; falls back to the mock user only in
// mock mode (no real Supabase), so the (proto) preview keeps working offline.
import { useAuthSession } from '../../auth';
import { getActivitiesRepository } from '../data/getRepository';
import { MOCK_USER_ID } from '../data/mockRepository';
import type { ActivitiesRepository } from '../data/repository';
import type { Id } from '../lib/model';

export function useActivitiesRepo(): { repo: ActivitiesRepository; userId: Id } {
  const { user } = useAuthSession();
  const repo = getActivitiesRepository();
  const userId: Id = user?.id ?? MOCK_USER_ID;
  return { repo, userId };
}
