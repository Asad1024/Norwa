'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Product, Category } from '@/types/database'
import Link from 'next/link'
import { useGlobalLoader } from '@/components/GlobalLoader'
import { useToast } from '@/components/ToastProvider'
import { createTranslations, getTranslation } from '@/lib/translations'
import { useTranslations } from '@/hooks/useTranslations'
import { useLanguageStore } from '@/store/languageStore'
import BackButton from '@/components/BackButton'
import { Languages } from 'lucide-react'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const { showLoader, hideLoader } = useGlobalLoader()
  const { showToast } = useToast()
  const t = useTranslations()
  const language = useLanguageStore((state) => state.language)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'no'>('en')
  const [formData, setFormData] = useState({
    name_en: '',
    name_no: '',
    description_en: '',
    description_no: '',
    category_id: '',
    price: '',
    stock: '0',
    image_url: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      showLoader(t.loader.loading)
      try {
        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .order('name', { ascending: true })

        setCategories(categoriesData || [])

        // Fetch product
        const { data: productData, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error

        if (productData) {
          // Load translations if available, otherwise use legacy fields
          const nameTranslations = productData.name_translations || { en: productData.name || '', no: productData.name || '' }
          const descTranslations = productData.description_translations || { en: productData.description || '', no: productData.description || '' }
          
          setFormData({
            name_en: nameTranslations.en || productData.name || '',
            name_no: nameTranslations.no || productData.name || '',
            description_en: descTranslations.en || productData.description || '',
            description_no: descTranslations.no || productData.description || '',
            category_id: productData.category_id || '',
            price: productData.price.toString(),
            stock: (productData.stock || 0).toString(),
            image_url: productData.image_url || '',
          })
          if (productData.image_url) {
            setImagePreview(productData.image_url)
          }
        }
      } catch (error: any) {
        setError(error.message || 'Failed to load product')
      } finally {
        hideLoader()
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, supabase, showLoader, hideLoader])

  const translateText = async (text: string): Promise<string> => {
    if (!text || !text.trim()) return ''
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          from: 'en',
          to: 'no',
        }),
      })
      const data = await response.json()
      return data.translated || text
    } catch (error) {
      console.error('Translation error:', error)
      return text
    }
  }

  const handleTranslateToNO = async () => {
    if (activeLanguage !== 'no') {
      setActiveLanguage('no')
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    setTranslating(true)
    try {
      const updates: any = {}
      
      if (formData.name_en) {
        updates.name_no = await translateText(formData.name_en)
      }
      if (formData.description_en) {
        updates.description_no = await translateText(formData.description_en)
      }

      setFormData({ ...formData, ...updates })
      showToast(t.forms.translateToNO || 'Translated to Norwegian', 'success')
    } catch (error: any) {
      console.error('Translation error:', error)
      showToast('Failed to translate. Please translate manually.', 'error')
    } finally {
      setTranslating(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      setSelectedFile(file)
      setError('')
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setFormData({ ...formData, image_url: '' })
    }
  }

  const handleRemoveImage = () => {
    setSelectedFile(null)
    setImagePreview(formData.image_url || null)
  }

  const uploadImage = async (file: File): Promise<string> => {
    // Get auth token
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Not authenticated')
    }

    // Upload via API route (bypasses storage policies)
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/admin/upload-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Upload failed')
    }

    const { url } = await response.json()
    return url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || user.user_metadata?.role !== 'admin') {
        throw new Error('Unauthorized')
      }

      let imageUrl = formData.image_url

      if (selectedFile) {
        setUploading(true)
        showLoader(t.loader.loading)
        try {
          imageUrl = await uploadImage(selectedFile)
          console.log('Image uploaded successfully, URL:', imageUrl)
          // Update formData with the new image URL
          setFormData({ ...formData, image_url: imageUrl })
          setImagePreview(imageUrl)
          showToast('Image uploaded successfully!', 'success')
          hideLoader()
        } catch (uploadError: any) {
          hideLoader()
          console.error('Upload error:', uploadError)
          showToast(`Image upload failed: ${uploadError.message}`, 'error')
          throw new Error(`Image upload failed: ${uploadError.message}`)
        } finally {
          setUploading(false)
        }
      }

      showLoader(t.loader.loading)
      
      // Create translations with auto-fill for Norwegian
      const nameTranslations = createTranslations(formData.name_en, formData.name_no)
      const descriptionTranslations = createTranslations(formData.description_en, formData.description_no)
      
      // Also keep legacy fields for backward compatibility
      const legacyName = formData.name_en || formData.name_no || ''
      const legacyDescription = formData.description_en || formData.description_no || ''
      
      console.log('Updating product with image_url:', imageUrl)
      const { error, data } = await supabase
        .from('products')
        .update({
          // Legacy fields (for backward compatibility)
          name: legacyName,
          description: legacyDescription,
          // Translation fields
          name_translations: nameTranslations,
          description_translations: descriptionTranslations,
          category_id: formData.category_id || null,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock) || 0,
          image_url: imageUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)
        .select()

      if (error) {
        console.error('Product update error:', error)
        throw error
      }

      console.log('Product updated successfully:', data)
      hideLoader()
      showToast(t.toast.success || 'Product updated successfully!', 'success')
      // Small delay to show toast before redirect
      setTimeout(() => {
        router.push('/admin/products')
      }, 500)
    } catch (error: any) {
      hideLoader()
      setError(error.message || 'Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return null // Global loader is showing
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <BackButton href="/admin/products" className="mb-4" />
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          {t.common.edit} {t.adminProducts.name || 'Product'}
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Language Tabs */}
            <div className="flex items-center justify-between border-b border-gray-200 mb-4">
              <div className="flex space-x-1">
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
              {activeLanguage === 'no' && (
                <button
                  type="button"
                  onClick={handleTranslateToNO}
                  disabled={translating}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-nature-green-700 bg-nature-green-50 hover:bg-nature-green-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Languages className="w-4 h-4" />
                  {translating ? t.forms.translating : t.forms.translateToNO}
                </button>
              )}
            </div>

            {/* Product Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-medium uppercase tracking-wide text-gray-700 mb-2"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder={activeLanguage === 'en' ? `${t.forms.productName} ${t.forms.englishRequired}` : `${t.forms.productName} ${t.forms.norwegianOptional}`}
              />
              {activeLanguage === 'no' && (
                <p className="text-xs text-gray-500 mt-1">
                  {t.forms.autoFillMessage}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-xs font-medium uppercase tracking-wide text-gray-700 mb-2"
              >
                {t.forms.productDescription} {activeLanguage === 'en' && '*'}
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
                required={activeLanguage === 'en'}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder={activeLanguage === 'en' ? `${t.forms.productDescription} ${t.forms.englishRequired}` : `${t.forms.productDescription} ${t.forms.norwegianOptional}`}
              />
              {activeLanguage === 'no' && (
                <p className="text-xs text-gray-500 mt-1">
                  {t.forms.autoFillMessage}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="category_id"
                className="block text-xs font-medium uppercase tracking-wide text-gray-700 mb-2"
              >
                {t.adminProducts.category}
              </label>
              <select
                id="category_id"
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="">{t.common.select} {t.adminProducts.category}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon && `${category.icon} `}{getTranslation(category.name_translations, language)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {t.common.view} {t.admin.categories} <Link href="/admin/categories/new" className="text-nature-green-600 hover:underline">{t.common.create}</Link>
              </p>
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-xs font-medium uppercase tracking-wide text-gray-700 mb-2"
              >
                {t.forms.price} *
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="stock"
                className="block text-xs font-medium uppercase tracking-wide text-gray-700 mb-2"
              >
                {t.forms.stock || 'Stock'} *
              </label>
              <input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t.forms.stockDescription || 'Number of items available in stock'}
              </p>
            </div>

            <div>
              <label
                htmlFor="image"
                className="block text-xs font-medium uppercase tracking-wide text-gray-700 mb-2"
              >
                {t.forms.image}
              </label>
              
              {/* Current/Preview Image */}
              {imagePreview && (
                <div className="mb-4">
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    />
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* File Upload */}
              <div className="mb-3">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t.forms.uploadImage}
                </p>
              </div>

              {/* URL Input (fallback) */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">{t.forms.or}</span>
                </div>
              </div>

              <input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => {
                  setFormData({ ...formData, image_url: e.target.value })
                  if (e.target.value) {
                    setSelectedFile(null)
                    setImagePreview(e.target.value)
                  } else if (!selectedFile) {
                    setImagePreview(null)
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent mt-3"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t.forms.imageUrl}
              </p>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={saving || uploading}
                className="flex-1 bg-nature-green-600 hover:bg-nature-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {uploading ? t.loader.uploading : saving ? t.loader.saving : t.common.save}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {t.common.cancel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
