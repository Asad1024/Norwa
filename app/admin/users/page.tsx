'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useGlobalLoader } from '@/components/GlobalLoader'
import BackButton from '@/components/BackButton'
import { Shield, ShieldOff, CheckCircle, XCircle, Users, Search, Trash2 } from 'lucide-react'
import { useTranslations } from '@/hooks/useTranslations'

export default function AdminUsersPage() {
  const router = useRouter()
  const supabase = createClient()
  const { showLoader, hideLoader } = useGlobalLoader()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean
    type: 'role' | 'activate' | 'deactivate' | 'delete' | null
    userId: string | null
    userEmail: string | null
    newRole?: 'admin' | 'user'
  }>({
    show: false,
    type: null,
    userId: null,
    userEmail: null,
  })
  const [confirmEnabled, setConfirmEnabled] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [notification, setNotification] = useState<{
    show: boolean
    message: string
    type: 'success' | 'error'
  }>({
    show: false,
    message: '',
    type: 'success',
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
      await fetchUsers()
      hideLoader()
    }

    getUser()
  }, [supabase, router, showLoader, hideLoader])

  const fetchUsers = async () => {
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
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' })
    }, 3000)
  }

  const handleRoleChange = async () => {
    if (!confirmModal.userId || !confirmModal.newRole) return

    setIsSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setIsSaving(false)
        return
      }

      const response = await fetch(`/api/admin/users/${confirmModal.userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: confirmModal.newRole }),
      })

      const data = await response.json()

      if (response.ok) {
        showNotification(t.admin.roleUpdated, 'success')
        await fetchUsers()
        setConfirmModal({ show: false, type: null, userId: null, userEmail: null })
        setConfirmEnabled(false)
      } else {
        showNotification(data.error || t.admin.updateError, 'error')
      }
    } catch (error: any) {
      console.error('Error updating role:', error)
      showNotification(t.admin.updateError, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async () => {
    if (!confirmModal.userId) return

    const isActivating = confirmModal.type === 'activate'
    setIsSaving(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setIsSaving(false)
        return
      }

      const response = await fetch(`/api/admin/users/${confirmModal.userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: isActivating }),
      })

      const data = await response.json()

      if (response.ok) {
        showNotification(t.admin.statusUpdated, 'success')
        await fetchUsers()
        setConfirmModal({ show: false, type: null, userId: null, userEmail: null })
        setConfirmEnabled(false)
      } else {
        showNotification(data.error || t.admin.updateError, 'error')
      }
    } catch (error: any) {
      console.error('Error updating status:', error)
      showNotification(t.admin.updateError, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!confirmModal.userId) return

    setIsSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setIsSaving(false)
        return
      }

      const response = await fetch(`/api/admin/users/${confirmModal.userId}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        showNotification(t.admin.userDeleted, 'success')
        await fetchUsers()
        setConfirmModal({ show: false, type: null, userId: null, userEmail: null })
        setConfirmEnabled(false)
      } else {
        showNotification(data.error || t.admin.deleteError, 'error')
      }
    } catch (error: any) {
      console.error('Error deleting user:', error)
      showNotification(t.admin.deleteError, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const openRoleModal = (userId: string, userEmail: string, currentRole: string) => {
    setConfirmModal({
      show: true,
      type: 'role',
      userId,
      userEmail,
      newRole: currentRole === 'admin' ? 'user' : 'admin',
    })
    setConfirmEnabled(false)
    setIsSaving(false)
  }

  const openStatusModal = (userId: string, userEmail: string, isActive: boolean) => {
    setConfirmModal({
      show: true,
      type: isActive ? 'deactivate' : 'activate',
      userId,
      userEmail,
    })
    setConfirmEnabled(true)
    setIsSaving(false)
  }

  const openDeleteModal = (userId: string, userEmail: string) => {
    setConfirmModal({
      show: true,
      type: 'delete',
      userId,
      userEmail,
    })
    setConfirmEnabled(true)
    setIsSaving(false)
  }

  // Group users by filter
  const usersByFilter = useMemo(() => {
    const grouped: Record<string, any[]> = {
      all: [],
      admin: [],
      user: [],
      active: [],
      inactive: [],
    }

    users.forEach((u) => {
      grouped.all.push(u)
      if (u.role === 'admin') {
        grouped.admin.push(u)
      } else {
        grouped.user.push(u)
      }
      if (u.is_active !== false) {
        grouped.active.push(u)
      } else {
        grouped.inactive.push(u)
      }
    })

    return grouped
  }, [users])

  // Get users count for each filter
  const filterCounts = useMemo(() => {
    return {
      all: usersByFilter.all.length,
      admin: usersByFilter.admin.length,
      user: usersByFilter.user.length,
      active: usersByFilter.active.length,
      inactive: usersByFilter.inactive.length,
    }
  }, [usersByFilter])

  // Get filtered users based on selected filter and search query
  const filteredUsers = useMemo(() => {
    let filtered = usersByFilter[selectedFilter] || []
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((u: any) => {
        const email = (u.email || '').toLowerCase()
        const role = (u.role || '').toLowerCase()
        
        return (
          email.includes(query) ||
          role.includes(query)
        )
      })
    }
    
    return filtered
  }, [usersByFilter, selectedFilter, searchQuery])

  const filterConfig = [
    {
      filter: 'all',
      title: t.common.all,
      icon: <Users className="w-6 h-6" />,
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-300',
      textColor: 'text-gray-800',
    },
    {
      filter: 'admin',
      title: t.profile.admin,
      icon: <Shield className="w-6 h-6" />,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-300',
      textColor: 'text-purple-800',
    },
    {
      filter: 'user',
      title: t.profile.user,
      icon: <Users className="w-6 h-6" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-800',
    },
    {
      filter: 'active',
      title: t.admin.active,
      icon: <CheckCircle className="w-6 h-6" />,
      bgColor: 'bg-nature-green-50',
      borderColor: 'border-nature-green-300',
      textColor: 'text-nature-green-800',
    },
    {
      filter: 'inactive',
      title: t.admin.inactive,
      icon: <XCircle className="w-6 h-6" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-800',
    },
  ]

  const renderUserRow = (u: any) => {
    const isCurrentUser = user?.id === u.id
    const isActive = u.is_active !== false

    return (
      <tr
        key={u.id}
        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <td className="py-3 px-4">
          <div className="font-medium text-gray-900 text-sm">{u.email}</div>
        </td>
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
        <td className="py-3 px-4">
          <span
            className={`inline-block px-2.5 py-1 rounded text-xs font-medium ${
              isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {isActive ? t.admin.active : t.admin.inactive}
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
        <td className="py-3 px-4 text-right">
          <div className="flex items-center justify-end gap-2">
            {!isCurrentUser && (
              <>
                <button
                  onClick={() => openRoleModal(u.id, u.email, u.role)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    u.role === 'admin'
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
                  }`}
                  title={u.role === 'admin' ? t.admin.removeAdmin : t.admin.makeAdmin}
                >
                  {u.role === 'admin' ? (
                    <ShieldOff className="w-4 h-4" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => openStatusModal(u.id, u.email, isActive)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    isActive
                      ? 'bg-red-100 hover:bg-red-200 text-red-700'
                      : 'bg-green-100 hover:bg-green-200 text-green-700'
                  }`}
                  title={isActive ? t.admin.deactivate : t.admin.activate}
                >
                  {isActive ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => openDeleteModal(u.id, u.email)}
                  className="px-3 py-1.5 text-xs font-medium rounded transition-colors bg-red-100 hover:bg-red-200 text-red-700"
                  title={t.admin.deleteUser}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            {isCurrentUser && (
              <span className="text-xs text-gray-400 italic">You</span>
            )}
          </div>
        </td>
      </tr>
    )
  }

  if (loading) {
    return null // Global loader is showing
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header with Back Button */}
          <div className="mb-6">
            <BackButton href="/admin" className="mb-4" />
            <h1 className="text-2xl font-semibold text-gray-900">
              {t.admin.allUsers}
            </h1>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {filterConfig.map((config) => {
                const isActive = selectedFilter === config.filter
                const count = filterCounts[config.filter as keyof typeof filterCounts]

                return (
                  <button
                    key={config.filter}
                    onClick={() => setSelectedFilter(config.filter)}
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
                  placeholder={t.common.search || 'Search users...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm bg-white"
                />
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {filterConfig.find(c => c.filter === selectedFilter)?.title || t.admin.allUsers}
                </h2>
                <span className="text-sm text-gray-500">
                  {filteredUsers.length} {filteredUsers.length === 1 ? t.common.item : t.common.items}
                </span>
              </div>
            </div>
            {filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.profile.email}</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.profile.role}</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.admin.status}</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.admin.created}</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.admin.lastSignIn}</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">{t.admin.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((u) => renderUserRow(u))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-3">
                  <Users className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {t.admin.noUsersFound}
                </p>
                <p className="text-xs text-gray-500">
                  {searchQuery ? 'Try adjusting your search query' : 'No users found for this filter'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <p className="text-sm text-gray-600 mb-4">
              {confirmModal.type === 'role' && t.admin.changeRoleMessage}
              {confirmModal.type === 'activate' && t.admin.activateMessage}
              {confirmModal.type === 'deactivate' && t.admin.deactivateMessage}
              {confirmModal.type === 'delete' && t.admin.deleteUserMessage}
              <br />
              <strong className="text-gray-900">{confirmModal.userEmail}</strong>
            </p>
            {confirmModal.type === 'role' && (
              <div className="mb-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={confirmEnabled}
                    onChange={(e) => setConfirmEnabled(e.target.checked)}
                    disabled={isSaving}
                    className="w-4 h-4 text-nature-green-600 border-gray-300 rounded focus:ring-nature-green-500"
                  />
                  <span>I understand this action will change the user's role</span>
                </label>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  if (!isSaving) {
                    setConfirmModal({ show: false, type: null, userId: null, userEmail: null })
                    setConfirmEnabled(false)
                    setIsSaving(false)
                  }
                }}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={() => {
                  if (confirmModal.type === 'role') {
                    handleRoleChange()
                  } else if (confirmModal.type === 'delete') {
                    handleDeleteUser()
                  } else {
                    handleStatusChange()
                  }
                }}
                disabled={(confirmModal.type === 'role' && !confirmEnabled) || isSaving}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  confirmModal.type === 'deactivate' || confirmModal.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-nature-green-600 hover:bg-nature-green-700'
                } ${
                  (confirmModal.type === 'role' && !confirmEnabled) || isSaving
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {isSaving ? 'Saving...' : t.common.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}
    </>
  )
}
