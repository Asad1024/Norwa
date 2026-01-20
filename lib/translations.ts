import { Language } from '@/store/languageStore'

export interface Translations {
  en: string
  no: string
}

/**
 * Get translated text from translations object
 * Falls back to English if requested language is missing or empty
 */
export const getTranslation = (
  translations: Translations | null | undefined,
  lang: Language
): string => {
  if (!translations) return ''
  
  // Try to get the requested language
  const text = translations[lang]
  
  // If not available or empty, fallback to English
  if (!text || text.trim() === '') {
    return translations.en || ''
  }
  
  return text
}

/**
 * Create translations object with auto-fill for Norwegian
 * If Norwegian is empty, it will be filled with English
 */
export const createTranslations = (
  en: string,
  no?: string
): Translations => {
  return {
    en: en || '',
    no: no || en || '', // Auto-fill with English if Norwegian is empty
  }
}

/**
 * Check if translations object is valid
 */
export const isValidTranslations = (
  translations: any
): translations is Translations => {
  return (
    translations &&
    typeof translations === 'object' &&
    typeof translations.en === 'string' &&
    typeof translations.no === 'string'
  )
}
