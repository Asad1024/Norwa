'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/types/database'
import Link from 'next/link'
import { useGlobalLoader } from '@/components/GlobalLoader'
import { createTranslations } from '@/lib/translations'
import { useTranslations } from '@/hooks/useTranslations'
import BackButton from '@/components/BackButton'

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const { showLoader, hideLoader } = useGlobalLoader()
  const t = useTranslations()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'no'>('en')
  const [formData, setFormData] = useState({
    name_en: '',
    name_no: '',
    description_en: '',
    description_no: '',
    slug: '',
    icon: '',
    is_active: true,
    sort_order: 0,
  })

  useEffect(() => {
    const fetchCategory = async () => {
      showLoader(t.loader.loading)
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error

        if (data) {
          // Load translations if available, otherwise use legacy fields
          const nameTranslations = data.name_translations || { en: data.name || '', no: data.name || '' }
          const descTranslations = data.description_translations || { en: data.description || '', no: data.description || '' }
          
          setFormData({
            name_en: nameTranslations.en || data.name || '',
            name_no: nameTranslations.no || data.name || '',
            description_en: descTranslations.en || data.description || '',
            description_no: descTranslations.no || data.description || '',
            slug: data.slug || '',
            icon: data.icon || '',
            is_active: data.is_active,
            sort_order: data.sort_order || 0,
          })
        }
      } catch (error: any) {
        setError(error.message || 'Failed to load category')
      } finally {
        hideLoader()
        setLoading(false)
      }
    }

    fetchCategory()
  }, [params.id, supabase, showLoader, hideLoader])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
      showLoader(t.loader.loading)
    setError('')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || user.user_metadata?.role !== 'admin') {
        throw new Error('Unauthorized')
      }

      // Generate slug from English name if not provided
      const slug = formData.slug || formData.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      
      // Create translations with auto-fill for Norwegian
      const nameTranslations = createTranslations(formData.name_en, formData.name_no)
      const descriptionTranslations = createTranslations(formData.description_en, formData.description_no)
      
      // Legacy fields for backward compatibility
      const legacyName = formData.name_en || formData.name_no || ''
      const legacyDescription = formData.description_en || formData.description_no || ''

      const { error } = await supabase
        .from('categories')
        .update({
          // Legacy fields
          name: legacyName,
          description: legacyDescription || null,
          // Translation fields
          name_translations: nameTranslations,
          description_translations: descriptionTranslations,
          slug: slug || null,
          icon: formData.icon || null,
          is_active: formData.is_active,
          sort_order: formData.sort_order || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)

      if (error) throw error

      hideLoader()
      router.push('/admin/categories')
      router.refresh()
    } catch (error: any) {
      hideLoader()
      setError(error.message || 'Failed to update category')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return null // Global loader is showing
  }

  return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
            <BackButton href="/admin/categories" className="mb-4" />
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            {t.common.edit} {t.adminCategories.name || 'Category'}
          </h1>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-3 py-2 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Language Tabs */}
              <div className="flex space-x-1 border-b border-gray-200 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveLanguage('en')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeLanguage === 'en'
                      ? 'border-b-2 border-gray-900 text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {t.forms.english}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLanguage('no')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeLanguage === 'no'
                      ? 'border-b-2 border-gray-900 text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {t.forms.norwegian}
                </button>
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-nature-green-700 mb-2"
                >
                  {t.common.name} {activeLanguage === 'en' && '*'}
                </label>
                <input
                  id="name"
                  type="text"
                  value={activeLanguage === 'en' ? formData.name_en : formData.name_no}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [activeLanguage === 'en' ? 'name_en' : 'name_no']: e.target.value,
                    })
                  }
                  required={activeLanguage === 'en'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder={activeLanguage === 'en' ? `${t.forms.categoryName} ${t.forms.englishRequired}` : `${t.forms.categoryName} ${t.forms.norwegianOptional}`}
                />
                {activeLanguage === 'no' && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t.forms.autoFillMessage}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-nature-green-700 mb-2"
                >
                  {t.forms.categoryDescription}
                </label>
                <textarea
                  id="description"
                  value={activeLanguage === 'en' ? formData.description_en : formData.description_no}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [activeLanguage === 'en' ? 'description_en' : 'description_no']: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
                  placeholder={activeLanguage === 'en' ? t.forms.categoryDescription : `${t.forms.categoryDescription} ${t.forms.norwegianOptional}`}
                />
                {activeLanguage === 'no' && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t.forms.autoFillMessage}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="icon"
                    className="block text-sm font-semibold text-nature-green-700 mb-2"
                  >
                    {t.adminCategories.icon}
                  </label>
                  <input
                    id="icon"
                    type="text"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="e.g., 🌿"
                    maxLength={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">{t.adminCategories.icon}</p>
                </div>

                <div className="flex items-center pt-8">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-5 h-5 text-gray-600 border-gray-300 rounded focus:ring-gray-900"
                  />
                  <label
                    htmlFor="is_active"
                    className="ml-3 text-sm font-medium text-nature-green-800"
                  >
                    {t.adminCategories.active}
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-nature-green-600 hover:bg-nature-green-700 text-white font-medium py-2.5 px-4 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {saving ? t.loader.loading : t.common.save}
                </button>
                <Link
                  href="/admin/categories"
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                >
                  {t.common.cancel}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
  )
}
