import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CartPage from '@/components/CartPage'

export default async function Cart() {
  const session = await auth()
  
  if (!session || !session.user?.id) {
    redirect('/auth/signin')
  }

  const [cart, user] = await Promise.all([
    prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        zipCode: true,
        prefecture: true,
        city: true,
        addressLine1: true,
        addressLine2: true,
      },
    }),
  ])

  return <CartPage cart={cart} user={user} />
}