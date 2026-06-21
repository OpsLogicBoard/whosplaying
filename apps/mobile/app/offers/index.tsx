import { Feather } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { offersQ } from '@whosplaying/supabase'
import { BackHeader, GradientButton, StatusBadge, Toggle, type StatusKind } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { supabase } from '../../lib/supabase'

type OfferRow = {
  id: string
  message: string
  active: boolean
  expiration_date: string | null
}

function offerStatus(o: OfferRow): { kind: StatusKind; label: string } {
  if (!o.active) return { kind: 'muted', label: 'Paused' }
  if (o.expiration_date && new Date(o.expiration_date) < new Date()) return { kind: 'muted', label: 'Expired' }
  return { kind: 'confirmed', label: 'Active' }
}

export default function OffersScreen() {
  const router = useRouter()
  const qc = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user?.id
  const [composing, setComposing] = useState(false)
  const [message, setMessage] = useState('')
  const [onEventPages, setOnEventPages] = useState(true)

  const venue = useQuery({
    queryKey: ['my-venue', userId ?? null],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('venues')
        .select('id, name')
        .eq('owner_user_id', userId as string)
        .limit(1)
      return ((data ?? []) as { id: string; name: string }[])[0] ?? null
    },
  })
  const venueId = venue.data?.id

  const offers = useQuery({
    queryKey: ['venue-offers', venueId ?? null],
    enabled: !!venueId,
    queryFn: async (): Promise<OfferRow[]> => {
      const { data, error } = await offersQ.listVenueOffers(supabase, venueId as string)
      if (error) throw error
      return (data ?? []) as unknown as OfferRow[]
    },
  })

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await offersQ.createOffer(supabase, {
        venue_id: venueId as string,
        created_by: userId as string,
        message: message.trim(),
        on_event_pages: onEventPages,
        active: true,
      })
      if (error) throw error
    },
    onSuccess: () => {
      setMessage('')
      setComposing(false)
      qc.invalidateQueries({ queryKey: ['venue-offers', venueId] })
    },
    onError: () =>
      Alert.alert(
        'Offer limit',
        'Free venues include one active offer. Upgrade to Venue Pro for unlimited offers.',
      ),
  })

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <BackHeader title="Offers & promos" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-2">
        {!venue.isLoading && !venueId ? (
          <View className="mt-16 items-center px-6">
            <Feather name="home" size={28} color="#9AA1AC" />
            <Text className="mt-3 text-[16px] font-extrabold text-ink-deep">No venue yet</Text>
            <Text className="mt-1 text-center text-[13px] font-semibold text-ink-slate">
              Claim your venue to run redeemable offers on your event pages.
            </Text>
          </View>
        ) : (
          <>
            <View className="mb-4 flex-row items-center gap-3 rounded-[14px] border border-ink-line bg-surface p-3 shadow-card">
              <View className="h-9 w-9 items-center justify-center rounded-[10px] bg-blue">
                <Feather name="tag" size={16} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-extrabold uppercase tracking-wide text-ink-mute">Offers for</Text>
                <Text className="text-[14.5px] font-extrabold text-ink">{venue.data?.name ?? '…'}</Text>
              </View>
            </View>

            {composing ? (
              <View className="mb-4 rounded-2xl border border-ink-line bg-surface p-4 shadow-card">
                <Text className="mb-2 text-[12px] font-extrabold uppercase tracking-wide text-ink-slate">Offer message</Text>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  placeholder="$4 SunCruisers — show this to your bartender!"
                  placeholderTextColor="#9AA1AC"
                  className="min-h-[62px] rounded-xl border border-ink-line bg-canvas p-3 text-[14px] text-ink"
                  textAlignVertical="top"
                />
                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="text-[14px] font-semibold text-ink">Show on event pages</Text>
                  <Toggle on={onEventPages} onToggle={() => setOnEventPages((v) => !v)} />
                </View>
                <View className="mt-4">
                  <GradientButton
                    label={create.isPending ? 'Saving…' : 'Save offer'}
                    icon="check"
                    disabled={create.isPending || !message.trim()}
                    onPress={() => create.mutate()}
                  />
                </View>
                <Pressable onPress={() => setComposing(false)} className="mt-2 py-2">
                  <Text className="text-center text-[13px] font-bold text-ink-slate">Cancel</Text>
                </Pressable>
              </View>
            ) : (
              <View className="mb-4">
                <GradientButton label="New offer" icon="plus" onPress={() => setComposing(true)} />
              </View>
            )}

            {offers.isLoading ? (
              <View className="mt-8 items-center">
                <ActivityIndicator color="#FF5A5F" />
              </View>
            ) : (offers.data ?? []).length === 0 ? (
              <View className="mt-10 items-center px-6">
                <Feather name="tag" size={26} color="#9AA1AC" />
                <Text className="mt-3 text-center text-[14px] font-semibold text-ink-slate">
                  No offers yet — create one to reward fans at the bar.
                </Text>
              </View>
            ) : (
              (offers.data ?? []).map((o) => {
                const s = offerStatus(o)
                return (
                  <View
                    key={o.id}
                    className="mb-3 flex-row items-center gap-3 rounded-[17px] border border-ink-line bg-surface p-3 shadow-card"
                  >
                    <View className="h-[52px] w-[52px] items-center justify-center rounded-[13px] bg-coral-soft">
                      <Feather name="tag" size={20} color="#FF5A5F" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[15px] font-semibold text-ink" numberOfLines={2}>
                        {o.message}
                      </Text>
                      {o.expiration_date ? (
                        <Text className="mt-0.5 text-[12px] font-semibold text-ink-slate">
                          Expires {new Date(o.expiration_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </Text>
                      ) : null}
                    </View>
                    <StatusBadge kind={s.kind} label={s.label} />
                  </View>
                )
              })
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
