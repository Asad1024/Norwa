export interface Translations {
  en: string
  no: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  slug: string | null
  icon: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  // Translation fields (optional for backward compatibility)
  name_translations?: Translations | null
  description_translations?: Translations | null
}

export interface Product {
  id: string
  name: string
  description: string
  category: string | null // Legacy field, kept for backward compatibility
  category_id: string | null // New field for category relationship
  price: number
  stock: number
  image_url: string | null
  technical_data_url: string | null
  product_number: string | null // 6-8 digit product number
  created_at: string
  updated_at: string
  category_data?: Category // For joined queries
  // Translation fields (optional for backward compatibility)
  name_translations?: Translations | null
  description_translations?: Translations | null
}

export interface ProductUserAssignment {
  id: string
  product_id: string
  user_id: string
  created_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  product?: Product
}

export interface Order {
  id: string
  user_id: string
  total: number
  status: string
  shipping_address: string | null
  phone_number: string | null
  created_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  product?: Product
}

export interface User {
  id: string
  email: string
  user_metadata?: {
    role?: 'admin' | 'user'
  }
}

export interface Address {
  id: string
  user_id: string
  label: string | null
  address: string
  phone_number: string
  is_default: boolean
  created_at: string
  updated_at: string
}
