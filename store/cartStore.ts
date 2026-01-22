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
        // Check stock before adding
        if ((product.stock || 0) <= 0) {
          return // Don't add if out of stock
        }

        const items = get().items
        const existingItem = items.find((item) => item.id === product.id)

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity
          // Check if total quantity exceeds stock
          if (newQuantity > (product.stock || 0)) {
            return // Don't add if exceeds stock
          }
          set({
            items: items.map((item) =>
              item.id === product.id
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
        set({
          items: get().items.filter((item) => item.id !== productId),
        })
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
        } else {
          const items = get().items
          const item = items.find((item) => item.id === productId)
          // Check if quantity exceeds stock
          if (item && quantity > (item.stock || 0)) {
            return // Don't update if exceeds stock
          }
          set({
            items: items.map((item) =>
              item.id === productId ? { ...item, quantity } : item
            ),
          })
        }
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
