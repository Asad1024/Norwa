import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import AddToCartButton from '@/components/AddToCartButton'
import { Product } from '@/types/database'
import BackButton from '@/components/BackButton'
import ProductDetailClient from './ProductDetailClient'

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const isAdmin = user?.user_metadata?.role === 'admin'
  
  // Check if product has assignments (only if user is not admin)
  if (!isAdmin && user) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (supabaseUrl && serviceRoleKey) {
      try {
        const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        })
        
        // Check if this product has any assignments
        const { data: allAssignments } = await supabaseAdmin
          .from('product_user_assignments')
          .select('product_id')
          .eq('product_id', params.id)
          .limit(1)
        
        // If product has assignments, check if user is assigned
        if (allAssignments && allAssignments.length > 0) {
          const { data: userAssignment } = await supabase
            .from('product_user_assignments')
            .select('product_id')
            .eq('product_id', params.id)
            .eq('user_id', user.id)
            .single()
          
          // If user is not assigned, show 404
          if (!userAssignment) {
            notFound()
          }
        }
      } catch (error) {
        console.error('Error checking product assignments:', error)
        // On error, be safe and hide the product
        notFound()
      }
    }
  }
  
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      category_data:categories(*)
    `)
    .eq('id', params.id)
    .single()

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <ProductDetailClient product={product as Product & { category_data?: any }} />
      </div>
    </div>
  )
}
