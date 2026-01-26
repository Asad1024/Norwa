'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import Link from 'next/link'
import { useTranslations } from '@/hooks/useTranslations'
import { useLanguageStore } from '@/store/languageStore'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { isValidPhoneNumber } from 'react-phone-number-input'

export default function CheckoutPage() {
  const router = useRouter()
  const supabase = createClient()
  const { items, clearCart, getTotal } = useCartStore()
  const language = useLanguageStore((state) => state.language)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const t = useTranslations()
  const [formData, setFormData] = useState({
    shipping_address: '',
    phone_number: '',
    // Delivery Information
    delivery_customer: '',
    delivery_address: '',
    delivery_postal_code: '',
    delivery_postal_place: '',
    delivery_type: '',
    // Order Information
    email_for_order_confirmation: '',
    customer_reference: '',
    delivery_instructions: '',
    dispatch_date: '',
    periodic_orders: false,
    alternative_delivery_address: false,
    save_information: false,
    delivery_time: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize default values based on language
  useEffect(() => {
    if (!formData.delivery_type) {
      setFormData(prev => ({
        ...prev,
        delivery_type: t.checkout.deliveryTypeReadyPack,
      }))
    }
  }, [language, t.checkout.deliveryTypeReadyPack, formData.delivery_type])

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
    }

    getUser()
  }, [supabase, router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate delivery information
    if (!formData.delivery_customer.trim()) {
      newErrors.delivery_customer = t.checkout.customer + ' ' + t.common.required.toLowerCase()
    }
    if (!formData.delivery_address.trim()) {
      newErrors.delivery_address = t.checkout.address + ' ' + t.common.required.toLowerCase()
    }
    if (!formData.delivery_postal_code.trim()) {
      newErrors.delivery_postal_code = t.checkout.postalCode + ' ' + t.common.required.toLowerCase()
    }
    if (!formData.delivery_postal_place.trim()) {
      newErrors.delivery_postal_place = t.checkout.postalPlace + ' ' + t.common.required.toLowerCase()
    }

    // Validate order information
    if (!formData.email_for_order_confirmation.trim()) {
      newErrors.email_for_order_confirmation = t.checkout.emailForOrderConfirmation + ' ' + t.common.required.toLowerCase()
    } else {
      // Enhanced email validation
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
      if (!emailRegex.test(formData.email_for_order_confirmation.trim())) {
        newErrors.email_for_order_confirmation = t.checkout.emailInvalid
      }
    }
    if (!formData.customer_reference.trim()) {
      newErrors.customer_reference = t.checkout.customerReference + ' ' + t.common.required.toLowerCase()
    }

    // Phone number validation (optional field) - using react-phone-number-input validation
    if (formData.phone_number && formData.phone_number.trim() !== '') {
      // Check length first (max 20 characters including country code)
      if (formData.phone_number.length > 20) {
        newErrors.phone_number = t.checkout.phoneInvalid || 'Phone number is too long'
      } else if (!isValidPhoneNumber(formData.phone_number)) {
        newErrors.phone_number = t.checkout.phoneInvalid || 'Please enter a valid phone number'
      }
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
      // Create order with shipping information (including 25% tax)
      // Combine delivery information into shipping_address for backward compatibility
      const fullShippingAddress = `${formData.delivery_customer}\n${formData.delivery_address}\n${formData.delivery_postal_code} ${formData.delivery_postal_place}`
      
      // Save address if user checked "save information"
      if (formData.save_information) {
        const { data: existingAddresses } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('user_id', user.id)
        
        const addressData: any = {
          user_id: user.id,
          label: 'Home',
          address: fullShippingAddress,
          phone_number: formData.phone_number || '',
          is_default: (existingAddresses?.length || 0) === 0,
        }
        await supabase.from('user_addresses').insert(addressData)
      }

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
                        onChange={(e) => {
                          setFormData({ ...formData, delivery_customer: e.target.value })
                          if (errors.delivery_customer) {
                            setErrors({ ...errors, delivery_customer: '' })
                          }
                        }}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-transparent transition-all ${
                          errors.delivery_customer ? 'border-red-300' : 'border-nature-green-200'
                        }`}
                        required
                        placeholder={t.checkout.customer}
                      />
                      {errors.delivery_customer && (
                        <p className="text-red-600 text-sm mt-1">{errors.delivery_customer}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="delivery_address" className="block text-sm font-semibold text-nature-green-700 mb-2">
                        {t.checkout.address} *
                      </label>
                      <textarea
                        id="delivery_address"
                        value={formData.delivery_address}
                        onChange={(e) => {
                          setFormData({ ...formData, delivery_address: e.target.value })
                          if (errors.delivery_address) {
                            setErrors({ ...errors, delivery_address: '' })
                          }
                        }}
                        rows={3}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-transparent transition-all resize-none ${
                          errors.delivery_address ? 'border-red-300' : 'border-nature-green-200'
                        }`}
                        required
                        placeholder={t.checkout.address}
                      />
                      {errors.delivery_address && (
                        <p className="text-red-600 text-sm mt-1">{errors.delivery_address}</p>
                      )}
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
                          onChange={(e) => {
                            setFormData({ ...formData, delivery_postal_code: e.target.value })
                            if (errors.delivery_postal_code) {
                              setErrors({ ...errors, delivery_postal_code: '' })
                            }
                          }}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-transparent transition-all ${
                            errors.delivery_postal_code ? 'border-red-300' : 'border-nature-green-200'
                          }`}
                          required
                          placeholder={t.checkout.postalCode}
                        />
                        {errors.delivery_postal_code && (
                          <p className="text-red-600 text-xs mt-1">{errors.delivery_postal_code}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="delivery_postal_place" className="block text-sm font-semibold text-nature-green-700 mb-2">
                          {t.checkout.postalPlace} *
                        </label>
                        <input
                          id="delivery_postal_place"
                          type="text"
                          value={formData.delivery_postal_place}
                          onChange={(e) => {
                            setFormData({ ...formData, delivery_postal_place: e.target.value })
                            if (errors.delivery_postal_place) {
                              setErrors({ ...errors, delivery_postal_place: '' })
                            }
                          }}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-transparent transition-all ${
                            errors.delivery_postal_place ? 'border-red-300' : 'border-nature-green-200'
                          }`}
                          required
                          placeholder={t.checkout.postalPlace}
                        />
                        {errors.delivery_postal_place && (
                          <p className="text-red-600 text-xs mt-1">{errors.delivery_postal_place}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Information Section */}
                <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <span>📝</span>
                    {t.checkout.orderInformation}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email_for_order_confirmation" className="block text-sm font-semibold text-blue-700 mb-2">
                        {t.checkout.emailForOrderConfirmation} *
                      </label>
                      <input
                        id="email_for_order_confirmation"
                        type="email"
                        value={formData.email_for_order_confirmation}
                        onChange={(e) => {
                          setFormData({ ...formData, email_for_order_confirmation: e.target.value.trim() })
                          if (errors.email_for_order_confirmation) {
                            setErrors({ ...errors, email_for_order_confirmation: '' })
                          }
                        }}
                        onBlur={(e) => {
                          // Validate on blur for better UX
                          const email = e.target.value.trim()
                          if (email && !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email)) {
                            setErrors({ ...errors, email_for_order_confirmation: t.checkout.emailInvalid })
                          }
                        }}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.email_for_order_confirmation ? 'border-red-300' : 'border-blue-200'
                        }`}
                        required
                        placeholder="example@email.com"
                        pattern="[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*"
                      />
                      {errors.email_for_order_confirmation && (
                        <p className="text-red-600 text-sm mt-1">{errors.email_for_order_confirmation}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone_number" className="block text-sm font-semibold text-blue-700 mb-2">
                        {t.checkout.phoneNumber}
                      </label>
                      <div className={`phone-input-container ${errors.phone_number ? 'phone-input-error' : ''}`}>
                        <PhoneInput
                          international
                          defaultCountry="NO"
                          value={formData.phone_number}
                          onChange={(value) => {
                            // Limit phone number length (max 15 digits after country code)
                            if (value && value.length > 20) {
                              return // Prevent input if too long
                            }
                            setFormData({ ...formData, phone_number: value || '' })
                            if (errors.phone_number) {
                              setErrors({ ...errors, phone_number: '' })
                            }
                          }}
                          className="w-full"
                          numberInputProps={{
                            className: `phone-number-input px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                              errors.phone_number ? 'border-red-300' : 'border-blue-200'
                            }`,
                            maxLength: 20,
                          }}
                          placeholder={t.checkout.phoneNumber}
                        />
                      </div>
                      {errors.phone_number && (
                        <p className="text-red-600 text-sm mt-1">{errors.phone_number}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="customer_reference" className="block text-sm font-semibold text-blue-700 mb-2">
                        {t.checkout.customerReference} *
                      </label>
                      <input
                        id="customer_reference"
                        type="text"
                        value={formData.customer_reference}
                        onChange={(e) => {
                          setFormData({ ...formData, customer_reference: e.target.value })
                          if (errors.customer_reference) {
                            setErrors({ ...errors, customer_reference: '' })
                          }
                        }}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.customer_reference ? 'border-red-300' : 'border-blue-200'
                        }`}
                        required
                        placeholder={t.checkout.customerReference}
                      />
                      {errors.customer_reference && (
                        <p className="text-red-600 text-sm mt-1">{errors.customer_reference}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="delivery_instructions" className="block text-sm font-semibold text-blue-700 mb-2">
                        {t.checkout.deliveryInstructions}
                      </label>
                      <textarea
                        id="delivery_instructions"
                        value={formData.delivery_instructions}
                        onChange={(e) => setFormData({ ...formData, delivery_instructions: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        placeholder={t.checkout.deliveryInstructions}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="save_information"
                        checked={formData.save_information}
                        onChange={(e) => setFormData({ ...formData, save_information: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="save_information" className="text-sm text-blue-700">
                        {t.checkout.saveInformationForNextTime}
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="dispatch_date" className="block text-sm font-semibold text-blue-700 mb-2">
                          {t.checkout.dispatchDate}
                        </label>
                        <input
                          id="dispatch_date"
                          type="date"
                          value={formData.dispatch_date}
                          onChange={(e) => setFormData({ ...formData, dispatch_date: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="periodic_orders"
                            checked={formData.periodic_orders}
                            onChange={(e) => setFormData({ ...formData, periodic_orders: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="periodic_orders" className="text-sm text-blue-700">
                            {t.checkout.periodicOrders}
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <label htmlFor="alternative_delivery_address" className="block text-sm font-semibold text-blue-700">
                          {t.checkout.alternativeDeliveryAddress}
                        </label>
                        <input
                          type="checkbox"
                          id="alternative_delivery_address"
                          checked={formData.alternative_delivery_address}
                          onChange={(e) => setFormData({ ...formData, alternative_delivery_address: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-blue-700">{t.common.yes}</span>
                      </div>
                      {formData.alternative_delivery_address && (
                        <div className="mt-2 p-3 bg-white rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-600 mb-2">
                            {t.checkout.alternativeDeliveryAddressDesc}
                          </p>
                          <textarea
                            rows={3}
                            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm"
                            placeholder={t.checkout.address}
                          />
                        </div>
                      )}
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

                    <p className="text-xs text-red-600">
                      * {t.checkout.fieldsRequired}
                    </p>
                  </div>
                </div>


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
