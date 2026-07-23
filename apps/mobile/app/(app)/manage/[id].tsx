// (app) → manage/[id]. «Приём в круг · хост» — host management for one activity
// (accept overflow guests + attendance), mockup frame M.
import { useLocalSearchParams } from 'expo-router';

import { ManageActivityScreen } from '../../../src/features/activities/screens/ManageActivityScreen';

export default function Manage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ManageActivityScreen activityId={id ?? ''} />;
}
