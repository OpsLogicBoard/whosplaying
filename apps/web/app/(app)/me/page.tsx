import { Chip } from '@whosplaying/ui'

export default function MePage() {
  return (
    <section>
      <h1 className="font-display text-4xl">Me</h1>
      <p className="text-ink-soft mt-1">Your profile and the hats you wear.</p>
      <div className="mt-6 flex gap-2 flex-wrap">
        <Chip tone="teal">Goer</Chip>
        <Chip tone="yellow">+ Artist</Chip>
        <Chip tone="orange">+ Venue owner</Chip>
        <Chip tone="ink">+ Venue staff</Chip>
      </div>
    </section>
  )
}
