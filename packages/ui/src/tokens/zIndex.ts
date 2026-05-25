// Layering scale for overlays. Generic; no product semantics encoded.
export const zIndex = {
  base: 0,
  raised: 10,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  toast: 1400,
} as const;

export type ZIndex = typeof zIndex;
