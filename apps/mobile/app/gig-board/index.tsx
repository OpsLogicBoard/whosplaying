import { ScrollView, View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function GigBoardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-paper">
      <ScrollView contentContainerClassName="p-4">
        <Text className="font-display text-3xl text-ink">Open gigs</Text>
        <Text className="text-ink-soft mt-1">Venues posting, artists bidding.</Text>
        <View className="mt-6 p-4 rounded-lg border border-ink-line bg-paper-cool shadow-stack-orange">
          <Text className="font-display text-xl text-ink">Sunset slot — The Sandbar</Text>
          <Text className="text-ink-soft mt-1">Fri 6–8 PM · $200–$350</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
