import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// DELETE /api/user/balo/[documentId] — Xóa tài liệu khỏi balo
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params

    if (!documentId) {
      return NextResponse.json({ error: 'Missing document ID' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error, count } = await supabase
      .from('balo_items')
      .delete({ count: 'exact' })
      .eq('user_id', user.id)
      .eq('document_id', documentId)

    if (error) throw error

    if (count === 0) {
      return NextResponse.json({ error: 'Item not found in balo' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('DELETE /api/user/balo/[documentId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
