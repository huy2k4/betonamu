import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function getAdminClient(): Promise<{
  supabase: SupabaseClient
  user: { id?: string; email?: string } | null
  isAdmin: boolean
}> {
  const cookieStore = await cookies()
  const isDevAdminSession = cookieStore.get('admin_session')?.value === 'dev'
  const isBypassAuth = process.env.BYPASS_AUTH_FOR_DEV === 'true' && process.env.NODE_ENV === 'development'

  // Service role client bypasses RLS for administrative operations
  const serviceClient = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false }
      })
    : null

  const userClient = createClient(cookieStore)
  const { data: { user } } = await userClient.auth.getUser()

  const isSupabaseAdmin = user?.email?.endsWith('@betonamu.admin') ?? false
  const isAdmin = isSupabaseAdmin || isDevAdminSession || isBypassAuth

  const supabase = (isAdmin && serviceClient) ? serviceClient : (userClient as unknown as SupabaseClient)

  return { supabase, user, isAdmin }
}
