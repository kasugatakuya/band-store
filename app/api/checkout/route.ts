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

    const { items }: CheckoutRequest = await req.json()

    const line_items = await Promise.all(
      items.map(async (item: CheckoutItem) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        })

        if (!product) {
          throw new Error(`Product ${item.productId} not found`)
        }

        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description || undefined,
              images: product.image ? [product.image] : undefined,
            },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: item.quantity,
        }
      })
    )

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