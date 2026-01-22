'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useGlobalLoader } from '@/components/GlobalLoader'
import BackButton from '@/components/BackButton'
import { useTranslations } from '@/hooks/useTranslations'
import { FileText, Edit, ArrowRight } from 'lucide-react'
import NavLink from '@/components/NavLink'

export default function AdminPagesPage() {
  const router = useRouter()
  const supabase = createClient()
  const { showLoader, hideLoader } = useGlobalLoader()
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const t = useTranslations()

  useEffect(() => {
    const fetchData = async () => {
      showLoader(t.loader.loading)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          hideLoader()
          router.push('/login')
          return
        }

        const isAdmin = user.user_metadata?.role === 'admin'
        if (!isAdmin) {
          hideLoader()
          router.push('/')
          return
        }

        setUser(user)
        await fetchPages()
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
        hideLoader()
      }
    }

    fetchData()
  }, [supabase, router, showLoader, hideLoader])

  const fetchPages = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/admin/page-content', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPages(data.pages || [])
      }
    } catch (error) {
      console.error('Error fetching pages:', error)
    }
  }

  const getPageLabel = (pageKey: string) => {
    const labels: { [key: string]: string } = {
      'about': t.navbar.about,
      'contact': t.navbar.contact,
      'how-to-use': t.navbar.howToUse,
    }
    return labels[pageKey] || pageKey
  }

  if (loading || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <BackButton href="/admin" className="mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900">
            {t.adminPages.title || 'Manage Pages'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t.adminPages.subtitle || 'Edit content for About, Contact, and How to Use pages'}
          </p>
        </div>

        {/* Pages Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {pages.map((page) => (
            <NavLink
              key={page.id}
              href={`/admin/pages/${page.page_key}`}
              className="group bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-nature-green-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-nature-green-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {getPageLabel(page.page_key)}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                {page.title}
              </p>
              {page.subtitle && (
                <p className="text-xs text-gray-500">
                  {page.subtitle}
                </p>
              )}
              <div className="mt-4 flex items-center gap-2 text-sm text-nature-green-600 font-medium">
                <Edit className="w-4 h-4" />
                {t.common.edit || 'Edit'}
              </div>
            </NavLink>
          ))}
        </div>

        {pages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>{t.adminPages.noPages || 'No pages found'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
