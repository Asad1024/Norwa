'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/types/database'
import NavLink from '@/components/NavLink'
import { useGlobalLoader } from '@/components/GlobalLoader'
import { useToast } from '@/components/ToastProvider'
import Modal from '@/components/Modal'
import BackButton from '@/components/BackButton'
import { getCategoryEmoji } from '@/lib/categoryIcons'
import { FolderOpen } from 'lucide-react'
import { useTranslations } from '@/hooks/useTranslations'
import { useLanguageStore } from '@/store/languageStore'
import { getTranslation } from '@/lib/translations'

export default function CategoriesPage() {
  const router = useRouter()
  const supabase = createClient()
  const { showLoader, hideLoader } = useGlobalLoader()
  const { showToast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    categoryId: string | null
    categoryName: string
  }>({
    isOpen: false,
    categoryId: null,
    categoryName: '',
  })
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean
    message: string
  }>({
    isOpen: false,
    message: '',
  })
  const t = useTranslations()
  const language = useLanguageStore((state) => state.language)

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    const getUser = async () => {
      showLoader(t.loader.loading)
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
      await fetchCategories()
      hideLoader()
    }

    getUser()
  }, [supabase, router, showLoader, hideLoader, fetchCategories])

  // Refetch categories when page becomes visible (e.g., returning from edit page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        fetchCategories()
      }
    }

    const handleFocus = () => {
      if (user) {
        fetchCategories()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user, fetchCategories])

  const handleDeleteClick = (categoryId: string, categoryName: string) => {
    setDeleteModal({
      isOpen: true,
      categoryId,
      categoryName,
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.categoryId) return

    try {
      // First, remove category_id from products
      await supabase
        .from('products')
        .update({ category_id: null })
        .eq('category_id', deleteModal.categoryId)

      // Then delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', deleteModal.categoryId)

      if (error) throw error
      await fetchCategories()
      setDeleteModal({ isOpen: false, categoryId: null, categoryName: '' })
      showToast('Category deleted successfully', 'success')
    } catch (error: any) {
      console.error('Error deleting category:', error)
      setDeleteModal({ isOpen: false, categoryId: null, categoryName: '' })
      showToast('Failed to delete category. Please try again.', 'error')
    }
  }

  if (loading) {
    return null // Global loader is showing
  }

  return (
    <>
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        title={t.adminCategories.deleteConfirm}
        message={t.adminCategories.deleteMessage}
        type="warning"
        confirmText={t.common.delete}
        cancelText={t.common.cancel}
        showCancel={true}
        onConfirm={handleDeleteConfirm}
      />
      <Modal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={t.toast.error}
        message={errorModal.message}
        type="error"
      />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6">
            <BackButton href="/admin" className="mb-4" />
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                {t.adminCategories.title}
              </h1>
              <NavLink
                href="/admin/categories/new"
                className="bg-nature-green-600 hover:bg-nature-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg"
              >
                + {t.adminCategories.addNew}
              </NavLink>
            </div>
          </div>

          {categories.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.adminProducts.name}</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.common.description}</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.adminCategories.status}</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.common.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {categories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {getCategoryEmoji(category.name, category.icon) && (
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                                {getCategoryEmoji(category.name, category.icon)}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900 text-sm">
                                {getTranslation(category.name_translations, language)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600 line-clamp-2 max-w-md">
                            {getTranslation(category.description_translations, language) || '-'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${
                            category.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {category.is_active ? t.adminCategories.active : t.adminCategories.inactive}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <NavLink
                              href={`/admin/categories/${category.id}/edit`}
                              className="px-3 py-1.5 bg-nature-green-600 hover:bg-nature-green-700 text-white text-xs font-medium rounded transition-colors"
                            >
                              {t.adminCategories.edit}
                            </NavLink>
                            <button
                              onClick={() => handleDeleteClick(category.id, getTranslation(category.name_translations, language))}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
                            >
                              {t.adminCategories.delete}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
                <FolderOpen className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-4">{t.adminCategories.noCategories}</p>
              <NavLink
                href="/admin/categories/new"
                className="inline-block bg-nature-green-600 hover:bg-nature-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg"
              >
                {t.adminCategories.addNew}
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
