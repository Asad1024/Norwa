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

    // Prevent removing your own admin role
    if (currentUser.id === params.id) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      )
    }

    const { role } = await request.json()

    if (!role || (role !== 'admin' && role !== 'user')) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "admin" or "user"' },
        { status: 400 }
      )
    }

    // Get current user metadata
    const { data: targetUser, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(params.id)

    if (getUserError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user metadata with new role
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      params.id,
      {
        user_metadata: {
          ...targetUser.user.user_metadata,
          role: role,
        },
      }
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
        role: data.user.user_metadata?.role || 'user',
      },
    })
  } catch (error: any) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
