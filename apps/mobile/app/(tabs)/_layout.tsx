import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Tabs } from 'expo-router'
import {
  IconCalendarEvent,
  IconCalendarMonth,
  IconCirclePlus,
  IconHeart,
  IconMap2,
  IconMessage2,
  IconUser,
} from '@tabler/icons-react-native'
import { Pressable, Text, View } from 'react-native'
import { GigsMark, TonightMark } from '../../components/icon'
import { useAppMode } from '../../lib/appMode'

// v2 "Live Pin" role-adaptive tab bar. Play mode shows the goer set
// (Tonight / Explore / Map / Saved / You); Work mode swaps to the pro set
// (Calendar / Gigs / Create / Messages / You) — matching the prototype's
// dual-nav (docs/design/prototype.html #nav-play / #nav-work).

const ACTIVE = '#FF5A5F'
const INACTIVE = '#9AA1AC'

type TabDef = { name: string; label: string; icon: (color: string) => React.ReactNode }

const PLAY_TABS: TabDef[] = [
  { name: 'tonight', label: 'Tonight', icon: (c) => <TonightMark size={23} color={c} /> },
  { name: 'explore', label: 'Explore', icon: (c) => <IconCalendarMonth size={23} color={c} /> },
  { name: 'map', label: 'Map', icon: (c) => <IconMap2 size={23} color={c} /> },
  { name: 'saved', label: 'Saved', icon: (c) => <IconHeart size={23} color={c} /> },
  { name: 'you', label: 'You', icon: (c) => <IconUser size={23} color={c} /> },
]

const WORK_TABS: TabDef[] = [
  { name: 'calendar', label: 'Calendar', icon: (c) => <IconCalendarEvent size={23} color={c} /> },
  { name: 'gigs', label: 'Gigs', icon: (c) => <GigsMark size={26} color={c} /> },
  { name: 'create', label: 'Create', icon: (c) => <IconCirclePlus size={23} color={c} /> },
  { name: 'messages', label: 'Messages', icon: (c) => <IconMessage2 size={23} color={c} /> },
  { name: 'you', label: 'You', icon: (c) => <IconUser size={23} color={c} /> },
]

function WorkPlayTabBar({ state, navigation }: BottomTabBarProps) {
  const { mode } = useAppMode()
  const tabs = mode === 'work' ? WORK_TABS : PLAY_TABS
  const activeName = state.routes[state.index]?.name

  return (
    <View
      className="flex-row bg-surface"
      style={{ height: 88, paddingTop: 10, paddingBottom: 28, borderTopWidth: 1, borderTopColor: '#E9EAED' }}
    >
      {tabs.map((tab) => {
        const focused = activeName === tab.name
        const color = focused ? ACTIVE : INACTIVE
        return (
          <Pressable
            key={tab.name}
            onPress={() => {
              if (!focused) navigation.navigate(tab.name)
            }}
            className="flex-1 items-center justify-start"
          >
            {tab.icon(color)}
            <Text style={{ color, fontSize: 11, fontWeight: '700', marginTop: 3 }}>{tab.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <WorkPlayTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {/* Play set */}
      <Tabs.Screen name="tonight" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="saved" />
      <Tabs.Screen name="you" />
      {/* Work set */}
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="gigs" />
      <Tabs.Screen name="create" />
      <Tabs.Screen name="messages" />
    </Tabs>
  )
}
