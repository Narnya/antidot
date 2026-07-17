// Typography tokens — React Native-friendly (Warm-Green DS v2, docs/35), pixel-matched
// to the approved mockups (mockups/*.html):
//   - Headlines use Playfair Display (editorial serif) — 600 SemiBold by default,
//     500 Medium for the Welcome accent.
//   - All body / interface text uses Inter (400 / 500 / 600).
// The weight is baked into the font-family name (each @expo-google-fonts weight is a
// separate family), so tokens set `fontFamily` and NOT `fontWeight` — mixing the two
// makes RN synthesize a faux weight. The app root loads every family via useFonts();
// if loading errors, RN falls back to the system serif/sans and nothing breaks.

// Font family keys registered by the app's useFonts() call.
export const PLAYFAIR_FAMILY = 'PlayfairDisplay_600SemiBold'; // headline default (600)
export const PLAYFAIR_MEDIUM = 'PlayfairDisplay_500Medium'; // Welcome accent (500)
export const PLAYFAIR_BOLD = 'PlayfairDisplay_700Bold';
export const INTER_REGULAR = 'Inter_400Regular';
export const INTER_MEDIUM = 'Inter_500Medium';
export const INTER_SEMIBOLD = 'Inter_600SemiBold';

export const typography = {
  display: { fontSize: 40, lineHeight: 46, letterSpacing: -0.8, fontFamily: PLAYFAIR_FAMILY },
  title: { fontSize: 28, lineHeight: 36, fontFamily: PLAYFAIR_FAMILY },
  heading: { fontSize: 22, lineHeight: 28, fontFamily: PLAYFAIR_FAMILY },
  section: { fontSize: 18, lineHeight: 24, fontFamily: INTER_SEMIBOLD },
  body: { fontSize: 16, lineHeight: 24, fontFamily: INTER_REGULAR },
  bodyMedium: { fontSize: 16, lineHeight: 24, fontFamily: INTER_MEDIUM },
  caption: { fontSize: 13, lineHeight: 18, fontFamily: INTER_REGULAR },
  button: { fontSize: 16, lineHeight: 20, fontFamily: INTER_SEMIBOLD },
  badge: { fontSize: 13, lineHeight: 18, fontFamily: INTER_SEMIBOLD },
} as const;

export type Typography = typeof typography;
