// Design tokens barrel — INFRA-009. Semantic, framework-agnostic constants.
// No components, no React/RN dependency. Maps to Figma foundations; Product Core wins on conflict.
export * from './colors';
export * from './spacing';
export * from './radius';
export * from './typography';
export * from './shadows';
export * from './zIndex';

import { colors } from './colors';
import { spacing } from './spacing';
import { radius } from './radius';
import { typography } from './typography';
import { shadows } from './shadows';
import { zIndex } from './zIndex';

/** Single aggregate of all token groups. */
export const tokens = {
  colors,
  spacing,
  radius,
  typography,
  shadows,
  zIndex,
} as const;

export type Tokens = typeof tokens;
