import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// GET /api/user/reviews — Lấy tất cả reviews của user đang đăng nhập
export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id, rating, comment, created_at, updated_at,
        document:documents (id, title, slug, thumbnail_url)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ reviews: data })
  } catch (error: unknown) {
    console.error('GET /api/user/reviews error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/user/reviews — Tạo đánh giá mới
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { document_id, rating, comment } = body

    if (!document_id || typeof document_id !== 'string') {
      return NextResponse.json({ error: 'Missing required field: document_id' }, { status: 400 })
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'rating must be an integer between 1 and 5' }, { status: 400 })
    }
    if (!comment || typeof comment !== 'string' || comment.trim().length < 10) {
      return NextResponse.json({ error: 'comment must be at least 10 characters' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        document_id,
        rating: Math.round(rating),
        comment: comment.trim(),
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'You have already reviewed this document' }, { status: 409 })
      }
      if (error.code === '23503') {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ review: data }, { status: 201 })
  } catch (error: unknown) {
    console.error('POST /api/user/reviews error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
