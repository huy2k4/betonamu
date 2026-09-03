import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

type Params = { params: Promise<{ planId: string; day: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { planId, day } = await params
    const dayNumber = parseInt(day)
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the plan day
    const { data: planDay, error: dayError } = await supabase
      .from('vocab_study_plan_days')
      .select(`
        id,
        day_number,
        is_completed,
        vocab_study_plan_words (
          position,
          vocab_id,
          vocabularies (
            id, word, reading, romaji, han_viet, meanings, part_of_speech, jlpt_level,
            vocab_examples (sentence, reading, translation)
          )
        )
      `)
      .eq('plan_id', planId)
      .eq('day_number', dayNumber)
      .single()

    if (dayError || !planDay) {
      return NextResponse.json({ error: 'Day not found' }, { status: 404 })
    }

    // Sort words by position
    const words = (planDay.vocab_study_plan_words ?? [])
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
      .map((pw: { vocabularies: unknown }) => pw.vocabularies)
      .filter(Boolean)

    // Get review words: from previous days, result was unknown/hard
    const { data: reviewLogs } = await supabase
      .from('vocab_review_log')
      .select('vocab_id, result')
      .eq('user_id', user.id)
      .in('result', ['unknown', 'hard'])
      .gte('reviewed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    let reviewWords: unknown[] = []
    if (reviewLogs && reviewLogs.length > 0) {
      // Only include words NOT already in today's plan
      const todayIds = new Set((words as { id: string }[]).map(w => w.id))
      const reviewIds = [...new Set(reviewLogs.map(l => l.vocab_id))].filter(id => !todayIds.has(id))

      if (reviewIds.length > 0) {
        // Limit to max 5 review words
        const limited = reviewIds.slice(0, 5)
        const { data: reviewVocabs } = await supabase
          .from('vocabularies')
          .select('id, word, reading, romaji, han_viet, meanings, part_of_speech, jlpt_level, vocab_examples (sentence, reading, translation)')
          .in('id', limited)
        reviewWords = reviewVocabs ?? []
      }
    }

    return NextResponse.json({
      success: true,
      dayId: planDay.id,
      dayNumber: planDay.day_number,
      isCompleted: planDay.is_completed,
      words,
      reviewWords,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
