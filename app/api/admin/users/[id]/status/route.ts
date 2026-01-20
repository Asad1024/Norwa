import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

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
      data: { user: currentUser },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token)

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = currentUser.user_metadata?.role === 'admin'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Prevent deactivating yourself
    if (currentUser.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot deactivate yourself' },
        { status: 400 }
      )
    }

    const { isActive } = await request.json()

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid status. Must be boolean' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: targetUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(params.id)

    if (getUserError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user: ban if inactive, unban if active
    const updateData: any = {
      user_metadata: {
        ...targetUser.user.user_metadata,
        is_active: isActive,
      },
    }

    // Use Supabase ban functionality for deactivation
    if (!isActive) {
      updateData.ban_duration = '876000h' // ~100 years (effectively permanent)
    } else {
      updateData.ban_duration = 'none'
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      params.id,
      updateData
    )

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        is_active: isActive,
      },
    })
  } catch (error: any) {
    console.error('Error updating user status:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
