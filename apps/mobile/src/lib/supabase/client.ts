// AUTH-001 — Supabase public client wrapper for the Expo mobile app.
//
// Safety boundary (binding — CLAUDE.md §2, /docs/07_SECURITY_RLS.md §6,
// /docs/19_ENV_CONFIG_STRATEGY.md §4):
//   - Mobile reads ONLY EXPO_PUBLIC_* env vars.
//   - SUPABASE_SERVICE_ROLE_KEY is SERVER-ONLY (admin app's serverEnv.ts).
//     It must NEVER be imported, read, or shipped from this file or any
//     other file under apps/mobile.
//   - This wrapper exposes only the anon/publishable client; it has no
//     admin-level capabilities.
//
// Skeleton-phase behavior:
//   - If EXPO_PUBLIC_SUPABASE_URL / PUBLISHABLE_KEY are unset (placeholder
//     stage), the client is still created against an invalid placeholder URL
//     so module-import does not throw and `pnpm typecheck` / `pnpm test` pass.
//   - `isSupabaseConfigured` exports whether real env values are present;
//     consumers (auth screens in later tickets) should branch on it.
//   - Network calls against the placeholder URL will fail at runtime —
//     correct behavior until a real Supabase project is configured.
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { mobilePublicConfig } from '../../config/env';

// Sentinel placeholders used when env is empty at skeleton stage.
// `.invalid` (RFC 2606) is guaranteed non-resolvable — cannot be mistaken
// for a real Supabase project URL. The key string is plainly marked.
const PLACEHOLDER_SUPABASE_URL = 'https://placeholder.invalid';
const PLACEHOLDER_SUPABASE_KEY = 'placeholder-publishable-key-not-real';

const configuredUrl = mobilePublicConfig.supabaseUrl;
const configuredKey = mobilePublicConfig.supabaseAnonKey;

export const isSupabaseConfigured: boolean = configuredUrl.length > 0 && configuredKey.length > 0;

if (!isSupabaseConfigured && __DEV__) {
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or ANON_KEY) ' +
      'are not set. The Supabase client is initialized with placeholders and runtime calls ' +
      'will fail until real values are configured. See /docs/29 §7 and /docs/19 §4.',
  );
}

export const supabase = createClient(
  isSupabaseConfigured ? configuredUrl : PLACEHOLDER_SUPABASE_URL,
  isSupabaseConfigured ? configuredKey : PLACEHOLDER_SUPABASE_KEY,
  {
    auth: {
      // Persist sessions across app restarts (AUTH-005 will build on this).
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // Mobile app does not use URL-based OAuth callback parsing at this stage;
      // OAuth (AUTH-003 / AUTH-004) will configure deep-link handling separately.
      detectSessionInUrl: false,
      // processLock prevents concurrent refresh races across multiple instances /
      // background fetches on native (Supabase recommended for React Native).
      lock: processLock,
    },
  },
);

// AppState listener — start/stop auto-refresh on native foreground/background.
// Guarded against double-registration when the module is re-imported under HMR /
// Fast Refresh.
type AppStateHandler = (state: string) => void;

declare global {
  var __SUPABASE_APP_STATE_REGISTERED__: boolean | undefined;
}

if (Platform.OS !== 'web' && !globalThis.__SUPABASE_APP_STATE_REGISTERED__) {
  const handler: AppStateHandler = (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  };
  AppState.addEventListener('change', handler);
  globalThis.__SUPABASE_APP_STATE_REGISTERED__ = true;
}
