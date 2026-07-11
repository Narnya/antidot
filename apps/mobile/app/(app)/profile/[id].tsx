// (app) → profile/[id]. Public Safe Profile of another user (ACT/T4).
import { useLocalSearchParams } from 'expo-router';

import { ProfileScreen } from '../../../src/features/activities/screens/ProfileScreen';

export default function PublicProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProfileScreen profileUserId={id ?? ''} />;
}
