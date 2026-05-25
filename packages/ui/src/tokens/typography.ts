// Typography tokens — React Native-friendly.
//
// fontFamily is intentionally omitted here: "Inter" is the intended family, loaded
// later (no font files are committed). fontWeight uses RN-compatible string values;
// the originally-specified 650 weights are mapped to "700" (heading) and "600"
// (section/button) because React Native has no 650. letterSpacing is set only where
// specified.
export const typography = {
  display: { fontSize: 40, lineHeight: 44, fontWeight: '800', letterSpacing: -0.8 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  heading: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  section: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  button: { fontSize: 16, lineHeight: 20, fontWeight: '600' },
  badge: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
} as const;

export type Typography = typeof typography;
