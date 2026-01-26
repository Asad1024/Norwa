'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Order, OrderItem } from '@/types/database'
import { useTranslations } from '@/hooks/useTranslations'
import { useLanguageStore } from '@/store/languageStore'
import { getTranslation } from '@/lib/translations'
import { useGlobalLoader } from '@/components/GlobalLoader'
import ProductImage from '@/components/ProductImage'
import { Search } from 'lucide-react'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

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

  // Filter orders based on search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders

    const query = searchQuery.toLowerCase()
    return orders.filter((order) => {
      const orderId = order.id.toLowerCase()
      const status = order.status.toLowerCase()
      const date = new Date(order.created_at).toLocaleDateString().toLowerCase()
      const total = order.total.toString()
      
      // Search in order items
      const itemsMatch = order.order_items?.some((item: OrderItem & { products: any }) => {
        const productName = item.products?.name_translations 
          ? getTranslation(item.products.name_translations, language).toLowerCase()
          : item.products?.name?.toLowerCase() || ''
        return productName.includes(query)
      })

      return (
        orderId.includes(query) ||
        status.includes(query) ||
        date.includes(query) ||
        total.includes(query) ||
        itemsMatch
      )
    })
  }, [orders, searchQuery, language])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return t.orders.pending
      case 'processing':
        return t.orders.processing
      case 'delivered':
        return t.orders.delivered
      case 'cancelled':
        return t.orders.cancelled
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.orders.title}</h1>
          <p className="text-gray-600">View and manage your order history</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID, status, date, product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm bg-white"
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders && filteredOrders.length > 0 ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t.orders.orderId}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t.orders.date}
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t.orders.status}
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      {t.orders.total}
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order: Order & { order_items: (OrderItem & { products: any })[] }) => {
                    const isExpanded = expandedOrders.has(order.id)
                    return (
                      <>
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-mono text-sm font-semibold text-gray-900">
                              {order.id.slice(0, 8)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(order.created_at).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <div className="flex -space-x-2">
                                {order.order_items?.slice(0, 3).map((item: any, idx: number) => (
                                  <div
                                    key={item.id}
                                    className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-100"
                                    style={{ zIndex: 10 - idx }}
                                  >
                                    <ProductImage
                                      imageUrl={item.products?.image_url}
                                      alt="Product"
                                      className="w-full h-full object-cover"
                                      containerClassName="w-full h-full flex items-center justify-center pointer-events-none"
                                      iconSize="small"
                                      showText={false}
                                    />
                                  </div>
                                ))}
                              </div>
                              <div className="text-sm text-gray-900">
                                <span className="font-medium">{order.order_items?.length || 0}</span>
                                <span className="text-gray-500"> {order.order_items?.length === 1 ? 'item' : 'items'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-semibold text-gray-900">
                              kr {order.total.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => {
                                const newExpanded = new Set(expandedOrders)
                                if (isExpanded) {
                                  newExpanded.delete(order.id)
                                } else {
                                  newExpanded.add(order.id)
                                }
                                setExpandedOrders(newExpanded)
                              }}
                              className="inline-flex items-center px-4 py-2 bg-nature-green-600 hover:bg-nature-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              {isExpanded ? 'Hide Details' : t.orders.viewDetails}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 bg-gray-50">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Delivery Information */}
                                {(order.delivery_customer || order.delivery_address || order.delivery_postal_code || order.shipping_address) && (
                                  <div className="p-4 bg-nature-green-50 rounded-lg border border-nature-green-200">
                                    <h3 className="text-sm font-semibold text-nature-green-700 mb-3 uppercase tracking-wide">
                                      {t.checkout.deliveryInformation}
                                    </h3>
                                    {order.delivery_type && (
                                      <p className="text-sm text-gray-700 mb-2">
                                        <span className="font-medium">{t.checkout.deliveryType}:</span> {order.delivery_type}
                                      </p>
                                    )}
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
                                {(order.email_for_order_confirmation || order.customer_reference || order.delivery_instructions || order.delivery_time || order.phone_number || order.dispatch_date || orderUsers[order.user_id]) && (
                                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h3 className="text-sm font-semibold text-blue-700 mb-3 uppercase tracking-wide">
                                      {t.checkout.orderInformation}
                                    </h3>
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
                                      <p className="text-sm text-gray-700">
                                        <span className="font-medium">{t.checkout.deliveryInstructions}:</span> {order.delivery_instructions}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Order Items */}
                                <div className="md:col-span-2 p-4 bg-white rounded-lg border border-gray-200">
                                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                    {t.cart.items}
                                  </h3>
                                  <div className="space-y-2">
                                    {order.order_items?.map((item: any) => {
                                      const productName = item.products?.name_translations 
                                        ? getTranslation(item.products.name_translations, language)
                                        : item.products?.name || 'Product'
                                      const itemSubtotal = item.price * item.quantity
                                      const itemTax = itemSubtotal * 0.25
                                      const itemTotal = itemSubtotal + itemTax
                                      return (
                                        <div
                                          key={item.id}
                                          className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                                        >
                                          <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0 border border-gray-200 overflow-hidden">
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
                                              <p className="text-xs text-gray-500">
                                                Tax (25%): kr {itemTax.toFixed(2)}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-semibold text-gray-900 text-sm">
                                              kr {itemTotal.toFixed(2)}
                                            </p>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                  
                                  {/* Order Summary */}
                                  <div className="mt-4 pt-4 border-t border-gray-300">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                      Order Summary
                                    </h3>
                                    <div className="space-y-2">
                                      {(() => {
                                        const itemsSubtotal = order.order_items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0
                                        // Calculate shipping: total = (items + shipping) * 1.25
                                        // So: shipping = (total / 1.25) - items
                                        const calculatedShipping = (order.total / 1.25) - itemsSubtotal
                                        const shipping = calculatedShipping > 0 ? calculatedShipping : 0
                                        const tax = (itemsSubtotal + shipping) * 0.25
                                        return (
                                          <>
                                            <div className="flex justify-between text-sm text-gray-600">
                                              <span>Items ({order.order_items?.length || 0}):</span>
                                              <span className="font-medium text-gray-900">kr {itemsSubtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600">
                                              <span>{t.common.shipping}:</span>
                                              <span className={`font-medium ${shipping === 0 ? 'text-nature-green-600' : 'text-gray-900'}`}>
                                                {shipping === 0 ? t.common.free : `kr ${shipping.toFixed(2)}`}
                                              </span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600">
                                              <span>Tax (25%):</span>
                                              <span className="font-medium text-gray-900">kr {tax.toFixed(2)}</span>
                                            </div>
                                            <div className="pt-2 mt-2 border-t border-gray-300">
                                              <div className="flex justify-between items-center">
                                                <span className="text-base font-semibold text-gray-900">{t.common.total}:</span>
                                                <span className="text-lg font-semibold text-gray-900">
                                                  kr {order.total.toFixed(2)}
                                                </span>
                                              </div>
                                            </div>
                                          </>
                                        )
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No orders found matching your search' : t.orders.noOrders}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-sm text-nature-green-600 hover:text-nature-green-700 font-medium mt-2"
              >
                Clear search
              </button>
            )}
            {!searchQuery && (
              <Link
                href="/products"
                className="inline-block mt-4 bg-nature-green-600 hover:bg-nature-green-700 text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors shadow-md hover:shadow-lg"
              >
                {t.home.shopNow} →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
