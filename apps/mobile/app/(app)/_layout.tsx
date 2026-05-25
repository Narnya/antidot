import { Stack } from 'expo-router';

// (app) — future authenticated app tabs. Placeholder navigator only (no tabs/auth yet).
export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
