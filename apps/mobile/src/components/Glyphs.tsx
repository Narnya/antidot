// Outline glyphs, hand-matched 1:1 to the mockup SVG sprite (mockups/all-screens.html
// `<symbol id="ic-…">`): stroke-only so the colour flows through `color` (badges tint
// green, notification tiles vary). Used by Profile / Notifications / foreign profile.
// The tab-bar glyphs live in NavIcons; these are the inline content icons.
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type GlyphProps = { color: string; size?: number };

export function IconShield({ color, size = 13 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.5l6.5 2.5v5c0 4.5-3 7.5-6.5 9-3.5-1.5-6.5-4.5-6.5-9v-5L12 3.5Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path
        d="M9 12l2 2 4-4"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconCheck({ color, size = 13 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconUsers({ color, size = 13 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={9} r={3.2} stroke={color} strokeWidth={1.6} />
      <Path
        d="M3.5 18.5c0-3 2.5-4.8 5.5-4.8s5.5 1.8 5.5 4.8"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Path
        d="M16 7.2a3 3 0 0 1 0 5.4M17.5 18.5c0-2.2-1-3.8-2.6-4.5"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconGear({ color, size = 20 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.6} />
      <Path
        d="M12 3.5v2.5M12 18v2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M3.5 12H6M18 12h2.5M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconFlag({ color, size = 18 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 21V4M6 4h11l-2 3.5L17 11H6"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconLock({ color, size = 20 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={5.5} y={10.5} width={13} height={9} rx={2} stroke={color} strokeWidth={1.6} />
      <Path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

export function IconPin({ color, size = 22 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={10} r={2.4} stroke={color} strokeWidth={1.6} />
    </Svg>
  );
}

export function IconClock({ color, size = 22 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.6} />
      <Path
        d="M12 7.5V12l3 2"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconChat({ color, size = 22 }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 5.5h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H9l-4 3.2V6.5a1 1 0 0 1 1-1Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
