import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// GET /api/user/profile — Lấy profile của user đang đăng nhập
export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      // Profile chưa tồn tại (user mới trước khi trigger chạy)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ profile })
  } catch (error: unknown) {
    console.error('GET /api/user/profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/user/profile — Cập nhật profile
export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { display_name, bio } = body

    const updateData: Record<string, string> = {}
    if (typeof display_name === 'string') updateData.display_name = display_name.trim()
    if (typeof bio === 'string') updateData.bio = bio.trim()

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ profile })
  } catch (error: unknown) {
    console.error('PATCH /api/user/profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
