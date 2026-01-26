'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useGlobalLoader } from '@/components/GlobalLoader'
import BackButton from '@/components/BackButton'
import { useTranslations } from '@/hooks/useTranslations'
import { Save, Truck } from 'lucide-react'
import Modal from '@/components/Modal'

export default function AdminShippingPage() {
  const router = useRouter()
  const supabase = createClient()
  const { showLoader, hideLoader } = useGlobalLoader()
  const [shippingCharge, setShippingCharge] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
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
        await fetchShippingSettings()
      } catch (error) {
        console.error('Error fetching data:', error)
        setModal({
          isOpen: true,
          title: 'Error',
          message: 'Failed to load shipping settings',
          type: 'error',
        })
      } finally {
        setLoading(false)
        hideLoader()
      }
    }

    fetchData()
  }, [supabase, router, showLoader, hideLoader])

  const fetchShippingSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_settings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setShippingCharge(parseFloat(data.shipping_charge) || 0)
      }
    } catch (error) {
      console.error('Error fetching shipping settings:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    showLoader('Saving shipping settings...')
    try {
      // First, deactivate all existing settings
      await supabase
        .from('shipping_settings')
        .update({ is_active: false })
        .eq('is_active', true)

      // Insert new active setting
      const { error } = await supabase
        .from('shipping_settings')
        .insert({
          shipping_charge: shippingCharge,
          is_active: true,
        })

      if (error) throw error

      hideLoader()
      setModal({
        isOpen: true,
        title: 'Success',
        message: 'Shipping charge updated successfully',
        type: 'success',
      })
    } catch (error: any) {
      console.error('Error saving shipping settings:', error)
      hideLoader()
      setModal({
        isOpen: true,
        title: 'Error',
        message: error.message || 'Failed to save shipping settings',
        type: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user) {
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
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <BackButton href="/admin" className="mb-4" />
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <Truck className="w-6 h-6 text-nature-green-600" />
              Manage Shipping Charges
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Set shipping charges for orders. Set to 0 for free shipping.
            </p>
          </div>

          {/* Shipping Settings Form */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="space-y-6">
              <div>
                <label htmlFor="shipping_charge" className="block text-sm font-semibold text-gray-700 mb-2">
                  Shipping Charge (kr) *
                </label>
                <input
                  id="shipping_charge"
                  type="number"
                  min="0"
                  step="0.01"
                  value={shippingCharge}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    setShippingCharge(value >= 0 ? value : 0)
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-green-500 focus:border-transparent transition-all text-lg font-medium"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter 0 for free shipping, or any amount in Norwegian Kroner (kr)
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Preview:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping:</span>
                    <span className="font-medium text-gray-900">
                      {shippingCharge === 0 ? (
                        <span className="text-nature-green-600">Free</span>
                      ) : (
                        `kr ${shippingCharge.toFixed(2)}`
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-nature-green-600 hover:bg-nature-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Shipping Charge'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
