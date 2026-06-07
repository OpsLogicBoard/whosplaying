// Per-artist / per-venue ICS feed — proxies to the supabase edge function once implemented.
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  context: { params: Promise<{ type: string; id: string }> },
) {
  const { type, id } = await context.params
  if (!['artist', 'band', 'venue'].includes(type)) {
    return NextResponse.json({ error: 'bad_type' }, { status: 400 })
  }
  return NextResponse.json({ error: 'not_implemented', type, id }, { status: 501 })
}
