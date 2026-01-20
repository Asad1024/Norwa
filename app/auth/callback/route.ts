import { createClient } from '@/lib/supabase/server'
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
      
      // Check if user is banned/deactivated
      if (user.banned_until || metadata.is_active === false) {
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
