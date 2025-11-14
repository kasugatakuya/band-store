import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface CheckoutItem {
  productId: string
  quantity: number
}

interface CheckoutRequest {
  items: CheckoutItem[]
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ユーザー情報を取得（住所情報含む）
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { items }: CheckoutRequest = await req.json()

    let line_items
    try {
      line_items = await Promise.all(
        items.map(async (item: CheckoutItem) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
          })

          if (!product) {
            throw new Error(`Product ${item.productId} not found`)
          }

        // 画像URLの検証（ローカルパスはStripeでは使用できない）
        const validImageUrl = product.image && product.image.startsWith('http') ? product.image : undefined
        
        return {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: product.name,
              description: product.description || undefined,
              images: validImageUrl ? [validImageUrl] : undefined,
            },
            unit_amount: Math.round(product.price), // 日本円は最小単位が1円なので100倍不要
          },
          quantity: item.quantity,
        }
        })
      )
    } catch (dbError) {
      console.error('Database error in checkout:', dbError)
      return NextResponse.json(
        { error: 'データベースエラーが発生しました' },
        { status: 500 }
      )
    }

    // 住所情報の準備
    const shippingAddress = {
      name: user.name || '',
      zipCode: user.zipCode || '',
      prefecture: user.prefecture || '',
      city: user.city || '',
      addressLine1: user.addressLine1 || '',
      addressLine2: user.addressLine2 || '',
      phone: user.phone || '',
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id,
        orderItems: JSON.stringify(items),
        shippingAddress: JSON.stringify(shippingAddress),
      },
    })

    return NextResponse.json({ sessionId: checkoutSession.id })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}