import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProductForm from '@/components/ProductForm'

export default async function NewProductPage() {
  const session = await auth()
  
  if (!session || !session.user?.id) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (user?.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">新規商品登録</h1>
      <ProductForm />
    </div>
  )
}