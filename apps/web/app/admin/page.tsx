import { KPIS, MARKETS, MAPS_CLIFF, MAU_TREND } from './_data'

const fmt = (n: number) => n.toLocaleString('en-US')
const usd = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`
const pct = (n: number) => `${Math.round(n * 100)}%`

function Stat({
  label,
  value,
  sub,
  tone = 'ink',
}: {
  label: string
  value: string
  sub?: string
  tone?: 'ink' | 'green' | 'coral' | 'gold'
}) {
  const toneCls = {
    ink: 'text-ink-deep',
    green: 'text-green',
    coral: 'text-coral',
    gold: 'text-gold-ink',
  }[tone]
  return (
    <div className="rounded-lg border border-ink-line bg-surface p-4 shadow-card">
      <div className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">{label}</div>
      <div className={`mt-1.5 font-mono text-2xl font-bold tracking-tight ${toneCls}`}>{value}</div>
      {sub && <div className="mt-1 text-xs font-medium text-ink-soft">{sub}</div>}
    </div>
  )
}

export default function AdminOverview() {
  const cliffPct = MAPS_CLIFF.mau / MAPS_CLIFF.limit
  const peak = Math.max(...MAU_TREND)

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-h2 text-ink-deep">Overview</h1>
        <p className="text-body-sm text-ink-soft">Beaches launch · last 30 days</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="MAU" value={fmt(KPIS.mau)} sub={`${fmt(KPIS.dau)} DAU`} />
        <Stat label="MRR" value={usd(KPIS.mrr_cents)} sub={`${KPIS.paying_venues} paying · ${KPIS.founding_venues} founding`} tone="green" />
        <Stat label="Paying venues" value={`${KPIS.paying_venues}/${KPIS.total_venues}`} sub={`${KPIS.trial_venues} in trial`} />
        <Stat label="Churn (30d)" value={pct(KPIS.churn_30d)} sub="No cancellations" tone="green" />
        <Stat label="Confirmed events" value={fmt(KPIS.confirmed_events)} sub={`${pct(KPIS.cross_confirm_rate)} cross-confirm rate`} />
        <Stat label="Ticket taps (30d)" value={fmt(KPIS.ticket_taps_30d)} sub="Link-out attribution" />
        <Stat label="Break-even" value={`${KPIS.paying_venues}/6`} sub="venues to cover opex" tone={KPIS.paying_venues >= 6 ? 'green' : 'gold'} />
        <Stat label="ARPU (venue)" value={usd(KPIS.mrr_cents / KPIS.paying_venues)} sub="Founding rate" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* MAU trend */}
        <div className="rounded-lg border border-ink-line bg-surface p-5 shadow-card">
          <div className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">MAU trend · 7 weeks</div>
          <div className="mt-4 flex items-end gap-2 h-28">
            {MAU_TREND.map((v, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t ${i === MAU_TREND.length - 1 ? 'bg-coral' : 'bg-blue'}`}
                style={{ height: `${(v / peak) * 100}%` }}
                title={v.toLocaleString('en-US')}
              />
            ))}
          </div>
          <div className="mt-2 text-xs font-medium text-green">↑ 104% over the window</div>
        </div>

        {/* Maps cost cliff */}
        <div className="rounded-lg border border-ink-line bg-surface p-5 shadow-card">
          <div className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">Maps cost cliff</div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-ink-deep">{fmt(MAPS_CLIFF.mau)}</span>
            <span className="text-sm font-semibold text-ink-soft">/ {fmt(MAPS_CLIFF.limit)} MAU free</span>
          </div>
          <div className="mt-3 h-3 rounded-full bg-ink-line overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-green to-gold" style={{ width: `${cliffPct * 100}%` }} />
          </div>
          <div className="mt-2 text-xs font-medium text-ink-soft">
            {pct(cliffPct)} of the free tier. Costs scale with goers (free side); revenue with venues —
            watch this gap as adoption grows.
          </div>
        </div>
      </div>

      {/* Per-market density */}
      <div className="rounded-lg border border-ink-line bg-surface shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-ink-line flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">Per-market density</span>
          <span className="text-xs font-medium text-ink-mute">gates expansion — prove a market before the next</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-ink-mute">
              <th className="px-5 py-2 font-bold">Market</th>
              <th className="px-5 py-2 font-bold text-right">Venues</th>
              <th className="px-5 py-2 font-bold text-right">Events</th>
              <th className="px-5 py-2 font-bold text-right">Paying</th>
              <th className="px-5 py-2 font-bold text-right">Density</th>
            </tr>
          </thead>
          <tbody>
            {MARKETS.map((m) => (
              <tr key={m.city} className="border-t border-ink-line">
                <td className="px-5 py-2.5 font-medium text-ink">{m.city}</td>
                <td className="px-5 py-2.5 text-right font-mono text-ink-soft">{m.venues}</td>
                <td className="px-5 py-2.5 text-right font-mono text-ink-soft">{m.events}</td>
                <td className="px-5 py-2.5 text-right font-mono text-ink-soft">{m.paying}</td>
                <td className="px-5 py-2.5 text-right font-mono font-semibold text-ink-deep">
                  {(m.events / m.venues).toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
