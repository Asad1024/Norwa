import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Public endpoint to get enabled navigation links
export async function GET(request: NextRequest) {
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

    // Get only enabled nav links, ordered by sort_order
    const { data: navLinks, error } = await supabaseAdmin
      .from('nav_links_settings')
      .select('link_key, href')
      .eq('is_enabled', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching nav links:', error)
      // Return default links if table doesn't exist yet
      return NextResponse.json({
        navLinks: [
          { link_key: 'products', href: '/products' },
          { link_key: 'about', href: '/about' },
          { link_key: 'how-to-use', href: '/how-to-use' },
          { link_key: 'contact', href: '/contact' },
        ],
      })
    }

    return NextResponse.json({
      navLinks: navLinks || [],
    })
  } catch (error: any) {
    console.error('Error in nav-links route:', error)
    // Return default links on error
    return NextResponse.json({
      navLinks: [
        { link_key: 'products', href: '/products' },
        { link_key: 'about', href: '/about' },
        { link_key: 'how-to-use', href: '/how-to-use' },
        { link_key: 'contact', href: '/contact' },
      ],
    })
  }
}
