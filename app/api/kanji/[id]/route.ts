import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data, error } = await supabase.from('kanji').select('*').eq('id', id).single()
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true, data })
}

import { getAdminClient } from '@/utils/supabase/admin'

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params
  const { supabase, isAdmin } = await getAdminClient()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { data, error } = await supabase.from('kanji').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const { supabase, isAdmin } = await getAdminClient()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { error } = await supabase.from('kanji').update({ is_active: false }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
