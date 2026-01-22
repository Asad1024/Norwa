import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Translation API endpoint
// Uses LibreTranslate (free, open-source) or Google Translate API
export async function POST(request: NextRequest) {
  try {
    const { text, from = 'en', to = 'no' } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // If text is empty, return empty string
    if (!text.trim()) {
      return NextResponse.json({ translated: '' })
    }

    // Try to use LibreTranslate (free, no API key needed)
    // Fallback to a simple service or Google Translate if available
    try {
      // Option 1: LibreTranslate (free, open-source)
      const libreTranslateUrl = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com/translate'
      
      const response = await fetch(libreTranslateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: from,
          target: to,
          format: 'text',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({ translated: data.translatedText || text })
      }
    } catch (error) {
      console.log('LibreTranslate failed, trying alternative...')
    }

    // Option 2: MyMemory Translation API (free, no API key needed for limited use)
    // Note: Has a 500 word limit per request, so we'll use it for shorter texts
    if (text.split(/\s+/).length <= 500) {
      try {
        const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
        const response = await fetch(myMemoryUrl)
        
        if (response.ok) {
          const data = await response.json()
          if (data.responseData && data.responseData.translatedText) {
            return NextResponse.json({ translated: data.responseData.translatedText })
          }
        }
      } catch (error) {
        console.log('MyMemory failed, trying Google Translate...')
      }
    }

    // Option 3: Google Translate API (requires API key)
    const googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY
    if (googleApiKey) {
      try {
        const googleUrl = `https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`
        const response = await fetch(googleUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: from,
            target: to,
            format: 'text',
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.data && data.data.translations && data.data.translations[0]) {
            return NextResponse.json({ translated: data.data.translations[0].translatedText })
          }
        }
      } catch (error) {
        console.error('Google Translate API error:', error)
      }
    }

    // If all fail, return original text
    return NextResponse.json({ 
      translated: text,
      warning: 'Translation service unavailable. Please translate manually.' 
    })
  } catch (error: any) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: error.message || 'Translation failed', translated: '' },
      { status: 500 }
    )
  }
}
