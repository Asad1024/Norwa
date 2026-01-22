'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useGlobalLoader } from '@/components/GlobalLoader'
import { useToast } from '@/components/ToastProvider'
import BackButton from '@/components/BackButton'
import { useTranslations } from '@/hooks/useTranslations'
import { Product } from '@/types/database'
import { Users, Check, X } from 'lucide-react'

export default function AssignUsersPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const { showLoader, hideLoader } = useGlobalLoader()
  const { showToast } = useToast()
  const t = useTranslations()
  const [product, setProduct] = useState<Product | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [assignedUserIds, setAssignedUserIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      showLoader(t.loader.loading)
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!currentUser) {
          hideLoader()
          router.push('/login')
          return
        }

        const isAdmin = currentUser.user_metadata?.role === 'admin'
        if (!isAdmin) {
          hideLoader()
          router.push('/')
          return
        }

        setUser(currentUser)

        // Fetch product
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', params.id)
          .single()

        if (productError) throw productError
        setProduct(productData)

        // Fetch all users
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const usersResponse = await fetch('/api/admin/users', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          })

          if (usersResponse.ok) {
            const usersData = await usersResponse.json()
            setUsers(usersData.users || [])
          }

          // Fetch current assignments
          const assignmentsResponse = await fetch(`/api/admin/products/${params.id}/assignments`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          })

          if (assignmentsResponse.ok) {
            const assignmentsData = await assignmentsResponse.json()
            const assignedIds = new Set<string>((assignmentsData.assignments || []).map((a: any) => String(a.user_id)))
            setAssignedUserIds(assignedIds)
          }
        }
      } catch (error: any) {
        console.error('Error fetching data:', error)
        showToast(error.message || 'Failed to load data', 'error')
      } finally {
        hideLoader()
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, supabase, router, showLoader, hideLoader, showToast])

  const toggleUserAssignment = (userId: string) => {
    const newAssigned = new Set(assignedUserIds)
    if (newAssigned.has(userId)) {
      newAssigned.delete(userId)
    } else {
      newAssigned.add(userId)
    }
    setAssignedUserIds(newAssigned)
  }

  const handleSave = async () => {
    setSaving(true)
    showLoader(t.loader.loading)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      // Filter out admin users from assignments (admins always see all products)
      const nonAdminUserIds = Array.from(assignedUserIds).filter((userId) => {
        const user = users.find((u) => u.id === userId)
        return user && user.role !== 'admin'
      })

      const response = await fetch(`/api/admin/products/${params.id}/assignments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_ids: nonAdminUserIds,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showToast(t.adminProducts.assignmentsUpdated || 'Assignments updated successfully', 'success')
        setTimeout(() => {
          router.push('/admin/products')
        }, 1000)
      } else {
        showToast(data.error || 'Failed to update assignments', 'error')
      }
    } catch (error: any) {
      console.error('Error saving assignments:', error)
      showToast(error.message || 'Failed to save assignments', 'error')
    } finally {
      hideLoader()
      setSaving(false)
    }
  }

  if (loading || !product) {
    return null // Global loader is showing
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <BackButton href="/admin/products" className="mb-4" />
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {t.adminProducts.assignUsers || 'Assign Users'} - {product.name || 'Product'}
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          {t.adminProducts.assignUsersDescription || 'Select which users can see this product. If no users are selected, the product will be visible to all users.'}
        </p>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t.admin.allUsers || 'All Users'}
            </h2>
            <div className="text-sm text-gray-600">
              {assignedUserIds.size} {assignedUserIds.size === 1 ? 'user selected' : 'users selected'}
            </div>
          </div>

          {users.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users.map((u) => {
                const isAssigned = assignedUserIds.has(u.id)
                const isCurrentUser = user?.id === u.id
                const isAdminUser = u.role === 'admin'
                
                return (
                  <div
                    key={u.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      isAdminUser
                        ? 'bg-blue-50 border-blue-200'
                        : isAssigned
                        ? 'bg-nature-green-50 border-nature-green-300 cursor-pointer'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300 cursor-pointer'
                    }`}
                    onClick={() => !isCurrentUser && !isAdminUser && toggleUserAssignment(u.id)}
                  >
                    <div className="flex items-center gap-3">
                      {!isAdminUser && (
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isAssigned
                            ? 'bg-nature-green-600 border-nature-green-600'
                            : 'border-gray-300'
                        }`}>
                          {isAssigned && <Check className="w-3 h-3 text-white" />}
                        </div>
                      )}
                      {isAdminUser && (
                        <div className="w-5 h-5 rounded border-2 flex items-center justify-center bg-blue-600 border-blue-600">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {u.email}
                          {isCurrentUser && <span className="text-gray-500 ml-2">(You)</span>}
                        </p>
                        <p className="text-xs text-gray-500">
                          {u.role === 'admin' ? t.profile.admin : t.profile.user}
                          {u.is_active === false && ` • ${t.admin.inactive}`}
                        </p>
                      </div>
                    </div>
                    {isAdminUser ? (
                      <span className="text-xs text-blue-600 font-medium">{t.adminProducts.adminAlwaysSee || 'Admin always see this product'}</span>
                    ) : isCurrentUser ? (
                      <span className="text-xs text-gray-400 italic">Cannot assign to yourself</span>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>{t.admin.noUsersFound}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {t.common.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-nature-green-600 hover:bg-nature-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? t.loader.saving : t.common.save}
          </button>
        </div>
      </div>
    </div>
  )
}
