import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { pageKey: string } }
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

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { pageKey } = params
    const { searchParams } = new URL(request.url)
    const lang = searchParams.get('lang') || 'en'

    // Get page content (public endpoint)
    const { data: page, error } = await supabaseAdmin
      .from('page_content')
      .select('*')
      .eq('page_key', pageKey)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Page not found
        return NextResponse.json(
          { error: 'Page not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!page) {
      return NextResponse.json({
        page: null,
      })
    }

    // Extract content for the requested language
    let content = page.content || {}
    if (content.en || content.no) {
      // New format with translations
      content = content[lang as 'en' | 'no'] || content.en || {}
    }

    // Get title and subtitle for requested language
    const titleTranslations = page.title_translations || { en: page.title || '', no: page.title || '' }
    const subtitleTranslations = page.subtitle_translations || { en: page.subtitle || '', no: page.subtitle || '' }

    return NextResponse.json({
      page: {
        ...page,
        title: titleTranslations[lang as 'en' | 'no'] || titleTranslations.en || '',
        subtitle: subtitleTranslations[lang as 'en' | 'no'] || subtitleTranslations.en || '',
        content,
      },
    })
  } catch (error: any) {
    console.error('Error fetching page content:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
