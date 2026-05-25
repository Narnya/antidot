// @social-events/types — shared TypeScript types (entities, enums, lifecycle states).
// Single source of types across mobile / admin / functions (Modular Monolith).
// Use neutral technical terms (User, Event, Application, …); do not bind to the brand.
//
// INFRA-012 smoke check only (no real domain types yet): proves type consumption works
// across apps. Remove/replace when real types land.
export type WorkspaceCheck = { ok: true };
