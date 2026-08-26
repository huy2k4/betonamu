import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// GET /api/user/downloads — Lịch sử tải của user
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page  = Math.max(1, parseInt(searchParams.get('page')  || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')))
    const from  = (page - 1) * limit
    const to    = from + limit - 1

    const { data, error, count } = await supabase
      .from('user_downloads')
      .select(`
        id,
        downloaded_at,
        document:documents (
          id, title, slug, thumbnail_url, summary,
          file_type, file_size_bytes, download_count, avg_rating
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('downloaded_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    return NextResponse.json({
      items: data,
      pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
    })
  } catch (error: unknown) {
    console.error('GET /api/user/downloads error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
