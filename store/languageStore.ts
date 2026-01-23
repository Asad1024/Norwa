import { create } from 'zustand'

export type Language = 'en' | 'no'

interface LanguageStore {
  language: Language
  setLanguage: (lang: Language) => void
  resetToDefault: () => void // Reset to Norwegian (used on login/logout for new users only)
}

export const useLanguageStore = create<LanguageStore>()(
  (set, get) => ({
    // Always default to Norwegian - ensures first visit shows Norwegian
    language: 'no',
    setLanguage: (lang: Language) => {
      set({ language: lang })
      // Save language choice to sessionStorage (only persists for current browser session)
      // This allows users to switch language during their session
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('language-preference', lang)
        } catch {
          // Ignore sessionStorage errors (private browsing, etc.)
        }
      }
    },
    resetToDefault: () => {
      // Called on login/logout - always reset to Norwegian
      // Clears sessionStorage so next visit will default to Norwegian
      if (typeof window !== 'undefined') {
        try {
          // Clear sessionStorage - ensures new session starts with Norwegian
          sessionStorage.removeItem('language-preference')
          // Always set to Norwegian
          set({ language: 'no' })
        } catch {
          set({ language: 'no' })
        }
      } else {
        set({ language: 'no' })
      }
    },
  })
)
