import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LogoMark } from '@whosplaying/ui'

export default function MeTab() {
  return (
    <SafeAreaView className="flex-1 bg-paper">
      <View className="p-4 items-center">
        <LogoMark size={88} />
        <Text className="font-display text-3xl text-ink mt-4">Your profile</Text>
        <Text className="text-ink-soft mt-1 text-center">
          Pick the hats you wear: artist, venue owner, venue staff, goer.
        </Text>
      </View>
    </SafeAreaView>
  )
}
