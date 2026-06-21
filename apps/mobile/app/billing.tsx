import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEntitlements } from '@whosplaying/core'
import { BackHeader, GradientButton } from '../components/ui'

// Billing (mockup m-billing). Bound to the real entitlement state — the stub
// reports Free today, so we show the Free state honestly (payment method,
// usage, and renewal only render once a subscription exists, via Phase B).
export default function BillingScreen() {
  const router = useRouter()
  const { entitlements } = useEntitlements()
  const isPro = entitlements.length > 0

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <BackHeader title="Billing" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-2">
        {/* Status */}
        <View className="rounded-[18px] border border-ink-line bg-surface p-4 shadow-card">
          <View className="flex-row items-center gap-3">
            <View className="h-[42px] w-[42px] items-center justify-center rounded-xl bg-ink-deep">
              <Feather name="zap" size={21} color="#FFB020" />
            </View>
            <View className="flex-1">
              <Text className="text-[17px] font-extrabold text-ink-deep">{isPro ? 'Venue Pro' : 'Free plan'}</Text>
              <Text className="mt-0.5 text-[12px] font-semibold text-ink-slate">
                {isPro ? 'Active subscription' : 'No subscription yet'}
              </Text>
            </View>
            {isPro ? (
              <View className="flex-row items-center gap-1 rounded-full bg-gold px-2 py-1">
                <Feather name="anchor" size={10} color="#071020" />
                <Text className="text-[9.5px] font-extrabold uppercase tracking-wide text-ink-deep">Founding</Text>
              </View>
            ) : null}
          </View>
          {!isPro ? (
            <Text className="mt-3 border-t border-ink-line pt-3 text-[12.5px] font-semibold leading-5 text-ink-slate">
              You're on the free tier — unlimited gigs, your calendar, one active offer, and free Get&nbsp;Tickets
              link-outs. Upgrade to reach more fans on your big nights.
            </Text>
          ) : null}
        </View>

        {!isPro ? (
          <View className="mt-4">
            <GradientButton label="Upgrade to Venue Pro · $14.99/mo" icon="zap" onPress={() => router.push('/plan')} />
          </View>
        ) : null}

        {/* Management rows */}
        <View className="mt-4">
          <BillingRow icon="repeat" label={isPro ? 'Change plan' : 'See Venue Pro plans'} onPress={() => router.push('/plan')} />
          <BillingRow icon="home" label="Add another venue · +$12/mo" />
          <BillingRow icon="file-text" label="Receipts & invoices" />
        </View>

        <View className="mt-5 flex-row items-center justify-center gap-1.5">
          <Feather name="anchor" size={12} color="#9AA1AC" />
          <Text className="text-[11px] font-semibold text-ink-mute">
            Founding rate stays $14.99 for as long as you keep Venue Pro
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function BillingRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap
  label: string
  onPress?: () => void
}) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 border-b border-ink-line py-3.5">
      <View className="h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-[#F2F4F7]">
        <Feather name={icon} size={17} color="#5C6470" />
      </View>
      <Text className="flex-1 text-[14px] font-bold text-ink">{label}</Text>
      <Feather name="chevron-right" size={17} color="#9AA1AC" />
    </Pressable>
  )
}
