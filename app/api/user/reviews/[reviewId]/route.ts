import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// PATCH /api/user/reviews/[reviewId] — Sửa đánh giá
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { rating, comment } = body

    const updateData: Record<string, unknown> = {}
    if (rating !== undefined) {
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return NextResponse.json({ error: 'rating must be an integer between 1 and 5' }, { status: 400 })
      }
      updateData.rating = Math.round(rating)
    }
    if (comment !== undefined) {
      if (typeof comment !== 'string' || comment.trim().length < 10) {
        return NextResponse.json({ error: 'comment must be at least 10 characters' }, { status: 400 })
      }
      updateData.comment = comment.trim()
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // RLS đảm bảo chỉ owner mới update được — thêm .eq('user_id') để trả 404 thay vì 0 rows
    const { data, error, count } = await supabase
      .from('reviews')
      .update(updateData, { count: 'exact' })
      .eq('id', reviewId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    if (!count) {
      return NextResponse.json({ error: 'Review not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ review: data })
  } catch (error: unknown) {
    console.error('PATCH /api/user/reviews/[reviewId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/user/reviews/[reviewId] — Xóa đánh giá
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error, count } = await supabase
      .from('reviews')
      .delete({ count: 'exact' })
      .eq('id', reviewId)
      .eq('user_id', user.id)

    if (error) throw error
    if (!count) {
      return NextResponse.json({ error: 'Review not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('DELETE /api/user/reviews/[reviewId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
