'use client'

import { Product } from '@/types/database'
import AddToCartButton from '@/components/AddToCartButton'
import BackButton from '@/components/BackButton'
import { Image as ImageIcon } from 'lucide-react'
import { useLanguageStore } from '@/store/languageStore'
import { getTranslation } from '@/lib/translations'
import { useTranslations } from '@/hooks/useTranslations'
import { getCategoryEmoji } from '@/lib/categoryIcons'

interface ProductDetailClientProps {
  product: Product & { category_data?: any }
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const language = useLanguageStore((state) => state.language)
  const t = useTranslations()
  const productName = getTranslation(product.name_translations, language)
  const productDescription = getTranslation(product.description_translations, language)
  const categoryName = product.category_data
    ? getTranslation(product.category_data.name_translations, language)
    : product.category || null
  const emoji = getCategoryEmoji(categoryName || '', product.category_data?.icon)
  
  return (
    <>
      <div className="mb-6">
        <BackButton href="/products" />
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
          {/* Product Image */}
          <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center min-h-[400px]">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={productName}
                className="max-w-full max-h-full object-contain rounded-lg"
                style={{ maxHeight: '400px' }}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
                <ImageIcon className="w-24 h-24 text-gray-300" />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            {categoryName && (
              <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm font-medium">
                  {emoji && <span>{emoji}</span>}
                  {categoryName}
                </span>
              </div>
            )}
            <h1 className="text-2xl font-semibold text-gray-900 mb-3">
              {productName}
            </h1>
            <p className="text-3xl font-semibold text-gray-900 mb-4">
              ${product.price.toFixed(2)}
            </p>
            <div className="mb-4">
              <span className={`inline-block px-3 py-1.5 rounded text-sm font-medium ${
                (product.stock || 0) > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {t.products.stock || 'Stock'}: {(product.stock || 0) > 0 ? product.stock : t.products.outOfStock || 'Out of Stock'}
              </span>
            </div>
            <div className="mb-6 flex-1">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                {t.common.description || 'Description'}
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm">
                {productDescription}
              </p>
            </div>
            <div className="mt-auto">
              <AddToCartButton product={product} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
