// (app) → activity/[id]. Renders the activity detail (ACT-004) for the tapped
// feed card, on the mock repository.
import { useLocalSearchParams } from 'expo-router';

import { ActivityDetailScreen } from '../../../src/features/activities/screens/ActivityDetailScreen';

export default function ActivityDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ActivityDetailScreen activityId={id ?? ''} />;
}
