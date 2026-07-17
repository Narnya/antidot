// Bottom-nav icons, hand-matched to the approved mockups (mockups/feed.html sprite):
// compass (Для тебя), two overlapping circles (Мои круги), a waveform (Ритм), a
// bell (Уведомления), a person (Профиль). All are stroke-only (outline) so the tab
// tint colour flows through `color` for both active (green) and inactive (muted) —
// the active state stays an outline, never a filled glyph.
import Svg, { Circle, Path } from 'react-native-svg';

export type NavIconProps = { color: string; size?: number };

export function IconForYou({ color, size = 24 }: NavIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={1.6} />
      <Path
        d="M15.5 8.5l-2 5-5 2 2-5 5-2Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconCircles({ color, size = 24 }: NavIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={12} r={5.2} stroke={color} strokeWidth={1.6} />
      <Circle cx={15} cy={12} r={5.2} stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

export function IconRhythm({ color, size = 24 }: NavIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3.5 13.5h3l2-5 3 8 2.5-6 1.5 3h5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconBell({ color, size = 24 }: NavIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5 1.5 5H4.5S6 14 6 10Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path d="M10 18.5a2 2 0 0 0 4 0" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function IconChevronDown({ color, size = 14 }: NavIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7 10l5 5 5-5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconProfile({ color, size = 24 }: NavIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8.5} r={3.6} stroke={color} strokeWidth={1.6} />
      <Path
        d="M5.5 19c0-3.4 2.9-5.5 6.5-5.5s6.5 2.1 6.5 5.5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}
