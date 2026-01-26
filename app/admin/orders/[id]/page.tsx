'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useGlobalLoader } from '@/components/GlobalLoader'
import BackButton from '@/components/BackButton'
import Modal from '@/components/Modal'
import { useTranslations } from '@/hooks/useTranslations'
import { useLanguageStore } from '@/store/languageStore'
import { getTranslation } from '@/lib/translations'
import ProductImage from '@/components/ProductImage'

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const { showLoader, hideLoader } = useGlobalLoader()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [orderUser, setOrderUser] = useState<any>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [modal, setModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  })
  const t = useTranslations()
  const language = useLanguageStore((state) => state.language)

  useEffect(() => {
    const fetchData = async () => {
      showLoader(t.loader.loading)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          hideLoader()
          router.push('/login')
          return
        }

        const isAdmin = user.user_metadata?.role === 'admin'
        if (!isAdmin) {
          hideLoader()
          router.push('/')
          return
        }

        setUser(user)

        // Fetch order details
        const { data: orderData, error } = await supabase
          .from('orders')
          .select(
            `
            *,
            order_items (
              *,
              products (*)
            )
          `
          )
          .eq('id', params.id)
          .single()

        if (error) throw error
        setOrder(orderData)

        // Fetch user details for this order
        if (orderData?.user_id) {
          try {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
              const userResponse = await fetch(`/api/admin/users/${orderData.user_id}`, {
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                },
              })
              
              if (userResponse.ok) {
                const userData = await userResponse.json()
                if (userData.user) {
                  setOrderUser({
                    email: userData.user.email,
                    name: userData.user.name,
                  })
                }
              }
            }
          } catch (userErr) {
            console.error('Error fetching user details:', userErr)
            // Continue without user details
          }
        }
      } catch (error: any) {
        console.error('Error fetching order:', error)
        setModal({
          isOpen: true,
          title: 'Error',
          message: error.message || 'Failed to load order details',
          type: 'error',
        })
      } finally {
        setLoading(false)
        hideLoader()
      }
    }

    fetchData()
  }, [params.id, supabase, router, showLoader, hideLoader])

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdatingStatus(true)
      showLoader(t.loader.loading)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', params.id)

      if (error) throw error

      setOrder({ ...order, status: newStatus })
      hideLoader()
      setModal({
        isOpen: true,
        title: 'Success',
        message: 'Order status updated successfully',
        type: 'success',
      })
    } catch (error: any) {
      console.error('Error updating status:', error)
      hideLoader()
      setModal({
        isOpen: true,
        title: 'Update Failed',
        message: error.message || 'Failed to update order status',
        type: 'error',
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading || !order) {
    return null // Global loader is showing
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    processing: 'bg-blue-100 text-blue-800 border-blue-300',
    delivered: 'bg-nature-green-100 text-nature-green-800 border-nature-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  }

  return (
    <>
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
      <div className="min-h-screen bg-gradient-to-b from-white to-nature-green-50 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <BackButton href="/admin/orders" className="mb-4" />
            <h1 className="text-2xl font-semibold text-gray-900">
              {t.orders.viewDetails || 'Order Details'}
            </h1>
          </div>

          {/* Order Info Card */}
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 mb-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">{t.orders.orderId}</p>
                <p className="font-mono text-lg font-bold text-nature-green-900">
                  {order.id}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">{t.orders.date}</p>
                <p className="text-lg font-semibold text-nature-green-900">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">{t.orders.status}</p>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  disabled={updatingStatus}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm border-2 transition-all ${
                    statusColors[order.status as keyof typeof statusColors] || statusColors.pending
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="pending">{t.orders.pending}</option>
                  <option value="processing">{t.orders.processing}</option>
                  <option value="delivered">{t.orders.delivered}</option>
                  <option value="cancelled">{t.orders.cancelled}</option>
                </select>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">{t.orders.total}</p>
                <p className="text-3xl font-extrabold bg-gradient-to-r from-nature-blue-600 to-nature-green-600 bg-clip-text text-transparent">
                  kr {order.total.toFixed(2)}
                </p>
              </div>
            </div>

            {/* User Information */}
            {orderUser && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-nature-green-800 mb-3">{t.profile.user || 'User Information'}</h3>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-800 font-medium mb-2">
                    <span className="font-semibold">{t.common.name}:</span> {orderUser.name}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">{t.common.email}:</span> {orderUser.email}
                  </p>
                </div>
              </div>
            )}

            {/* Delivery Information */}
            {(order.delivery_customer || order.delivery_address || order.delivery_postal_code || order.shipping_address) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-nature-green-800 mb-3 flex items-center gap-2">
                  <span>📍</span>
                  {t.checkout.deliveryInformation}
                </h3>
                <div className="bg-nature-green-50 rounded-lg p-4 border border-nature-green-200">
                  {order.delivery_type && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-nature-green-700 mb-1">{t.checkout.deliveryType}</p>
                      <p className="text-gray-900">{order.delivery_type}</p>
                    </div>
                  )}
                  {order.delivery_customer ? (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-nature-green-700 mb-1">{t.checkout.customer}</p>
                      <p className="text-gray-900 font-medium">{order.delivery_customer}</p>
                    </div>
                  ) : order.shipping_address && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-nature-green-700 mb-1">{t.checkout.customer}</p>
                      <p className="text-gray-900 font-medium">{order.shipping_address.split('\n')[0]}</p>
                    </div>
                  )}
                  {order.delivery_address ? (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-nature-green-700 mb-1">{t.checkout.address}</p>
                      <p className="text-gray-900">{order.delivery_address}</p>
                    </div>
                  ) : order.shipping_address && order.shipping_address.split('\n').length > 1 && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-nature-green-700 mb-1">{t.checkout.address}</p>
                      <p className="text-gray-900">{order.shipping_address.split('\n')[1]}</p>
                    </div>
                  )}
                  {(order.delivery_postal_code || order.delivery_postal_place) ? (
                    <div className="grid grid-cols-2 gap-4">
                      {order.delivery_postal_code && (
                        <div>
                          <p className="text-sm font-semibold text-nature-green-700 mb-1">{t.checkout.postalCode}</p>
                          <p className="text-gray-900">{order.delivery_postal_code}</p>
                        </div>
                      )}
                      {order.delivery_postal_place && (
                        <div>
                          <p className="text-sm font-semibold text-nature-green-700 mb-1">{t.checkout.postalPlace}</p>
                          <p className="text-gray-900">{order.delivery_postal_place}</p>
                        </div>
                      )}
                    </div>
                  ) : order.shipping_address && order.shipping_address.split('\n').length > 2 && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-nature-green-700 mb-1">{t.checkout.postalCode}</p>
                        <p className="text-gray-900">{order.shipping_address.split('\n')[2].split(' ')[0]}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-nature-green-700 mb-1">{t.checkout.postalPlace}</p>
                        <p className="text-gray-900">{order.shipping_address.split('\n')[2].split(' ').slice(1).join(' ')}</p>
                      </div>
                    </div>
                  )}
                  {!order.delivery_customer && !order.delivery_address && !order.delivery_postal_code && order.shipping_address && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-nature-green-700 mb-1">{t.checkout.shippingAddress}</p>
                      <p className="text-gray-900 whitespace-pre-line">{order.shipping_address}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Information */}
            {(order.email_for_order_confirmation || order.customer_reference || order.delivery_instructions || order.delivery_time || order.phone_number || order.dispatch_date || order.periodic_orders) && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <span>📝</span>
                  {t.checkout.orderInformation}
                </h3>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  {order.email_for_order_confirmation && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-blue-700 mb-1">{t.checkout.emailForOrderConfirmation}</p>
                      <p className="text-gray-900">{order.email_for_order_confirmation}</p>
                    </div>
                  )}
                  {order.phone_number && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-blue-700 mb-1">{t.checkout.phoneNumber}</p>
                      <p className="text-gray-900">{order.phone_number}</p>
                    </div>
                  )}
                  {order.customer_reference && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-blue-700 mb-1">{t.checkout.customerReference}</p>
                      <p className="text-gray-900">{order.customer_reference}</p>
                    </div>
                  )}
                  {order.delivery_instructions && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-blue-700 mb-1">{t.checkout.deliveryInstructions}</p>
                      <p className="text-gray-900 whitespace-pre-wrap">{order.delivery_instructions}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {order.dispatch_date && (
                      <div>
                        <p className="text-sm font-semibold text-blue-700 mb-1">{t.checkout.dispatchDate}</p>
                        <p className="text-gray-900">{new Date(order.dispatch_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {order.delivery_time && (
                      <div>
                        <p className="text-sm font-semibold text-blue-700 mb-1">{t.checkout.deliveryTime}</p>
                        <p className="text-gray-900">{order.delivery_time}</p>
                      </div>
                    )}
                  </div>
                  {(order.periodic_orders || order.alternative_delivery_address) && (
                    <div className="flex flex-wrap gap-4">
                      {order.periodic_orders && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-blue-700">{t.checkout.periodicOrders}:</span>
                          <span className="text-gray-900">{t.common.yes}</span>
                        </div>
                      )}
                      {order.alternative_delivery_address && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-blue-700">{t.checkout.alternativeDeliveryAddress}:</span>
                          <span className="text-gray-900">{t.common.yes}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <h2 className="text-2xl font-bold text-nature-green-800 mb-4">{t.cart.items}</h2>
            {order.order_items && order.order_items.length > 0 ? (
              <div className="space-y-4">
                {order.order_items.map((item: any) => {
                  const productName = item.products?.name_translations 
                    ? getTranslation(item.products.name_translations, language)
                    : item.products?.name || 'Product'
                  const productDesc = item.products?.description_translations 
                    ? getTranslation(item.products.description_translations, language)
                    : item.products?.description
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200 overflow-hidden">
                        <ProductImage
                          imageUrl={item.products?.image_url}
                          alt={productName}
                          className="w-full h-full object-cover"
                          containerClassName="w-full h-full flex items-center justify-center pointer-events-none"
                          iconSize="small"
                          showText={false}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-nature-green-900 mb-1">
                          {productName}
                        </h3>
                        {productDesc && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {productDesc}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{t.common.quantity}: <strong className="text-nature-green-800">{item.quantity}</strong></span>
                          <span>{t.common.price}: <strong className="text-nature-green-800">kr {item.price.toFixed(2)}</strong></span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">{t.common.subtotal}</p>
                        <p className="text-xl font-bold text-nature-blue-600">
                          kr {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">{t.adminOrders.noOrders}</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
