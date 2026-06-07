import { View, Text, Pressable } from 'react-native'
import { Wordmark } from '@whosplaying/ui'
import { router } from 'expo-router'

export default function LoginScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-teal-50 p-6">
      <Wordmark width={280} />
      <Text className="mt-8 text-ink-soft text-center text-lg">
        Sign in to follow your favorite artists and venues.
      </Text>
      <Pressable
        className="mt-10 bg-coral px-6 py-3 rounded-lg"
        onPress={() => router.replace('/(tabs)/calendar')}
      >
        <Text className="text-white font-semibold text-lg">Continue with magic link</Text>
      </Pressable>
    </View>
  )
}
