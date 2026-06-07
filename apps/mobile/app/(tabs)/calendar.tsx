import { ScrollView, View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function CalendarTab() {
  return (
    <SafeAreaView className="flex-1 bg-paper">
      <ScrollView contentContainerClassName="p-4">
        <Text className="font-display text-3xl text-ink">Who&rsquo;s playing</Text>
        <Text className="text-ink-soft mt-1">All upcoming shows in your area.</Text>
        <View className="mt-6 rounded-lg border border-ink-line bg-paper-cool p-4 shadow-stack-yellow">
          <Text className="font-display text-2xl text-ink">Palm Row + The Tides</Text>
          <Text className="text-ink-soft mt-1">The Sandbar</Text>
          <Text className="text-ink-mute mt-1 text-xs">Friday · 9:00 PM</Text>
        </View>
        <View className="mt-4 rounded-lg border border-ink-line bg-paper-cool p-4 shadow-stack-coral">
          <Text className="font-display text-2xl text-ink">Songwriter Round</Text>
          <Text className="text-ink-soft mt-1">Riverside Listening Room</Text>
          <Text className="text-ink-mute mt-1 text-xs">Sunday · 7:30 PM · Special</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
