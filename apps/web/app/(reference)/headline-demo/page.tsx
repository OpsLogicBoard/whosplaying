// Demo route — proves the <LayeredHeadline> primitive at four sizes and
// three palette variants. Sign-off gate for P0.4.

import { LayeredHeadline } from '@whosplaying/ui'

const SIZES = ['display', 'h1', 'h2', 'h3'] as const

const PALETTES: { label: string; palette: ('teal' | 'yellow' | 'coral' | 'orange')[] }[] = [
  { label: 'Canonical (teal · yellow · coral)', palette: ['teal', 'yellow', 'coral'] },
  { label: 'Sunset (orange · yellow · coral)', palette: ['orange', 'yellow', 'coral'] },
  { label: 'Ocean (coral · teal · yellow)', palette: ['coral', 'teal', 'yellow'] },
]

export default function HeadlineDemoPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="font-mono text-xs uppercase tracking-wider text-ink-soft">Phase 0 · primitive demo</p>
      <h1 className="mt-2 font-display text-3xl italic">&lt;LayeredHeadline&gt;</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        The signature type primitive. One readable headline; layered color blocks behind it.
        Below: four sizes from the canonical type scale, and three palette variants.
      </p>

      <section className="mt-12 space-y-16">
        {SIZES.map((size) => (
          <div key={size}>
            <p className="font-mono text-xs uppercase tracking-wider text-ink-mute">size = {size}</p>
            <div className="mt-3 space-y-10">
              {PALETTES.map(({ label, palette }) => (
                <div key={label} className="space-y-2">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">{label}</p>
                  <LayeredHeadline size={size} palette={palette} depth={3}>
                    Tonight in JAX Beach
                  </LayeredHeadline>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-20 rounded-lg border border-ink-line bg-paper-cool p-6">
        <h2 className="font-display text-2xl italic">Notes</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
          <li>Top layer is rendered in ink, exposed to screen readers.</li>
          <li>Color layers are <code className="font-mono text-xs">aria-hidden</code>.</li>
          <li>No entrance animation by default — automatically reduced-motion-safe.</li>
          <li>Offset defaults to 4px down-right per layer; override with the <code className="font-mono text-xs">offset</code> prop.</li>
          <li>Depth defaults to 3 (top ink + 2 color layers); palette wraps if depth exceeds palette length.</li>
        </ul>
      </section>
    </div>
  )
}
