// (app)/(tabs) — the 5-tab shell (DS v2, docs/35 §7): Для тебя · Мои круги ·
// Ритм · Уведомления · Профиль. Icons are hand-matched to the mockups (outline
// glyphs, active tab tints green). Detail screens (activity, circle, settings,
// report, profile/[id], create) live in the (app) Stack and push OVER the tabs.
import { Tabs } from 'expo-router';

import { colors, INTER_MEDIUM } from '@social-events/ui';

import {
  IconBell,
  IconCircles,
  IconForYou,
  IconProfile,
  IconRhythm,
  type NavIconProps,
} from '../../../src/components/NavIcons';
import {
  UnreadNotificationsProvider,
  useUnreadNotifications,
} from '../../../src/features/activities/hooks/useUnreadNotifications';

type IconCmp = (props: NavIconProps) => JSX.Element;
function tabIcon(Icon: IconCmp) {
  return ({ color }: { color: string }) => <Icon color={color} size={24} />;
}

export default function TabsLayout() {
  return (
    <UnreadNotificationsProvider>
      <TabsInner />
    </UnreadNotificationsProvider>
  );
}

function TabsInner() {
  const { count } = useUnreadNotifications();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.action.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.surface.default,
          borderTopColor: colors.border.default,
          height: 58,
        },
        tabBarLabelStyle: { fontFamily: INTER_MEDIUM, fontSize: 10, letterSpacing: 0.1 },
      }}
    >
      <Tabs.Screen name="feed" options={{ title: 'Для тебя', tabBarIcon: tabIcon(IconForYou) }} />
      <Tabs.Screen
        name="circles"
        options={{ title: 'Мои круги', tabBarIcon: tabIcon(IconCircles) }}
      />
      <Tabs.Screen name="rhythm" options={{ title: 'Ритм', tabBarIcon: tabIcon(IconRhythm) }} />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Уведомления',
          tabBarIcon: tabIcon(IconBell),
          tabBarBadge: count > 0 ? count : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.accent.coral, fontSize: 10 },
        }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Профиль', tabBarIcon: tabIcon(IconProfile) }} />
    </Tabs>
  );
}
