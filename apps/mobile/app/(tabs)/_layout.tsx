import { Tabs } from 'expo-router'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: '#0AA3A3',
        tabBarInactiveTintColor: '#6A7C7C',
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#D7E2E2' },
      }}
    >
      <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
      <Tabs.Screen name="map" options={{ title: 'Map' }} />
      <Tabs.Screen name="feed" options={{ title: 'Feed' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
      <Tabs.Screen name="me" options={{ title: 'Me' }} />
    </Tabs>
  )
}
