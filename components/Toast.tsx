'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  // For success: white bg with green text, for others: keep original gradient
  const isSuccess = type === 'success'
  const bgClass = isSuccess
    ? 'bg-white'
    : type === 'error'
    ? 'bg-gradient-to-r from-red-600 to-red-700'
    : 'bg-gradient-to-r from-nature-blue-600 to-nature-blue-700'
  
  const textColor = isSuccess ? 'text-nature-green-600' : 'text-white'

  const icon =
    type === 'success' ? (
      <div className={`flex-shrink-0 w-6 h-6 ${isSuccess ? 'bg-nature-green-100' : 'bg-white/20'} rounded-full flex items-center justify-center`}>
        <svg className={`w-4 h-4 ${textColor}`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
    ) : type === 'error' ? (
      <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    ) : (
      <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    )

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-slide-in-bottom">
      <div
        className={`${bgClass} ${textColor} px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 min-w-[280px] max-w-sm backdrop-blur-sm transform transition-all duration-300`}
        style={{
          animation: 'slideInBottom 0.3s ease-out',
        }}
      >
        {icon}
        <p className={`font-medium text-sm flex-1 ${textColor}`}>{message}</p>
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${isSuccess ? 'hover:bg-nature-green-50 text-nature-green-600' : 'hover:bg-white/30 text-white'} rounded p-1 transition-colors duration-200`}
          aria-label="Close"
        >
          <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
