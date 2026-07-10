// AUTH-005 — Hook to access the auth session context.
//
// Throws a clear developer error when used outside <AuthProvider>. The error
// surface is dev-only (it never reaches end users because the missing provider
// is a configuration bug that would crash the screen at render time).
import { useContext } from 'react';

import { AuthContext, type AuthContextValue } from '../providers/AuthProvider';

export function useAuthSession(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuthSession must be used inside <AuthProvider>.');
  }
  return ctx;
}
