import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function FeedTab() {
  return (
    <SafeAreaView className="flex-1 bg-paper">
      <View className="p-4">
        <Text className="font-display text-3xl text-ink">Feed</Text>
        <Text className="text-ink-soft mt-1">From who you follow.</Text>
        <View className="mt-6 p-12 rounded-lg border-2 border-dashed border-ink-line items-center">
          <Text className="text-ink-mute text-center">Follow artists + venues to see their shows here.</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}
