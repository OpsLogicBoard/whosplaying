import { FLAGS, MODERATION, AUDIT } from '../_data'

export default function AdminMaintenance() {
  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-h2 text-ink-deep">Maintenance</h1>
        <p className="text-body-sm text-ink-soft">Feature flags · moderation · audit log</p>
      </div>

      {/* Feature flags */}
      <div className="rounded-lg border border-ink-line bg-surface shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-ink-line text-[11px] font-bold uppercase tracking-wide text-ink-mute">
          Feature flags &amp; kill switches
        </div>
        {FLAGS.map((f, i) => (
          <div
            key={f.key}
            className={`flex items-center gap-4 px-5 py-3 ${i < FLAGS.length - 1 ? 'border-b border-ink-line' : ''}`}
          >
            <div className="flex-1">
              <div className="text-sm font-semibold text-ink">{f.label}</div>
              <div className="text-xs text-ink-mute">{f.note}</div>
            </div>
            <code className="text-xs text-ink-mute font-mono">{f.key}</code>
            <span
              className={`inline-flex items-center rounded-pill px-3 py-1 text-[11px] font-bold ${
                f.on ? 'bg-green-soft text-green' : 'bg-ink-line text-ink-soft'
              }`}
            >
              {f.on ? 'ON' : 'OFF'}
            </span>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Moderation queue */}
        <div className="rounded-lg border border-ink-line bg-surface shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-ink-line flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">Moderation queue</span>
            <span className="rounded-pill bg-coral-soft px-2 py-0.5 text-[11px] font-bold text-coral">
              {MODERATION.length}
            </span>
          </div>
          {MODERATION.map((m, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3 border-t border-ink-line first:border-t-0">
              <span className="rounded bg-ink-line px-2 py-0.5 text-[10px] font-bold uppercase text-ink-soft mt-0.5">
                {m.type}
              </span>
              <div className="flex-1">
                <div className="text-sm font-medium text-ink">{m.name}</div>
                <div className="text-xs text-ink-mute">{m.reason} · {m.age}</div>
              </div>
              <button className="text-xs font-bold text-coral hover:underline">Review</button>
            </div>
          ))}
        </div>

        {/* Audit log */}
        <div className="rounded-lg border border-ink-line bg-surface shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-ink-line text-[11px] font-bold uppercase tracking-wide text-ink-mute">
            Audit log
          </div>
          {AUDIT.map((a, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3 border-t border-ink-line first:border-t-0">
              <span className="h-1.5 w-1.5 rounded-full bg-purple mt-2 shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium text-ink">{a.action}</div>
                <div className="text-xs text-ink-mute">{a.target}</div>
              </div>
              <div className="text-right text-xs text-ink-mute">
                <div className="font-mono">{a.actor}</div>
                <div>{a.at}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-ink-line bg-surface px-5 py-4 text-sm text-ink-soft">
        User / venue / org management &amp; ownership transfer live here too — every write is recorded in the
        audit log via <code className="font-mono text-xs text-ink">admin_log()</code>.
      </div>
    </div>
  )
}
