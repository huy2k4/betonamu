import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const searchParams = url.searchParams
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // Khi deploy lên Vercel/VPS, request.url có thể trả về localhost hoặc server nội bộ
  // Ta cần ưu tiên lấy domain thực từ header (do Nginx/Vercel proxy gửi tới)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
  
  let origin = url.origin
  if (forwardedHost) {
    origin = `${forwardedProto}://${forwardedHost}`
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('Auth callback error:', error.message)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
