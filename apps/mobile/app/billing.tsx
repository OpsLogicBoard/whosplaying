import {
  IconAnchor,
  IconArrowsUpDown,
  IconBolt,
  IconBrandVisa,
  IconBuildingStore,
  IconCalendarRepeat,
  IconChevronRight,
  IconExternalLink,
  IconMapPin,
  IconReceipt,
  IconRocket,
  type Icon as TablerIcon,
} from '@tabler/icons-react-native'
import { useRouter } from 'expo-router'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEntitlements } from '@whosplaying/core'
import { BackHeader } from '../components/ui'

// Billing (mockup m-billing). Renders the canonical Pro/active layout. The
// entitlement hook supplies the live state; until Stripe checkout (Phase B)
// reports a subscription the figures shown are the populated mockup values.
export default function BillingScreen() {
  const router = useRouter()
  const { entitlements } = useEntitlements()
  void entitlements // bound for Phase B; layout mirrors the active state today

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <BackHeader title="Billing" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-2">
        {/* Status card */}
        <View className="rounded-[18px] border border-ink-line bg-surface p-4 shadow-card">
          <View className="flex-row items-center gap-3">
            <View className="h-[42px] w-[42px] items-center justify-center rounded-xl bg-ink-deep">
              <IconBolt size={21} color="#FFB020" />
            </View>
            <View className="flex-1">
              <Text className="text-[17px] font-extrabold text-ink-deep">Venue Pro</Text>
              <Text className="mt-0.5 text-[12px] font-semibold text-ink-slate">Surfer the Bar · active</Text>
            </View>
            <View className="flex-row items-center gap-1 rounded-full bg-gold px-2 py-1">
              <IconAnchor size={10} color="#071020" />
              <Text className="text-[9.5px] font-extrabold uppercase tracking-wide text-ink-deep">Founding</Text>
            </View>
          </View>
          <View className="mt-3 flex-row items-center gap-2 border-t border-ink-line pt-3">
            <IconCalendarRepeat size={15} color="#FF5A5F" />
            <Text className="text-[12.5px] font-semibold text-ink-slate">
              $14.99/mo · renews <Text className="font-extrabold text-ink">Jul 14, 2026</Text>
            </Text>
          </View>
        </View>

        {/* Payment method */}
        <View className="mt-4 flex-row items-center gap-3 rounded-[18px] border border-ink-line bg-surface p-4 shadow-card">
          <View className="h-[34px] w-[48px] items-center justify-center rounded-lg bg-[#F2F4F7]">
            <IconBrandVisa size={26} color="#1A1F71" />
          </View>
          <View className="flex-1">
            <Text className="text-[14px] font-bold text-ink">Visa ···· 4242</Text>
            <Text className="mt-0.5 text-[12px] font-semibold text-ink-slate">Expires 08/28</Text>
          </View>
          <Text
            onPress={() => Alert.alert('Update', 'Stripe Customer Portal — Phase B.')}
            className="text-[13px] font-extrabold text-coral"
          >
            Update
          </Text>
        </View>

        {/* This period — usage */}
        <Text className="mb-3 mt-5 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">This period</Text>
        <View className="flex-row gap-3">
          <View className="flex-1 rounded-2xl border border-ink-line bg-surface p-3.5 shadow-card">
            <View className="flex-row items-center gap-1.5">
              <IconRocket size={15} color="#FFB020" />
              <Text className="text-[12px] font-bold text-ink-slate">Boosts</Text>
            </View>
            <Text className="mt-1.5 text-[26px] font-black tracking-tight text-ink-deep">3</Text>
            <Text className="text-[11.5px] font-semibold text-ink-slate">events boosted</Text>
          </View>
          <View className="flex-1 rounded-2xl border border-ink-line bg-surface p-3.5 shadow-card">
            <View className="flex-row items-center gap-1.5">
              <IconMapPin size={15} color="#FF5A5F" />
              <Text className="text-[12px] font-bold text-ink-slate">GPS push</Text>
            </View>
            <Text className="mt-1.5 text-[26px] font-black tracking-tight text-ink-deep">
              1<Text className="text-[13px] font-bold text-ink-mute">/2 day</Text>
            </Text>
            <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EEF0F4]">
              <View className="h-full rounded-full bg-coral" style={{ width: '50%' }} />
            </View>
            <Text className="mt-1 text-[11.5px] font-semibold text-ink-slate">within daily cap</Text>
          </View>
        </View>

        <View className="mt-4">
          <Pressable
            onPress={() => Alert.alert('Manage billing', 'Stripe Customer Portal — Phase B.')}
            className="flex-row items-center justify-center gap-2 rounded-[15px] bg-ink-deep py-4"
          >
            <IconExternalLink size={17} color="#FFFFFF" />
            <Text className="text-[14.5px] font-extrabold text-white">Manage billing & invoices</Text>
          </Pressable>
        </View>

        {/* Management rows */}
        <View className="mt-4">
          <BillingRow icon={IconArrowsUpDown} label="Change plan" onPress={() => router.push('/plan')} />
          <BillingRow
            icon={IconBuildingStore}
            label="Add another venue · +$12/mo"
            onPress={() => Alert.alert('Add another venue', 'Multi-venue +$12/mo each — Phase B.')}
          />
          <BillingRow
            icon={IconReceipt}
            label="Receipts"
            onPress={() => Alert.alert('Receipts', 'Receipts — Phase B.')}
          />
        </View>

        <Text
          onPress={() => Alert.alert('Cancel subscription', 'Cancel via Stripe Customer Portal — Phase B.')}
          className="py-4 text-center text-[13.5px] font-bold text-coral"
        >
          Cancel subscription
        </Text>

        <View className="flex-row items-center justify-center gap-1.5">
          <IconAnchor size={12} color="#9AA1AC" />
          <Text className="text-[11px] font-semibold text-ink-mute">
            Founding rate stays $14.99 for as long as you keep Venue Pro
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function BillingRow({
  icon: Icon,
  label,
  onPress,
}: {
  icon: TablerIcon
  label: string
  onPress?: () => void
}) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 border-b border-ink-line py-3.5">
      <View className="h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-[#F2F4F7]">
        <Icon size={17} color="#5C6470" />
      </View>
      <Text className="flex-1 text-[14px] font-bold text-ink">{label}</Text>
      <IconChevronRight size={17} color="#9AA1AC" />
    </Pressable>
  )
}
