import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function MapTab() {
  return (
    <SafeAreaView className="flex-1 bg-paper">
      <View className="p-4">
        <Text className="font-display text-3xl text-ink">Map</Text>
        <Text className="text-ink-soft mt-1">Venues and shows near you.</Text>
        <View className="mt-6 aspect-[16/9] rounded-lg bg-teal-100 border border-ink-line items-center justify-center">
          <Text className="text-ink-mute">@maplibre/maplibre-react-native — wire to brand style</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}
