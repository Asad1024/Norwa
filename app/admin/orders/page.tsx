'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useGlobalLoader } from '@/components/GlobalLoader'
import Modal from '@/components/Modal'
import BackButton from '@/components/BackButton'
import { Clock, RefreshCw, CheckCircle, XCircle, Package, Search } from 'lucide-react'
import { useTranslations } from '@/hooks/useTranslations'

export default function AdminOrdersPage() {
  const router = useRouter()
  const supabase = createClient()
  const { showLoader, hideLoader } = useGlobalLoader()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('pending')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
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

  useEffect(() => {
    const getUser = async () => {
      showLoader(t.loader.loading)
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
      await fetchOrders()
      hideLoader()
    }

    getUser()
  }, [supabase, router, showLoader, hideLoader])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
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
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId)
      showLoader(t.loader.loading)
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
        })
        .eq('id', orderId)

      if (error) {
        console.error('Update error:', error)
        throw error
      }

      // Update local state immediately for better UX
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ))

      // Refresh orders to ensure consistency
      await fetchOrders()
      hideLoader()
    } catch (error: any) {
      console.error('Error updating status:', error)
      hideLoader()
      setModal({
        isOpen: true,
        title: t.adminOrders.updateFailed || 'Update Failed',
        message: `${t.adminOrders.updateFailed}: ${error.message || 'Unknown error'}`,
        type: 'error',
      })
      fetchOrders()
    } finally {
      setUpdatingStatus(null)
    }
  }

  // Group orders by status
  const ordersByStatus = useMemo(() => {
    const grouped: Record<string, any[]> = {
      pending: [],
      processing: [],
      delivered: [],
      cancelled: [],
    }

    orders.forEach((order) => {
      const status = order.status || 'pending'
      if (grouped[status]) {
        grouped[status].push(order)
      } else {
        grouped.pending.push(order)
      }
    })

    return grouped
  }, [orders])

  // Get orders count for each status
  const statusCounts = useMemo(() => {
    return {
      pending: ordersByStatus.pending.length,
      processing: ordersByStatus.processing.length,
      delivered: ordersByStatus.delivered.length,
      cancelled: ordersByStatus.cancelled.length,
    }
  }, [ordersByStatus])

  // Get filtered orders based on selected status and search query
  const filteredOrders = useMemo(() => {
    let filtered = ordersByStatus[selectedStatus] || []
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((order: any) => {
        const orderId = order.id.toLowerCase()
        const shippingAddress = (order.shipping_address || '').toLowerCase()
        const phoneNumber = (order.phone_number || '').toLowerCase()
        const total = order.total.toString()
        
        return (
          orderId.includes(query) ||
          shippingAddress.includes(query) ||
          phoneNumber.includes(query) ||
          total.includes(query)
        )
      })
    }
    
    return filtered
  }, [ordersByStatus, selectedStatus, searchQuery])

  const statusConfig = [
    {
      status: 'pending',
      title: t.orders.pending,
      icon: <Clock className="w-6 h-6" />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-800',
      badgeColor: 'bg-yellow-100 text-yellow-800',
    },
    {
      status: 'processing',
      title: t.orders.processing,
      icon: <RefreshCw className="w-6 h-6" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-800',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      status: 'delivered',
      title: t.orders.delivered,
      icon: <CheckCircle className="w-6 h-6" />,
      bgColor: 'bg-nature-green-50',
      borderColor: 'border-nature-green-300',
      textColor: 'text-nature-green-800',
      badgeColor: 'bg-nature-green-100 text-nature-green-800',
    },
    {
      status: 'cancelled',
      title: t.orders.cancelled,
      icon: <XCircle className="w-6 h-6" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-800',
      badgeColor: 'bg-red-100 text-red-800',
    },
  ]

  const renderOrderRow = (order: any) => (
    <tr
      key={order.id}
      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
    >
      <td className="py-3 px-4">
        <div className="font-mono text-sm text-gray-900">{order.id.slice(0, 8)}</div>
      </td>
      <td className="py-3 px-4">
        <div className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</div>
      </td>
      <td className="py-3 px-4">
        <div className="text-sm font-medium text-gray-900">kr {order.total.toFixed(2)}</div>
      </td>
      <td className="py-3 px-4">
        <select
          value={order.status}
          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
          disabled={updatingStatus === order.id}
          className={`px-2.5 py-1 rounded text-xs font-medium border transition-all ${
            order.status === 'pending'
              ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
              : order.status === 'delivered'
              ? 'bg-green-100 border-green-300 text-green-800'
              : order.status === 'processing'
              ? 'bg-blue-100 border-blue-300 text-blue-800'
              : 'bg-gray-100 border-gray-300 text-gray-800'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <option value="pending">{t.orders.pending}</option>
          <option value="processing">{t.orders.processing}</option>
          <option value="delivered">{t.orders.delivered}</option>
          <option value="cancelled">{t.orders.cancelled}</option>
        </select>
      </td>
      <td className="py-3 px-4">
        <div className="text-xs text-gray-600 truncate max-w-xs" title={order.shipping_address}>
          {order.shipping_address || '-'}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="text-xs text-gray-600">{order.order_items?.length || 0} {t.common.items}</div>
      </td>
      <td className="py-3 px-4 text-right">
        <Link
          href={`/admin/orders/${order.id}`}
          onClick={() => showLoader(t.loader.loading)}
          className="text-sm font-medium text-gray-900 hover:text-gray-700"
        >
          {t.common.view}
        </Link>
      </td>
    </tr>
  )

  if (loading) {
    return null // Global loader is showing
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
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header with Back Button */}
          <div className="mb-6">
            <BackButton href="/admin" className="mb-4" />
            <h1 className="text-2xl font-semibold text-gray-900">
              {t.adminOrders.title}
            </h1>
          </div>

          {/* Status Tabs */}
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {statusConfig.map((config) => {
                const isActive = selectedStatus === config.status
                const count = statusCounts[config.status as keyof typeof statusCounts]

                return (
                  <button
                    key={config.status}
                    onClick={() => setSelectedStatus(config.status)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                      isActive
                        ? 'bg-nature-green-600 text-white border-nature-green-600'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className={isActive ? 'text-white' : 'text-gray-600'}>
                      {React.cloneElement(config.icon as React.ReactElement, { className: 'w-4 h-4' })}
                    </div>
                    <div className="text-left">
                      <p className={`font-medium text-xs ${isActive ? 'text-white' : 'text-gray-700'}`}>
                        {config.title}
                      </p>
                      <p className={`text-xs ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                        {count}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t.adminOrders.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm bg-white"
                />
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {statusConfig.find(c => c.status === selectedStatus)?.title || t.orders.title}
                </h2>
                <span className="text-sm text-gray-500">
                  {filteredOrders.length} {filteredOrders.length === 1 ? t.common.item : t.common.items}
                </span>
              </div>
            </div>
            {filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.orders.orderId}</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.orders.date}</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.orders.total}</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.orders.status}</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.checkout.shippingAddress}</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.cart.items}</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((order) => renderOrderRow(order))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-3">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {t.adminOrders.noOrders}
                </p>
                <p className="text-xs text-gray-500">
                  {searchQuery ? 'Try adjusting your search query' : 'No orders found for this status'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
