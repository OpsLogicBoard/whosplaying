export default function MapPage() {
  return (
    <section>
      <h1 className="font-display text-4xl">Map</h1>
      <p className="text-ink-soft mt-1">Venues and shows happening near you.</p>
      <div className="mt-6 aspect-[16/9] rounded-xl bg-canvas border border-ink-line flex items-center justify-center text-ink-mute">
        Mapbox/MapLibre canvas — wire packages/ui/src/brand/map-style.json
      </div>
    </section>
  )
}
