import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGigBoard, type GigListing } from '@whosplaying/core'

// The gig-board query joins the venue; the hook's row type doesn't surface it,
// so we widen locally to the shape `listOpenGigs` actually returns.
type GigRow = GigListing & { venue: { name: string; city: string; slug: string } }

function whenLabel(iso: string): string {
  const d = new Date(iso)
  let h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  const date = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  return `${date} · ${h}:${m.toString().padStart(2, '0')} ${ampm}`
}

function payLabel(low: number | null, high: number | null): string | null {
  const fmt = (cents: number) => `$${Math.round(cents / 100)}`
  if (low != null && high != null) {
    return low === high ? fmt(low) : `${fmt(low)}–${fmt(high)}`
  }
  if (low != null) return `${fmt(low)}+`
  if (high != null) return `Up to ${fmt(high)}`
  return null
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View className="flex-row items-center px-5 pt-1">
      <Pressable
        onPress={onBack}
        className="h-10 w-10 items-center justify-center rounded-full border border-ink-line bg-surface"
      >
        <Feather name="chevron-left" size={20} color="#071020" />
      </Pressable>
    </View>
  )
}

export default function GigBoardScreen() {
  const router = useRouter()
  const { data: gigs, isLoading, error } = useGigBoard()

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <Header onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <Text className="mt-3 text-[33px] font-extrabold text-ink-deep">
          Open <Text className="text-coral">gigs.</Text>
        </Text>
        <Text className="mt-1 text-[14px] font-semibold text-ink-slate">
          Venues posting, artists bidding.
        </Text>

        {isLoading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator color="#FF5A5F" />
          </View>
        ) : error ? (
          <View className="mt-10 items-center px-6">
            <Feather name="wifi-off" size={28} color="#9AA1AC" />
            <Text className="mt-3 text-center text-[14px] font-semibold text-ink-slate">
              Couldn’t load open gigs. Pull to retry.
            </Text>
          </View>
        ) : gigs.length === 0 ? (
          <View className="mt-10 items-center px-6">
            <Feather name="music" size={28} color="#9AA1AC" />
            <Text className="mt-3 text-[16px] font-extrabold text-ink-deep">No open gigs right now.</Text>
            <Text className="mt-1 text-center text-[13px] font-semibold text-ink-slate">
              Check back soon — venues post new gigs regularly.
            </Text>
          </View>
        ) : (
          <View className="mt-5 gap-3">
            {(gigs as GigRow[]).map((gig) => {
              const pay = payLabel(gig.pay_low_cents, gig.pay_high_cents)
              return (
                <View key={gig.id} className="rounded-xl border border-ink-line bg-surface p-4">
                  <Text className="text-[16px] font-extrabold text-ink-deep" numberOfLines={2}>
                    {gig.title}
                  </Text>
                  <View className="mt-1.5 flex-row items-center gap-1.5">
                    <Feather name="map-pin" size={13} color="#5C6470" />
                    <Text className="text-[12.5px] font-semibold text-ink-slate" numberOfLines={1}>
                      {gig.venue.name} · {gig.venue.city}
                    </Text>
                  </View>
                  <View className="mt-1 flex-row items-center gap-1.5">
                    <Feather name="calendar" size={13} color="#5C6470" />
                    <Text className="text-[12.5px] font-semibold text-ink-slate">
                      {whenLabel(gig.starts_at)}
                    </Text>
                  </View>
                  {pay ? (
                    <View className="mt-3 self-start rounded-full bg-coral/10 px-3 py-1">
                      <Text className="text-[12px] font-extrabold text-coral">{pay}</Text>
                    </View>
                  ) : null}
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
