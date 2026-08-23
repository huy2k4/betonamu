import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * @swagger
 * /api/admin/documents:
 *   post:
 *     summary: Create a new document
 *     description: Save document metadata to the database. Requires administrator privileges.
 *     tags:
 *       - Documents
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - slug
 *               - thumbnail_url
 *               - file_url
 *               - summary
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Company Handbook 2026"
 *               slug:
 *                 type: string
 *                 example: "company-handbook-2026"
 *               thumbnail_url:
 *                 type: string
 *                 example: "https://s3.amazonaws.com/.../thumb.png"
 *               file_url:
 *                 type: string
 *                 example: "https://s3.amazonaws.com/.../doc.pdf"
 *               preview_file_url:
 *                 type: string
 *               summary:
 *                 type: string
 *                 example: "The official employee handbook."
 *               file_type:
 *                 type: string
 *                 default: "pdf"
 *               file_size_bytes:
 *                 type: integer
 *                 default: 0
 *               page_count:
 *                 type: integer
 *                 default: 0
 *     responses:
 *       200:
 *         description: Document created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 document:
 *                   type: object
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function POST(request: Request) {
  try {
    const bypassAuth = process.env.BYPASS_AUTH_FOR_DEV === 'true' && process.env.NODE_ENV === 'development'
    const cookieStore = await cookies()
    
    // Nếu bypassAuth, dùng Service Role Key để có toàn quyền (bỏ qua RLS). Ngược lại, dùng user cookie.
    const supabase = bypassAuth && process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY)
      : createClient(cookieStore)

    if (!bypassAuth) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized: Access is restricted to administrators' },
          { status: 401 }
        )
      }
    }

    const body = await request.json()
    const { title, slug, thumbnail_url, file_url, preview_file_url, summary, file_type, file_size_bytes, page_count } = body

    if (!title || !slug || !thumbnail_url || !file_url || !summary) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, thumbnail_url, file_url, summary' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('documents')
      .insert({
        title,
        slug,
        thumbnail_url,
        file_url,
        preview_file_url,
        summary,
        file_type: file_type || 'pdf',
        file_size_bytes: file_size_bytes || 0,
        page_count: page_count || 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting document:', error)
      return NextResponse.json(
        { error: 'Failed to save document to database', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, document: data })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Document Create API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error occurred', details: errorMessage },
      { status: 500 }
    )
  }
}
