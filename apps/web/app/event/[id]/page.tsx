type Params = { params: Promise<{ id: string }> }

export default async function EventPublicPage({ params }: Params) {
  const { id } = await params
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-5xl">Event {id}</h1>
      <p className="mt-4 text-ink-soft">Public share page. SSR for OG tags. STUB.</p>
    </div>
  )
}
