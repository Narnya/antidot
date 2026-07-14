// (app)/(tabs) — the 5-tab shell (DS v2, docs/35 §7): Для тебя · Мои круги ·
// Ритм · Уведомления · Профиль. Detail screens (activity, circle, settings,
// report, profile/[id], create) live in the (app) Stack and push OVER the tabs.
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { colors, typography } from '@social-events/ui';

type IoniconName = keyof typeof Ionicons.glyphMap;

function tabIcon(name: IoniconName) {
  return ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={name} size={size} color={color} />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.action.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.surface.default,
          borderTopColor: colors.border.default,
        },
        tabBarLabelStyle: { ...typography.caption, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{ title: 'Для тебя', tabBarIcon: tabIcon('home-outline') }}
      />
      <Tabs.Screen
        name="circles"
        options={{ title: 'Мои круги', tabBarIcon: tabIcon('people-outline') }}
      />
      <Tabs.Screen
        name="rhythm"
        options={{ title: 'Ритм', tabBarIcon: tabIcon('calendar-outline') }}
      />
      <Tabs.Screen
        name="notifications"
        options={{ title: 'Уведомления', tabBarIcon: tabIcon('notifications-outline') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Профиль', tabBarIcon: tabIcon('person-outline') }}
      />
    </Tabs>
  );
}
