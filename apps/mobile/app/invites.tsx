import { IconMail, IconShieldCheck } from '@tabler/icons-react-native'
import { useRouter } from 'expo-router'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BackHeader } from '../components/ui'

// Invites to play (mockup "Invites to play" hat). Performer-invite resolution
// (event_performers → your linked artist/band) isn't wired in the mobile app
// yet, so this shows the explanatory empty state of the design.
export default function InvitesScreen() {
  const router = useRouter()
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <BackHeader title="Invites to play" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-2">
        <View className="mb-4 flex-row gap-2.5 rounded-2xl border border-ink-line bg-surface p-4 shadow-card">
          <IconShieldCheck size={18} color="#0F6E56" style={{ marginTop: 1 }} />
          <Text className="flex-1 text-[12.5px] font-semibold leading-5 text-ink-slate">
            A show goes live as <Text className="font-extrabold text-ink">Confirmed</Text> only once you and every invited
            performer accept. Venue invites you receive will appear here to accept or decline.
          </Text>
        </View>
        <View className="mt-12 items-center px-6">
          <IconMail size={28} color="#9AA1AC" />
          <Text className="mt-3 text-[16px] font-extrabold text-ink-deep">No invites yet</Text>
          <Text className="mt-1 text-center text-[13px] font-semibold text-ink-slate">
            When a venue invites your act to play, you'll get it here.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
