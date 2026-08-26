import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// GET /api/user/recommendations — Gợi ý tài liệu dựa trên hành vi user
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '10')))

    const { data, error } = await supabase.rpc('get_recommendations_for_user', {
      target_user_id: user.id,
      limit_count: limit,
    })

    if (error) throw error

    // Nếu user mới chưa có dữ liệu hành vi, trả về tài liệu hot nhất
    if (!data || data.length === 0) {
      const { data: hotDocs, error: hotError } = await supabase
        .from('documents')
        .select('id, title, slug, thumbnail_url, summary, download_count, avg_rating')
        .order('download_count', { ascending: false })
        .limit(limit)

      if (hotError) throw hotError

      return NextResponse.json({ recommendations: hotDocs, fallback: true })
    }

    return NextResponse.json({ recommendations: data, fallback: false })
  } catch (error: unknown) {
    console.error('GET /api/user/recommendations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
