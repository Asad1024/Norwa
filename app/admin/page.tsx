'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useGlobalLoader } from '@/components/GlobalLoader'
import { useTranslations } from '@/hooks/useTranslations'
import { Package, ShoppingCart, FolderOpen, Clock, Plus, Users, ClipboardList, ArrowRight } from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const { showLoader, hideLoader } = useGlobalLoader()
  const [stats, setStats] = useState({
    productCount: 0,
    orderCount: 0,
    categoryCount: 0,
    pendingOrders: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const t = useTranslations()

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

        // Fetch statistics
        const [
          { count: productCount },
          { count: orderCount },
          { count: categoryCount },
          { count: pendingOrders },
          { data: ordersData },
        ] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('categories').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10),
        ])

        setStats({
          productCount: productCount || 0,
          orderCount: orderCount || 0,
          categoryCount: categoryCount || 0,
          pendingOrders: pendingOrders || 0,
        })
        setRecentOrders(ordersData || [])
        
        // Fetch users
        await fetchUsers(user)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
        hideLoader()
      }
    }

    fetchData()
  }, [supabase, router, showLoader, hideLoader])

  const fetchUsers = async (currentUser: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const statsCards = [
    {
      title: t.admin.stats.totalProducts,
      value: stats.productCount,
      icon: Package,
      bgColor: 'bg-nature-green-50',
      iconColor: 'text-nature-green-600',
      valueColor: 'text-nature-green-700',
      href: '/admin/products',
    },
    {
      title: t.admin.stats.totalOrders,
      value: stats.orderCount,
      icon: ShoppingCart,
      bgColor: 'bg-nature-blue-50',
      iconColor: 'text-nature-blue-600',
      valueColor: 'text-nature-blue-700',
      href: '/admin/orders',
    },
    {
      title: t.admin.stats.totalCategories,
      value: stats.categoryCount,
      icon: FolderOpen,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      valueColor: 'text-purple-700',
      href: '/admin/categories',
    },
    {
      title: t.admin.stats.pendingOrders,
      value: stats.pendingOrders,
      icon: Clock,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      valueColor: 'text-yellow-700',
      href: '/admin/orders',
    },
  ]

  if (loading || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              {t.admin.dashboard}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {t.admin.dashboardSubtitle}
            </p>
          </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map((stat) => {
            const IconComponent = stat.icon
            return (
              <Link
                key={stat.title}
                href={stat.href}
                onClick={() => showLoader(t.loader.loading)}
                className="group bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
                <h3 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">{stat.title}</h3>
                <p className={`text-2xl font-semibold ${stat.valueColor}`}>
                  {stat.value}
                </p>
              </Link>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t.admin.quickActions}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href="/admin/products/new"
              onClick={() => showLoader(t.loader.loading)}
              className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
            >
              <div className="w-9 h-9 bg-nature-green-600 rounded-md flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{t.admin.addNewProduct}</p>
              </div>
            </Link>
            <Link
              href="/admin/products"
              onClick={() => showLoader(t.loader.loading)}
              className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
            >
              <div className="w-9 h-9 bg-nature-blue-600 rounded-md flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{t.admin.manageProducts}</p>
              </div>
            </Link>
            <Link
              href="/admin/categories"
              onClick={() => showLoader(t.loader.loading)}
              className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
            >
              <div className="w-9 h-9 bg-purple-600 rounded-md flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{t.admin.categories}</p>
              </div>
            </Link>
            <Link
              href="/admin/orders"
              onClick={() => showLoader(t.loader.loading)}
              className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
            >
              <div className="w-9 h-9 bg-yellow-600 rounded-md flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{t.admin.allOrders}</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        {recentOrders && recentOrders.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-gray-600" />
                {t.admin.recentOrders}
              </h2>
              <Link
                href="/admin/orders"
                onClick={() => showLoader(t.loader.loading)}
                className="text-gray-600 hover:text-gray-900 font-medium text-sm flex items-center gap-1"
              >
                {t.common.view} {t.common.all}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.orders.orderId}</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.orders.date}</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.orders.total}</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.orders.status}</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-sm text-gray-900">{order.id.slice(0, 8)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900 text-sm">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${
                            order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : order.status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {order.status === 'pending'
                            ? t.orders.pending
                            : order.status === 'processing'
                            ? t.orders.processing
                            : order.status === 'delivered'
                            ? t.orders.delivered
                            : order.status === 'cancelled'
                            ? t.orders.cancelled
                            : order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          onClick={() => showLoader(t.loader.loading)}
                          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                        >
                          {t.common.view}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All Users Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            {t.admin.allUsers} <span className="text-gray-500 font-normal">({users.length})</span>
          </h2>
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.profile.email}</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.profile.role}</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.admin.created}</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.admin.lastSignIn}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900 text-sm">{u.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {u.role === 'admin' ? t.profile.admin : t.profile.user}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {u.last_sign_in_at
                          ? new Date(u.last_sign_in_at).toLocaleDateString()
                          : t.admin.never}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              <p>{t.admin.noUsersFound}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
