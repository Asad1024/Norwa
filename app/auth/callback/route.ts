import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    // Check if this is a new Google OAuth user who needs to complete their profile
    if (data?.user) {
      const user = data.user
      const metadata = user.user_metadata || {}
      
      // FIRST: Check if user is banned/deactivated - this must happen before any other checks
      let isDeactivated = false
      
      // Check if user is banned/deactivated using admin client for accurate status
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (supabaseUrl && serviceRoleKey) {
        try {
          const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          })
          
          // Get the latest user data from admin API to ensure we have the most up-to-date status
          const { data: adminUserData, error: adminError } = await supabaseAdmin.auth.admin.getUserById(user.id)
          
          if (!adminError && adminUserData?.user) {
            const adminUser = adminUserData.user
            const adminMetadata = adminUser.user_metadata || {}
            
            // Check if user is banned/deactivated
            if (adminUser.banned_until || adminMetadata.is_active === false) {
              isDeactivated = true
            }
          } else {
            // If admin check fails, fallback to checking user metadata
            if (user.banned_until || metadata.is_active === false) {
              isDeactivated = true
            }
          }
        } catch (error) {
          console.error('Error checking user status with admin client:', error)
          // Fallback to checking user metadata if admin client fails
          if (user.banned_until || metadata.is_active === false) {
            isDeactivated = true
          }
        }
      } else {
        // Fallback to checking metadata if admin client is not available
        if (user.banned_until || metadata.is_active === false) {
          isDeactivated = true
        }
      }
      
      // If user is deactivated, sign out and redirect to login with error - MUST RETURN HERE
      if (isDeactivated) {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/login?error=account_deactivated`)
      }
      
      // Check if user is from Google OAuth and doesn't have name or phone
      const isGoogleUser = user.app_metadata?.provider === 'google'
      const hasName = metadata.full_name || metadata.name || metadata.display_name
      const hasPhone = metadata.phone
      
      // If Google user and missing name or phone, redirect to register to complete profile
      if (isGoogleUser && (!hasName || !hasPhone)) {
        const email = encodeURIComponent(user.email || '')
        const name = encodeURIComponent(hasName || '')
        const phone = encodeURIComponent(hasPhone || '')
        
        return NextResponse.redirect(
          `${origin}/register?google_complete=true&email=${email}&name=${name}&phone=${phone}`
        )
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/`)
}
