// (app) → chat/[id]. «Чат круга» — member-only circle group chat (mockup frame L).
import { useLocalSearchParams } from 'expo-router';

import { CircleChatScreen } from '../../../src/features/activities/screens/CircleChatScreen';

export default function CircleChat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <CircleChatScreen circleId={id ?? ''} />;
}
