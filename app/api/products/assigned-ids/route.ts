import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// This endpoint returns all product IDs that have assignments
// It uses service role to bypass RLS so we can see all assignments
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get all distinct product IDs that have assignments
    const { data: assignments, error } = await supabaseAdmin
      .from('product_user_assignments')
      .select('product_id')

    if (error) {
      console.error('Error fetching assigned product IDs:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Get unique product IDs
    const assignedProductIds = Array.from(
      new Set((assignments || []).map((a: any) => a.product_id))
    )

    return NextResponse.json({
      assignedProductIds,
    })
  } catch (error: any) {
    console.error('Error in assigned-ids route:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
