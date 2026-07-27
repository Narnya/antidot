// Shared unread-notification count for the bell tab badge. A tiny context so the
// tab layout (which renders the badge) and the notifications screen (which marks
// them read) stay in sync without a global store. Fetches from the repo; the screen
// calls refresh() after markNotificationsRead so the badge clears.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { useActivitiesRepo } from './useActivitiesRepo';

type UnreadCtx = { count: number; refresh: () => void };

const Ctx = createContext<UnreadCtx>({ count: 0, refresh: () => {} });

export function UnreadNotificationsProvider({ children }: { children: ReactNode }) {
  const { repo, userId } = useActivitiesRepo();
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    void (async () => {
      try {
        setCount(await repo.unreadNotificationCount(userId));
      } catch {
        // ignore transient errors — the badge is non-critical
      }
    })();
  }, [repo, userId]);

  useEffect(() => {
    refresh();
    // Realtime: a new notification bumps the badge live (no-op on mock).
    const unsubscribe = repo.subscribeNotifications(userId, refresh);
    return unsubscribe;
  }, [refresh, repo, userId]);

  return <Ctx.Provider value={{ count, refresh }}>{children}</Ctx.Provider>;
}

export function useUnreadNotifications(): UnreadCtx {
  return useContext(Ctx);
}
