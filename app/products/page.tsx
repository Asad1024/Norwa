'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Product, Category } from '@/types/database'
import { useGlobalLoader } from '@/components/GlobalLoader'
import { Image as ImageIcon, Search, ArrowRight } from 'lucide-react'
import { getCategoryEmoji } from '@/lib/categoryIcons'
import { useLanguageStore } from '@/store/languageStore'
import { getTranslation } from '@/lib/translations'
import { useTranslations } from '@/hooks/useTranslations'

export default function ProductsPage() {
  const [products, setProducts] = useState<(Product & { category_data?: Category })[]>([])
  const [filteredProducts, setFilteredProducts] = useState<(Product & { category_data?: Category })[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { showLoader, hideLoader } = useGlobalLoader()
  const language = useLanguageStore((state) => state.language)
  const t = useTranslations()
  const [selectedCategory, setSelectedCategory] = useState<string>(t.common.all)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchData = useCallback(async () => {
    showLoader(t.loader.loading)
    try {
      // Fetch active categories first
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

      setCategories(categoriesData || [])
      const activeCategoryIds = new Set((categoriesData || []).map(c => c.id))

      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      // Fetch products with category join
      const { data: productsData, error } = await supabase
        .from('products')
        .select(`
          *,
          category_data:categories(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Filter products based on user assignments
      // Logic: 
      // - Admins always see ALL products (assigned or not)
      // - Products with assignments = only visible to assigned users
      // - Products without assignments = visible to everyone
      let filteredByAssignment = productsData || []
      
      // Check if user is admin
      const isAdmin = currentUser?.user_metadata?.role === 'admin'
      
      // Admins always see all products
      if (isAdmin) {
        filteredByAssignment = productsData || []
      } else {
        try {
          // Get all product IDs that have ANY assignments (using API that bypasses RLS)
          const response = await fetch('/api/products/assigned-ids')
          if (!response.ok) {
            console.warn('Failed to fetch assigned product IDs, showing all products')
            // If API fails, show all products (fallback)
            filteredByAssignment = productsData || []
          } else {
            const result = await response.json()
            const productsWithAssignments = new Set(result.assignedProductIds || [])
            
            // Get current user's assigned products
            let userAssignedProducts = new Set<string>()
            if (currentUser) {
              try {
                const { data: userAssignments, error: assignmentError } = await supabase
                  .from('product_user_assignments')
                  .select('product_id')
                  .eq('user_id', currentUser.id)
                
                if (assignmentError) {
                  console.error('Error fetching user assignments:', assignmentError)
                } else if (userAssignments && Array.isArray(userAssignments)) {
                  // Ensure we convert to strings to match product.id format
                  userAssignedProducts = new Set(userAssignments.map((a: any) => String(a.product_id)))
                }
              } catch (err) {
                console.error('Exception fetching user assignments:', err)
              }
            }
            
            // Ensure product IDs are strings for comparison
            const productsWithAssignmentsStr = new Set(
              Array.from(productsWithAssignments).map(id => String(id))
            )
            
            // Filter products
            filteredByAssignment = (productsData || []).filter((product: any) => {
              const productIdStr = String(product.id)
              
              // If this product has assignments
              if (productsWithAssignmentsStr.has(productIdStr)) {
                // Only show if user is logged in AND assigned to this product
                if (currentUser) {
                  return userAssignedProducts.has(productIdStr)
                }
                // Not logged in and product has assignments = hide it
                return false
              }
              // Product has no assignments = show to everyone
              return true
            })
          }
        } catch (error) {
          console.error('Error filtering products by assignments:', error)
          // If error occurs, show all products (fallback)
          filteredByAssignment = productsData || []
        }
      }

      // Filter products to only show those with active categories or no category
      const validProducts = filteredByAssignment.filter((p: any) => {
        // If product has category_id, only show if that category is active
        if (p.category_id) {
          return p.category_data && p.category_data.is_active === true
        }
        // If no category_id, show the product (legacy products with category text field)
        // These will show but won't appear in category filters
        return true
      })

      setProducts(validProducts)
      setFilteredProducts(validProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
      hideLoader()
    }
  }, [supabase, showLoader, hideLoader])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Refetch data when page becomes visible (e.g., returning from admin edit)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData()
      }
    }

    const handleFocus = () => {
      fetchData()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchData])

  // Update selectedCategory when language changes
  useEffect(() => {
    const allText = t.common.all
    // If "All" is selected, update to the new language's "All" text
    const previousAllTexts = ['All', 'Alle']
    if (previousAllTexts.includes(selectedCategory) || selectedCategory === allText) {
      setSelectedCategory(allText)
    } else {
      // If a specific category is selected, reset to "All" when language changes
      // because category names are translated and won't match
      setSelectedCategory(allText)
    }
  }, [language, t.common.all])

  useEffect(() => {
    let filtered = products
    const allText = t.common.all

    // Filter by category
    if (selectedCategory !== allText) {
      filtered = filtered.filter((product) => {
        // Check category name from category_data (new way) or category field (old way)
        const categoryName = product.category_data 
          ? getTranslation(product.category_data.name_translations, language)
          : product.category
        return categoryName === selectedCategory
      })
    }

    // Filter by search query (search in both languages)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((product) => {
        // Search in current language translations
        const nameTrans = product.name_translations
        const descTrans = product.description_translations
        const name = getTranslation(nameTrans, language)
        const description = getTranslation(descTrans, language)
        
        // Also search in English as fallback
        const nameEn = getTranslation(nameTrans, 'en')
        const descEn = getTranslation(descTrans, 'en')
        
        return (
          name.toLowerCase().includes(query) ||
          description.toLowerCase().includes(query) ||
          nameEn.toLowerCase().includes(query) ||
          descEn.toLowerCase().includes(query)
        )
      })
    }

    setFilteredProducts(filtered)
  }, [products, selectedCategory, searchQuery, language])

  if (loading) {
    return null // Global loader is showing
  }

  // Get unique category names from active categories only (using translations)
  const categoryNames = categories.map(c => {
    const catName = getTranslation(c.name_translations, language)
    return { id: c.id, name: catName, original: c }
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {t.products.title}
            </h1>
            <p className="text-sm text-gray-600">
              {t.products.subtitle}
            </p>
          </div>
        </div>

        {/* Search Bar - Prominent */}
        <div className="mb-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder={t.products.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm bg-white shadow-sm"
              />
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-3">

          {/* Category Filters - Only show active categories */}
          {categoryNames.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => {
                  const allText = t.common.all
                  setSelectedCategory(allText)
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                  selectedCategory === t.common.all
                    ? 'bg-nature-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-nature-green-50 hover:border-nature-green-300 hover:text-nature-green-700'
                }`}
              >
                {t.common.all}
              </button>
              {categoryNames.map((cat) => {
                const category = cat.original
                const emoji = getCategoryEmoji(cat.name, category?.icon)
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2 whitespace-nowrap ${
                      selectedCategory === cat.name
                        ? 'bg-nature-green-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-nature-green-50 hover:border-nature-green-300 hover:text-nature-green-700'
                    }`}
                  >
                    {emoji && <span className="text-base">{emoji}</span>}
                    {cat.name}
                  </button>
                )
              })}
            </div>
          )}

          {/* Results Count */}
          <div className="text-center text-sm text-gray-500">
            {filteredProducts.length} {filteredProducts.length === 1 ? t.products.productFound : t.products.productsFound}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const categoryName = product.category_data 
                ? getTranslation(product.category_data.name_translations, language) 
                : product.category || null
              const emoji = getCategoryEmoji(categoryName || '', product.category_data?.icon)
              const productName = getTranslation(product.name_translations, language)
              const productDescription = getTranslation(product.description_translations, language)
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-200 hover:border-nature-green-200"
                >
                  <div className="h-64 bg-gray-50 flex items-center justify-center overflow-hidden relative p-4">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={productName}
                        className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    {categoryName && (
                      <span className="absolute top-3 left-3 bg-nature-green-600 text-white px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                        {emoji && <span>{emoji}</span>}
                        {categoryName}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    {categoryName && (
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {emoji && <span>{emoji}</span>}
                          {categoryName}
                        </span>
                      </div>
                    )}
                    <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2">
                      {productName}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {productDescription}
                    </p>
                    <div className="mb-3">
                      <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${
                        (product.stock || 0) > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {t.products.stock || 'Stock'}: {(product.stock || 0) > 0 ? product.stock : t.products.outOfStock || 'Out of Stock'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold text-gray-900">
                        ${product.price.toFixed(2)}
                      </p>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-nature-green-600 transition-colors" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {t.products.noProductsFound}
            </p>
            <p className="text-sm text-gray-500">
              {t.products.tryAdjusting}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
