// (proto) — DEV PREVIEW group. Ungated on purpose: it renders the activity-first
// prototype (ACT-003…006) on mock data so the flow can be felt without a real
// Supabase session / auth. NOT for production — these routes move under the (app)
// gate once real auth + data land. Reachable from the root "/" shell.
import { Stack } from 'expo-router';

export default function PreviewLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
