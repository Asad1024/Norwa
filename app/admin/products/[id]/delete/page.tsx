'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types/database'
import { useTranslations } from '@/hooks/useTranslations'
import { useLanguageStore } from '@/store/languageStore'
import { getTranslation } from '@/lib/translations'

export default function DeleteProductPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const t = useTranslations()
  const language = useLanguageStore((state) => state.language)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error
        setProduct(data)
      } catch (error: any) {
        setError(error.message || 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id, supabase])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    setDeleting(true)
    setError('')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || user.user_metadata?.role !== 'admin') {
        throw new Error('Unauthorized')
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', params.id)

      if (error) throw error

      router.push('/admin/products')
    } catch (error: any) {
      setError(error.message || 'Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-nature-green-600 text-lg">{t.loader.loading}</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-600 text-lg">Product not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-nature-green-800 mb-8">
          {t.common.delete} {t.adminProducts.name || 'Product'}
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-8 border border-red-200">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-6">
            <p className="text-lg text-gray-700 mb-4">
              {t.adminCategories.deleteMessage || 'Are you sure you want to delete this product? This action cannot be undone.'}
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {getTranslation(product.name_translations, language)}
              </h3>
              <p className="text-gray-600 text-sm mb-2">
                {getTranslation(product.description_translations, language)}
              </p>
              <p className="text-nature-blue-600 font-semibold">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? t.loader.deleting : `${t.common.delete} ${t.adminProducts.name || 'Product'}`}
            </button>
            <button
              onClick={() => router.back()}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
