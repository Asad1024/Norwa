'use client'

import { useRouter } from 'next/navigation'
import { useGlobalLoader } from '@/components/GlobalLoader'
import { useTranslations } from '@/hooks/useTranslations'

export function useNavigationWithLoader() {
  const router = useRouter()
  const { showLoader } = useGlobalLoader()
  const t = useTranslations()

  const push = (path: string) => {
    showLoader(t.loader.loading)
    router.push(path)
  }

  return { push, router }
}
