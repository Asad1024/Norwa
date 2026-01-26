'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Order, OrderItem } from '@/types/database'
import { useTranslations } from '@/hooks/useTranslations'
import { useLanguageStore } from '@/store/languageStore'
import { getTranslation } from '@/lib/translations'
import { useGlobalLoader } from '@/components/GlobalLoader'
import ProductImage from '@/components/ProductImage'

export default function OrdersPage() {
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations()
  const language = useLanguageStore((state) => state.language)
  const { showLoader, hideLoader } = useGlobalLoader()
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<(Order & { order_items: (OrderItem & { products: any })[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [orderUsers, setOrderUsers] = useState<Record<string, { name: string; email: string }>>({})

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

      setUser(user)

      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setOrders(data || [])
      
      // Set current user info for all orders (since all orders belong to the logged-in user)
      setOrderUsers({
        [user.id]: {
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
        }
      })
      
      hideLoader()
      setLoading(false)
    }

    fetchData()
  }, [supabase, router, showLoader, hideLoader, t])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
          {t.orders.title}
        </h1>

        {orders && orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order: Order & { order_items: (OrderItem & { products: any })[] }) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap justify-between items-start mb-5 pb-4 border-b border-gray-200">
                  <div className="mb-3 md:mb-0">
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{t.orders.orderId}</p>
                    <p className="font-mono font-semibold text-gray-900 text-sm">
                      {order.id.slice(0, 8)}
                    </p>
                  </div>
                  <div className="mb-3 md:mb-0">
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{t.orders.date}</p>
                    <p className="font-medium text-gray-900 text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{t.orders.status}</p>
                    <span className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'pending' ? t.orders.pending :
                       order.status === 'delivered' ? t.orders.delivered :
                       order.status === 'processing' ? t.orders.processing :
                       order.status === 'cancelled' ? t.orders.cancelled :
                       order.status}
                    </span>
                  </div>
                </div>

                {/* Delivery Information */}
                {(order.delivery_customer || order.delivery_address || order.delivery_postal_code || order.shipping_address) && (
                  <div className="mb-4 p-3 bg-nature-green-50 rounded-lg border border-nature-green-200">
                    <p className="text-xs font-medium text-nature-green-700 mb-2 uppercase tracking-wide font-semibold">
                      {t.checkout.deliveryInformation}
                    </p>
                    {order.delivery_type && (
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">{t.checkout.deliveryType}:</span> {order.delivery_type}
                      </p>
                    )}
                    {/* Show new fields if they exist, otherwise parse from shipping_address */}
                    {order.delivery_customer ? (
                      <p className="text-sm text-gray-900 font-medium mb-1">{order.delivery_customer}</p>
                    ) : order.shipping_address && order.shipping_address.split('\n')[0] && (
                      <p className="text-sm text-gray-900 font-medium mb-1">{order.shipping_address.split('\n')[0]}</p>
                    )}
                    {order.delivery_address ? (
                      <p className="text-sm text-gray-900 mb-1">{order.delivery_address}</p>
                    ) : order.shipping_address && order.shipping_address.split('\n').length > 1 && order.shipping_address.split('\n')[1] && (
                      <p className="text-sm text-gray-900 mb-1">{order.shipping_address.split('\n')[1]}</p>
                    )}
                    {(order.delivery_postal_code || order.delivery_postal_place) ? (
                      <p className="text-sm text-gray-900">
                        {order.delivery_postal_code} {order.delivery_postal_place}
                      </p>
                    ) : order.shipping_address && order.shipping_address.split('\n').length > 2 && order.shipping_address.split('\n')[2] && (
                      <p className="text-sm text-gray-900">{order.shipping_address.split('\n')[2]}</p>
                    )}
                  </div>
                )}

                {/* Order Information */}
                {(order.email_for_order_confirmation || order.customer_reference || order.delivery_instructions || order.delivery_time || order.phone_number || order.dispatch_date || order.periodic_orders || orderUsers[order.user_id]) && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-medium text-blue-700 mb-2 uppercase tracking-wide font-semibold">
                      {t.checkout.orderInformation}
                    </p>
                    {orderUsers[order.user_id]?.name && (
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">{t.common.name}:</span> {orderUsers[order.user_id].name}
                      </p>
                    )}
                    {(order.email_for_order_confirmation || orderUsers[order.user_id]?.email) && (
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">{t.checkout.emailForOrderConfirmation}:</span> {order.email_for_order_confirmation || orderUsers[order.user_id]?.email}
                      </p>
                    )}
                    {order.phone_number && (
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">{t.checkout.phoneNumber}:</span> {order.phone_number}
                      </p>
                    )}
                    {order.customer_reference && (
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">{t.checkout.customerReference}:</span> {order.customer_reference}
                      </p>
                    )}
                    {order.dispatch_date && (
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">{t.checkout.dispatchDate}:</span> {new Date(order.dispatch_date).toLocaleDateString()}
                      </p>
                    )}
                    {order.delivery_time && (
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">{t.checkout.deliveryTime}:</span> {order.delivery_time}
                      </p>
                    )}
                    {order.delivery_instructions && (
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">{t.checkout.deliveryInstructions}:</span> {order.delivery_instructions}
                      </p>
                    )}
                    {order.periodic_orders && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">{t.checkout.periodicOrders}:</span> {t.common.yes}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <p className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">{t.cart.items}:</p>
                  {order.order_items?.map((item: OrderItem & { products: any }) => {
                    const productName = item.products?.name_translations 
                      ? getTranslation(item.products.name_translations, language)
                      : item.products?.name || 'Product'
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2 bg-gray-50 rounded-lg px-3"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0 border border-gray-200 overflow-hidden">
                            <ProductImage
                              imageUrl={item.products?.image_url}
                              alt={productName}
                              className="w-full h-full object-cover"
                              containerClassName="w-full h-full flex items-center justify-center pointer-events-none"
                              iconSize="small"
                              showText={false}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {productName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {t.common.quantity}: {item.quantity} × kr {item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">
                          kr {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    )
                  })}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-base font-semibold text-gray-900">
                    {t.common.total}:
                  </span>
                  <span className="text-xl font-semibold text-gray-900">
                    kr {order.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-4">
              {t.orders.noOrders}
            </p>
            <Link
              href="/products"
              className="inline-block bg-nature-green-600 hover:bg-nature-green-700 text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors shadow-md hover:shadow-lg"
            >
              {t.home.shopNow} →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
