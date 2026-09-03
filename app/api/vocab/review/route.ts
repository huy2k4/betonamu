import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { vocab_id, plan_day_id, result } = await request.json()
    if (!vocab_id || !result) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const { error } = await supabase.from('vocab_review_log').insert({
      user_id: user.id,
      vocab_id,
      plan_day_id: plan_day_id ?? null,
      result,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
