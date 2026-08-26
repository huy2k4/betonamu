import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// GET /api/user/balo — Lấy danh sách balo của user
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
      .from('balo_items')
      .select(`
        id,
        note,
        created_at,
        document:documents (
          id, title, slug, thumbnail_url, summary,
          file_type, file_size_bytes, download_count, avg_rating, is_hot
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    return NextResponse.json({
      items: data,
      pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
    })
  } catch (error: unknown) {
    console.error('GET /api/user/balo error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/user/balo — Thêm tài liệu vào balo
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { document_id, note } = body

    if (!document_id || typeof document_id !== 'string') {
      return NextResponse.json({ error: 'Missing required field: document_id' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('balo_items')
      .insert({ user_id: user.id, document_id, note: note?.trim() || null })
      .select()
      .single()

    if (error) {
      // Unique violation = đã có trong balo rồi
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Document already in balo' }, { status: 409 })
      }
      // FK violation = document không tồn tại
      if (error.code === '23503') {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ item: data }, { status: 201 })
  } catch (error: unknown) {
    console.error('POST /api/user/balo error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
