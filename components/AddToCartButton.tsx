"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'

interface AddToCartButtonProps {
  productId: string
  disabled?: boolean
}

export default function AddToCartButton({ productId, disabled }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  const handleAddToCart = async () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      if (!response.ok) {
        throw new Error('Failed to add to cart')
      }

      router.refresh()
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || loading}
      size="lg"
      className="w-full md:w-auto"
    >
      {loading ? 'Adding...' : 'Add to Cart'}
    </Button>
  )
}