// BETA-001 — Beta access state provider (DEV PLACEHOLDER).
//
// Persists ONLY a boolean `hasBetaAccess` flag to AsyncStorage. The entered
// invite code itself is NEVER persisted, never logged, never sent anywhere.
//
// EXPLICIT BOUNDARIES (binding — read before touching):
//   - Local persistence (AsyncStorage) is UX convenience for dev/test only.
//     It is NOT a security gate.
//   - Real beta access enforcement must come from a server-side check against
//     an `invite_codes` table (Schema v2 §15.1) behind RLS (RLS v2 §22) and
//     ideally validated by an Edge Function. See /docs/29 §10–§11.
//   - This file MUST be deleted (or turned into a thin client over the real
//     server-side state) once the real backend lands in Sprint 4+.
//   - Storage key is deliberately namespaced with `dev_` so its origin and
//     placeholder status are visible to anyone inspecting on-device storage.
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = '@antidot/dev_beta_access_granted_v1';

export type BetaAccessContextValue = {
  /** DEV placeholder flag — replace with server-side check in Sprint 4+. */
  hasBetaAccess: boolean;
  /** True until the initial AsyncStorage read resolves on mount. */
  isLoading: boolean;
  grantBetaAccess: () => Promise<void>;
  revokeBetaAccess: () => Promise<void>;
};

const BetaAccessContext = createContext<BetaAccessContextValue | null>(null);

type BetaAccessProviderProps = {
  children: ReactNode;
};

export function BetaAccessProvider({ children }: BetaAccessProviderProps) {
  const [hasBetaAccess, setHasBetaAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled) {
          setHasBetaAccess(stored === 'true');
        }
      } catch {
        // Storage read failures are non-fatal: treat as "no beta access" so
        // the gate falls back to the invite screen. We deliberately do not
        // log the error to avoid leaking storage internals.
        if (!cancelled) {
          setHasBetaAccess(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const grantBetaAccess = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // If persistence fails we still grant in-memory access so the dev flow
      // works; restart will require re-entering the placeholder code.
    }
    setHasBetaAccess(true);
  }, []);

  const revokeBetaAccess = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // Non-fatal; clear in-memory anyway.
    }
    setHasBetaAccess(false);
  }, []);

  const value = useMemo<BetaAccessContextValue>(
    () => ({ hasBetaAccess, isLoading, grantBetaAccess, revokeBetaAccess }),
    [hasBetaAccess, isLoading, grantBetaAccess, revokeBetaAccess],
  );

  return <BetaAccessContext.Provider value={value}>{children}</BetaAccessContext.Provider>;
}

export function useBetaAccess(): BetaAccessContextValue {
  const ctx = useContext(BetaAccessContext);
  if (ctx === null) {
    throw new Error('useBetaAccess must be used inside <BetaAccessProvider>.');
  }
  return ctx;
}
