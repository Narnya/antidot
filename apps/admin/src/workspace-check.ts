// Infrastructure smoke check (INFRA-012). Verifies workspace packages resolve and
// typecheck from the admin app. NOT product logic, NOT a route (lives in src/, outside app/).
// Remove/replace when real shared types and config land.
import { workspaceConfigCheck } from '@social-events/config';
import type { WorkspaceCheck } from '@social-events/types';

const check: WorkspaceCheck = { ok: true };

export const workspacePackagesConnected: boolean =
  check.ok && workspaceConfigCheck === 'workspace-ok';
