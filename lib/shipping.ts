import { createClient } from '@/lib/supabase/client'

/**
 * Fetches the current active shipping charge
 * @returns The shipping charge amount (0 for free shipping)
 */
export async function getShippingCharge(): Promise<number> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('shipping_settings')
      .select('shipping_charge')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching shipping charge:', error)
      return 0 // Default to free shipping on error
    }

    return data ? parseFloat(data.shipping_charge) || 0 : 0
  } catch (error) {
    console.error('Error fetching shipping charge:', error)
    return 0 // Default to free shipping on error
  }
}
