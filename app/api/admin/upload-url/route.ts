import { NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { getR2Client, getR2Config } from '@/lib/r2'

export async function POST(request: Request) {
  try {
    // 1. Authenticate user (or bypass in dev mode if explicitly configured)
    const bypassAuth = process.env.BYPASS_AUTH_FOR_DEV === 'true' && process.env.NODE_ENV === 'development'

    if (!bypassAuth) {
      const cookieStore = await cookies()
      const supabase = createClient(cookieStore)
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) {
        return NextResponse.json(
          { error: 'Unauthorized: Access is restricted to administrators' },
          { status: 401 }
        )
      }
    }

    // 2. Validate request body
    const body = await request.json()
    const { fileName, fileType } = body

    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid parameter: fileName' },
        { status: 400 }
      )
    }
    if (!fileType || typeof fileType !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid parameter: fileType' },
        { status: 400 }
      )
    }

    // Prohibit hardcoded names, construct a unique name with timestamp to prevent collisions
    const lastDotIndex = fileName.lastIndexOf('.')
    const fileExtension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : ''
    const baseName = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName
    const cleanBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_')
    const uniqueKey = `documents/${Date.now()}-${cleanBaseName}${fileExtension || '.pdf'}`

    // 3. Initialize R2 Client dynamically at runtime
    const r2Client = getR2Client()
    const { bucketName, publicDomain } = getR2Config()

    // 4. Create S3 command
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueKey,
      ContentType: fileType,
    })

    // Presigned URL valid for 60 seconds
    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 60 })

    // Construct fileUrl carefully to avoid double https://
    const finalDomain = publicDomain.startsWith('http') ? publicDomain : `https://${publicDomain}`
    
    return NextResponse.json({
      uploadUrl,
      fileUrl: `${finalDomain}/${uniqueKey}`,
      key: uniqueKey,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Presigned URL API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error occurred', details: errorMessage },
      { status: 500 }
    )
  }
}
