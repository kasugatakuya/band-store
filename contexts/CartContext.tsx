"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface CartContextType {
  itemCount: number
  refreshCartCount: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itemCount, setItemCount] = useState(0)
  const { data: session } = useSession()

  const refreshCartCount = async () => {
    if (!session?.user?.id) {
      setItemCount(0)
      return
    }

    try {
      const response = await fetch('/api/cart/count')
      if (response.ok) {
        const data = await response.json()
        setItemCount(data.count)
      }
    } catch (error) {
      console.error('カート数取得エラー:', error)
      setItemCount(0)
    }
  }

  useEffect(() => {
    refreshCartCount()
  }, [session])

  return (
    <CartContext.Provider value={{ itemCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}