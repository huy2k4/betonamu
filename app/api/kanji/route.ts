import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { searchParams } = new URL(request.url)
    const jlpt   = searchParams.get('jlpt')
    const search = searchParams.get('search')
    const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit  = Math.min(100, parseInt(searchParams.get('limit') ?? '20'))
    const offset = (page - 1) * limit

    let query = supabase
      .from('kanji')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .range(offset, offset + limit - 1)
      .order('jlpt_level', { ascending: true })
      .order('frequency', { ascending: true, nullsFirst: false })

    if (jlpt)   query = query.eq('jlpt_level', jlpt)
    if (search) {
      query = query.or(`character.eq.${search},han_viet.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

import { getAdminClient } from '@/utils/supabase/admin'

export async function POST(request: Request) {
  try {
    const { supabase, isAdmin } = await getAdminClient()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Access is restricted to administrators' }, { status: 401 })
    }

    const body = await request.json()
    const {
      character, onyomi, kunyomi, han_viet, meanings, mnemonic,
      notes, jlpt_level, stroke_count, radicals, stroke_order_url,
      frequency, tags, examples,
    } = body

    if (!character || !meanings?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: character, meanings' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('kanji')
      .insert({
        character, han_viet, mnemonic, notes, jlpt_level,
        stroke_count: stroke_count ?? null,
        frequency: frequency ?? null,
        stroke_order_url: stroke_order_url ?? null,
        onyomi: onyomi ?? [],
        kunyomi: kunyomi ?? [],
        meanings: meanings ?? [],
        radicals: radicals ?? [],
        tags: tags ?? [],
        examples: examples ?? [],
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
