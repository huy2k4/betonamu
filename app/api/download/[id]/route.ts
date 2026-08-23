import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid parameter: id' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Retrieve client IP from standard proxy headers or fallback
    const xForwardedFor = request.headers.get('x-forwarded-for')
    const clientIp = xForwardedFor ? xForwardedFor.split(',')[0].trim() : '127.0.0.1'

    // Call RPC function to increment download_count and insert download log
    const { error: rpcError } = await supabase.rpc('increment_download_count', {
      doc_id: id,
      client_ip: clientIp,
    })

    if (rpcError) {
      console.error(`Failed to increment download count via RPC for doc ${id}:`, rpcError)
    }

    // Retrieve document file URL
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .select('file_url')
      .eq('id', id)
      .single()

    if (dbError || !document) {
      console.error(`Document fetch failed for id ${id}:`, dbError)
      return NextResponse.json(
        { error: 'Document not found or query failed' },
        { status: 404 }
      )
    }

    if (!document.file_url) {
      return NextResponse.json(
        { error: 'Document has no download URL configured' },
        { status: 404 }
      )
    }

    // Redirect to the external R2 file URL
    return NextResponse.redirect(document.file_url, 302)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Download Handler API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error occurred', details: errorMessage },
      { status: 500 }
    )
  }
}
