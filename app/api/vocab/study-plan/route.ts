import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, jlpt_level, description, days } = body
    // days: [{ day_number: 1, vocab_ids: ['uuid1','uuid2'] }]

    if (!title || !days?.length) {
      return NextResponse.json({ error: 'Missing title or days' }, { status: 400 })
    }

    // 1. Create the plan
    const { data: plan, error: planError } = await supabase
      .from('vocab_study_plans')
      .insert({ user_id: user.id, title, jlpt_level: jlpt_level ?? null, description: description ?? null })
      .select()
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: planError?.message ?? 'Plan insert failed' }, { status: 500 })
    }

    // 2. Create plan days
    const daysPayload = days.map((d: { day_number: number; vocab_ids: string[] }) => ({
      plan_id: plan.id,
      day_number: d.day_number,
    }))
    const { data: createdDays, error: daysError } = await supabase
      .from('vocab_study_plan_days')
      .insert(daysPayload)
      .select()

    if (daysError || !createdDays) {
      return NextResponse.json({ error: daysError?.message ?? 'Days insert failed' }, { status: 500 })
    }

    // 3. Create plan words for each day
    for (const day of days as { day_number: number; vocab_ids: string[] }[]) {
      const createdDay = createdDays.find(d => d.day_number === day.day_number)
      if (!createdDay || !day.vocab_ids?.length) continue

      const wordsPayload = day.vocab_ids.map((vid: string, idx: number) => ({
        day_id: createdDay.id,
        vocab_id: vid,
        position: idx,
      }))
      const { error: wordsError } = await supabase.from('vocab_study_plan_words').insert(wordsPayload)
      if (wordsError) console.error('Words insert error:', wordsError)
    }

    return NextResponse.json({ success: true, planId: plan.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('vocab_study_plans')
      .select(`
        *,
        vocab_study_plan_days (
          *,
          vocab_study_plan_words (
            position,
            vocab_id,
            vocabularies (id, word, reading, meanings, jlpt_level)
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
