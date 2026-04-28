import { Tabs } from 'expo-router';

import { theme } from '../../src/shared/ui/theme';

const tabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: theme.colors.primary,
  tabBarInactiveTintColor: theme.colors.muted,
  tabBarStyle: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.border,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
};

export default function TabsLayout() {
  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen name="index" options={{ title: '홈' }} />
      <Tabs.Screen name="logs" options={{ title: '기록' }} />
      <Tabs.Screen name="insights" options={{ title: '인사이트' }} />
      <Tabs.Screen name="photos" options={{ title: '사진' }} />
      <Tabs.Screen name="family" options={{ title: '가족' }} />
    </Tabs>
  );
}
