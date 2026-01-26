'use client'

import { useCartStore } from '@/store/cartStore'
import NavLink from '@/components/NavLink'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ToastProvider'
import { useGlobalLoader } from '@/components/GlobalLoader'
import { useTranslations } from '@/hooks/useTranslations'
import ProductImage from '@/components/ProductImage'

export default function CartPage() {
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const getTotal = useCartStore((state) => state.getTotal)
  const router = useRouter()
  const { showLoader, hideLoader } = useGlobalLoader()
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const { showToast } = useToast()
  const t = useTranslations()

  useEffect(() => {
    const getUser = async () => {
      showLoader(t.loader.loading)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      if (!user) {
        hideLoader()
        router.push('/login')
        return
      }
      hideLoader()
      setLoading(false)
    }
    getUser()
  }, [supabase, router, showLoader, hideLoader])

  const handleCheckout = () => {
    router.push('/checkout')
    // Loader will auto-hide when navigation completes
  }

  if (loading || !user) {
    return null // Global loader is showing
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-16 px-4 bg-white" style={{ background: '#ffffff', backgroundImage: 'none' }}>
        <div className="container mx-auto max-w-4xl">
          {/* Empty Cart Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <div className="w-24 h-24 bg-nature-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-12 h-12 text-nature-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-3">
              {t.cart.emptyTitle}
            </h1>
            <p className="text-sm text-gray-600 mb-8 max-w-xl mx-auto">
              {t.cart.emptyMessage}
            </p>
            <NavLink
              href="/products"
              className="inline-flex items-center gap-2 bg-nature-green-600 hover:bg-nature-green-700 text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {t.cart.startShopping}
            </NavLink>
          </div>

          {/* Why Shop Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              {t.cart.whyShop}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-5 bg-gray-50 rounded-lg border border-gray-200">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-nature-green-50 rounded-lg mb-3">
                  <span className="text-2xl">🌿</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{t.cart.ecoFriendly}</h3>
                <p className="text-sm text-gray-600">{t.cart.ecoFriendlyDesc}</p>
              </div>
              <div className="text-center p-5 bg-gray-50 rounded-lg border border-gray-200">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-nature-blue-50 rounded-lg mb-3">
                  <span className="text-2xl">🚚</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{t.cart.fastDelivery}</h3>
                <p className="text-sm text-gray-600">{t.cart.fastDeliveryDesc}</p>
              </div>
              <div className="text-center p-5 bg-gray-50 rounded-lg border border-gray-200">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-50 rounded-lg mb-3">
                  <span className="text-2xl">💚</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{t.cart.qualityProducts}</h3>
                <p className="text-sm text-gray-600">{t.cart.qualityProductsDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-white" style={{ background: '#ffffff', backgroundImage: 'none' }}>
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            {t.cart.title}
          </h1>
          <p className="text-sm text-gray-600">
            {items.length} {items.length === 1 ? t.common.item : t.common.items} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="bg-gray-900 px-5 py-3 border-b border-gray-200">
                <h2 className="text-base font-semibold text-white">Cart Items</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-lg flex-shrink-0 border border-gray-200 overflow-hidden relative">
                      <ProductImage
                        imageUrl={item.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full flex items-center justify-center pointer-events-none"
                        iconSize="small"
                        showText={false}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 font-medium text-sm mb-3">
                        kr {item.price.toFixed(2)} {t.common.each}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-nature-green-50 rounded-lg p-1 border border-nature-green-200">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded bg-white hover:bg-nature-green-100 text-nature-green-700 font-medium transition-colors text-sm border border-nature-green-200 hover:border-nature-green-300"
                          >
                            -
                          </button>
                          <span className="w-10 text-center font-medium text-gray-900 text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              // Allow unlimited quantity - no stock restrictions
                              const currentQuantity = item.quantity
                              const newQuantity = currentQuantity + 1
                              console.log('[Cart Page] Increasing quantity:', { 
                                itemId: item.id, 
                                currentQuantity, 
                                newQuantity,
                                stock: item.stock 
                              })
                              updateQuantity(item.id, newQuantity)
                            }}
                            className="w-7 h-7 rounded bg-white hover:bg-nature-green-100 text-nature-green-700 font-medium transition-colors text-sm border border-nature-green-200 hover:border-nature-green-300 cursor-pointer active:scale-95"
                            type="button"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const itemId = item.id
                            const itemName = item.name
                            removeItem(itemId)
                            // Use setTimeout to ensure state update happens before toast
                            setTimeout(() => {
                              showToast(`${itemName} removed from cart`, 'info')
                            }, 0)
                          }}
                          className="px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded text-sm font-medium transition-colors border border-red-200 hover:border-red-300 cursor-pointer relative z-10"
                          title="Remove item"
                          type="button"
                          style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right w-full sm:w-auto">
                      <p className="text-xs text-gray-500 mb-1">{t.common.subtotal}</p>
                      <p className="font-semibold text-gray-900 text-lg">
                        kr {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-5 pb-3 border-b border-gray-200">
                {t.cart.orderSummary}
              </h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t.cart.items} ({items.length})</span>
                  <span className="font-medium text-gray-900">kr {getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t.common.shipping}</span>
                  <span className="font-medium text-nature-green-600">{t.common.free}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (25%)</span>
                  <span className="font-medium text-gray-900">kr {(getTotal() * 0.25).toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900">{t.common.total}</span>
                    <span className="text-xl font-semibold text-gray-900">
                      kr {(getTotal() * 1.25).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-nature-green-600 hover:bg-nature-green-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {t.cart.proceedToCheckout}
              </button>

              <NavLink
                href="/products"
                className="mt-3 w-full block text-center bg-gray-50 hover:bg-nature-green-50 text-gray-700 hover:text-nature-green-700 font-medium py-2.5 px-4 rounded-lg border border-gray-200 hover:border-nature-green-200 transition-colors text-sm"
              >
                {t.cart.continueShopping}
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
