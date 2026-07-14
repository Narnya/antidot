// Outline activity-kind icon (Warm-Green DS v2 — docs/35: outline, no emoji).
// Maps ActivityKind → a line icon from @expo/vector-icons (ships with Expo).
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { colors } from '@social-events/ui';

import type { ActivityKind } from '../lib/model';

type Props = { kind: ActivityKind; size?: number; color?: string };

export function KindIcon({ kind, size = 22, color = colors.text.primary }: Props) {
  switch (kind) {
    case 'football':
      return <Ionicons name="football-outline" size={size} color={color} />;
    case 'walk':
      return <Ionicons name="walk-outline" size={size} color={color} />;
    case 'coffee':
      return <Ionicons name="cafe-outline" size={size} color={color} />;
    case 'boardgames':
      return <MaterialCommunityIcons name="dice-multiple-outline" size={size} color={color} />;
    case 'run':
      return <MaterialCommunityIcons name="run" size={size} color={color} />;
    default:
      return <Ionicons name="sparkles-outline" size={size} color={color} />;
  }
}
