"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2 } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CartPageProps {
  cart: any
}

export default function CartPage({ cart }: CartPageProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { refreshCartCount } = useCart()

  const handleRemoveItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove item')
      }

      // カートカウントを更新
      refreshCartCount()
      router.refresh()
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'チェックアウトの開始に失敗しました')
      }

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      const { error } = await stripe.redirectToCheckout({ sessionId })

      if (error) {
        console.error('Stripe error:', error)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert(error instanceof Error ? error.message : 'チェックアウトでエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">カートが空です</h1>
        <p className="text-gray-600 mb-8">商品をカートに追加してお買い物を始めましょう</p>
        <Link href="/products">
          <Button>商品を見る</Button>
        </Link>
      </div>
    )
  }

  const subtotal = cart.items.reduce(
    (acc: number, item: any) => acc + item.product.price * item.quantity,
    0
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">ショッピングカート</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {cart.items.map((item: any) => (
            <Card key={item.id} className="mb-4">
              <CardContent className="flex items-center p-4">
                <div className="relative w-24 h-24 mr-4">
                  {item.product.image ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-sm">画像なし</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-gray-600">
                    {item.product.type === 'ALBUM' ? 'アルバム' : 'Tシャツ'}
                  </p>
                  <p className="text-sm text-gray-600">数量: {item.quantity}</p>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold">¥{(item.product.price * item.quantity).toLocaleString('ja-JP')}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id)}
                    className="mt-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">注文概要</h2>
              <div className="flex justify-between mb-2">
                <span>小計</span>
                <span>¥{subtotal.toLocaleString('ja-JP')}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>送料</span>
                <span>無料</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold">
                  <span>合計</span>
                  <span>¥{subtotal.toLocaleString('ja-JP')}</span>
                </div>
              </div>
              <Button
                className="w-full mt-6"
                size="lg"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? '処理中...' : 'お会計へ進む'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}