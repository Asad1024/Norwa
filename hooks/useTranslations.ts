'use client'

import { useLanguageStore } from '@/store/languageStore'
import { getUITranslation, UITranslations } from '@/lib/uiTranslations'

export const useTranslations = (): UITranslations => {
  const language = useLanguageStore((state) => state.language)
  return getUITranslation(language)
}
