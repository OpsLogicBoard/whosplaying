import { ScrollView, View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function BookingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-paper">
      <ScrollView contentContainerClassName="p-4">
        <Text className="font-display text-3xl text-ink">Bookings</Text>
        <Text className="text-ink-soft mt-1">Cross-confirm gigs with venues.</Text>
        <View className="mt-6 p-4 rounded-lg border border-ink-line bg-paper-cool shadow-stack-teal">
          <Text className="font-display text-xl text-ink">Invitation: Palm Row @ The Sandbar</Text>
          <Text className="text-ink-soft mt-1">Awaiting your confirmation</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
