// Semantic color tokens — warm-minimal direction (light, clean, friendly, premium,
// soft, safety-forward; not romantic / not dating / not Material-default).
//
// These are infrastructure placeholders that map to Figma foundations and are subject
// to design review. Product Core overrides visual design on conflict. Nothing here may
// encode dating visuals, public ratings, or a raw/numeric trust score: the `trust.*`
// tokens style the soft "Verified" badge only, never a score.
export const colors = {
  background: {
    default: '#FAFAF7',
    subtle: '#F3F1EA',
  },
  surface: {
    default: '#FFFFFF',
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#111111',
    secondary: '#555A5F',
    muted: '#8A8F95',
    inverse: '#FFFFFF',
  },
  border: {
    default: '#E7E4DC',
    strong: '#D8D3C7',
  },
  action: {
    primary: '#111111',
    primaryText: '#FFFFFF',
    secondary: '#F3F1EA',
    destructive: '#E5484D',
  },
  status: {
    success: '#1B9A65',
    warning: '#F5A524',
    danger: '#E5484D',
    info: '#2F5BFF',
  },
  // Soft "Verified" badge only — NOT a numeric/raw trust score (Invariant 3).
  trust: {
    verifiedBg: '#EEF3FF',
    verifiedText: '#2F5BFF',
  },
  safety: {
    noticeBg: '#EEF7F2',
    noticeText: '#176B4D',
  },
  accent: {
    coral: '#FF6B4A',
    lime: '#B7FF4A',
    violet: '#7C4DFF',
    blue: '#2F5BFF',
  },
} as const;

export type Colors = typeof colors;
