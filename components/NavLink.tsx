'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useGlobalLoader } from '@/components/GlobalLoader'
import { useTranslations } from '@/hooks/useTranslations'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function NavLink({ href, children, className, onClick }: NavLinkProps) {
  const pathname = usePathname()
  const { showLoader } = useGlobalLoader()
  const t = useTranslations()

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick()
    }
    // Only show loader if navigating to a different page
    // The loader will auto-hide when navigation completes (pathname changes)
    if (pathname !== href) {
      showLoader(t.loader.loading)
    }
  }

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  )
}
