import {
  IconBolt,
  IconBrandFacebook,
  IconBrandInstagram,
  IconCalendarMonth,
  IconChevronRight,
  IconPhoto,
  type Icon as TablerIcon,
} from '@tabler/icons-react-native'
import { useRouter } from 'expo-router'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BackHeader } from '../components/ui'

// Promote a gig (mockup "Promote a gig" hat — line 706: "One show or your month
// → Canva, Instagram"). No standalone prototype screen exists; this realizes
// the hat's Canva / Instagram publishing intent. Those integrations aren't
// wired yet — the actions surface that. Design-complete.
const ACTIONS: { icon: TablerIcon; tint: string; color: string; title: string; sub: string }[] = [
  { icon: IconPhoto, tint: '#FFF7E6', color: '#FFB020', title: 'Make a flyer in Canva', sub: 'Auto-filled with your next show' },
  { icon: IconBrandInstagram, tint: '#FFF1F1', color: '#FF5A5F', title: 'Share to Instagram', sub: 'Post or story, one tap' },
  { icon: IconBrandFacebook, tint: '#E6F1FB', color: '#2D7FF9', title: 'Share to Facebook', sub: 'Event page or feed' },
  { icon: IconCalendarMonth, tint: '#EEEDFE', color: '#8B5CF6', title: 'Promote your whole month', sub: 'One image with every show' },
]

export default function PromoteScreen() {
  const router = useRouter()
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <BackHeader title="Promote a gig" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-2">
        <View className="mb-4 flex-row gap-2.5 px-1">
          <IconBolt size={14} color="#FF5A5F" style={{ marginTop: 1 }} />
          <Text className="flex-1 text-[12px] font-semibold leading-5 text-ink-slate">
            One show or your whole month — turn a gig into a flyer for Canva &amp; Instagram in a tap.
          </Text>
        </View>
        {ACTIONS.map((a) => {
          const Icon = a.icon
          return (
            <Pressable
              key={a.title}
              onPress={() => Alert.alert(a.title, 'Publishing integrations — wiring in progress.')}
              className="mb-2.5 flex-row items-center gap-3 rounded-[17px] border border-ink-line bg-surface p-[15px]"
            >
              <View className="h-[42px] w-[42px] items-center justify-center rounded-xl" style={{ backgroundColor: a.tint }}>
                <Icon size={20} color={a.color} />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-extrabold text-ink">{a.title}</Text>
                <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">{a.sub}</Text>
              </View>
              <IconChevronRight size={18} color="#9AA1AC" />
            </Pressable>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  )
}
