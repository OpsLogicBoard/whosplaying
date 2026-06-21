import { View, Text } from 'react-native'

export default function SignupScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-canvas p-6">
      <Text className="text-3xl font-extrabold tracking-tight text-ink">Create account</Text>
      <Text className="mt-2 font-semibold text-ink-slate">Use “Need an account? Create one” on the sign-in screen.</Text>
    </View>
  )
}
