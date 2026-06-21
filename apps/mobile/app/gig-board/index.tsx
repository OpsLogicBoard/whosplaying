import { IconMusic, IconPlus, IconWifiOff } from '@tabler/icons-react-native'
import { useRouter } from 'expo-router'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useGigBoard, type GigListing } from '@whosplaying/core'
import { GradientButton, StatusBadge } from '../../components/ui'

// The gig-board query joins the venue; the hook's row type doesn't surface it,
// so we widen locally to the shape `listOpenGigs` actually returns.
type GigRow = GigListing & { venue: { name: string; city: string; slug: string } }

function badgeDate(iso: string): { month: string; day: string } {
  const d = new Date(iso)
  return {
    month: d.toLocaleDateString(undefined, { month: 'short' }),
    day: d.getDate().toString(),
  }
}

function slotLabel(iso: string): string {
  const d = new Date(iso)
  const wd = d.toLocaleDateString(undefined, { weekday: 'short' })
  let h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${wd} · ${h}:${m.toString().padStart(2, '0')} ${ampm}`
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

function BlueDateBadge({ iso }: { iso: string }) {
  const { month, day } = badgeDate(iso)
  return (
    <View className="h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[#E6F1FB]">
      <Text className="text-[11px] font-extrabold uppercase text-[#185FA5]">{month}</Text>
      <Text className="text-[19px] font-extrabold leading-5 text-[#185FA5]">{day}</Text>
    </View>
  )
}

// Static placeholder bids — no bid backend yet (form/structure pass).
const RECENT_BIDS = [
  { id: 'b1', initials: 'LT', tint: '#FFB020', name: 'Low Tide Social Club', ask: 'asking $250 · funk' },
  { id: 'b2', initials: 'CO', tint: '#8B5CF6', name: 'Coastline', ask: 'asking $300 · indie' },
]

function BidCard({ bid }: { bid: (typeof RECENT_BIDS)[number] }) {
  return (
    <View className="mb-3 rounded-[16px] border border-ink-line bg-surface p-3">
      <View className="mb-3 flex-row items-center gap-3">
        <View
          style={{ backgroundColor: bid.tint }}
          className="h-[42px] w-[42px] items-center justify-center rounded-full"
        >
          <Text className="text-[14px] font-extrabold text-white">{bid.initials}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-extrabold text-ink-deep">{bid.name}</Text>
          <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">{bid.ask}</Text>
        </View>
      </View>
      <View className="flex-row gap-2.5">
        <View className="flex-1">
          <GradientButton label="Accept" size="md" />
        </View>
        <Pressable className="flex-1 items-center justify-center rounded-[15px] border border-ink-line bg-surface py-3">
          <Text className="text-[15px] font-extrabold text-ink">Decline</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default function GigBoardScreen() {
  const router = useRouter()
  const { data: gigs, isLoading, error } = useGigBoard()

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-4">
        <Text className="mb-3.5 text-[26px] font-extrabold tracking-tight text-ink-deep">Open gigs</Text>

        <GradientButton
          label="Post an open gig"
          icon={IconPlus}
          onPress={() => router.push('/create-gig')}
        />

        {isLoading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator color="#FF5A5F" />
          </View>
        ) : error ? (
          <View className="mt-10 items-center px-6">
            <IconWifiOff size={28} color="#9AA1AC" strokeWidth={2} />
            <Text className="mt-3 text-center text-[14px] font-semibold text-ink-slate">
              Couldn’t load open gigs. Pull to retry.
            </Text>
          </View>
        ) : (
          <>
            <Text className="mb-2.5 mt-5 text-[14px] font-extrabold text-ink-deep">
              Your open slots
            </Text>
            {gigs.length === 0 ? (
              <View className="items-center px-6 py-6">
                <IconMusic size={28} color="#9AA1AC" strokeWidth={2} />
                <Text className="mt-3 text-[15px] font-extrabold text-ink-deep">
                  No open slots yet
                </Text>
                <Text className="mt-1 text-center text-[13px] font-semibold text-ink-slate">
                  Post a gig and bids show up below.
                </Text>
              </View>
            ) : (
              (gigs as GigRow[]).map((gig) => {
                const pay = payLabel(gig.pay_low_cents, gig.pay_high_cents)
                const genre = (gig as { genre?: string | null }).genre ?? 'Any'
                const sub = pay ? `${genre} · ${pay}` : genre
                return (
                  <View
                    key={gig.id}
                    className="mb-3 flex-row items-center gap-3 rounded-[17px] border border-ink-line bg-surface p-3"
                  >
                    <BlueDateBadge iso={gig.starts_at} />
                    <View className="flex-1">
                      <Text className="text-[15px] font-extrabold text-ink-deep">
                        {slotLabel(gig.starts_at)}
                      </Text>
                      <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">
                        {sub}
                      </Text>
                    </View>
                    <StatusBadge kind="open" label="Bids" />
                  </View>
                )
              })
            )}

            <Text className="mb-2.5 mt-5 text-[14px] font-extrabold text-ink-deep">
              Recent bids · Jun 20
            </Text>
            {RECENT_BIDS.map((bid) => (
              <BidCard key={bid.id} bid={bid} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
