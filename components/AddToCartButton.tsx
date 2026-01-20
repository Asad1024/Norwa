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
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
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
        image_url: product.image_url,
      },
      1
    )
    setLoading(false)
    showToast(`${productName} ${t.productDetail.addedToCart}`, 'success')
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading}
      className="w-full bg-nature-green-600 hover:bg-nature-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md hover:shadow-lg"
    >
      {loading ? t.productDetail.adding : t.productDetail.addToCart}
    </button>
  )
}
