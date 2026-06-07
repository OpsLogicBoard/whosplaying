import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function MessagesTab() {
  return (
    <SafeAreaView className="flex-1 bg-paper">
      <View className="p-4">
        <Text className="font-display text-3xl text-ink">Messages</Text>
        <Text className="text-ink-soft mt-1">Private chat with venues and artists.</Text>
      </View>
    </SafeAreaView>
  )
}
