// Per-kind hero images (Warm-Green DS v2, docs/35 §6). Temporary CC-licensed
// stock — replace with curated/licensed photography before launch. A per-activity
// photo (image_url) can override these later.
import type { ActivityKind } from './model';

import football from '../../../../assets/images/activity-football.jpg';
import walk from '../../../../assets/images/activity-walk.jpg';
import boardgames from '../../../../assets/images/activity-boardgames.jpg';
import coffee from '../../../../assets/images/activity-coffee.jpg';
import run from '../../../../assets/images/activity-run.jpg';
import other from '../../../../assets/images/activity-other.jpg';

const KIND_IMAGE: Record<ActivityKind, number> = {
  football,
  walk,
  boardgames,
  coffee,
  run,
  other,
};

export function kindImage(kind: ActivityKind): number {
  return KIND_IMAGE[kind] ?? other;
}
