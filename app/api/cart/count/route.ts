import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session || !session.user?.id) {
      return NextResponse.json({ count: 0 })
    }

    let totalCount = 0
    
    try {
      const cart = await prisma.cart.findUnique({
        where: { userId: session.user.id },
        include: {
          items: {
            select: {
              quantity: true,
            },
          },
        },
      })

      if (cart?.items) {
        totalCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    } catch (error) {
      console.error('Database error:', error)
      // データベースエラーの場合は0を返す
    }

    return NextResponse.json({ count: totalCount })
  } catch (error) {
    console.error('Error fetching cart count:', error)
    return NextResponse.json({ count: 0 })
  }
}