import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// This endpoint returns the current user's assigned product IDs
// Uses server-side Supabase client to properly handle RLS
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        assignedProductIds: [],
      })
    }

    // Get current user's assigned products
    const { data: userAssignments, error } = await supabase
      .from('product_user_assignments')
      .select('product_id')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching user assignments:', error)
      // Return empty array on error (safer than showing restricted products)
      return NextResponse.json({
        assignedProductIds: [],
      })
    }

    // Convert to array of product IDs (as strings)
    const assignedProductIds = (userAssignments || []).map((a: any) => String(a.product_id).trim())
    
    console.log('[user-assignments API] User assignments:', {
      userId: user.id,
      assignedProductIds
    })

    return NextResponse.json({
      assignedProductIds,
    })
  } catch (error: any) {
    console.error('Error in user-assignments route:', error)
    return NextResponse.json(
      { assignedProductIds: [] },
      { status: 200 } // Return empty array instead of error
    )
  }
}
