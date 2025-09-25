import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CartPage from '@/components/CartPage'

export default async function Cart() {
  const session = await auth()
  
  if (!session || !session.user?.id) {
    redirect('/auth/signin')
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  return <CartPage cart={cart} />
}