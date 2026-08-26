import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Build a response we can mutate for cookie refreshes
  let response = NextResponse.next({ request: { headers: request.headers } })

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

  const isUserApiRoute = pathname.startsWith('/api/user')
  const isAccountPage  = pathname.startsWith('/account')

  if (!user && isUserApiRoute) {
    return NextResponse.json(
      { error: 'Unauthorized: Please sign in to continue' },
      { status: 401 }
    )
  }

  if (!user && isAccountPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
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

