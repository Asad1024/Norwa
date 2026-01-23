import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Verify user is authenticated and is admin
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = user.user_metadata?.role === 'admin'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get the file from form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type (PDF, DOC, DOCX, etc.)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ]
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt']
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    
    if (!fileExt || !allowedExtensions.includes(`.${fileExt}`)) {
      return NextResponse.json(
        { error: 'File must be PDF, DOC, DOCX, or TXT' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const filePath = `technical-data/${fileName}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Determine content type
    const contentType = file.type || 
      (fileExt === 'pdf' ? 'application/pdf' :
       fileExt === 'doc' ? 'application/msword' :
       fileExt === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
       'application/octet-stream')

    // Upload using service role (bypasses RLS and storage policies)
    // Using product-images bucket (same as images) but in technical-data folder
    const { error: uploadError, data } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: contentType,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Get public URL from Supabase
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filePath)

    // Also construct manually as fallback
    const manualUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${filePath}`

    // Use Supabase URL if available, otherwise use manual construction
    const finalUrl = publicUrl || manualUrl

    return NextResponse.json({ url: finalUrl, fileName: file.name })
  } catch (error: any) {
    console.error('Error uploading technical data file:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
