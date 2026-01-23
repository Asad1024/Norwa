'use client'

import { useEffect, useRef } from 'react'
import { useCartStore } from '@/store/cartStore'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ToastProvider'
import { useTranslations } from '@/hooks/useTranslations'
import { getTranslation } from '@/lib/translations'
import { useLanguageStore } from '@/store/languageStore'

export default function PendingCartHandler() {
  const addItem = useCartStore((state) => state.addItem)
  const supabase = createClient()
  const { showToast } = useToast()
  const t = useTranslations()
  const language = useLanguageStore((state) => state.language)
  const processedRef = useRef<string | null>(null)

  useEffect(() => {
    const handlePendingCartItem = async () => {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check for pending cart item
      const pendingCartItemStr = sessionStorage.getItem('addToCartAfterLogin')
      if (!pendingCartItemStr) return
      
      // Prevent processing the same item multiple times
      if (processedRef.current === pendingCartItemStr) return
      processedRef.current = pendingCartItemStr

      try {
        const productData = JSON.parse(pendingCartItemStr)
        
        // Check if we have full product data or just productId
        if (productData.productId) {
          // Old format - fetch product details
          const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productData.productId)
            .single()

          if (error || !product) {
            console.error('Error fetching product:', error)
            sessionStorage.removeItem('addToCartAfterLogin')
            return
          }

          // Add to cart (no stock validation - allow adding even if stock is 0)
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
            productData.quantity || 1
          )

          showToast(`${productName} ${t.productDetail.addedToCart}`, 'success')
        } else {
          // New format - we have full product data
          const { id, name, description, price, stock, image_url, quantity } = productData
          
          // Add to cart (no stock validation - allow adding even if stock is 0)
          addItem(
            {
              id,
              name,
              description,
              price,
              stock,
              image_url,
            },
            quantity || 1
          )

          showToast(`${name} ${t.productDetail.addedToCart}`, 'success')
        }
        
        sessionStorage.removeItem('addToCartAfterLogin')
      } catch (error) {
        console.error('Error handling pending cart item:', error)
        sessionStorage.removeItem('addToCartAfterLogin')
      }
    }

    // Small delay to ensure auth state is ready
    const timer = setTimeout(() => {
      handlePendingCartItem()
    }, 500)

    return () => clearTimeout(timer)
  }, [addItem, supabase, showToast, t, language])

  return null // This component doesn't render anything
}
