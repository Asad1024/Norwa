'use client'

import Link from 'next/link'
import { useTranslations } from '@/hooks/useTranslations'

export default function NotFound() {
  const t = useTranslations()
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold text-nature-green-800 mb-4">
        {t.notFound.title}
      </h1>
      <p className="text-nature-green-600 text-lg mb-8">
        {t.notFound.message}
      </p>
      <Link
        href="/"
        className="inline-block bg-nature-green-600 hover:bg-nature-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
      >
        {t.notFound.goHome}
      </Link>
    </div>
  )
}
