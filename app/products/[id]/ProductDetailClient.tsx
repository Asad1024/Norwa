'use client'

import { Product } from '@/types/database'
import AddToCartButton from '@/components/AddToCartButton'
import BackButton from '@/components/BackButton'
import { Image as ImageIcon, FileText, Download } from 'lucide-react'
import ProductImage from '@/components/ProductImage'
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

  const handleDownloadTechnicalData = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const technicalDataUrl = (product as any).technical_data_url
    if (!technicalDataUrl) return

    try {
      // Fetch the file
      const response = await fetch(technicalDataUrl)
      if (!response.ok) throw new Error('Failed to fetch file')
      
      // Get the blob
      const blob = await response.blob()
      
      // Extract file extension from URL
      const urlParts = technicalDataUrl.split('.')
      const extension = urlParts.length > 1 ? '.' + urlParts[urlParts.length - 1].split('?')[0] : ''
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${productName} Technical Data${extension}`
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)
      // Fallback: open in new tab if download fails
      window.open(technicalDataUrl, '_blank')
    }
  }
  
  return (
    <>
      <div className="mb-6">
        <BackButton href="/products" />
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
          {/* Product Image */}
          <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center min-h-[300px] max-h-[400px]">
            <ProductImage
              imageUrl={product.image_url}
              className="max-w-full max-h-[350px] object-contain rounded-lg"
              containerClassName="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center rounded-lg relative overflow-hidden"
              iconSize="large"
              placeholderText="No Image Available"
            />
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
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {(product.stock || 0) > 0 
                  ? `${t.products.stock || 'Stock'}: ${product.stock}`
                  : t.products.comingSoon || 'Coming Soon'}
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
            {(product as any).technical_data_url && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Technical Data
                </h2>
                <button
                  onClick={handleDownloadTechnicalData}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors text-sm font-medium"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download Technical Data</span>
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="mt-auto">
              <AddToCartButton product={product} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
