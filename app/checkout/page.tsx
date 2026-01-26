'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import { Address } from '@/types/database'
import Link from 'next/link'
import { useTranslations } from '@/hooks/useTranslations'
import { useLanguageStore } from '@/store/languageStore'

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const { items, clearCart, getTotal } = useCartStore()
  const language = useLanguageStore((state) => state.language)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new')
  const [saveAddress, setSaveAddress] = useState(true)
  const t = useTranslations()
  const [formData, setFormData] = useState({
    label: 'Home',
    shipping_address: '',
    phone_number: '',
    // Delivery Information
    delivery_customer: '',
    delivery_address: '',
    delivery_postal_code: '',
    delivery_postal_place: '',
    delivery_type: '',
    // Billing Information
    billing_address: '',
    billing_customer: '',
    billing_postal_code: '',
    billing_postal_place: '',
    payment_method: '',
    // Additional fields
    note: '',
    delivery_time: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize default values based on language
  useEffect(() => {
    if (!formData.delivery_type) {
      setFormData(prev => ({
        ...prev,
        delivery_type: t.checkout.deliveryTypeReadyPack,
        payment_method: t.checkout.paymentMethodInvoice,
      }))
    }
  }, [language, t.checkout.deliveryTypeReadyPack, t.checkout.paymentMethodInvoice, formData.delivery_type])

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
          delivery_customer: '',
          delivery_address: '',
          delivery_postal_code: '',
          delivery_postal_place: '',
          delivery_type: t.checkout.deliveryTypeReadyPack,
          billing_address: '',
          billing_customer: '',
          billing_postal_code: '',
          billing_postal_place: '',
          payment_method: t.checkout.paymentMethodInvoice,
          note: '',
          delivery_time: '',
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
        delivery_customer: '',
        delivery_address: '',
          delivery_postal_code: '',
          delivery_postal_place: '',
          delivery_type: t.checkout.deliveryTypeReadyPack,
          billing_address: '',
          billing_customer: '',
          billing_postal_code: '',
          billing_postal_place: '',
          payment_method: t.checkout.paymentMethodInvoice,
          note: '',
          delivery_time: '',
        })
      setSaveAddress(true)
    } else {
      const address = savedAddresses.find((a) => a.id === addressId)
      if (address) {
        setFormData({
          label: address.label || 'Home',
          shipping_address: address.address,
          phone_number: address.phone_number,
          delivery_customer: '',
          delivery_address: '',
          delivery_postal_code: '',
          delivery_postal_place: '',
          delivery_type: t.checkout.deliveryTypeReadyPack,
          billing_address: '',
          billing_customer: '',
          billing_postal_code: '',
          billing_postal_place: '',
          payment_method: t.checkout.paymentMethodInvoice,
          note: '',
          delivery_time: '',
        })
        setSaveAddress(false) // Don't save again if using existing address
      }
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate delivery information
    if (!formData.delivery_customer.trim()) {
      newErrors.delivery_customer = 'Customer name is required'
    }
    if (!formData.delivery_address.trim()) {
      newErrors.delivery_address = 'Delivery address is required'
    }
    if (!formData.delivery_postal_code.trim()) {
      newErrors.delivery_postal_code = 'Postal code is required'
    }
    if (!formData.delivery_postal_place.trim()) {
      newErrors.delivery_postal_place = 'Postal place is required'
    }

    // Use phone_number if provided, otherwise not required
    if (formData.phone_number && !/^\+?[\d\s-()]+$/.test(formData.phone_number)) {
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

      // Create order with shipping information (including 25% tax)
      // Combine delivery information into shipping_address for backward compatibility
      const fullShippingAddress = `${formData.delivery_customer}\n${formData.delivery_address}\n${formData.delivery_postal_code} ${formData.delivery_postal_place}`
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: getTotal() * 1.25, // Include 25% tax
          status: 'pending',
          shipping_address: fullShippingAddress,
          phone_number: formData.phone_number || '',
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
                        Qty: {item.quantity} × kr {item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-bold text-nature-blue-600">
                      kr {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-3 mb-4">
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
              </div>
              <div className="flex justify-between items-center pt-4 border-t-2 border-nature-green-200">
                <span className="text-xl font-bold text-nature-green-800">
                  {t.common.total}:
                </span>
                <span className="text-3xl font-extrabold bg-gradient-to-r from-nature-blue-600 to-nature-green-600 bg-clip-text text-transparent">
                  kr {(getTotal() * 1.25).toFixed(2)}
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

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Delivery Information Section */}
                <div className="bg-nature-green-50 rounded-lg p-6 border-2 border-nature-green-200">
                  <h3 className="text-xl font-bold text-nature-green-800 mb-4 flex items-center gap-2">
                    <span>📍</span>
                    {t.checkout.deliveryInformation}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="delivery_type" className="block text-sm font-semibold text-nature-green-700 mb-2">
                        {t.checkout.deliveryType} *
                      </label>
                      <select
                        id="delivery_type"
                        value={formData.delivery_type}
                        onChange={(e) => setFormData({ ...formData, delivery_type: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-nature-green-200 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value={t.checkout.deliveryTypeReadyPack}>{t.checkout.deliveryTypeReadyPack}</option>
                        <option value={t.checkout.deliveryTypeStandard}>{t.checkout.deliveryTypeStandard}</option>
                        <option value={t.checkout.deliveryTypeExpress}>{t.checkout.deliveryTypeExpress}</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="delivery_customer" className="block text-sm font-semibold text-nature-green-700 mb-2">
                        {t.checkout.customer} *
                      </label>
                      <input
                        id="delivery_customer"
                        type="text"
                        value={formData.delivery_customer}
                        onChange={(e) => setFormData({ ...formData, delivery_customer: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-nature-green-200 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-transparent transition-all"
                        required
                        placeholder={t.checkout.customer}
                      />
                    </div>

                    <div>
                      <label htmlFor="delivery_address" className="block text-sm font-semibold text-nature-green-700 mb-2">
                        {t.checkout.address} *
                      </label>
                      <textarea
                        id="delivery_address"
                        value={formData.delivery_address}
                        onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-nature-green-200 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-transparent transition-all resize-none"
                        required
                        placeholder={t.checkout.address}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="delivery_postal_code" className="block text-sm font-semibold text-nature-green-700 mb-2">
                          {t.checkout.postalCode} *
                        </label>
                        <input
                          id="delivery_postal_code"
                          type="text"
                          value={formData.delivery_postal_code}
                          onChange={(e) => setFormData({ ...formData, delivery_postal_code: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-nature-green-200 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-transparent transition-all"
                          required
                          placeholder={t.checkout.postalCode}
                        />
                      </div>
                      <div>
                        <label htmlFor="delivery_postal_place" className="block text-sm font-semibold text-nature-green-700 mb-2">
                          {t.checkout.postalPlace} *
                        </label>
                        <input
                          id="delivery_postal_place"
                          type="text"
                          value={formData.delivery_postal_place}
                          onChange={(e) => setFormData({ ...formData, delivery_postal_place: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-nature-green-200 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-transparent transition-all"
                          required
                          placeholder={t.checkout.postalPlace}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing Information Section */}
                <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>📄</span>
                    {t.checkout.billingInformation}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.checkout.billingAddress}
                      </label>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 mb-1">Asker & Bærum P</p>
                        <p className="text-sm text-gray-700 mb-1">Mohammad Shah</p>
                        <p className="text-sm text-gray-700 mb-1">Paalbergsvei 60</p>
                        <p className="text-sm text-gray-700">1348 Rykkinn</p>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="billing_customer" className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.checkout.customer}
                      </label>
                      <input
                        id="billing_customer"
                        type="text"
                        value={formData.billing_customer}
                        onChange={(e) => setFormData({ ...formData, billing_customer: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                        placeholder={t.checkout.customer}
                      />
                    </div>

                    <div>
                      <label htmlFor="billing_address" className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.checkout.address}
                      </label>
                      <textarea
                        id="billing_address"
                        value={formData.billing_address}
                        onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all resize-none"
                        placeholder={t.checkout.address}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="billing_postal_code" className="block text-sm font-semibold text-gray-700 mb-2">
                          {t.checkout.postalCode}
                        </label>
                        <input
                          id="billing_postal_code"
                          type="text"
                          value={formData.billing_postal_code}
                          onChange={(e) => setFormData({ ...formData, billing_postal_code: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                          placeholder={t.checkout.postalCode}
                        />
                      </div>
                      <div>
                        <label htmlFor="billing_postal_place" className="block text-sm font-semibold text-gray-700 mb-2">
                          {t.checkout.postalPlace}
                        </label>
                        <input
                          id="billing_postal_place"
                          type="text"
                          value={formData.billing_postal_place}
                          onChange={(e) => setFormData({ ...formData, billing_postal_place: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                          placeholder={t.checkout.postalPlace}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.checkout.payment}
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="payment_method"
                            value={t.checkout.paymentMethodInvoice}
                            checked={formData.payment_method === t.checkout.paymentMethodInvoice}
                            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">{t.checkout.paymentMethodInvoice}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Note Section and Delivery Time */}
                <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <span>📝</span>
                    {t.checkout.orderInformation}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="note" className="block text-sm font-semibold text-blue-700 mb-2">
                        {t.checkout.note}
                      </label>
                      <textarea
                        id="note"
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        placeholder={t.checkout.notePlaceholder}
                      />
                    </div>

                    <div>
                      <label htmlFor="delivery_time" className="block text-sm font-semibold text-blue-700 mb-2">
                        {t.checkout.deliveryTime}
                      </label>
                      <select
                        id="delivery_time"
                        value={formData.delivery_time}
                        onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">{t.checkout.deliveryTimeSelect}</option>
                        <option value={t.checkout.deliveryTimeMorning}>{t.checkout.deliveryTimeMorning}</option>
                        <option value={t.checkout.deliveryTimeAfternoon}>{t.checkout.deliveryTimeAfternoon}</option>
                        <option value={t.checkout.deliveryTimeEvening}>{t.checkout.deliveryTimeEvening}</option>
                        <option value={t.checkout.deliveryTimeAnytime}>{t.checkout.deliveryTimeAnytime}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Legacy fields for backward compatibility */}
                <div className="hidden">
                  <input
                    type="text"
                    value={formData.shipping_address || `${formData.delivery_address}, ${formData.delivery_postal_code} ${formData.delivery_postal_place}`}
                    readOnly
                  />
                </div>
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
