import { Stack } from 'expo-router';

// (modals) — future apply / report / block modals. Placeholder navigator only.
export default function ModalsLayout() {
  return <Stack screenOptions={{ presentation: 'modal' }} />;
}
