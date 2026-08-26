import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// GET /api/user/search-history — Lấy lịch sử tìm kiếm
export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('search_history')
      .select('id, query, result_count, searched_at')
      .eq('user_id', user.id)
      .order('searched_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ history: data })
  } catch (error: unknown) {
    console.error('GET /api/user/search-history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/user/search-history — Ghi lịch sử tìm kiếm (gọi nội bộ từ search flow)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      // Nếu user chưa đăng nhập, bỏ qua — không lỗi
      return NextResponse.json({ skipped: true })
    }

    const body = await request.json()
    const { query, result_count } = body

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Missing or empty query' }, { status: 400 })
    }

    const { error } = await supabase
      .from('search_history')
      .insert({
        user_id: user.id,
        query: query.trim(),
        result_count: typeof result_count === 'number' ? result_count : 0,
      })

    if (error) throw error

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error: unknown) {
    console.error('POST /api/user/search-history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/user/search-history — Xóa toàn bộ lịch sử tìm kiếm
export async function DELETE() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('DELETE /api/user/search-history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
