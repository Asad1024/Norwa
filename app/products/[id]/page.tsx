import { createClient } from '@/lib/supabase/server'
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
