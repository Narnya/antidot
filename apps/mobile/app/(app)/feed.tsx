// (app) → feed. Renders the activities feed (объявления) — ACT-003 draft on the
// mock repository. Reachable from /home; not yet the default route.
import { FeedScreen } from '../../src/features/activities/screens/FeedScreen';

export default function Feed() {
  return <FeedScreen />;
}
