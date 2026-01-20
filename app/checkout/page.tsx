'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import { Address } from '@/types/database'
import Link from 'next/link'
import { useTranslations } from '@/hooks/useTranslations'

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const { items, clearCart, getTotal } = useCartStore()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new')
  const [saveAddress, setSaveAddress] = useState(true)
  const [formData, setFormData] = useState({
    label: 'Home',
    shipping_address: '',
    phone_number: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const t = useTranslations()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
      fetchSavedAddresses(user.id)
    }

    getUser()
  }, [supabase, router])

  const fetchSavedAddresses = async (userId: string) => {
    const { data } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (data) {
      setSavedAddresses(data)
      // Auto-select default address if available
      const defaultAddress = data.find((addr) => addr.is_default)
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id)
        setFormData({
          label: defaultAddress.label || 'Home',
          shipping_address: defaultAddress.address,
          phone_number: defaultAddress.phone_number,
        })
      }
    }
  }

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId)
    if (addressId === 'new') {
      setFormData({
        label: 'Home',
        shipping_address: '',
        phone_number: '',
      })
      setSaveAddress(true)
    } else {
      const address = savedAddresses.find((a) => a.id === addressId)
      if (address) {
        setFormData({
          label: address.label || 'Home',
          shipping_address: address.address,
          phone_number: address.phone_number,
        })
        setSaveAddress(false) // Don't save again if using existing address
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.shipping_address.trim()) {
      newErrors.shipping_address = t.checkout.addressRequired
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = t.checkout.phoneRequired
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone_number)) {
      newErrors.phone_number = t.checkout.phoneInvalid
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!user || items.length === 0) return

    setLoading(true)
    try {
      // Save address if requested and it's a new address or changed
      if (saveAddress && (selectedAddressId === 'new' || formData.shipping_address !== savedAddresses.find((a) => a.id === selectedAddressId)?.address)) {
        const addressData: any = {
          user_id: user.id,
          label: formData.label,
          address: formData.shipping_address,
          phone_number: formData.phone_number,
          is_default: savedAddresses.length === 0, // First address is default
        }

        // If editing existing address, update it
        if (selectedAddressId !== 'new') {
          await supabase
            .from('user_addresses')
            .update(addressData)
            .eq('id', selectedAddressId)
        } else {
          // Create new address
          await supabase.from('user_addresses').insert(addressData)
        }
      }

      // Create order with shipping information
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: getTotal(),
          status: 'pending',
          shipping_address: formData.shipping_address,
          phone_number: formData.phone_number,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Fetch order items with product details for email notification
      const { data: orderItemsWithProducts } = await supabase
        .from('order_items')
        .select(`
          *,
          products (*)
        `)
        .eq('order_id', order.id)

      // Send order notification email to admin (don't block on this)
      try {
        await fetch('/api/send-order-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order,
            orderItems: orderItemsWithProducts || [],
            userEmail: user.email,
            userName: user.user_metadata?.full_name || user.email?.split('@')[0],
          }),
        })
      } catch (emailError) {
        // Log error but don't fail the order
        console.error('Failed to send order notification email:', emailError)
      }

      clearCart()
      router.push(`/orders?success=true`)
    } catch (error: any) {
      console.error('Error creating order:', error)
      alert(t.checkout.orderFailed)
    } finally {
      setLoading(false)
    }
  }

  if (!user || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        {items.length === 0 ? (
          <>
            <p className="text-lg text-gray-600 mb-4">{t.cart.emptyTitle}</p>
            <Link
              href="/products"
              className="inline-block bg-nature-green-600 hover:bg-nature-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              {t.cart.continueShopping}
            </Link>
          </>
        ) : (
          <p className="text-lg">{t.login.welcome}</p>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-nature-green-50 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-5xl font-extrabold text-nature-green-800 mb-8 text-center">
          {t.checkout.title}
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-nature-green-100 sticky top-24">
              <h2 className="text-2xl font-bold text-nature-green-800 mb-6">
                Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-nature-green-100 last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">
                        {item.name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-bold text-nature-blue-600">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t-2 border-nature-green-200">
                <span className="text-xl font-bold text-nature-green-800">
                  {t.common.total}:
                </span>
                <span className="text-3xl font-extrabold bg-gradient-to-r from-nature-blue-600 to-nature-green-600 bg-clip-text text-transparent">
                  ${getTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-nature-green-100">
              <h2 className="text-3xl font-bold text-nature-green-800 mb-6 flex items-center">
                <span className="mr-3 text-4xl">📦</span>
                {t.checkout.shippingInfo}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Saved Addresses Dropdown */}
                {savedAddresses.length > 0 && (
                  <div>
                    <label
                      htmlFor="saved_address"
                      className="block text-sm font-semibold text-nature-green-700 mb-2"
                    >
                      {t.checkout.selectAddress}
                    </label>
                    <select
                      id="saved_address"
                      value={selectedAddressId}
                      onChange={(e) => handleAddressSelect(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-nature-green-200 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-transparent transition-all"
                    >
                      <option value="new">{t.checkout.newAddress}</option>
                      {savedAddresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.label || 'Home'} {address.is_default && '(Default)'} - {address.address.substring(0, 30)}...
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedAddressId !== 'new' && savedAddresses.length > 0 && (
                  <div className="p-4 bg-nature-green-50 rounded-lg border-2 border-nature-green-200">
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold">{t.common.address}:</span> {formData.shipping_address}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">{t.common.phone}:</span> {formData.phone_number}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleAddressSelect('new')}
                      className="mt-2 text-sm text-nature-green-600 hover:text-nature-green-700 font-semibold underline"
                    >
                      {t.checkout.newAddress}
                    </button>
                  </div>
                )}

                {/* Address Label (only for new addresses) */}
                {selectedAddressId === 'new' && (
                  <div>
                    <label
                      htmlFor="label"
                      className="block text-sm font-semibold text-nature-green-700 mb-2"
                    >
                      {t.checkout.addressLabel}
                    </label>
                    <input
                      id="label"
                      type="text"
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-nature-green-200 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-transparent transition-all"
                      placeholder="Home"
                    />
                  </div>
                )}

                {/* Shipping Address */}
                <div>
                  <label
                    htmlFor="shipping_address"
                    className="block text-sm font-semibold text-nature-green-700 mb-2"
                  >
                    {t.checkout.shippingAddress} *
                  </label>
                  <textarea
                    id="shipping_address"
                    value={formData.shipping_address}
                    onChange={(e) => {
                      setFormData({ ...formData, shipping_address: e.target.value })
                      if (errors.shipping_address) {
                        setErrors({ ...errors, shipping_address: '' })
                      }
                    }}
                    required
                    rows={4}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-transparent transition-all resize-none ${
                      errors.shipping_address
                        ? 'border-red-300'
                        : 'border-nature-green-200'
                    }`}
                    placeholder="Enter your full shipping address..."
                  />
                  {errors.shipping_address && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.shipping_address}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="phone_number"
                    className="block text-sm font-semibold text-nature-green-700 mb-2"
                  >
                    {t.checkout.phoneNumber} *
                  </label>
                  <input
                    id="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => {
                      setFormData({ ...formData, phone_number: e.target.value })
                      if (errors.phone_number) {
                        setErrors({ ...errors, phone_number: '' })
                      }
                    }}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-transparent transition-all ${
                      errors.phone_number
                        ? 'border-red-300'
                        : 'border-nature-green-200'
                    }`}
                    placeholder="+47 123 45 678"
                  />
                  {errors.phone_number && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.phone_number}
                    </p>
                  )}
                </div>

                {/* Save Address Checkbox (only for new addresses) */}
                {selectedAddressId === 'new' && (
                  <div className="flex items-center p-4 bg-nature-green-50 rounded-lg border-2 border-nature-green-200">
                    <input
                      type="checkbox"
                      id="save_address"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="w-5 h-5 text-nature-green-600 border-nature-green-300 rounded focus:ring-nature-green-500"
                    />
                    <label
                      htmlFor="save_address"
                      className="ml-3 text-sm font-medium text-nature-green-800"
                    >
                      {t.checkout.saveAddress}
                    </label>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Link
                    href="/cart"
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                  >
                    {t.checkout.backToCart}
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-nature-green-600 hover:bg-nature-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t.checkout.placingOrder}
                      </span>
                    ) : (
                      t.checkout.placeOrder
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
