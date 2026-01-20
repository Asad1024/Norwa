'use client'

import { useEffect } from 'react'
import { useTranslations } from '@/hooks/useTranslations'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  showCancel?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText,
  cancelText,
  onConfirm,
  showCancel = false,
}: ModalProps) {
  const t = useTranslations()
  const defaultConfirmText = confirmText || t.modal.ok
  const defaultCancelText = cancelText || t.modal.cancel
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const bgColor =
    type === 'success'
      ? 'bg-nature-green-600'
      : type === 'error'
      ? 'bg-red-600'
      : type === 'warning'
      ? 'bg-yellow-600'
      : 'bg-nature-blue-600'

  const icon =
    type === 'success' ? (
      <svg className="w-5 h-5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M5 13l4 4L19 7" />
      </svg>
    ) : type === 'error' ? (
      <svg className="w-5 h-5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    ) : type === 'warning' ? (
      <svg className="w-5 h-5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ) : (
      <svg className="w-5 h-5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal - Compact */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full border border-gray-200 animate-slide-in">
        {/* Header */}
        <div className={`${bgColor} rounded-t-lg px-4 py-3 flex items-center gap-2`}>
          <div className="flex-shrink-0 w-5 h-5">{icon}</div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-gray-700 text-sm">{message}</p>
        </div>

        {/* Footer */}
        <div className={`flex gap-2 p-4 border-t border-gray-100 ${showCancel ? 'justify-end' : 'justify-center'}`}>
          {showCancel && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded transition-colors"
            >
              {defaultCancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-nature-green-600 hover:bg-nature-green-700 text-white text-sm font-medium rounded transition-colors"
          >
            {defaultConfirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
