// Typography tokens — React Native-friendly (Warm-Green DS v2, docs/35).
//
// Editorial serif for headlines: `display` / `title` / `heading` use Playfair Display
// (`PLAYFAIR_FAMILY`), loaded by the app root via expo-font (@expo-google-fonts). Body
// / interface styles stay on the system sans (Inter intended). If the font isn't loaded,
// RN falls back to the system serif/sans — nothing breaks. fontWeight uses RN-compatible
// string values; letterSpacing set only where specified.

/** Font family key registered by the app's useFonts() call. */
export const PLAYFAIR_FAMILY = 'PlayfairDisplay_700Bold';

export const typography = {
  display: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '700',
    letterSpacing: -0.8,
    fontFamily: PLAYFAIR_FAMILY,
  },
  title: { fontSize: 28, lineHeight: 36, fontWeight: '700', fontFamily: PLAYFAIR_FAMILY },
  heading: { fontSize: 22, lineHeight: 28, fontWeight: '700', fontFamily: PLAYFAIR_FAMILY },
  section: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  button: { fontSize: 16, lineHeight: 20, fontWeight: '600' },
  badge: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
} as const;

export type Typography = typeof typography;
