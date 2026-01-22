'use client'

import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Product, Category } from '@/types/database'
import { Image as ImageIcon, Package, ArrowRight, Droplets, Heart, Mountain, Sparkles, TrendingDown, Leaf } from 'lucide-react'
import { useLanguageStore } from '@/store/languageStore'
import { getTranslation } from '@/lib/translations'
import { useTranslations } from '@/hooks/useTranslations'

export default function Home() {
  const [products, setProducts] = useState<(Product & { category_data?: Category })[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const language = useLanguageStore((state) => state.language)
  const t = useTranslations()

  useEffect(() => {
    const fetchProducts = async () => {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      const { data: productsData } = await supabase
        .from('products')
        .select(`
          *,
          category_data:categories(*)
        `)
        .order('created_at', { ascending: false })
      
      // Filter products based on user assignments
      // Logic: 
      // - Admins always see ALL products (assigned or not)
      // - Products with assignments = only visible to assigned users
      // - Products without assignments = visible to everyone
      let filteredProducts = productsData || []
      
      // Check if user is admin
      const isAdmin = currentUser?.user_metadata?.role === 'admin'
      
      // Admins always see all products
      if (isAdmin) {
        filteredProducts = productsData || []
      } else {
        try {
          // Get all product IDs that have ANY assignments (using API that bypasses RLS)
          const response = await fetch('/api/products/assigned-ids')
          if (!response.ok) {
            console.warn('Failed to fetch assigned product IDs, showing all products')
            // If API fails, show all products (fallback)
            filteredProducts = productsData || []
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
            filteredProducts = (productsData || []).filter((product: any) => {
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
          filteredProducts = productsData || []
        }
      }
      
      setProducts(filteredProducts.slice(0, 6))
      setLoading(false)
    }

    fetchProducts()
  }, [supabase])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-nature-green-900 via-nature-green-700 to-nature-green-600 text-white py-12 md:py-16 px-4 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-nature-green-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-nature-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white rounded-full blur-3xl"></div>
        </div>
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="container mx-auto text-center max-w-6xl relative z-10">
          <div className="mb-6 flex justify-center transform transition-transform duration-300 hover:scale-105">
            <Image
              src="/logo2.png"
              alt="NORWA Logo"
              width={180}
              height={72}
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 max-w-3xl mx-auto drop-shadow-lg">
            <span className="bg-gradient-to-r from-white via-nature-green-100 to-white bg-clip-text text-transparent">
              {t.home.bannerSubtitle}
            </span>
          </h1>
          <p className="text-base md:text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            {t.home.bannerDescription}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-white text-nature-green-700 hover:bg-nature-green-50 font-semibold py-3 px-6 rounded-xl transition-all text-sm shadow-2xl hover:shadow-3xl hover:scale-105 transform duration-300"
          >
            {t.home.shopNow}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Featured Products */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 mb-3">
            {t.home.featuredProducts}
          </h2>
          <p className="text-sm text-gray-600">
            {t.home.featuredSubtitle}
          </p>
        </div>

        {!loading && products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-200 hover:border-nature-green-500"
              >
                <div className="h-64 bg-gray-50 flex items-center justify-center overflow-hidden relative p-4">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={getTranslation(product.name_translations, language)}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  {(() => {
                    const categoryName = product.category_data 
                      ? getTranslation(product.category_data.name_translations, language)
                      : product.category
                    return categoryName ? (
                      <span className="absolute top-3 left-3 bg-nature-green-600 text-white px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap max-w-[calc(100%-1.5rem)] truncate">
                        {categoryName}
                      </span>
                    ) : null
                  })()}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2">
                    {getTranslation(product.name_translations, language)}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {getTranslation(product.description_translations, language)}
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
            ))}
          </div>
        ) : !loading ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">
              {t.home.noProducts}
            </p>
          </div>
        ) : null}

        <div className="text-center mt-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-nature-green-600 hover:bg-nature-green-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg"
          >
            {t.home.viewAllProducts}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Advantages Section */}
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <section className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              <span className="text-nature-green-600">{t.home.advantagesTitle}</span>
            </h2>
            <p className="text-sm text-gray-600">
              {t.home.advantagesSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-nature-green-200 transition-all">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-nature-green-50 rounded-lg mb-4">
                <Droplets className="w-6 h-6 text-nature-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t.home.advantageWaterBased}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t.home.advantageWaterBasedDesc}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-nature-green-200 transition-all">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-nature-green-50 rounded-lg mb-4">
                <Heart className="w-6 h-6 text-nature-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t.home.advantageHumanFriendly}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t.home.advantageHumanFriendlyDesc}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-nature-green-200 transition-all">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-nature-green-50 rounded-lg mb-4">
                <Mountain className="w-6 h-6 text-nature-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t.home.advantageNorwegianWater}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t.home.advantageNorwegianWaterDesc}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-nature-green-200 transition-all">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-nature-green-50 rounded-lg mb-4">
                <Sparkles className="w-6 h-6 text-nature-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t.home.advantageEffective}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t.home.advantageEffectiveDesc}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-nature-green-200 transition-all">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-nature-green-50 rounded-lg mb-4">
                <TrendingDown className="w-6 h-6 text-nature-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t.home.advantageLowConsumption}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t.home.advantageLowConsumptionDesc}
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-nature-green-200 transition-all">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-nature-green-50 rounded-lg mb-4">
                <Leaf className="w-6 h-6 text-nature-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t.home.advantageDegradable}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t.home.advantageDegradableDesc}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Greenex and Product Range Section */}
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <section>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Greenex Card */}
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 hover:border-nature-green-200 transition-all">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  <span className="text-nature-green-600">{t.home.greenexTitle}</span>
                </h2>
              </div>
              <div className="space-y-3 text-gray-600 leading-relaxed text-sm">
                <p>
                  {t.home.greenexDescription}
                </p>
              </div>
            </div>

            {/* NORWA Product Range Card */}
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 hover:border-nature-green-200 transition-all">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  <span className="text-nature-green-600">{t.home.productRangeTitle}</span>
                </h2>
              </div>
              <div className="space-y-3 text-gray-600 leading-relaxed text-sm">
                <p>
                  {t.home.productRangeDescription}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
