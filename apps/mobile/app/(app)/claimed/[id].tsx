// (app) → claimed/[id]. «Место за тобой» — claim success + reveal (mockup frame N).
import { useLocalSearchParams } from 'expo-router';

import { ClaimSuccessScreen } from '../../../src/features/activities/screens/ClaimSuccessScreen';

export default function Claimed() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ClaimSuccessScreen activityId={id ?? ''} />;
}
