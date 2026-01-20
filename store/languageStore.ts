import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'en' | 'no'

interface LanguageStore {
  language: Language
  setLanguage: (lang: Language) => void
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'en', // Default to English
      setLanguage: (lang: Language) => {
        set({ language: lang })
        // No need to reload - React will re-render components using the store
      },
    }),
    {
      name: 'language-storage',
    }
  )
)
