'use client'

import { useLayoutEffect, useRef } from 'react'
import { useLanguageStore } from '@/store/languageStore'

/**
 * Client-side component to hydrate language store from sessionStorage
 * Uses useLayoutEffect to run synchronously before browser paint to prevent flash
 * Also removes the 'hydrating' class to show content after React hydrates
 * 
 * Flow:
 * - First visit: sessionStorage is empty → stays at default 'no' (Norwegian)
 * - During session: If user switched language, restore from sessionStorage
 * - On login: resetToDefault() clears sessionStorage → back to 'no'
 */
export default function LanguageStoreHydration() {
  const setLanguage = useLanguageStore((state) => state.setLanguage)
  const hasHydrated = useRef(false)

  // Use useLayoutEffect to run synchronously before paint (prevents flash)
  useLayoutEffect(() => {
    // Only run once on mount
    if (hasHydrated.current) return
    hasHydrated.current = true

    // Read from sessionStorage and update store if user switched language during session
    // If sessionStorage is empty (first visit), don't update - stays at default 'no'
    const stored = sessionStorage.getItem('language-preference')
    if (stored === 'en' || stored === 'no') {
      // User switched language during this session - restore their choice
      setLanguage(stored)
    }
    // If stored is null/empty, do nothing - store already defaults to 'no'

    // Remove hydrating class to show content (runs synchronously before paint)
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('hydrating')
    }
  }, [setLanguage])

  return null
}
