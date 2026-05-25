// @social-events/config — shared config primitives & types.
// Context-agnostic: NO secrets and NO process.env access here. App-specific readers
// (mobile / admin) read their own env vars and use these pure helpers + types.
export * from './types';
export * from './appEnv';
export * from './publicConfig';

// INFRA-012 workspace smoke marker (temporary; see /docs/18_WORKSPACE_IMPORTS.md).
export const workspaceConfigCheck = 'workspace-ok' as const;
