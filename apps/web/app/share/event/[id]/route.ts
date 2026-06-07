// OG image generator stub — production uses @vercel/og or Satori.
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  return NextResponse.json(
    { error: 'not_implemented', endpoint: 'og-image', event: id },
    { status: 501 },
  )
}
