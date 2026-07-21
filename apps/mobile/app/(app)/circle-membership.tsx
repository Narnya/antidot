// (app) → circle-membership. The «Участие в круге» pause/leave sheet (frame F),
// presented as a transparent modal over Circle Home.
import { useLocalSearchParams } from 'expo-router';

import { CircleMembershipScreen } from '../../src/features/activities/screens/CircleMembershipScreen';

export default function CircleMembership() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  return <CircleMembershipScreen circleId={id ?? ''} circleName={name ?? ''} />;
}
