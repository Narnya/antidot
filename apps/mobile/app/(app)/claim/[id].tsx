// (app) → claim/[id]. «Занять место» — the dedicated claim step (mockup frame C).
import { useLocalSearchParams } from 'expo-router';

import { ClaimSlotScreen } from '../../../src/features/activities/screens/ClaimSlotScreen';

export default function ClaimSlot() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ClaimSlotScreen activityId={id ?? ''} />;
}
