import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
      .from('vocabularies')
      .select('*, vocab_examples(*)')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

import { getAdminClient } from '@/utils/supabase/admin'

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const { supabase, isAdmin } = await getAdminClient()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Access is restricted to administrators' }, { status: 401 })
    }

    const body = await request.json()
    const { examples, ...vocabFields } = body

    const { data, error } = await supabase
      .from('vocabularies')
      .update(vocabFields)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Cập nhật examples nếu có
    if (examples !== undefined) {
      await supabase.from('vocab_examples').delete().eq('vocab_id', id)
      if (examples.length > 0) {
        const examplesPayload = examples.map((ex: { sentence: string; reading?: string; translation: string }, idx: number) => ({
          vocab_id: id,
          sentence: ex.sentence,
          reading: ex.reading ?? null,
          translation: ex.translation,
          position: idx,
        }))
        await supabase.from('vocab_examples').insert(examplesPayload)
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params
    const { supabase, isAdmin } = await getAdminClient()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Access is restricted to administrators' }, { status: 401 })
    }

    // Soft delete
    const { error } = await supabase
      .from('vocabularies')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
