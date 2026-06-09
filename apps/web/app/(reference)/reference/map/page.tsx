// Static map style preview — Phase 0 P0.6.
//
// A real MapLibre render needs a tiles URL and a Mapbox token, neither of
// which is wired up yet. This page paints an SVG schematic in the exact
// same palette and layer order as `packages/ui/src/brand/map-style.json`
// so the brand reads correctly without the network round-trip. The pin
// samples demonstrate the three event-status pin layers (active /
// confirmed / proposed) defined in the style.

import mapStyle from '@whosplaying/ui/brand/map-style.json'

type LayerInfo = { id: string; token: string; description: string }
const LAYER_INFO: LayerInfo[] = [
  { id: 'background', token: 'paper.base', description: 'Warm off-white land surface' },
  { id: 'water', token: 'teal.tint-1', description: 'Atlantic + Intracoastal' },
  { id: 'park', token: 'teal.tint-2', description: 'Parks, marsh, beach access' },
  { id: 'road-major', token: 'paper.tint-2', description: 'Motorway / trunk / primary' },
  { id: 'place-labels', token: 'ink.base', description: 'Neighborhood + place labels' },
  { id: 'pin-active', token: 'coral.base', description: 'Active live show right now' },
  { id: 'pin-confirmed', token: 'teal.base', description: 'Confirmed upcoming show' },
  { id: 'pin-proposed', token: 'yellow.base', description: 'Proposed — awaiting confirmation' },
]

export default function MapPreviewPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="font-mono text-xs uppercase tracking-wider text-ink-soft">Phase 0 · map style preview</p>
      <h1 className="mt-2 font-display text-3xl italic">JAX Beach — brand map style</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Schematic of <code className="font-mono text-xs">map-style.json</code>. Real MapLibre
        render is Phase 1 once tiles + token are wired.
      </p>

      <figure className="mt-8 overflow-hidden rounded-lg border border-ink-line bg-paper-warm">
        <svg viewBox="0 0 800 480" className="block h-auto w-full" aria-label="JAX Beach map schematic">
          {/* background — paper.base (#FFFCF2) */}
          <rect x="0" y="0" width="800" height="480" fill="#FFFCF2" />
          {/* water — Atlantic on the right, Intracoastal on the left — teal.tint-1 (#8FE8E8) */}
          <path d="M 620 0 L 800 0 L 800 480 L 600 480 Q 590 360 615 240 Q 640 120 620 0 Z" fill="#8FE8E8" />
          <path d="M 0 200 L 0 280 L 60 280 Q 90 240 60 200 Z" fill="#8FE8E8" />
          {/* park — teal.tint-2 (#E6FBFB) — beach access strip + a couple parks */}
          <path d="M 580 0 L 620 0 L 615 240 L 590 360 L 600 480 L 565 480 Q 555 360 580 240 Q 600 120 580 0 Z" fill="#E6FBFB" />
          <rect x="100" y="100" width="80" height="60" rx="8" fill="#E6FBFB" />
          <rect x="380" y="320" width="120" height="40" rx="8" fill="#E6FBFB" />
          {/* roads — paper.tint-2 (#FFFFFF) on warm ground */}
          <line x1="0" y1="240" x2="565" y2="240" stroke="#FFFFFF" strokeWidth="6" />
          <line x1="280" y1="0" x2="280" y2="480" stroke="#FFFFFF" strokeWidth="6" />
          <line x1="440" y1="80" x2="440" y2="480" stroke="#FFFFFF" strokeWidth="4" />
          <line x1="80" y1="80" x2="565" y2="80" stroke="#FFFFFF" strokeWidth="4" />
          <line x1="80" y1="400" x2="565" y2="400" stroke="#FFFFFF" strokeWidth="4" />
          {/* labels — ink.base (#0E1A1A) with halo */}
          {[
            { x: 200, y: 230, label: 'Atlantic Blvd' },
            { x: 300, y: 100, label: 'Neptune Beach' },
            { x: 350, y: 350, label: 'Jax Beach' },
            { x: 460, y: 90, label: 'Beach Blvd' },
          ].map((l) => (
            <text
              key={l.label}
              x={l.x}
              y={l.y}
              fontFamily='"DM Sans", system-ui, sans-serif'
              fontSize="14"
              fontWeight="500"
              fill="#0E1A1A"
              stroke="#FFFFFF"
              strokeWidth="3"
              paintOrder="stroke"
            >
              {l.label}
            </text>
          ))}
          {/* pin-active — coral.base */}
          <g>
            <circle cx="240" cy="180" r="11" fill="#FF4D63" stroke="#FFFFFF" strokeWidth="2.5" />
            <text x="256" y="184" fontFamily='"DM Sans", system-ui, sans-serif' fontSize="12" fontWeight="600" fill="#0E1A1A">Live now</text>
          </g>
          <g>
            <circle cx="380" cy="280" r="11" fill="#FF4D63" stroke="#FFFFFF" strokeWidth="2.5" />
            <text x="396" y="284" fontFamily='"DM Sans", system-ui, sans-serif' fontSize="12" fontWeight="600" fill="#0E1A1A">Live now</text>
          </g>
          {/* pin-confirmed — teal.base */}
          <g>
            <circle cx="160" cy="340" r="10" fill="#0AA3A3" stroke="#FFFFFF" strokeWidth="2.5" />
            <text x="176" y="344" fontFamily='"DM Sans", system-ui, sans-serif' fontSize="12" fontWeight="500" fill="#0E1A1A">Confirmed</text>
          </g>
          <g>
            <circle cx="500" cy="200" r="10" fill="#0AA3A3" stroke="#FFFFFF" strokeWidth="2.5" />
            <text x="516" y="204" fontFamily='"DM Sans", system-ui, sans-serif' fontSize="12" fontWeight="500" fill="#0E1A1A">Confirmed</text>
          </g>
          {/* pin-proposed — yellow.base */}
          <g>
            <circle cx="320" cy="420" r="9" fill="#FFCB05" stroke="#0E1A1A" strokeWidth="2" />
            <text x="334" y="424" fontFamily='"DM Sans", system-ui, sans-serif' fontSize="12" fontWeight="500" fill="#0E1A1A">Proposed</text>
          </g>
        </svg>
        <figcaption className="border-t border-ink-line bg-paper px-4 py-3 text-sm text-ink-soft">
          <strong className="font-display italic text-ink">JAX Beach — schematic.</strong>{' '}
          Real tiles render in Phase 1 once <code className="font-mono text-xs">NEXT_PUBLIC_MAPBOX_TOKEN</code> is provisioned.
        </figcaption>
      </figure>

      <section className="mt-12">
        <h2 className="font-display text-2xl italic">Layer → token mapping</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Style version: <code className="font-mono text-xs">{(mapStyle as { version: number }).version}</code>{' '}
          · {(mapStyle as { layers: unknown[] }).layers.length} layers.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {LAYER_INFO.map((l) => (
            <li key={l.id} className="rounded-md border border-ink-line bg-paper-cool p-3">
              <p className="font-mono text-xs uppercase tracking-wider text-ink-mute">{l.id}</p>
              <p className="font-display text-lg italic">{l.token}</p>
              <p className="text-sm text-ink-soft">{l.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
