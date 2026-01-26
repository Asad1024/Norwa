'use client'

import { useCartStore } from '@/store/cartStore'
import { Product } from '@/types/database'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ToastProvider'
import { useTranslations } from '@/hooks/useTranslations'
import { getTranslation } from '@/lib/translations'
import { useLanguageStore } from '@/store/languageStore'

interface AddToCartButtonProps {
  product: Product
  quantity?: number
}

export default function AddToCartButton({ product, quantity = 1 }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { showToast } = useToast()
  const t = useTranslations()
  const language = useLanguageStore((state) => state.language)

  const handleAddToCart = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Store product info in sessionStorage to add after login
      // Store the full product data we need for adding to cart
      const productData = {
        id: product.id,
        name: getTranslation(product.name_translations, language),
        description: getTranslation(product.description_translations, language),
        price: product.price,
        stock: product.stock || 0,
        image_url: product.image_url,
        quantity: quantity,
      }
      sessionStorage.setItem('addToCartAfterLogin', JSON.stringify(productData))
      // Store the current page URL to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
      router.push('/login')
      return
    }

    setLoading(true)
    const productName = getTranslation(product.name_translations, language)
    addItem(
      {
        id: product.id,
        name: productName,
        description: getTranslation(product.description_translations, language),
        price: product.price,
        stock: product.stock || 0,
        image_url: product.image_url,
      },
      quantity
    )
    setLoading(false)
    showToast(`${productName} ${t.productDetail.addedToCart}`, 'success')
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading}
      className={`w-full font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg bg-nature-green-600 hover:bg-nature-green-700 text-white`}
    >
      {loading 
        ? t.productDetail.adding 
        : t.productDetail.addToCart}
    </button>
  )
}
