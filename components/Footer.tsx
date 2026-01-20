'use client'

import { useTranslations } from '@/hooks/useTranslations'

export default function Footer() {
  const t = useTranslations()
  return (
    <footer className="bg-nature-green-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p className="text-nature-green-200">
          {t.footer.copyright} {t.footer.tagline}
        </p>
      </div>
    </footer>
  )
}
