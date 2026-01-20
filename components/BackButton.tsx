'use client'

import { useRouter } from 'next/navigation'
import { useGlobalLoader } from '@/components/GlobalLoader'
import { useTranslations } from '@/hooks/useTranslations'

interface BackButtonProps {
  href?: string
  className?: string
}

export default function BackButton({ href, className }: BackButtonProps) {
  const router = useRouter()
  const { showLoader } = useGlobalLoader()
  const t = useTranslations()

  const handleClick = () => {
    showLoader(t.loader.loading)
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-200 ${className || ''}`}
    >
      <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      {t.common.back}
    </button>
  )
}
