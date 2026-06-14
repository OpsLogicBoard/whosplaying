import { PIPELINE, KPIS } from '../_data'

const STAGE_TONE: Record<string, string> = {
  Founding: 'bg-gold-soft text-gold-ink',
  Trial: 'bg-blue-soft text-blue-ink',
  Lead: 'bg-ink-line text-ink-soft',
}

export default function AdminSales() {
  const founding = PIPELINE.filter((p) => p.stage === 'Founding')
  const trials = PIPELINE.filter((p) => p.stage === 'Trial')
  const leads = PIPELINE.filter((p) => p.stage === 'Lead')

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-h2 text-ink-deep">Sales</h1>
        <p className="text-body-sm text-ink-soft">Venue pipeline · Founding cohort · comps</p>
      </div>

      {/* Funnel summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-ink-line bg-surface p-4 shadow-card">
          <div className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">Leads</div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-ink-deep">{leads.length}</div>
        </div>
        <div className="rounded-lg border border-ink-line bg-surface p-4 shadow-card">
          <div className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">In trial</div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-blue-ink">{trials.length}</div>
        </div>
        <div className="rounded-lg border border-ink-line bg-surface p-4 shadow-card">
          <div className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">Founding · locked</div>
          <div className="mt-1.5 font-mono text-2xl font-bold text-gold-ink">
            {founding.length}<span className="text-sm text-ink-mute">/15</span>
          </div>
        </div>
      </div>

      {/* Pipeline table */}
      <div className="rounded-lg border border-ink-line bg-surface shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-ink-line text-[11px] font-bold uppercase tracking-wide text-ink-mute">
          Venue pipeline
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-ink-mute">
              <th className="px-5 py-2">Venue</th>
              <th className="px-5 py-2">Market</th>
              <th className="px-5 py-2">Stage</th>
              <th className="px-5 py-2">Conversion driver</th>
              <th className="px-5 py-2">Status</th>
              <th className="px-5 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {PIPELINE.map((p) => (
              <tr key={p.venue} className="border-t border-ink-line">
                <td className="px-5 py-2.5 font-medium text-ink">{p.venue}</td>
                <td className="px-5 py-2.5 text-ink-soft">{p.city}</td>
                <td className="px-5 py-2.5">
                  <span className={`rounded-pill px-2.5 py-0.5 text-[11px] font-bold ${STAGE_TONE[p.stage]}`}>
                    {p.stage}
                  </span>
                </td>
                <td className="px-5 py-2.5 text-ink-soft">{p.driver}</td>
                <td className="px-5 py-2.5 text-ink-soft">{p.since}</td>
                <td className="px-5 py-2.5 text-right">
                  <button className="text-xs font-bold text-coral hover:underline">
                    {p.stage === 'Founding' ? 'View as' : p.stage === 'Trial' ? 'Comp' : 'Log note'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-blue/30 bg-blue-soft px-5 py-4 text-sm text-blue-ink">
        <span className="font-bold">Hero feature so far:</span> GPS push &amp; analytics are driving the
        trial→paid conversions. Break-even is {KPIS.paying_venues}/6 venues —{' '}
        {KPIS.paying_venues >= 6 ? 'covered.' : `${6 - KPIS.paying_venues} to go.`} “View as” impersonation
        is time-boxed and audit-logged.
      </div>
    </div>
  )
}
