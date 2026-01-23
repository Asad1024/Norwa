import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartProduct {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image_url: string | null
  quantity: number
}

interface CartStore {
  items: CartProduct[]
  addItem: (product: Omit<CartProduct, 'quantity'>, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const items = get().items
        const existingItem = items.find((item) => String(item.id) === String(product.id))

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity
          set({
            items: items.map((item) =>
              String(item.id) === String(product.id)
                ? { ...item, quantity: newQuantity }
                : item
            ),
          })
        } else {
          set({
            items: [...items, { ...product, quantity }],
          })
        }
      },
      removeItem: (productId) => {
        const currentItems = get().items
        const filteredItems = currentItems.filter((item) => String(item.id) !== String(productId))
        set({ items: filteredItems })
      },
      updateQuantity: (productId, quantity) => {
        // Allow any quantity > 0 - no stock restrictions
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        
        const items = get().items
        const itemIndex = items.findIndex((item) => String(item.id) === String(productId))
        
        if (itemIndex === -1) {
          console.warn('[Cart Store] Item not found for updateQuantity:', { productId, quantity, items })
          return
        }
        
        // Create new array with updated item - no stock validation
        const newItems = [...items]
        newItems[itemIndex] = { ...newItems[itemIndex], quantity }
        
        set({ items: newItems })
      },
      clearCart: () => {
        set({ items: [] })
      },
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)
