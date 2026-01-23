'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Product, Category } from '@/types/database'
import { Image as ImageIcon, Search, Package } from 'lucide-react'
import ProductImage from '@/components/ProductImage'
import { useTranslations } from '@/hooks/useTranslations'
import { useLanguageStore } from '@/store/languageStore'
import { getTranslation } from '@/lib/translations'
import { useGlobalLoader } from '@/components/GlobalLoader'
import { useToast } from '@/components/ToastProvider'
import BackButton from '@/components/BackButton'
import NavLink from '@/components/NavLink'
import Modal from '@/components/Modal'

export default function AdminProductsPage() {
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations()
  const language = useLanguageStore((state) => state.language)
  const { showLoader, hideLoader } = useGlobalLoader()
  const { showToast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [products, setProducts] = useState<(Product & { category_data?: Category })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    productId: string | null
    productName: string
  }>({
    isOpen: false,
    productId: null,
    productName: '',
  })

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category_data:categories(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
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

      await fetchProducts()
      hideLoader()
      setLoading(false)
    }

    fetchData()
  }, [supabase, router, showLoader, hideLoader, t])

  const handleDeleteClick = (product: Product & { category_data?: Category }) => {
    setDeleteModal({
      isOpen: true,
      productId: product.id,
      productName: getTranslation(product.name_translations, language),
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.productId) return

    try {
      // First, delete order items that reference this product
      const { error: orderItemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('product_id', deleteModal.productId)

      if (orderItemsError) throw orderItemsError

      // Then delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteModal.productId)

      if (error) throw error

      await fetchProducts()
      setDeleteModal({ isOpen: false, productId: null, productName: '' })
      showToast('Product deleted successfully', 'success')
    } catch (error: any) {
      console.error('Error deleting product:', error)
      setDeleteModal({ isOpen: false, productId: null, productName: '' })
      showToast('Failed to delete product. Please try again.', 'error')
    }
  }

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products
    }

    const query = searchQuery.toLowerCase()
    return products.filter((product) => {
      const name = getTranslation(product.name_translations, language).toLowerCase()
      const description = getTranslation(product.description_translations, language).toLowerCase()
      const categoryName = product.category_data
        ? getTranslation(product.category_data.name_translations, language).toLowerCase()
        : ''
      const price = product.price.toString()
      
      return (
        name.includes(query) ||
        description.includes(query) ||
        categoryName.includes(query) ||
        price.includes(query)
      )
    })
  }, [products, searchQuery, language])

  if (loading) {
    return null
  }

  return (
    <>
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        title={t.adminProducts.delete || 'Delete Product'}
        message={`Are you sure you want to delete "${deleteModal.productName}"? This action cannot be undone.`}
        type="warning"
        confirmText={t.common.delete}
        cancelText={t.common.cancel}
        showCancel={true}
        onConfirm={handleDeleteConfirm}
      />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
        {/* Header with Back Button */}
        <div className="mb-6">
          <BackButton href="/admin" className="mb-4" />
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              {t.adminProducts.title}
            </h1>
            <NavLink
              href="/admin/products/new"
              className="bg-nature-green-600 hover:bg-nature-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg"
            >
              + {t.adminProducts.addNew}
            </NavLink>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder={t.products.searchPlaceholder || 'Search products...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm bg-white"
              />
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Products Table */}
        {filteredProducts.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.adminProducts.image}</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.adminProducts.name}</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.adminProducts.category}</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.adminProducts.description}</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.adminProducts.price}</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.products.stock || 'Stock'}</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.adminProducts.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const categoryName = product.category_data
                      ? getTranslation(product.category_data.name_translations, language)
                      : product.category || '-'
                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="w-20 h-20 rounded-lg overflow-hidden relative">
                            <ProductImage
                              imageUrl={product.image_url}
                              className="w-full h-full object-contain"
                              containerClassName="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden"
                              iconSize="small"
                              showText={true}
                              placeholderText="No Image"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-sm text-gray-900">
                            {getTranslation(product.name_translations, language)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">
                            {categoryName}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                            {getTranslation(product.description_translations, language)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-gray-900">
                            ${product.price.toFixed(2)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600">
                            <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap ${
                              (product.stock || 0) > 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {t.products.stock || 'Stock'}: {product.stock || 0}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <NavLink
                              href={`/admin/products/${product.id}/edit`}
                              className="px-3 py-1.5 bg-nature-green-600 hover:bg-nature-green-700 text-white text-xs font-medium rounded transition-colors whitespace-nowrap h-7 flex items-center justify-center"
                            >
                              {t.adminProducts.edit}
                            </NavLink>
                            <NavLink
                              href={`/admin/products/${product.id}/assign`}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors whitespace-nowrap h-7 flex items-center justify-center"
                            >
                              {t.adminProducts.assignUsers || 'Assign Users'}
                            </NavLink>
                            <button
                              onClick={() => handleDeleteClick(product)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors whitespace-nowrap h-7 flex items-center justify-center"
                            >
                              {t.adminProducts.delete}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-4">
              {searchQuery ? t.products.noProductsFound : t.adminProducts.noProducts}
            </p>
            {!searchQuery && (
              <NavLink
                href="/admin/products/new"
                className="inline-block bg-nature-green-600 hover:bg-nature-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg"
              >
                {t.adminProducts.addNew}
              </NavLink>
            )}
          </div>
        )}
        </div>
      </div>
    </>
  )
}
