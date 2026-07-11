// (app) → circle/[id]. Circle Home (ACT-009).
import { useLocalSearchParams } from 'expo-router';

import { CircleHomeScreen } from '../../../src/features/activities/screens/CircleHomeScreen';

export default function CircleHome() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CircleHomeScreen circleId={id ?? ''} />;
}
