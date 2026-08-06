import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
  useFonts,
} from '@expo-google-fonts/playfair-display';
import { Stack } from 'expo-router';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import { AuthProvider, OnboardingPlaceholderProvider } from '../src/features/auth';
import { BetaAccessProvider } from '../src/features/beta';

// Dev preview only: this is a phone-shaped app. On web (desktop browser) the app
// would otherwise stretch edge-to-edge and look nothing like the phone-framed
// mockups, so we constrain it to a centered ~phone-width column on a warm canvas
// AND inject phone-like safe-area insets (a real browser reports 0, which pulls
// content up under where a status bar / home indicator would be). Together this
// makes the web preview match a real device — and the approved mockups, whose
// spacing bakes in the status-bar zone. On real devices (iOS/Android) this whole
// component is a no-op — the app fills the screen and uses the real insets.
// Match the mockups' `.screen { max-width: 480px }` exactly, so the app is
// responsive-identical to the HTML mockups (same width + 100vh height → same
// cover-crop of the hero photo → the person sits the same relative to the CTA).
const PHONE_WIDTH = 480;
const PHONE_HEIGHT = 920;
// Mirror the mockups' browser environment: a status-bar zone up top (47), but no
// home-indicator inset at the bottom (the static HTML mockups render at
// env(safe-area-inset)=0). Screens add their own bottom spacing via the DS formula
// max(base, insets.bottom + n), which resolves correctly on real devices.
const WEB_INSETS = { top: 47, left: 0, right: 0, bottom: 0 };
const WEB_FRAME = { x: 0, y: 0, width: PHONE_WIDTH, height: PHONE_HEIGHT };
// Above this viewport width we're on a desktop browser → show the simulated phone
// frame (mockup parity). At or below it we're effectively on a phone (real mobile
// Safari/Chrome, ≤~430px CSS) → behave like a native device: fill the screen and use
// the browser's REAL safe-area insets, no simulated 480px frame / 47px status band.
const MOBILE_WEB_MAX = 520;
function PhoneFrame({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  if (Platform.OS !== 'web' || width <= MOBILE_WEB_MAX) return <>{children}</>;
  return (
    <View style={frameStyles.canvas}>
      <View style={frameStyles.device}>
        <SafeAreaFrameContext.Provider value={WEB_FRAME}>
          <SafeAreaInsetsContext.Provider value={WEB_INSETS}>{children}</SafeAreaInsetsContext.Provider>
        </SafeAreaFrameContext.Provider>
      </View>
    </View>
  );
}
const frameStyles = StyleSheet.create({
  canvas: { flex: 1, alignItems: 'center', backgroundColor: '#E7E0D2' },
  device: { flex: 1, width: '100%', maxWidth: PHONE_WIDTH, overflow: 'hidden', backgroundColor: '#F7F5EF' },
});

// Root layout.
//   - AuthProvider (AUTH-005) loads the current Supabase session and subscribes
//     to auth state changes for all child routes.
//   - BetaAccessProvider (BETA-001) reads a DEV-ONLY placeholder `hasBetaAccess`
//     flag from AsyncStorage. It is NOT a real beta gate — see the provider
//     file for the binding boundaries.
//   - OnboardingPlaceholderProvider (AUTH-007) holds a DEV-ONLY in-memory flag
//     used by route gates to simulate onboarding completion. Also NOT a real
//     source of truth.
// Real beta and onboarding sources of truth will layer on top once Schema v2 /
// RLS v2 land in Sprint 4 (DBV2-004 / DBV2-006, RLSV2-001…003).
export default function RootLayout() {
  // Type system (Warm-Green DS v2 — docs/35, pixel-matched to mockups): editorial
  // Playfair Display serif for headlines (500/600/700) + Inter for all body/UI text.
  // Render nothing until fonts are ready; if loading errors, render anyway (system
  // fallback) so the app never hard-blocks on a font.
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <BetaAccessProvider>
          <OnboardingPlaceholderProvider>
            <PhoneFrame>
              <Stack screenOptions={{ headerShown: false }} />
            </PhoneFrame>
          </OnboardingPlaceholderProvider>
        </BetaAccessProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
