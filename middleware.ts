import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Cứu hộ khi Supabase Dashboard cấu hình nhầm Site URL thành https://domain/*
  // dẫn tới việc Supabase chuyển hướng về /*?code=xxx gây 404.
  // Tự động chuyển hướng về /auth/callback để hoàn tất đăng nhập session.
  if (pathname === '/*' || pathname === '/%2A' || pathname.startsWith('/*') || pathname.startsWith('/%2A')) {
    const url = request.nextUrl.clone();
    if (request.nextUrl.searchParams.has('code')) {
      url.pathname = '/auth/callback';
    } else {
      url.pathname = '/';
    }
    return NextResponse.redirect(url);
  }

  // Forward pathname vào request headers — cho phép Server Components (layout) đọc được
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // Build a response we can mutate for cookie refreshes
  let response = NextResponse.next({ request: { headers: requestHeaders } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          // Write cookies to both request and response so they are forwarded
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: always call getUser() — this refreshes the session cookie
  const { data: { user } } = await supabase.auth.getUser()

  const isUserApiRoute  = pathname.startsWith('/api/user');
  const isAccountPage   = pathname.startsWith('/account');
  const isAdminRoute    = pathname.startsWith('/admin') && pathname !== '/admin/login';

  // Bảo vệ API user
  if (!user && isUserApiRoute) {
    return NextResponse.json(
      { error: 'Unauthorized: Please sign in to continue' },
      { status: 401 }
    )
  }

  // Redirect về trang login nếu chưa đăng nhập khi vào account
  if (!user && isAccountPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // Bảo vệ khu vực admin — cho phép nếu có email @betonamu.admin HOẶC cookie admin_session=dev (local testing)
  if (isAdminRoute) {
    const isSupabaseAdmin = user?.email?.endsWith('@betonamu.admin') ?? false;
    const isDevAdminSession = request.cookies.get('admin_session')?.value === 'dev';

    if (!isSupabaseAdmin && !isDevAdminSession) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  return response
}

export const config = {
  matcher: [
    // Protect user API and account pages
    '/api/user/:path*',
    '/account/:path*',
    // Refresh sessions for all non-static routes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

