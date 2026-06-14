import { Tabs } from 'expo-router'
import { Feather } from '@expo/vector-icons'

// v2 "Live Pin" goer layout. Tonight / Explore / Map / Saved / You.
// The artist/venue/promoter "Manage" mode swaps this tab set at runtime via
// the Work/Play selector — see lib/appMode.ts for the extension point.

const ACTIVE = '#FF5A5F'
const INACTIVE = '#9AA1AC'

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', marginTop: 2 },
        tabBarStyle: {
          height: 88,
          paddingTop: 10,
          paddingBottom: 28,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E9EAED',
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="tonight"
        options={{ title: 'Tonight', tabBarIcon: ({ color }) => <Feather name="zap" size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: 'Explore', tabBarIcon: ({ color }) => <Feather name="calendar" size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="map"
        options={{ title: 'Map', tabBarIcon: ({ color }) => <Feather name="map" size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="saved"
        options={{ title: 'Saved', tabBarIcon: ({ color }) => <Feather name="heart" size={22} color={color} /> }}
      />
      <Tabs.Screen
        name="you"
        options={{ title: 'You', tabBarIcon: ({ color }) => <Feather name="user" size={22} color={color} /> }}
      />
    </Tabs>
  )
}
