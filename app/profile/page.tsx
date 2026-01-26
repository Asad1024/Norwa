'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Address } from '@/types/database'
import Link from 'next/link'
import Image from 'next/image'
import { useGlobalLoader } from '@/components/GlobalLoader'
import { useTranslations } from '@/hooks/useTranslations'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const { showLoader, hideLoader } = useGlobalLoader()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const t = useTranslations()
  const [orders, setOrders] = useState<any[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [editingAddress, setEditingAddress] = useState<string | null>(null)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    address: '',
    phone_number: '',
  })
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [checkoutPreferences, setCheckoutPreferences] = useState<any>(null)
  const [orderInfoEntries, setOrderInfoEntries] = useState<any[]>([])
  const [editingOrderInfo, setEditingOrderInfo] = useState<string | null>(null)
  const [showAddOrderInfo, setShowAddOrderInfo] = useState(false)
  const [orderInfoForm, setOrderInfoForm] = useState({
    label: 'Default',
    email_for_order_confirmation: '',
    customer_reference: '',
    delivery_instructions: '',
    dispatch_date: '',
    delivery_time: '',
    phone_number: '',
  })

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

      setUser(user)
      await Promise.all([
        fetchOrders(user.id),
        fetchAddresses(user.id),
        fetchOrderInfoEntries(user.id)
      ])
      hideLoader()
      setLoading(false)
    }

    getUser()
  }, [supabase, router, showLoader, hideLoader])

  const fetchOrders = async (userId: string) => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    setOrders(data || [])
  }

  const fetchAddresses = async (userId: string) => {
    const { data } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    setAddresses(data || [])
  }

  const fetchCheckoutPreferences = async (userId: string) => {
    const { data } = await supabase
      .from('user_checkout_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    setCheckoutPreferences(data || null)
  }

  const fetchOrderInfoEntries = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_order_info')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching order info entries:', error)
        setOrderInfoEntries([])
      } else {
        console.log('Fetched order info entries:', data)
        setOrderInfoEntries(data || [])
      }
    } catch (error) {
      console.error('Error fetching order info entries:', error)
      setOrderInfoEntries([])
    }
  }

  const handleSaveOrderInfo = async () => {
    if (!user) return

    if (!orderInfoForm.email_for_order_confirmation.trim() || !orderInfoForm.customer_reference.trim()) {
      alert('Please fill in all required fields')
      return
    }

    try {
      if (editingOrderInfo) {
        await supabase
          .from('user_order_info')
          .update({
            label: orderInfoForm.label,
            email_for_order_confirmation: orderInfoForm.email_for_order_confirmation,
            customer_reference: orderInfoForm.customer_reference,
            delivery_instructions: orderInfoForm.delivery_instructions,
            dispatch_date: orderInfoForm.dispatch_date || null,
            delivery_time: orderInfoForm.delivery_time,
            phone_number: orderInfoForm.phone_number,
          })
          .eq('id', editingOrderInfo)
      } else {
        const { data: existingOrderInfo } = await supabase
          .from('user_order_info')
          .select('*')
          .eq('user_id', user.id)
        
        await supabase.from('user_order_info').insert({
          user_id: user.id,
          label: orderInfoForm.label,
          email_for_order_confirmation: orderInfoForm.email_for_order_confirmation,
          customer_reference: orderInfoForm.customer_reference,
          delivery_instructions: orderInfoForm.delivery_instructions,
          dispatch_date: orderInfoForm.dispatch_date || null,
          delivery_time: orderInfoForm.delivery_time,
          phone_number: orderInfoForm.phone_number,
          is_default: (existingOrderInfo?.length || 0) === 0,
        })
      }

      await fetchOrderInfoEntries(user.id)
      setEditingOrderInfo(null)
      setShowAddOrderInfo(false)
      setOrderInfoForm({
        label: 'Default',
        email_for_order_confirmation: '',
        customer_reference: '',
        delivery_instructions: '',
        dispatch_date: '',
        delivery_time: '',
        phone_number: '',
      })
    } catch (error) {
      console.error('Error saving order info:', error)
      alert('Failed to save order information')
    }
  }

  const handleDeleteOrderInfo = async (orderInfoId: string) => {
    if (!confirm('Are you sure you want to delete this order information?')) return

    try {
      await supabase.from('user_order_info').delete().eq('id', orderInfoId)
      await fetchOrderInfoEntries(user!.id)
    } catch (error) {
      console.error('Error deleting order info:', error)
      alert('Failed to delete order information')
    }
  }

  const handleSetDefaultOrderInfo = async (orderInfoId: string) => {
    try {
      // First, unset all defaults
      await supabase
        .from('user_order_info')
        .update({ is_default: false })
        .eq('user_id', user!.id)
      
      // Then set the selected one as default
      await supabase
        .from('user_order_info')
        .update({ is_default: true })
        .eq('id', orderInfoId)
      
      await fetchOrderInfoEntries(user!.id)
    } catch (error) {
      console.error('Error setting default order info:', error)
      alert('Failed to set default order information')
    }
  }

  const startEditOrderInfo = (orderInfo: any) => {
    setEditingOrderInfo(orderInfo.id)
    setOrderInfoForm({
      label: orderInfo.label || 'Default',
      email_for_order_confirmation: orderInfo.email_for_order_confirmation || '',
      customer_reference: orderInfo.customer_reference || '',
      delivery_instructions: orderInfo.delivery_instructions || '',
      dispatch_date: orderInfo.dispatch_date || '',
      delivery_time: orderInfo.delivery_time || '',
      phone_number: orderInfo.phone_number || '',
    })
    setShowAddOrderInfo(true)
  }

  const handleSaveAddress = async () => {
    if (!user) return

    if (!addressForm.address.trim() || !addressForm.phone_number.trim()) {
      alert('Please fill in all required fields')
      return
    }

    try {
      if (editingAddress) {
        await supabase
          .from('user_addresses')
          .update({
            label: addressForm.label,
            address: addressForm.address,
            phone_number: addressForm.phone_number,
          })
          .eq('id', editingAddress)
      } else {
        await supabase.from('user_addresses').insert({
          user_id: user.id,
          label: addressForm.label,
          address: addressForm.address,
          phone_number: addressForm.phone_number,
          is_default: addresses.length === 0,
        })
      }

      await fetchAddresses(user.id)
      setEditingAddress(null)
      setShowAddAddress(false)
      setAddressForm({ label: 'Home', address: '', phone_number: '' })
    } catch (error) {
      console.error('Error saving address:', error)
      alert('Failed to save address')
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      await supabase.from('user_addresses').delete().eq('id', addressId)
      await fetchAddresses(user.id)
    } catch (error) {
      console.error('Error deleting address:', error)
      alert('Failed to delete address')
    }
  }

  const handleSetDefault = async (addressId: string) => {
    try {
      await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', addressId)
      await fetchAddresses(user.id)
    } catch (error) {
      console.error('Error setting default address:', error)
      alert('Failed to set default address')
    }
  }

  const startEdit = (address: Address) => {
    setEditingAddress(address.id)
    setAddressForm({
      label: address.label || 'Home',
      address: address.address,
      phone_number: address.phone_number,
    })
    setShowAddAddress(true)
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess('')

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All fields are required')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }

    try {
      // First verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordForm.currentPassword,
      })

      if (signInError) {
        setPasswordError('Current password is incorrect')
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      })

      if (updateError) {
        setPasswordError(updateError.message || 'Failed to update password')
        return
      }

      setPasswordSuccess('Password updated successfully!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setTimeout(() => {
        setShowChangePassword(false)
        setPasswordSuccess('')
      }, 2000)
    } catch (error: any) {
      setPasswordError(error.message || t.profile.passwordError)
    }
  }

  if (loading || !user) {
    return null // Global loader is showing
  }

  const isAdmin = user.user_metadata?.role === 'admin'

  return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Modern Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-nature-green-400 to-nature-green-600 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                    {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                      <Image
                        src={user.user_metadata.avatar_url || user.user_metadata.picture}
                        alt="Profile"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-2xl font-semibold text-white">
                        {(user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {user.user_metadata?.full_name || user.user_metadata?.name || 'User'}
                  </h1>
                  <p className="text-sm text-gray-500 mb-1">{user.email}</p>
                  {(user.user_metadata?.phone || user.user_metadata?.phone_number) && (
                    <p className="text-sm text-gray-500">
                      {user.user_metadata?.phone || user.user_metadata?.phone_number}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm ${
                  isAdmin 
                    ? 'bg-nature-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {isAdmin ? t.profile.admin : t.profile.user}
                </span>
              </div>
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Sidebar - Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Actions
                </h2>
                <div className="space-y-2">
                  <Link
                    href="/orders"
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 hover:border-gray-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-nature-green-600 rounded-lg flex items-center justify-center text-white">
                        <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{t.orders.title}</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 hover:border-gray-300 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-nature-green-600 rounded-lg flex items-center justify-center text-white">
                          <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{t.navbar.admin}</span>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                  <Link
                    href="/products"
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 hover:border-gray-300 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-nature-green-600 rounded-lg flex items-center justify-center text-white">
                        <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{t.home.shopNow}</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Change Password */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {t.profile.changePassword}
                  </h2>
                  <button
                    onClick={() => {
                      setShowChangePassword(!showChangePassword)
                      setPasswordError('')
                      setPasswordSuccess('')
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    }}
                    className="px-4 py-2 bg-nature-green-600 hover:bg-nature-green-700 text-white font-medium rounded-lg transition-colors text-sm shadow-md hover:shadow-lg"
                  >
                    {showChangePassword ? t.common.cancel : t.profile.changePassword}
                  </button>
                </div>

                {showChangePassword && (
                  <div className="space-y-4">
                    {passwordError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                        {passwordSuccess}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                        {t.profile.currentPassword} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 transition-all text-sm"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showCurrentPassword ? (
                            <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                        {t.profile.newPassword} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 transition-all text-sm"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showNewPassword ? (
                            <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                        {t.profile.confirmPassword} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 transition-all text-sm"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleChangePassword}
                      className="w-full bg-nature-green-600 hover:bg-nature-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg"
                    >
                      Update Password
                    </button>
                  </div>
                )}
              </div>

              {/* Order Information Management */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t.checkout.orderInformation}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddOrderInfo(!showAddOrderInfo)
                      setEditingOrderInfo(null)
                      setOrderInfoForm({
                        label: 'Default',
                        email_for_order_confirmation: '',
                        customer_reference: '',
                        delivery_instructions: '',
                        dispatch_date: '',
                        delivery_time: '',
                        phone_number: '',
                      })
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm shadow-md hover:shadow-lg"
                  >
                    {showAddOrderInfo ? t.common.cancel : `+ ${t.common.add} Order Info`}
                  </button>
                </div>

                {showAddOrderInfo && (
                  <div className="mb-5 p-5 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                      {editingOrderInfo ? `${t.common.edit} Order Information` : `${t.common.add} Order Information`}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Label</label>
                        <input
                          type="text"
                          value={orderInfoForm.label}
                          onChange={(e) => setOrderInfoForm({ ...orderInfoForm, label: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                          placeholder="Default"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">{t.checkout.emailForOrderConfirmation} *</label>
                        <input
                          type="email"
                          value={orderInfoForm.email_for_order_confirmation}
                          onChange={(e) => setOrderInfoForm({ ...orderInfoForm, email_for_order_confirmation: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                          placeholder="email@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">{t.checkout.customerReference} *</label>
                        <input
                          type="text"
                          value={orderInfoForm.customer_reference}
                          onChange={(e) => setOrderInfoForm({ ...orderInfoForm, customer_reference: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">{t.checkout.phoneNumber}</label>
                        <input
                          type="tel"
                          value={orderInfoForm.phone_number}
                          onChange={(e) => setOrderInfoForm({ ...orderInfoForm, phone_number: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                          placeholder="+47 123 45 678"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">{t.checkout.dispatchDate}</label>
                        <input
                          type="date"
                          value={orderInfoForm.dispatch_date}
                          onChange={(e) => setOrderInfoForm({ ...orderInfoForm, dispatch_date: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">{t.checkout.deliveryTime}</label>
                        <select
                          value={orderInfoForm.delivery_time}
                          onChange={(e) => setOrderInfoForm({ ...orderInfoForm, delivery_time: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                        >
                          <option value="">Select time</option>
                          <option value={t.checkout.deliveryTimeMorning}>{t.checkout.deliveryTimeMorning}</option>
                          <option value={t.checkout.deliveryTimeAfternoon}>{t.checkout.deliveryTimeAfternoon}</option>
                          <option value={t.checkout.deliveryTimeEvening}>{t.checkout.deliveryTimeEvening}</option>
                          <option value={t.checkout.deliveryTimeAnytime}>{t.checkout.deliveryTimeAnytime}</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">{t.checkout.deliveryInstructions}</label>
                      <textarea
                        value={orderInfoForm.delivery_instructions}
                        onChange={(e) => setOrderInfoForm({ ...orderInfoForm, delivery_instructions: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-sm"
                        placeholder={t.checkout.deliveryInstructions}
                      />
                    </div>
                    <button
                      onClick={handleSaveOrderInfo}
                      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg"
                    >
                      {editingOrderInfo ? `${t.common.update} Order Information` : `${t.common.save} Order Information`}
                    </button>
                  </div>
                )}

                {orderInfoEntries.length > 0 ? (
                  <div className="space-y-3">
                    {orderInfoEntries.map((orderInfo) => (
                      <div
                        key={orderInfo.id}
                        className={`p-4 rounded-lg border transition-all ${
                          orderInfo.is_default
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{orderInfo.label}</h3>
                              {orderInfo.is_default && (
                                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mb-1">
                              <span className="font-medium">{t.checkout.emailForOrderConfirmation}:</span> {orderInfo.email_for_order_confirmation}
                            </p>
                            {orderInfo.customer_reference && (
                              <p className="text-sm text-gray-700 mb-1">
                                <span className="font-medium">{t.checkout.customerReference}:</span> {orderInfo.customer_reference}
                              </p>
                            )}
                            {orderInfo.phone_number && (
                              <p className="text-sm text-gray-700 mb-1">
                                <span className="font-medium">{t.checkout.phoneNumber}:</span> {orderInfo.phone_number}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!orderInfo.is_default && (
                              <button
                                onClick={() => handleSetDefaultOrderInfo(orderInfo.id)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              onClick={() => startEditOrderInfo(orderInfo)}
                              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded transition-colors"
                            >
                              {t.common.edit}
                            </button>
                            <button
                              onClick={() => handleDeleteOrderInfo(orderInfo.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
                            >
                              {t.common.delete}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm">No saved order information yet. Add your first order information above!</p>
                  </div>
                )}
              </div>

              {/* Saved Addresses */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t.checkout.shippingInfo}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddAddress(!showAddAddress)
                      setEditingAddress(null)
                      setAddressForm({ label: 'Home', address: '', phone_number: '' })
                    }}
                    className="px-3 py-1.5 bg-nature-green-600 hover:bg-nature-green-700 text-white font-medium rounded-lg transition-colors text-sm shadow-md hover:shadow-lg"
                  >
                    {showAddAddress ? t.common.cancel : `+ ${t.common.add} ${t.common.address}`}
                  </button>
                </div>

                {showAddAddress && (
                  <div className="mb-5 p-5 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                      {editingAddress ? `${t.common.edit} ${t.common.address}` : `${t.common.add} ${t.common.address}`}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">{t.checkout.addressLabel}</label>
                        <input
                          type="text"
                          value={addressForm.label}
                          onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 transition-all text-sm"
                          placeholder="Home"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">{t.common.phone} *</label>
                        <input
                          type="tel"
                          value={addressForm.phone_number}
                          onChange={(e) => setAddressForm({ ...addressForm, phone_number: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 transition-all text-sm"
                          placeholder="+47 123 45 678"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">{t.common.address} *</label>
                      <textarea
                        value={addressForm.address}
                        onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-nature-green-500 transition-all resize-none text-sm"
                        placeholder="Enter your full address"
                      />
                    </div>
                    <button
                      onClick={handleSaveAddress}
                      className="mt-4 w-full bg-nature-green-600 hover:bg-nature-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg"
                    >
                      {editingAddress ? `${t.common.update} ${t.common.address}` : `${t.common.save} ${t.common.address}`}
                    </button>
                  </div>
                )}

                {addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`p-4 rounded-lg border transition-all ${
                          address.is_default
                            ? 'bg-nature-green-50 border-nature-green-200'
                            : 'bg-gray-50 border-gray-200 hover:border-nature-green-200 hover:bg-nature-green-50/50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-base text-gray-900">{address.label || 'Home'}</h3>
                              {address.is_default && (
                                <span className="px-2 py-0.5 bg-nature-green-600 text-white text-xs font-medium rounded">
                                  {t.common.default || 'Default'}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mb-1">{address.address}</p>
                            <p className="text-xs text-gray-600">{address.phone_number}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {!address.is_default && (
                              <button
                                onClick={() => handleSetDefault(address.id)}
                                className="px-2.5 py-1 text-xs bg-nature-green-600 hover:bg-nature-green-700 text-white rounded transition-colors font-medium"
                              >
                                {t.common.setDefault || 'Set Default'}
                              </button>
                            )}
                            <button
                              onClick={() => startEdit(address)}
                              className="px-2.5 py-1 text-xs bg-nature-green-600 hover:bg-nature-green-700 text-white rounded transition-colors font-medium"
                            >
                              {t.common.edit}
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="px-2.5 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors font-medium"
                            >
                              {t.common.delete}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-sm">{t.checkout.newAddress || 'No saved addresses yet. Add your first address above!'}</p>
                  </div>
                )}
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {t.orders.title}
                </h2>
                {orders && orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order: any) => (
                      <Link
                        key={order.id}
                        href="/orders"
                        className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 hover:border-gray-300"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{t.orders.orderId}</p>
                            <p className="text-sm font-mono font-semibold text-gray-900">{order.id.slice(0, 8)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{t.orders.date}</p>
                            <p className="text-sm font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{t.orders.total}</p>
                            <p className="text-base font-semibold text-gray-900">kr {order.total.toFixed(2)}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded text-xs font-medium ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status === 'pending' ? t.orders.pending :
                             order.status === 'delivered' ? t.orders.delivered :
                             order.status === 'processing' ? t.orders.processing :
                             order.status === 'cancelled' ? t.orders.cancelled :
                             order.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          {order.order_items?.length || 0} {order.order_items?.length !== 1 ? t.common.items : t.common.item}
                        </p>
                      </Link>
                    ))}
                    {orders.length > 5 && (
                      <div className="text-center mt-4">
                        <Link
                          href="/orders"
                          className="inline-flex items-center gap-2 bg-nature-green-600 hover:bg-nature-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg"
                        >
                          {t.orders.viewDetails}
                          <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-nature-green-50 rounded-lg mb-3">
                      <svg className="w-6 h-6 text-nature-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-3">{t.orders.noOrders}</p>
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 bg-nature-green-600 hover:bg-nature-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm shadow-md hover:shadow-lg"
                    >
                      {t.home.shopNow}
                      <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
