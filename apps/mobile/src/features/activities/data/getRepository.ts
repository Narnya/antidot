// ACT-007 — repository selector. Uses the live Supabase repository when the
// client is configured (real EXPO_PUBLIC_SUPABASE_* env), else the in-memory
// mock. Screens depend on this, not on a concrete implementation.
import { isSupabaseConfigured } from '../../../lib/supabase/client';

import { mockActivitiesRepository } from './mockRepository';
import type { ActivitiesRepository } from './repository';
import { supabaseActivitiesRepository } from './supabaseRepository';

export function getActivitiesRepository(): ActivitiesRepository {
  return isSupabaseConfigured ? supabaseActivitiesRepository : mockActivitiesRepository;
}
