import { PlayfairDisplay_700Bold, useFonts } from '@expo-google-fonts/playfair-display';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, OnboardingPlaceholderProvider } from '../src/features/auth';
import { BetaAccessProvider } from '../src/features/beta';

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
  // Editorial serif for headlines (Warm-Green DS v2 — docs/35). Render nothing until
  // the font is ready; if it errors, render anyway (system serif fallback).
  const [fontsLoaded, fontError] = useFonts({ PlayfairDisplay_700Bold });
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <BetaAccessProvider>
          <OnboardingPlaceholderProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </OnboardingPlaceholderProvider>
        </BetaAccessProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
