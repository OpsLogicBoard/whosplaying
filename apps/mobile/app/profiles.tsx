import {
  IconBriefcase,
  IconPlus,
  IconUsers,
} from '@tabler/icons-react-native'
import { useRouter } from 'expo-router'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BackHeader, GradientButton } from '../components/ui'
import { useActiveProEntity } from '../lib/proProfiles'

// "Your profiles" / Acting-as manager (mockup #profmgr, prototype.html
// ~line 1588-1600 + behavior 1706-1737). Lists the user's pro entities;
// tapping one sets it active ("Act as"). Entities are static placeholder data
// (PRO_ENTITIES) until real pro-entity wiring lands.
export default function ProfilesScreen() {
  const router = useRouter()
  const { index, entities, setActive } = useActiveProEntity()

  function actAs(i: number) {
    setActive(i)
    router.back()
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <BackHeader title="Your profiles" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-12 pt-0.5">
        <View className="mt-3 flex-row items-start gap-1.5">
          <IconUsers size={13} color="#FF5A5F" style={{ marginTop: 1 }} />
          <Text className="flex-1 text-[11.5px] font-semibold leading-5 text-ink-mute">
            Switch who you&apos;re acting as, or add a profile. Each has its own public page, calendar, and offers.
          </Text>
        </View>

        {entities.length === 0 ? (
          <View className="mt-8 items-center px-3.5">
            <View className="mb-3 h-[58px] w-[58px] items-center justify-center rounded-2xl bg-coral-soft">
              <IconBriefcase size={27} color="#FF5A5F" />
            </View>
            <Text className="text-[16px] font-extrabold text-ink-deep">No pro profiles yet</Text>
            <Text className="mt-1.5 max-w-[280px] text-center text-[13px] font-semibold leading-5 text-ink-slate">
              Add a band, venue, or promoter profile to post shows, manage a calendar, and build a public page fans can
              find.
            </Text>
          </View>
        ) : (
          <>
            <Text className="mb-3 mt-5 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">
              Acting as
            </Text>
            {entities.map((e, i) => {
              const isActive = i === index
              return (
                <Pressable
                  key={`${e.name}-${e.kind}`}
                  onPress={() => actAs(i)}
                  className="flex-row items-center gap-3 border-b border-ink-line py-3"
                >
                  <View
                    className="h-[46px] w-[46px] items-center justify-center rounded-full"
                    style={{ backgroundColor: e.color }}
                  >
                    <Text className="text-[15px] font-extrabold text-white">{e.initials}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[15px] font-extrabold text-ink">{e.name}</Text>
                    <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">{e.kind}</Text>
                  </View>
                  {isActive ? (
                    <View className="rounded-full bg-teal-soft px-2.5 py-1">
                      <Text className="text-[10px] font-extrabold uppercase tracking-wide text-teal">Active</Text>
                    </View>
                  ) : (
                    <Text className="text-[12px] font-extrabold text-coral">Act as</Text>
                  )}
                </Pressable>
              )
            })}
          </>
        )}

        <View className="mt-4">
          <GradientButton
            label="Add a profile"
            icon={IconPlus}
            onPress={() => router.push('/create-artist')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
