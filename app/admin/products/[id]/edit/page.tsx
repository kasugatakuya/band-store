import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProductForm from '@/components/ProductForm'

interface EditProductPageProps {
  params: {
    id: string
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await auth()
  
  if (!session || !session.user?.id) {
    redirect('/auth/signin')
  }

  let user
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })
  } catch (error) {
    console.error('Database connection error:', error)
  }

  if (user && user.role !== 'ADMIN') {
    redirect('/')
  }

  let product = null
  try {
    product = await prisma.product.findUnique({
      where: { id: params.id },
    })
  } catch (error) {
    console.error('Failed to fetch product:', error)
  }

  if (!product) {
    redirect('/admin/products')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">商品を編集</h1>
      <ProductForm product={product} isEdit />
    </div>
  )
}