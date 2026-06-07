type Params = { params: Promise<{ slug: string }> }

export default async function VenuePublicPage({ params }: Params) {
  const { slug } = await params
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-5xl">{slug}</h1>
      <p className="mt-4 text-ink-soft">Public venue page. STUB.</p>
    </div>
  )
}
