'use client'

import { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'

interface LoaderContextType {
  isLoading: boolean
  loadingMessage: string
  showLoader: (message?: string) => void
  hideLoader: () => void
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined)

export function GlobalLoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const pathname = usePathname()
  const prevPathnameRef = useRef<string>(pathname)

  // Auto-hide loader when pathname changes (navigation completes)
  useEffect(() => {
    // Only hide if pathname actually changed (not initial mount)
    if (prevPathnameRef.current !== pathname && isLoading) {
      setIsLoading(false)
    }
    prevPathnameRef.current = pathname
  }, [pathname, isLoading])

  const showLoader = useCallback((message?: string) => {
    setLoadingMessage(message || '')
    setIsLoading(true)
  }, [])

  const hideLoader = useCallback(() => {
    setIsLoading(false)
  }, [])

  return (
    <LoaderContext.Provider value={{ isLoading, loadingMessage, showLoader, hideLoader }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 z-[9998] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            {/* Simple Spinner with Blue and Green */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-500 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-green-500 rounded-full animate-spin" style={{ animationDuration: '1s' }}></div>
            </div>
            {loadingMessage && (
              <p className="text-lg font-semibold text-white drop-shadow-md">{loadingMessage}</p>
            )}
          </div>
        </div>
      )}
    </LoaderContext.Provider>
  )
}

export function useGlobalLoader() {
  const context = useContext(LoaderContext)
  if (context === undefined) {
    throw new Error('useGlobalLoader must be used within a GlobalLoaderProvider')
  }
  return context
}
