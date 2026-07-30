// Robust «back» for stack screens. `router.back()` is a no-op when the history
// stack is empty — which happens on web whenever a screen is opened directly by
// URL (deep link, refresh, a pasted link), leaving the header back-arrow dead.
// This falls back to a sensible parent route in that case so «назад» always works.
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

type Replace = ReturnType<typeof useRouter>['replace'];
type Href = Parameters<Replace>[0];

/**
 * Returns a stable «go back» callback: pops the stack if there is history,
 * otherwise replaces the route with `fallback` (default `/feed`, the primary
 * authenticated surface). Pass `/welcome` for pre-auth screens.
 */
export function useGoBack(fallback: Href = '/feed') {
  const router = useRouter();
  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallback);
    }
  }, [router, fallback]);
}
