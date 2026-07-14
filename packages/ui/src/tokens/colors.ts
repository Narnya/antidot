// Semantic color tokens — "Warm-Green" direction (docs/35_DESIGN_SYSTEM_V2_WARM_GREEN.md):
// calm, premium, editorial, warm, trustworthy. Green = product (actions, trust, CTA,
// membership); coral = brand only (never the main app color). Supersedes the earlier
// "Urban Air" (black primary) palette.
//
// Product Core overrides visual design on conflict. Nothing here may encode dating
// visuals, public ratings, or a raw/numeric trust score: the `trust.*` tokens style the
// soft "Проверен" badge only, never a score (Invariant 3).
export const colors = {
  background: {
    default: '#F7F5EF', // warm ivory
    subtle: '#EFE9DE',
  },
  surface: {
    default: '#FFFDF9', // cards
    elevated: '#FFFDF9',
  },
  text: {
    primary: '#15130F',
    secondary: '#68645C',
    muted: '#9A938A',
    inverse: '#FFFDF9', // on green
  },
  border: {
    default: '#E8DDCF', // warm hairline
    strong: '#D9CBB8',
  },
  action: {
    primary: '#18392D', // green — product
    primaryText: '#FFFDF9',
    secondary: '#EFE9DE', // warm secondary button bg
    destructive: '#C0402E',
  },
  status: {
    success: '#2E6B4F',
    warning: '#C8892F',
    danger: '#C0402E',
    info: '#18392D',
  },
  // Soft "Проверен" badge only — green = trust — NOT a numeric/raw trust score (Invariant 3).
  trust: {
    verifiedBg: '#DCEAD8',
    verifiedText: '#18392D',
  },
  // "Точное место скрыто до записи" notice — calm, not error (Invariant 1).
  safety: {
    noticeBg: '#DCEAD8',
    noticeText: '#18392D',
  },
  accent: {
    coral: '#F05A3A', // brand accent only
    lime: '#B7FF4A',
    violet: '#7C4DFF',
    blue: '#2F5BFF',
  },
} as const;

export type Colors = typeof colors;
