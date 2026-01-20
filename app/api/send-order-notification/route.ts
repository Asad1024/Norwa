import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { order, orderItems, userEmail, userName } = await request.json()

    // Validate required fields
    if (!order || !orderItems || !userEmail) {
      return NextResponse.json(
        { error: 'Order data is required' },
        { status: 400 }
      )
    }

    // Call Supabase Edge Function
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'order_notification',
        data: {
          order,
          orderItems,
          userEmail,
          userName,
        },
      },
    })

    if (error) {
      console.error('Supabase Edge Function error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error sending order notification email:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
