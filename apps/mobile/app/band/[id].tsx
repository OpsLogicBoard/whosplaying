import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'

export default function BandScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return (
    <SafeAreaView className="flex-1 bg-paper">
      <View className="p-4">
        <Text className="font-display text-3xl text-ink">Band {id}</Text>
        <Text className="text-ink-soft mt-2">STUB — band profile + member roster.</Text>
      </View>
    </SafeAreaView>
  )
}
